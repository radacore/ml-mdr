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

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
import requests
import pandas as pd

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from src.preprocessing import DataPreprocessor
from src.training import ModelTrainer
from src.evaluation import ModelEvaluator

app = Flask(__name__)
CORS(app)

# Configuration
LARAVEL_API_URL = os.environ.get('LARAVEL_API_URL', 'http://localhost:8000/api')


# Global variables
preprocessor = None
trainer = None
evaluator = None
is_trained = False
training_results = None
evaluation_results = None


def get_project_root():
    return os.path.dirname(os.path.abspath(__file__))


def fetch_training_data_from_database():
    """Fetch training data from Laravel API"""
    try:
        response = requests.get(f"{LARAVEL_API_URL}/training-data", timeout=10)
        if response.status_code == 200:
            result = response.json()
            data = result.get('data', [])
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
    global preprocessor, trainer, evaluator, is_trained, training_results, evaluation_results
    
    models_dir = os.path.join(get_project_root(), 'models')
    preprocessor_path = os.path.join(models_dir, 'preprocessor.pkl')
    
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
                    
                    # Split data untuk evaluasi
                    from sklearn.model_selection import train_test_split
                    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
                    
                    # Evaluate
                    evaluation_results = evaluator.evaluate_all_models(
                        trainer.models,
                        X_test,
                        y_test
                    )
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
            
            training_results = trainer.train(X, y, test_size=0.2)
            
            # Evaluate
            evaluation_results = evaluator.evaluate_all_models(
                trainer.models,
                training_results['X_test'],
                training_results['y_test']
            )
            
            # Save models
            trainer.save_models(models_dir)
            preprocessor.save(preprocessor_path)
            
            is_trained = True
            print("Models trained and saved successfully")
        else:
            print("Not enough training data in database. ML Service is running but not trained.")
            print("Please add training data via Laravel app and call /retrain endpoint.")


# Initialize on startup
load_or_train_models()


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'is_trained': is_trained,
        'models_available': list(trainer.models.keys()) if trainer else []
    })


