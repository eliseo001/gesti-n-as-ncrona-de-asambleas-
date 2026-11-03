'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import TabValidacionKyc from '../../components/admin/TabValidacionKyc';
import TabCartasPoder from '../../components/admin/TabCartasPoder';
import TabGestionAvanzada from '../../components/admin/TabGestionAvanzada';
import TabVotoAsistido from '../../components/admin/TabVotoAsistido';
import TabContingencias from '../../components/admin/TabContingencias';
import TabConfiguracion from '../../components/admin/TabConfiguracion';
import TabTrazabilidad from '../../components/admin/TabTrazabilidad';
import TabGestionActas from '../../components/admin/TabGestionActas'; // Incorporamos el Sprint 3

export default function AdminDashboard() {
    const router = useRouter();
    const { tabAdminActiva: tabActiva, setTabAdminActiva: setTabActiva } = useAuth();

    // 1. Estado: Unidades y Coeficientes
    const [unidades, setUnidades] = useState([
        { id: 1, depto: '1A', email: 'juan@margaritas.com', coeficiente: 40.5 },
        { id: 2, depto: '2B', email: 'maria@margaritas.com', coeficiente: 30.0 },
        { id: 3, depto: '4B', email: 'ana@margaritas.com', coeficiente: 29.5 },
    ]);
    const [nuevaUnidad, setNuevaUnidad] = useState({ depto: '', email: '', coeficiente: '' });

    // Cálculo dinámico del coeficiente total
    const totalCoeficiente = unidades.reduce((acc, curr) => acc + Number(curr.coeficiente), 0);

    // 2. Estado: Configuración de Asamblea
    const [asamblea, setAsamblea] = useState({ titulo: '', fechaInicio: '', fechaFin: '' });

    // 3. Estado: Orden del Día
    const [temas, setTemas] = useState([
        { id: 100, titulo: 'Designación de Presidente y 2 Propietarios para firmar el Acta', descripcion: 'Punto de forma obligatorio por Art. 2062 CCyCN.' },
        { id: 101, titulo: 'Aprobación de presupuesto para pintura de fachada', descripcion: 'Comparativa de 3 presupuestos de contratistas matriculados.' },
    ]);
    const [nuevoTema, setNuevoTema] = useState({ titulo: '', descripcion: '', mayoria: 'ABSOLUTA' });

    // Funciones manejadoras (Mocks)
    const agregarUnidad = (e) => {
        e.preventDefault();
        if (!nuevaUnidad.depto || !nuevaUnidad.coeficiente) return;
        setUnidades([...unidades, { ...nuevaUnidad, id: Date.now(), coeficiente: Number(nuevaUnidad.coeficiente) }]);
        setNuevaUnidad({ depto: '', email: '', coeficiente: '' });
    };

    const agregarTema = (e) => {
        e.preventDefault();
        if (!nuevoTema.titulo) return;
        setTemas([...temas, { ...nuevoTema, id: Date.now() }]);
        setNuevoTema({ titulo: '', descripcion: '', mayoria: 'ABSOLUTA' });
    };

    const publicarConvocatoria = () => {
        if (totalCoeficiente !== 100) {
            alert('Error: Los coeficientes deben sumar exactamente 100% antes de convocar.');
            return;
        }
        alert(`✅ ¡Asamblea Publicada!\nSe han despachado cédulas digitales fehacientes a los ${unidades.length} propietarios registrados.`);
    };

    return (
        <div className="min-h-screen bg-slate-100 p-6 font-sans">
            <div className="max-w-7xl mx-auto">

                {/* Header del Administrador */}
                <header className="bg-slate-900 text-white p-6 rounded-xl shadow-lg mb-6 flex flex-col md:flex-row justify-between items-center border border-slate-800 gap-4">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
                            Administración Consorcial Regulada • Ley N° 26.994
                        </span>
                        <h1 className="text-2xl font-bold mt-1">ConsorcioSync - Panel de Control</h1>
                        <p className="text-slate-400 text-sm mt-0.5">
                            Auditoría de Padrón, Cartas Poder y Gobernanza de Asambleas
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push('/asamblea/tema/1')}
                            className="bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow transition-colors cursor-pointer whitespace-nowrap"
                        >
                            🔍 Sala Tema 1 (Monitor de Urna) →
                        </button>
                        <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 text-right hidden lg:block whitespace-nowrap">
                            <span className="text-xs text-slate-400 block">Rol del Sistema</span>
                            <span className="text-sm font-bold text-emerald-400">● Administrador Matriculado</span>
                        </div>
                    </div>
                </header>

                {/* Sistema de Pestañas (Tabs) */}
                <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-300 pb-2">
                    <button onClick={() => setTabActiva('kyc')} className={`px-4 py-2.5 rounded-t-lg font-bold text-sm transition-colors ${tabActiva === 'kyc' ? 'bg-blue-700 text-white shadow' : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'}`}>🛡️ 1. KYC y Acuses</button>
                    <button onClick={() => setTabActiva('poderes')} className={`px-4 py-2.5 rounded-t-lg font-bold text-sm transition-colors ${tabActiva === 'poderes' ? 'bg-blue-700 text-white shadow' : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'}`}>📜 2. Cartas Poder</button>
                    <button onClick={() => setTabActiva('avanzada')} className={`px-4 py-2.5 rounded-t-lg font-bold text-sm transition-colors ${tabActiva === 'avanzada' ? 'bg-blue-700 text-white shadow' : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'}`}>⚖️ 3. Multi-Unidad y Mora</button>
                    <button onClick={() => setTabActiva('contingencias')} className={`px-4 py-2.5 rounded-t-lg font-bold text-sm transition-colors ${tabActiva === 'contingencias' ? 'bg-blue-700 text-white shadow' : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'}`}>⚠️ 4. Contingencias</button>
                    <button onClick={() => setTabActiva('votoAsistido')} className={`px-4 py-2.5 rounded-t-lg font-bold text-sm transition-colors ${tabActiva === 'votoAsistido' ? 'bg-blue-700 text-white shadow' : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'}`}>🗳️ 5. Voto Asistido</button>
                    <button onClick={() => setTabActiva('unidades')} className={`px-4 py-2.5 rounded-t-lg font-bold text-sm transition-colors ${tabActiva === 'unidades' ? 'bg-blue-700 text-white shadow' : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'}`}>🏢 6. Padrón (CSV)</button>
                    <button onClick={() => setTabActiva('asamblea')} className={`px-4 py-2.5 rounded-t-lg font-bold text-sm transition-colors ${tabActiva === 'asamblea' ? 'bg-blue-700 text-white shadow' : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'}`}>📅 7. Ventana Asamblea</button>
                    <button onClick={() => setTabActiva('temas')} className={`px-4 py-2.5 rounded-t-lg font-bold text-sm transition-colors ${tabActiva === 'temas' ? 'bg-blue-700 text-white shadow' : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'}`}>📋 8. Orden del Día</button>
                    <button onClick={() => setTabActiva('actas')} className={`px-4 py-2.5 rounded-t-lg font-bold text-sm transition-colors ${tabActiva === 'actas' ? 'bg-blue-700 text-white shadow' : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'}`}>🖋️ 9. Gestión Actas</button>
                    <button onClick={() => setTabActiva('configuracion')} className={`px-4 py-2.5 rounded-t-lg font-bold text-sm transition-colors ${tabActiva === 'configuracion' ? 'bg-blue-700 text-white shadow' : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'}`}>⚙️ 10. Configuración</button>
                    <button onClick={() => setTabActiva('trazabilidad')} className={`px-4 py-2.5 rounded-t-lg font-bold text-sm transition-colors ${tabActiva === 'trazabilidad' ? 'bg-blue-700 text-white shadow' : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'}`}>📡 11. Trazabilidad</button>
                </div>

                {/* CONTENIDO DE LAS PESTAÑAS */}
                <div className="bg-white p-6 md:p-8 rounded-xl shadow-md border border-slate-200 min-h-[500px]">

                    {tabActiva === 'kyc' && <TabValidacionKyc />}
                    {tabActiva === 'poderes' && <TabCartasPoder />}
                    {tabActiva === 'avanzada' && <TabGestionAvanzada />}
                    {tabActiva === 'contingencias' && <TabContingencias />}
                    {tabActiva === 'votoAsistido' && <TabVotoAsistido />}
                    {tabActiva === 'actas' && <TabGestionActas />}
                    {tabActiva === 'configuracion' && <TabConfiguracion />}
                    {tabActiva === 'trazabilidad' && <TabTrazabilidad />}

                    {/* TAB 6: UNIDADES (ONBOARDING Y PADRÓN) */}
                    {tabActiva === 'unidades' && (
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-4 gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">Padrón Registrado y Unidades</h2>
                                    <p className="text-sm text-slate-600">Importación masiva de titulares y despacho de invitaciones (Magic Links).</p>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <button className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-lg border border-slate-300 transition-colors">
                                        📁 Importar CSV
                                    </button>
                                    <button className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow transition-colors">
                                        ✉️ Despachar Magic Links (KYC)
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="md:col-span-1">
                                    <h3 className="font-bold text-slate-800 mb-3 text-sm">Carga Manual</h3>
                                    <form onSubmit={agregarUnidad} className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Nº Departamento</label>
                                            <input type="text" className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-sm" placeholder="Ej: 4B" value={nuevaUnidad.depto} onChange={e => setNuevaUnidad({ ...nuevaUnidad, depto: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Email del Propietario</label>
                                            <input type="email" className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-sm" placeholder="correo@margaritas.com" value={nuevaUnidad.email} onChange={e => setNuevaUnidad({ ...nuevaUnidad, email: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Coeficiente (%)</label>
                                            <input type="number" step="0.01" className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-sm" placeholder="Ej: 4.15" value={nuevaUnidad.coeficiente} onChange={e => setNuevaUnidad({ ...nuevaUnidad, coeficiente: e.target.value })} />
                                        </div>
                                        <button type="submit" className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-lg hover:bg-slate-800 text-sm">Agregar al Padrón</button>
                                    </form>
                                </div>

                                <div className="md:col-span-2">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="font-bold text-slate-800 text-sm">Titulares Actuales</h3>
                                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${totalCoeficiente === 100 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
                                            Total: {totalCoeficiente}% {totalCoeficiente !== 100 && '(Debe sumar 100%)'}
                                        </span>
                                    </div>
                                    <div className="overflow-y-auto max-h-[350px] border border-slate-200 rounded-xl">
                                        <table className="min-w-full text-left text-sm">
                                            <thead className="bg-slate-800 text-white text-[11px] uppercase">
                                                <tr>
                                                    <th className="p-3 font-semibold">Depto</th>
                                                    <th className="p-3 font-semibold">Email</th>
                                                    <th className="p-3 font-semibold">Coef.</th>
                                                    <th className="p-3 font-semibold text-center">Estado Acceso</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200">
                                                {unidades.map(u => (
                                                    <tr key={u.id} className="hover:bg-slate-50">
                                                        <td className="p-3 font-bold text-slate-800">UF {u.depto}</td>
                                                        <td className="p-3 text-slate-600">{u.email}</td>
                                                        <td className="p-3 text-blue-700 font-bold">{u.coeficiente}%</td>
                                                        <td className="p-3 text-center">
                                                            <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-300 px-2 py-1 rounded font-bold whitespace-nowrap">
                                                                Pendiente Onboarding
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 7: ASAMBLEA */}
                    {tabActiva === 'asamblea' && (
                        <div className="max-w-2xl mx-auto">
                            <h2 className="text-xl font-bold text-slate-800 mb-6">Ventana Temporal de la Asamblea</h2>
                            <div className="space-y-5 bg-slate-50 p-6 rounded-xl border border-slate-200">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Título de la Convocatoria</label>
                                    <input type="text" className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-sm" placeholder="Ej: Asamblea Extraordinaria Noviembre 2026" value={asamblea.titulo} onChange={e => setAsamblea({ ...asamblea, titulo: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Inicio (Apertura de Votos)</label>
                                        <input type="datetime-local" className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-sm" value={asamblea.fechaInicio} onChange={e => setAsamblea({ ...asamblea, fechaInicio: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Fin (Cierre Automático)</label>
                                        <input type="datetime-local" className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-sm" value={asamblea.fechaFin} onChange={e => setAsamblea({ ...asamblea, fechaFin: e.target.value })} />
                                    </div>
                                </div>
                                <button onClick={() => setTabActiva('temas')} className="w-full bg-blue-700 text-white font-bold py-3 rounded-lg mt-4 hover:bg-blue-800 text-sm shadow">Guardar y Continuar al Orden del Día →</button>
                            </div>
                        </div>
                    )}

                    {/* TAB 8: TEMAS Y PUBLICACIÓN (MAYORÍAS DINÁMICAS CCYCN) */}
                    {tabActiva === 'temas' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 mb-4">Agregar Tema al Orden del Día</h2>
                                <form onSubmit={agregarTema} className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Título del Tema</label>
                                        <input type="text" className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-sm" placeholder="Ej: Modificación del Reglamento" value={nuevoTema.titulo} onChange={e => setNuevoTema({ ...nuevoTema, titulo: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Descripción / Propuesta</label>
                                        <textarea className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-sm h-24" placeholder="Detalle técnico..." value={nuevoTema.descripcion} onChange={e => setNuevoTema({ ...nuevoTema, descripcion: e.target.value })}></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Tipo de Mayoría Requerida (CCyCN)</label>
                                        <select
                                            className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500"
                                            onChange={e => setNuevoTema({ ...nuevoTema, mayoria: e.target.value })}
                                            value={nuevoTema.mayoria}
                                        >
                                            <option value="ABSOLUTA">Mayoría Absoluta ({'>'}50%) - Art. 2060</option>
                                            <option value="DOS_TERCIOS">Dos Tercios (66.6%) - Art. 2057</option>
                                            <option value="UNANIMIDAD">Unanimidad (100%) - Art. 2052</option>
                                        </select>
                                    </div>
                                    <button type="submit" className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-lg hover:bg-slate-800 text-sm shadow">Añadir al Orden del Día</button>
                                </form>
                            </div>

                            <div className="flex flex-col h-full">
                                <h2 className="text-xl font-bold text-slate-800 mb-4">Orden del Día Configurado</h2>
                                <div className="flex-grow space-y-3 mb-6 overflow-y-auto max-h-[380px] pr-2">
                                    {temas.map((t, index) => (
                                        <div key={t.id} className="bg-slate-50 p-4 border border-slate-200 rounded-lg shadow-sm">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-blue-700 text-xs">Tema {index}</span>
                                                {t.mayoria && (
                                                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">
                                                        {t.mayoria === 'ABSOLUTA' ? '>50% Absoluta' : t.mayoria === 'DOS_TERCIOS' ? '66.6% (2/3)' : '100% Unanimidad'}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="font-semibold text-slate-800 text-sm">{t.titulo}</span>
                                            {t.descripcion && <p className="text-xs text-slate-500 mt-1.5">{t.descripcion}</p>}
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mt-auto">
                                    <p className="text-xs text-blue-900 mb-3 text-center font-medium">
                                        Al publicar, se despacharán las cédulas digitales y se exigirá acuse de recibo.
                                    </p>
                                    <button
                                        onClick={publicarConvocatoria}
                                        className="w-full bg-emerald-700 text-white font-bold py-3 rounded-lg shadow hover:bg-emerald-800 transition-colors text-sm"
                                    >
                                        🚀 Publicar Convocatoria Oficial
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}