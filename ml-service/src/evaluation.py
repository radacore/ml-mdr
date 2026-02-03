"""
Model Evaluation Module untuk Prediksi Keberhasilan Pengobatan MDR-TB

Modul ini menangani:
- Perhitungan metrik: Accuracy, Precision, Recall, F1-Score
- Confusion Matrix
- Classification Report
"""

import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report
)
from typing import Dict, Any


class ModelEvaluator:
    """Kelas untuk evaluasi model machine learning"""
    
    def __init__(self):
        self.results: Dict[str, Any] = {}
    
    def evaluate(self, y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
        """
        Menghitung semua metrik evaluasi
        
        Args:
            y_true: Label sebenarnya
            y_pred: Label prediksi
            
        Returns:
            Dictionary berisi metrik evaluasi
        """
        metrics = {
            'accuracy': float(accuracy_score(y_true, y_pred)),
            'precision': float(precision_score(y_true, y_pred, average='binary', zero_division=0)),
            'recall': float(recall_score(y_true, y_pred, average='binary', zero_division=0)),
            'f1_score': float(f1_score(y_true, y_pred, average='binary', zero_division=0))
        }
        
        self.results = metrics
        return metrics
    
    def get_confusion_matrix(self, y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, int]:
        """
        Menghitung confusion matrix
        
        Returns:
            Dictionary dengan TP, TN, FP, FN
        """
        cm = confusion_matrix(y_true, y_pred)
        
        if cm.shape == (2, 2):
            tn, fp, fn, tp = cm.ravel()
        else:
            # Handle kasus jika hanya ada satu kelas
            tn, fp, fn, tp = 0, 0, 0, 0
            if cm.shape[0] >= 1:
                if len(np.unique(y_true)) == 1:
                    if y_true[0] == 0:
                        tn = cm[0, 0]
                    else:
                        tp = cm[0, 0]
        
        return {
            'true_positive': int(tp),
            'true_negative': int(tn),
            'false_positive': int(fp),
            'false_negative': int(fn)
        }
    
    def get_confusion_matrix_array(self, y_true: np.ndarray, y_pred: np.ndarray) -> list:
        """
        Mendapatkan confusion matrix sebagai 2D array
        """
        cm = confusion_matrix(y_true, y_pred)
        return cm.tolist()
    
    def get_classification_report(self, y_true: np.ndarray, y_pred: np.ndarray, 
                                   target_names: list = None) -> str:
        """
        Mendapatkan classification report lengkap
        """
        if target_names is None:
            target_names = ['Tidak Berhasil', 'Berhasil']
        
        return classification_report(y_true, y_pred, target_names=target_names, zero_division=0)
    
    def evaluate_all_models(self, models: Dict, X_test: pd.DataFrame, 
                           y_test: pd.Series) -> Dict[str, Dict]:
        """
        Evaluasi semua model pada test set
        
        Args:
            models: Dictionary berisi model-model yang sudah dilatih
            X_test: Data test features
            y_test: Data test labels
            
        Returns:
            Dictionary berisi hasil evaluasi untuk setiap model
        """
        results = {}
        
        for name, model in models.items():
            y_pred = model.predict(X_test)
            
            metrics = self.evaluate(y_test, y_pred)
            cm = self.get_confusion_matrix(y_test, y_pred)
            
            results[name] = {
                'metrics': metrics,
                'confusion_matrix': cm,
                'confusion_matrix_array': self.get_confusion_matrix_array(y_test, y_pred)
            }
            
            print(f"\n=== {name} ===")
            print(f"Accuracy:  {metrics['accuracy']:.4f}")
            print(f"Precision: {metrics['precision']:.4f}")
            print(f"Recall:    {metrics['recall']:.4f}")
            print(f"F1 Score:  {metrics['f1_score']:.4f}")
            print(f"Confusion Matrix: TP={cm['true_positive']}, TN={cm['true_negative']}, "
                  f"FP={cm['false_positive']}, FN={cm['false_negative']}")
        
        return results


if __name__ == "__main__":
    from preprocessing import DataPreprocessor
    from training import ModelTrainer
    
    # Load dan preprocess data
    preprocessor = DataPreprocessor()
    df = preprocessor.load_data("../data/data_uji_ml.csv")
    df_processed = preprocessor.preprocess(df)
    X, y = preprocessor.get_features_and_target(df_processed)
    
    # Train models
    trainer = ModelTrainer(n_folds=5)
    training_results = trainer.train(X, y, test_size=0.2)
    
    # Evaluate models
    evaluator = ModelEvaluator()
    eval_results = evaluator.evaluate_all_models(
        trainer.models,
        training_results['X_test'],
        training_results['y_test']
    )
    
    print("\n=== Evaluation Complete ===")
