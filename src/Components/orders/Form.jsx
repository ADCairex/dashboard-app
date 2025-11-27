import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog.jsx";
import { Button } from "@/Components/ui/button.jsx";
import { Input } from "@/Components/ui/input.jsx";
import { Label } from "@/Components/ui/label.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select.jsx";
import { Save, X, Plus, Trash2 } from 'lucide-react';
import { apiClient } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';

export default function OrderForm({ order, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    collected: false,
    black_list: false,
    date: new Date().toISOString().slice(0, 16),
    collection_place: '',
    observations: '',
    items: []
  });
  const [isSaving, setIsSaving] = useState(false);

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiClient.entities.Product.list('-created_date'),
    enabled: isOpen
  });

  useEffect(() => {
    if (isOpen) {
      if (order) {
        setFormData({
          name: order.name || '',
          phone: order.phone || '',
          collected: order.collected || false,
          black_list: order.black_list || false,
          date: order.date ? new Date(order.date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
          collection_place: order.collection_place || '',
          observations: order.observations || '',
          items: order.items || []
        });
      } else {
        setFormData({
          name: '',
          phone: '',
          collected: false,
          black_list: false,
          date: new Date().toISOString().slice(0, 16),
          collection_place: '',
          observations: '',
          items: []
        });
      }
    }
  }, [order, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    await onSave(formData, order?.id);
    setIsSaving(false);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        product_id: '',
        amount: 1,
        unit_price: 0
      }]
    }));
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      
      // If product changed, update price
      if (field === 'product_id' && value) {
        const product = products.find(p => p.id === value);
        if (product) {
          const metadata = typeof product.metadata === 'string' 
            ? JSON.parse(product.metadata) 
            : product.metadata || {};
          newItems[index].unit_price = parseFloat(metadata.precio || 0);
        }
      }
      
      return { ...prev, items: newItems };
    });
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.amount * item.unit_price), 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            {order ? 'Editar Pedido' : 'Nuevo Pedido'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Customer information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Información del Cliente</h3>
            
            <div>
              <Label htmlFor="name" className="text-sm font-semibold text-slate-700">
                Nombre *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Customer name"
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">
                Teléfono *
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+34 600 000 000"
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="collection_place" className="text-sm font-semibold text-slate-700">
                Lugar de Recogida
              </Label>
              <Input
                id="collection_place"
                value={formData.collection_place}
                onChange={(e) => handleChange('collection_place', e.target.value)}
                placeholder="Collection address"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="date" className="text-sm font-semibold text-slate-700">
                Fecha y Hora
              </Label>
              <Input
                id="date"
                type="datetime-local"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="observations" className="text-sm font-semibold text-slate-700">
                Observaciones
              </Label>
              <Input
                id="observations"
                value={formData.observations}
                onChange={(e) => handleChange('observations', e.target.value)}
                placeholder="Additional notes"
                className="mt-2"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="collected"
                  checked={formData.collected}
                  onChange={(e) => handleChange('collected', e.target.checked)}
                  className="rounded border-slate-300"
                />
                <Label htmlFor="collected" className="text-sm font-medium text-slate-700 cursor-pointer">
                  Recogido
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="black_list"
                  checked={formData.black_list}
                  onChange={(e) => handleChange('black_list', e.target.checked)}
                  className="rounded border-slate-300"
                />
                <Label htmlFor="black_list" className="text-sm font-medium text-slate-700 cursor-pointer">
                  Lista Negra
                </Label>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Productos *</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                className="text-blue-600 hover:text-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Añadir Producto
              </Button>
            </div>

            {formData.items.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                <p className="text-slate-500 text-sm">No hay productos en el pedido</p>
              </div>
            ) : (
              <div className="space-y-3">
                {formData.items.map((item, index) => {
                  const product = products.find(p => p.id === item.product_id);
                  const metadata = product && typeof product.metadata === 'string' 
                    ? JSON.parse(product.metadata) 
                    : product?.metadata || {};
                  
                  return (
                    <div key={index} className="bg-slate-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 space-y-3">
                          <div>
                            <Label className="text-xs text-slate-600">Producto</Label>
                            <Select
                              value={item.product_id}
                              onValueChange={(value) => updateItem(index, 'product_id', value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select a product" />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map((product) => {
                                  const prodMetadata = typeof product.metadata === 'string' 
                                    ? JSON.parse(product.metadata) 
                                    : product.metadata || {};
                                  return (
                                    <SelectItem key={product.id} value={product.id}>
                                      {prodMetadata.titulo || product.text} - €{parseFloat(prodMetadata.precio || 0).toFixed(2)}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs text-slate-600">Cantidad</Label>
                              <Input
                                type="number"
                                min="1"
                                value={item.amount}
                                onChange={(e) => updateItem(index, 'amount', parseInt(e.target.value) || 1)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-slate-600">Precio Unitario</Label>
                              <div className="relative mt-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">€</span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={item.unit_price}
                                  onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                  className="pl-7"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="text-sm font-medium text-slate-900">
                            Subtotal: €{(item.amount * item.unit_price).toFixed(2)}
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {formData.items.length > 0 && (
              <div className="flex justify-between items-center pt-4 border-t border-slate-300">
                <span className="text-lg font-semibold text-slate-900">Total del Pedido</span>
                <span className="text-2xl font-bold text-blue-600">
                  €{calculateTotal().toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSaving || formData.items.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Order'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}