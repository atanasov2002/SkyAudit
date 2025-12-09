import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/reactQueryClient";
import { ToastProvider } from "@/components/ToastProvider";
import { Provider } from "react-redux";
import { store } from "@/store";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import { ThemeProvider } from "@/components/theme-provider";
import { theme } from "@/styles/theme";

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <StyledThemeProvider theme={theme}>
            <ToastProvider>{children}</ToastProvider>
          </StyledThemeProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
};
