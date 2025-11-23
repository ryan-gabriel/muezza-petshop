import AddonSection from "@/components/page/groomings/AddonSection";
import GroomingHeroSection from "@/components/page/groomings/GroomingHeroSections";
import ServicesSection from "@/components/page/groomings/ServicesSection";
import YoutubeVideo from "@/components/page/reusable/YoutubeVideo";
import { getAddonClient } from "@/utils/addon-services";
import { getGroomingsClient } from "@/utils/groomings";
import React from "react";

const page = async () => {
  const groomingData = await getGroomingsClient();
  const addonData = await getAddonClient();
  return (
    <main className="overflow-x-hidden">
      <GroomingHeroSection />
      <ServicesSection services={groomingData} />
      <AddonSection services={addonData} />
      <YoutubeVideo
        title="Grooming di Muezza !"
        description="Tonton bagaimana peliharaan anda digrooming oleh muezza pet shop"
        url="https://www.youtube.com/embed/mxSFbLk-eaY?si=268ZsskV3mdcaJqc"
      />
    </main>
  );
};

export default page;
