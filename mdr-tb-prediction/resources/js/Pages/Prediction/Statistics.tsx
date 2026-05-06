import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/ShadcnComponents/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ShadcnComponents/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ShadcnComponents/ui/table';
import { Alert, AlertDescription } from '@/ShadcnComponents/ui/alert';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart, Pie,
} from 'recharts';
import { useMemo } from 'react';

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

interface BootstrapCI {
    mean: number;
    ci_lower: number;
    ci_upper: number;
}

interface CurveData {
    roc: { fpr: number[]; tpr: number[]; auc: number };
    pr: { precision: number[]; recall: number[]; average_precision: number };
    calibration: { prob_true: number[]; prob_pred: number[]; brier_score: number };
}

interface OddsRatioEntry {
    feature: string;
    coefficient: number;
    odds_ratio: number;
    ci_lower: number;
    ci_upper: number;
    p_value: number;
    significant: boolean;
}

interface FeatureImportanceEntry {
    feature: string;
    importance: number;
}

interface PermutationImportanceEntry {
    feature: string;
    importance_mean: number;
    importance_std: number;
}

interface InterpretabilityData {
    odds_ratios?: OddsRatioEntry[];
    feature_importance?: FeatureImportanceEntry[];
    permutation_importance?: PermutationImportanceEntry[];
}

interface Statistics {
    evaluation_results: Record<string, EvaluationResult>;
    best_model: string;
    cv_results: Record<string, CVResult>;
    comparison_table: Record<string, ComparisonEntry> | null;
    best_params: Record<string, BestParamsEntry> | null;
    class_distribution?: {
        counts?: Record<string, number>;
        percentages?: Record<string, number>;
        total?: number;
        imbalance_ratio?: number;
        original?: Record<string, number>;
        train?: Record<string, number>;
    } | null;
    bootstrap_ci?: Record<string, Record<string, BootstrapCI>> | null;
}

interface Props {
    statistics: Statistics | null;
    curves: Record<string, CurveData> | null;
    interpretability: Record<string, InterpretabilityData> | null;
    error: string | null;
}

const MODEL_COLORS: Record<string, string> = {
    'Logistic Regression': '#8b5cf6',
    'Decision Tree': '#f59e0b',
    'Support Vector Machine': '#10b981',
};

const getModelColor = (name: string, idx: number) =>
    MODEL_COLORS[name] || ['#6366f1', '#ec4899', '#14b8a6'][idx % 3];

