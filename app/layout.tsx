import Providers  from "./components/Providers";
import { cn } from "@/lib/utils";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          "flex flex-col"
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
