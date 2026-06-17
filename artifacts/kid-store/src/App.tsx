import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import { Navbar } from "@/components/navbar";
import { MobileHeader } from "@/components/mobile-header";

import Catalog from "@/pages/catalog";
import ProductDetail from "@/pages/product-detail";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";
import { AdminPinGate } from "@/components/admin-pin-gate";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Catalog} />
      <Route path="/products/:id" component={ProductDetail} />
      <Route path="/admin">
          <AdminPinGate><Admin /></AdminPinGate>
        </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <I18nProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <div className="min-h-screen bg-background flex flex-col font-sans">
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                {/* Desktop navbar — hidden on mobile */}
                <Navbar />
                {/* Mobile header — hidden on desktop */}
                <MobileHeader />
                <main className="flex-1">
                  <Router />
                </main>
              </WouterRouter>
            </div>
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

export default App;
