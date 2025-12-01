import type { Metadata } from "next";
import { Playfair_Display, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const playfairDisplay = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Spatial",
  description: "Spatial analytics platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfairDisplay.variable} ${ibmPlexSans.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
