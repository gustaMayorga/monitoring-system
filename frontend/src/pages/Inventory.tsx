import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
    ExclamationIcon, 
    PlusIcon, 
    RefreshIcon,
    SearchIcon 
} from '@heroicons/react/outline';

interface InventoryItem {
    id: number;
    code: string;
    name: string;
    description: string;
    category: string;
    unit: string;
    stock: number;
    min_stock: number;
    price: number;
    supplier_id: number;
    supplier_name?: string;
    location: string;
    last_restock_date: string;
}

interface Supplier {
    id: number;
    name: string;
    contact_person: string;
    email: string;
    phone: string;
}

export default function Inventory() {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showLowStock, setShowLowStock] = useState(false);

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        category: '',
        unit: '',
        stock: 0,
        min_stock: 0,
        price: 0,
        supplier_id: '',
        location: ''
    });

    useEffect(() => {
        fetchInventory();
        fetchSuppliers();
    }, [categoryFilter, showLowStock]);

    const fetchInventory = async () => {
        try {
            const response = await axiosInstance.get('/inventory', {
                params: {
                    category: categoryFilter !== 'all' ? categoryFilter : undefined,
                    low_stock: showLowStock
                }
            });
            if (response.data.status === 'success') {
                setItems(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching inventory:', err);
            setError('Error al cargar inventario');
        } finally {
            setLoading(false);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const response = await axiosInstance.get('/suppliers');
            if (response.data.status === 'success') {
                setSuppliers(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching suppliers:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post('/inventory', formData);
            if (response.data.status === 'success') {
                setShowForm(false);
                setFormData({
                    code: '',
                    name: '',
                    description: '',
                    category: '',
                    unit: '',
                    stock: 0,
                    min_stock: 0,
                    price: 0,
                    supplier_id: '',
                    location: ''
                });
                fetchInventory();
            }
        } catch (err) {
            console.error('Error creating inventory item:', err);
            setError('Error al crear ítem');
        }
    };

    const handleRestock = async (itemId: number, quantity: number) => {
        try {
            const response = await axiosInstance.post(`/inventory/${itemId}/restock`, {
                quantity
            });
            if (response.data.status === 'success') {
                fetchInventory();
            }
        } catch (err) {
            console.error('Error restocking item:', err);
            setError('Error al reabastecer ítem');
        }
    };

    const filteredItems = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStockStatus = (item: InventoryItem) => {
        if (item.stock <= 0) return 'out-of-stock';
        if (item.stock <= item.min_stock) return 'low';
        return 'normal';
    };

    const getStockStatusClass = (status: string) => {
        switch (status) {
            case 'out-of-stock': return 'bg-red-100 text-red-800';
            case 'low': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-green-100 text-green-800';
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Inventario
                </h2>
                <div className="flex space-x-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input pl-10"
                        />
                        <SearchIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="input"
                    >
                        <option value="all">Todas las categorías</option>
                        <option value="cables">Cables</option>
                        <option value="sensors">Sensores</option>
                        <option value="batteries">Baterías</option>
                        <option value="tools">Herramientas</option>
                    </select>
                    <button
                        onClick={() => setShowLowStock(!showLowStock)}
                        className={`btn ${showLowStock ? 'btn-warning' : 'btn-secondary'}`}
                    >
                        <ExclamationIcon className="h-5 w-5 mr-2" />
                        Stock Bajo
                    </button>
                    <button
                        onClick={() => setShowForm(true)}
                        className="btn btn-primary"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Nuevo Ítem
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Código
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Nombre
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Stock
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Precio
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Proveedor
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Ubicación
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredItems.map((item) => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                    {item.code}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    <div>
                                        <div className="font-medium">{item.name}</div>
                                        <div className="text-xs text-gray-400">{item.description}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            getStockStatusClass(getStockStatus(item))
                                        }`}>
                                            {item.stock} {item.unit}
                                        </span>
                                        {item.stock <= item.min_stock && (
                                            <ExclamationIcon className="h-5 w-5 text-yellow-500 ml-2" />
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    ${item.price.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    {item.supplier_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    {item.location}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => setSelectedItem(item)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleRestock(item.id, 10)}
                                        className="text-green-600 hover:text-green-900"
                                    >
                                        Reabastecer
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal de formulario */}
            {showForm && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                {selectedItem ? 'Editar Ítem' : 'Nuevo Ítem'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Campos del formulario */}
                                <button
                                    type="submit"
                                    className="w-full btn btn-primary"
                                >
                                    {selectedItem ? 'Actualizar' : 'Crear'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 