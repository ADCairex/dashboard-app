import React, { useState } from 'react';
import { apiClient } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/Components/ui/button.jsx";
import { Input } from "@/Components/ui/input.jsx";
import { Plus, RefreshCw, Search } from 'lucide-react';
import ProductsTable from '../Components/products/Table';
import ProductForm from '../Components/products/Form';

export default function Products() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiClient.entities.Product.list('-created_date')
  });

  const createProductMutation = useMutation({
    mutationFn: (data) => apiClient.entities.Product.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsModalOpen(false);
      setEditingProduct(null);
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }) => apiClient.entities.Product.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsModalOpen(false);
      setEditingProduct(null);
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id) => apiClient.entities.Product.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  const handleSave = async (data, id) => {
    if (id) {
      await updateProductMutation.mutateAsync({ id, data });
    } else {
      await createProductMutation.mutateAsync(data);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProductMutation.mutateAsync(id);
    }
  };

  const filteredProducts = products.filter(product => {
    const metadata = typeof product.metadata === 'string' 
      ? JSON.parse(product.metadata) 
      : product.metadata || {};
    
    const searchText = searchTerm.toLowerCase();
    return (
      product.text?.toLowerCase().includes(searchText) ||
      metadata.titulo?.toLowerCase().includes(searchText) ||
      metadata.descripcion?.toLowerCase().includes(searchText) ||
      metadata.categoria?.toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Catálogo de Productos</h1>
          <p className="text-slate-600">Gestiona tus productos</p>
        </div>
        <Button
          onClick={handleNew}
          className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      {/* Statistics */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
        <p className="text-blue-100 mb-1">Total de Productos</p>
        <p className="text-4xl font-bold">{products.length}</p>
        <p className="text-sm text-blue-100 mt-2">
          {products.length === 1 ? 'producto en tu catálogo' : 'productos en tu catálogo'}
        </p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Buscar productos por nombre, descripción o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['products'] })}
            className="hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Products */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <RefreshCw className="h-8 w-8 text-slate-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading products...</p>
        </div>
      ) : (
        <ProductsTable
          products={filteredProducts}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Form modal */}
      <ProductForm
        product={editingProduct}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
}