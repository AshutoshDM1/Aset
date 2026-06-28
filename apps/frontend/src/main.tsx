import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import './index.css';
import App from './App.tsx';
import { ThemeProvider } from './components/theme-provider.tsx';
import { ClerkProvider } from '@clerk/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './utils/trpc.ts';
import { Toaster } from '@/components/ui/sonner';
import { ViewModeProvider } from './context/ViewModeContext.tsx';
import { TooltipProvider } from '@/components/ui/tooltip';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ClerkProvider
        publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
      >
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <TooltipProvider>
            <ViewModeProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </ViewModeProvider>
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </ClerkProvider>
    </QueryClientProvider>
  </StrictMode>,
);
