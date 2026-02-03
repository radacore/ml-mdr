"""
Model Training Module untuk Prediksi Keberhasilan Pengobatan MDR-TB

Modul ini menangani:
- Training model: Logistic Regression, Decision Tree, KNN, SVM
- K-Fold Cross Validation
- Model evaluation dan selection
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from typing import Dict, List, Tuple, Any
import joblib
import os


class ModelTrainer:
    """Kelas untuk training dan evaluasi model machine learning"""
    
    def __init__(self, n_folds: int = 5, random_state: int = 42):
        self.n_folds = n_folds
        self.random_state = random_state
        self.models: Dict[str, Pipeline] = {}
        self.best_model_name: str = None
        self.best_model: Pipeline = None
        self.cv_results: Dict[str, Dict[str, float]] = {}
        self.scaler = StandardScaler()
        
        # Inisialisasi model-model
        self._init_models()
    
    def _init_models(self):
        """Inisialisasi semua model yang akan dilatih"""
        self.models = {
            'Logistic Regression': Pipeline([
                ('scaler', StandardScaler()),
                ('classifier', LogisticRegression(
                    random_state=self.random_state,
                    max_iter=1000,
                    solver='liblinear'
                ))
            ]),
            'Decision Tree': Pipeline([
                ('scaler', StandardScaler()),
                ('classifier', DecisionTreeClassifier(
                    random_state=self.random_state,
                    max_depth=10,
                    min_samples_split=5
                ))
            ]),
            'K-Nearest Neighbor': Pipeline([
                ('scaler', StandardScaler()),
                ('classifier', KNeighborsClassifier(
                    n_neighbors=5,
                    weights='distance'
                ))
            ]),
            'Support Vector Machine': Pipeline([
                ('scaler', StandardScaler()),
                ('classifier', SVC(
                    random_state=self.random_state,
                    kernel='rbf',
                    probability=True
                ))
            ])
        }
    
    def split_data(self, X: pd.DataFrame, y: pd.Series, test_size: float = 0.2) -> Tuple:
        """
        Membagi data menjadi training dan testing set
        """
        X_train, X_test, y_train, y_test = train_test_split(
            X, y,
            test_size=test_size,
            random_state=self.random_state,
            stratify=y
        )
        return X_train, X_test, y_train, y_test
    
    def cross_validate(self, X: pd.DataFrame, y: pd.Series) -> Dict[str, Dict[str, float]]:
        """
        Melakukan K-Fold Cross Validation untuk semua model
        
        Returns:
            Dictionary berisi hasil CV untuk setiap model
        """
        cv = StratifiedKFold(n_splits=self.n_folds, shuffle=True, random_state=self.random_state)
        
        results = {}
        scoring_metrics = ['accuracy', 'precision', 'recall', 'f1']
        
        for name, model in self.models.items():
            print(f"\nCross-validating {name}...")
            model_results = {}
            
            for metric in scoring_metrics:
                scores = cross_val_score(model, X, y, cv=cv, scoring=metric)
                model_results[metric] = {
                    'mean': float(np.mean(scores)),
                    'std': float(np.std(scores)),
                    'scores': [float(s) for s in scores]
                }
            
            results[name] = model_results
            print(f"  Accuracy: {model_results['accuracy']['mean']:.4f} (+/- {model_results['accuracy']['std']:.4f})")
            print(f"  F1 Score: {model_results['f1']['mean']:.4f} (+/- {model_results['f1']['std']:.4f})")
        
        self.cv_results = results
        return results
    
    def train_all_models(self, X_train: pd.DataFrame, y_train: pd.Series):
        """
        Melatih semua model pada data training
        """
        for name, model in self.models.items():
            print(f"Training {name}...")
            model.fit(X_train, y_train)
        
        # Pilih model terbaik berdasarkan F1 score dari CV
        if self.cv_results:
            best_f1 = -1
            for name, results in self.cv_results.items():
                f1_mean = results['f1']['mean']
                if f1_mean > best_f1:
                    best_f1 = f1_mean
                    self.best_model_name = name
                    self.best_model = self.models[name]
            
            print(f"\nBest model: {self.best_model_name} (F1: {best_f1:.4f})")
    
    def train(self, X: pd.DataFrame, y: pd.Series, test_size: float = 0.2) -> Dict:
        """
        Pipeline training lengkap:
        1. Split data
        2. Cross validation
        3. Train all models
        4. Select best model
        
        Returns:
            Dictionary berisi hasil training
        """
        # Split data
        X_train, X_test, y_train, y_test = self.split_data(X, y, test_size)
        
        print(f"Training set size: {len(X_train)}")
        print(f"Test set size: {len(X_test)}")
        
        # Cross validation
        cv_results = self.cross_validate(X_train, y_train)
        
        # Train models
        self.train_all_models(X_train, y_train)
        
        return {
            'X_train': X_train,
            'X_test': X_test,
            'y_train': y_train,
            'y_test': y_test,
            'cv_results': cv_results,
            'best_model_name': self.best_model_name
        }
    
    def predict(self, X: pd.DataFrame, model_name: str = None) -> np.ndarray:
        """
        Melakukan prediksi menggunakan model tertentu atau model terbaik
        """
        if model_name and model_name in self.models:
            model = self.models[model_name]
        else:
            model = self.best_model
        
        return model.predict(X)
    
    def predict_proba(self, X: pd.DataFrame, model_name: str = None) -> np.ndarray:
        """
        Mendapatkan probabilitas prediksi
        """
        if model_name and model_name in self.models:
            model = self.models[model_name]
        else:
            model = self.best_model
        
        return model.predict_proba(X)
    
    def save_models(self, directory: str):
        """
        Menyimpan semua model ke direktori
        """
        os.makedirs(directory, exist_ok=True)
        
        for name, model in self.models.items():
            filename = name.replace(' ', '_').lower() + '.pkl'
            filepath = os.path.join(directory, filename)
            joblib.dump(model, filepath)
            print(f"Saved {name} to {filepath}")
        
        # Simpan info model terbaik
        best_info = {
            'best_model_name': self.best_model_name,
            'cv_results': self.cv_results
        }
        joblib.dump(best_info, os.path.join(directory, 'best_model_info.pkl'))
    
    def load_models(self, directory: str):
        """
        Memuat semua model dari direktori
        """
        for name in self.models.keys():
            filename = name.replace(' ', '_').lower() + '.pkl'
            filepath = os.path.join(directory, filename)
            if os.path.exists(filepath):
                self.models[name] = joblib.load(filepath)
                print(f"Loaded {name} from {filepath}")
        
        # Load info model terbaik
        best_info_path = os.path.join(directory, 'best_model_info.pkl')
        if os.path.exists(best_info_path):
            best_info = joblib.load(best_info_path)
            self.best_model_name = best_info.get('best_model_name')
            self.cv_results = best_info.get('cv_results', {})
            if self.best_model_name:
                self.best_model = self.models.get(self.best_model_name)


if __name__ == "__main__":
    from preprocessing import DataPreprocessor
    
    # Load dan preprocess data
    preprocessor = DataPreprocessor()
    df = preprocessor.load_data("../data/data_uji_ml.csv")
    df_processed = preprocessor.preprocess(df)
    X, y = preprocessor.get_features_and_target(df_processed)
    
    # Train models
    trainer = ModelTrainer(n_folds=5)
    results = trainer.train(X, y, test_size=0.2)
    
    # Save models
    trainer.save_models("../models")
    preprocessor.save("../models/preprocessor.pkl")
    
    print("\n=== Training Complete ===")
    print(f"Best Model: {results['best_model_name']}")
