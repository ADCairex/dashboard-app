import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  ShoppingBag,
  Euro,
  Users,
  Package,
  Trophy,
  Calendar,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card.jsx";
import { Badge } from "@/Components/ui/badge.jsx";
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
  Cell,
  AreaChart,
  Area
} from 'recharts';

const COLORES = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Metricas() {
  // Fetch orders
  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ['orders-metrics'],
    queryFn: async () => {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Failed to fetch orders');
      return res.json();
    }
  });

  // Fetch product metrics (best sellers)
  const { data: productMetrics, isLoading: loadingProductMetrics } = useQuery({
    queryKey: ['product-metrics'],
    queryFn: async () => {
      const res = await fetch('/api/metrics');
      if (!res.ok) throw new Error('Failed to fetch metrics');
      return res.json();
    }
  });

  const isLoading = loadingOrders || loadingProductMetrics;

  // Calcular métricas
  const calculateMetrics = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    // Orders by period
    const ordersToday = orders.filter(o => {
      const date = new Date(o.date || o.created_date);
      return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      );
    });

    const orders7Days = orders.filter(o => new Date(o.date || o.created_date) >= sevenDaysAgo);
    const orders30Days = orders.filter(o => new Date(o.date || o.created_date) >= thirtyDaysAgo);

    // Revenue
    const revenueToday = ordersToday
      .filter(o => !o.black_list)
      .reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);

    const revenue7Days = orders7Days
      .filter(o => !o.black_list)
      .reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);

    const revenue30Days = orders30Days
      .filter(o => !o.black_list)
      .reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);

    const revenueTotal = orders
      .filter(o => !o.black_list)
      .reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);

    // Unique customers (by phone)
    const uniqueCustomers = [...new Set(orders
      .map(o => o.phone)
      .filter(p => p) // Filter out null/undefined/empty strings
    )];

    // Orders by status (Collected vs Pending vs Blacklist)
    const ordersByStatus = {
      'Recogido': orders.filter(o => o.collected).length,
      'Pendiente': orders.filter(o => !o.collected && !o.black_list).length,
      'Lista Negra': orders.filter(o => o.black_list).length
    };

    // Collection Rate
    const validOrders = orders.filter(o => !o.black_list).length;
    const collectionRate = validOrders > 0
      ? (orders.filter(o => o.collected).length / validOrders) * 100
      : 0;

    // Sales per day (last 7 days)
    const salesByDay = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      const ordersDay = orders.filter(o => {
        const date = new Date(o.date || o.created_date);
        return (
          date.getFullYear() === day.getFullYear() &&
          date.getMonth() === day.getMonth() &&
          date.getDate() === day.getDate() &&
          !o.black_list
        );
      });

      const weekday = day.toLocaleDateString('es-ES', { weekday: 'short' });
      salesByDay.push({
        day: weekday.charAt(0).toUpperCase() + weekday.slice(1),
        orders: ordersDay.length,
        revenue: ordersDay.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0)
      });
    }

    // Peak Hours Analysis
    const hoursDistribution = Array(24).fill(0);
    orders.forEach(o => {
      const date = new Date(o.date || o.created_date);
      const hour = date.getHours();
      hoursDistribution[hour]++;
    });

    const peakHoursData = hoursDistribution.map((count, hour) => ({
      hour: `${hour}:00`,
      orders: count
    })).filter((_, i) => i >= 10 && i <= 23); // Show only from 10:00 to 23:00 usually

    // Average ticket
    const completedOrders = orders.filter(o => o.collected && parseFloat(o.total_price) > 0);
    const averageTicket = completedOrders.length > 0
      ? completedOrders.reduce((sum, o) => sum + parseFloat(o.total_price), 0) / completedOrders.length
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
      uniqueCustomers: uniqueCustomers.length,
      ordersByStatus,
      salesByDay,
      averageTicket,
      peakHoursData,
      collectionRate
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

  // Use product metrics from API
  const topProducts = productMetrics?.products?.slice(0, 5) || [];
  const bestProduct = productMetrics?.bestSeller || null;

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
            <p className="text-sm text-purple-100 mt-1">Fidelización</p>
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
            <p className="text-sm text-amber-100 mt-1">Por pedido completado</p>
          </CardContent>
        </Card>
      </div>

      {/* Best product */}
      {bestProduct && (
        <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-amber-100 flex items-center justify-center">
                <Trophy className="h-8 w-8 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-amber-700 font-medium">Producto Estrella</p>
                <h3 className="text-2xl font-bold text-slate-900">{bestProduct.text}</h3>
                <p className="text-slate-600 mt-1">
                  {bestProduct.total_units} unidades vendidas · €{parseFloat(bestProduct.total_sold).toFixed(2)} en ingresos
                </p>
              </div>
              <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-lg px-4 py-2">
                #1
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Row 1 */}
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

        {/* Peak Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-slate-600" />
              Horas Pico (10:00 - 23:00)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={metrics.peakHoursData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="orders" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders by status */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-slate-600" />
              Estado de Pedidos
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
            <div className="flex justify-center gap-4 mt-4">
              {statusData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORES[index % COLORES.length] }} />
                  <span className="text-xs text-slate-600">{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top products */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-slate-600" />
              Top 5 Productos Más Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No hay datos de ventas aún</p>
            ) : (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-white text-sm ${index === 0 ? 'bg-amber-500' :
                        index === 1 ? 'bg-slate-400' :
                          index === 2 ? 'bg-amber-700' : 'bg-slate-300'
                      }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">{product.text}</h4>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${(product.total_units / topProducts[0].total_units) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right min-w-[100px]">
                      <p className="font-bold text-slate-900">{product.total_units} uds</p>
                      <p className="text-xs text-slate-500">€{parseFloat(product.total_sold).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">Tasa de Recogida</p>
              <p className="text-2xl font-bold text-slate-900">{metrics.collectionRate.toFixed(1)}%</p>
            </div>
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${metrics.collectionRate >= 90 ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
              }`}>
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-500 mb-2">Ingresos (30 días)</p>
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