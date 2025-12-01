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

      2. **Layanan Utama**:
         - Pet Shop: Makanan (Royal Canin, Whiskas, dll), vitamin, aksesoris.
         - Pet Grooming: Mandi sehat, potong kuku, bersih telinga.
         - Pet Hotel: Penitipan aman & nyaman.
         - Pet Studio: Foto profesional hewan.

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