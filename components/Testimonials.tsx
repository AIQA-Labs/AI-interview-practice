"use client";

import React from "react";

import { testimonials } from "@/constants/testimonials";
import { InfiniteMovingCards } from "@/components/ui/InfiniteCards";

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-3">
      <h1 className="heading">
        Kind Words From
        <span className=" from-[#DDDFFF] text-transparent bg-clip-text bg-gradient-to-r to-[#8564be]">
          {" "}
          Satisfied Users
        </span>
      </h1>

      <div className="flex flex-col items-center max-lg:mt-10">
        <div className="h-[50vh] md:h-[30rem]  rounded-md flex flex-col antialiased  items-center justify-center relative overflow-hidden">
          <InfiniteMovingCards
            items={testimonials}
            direction="right"
            speed="slow"
          />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
