import React from "react";
import FadeUp from "./motion/FadeUp";
import { Partner } from "@/models/Partner";
import Image from "next/image";
import StaggerSection from "./motion/StaggerSection";

const Logo = async () => {
  const data = await Partner.findOne();
  const partner = JSON.parse(JSON.stringify(data));
  const defaultDescription = `
    <p>Our program is supported by Ministry of Education, Youth, and Sports, Ministry of Industry Science, Technology and Innovation, Ministry of Posts and Telecommunications.</p>
    <p>Funded by Khmer Enterprise, Smart Axiata, The Foreign Trade Bank of Cambodia (FTB).</p>
    <p>Organized by ITC.</p>
  `;
  return (
    <div className="container py-16">
      {/* Title */}
      <FadeUp>
        <h1 className="font-bold text-[2.986rem] leading-tight text-center">
          Our Partners and Supports
        </h1>
      </FadeUp>

      <div className="flex flex-wrap justify-start lg:justify-center gap-20 md:gap-10 mt-10">
        {/* Supported by */}
        <FadeUp>
          <div className="m-auto w-full gap-4 flex justify-center items-center flex-col">
            <div
              className="prose mx-auto text-center [&_p]:my-2 [&_a]:text-primary [&_a]:no-underline [&_a:hover]:text-primary/80"
              dangerouslySetInnerHTML={{
                __html: partner.description || defaultDescription,
              }}
            />

            <StaggerSection className="flex gap-2 lg:gap-6 items-end">
              {partner.logos.map((item, index) => (
                <FadeUp key={item}>
                  <div
                    className={`flex items-center justify-center 
          ${index === 0 ? "h-24 max-sm:h-20" : "h-20 "}
        `}
                  >
                    <Image
                      src={item}
                      alt="logo"
                      height={192}
                      width={192}
                      className="object-contain w-full h-full max-sm:h-20"
                    />
                  </div>
                </FadeUp>
              ))}
            </StaggerSection>
          </div>
        </FadeUp>
      </div>
    </div>
  );
};

export default Logo;
