import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  color: string;
}

export default function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  return (
    <Card className="bg-card/80 backdrop-blur-md border-primary/20">
      <CardContent className="pt-4 pb-4 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-foreground/60 text-sm">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
