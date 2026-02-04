import React, { useState } from 'react';
import { LayoutDashboard, AlertTriangle, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from './ui/Atoms';

export const LoginView: React.FC = () => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegistering) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Credenciales incorrectas.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('El correo ya está registrado.');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña debe tener al menos 6 caracteres.');
      } else {
        setError('Ocurrió un error. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
        await signInWithGoogle();
    } catch (err: any) {
        if(err.code === 'auth/popup-closed-by-user') {
            setError('Inicio de sesión cancelado.');
        } else {
            setError('Error con Google. Verifica el dominio autorizado en Firebase.');
        }
    } finally {
        setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] right-[-10%] w-[50vh] h-[50vh] bg-brand-200 rounded-full blur-[100px] opacity-50"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50vh] h-[50vh] bg-purple-200 rounded-full blur-[100px] opacity-50"></div>

      <div className="bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-xl border border-white max-w-sm w-full z-10">
        <div className="text-center mb-6">
            <div className="bg-brand-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/30">
            <LayoutDashboard className="text-white" size={32} />
            </div>
            
            <h1 className="text-2xl font-bold text-slate-800">
                {isRegistering ? 'Crear Cuenta' : 'Bienvenido'}
            </h1>
            <p className="text-slate-500 text-sm">
                {isRegistering ? 'Regístrate para comenzar' : 'Ingresa a tus finanzas'}
            </p>
        </div>

        {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-xl flex items-center gap-2 border border-red-100">
                <AlertTriangle size={16} />
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <div className="relative">
                    <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                    <input 
                        type="email" 
                        placeholder="Correo electrónico"
                        className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-xl focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-sm"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                </div>
            </div>
            <div>
                <div className="relative">
                    <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                    <input 
                        type="password" 
                        placeholder="Contraseña"
                        className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-xl focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-sm"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                </div>
            </div>

            <Button type="submit" fullWidth disabled={loading} className="mt-2">
                {loading ? <Loader2 className="animate-spin" size={20}/> : (isRegistering ? 'Registrarse' : 'Iniciar Sesión')}
            </Button>
        </form>

        <div className="my-6 flex items-center gap-2">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span className="text-xs text-slate-400 uppercase font-semibold">O</span>
            <div className="h-px bg-slate-200 flex-1"></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-3 active:scale-95 text-sm"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Google
        </button>

        <div className="mt-6 text-center">
            <button 
                onClick={() => { setIsRegistering(!isRegistering); setError(null); }}
                className="text-brand-600 font-semibold text-sm hover:underline"
            >
                {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
            </button>
        </div>
      </div>
    </div>
  );
};