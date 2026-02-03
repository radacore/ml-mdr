import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import { BrainCircuit, Activity, Users } from 'lucide-react';

interface FormData {
    usia: string;
    ket_usia: string;
    jenis_kelamin: string;
    status_bekerja: string;
    bb: string;
    tb: string;
    imt: string;
    status_gizi: string;
    status_merokok: string;
    pemeriksaan_kontak: string;
    riwayat_dm: string;
    riwayat_hiv: string;
    komorbiditas: string;
    kepatuhan_minum_obat: string;
    efek_samping_obat: string;
    keterangan_efek_samping: string;
    riwayat_pengobatan: string;
    panduan_pengobatan: string;
}

interface PredictionResult {
    prediction: string;
    confidence: number;
    model_used: string;
    probabilities: Record<string, number>;
}

export default function Welcome() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<PredictionResult | null>(null);
    const [formData, setFormData] = useState<FormData>({
        usia: '',
        ket_usia: '',
        jenis_kelamin: '',
        status_bekerja: '',
        bb: '',
        tb: '',
        imt: '',
        status_gizi: '',
        status_merokok: '',
        pemeriksaan_kontak: '',
        riwayat_dm: '',
        riwayat_hiv: '',
        komorbiditas: '',
        kepatuhan_minum_obat: '',
        efek_samping_obat: '',
        keterangan_efek_samping: '',
        riwayat_pengobatan: '',
        panduan_pengobatan: '',
    });

    // Auto-calculate IMT only (Status Gizi is now manual)
    useEffect(() => {
        if (formData.bb && formData.tb) {
            const bb = parseFloat(formData.bb);
            const tb = parseFloat(formData.tb) / 100;
            if (bb > 0 && tb > 0) {
                const imt = (bb / (tb * tb)).toFixed(1);
                setFormData(prev => ({ ...prev, imt }));
            }
        }
    }, [formData.bb, formData.tb]);

    const totalSteps = 5;

    const validateStep = (currentStep: number): string | null => {
        switch (currentStep) {
            case 1: // Data Demografi
                if (!formData.ket_usia) return 'Usia wajib diisi';
                if (!formData.jenis_kelamin) return 'Jenis kelamin wajib dipilih';
                if (!formData.status_bekerja) return 'Status bekerja wajib dipilih';
                break;
            case 2: // Data Fisik
                if (!formData.bb) return 'Berat badan wajib diisi';
                if (!formData.tb) return 'Tinggi badan wajib diisi';
                if (!formData.status_gizi) return 'Status gizi wajib dipilih';
                if (!formData.status_merokok) return 'Status merokok wajib dipilih';
                break;
            case 3: // Riwayat Kesehatan
                if (!formData.pemeriksaan_kontak) return 'Pemeriksaan kontak wajib dipilih';
                if (!formData.riwayat_dm) return 'Riwayat diabetes wajib dipilih';
                if (!formData.riwayat_hiv) return 'Riwayat HIV wajib dipilih';
                if (!formData.komorbiditas) return 'Komorbiditas wajib dipilih';
                break;
            case 4: // Pengobatan
                if (!formData.kepatuhan_minum_obat) return 'Kepatuhan minum obat wajib dipilih';
                if (!formData.efek_samping_obat) return 'Efek samping obat wajib dipilih';
                if (!formData.riwayat_pengobatan) return 'Riwayat pengobatan wajib dipilih';
                if (!formData.panduan_pengobatan) return 'Panduan pengobatan wajib dipilih';
                break;
        }
        return null;
    };

    const handleNext = () => {
        const validationError = validateStep(step);
        if (validationError) {
            setError(validationError);
            return;
        }
        setError(null);
        if (step < totalSteps) setStep(step + 1);
    };

    const handlePrev = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Gagal melakukan prediksi');

            const data = await response.json();
            setResult(data);
            setStep(6); // Result step
        } catch (err) {
            setError('Gagal melakukan prediksi. Pastikan ML Service berjalan.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setStep(1);
        setResult(null);
        setFormData({
            usia: '', ket_usia: '', jenis_kelamin: '', status_bekerja: '',
            bb: '', tb: '', imt: '', status_gizi: '', status_merokok: '',
            pemeriksaan_kontak: '', riwayat_dm: '', riwayat_hiv: '',
            komorbiditas: '', kepatuhan_minum_obat: '', efek_samping_obat: '',
            keterangan_efek_samping: '', riwayat_pengobatan: '', panduan_pengobatan: '',
        });
    };

    const stepTitles = [
        'Data Demografi',
        'Data Fisik',
        'Riwayat Kesehatan',
        'Pengobatan',
        'Konfirmasi',
    ];

    return (
        <>
            <Head title="Prediksi Keberhasilan Pengobatan MDR-TB" />
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar minimal />

                {/* Main Content */}
                <main className="flex-grow px-4 pb-12 pt-32">
                    <div className="max-w-2xl mx-auto">
                        {/* Hero Text - Visible until result shown */}
                        {step <= 5 && !result && (
                            <div className="text-center mb-10">
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                    Prediksi Keberhasilan Pengobatan
                                </h1>
                                <p className="text-xl text-blue-600 font-semibold mb-2">
                                    Multi-Drug Resistant Tuberculosis
                                </p>
                                <p className="text-gray-600 max-w-xl mx-auto leading-relaxed">
                                    Gunakan sistem Machine Learning kami untuk membantu Anda memahami peluang kesembuhan secara mandiri.
                                </p>
                            </div>
                        )}

                        {/* Progress Bar */}
                        {step <= totalSteps && (
                            <div className="mb-6">
                                <div className="flex justify-between mb-2">
                                    {stepTitles.map((title, idx) => (
                                        <div
                                            key={idx}
                                            className={`text-xs font-medium ${step > idx + 1 ? 'text-green-600' :
                                                step === idx + 1 ? 'text-gray-900 font-bold' : 'text-gray-400'
                                                }`}
                                        >
                                            {idx + 1}. {title}
                                        </div>
                                    ))}
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300 shadow-sm"
                                        style={{ width: `${(step / totalSteps) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {error && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Step 1: Demographics */}
                        {step === 1 && (
                            <Card className="backdrop-blur bg-white/95 shadow-2xl border-0">
                                <CardHeader>
                                    <CardTitle className="text-2xl">📋 Data Demografi Pasien</CardTitle>
                                    <CardDescription>Masukkan informasi dasar pasien</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Usia (tahun) <span className="text-red-500">*</span></Label>
                                            <Input
                                                type="number"
                                                value={formData.ket_usia}
                                                onChange={(e) => {
                                                    const age = parseInt(e.target.value);
                                                    setFormData({
                                                        ...formData,
                                                        ket_usia: e.target.value,
                                                        // Auto-select kategori usia
                                                        usia: !isNaN(age) ? (age >= 60 ? 'Usia Lanjut' : 'Usia Produktif') : formData.usia
                                                    });
                                                }}
                                                placeholder="Contoh: 45"
                                            />
                                        </div>
                                        <div>
                                            <Label>Kategori Usia <span className="text-xs text-gray-500">(otomatis)</span></Label>
                                            <Select
                                                value={formData.usia}
                                                onValueChange={(v) => setFormData({ ...formData, usia: v })}
                                            >
                                                <SelectTrigger><SelectValue placeholder="Auto-terisi" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Usia Produktif">Usia Produktif (&lt;60 thn)</SelectItem>
                                                    <SelectItem value="Usia Lanjut">Usia Lanjut (≥60 thn)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Jenis Kelamin</Label>
                                            <Select
                                                value={formData.jenis_kelamin}
                                                onValueChange={(v) => setFormData({ ...formData, jenis_kelamin: v })}
                                            >
                                                <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Laki-Laki">Laki-Laki</SelectItem>
                                                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>Status Bekerja</Label>
                                            <Select
                                                value={formData.status_bekerja}
                                                onValueChange={(v) => setFormData({ ...formData, status_bekerja: v })}
                                            >
                                                <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Bekerja">Bekerja</SelectItem>
                                                    <SelectItem value="Tidak Bekerja">Tidak Bekerja</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 2: Physical Data */}
                        {step === 2 && (
                            <Card className="backdrop-blur bg-white/95 shadow-2xl border-0">
                                <CardHeader>
                                    <CardTitle className="text-2xl">⚖️ Data Fisik</CardTitle>
                                    <CardDescription>Masukkan data fisik pasien</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label>Berat Badan (kg)</Label>
                                            <Input
                                                type="number"
                                                value={formData.bb}
                                                onChange={(e) => setFormData({ ...formData, bb: e.target.value })}
                                                placeholder="50"
                                            />
                                        </div>
                                        <div>
                                            <Label>Tinggi Badan (cm)</Label>
                                            <Input
                                                type="number"
                                                value={formData.tb}
                                                onChange={(e) => setFormData({ ...formData, tb: e.target.value })}
                                                placeholder="165"
                                            />
                                        </div>
                                        <div>
                                            <Label>IMT (otomatis)</Label>
                                            <Input
                                                type="text"
                                                value={formData.imt}
                                                readOnly
                                                className="bg-gray-100"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Status Gizi</Label>
                                            <Select
                                                value={formData.status_gizi}
                                                onValueChange={(v) => setFormData({ ...formData, status_gizi: v })}
                                            >
                                                <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Gizi Kurang">Gizi Kurang</SelectItem>
                                                    <SelectItem value="Gizi Normal">Gizi Normal</SelectItem>
                                                    <SelectItem value="Gizi Lebih">Gizi Lebih</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>Status Merokok</Label>
                                            <Select
                                                value={formData.status_merokok}
                                                onValueChange={(v) => setFormData({ ...formData, status_merokok: v })}
                                            >
                                                <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Merokok">Merokok</SelectItem>
                                                    <SelectItem value="Tidak Merokok">Tidak Merokok</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 3: Health History */}
                        {step === 3 && (
                            <Card className="backdrop-blur bg-white/95 shadow-2xl border-0">
                                <CardHeader>
                                    <CardTitle className="text-2xl">🩺 Riwayat Kesehatan</CardTitle>
                                    <CardDescription>Informasi riwayat kesehatan pasien</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Pemeriksaan Kontak</Label>
                                            <Select
                                                value={formData.pemeriksaan_kontak}
                                                onValueChange={(v) => setFormData({ ...formData, pemeriksaan_kontak: v })}
                                            >
                                                <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Ya">Ya</SelectItem>
                                                    <SelectItem value="Tidak">Tidak</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>Riwayat Diabetes</Label>
                                            <Select
                                                value={formData.riwayat_dm}
                                                onValueChange={(v) => setFormData({ ...formData, riwayat_dm: v })}
                                            >
                                                <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Ya">Ya</SelectItem>
                                                    <SelectItem value="Tidak">Tidak</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Riwayat HIV</Label>
                                            <Select
                                                value={formData.riwayat_hiv}
                                                onValueChange={(v) => setFormData({ ...formData, riwayat_hiv: v })}
                                            >
                                                <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Ya">Ya</SelectItem>
                                                    <SelectItem value="Tidak">Tidak</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>Komorbiditas Lain</Label>
                                            <Select
                                                value={formData.komorbiditas}
                                                onValueChange={(v) => setFormData({ ...formData, komorbiditas: v })}
                                            >
                                                <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Ada">Ada</SelectItem>
                                                    <SelectItem value="Tidak Ada">Tidak Ada</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 4: Treatment */}
                        {step === 4 && (
                            <Card className="backdrop-blur bg-white/95 shadow-2xl border-0">
                                <CardHeader>
                                    <CardTitle className="text-2xl">💊 Data Pengobatan</CardTitle>
                                    <CardDescription>Informasi pengobatan pasien</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Kepatuhan Minum Obat</Label>
                                            <Select
                                                value={formData.kepatuhan_minum_obat}
                                                onValueChange={(v) => setFormData({ ...formData, kepatuhan_minum_obat: v })}
                                            >
                                                <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Patuh">Patuh</SelectItem>
                                                    <SelectItem value="Tidak Patuh">Tidak Patuh</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>Efek Samping Obat</Label>
                                            <Select
                                                value={formData.efek_samping_obat}
                                                onValueChange={(v) => setFormData({
                                                    ...formData,
                                                    efek_samping_obat: v,
                                                    // Reset keterangan jika tidak ada keluhan
                                                    keterangan_efek_samping: v === 'Tidak Ada Keluhan' ? '' : formData.keterangan_efek_samping
                                                })}
                                            >
                                                <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Ada Keluhan">Ada Keluhan</SelectItem>
                                                    <SelectItem value="Tidak Ada Keluhan">Tidak Ada Keluhan</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Conditional: Keterangan Efek Samping */}
                                    {formData.efek_samping_obat === 'Ada Keluhan' && (
                                        <div>
                                            <Label>Keterangan Efek Samping</Label>
                                            <Input
                                                type="text"
                                                value={formData.keterangan_efek_samping}
                                                onChange={(e) => setFormData({ ...formData, keterangan_efek_samping: e.target.value })}
                                                placeholder="Contoh: Mual, muntah ringan, nyeri sendi"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Sebutkan keluhan yang dialami, pisahkan dengan koma
                                            </p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Riwayat Pengobatan</Label>
                                            <Select
                                                value={formData.riwayat_pengobatan}
                                                onValueChange={(v) => setFormData({ ...formData, riwayat_pengobatan: v })}
                                            >
                                                <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Kasus Baru">Kasus Baru</SelectItem>
                                                    <SelectItem value="Kasus Lama">Kasus Lama</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>Panduan Pengobatan</Label>
                                            <Select
                                                value={formData.panduan_pengobatan}
                                                onValueChange={(v) => setFormData({ ...formData, panduan_pengobatan: v })}
                                            >
                                                <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Jangka Pendek">Jangka Pendek</SelectItem>
                                                    <SelectItem value="Jangka Panjang">Jangka Panjang</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 5: Confirmation */}
                        {step === 5 && (
                            <Card className="backdrop-blur bg-white/95 shadow-2xl border-0">
                                <CardHeader>
                                    <CardTitle className="text-2xl">✅ Konfirmasi Data</CardTitle>
                                    <CardDescription>Periksa kembali data yang Anda masukkan</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="space-y-2">
                                            <p><strong>Usia:</strong> {formData.ket_usia} tahun ({formData.usia})</p>
                                            <p><strong>Jenis Kelamin:</strong> {formData.jenis_kelamin}</p>
                                            <p><strong>Status Bekerja:</strong> {formData.status_bekerja}</p>
                                            <p><strong>BB/TB:</strong> {formData.bb} kg / {formData.tb} cm</p>
                                            <p><strong>IMT:</strong> {formData.imt} ({formData.status_gizi})</p>
                                            <p><strong>Status Merokok:</strong> {formData.status_merokok}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p><strong>Pemeriksaan Kontak:</strong> {formData.pemeriksaan_kontak}</p>
                                            <p><strong>Riwayat DM:</strong> {formData.riwayat_dm}</p>
                                            <p><strong>Riwayat HIV:</strong> {formData.riwayat_hiv}</p>
                                            <p><strong>Komorbiditas:</strong> {formData.komorbiditas}</p>
                                            <p><strong>Kepatuhan Obat:</strong> {formData.kepatuhan_minum_obat}</p>
                                            <p><strong>Efek Samping:</strong> {formData.efek_samping_obat}</p>
                                            {formData.efek_samping_obat === 'Ada Keluhan' && formData.keterangan_efek_samping && (
                                                <p><strong>Keterangan:</strong> {formData.keterangan_efek_samping}</p>
                                            )}
                                            <p><strong>Riwayat Pengobatan:</strong> {formData.riwayat_pengobatan}</p>
                                            <p><strong>Panduan:</strong> {formData.panduan_pengobatan}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 6: Result */}
                        {step === 6 && result && (
                            <Card className={`backdrop-blur shadow-2xl border-0 ${result.prediction === 'Berhasil'
                                ? 'bg-gradient-to-br from-green-50 to-green-100'
                                : 'bg-gradient-to-br from-red-50 to-red-100'
                                }`}>
                                <CardHeader className="text-center">
                                    <div className="text-6xl mb-4">
                                        {result.prediction === 'Berhasil' ? '✅' : '❌'}
                                    </div>
                                    <CardTitle className="text-3xl">
                                        Prediksi: {result.prediction}
                                    </CardTitle>
                                    <CardDescription className="text-lg">
                                        Tingkat Keyakinan: {result.confidence.toFixed(1)}%
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center mb-6">
                                        <p className="text-gray-600">
                                            Model yang digunakan: <strong>{result.model_used}</strong>
                                        </p>
                                    </div>

                                    <div className="bg-white/50 rounded-lg p-4">
                                        <h4 className="font-semibold mb-3">Probabilitas per Model:</h4>
                                        <div className="space-y-2">
                                            {Object.entries(result.probabilities).map(([model, prob]) => (
                                                <div key={model} className="flex items-center gap-3">
                                                    <span className="w-40 text-sm">{model}</span>
                                                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                                                        <div
                                                            className={`h-3 rounded-full ${prob > 50 ? 'bg-green-500' : 'bg-red-500'
                                                                }`}
                                                            style={{ width: `${prob}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium">{prob.toFixed(1)}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-6">
                            {step > 1 && step <= totalSteps && (
                                <Button
                                    onClick={handlePrev}
                                    variant="outline"
                                    className="border-2 border-gray-300 text-gray-700 hover:bg-gray-100 px-6"
                                >
                                    ← Kembali
                                </Button>
                            )}
                            {step === 1 && <div />}

                            {step < totalSteps && (
                                <Button
                                    onClick={handleNext}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 shadow-lg shadow-blue-500/20"
                                >
                                    Selanjutnya →
                                </Button>
                            )}

                            {step === totalSteps && (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                                >
                                    {loading ? '⏳ Memproses...' : '🔮 Prediksi Sekarang'}
                                </Button>
                            )}

                            {step === 6 && (
                                <Button
                                    onClick={resetForm}
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white mx-auto"
                                >
                                    🔄 Prediksi Baru
                                </Button>
                            )}
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </>
    );
}
