import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FormEventHandler } from 'react';
import { User, Activity, HeartPulse, Pill, Settings } from 'lucide-react';

interface Props {
    features: any;
    mlServiceStatus: 'connected' | 'disconnected';
}

export default function Index({ features, mlServiceStatus }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        usia: 'Usia Produktif',
        ket_usia: '',
        jenis_kelamin: 'Laki-Laki',
        status_bekerja: 'Tidak Bekerja',
        bb: '',
        tb: '',
        imt: '',
        status_gizi: 'Gizi Normal',
        status_merokok: 'Tidak Merokok',
        pemeriksaan_kontak: 'Tidak',
        riwayat_dm: 'Tidak',
        riwayat_hiv: 'Tidak',
        komorbiditas: 'Tidak Ada',
        kepatuhan_minum_obat: 'Patuh',
        efek_samping_obat: 'Tidak Ada Keluhan',
        keterangan_efek_samping: '',
        riwayat_pengobatan: 'Kasus Baru',
        panduan_pengobatan: 'Jangka Pendek',
        model_name: 'auto',
    });

    // Auto-calculate IMT when BB and TB change
    const calculateIMT = (bb: string, tb: string) => {
        if (bb && tb) {
            const bbNum = parseFloat(bb);
            const tbNum = parseFloat(tb) / 100; // convert cm to m
            const imt = bbNum / (tbNum * tbNum);
            setData('imt', imt.toFixed(1));
        }
    };

    // Auto-select kategori usia berdasarkan usia
    const handleUsiaChange = (value: string) => {
        setData('ket_usia', value);
        const age = parseInt(value);
        if (!isNaN(age)) {
            // Usia Lanjut: >= 60 tahun, Usia Produktif: < 60 tahun
            const kategori = age >= 60 ? 'Usia Lanjut' : 'Usia Produktif';
            setData('usia', kategori);
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('prediction.predict'));
    };

    return (
        <AppLayout breadcrumbs={[{ label: 'Prediksi' }]}>
            <Head title="Prediksi MDR-TB" />

            <div className="space-y-6">
                {mlServiceStatus === 'disconnected' && (
                    <Alert variant="destructive">
                        <AlertDescription>
                            ⚠️ ML Service tidak tersedia. Pastikan service Python berjalan di port 5000.
                        </AlertDescription>
                    </Alert>
                )}

                {Object.keys(errors).length > 0 && (
                    <Alert variant="destructive">
                        <AlertDescription>
                            {Object.values(errors).map((error, i) => (
                                <p key={i}>{error}</p>
                            ))}
                        </AlertDescription>
                    </Alert>
                )}

                <form onSubmit={submit} className="space-y-6">
                    {/* Section 1: Data Demografis */}
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">Data Demografis</CardTitle>
                            </div>
                            <CardDescription>
                                Informasi dasar tentang pasien
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="ket_usia">Usia (tahun) <span className="text-destructive">*</span></Label>
                                <Input
                                    id="ket_usia"
                                    type="number"
                                    value={data.ket_usia}
                                    onChange={(e) => handleUsiaChange(e.target.value)}
                                    placeholder="Contoh: 45"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="usia">Kategori Usia <span className="text-muted-foreground text-xs">(otomatis)</span></Label>
                                <Select value={data.usia} onValueChange={(v) => setData('usia', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Usia Produktif">Usia Produktif (&lt;60 thn)</SelectItem>
                                        <SelectItem value="Usia Lanjut">Usia Lanjut (≥60 thn)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="jenis_kelamin">Jenis Kelamin <span className="text-destructive">*</span></Label>
                                <Select value={data.jenis_kelamin} onValueChange={(v) => setData('jenis_kelamin', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Laki-Laki">Laki-Laki</SelectItem>
                                        <SelectItem value="Perempuan">Perempuan</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status_bekerja">Status Bekerja <span className="text-destructive">*</span></Label>
                                <Select value={data.status_bekerja} onValueChange={(v) => setData('status_bekerja', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Bekerja">Bekerja</SelectItem>
                                        <SelectItem value="Tidak Bekerja">Tidak Bekerja</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 2: Data Antropometri */}
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">Data Antropometri</CardTitle>
                            </div>
                            <CardDescription>
                                Data fisik dan status gizi pasien
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="bb">Berat Badan (kg) <span className="text-destructive">*</span></Label>
                                <Input
                                    id="bb"
                                    type="number"
                                    step="0.1"
                                    value={data.bb}
                                    onChange={(e) => {
                                        setData('bb', e.target.value);
                                        setTimeout(() => calculateIMT(e.target.value, data.tb), 100);
                                    }}
                                    placeholder="Contoh: 50"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tb">Tinggi Badan (cm) <span className="text-destructive">*</span></Label>
                                <Input
                                    id="tb"
                                    type="number"
                                    step="0.1"
                                    value={data.tb}
                                    onChange={(e) => {
                                        setData('tb', e.target.value);
                                        setTimeout(() => calculateIMT(data.bb, e.target.value), 100);
                                    }}
                                    placeholder="Contoh: 160"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="imt">IMT <span className="text-muted-foreground text-xs">(otomatis)</span></Label>
                                <Input
                                    id="imt"
                                    type="number"
                                    step="0.1"
                                    value={data.imt}
                                    onChange={(e) => setData('imt', e.target.value)}
                                    placeholder="Dihitung otomatis"
                                    readOnly
                                    className="bg-muted"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status_gizi">Status Gizi <span className="text-destructive">*</span></Label>
                                <Select value={data.status_gizi} onValueChange={(v) => setData('status_gizi', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Gizi Kurang">Gizi Kurang</SelectItem>
                                        <SelectItem value="Gizi Normal">Gizi Normal</SelectItem>
                                        <SelectItem value="Gizi Lebih">Gizi Lebih</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 3: Riwayat Kesehatan */}
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-2">
                                <HeartPulse className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">Riwayat Kesehatan</CardTitle>
                            </div>
                            <CardDescription>
                                Riwayat penyakit dan gaya hidup pasien
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="status_merokok">Status Merokok</Label>
                                <Select value={data.status_merokok} onValueChange={(v) => setData('status_merokok', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Merokok">Merokok</SelectItem>
                                        <SelectItem value="Tidak Merokok">Tidak Merokok</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="pemeriksaan_kontak">Pemeriksaan Kontak</Label>
                                <Select value={data.pemeriksaan_kontak} onValueChange={(v) => setData('pemeriksaan_kontak', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Ya">Ya</SelectItem>
                                        <SelectItem value="Tidak">Tidak</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="riwayat_dm">Riwayat Diabetes Mellitus</Label>
                                <Select value={data.riwayat_dm} onValueChange={(v) => setData('riwayat_dm', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Ada">Ada</SelectItem>
                                        <SelectItem value="Tidak">Tidak</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="riwayat_hiv">Riwayat HIV</Label>
                                <Select value={data.riwayat_hiv} onValueChange={(v) => setData('riwayat_hiv', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Ada">Ada</SelectItem>
                                        <SelectItem value="Tidak">Tidak</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="komorbiditas">Komorbiditas Lainnya</Label>
                                <Select value={data.komorbiditas} onValueChange={(v) => setData('komorbiditas', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Ada">Ada</SelectItem>
                                        <SelectItem value="Tidak Ada">Tidak Ada</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 4: Data Pengobatan */}
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-2">
                                <Pill className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">Data Pengobatan</CardTitle>
                            </div>
                            <CardDescription>
                                Informasi terkait pengobatan MDR-TB
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="kepatuhan_minum_obat">Kepatuhan Minum Obat</Label>
                                <Select value={data.kepatuhan_minum_obat} onValueChange={(v) => setData('kepatuhan_minum_obat', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Patuh">Patuh</SelectItem>
                                        <SelectItem value="Tidak Patuh">Tidak Patuh</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="efek_samping_obat">Efek Samping Obat</Label>
                                <Select
                                    value={data.efek_samping_obat}
                                    onValueChange={(v) => {
                                        setData('efek_samping_obat', v);
                                        // Reset keterangan jika tidak ada keluhan
                                        if (v === 'Tidak Ada Keluhan') {
                                            setData('keterangan_efek_samping', '');
                                        }
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Ada Keluhan">Ada Keluhan</SelectItem>
                                        <SelectItem value="Tidak Ada Keluhan">Tidak Ada Keluhan</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Conditional: Keterangan Efek Samping */}
                            {data.efek_samping_obat === 'Ada Keluhan' && (
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="keterangan_efek_samping">
                                        Keterangan Efek Samping
                                    </Label>
                                    <Input
                                        id="keterangan_efek_samping"
                                        type="text"
                                        value={data.keterangan_efek_samping}
                                        onChange={(e) => setData('keterangan_efek_samping', e.target.value)}
                                        placeholder="Contoh: Mual, muntah ringan, nyeri sendi"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Sebutkan keluhan yang dialami, pisahkan dengan koma jika lebih dari satu
                                    </p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="riwayat_pengobatan">Riwayat Pengobatan Sebelumnya</Label>
                                <Select value={data.riwayat_pengobatan} onValueChange={(v) => setData('riwayat_pengobatan', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Kasus Baru">Kasus Baru</SelectItem>
                                        <SelectItem value="Kasus Lama">Kasus Lama</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="panduan_pengobatan">Panduan Pengobatan</Label>
                                <Select value={data.panduan_pengobatan} onValueChange={(v) => setData('panduan_pengobatan', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Jangka Pendek">Jangka Pendek</SelectItem>
                                        <SelectItem value="Jangka Panjang">Jangka Panjang</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 5: Pengaturan Model */}
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-2">
                                <Settings className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">Pengaturan Model</CardTitle>
                            </div>
                            <CardDescription>
                                Pilih model machine learning yang akan digunakan
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 max-w-md">
                                <Label htmlFor="model_name">Model Machine Learning</Label>
                                <Select value={data.model_name} onValueChange={(v) => setData('model_name', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Gunakan model terbaik" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="auto">Model Terbaik (Auto)</SelectItem>
                                        <SelectItem value="Logistic Regression">Logistic Regression</SelectItem>
                                        <SelectItem value="Decision Tree">Decision Tree</SelectItem>
                                        <SelectItem value="K-Nearest Neighbor">K-Nearest Neighbor</SelectItem>
                                        <SelectItem value="Support Vector Machine">Support Vector Machine</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Buttons */}
                    <div className="flex gap-4">
                        <Button type="submit" disabled={processing} className="flex-1" size="lg">
                            {processing ? 'Memproses...' : '🔮 Prediksi Sekarang'}
                        </Button>
                        <Button type="button" variant="outline" asChild size="lg">
                            <Link href={route('prediction.history')}>📋 Lihat Riwayat</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
