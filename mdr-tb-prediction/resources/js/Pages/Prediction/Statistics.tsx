import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

interface Statistics {
    evaluation_results: Record<string, EvaluationResult>;
    best_model: string;
    cv_results: Record<string, CVResult>;
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


    return (
        <AppLayout breadcrumbs={[{ label: 'Statistik' }]}>
            <Head title="Statistik Model" />

            <div className="space-y-6">
                {/* Best Model Info */}
                <Card className="border-2 border-blue-500 overflow-hidden">
                    <CardHeader className="bg-blue-50 dark:bg-blue-950">
                        <CardTitle className="text-center">🏆 Model Terbaik: {statistics.best_model}</CardTitle>
                        <CardDescription className="text-center">
                            Dipilih berdasarkan skor F1 tertinggi dari K-Fold Cross Validation
                        </CardDescription>
                    </CardHeader>
                </Card>

                {/* Perbandingan Model - Test Set Metrics */}
                <Card>
                    <CardHeader>
                        <CardTitle>Perbandingan Performa Model (Test Set)</CardTitle>
                        <CardDescription>Metrik evaluasi pada 20% data testing</CardDescription>
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
                                    const isBest = name === statistics.best_model;
                                    return (
                                        <TableRow key={name} className={isBest ? 'bg-blue-50 dark:bg-blue-950' : ''}>
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
                            <CardTitle>Hasil K-Fold Cross Validation (K=5)</CardTitle>
                            <CardDescription>Rata-rata metrik dari 5-fold cross validation pada 80% data training</CardDescription>
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
                                            <TableRow key={name} className={isBest ? 'bg-blue-50 dark:bg-blue-950' : ''}>
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
                            <Card key={name} className={isBest ? 'border-2 border-blue-500' : ''}>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="font-semibold">Accuracy</p>
                                <p className="font-mono">= (TP + TN) / (TP + TN + FP + FN)</p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="font-semibold">Precision</p>
                                <p className="font-mono">= TP / (TP + FP)</p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="font-semibold">Recall</p>
                                <p className="font-mono">= TP / (TP + FN)</p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="font-semibold">F1-Score</p>
                                <p className="font-mono">= 2 × (P × R) / (P + R)</p>
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
