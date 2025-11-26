import React from 'react';
import { Button } from "@/Components/ui/button.jsx";
import { Badge } from "@/Components/ui/badge.jsx";
import { Pencil, Trash2, Package } from 'lucide-react';

export default function ProductsTable({ products, onEdit, onDelete }) {
  if (!products || products.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <div className="h-16 w-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <Package className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay productos aún</h3>
        <p className="text-slate-500">Agrega productos a tu catálogo para empezar a vender</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => {
        const metadata = typeof product.metadata === 'string' 
          ? JSON.parse(product.metadata) 
          : product.metadata || {};
        
        return (
          <div
            key={product.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all group"
          >
            {/* Imagen */}
            <div className="relative h-48 bg-slate-100 overflow-hidden">
              {metadata.imagen_url ? (
                <img
                  src={metadata.imagen_url}
                  alt={metadata.titulo || product.text}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-16 w-16 text-slate-300" />
                </div>
              )}
              {metadata.categoria && (
                <Badge className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-700 border-0 shadow-sm">
                  {metadata.categoria}
                </Badge>
              )}
            </div>

            {/* Contenido */}
            <div className="p-5">
              <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-1">
                {metadata.titulo || product.text}
              </h3>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2 min-h-[2.5rem]">
                {metadata.descripcion || product.text || 'Sin descripción'}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-600">
                  €{parseFloat(metadata.precio || 0).toFixed(2)}
                </span>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(product)}
                    className="text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(product.id)}
                    className="text-slate-600 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}