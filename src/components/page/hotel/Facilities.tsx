import Image from 'next/image'
import React from 'react'

const Facilities = () => {
  const facilitiesData = [
    { icon: '/hotel/facilities/time.webp', text: "Waktu antar jemput Peliharaan yang Fleksibel" },
    { icon: '/hotel/facilities/play.webp', text: "Tempat bermain Peliharaan" },
    { icon: '/hotel/facilities/sand.webp', text: "Tempat pasir kucing gratis" },
    { icon: '/hotel/facilities/medic.webp', text: "Bantuan medis jika diperlukan" },
    { icon: '/hotel/facilities/checking.webp', text: "Pengecekan berkala oleh staff" },
    { icon: '/hotel/facilities/update.webp', text: "Update kondisi Peliharaan" },
  ]

  return (
    <section className="my-10">
      <h3 className="text-3xl font-boogaloo text-center">Fasilitas Menginap Mencakup:</h3>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 place-items-center">
        {facilitiesData.map((facility, index) => (
          <div key={index} className="flex flex-col items-center text-center px-4">
            <Image
              src={facility.icon}
              alt={facility.text}
              width={200}
              height={200}
              className="w-40 h-40 sm:w-48 sm:h-48 object-contain"
            />
            <p className="text-lg mt-4 max-w-[230px]">
              {facility.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Facilities
