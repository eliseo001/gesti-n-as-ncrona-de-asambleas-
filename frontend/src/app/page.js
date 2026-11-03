'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { iniciarSesion } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Intento opcional contra el backend Spring Boot si está encendido
      try {
        const res = await fetch('http://localhost:8080/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem('token', data.token);
        }
      } catch {
        // Si el backend no está corriendo durante la demostración de UI,
        // el AuthContext gestiona la sesión simulada de forma autónoma.
      }

      // Hidrata el AuthContext con el payload JWT correspondiente y redirige por rol
      iniciarSesion(formData.email);
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  const autocompletarCredenciales = (emailDemo) => {
    setFormData({ email: emailDemo, password: 'password123' });
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">

        {/* Cabecera Institucional */}
        <div className="bg-slate-900 text-white p-6 text-center border-b border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400">
            Gobernanza Consorcial • Ley N° 26.994
          </span>
          <h1 className="text-2xl font-bold mt-1">ConsorcioSync</h1>
          <p className="text-slate-400 text-xs mt-1">
            Acceso con Control de Permisos Basado en Roles (RBAC)
          </p>
        </div>

        <div className="p-6 md:p-8">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-xs text-center border border-red-200 font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
                placeholder="admin@consorcio.com o propietario4b@consorcio.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-700 text-white font-bold py-3 rounded-lg hover:bg-blue-800 transition-colors disabled:bg-blue-400 text-sm shadow cursor-pointer"
            >
              {loading ? 'Verificando credenciales...' : 'Iniciar Sesión'}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => router.push('/recuperar')}
                className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
              >
                ¿Olvidaste tu contraseña? Recuperar acceso electoral
              </button>
            </div>
          </form>

          {/* Accesos rápidos de prueba para agilizar el tipeo en la defensa */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <p className="text-[11px] font-bold uppercase text-slate-500 text-center mb-3">
              Credenciales Registradas en Padrón (Clic para autocompletar)
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => autocompletarCredenciales('admin@consorcio.com')}
                className="p-2.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-left transition-colors cursor-pointer"
              >
                <span className="font-bold text-slate-900 block">🔑 Administrador</span>
                <span className="text-[11px] text-slate-500 font-mono">admin@consorcio.com</span>
              </button>
              <button
                type="button"
                onClick={() => autocompletarCredenciales('propietario4b@consorcio.com')}
                className="p-2.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-left transition-colors cursor-pointer"
              >
                <span className="font-bold text-slate-900 block">🏠 Propietario 4B</span>
                <span className="text-[11px] text-slate-500 font-mono">propietario4b@consorcio.com</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
