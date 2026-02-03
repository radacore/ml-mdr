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
        } catch (\Exception $e) {
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
            'usia' => 'required|string',
            'ket_usia' => 'required|numeric',
            'jenis_kelamin' => 'required|string',
            'status_bekerja' => 'required|string',
            'bb' => 'required|numeric',
            'tb' => 'required|numeric',
            'imt' => 'required|numeric',
            'status_gizi' => 'required|string',
            'status_merokok' => 'required|string',
            'pemeriksaan_kontak' => 'required|string',
            'riwayat_dm' => 'required|string',
            'riwayat_hiv' => 'required|string',
            'komorbiditas' => 'required|string',
            'kepatuhan_minum_obat' => 'required|string',
            'efek_samping_obat' => 'required|string',
            'keterangan_efek_samping' => 'nullable|string',
            'riwayat_pengobatan' => 'required|string',
            'panduan_pengobatan' => 'required|string',
            'model_name' => 'nullable|string',
        ]);

        // Mapping ke format yang diharapkan ML service
        $mlInput = [
            'Usia' => $validated['usia'],
            'Ket.Usia' => (int) $validated['ket_usia'],
            'Jenis Kelamin' => $validated['jenis_kelamin'],
            'Status Bekerja' => $validated['status_bekerja'],
            'BB' => (float) $validated['bb'],
            'TB' => (float) $validated['tb'],
            'IMT' => (float) $validated['imt'],
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

                // Simpan ke database
                $prediction = Prediction::create([
                    'user_id' => auth()->id(),
                    'patient_data' => $validated,
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
            } else {
                return back()->withErrors(['error' => 'ML Service error: ' . $response->body()]);
            }
        } catch (\Exception $e) {
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
        } catch (\Exception $e) {
            $statistics = null;
        }

        return Inertia::render('Prediction/Statistics', [
            'statistics' => $statistics,
            'error' => $statistics === null ? 'Tidak dapat mengambil statistik dari ML Service' : null,
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
