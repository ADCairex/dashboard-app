import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog.jsx";
import { Button } from "@/Components/ui/button.jsx";
import { Badge } from "@/Components/ui/badge.jsx";
import { User, MapPin, Phone, Calendar, Package, Pencil, Trash2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function OrderDetail({ order, isOpen, onClose, onEdit, onDelete }) {
  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-slate-900">
                Order Detail
              </DialogTitle>
              <p className="text-sm text-slate-500 font-mono">#{order.id}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(order)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Pencil className="h-4 w-4 mr-1.5" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(order.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Delete
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Información del cliente */}
          <div className="bg-slate-50 rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-slate-900 mb-4">Customer Information</h3>
            
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-white flex items-center justify-center">
                <User className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Name</p>
                <p className="text-sm font-medium text-slate-900">{order.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-white flex items-center justify-center">
                <Phone className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Phone</p>
                <p className="text-sm font-medium text-slate-900">{order.phone}</p>
              </div>
            </div>

            {order.collection_place && (
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-white flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Collection Place</p>
                  <p className="text-sm font-medium text-slate-900">{order.collection_place}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-white flex items-center justify-center">
                <Calendar className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Order Date</p>
                <p className="text-sm font-medium text-slate-900">
                  {order.date ? format(new Date(order.date), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es }) : '-'}
                </p>
              </div>
            </div>

            {order.observations && (
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                  <Package className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Observations</p>
                  <p className="text-sm font-medium text-slate-900">{order.observations}</p>
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-2">
              <Badge className={cn(
                order.collected 
                  ? "bg-green-100 text-green-800 border-green-200" 
                  : "bg-amber-100 text-amber-800 border-amber-200",
                "border flex items-center gap-1.5"
              )}>
                {order.collected ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    Collected
                  </>
                ) : (
                  <>
                    <Clock className="h-3.5 w-3.5 text-amber-600" />
                    Not Collected
                  </>
                )}
              </Badge>

              {order.black_list && (
                <Badge className="bg-red-100 text-red-800 border-red-200 border flex items-center gap-1.5">
                  <XCircle className="h-3.5 w-3.5 text-red-600" />
                  Black List
                </Badge>
              )}
            </div>
          </div>

          {/* Productos */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-slate-600" />
              Products
            </h3>
            <div className="space-y-3">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => {
                  const metadata = item.product_metadata && typeof item.product_metadata === 'string' 
                    ? JSON.parse(item.product_metadata) 
                    : item.product_metadata || {};
                  
                  return (
                    <div key={index} className="bg-white border border-slate-200 rounded-xl p-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-slate-900">
                          {metadata.titulo || item.product_text || 'Product'}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          Amount: {item.amount} × €{parseFloat(item.unit_price || 0).toFixed(2)}
                        </p>
                      </div>
                      <p className="font-semibold text-slate-900">
                        €{parseFloat(item.line_total || 0).toFixed(2)}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No products in this order</p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
              <span className="text-lg font-semibold text-slate-900">Total</span>
              <span className="text-2xl font-bold text-blue-600">
                €{parseFloat(order.total_price || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}