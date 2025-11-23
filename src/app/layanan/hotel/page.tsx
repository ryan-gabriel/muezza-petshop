import Facilities from "@/components/page/hotel/Facilities";
import HotelHeroSection from "@/components/page/hotel/HotelHeroSection";
import RoomTypes from "@/components/page/hotel/RoomTypes";
import YoutubeVideo from "@/components/page/reusable/YoutubeVideo";
import { getHotelsClient } from "@/utils/hotels";
import React from "react";

const page = async () => {
  const data = await getHotelsClient();
  return (
    <main className="overflow-x-hidden">
      <HotelHeroSection />
      <RoomTypes roomTypes={data} />
      <Facilities />
      <YoutubeVideo
        title="Tour Pets Hotel Muezza !"
        description="Tonton bagaimana Mogli menginap di Pet Hotel Muezza"
        url="https://www.youtube.com/embed/mxSFbLk-eaY?si=268ZsskV3mdcaJqc"
      />
    </main>
  );
};

export default page;
