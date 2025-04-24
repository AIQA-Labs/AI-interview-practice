"use client";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";

const HomePlay = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const toggleVideo = () => {
    setShowVideo(!showVideo);
  };

  const imageRef = useRef<HTMLDivElement | null>(null); // Specify the type of the ref

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100; // AFTER HOW MUCH SCROLL

      if (imageRef.current) {
        if (scrollPosition > scrollThreshold) {
          imageRef.current.classList.add("scrolled");
        } else {
          imageRef.current.classList.remove("scrolled");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="flex items-center justify-center w-full">
        {/* Background Image */}
        <div className="hero-image-wrapper mt-5 md:mt-0">
          <div
            ref={imageRef}
            className={`hero-image transition-transform duration-500 ${
              isHovered ? "hovered" : ""
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Image
              src="/hero.png.webp"
              alt="banner"
              width={1280}
              height={720}
              className="rounded-lg shadow-2xl border bg-[radial-gradient(circle_230px_at_0%_0%,_#ffffff,_#9F79C1)] mx-auto"
              priority
            />
          </div>
        </div>
        <button
          onClick={toggleVideo}
          className="absolute inset-0 z-10 flex items-center justify-center text-white"
        >
          {/* ✅ Visible only on small screens */}
          <div className="">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/30 border-[5px] backdrop-blur-md rounded-full flex items-center justify-center border-black/20 hover:bg-white/20 transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10 sm:w-12 sm:h-12 text-blue-100"
                fill="currentColor"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
            </div>
          </div>
        </button>

        {/* Video Modal */}
        {showVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
              className="absolute inset-0 backdrop-blur-sm"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(0, 0, 0, 0.3) 1px, transparent 1px)",
                backgroundSize: "4px 4px",
              }}
              onClick={toggleVideo}
            ></div>

            {/* Video Container */}
            <div className="relative z-10 w-full max-w-4xl bg-black rounded-lg overflow-hidden shadow-2xl">
              <div className="relative pb-[56.25%] h-0">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://www.youtube.com/embed/uzWQDocmM3g?autoplay=1&modestbranding=1&rel=0"
                  title="Video Player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default HomePlay;