@app.route('/train', methods=['POST'])
def train_models():
    """Train ulang semua model dengan data dari database"""
    global training_results, evaluation_results, is_trained
    
    try:
        # Fetch data from database
        df = fetch_training_data_from_database()
        
        if df is None or len(df) < 10:
            return jsonify({'error': 'Not enough training data in database. Minimum 10 records required.'}), 400
        
        # Reinitialize
        global preprocessor, trainer, evaluator
        preprocessor = DataPreprocessor()
        trainer = ModelTrainer(n_folds=5)
        evaluator = ModelEvaluator()
        
        # Preprocess
        df_processed = preprocessor.preprocess(df)
        X, y = preprocessor.get_features_and_target(df_processed)
        
        # Train
        training_results = trainer.train(X, y, test_size=0.2)
        
        # Evaluate
        evaluation_results = evaluator.evaluate_all_models(
            trainer.models,
            training_results['X_test'],
            training_results['y_test']
        )
        
        # Save
        models_dir = os.path.join(get_project_root(), 'models')
        trainer.save_models(models_dir)
        preprocessor.save(os.path.join(models_dir, 'preprocessor.pkl'))
        
        is_trained = True
        
        return jsonify({
            'status': 'success',
            'message': f'Models trained successfully with {len(df)} records',
            'data_count': len(df),
            'best_model': training_results['best_model_name'],
            'cv_results': training_results['cv_results']
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/retrain', methods=['POST'])
def retrain_models():
    """Retrain model dengan data yang dikirim langsung dari Laravel"""
    global training_results, evaluation_results, is_trained, preprocessor, trainer, evaluator
    
    try:
        # Get data from request body 
        request_data = request.get_json()
        
        if not request_data or 'data' not in request_data:
            return jsonify({'error': 'No training data provided. Send {"data": [...]}'}), 400
        
        training_data = request_data['data']
        
        if len(training_data) == 0:
            return jsonify({'error': 'No training data available'}), 400
        
        # Convert to DataFrame
        df = pd.DataFrame(training_data)
        
        # Map column names from Laravel database format to ML service format
        column_mapping = {
            'usia': 'Usia',
            'ket_usia': 'Ket.Usia',
            'jenis_kelamin': 'Jenis Kelamin',
            'status_bekerja': 'Status Bekerja',
            'bb': 'BB',
            'tb': 'TB',
            'imt': 'IMT',
            'status_gizi': 'Status Gizi',
            'status_merokok': 'Status Merokok',
            'pemeriksaan_kontak': 'Pemeriksaan Kontak',
            'riwayat_dm': 'Riwayat_DM',
            'riwayat_hiv': 'Riwayat_HIV',
            'komorbiditas': 'Komorbiditas',
            'kepatuhan_minum_obat': 'Kepatuhan Minum Obat',
            'efek_samping_obat': 'Efek Samping Obat',
            'keterangan_efek_samping': 'Keterangan Efek Samping',
            'riwayat_pengobatan': 'Riwayat Pengobatan Sebelumnya',
            'panduan_pengobatan': 'Panduan Pengobatan',
            'keberhasilan_pengobatan': 'Keberhasilan Pengobatan'
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
        
        # Train
        training_results = trainer.train(X, y, test_size=0.2)
        
        # Evaluate
        evaluation_results = evaluator.evaluate_all_models(
            trainer.models,
            training_results['X_test'],
            training_results['y_test']
        )
        
        # Save
        models_dir = os.path.join(get_project_root(), 'models')
        trainer.save_models(models_dir)
        preprocessor.save(os.path.join(models_dir, 'preprocessor.pkl'))
        
        is_trained = True
        
        return jsonify({
            'status': 'success',
            'message': f'Models retrained successfully with {len(df)} records',
            'data_count': len(df),
            'best_model': training_results['best_model_name'],
            'cv_results': training_results['cv_results']
        })
        
    except Exception as e:
        import traceback
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500


@app.route('/predict', methods=['POST'])
def predict():
    """Prediksi untuk single input"""
    global preprocessor, trainer
    
    if not is_trained:
        return jsonify({'error': 'Models not trained yet'}), 400
    
    try:
        data = request.json
        
        if not data:
            return jsonify({'error': 'No input data provided'}), 400
        
        # Get model name from request or use best model
        model_name = data.pop('model_name', None)
        
        # Preprocess input
        input_processed = preprocessor.preprocess_single_input(data)
        
        # Predict
        prediction = trainer.predict(input_processed, model_name)
        probabilities = trainer.predict_proba(input_processed, model_name)
        
        # Decode prediction
        target_encoder = preprocessor.label_encoders.get('Keberhasilan Pengobatan')
        if target_encoder:
            prediction_label = target_encoder.inverse_transform(prediction)[0]
        else:
            prediction_label = 'Berhasil' if prediction[0] == 0 else 'Tidak Berhasil'
        
        # Get confidence
        confidence = float(max(probabilities[0])) * 100
        
        return jsonify({
            'prediction': prediction_label,
            'prediction_code': int(prediction[0]),
            'confidence': confidence,
            'model_used': model_name if model_name else trainer.best_model_name,
            'probabilities': {
                'Berhasil': float(probabilities[0][0]) * 100,
                'Tidak Berhasil': float(probabilities[0][1]) * 100 if len(probabilities[0]) > 1 else 0
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/models', methods=['GET'])
def get_models_info():
    """Get info semua model"""
    if not is_trained or not trainer:
        return jsonify({'error': 'Models not trained yet'}), 400
    
    return jsonify({
        'models': list(trainer.models.keys()),
        'best_model': trainer.best_model_name,
        'cv_results': trainer.cv_results
    })


@app.route('/statistics', methods=['GET'])
def get_statistics():
    """Get statistik lengkap semua model"""
    if not is_trained or evaluation_results is None:
        return jsonify({'error': 'Models not evaluated yet'}), 400
    
    return jsonify({
        'evaluation_results': evaluation_results,
        'best_model': trainer.best_model_name if trainer else None,
        'cv_results': trainer.cv_results if trainer else None
    })


@app.route('/features', methods=['GET'])
def get_features():
    """Get daftar fitur yang dibutuhkan untuk prediksi"""
    if not preprocessor:
        return jsonify({'error': 'Preprocessor not initialized'}), 400
    
    return jsonify({
        'numerical_features': preprocessor.numerical_cols,
        'categorical_features': preprocessor.categorical_cols,
        'target': preprocessor.target_col,
        'all_features': preprocessor.feature_cols
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
