import React from "react";
import TestimonialQuote from "./TestimonialQuote";
import { User } from "lucide-react";

const testimonials = [
  {
    quote:
      "Produk yang tersedia juga lengkap, mulai dari makanan harian sampai kebutuhan grooming. Kucing saya jauh lebih aktif setelah ganti makanan rekomendasi dari staf Muezza.",
    name: "John Doe",
    role: "Ibu Rumah Tangga",
  },
  {
    quote:
      "Pelayanan ramah dan profesional. Saya jadi lebih paham apa yang terbaik untuk kucing saya. Harganya juga terjangkau!",
    name: "Siti Aisyah",
    role: "Pegawai Swasta",
  },
];

const TestimoniSection = () => {
  return (
    <section className="w-full p-5">
      <div className="bg-[#F0F2F3] w-full rounded-lg flex flex-col mx-auto p-10 md:p-20">
        <h4 className="text-2xl md:text-3xl font-semibold mb-10">
          Apa kata mereka tentang muezza?
        </h4>

        <div className="flex w-full flex-wrap gap-8 justify-evenly">
          {testimonials.map((item, index) => (
            <div key={index} className="p-8 lg:w-[45%] bg-white rounded-md shadow-sm">
              <TestimonialQuote>{item.quote}</TestimonialQuote>

              <div className="flex gap-4 items-center mt-5">
                <User size={32} />
                <div>
                  <p className="text-lg font-semibold">{item.name}</p>
                  <p className="text-sm text-[#9A9CAA]">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default TestimoniSection;
