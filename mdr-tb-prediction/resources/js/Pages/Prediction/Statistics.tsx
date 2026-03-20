import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/ShadcnComponents/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ShadcnComponents/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ShadcnComponents/ui/table';
import { Alert, AlertDescription } from '@/ShadcnComponents/ui/alert';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface ModelMetrics {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
}

interface ConfusionMatrix {
    true_positive: number;
    true_negative: number;
    false_positive: number;
    false_negative: number;
}

interface EvaluationResult {
    metrics: ModelMetrics;
    confusion_matrix: ConfusionMatrix;
    confusion_matrix_array: number[][];
}

interface CVResult {
    accuracy: { mean: number; std: number };
    precision: { mean: number; std: number };
    recall: { mean: number; std: number };
    f1: { mean: number; std: number };
}

interface ComparisonEntry {
    accuracy: { train: number; test: number };
    sensitivity: { train: number; test: number };
    specificity: { train: number; test: number };
    auc_roc: { train: number; test: number };
}

interface BestParamsEntry {
    params: Record<string, any>;
    best_cv_score: number;
}

interface Statistics {
    evaluation_results: Record<string, EvaluationResult>;
    best_model: string;
    cv_results: Record<string, CVResult>;
    comparison_table: Record<string, ComparisonEntry> | null;
    best_params: Record<string, BestParamsEntry> | null;
}

interface Props {
    statistics: Statistics | null;
    error: string | null;
}

