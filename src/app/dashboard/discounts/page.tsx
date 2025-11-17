import DiscountForm from "@/components/form/DiscountForm";
import { Button } from "@/components/ui/button";
import { SquarePen } from "lucide-react";
import DeleteResourceButton from "@/components/resource/DeleteResourceButton";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Discount } from "@/type/discount";


// ------------------------
// FETCH DISCOUNTS
// ------------------------
async function getDiscounts(): Promise<Discount[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/discounts`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) return [];

  return res.json();
}

// ------------------------
// PAGE
// ------------------------
export default async function Page() {
  const discounts = await getDiscounts();

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Discounts</h1>

        {/* Button: Create Discount */}
        <DiscountForm />
      </div>

      {/* If empty */}
      {discounts.length === 0 && (
        <p className="text-muted-foreground">Belum ada diskon.</p>
      )}

      {/* If data exists */}
      {discounts.length > 0 && (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Percent</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {discounts.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.title}</TableCell>

                  <TableCell>{d.discount_percent}%</TableCell>

                  <TableCell>
                    {new Date(d.start_date).toLocaleDateString("id-ID")}
                  </TableCell>

                  <TableCell>
                    {new Date(d.end_date).toLocaleDateString("id-ID")}
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="flex justify-center items-center gap-3">
                      {/* Edit Discount */}
                      <DiscountForm
                        discount={d}
                        trigger={
                          <Button variant="outline" className="gap-2">
                            <SquarePen className="w-4 h-4" />
                          </Button>
                        }
                      />

                      {/* Delete */}
                      <DeleteResourceButton
                        id={d.id}
                        apiUrl="/api/discounts"
                        title="Delete Discount"
                        message="This discount will be permanently deleted."
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
