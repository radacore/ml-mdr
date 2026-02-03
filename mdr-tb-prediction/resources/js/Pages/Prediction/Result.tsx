import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PredictionResult {
    prediction: string;
    prediction_code: number;
    confidence: number;
    model_used: string;
    probabilities: {
        Berhasil: number;
        'Tidak Berhasil': number;
    };
}

interface Prediction {
    id: number;
    prediction_result: string;
    model_used: string;
    confidence_score: number;
    created_at: string;
}

interface Props {
    prediction: Prediction;
    result: PredictionResult;
    input: Record<string, string>;
}

export default function Result({ prediction, result, input }: Props) {
    const isSuccess = result.prediction === 'Berhasil';

    // Label mappings for display
    const labelMappings: Record<string, string> = {
        usia: 'Kategori Usia',
        ket_usia: 'Usia (tahun)',
        jenis_kelamin: 'Jenis Kelamin',
        status_bekerja: 'Status Bekerja',
        bb: 'Berat Badan (kg)',
        tb: 'Tinggi Badan (cm)',
        imt: 'IMT',
        status_gizi: 'Status Gizi',
        status_merokok: 'Status Merokok',
        pemeriksaan_kontak: 'Pemeriksaan Kontak',
        riwayat_dm: 'Riwayat DM',
        riwayat_hiv: 'Riwayat HIV',
        komorbiditas: 'Komorbiditas',
        kepatuhan_minum_obat: 'Kepatuhan Minum Obat',
        efek_samping_obat: 'Efek Samping Obat',
        riwayat_pengobatan: 'Riwayat Pengobatan',
        panduan_pengobatan: 'Panduan Pengobatan',
    };

    return (
        <AppLayout breadcrumbs={[{ label: 'Prediksi', href: '/prediction' }, { label: 'Hasil' }]}>
            <Head title="Hasil Prediksi" />

            <div className="space-y-6">
                {/* Hasil Prediksi */}
                <Card className={isSuccess ? 'border-green-500 border-2' : 'border-red-500 border-2'}>
                    <CardHeader className={isSuccess ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}>
                        <CardTitle className="text-center text-2xl">
                            {isSuccess ? '✅' : '❌'} {result.prediction}
                        </CardTitle>
                        <CardDescription className="text-center text-lg">
                            Tingkat Kepercayaan: <span className="font-bold">{result.confidence.toFixed(1)}%</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Probabilitas Berhasil</p>
                                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                                    {result.probabilities.Berhasil.toFixed(1)}%
                                </p>
                            </div>
                            <div className="p-4 bg-red-100 dark:bg-red-900 rounded-lg">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Probabilitas Tidak Berhasil</p>
                                <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                                    {result.probabilities['Tidak Berhasil'].toFixed(1)}%
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 text-center">
                            <p className="text-sm text-gray-500">
                                Model yang digunakan: <span className="font-semibold">{result.model_used}</span>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Data Input */}
                <Card>
                    <CardHeader>
                        <CardTitle>Data Pasien yang Diinput</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Parameter</TableHead>
                                    <TableHead>Nilai</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Object.entries(input).map(([key, value]) => {
                                    if (key === 'model_name') return null;
                                    return (
                                        <TableRow key={key}>
                                            <TableCell className="font-medium">
                                                {labelMappings[key] || key}
                                            </TableCell>
                                            <TableCell>{value}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-4 justify-center">
                    <Button asChild>
                        <Link href={route('prediction.index')}>Prediksi Baru</Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href={route('prediction.history')}>Lihat Riwayat</Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href={route('prediction.statistics')}>Lihat Statistik Model</Link>
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
