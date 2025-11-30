import Link from "next/link";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductForm from "@/components/form/ProductForm";
import { getCategories } from "../../../utils/categories";
import { getPaginatedProducts } from "@/utils/products";
import { SearchBar } from "@/components/products/SearchBar";
import ProductVisibilityToggle from "@/components/products/ProductVisibilityToggle";
import DeleteResourceButton from "@/components/resource/DeleteResourceButton";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const page = Number(params?.page) || 1;
  const search = params?.search;

  const [data, categories] = await Promise.all([
    getPaginatedProducts(
      page,
      10,
      typeof search === "string" ? search : undefined
    ),
    getCategories(),
  ]);

  return (
    <div className="p-8 space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">
          Products Dashboard
        </h1>
        <ProductForm productCategories={categories} />
      </div>

      {/* Table */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4">
            <CardTitle className="text-lg font-semibold">
              Product List
            </CardTitle>
            <SearchBar />
          </div>
          {search && (
            <p className="text-sm text-muted-foreground">
              Showing results for &quot;{search}&quot;
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.results.length > 0 ? (
                  data.results.map((product) => (
                    <TableRow
                      key={product.id}
                      className={`${
                        !product.visibility && "bg-gray-200 hover:bg-gray-200"
                      }`}
                    >
                      <TableCell>
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          width={50}
                          height={50}
                          className="object-cover rounded-md border"
                        />
                      </TableCell>
                      <TableCell className="font-medium max-w-[250px] truncate">
                        {product.name}
                      </TableCell>
                      <TableCell>
                        Rp {product.price.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`capitalize ${
                            !product.product_categories
                              ? "bg-gray-200 text-gray-600"
                              : ""
                          }`}
                        >
                          {product.product_categories?.name || "Uncategorized"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(product.created_at).toLocaleDateString(
                          "id-ID"
                        )}
                      </TableCell>
                      <TableCell className="text-center flex justify-center items-center gap-4">
                        {categories.length > 0 && (
                          <ProductForm
                            product={product}
                            productCategories={categories}
                          />
                        )}
                        <ProductVisibilityToggle
                          productId={product.id}
                          initialVisibility={product.visibility}
                        />
                        <DeleteResourceButton
                          id={product.id}
                          apiUrl="/api/products"
                          title="Delete Product"
                          message="This product will be permanently deleted."
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No products found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-3">
            <p className="text-sm text-muted-foreground">
              Showing page {page} of {data.totalPages} — total {data.count}{" "}
              products
            </p>

            <div className="flex items-center flex-wrap gap-2">
              {/* Prev */}
              <Button
                variant="outline"
                size="sm"
                asChild
                className={
                  !data.previous ? "pointer-events-none opacity-50" : ""
                }
              >
                <Link
                  href={
                    data.previous ? `?page=${data.previous}` : `?page=${page}`
                  }
                >
                  <ChevronLeft />
                </Link>
              </Button>

              {/* Page numbers */}
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(
                (p) => (
                  <Button
                    key={p}
                    variant={p === page ? "default" : "outline"}
                    size="sm"
                    className="w-10"
                    asChild
                  >
                    <Link href={`?page=${p}`}>{p}</Link>
                  </Button>
                )
              )}

              {/* Next */}
              <Button
                variant="outline"
                size="sm"
                asChild
                className={!data.next ? "pointer-events-none opacity-50" : ""}
              >
                <Link href={data.next ? `?page=${data.next}` : `?page=${page}`}>
                  <ChevronRight />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
