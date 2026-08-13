"""
Parser Data External Validation — Kohort Gowa (Register SITB/TBC.03)

Membaca file register pasien TBC RO (format SITB, multi-row header) dari Kab. Gowa
dan memetakan ke skema training internal (DataPreprocessor) pada subset 5 fitur
yang tersedia:

    Ket.Usia, Pemeriksaan Kontak, Riwayat_DM,
    Riwayat Pengobatan Sebelumnya, Panduan Pengobatan

Keputusan pemetaan (dokumentasi untuk disertasi):
- Umur (tahun) -> Ket.Usia (numerik, eksak dari register).
- 'Dilakukan Pemeriksaan Kontak' (Ya/Tidak) -> Pemeriksaan Kontak.
- 'Riwayat DM' (Ya/Tidak/Tidak Diketahui) -> Riwayat_DM.
  'Tidak Diketahui' dikodekan NaN (masuk profil data hilang; diimputasi mode saat training).
- 'Klasifikasi Berdasarkan Riwayat Pengobatan Sebelumnya' -> Riwayat Pengobatan Sebelumnya.
  Baru -> Baru (0); selain Baru (Kambuh, gagal lini 2, putus berobat, dst) -> Kasus Lama (1).
- 'Paduan Pengobatan' -> Panduan Pengobatan. 'Lfx RHZE' (short-course) -> Jangka Pendek (0);
  regimen lain (Bdq..., dll) -> Jangka Panjang (1).
- 'Hasil Akhir Pengobatan' -> Keberhasilan Pengobatan.
  Sembuh / Pengobatan Lengkap -> Berhasil (0); Gagal, Gagal karena Perubahan Diagnosis,
  Meninggal, Putus berobat -> Tidak Berhasil (1); belum ada hasil -> NaN (dieksklusi).

Kolom register (0-indexed setelah multi-row header):
   15 Umur, 16 Jenis Kelamin, 30 Pemeriksaan Kontak, 34 Klasifikasi Riwayat,
   36 Riwayat DM, 41 Paduan Pengobatan, 139 Hasil Akhir Pengobatan (Hasil).
"""

import os
from typing import Tuple

import numpy as np
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_SOURCE = os.path.abspath(
    os.path.join(HERE, "..", "..", "Kab_Gowa_Report_TB_03RO_latifa11_Januari_2023-Desember_2025.xls")
)
DEFAULT_OUTPUT = os.path.join(HERE, "..", "data", "data_gowa.csv")

GOWA_FEATURES = [
    "Ket.Usia",
    "Pemeriksaan Kontak",
    "Riwayat_DM",
    "Riwayat Pengobatan Sebelumnya",
    "Panduan Pengobatan",
]

# (kolom register, nama fitur)
COLUMN_MAP = [
    (15, "Ket.Usia"),
    (30, "Pemeriksaan Kontak"),
    (36, "Riwayat_DM"),
    (34, "Riwayat Pengobatan Sebelumnya"),
    (41, "Panduan Pengobatan"),
]

# Outcome register -> target biner (Berhasil=0, Tidak Berhasil=1) -> label
OUTCOME_MAP = {
    "Sembuh": 0,
    "Pengobatan Lengkap": 0,
    "Gagal": 1,
    "Gagal karena Perubahan Diagnosis": 1,
    "Meninggal": 1,
    "Putus berobat (lost to follow up)": 1,
}


def _map_outcome(value) -> float:
    if value is None or (isinstance(value, float) and np.isnan(value)):
        return np.nan
    return OUTCOME_MAP.get(str(value).strip(), np.nan)


def _map_kontak(value) -> float:
    s = str(value).strip().lower()
    if s in ("ya", "ada"):
        return 1.0
    if s in ("tidak", "tidak ada"):
        return 0.0
    return np.nan


def _map_riwayat_dm(value) -> float:
    s = str(value).strip().lower()
    if s in ("ya", "ada"):
        return 1.0
    if s == "tidak":
        return 0.0
    # 'tidak diketahui' -> missing (dilaporkan di profil data hilang)
    return np.nan


def _map_riwayat_pengobatan(value) -> float:
    s = str(value).strip().lower()
    # Baru = kasus baru (0); semua kategori lain = kasus lama/berulang (1)
    if s == "baru":
        return 0.0
    if s:
        return 1.0
    return np.nan


def _map_paduan(value) -> float:
    s = str(value).strip()
    # Paduan jangka pendek (short course) berbasis Lfx RHZE
    if s.upper().startswith("LFX RHZE"):
        return 0.0
    if s:
        return 1.0
    return np.nan


