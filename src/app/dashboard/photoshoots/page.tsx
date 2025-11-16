import PhotoshootForm from "@/components/form/PhotoshootForm";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SquarePen } from "lucide-react";
import DeleteResourceButton from "@/components/resource/DeleteResourceButton";
import { PhotoshootPackage } from "@/type/photoshoot";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// -----------------------------
// Fetch photoshoot packages
// -----------------------------
async function getPhotoshoots(): Promise<PhotoshootPackage[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/photoshoots`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return [];
  }

  return res.json();
}

// -----------------------------
// Photoshoot Page
// -----------------------------
export default async function Page() {
  const photoshoots = await getPhotoshoots();

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Photoshoot Packages</h1>
        <PhotoshootForm />
      </div>

      {photoshoots.length === 0 && (
        <p className="text-muted-foreground">Belum ada photoshoot package.</p>
      )}

      {photoshoots.length > 0 && (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Features</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {photoshoots.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    {p.image_url && (
                      <Image
                        src={p.image_url}
                        alt={p.name}
                        width={60}
                        height={60}
                        className="object-cover rounded-md border"
                      />
                    )}
                  </TableCell>

                  <TableCell className="font-medium">{p.name}</TableCell>

                  <TableCell>
                    Rp. {Number(p.price).toLocaleString("id-ID")}
                  </TableCell>

                  <TableCell className="max-w-[250px] truncate text-muted-foreground">
                    {p.features?.join(", ")}
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="flex justify-center items-center gap-3">
                      {/* Edit Button */}
                      <PhotoshootForm
                        packageItem={p}
                        trigger={
                          <Button variant="outline" className="gap-2">
                            <SquarePen className="w-4 h-4" />
                          </Button>
                        }
                      />

                      {/* Delete Button */}
                      <DeleteResourceButton
                        id={p.id}
                        apiUrl="/api/photoshoots"
                        title="Delete Photoshoot Package"
                        message="This photoshoot package will be permanently deleted."
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
