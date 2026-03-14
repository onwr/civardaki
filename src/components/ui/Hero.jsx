import React from "react";
import Hero from "@/components/sections/home/Hero";

const HeroWrapper = ({ variant }) => {
  return (
    <div>
      {variant === "home" && (
        <div>
          <Hero />
        </div>
      )}

      {variant === "about" && (
        <div>
          <h1>About</h1>
        </div>
      )}
    </div>
  );
};

export default HeroWrapper;
