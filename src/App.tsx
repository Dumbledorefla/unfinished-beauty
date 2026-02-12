import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import TarotDia from "./pages/TarotDia";
import TarotAmor from "./pages/TarotAmor";
import TarotCompleto from "./pages/TarotCompleto";
import Numerologia from "./pages/Numerologia";
import Horoscopo from "./pages/Horoscopo";
import Consultas from "./pages/Consultas";
import Cursos from "./pages/Cursos";
import Produtos from "./pages/Produtos";
import Carrinho from "./pages/Carrinho";
import Perfil from "./pages/Perfil";
import Admin from "./pages/Admin";
import ResetPassword from "./pages/ResetPassword";
import ProdutoDetalhe from "./pages/ProdutoDetalhe";
import CursoDetalhe from "./pages/CursoDetalhe";
import TaromanteDetalhe from "./pages/TaromanteDetalhe";
import TaromantePainel from "./pages/TaromantePainel";
import MapaAstral from "./pages/MapaAstral";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/produto/:slug" element={<ProdutoDetalhe />} />
            <Route path="/curso/:slug" element={<CursoDetalhe />} />
            <Route path="/taromante/:slug" element={<TaromanteDetalhe />} />
            <Route path="/taromante-painel" element={<TaromantePainel />} />
            <Route path="/mapa-astral" element={<MapaAstral />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
