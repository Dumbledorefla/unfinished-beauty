import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  color: string;
}

export default function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Card className="glass-card">
        <CardContent className="pt-5 pb-5 flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wider font-medium">{label}</p>
            <p className="text-3xl font-bold text-foreground mt-0.5">{value}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