export default function Statistics({ statistics, curves, interpretability, error }: Props) {
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

                {/* Class Distribution */}
                {statistics.class_distribution && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Distribusi Kelas Target</CardTitle>
                            <CardDescription>Distribusi label Keberhasilan Pengobatan pada dataset</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {(() => {
                                    const dist = statistics.class_distribution!;
                                    const counts = dist.counts || dist.original || {};
                                    const labelMap: Record<string, string> = { '0': 'Berhasil', '1': 'Tidak Berhasil' };
                                    const pieData = Object.entries(counts).map(([k, v]) => ({
                                        name: labelMap[k] || k,
                                        value: v,
                                    }));
                                    const pieColors = ['#10b981', '#ef4444'];
                                    const total = Object.values(counts).reduce((a, b) => a + b, 0);
                                    return (
                                        <>
                                            <div className="flex items-center justify-center">
                                                <ResponsiveContainer width="100%" height={220}>
                                                    <PieChart>
                                                        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(1)}%`}>
                                                            {pieData.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                                                        </Pie>
                                                        <Tooltip />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div className="flex flex-col justify-center space-y-2">
                                                {pieData.map((d, i) => (
                                                    <div key={i} className="flex items-center gap-3">
                                                        <span className="w-4 h-4 rounded-full inline-block" style={{ backgroundColor: pieColors[i] }} />
                                                        <span className="font-medium">{d.name}:</span>
                                                        <span>{d.value} ({total > 0 ? ((d.value / total) * 100).toFixed(1) : 0}%)</span>
                                                    </div>
                                                ))}
                                                <p className="text-sm text-muted-foreground mt-2">Total: {total} data</p>
                                                {dist.imbalance_ratio && (
                                                    <p className="text-sm text-muted-foreground">Imbalance Ratio: {dist.imbalance_ratio}:1</p>
                                                )}
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Bootstrap 95% CI Table */}
                {statistics.bootstrap_ci && Object.keys(statistics.bootstrap_ci).length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Bootstrap 95% Confidence Interval (Test Set)</CardTitle>
                            <CardDescription>Estimasi interval kepercayaan metrik evaluasi menggunakan 1000 iterasi bootstrap</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="border font-bold">Model</TableHead>
                                            <TableHead className="text-center border font-bold">Accuracy</TableHead>
                                            <TableHead className="text-center border font-bold">Precision</TableHead>
                                            <TableHead className="text-center border font-bold">Recall</TableHead>
                                            <TableHead className="text-center border font-bold">F1-Score</TableHead>
                                            <TableHead className="text-center border font-bold">AUC-ROC</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {Object.entries(statistics.bootstrap_ci).map(([name, ci]) => {
                                            const isBest = name === statistics.best_model;
                                            const fmt = (m: BootstrapCI) => `${(m.mean * 100).toFixed(1)}% [${(m.ci_lower * 100).toFixed(1)}–${(m.ci_upper * 100).toFixed(1)}]`;
                                            return (
                                                <TableRow key={name} className={isBest ? 'bg-purple-50 dark:bg-purple-950' : ''}>
                                                    <TableCell className="border font-medium">{isBest && '\u{1F3C6} '}{name}</TableCell>
                                                    <TableCell className="text-center border text-sm">{ci.accuracy ? fmt(ci.accuracy) : '-'}</TableCell>
                                                    <TableCell className="text-center border text-sm">{ci.precision ? fmt(ci.precision) : '-'}</TableCell>
                                                    <TableCell className="text-center border text-sm">{ci.recall ? fmt(ci.recall) : '-'}</TableCell>
                                                    <TableCell className="text-center border text-sm">{ci.f1_score ? fmt(ci.f1_score) : '-'}</TableCell>
                                                    <TableCell className="text-center border text-sm">{ci.auc_roc ? fmt(ci.auc_roc) : '-'}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ROC Curve */}
                {curves && Object.keys(curves).length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>ROC Curve</CardTitle>
                            <CardDescription>Receiver Operating Characteristic — Trade-off antara True Positive Rate dan False Positive Rate</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="fpr" type="number" domain={[0, 1]} label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -5 }} tickFormatter={(v: number) => v.toFixed(1)} />
                                    <YAxis type="number" domain={[0, 1]} label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft' }} tickFormatter={(v: number) => v.toFixed(1)} />
                                    <Tooltip formatter={(value: any) => Number(value).toFixed(4)} />
                                    <Legend />
                                    {/* Diagonal reference */}
                                    <Line data={[{ fpr: 0, tpr: 0 }, { fpr: 1, tpr: 1 }]} dataKey="tpr" name="Random (AUC=0.50)" stroke="#d1d5db" strokeDasharray="5 5" dot={false} />
                                    {Object.entries(curves).map(([name, data], idx) => {
                                        const points = data.roc.fpr.map((fpr: number, i: number) => ({ fpr, tpr: data.roc.tpr[i] }));
                                        return (
                                            <Line key={name} data={points} dataKey="tpr" name={`${name} (AUC=${data.roc.auc.toFixed(3)})`} stroke={getModelColor(name, idx)} dot={false} strokeWidth={2} />
                                        );
                                    })}
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}

                {/* Precision-Recall Curve */}
                {curves && Object.keys(curves).length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Precision-Recall Curve</CardTitle>
                            <CardDescription>Trade-off antara Precision dan Recall — penting untuk dataset tidak seimbang (MDR-TB)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="recall" type="number" domain={[0, 1]} label={{ value: 'Recall', position: 'insideBottom', offset: -5 }} tickFormatter={(v: number) => v.toFixed(1)} />
                                    <YAxis type="number" domain={[0, 1]} label={{ value: 'Precision', angle: -90, position: 'insideLeft' }} tickFormatter={(v: number) => v.toFixed(1)} />
                                    <Tooltip formatter={(value: any) => Number(value).toFixed(4)} />
                                    <Legend />
                                    {Object.entries(curves).map(([name, data], idx) => {
                                        const points = data.pr.recall.map((rec: number, i: number) => ({ recall: rec, precision: data.pr.precision[i] }));
                                        return (
                                            <Line key={name} data={points} dataKey="precision" name={`${name} (AP=${data.pr.average_precision.toFixed(3)})`} stroke={getModelColor(name, idx)} dot={false} strokeWidth={2} />
                                        );
                                    })}
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}

                {/* Calibration Curve */}
                {curves && Object.keys(curves).length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Calibration Curve</CardTitle>
                            <CardDescription>Keandalan probabilitas prediksi — semakin dekat ke garis diagonal, semakin baik kalibrasi</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="prob_pred" type="number" domain={[0, 1]} label={{ value: 'Mean Predicted Probability', position: 'insideBottom', offset: -5 }} tickFormatter={(v: number) => v.toFixed(1)} />
                                    <YAxis type="number" domain={[0, 1]} label={{ value: 'Fraction of Positives', angle: -90, position: 'insideLeft' }} tickFormatter={(v: number) => v.toFixed(1)} />
                                    <Tooltip formatter={(value: any) => Number(value).toFixed(4)} />
                                    <Legend />
                                    {/* Perfectly calibrated reference */}
                                    <Line data={[{ prob_pred: 0, prob_true: 0 }, { prob_pred: 1, prob_true: 1 }]} dataKey="prob_true" name="Perfectly Calibrated" stroke="#d1d5db" strokeDasharray="5 5" dot={false} />
                                    {Object.entries(curves).map(([name, data], idx) => {
                                        const points = data.calibration.prob_pred.map((pp: number, i: number) => ({ prob_pred: pp, prob_true: data.calibration.prob_true[i] }));
                                        return (
                                            <Line key={name} data={points} dataKey="prob_true" name={`${name} (Brier=${data.calibration.brier_score.toFixed(3)})`} stroke={getModelColor(name, idx)} dot={true} strokeWidth={2} />
                                        );
                                    })}
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}

                {/* Feature Importance - Decision Tree */}
                {interpretability && (() => {
                    const dtEntry = Object.entries(interpretability).find(([n]) => n.includes('Decision Tree'));
                    if (!dtEntry || !dtEntry[1].feature_importance?.length) return null;
                    const fiData = dtEntry[1].feature_importance!.slice(0, 17);
                    return (
                        <Card>
                            <CardHeader>
                                <CardTitle>Feature Importance (Decision Tree)</CardTitle>
                                <CardDescription>Kontribusi relatif setiap fitur dalam pengambilan keputusan model Decision Tree</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={Math.max(300, fiData.length * 32)}>
                                    <BarChart data={fiData} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" tickFormatter={(v: number) => (v * 100).toFixed(0) + '%'} />
                                        <YAxis type="category" dataKey="feature" width={110} tick={{ fontSize: 11 }} />
                                        <Tooltip formatter={(value: any) => (Number(value) * 100).toFixed(2) + '%'} />
                                        <Bar dataKey="importance" name="Importance" fill="#f59e0b" radius={[0, 4, 4, 0]}>
                                            {fiData.map((_, i) => <Cell key={i} fill={i === 0 ? '#f59e0b' : '#fbbf24'} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    );
                })()}

                {/* Odds Ratio Table - Logistic Regression */}
                {interpretability && (() => {
                    const lrEntry = Object.entries(interpretability).find(([n]) => n.includes('Logistic Regression'));
                    if (!lrEntry || !lrEntry[1].odds_ratios?.length) return null;
                    const ors = lrEntry[1].odds_ratios!;
                    return (
                        <Card>
                            <CardHeader>
                                <CardTitle>Adjusted Odds Ratio — Logistic Regression</CardTitle>
                                <CardDescription>Odds Ratio menunjukkan besarnya pengaruh setiap fitur terhadap risiko Tidak Berhasil. OR &gt; 1 = meningkatkan risiko, OR &lt; 1 = menurunkan risiko.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="border font-bold">Fitur</TableHead>
                                                <TableHead className="text-center border font-bold">Koefisien</TableHead>
                                                <TableHead className="text-center border font-bold">Odds Ratio</TableHead>
                                                <TableHead className="text-center border font-bold">95% CI</TableHead>
                                                <TableHead className="text-center border font-bold">p-value</TableHead>
                                                <TableHead className="text-center border font-bold">Signifikan</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {ors.map((or) => (
                                                <TableRow key={or.feature} className={or.significant ? 'bg-yellow-50 dark:bg-yellow-950' : ''}>
                                                    <TableCell className="border font-medium">{or.feature}</TableCell>
                                                    <TableCell className="text-center border font-mono text-sm">{or.coefficient.toFixed(4)}</TableCell>
                                                    <TableCell className="text-center border font-semibold">{or.odds_ratio.toFixed(3)}</TableCell>
                                                    <TableCell className="text-center border text-sm">[{or.ci_lower.toFixed(3)} – {or.ci_upper.toFixed(3)}]</TableCell>
                                                    <TableCell className="text-center border text-sm">{or.p_value < 0.001 ? '<0.001' : or.p_value.toFixed(3)}</TableCell>
                                                    <TableCell className="text-center border">{or.significant ? <span className="text-green-600 font-bold">Ya</span> : <span className="text-gray-400">Tidak</span>}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })()}

                {/* Permutation Importance - SVM */}
                {interpretability && (() => {
                    const svmEntry = Object.entries(interpretability).find(([n]) => n.includes('Support Vector Machine'));
                    if (!svmEntry || !svmEntry[1].permutation_importance?.length) return null;
                    const piData = svmEntry[1].permutation_importance!.filter(p => p.importance_mean > 0).slice(0, 17);
                    if (piData.length === 0) return null;
                    return (
                        <Card>
                            <CardHeader>
                                <CardTitle>Permutation Importance (Support Vector Machine)</CardTitle>
                                <CardDescription>Penurunan skor F1 ketika nilai fitur diacak — mengukur kontribusi setiap fitur terhadap performa SVM</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={Math.max(300, piData.length * 32)}>
                                    <BarChart data={piData} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" tickFormatter={(v: number) => (v * 100).toFixed(0) + '%'} />
                                        <YAxis type="category" dataKey="feature" width={110} tick={{ fontSize: 11 }} />
                                        <Tooltip formatter={(value: any) => (Number(value) * 100).toFixed(2) + '%'} />
                                        <Bar dataKey="importance_mean" name="Mean Importance" fill="#10b981" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    );
                })()}

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
