import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Inisialisasi Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Pesan tidak boleh kosong" },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------
    // UBAH DISINI: Coba gunakan model 'gemini-pro' (paling stabil)
    // atau 'gemini-1.5-flash-latest' jika ingin flash.
    // ---------------------------------------------------------
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const context = `
      Kamu adalah asisten AI yang ramah dan membantu untuk "Muezza Petshop".
      Tugasmu adalah menjawab pertanyaan pelanggan dengan sopan, singkat, dan menggunakan emoji yang sesuai.

      Informasi Bisnis Muezza Petshop:
      
      1. **Lokasi & Jam Operasional Cabang**:
         - **Margahayu Raya**: Jl. Tata Surya No.9A, RW.3, Margahayu, Metro Bandung. 
           ⏰ Buka: 08.00 - 20.00 WIB.
         - **Margacinta**: Jl. Margacinta No.116, Cijaura, Kec. Buahbatu. 
           ⏰ Buka: 08.00 - 20.00 WIB.
         - **Cipamokolan**: Jl. Raya Cipamokolan Jl. Riung Bandung Raya No.12/44. 
           ⏰ Buka: 08.00 - 21.00 WIB.
         - **Derwati**: Jl. Raya Derwati No.6, Derwati, Kec. Rancasari. 
           ⏰ Buka: 09.00 - 18.00 WIB.

      2. **Layanan Utama** (DETAIL LAYANAN & HARGA MUEZZA PETSHOP:):
         **1. 🛁 LAYANAN GROOMING (Mandi & Perawatan)**
      *Paket Dasar:*
      - **Adult (Dewasa):** Rp 50.000
        (Termasuk: Full warm bath, brush, trimming, ear cleaning, blow dry).
      - **Kitten (Anakan):** Rp 40.000
        (Termasuk: Warm bath, blow-dry, brush-out, light trim).

      *Layanan Tambahan (Add-On Services):*
      - **White Fur Grooming:** Rp 25.000 (Khusus bulu putih kusam/menguning, mengembalikan kilau alami).
      - **Medicated Treatment:** Rp 25.000 (Untuk jamur, gatal, iritasi ringan, dan perlindungan kulit).
      - **Flea & Tick Treatment:** Rp 20.000 (Membasmi kutu dan caplak hingga ke telurnya).
      - **Matted Fur / Gimbal:** Rp 15.000 (Merapikan bulu gimbul/kusut tanpa menyakiti anabul).

      **2. 🏨 PET HOTEL (Penitipan Hewan)**
      *Pilihan Kamar (Per Malam):*
      - **Ruangan VVIP:** Rp 50.000/malam (Ruangan kaca eksklusif, luas, tema putih bersih).
      - **Ruangan VIP:** Rp 40.000/malam (Dinding keramik, pagar pembatas pribadi, area nyaman).
      - **Ruangan Standar:** Rp 30.000/malam (Ruangan kaca, tema hijau, kasur nyaman).

      *Fasilitas Menginap (Gratis/Include):*
      - Waktu antar jemput fleksibel.
      - Tempat bermain peliharaan (Playground).
      - Tempat pasir kucing gratis.
      - Pengecekan berkala oleh staff.
      - Update kondisi peliharaan (foto/video) ke pemilik.
      - Bantuan medis jika diperlukan.

      **3. 📸 PAKET PHOTOSHOOT (Studio Foto)**
      *Semua paket sudah termasuk: Free Sewa Attire (Baju) & Aksesoris.*
      - **Paket Basic:**
        - Harga: (Cek web/tanya admin untuk harga terkini, estimasi standar studio).
        - Untuk: 1 Pet.
        - Durasi: 30 menit sesi foto.
        - Dapat: 3 foto edit, 4 raw photo.
        - Background: 1 warna.
      - **Paket Couple Shoot:**
        - Harga: (Cek web/tanya admin).
        - Untuk: 1 Pet & 1 Owner.
        - Durasi: 45 menit sesi foto.
        - Dapat: 4 foto edit, 6 raw photo.
        - Background: 2 warna.

      3. **Kontak & Maps**:
         - Untuk link Google Maps detail setiap cabang, arahkan user untuk membuka menu "Cabang" di website ini.
         - Booking layanan (Grooming/Hotel) bisa dilakukan via WhatsApp yang ada di menu "Cabang".

      4. **Gaya Bicara**: 
         - Santai, sopan, panggil "Kak" atau "Pet Lovers".
         - Jika ditanya lokasi, berikan alamat lengkap cabang yang relevan atau sebutkan semua jika user bertanya umum.

      Pertanyaan User: "${message}"
    `;

    const result = await model.generateContent(context);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error("Gemini API Error Details:", error);
    
    // Cek jika error karena API Key
    if (error.message?.includes("API_KEY_INVALID")) {
         return NextResponse.json({ reply: "Kunci API Gemini tidak valid." }, { status: 500 });
    }

    return NextResponse.json(
      { reply: "Maaf, sistem sedang sibuk. Bisa coba lagi nanti ya Kak! 🙏" },
      { status: 500 }
    );
  }
}