import Image from "next/image";
import Link from "next/link";
import React from "react";

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center px-12 bg-transparent">
      <div className="flex items-center">
        <Image src={"/logo.svg"} width={60} height={60} alt="Logo Muezza"/>
      </div>
      <div className="flex items-center gap-12 font-semibold tracking-wide">
        <Link href={'#'}>Home</Link>
        <Link href={'#'}>Produk</Link>
        <Link href={'#'}>Tentang Muezza</Link>
        <Link href={'#'}>Kontak</Link>
      </div>
    </nav>
  );
};

export default Navbar;
