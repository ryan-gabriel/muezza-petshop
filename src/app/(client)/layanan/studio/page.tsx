import Galleries from "@/components/page/studios/Galleries";
import PackageSection from "@/components/page/studios/PackageSection";
import StudioHeroSection from "@/components/page/studios/StudioHeroSection";
import { getStudiosClient } from "@/utils/studios";
import React from "react";

const page = async () => {
  const data = await getStudiosClient();
  return (
    <main className="overflow-x-hidden flex flex-col gap-16">
      <StudioHeroSection />
      <PackageSection packages={data} />
      <Galleries />
    </main>
  );
};

export default page;
