import AppLayout from "@/Layouts/AppLayout";
import { Head } from "@inertiajs/react";
import { Button } from "@/ShadcnComponents/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/ShadcnComponents/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/ShadcnComponents/ui/table";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/ShadcnComponents/ui/alert";
import { Badge } from "@/ShadcnComponents/ui/badge";
import { useState } from "react";
import {
    Scale,
    Trophy,
    Loader2,
    AlertCircle,
    TrendingUp,
    TrendingDown,
    Minus,
    Database,
    Play,
} from "lucide-react";
import { toast } from "sonner";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from "recharts";
import axios from "axios";

const MODEL_COLORS: Record<string, string> = {
    "Logistic Regression": "#8b5cf6",
    "Decision Tree": "#f59e0b",
    "Support Vector Machine": "#10b981",
};

interface Props {
    totalRecords: number;
    mlServiceUrl: string;
}

interface MetricStat {
    mean: number;
    std: number;
    scores: number[];
}

interface CVMetricSet {
    accuracy: MetricStat;
    precision: MetricStat;
    recall: MetricStat;
    f1: MetricStat;
}

interface TestMetrics {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    specificity: number;
    auc_roc: number;
}

interface ConfusionMatrix {
    true_positive: number;
    true_negative: number;
    false_positive: number;
    false_negative: number;
}

interface BestParamsEntry {
    params: Record<string, any>;
    best_cv_score: number;
}

interface ClassDistShape {
    original?: Record<string, number>;
    train?: Record<string, number>;
    [key: string]: any;
}

interface ScenarioResult {
    best_model: string;
    cv_results: Record<string, CVMetricSet>;
    best_params: Record<string, BestParamsEntry>;
    test_metrics: Record<string, TestMetrics>;
    confusion_matrix: Record<string, ConfusionMatrix>;
    smote_applied: boolean;
    class_distribution: ClassDistShape;
    train_size: number;
    val_size: number;
    test_size: number;
}

interface CompareResponse {
    status: string;
    data_count: number;
    models: string[];
    no_smote: ScenarioResult;
    with_smote: ScenarioResult;
    winner: {
        scenario: "no_smote" | "with_smote";
        model: string;
        f1_cv: number;
    };
    error?: string;
}

type MetricKey = "accuracy" | "precision" | "recall" | "f1";
type TestMetricKey = "accuracy" | "precision" | "recall" | "f1_score";

const CV_METRICS: { key: MetricKey; label: string }[] = [
    { key: "accuracy", label: "Accuracy" },
    { key: "precision", label: "Precision" },
    { key: "recall", label: "Recall" },
    { key: "f1", label: "F1-Score" },
];

const TEST_METRICS: { key: TestMetricKey; label: string }[] = [
    { key: "accuracy", label: "Accuracy" },
    { key: "precision", label: "Precision" },
    { key: "recall", label: "Recall" },
    { key: "f1_score", label: "F1-Score" },
];

const fmtPct = (v: number) => (v * 100).toFixed(2);

export default function CompareSmote({ totalRecords, mlServiceUrl }: Props) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<CompareResponse | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleRun = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const { data } = await axios.post<CompareResponse>(
                "/api/compare-smote",
                null,
                {
                    headers: { Accept: "application/json" },
                    timeout: 180000,
                },
            );
            if (data.status !== "success") {
                throw new Error(data.error || "Komparasi gagal");
            }
            setResult(data);
            toast.success("Komparasi selesai");
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Terjadi kesalahan";
            setErrorMsg(msg);
            toast.error("Komparasi gagal: " + msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ label: "Komparasi SMOTE" }]}>
            <Head title="Komparasi SMOTE" />
            <div className="space-y-6">
                <HeroCard
                    totalRecords={totalRecords}
                    mlServiceUrl={mlServiceUrl}
                />
                <ActionCard loading={loading} onRun={handleRun} />

                {errorMsg && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Gagal menjalankan komparasi</AlertTitle>
                        <AlertDescription>{errorMsg}</AlertDescription>
                    </Alert>
                )}

                {result && <ResultsSection result={result} />}
            </div>
        </AppLayout>
    );
}

function ResultsSection({ result }: { result: CompareResponse }) {
    return (
        <div className="space-y-6">
            <WinnerCard winner={result.winner} />
            <ClassDistributionCard
                noSmote={result.no_smote}
                withSmote={result.with_smote}
            />
            <CVComparisonTable result={result} />
            <TestComparisonTable result={result} />
            <BestParamsSection result={result} />
            <F1BarChartCard result={result} />
            <InsightCard />
        </div>
    );
}

