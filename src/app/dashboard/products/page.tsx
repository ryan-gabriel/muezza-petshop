import Link from "next/link";
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
import Image from "next/image";
import { ProductCategory } from "@/type/productCategory";

// === Dummy data (server-side)
const allProducts = Array.from({ length: 50 }, (_, i) => {
  const name = `Product ${i + 1}`;
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  return {
    id: i + 1,
    name,
    slug,
    description: "Sample product description for testing pagination layout.",
    price: 50000 + i * 1000,
    image_url: `https://placehold.co/100x100.png?text=Prod+${i + 1}`,
    category: i % 10,
    created_at: new Date(2025, 10, (i % 28) + 1).toISOString(),
  };
});

function getPaginatedData(page = 1, pageSize = 10) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const results = allProducts.slice(start, end);
  const totalPages = Math.ceil(allProducts.length / pageSize);
  return {
    count: allProducts.length,
    totalPages,
    next: page < totalPages ? page + 1 : null,
    previous: page > 1 ? page - 1 : null,
    results,
  };
}

// === Server Component ===
export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const page = Number(params?.page) || 1;
  const data = getPaginatedData(page);
  let categories: ProductCategory[] = [];

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/product-categories`
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch categories: ${res.statusText}`);
    }

    categories = await res.json();
  } catch (error) {
    console.error("Error fetching product categories:", error);
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">
          Products Dashboard
        </h1>
        <ProductForm productCategories={categories} />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Product List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.results.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        width={50}
                        height={50}
                        className="object-cover rounded-md border"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {product.slug}
                    </TableCell>
                    <TableCell className="max-w-[250px] truncate text-muted-foreground">
                      {product.description}
                    </TableCell>
                    <TableCell>
                      Rp {product.price.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell>
                      <Badge className="capitalize">{product.category}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(product.created_at).toLocaleDateString("id-ID")}
                    </TableCell>
                    <TableCell className="text-center space-x-2 flex justify-evenly">
                      <ProductForm
                        product={product}
                        trigger={
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        }
                        productCategories={categories}
                      />
                      <Button variant="destructive" size="sm">
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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
