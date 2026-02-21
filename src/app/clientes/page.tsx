
"use client";

import { useEffect, useState } from "react";
import {
    Search,
    MapPin,
    Settings,
    Filter,
    Download,
    Plus,
    MessageCircle,
    Pencil,
    Trash2,
    CheckCircle,
    CreditCard
} from "lucide-react";
import { apiService } from "@/lib/api";
import { NODOS } from "@/lib/constants";
import { formatCOP, makeWhatsAppLink, cn, getNodeColor } from "@/lib/utils";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import ClientForm from "@/components/ClientForm";
import PaymentForm from "@/components/PaymentForm";
import ClientDetailView from "@/components/ClientDetailView";
import { motion, AnimatePresence } from "framer-motion";

export default function ClientesPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterEstado, setFilterEstado] = useState("TODOS");
    const [filterNodo, setFilterNodo] = useState("TODOS");
    const [sortBy, setSortBy] = useState<'ID' | 'NOMBRE'>('ID');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'payment' | 'view' | 'delete'>('create');
    const [selectedClient, setSelectedClient] = useState<any | null>(null);
    const [deleteStep, setDeleteStep] = useState(1);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const clients = await apiService.getClientes();
            setData(clients);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = () => {
        setSelectedClient(null);
        setModalMode('create');
        setIsModalOpen(true);
    };

    const handleView = (cliente: any) => {
        setSelectedClient(cliente);
        setModalMode('view');
        setIsModalOpen(true);
    };

    const handleEdit = (cliente: any) => {
        setSelectedClient(cliente);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handlePayment = (cliente: any) => {
        setSelectedClient(cliente);
        setModalMode('payment');
        setIsModalOpen(true);
    };

    const handleDeleteClick = (cliente: any) => {
        setSelectedClient(cliente);
        setModalMode('delete');
        setDeleteStep(1);
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (deleteStep === 1) {
            setDeleteStep(2);
            return;
        }

        setIsDeleting(true);
        try {
            await apiService.postAction({
                action: 'deleteCliente',
                ID: selectedClient.ID
            });
            handleSuccess();
        } catch (error) {
            console.error("Error al eliminar cliente:", error);
            alert("No se pudo eliminar el cliente. Intente de nuevo.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSuccess = () => {
        setIsModalOpen(false);
        fetchData(); // Refresh data
    };

    const filtered = data.filter(c => {
        const matchSearch =
            c.NOMBRE?.toLowerCase().includes(search.toLowerCase()) ||
            c.DIRECCION?.toLowerCase().includes(search.toLowerCase()) ||
            String(c.ID).includes(search);

        const matchEstado = filterEstado === "TODOS" || c.ESTADO === filterEstado;
        const matchNodo = filterNodo === "TODOS" || c.NODO === filterNodo;

        return matchSearch && matchEstado && matchNodo;
    }).sort((a, b) => {
        if (sortBy === 'NOMBRE') {
            return (a.NOMBRE || "").localeCompare(b.NOMBRE || "");
        }
        return (a.ID || 0) - (b.ID || 0);
    });

    return (
        <div className="space-y-10 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-extrabold text-white tracking-tight">
                        Directorio de <span className="text-gradient">Clientes</span>
                    </h1>
                    <p className="text-slate-400 font-medium mt-2 text-lg">
                        Gestión centralizada de usuarios e infraestructura de red
                    </p>
                </div>

                <button
                    onClick={handleCreate}
                    className="flex items-center gap-3 px-6 py-4 premium-gradient text-white rounded-2xl font-bold transition-all shadow-lg shadow-amber-500/20 active:scale-95 hover:brightness-110"
                >
                    <Plus className="w-6 h-6" />
                    <span>Añadir Cliente</span>
                </button>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col xl:flex-row xl:items-center gap-6 glass-card p-6 border-white/5">
                <div className="flex-1 relative group w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, dirección o ID..."
                        className="w-full pl-14 pr-6 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all text-lg"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
                    <select
                        className="flex-1 xl:flex-none bg-white/[0.03] border border-white/10 text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all font-bold"
                        value={filterEstado}
                        onChange={(e) => setFilterEstado(e.target.value)}
                    >
                        <option value="TODOS" className="bg-slate-900">Todos los Estados</option>
                        <option value="ACTIVO" className="bg-slate-900">Activos</option>
                        <option value="SUSPENDIDO" className="bg-slate-900">Suspendidos</option>
                        <option value="INACTIVO" className="bg-slate-900">Inactivos</option>
                    </select>

                    <select
                        className="flex-1 xl:flex-none bg-white/[0.03] border border-white/10 text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all font-bold"
                        value={filterNodo}
                        onChange={(e) => setFilterNodo(e.target.value)}
                    >
                        <option value="TODOS" className="bg-slate-900">Todos los Nodos</option>
                        {NODOS.map(n => (
                            <option key={n} value={n} className="bg-slate-900">{n}</option>
                        ))}
                    </select>

                    <select
                        className="flex-1 xl:flex-none bg-white/[0.03] border border-white/10 text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all font-bold"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'ID' | 'NOMBRE')}
                    >
                        <option value="ID" className="bg-slate-900">Ordenar por ID</option>
                        <option value="NOMBRE" className="bg-slate-900">Ordenar por Nombre (A-Z)</option>
                    </select>

                    <button className="p-4 glass-card border-white/10 text-slate-400 hover:text-amber-400 transition-all hover:scale-105 ml-auto xl:ml-0">
                        <Download className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Table Section */}
            <div className="glass-card border-white/5 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ID / Identificación</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ubicación & Red</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Estado</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Suscripción</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Acciones Rápidas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-32 text-center text-slate-500 font-medium">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-12 h-12 border-4 border-amber-500/10 border-t-amber-500 rounded-full animate-spin" />
                                                <span className="text-xl font-bold text-gradient">Sincronizando base de datos...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-32 text-center text-slate-500 font-medium">
                                            <div className="flex flex-col items-center gap-2">
                                                <Filter className="w-12 h-12 text-slate-700 mb-2" />
                                                <span className="text-lg">No se encontraron clientes coincidentes</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((cliente, idx) => (
                                        <motion.tr
                                            key={cliente.ID || idx}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="group hover:bg-white/[0.03] transition-all duration-300"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 font-black border border-amber-500/10 group-hover:bg-amber-500 group-hover:text-blue-950 transition-all duration-500 shadow-lg">
                                                        {cliente.ID}
                                                    </div>
                                                    <div>
                                                        <button
                                                            onClick={() => handleView(cliente)}
                                                            className="text-white font-bold text-lg hover:text-amber-400 transition-colors text-left"
                                                        >
                                                            {cliente.NOMBRE}
                                                        </button>
                                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">{cliente.USUARIO || 'Sin Identificador'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-slate-400">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 text-amber-500/60" />
                                                        <span className="text-sm font-medium text-slate-300">{cliente.DIRECCION}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn(
                                                            "text-[10px] font-black px-2 py-0.5 rounded border transition-colors",
                                                            getNodeColor(cliente.NODO).bg,
                                                            getNodeColor(cliente.NODO).text,
                                                            getNodeColor(cliente.NODO).border
                                                        )}>
                                                            {cliente.NODO}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <Badge variant={cliente.ESTADO === 'ACTIVO' ? 'success' : cliente.ESTADO === 'SUSPENDIDO' ? 'warning' : 'danger'}>
                                                    {cliente.ESTADO}
                                                </Badge>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-white font-black text-sm italic">{cliente.PLAN}</p>
                                                <p className="text-lg text-amber-400 font-black tracking-tight">{formatCOP(cliente.VALOR)}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <a
                                                        href={makeWhatsAppLink(cliente["WHATSAPP 1"], cliente.NOMBRE)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-3 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20"
                                                        title="Contactar WhatsApp"
                                                    >
                                                        <MessageCircle className="w-5 h-5" />
                                                    </a>
                                                    <button
                                                        className="p-3 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-xl transition-all shadow-lg hover:shadow-blue-500/20"
                                                        title="Registrar Pago"
                                                        onClick={() => handlePayment(cliente)}
                                                    >
                                                        <CreditCard className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        className="p-3 bg-white/5 text-slate-400 hover:bg-amber-500 hover:text-blue-950 rounded-xl transition-all shadow-lg hover:shadow-amber-500/20"
                                                        title="Editar Datos"
                                                        onClick={() => handleEdit(cliente)}
                                                    >
                                                        <Pencil className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-lg hover:shadow-red-500/20"
                                                        title="Eliminar Cliente"
                                                        onClick={() => handleDeleteClick(cliente)}
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={
                    modalMode === 'create' ? "Nuevo Cliente" :
                        modalMode === 'edit' ? "Editar Cliente" :
                            modalMode === 'view' ? "Información Detallada" :
                                modalMode === 'delete' ? "Confirmar Eliminación" :
                                    "Registrar Pago"
                }
            >
                {modalMode === 'payment' ? (
                    <PaymentForm
                        cliente={selectedClient}
                        onSuccess={handleSuccess}
                        onCancel={() => setIsModalOpen(false)}
                    />
                ) : modalMode === 'view' ? (
                    <ClientDetailView
                        cliente={selectedClient}
                        onClose={() => setIsModalOpen(false)}
                    />
                ) : modalMode === 'delete' ? (
                    <div className="p-6 text-center space-y-6">
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-10 h-10 text-red-500" />
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-white">
                                {deleteStep === 1
                                    ? "¿Eliminar este cliente?"
                                    : "¡Atención: Acción Irreversible!"}
                            </h3>
                            <p className="text-slate-400">
                                {deleteStep === 1
                                    ? `¿Estás seguro que deseas eliminar a ${selectedClient.NOMBRE}?`
                                    : `Si confirmas, todos los datos de ${selectedClient.NOMBRE} se borrarán permanentemente de la base de datos.`}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-4 bg-white/5 text-slate-300 rounded-2xl font-bold hover:bg-white/10 transition-all order-2 sm:order-1"
                                disabled={isDeleting}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className={cn(
                                    "flex-1 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 order-1 sm:order-2",
                                    deleteStep === 1
                                        ? "bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white"
                                        : "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20"
                                )}
                            >
                                {isDeleting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    deleteStep === 1 ? "Eliminar" : "Sí, Borrar Definitivamente"
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <ClientForm
                        initialData={selectedClient}
                        onSuccess={handleSuccess}
                        onCancel={() => setIsModalOpen(false)}
                    />
                )}
            </Modal>
        </div>
    );
}
