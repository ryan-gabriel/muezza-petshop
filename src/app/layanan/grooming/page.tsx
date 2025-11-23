import { getAddonClient } from "@/utils/addon-services";
import { getGroomingsClient } from "@/utils/groomings";
import React from "react";

const page = async () => {
  const groomingData = await getGroomingsClient();
  const addonData = await getAddonClient();
  return (
    <main className="my-40">
      {JSON.stringify(groomingData)} <br /> {JSON.stringify(addonData)}
    </main>
  );
};

export default page;
