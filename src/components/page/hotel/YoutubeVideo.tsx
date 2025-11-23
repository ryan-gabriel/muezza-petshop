import React from "react";

const YoutubeVideo = ({ url }: { url: string }) => {
  return (
    <section className="w-full flex justify-center items-center my-16">
      <div className="w-[90%] bg-[#B0D9F0] rounded-xl flex flex-col lg:flex-row overflow-hidden">

        {/* LEFT TEXT AREA */}
        <div className="w-full lg:w-1/3 flex flex-col justify-center items-center p-8 lg:p-12 text-center">
          <h4 className="text-2xl font-semibold">Tour Pets Hotel Muezza !</h4>
          <p className="mt-2">Tonton bagaimana Mogli menginap di Pet Hotel Muezza</p>
        </div>

        {/* RIGHT VIDEO AREA */}
        <div className="w-full lg:w-2/3">
          <div className="w-full aspect-video">
            <iframe
              src={url}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </div>

      </div>
    </section>
  );
};

export default YoutubeVideo;
