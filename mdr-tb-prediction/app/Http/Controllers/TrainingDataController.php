<?php

namespace App\Http\Controllers;

use App\Models\TrainingData;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TrainingDataController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = TrainingData::query();

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('jenis_kelamin', 'like', "%{$search}%")
                    ->orWhere('status_gizi', 'like', "%{$search}%")
                    ->orWhere('keberhasilan_pengobatan', 'like', "%{$search}%");
            });
        }

        // Filter by outcome
        if ($request->has('outcome') && $request->outcome) {
            $query->where('keberhasilan_pengobatan', $request->outcome);
        }

        $trainingData = $query->orderBy('created_at', 'desc')->paginate(15);

        $total = TrainingData::count();

        return Inertia::render('TrainingData/Index', [
            'trainingData' => $trainingData,
            'filters' => $request->only(['search', 'outcome']),
            'stats' => [
                'total' => $total,
                'berhasil' => TrainingData::where('keberhasilan_pengobatan', 'Berhasil')->count(),
                'tidak_berhasil' => TrainingData::where('keberhasilan_pengobatan', 'Tidak Berhasil')->count(),
                'data_training' => (int)round($total * 0.70),
                'data_validation' => (int)round($total * 0.15),
                'data_testing' => (int)round($total * 0.15),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('TrainingData/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'usia' => 'required|string',
            'ket_usia' => 'required|integer|min:1|max:120',
            'jenis_kelamin' => 'required|string',
            'status_bekerja' => 'required|string',
            'bb' => 'required|numeric|min:1',
            'tb' => 'required|numeric|min:50',
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
            'keberhasilan_pengobatan' => 'required|string',
        ]);

        TrainingData::create($validated);

        return redirect()->route('training-data.index')
            ->with('success', 'Data training berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(TrainingData $trainingData)
    {
        return Inertia::render('TrainingData/Show', [
            'trainingData' => $trainingData,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(TrainingData $trainingData)
    {
        return Inertia::render('TrainingData/Edit', [
            'trainingData' => $trainingData,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, TrainingData $trainingData)
    {
        $validated = $request->validate([
            'usia' => 'required|string',
            'ket_usia' => 'required|integer|min:1|max:120',
            'jenis_kelamin' => 'required|string',
            'status_bekerja' => 'required|string',
            'bb' => 'required|numeric|min:1',
            'tb' => 'required|numeric|min:50',
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
            'keberhasilan_pengobatan' => 'required|string',
        ]);

        $trainingData->update($validated);

        return redirect()->route('training-data.index')
            ->with('success', 'Data training berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TrainingData $trainingData)
    {
        $trainingData->delete();

        return redirect()->route('training-data.index')
            ->with('success', 'Data training berhasil dihapus.');
    }
}