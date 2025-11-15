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
import { getCategories } from "@/utils/categories";
import ProductCategoryForm from "@/components/form/ProductCategoryForm";
import DeleteCategoryButton from "@/components/product-categories/DeleteCategoryButton";
import { SearchBar } from "@/components/products/SearchBar";
import { SquarePenIcon } from "lucide-react";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const search = params?.search;
  const categories = await getCategories(search as string | undefined);

  return (
    <div className="p-8 space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">
          Product Categories Dashboard
        </h1>
        <ProductCategoryForm />
      </div>

      <SearchBar isPaginated={false} />

      {search && (
        <p className="text-sm text-muted-foreground">
          Showing results for &quot;{search}&quot;
        </p>
      )}

      {/* Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Category List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        {category.name}
                      </TableCell>
                      <TableCell className="lowercase text-muted-foreground">
                        {category.slug}
                      </TableCell>
                      <TableCell className="max-w-[250px] truncate text-muted-foreground">
                        {category.description || "-"}
                      </TableCell>
                      <TableCell>
                        {new Date(category.created_at).toLocaleDateString(
                          "id-ID"
                        )}
                      </TableCell>
                      <TableCell className="text-center flex justify-evenly">
                        <ProductCategoryForm
                          category={category}
                          trigger={
                            <Button variant="outline" size="sm">
                              <SquarePenIcon />
                            </Button>
                          }
                        />
                        <DeleteCategoryButton categoryId={category.id} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No categories found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
