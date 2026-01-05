import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '@/services/api/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await register({ username, email, password });
            toast({
                title: "¡Cuenta creada!",
                description: "Bienvenido a tu nueva vida RPG.",
            });
            navigate('/');
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error de registro",
                description: error.message || "No se pudo crear la cuenta.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-950">
            <Card className="w-full max-w-md border-slate-800 bg-slate-900 text-slate-100">
                <CardHeader>
                    <CardTitle className="text-2xl text-center font-bold text-primary">Crear Cuenta</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nombre de Usuario</label>
                            <Input
                                type="text"
                                placeholder="ElHeroe123"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="bg-slate-800 border-slate-700"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-slate-800 border-slate-700"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Contraseña</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-slate-800 border-slate-700"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Creando...' : 'Registrarse'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-sm text-slate-400">
                        ¿Ya tienes cuenta? <a href="/login" className="text-primary hover:underline">Inicia Sesión</a>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
