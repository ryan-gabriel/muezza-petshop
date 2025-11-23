import { getHotelsClient } from "@/utils/hotels";
import React from "react";

const page = async () => {
  const data = await getHotelsClient();
  return <main className="my-40">{JSON.stringify(data)}</main>;
};

export default page;
