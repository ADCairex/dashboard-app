import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from "@/Components/ui/badge.jsx";
import { Button } from "@/Components/ui/button.jsx";
import { Eye, CheckCircle2, XCircle, Package } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function OrdersTable({ orders, onViewDetail, onUpdateStatus }) {
  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <div className="h-16 w-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <Package className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay pedidos aún</h3>
        <p className="text-slate-500">Los pedidos de tus clientes aparecerán aquí</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Observaciones
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Dirección
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Recogido
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Lista Negra
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {orders.map((order) => {
              return (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono text-slate-600">
                      #{order.id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        {order.name}
                      </div>
                      {order.phone && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          {order.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-600">
                      {order.date ? format(new Date(order.date), "d 'de' MMM, HH:mm", { locale: es }) : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-slate-900">
                      €{parseFloat(order.total_price || 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-600">
                      {order.observations || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-600">
                      {order.collection_place || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge 
                      onClick={() => onUpdateStatus && onUpdateStatus(order.id, 'collected', !order.collected)}
                      className={cn(
                        order.collected 
                          ? "bg-green-100 text-green-800 border-green-200" 
                          : "bg-amber-100 text-amber-800 border-amber-200",
                        "border flex items-center gap-1.5 w-fit cursor-pointer hover:opacity-80 transition-opacity"
                      )}
                    >
                      {order.collected ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                          Sí
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3.5 w-3.5 text-amber-600" />
                          No
                        </>
                      )}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge 
                      onClick={() => onUpdateStatus && onUpdateStatus(order.id, 'black_list', !order.black_list)}
                      className={cn(
                        order.black_list 
                          ? "bg-red-100 text-red-800 border-red-200" 
                          : "bg-slate-100 text-slate-800 border-slate-200",
                        "border flex items-center gap-1.5 w-fit cursor-pointer hover:opacity-80 transition-opacity"
                      )}
                    >
                      {order.black_list ? (
                        <>
                          <XCircle className="h-3.5 w-3.5 text-red-600" />
                          Sí
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-slate-600" />
                          No
                        </>
                      )}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onViewDetail(order)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Eye className="h-4 w-4 mr-1.5" />
                      Ver detalle
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}