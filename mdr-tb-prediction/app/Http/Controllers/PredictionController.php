<?php

namespace App\Http\Controllers;

use App\Models\Prediction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class PredictionController extends Controller
{
    /**
     * URL ML Service
     */
    protected string $mlServiceUrl;

    public function __construct()
    {
        $this->mlServiceUrl = env('ML_SERVICE_URL', 'http://localhost:5000');
    }

    /**
     * Tampilkan halaman form prediksi
     */
    public function index()
    {
        try {
            // Ambil info fitur dari ML service
            $response = Http::get("{$this->mlServiceUrl}/features");
            $features = $response->successful() ? $response->json() : null;
        }
        catch (\Exception $e) {
            $features = null;
        }

        return Inertia::render('Prediction/Index', [
            'features' => $features,
            'mlServiceStatus' => $features !== null ? 'connected' : 'disconnected',
        ]);
    }

    /**
     * Proses prediksi
     */
    public function predict(Request $request)
    {
        $validated = $request->validate([
            'nama_lengkap' => 'nullable|string',
            'usia' => 'required|string',
            'ket_usia' => 'required|numeric',
            'jenis_kelamin' => 'required|numeric',
            'status_bekerja' => 'required|numeric',
            'bb' => 'required|numeric',
            'tb' => 'required|numeric',
            'imt' => 'required|numeric',
            'status_gizi' => 'required|numeric',
            'status_merokok' => 'required|numeric',
            'pemeriksaan_kontak' => 'required|numeric',
            'riwayat_dm' => 'required|numeric',
            'riwayat_hiv' => 'required|numeric',
            'komorbiditas' => 'required|numeric',
            'kepatuhan_minum_obat' => 'required|numeric',
            'efek_samping_obat' => 'required|numeric',
            'keterangan_efek_samping' => 'nullable|string',
            'riwayat_pengobatan' => 'required|numeric',
            'panduan_pengobatan' => 'required|numeric',
            'model_name' => 'nullable|string',
        ]);

        // Mapping ke format yang diharapkan ML service
        $mlInput = [
            'Usia' => $validated['usia'],
            'Ket.Usia' => (int)$validated['ket_usia'],
            'Jenis Kelamin' => $validated['jenis_kelamin'],
            'Status Bekerja' => $validated['status_bekerja'],
            'BB' => (float)$validated['bb'],
            'TB' => (float)$validated['tb'],
            'IMT' => (float)$validated['imt'],
            'Status Gizi' => $validated['status_gizi'],
            'Status Merokok' => $validated['status_merokok'],
            'Pemeriksaan Kontak' => $validated['pemeriksaan_kontak'],
            'Riwayat_DM' => $validated['riwayat_dm'],
            'Riwayat_HIV' => $validated['riwayat_hiv'],
            'Komorbiditas' => $validated['komorbiditas'],
            'Kepatuhan Minum Obat' => $validated['kepatuhan_minum_obat'],
            'Efek Samping Obat' => $validated['efek_samping_obat'],
            'Riwayat Pengobatan Sebelumnya' => $validated['riwayat_pengobatan'],
            'Panduan Pengobatan' => $validated['panduan_pengobatan'],
        ];

        if (!empty($validated['model_name']) && $validated['model_name'] !== 'auto') {
            $mlInput['model_name'] = $validated['model_name'];
        }

        try {
            $response = Http::post("{$this->mlServiceUrl}/predict", $mlInput);

            if ($response->successful()) {
                $result = $response->json();

                // Generate slug dari inisial nama lengkap
                $namaLengkap = $validated['nama_lengkap'] ?? 'Pasien';
                $words = explode(' ', trim($namaLengkap));
                $initials = '';
                foreach ($words as $word) {
                    if (!empty($word)) {
                        $initials .= strtoupper(mb_substr($word, 0, 1));
                    }
                }
                if (empty($initials)) $initials = 'P';
                $slug = $initials . '-' . \Illuminate\Support\Str::random(6);

                // Simpan ke database
                $prediction = Prediction::create([
                    'user_id' => auth()->id(),
                    'slug' => $slug,
                    'patient_data' => array_merge($validated, ['nama_lengkap' => $namaLengkap]),
                    'prediction_result' => $result['prediction'],
                    'model_used' => $result['model_used'],
                    'confidence_score' => $result['confidence'],
                    'probabilities' => $result['probabilities'] ?? null,
                ]);

                return Inertia::render('Prediction/Result', [
                    'prediction' => $prediction,
                    'result' => $result,
                    'input' => $validated,
                ]);
            }
            else {
                return back()->withErrors(['error' => 'ML Service error: ' . $response->body()]);
            }
        }
        catch (\Exception $e) {
            return back()->withErrors(['error' => 'Tidak dapat terhubung ke ML Service: ' . $e->getMessage()]);
        }
    }

    /**
     * Tampilkan riwayat prediksi (semua prediksi termasuk dari guest)
     */
    public function history()
    {
        $predictions = Prediction::orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Prediction/History', [
            'predictions' => $predictions,
        ]);
    }

    /**
     * Tampilkan statistik model
     */
    public function statistics()
    {
        try {
            $response = Http::get("{$this->mlServiceUrl}/statistics");
            $statistics = $response->successful() ? $response->json() : null;

            // Filter out models that are disabled by the Admin
            if ($statistics && isset($statistics['evaluation_results'])) {
                $activeModels = \App\Models\ActiveModel::where('is_active', true)->pluck('model_name')->toArray();

                // Filter evaluation results
                $filteredResults = [];
                foreach ($statistics['evaluation_results'] as $modelName => $result) {
                    if (in_array($modelName, $activeModels)) {
                        $filteredResults[$modelName] = $result;
                    }
                }
                $statistics['evaluation_results'] = $filteredResults;

                // Filter CV results as well
                if (isset($statistics['cv_results'])) {
                    $filteredCv = [];
                    foreach ($statistics['cv_results'] as $modelName => $cv) {
                        if (in_array($modelName, $activeModels)) {
                            $filteredCv[$modelName] = $cv;
                        }
                    }
                    $statistics['cv_results'] = $filteredCv;
                }

                // Filter comparison_table as well
                if (isset($statistics['comparison_table'])) {
                    $filteredComparison = [];
                    foreach ($statistics['comparison_table'] as $modelName => $data) {
                        if (in_array($modelName, $activeModels)) {
                            $filteredComparison[$modelName] = $data;
                        }
                    }
                    $statistics['comparison_table'] = $filteredComparison;
                }

                // Filter best_params as well
                if (isset($statistics['best_params'])) {
                    $filteredParams = [];
                    foreach ($statistics['best_params'] as $modelName => $params) {
                        if (in_array($modelName, $activeModels)) {
                            $filteredParams[$modelName] = $params;
                        }
                    }
                    $statistics['best_params'] = $filteredParams;
                }

                // Note: The /statistics endpoint from the Python service also returns a 'best_model' property.
                // We should technically recalculate what the actual best active model is, based on the remaining CV results.
                $bestScore = -1;
                $activeBestModel = null;
                if (!empty($statistics['cv_results'])) {
                    foreach ($statistics['cv_results'] as $modelName => $cv) {
                        if ($cv['f1']['mean'] > $bestScore) {
                            $bestScore = $cv['f1']['mean'];
                            $activeBestModel = $modelName;
                        }
                    }
                }
                $statistics['best_model'] = $activeBestModel;
            }

        }
        catch (\Exception $e) {
            $statistics = null;
        }

        return Inertia::render('Prediction/Statistics', [
            'statistics' => $statistics,
            'error' => $statistics === null || empty($statistics['evaluation_results']) ? 'Tidak dapat mengambil statistik atau belum ada model aktif dari ML Service' : null,
        ]);
    }

    /**
     * Detail prediksi
     */
    public function show(Prediction $prediction)
    {
        return Inertia::render('Prediction/Show', [
            'prediction' => $prediction,
        ]);
    }

    /**
     * Hapus prediksi
     */
    public function destroy(Prediction $prediction)
    {
        $prediction->delete();

        return redirect()->route('prediction.history')->with('success', 'Prediksi berhasil dihapus');
    }
}