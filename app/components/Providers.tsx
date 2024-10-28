// app/components/Providers.tsx
"use client"; // This directive makes the component a Client Component

import { SessionProvider } from "next-auth/react";
import { CustomThemeProvider } from './CustomThemeProvider'; // Add this import

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <CustomThemeProvider> {/* Use your custom theme provider */}
        {children}
      </CustomThemeProvider>
    </SessionProvider>
  );
};

export default Providers;
