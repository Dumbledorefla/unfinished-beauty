import { useState } from "react";
import {
  Eye, Users, Clock, TrendingUp, ArrowUpRight,
  Smartphone, Monitor
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const visitData = [
  { date: "10/02", visitas: 23, unicos: 18 },
  { date: "11/02", visitas: 45, unicos: 32 },
  { date: "12/02", visitas: 38, unicos: 28 },
  { date: "13/02", visitas: 52, unicos: 41 },
  { date: "14/02", visitas: 67, unicos: 48 },
  { date: "15/02", visitas: 43, unicos: 35 },
  { date: "16/02", visitas: 58, unicos: 42 },
];

const topPages = [
  { page: "/", title: "Página Inicial", views: 245, percentage: 35 },
  { page: "/tarot/dia", title: "Tarot do Dia", views: 156, percentage: 22 },
  { page: "/horoscopo", title: "Horóscopo", views: 98, percentage: 14 },
  { page: "/numerologia", title: "Numerologia", views: 67, percentage: 10 },
  { page: "/blog", title: "Blog", views: 45, percentage: 6 },
  { page: "/signos", title: "Signos", views: 38, percentage: 5 },
  { page: "/tarot/amor", title: "Tarot do Amor", views: 32, percentage: 5 },
  { page: "/mapa-astral", title: "Mapa Astral", views: 21, percentage: 3 },
];

const deviceData = [
  { name: "Mobile", value: 68, color: "hsl(var(--primary))" },
  { name: "Desktop", value: 28, color: "hsl(var(--accent))" },
  { name: "Tablet", value: 4, color: "#6366f1" },
];

const sourceData = [
  { source: "Google (Orgânico)", visitas: 180, percentage: 45 },
  { source: "Direto", visitas: 95, percentage: 24 },
  { source: "Instagram", visitas: 52, percentage: 13 },
  { source: "WhatsApp", visitas: 38, percentage: 10 },
  { source: "Facebook", visitas: 20, percentage: 5 },
  { source: "Outros", visitas: 15, percentage: 3 },
];

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--primary) / 0.3)",
  borderRadius: "8px",
  color: "hsl(var(--foreground))",
};

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("7d");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {(["7d", "30d", "90d"] as const).map((p) => (
          <Button key={p} variant={period === p ? "default" : "outline"} size="sm" onClick={() => setPeriod(p)}
            className={period === p ? "bg-primary/20 text-primary border-primary/30" : "text-muted-foreground border-primary/20"}>
            {p === "7d" ? "7 dias" : p === "30d" ? "30 dias" : "90 dias"}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Visitas Totais", value: "326", change: "+23%", icon: Eye, color: "from-purple-500 to-purple-600" },
          { label: "Visitantes Únicos", value: "244", change: "+18%", icon: Users, color: "from-blue-500 to-blue-600" },
          { label: "Tempo Médio", value: "4m 32s", change: "+12%", icon: Clock, color: "from-amber-500 to-amber-600" },
          { label: "Taxa de Conversão", value: "3.2%", change: "+0.5%", icon: TrendingUp, color: "from-emerald-500 to-emerald-600" },
        ].map((metric) => (
          <Card key={metric.label} className="bg-card/80 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{metric.label}</p>
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${metric.color} flex items-center justify-center`}>
                  <metric.icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-xl font-bold text-foreground">{metric.value}</p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                <span className="text-xs text-emerald-400">{metric.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Visit chart */}
      <Card className="bg-card/80 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground/80">Visitas vs Visitantes Únicos</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={visitData}>
              <defs>
                <linearGradient id="colorVisitas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorUnicos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--primary) / 0.1)" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="visitas" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorVisitas)" strokeWidth={2} />
              <Area type="monotone" dataKey="unicos" stroke="hsl(var(--accent))" fillOpacity={1} fill="url(#colorUnicos)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Pages */}
        <Card className="lg:col-span-2 bg-card/80 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/80">Páginas Mais Visitadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPages.map((page, i) => (
                <div key={page.page} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foreground">{page.title}</span>
                      <span className="text-xs text-muted-foreground">{page.views} views</span>
                    </div>
                    <div className="w-full bg-primary/10 rounded-full h-1.5">
                      <div className="bg-gradient-to-r from-primary to-accent h-1.5 rounded-full" style={{ width: `${page.percentage}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Devices */}
        <Card className="bg-card/80 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/80">Dispositivos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={deviceData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                  {deviceData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {deviceData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Sources */}
      <Card className="bg-card/80 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground/80">Fontes de Tráfego</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sourceData.map((source) => (
              <div key={source.source} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-foreground">{source.source}</span>
                    <span className="text-xs text-muted-foreground">{source.visitas} visitas ({source.percentage}%)</span>
                  </div>
                  <div className="w-full bg-primary/10 rounded-full h-1.5">
                    <div className="bg-gradient-to-r from-primary to-accent h-1.5 rounded-full" style={{ width: `${source.percentage}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
