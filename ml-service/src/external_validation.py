"""
External Validation Module — Kohort Gowa

Validasi eksternal model SVM (5 fitur yang tersedia di kedua dataset):

    Ket.Usia, Pemeriksaan Kontak, Riwayat_DM,
    Riwayat Pengobatan Sebelumnya, Panduan Pengobatan

Alur:
1. Latih model internal 5-fitur pada data training (data_uji_ml.csv),
   split 70/15/15 + SMOTE + tuning, konsisten dengan pipeline produksi.
2. Evaluasi pada test internal (Table 6 kolom "Internal test").
3. Evaluasi pada data Gowa (Table 6 kolom "External test") + ROC eksternal.
4. Kembalikan profil kohort, metrik, dan data ROC.
"""

import os
from typing import Dict, Optional

import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, roc_auc_score, roc_curve,
)
from sklearn.model_selection import train_test_split, StratifiedKFold, GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

from gowa_parser import GOWA_FEATURES, cohort_profile, DEFAULT_OUTPUT

HERE = os.path.dirname(os.path.abspath(__file__))
INTERNAL_DATA = os.path.abspath(os.path.join(HERE, "..", "data", "data_uji_ml.csv"))
GOWA_DATA = os.path.abspath(os.path.join(HERE, "..", "data", "data_gowa.csv"))

EXTERNAL_MODEL_NAME = "Support Vector Machine (external 5-fiturs)"
RANDOM_STATE = 42


def _load_internal() -> pd.DataFrame:
    """Load data internal + preprocess (encode) konsisten pipeline produksi."""
    from preprocessing import DataPreprocessor

    df = pd.read_csv(INTERNAL_DATA)
    pre = DataPreprocessor()
    df_processed = pre.preprocess(df)

    # Target sudah di-encode oleh preprocessor (Berhasil=0, Tidak Berhasil=1)
    subset = [c for c in GOWA_FEATURES if c in df_processed.columns]
    out = df_processed[subset + ["Keberhasilan Pengobatan"]].copy()
    # Drop baris dengan missing pada 5 fitur
    out = out.dropna(subset=subset + ["Keberhasilan Pengobatan"]).reset_index(drop=True)
    return out


def _load_gowa() -> pd.DataFrame:
    df = pd.read_csv(GOWA_DATA)
    df = df.drop(columns=["_hasil_raw", "_jk", "_nama"], errors="ignore")
    return df


def _impute_mode(df: pd.DataFrame, cols: list) -> pd.DataFrame:
    """Imputasi mode per kolom (untuk Riwayat_DM 'Tidak Diketahui')."""
    out = df.copy()
    for col in cols:
        if out[col].isna().any():
            mode = out[col].mode().iloc[0]
            out[col] = out[col].fillna(mode)
    return out


def _build_pipeline() -> Pipeline:
    return Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", SVC(random_state=RANDOM_STATE, probability=True, class_weight="balanced")),
    ])


def _tune_svm(X_train: pd.DataFrame, y_train: pd.Series) -> SVC:
    """Tuning grid SVM RBF (konsisten pipeline produksi)."""
    grid = {
        "C": [0.1, 1, 10, 100],
        "kernel": ["rbf", "linear"],
        "gamma": ["scale", "auto"],
    }
    base = SVC(random_state=RANDOM_STATE, probability=True, class_weight="balanced")
    gs = GridSearchCV(base, grid, cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE),
                      scoring="f1", n_jobs=-1)
    gs.fit(X_train, y_train)
    return gs.best_estimator_


def _evaluate(y_true, y_pred, y_proba) -> Dict[str, float]:
    cm = confusion_matrix(y_true, y_pred)
    tn, fp, fn, tp = (cm.ravel().tolist() + [0, 0, 0, 0])[:4] if cm.size >= 4 else (0, 0, 0, 0)
    metrics = {
        "accuracy": round(float(accuracy_score(y_true, y_pred)) * 100, 2),
        "precision": round(float(precision_score(y_true, y_pred, zero_division=0)) * 100, 2),
        "recall": round(float(recall_score(y_true, y_pred, zero_division=0)) * 100, 2),
        "f1": round(float(f1_score(y_true, y_pred, zero_division=0)) * 100, 2),
        "specificity": round(float(tn / (tn + fp) * 100), 2) if (tn + fp) > 0 else 0.0,
        "n": int(len(y_true)),
        "confusion_matrix": {"tp": int(tp), "tn": int(tn), "fp": int(fp), "fn": int(fn)},
    }
    if y_proba is not None and len(np.unique(y_true)) > 1:
        try:
            metrics["auc_roc"] = round(float(roc_auc_score(y_true, y_proba)) * 100, 2)
        except Exception:
            metrics["auc_roc"] = None
    else:
        metrics["auc_roc"] = None
    return metrics


