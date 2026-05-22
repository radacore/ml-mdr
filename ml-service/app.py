"""
Flask API untuk Prediksi Keberhasilan Pengobatan MDR-TB

Endpoints:
- GET /health - Health check
- POST /train - Train model dengan data dari database
- POST /retrain - Retrain model dengan data dari database
- POST /predict - Prediksi single input
- GET /models - Info semua model
- GET /statistics - Statistik model
"""

import os
import sys

import pandas as pd
import requests
from flask import Flask, jsonify, request
from flask_cors import CORS

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))

from src.evaluation import ModelEvaluator
from src.interpretability import get_all_interpretability, get_class_distribution
from src.preprocessing import DataPreprocessor
from src.training import ModelTrainer

app = Flask(__name__)
CORS(app)

# Configuration
LARAVEL_API_URL = os.environ.get("LARAVEL_API_URL", "http://localhost:8000/api")


# Global variables
preprocessor = None
trainer = None
evaluator = None
is_trained = False
training_results = None
evaluation_results = None
comparison_table = None
curves_data = None
bootstrap_ci_data = None
interpretability_data = None
class_distribution_data = None


def get_project_root():
    return os.path.dirname(os.path.abspath(__file__))


def fetch_training_data_from_database():
    """Fetch training data from Laravel API"""
    try:
        response = requests.get(f"{LARAVEL_API_URL}/training-data", timeout=10)
        if response.status_code == 200:
            result = response.json()
            data = result.get("data", [])
            if len(data) > 0:
                df = pd.DataFrame(data)
                print(f"Fetched {len(df)} records from database")
                return df
            else:
                print("No training data in database")
                return None
        else:
            print(f"Failed to fetch training data: {response.status_code}")
            return None
    except Exception as e:
        print(f"Error fetching training data from database: {e}")
        return None


def load_or_train_models():
    """Load model dari file atau train dari database"""
    global preprocessor, trainer, evaluator, is_trained
    global training_results, evaluation_results, comparison_table
    global \
        curves_data, \
        bootstrap_ci_data, \
        interpretability_data, \
        class_distribution_data

    models_dir = os.path.join(get_project_root(), "models")
    preprocessor_path = os.path.join(models_dir, "preprocessor.pkl")

    preprocessor = DataPreprocessor()
    trainer = ModelTrainer(n_folds=5)
    evaluator = ModelEvaluator()

    # Cek apakah model sudah ada
    if os.path.exists(preprocessor_path):
        try:
            preprocessor = DataPreprocessor.load(preprocessor_path)
            trainer.load_models(models_dir)
            is_trained = True
            print("Models loaded from disk")

            # Coba fetch data dari database untuk evaluasi
            df = fetch_training_data_from_database()
            if df is not None and len(df) > 0:
                try:
                    df_processed = preprocessor.preprocess(df, fit=False)
                    X, y = preprocessor.get_features_and_target(df_processed)

                    # Split data untuk evaluasi menggunakan 3-way split yang sama
                    X_train, X_val, X_test, y_train, y_val, y_test = (
                        trainer.split_data_3way(X, y)
                    )

                    # Evaluate
                    evaluation_results = evaluator.evaluate_all_models(
                        trainer.models, X_test, y_test
                    )
                    # Compute train/test comparison table
                    comparison_table = evaluator.evaluate_train_test(
                        trainer.models, X_train, y_train, X_test, y_test
                    )
                    # Compute curves, CI, interpretability
                    curves_data = evaluator.get_all_curves(
                        trainer.models, X_test, y_test
                    )
                    bootstrap_ci_data = evaluator.get_all_bootstrap_ci(
                        trainer.models, X_test, y_test
                    )
                    feature_names = list(X_test.columns)
                    interpretability_data = get_all_interpretability(
                        trainer.models, X_test, y_test, feature_names
                    )
                    class_distribution_data = get_class_distribution(y)
                    print("Evaluation completed for loaded models")
                except Exception as e:
                    print(f"Evaluation skipped: {e}")

        except Exception as e:
            print(f"Error loading models: {e}")
            is_trained = False

    # Jika belum ada model, coba train dari database
    if not is_trained:
        print("No saved models found. Attempting to train from database...")
        df = fetch_training_data_from_database()

        if df is not None and len(df) >= 10:  # Minimal 10 data untuk training
            print(f"Training new models with {len(df)} records from database...")
            df_processed = preprocessor.preprocess(df)
            X, y = preprocessor.get_features_and_target(df_processed)

            training_results = trainer.train(X, y)

            # Evaluate
            evaluation_results = evaluator.evaluate_all_models(
                trainer.models, training_results["X_test"], training_results["y_test"]
            )
            # Compute train/test comparison table
            comparison_table = evaluator.evaluate_train_test(
                trainer.models,
                training_results["X_train"],
                training_results["y_train"],
                training_results["X_test"],
                training_results["y_test"],
            )
            # Compute curves, CI, interpretability
            curves_data = evaluator.get_all_curves(
                trainer.models, training_results["X_test"], training_results["y_test"]
            )
            bootstrap_ci_data = evaluator.get_all_bootstrap_ci(
                trainer.models, training_results["X_test"], training_results["y_test"]
            )
            feature_names = list(training_results["X_test"].columns)
            interpretability_data = get_all_interpretability(
                trainer.models,
                training_results["X_test"],
                training_results["y_test"],
                feature_names,
            )
            class_distribution_data = training_results.get(
                "class_distribution", get_class_distribution(y)
            )

            # Save models
            trainer.save_models(models_dir)
            preprocessor.save(preprocessor_path)

            is_trained = True
            print("Models trained and saved successfully")
        else:
            print(
                "Not enough training data in database. ML Service is running but not trained."
            )
            print(
                "Please add training data via Laravel app and call /retrain endpoint."
            )


