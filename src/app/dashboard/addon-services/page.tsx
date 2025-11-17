import AddonServiceForm from "@/components/form/AddonServiceForm";
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
import { AddonService } from "@/type/addonService";

async function getAddonServices(): Promise<AddonService[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/addon-services`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return [];
  }

  return res.json();
}

export default async function Page() {
  const addonServices = await getAddonServices();

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Addon Services</h1>
        <AddonServiceForm />
      </div>

      {addonServices.length === 0 && (
        <p className="text-muted-foreground">Belum ada addon service.</p>
      )}

      {addonServices.length > 0 && (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {addonServices.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>

                  <TableCell className="max-w-[300px] truncate text-muted-foreground">
                    {s.description}
                  </TableCell>

                  <TableCell>
                    Rp. {Number(s.price).toLocaleString("id-ID")}
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="flex justify-center items-center gap-3">
                      <AddonServiceForm
                        addon={s}
                        trigger={
                          <Button variant="outline" className="gap-2">
                            <SquarePen className="w-4 h-4" />
                          </Button>
                        }
                      />

                      <DeleteResourceButton
                        id={s.id}
                        apiUrl="/api/addon-services"
                        title="Delete Addon Service"
                        message="This addon service will be permanently deleted."
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
