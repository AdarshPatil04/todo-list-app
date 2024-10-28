import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext({ theme: 'light', setTheme: (theme: string) => {} });

export const CustomThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={theme}>{children}</div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
