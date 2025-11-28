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
} from "@/components/ui/pagination";
import { ProductCategory } from "@/type/productCategory";
import { PaginatedResponse, Product } from "@/type/product";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  // update URL
  function updateParam(key: string, value: string) {
    const newParams = new URLSearchParams(params.toString());

    if (!value) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }

    newParams.set("page", "1"); // reset page saat tab/search berubah
    router.push(`/list-produk?${newParams.toString()}`);
  }

  return (
    <div className="w-full space-y-6 p-6">
      {/* 🔵 Tabs + Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Tabs scroll */}
        <Tabs
          value={category || "all"}
          className="w-full md:w-[70%] lg:w-[80%]"
        >
          <div className="overflow-x-auto no-scrollbar w-full">
            <TabsList className="flex w-max">
              <TabsTrigger
                value="all"
                onClick={() => updateParam("category", "")}
              >
                Semua Produk
              </TabsTrigger>

              {categories.map((cat) => (
                <TabsTrigger
                  key={cat.id}
                  value={cat.slug}
                  onClick={() => updateParam("category", cat.slug)}
                >
                  {cat.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>

        {/* Search */}
        <div className="flex items-center gap-2 w-full md:w-[30%] lg:w-[20%]">
          <Input
            placeholder="Cari produk..."
            defaultValue={search}
            className="search-input"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateParam("search", (e.target as HTMLInputElement).value);
              }
            }}
          />

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const input =
                document.querySelector<HTMLInputElement>(".search-input");
              if (input) updateParam("search", input.value);
            }}
          >
            <Search size={20} />
          </Button>
        </div>
      </div>

      {/* 🔵 Product List */}
      {data.results.length === 0 ? (
        <div className="w-full py-20 flex flex-col items-center justify-center text-center text-gray-500">
          <p className="mt-4 text-lg font-medium">
            Tidak ada produk yang sesuai dengan filter.
          </p>
          <p className="text-sm">Coba ubah kategori atau kata pencarian ya</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {data.results.map((product) => (
            <div key={product.id} className="flex flex-col">
              <Image
                src={product.image_url}
                alt={product.name}
                width={0}
                height={0}
                sizes="100vw"
                className="w-full aspect-square object-cover rounded-md"
              />
              <h3 className="mt-3 font-semibold line-clamp-2">
                {product.name}
              </h3>
              <p className="text-sm text-gray-500">
                {product.product_categories?.name}
              </p>
              <p className="mt-2 font-bold text-primary">
                Rp {product.price.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* 🔵 Pagination ShadCN */}
      <Pagination>
        <PaginationContent>
          {[...Array(data.totalPages)].map((_, idx) => {
            const pageNum = idx + 1;
            return (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  isActive={pageNum === page}
                  onClick={() => updateParam("page", String(pageNum))}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          })}
        </PaginationContent>
      </Pagination>
    </div>
  );
}