def build_gowa_dataframe(source: str = DEFAULT_SOURCE) -> pd.DataFrame:
    """Baca register Gowa (.xls) dan kembalikan DataFrame dalam format internal."""
    if not os.path.exists(source):
        raise FileNotFoundError(f"File Gowa tidak ditemukan: {source}")

    raw = pd.read_excel(source, header=None)
    # Baris pasien dimulai setelah header bertingkat (baris 17).
    if raw.shape[0] <= 17:
        raise ValueError("Register Gowa tampaknya kosong / header berbeda.")

    rows = []
    for _, r in raw.iloc[17:].iterrows():
        row = {}
        for col, name in COLUMN_MAP:
            v = r[col]
            row[name] = (
                float(v) if name == "Ket.Usia" and not pd.isna(v) else str(v).strip() if not pd.isna(v) else np.nan
            )
        rows.append(row)

    df = pd.DataFrame(rows, columns=[c for _, c in COLUMN_MAP])

    # Encodings
    df["Ket.Usia"] = pd.to_numeric(df["Ket.Usia"], errors="coerce")
    df["Pemeriksaan Kontak"] = df["Pemeriksaan Kontak"].apply(_map_kontak)
    df["Riwayat_DM"] = df["Riwayat_DM"].apply(_map_riwayat_dm)
    df["Riwayat Pengobatan Sebelumnya"] = df["Riwayat Pengobatan Sebelumnya"].apply(_map_riwayat_pengobatan)
    df["Panduan Pengobatan"] = df["Panduan Pengobatan"].apply(_map_paduan)

    # Target dari 'Hasil Akhir Pengobatan' (kolom 139)
    df["Keberhasilan Pengobatan"] = raw.iloc[17:, 139].apply(_map_outcome).reset_index(drop=True)
    # Kolom bantu profil (raw outcome, JK, nama) — untuk laporan kohort
    df["_hasil_raw"] = raw.iloc[17:, 139].reset_index(drop=True)
    df["_jk"] = raw.iloc[17:, 16].reset_index(drop=True)
    df["_nama"] = raw.iloc[17:, 14].reset_index(drop=True)

    return df


def save_gowa_data(source: str = DEFAULT_SOURCE, output: str = DEFAULT_OUTPUT) -> pd.DataFrame:
    df = build_gowa_dataframe(source)
    os.makedirs(os.path.dirname(output), exist_ok=True)
    df.to_csv(output, index=False)
    print(f"Gowa dataset tersimpan: {output} ({len(df)} baris)")
    return df


def cohort_profile(df: pd.DataFrame) -> dict:
    """Profil kohort Gowa untuk laporan external validation."""
    total = len(df)
    outcome = df["Keberhasilan Pengobatan"].dropna()
    missing_outcome = int(total - len(outcome))
    success = int((outcome == 0).sum())
    failure = int((outcome == 1).sum())

    missing_profile = {}
    for col in GOWA_FEATURES:
        n_miss = int(df[col].isna().sum().item())
        if n_miss > 0:
            missing_profile[col] = {
                "n": n_miss,
                "pct": round(n_miss / total * 100, 2),
            }

    return {
        "period": "Januari 2023 - Desember 2025",
        "site": "Kab. Gowa, Sulawesi Selatan",
        "source_register": "Register TBC.03 RO Fasyankes (SITB)",
        "sample_size": total,
        "success": success,
        "failure": failure,
        "missing_outcome": missing_outcome,
        "missing_profile": missing_profile,
        "inclusion_criteria": (
            "Pasien TBC RO yang tercatat dalam register TBC.03 Fasyankes Kab. Gowa "
            "pada periode Januari 2023 - Desember 2025 dengan data hasil pengobatan lengkap."
        ),
        "exclusion_criteria": (
            "Pasien yang masih dalam pengobatan / belum memiliki hasil akhir pada saat ekstraksi "
            "serta data dengan nilai fitur (Riwayat DM) tidak diketahui."
        ),
        "features": GOWA_FEATURES,
    }


if __name__ == "__main__":
    import sys

    src = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SOURCE
    df = save_gowa_data(src)
    print(df[GOWA_FEATURES + ["Keberhasilan Pengobatan"]].describe())
    print("\nOutcome:", df["Keberhasilan Pengobatan"].value_counts(dropna=False).to_dict())
    print("\nProfil kohort:", cohort_profile(df))