# Initialize on startup
load_or_train_models()


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify(
        {
            "status": "healthy",
            "is_trained": is_trained,
            "models_available": list(trainer.models.keys()) if trainer else [],
        }
    )


@app.route("/train", methods=["POST"])
def train_models():
    """Train ulang semua model dengan data dari database"""
    global training_results, evaluation_results, is_trained

    try:
        # Fetch data from database
        df = fetch_training_data_from_database()

        if df is None or len(df) < 10:
            return jsonify(
                {
                    "error": "Not enough training data in database. Minimum 10 records required."
                }
            ), 400

        # Reinitialize
        global preprocessor, trainer, evaluator
        preprocessor = DataPreprocessor()
        trainer = ModelTrainer(n_folds=5)
        evaluator = ModelEvaluator()

        # Preprocess
        df_processed = preprocessor.preprocess(df)
        X, y = preprocessor.get_features_and_target(df_processed)

        # Train (3-way split 70/15/15 + GridSearchCV + CV, signature: X, y, use_smote)
        training_results = trainer.train(X, y)

        # Evaluate
        evaluation_results = evaluator.evaluate_all_models(
            trainer.models, training_results["X_test"], training_results["y_test"]
        )

        # Save
        models_dir = os.path.join(get_project_root(), "models")
        trainer.save_models(models_dir)
        preprocessor.save(os.path.join(models_dir, "preprocessor.pkl"))

        is_trained = True

        return jsonify(
            {
                "status": "success",
                "message": f"Models trained successfully with {len(df)} records",
                "data_count": len(df),
                "best_model": training_results["best_model_name"],
                "cv_results": training_results["cv_results"],
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/retrain", methods=["POST"])
def retrain_models():
    """Retrain model dengan data yang dikirim langsung dari Laravel"""
    global \
        training_results, \
        evaluation_results, \
        is_trained, \
        preprocessor, \
        trainer, \
        evaluator, \
        comparison_table
    global \
        curves_data, \
        bootstrap_ci_data, \
        interpretability_data, \
        class_distribution_data

    try:
        # Get data from request body
        request_data = request.get_json()

        if not request_data or "data" not in request_data:
            return jsonify(
                {"error": 'No training data provided. Send {"data": [...]}'}
            ), 400

        training_data = request_data["data"]

        if len(training_data) == 0:
            return jsonify({"error": "No training data available"}), 400

        # Convert to DataFrame
        df = pd.DataFrame(training_data)

        # Map column names from Laravel database format to ML service format
        column_mapping = {
            "usia": "Usia",
            "ket_usia": "Ket.Usia",
            "jenis_kelamin": "Jenis Kelamin",
            "status_bekerja": "Status Bekerja",
            "bb": "BB",
            "tb": "TB",
            "status_gizi": "Status Gizi",
            "status_merokok": "Status Merokok",
            "pemeriksaan_kontak": "Pemeriksaan Kontak",
            "riwayat_dm": "Riwayat_DM",
            "riwayat_hiv": "Riwayat_HIV",
            "komorbiditas": "Komorbiditas",
            "kepatuhan_minum_obat": "Kepatuhan Minum Obat",
            "efek_samping_obat": "Efek Samping Obat",
            "keterangan_efek_samping": "Keterangan Efek Samping",
            "riwayat_pengobatan": "Riwayat Pengobatan Sebelumnya",
            "panduan_pengobatan": "Panduan Pengobatan",
            "keberhasilan_pengobatan": "Keberhasilan Pengobatan",
        }

        df = df.rename(columns=column_mapping)

        print(f"Received {len(df)} training records")
        print(f"Columns after mapping: {df.columns.tolist()}")

        # Reinitialize
        preprocessor = DataPreprocessor()
        trainer = ModelTrainer(n_folds=5)
        evaluator = ModelEvaluator()

        # Preprocess
        df_processed = preprocessor.preprocess(df)
        X, y = preprocessor.get_features_and_target(df_processed)

        # Check if SMOTE requested
        use_smote = request_data.get("use_smote", False)

        # Train (includes 3-way split, hyperparameter tuning, CV)
        training_results = trainer.train(X, y, use_smote=use_smote)

        # Evaluate
        evaluation_results = evaluator.evaluate_all_models(
            trainer.models, training_results["X_test"], training_results["y_test"]
        )
        # Compute train/test comparison table
        comparison_table = evaluator.evaluate_train_test(
            trainer.models,
            training_results["X_train"],
            training_results["y_train"],
            training_results["X_test"],
            training_results["y_test"],
        )
        # Compute curves, CI, interpretability
        curves_data = evaluator.get_all_curves(
            trainer.models, training_results["X_test"], training_results["y_test"]
        )
        bootstrap_ci_data = evaluator.get_all_bootstrap_ci(
            trainer.models, training_results["X_test"], training_results["y_test"]
        )
        feature_names = list(training_results["X_test"].columns)
        interpretability_data = get_all_interpretability(
            trainer.models,
            training_results["X_test"],
            training_results["y_test"],
            feature_names,
        )
        class_distribution_data = training_results.get(
            "class_distribution", get_class_distribution(y)
        )

        # Save
        models_dir = os.path.join(get_project_root(), "models")
        trainer.save_models(models_dir)
        preprocessor.save(os.path.join(models_dir, "preprocessor.pkl"))

        is_trained = True

        return jsonify(
            {
                "status": "success",
                "message": f"Models retrained successfully with {len(df)} records",
                "data_count": len(df),
                "best_model": training_results["best_model_name"],
                "cv_results": training_results["cv_results"],
                "smote_applied": training_results.get("smote_applied", False),
                "class_distribution": training_results.get("class_distribution", None),
            }
        )

    except Exception as e:
        import traceback

        return jsonify({"error": str(e), "traceback": traceback.format_exc()}), 500


@app.route("/predict", methods=["POST"])
def predict():
    """Prediksi untuk single input"""
    global preprocessor, trainer

    if not is_trained or preprocessor is None or trainer is None:
        return jsonify({"error": "Models not trained yet"}), 400

    try:
        data = request.json

        if not data:
            return jsonify({"error": "No input data provided"}), 400

        # Get model name from request or use best model
        model_name = data.pop("model_name", None)

        # Preprocess input
        input_processed = preprocessor.preprocess_single_input(data)

        # Predict
        prediction = trainer.predict(input_processed, model_name)
        probabilities = trainer.predict_proba(input_processed, model_name)

        # Decode prediction
        if "Keberhasilan Pengobatan" in preprocessor.label_decoders:
            prediction_label = preprocessor.decode_value(
                "Keberhasilan Pengobatan", int(prediction[0])
            )
        else:
            prediction_label = "Berhasil" if prediction[0] == 0 else "Tidak Berhasil"

        # Get confidence
        confidence = float(max(probabilities[0])) * 100

        return jsonify(
            {
                "prediction": prediction_label,
                "prediction_code": int(prediction[0]),
                "confidence": confidence,
                "model_used": model_name if model_name else trainer.best_model_name,
                "probabilities": {
                    "Berhasil": float(probabilities[0][0]) * 100,
                    "Tidak Berhasil": float(probabilities[0][1]) * 100
                    if len(probabilities[0]) > 1
                    else 0,
                },
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/models", methods=["GET"])
def get_models_info():
    """Get info semua model"""
    if not is_trained or not trainer:
        return jsonify({"error": "Models not trained yet"}), 400

    return jsonify(
        {
            "models": list(trainer.models.keys()),
            "best_model": trainer.best_model_name,
            "cv_results": trainer.cv_results,
        }
    )


@app.route("/statistics", methods=["GET"])
def get_statistics():
    """Get statistik lengkap semua model"""
    if not is_trained or evaluation_results is None:
        return jsonify({"error": "Models not evaluated yet"}), 400

    return jsonify(
        {
            "evaluation_results": evaluation_results,
            "best_model": trainer.best_model_name if trainer else None,
            "cv_results": trainer.cv_results if trainer else None,
            "comparison_table": comparison_table,
            "best_params": trainer.best_params if trainer else None,
            "class_distribution": class_distribution_data,
            "bootstrap_ci": bootstrap_ci_data,
        }
    )


@app.route("/features", methods=["GET"])
def get_features():
    """Get daftar fitur yang dibutuhkan untuk prediksi"""
    if not preprocessor:
        return jsonify({"error": "Preprocessor not initialized"}), 400

    return jsonify(
        {
            "numerical_features": preprocessor.numerical_cols,
            "categorical_features": preprocessor.categorical_cols,
            "target": preprocessor.target_col,
            "all_features": preprocessor.feature_cols,
        }
    )


@app.route("/curves", methods=["GET"])
def get_curves():
    """Get ROC, PR, dan Calibration curve data untuk semua model"""
    if not is_trained or curves_data is None:
        return jsonify({"error": "Models not evaluated yet"}), 400

    return jsonify(curves_data)


@app.route("/calibration", methods=["GET"])
def get_calibration():
    """Get Calibration curve + Brier Score untuk semua model"""
    if not is_trained or curves_data is None:
        return jsonify({"error": "Models not evaluated yet"}), 400

    calibration_results = {}
    for name, data in curves_data.items():
        calibration_results[name] = data.get("calibration", {})

    return jsonify(calibration_results)


@app.route("/interpretability", methods=["GET"])
def get_interpretability():
    """Get interpretability data: OR (LR), feature importance (DT), permutation importance (SVM)"""
    if not is_trained or interpretability_data is None:
        return jsonify({"error": "Models not evaluated yet"}), 400

    return jsonify(interpretability_data)


@app.route("/compare-smote", methods=["POST"])
def compare_smote():
    """
    Latih dua skenario (Tanpa SMOTE vs Dengan SMOTE) pada data yang sama,
    lalu kembalikan hasil komparasi lengkap (CV metrics, test metrics, best model).

    Tidak menyentuh model produksi (.pkl) — hanya untuk halaman komparasi.

    Request body (JSON):
        { "data": [...records...] }
    """
    try:
        request_data = request.get_json() or {}
        training_data = request_data.get("data", [])

        if len(training_data) < 10:
            return jsonify(
                {"error": "Not enough training data. Minimum 10 records required."}
            ), 400

        # Convert to DataFrame & rename columns (sama dengan /retrain)
        df = pd.DataFrame(training_data)
        column_mapping = {
            "usia": "Usia",
            "ket_usia": "Ket.Usia",
            "jenis_kelamin": "Jenis Kelamin",
            "status_bekerja": "Status Bekerja",
            "bb": "BB",
            "tb": "TB",
            "status_gizi": "Status Gizi",
            "status_merokok": "Status Merokok",
            "pemeriksaan_kontak": "Pemeriksaan Kontak",
            "riwayat_dm": "Riwayat_DM",
            "riwayat_hiv": "Riwayat_HIV",
            "komorbiditas": "Komorbiditas",
            "kepatuhan_minum_obat": "Kepatuhan Minum Obat",
            "efek_samping_obat": "Efek Samping Obat",
            "keterangan_efek_samping": "Keterangan Efek Samping",
            "riwayat_pengobatan": "Riwayat Pengobatan Sebelumnya",
            "panduan_pengobatan": "Panduan Pengobatan",
            "keberhasilan_pengobatan": "Keberhasilan Pengobatan",
        }
        df = df.rename(columns=column_mapping)

        # Preprocess (BB/TB cast int sudah ter-apply di feature_engineering)
        local_pre = DataPreprocessor()
        df_processed = local_pre.preprocess(df)
        X, y = local_pre.get_features_and_target(df_processed)

        def run_scenario(use_smote_flag):
            tr = ModelTrainer(n_folds=5)
            ev = ModelEvaluator()
            res = tr.train(X, y, use_smote=use_smote_flag)
            eval_res = ev.evaluate_all_models(tr.models, res["X_test"], res["y_test"])
            split_info = res.get("split_info", {})
            smote_info = res.get("smote_info", {})
            return {
                "best_model": res["best_model_name"],
                "cv_results": tr.cv_results,
                "best_params": tr.best_params,
                "test_metrics": {name: r["metrics"] for name, r in eval_res.items()},
                "confusion_matrix": {
                    name: r["confusion_matrix"] for name, r in eval_res.items()
                },
                "smote_applied": res.get("smote_applied", False),
                "class_distribution": res.get("class_distribution", {}),
                "split_info": split_info,
                "smote_info": smote_info,
                "train_size": int(split_info.get("train_size", len(res["X_train"]))),
                "val_size": int(split_info.get("validation_size", len(res["X_val"]))),
                "test_size": int(split_info.get("test_size", len(res["X_test"]))),
                "smote_train_size": int(smote_info.get("train_size_after", len(res["X_train"]))),
            }

        print("=== /compare-smote: running TANPA SMOTE ===")
        no_smote = run_scenario(False)
        print("=== /compare-smote: running DENGAN SMOTE ===")
        with_smote = run_scenario(True)

        # Tentukan winner overall berdasarkan F1 CV
        f1_no = no_smote["cv_results"][no_smote["best_model"]]["f1"]["mean"]
        f1_yes = with_smote["cv_results"][with_smote["best_model"]]["f1"]["mean"]
        if f1_yes > f1_no:
            winner = {
                "scenario": "with_smote",
                "model": with_smote["best_model"],
                "f1_cv": float(f1_yes),
            }
        else:
            winner = {
                "scenario": "no_smote",
                "model": no_smote["best_model"],
                "f1_cv": float(f1_no),
            }

        return jsonify(
            {
                "status": "success",
                "data_count": int(len(df)),
                "cleaned_data_count": int(len(y)),
                "models": list(no_smote["cv_results"].keys()),
                "no_smote": no_smote,
                "with_smote": with_smote,
                "winner": winner,
            }
        )

    except Exception as e:
        import traceback

        return jsonify({"error": str(e), "traceback": traceback.format_exc()}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
