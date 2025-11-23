import Link from "next/link";

export default function NotFound() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-20">
      <div className="max-w-md flex flex-col items-center gap-6">

        {/* Title */}
        <h1 className="text-6xl font-boogaloo text-[#1D3A2F]">
          Oops, Halaman Tidak Ditemukan!
        </h1>

        {/* Description */}
        <p className="text-black/70 text-lg">
          Sepertinya kamu tersesat. Halaman yang kamu cari tidak tersedia atau sudah dipindahkan.
        </p>

        {/* Go Back Button */}
        <Link
          href="/"
          className="
            mt-4 px-8 py-3 
            bg-primary-blue 
            rounded-full text-lg font-semibold
            hover:bg-primary-blue/90 
            transition-all
          "
        >
          Kembali ke Beranda
        </Link>
      </div>
    </section>
  );
}
