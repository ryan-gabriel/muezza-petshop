// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { NextResponse } from "next/server";

// // Inisialisasi Gemini
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// export async function POST(req: Request) {
//   try {
//     const { message } = await req.json();

//     if (!message) {
//       return NextResponse.json(
//         { error: "Pesan tidak boleh kosong" },
//         { status: 400 }
//       );
//     }

//     // ---------------------------------------------------------
//     // UBAH DISINI: Coba gunakan model 'gemini-pro' (paling stabil)
//     // atau 'gemini-1.5-flash-latest' jika ingin flash.
//     // ---------------------------------------------------------
//     const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

//     const context = `
//       Kamu adalah asisten AI yang ramah dan membantu untuk "Muezza Petshop".
//       Tugasmu adalah menjawab pertanyaan pelanggan dengan sopan, singkat, dan menggunakan emoji yang sesuai.

//       Informasi Bisnis Muezza Petshop:
      
//       1. **Lokasi & Jam Operasional Cabang**:
//          - **Margahayu Raya**: Jl. Tata Surya No.9A, RW.3, Margahayu, Metro Bandung. 
//            ⏰ Buka: 08.00 - 20.00 WIB.
//          - **Margacinta**: Jl. Margacinta No.116, Cijaura, Kec. Buahbatu. 
//            ⏰ Buka: 08.00 - 20.00 WIB.
//          - **Cipamokolan**: Jl. Raya Cipamokolan Jl. Riung Bandung Raya No.12/44. 
//            ⏰ Buka: 08.00 - 21.00 WIB.
//          - **Derwati**: Jl. Raya Derwati No.6, Derwati, Kec. Rancasari. 
//            ⏰ Buka: 09.00 - 18.00 WIB.

//       2. **Layanan Utama** (DETAIL LAYANAN & HARGA MUEZZA PETSHOP:):
//          **1. 🛁 LAYANAN GROOMING (Mandi & Perawatan)**
//       *Paket Dasar:*
//       - **Adult (Dewasa):** Rp 50.000
//         (Termasuk: Full warm bath, brush, trimming, ear cleaning, blow dry).
//       - **Kitten (Anakan):** Rp 40.000
//         (Termasuk: Warm bath, blow-dry, brush-out, light trim).

//       *Layanan Tambahan (Add-On Services):*
//       - **White Fur Grooming:** Rp 25.000 (Khusus bulu putih kusam/menguning, mengembalikan kilau alami).
//       - **Medicated Treatment:** Rp 25.000 (Untuk jamur, gatal, iritasi ringan, dan perlindungan kulit).
//       - **Flea & Tick Treatment:** Rp 20.000 (Membasmi kutu dan caplak hingga ke telurnya).
//       - **Matted Fur / Gimbal:** Rp 15.000 (Merapikan bulu gimbul/kusut tanpa menyakiti anabul).

//       **2. 🏨 PET HOTEL (Penitipan Hewan)**
//       *Pilihan Kamar (Per Malam):*
//       - **Ruangan VVIP:** Rp 50.000/malam (Ruangan kaca eksklusif, luas, tema putih bersih).
//       - **Ruangan VIP:** Rp 40.000/malam (Dinding keramik, pagar pembatas pribadi, area nyaman).
//       - **Ruangan Standar:** Rp 30.000/malam (Ruangan kaca, tema hijau, kasur nyaman).

//       *Fasilitas Menginap (Gratis/Include):*
//       - Waktu antar jemput fleksibel.
//       - Tempat bermain peliharaan (Playground).
//       - Tempat pasir kucing gratis.
//       - Pengecekan berkala oleh staff.
//       - Update kondisi peliharaan (foto/video) ke pemilik.
//       - Bantuan medis jika diperlukan.

//       **3. 📸 PAKET PHOTOSHOOT (Studio Foto)**
//       *Semua paket sudah termasuk: Free Sewa Attire (Baju) & Aksesoris.*
//       - **Paket Basic:**
//         - Harga: (Cek web/tanya admin untuk harga terkini, estimasi standar studio).
//         - Untuk: 1 Pet.
//         - Durasi: 30 menit sesi foto.
//         - Dapat: 3 foto edit, 4 raw photo.
//         - Background: 1 warna.
//       - **Paket Couple Shoot:**
//         - Harga: (Cek web/tanya admin).
//         - Untuk: 1 Pet & 1 Owner.
//         - Durasi: 45 menit sesi foto.
//         - Dapat: 4 foto edit, 6 raw photo.
//         - Background: 2 warna.

//       3. **Kontak & Maps**:
//          - Untuk link Google Maps detail setiap cabang, arahkan user untuk membuka menu "Cabang" di website ini.
//          - Booking layanan (Grooming/Hotel) bisa dilakukan via WhatsApp yang ada di menu "Cabang".

//       4. **Gaya Bicara**: 
//          - Santai, sopan, panggil "Kak" atau "Pet Lovers".
//          - Jika ditanya lokasi, berikan alamat lengkap cabang yang relevan atau sebutkan semua jika user bertanya umum.

//       Pertanyaan User: "${message}"
//     `;

//     const result = await model.generateContent(context);
//     const response = await result.response;
//     const text = response.text();

//     return NextResponse.json({ reply: text });
//   } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
//     console.error("Gemini API Error Details:", error);
    
//     // Cek jika error karena API Key
//     if (error.message?.includes("API_KEY_INVALID")) {
//          return NextResponse.json({ reply: "Kunci API Gemini tidak valid." }, { status: 500 });
//     }

