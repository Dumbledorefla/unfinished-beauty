import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Taromante {
  id: string;
  name: string;
  price_per_session: number | null;
  price_per_hour: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taromante: Taromante | null;
  userId: string;
}

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
];

export default function BookingDialog({ open, onOpenChange, taromante, userId }: Props) {
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState("");
  const [consultationType, setConsultationType] = useState("video");
  const [duration, setDuration] = useState(30);
  const [topic, setTopic] = useState("");
  const [saving, setSaving] = useState(false);

  if (!taromante) return null;

  const price = taromante.price_per_session ?? (taromante.price_per_hour * (duration / 60));

  const handleBook = async () => {
    if (!date || !time) {
      toast.error("Selecione data e horário");
      return;
    }

    const [hours, minutes] = time.split(":").map(Number);
    const scheduledAt = new Date(date);
    scheduledAt.setHours(hours, minutes, 0, 0);

    if (scheduledAt <= new Date()) {
      toast.error("Selecione uma data/horário futuro");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("consultations").insert({
        user_id: userId,
        taromante_id: taromante.id,
        scheduled_at: scheduledAt.toISOString(),
        duration,
        consultation_type: consultationType,
        topic: topic || null,
        price,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Consulta agendada com sucesso! Você receberá a confirmação em breve.");
      onOpenChange(false);
      setDate(undefined);
      setTime("");
      setTopic("");
    } catch (err: any) {
      toast.error(err.message || "Erro ao agendar consulta");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agendar com {taromante.name}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div>
            <Label>Tipo de Consulta</Label>
            <Select value={consultationType} onValueChange={setConsultationType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Vídeo Chamada</SelectItem>
                <SelectItem value="chat">Chat ao Vivo</SelectItem>
                <SelectItem value="phone">Telefone</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Duração</Label>
            <Select value={String(duration)} onValueChange={(v) => setDuration(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutos</SelectItem>
                <SelectItem value="60">1 hora</SelectItem>
                <SelectItem value="90">1h30</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: ptBR }) : "Selecione a data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) => d < new Date() || d.getDay() === 0}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label>Horário</Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o horário">
                  {time ? (
                    <span className="flex items-center gap-2"><Clock className="w-4 h-4" />{time}</span>
                  ) : "Selecione o horário"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Assunto / Pergunta (opcional)</Label>
            <Textarea
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Descreva brevemente o que gostaria de explorar..."
              maxLength={500}
            />
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
            <p className="text-sm text-foreground/60">Valor da consulta</p>
            <p className="text-2xl font-bold text-primary">R$ {price.toFixed(2)}</p>
            <p className="text-xs text-foreground/50">{duration} min • {consultationType === "video" ? "Vídeo" : consultationType === "chat" ? "Chat" : "Telefone"}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleBook} disabled={saving}>
            {saving ? "Agendando..." : "Confirmar Agendamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
