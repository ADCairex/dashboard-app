import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog.jsx";
import { Button } from "@/Components/ui/button.jsx";
import { Input } from "@/Components/ui/input.jsx";
import { Textarea } from "@/Components/ui/textarea.jsx";
import { Label } from "@/Components/ui/label.jsx";
import { Save, X } from 'lucide-react';

export default function ProductForm({ product, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    text: '',
    metadata: {
      titulo: '',
      descripcion: '',
      precio: '',
      imagen_url: '',
      categoria: ''
    }
  });
  const [isSaving, setIsSaving] = useState(false);

  // Inicializar datos cuando se abre el modal o cambia el producto
  useEffect(() => {
    if (isOpen) {
      if (product) {
        const metadata = typeof product.metadata === 'string' 
          ? JSON.parse(product.metadata) 
          : product.metadata || {};
        
        setFormData({
          text: product.text || '',
          metadata: {
            titulo: metadata.titulo || '',
            descripcion: metadata.descripcion || '',
            precio: metadata.precio || '',
            imagen_url: metadata.imagen_url || '',
            categoria: metadata.categoria || ''
          }
        });
      } else {
        setFormData({
          text: '',
          metadata: {
            titulo: '',
            descripcion: '',
            precio: '',
            imagen_url: '',
            categoria: ''
          }
        });
      }
    }
  }, [product, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    const dataToSave = {
      text: formData.text,
      metadata: {
        ...formData.metadata,
        precio: parseFloat(formData.metadata.precio)
      }
    };
    
    await onSave(dataToSave, product?.id);
    setIsSaving(false);
  };

  const handleChange = (field, value) => {
    if (field === 'text') {
      setFormData(prev => ({ ...prev, text: value }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        metadata: { ...prev.metadata, [field]: value }
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label htmlFor="text" className="text-sm font-semibold text-slate-700">
                Texto del Producto *
              </Label>
              <Input
                id="text"
                value={formData.text}
                onChange={(e) => handleChange('text', e.target.value)}
                placeholder="Descripción breve del producto"
                required
                className="mt-2"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="titulo" className="text-sm font-semibold text-slate-700">
                Nombre del Producto *
              </Label>
              <Input
                id="titulo"
                value={formData.metadata?.titulo || ''}
                onChange={(e) => handleChange('titulo', e.target.value)}
                placeholder="Ej: Pizza Margarita"
                required
                className="mt-2"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="descripcion" className="text-sm font-semibold text-slate-700">
                Descripción
              </Label>
              <Textarea
                id="descripcion"
                value={formData.metadata?.descripcion || ''}
                onChange={(e) => handleChange('descripcion', e.target.value)}
                placeholder="Describe tu producto..."
                rows={3}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="precio" className="text-sm font-semibold text-slate-700">
                Precio *
              </Label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">€</span>
                <Input
                  id="precio"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.metadata?.precio || ''}
                  onChange={(e) => handleChange('precio', e.target.value)}
                  placeholder="0.00"
                  required
                  className="pl-7"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="categoria" className="text-sm font-semibold text-slate-700">
                Categoría
              </Label>
              <Input
                id="categoria"
                value={formData.metadata?.categoria || ''}
                onChange={(e) => handleChange('categoria', e.target.value)}
                placeholder="Ej: Pizzas"
                className="mt-2"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="imagen_url" className="text-sm font-semibold text-slate-700">
                URL de la Imagen
              </Label>
              <Input
                id="imagen_url"
                type="url"
                value={formData.metadata?.imagen_url || ''}
                onChange={(e) => handleChange('imagen_url', e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="mt-2"
              />
              <p className="text-xs text-slate-500 mt-1">
                Pega la URL de una imagen desde internet
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}