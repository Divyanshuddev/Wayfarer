import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wayfarer – Real Trips & Hotel Price Intel",
  description: "Share trips, unfiltered pros & cons, hotel prices, and community traveler advice.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased" suppressHydrationWarning>
      <body
        className="min-h-full bg-[#08080c] text-[#ececf1] selection:bg-sky-500 selection:text-white"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
