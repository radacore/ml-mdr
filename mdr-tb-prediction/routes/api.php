<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Prediction;
use App\Models\TrainingData;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::post('/predict', function (Request $request) {
    $mlServiceUrl = env('ML_SERVICE_URL', 'http://localhost:5000');

    try {
        $inputData = $request->all();
        $response = Http::timeout(30)->post("{$mlServiceUrl}/predict", $inputData);

        if ($response->successful()) {
            $result = $response->json();
            
            // Coba simpan ke database, tapi jangan halangi response jika gagal
            try {
                Prediction::create([
                    'user_id' => auth()->id(), // null jika tidak login
                    'patient_data' => $inputData,
                    'prediction_result' => $result['prediction'] ?? 'Unknown',
                    'model_used' => $result['model_used'] ?? 'Unknown',
                    'confidence_score' => $result['confidence'] ?? 0,
                    'probabilities' => $result['probabilities'] ?? [],
                ]);
            } catch (\Exception $dbError) {
                Log::warning('Failed to save prediction to database: ' . $dbError->getMessage());
            }
            
            return response()->json($result);
        }

        return response()->json([
            'error' => 'ML Service error',
            'message' => $response->body()
        ], $response->status());

    } catch (\Exception $e) {
        Log::error('Prediction error: ' . $e->getMessage());
        return response()->json([
            'error' => 'Failed to connect to ML Service',
            'message' => $e->getMessage()
        ], 500);
    }
});

// API endpoint untuk ML Service mengambil training data
Route::get('/training-data', function () {
    $data = TrainingData::all()->map(function ($item) {
        return [
            'Usia' => $item->usia,
            'Ket.Usia' => $item->ket_usia,
            'Jenis Kelamin' => $item->jenis_kelamin,
            'Status Bekerja' => $item->status_bekerja,
            'BB' => $item->bb,
            'TB' => $item->tb,
            'IMT' => $item->imt,
            'Status Gizi' => $item->status_gizi,
            'Status Merokok' => $item->status_merokok,
            'Pemeriksaan Kontak' => $item->pemeriksaan_kontak,
            'Riwayat_DM' => $item->riwayat_dm,
            'Riwayat_HIV' => $item->riwayat_hiv,
            'Komorbiditas' => $item->komorbiditas,
            'Kepatuhan Minum Obat' => $item->kepatuhan_minum_obat,
            'Efek Samping Obat' => $item->efek_samping_obat,
            'Riwayat Pengobatan Sebelumnya' => $item->riwayat_pengobatan,
            'Panduan Pengobatan' => $item->panduan_pengobatan,
            'Keberhasilan Pengobatan' => $item->keberhasilan_pengobatan,
        ];
    });

    return response()->json([
        'data' => $data,
        'count' => $data->count(),
    ]);
});

// API endpoint untuk retrain model
Route::post('/retrain', function () {
    $mlServiceUrl = env('ML_SERVICE_URL', 'http://localhost:5000');

    try {
        // Get all training data from database
        $trainingData = \App\Models\TrainingData::all()->toArray();
        
        if (empty($trainingData)) {
            return response()->json([
                'error' => 'No training data available in database'
            ], 400);
        }

        // Send training data directly to ML service
        $response = Http::timeout(120)->post("{$mlServiceUrl}/retrain", [
            'data' => $trainingData
        ]);

        if ($response->successful()) {
            return response()->json($response->json());
        }

        return response()->json([
            'error' => 'ML Service error',
            'message' => $response->body()
        ], $response->status());

    } catch (\Exception $e) {
        Log::error('Retrain error: ' . $e->getMessage());
        return response()->json([
            'error' => 'Failed to connect to ML Service',
            'message' => $e->getMessage()
        ], 500);
    }
});
