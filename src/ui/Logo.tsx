"use client"

import Image from "next/image";

const Logo = () => {
    return (
      <div className="flex gap-2 items-center justify-center">
        <Image
          width={200}
          height={40}
          src="/chat1/logo-nec-oabw.svg"
          alt="Logo"
          className=""
        />
      </div>
    );
  };
  
  export default Logo;
  