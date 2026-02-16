import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider } from "next-themes";

// Lazy-loaded pages
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const TarotDia = lazy(() => import("./pages/TarotDia"));
const TarotAmor = lazy(() => import("./pages/TarotAmor"));
const TarotCompleto = lazy(() => import("./pages/TarotCompleto"));
const Numerologia = lazy(() => import("./pages/Numerologia"));
const Horoscopo = lazy(() => import("./pages/Horoscopo"));
const Consultas = lazy(() => import("./pages/Consultas"));
const Cursos = lazy(() => import("./pages/Cursos"));
const Produtos = lazy(() => import("./pages/Produtos"));
const Carrinho = lazy(() => import("./pages/Carrinho"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Perfil = lazy(() => import("./pages/Perfil"));
const Admin = lazy(() => import("./pages/Admin"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ProdutoDetalhe = lazy(() => import("./pages/ProdutoDetalhe"));
const CursoDetalhe = lazy(() => import("./pages/CursoDetalhe"));
const TaromanteDetalhe = lazy(() => import("./pages/TaromanteDetalhe"));
const TaromantePainel = lazy(() => import("./pages/TaromantePainel"));
const MapaAstral = lazy(() => import("./pages/MapaAstral"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Afiliado = lazy(() => import("./pages/Afiliado"));

function PageLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
      <p className="text-muted-foreground text-sm animate-pulse">
        Consultando os astros...
      </p>
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/tarot/dia" element={<TarotDia />} />
                  <Route path="/tarot/amor" element={<TarotAmor />} />
                  <Route path="/tarot/completo" element={<TarotCompleto />} />
                  <Route path="/numerologia" element={<Numerologia />} />
                  <Route path="/horoscopo" element={<Horoscopo />} />
                  <Route path="/consultas" element={<Consultas />} />
                  <Route path="/cursos" element={<Cursos />} />
                  <Route path="/produtos" element={<Produtos />} />
                  <Route path="/carrinho" element={<Carrinho />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/perfil" element={<Perfil />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/produto/:slug" element={<ProdutoDetalhe />} />
                  <Route path="/curso/:slug" element={<CursoDetalhe />} />
                  <Route path="/taromante/:slug" element={<TaromanteDetalhe />} />
                  <Route path="/taromante-painel" element={<TaromantePainel />} />
                  <Route path="/mapa-astral" element={<MapaAstral />} />
                  <Route path="/afiliado" element={<Afiliado />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </ThemeProvider>
);

export default App;
