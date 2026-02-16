import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  color: string;
  prefix?: string;
}

export default function StatCard({ icon: Icon, label, value, color, prefix }: StatCardProps) {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Card className="bg-slate-900 border border-slate-800 rounded-xl">
        <CardContent className="pt-5 pb-5 flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wider font-medium">{label}</p>
            <p className="text-3xl font-bold text-foreground mt-0.5">{prefix ? `${prefix} ${value.toFixed(2)}` : value}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
