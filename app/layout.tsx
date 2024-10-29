import { Providers } from "./components/Providers";
import { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Todo List App",
  description: "A simple todo list application built with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}