def run_external_validation(use_smote: bool = True, verbose: bool = True) -> Dict[str, object]:
    """Jalankan pipeline external validation; return dict hasil lengkap."""
    internal = _load_internal()
    gowa = _load_gowa()

    # Imputasi mode pada Gowa (Riwayat_DM 'Tidak Diketahui')
    gowa = _impute_mode(gowa, ["Riwayat_DM"])

    X_int = internal[GOWA_FEATURES]
    y_int = internal["Keberhasilan Pengobatan"]

    # Split 70/15/15
    X_rest, X_test, y_rest, y_test = train_test_split(
        X_int, y_int, test_size=0.15, random_state=RANDOM_STATE, stratify=y_int
    )
    X_train, X_val, y_train, y_val = train_test_split(
        X_rest, y_rest, test_size=0.15 / 0.85, random_state=RANDOM_STATE, stratify=y_rest
    )

    if use_smote:
        try:
            from imblearn.over_sampling import SMOTE
            sm = SMOTE(random_state=RANDOM_STATE)
            X_train, y_train = sm.fit_resample(X_train, y_train)
            smote_applied = True
        except Exception as e:
            smote_applied = False
            print(f"  [warn] SMOTE gagal: {e}")
    else:
        smote_applied = False

    # Scaling fitur internal + Gowa dengan scaler yang sama
    scaler = StandardScaler().fit(X_train)
    X_train_s = scaler.transform(X_train)
    X_val_s = scaler.transform(X_val)
    X_test_s = scaler.transform(X_test)
    X_gowa_s = scaler.transform(gowa[GOWA_FEATURES])

    clf = _tune_svm(X_train_s, y_train)

    # Evaluasi pada internal test
    y_test_pred = clf.predict(X_test_s)
    y_test_proba = clf.predict_proba(X_test_s)[:, 1]
    internal_metrics = _evaluate(y_test, y_test_pred, y_test_proba)

    # Evaluasi pada validation (untuk referensi internal val)
    y_val_pred = clf.predict(X_val_s)
    y_val_proba = clf.predict_proba(X_val_s)[:, 1]
    internal_val = _evaluate(y_val, y_val_pred, y_val_proba)

    # Evaluasi eksternal: hanya baris Gowa dengan outcome lengkap
    gowa_complete = gowa.dropna(subset=["Keberhasilan Pengobatan"]).reset_index(drop=True)
    X_gowa_full_s = scaler.transform(gowa_complete[GOWA_FEATURES])
    y_gowa_true = gowa_complete["Keberhasilan Pengobatan"].astype(int).values

    y_gowa_pred = clf.predict(X_gowa_full_s)
    y_gowa_proba = clf.predict_proba(X_gowa_full_s)[:, 1]
    external_metrics = _evaluate(y_gowa_true, y_gowa_pred, y_gowa_proba)

    # ROC eksternal — sanitasi inf/nan (roc_curve menaruh inf di thresholds pertama,
    # dan JSON tidak mengizinkan Infinity; PHP json_decode akan gagal)
    fpr, tpr, thr = roc_curve(y_gowa_true, y_gowa_proba)

    def _finite(x):
        return None if x is None or not np.isfinite(x) else float(x)

    external_roc = {
        "fpr": [_finite(x) for x in fpr],
        "tpr": [_finite(x) for x in tpr],
        "thresholds": [_finite(x) for x in thr],
        "auc": external_metrics.get("auc_roc"),
    }

    profile = cohort_profile(gowa)

    table6 = {
        "internal": {k: internal_metrics.get(k) for k in ["accuracy", "precision", "recall", "f1"]},
        "external": {k: external_metrics.get(k) for k in ["accuracy", "precision", "recall", "f1"]},
        "internal_test": {k: internal_metrics.get(k) for k in ["accuracy", "precision", "recall", "f1"]},
    }
    # Kolom tabel: Internal test vs External test
    table6_rows = []
    for metric, label in [
        ("accuracy", "Accuracy"),
        ("precision", "Precision"),
        ("recall", "Recall"),
        ("f1", "F1 score"),
    ]:
        table6_rows.append({
            "metric": label,
            "internal_test": internal_metrics.get(metric),
            "external_test": external_metrics.get(metric),
        })

    result = {
        "status": "success",
        "model": {
            "name": EXTERNAL_MODEL_NAME,
            "best_params": {k: str(v) for k, v in clf.get_params().items() if k in ("C", "gamma", "kernel")},
            "smote_applied": smote_applied,
            "features": GOWA_FEATURES,
        },
        "cohort": profile,
        "table6": {
            "rows": table6_rows,
            "internal": table6["internal_test"],
            "external": table6["external"],
        },
        "internal_metrics": internal_metrics,
        "internal_val_metrics": internal_val,
        "external_metrics": external_metrics,
        "external_roc": external_roc,
        "split": {
            "internal_clean": int(len(X_int)),
            "train": int(len(X_train_s)),
            "validation": int(len(X_val_s)),
            "test": int(len(X_test_s)),
            "gowa_total": int(len(gowa)),
            "gowa_valid": int(len(gowa_complete)),
        },
    }

    if verbose:
        print("=== External Validation (Kohort Gowa) ===")
        print(f"Model: {result['model']['name']} | params={result['model']['best_params']} | SMOTE={smote_applied}")
        print(f"Internal test: {internal_metrics}")
        print(f"External test: {external_metrics}")
        print(f"ROC AUC eksternal: {external_metrics.get('auc_roc')}")

    return result


def save_metrics_csv(result: Dict, output: Optional[str] = None):
    """Simpan Table 6 + profil ke CSV (untuk lampiran disertasi)."""
    if output is None:
        output = os.path.abspath(os.path.join(HERE, "..", "notebooks", "figures", "external_validation_table.csv"))
    os.makedirs(os.path.dirname(output), exist_ok=True)
    rows = result["table6"]["rows"]
    df = pd.DataFrame(rows)
    df.to_csv(output, index=False)
    print(f"Table 6 tersimpan: {output}")


if __name__ == "__main__":
    res = run_external_validation(verbose=True)
    save_metrics_csv(res)
