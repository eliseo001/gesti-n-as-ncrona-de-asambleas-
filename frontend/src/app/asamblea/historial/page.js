'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HistorialActasPage() {
    const router = useRouter();

    // Estado para mostrar el modal/panel de auditoría criptográfica de una asamblea seleccionada
    const [asambleaAuditada, setAsambleaAuditada] = useState(null);

    // Repositorio histórico mockeado (Art. 2062 CCyCN - Conservación del Libro de Actas)
    const [asambleasHistoricas] = useState([
        {
            id: 14,
            codigoActa: 'Acta N° 014/2026',
            titulo: 'Asamblea Extraordinaria - Presupuesto Fachada e Impermeabilización',
            tipo: 'Extraordinaria',
            fechaCierre: '05/11/2026 - 23:59 hs',
            quorum: '68.5% Coef. (14/20 UF)',
            raizMerkleHash: '8c4e2b1a9f07c73c51d2a44e9b6f0012a377b9c21e4d8f6a',
            firmantes: 'María Gómez (UF 2B) y Ana Martínez (UF 4B)',
            estadoImpugnacion: 'Vigente (Plazo Art. 2060: 12 días restantes)',
            cadenaVotos: [
                { id: 'Voto_001_UF4B', anterior: 'GENESIS_HASH', actual: 'a377b9c21e4d8f6a91c0...' },
                { id: 'Voto_002_UF1A', anterior: 'a377b9c21e4d8f6a91c0...', actual: '8c4e2b1a9f07c73c51d2...' },
            ],
        },
        {
            id: 13,
            codigoActa: 'Acta N° 013/2026',
            titulo: 'Asamblea Ordinaria Anual - Aprobación de Balance y Rendición de Cuentas',
            tipo: 'Ordinaria',
            fechaCierre: '15/06/2026 - 23:59 hs',
            quorum: '75.2% Coef. (16/20 UF)',
            raizMerkleHash: '4f91c08a7b2e19d3c65e01a9f82b34c1d7e6f5a4b3c2d1e0',
            firmantes: 'Juan Pérez (UF 1A) y Roberto Sánchez (UF 5A)',
            estadoImpugnacion: 'Firme (Plazo Art. 2060 caducado sin oposiciones)',
            cadenaVotos: [
                { id: 'Voto_001_UF1A', anterior: 'GENESIS_HASH', actual: '1b90e4a8c2d1f03e77a1...' },
                { id: 'Voto_002_UF5A', anterior: '1b90e4a8c2d1f03e77a1...', actual: '4f91c08a7b2e19d3c65e...' },
            ],
        },
        {
            id: 12,
            codigoActa: 'Acta N° 012/2025',
            titulo: 'Asamblea Extraordinaria - Modernización de Ascensores Principales',
            tipo: 'Extraordinaria',
            fechaCierre: '20/11/2025 - 23:59 hs',
            quorum: '81.0% Coef. (17/20 UF)',
            raizMerkleHash: 'e9d2c4b6a8f0123456789abcdef0123456789abcdef01234',
            firmantes: 'Lucía Quiroga (UF 8C) y María Gómez (UF 2B)',
            estadoImpugnacion: 'Firme (Cosa Juzgada Administrativa)',
            cadenaVotos: [
                { id: 'Voto_001_UF8C', anterior: 'GENESIS_HASH', actual: '7c3a9f12e4b08d65a123...' },
                { id: 'Voto_002_UF2B', anterior: '7c3a9f12e4b08d65a123...', actual: 'e9d2c4b6a8f012345678...' },
            ],
        },
    ]);

    const simularDescargaPdf = (asamblea) => {
        // INTEGRACIÓN BACKEND (Spring Boot):
        // GET /api/actas/{idAsamblea}/pdf (application/pdf)
        // Genera el documento firmado digitalmente junto con el QR de validación del Hash SHA-256.
        alert(`📥 Descargando ${asamblea.codigoActa}.pdf\nSello Criptográfico: ${asamblea.raizMerkleHash}`);
    };

    return (
        <div className="min-h-screen bg-slate-100 p-6 font-sans">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Barra de Navegación Superior */}
                <div className="flex justify-between items-center">
                    <button
                        onClick={() => router.push('/asamblea')}
                        className="text-blue-700 font-bold hover:underline flex items-center gap-1 text-sm"
                    >
                        ← Volver al Lobby del Consorcio
                    </button>
                    <span className="text-xs font-mono text-slate-500">
                        Libro de Actas Inmutable • Art. 2062 CCyCN
                    </span>
                </div>

                {/* Encabezado Institucional */}
                <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg border border-slate-800 flex justify-between items-center">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
                            Archivo Histórico Auditado • Ley N° 26.994
                        </span>
                        <h1 className="text-2xl font-bold mt-1">
                            Repositorio de Actas y Auditoría Criptográfica
                        </h1>
                        <p className="text-slate-300 text-sm mt-1">
                            Consulta histórica de resoluciones consorciales con verificación de integridad SHA-256.
                        </p>
                    </div>
                    <div className="text-4xl hidden md:block">📚</div>
                </div>

                {/* Tabla de Asambleas Pasadas */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-5 border-b border-slate-200 flex justify-between items-center">
                        <h2 className="font-bold text-slate-800 text-base">
                            Asambleas Anteriores Registradas en Cadena
                        </h2>
                        <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-3 py-1 rounded-full border border-slate-300">
                            Total: {asambleasHistoricas.length} Actas Selladas
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-slate-800 text-slate-100 uppercase text-xs">
                                <tr>
                                    <th className="p-4 font-semibold">N° Acta / Tipo</th>
                                    <th className="p-4 font-semibold">Título de la Asamblea</th>
                                    <th className="p-4 font-semibold">Fecha de Cierre</th>
                                    <th className="p-4 font-semibold">Doble Mayoría</th>
                                    <th className="p-4 font-semibold text-right">Acciones Legales y Técnicas</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {asambleasHistoricas.map((acta) => (
                                    <tr key={acta.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <span className="font-bold text-slate-900 block">{acta.codigoActa}</span>
                                            <span className="inline-block mt-1 text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded">
                                                {acta.tipo}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <p className="font-semibold text-slate-800">{acta.titulo}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Firmantes: {acta.firmantes}
                                            </p>
                                            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                                                Estado: {acta.estadoImpugnacion}
                                            </p>
                                        </td>
                                        <td className="p-4 text-xs text-slate-600 font-medium whitespace-nowrap">
                                            🗓️ {acta.fechaCierre}
                                        </td>
                                        <td className="p-4 text-xs font-bold text-slate-800 whitespace-nowrap">
                                            {acta.quorum}
                                        </td>
                                        <td className="p-4 text-right whitespace-nowrap space-x-2">
                                            <button
                                                onClick={() => simularDescargaPdf(acta)}
                                                className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm transition-colors cursor-pointer"
                                            >
                                                🖨️ Descargar Acta PDF
                                            </button>
                                            <button
                                                onClick={() => setAsambleaAuditada(acta)}
                                                className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm transition-colors cursor-pointer"
                                            >
                                                🔐 Ver Auditoría Criptográfica
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Panel Desplegable de Auditoría Criptográfica (Hash Chaining) */}
                {asambleaAuditada && (
                    <div className="bg-slate-900 text-slate-100 p-6 rounded-xl shadow-xl border border-slate-700 space-y-4">
                        <div className="flex justify-between items-start border-b border-slate-700 pb-3">
                            <div>
                                <span className="text-xs font-bold uppercase text-emerald-400">
                                    ✓ Verificación Matemática de Inmutabilidad (SHA-256)
                                </span>
                                <h3 className="text-lg font-bold mt-1">
                                    Auditoría Criptográfica: {asambleaAuditada.codigoActa} - {asambleaAuditada.titulo}
                                </h3>
                            </div>
                            <button
                                onClick={() => setAsambleaAuditada(null)}
                                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded border border-slate-600"
                            >
                                ✕ Cerrar Auditoría
                            </button>
                        </div>

                        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs space-y-2">
                            <p className="text-slate-400">
                                Hash Raíz del Acta (Sellado Final):{' '}
                                <span className="text-emerald-400 font-bold break-all">
                                    {asambleaAuditada.raizMerkleHash}
                                </span>
                            </p>
                            <div className="pt-2 space-y-1.5">
                                {asambleaAuditada.cadenaVotos.map((eslabon, i) => (
                                    <div
                                        key={i}
                                        className="flex flex-col md:flex-row md:items-center justify-between bg-slate-900 p-2.5 rounded border border-slate-800 gap-2"
                                    >
                                        <span className="font-bold text-blue-300">{eslabon.id}</span>
                                        <span className="text-slate-400">Prev: {eslabon.anterior}</span>
                                        <span className="text-emerald-300">SHA-256: {eslabon.actual}</span>
                                        <span className="bg-emerald-950 text-emerald-400 border border-emerald-700 px-2 py-0.5 rounded text-[10px]">
                                            BLOQUE VÁLIDO
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

