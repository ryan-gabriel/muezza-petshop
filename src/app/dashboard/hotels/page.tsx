import Image from "next/image";
import DeleteResourceButton from "@/components/resource/DeleteResourceButton";
import { PetHotelRoom } from "@/type/hotel";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PetHotelRoomForm from "@/components/form/HotelServiceForm";

async function getPetHotelRooms(): Promise<PetHotelRoom[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/hotel`);

  if (!res.ok) {
    return [];
  }

  return res.json();
}

export default async function Page() {
  const hotelRooms = await getPetHotelRooms();

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Pet Hotel Rooms</h1>
        <PetHotelRoomForm />
      </div>

      {hotelRooms.length === 0 && (
        <p className="text-muted-foreground">
          Belum ada pet hotel room yang tersedia.
        </p>
      )}

      {hotelRooms.length > 0 && (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Price / Night</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {hotelRooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell>
                    <Image
                      src={room.image_url || "/placeholder.jpg"}
                      alt={room.name}
                      width={60}
                      height={60}
                      className="object-cover rounded-md border"
                    />
                  </TableCell>

                  <TableCell className="font-medium">{room.name}</TableCell>

                  <TableCell className="max-w-[300px] truncate text-muted-foreground">
                    {room.description}
                  </TableCell>

                  <TableCell className="">
                    Rp. {Number(room.price_per_night).toLocaleString("id-ID")}
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="flex justify-center items-center gap-3">
                      <PetHotelRoomForm room={room} />

                      <DeleteResourceButton
                        id={room.id}
                        apiUrl="/api/hotel"
                        title="Delete Pet Hotel Room"
                        message="This pet hotel room will be permanently deleted."
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
