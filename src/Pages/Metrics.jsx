import React from 'react';
import { useQuery } from '@tanstack/react-query';
// No date-fns, use native JS Date
import { 
  TrendingUp, 
  ShoppingBag, 
  Euro, 
  Users, 
  Package,
  Trophy,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORES = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Metricas() {
  // Fetch orders from our API
  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ['orders-metrics'],
    queryFn: async () => {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Failed to fetch orders');
      return res.json();
    }
  });

  // Fetch products from our API
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['products-metrics'],
    queryFn: async () => {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    }
  });

  const isLoading = loadingOrders || loadingProducts;

  // Calcular métricas
  // Calculate metrics from orders and products
  const calculateMetrics = () => {
  const today = new Date();
  // Set to start of today
  today.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

    // Orders by period
    const ordersToday = orders.filter(o => {
      const date = new Date(o.created_date);
      return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      );
    });

  const orders7Days = orders.filter(o => new Date(o.created_date) >= sevenDaysAgo);
  const orders30Days = orders.filter(o => new Date(o.created_date) >= thirtyDaysAgo);

    // Revenue
    const revenueToday = ordersToday
      .filter(o => o.status !== 'cancelled' && o.status !== 'cancelado')
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const revenue7Days = orders7Days
      .filter(o => o.status !== 'cancelled' && o.status !== 'cancelado')
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const revenue30Days = orders30Days
      .filter(o => o.status !== 'cancelled' && o.status !== 'cancelado')
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const revenueTotal = orders
      .filter(o => o.status !== 'cancelled' && o.status !== 'cancelado')
      .reduce((sum, o) => sum + (o.total || 0), 0);

    // Best selling products
    const salesByProduct = {};
    orders.filter(o => o.status !== 'cancelled' && o.status !== 'cancelado').forEach(order => {
      order.items?.forEach(item => {
        // Try both English and Spanish field names for compatibility
        const name = item.product_name || item.producto_nombre || 'Sin nombre';
        if (!salesByProduct[name]) {
          salesByProduct[name] = { quantity: 0, revenue: 0 };
        }
        salesByProduct[name].quantity += item.quantity || item.cantidad || 0;
        salesByProduct[name].revenue += (item.quantity || item.cantidad || 0) * (item.unit_price || item.precio_unitario || 0);
      });
    });

    const sortedProducts = Object.entries(salesByProduct)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.quantity - a.quantity);

    // Unique customers
    const uniqueCustomers = [...new Set(orders.map(o => o.customer_phone || o.cliente_telefono || o.customer_name || o.cliente_nombre))];

    // Orders by status
    const ordersByStatus = orders.reduce((acc, o) => {
      const status = o.status || o.estado;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Sales per day (last 7 days)
    const salesByDay = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      const ordersDay = orders.filter(o => {
        const date = new Date(o.created_date);
        return (
          date.getFullYear() === day.getFullYear() &&
          date.getMonth() === day.getMonth() &&
          date.getDate() === day.getDate() &&
          o.status !== 'cancelled' && o.status !== 'cancelado'
        );
      });
      // Get short weekday in Spanish
      const weekday = day.toLocaleDateString('es-ES', { weekday: 'short' });
      salesByDay.push({
        day: weekday.charAt(0).toUpperCase() + weekday.slice(1),
        orders: ordersDay.length,
        revenue: ordersDay.reduce((sum, o) => sum + (o.total || 0), 0)
      });
    }

    // Average ticket
    const completedOrders = orders.filter(o => (o.status !== 'cancelled' && o.status !== 'cancelado') && o.total > 0);
    const averageTicket = completedOrders.length > 0 
      ? revenueTotal / completedOrders.length 
      : 0;

    return {
      ordersToday: ordersToday.length,
      orders7Days: orders7Days.length,
      orders30Days: orders30Days.length,
      totalOrders: orders.length,
      revenueToday,
      revenue7Days,
      revenue30Days,
      revenueTotal,
      topProducts: sortedProducts.slice(0, 5),
      bestProduct: sortedProducts[0],
      uniqueCustomers: uniqueCustomers.length,
      ordersByStatus,
      salesByDay,
      averageTicket
    };
  };

  const metrics = calculateMetrics();

  const statusData = Object.entries(metrics.ordersByStatus).map(([status, count]) => ({
    name: status,
    value: count
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Cargando métricas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Métricas del Negocio</h1>
        <p className="text-slate-600">Análisis de rendimiento y estadísticas de ventas</p>
      </div>

      {/* Main cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-100 flex items-center gap-2">
              <Euro className="h-4 w-4" />
              Ingresos Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">€{metrics.revenueTotal.toFixed(2)}</p>
            <p className="text-sm text-blue-100 mt-1">Hoy: €{metrics.revenueToday.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-100 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Total Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{metrics.totalOrders}</p>
            <p className="text-sm text-green-100 mt-1">Hoy: {metrics.ordersToday}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-100 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Clientes Únicos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{metrics.uniqueCustomers}</p>
            <p className="text-sm text-purple-100 mt-1">{products.length} productos</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-100 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Ticket Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">€{metrics.averageTicket.toFixed(2)}</p>
            <p className="text-sm text-amber-100 mt-1">Por pedido</p>
          </CardContent>
        </Card>
      </div>

      {/* Best product */}
      {metrics.bestProduct && (
        <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-amber-100 flex items-center justify-center">
                <Trophy className="h-8 w-8 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-amber-700 font-medium">Producto Estrella</p>
                <h3 className="text-2xl font-bold text-slate-900">{metrics.bestProduct.name}</h3>
                <p className="text-slate-600 mt-1">
                  {metrics.bestProduct.quantity} unidades vendidas · €{metrics.bestProduct.revenue.toFixed(2)} en ingresos
                </p>
              </div>
              <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-lg px-4 py-2">
                #1
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales last 7 days */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-slate-600" />
              Ventas Últimos 7 Días
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={metrics.salesByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? `€${value.toFixed(2)}` : value,
                    name === 'revenue' ? 'Ingresos' : 'Pedidos'
                  ]}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders by status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-slate-600" />
              Pedidos por Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-slate-600" />
            Productos Más Vendidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.topProducts.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No hay datos de ventas aún</p>
          ) : (
            <div className="space-y-4">
              {metrics.topProducts.map((product, index) => (
                <div 
                  key={product.name} 
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl"
                >
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-amber-500' :
                    index === 1 ? 'bg-slate-400' :
                    index === 2 ? 'bg-amber-700' : 'bg-slate-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{product.name}</h4>
                    <p className="text-sm text-slate-500">{product.quantity} unidades vendidas</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">€{product.revenue.toFixed(2)}</p>
                    <p className="text-xs text-slate-500">ingresos</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Period summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-500 mb-2">Últimos 7 días</p>
            <p className="text-2xl font-bold text-slate-900">€{metrics.revenue7Days.toFixed(2)}</p>
            <p className="text-sm text-slate-600 mt-1">{metrics.orders7Days} pedidos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-500 mb-2">Últimos 30 días</p>
            <p className="text-2xl font-bold text-slate-900">€{metrics.revenue30Days.toFixed(2)}</p>
            <p className="text-sm text-slate-600 mt-1">{metrics.orders30Days} pedidos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-500 mb-2">Promedio diario (7d)</p>
            <p className="text-2xl font-bold text-slate-900">€{(metrics.revenue7Days / 7).toFixed(2)}</p>
            <p className="text-sm text-slate-600 mt-1">{(metrics.orders7Days / 7).toFixed(1)} pedidos/día</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}