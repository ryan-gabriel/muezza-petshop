import { getDashboardOverview } from "@/utils/dashboard";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Box, DollarSign, Gift, Package, Zap, TrendingUp } from "lucide-react";

const DashboardPage = async () => {
  const data = await getDashboardOverview();

  if (!data) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <Card className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm border-red-200 shadow-xl">
          <CardHeader>
            <CardTitle className="text-red-600 text-xl">
              Dashboard Error
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-700">
            Gagal memuat data dashboard. Silakan coba lagi nanti.
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Dashboard Overview
            </h1>
            <p className="text-slate-600 mt-2">Ringkasan lengkap bisnis Anda</p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-600">Live Data</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Produk - Featured Card */}
          <Card className="col-span-1 md:col-span-2 lg:col-span-1 bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">
                Total Produk
              </CardTitle>
              <Box className="w-5 h-5 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white">
                {data.total_products}
              </div>
              <p className="text-xs text-blue-100 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Semua kategori
              </p>
            </CardContent>
          </Card>

          {/* Category Count */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Kategori
              </CardTitle>
              <Package className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {data.products_by_category.length}
              </div>
              <p className="text-xs text-slate-500 mt-2">Kategori aktif</p>
            </CardContent>
          </Card>

          {/* Addon Services Count */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Layanan Addon
              </CardTitle>
              <DollarSign className="w-5 h-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {data.addon_services.length}
              </div>
              <p className="text-xs text-slate-500 mt-2">Layanan tersedia</p>
            </CardContent>
          </Card>

          {/* Active Discounts Count */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Diskon Aktif
              </CardTitle>
              <Zap className="w-5 h-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {data.active_discounts.length}
              </div>
              <p className="text-xs text-slate-500 mt-2">Promosi berjalan</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Produk per Kategori */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-center py-3 items-center border-b border-slate-100 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-lg text-slate-900">
                  Produk per Kategori
                </CardTitle>
              </div>
            </div>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {data.products_by_category.map((c) => (
                  <div
                    key={c.category}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="font-medium text-slate-700">
                        {c.category}
                      </span>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                      {c.count}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Products */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-center py-3 border-b border-slate-100 bg-gradient-to-r from-yellow-50 to-amber-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-lg text-slate-900">
                  Produk Terbaru
                </CardTitle>
              </div>
            </div>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {data.recent_products.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors duration-200 group"
                  >
                    <span className="font-medium text-slate-700 group-hover:text-slate-900">
                      {p.name}
                    </span>
                    <span className="px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-xs font-medium">
                      {p.category}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Addon Services */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-center py-3 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-violet-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-lg text-slate-900">
                  Addon Services
                </CardTitle>
              </div>
            </div>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {data.addon_services.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors duration-200 group"
                  >
                    <span className="font-medium text-slate-700 group-hover:text-slate-900">
                      {s.name}
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">
                      Rp. {s.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Discounts */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-center py-3 border-b border-slate-100 bg-gradient-to-r from-red-50 to-orange-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-lg text-slate-900">
                  Active Discounts
                </CardTitle>
              </div>
            </div>
            <CardContent className="pt-6">
              {data.active_discounts.length > 0 ? (
                <div className="space-y-3">
                  {data.active_discounts.map((d, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 transition-colors duration-200 group"
                    >
                      <span className="font-medium text-slate-700 group-hover:text-slate-900">
                        {d.target_type}
                      </span>
                      <span className="px-3 py-1 bg-white text-red-600 rounded-full text-sm font-bold shadow-sm">
                        {d.target_id}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Zap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">
                    Tidak ada diskon aktif saat ini
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default DashboardPage;