export default function Statistics({ statistics, error }: Props) {
    if (error || !statistics) {
        return (
            <AppLayout breadcrumbs={[{ label: 'Statistik' }]}>
                <Head title="Statistik Model" />
                <div className="space-y-6">
                    <Alert variant="destructive">
                        <AlertDescription>
                            {error || 'Tidak dapat memuat statistik. Pastikan ML Service berjalan.'}
                        </AlertDescription>
                    </Alert>
                    <div className="mt-4 text-center">
                        <Button asChild>
                            <Link href={route('prediction.index')}>Kembali ke Prediksi</Link>
                        </Button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const modelNames = Object.keys(statistics.evaluation_results);

    // Dynamic model analysis data
    const modelDescriptions: Record<string, { strengths: string[]; why: string }> = {
        'Logistic Regression': {
            strengths: [
                'Efektif untuk klasifikasi biner seperti prediksi MDR-TB (Berhasil/Tidak Berhasil)',
                'Regularisasi (parameter C) mencegah overfitting, sangat penting untuk dataset berukuran kecil',
                'Memberikan output probabilitas yang terukur dan dapat diinterpretasi secara klinis',
                'Robust terhadap fitur kategorikal biner yang mendominasi dataset ini',
            ],
            why: 'Logistic Regression unggul karena kemampuannya menangani klasifikasi biner dengan regularisasi yang mencegah overfitting pada dataset kecil. Model ini memberikan probabilitas yang akurat dan mudah diinterpretasi secara klinis.'
        },
        'Decision Tree': {
            strengths: [
                'Mudah diinterpretasi karena menghasilkan aturan keputusan yang jelas (if-then)',
                'Tidak membutuhkan normalisasi data dan dapat menangani fitur kategorikal secara langsung',
                'Mampu menangkap hubungan non-linier antar fitur',
                'Pembatasan kedalaman (max_depth) mencegah overfitting',
            ],
            why: 'Decision Tree unggul karena kemampuannya menangkap pola keputusan yang kompleks dalam data klinis. Aturan keputusan yang dihasilkan mudah dipahami oleh tenaga medis.'
        },
        'Support Vector Machine': {
            strengths: [
                'Efektif pada ruang fitur berdimensi tinggi dengan jumlah sampel terbatas',
                'Margin-based classification memberikan generalisasi yang baik pada data baru',
                'Kernel trick memungkinkan pemisahan data non-linier',
                'Parameter regularisasi (C) mengontrol trade-off antara margin dan error',
            ],
            why: 'Support Vector Machine unggul karena kemampuannya menemukan hyperplane optimal yang memaksimalkan margin pemisahan antar kelas, menghasilkan generalisasi yang baik pada data baru.'
        },
    };

    // Parameter explanations
    const paramExplanations: Record<string, string> = {
        'C': 'Kekuatan regularisasi (nilai kecil = regularisasi kuat, mencegah overfitting)',
        'penalty': 'Tipe regularisasi (L1 = Lasso, L2 = Ridge)',
        'solver': 'Algoritma optimasi untuk mencari koefisien terbaik',
        'max_depth': 'Kedalaman maksimum pohon (membatasi kompleksitas model)',
        'min_samples_split': 'Minimal sampel untuk membagi sebuah node',
        'min_samples_leaf': 'Minimal sampel di setiap daun/leaf node',
        'criterion': 'Metode pengukuran kualitas split (gini = Gini Impurity, entropy = Information Gain)',
        'kernel': 'Fungsi kernel (linear = hyperplane lurus, rbf = non-linier)',
        'gamma': 'Parameter kernel yang mengontrol jangkauan pengaruh tiap sampel',
    };

    return (
        <AppLayout breadcrumbs={[{ label: 'Statistik' }]}>
            <Head title="Statistik Model" />

            <div className="space-y-6">
                {/* Best Model Info - Only show if there's more than 1 model */}
                {modelNames.length > 1 && (
                    <Card className="border-2 border-purple-500 overflow-hidden">
                        <CardHeader className="bg-purple-50 dark:bg-purple-950">
                            <CardTitle className="text-center">🏆 Model Terbaik: {statistics.best_model}</CardTitle>
                            <CardDescription className="text-center">
                                Dipilih berdasarkan skor F1 tertinggi dari K-Fold Cross Validation
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}

                {/* Analisis Model Terbaik - Dynamic */}
                {statistics.best_model && statistics.cv_results && (
                    <Card>
                        <CardHeader>
                            <CardTitle>📊 Analisis Pemilihan Model Terbaik</CardTitle>
                            <CardDescription>
                                Alasan ilmiah mengapa <strong>{statistics.best_model}</strong> dipilih sebagai model terbaik
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* CV Score Comparison */}
                            <div>
                                <p className="font-medium mb-2">Perbandingan Skor F1 Cross Validation:</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {Object.entries(statistics.cv_results).map(([name, cv]) => {
                                        const isBest = name === statistics.best_model;
                                        return (
                                            <div
                                                key={name}
                                                className={`p-3 rounded-lg border-2 ${isBest
                                                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950'
                                                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                                                    }`}
                                            >
                                                <p className={`text-sm font-medium ${isBest ? 'text-purple-700 dark:text-purple-300' : ''}`}>
                                                    {isBest && '🏆 '}{name}
                                                </p>
                                                <p className={`text-2xl font-bold ${isBest ? 'text-purple-600 dark:text-purple-400' : ''}`}>
                                                    {(cv.f1.mean * 100).toFixed(2)}%
                                                </p>
                                                <p className="text-xs text-muted-foreground">F1-Score (±{(cv.f1.std * 100).toFixed(2)}%)</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Scientific Explanation */}
                            {modelDescriptions[statistics.best_model] && (
                                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                                    <p className="font-medium text-green-800 dark:text-green-200 mb-2">Mengapa {statistics.best_model}?</p>
                                    <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                                        {modelDescriptions[statistics.best_model].why}
                                    </p>
                                    <p className="font-medium text-green-800 dark:text-green-200 mb-2">Keunggulan {statistics.best_model}:</p>
                                    <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                                        {modelDescriptions[statistics.best_model].strengths.map((s, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <span className="text-green-500 mt-0.5">✓</span>
                                                <span>{s}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Best params summary */}
                            {statistics.best_params?.[statistics.best_model] && (
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                    <p className="font-medium mb-2">Konfigurasi Optimal (dari Hyperparameter Tuning):</p>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(statistics.best_params[statistics.best_model].params).map(([param, value]) => (
                                            <span key={param} className="inline-flex items-center rounded-md bg-purple-100 dark:bg-purple-900 px-3 py-1 text-sm font-mono text-purple-700 dark:text-purple-300">
                                                {param}={String(value)}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Best CV F1-Score: <strong>{(statistics.best_params[statistics.best_model].best_cv_score * 100).toFixed(2)}%</strong>
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Tabel Perbandingan Validasi Internal Training vs Testing */}
                {statistics.comparison_table && Object.keys(statistics.comparison_table).length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Tabel Hasil Validasi Internal Kinerja Model Pembelajaran Mesin</CardTitle>
                            <CardDescription>Perbandingan metrik pada data training (Tr) dan data testing (Ts)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead rowSpan={2} className="border font-bold align-middle">Model</TableHead>
                                            <TableHead colSpan={2} className="text-center border font-bold">Akurasi (%)</TableHead>
                                            <TableHead colSpan={2} className="text-center border font-bold">Sensitivitas (%)</TableHead>
                                            <TableHead colSpan={2} className="text-center border font-bold">Spesifisitas (%)</TableHead>
                                            <TableHead colSpan={2} className="text-center border font-bold">AUC-ROC (%)</TableHead>
                                        </TableRow>
                                        <TableRow>
                                            <TableHead className="text-center border text-xs">Tr</TableHead>
                                            <TableHead className="text-center border text-xs">Ts</TableHead>
                                            <TableHead className="text-center border text-xs">Tr</TableHead>
                                            <TableHead className="text-center border text-xs">Ts</TableHead>
                                            <TableHead className="text-center border text-xs">Tr</TableHead>
                                            <TableHead className="text-center border text-xs">Ts</TableHead>
                                            <TableHead className="text-center border text-xs">Tr</TableHead>
                                            <TableHead className="text-center border text-xs">Ts</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {Object.entries(statistics.comparison_table).map(([name, data]) => {
                                            const isBest = modelNames.length > 1 && name === statistics.best_model;
                                            return (
                                                <TableRow key={name} className={isBest ? 'bg-purple-50 dark:bg-purple-950 font-semibold' : ''}>
                                                    <TableCell className="border font-medium italic">
                                                        {isBest && '🏆 '}{name}
                                                    </TableCell>
                                                    <TableCell className="text-center border">{data.accuracy.train.toFixed(2)}</TableCell>
                                                    <TableCell className="text-center border">{data.accuracy.test.toFixed(2)}</TableCell>
                                                    <TableCell className="text-center border">{data.sensitivity.train.toFixed(2)}</TableCell>
                                                    <TableCell className="text-center border">{data.sensitivity.test.toFixed(2)}</TableCell>
                                                    <TableCell className="text-center border">{data.specificity.train.toFixed(2)}</TableCell>
                                                    <TableCell className="text-center border">{data.specificity.test.toFixed(2)}</TableCell>
                                                    <TableCell className="text-center border">{data.auc_roc.train.toFixed(2)}</TableCell>
                                                    <TableCell className="text-center border">{data.auc_roc.test.toFixed(2)}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                            <p className="text-xs text-muted-foreground mt-3">
                                Keterangan: <strong>Tr</strong> = Data Training; <strong>Ts</strong> = Data Testing
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Tabel Hyperparameter Tuning */}
                {statistics.best_params && Object.keys(statistics.best_params).length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Hasil Hyperparameter Tuning (GridSearchCV)</CardTitle>
                            <CardDescription>Parameter terbaik untuk setiap model yang ditemukan melalui Grid Search dengan 5-Fold Cross Validation</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="border font-bold">Model</TableHead>
                                        <TableHead className="border font-bold">Parameter Terbaik</TableHead>
                                        <TableHead className="text-center border font-bold">Best CV F1-Score</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Object.entries(statistics.best_params).map(([name, info]) => {
                                        const isBest = modelNames.length > 1 && name === statistics.best_model;
                                        return (
                                            <TableRow key={name} className={isBest ? 'bg-purple-50 dark:bg-purple-950' : ''}>
                                                <TableCell className="border font-medium">
                                                    {isBest && '\ud83c\udfc6 '}{name}
                                                </TableCell>
                                                <TableCell className="border">
                                                    <div className="flex flex-wrap gap-1">
                                                        {Object.entries(info.params).map(([param, value]) => (
                                                            <span key={param} className="inline-flex items-center rounded-md bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs font-mono">
                                                                {param}={String(value)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center border font-semibold">
                                                    {(info.best_cv_score * 100).toFixed(2)}%
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                            {/* Parameter Explanations */}
                            <div className="mt-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                <p className="font-medium mb-2 text-sm">Keterangan Parameter:</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                                    {Object.entries(paramExplanations).map(([param, desc]) => (
                                        <p key={param} className="text-xs text-muted-foreground">
                                            <span className="font-mono font-semibold text-foreground">{param}</span> — {desc}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Perbandingan Model - Test Set Metrics */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {modelNames.length > 1 ? 'Perbandingan Performa Model (Test Set)' : 'Performa Model (Test Set)'}
                        </CardTitle>
                        <CardDescription>Metrik evaluasi pada 15% data testing</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Model</TableHead>
                                    <TableHead className="text-center">Accuracy</TableHead>
                                    <TableHead className="text-center">Precision</TableHead>
                                    <TableHead className="text-center">Recall</TableHead>
                                    <TableHead className="text-center">F1-Score</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {modelNames.map((name) => {
                                    const metrics = statistics.evaluation_results[name].metrics;
                                    const isBest = modelNames.length > 1 && name === statistics.best_model;
                                    return (
                                        <TableRow key={name} className={isBest ? 'bg-purple-50 dark:bg-purple-950' : ''}>
                                            <TableCell className="font-medium">
                                                {isBest && '🏆 '}{name}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {(metrics.accuracy * 100).toFixed(2)}%
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {(metrics.precision * 100).toFixed(2)}%
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {(metrics.recall * 100).toFixed(2)}%
                                            </TableCell>
                                            <TableCell className="text-center font-semibold">
                                                {(metrics.f1_score * 100).toFixed(2)}%
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* K-Fold Cross Validation Results */}
                {statistics.cv_results && (
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {modelNames.length > 1 ? 'Hasil K-Fold Cross Validation (K=5)' : 'Performa Cross Validation (K=5)'}
                            </CardTitle>
                            <CardDescription>Rata-rata metrik dari 5-fold cross validation pada 70% data training</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Model</TableHead>
                                        <TableHead className="text-center">Accuracy</TableHead>
                                        <TableHead className="text-center">Precision</TableHead>
                                        <TableHead className="text-center">Recall</TableHead>
                                        <TableHead className="text-center">F1-Score</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Object.entries(statistics.cv_results).map(([name, cv]) => {
                                        const isBest = name === statistics.best_model;
                                        return (
                                            <TableRow key={name} className={isBest ? 'bg-purple-50 dark:bg-purple-950' : ''}>
                                                <TableCell className="font-medium">
                                                    {isBest && '🏆 '}{name}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {(cv.accuracy.mean * 100).toFixed(2)}% ± {(cv.accuracy.std * 100).toFixed(2)}%
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {(cv.precision.mean * 100).toFixed(2)}% ± {(cv.precision.std * 100).toFixed(2)}%
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {(cv.recall.mean * 100).toFixed(2)}% ± {(cv.recall.std * 100).toFixed(2)}%
                                                </TableCell>
                                                <TableCell className="text-center font-semibold">
                                                    {(cv.f1.mean * 100).toFixed(2)}% ± {(cv.f1.std * 100).toFixed(2)}%
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Confusion Matrices */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {modelNames.map((name) => {
                        const cm = statistics.evaluation_results[name].confusion_matrix;
                        const isBest = name === statistics.best_model;
                        return (
                            <Card key={name} className={isBest ? 'border-2 border-purple-500' : ''}>
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        {isBest && '🏆 '}Confusion Matrix: {name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                                        <div></div>
                                        <div className="font-semibold text-green-600">Pred: Berhasil</div>
                                        <div className="font-semibold text-red-600">Pred: Tidak</div>

                                        <div className="font-semibold text-green-600">Actual: Berhasil</div>
                                        <div className="bg-green-100 dark:bg-green-900 p-2 rounded">
                                            TP: {cm.true_positive}
                                        </div>
                                        <div className="bg-red-100 dark:bg-red-900 p-2 rounded">
                                            FN: {cm.false_negative}
                                        </div>

                                        <div className="font-semibold text-red-600">Actual: Tidak</div>
                                        <div className="bg-red-100 dark:bg-red-900 p-2 rounded">
                                            FP: {cm.false_positive}
                                        </div>
                                        <div className="bg-green-100 dark:bg-green-900 p-2 rounded">
                                            TN: {cm.true_negative}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Rumus Metrik */}
                <Card>
                    <CardHeader>
                        <CardTitle>Rumus Metrik Evaluasi</CardTitle>
                    </CardHeader>
                    <CardContent>
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
                                <p className="font-medium mb-2">Recall (Sensitivitas)</p>
                                <BlockMath math="\text{Recall} = \frac{TP}{TP + FN}" />
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                <p className="font-medium mb-2">F1-Score</p>
                                <BlockMath math="\text{F1} = 2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}" />
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                <p className="font-medium mb-2">Specificity (Spesifisitas)</p>
                                <BlockMath math="\text{Specificity} = \frac{TN}{TN + FP}" />
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                <p className="font-medium mb-2">AUC-ROC</p>
                                <BlockMath math="\text{AUC} = \int_{0}^{1} TPR(FPR) \, d(FPR)" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-4 justify-center">
                    <Button asChild>
                        <Link href={route('prediction.index')}>Buat Prediksi</Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href={route('prediction.history')}>Lihat Riwayat</Link>
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
