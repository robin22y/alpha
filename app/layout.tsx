import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "zdebt - Track Your Path to Financial Freedom",
  description: "Eliminate debt 3x faster. Build passive income. 100% Anonymous. No name required.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
