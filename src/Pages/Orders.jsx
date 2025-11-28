import React, { useState } from 'react';
import { apiClient } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/Components/ui/button.jsx";
import { Input } from "@/Components/ui/input.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select.jsx";
import { RefreshCw, Search, Filter, Calendar, Plus } from 'lucide-react';
import OrdersTable from '../Components/orders/Table';
import OrderDetail from '../Components/orders/Detail';
import OrderForm from '../Components/orders/Form';

export default function Orders() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => apiClient.entities.Order.list('-created_date')
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, ...fields }) => apiClient.entities.Order.update(id, fields),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });

  const saveOrderMutation = useMutation({
    mutationFn: ({ data, id }) => {
      if (id) {
        return apiClient.entities.Order.update(id, data);
      } else {
        return apiClient.entities.Order.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setIsFormModalOpen(false);
      setEditingOrder(null);
      setIsDetailModalOpen(false);
    }
  });

  const deleteOrderMutation = useMutation({
    mutationFn: (id) => apiClient.entities.Order.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setIsDetailModalOpen(false);
    }
  });

  const handleViewDetail = (order) => {
    console.log(order);
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const handleUpdateStatus = async (id, field, value) => {
    await updateStatusMutation.mutateAsync({ id, [field]: value });
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setIsDetailModalOpen(false);
    setIsFormModalOpen(true);
  };

  const handleSaveOrder = async (data, id) => {
    await saveOrderMutation.mutateAsync({ data, id });
  };

  const handleDeleteOrder = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      await deleteOrderMutation.mutateAsync(id);
    }
  };

  const handleNewOrder = () => {
    setEditingOrder(null);
    setIsFormModalOpen(true);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone?.includes(searchTerm) ||
      order.id?.toString().includes(searchTerm.toLowerCase()) ||
      order.collection_place?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by collected status
    let matchesStatus = true;
    if (statusFilter === 'collected') {
      matchesStatus = order.collected === true;
    } else if (statusFilter === 'pending') {
      matchesStatus = order.collected === false;
    }
    
    // Filter by date
    let matchesDate = true;
    if (dateFilter !== 'all' && order.date) {
      const orderDate = new Date(order.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dateFilter === 'today') {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        matchesDate = orderDate >= today && orderDate < tomorrow;
      } else if (dateFilter === 'yesterday') {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        matchesDate = orderDate >= yesterday && orderDate < today;
      } else if (dateFilter === '7days') {
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        matchesDate = orderDate >= sevenDaysAgo;
      } else if (dateFilter === '30days') {
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        matchesDate = orderDate >= thirtyDaysAgo;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const statistics = {
    total: orders.length,
    collected: orders.filter(o => o.collected === true).length,
    pending: orders.filter(o => o.collected === false).length,
    blackList: orders.filter(o => o.black_list === true).length
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Order Management</h1>
          <p className="text-slate-600">Manage all your customer orders</p>
        </div>
        <Button
          onClick={handleNewOrder}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Order
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <p className="text-sm text-slate-600 mb-1">Total Orders</p>
          <p className="text-3xl font-bold text-slate-900">{statistics.total}</p>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-6 shadow-sm">
          <p className="text-sm text-amber-700 mb-1">Pending</p>
          <p className="text-3xl font-bold text-amber-900">{statistics.pending}</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-6 shadow-sm">
          <p className="text-sm text-green-700 mb-1">Collected</p>
          <p className="text-3xl font-bold text-green-900">{statistics.collected}</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-6 shadow-sm">
          <p className="text-sm text-red-700 mb-1">Black List</p>
          <p className="text-3xl font-bold text-red-900">{statistics.blackList}</p>
        </div>
      </div>

      {/* Filters and search */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search by customer, phone or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="collected">Recogido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-48">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las fechas</SelectItem>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="yesterday">Ayer</SelectItem>
                  <SelectItem value="7days">Ultimos 7 días</SelectItem>
                  <SelectItem value="30days">Últimos 30 días</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['orders'] })}
              className="hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Orders table */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <RefreshCw className="h-8 w-8 text-slate-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading orders...</p>
        </div>
      ) : (
        <OrdersTable 
          orders={filteredOrders} 
          onViewDetail={handleViewDetail}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* Detail modal */}
      {selectedOrder && (
        <OrderDetail
          order={selectedOrder}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          onEdit={handleEditOrder}
          onDelete={handleDeleteOrder}
        />
      )}

      {/* Form modal */}
      <OrderForm
        order={editingOrder}
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingOrder(null);
        }}
        onSave={handleSaveOrder}
      />
    </div>
  );
}