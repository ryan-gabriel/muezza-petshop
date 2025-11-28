import React from "react";
import { getCategories } from "@/utils/categories";
import { getPaginatedProducts } from "@/utils/products";
import ListProdukUI from "./ListProdukUI";

async function ListProdukSection({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const params = await searchParams;

  const page = Number(params?.page) || 1;
  const search = typeof params?.search === "string" ? params.search : "";
  const category = typeof params?.category === "string" ? params.category : "";

  const [data, categories] = await Promise.all([
    getPaginatedProducts(page, 10, search, category),
    getCategories(),
  ]);

  return (
    <ListProdukUI
      categories={categories}
      data={data}
      search={search}
      category={category}
      page={page}
    />
  );
}

export default ListProdukSection;
