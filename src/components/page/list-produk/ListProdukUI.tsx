"use client";

import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ProductCategory } from "@/type/productCategory";
import { PaginatedResponse, Product } from "@/type/product";
import {
  Search,
  Grid3x3,
  List,
  SlidersHorizontal,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

export default function ListProdukUI({
  categories,
  data,
  search,
  category,
  page,
}: {
  categories: ProductCategory[];
  data: PaginatedResponse<Product>;
  search: string;
  category: string;
  page: number;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loadingTabs, setLoadingTabs] = useState(false);

  useEffect(() => {
    setLoadingTabs(false);
  }, [params]);

  function updateParam(key: string, value: string) {
    const newParams = new URLSearchParams(params.toString());

    if (!value) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }

    if (key !== "page") {
      newParams.set("page", "1");
    }
    router.push(`/list-produk?${newParams.toString()}`);
  }

  function handleWhatsAppOrder(product: Product) {
    const phoneNumber = "6281222930909";
    const message = `Halo, saya tertarik untuk memesan produk berikut:\n\n*${
      product.name
    }*\n${
      product.product_categories?.name
        ? `Kategori: ${product.product_categories.name}\n`
        : ""
    }Harga: Rp ${product.price.toLocaleString(
      "id-ID"
    )}\n\nMohon informasi lebih lanjut. Terima kasih!`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {loadingTabs && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm z-[9999] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Katalog Produk
          </h1>
          <p className="text-slate-600">
            Temukan produk terbaik untuk kebutuhan Anda
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Cari produk berdasarkan nama..."
                  defaultValue={search}
                  className="pl-10 h-11 border-slate-300 focus-visible:ring-2 focus-visible:ring-primary"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      updateParam(
                        "search",
                        (e.target as HTMLInputElement).value
                      );
                    }
                  }}
                />
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                className="h-11 w-11"
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="w-5 h-5" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                className="h-11 w-11"
                onClick={() => setViewMode("list")}
              >
                <List className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <SlidersHorizontal className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">Kategori</h2>
          </div>

          <Tabs value={category || "all"} className="w-full">
            <div className="overflow-x-auto scrollbar-hide">
              <TabsList className="inline-flex w-auto bg-slate-100 p-1 rounded-lg">
                <TabsTrigger
                  value="all"
                  onClick={() => {
                    setLoadingTabs(true);
                    updateParam("category", "");
                  }}
                  className="cursor-pointer data-[state=inactive]: data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2 rounded-md transition-all"
                >
                  Semua Produk
                </TabsTrigger>

                {categories.map((cat) => (
                  <TabsTrigger
                    key={cat.id}
                    value={cat.slug}
                    onClick={() => {
                      setLoadingTabs(true);
                      updateParam("category", cat.slug);
                    }}
                    className="cursor-pointer data-[state=inactive]:hover:bg-gray-200 data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2 rounded-md transition-all whitespace-nowrap"
                  >
                    {cat.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-600">
            Menampilkan{" "}
            <span className="font-semibold text-slate-900">
              {data.results.length}
            </span>{" "}
            dari{" "}
            <span className="font-semibold text-slate-900">
              {data.results.length}
            </span>{" "}
            produk
          </p>
          {(search || category) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                router.push("/list-produk");
              }}
              className="text-primary hover:text-primary/80 cursor-pointer"
            >
              Reset Filter
            </Button>
          )}
        </div>

        {/* Product Grid/List */}
        {data.results.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 py-20">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Produk tidak ditemukan
              </h3>
              <p className="text-slate-600 max-w-md">
                Tidak ada produk yang sesuai dengan filter Anda. Coba ubah
                kategori atau kata pencarian.
              </p>
            </div>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "flex flex-col gap-4"
            }
          >
            {data.results.map((product) => (
              <div
                key={product.id}
                className={`group bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer ${
                  viewMode === "list" ? "flex flex-row" : "flex flex-col"
                }`}
              >
                <div
                  className={`relative bg-slate-50 ${
                    viewMode === "list"
                      ? "w-48 h-48 flex-shrink-0"
                      : "w-full aspect-square"
                  }`}
                >
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.product_categories && (
                    <Badge className="absolute top-3 left-3 bg-white/90 text-slate-700 hover:bg-white">
                      {product.product_categories.name}
                    </Badge>
                  )}
                </div>

                <div className={`p-5 ${viewMode === "list" ? "flex-1" : ""}`}>
                  <h3 className="font-semibold text-slate-900 line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>

                  <div className="mt-4">
                    <p className="text-xs text-slate-500 mb-1">Harga</p>
                    <p className="text-xl font-bold text-primary mb-4">
                      Rp {product.price.toLocaleString("id-ID")}
                    </p>

                    <Button
                      onClick={() => handleWhatsAppOrder(product)}
                      className="cursor-pointer w-full bg-green-600 hover:bg-green-700 text-white gap-2"
                      size="sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Pesan via WhatsApp
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {data.totalPages > 1 && (
          <div className="mt-10">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => {
                      if (page > 1) updateParam("page", String(page - 1));
                    }}
                    className={
                      page === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {[...Array(data.totalPages)].map((_, idx) => {
                  const pageNum = idx + 1;

                  // Show first page, last page, current page, and pages around current
                  if (
                    pageNum === 1 ||
                    pageNum === data.totalPages ||
                    (pageNum >= page - 1 && pageNum <= page + 1)
                  ) {
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          isActive={pageNum === page}
                          onClick={() => updateParam("page", String(pageNum))}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (pageNum === page - 2 || pageNum === page + 2) {
                    return (
                      <PaginationItem key={pageNum}>
                        <span className="px-4 text-slate-400">...</span>
                      </PaginationItem>
                    );
                  }
                  return null;
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => {
                      if (page < data.totalPages)
                        updateParam("page", String(page + 1));
                    }}
                    className={
                      page === data.totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
