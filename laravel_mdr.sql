-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 02, 2026 at 03:46 PM
-- Server version: 10.11.6-MariaDB
-- PHP Version: 8.4.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `laravel_mdr`
--

-- --------------------------------------------------------

--
-- Table structure for table `active_models`
--

CREATE TABLE `active_models` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `model_name` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `active_models`
--

INSERT INTO `active_models` (`id`, `model_name`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Logistic Regression', 1, '2026-02-24 00:40:15', '2026-02-25 12:54:42'),
(2, 'Decision Tree', 1, '2026-02-24 00:40:15', '2026-02-25 00:21:28'),
(4, 'Support Vector Machine', 1, '2026-02-24 00:40:15', '2026-02-24 00:40:15');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_02_01_000000_create_predictions_table', 1),
(5, '2026_02_01_010000_update_predictions_table', 2),
(6, '2026_02_01_020000_create_training_data_table', 3),
(7, '2026_02_24_083844_create_active_models_table', 4),
(8, '2026_02_25_143602_add_slug_to_predictions_table', 5);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `predictions`
--

CREATE TABLE `predictions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `patient_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`patient_data`)),
  `prediction_result` varchar(255) NOT NULL,
  `model_used` varchar(255) NOT NULL,
  `confidence_score` double NOT NULL,
  `probabilities` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`probabilities`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `predictions`
--

