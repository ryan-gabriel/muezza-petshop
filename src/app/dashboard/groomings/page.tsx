import GroomingForm from "@/components/form/GroomingForm";
import Image from "next/image";
import DeleteResourceButton from "@/components/resource/DeleteResourceButton";
import { GroomingService } from "@/type/grooming";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

async function getGroomings(): Promise<GroomingService[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/groomings`);

  if (!res.ok) {
    return [];
  }

  return res.json();
}

export default async function Page() {
  const groomingServices = await getGroomings();

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Grooming Services</h1>
        <GroomingForm />
      </div>

      {groomingServices.length === 0 && (
        <p className="text-muted-foreground">Belum ada grooming service.</p>
      )}

      {groomingServices.length > 0 && (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {groomingServices.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <Image
                      src={s.image_url}
                      alt={s.name}
                      width={60}
                      height={60}
                      className="object-cover rounded-md border"
                    />
                  </TableCell>

                  <TableCell className="font-medium">{s.name}</TableCell>

                  <TableCell className="max-w-[300px] truncate text-muted-foreground">
                    {s.description}
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="flex justify-center items-center gap-3">
                      <GroomingForm
                        grooming={s}
                      />

                      <DeleteResourceButton
                        id={s.id}
                        apiUrl="/api/groomings"
                        title="Delete Grooming Service"
                        message="This grooming service will be permanently deleted."
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
