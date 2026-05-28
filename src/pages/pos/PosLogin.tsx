import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, AuthUser } from '@/services/posApi';
import { useToast } from '@/hooks/use-toast';
import { Lock, User, ChefHat } from 'lucide-react';

const PosLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = await authService.login(username, password);
      const nombre = user.firstName || user.email;
      toast({ title: `Bienvenido, ${nombre}`, description: `Acceso como ${user.rol === 'CAJERO' ? 'Cajero' : 'Mesero'}` });
      if (user.rol === 'CAJERO') navigate('/pos/caja');
      else navigate('/pos/mesas');
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Error de conexión. Verifica que el servidor backend esté corriendo.');
      toast({ title: 'Error de autenticación', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-warm flex items-center justify-center p-4">
      {/* Fondo con patrón */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 backdrop-blur-sm mb-4">
            <ChefHat className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-display text-gradient">El Bohío</h1>
          <p className="text-primary/80 mt-2 font-medium">Sistema POS</p>
        </div>

        <form onSubmit={handleLogin} className="bg-card/80 backdrop-blur rounded-3xl p-8 border border-border shadow-2xl">
          <div className="space-y-6">
<div>
                <label className="block text-sm font-medium text-foreground mb-2">Usuario</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="cajero@elbohio.com"
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-muted border-2 border-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:bg-card transition-all" required />
                </div>
              </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-muted border-2 border-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:bg-card transition-all" required />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm text-center">
                {error}
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-bold text-lg rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-center text-muted-foreground mb-3">Credenciales de prueba:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button type="button" onClick={() => { setUsername('cajero@elbohio.com'); setPassword('cajero123'); }}
                className="py-2 px-3 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors">
                Cajero
              </button>
              <button type="button" onClick={() => { setUsername('mesero@elbohio.com'); setPassword('mesero123'); }}
                className="py-2 px-3 bg-secondary/20 text-secondary rounded-lg hover:bg-secondary/30 transition-colors">
                Mesero
              </button>
            </div>
          </div>
        </form>

        <div className="text-center mt-6">
          <a href="/" className="text-muted-foreground hover:text-foreground text-sm underline underline-offset-4">
            ← Volver al sitio web
          </a>
        </div>
      </div>
    </div>
  );
};

export default PosLogin;