INSERT INTO `predictions` (`id`, `slug`, `user_id`, `patient_data`, `prediction_result`, `model_used`, `confidence_score`, `probabilities`, `created_at`, `updated_at`) VALUES
(18, 'rds-20260225-cffc', NULL, '{\"usia\":\"0\",\"ket_usia\":\"29\",\"jenis_kelamin\":\"0\",\"status_bekerja\":\"1\",\"bb\":\"109\",\"tb\":\"173\",\"imt\":\"36.4\",\"status_gizi\":\"1\",\"status_merokok\":\"1\",\"pemeriksaan_kontak\":\"0\",\"riwayat_dm\":\"0\",\"riwayat_hiv\":\"0\",\"komorbiditas\":\"0\",\"kepatuhan_minum_obat\":\"0\",\"efek_samping_obat\":\"0\",\"riwayat_pengobatan\":\"0\",\"panduan_pengobatan\":\"0\"}', 'Berhasil', 'Logistic Regression', 99.809117010018, '{\"Berhasil\":99.80911701001779,\"Tidak Berhasil\":0.19088298998221565}', '2026-02-25 07:08:14', '2026-02-25 07:08:14'),
(19, 'bas-20260226-ab02', NULL, '{\"usia\":\"0\",\"ket_usia\":\"23\",\"jenis_kelamin\":\"1\",\"status_bekerja\":\"0\",\"bb\":\"60\",\"tb\":\"160\",\"status_gizi\":\"1\",\"status_merokok\":\"0\",\"pemeriksaan_kontak\":\"0\",\"riwayat_dm\":\"0\",\"riwayat_hiv\":\"0\",\"komorbiditas\":\"0\",\"kepatuhan_minum_obat\":\"0\",\"efek_samping_obat\":\"0\",\"riwayat_pengobatan\":\"0\",\"panduan_pengobatan\":\"0\"}', 'Berhasil', 'Logistic Regression', 99.676540854484, '{\"Berhasil\":99.67654085448439,\"Tidak Berhasil\":0.32345914551561356}', '2026-02-25 12:28:21', '2026-02-25 12:28:21'),
(20, 'rds-20260226-dacf', NULL, '{\"usia\":\"0\",\"ket_usia\":\"29\",\"jenis_kelamin\":\"0\",\"status_bekerja\":\"1\",\"bb\":\"109\",\"tb\":\"173\",\"status_gizi\":\"1\",\"status_merokok\":\"1\",\"pemeriksaan_kontak\":\"0\",\"riwayat_dm\":\"0\",\"riwayat_hiv\":\"0\",\"komorbiditas\":\"0\",\"kepatuhan_minum_obat\":\"1\",\"efek_samping_obat\":\"1\",\"riwayat_pengobatan\":\"1\",\"panduan_pengobatan\":\"1\"}', 'Tidak Berhasil', 'Logistic Regression', 97.805659344728, '{\"Berhasil\":2.1943406552722866,\"Tidak Berhasil\":97.80565934472772}', '2026-02-25 12:32:00', '2026-02-25 12:32:00');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('gDGJ2yDCFyY0M230frVZDINptzrOV3Y0Hus1vN4p', 1, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiZFdhZWFLZGVNRFdQd3BaRTk3ejN4Q1pqYko0VkJTcU5NMWVYd2thNyI7czozOiJ1cmwiO2E6MDp7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fXM6NTA6ImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjtpOjE7fQ==', 1772114837),
('ICMSE0Y8GQlrnP8wMOBt1RDr5mBW18XIfQApTySH', 1, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiVGhpcGdtamJDd3ZGb0lWendtM0ZNODNpbTk4T2hEV0tyODU3RXI3dCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MTtzOjk6Il9wcmV2aW91cyI7YToyOntzOjM6InVybCI7czo0NToiaHR0cDovLzEyNy4wLjAuMTo4MDAwL2hhc2lsL3Jkcy0yMDI2MDIyNi1kYWNmIjtzOjU6InJvdXRlIjtzOjEwOiJoYXNpbC5zaG93Ijt9fQ==', 1772124372),
('ivm33E0s17yhDqZ67ARwxolunQ98UaS6hE6IO1O1', NULL, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiU3lnUXFrUnN0UlF4TVNXdmlFcGlmNzY5SlY0YTV6TmVhb2lZMVBQaCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDU6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9oYXNpbC9yZHMtMjAyNjAyMjYtZGFjZiI7czo1OiJyb3V0ZSI7czoxMDoiaGFzaWwuc2hvdyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1772114959),
('Jo5o52Gsn4bai6WYgzYLzx8uwn5Kszy0yFNcr1zl', NULL, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiQVJtSjJSVzEzVEMwcmtNVXg0OHdQUWVzQ0ZXeGpZM1ltVnp4UkpZcSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mzg6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9sYWt1a2FuLXByZWRpa3NpIjtzOjU6InJvdXRlIjtzOjE2OiJsYWt1a2FuLXByZWRpa3NpIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1772114959),
('w0iklSLzuAC2RsyHjZ0COJNczk2rANCNTrKgR3UT', NULL, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiMXlFMUF0c0tJY1A2akM2UDVCbnM2TDVjZTN0OGhMVTFEbzJQdDJ4UyI7czozOiJ1cmwiO2E6MTp7czo4OiJpbnRlbmRlZCI7czozMToiaHR0cDovLzEyNy4wLjAuMTo4MDAwL2Rhc2hib2FyZCI7fXM6OToiX3ByZXZpb3VzIjthOjI6e3M6MzoidXJsIjtzOjI3OiJodHRwOi8vMTI3LjAuMC4xOjgwMDAvbG9naW4iO3M6NToicm91dGUiO3M6NToibG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1772114959);

-- --------------------------------------------------------

--
-- Table structure for table `training_data`
--

CREATE TABLE `training_data` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `usia` varchar(255) NOT NULL,
  `ket_usia` int(11) NOT NULL,
  `jenis_kelamin` varchar(255) NOT NULL,
  `status_bekerja` varchar(255) NOT NULL,
  `bb` double NOT NULL,
  `tb` double NOT NULL,
  `imt` double NOT NULL,
  `status_gizi` varchar(255) NOT NULL,
  `status_merokok` varchar(255) NOT NULL,
  `pemeriksaan_kontak` varchar(255) NOT NULL,
  `riwayat_dm` varchar(255) NOT NULL,
  `riwayat_hiv` varchar(255) NOT NULL,
  `komorbiditas` varchar(255) NOT NULL,
  `kepatuhan_minum_obat` varchar(255) NOT NULL,
  `efek_samping_obat` varchar(255) NOT NULL,
  `keterangan_efek_samping` text DEFAULT NULL,
  `riwayat_pengobatan` varchar(255) NOT NULL,
  `panduan_pengobatan` varchar(255) NOT NULL,
  `keberhasilan_pengobatan` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `training_data`
--

INSERT INTO `training_data` (`id`, `usia`, `ket_usia`, `jenis_kelamin`, `status_bekerja`, `bb`, `tb`, `imt`, `status_gizi`, `status_merokok`, `pemeriksaan_kontak`, `riwayat_dm`, `riwayat_hiv`, `komorbiditas`, `kepatuhan_minum_obat`, `efek_samping_obat`, `keterangan_efek_samping`, `riwayat_pengobatan`, `panduan_pengobatan`, `keberhasilan_pengobatan`, `created_at`, `updated_at`) VALUES
(1, 'Usia Produktif', 48, 'Perempuan', 'Tidak Bekerja', 47, 156, 20.5, 'Gizi Normal', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Muntah ringan, nafsu makan berkurang, alergi kulit ringan, nyeri dada,', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(2, 'Usia Produktif', 20, 'Perempuan', 'Bekerja', 49, 149, 22, 'Gizi Normal', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Tidak Ada Keluhan', 'Tidak ada keluhan', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(3, 'Usia Produktif', 45, 'Perempuan', 'Tidak Bekerja', 50, 158, 33.5, 'Gizi Lebih', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Tidak Ada Keluhan', 'Tidak ada keluhan', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(4, 'Usia Lanjut', 68, 'Laki-Laki', 'Bekerja', 65, 166, 23.6, 'Gizi Normal', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Tidak Ada Keluhan', 'Tidak ada keluhan', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(5, 'Usia Produktif', 35, 'Laki-Laki', 'Tidak Bekerja', 51, 152, 22, 'Gizi Normal', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Mual, Nyeri Sendi, Nyeri Kepala', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(6, 'Usia Produktif', 24, 'Laki-Laki', 'Tidak Bekerja', 67, 160, 26, 'Gizi Lebih', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Tidak Ada Keluhan', 'Tidak ada keluhan', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(7, 'Usia Produktif', 39, 'Laki-Laki', 'Bekerja', 50, 165, 18, 'Gizi Kurang', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Tidak Ada Keluhan', 'Tidak ada keluhan', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(8, 'Usia Produktif', 32, 'Laki-Laki', 'Tidak Bekerja', 55, 165, 20, 'Gizi Normal', 'Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Tidak Ada Keluhan', 'Tidak ada keluhan', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(9, 'Usia Produktif', 35, 'Laki-Laki', 'Bekerja', 48, 160, 18.7, 'Gizi Normal', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Tidak Ada Keluhan', 'Tidak ada keluhan', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(10, 'Usia Produktif', 30, 'Laki-Laki', 'Tidak Bekerja', 50, 174, 16.4, 'Gizi Kurang', 'Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Tidak Ada Keluhan', 'Tidak ada keluhan', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(11, 'Usia Produktif', 45, 'Perempuan', 'Tidak Bekerja', 55, 170, 19, 'Gizi Normal', 'Tidak Merokok', 'Ya', 'Ada', 'Tidak', 'Ada', 'Patuh', 'Ada Keluhan', 'Nafsu makan berkurang', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(12, 'Usia Lanjut', 48, 'Perempuan', 'Tidak Bekerja', 50, 150, 22.2, 'Gizi Normal', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Mual, Muntah ringan, Gangguan tidur', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(13, 'Usia Produktif', 19, 'Laki-Laki', 'Tidak Bekerja', 45, 159, 17.8, 'Gizi Kurang', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Tidak Ada Keluhan', 'Tidak ada keluhan', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(14, 'Usia Lanjut', 50, 'Laki-Laki', 'Tidak Bekerja', 56, 180, 17.3, 'Gizi Kurang', 'Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Tidak Ada Keluhan', 'Tidak ada keluhan', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(15, 'Usia Produktif', 37, 'Perempuan', 'Tidak Bekerja', 38, 157, 15.4, 'Gizi Kurang', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Mual, Gangguan tidur', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(16, 'Usia Produktif', 38, 'Laki-Laki', 'Tidak Bekerja', 48, 168, 17, 'Gizi Kurang', 'Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Tidak Ada Keluhan', 'Tidak ada keluhan', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(17, 'Usia Produktif', 30, 'Perempuan', 'Tidak Bekerja', 48, 155, 20, 'Gizi Normal', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Diare, Mual, Dispepsia akut, Muntah ringan, Nafsu makan berkurang, Perut kembung, Gangguan tidur, Halusinasi,Vertigo, sesak nafas, lidah menghitam, cemas', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(18, 'Usia Produktif', 35, 'Perempuan', 'Tidak Bekerja', 40, 158, 16, 'Gizi Kurang', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Tidak Ada Keluhan', 'Tidak ada keluhan', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(19, 'Usia Produktif', 29, 'Laki-Laki', 'Tidak Bekerja', 48, 162, 18.3, 'Gizi Kurang', 'Tidak Merokok', 'Tidak', 'Ada', 'Tidak', 'Ada', 'Patuh', 'Tidak Ada Keluhan', 'Tidak ada keluhan', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(20, 'Usia Lanjut', 68, 'Laki-Laki', 'Tidak Bekerja', 52, 165, 16.5, 'Gizi Kurang', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Mual, Muntah ringan, Gangguan tidur', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(21, 'Usia Produktif', 36, 'Perempuan', 'Tidak Bekerja', 46, 167, 16.5, 'Gizi Kurang', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Mual, muntah ringan, Kesemutan pada kaki', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(22, 'Usia Lanjut', 57, 'Laki-Laki', 'Bekerja', 45, 156, 18.5, 'Gizi Normal', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Mual, Muntah ringan, nafsu makan berkurang, alergi kulit ringan', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(23, 'Usia Lanjut', 60, 'Perempuan', 'Tidak Bekerja', 45, 155, 18.7, 'Gizi Normal', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Tidak Ada Keluhan', 'Tidak Ada Keluhan', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(24, 'Usia Lanjut', 63, 'Perempuan', 'Tidak Bekerja', 43, 155, 17.9, 'Gizi Normal', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Dispesia akut, mual, muntah ringan, nafsu makan berkurang, gangguan tidur, pusing', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(25, 'Usia Lanjut', 45, 'Laki-Laki', 'Bekerja', 48, 175, 15.7, 'Gizi Kurang', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Muntah ringan, mual', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(26, 'Usia Produktif', 26, 'Laki-Laki', 'Tidak Bekerja', 48, 176, 15.5, 'Gizi Kurang', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Muntah ringan, Mual', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(27, 'Usia Lanjut', 58, 'Laki-Laki', 'Bekerja', 51, 166, 18.5, 'Gizi Normal', 'Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Mual, Lemas, hemoptoe', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(28, 'Usia Lanjut', 70, 'Perempuan', 'Tidak Bekerja', 43, 151, 18.9, 'Gizi Normal', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Tidak Ada Keluhan', 'Tidak ada keluhan', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(29, 'Usia Lanjut', 67, 'Perempuan', 'Tidak Bekerja', 54, 156, 22.2, 'Gizi Normal', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Mual, Alergi kulit, Kesemutan, sesak nafas, nyeri dada', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(30, 'Usia Produktif', 19, 'Perempuan', 'Bekerja', 37, 150, 16.4, 'Gizi Kurang', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Mual, Muntah ringan, gangguan tidur', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(31, 'Usia Produktif', 24, 'Perempuan', 'Bekerja', 44, 156, 18.1, 'Gizi Normal', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Mual, nafsu makan berkurang, pusing', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(32, 'Usia Lanjut', 47, 'Perempuan', 'Tidak Bekerja', 59, 155, 24.6, 'Gizi Normal', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Tidak Ada Keluhan', 'Tidak ada keluhan', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(33, 'Usia Produktif', 23, 'Perempuan', 'Bekerja', 31, 152, 13.4, 'Gizi Kurang', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Tidak Ada Keluhan', 'Mual', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(34, 'Usia Produktif', 16, 'Perempuan', 'Bekerja', 52, 179, 16.2, 'Gizi Kurang', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Benjolan dileher', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(35, 'Usia Produktif', 20, 'Laki-Laki', 'Tidak Bekerja', 45, 170, 15.6, 'Gizi Kurang', 'Merokok', 'Tidak', 'Tidak', 'Ada', 'Ada', 'Patuh', 'Ada Keluhan', 'Diare, Mual, Muntah ringan, nafsu makan berkurang, Nyeri perut -sedang, gangguan tidur, jantung berdebar, nyeri dada, nyeri berat, sesak nafas, lemas', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(36, 'Usia Produktif', 28, 'Perempuan', 'Tidak Bekerja', 45, 152, 19.5, 'Gizi Normal', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Tidak Ada Keluhan', 'Tidak ada keluhan', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(37, 'Usia Lanjut', 56, 'Laki-Laki', 'Bekerja', 43, 162, 16.4, 'Gizi Kurang', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Tidak Ada Keluhan', 'Tidak ada keluhan', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(38, 'Usia Produktif', 37, 'Laki-Laki', 'Bekerja', 35, 150, 15.6, 'Gizi Kurang', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Lidah terasa tebal', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(39, 'Usia Produktif', 38, 'Perempuan', 'Tidak Bekerja', 45, 165, 16.5, 'Gizi Kurang', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Mual, muntah ringan', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(40, 'Usia Produktif', 27, 'Laki-Laki', 'Bekerja', 51, 155, 21.2, 'Gizi Normal', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Tidak Ada Keluhan', 'Tidak ada keluhan', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(41, 'Usia Produktif', 41, 'Perempuan', 'Tidak Bekerja', 69, 170, 23.9, 'Gizi Normal', 'Tidak Merokok', 'Tidak', 'Ada', 'Tidak', 'Ada', 'Patuh', 'Ada Keluhan', 'Mual, Gangguan tidur, Kesemutan', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(42, 'Usia Lanjut', 45, 'Perempuan', 'Tidak Bekerja', 36, 156, 14.8, 'Gizi Kurang', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Tidak Ada Keluhan', 'Tidak ada keluhan', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(43, 'Usia Produktif', 31, 'Perempuan', 'Bekerja', 40, 165, 14.7, 'Gizi Kurang', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Mual, muntah ringan', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(44, 'Usia Produktif', 43, 'Laki-Laki', 'Tidak Bekerja', 45, 170, 15.6, 'Gizi Kurang', 'Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'mual, jantung berdebar', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(45, 'Usia Lanjut', 52, 'Perempuan', 'Tidak Bekerja', 30, 150, 13.3, 'Gizi Kurang', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'mual, ganguan tidur, badan lemas', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(46, 'Usia Lanjut', 45, 'Laki-Laki', 'Bekerja', 41, 170, 14.2, 'Gizi Kurang', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Gangguan tidur. Alergi kulit', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(47, 'Usia Lanjut', 48, 'Laki-Laki', 'Bekerja', 48, 160, 18.7, 'Gizi Normal', 'Tidak Merokok', 'Tidak', 'Ada', 'Tidak', 'Ada', 'Patuh', 'Ada Keluhan', 'Dispesia akut, mual, muntah ringan, nafsu makan berkurang, nyeri perut sedang, depresi, gangguan tidur, kebas, nyeri dada, gangguan penglihatan, nyeri kepala', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(48, 'Usia Produktif', 43, 'Laki-Laki', 'Bekerja', 77, 168, 16.3, 'Gizi Kurang', 'Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Mual, muntah ringan, kemerahan pada sendi', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(49, 'Usia Produktif', 41, 'Laki-Laki', 'Tidak Bekerja', 46, 170, 15.9, 'Gizi Kurang', 'Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Mual', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(50, 'Usia Produktif', 20, 'Perempuan', 'Tidak Bekerja', 37, 157, 15, 'Gizi Kurang', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Mual, Pemanjangan QTc, lemas, demam, penghlihatan berkunang-kunang', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(51, 'Usia Lanjut', 64, 'Laki-Laki', 'Tidak Bekerja', 49, 169, 17.2, 'Gizi Kurang', 'Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Mual, nyeri perut sedang,, gangguan tidur, nyeri sendi, kesemutan, gangguan elektrolit, sesak, berkunang', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(52, 'Usia Produktif', 15, 'Laki-Laki', 'Bekerja', 47, 160, 18.4, 'Gizi Normal', 'Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Alergi kulit sedang, sesak nafas', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(53, 'Usia Lanjut', 63, 'Perempuan', 'Tidak Bekerja', 44, 150, 19.6, 'Gizi Normal', 'Tidak Merokok', 'Tidak', 'Ada', 'Tidak', 'Ada', 'Patuh', 'Ada Keluhan', 'Mual, nafsu makan berkurang,batuk, lemas, sesak nafas', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(54, 'Usia Produktif', 24, 'Perempuan', 'Bekerja', 45, 165, 16.5, 'Gizi Kurang', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Mual, muntah ringan, mutah berat, nafsu makan berkurang, nyeri perut ringan-sedang, kesemutan, batuk, lemas', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(55, 'Usia Produktif', 18, 'Laki-Laki', 'Bekerja', 44, 160, 17.2, 'Gizi Kurang', 'Tidak Merokok', 'Tidak', 'Ada', 'Tidak', 'Ada', 'Patuh', 'Ada Keluhan', 'Mual', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(56, 'Usia Produktif', 44, 'Laki-Laki', 'Bekerja', 60, 161, 23.1, 'Gizi Normal', 'Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Mual, Nyeri perut sedang, nyeri sendi, gangguan penglihatan', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(57, 'Usia Produktif', 43, 'Perempuan', 'Tidak Bekerja', 50, 155, 20.8, 'Gizi Normal', 'Merokok', 'Tidak', 'Ada', 'Tidak', 'Ada', 'Patuh', 'Ada Keluhan', 'Mual, Muntah ringan, Gangguan tidur, nafsu makan berkurang, Pemanjangan QTc, jantung beredar, nyeri dada, anemia, bengkak pada 2 kaki', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(58, 'Usia Lanjut', 51, 'Laki-Laki', 'Tidak Bekerja', 36, 150, 16, 'Gizi Kurang', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Mual, muntah ringan, nafsu makan berkurang, kesemutan, neuroritis optik, sesak nafas', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(59, 'Usia Lanjut', 51, 'Laki-Laki', 'Tidak Bekerja', 61, 163, 23, 'Gizi Normal', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Dispesia akut, mual, muntah ringan, perut kembung, gangguan tidur, nyeri sendi, demam', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(60, 'Usia Lanjut', 52, 'Laki-Laki', 'Tidak Bekerja', 56, 157, 22.7, 'Gizi Normal', 'Tidak Merokok', 'Tidak', 'Ada', 'Tidak', 'Ada', 'Patuh', 'Ada Keluhan', 'Mual, batuk bedahak, gangguan penglihatan, sesak nafas, pusing', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(61, 'Usia Produktif', 42, 'Laki-Laki', 'Tidak Bekerja', 43, 158, 17, 'Gizi Kurang', 'Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Nafsu makan berkurang, sesak nafas, badan lemas', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(62, 'Usia Produktif', 28, 'Perempuan', 'Tidak Bekerja', 47, 158, 19, 'Gizi Normal', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'mual, batuk bedahak, kram seluruh badan', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(63, 'Usia Lanjut', 55, 'Perempuan', 'Tidak Bekerja', 46, 158, 18, 'Gizi Kurang', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'mual, muntah ringan, nafsu makan berkurang, perut kembung, depresi, kesemutan, gangguan penglihatan, vertigo, sendawa', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(64, 'Usia Produktif', 21, 'Laki-Laki', 'Tidak Bekerja', 49, 163, 18, 'Gizi Kurang', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Mual, kesemutan, jantung berdebar', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(65, 'Usia Lanjut', 62, 'Laki-Laki', 'Bekerja', 46, 158, 18, 'Gizi Kurang', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Mual, muntah ringan, nafsu makan berkurang, Gangguan tidur, Pemanjaan QTc, gangguan hati, gangguan gula darah', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(66, 'Usia Produktif', 38, 'Laki-Laki', 'Tidak Bekerja', 74, 175, 24, 'Gizi Normal', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Dispesia akut, mual, gangguan tidur, sesak nafas', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(67, 'Usia Produktif', 20, 'Laki-Laki', 'Bekerja', 42, 172, 14, 'Gizi Kurang', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Mual, nafsu makan berkurang, depresi, gangguan tidur, Pemanjangan QTc, nyeri dada, neurotis optik, gangguan penglihatan', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(68, 'Usia Lanjut', 55, 'Laki-Laki', 'Tidak Bekerja', 61, 171, 21, 'Gizi Normal', 'Tidak Merokok', 'Ya', 'Ada', 'Tidak', 'Ada', 'Patuh', 'Ada Keluhan', 'Mual, depresi, kesemutan, badan lemas, nyeri pinggang', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(69, 'Usia Lanjut', 52, 'Perempuan', 'Tidak Bekerja', 42, 153, 18, 'Gizi Kurang', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Dispesia akut, mual, muntah ringan, pnafas sedang-berat, nafsu makan berkurang, nyeri perut, gangguan tidur, reaksi alergi kulit ringan, nyeri sendi, kesemutan, jantung berdebar, nyeri dada, gangguan penglihatan, nyeri kepala, vertigo', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(70, 'Usia Lanjut', 50, 'Laki-Laki', 'Bekerja', 57, 174, 19, 'Gizi Normal', 'Merokok', 'Tidak', 'Ada', 'Tidak', 'Ada', 'Patuh', 'Ada Keluhan', 'Mual, muntah ringan, nafsu makan berkurang, sesak nafas, batuk berlendir', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(71, 'Usia Produktif', 23, 'Laki-Laki', 'Tidak Bekerja', 56, 174, 19, 'Gizi Normal', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Mual, kesemutan', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(72, 'Usia Lanjut', 65, 'Perempuan', 'Bekerja', 42, 150, 19, 'Gizi Normal', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Dispesia akut, nyeri pada pergelangan kaki, nyeri kepala', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(73, 'Usia Produktif', 30, 'Perempuan', 'Bekerja', 60, 160, 23, 'Gizi Normal', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Dispesia akut, mual, nafsu makan berkurang, nyeri pergelangaan kaki, kesemutan', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(74, 'Usia Produktif', 39, 'Laki-Laki', 'Tidak Bekerja', 65, 172, 22, 'Gizi Normal', 'Merokok', 'Tidak', 'Tidak', 'Ada', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Dispesia akut, muntah ringan, nyeri sendi, gangguan hati', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(75, 'Usia Lanjut', 52, 'Perempuan', 'Tidak Bekerja', 39, 142, 19, 'Gizi Normal', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Mual, muntah ringan, nafsu makan berkurang, gangguan tidur, nyeri sendi, nyeri kepala, anemia, batuk berlendir', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(76, 'Usia Produktif', 43, 'Perempuan', 'Tidak Bekerja', 55, 150, 24, 'Gizi Normal', 'Tidak Merokok', 'Tidak', 'Ada', 'Tidak', 'Ada', 'Patuh', 'Ada Keluhan', 'Mual, perut kembung, depresi, gangguan tidur, reaksi alergi kulit ringan, nyeri sendi, nyeri kepala, kelelahan', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(77, 'Usia Produktif', 37, 'Perempuan', 'Tidak Bekerja', 48, 163, 18, 'Gizi Kurang', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Dispesia akut, mual, perut kembung, gangguan tidur', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(78, 'Usia Produktif', 26, 'Perempuan', 'Tidak Bekerja', 50, 169, 18, 'Gizi Kurang', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Mual, nafsu makan berkurang', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(79, 'Usia Lanjut', 45, 'Laki-Laki', 'Bekerja', 47, 161, 18, 'Gizi Kurang', 'Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Dispesia akut, mual, muntah sedang-berat, dehidrasi, nafsu makan berkurang, perut kembung, gangguan tidur, reaksi alergi kulit, nyeri sendi, kesemutan, gangguan hati, anemia', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(80, 'Usia Produktif', 22, 'Perempuan', 'Tidak Bekerja', 48, 175, 16, 'Gizi Kurang', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Tidak Ada Keluhan', 'Tidak ada keluhan', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(81, 'Usia Produktif', 24, 'Perempuan', 'Tidak Bekerja', 43, 157, 17, 'Gizi Kurang', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Dispesia akut, mual, muntah ringan, nafsu makan berkurang, anemia', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(82, 'Usia Produktif', 14, 'Laki-Laki', 'Bekerja', 48, 141, 24, 'Gizi Normal', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'nafsu makan berkurang, perubahan warna kulit, pemanjangan QTc, jantung berdebar, anemia, sesak', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(83, 'Usia Produktif', 19, 'Perempuan', 'Tidak Bekerja', 45, 160, 18, 'Gizi Kurang', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Dispesia akut, mual, muntah ringan, nafsu makan berkurang, perubahan warna kulit, gangguan sendi, nyeri sendi, kesemutan, nyeri dada', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(84, 'Usia Lanjut', 64, 'Laki-Laki', 'Bekerja', 48, 155, 20, 'Gizi Normal', 'Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Diare, Dispesia akut, munta ringan, gangguan tidur, gangguan sendi, anemia, Gout', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(85, 'Usia Produktif', 38, 'Laki-Laki', 'Tidak Bekerja', 48, 172, 16, 'Gizi Kurang', 'Tidak Merokok', 'Tidak', 'Tidak', 'Ada', 'Ada', 'Patuh', 'Tidak Ada Keluhan', 'Tidak ada keluhan', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(86, 'Usia Produktif', 28, 'Perempuan', 'Bekerja', 48, 160, 19, 'Gizi Normal', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Mual, muntah ringan, nafsu makan berkurang, depresi, gangguan tidur, reaksi alergi kulit ringan, kesemutan, pemanjangan QTc, jantung berdebar, gangguan hati, gangguan elektrolit', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(87, 'Usia Lanjut', 54, 'Laki-Laki', 'Bekerja', 54, 165, 20, 'Gizi Normal', 'Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Dispesia akut, perut kembung, gangguan tidur, batuk berlendir', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(88, 'Usia Lanjut', 58, 'Laki-Laki', 'Tidak Bekerja', 51, 167, 18, 'Gizi Kurang', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Reaksi alergi kulit ringan, kesemutan', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(89, 'Usia Produktif', 34, 'Perempuan', 'Bekerja', 56, 158, 22, 'Gizi Kurang', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Dispesia akut, Mual, Gangguan tidur, Gangguan sendi, gangguan hati, gangguan penglihatan, nyeri kepala', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:52', '2026-01-31 18:39:52'),
(90, 'Usia Produktif', 17, 'Laki-Laki', 'Tidak Bekerja', 45, 170, 16, 'Gizi Kurang', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Mual, nafsu makan berkurang, perut kembung, gangguan hati', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(91, 'Usia Produktif', 48, 'Laki-Laki', 'Tidak Bekerja', 56, 165, 21, 'Gizi Normal', 'Tidak Merokok', 'Ya', 'Tidak', 'Ada', 'Ada', 'Patuh', 'Ada Keluhan', 'Dispesia akut, mual, nafsu makan berkurang, perut kembung, gangguan tidur', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(92, 'Usia Lanjut', 63, 'Laki-Laki', 'Tidak Bekerja', 51, 154, 22, 'Gizi Normal', 'Merokok', 'Tidak', 'Ada', 'Tidak', 'Ada', 'Patuh', 'Ada Keluhan', 'Mual, muntah ringan, reaksi kulit ringan, kesemutan, jantung berdebar, nyeri kepala, anemia, batuk berlendir, lemas', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(93, 'Usia Produktif', 28, 'Perempuan', 'Tidak Bekerja', 53, 163, 20, 'Gizi Normal', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Dispesia akut, mual, muntah ringan, nafsu makan berkurang, kesemutan, jantung berdebar, gangguan hati', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(94, 'Usia Produktif', 35, 'Laki-Laki', 'Bekerja', 34, 169, 12, 'Gizi Kurang', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Dispesia akut, muntah ringan, muntah sedang, kesemutan, perpanjangan QTc, jantung berdebar, gangguan hati, gangguan elektrolik, sesak, batuk berlendir', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(95, 'Usia Produktif', 42, 'Laki-Laki', 'Tidak Bekerja', 39, 170, 14, 'Gizi Kurang', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Mual, nafsu makan berkurang, nyeri sendi, kesemutan, pusing', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(96, 'Usia Produktif', 23, 'Perempuan', 'Tidak Bekerja', 32, 154, 14, 'Gizi Kurang', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Dispesia akut, mual, muntah ringan, perpanjangan QTc, jantung berdebar, sesak', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(97, 'Usia Produktif', 44, 'Laki-Laki', 'Bekerja', 68, 165, 25, 'Gizi Lebih', 'Tidak Merokok', 'Tidak', 'Ada', 'Tidak', 'Ada', 'Patuh', 'Ada Keluhan', 'Mual, bengkak pada sendi, hepatotoksis, anemia, gangguan elektrolit', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(98, 'Usia Produktif', 44, 'Laki-Laki', 'Bekerja', 53, 160, 21, 'Gizi Normal', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Tidak Ada Keluhan', 'muntah sedang-berat, reaksi alergi kulit, nyeri dada, anemia, gangguan elektrolit', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(99, 'Usia Lanjut', 49, 'Perempuan', 'Tidak Bekerja', 32, 145, 15, 'Gizi Kurang', 'Tidak Merokok', 'Ya', 'Tidak', 'Ada', 'Ada', 'Patuh', 'Ada Keluhan', 'Mual, muntah ringan, gangguan tidur, tebas kesemutan, gangguan penglihatan, nyeri kepala, anemia, sesak nafas', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(100, 'Usia Lanjut', 69, 'Laki-Laki', 'Bekerja', 35, 149, 16, 'Gizi Kurang', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Dispesia akut, perut kembung, kesemutan', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(101, 'Usia Produktif', 37, 'Perempuan', 'Tidak Bekerja', 59, 160, 23, 'Gizi Normal', 'Tidak Merokok', 'Tidak', 'Ada', 'Tidak', 'Ada', 'Patuh', 'Ada Keluhan', 'Mual, gangguan penglihatan, rasa kelelahan, lemas', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(102, 'Usia Lanjut', 77, 'Perempuan', 'Tidak Bekerja', 30, 142, 15, 'Gizi Kurang', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'muntah ringan, nafsu makan berkurang, gangguan hati', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(103, 'Usia Produktif', 31, 'Perempuan', 'Tidak Bekerja', 36, 155, 15, 'Gizi Kurang', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Mual, kesemutan', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(104, 'Usia Produktif', 36, 'Laki-Laki', 'Bekerja', 40, 160, 16, 'Gizi Kurang', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Dispesia akut, gangguan tidur, kesemutan', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(105, 'Usia Produktif', 53, 'Laki-Laki', 'Bekerja', 68, 168, 24, 'Gizi Normal', 'Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Mual, ganguan sendi, artitis, anemia, gangguan aletrolik, lemas', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(106, 'Usia Produktif', 43, 'Perempuan', 'Tidak Bekerja', 47, 150, 21, 'Gizi Normal', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Dispesia akut, mual, muntah ringan, gangguan tidur, kesemutan, gangguan hati, nyeri kepala, anemia, gangguan elektrolik', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(107, 'Usia Produktif', 15, 'Laki-Laki', 'Bekerja', 48, 158, 19, 'Gizi Normal', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'mual, nafsu makan berkurang, gangguan hati, batuk', 'Kasus Baru', 'Jangka Panjang', 'Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(108, 'Usia Lanjut', 52, 'Laki-Laki', 'Bekerja', 64, 172, 22, 'Gizi Normal', 'Tidak Merokok', 'Tidak', 'Ada', 'Tidak', 'Ada', 'Patuh', 'Ada Keluhan', 'Mual, kesemutan, batuk', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(109, 'Usia Produktif', 32, 'Laki-Laki', 'Bekerja', 49, 165, 18, 'Gizi Kurang', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Dispesia akut, mual, nafsu makan berkurang, perubahan warna kulit, reaksi alergi kulit, nyeri sendi, batuk berlendir', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(110, 'Usia Produktif', 30, 'Laki-Laki', 'Bekerja', 45, 160, 18, 'Gizi Kurang', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Mual', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(111, 'Usia Produktif', 17, 'Laki-Laki', 'Tidak Bekerja', 50, 157, 20, 'Gizi Normal', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Mual, muntah ringan', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(112, 'Usia Produktif', 24, 'Perempuan', 'Bekerja', 50, 156, 21, 'Gizi Normal', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Mual, muntah ringan, perubahan warna kulit, nyeri kepala', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(113, 'Usia Produktif', 17, 'Perempuan', 'Bekerja', 46, 155, 19, 'Gizi Normal', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Perubahan warna kulit, sesak nafas', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(114, 'Usia Produktif', 28, 'Perempuan', 'Tidak Bekerja', 50, 155, 21, 'Gizi Normal', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Tidak Ada Keluhan', 'Tidak ada keluhan', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(115, 'Usia Lanjut', 49, 'Perempuan', 'Tidak Bekerja', 40, 158, 16, 'Gizi Kurang', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', 'Mual, nafsu makan berkurang, nyeri pergelangan kaki', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(116, 'Usia Produktif', 36, 'Laki-Laki', 'Tidak Bekerja', 87, 164, 32, 'Gizi Lebih', 'Tidak Merokok', 'Ya', 'Ada', 'Tidak', 'Ada', 'Patuh', 'Ada Keluhan', 'perut kembung,', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(117, 'Usia Lanjut', 61, 'Laki-Laki', 'Tidak Bekerja', 60, 171, 21, 'Gizi Normal', 'Tidak Merokok', 'Ya', 'Ada', 'Tidak', 'Ada', 'Tidak Patuh', 'Ada Keluhan', 'Mual, Muntah ringan, nafsu makan berkurang, alergi kulit ringan', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(118, 'Usia Produktif', 41, 'Perempuan', 'Bekerja', 35, 143, 17, 'Gizi Kurang', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Tidak Ada Keluhan', 'Tidak ada keluhan', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(119, 'Usia Produktif', 38, 'Perempuan', 'Tidak Bekerja', 35, 158, 14, 'Gizi Kurang', 'Tidak Merokok', 'Ya', 'Ada', 'Tidak', 'Ada', 'Patuh', 'Ada Keluhan', 'nyeri perut ringan-sedang, gangguan tidur, perubahan warna kulit, nyeri pada pergelangan kaki', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(120, 'Usia Produktif', 28, 'Laki-Laki', 'Bekerja', 45, 150, 20, 'Gizi Normal', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Tidak Ada Keluhan', 'Tidak ada keluhan', 'Kasus Lama', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(121, 'Usia Produktif', 35, 'Laki-Laki', 'Tidak Bekerja', 66, 170, 21, 'Gizi Normal', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Tidak Ada Keluhan', 'Tidak ada keluhan', 'Kasus Baru', 'Jangka Pendek', 'Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(122, 'Usia Lanjut', 47, 'Perempuan', 'Tidak Bekerja', 47, 156, 20.5, 'Gizi Normal', 'Tidak Merokok', 'Tidak', 'Ada', 'Tidak', 'Ada', 'Patuh', 'Ada Keluhan', '', 'Kasus Lama', 'Jangka Pendek', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(123, 'Usia Produktif', 13, 'Perempuan', 'Bekerja', 49, 149, 22, 'Gizi Normal', 'Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', '', 'Kasus Lama', 'Jangka Pendek', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(124, 'Usia Produktif', 30, 'Laki-Laki', 'Bekerja', 50, 158, 33.5, 'Gizi Lebih', 'Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Tidak Patuh', 'Ada Keluhan', '', 'Kasus Lama', 'Jangka Pendek', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(125, 'Usia Produktif', 31, 'Laki-Laki', 'Bekerja', 65, 166, 23.6, 'Gizi Normal', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Tidak Patuh', 'Tidak Ada Keluhan', '', 'Kasus Lama', 'Jangka Pendek', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(126, 'Usia Lanjut', 45, 'Laki-Laki', 'Tidak Bekerja', 51, 152, 22, 'Gizi Normal', 'Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Tidak Patuh', 'Tidak Ada Keluhan', '', 'Kasus Baru', 'Jangka Pendek', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(127, 'Usia Produktif', 23, 'Perempuan', 'Tidak Bekerja', 67, 160, 26, 'Gizi Lebih', 'Tidak Merokok', 'Ya', 'Tidak', 'Ada', 'Ada', 'Tidak Patuh', 'Tidak Ada Keluhan', '', 'Kasus Lama', 'Jangka Pendek', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(128, 'Usia Lanjut', 55, 'Laki-Laki', 'Tidak Bekerja', 50, 165, 18, 'Gizi Kurang', 'Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Tidak Patuh', 'Tidak Ada Keluhan', '', 'Kasus Lama', 'Jangka Pendek', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(129, 'Usia Lanjut', 57, 'Perempuan', 'Tidak Bekerja', 55, 165, 20, 'Gizi Normal', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Tidak Patuh', 'Ada Keluhan', '', 'Kasus Lama', 'Jangka Panjang', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(130, 'Usia Lanjut', 61, 'Laki-Laki', 'Tidak Bekerja', 48, 160, 18.7, 'Gizi Normal', 'Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Tidak Patuh', 'Ada Keluhan', '', 'Kasus Lama', 'Jangka Panjang', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(131, 'Usia Lanjut', 65, 'Laki-Laki', 'Bekerja', 50, 174, 16.4, 'Gizi Kurang', 'Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Tidak Patuh', 'Ada Keluhan', '', 'Kasus Lama', 'Jangka Pendek', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(132, 'Usia Lanjut', 67, 'Laki-Laki', 'Bekerja', 55, 170, 19, 'Gizi Normal', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', '', 'Kasus Lama', 'Jangka Panjang', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(133, 'Usia Produktif', 24, 'Laki-Laki', 'Tidak Bekerja', 50, 150, 22.2, 'Gizi Normal', 'Tidak Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', '', 'Kasus Lama', 'Jangka Panjang', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(134, 'Usia Lanjut', 47, 'Laki-Laki', 'Tidak Bekerja', 45, 159, 17.8, 'Gizi Kurang', 'Tidak Merokok', 'Tidak', 'Ada', 'Tidak', 'Ada', 'Tidak Patuh', 'Ada Keluhan', '', 'Kasus Lama', 'Jangka Pendek', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(135, 'Usia Lanjut', 46, 'Perempuan', 'Bekerja', 56, 180, 17.3, 'Gizi Kurang', 'Merokok', 'Ya', 'Ada', 'Tidak', 'Ada', 'Tidak Patuh', 'Tidak Ada Keluhan', '', 'Kasus Lama', 'Jangka Pendek', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(136, 'Usia Produktif', 15, 'Perempuan', 'Bekerja', 50, 150, 22.2, 'Gizi Normal', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Tidak Patuh', 'Ada Keluhan', '', 'Kasus Lama', 'Jangka Pendek', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(137, 'Usia Produktif', 27, 'Perempuan', 'Tidak Bekerja', 45, 159, 17.8, 'Gizi Kurang', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Tidak Patuh', 'Ada Keluhan', '', 'Kasus Lama', 'Jangka Pendek', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(138, 'Usia Lanjut', 50, 'Perempuan', 'Tidak Bekerja', 56, 180, 17.3, 'Gizi Kurang', 'Tidak Merokok', 'Tidak', 'Ada', 'Tidak', 'Ada', 'Patuh', 'Ada Keluhan', '', 'Kasus Lama', 'Jangka Pendek', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(139, 'Usia Produktif', 38, 'Perempuan', 'Tidak Bekerja', 38, 157, 15.4, 'Gizi Kurang', 'Tidak Merokok', 'Ya', 'Ada', 'Tidak', 'Ada', 'Tidak Patuh', 'Ada Keluhan', '', 'Kasus Lama', 'Jangka Pendek', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(140, 'Usia Lanjut', 46, 'Laki-Laki', 'Bekerja', 48, 168, 17, 'Gizi Kurang', 'Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Tidak Patuh', 'Ada Keluhan', '', 'Kasus Lama', 'Jangka Pendek', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(141, 'Usia Lanjut', 47, 'Laki-Laki', 'Bekerja', 48, 155, 20, 'Gizi Normal', 'Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Tidak Patuh', 'Ada Keluhan', '', 'Kasus Lama', 'Jangka Panjang', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(142, 'Usia Produktif', 44, 'Perempuan', 'Tidak Bekerja', 40, 158, 16, 'Gizi Kurang', 'Tidak Merokok', 'Ya', 'Ada', 'Tidak', 'Ada', 'Patuh', 'Ada Keluhan', '', 'Kasus Lama', 'Jangka Pendek', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(143, 'Usia Produktif', 37, 'Perempuan', 'Tidak Bekerja', 48, 162, 18.3, 'Gizi Kurang', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Tidak Patuh', 'Ada Keluhan', '', 'Kasus Lama', 'Jangka Pendek', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(144, 'Usia Lanjut', 47, 'Perempuan', 'Tidak Bekerja', 59, 160, 23, 'Gizi Normal', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Tidak Patuh', 'Tidak Ada Keluhan', '', 'Kasus Lama', 'Jangka Pendek', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(145, 'Usia Produktif', 40, 'Perempuan', 'Tidak Bekerja', 30, 142, 15, 'Gizi Kurang', 'Tidak Merokok', 'Tidak', 'Ada', 'Tidak', 'Ada', 'Tidak Patuh', 'Tidak Ada Keluhan', '', 'Kasus Lama', 'Jangka Pendek', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(146, 'Usia Lanjut', 53, 'Laki-Laki', 'Bekerja', 36, 155, 15, 'Gizi Kurang', 'Merokok', 'Ya', 'Ada', 'Tidak', 'Ada', 'Patuh', 'Tidak Ada Keluhan', '', 'Kasus Lama', 'Jangka Panjang', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(147, 'Usia Produktif', 43, 'Laki-Laki', 'Bekerja', 40, 160, 16, 'Gizi Kurang', 'Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', '', 'Kasus Lama', 'Jangka Pendek', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(148, 'Usia Produktif', 34, 'Perempuan', 'Tidak Bekerja', 68, 168, 24, 'Gizi Normal', 'Tidak Merokok', 'Ya', 'Ada', 'Tidak', 'Ada', 'Tidak Patuh', 'Ada Keluhan', '', 'Kasus Lama', 'Jangka Panjang', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(149, 'Usia Lanjut', 72, 'Laki-Laki', 'Bekerja', 47, 150, 21, 'Gizi Normal', 'Merokok', 'Tidak', 'Ada', 'Tidak', 'Ada', 'Tidak Patuh', 'Ada Keluhan', '', 'Kasus Lama', 'Jangka Panjang', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(150, 'Usia Lanjut', 65, 'Laki-Laki', 'Bekerja', 48, 158, 19, 'Gizi Normal', 'Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', '', 'Kasus Lama', 'Jangka Pendek', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(151, 'Usia Produktif', 24, 'Perempuan', 'Tidak Bekerja', 64, 172, 22, 'Gizi Normal', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', '', 'Kasus Lama', 'Jangka Pendek', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(152, 'Usia Produktif', 15, 'Perempuan', 'Bekerja', 49, 165, 18, 'Gizi Kurang', 'Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Tidak Patuh', 'Ada Keluhan', '', 'Kasus Lama', 'Jangka Pendek', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(153, 'Usia Lanjut', 65, 'Perempuan', 'Tidak Bekerja', 45, 160, 18, 'Gizi Kurang', 'Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Tidak Patuh', 'Ada Keluhan', '', 'Kasus Lama', 'Jangka Pendek', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(154, 'Usia Lanjut', 51, 'Perempuan', 'Tidak Bekerja', 50, 157, 20, 'Gizi Normal', 'Merokok', 'Ya', 'Ada', 'Tidak', 'Ada', 'Tidak Patuh', 'Ada Keluhan', '', 'Kasus Lama', 'Jangka Pendek', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(155, 'Usia Lanjut', 59, 'Perempuan', 'Tidak Bekerja', 50, 156, 21, 'Gizi Normal', 'Merokok', 'Tidak', 'Ada', 'Tidak', 'Ada', 'Tidak Patuh', 'Ada Keluhan', '', 'Kasus Lama', 'Jangka Pendek', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(156, 'Usia Lanjut', 50, 'Laki-Laki', 'Tidak Bekerja', 46, 155, 19, 'Gizi Normal', 'Tidak Merokok', 'Ya', 'Ada', 'Tidak', 'Ada', 'Patuh', 'Tidak Ada Keluhan', '', 'Kasus Lama', 'Jangka Pendek', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(157, 'Usia Lanjut', 50, 'Laki-Laki', 'Tidak Bekerja', 50, 155, 21, 'Gizi Normal', 'Tidak Merokok', 'Tidak', 'Ada', 'Tidak', 'Ada', 'Patuh', 'Tidak Ada Keluhan', '', 'Kasus Lama', 'Jangka Panjang', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(158, 'Usia Lanjut', 65, 'Laki-Laki', 'Bekerja', 47, 150, 21, 'Gizi Normal', 'Merokok', 'Ya', 'Ada', 'Tidak', 'Ada', 'Patuh', 'Tidak Ada Keluhan', '', 'Kasus Lama', 'Jangka Pendek', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(159, 'Usia Lanjut', 52, 'Laki-Laki', 'Tidak Bekerja', 48, 158, 19, 'Gizi Normal', 'Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Tidak Patuh', 'Ada Keluhan', '', 'Kasus Lama', 'Jangka Pendek', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(160, 'Usia Produktif', 33, 'Perempuan', 'Tidak Bekerja', 64, 172, 22, 'Gizi Normal', 'Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Tidak Patuh', 'Ada Keluhan', '', 'Kasus Lama', 'Jangka Pendek', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(161, 'Usia Lanjut', 66, 'Laki-Laki', 'Tidak Bekerja', 49, 165, 18, 'Gizi Kurang', 'Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', '', 'Kasus Lama', 'Jangka Panjang', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(162, 'Usia Lanjut', 60, 'Perempuan', 'Tidak Bekerja', 45, 160, 18, 'Gizi Kurang', 'Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Ada Keluhan', '', 'Kasus Lama', 'Jangka Pendek', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(163, 'Usia Lanjut', 63, 'Laki-Laki', 'Bekerja', 50, 157, 20, 'Gizi Normal', 'Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Patuh', 'Tidak Ada Keluhan', '', 'Kasus Lama', 'Jangka Panjang', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(164, 'Usia Produktif', 34, 'Laki-Laki', 'Bekerja', 50, 156, 21, 'Gizi Normal', 'Tidak Merokok', 'Ya', 'Tidak', 'Ada', 'Ada', 'Tidak Patuh', 'Ada Keluhan', '', 'Kasus Lama', 'Jangka Pendek', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(165, 'Usia Lanjut', 58, 'Perempuan', 'Tidak Bekerja', 46, 155, 19, 'Gizi Normal', 'Merokok', 'Ya', 'Ada', 'Tidak', 'Ada', 'Tidak Patuh', 'Ada Keluhan', '', 'Kasus Lama', 'Jangka Panjang', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(166, 'Usia Lanjut', 57, 'Laki-Laki', 'Bekerja', 50, 155, 21, 'Gizi Normal', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Tidak Patuh', 'Ada Keluhan', '', 'Kasus Lama', 'Jangka Pendek', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(167, 'Usia Produktif', 40, 'Perempuan', 'Tidak Bekerja', 40, 158, 16, 'Gizi Kurang', 'Merokok', 'Tidak', 'Ada', 'Tidak', 'Ada', 'Patuh', 'Ada Keluhan', '', 'Kasus Lama', 'Jangka Pendek', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(168, 'Usia Produktif', 29, 'Laki-Laki', 'Bekerja', 87, 164, 32, 'Gizi Lebih', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Tidak Patuh', 'Ada Keluhan', '', 'Kasus Lama', 'Jangka Panjang', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53');
INSERT INTO `training_data` (`id`, `usia`, `ket_usia`, `jenis_kelamin`, `status_bekerja`, `bb`, `tb`, `imt`, `status_gizi`, `status_merokok`, `pemeriksaan_kontak`, `riwayat_dm`, `riwayat_hiv`, `komorbiditas`, `kepatuhan_minum_obat`, `efek_samping_obat`, `keterangan_efek_samping`, `riwayat_pengobatan`, `panduan_pengobatan`, `keberhasilan_pengobatan`, `created_at`, `updated_at`) VALUES
(169, 'Usia Produktif', 31, 'Perempuan', 'Tidak Bekerja', 60, 171, 21, 'Gizi Normal', 'Merokok', 'Ya', 'Ada', 'Tidak', 'Ada', 'Tidak Patuh', 'Ada Keluhan', '', 'Kasus Lama', 'Jangka Pendek', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(170, 'Usia Produktif', 30, 'Perempuan', 'Tidak Bekerja', 35, 143, 17, 'Gizi Kurang', 'Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Tidak Patuh', 'Ada Keluhan', '', 'Kasus Lama', 'Jangka Pendek', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(171, 'Usia Lanjut', 68, 'Laki-Laki', 'Bekerja', 35, 158, 14, 'Gizi Kurang', 'Merokok', 'Ya', 'Ada', 'Tidak', 'Ada', 'Tidak Patuh', 'Tidak Ada Keluhan', '', 'Kasus Lama', 'Jangka Pendek', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(172, 'Usia Produktif', 30, 'Laki-Laki', 'Bekerja', 45, 150, 20, 'Gizi Normal', 'Tidak Merokok', 'Ya', 'Tidak', 'Ada', 'Ada', 'Tidak Patuh', 'Ada Keluhan', '', 'Kasus Lama', 'Jangka Pendek', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(173, 'Usia Lanjut', 53, 'Perempuan', 'Tidak Bekerja', 66, 170, 21, 'Gizi Normal', 'Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Tidak Patuh', 'Ada Keluhan', '', 'Kasus Lama', 'Jangka Pendek', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(174, 'Usia Produktif', 27, 'Perempuan', 'Bekerja', 50, 150, 22.2, 'Gizi Normal', 'Merokok', 'Tidak', 'Tidak', 'Tidak', 'Tidak Ada', 'Tidak Patuh', 'Ada Keluhan', '', 'Kasus Lama', 'Jangka Panjang', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53'),
(175, 'Usia Produktif', 42, 'Laki-Laki', 'Bekerja', 45, 159, 17.8, 'Gizi Kurang', 'Tidak Merokok', 'Ya', 'Tidak', 'Tidak', 'Tidak Ada', 'Tidak Patuh', 'Ada Keluhan', '', 'Kasus Lama', 'Jangka Panjang', 'Tidak Berhasil', '2026-01-31 18:39:53', '2026-01-31 18:39:53');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'radarada', 'radarada@gmail.com', NULL, '$2y$12$tsCyQ8tC3QBJW1U01muiw.x/4OYpavpzopyh8omE8T3GSDQ6TNtyq', NULL, '2026-01-31 08:34:50', '2026-01-31 08:34:50');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `active_models`
--
ALTER TABLE `active_models`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `active_models_model_name_unique` (`model_name`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `predictions`
--
ALTER TABLE `predictions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `predictions_slug_unique` (`slug`),
  ADD KEY `predictions_user_id_foreign` (`user_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `training_data`
--
ALTER TABLE `training_data`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `active_models`
--
ALTER TABLE `active_models`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `predictions`
--
ALTER TABLE `predictions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `training_data`
--
ALTER TABLE `training_data`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=176;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
