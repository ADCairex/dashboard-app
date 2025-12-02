import React, { useState } from 'react';
import { apiClient } from '@/api/apiClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/Components/ui/button.jsx";
import { Input } from "@/Components/ui/input.jsx";
import { RefreshCw, Search } from 'lucide-react';
import ProductsTable from '../Components/products/Table';

export default function Products() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiClient.entities.Product.list('-created_date')
  });

  const filteredProducts = products.filter(product => {
    console.log(product);
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
          <p className="text-slate-600">Visualiza tus productos</p>
        </div>
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
          onEdit={null}
          onDelete={null}
        />
      )}
    </div>
  );
}