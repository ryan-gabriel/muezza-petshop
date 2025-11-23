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

            {/* Nama + Harga */}
            <div className="flex flex-col gap-2">
              {/* Nama Room */}
              <h4 className="font-semibold text-xl text-center">{roomType.name}</h4>

              {/* Harga */}
              <div className="flex flex-col gap-1">
                {/* Harga Original */}
                <div className="flex items-center gap-2">
                  <p
                    className={`font-semibold text-lg ${
                      roomType.discount
                        ? "line-through text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    Rp {roomType.price_per_night.toLocaleString("id-ID")}/malam
                  </p>

                  {/* Badge Diskon */}
                  {roomType.discount && (
                    <span className="px-2 py-0.5 rounded-md bg-primary-red/10 text-green-600 text-xs font-medium">
                      -{roomType.discount.discount_percent}%
                    </span>
                  )}
                </div>

                {/* Harga Diskon Final */}
                {roomType.discount && (
                  <p className="font-bold text-xl text-green-600">
                    Rp{" "}
                    {Math.round(
                      roomType.price_per_night *
                        (1 - roomType.discount.discount_percent / 100)
                    ).toLocaleString("id-ID")}
                    /malam
                  </p>
                )}
              </div>
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
