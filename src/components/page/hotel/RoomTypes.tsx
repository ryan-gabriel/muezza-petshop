import { HotelClient } from "@/type/hotel";
import Image from "next/image";
import React from "react";

const RoomTypes = ({ roomTypes }: { roomTypes: HotelClient[] }) => {
  return (
    <section className="my-10">
      <h3 className="font-boogaloo text-4xl text-center mb-10 mt-6">Tipe Ruangan</h3>
      <div className="flex flex-wrap gap-6 items-start justify-center">
        {roomTypes.map((roomType) => (
          <div
            key={roomType.id}
            className="p-4 flex flex-col gap-4 w-full sm:w-[45%] lg:w-[30%] rounded-xl border shadow-sm hover:shadow-md transition"
          >
            {/* Image */}
            <Image
              src={roomType.image_url}
              width={600}
              height={600}
              alt={roomType.name}
              className="w-full aspect-square object-cover rounded-lg"
            />

            {/* Nama */}
            <div className="flex flex-col gap-2">
              {/* Nama Room */}
              <h4 className="font-semibold text-xl text-center">{roomType.name}</h4>
            </div>

            {/* Deskripsi */}
            <p className="text-gray-600 text-sm">{roomType.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RoomTypes;
