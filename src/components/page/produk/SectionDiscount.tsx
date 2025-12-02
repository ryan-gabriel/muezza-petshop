"use client";

import { useEffect, useState } from "react";
import { DiscountProduct } from "@/type/product";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { Card, CardContent } from "@/components/ui/card";
import { Timer } from "lucide-react";

export default function SectionDiscount({ list }: { list: DiscountProduct[] }) {
  const filtered = list.filter((item) => item.discount?.is_active);

  return (
    <section className="w-full relative bg-gradient-to-r from-[#B0D9F0] to-[#9CB8C8] text-[#224F34] overflow-hidden rounded-lg mb-12">
      <Image
        src="/elements/paw-trail-white.webp"
        alt="Paw Trail"
        width={1920}
        height={1920}
        className="
          object-contain absolute
          w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5
          -bottom-10 -right-5 sm:-right-10
        "
      />

      <Image
        src="/elements/paw-trail-white.webp"
        alt="Paw Trail"
        width={1920}
        height={1920}
        className="
          object-contain absolute
          w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5
          -top-16 -left-5 sm:-top-20 sm:-left-10
        "
      />

      <div className="w-full px-4 md:px-10 flex justify-center">
        <Carousel className="w-full md:w-[95%] max-w-full">
          <CarouselContent>
            {filtered.map((item, i) => {
              return (
                <CarouselItem
                  key={i}
                  className="w-full flex items-center justify-center"
                >
                  <DiscountCard item={item} />
                </CarouselItem>
              );
            })}
          </CarouselContent>

          <CarouselPrevious
            className="
            bg-white/90 text-[#224F34]
            hover:bg-white
              border border-[#224F34]/20
              shadow-md
              hover:shadow-lg
              cursor-pointer transition 
              w-10 h-10 md:w-12 md:h-12
              rounded-full backdrop-blur-sm
              md:ml-0 ml-4
            "
          />

          <CarouselNext
            className="
            bg-white/90 text-[#224F34]
            hover:bg-white
              border border-[#224F34]/20
              shadow-md
              hover:shadow-lg
              cursor-pointer transition
              w-10 h-10 md:w-12 md:h-12
              rounded-full backdrop-blur-sm
              md:ml-0 mr-4
            "
          />
        </Carousel>
      </div>
    </section>
  );
}

/* =========================================================
   CARD COMPONENT (lebih clean + countdown)
   ========================================================= */

function DiscountCard({ item }: { item: DiscountProduct }) {
  const p = item.product;
  const d = item.discount!;

  const discountedPrice = Math.round(
    p.price - (p.price * d.discount_percent) / 100
  );

  const discountImage = d.image_url || null;

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(d.end_date));

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft(calculateTimeLeft(d.end_date));
    }, 60000);
    return () => clearInterval(t);
  }, [d.end_date]);

  return (
    <Card className="rounded-2xl bg-white/80 border-none backdrop-blur-md flex items-center overflow-hidden w-full h-[95%] md:h-[90%] min-h-[500px] md:min-h-[420px]">
      <div
        className={`
        w-full h-full gap-0
        ${
          discountImage
            ? "grid md:grid-cols-2" // jika ada gambar → grid
            : "flex flex-col items-center justify-center text-center" // jika tidak ada gambar → center ALL
        }
      `}
      >
        {/* IMAGE */}
        {discountImage ? (
          <div className="relative aspect-[4/3] md:aspect-auto md:h-full">
            <Image
              src={discountImage}
              alt={d.title}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          // Jika tidak ada gambar → placeholder invisible + menjaga layout
          <div className="relative aspect-[4/3] md:aspect-auto md:h-[9%] bg-transparent"></div>
        )}

        {/* TEXT SIDE */}
        <CardContent
          className={`p-8 flex flex-col justify-center 
            ${!discountImage ? "text-center items-center" : "text-left"}
          `}
        >
          <h3 className="text-[#224F34] font-bold text-3xl mb-2 flex items-center gap-2 justify-center md:justify-start">
            {d.title}
          </h3>

          <p className="text-sm line-through text-muted-foreground">
            Rp{" "}
            {new Intl.NumberFormat("id-ID", {
              minimumFractionDigits: 2,
            }).format(p.price)}
          </p>

          <p className="text-4xl font-extrabold text-[#1E3A2B]">
            Rp{" "}
            {new Intl.NumberFormat("id-ID", {
              minimumFractionDigits: 2,
            }).format(discountedPrice)}
          </p>

          <p className="font-semibold mt-2 text-lg text-[#224F34]">
            Diskon {d.discount_percent}%!
          </p>

          {d.description && (
            <p
              className={`mt-4 text-sm opacity-90 leading-relaxed 
              ${!discountImage ? "max-w-md mx-auto" : ""}
            `}
            >
              {d.description}
            </p>
          )}

          <div className="mt-6">
            <p className="font-semibold flex items-center gap-2 mb-3 justify-center md:justify-start text-[#1D3A2F]">
              <Timer className="w-5 h-5" />
              Berlaku hingga: {formatReadable(d.end_date)}
            </p>

            <CountdownDisplay timeLeft={timeLeft} />
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

/* =========================================================
   COUNTDOWN DISPLAY BOXES (Hari / Jam / Menit)
   ========================================================= */

function CountdownDisplay({
  timeLeft,
}: {
  timeLeft: { days: number; hours: number; minutes: number };
}) {
  return (
    <div className="flex gap-3 sm:gap-5 flex-wrap justify-center md:justify-start">
      <CountdownBox label="Hari" value={timeLeft.days} />
      <CountdownBox label="Jam" value={timeLeft.hours} />
      <CountdownBox label="Menit" value={timeLeft.minutes} />
    </div>
  );
}

function CountdownBox({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="bg-[#224F34] text-white aspect-square 
        w-16 sm:w-20 
        rounded-xl p-2 sm:p-3 
        flex flex-col items-center justify-center shadow"
    >
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-xs opacity-80">{label}</span>
    </div>
  );
}

/* =========================================================
   UTIL FUNCTIONS
   ========================================================= */

function calculateTimeLeft(endDate: string) {
  const now = new Date();
  const end = new Date(endDate);

  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0 };

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
  };
}

function formatReadable(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