function WinnerCard({ winner }: { winner: CompareResponse["winner"] }) {
    if (!winner) return null;
    const scenarioLabel =
        winner.scenario === "with_smote" ? "Dengan SMOTE" : "Tanpa SMOTE";
    return (
        <Card className="border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="rounded-full bg-yellow-200 p-3">
                        <Trophy className="h-6 w-6 text-yellow-700" />
                    </div>
                    <div>
                        <CardTitle className="text-xl">
                            Pemenang Komparasi
                        </CardTitle>
                        <CardDescription>
                            Skenario terbaik berdasarkan F1-Score CV.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                    <div>
                        <div className="text-xs uppercase tracking-wide text-muted-foreground">
                            Skenario
                        </div>
                        <div className="text-lg font-semibold">
                            {scenarioLabel}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-wide text-muted-foreground">
                            Model
                        </div>
                        <div className="text-lg font-semibold">
                            {winner.model}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-wide text-muted-foreground">
                            F1 CV
                        </div>
                        <div className="text-lg font-semibold text-yellow-700">
                            {fmtPct(winner.f1_cv)}%
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function extractClassDist(
    d: ClassDistShape | undefined,
    prefer: "original" | "train",
): Record<string, number> {
    if (!d) return {};
    if (d[prefer] && typeof d[prefer] === "object")
        return d[prefer] as Record<string, number>;
    if (d.original && typeof d.original === "object") return d.original;
    if (d.train && typeof d.train === "object") return d.train;
    // fallback: assume top-level is the dist
    const result: Record<string, number> = {};
    Object.entries(d).forEach(([k, v]) => {
        if (typeof v === "number") result[k] = v;
    });
    return result;
}

function ClassDistributionCard({
    noSmote,
    withSmote,
}: {
    noSmote: ScenarioResult;
    withSmote: ScenarioResult;
}) {
    const original = extractClassDist(noSmote.class_distribution, "original");
    const trainNoSmote = extractClassDist(noSmote.class_distribution, "train");
    const trainWithSmote = extractClassDist(
        withSmote.class_distribution,
        "train",
    );

    const baseOriginal = Object.keys(original).length ? original : trainNoSmote;

    const buildData = (dist: Record<string, number>) =>
        Object.entries(dist).map(([k, v]) => ({
            name: String(k),
            value: Number(v),
        }));

    const origData = buildData(baseOriginal);
    const smoteData = buildData(trainWithSmote);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Distribusi Kelas</CardTitle>
                <CardDescription>
                    Perbandingan distribusi label sebelum dan sesudah SMOTE
                    diterapkan pada training set.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                    <div>
                        <h4 className="mb-2 text-sm font-semibold">
                            Tanpa SMOTE (asli)
                        </h4>
                        {origData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={origData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#3b82f6">
                                        {origData.map((_, i) => (
                                            <Cell key={i} fill="#3b82f6" />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Data tidak tersedia.
                            </p>
                        )}
                    </div>
                    <div>
                        <h4 className="mb-2 text-sm font-semibold">
                            Dengan SMOTE (training)
                        </h4>
                        {smoteData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={smoteData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#8b5cf6">
                                        {smoteData.map((_, i) => (
                                            <Cell key={i} fill="#8b5cf6" />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Data tidak tersedia.
                            </p>
                        )}
                    </div>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm">
                    <div className="rounded-md border p-3">
                        <div className="text-muted-foreground">Train size</div>
                        <div className="font-semibold">
                            {noSmote.train_size} → {withSmote.train_size}
                        </div>
                    </div>
                    <div className="rounded-md border p-3">
                        <div className="text-muted-foreground">
                            Validation size
                        </div>
                        <div className="font-semibold">{noSmote.val_size}</div>
                    </div>
                    <div className="rounded-md border p-3">
                        <div className="text-muted-foreground">Test size</div>
                        <div className="font-semibold">{noSmote.test_size}</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function deltaBadge(deltaPp: number) {
    if (Math.abs(deltaPp) < 0.5) {
        return (
            <Badge variant="secondary" className="gap-1">
                <Minus className="h-3 w-3" /> Sama
            </Badge>
        );
    }
    if (deltaPp > 0) {
        return (
            <Badge variant="default" className="gap-1">
                <TrendingUp className="h-3 w-3" /> SMOTE
            </Badge>
        );
    }
    return (
        <Badge variant="outline" className="gap-1">
            <TrendingDown className="h-3 w-3" /> Tanpa SMOTE
        </Badge>
    );
}

function CVComparisonTable({ result }: { result: CompareResponse }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Cross-Validation Comparison</CardTitle>
                <CardDescription>
                    Mean ± std hasil 5-fold CV pada training set untuk setiap
                    model & metrik.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Model</TableHead>
                                <TableHead>Metric</TableHead>
                                <TableHead>Tanpa SMOTE</TableHead>
                                <TableHead>Dengan SMOTE</TableHead>
                                <TableHead>Δ pp</TableHead>
                                <TableHead>Lebih Baik</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {result.models.map((model) =>
                                CV_METRICS.map((m) => {
                                    const ns =
                                        result.no_smote.cv_results[model]?.[
                                            m.key
                                        ];
                                    const ws =
                                        result.with_smote.cv_results[model]?.[
                                            m.key
                                        ];
                                    if (!ns || !ws) return null;
                                    const deltaPp = (ws.mean - ns.mean) * 100;
                                    return (
                                        <TableRow key={`${model}-${m.key}`}>
                                            <TableCell className="font-medium">
                                                <span
                                                    className="inline-block h-2 w-2 rounded-full mr-2"
                                                    style={{
                                                        backgroundColor:
                                                            MODEL_COLORS[
                                                                model
                                                            ] || "#64748b",
                                                    }}
                                                />
                                                {model}
                                            </TableCell>
                                            <TableCell>{m.label}</TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {fmtPct(ns.mean)} (±
                                                {fmtPct(ns.std)})
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {fmtPct(ws.mean)} (±
                                                {fmtPct(ws.std)})
                                            </TableCell>
                                            <TableCell
                                                className={
                                                    "font-mono text-sm " +
                                                    (deltaPp > 0.5
                                                        ? "text-green-600"
                                                        : deltaPp < -0.5
                                                          ? "text-red-600"
                                                          : "text-muted-foreground")
                                                }
                                            >
                                                {deltaPp > 0 ? "+" : ""}
                                                {deltaPp.toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                {deltaBadge(deltaPp)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                }),
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

function TestComparisonTable({ result }: { result: CompareResponse }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Test Set Comparison</CardTitle>
                <CardDescription>
                    Performa pada hold-out test set (data yang belum pernah
                    dilihat saat training).
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Model</TableHead>
                                <TableHead>Metric</TableHead>
                                <TableHead>Tanpa SMOTE</TableHead>
                                <TableHead>Dengan SMOTE</TableHead>
                                <TableHead>Δ pp</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {result.models.map((model) =>
                                TEST_METRICS.map((m) => {
                                    const ns =
                                        result.no_smote.test_metrics[model]?.[
                                            m.key
                                        ];
                                    const ws =
                                        result.with_smote.test_metrics[model]?.[
                                            m.key
                                        ];
                                    if (ns === undefined || ws === undefined)
                                        return null;
                                    const deltaPp = (ws - ns) * 100;
                                    return (
                                        <TableRow
                                            key={`test-${model}-${m.key}`}
                                        >
                                            <TableCell className="font-medium">
                                                <span
                                                    className="inline-block h-2 w-2 rounded-full mr-2"
                                                    style={{
                                                        backgroundColor:
                                                            MODEL_COLORS[
                                                                model
                                                            ] || "#64748b",
                                                    }}
                                                />
                                                {model}
                                            </TableCell>
                                            <TableCell>{m.label}</TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {fmtPct(ns)}%
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {fmtPct(ws)}%
                                            </TableCell>
                                            <TableCell
                                                className={
                                                    "font-mono text-sm " +
                                                    (deltaPp > 0.5
                                                        ? "text-green-600"
                                                        : deltaPp < -0.5
                                                          ? "text-red-600"
                                                          : "text-muted-foreground")
                                                }
                                            >
                                                {deltaPp > 0 ? "+" : ""}
                                                {deltaPp.toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                }),
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

function BestParamsSection({ result }: { result: CompareResponse }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Best Hyperparameters</CardTitle>
                <CardDescription>
                    Parameter terbaik hasil grid search untuk setiap model di
                    kedua skenario.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {result.models.map((model) => {
                        const ns = result.no_smote.best_params[model];
                        const ws = result.with_smote.best_params[model];
                        return (
                            <div key={model}>
                                <div className="mb-2 flex items-center gap-2">
                                    <span
                                        className="inline-block h-2 w-2 rounded-full"
                                        style={{
                                            backgroundColor:
                                                MODEL_COLORS[model] ||
                                                "#64748b",
                                        }}
                                    />
                                    <h4 className="font-semibold">{model}</h4>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="rounded-md border p-3">
                                        <div className="mb-2 text-xs uppercase text-muted-foreground">
                                            Tanpa SMOTE
                                        </div>
                                        {ns ? (
                                            <>
                                                <pre className="whitespace-pre-wrap break-words text-xs">
                                                    {JSON.stringify(
                                                        ns.params,
                                                        null,
                                                        2,
                                                    )}
                                                </pre>
                                                <div className="mt-2 text-xs text-muted-foreground">
                                                    Best CV score:{" "}
                                                    {fmtPct(ns.best_cv_score)}%
                                                </div>
                                            </>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">
                                                N/A
                                            </span>
                                        )}
                                    </div>
                                    <div className="rounded-md border p-3">
                                        <div className="mb-2 text-xs uppercase text-muted-foreground">
                                            Dengan SMOTE
                                        </div>
                                        {ws ? (
                                            <>
                                                <pre className="whitespace-pre-wrap break-words text-xs">
                                                    {JSON.stringify(
                                                        ws.params,
                                                        null,
                                                        2,
                                                    )}
                                                </pre>
                                                <div className="mt-2 text-xs text-muted-foreground">
                                                    Best CV score:{" "}
                                                    {fmtPct(ws.best_cv_score)}%
                                                </div>
                                            </>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">
                                                N/A
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

function F1BarChartCard({ result }: { result: CompareResponse }) {
    const data = result.models.map((model) => {
        const ns = result.no_smote.cv_results[model]?.f1;
        const ws = result.with_smote.cv_results[model]?.f1;
        return {
            model,
            "Tanpa SMOTE": ns ? +(ns.mean * 100).toFixed(2) : 0,
            "Dengan SMOTE": ws ? +(ws.mean * 100).toFixed(2) : 0,
            stdNo: ns ? +(ns.std * 100).toFixed(2) : 0,
            stdWith: ws ? +(ws.std * 100).toFixed(2) : 0,
        };
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Perbandingan F1-Score (Cross-Validation)</CardTitle>
                <CardDescription>
                    Bar chart F1 mean (± std) tiap model untuk kedua skenario.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="model" />
                        <YAxis domain={[0, 100]} unit="%" />
                        <Tooltip
                            formatter={(value: any, name: any, props: any) => {
                                const k =
                                    name === "Tanpa SMOTE"
                                        ? "stdNo"
                                        : "stdWith";
                                const std = props?.payload?.[k];
                                return [`${value}% (±${std}%)`, name];
                            }}
                        />
                        <Legend />
                        <Bar dataKey="Tanpa SMOTE" fill="#3b82f6" />
                        <Bar dataKey="Dengan SMOTE" fill="#8b5cf6" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

function InsightCard() {
    return (
        <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
                <CardTitle className="text-base">
                    Cara Membaca Hasil Ini
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>
                    <strong className="text-foreground">
                        Kapan SMOTE membantu?
                    </strong>{" "}
                    SMOTE biasanya bermanfaat ketika data sangat{" "}
                    <em>imbalanced</em> (rasio kelas minoritas ≪ mayoritas).
                    Pada kasus tersebut, recall & f1 untuk kelas minoritas
                    sering meningkat signifikan.
                </p>
                <p>
                    <strong className="text-foreground">Caveat.</strong> SMOTE
                    diterapkan hanya pada training set; test set tetap apa
                    adanya. Test set yang kecil dapat menghasilkan metrik yang
                    fluktuatif — perhatikan juga hasil cross-validation, bukan
                    hanya satu test split.
                </p>
                <p>
                    <strong className="text-foreground">Trade-off.</strong>{" "}
                    Sintesis sampel dapat memperkenalkan noise; jika dataset
                    sudah seimbang atau cukup besar, SMOTE bisa jadi tidak
                    meningkatkan (bahkan menurunkan) performa.
                </p>
            </CardContent>
        </Card>
    );
}

function HeroCard({
    totalRecords,
    mlServiceUrl,
}: {
    totalRecords: number;
    mlServiceUrl: string;
}) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-purple-100 p-3">
                            <Scale className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">
                                Komparasi SMOTE vs Non-SMOTE
                            </CardTitle>
                            <CardDescription className="mt-1 max-w-2xl">
                                SMOTE (Synthetic Minority Over-sampling
                                Technique) menyeimbangkan distribusi kelas
                                dengan mensintesis sampel minoritas. Halaman ini
                                melatih ketiga model pada skenario tanpa SMOTE
                                dan dengan SMOTE, lalu membandingkan performanya
                                secara berdampingan.
                            </CardDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="gap-1">
                            <Database className="h-3.5 w-3.5" />
                            {totalRecords.toLocaleString("id-ID")} records
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground">
                    ML Service:{" "}
                    <code className="rounded bg-muted px-1.5 py-0.5">
                        {mlServiceUrl}
                    </code>
                </p>
            </CardContent>
        </Card>
    );
}

function ActionCard({
    loading,
    onRun,
}: {
    loading: boolean;
    onRun: () => void;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Jalankan Komparasi</CardTitle>
                <CardDescription>
                    Estimasi waktu sekitar 30–60 detik. Proses ini akan
                    menjalankan 5-fold cross-validation untuk ketiga model pada
                    kedua skenario.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button
                    size="lg"
                    onClick={onRun}
                    disabled={loading}
                    className="gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sedang melatih kedua skenario...
                        </>
                    ) : (
                        <>
                            <Play className="h-4 w-4" />
                            Jalankan Komparasi
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
