import Image from "next/image";
import React from "react";

export default function GridShape() {
  return (
    <>
      <div className="absolute top-0 right-0 -z-1 w-full max-w-62.5 xl:max-w-112.5">
        <Image
          width={540}
          height={254}
          src="/images/shape/grid-01.svg"
          alt="grid"
        />
      </div>
      <div className="absolute bottom-0 left-0 -z-1 w-full max-w-62.5 rotate-180 xl:max-w-112.5">
        <Image
          width={540}
          height={254}
          src="/images/shape/grid-01.svg"
          alt="grid"
        />
      </div>
    </>
  );
}
