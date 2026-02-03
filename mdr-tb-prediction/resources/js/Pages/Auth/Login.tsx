import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Login" />

            <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
                <div className="flex w-full max-w-sm flex-col gap-6">
                    <a href="#" className="flex items-center gap-2 self-center font-medium">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                            </svg>
                        </div>
                        MDR-TB Prediction
                    </a>
                    <div className={cn("flex flex-col gap-6")}>
                        <Card>
                            <CardHeader className="text-center">
                                <CardTitle className="text-xl">Selamat Datang</CardTitle>
                                <CardDescription>
                                    Masuk ke akun Anda untuk melanjutkan
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={submit}>
                                    <div className="grid gap-6">
                                        {status && (
                                            <div className="p-3 rounded-md bg-green-50 text-green-600 text-sm">
                                                {status}
                                            </div>
                                        )}
                                        <div className="grid gap-6">
                                            <div className="grid gap-2">
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="m@example.com"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    autoComplete="username"
                                                    autoFocus
                                                    required
                                                />
                                                {errors.email && (
                                                    <p className="text-sm text-destructive">{errors.email}</p>
                                                )}
                                            </div>
                                            <div className="grid gap-2">
                                                <div className="flex items-center">
                                                    <Label htmlFor="password">Password</Label>
                                                    {canResetPassword && (
                                                        <Link
                                                            href={route('password.request')}
                                                            className="ml-auto text-sm underline-offset-4 hover:underline"
                                                        >
                                                            Lupa password?
                                                        </Link>
                                                    )}
                                                </div>
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    autoComplete="current-password"
                                                    required
                                                />
                                                {errors.password && (
                                                    <p className="text-sm text-destructive">{errors.password}</p>
                                                )}
                                            </div>
                                            <Button type="submit" className="w-full" disabled={processing}>
                                                {processing ? 'Memproses...' : 'Masuk'}
                                            </Button>
                                        </div>
                                        <div className="text-center text-sm">
                                            Belum punya akun?{" "}
                                            <Link href={route('register')} className="underline underline-offset-4">
                                                Daftar
                                            </Link>
                                        </div>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                        <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
                            Sistem Prediksi Keberhasilan Pengobatan MDR-TB
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
