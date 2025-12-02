import React from "react";

const EmptyProduct = ({ category }: { category: string }) => {
  return (
    <div className="flex flex-col items-center text-center mt-24 mb-48 px-6">
      <h3 className="text-2xl font-boogaloo text-gray-800">
        Belum Ada Produk 😿
      </h3>

      {/* Subtitle */}
      <p className="text-gray-600 max-w-md mt-2">
        Saat ini belum ada produk yang tersedia untuk kategori{" "}
        <span className="font-semibold">{category}</span>. Kami sedang menambah
        produk terbaik untukmu!
      </p>
    </div>
  );
};

export default EmptyProduct;
