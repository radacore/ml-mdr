import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface Prediction {
    id: number;
    prediction_result: string;
    model_used: string;
    confidence_score: number;
    probabilities: { Berhasil: number; 'Tidak Berhasil': number } | null;
    created_at: string;
    patient_data: Record<string, string>;
}

interface Props {
    prediction: Prediction;
}

export default function Show({ prediction }: Props) {
    const isSuccess = prediction.prediction_result === 'Berhasil';
    const data = prediction.patient_data;

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
        keterangan_efek_samping: 'Keterangan Efek Samping',
        riwayat_pengobatan: 'Riwayat Pengobatan',
        panduan_pengobatan: 'Panduan Pengobatan',
    };

    // Encoding mappings untuk label encoding (simulasi)
    const encodingMappings: Record<string, Record<string, number>> = {
        usia: { 'Usia Produktif': 0, 'Usia Lanjut': 1, 'Produktif': 0, 'Lanjut': 1 },
        jenis_kelamin: { 'Laki-Laki': 0, 'Perempuan': 1, 'Laki-laki': 0, 'L': 0, 'P': 1 },
        status_bekerja: { 'Bekerja': 0, 'Tidak Bekerja': 1, 'Ya': 0, 'Tidak': 1 },
        status_gizi: {
            'Kurus': 0, 'Normal': 1, 'Gemuk': 2, 'Obesitas': 3,
            'Gizi Kurus': 0, 'Gizi Normal': 1, 'Gizi Gemuk': 2, 'Gizi Obesitas': 3,
            'Kurang': 0, 'Lebih': 2, 'Overweight': 2
        },
        status_merokok: {
            'Tidak Pernah': 0, 'Pernah': 1, 'Masih Merokok': 2,
            'Tidak Merokok': 0, 'Merokok': 2, 'Ya': 2, 'Tidak': 0,
            'Bukan Perokok': 0, 'Perokok': 2
        },
        pemeriksaan_kontak: {
            'Tidak Ada Kontak': 0, 'Ada Kontak': 1,
            'Tidak': 0, 'Ya': 1, 'Ada': 1, 'Tidak Ada': 0
        },
        riwayat_dm: { 'Tidak': 0, 'Ya': 1, 'Negatif': 0, 'Positif': 1, 'Ada': 1, 'Tidak Ada': 0 },
        riwayat_hiv: { 'Negatif': 0, 'Positif': 1, 'Tidak': 0, 'Ya': 1, 'Ada': 1, 'Tidak Ada': 0 },
        komorbiditas: { 'Tidak Ada': 0, 'Ada': 1, 'Tidak': 0, 'Ya': 1 },
        kepatuhan_minum_obat: { 'Patuh': 0, 'Tidak Patuh': 1, 'Ya': 0, 'Tidak': 1 },
        efek_samping_obat: { 'Tidak Ada Keluhan': 0, 'Ada Keluhan': 1, 'Tidak': 0, 'Ya': 1, 'Ada': 1, 'Tidak Ada': 0 },
        riwayat_pengobatan: { 'Kasus Baru': 0, 'Kasus Lama': 1, 'Baru': 0, 'Lama': 1 },
        panduan_pengobatan: { 'Jangka Pendek': 0, 'Jangka Panjang': 1, 'Pendek': 0, 'Panjang': 1 },
    };

    // Function to get encoded value
    const getEncodedValue = (key: string, value: string): number | string => {
        if (encodingMappings[key] && encodingMappings[key][value] !== undefined) {
            return encodingMappings[key][value];
        }
        // Untuk nilai numerik, kembalikan sebagai number
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) return numValue;
        return value;
    };

    // Build feature vector for display
    const featureOrder = [
        'usia', 'jenis_kelamin', 'status_bekerja', 'status_gizi', 'status_merokok',
        'pemeriksaan_kontak', 'riwayat_dm', 'riwayat_hiv', 'komorbiditas',
        'kepatuhan_minum_obat', 'efek_samping_obat', 'riwayat_pengobatan', 'panduan_pengobatan'
    ];

    const encodedFeatures = featureOrder.map(key => ({
        name: labelMappings[key] || key,
        original: data[key] || '-',
        encoded: getEncodedValue(key, data[key] || '')
    }));

    return (
        <AppLayout breadcrumbs={[{ label: 'Riwayat', href: '/prediction/history' }, { label: `Detail #${prediction.id}` }]}>
            <Head title={`Detail Prediksi #${prediction.id}`} />

            <div className="space-y-6">
                {/* Hasil Prediksi */}
                <Card className={`border-2 overflow-hidden ${isSuccess ? 'border-green-500' : 'border-red-500'}`}>
                    <CardHeader className={isSuccess ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}>
                        <CardTitle className="text-center text-2xl">
                            {isSuccess ? '✅' : '❌'} {prediction.prediction_result}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-sm text-gray-500">Confidence</p>
                                <p className="text-xl font-bold">{prediction.confidence_score.toFixed(1)}%</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Model</p>
                                <p className="text-xl font-bold">{prediction.model_used}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Tanggal</p>
                                <p className="text-xl font-bold">
                                    {new Date(prediction.created_at).toLocaleDateString('id-ID')}
                                </p>
                            </div>
                        </div>

                        {/* Probabilitas */}
                        {prediction.probabilities && (
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                <h4 className="font-semibold mb-3 text-center">Probabilitas Hasil</h4>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Berhasil</span>
                                            <span className="font-medium">{prediction.probabilities.Berhasil?.toFixed(1) ?? 0}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className="h-3 rounded-full bg-green-500"
                                                style={{ width: `${prediction.probabilities.Berhasil ?? 0}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Tidak Berhasil</span>
                                            <span className="font-medium">{prediction.probabilities['Tidak Berhasil']?.toFixed(1) ?? 0}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className="h-3 rounded-full bg-red-500"
                                                style={{ width: `${prediction.probabilities['Tidak Berhasil'] ?? 0}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Data Pasien */}
                <Card>
                    <CardHeader>
                        <CardTitle>Data Pasien</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            {Object.entries(prediction.patient_data).map(([key, value]) => {
                                if (key === 'model_name') return null;
                                return (
                                    <div key={key} className="flex justify-between border-b pb-2 items-center">
                                        <span className="text-sm font-medium text-gray-500">
                                            {labelMappings[key] || key}
                                        </span>
                                        <span className="text-sm font-semibold">
                                            {value || '-'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Perhitungan Manual */}
                <Card>
                    <CardHeader>
                        <CardTitle>📐 Perhitungan Manual</CardTitle>
                        <CardDescription>
                            Penjelasan langkah demi langkah bagaimana prediksi dihitung menggunakan data pasien
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">

                        {/* Step 1: Preprocessing - Label Encoding */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
                                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                                Preprocessing: Label Encoding
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Data kategorikal dikonversi menjadi nilai numerik menggunakan Label Encoding.
                                Setiap kategori unik diberi nilai integer.
                            </p>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100 dark:bg-gray-800">
                                            <th className="border p-2 text-left">Fitur</th>
                                            <th className="border p-2 text-left">Nilai Asli</th>
                                            <th className="border p-2 text-center">→</th>
                                            <th className="border p-2 text-left">Nilai Encoded</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {encodedFeatures.map((feature, idx) => (
                                            <tr key={idx} className={idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                                                <td className="border p-2 font-medium">{feature.name}</td>
                                                <td className="border p-2 text-blue-600 dark:text-blue-400">{feature.original}</td>
                                                <td className="border p-2 text-center">→</td>
                                                <td className="border p-2 font-mono font-bold text-green-600 dark:text-green-400">
                                                    <InlineMath math={`x_{${idx + 1}} = ${feature.encoded}`} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Step 2: Feature Vector */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
                                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                                Pembentukan Feature Vector
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Nilai-nilai yang sudah di-encode digabungkan menjadi vektor fitur:
                            </p>
                            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                                <BlockMath math={`\\mathbf{X} = \\begin{bmatrix} ${encodedFeatures.map(f => f.encoded).join(' & ')} \\end{bmatrix}`} />
                            </div>
                        </div>

                        {/* Step 3: Model-specific calculations */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
                                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
                                Perhitungan Model: {prediction.model_used}
                            </h4>

                            {prediction.model_used === 'Logistic Regression' && (
                                <div className="space-y-4">
                                    <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                                        <p className="text-sm text-purple-800 dark:text-purple-200 mb-3">
                                            <strong>Logistic Regression</strong> menggunakan fungsi sigmoid untuk mengubah
                                            kombinasi linear fitur menjadi probabilitas.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <p className="font-medium">a) Hitung nilai linear z:</p>
                                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                                            <BlockMath math="z = \beta_0 + \beta_1 x_1 + \beta_2 x_2 + \cdots + \beta_n x_n" />
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            Dimana <InlineMath math="\beta_0" /> adalah intercept dan <InlineMath math="\beta_i" /> adalah koefisien untuk fitur ke-i.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <p className="font-medium">b) Terapkan fungsi sigmoid:</p>
                                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                                            <BlockMath math="P(Y=1|X) = \sigma(z) = \frac{1}{1 + e^{-z}}" />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <p className="font-medium">c) Keputusan klasifikasi:</p>
                                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                                            <BlockMath math="\hat{y} = \begin{cases} \text{Berhasil} & \text{jika } P(Y=1|X) \geq 0.5 \\ \text{Tidak Berhasil} & \text{jika } P(Y=1|X) < 0.5 \end{cases}" />
                                        </div>
                                    </div>

                                    {prediction.probabilities && (
                                        <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                                            <p className="font-medium text-green-800 dark:text-green-200 mb-2">Hasil Perhitungan:</p>
                                            <BlockMath math={`P(\\text{Berhasil}) = ${(prediction.probabilities.Berhasil / 100).toFixed(4)} = ${prediction.probabilities.Berhasil.toFixed(1)}\\%`} />
                                            <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                                                Karena <InlineMath math={`${(prediction.probabilities.Berhasil / 100).toFixed(4)} ${prediction.probabilities.Berhasil >= 50 ? '\\geq' : '<'} 0.5`} />,
                                                maka prediksi = <strong>{prediction.prediction_result}</strong>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {prediction.model_used === 'Decision Tree' && (
                                <div className="space-y-4">
                                    <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                                        <p className="text-sm text-purple-800 dark:text-purple-200 mb-3">
                                            <strong>Decision Tree</strong> membuat keputusan berdasarkan serangkaian
                                            pertanyaan if-then pada fitur data.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <p className="font-medium">a) Perhitungan Entropy (ketidakmurnian data):</p>
                                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                                            <BlockMath math="Entropy(S) = -\sum_{i=1}^{c} p_i \log_2(p_i)" />
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            Dimana <InlineMath math="p_i" /> adalah proporsi kelas ke-i dalam dataset S.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <p className="font-medium">b) Information Gain untuk pemilihan split:</p>
                                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                                            <BlockMath math="Gain(S, A) = Entropy(S) - \sum_{v \in Values(A)} \frac{|S_v|}{|S|} Entropy(S_v)" />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <p className="font-medium">c) Proses Klasifikasi:</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Data pasien mengikuti percabangan pohon dari root node hingga leaf node:
                                        </p>
                                        <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg text-sm">
                                            <pre className="whitespace-pre-wrap">
                                                {`IF Kepatuhan Minum Obat = "${data.kepatuhan_minum_obat}"
   AND Efek Samping = "${data.efek_samping_obat}"
   AND Riwayat Pengobatan = "${data.riwayat_pengobatan}"
   ...
THEN Prediksi = ${prediction.prediction_result}`}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {prediction.model_used === 'K-Nearest Neighbor' && (
                                <div className="space-y-4">
                                    <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                                        <p className="text-sm text-purple-800 dark:text-purple-200 mb-3">
                                            <strong>K-Nearest Neighbor (KNN)</strong> mengklasifikasikan data berdasarkan
                                            kelas mayoritas dari K tetangga terdekat.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <p className="font-medium">a) Hitung jarak Euclidean ke setiap data training:</p>
                                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                                            <BlockMath math="d(p, q) = \sqrt{\sum_{i=1}^{n} (p_i - q_i)^2}" />
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            Dimana p adalah data baru dan q adalah data training.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <p className="font-medium">b) Contoh perhitungan untuk data pasien ini:</p>
                                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                                            <BlockMath math={`d = \\sqrt{(${encodedFeatures[0].encoded} - q_1)^2 + (${encodedFeatures[1].encoded} - q_2)^2 + \\cdots}`} />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <p className="font-medium">c) Voting Mayoritas dari K tetangga terdekat:</p>
                                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                                            <BlockMath math="\hat{y} = \text{mode}(y_1, y_2, \ldots, y_K)" />
                                        </div>
                                    </div>

                                    {prediction.probabilities && (
                                        <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                                            <p className="font-medium text-green-800 dark:text-green-200 mb-2">Hasil Voting:</p>
                                            <p className="text-sm text-green-700 dark:text-green-300">
                                                Dari K tetangga terdekat, {prediction.probabilities.Berhasil.toFixed(1)}% memprediksi "Berhasil"
                                                dan {prediction.probabilities['Tidak Berhasil'].toFixed(1)}% memprediksi "Tidak Berhasil".
                                            </p>
                                            <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                                                Mayoritas = <strong>{prediction.prediction_result}</strong>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {prediction.model_used === 'Support Vector Machine' && (
                                <div className="space-y-4">
                                    <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                                        <p className="text-sm text-purple-800 dark:text-purple-200 mb-3">
                                            <strong>Support Vector Machine (SVM)</strong> mencari hyperplane optimal
                                            yang memisahkan dua kelas dengan margin maksimal.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <p className="font-medium">a) Fungsi keputusan hyperplane:</p>
                                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                                            <BlockMath math="f(x) = \mathbf{w} \cdot \mathbf{x} + b" />
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            Dimana <InlineMath math="\mathbf{w}" /> adalah vektor bobot dan b adalah bias.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <p className="font-medium">b) Kernel RBF (Radial Basis Function):</p>
                                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                                            <BlockMath math="K(x_i, x_j) = \exp(-\gamma \|x_i - x_j\|^2)" />
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            Kernel RBF mentransformasi data ke dimensi lebih tinggi.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <p className="font-medium">c) Fungsi keputusan dengan kernel:</p>
                                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                                            <BlockMath math="\hat{y} = \text{sign}\left(\sum_{i=1}^{n} \alpha_i y_i K(x_i, x) + b\right)" />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <p className="font-medium">d) Keputusan klasifikasi:</p>
                                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                                            <BlockMath math="\hat{y} = \begin{cases} \text{Berhasil} & \text{jika } f(x) > 0 \\ \text{Tidak Berhasil} & \text{jika } f(x) < 0 \end{cases}" />
                                        </div>
                                    </div>

                                    {prediction.probabilities && (
                                        <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                                            <p className="font-medium text-green-800 dark:text-green-200 mb-2">Hasil Perhitungan:</p>
                                            <p className="text-sm text-green-700 dark:text-green-300">
                                                Probabilitas didapat dari Platt Scaling pada output SVM.
                                            </p>
                                            <BlockMath math={`P(\\text{Berhasil}) = ${prediction.probabilities.Berhasil.toFixed(1)}\\%`} />
                                            <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                                                Prediksi = <strong>{prediction.prediction_result}</strong>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Step 4: Metrik Evaluasi */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
                                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">4</span>
                                Metrik Evaluasi Model
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Model dievaluasi menggunakan metrik berikut pada data testing (20%):
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                    <p className="font-medium mb-2">Accuracy</p>
                                    <BlockMath math="\text{Accuracy} = \frac{TP + TN}{TP + TN + FP + FN}" />
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                    <p className="font-medium mb-2">Precision</p>
                                    <BlockMath math="\text{Precision} = \frac{TP}{TP + FP}" />
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                    <p className="font-medium mb-2">Recall</p>
                                    <BlockMath math="\text{Recall} = \frac{TP}{TP + FN}" />
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                    <p className="font-medium mb-2">F1-Score</p>
                                    <BlockMath math="\text{F1} = 2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}" />
                                </div>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg text-sm">
                                <p className="text-blue-800 dark:text-blue-200">
                                    <strong>Keterangan:</strong><br />
                                    TP = True Positive (prediksi benar untuk kelas positif)<br />
                                    TN = True Negative (prediksi benar untuk kelas negatif)<br />
                                    FP = False Positive (prediksi salah, seharusnya negatif)<br />
                                    FN = False Negative (prediksi salah, seharusnya positif)
                                </p>
                            </div>
                        </div>

                        {/* Step 5: K-Fold Cross Validation */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
                                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">5</span>
                                K-Fold Cross Validation (K=5)
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Data training (80%) dibagi menjadi 5 fold. Model dilatih 5 kali dengan rotasi fold validasi.
                            </p>

                            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                                <BlockMath math="\text{CV Score} = \frac{1}{K} \sum_{k=1}^{K} \text{Score}_k = \frac{\text{Score}_1 + \text{Score}_2 + \text{Score}_3 + \text{Score}_4 + \text{Score}_5}{5}" />
                            </div>

                            <p className="text-xs text-gray-500">
                                Model <strong>{prediction.model_used}</strong> dipilih karena memiliki rata-rata F1-Score tertinggi dari cross validation.
                            </p>
                        </div>

                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-4 justify-center">
                    <Button asChild>
                        <Link href={route('prediction.index')}>Prediksi Baru</Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href={route('prediction.history')}>Kembali ke Riwayat</Link>
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
