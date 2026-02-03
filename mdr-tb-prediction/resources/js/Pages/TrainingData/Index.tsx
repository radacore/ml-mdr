import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { useState } from 'react';
import { Plus, Search, Trash2, Edit, RefreshCw, Database, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface TrainingDataItem {
    id: number;
    usia: string;
    ket_usia: number;
    jenis_kelamin: string;
    status_bekerja: string;
    bb: number;
    tb: number;
    imt: number;
    status_gizi: string;
    status_merokok: string;
    pemeriksaan_kontak: string;
    riwayat_dm: string;
    riwayat_hiv: string;
    komorbiditas: string;
    kepatuhan_minum_obat: string;
    efek_samping_obat: string;
    keterangan_efek_samping: string | null;
    riwayat_pengobatan: string;
    panduan_pengobatan: string;
    keberhasilan_pengobatan: string;
    created_at: string;
}

interface Props {
    trainingData: {
        data: TrainingDataItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    filters: {
        search?: string;
        outcome?: string;
    };
    stats: {
        total: number;
        berhasil: number;
        tidak_berhasil: number;
    };
}

export default function Index({ trainingData, filters, stats }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [isRetraining, setIsRetraining] = useState(false);
    const [retrainResult, setRetrainResult] = useState<any>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('training-data.index'), { search }, { preserveState: true });
    };

    const handleDelete = () => {
        if (!deleteId) return;

        setIsDeleting(true);
        router.delete(route('training-data.destroy', deleteId), {
            onSuccess: () => {
                toast.success('Data training berhasil dihapus');
                setDeleteId(null);
            },
            onError: () => {
                toast.error('Gagal menghapus data training');
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    const handleRetrain = async () => {
        setIsRetraining(true);
        setRetrainResult(null);

        try {
            const response = await fetch('/api/retrain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const result = await response.json();
            setRetrainResult(result);
            if (result.error) {
                toast.error(result.message || 'Gagal melakukan retrain');
            } else {
                toast.success('Model berhasil dilatih ulang!');
            }
        } catch (error) {
            setRetrainResult({ error: 'Gagal melakukan retrain' });
            toast.error('Gagal melakukan retrain');
        } finally {
            setIsRetraining(false);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ label: 'Data Training' }]}>
            <Head title="Data Training" />

            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Data</CardTitle>
                            <Database className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Berhasil</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.berhasil}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tidak Berhasil</CardTitle>
                            <XCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.tidak_berhasil}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rasio Keberhasilan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total > 0 ? ((stats.berhasil / stats.total) * 100).toFixed(1) : 0}%
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Actions */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                                <Input
                                    type="text"
                                    placeholder="Cari data..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="max-w-sm"
                                />
                                <Button type="submit" variant="outline">
                                    <Search className="h-4 w-4 mr-2" />
                                    Cari
                                </Button>
                            </form>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={handleRetrain}
                                    disabled={isRetraining}
                                >
                                    <RefreshCw className={`h-4 w-4 mr-2 ${isRetraining ? 'animate-spin' : ''}`} />
                                    {isRetraining ? 'Melatih...' : 'Retrain Model'}
                                </Button>
                                <Link href={route('training-data.create')}>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Tambah Data
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Retrain Result */}
                        {retrainResult && (
                            <div className={`mt-4 p-4 rounded-lg ${retrainResult.error ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
                                {retrainResult.error ? (
                                    <p>{retrainResult.message || retrainResult.error}</p>
                                ) : (
                                    <div>
                                        <p className="font-semibold">Model berhasil dilatih ulang!</p>
                                        {retrainResult.best_model && (
                                            <p>Best Model: {retrainResult.best_model}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>No</TableHead>
                                        <TableHead>Usia</TableHead>
                                        <TableHead>JK</TableHead>
                                        <TableHead>BB/TB</TableHead>
                                        <TableHead>Status Gizi</TableHead>
                                        <TableHead>Merokok</TableHead>
                                        <TableHead>Kepatuhan</TableHead>
                                        <TableHead>Hasil</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {trainingData.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                                Tidak ada data
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        trainingData.data.map((item, index) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    {(trainingData.current_page - 1) * trainingData.per_page + index + 1}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <div className="font-medium">{item.ket_usia} tahun</div>
                                                        <div className="text-muted-foreground">{item.usia}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{item.jenis_kelamin === 'Laki-Laki' ? 'L' : 'P'}</TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        {item.bb}kg / {item.tb}cm
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={
                                                        item.status_gizi === 'Gizi Normal' ? 'default' :
                                                            item.status_gizi === 'Gizi Kurang' ? 'destructive' : 'secondary'
                                                    }>
                                                        {item.status_gizi}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{item.status_merokok === 'Merokok' ? 'Ya' : 'Tidak'}</TableCell>
                                                <TableCell>{item.kepatuhan_minum_obat}</TableCell>
                                                <TableCell>
                                                    <Badge variant={item.keberhasilan_pengobatan === 'Berhasil' ? 'default' : 'destructive'}>
                                                        {item.keberhasilan_pengobatan}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link href={route('training-data.edit', item.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => setDeleteId(item.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {trainingData.last_page > 1 && (
                            <div className="flex justify-center gap-2 mt-4">
                                {trainingData.links.map((link, index) => (
                                    <Button
                                        key={index}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <DeleteConfirmModal
                open={deleteId !== null}
                onOpenChange={(open) => !open && setDeleteId(null)}
                onConfirm={handleDelete}
                title="Hapus Data Training"
                description="Apakah Anda yakin ingin menghapus data training ini? Tindakan ini tidak dapat dibatalkan."
                isLoading={isDeleting}
            />
        </AppLayout>
    );
}

