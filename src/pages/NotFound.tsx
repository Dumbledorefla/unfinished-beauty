import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center max-w-md px-6">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h1 className="mb-3 text-5xl font-bold text-foreground">404</h1>
        <p className="mb-2 text-xl font-serif text-foreground">As cartas não encontraram esta página</p>
        <p className="mb-8 text-muted-foreground">Parece que você se perdeu no caminho. Vamos te levar de volta.</p>
        <Link to="/">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-5">
            Voltar para o início
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