//     return NextResponse.json(
//       { reply: "Maaf, sistem sedang sibuk. Bisa coba lagi nanti ya Kak! 🙏" },
//       { status: 500 }
//     );
//   }
// }

/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Helper untuk format rupiah
const formatRupiah = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Pesan kosong" }, { status: 400 });
    }

    const supabase = await createClient();

    // ============================================================
    // 1. AMBIL SEMUA DATA DARI DATABASE SECARA PARALEL (Real-time)
    // ============================================================
    const [
      configRes,
      branchesRes,
      productsRes,
      groomingRes,
      hotelRes,
      studioRes,
      addonRes,
      discountsRes,
    ] = await Promise.all([
      supabase.from("chatbot_config").select("prompt_text").limit(1).single(),
      supabase.from("branches").select("name, description, whatsapp_number"),
      supabase
        .from("products")
        .select("name, price, product_categories(name)")
        .eq("visibility", true)
        .limit(50), // Batasi 50 produk agar tidak overload token
      supabase.from("grooming_services").select("name, price, description"),
      supabase.from("pet_hotel_rooms").select("name, price_per_night, description"),
      supabase.from("photoshoot_packages").select("name, price, features"),
      supabase.from("addon_services").select("name, price, description"),
      supabase
        .from("discounts")
        .select("title, discount_percent, start_date, end_date")
        .eq("is_active", true)
        .gte("end_date", new Date().toISOString()), // Hanya diskon aktif
    ]);

    // ============================================================
    // 2. FORMAT DATA MENJADI TEKS UNTUK KONTEKS AI
    // ============================================================
    
    // --- Cabang ---
    const branchesText =
      branchesRes.data
        ?.map(
          (b) =>
            `- ${b.name}: ${b.description || ""} (WA: ${b.whatsapp_number})`
        )
        .join("\n") || "Belum ada data cabang.";

    // --- Produk (Group by Kategori) ---
    // Sederhanakan list produk
    const productsText =
      productsRes.data
        ?.map(
          (p: any) =>
            `- ${p.name} (${p.product_categories?.name}): ${formatRupiah(
              p.price
            )}`
        )
        .join("\n") || "Belum ada data produk.";

    // --- Grooming ---
    const groomingText =
      groomingRes.data
        ?.map(
          (g) =>
            `- ${g.name}: ${formatRupiah(g.price)}. ${g.description || ""}`
        )
        .join("\n") || "Tidak ada layanan grooming.";

    // --- Hotel ---
    const hotelText =
      hotelRes.data
        ?.map(
          (h) =>
            `- ${h.name}: ${formatRupiah(
              h.price_per_night
            )}/malam. ${h.description || ""}`
        )
        .join("\n") || "Tidak ada kamar hotel.";

    // --- Studio ---
    const studioText =
      studioRes.data
        ?.map((s) => {
           // Parse features jika berbentuk string JSON
           let features = s.features;
           if (typeof features === 'string') {
             try { features = JSON.parse(features).join(", "); } catch { features = s.features; }
           } else if (Array.isArray(features)) {
             features = features.join(", ");
           }
           return `- ${s.name}: ${formatRupiah(s.price)}. Fasilitas: ${features}`;
        })
        .join("\n") || "Tidak ada paket studio.";

    // --- Addons ---
    const addonText =
      addonRes.data
        ?.map((a) => `- ${a.name}: ${formatRupiah(a.price)} (${a.description})`)
        .join("\n") || "";

    // --- Diskon Aktif ---
    const discountText =
      discountsRes.data
        ?.map(
          (d) =>
            `🎉 PROMO: ${d.title} (Diskon ${d.discount_percent}%) sampai ${new Date(
              d.end_date
            ).toLocaleDateString("id-ID")}`
        )
        .join("\n") || "Tidak ada promo aktif saat ini.";

    // ============================================================
    // 3. RAKIT PROMPT AKHIR
    // ============================================================
    
    // Ambil instruksi dasar (persona/tone) dari database atau default
    const systemPersona = configRes.data?.prompt_text || 
      "Kamu adalah asisten AI Muezza Petshop yang ramah dan membantu.";

    const fullContext = `
      ${systemPersona}

      =============================================================
      DATA REAL-TIME MUEZZA PETSHOP (Gunakan data ini untuk menjawab):
      =============================================================

      📍 [CABANG & KONTAK]
      ${branchesText}

      🛁 [LAYANAN GROOMING]
      ${groomingText}
      
      ➕ [ADD-ON SERVICES]
      ${addonText}

      🏨 [PET HOTEL]
      ${hotelText}

      📸 [PHOTO STUDIO]
      ${studioText}

      🛍️ [DAFTAR PRODUK & HARGA]
      ${productsText}

      🏷️ [PROMO SEDANG BERLANGSUNG]
      ${discountText}

      =============================================================
      INSTRUKSI TAMBAHAN:
      1. Jawab berdasarkan DATA REAL-TIME di atas. 
      2. Jika user menanyakan harga, sebutkan angka pastinya.
      3. Jika data tidak ada di daftar (misal produk tertentu), katakan stok mungkin sedang kosong atau sarankan hubungi admin.
      4. Gunakan format list/bullet points agar mudah dibaca.
      
      Pertanyaan User: "${message}"
    `;

    // ============================================================
    // 4. KIRIM KE GEMINI
    // ============================================================
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // atau gemini-1.5-flash
    const result = await model.generateContent(fullContext);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });

  } catch (error: any) {
    console.error("Gemini/DB Error:", error);
    return NextResponse.json(
      { reply: "Maaf Kak, sistem sedang sibuk. Bisa coba hubungi Admin WhatsApp kami ya! 🙏" },
      { status: 500 }
    );
  }
}