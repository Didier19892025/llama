import type { Metadata } from "next";
import "./globals.css";
import { FC, PropsWithChildren } from "react";


export const metadata: Metadata = {
  title: "Yama 1",
};


const RootLayout: FC<PropsWithChildren> = ({children}) => {
  return (
    <html lang="en">
      <body
        className={` antialiased`}
      >
        {children}
      </body>
    </html>
  )
}

export default RootLayout