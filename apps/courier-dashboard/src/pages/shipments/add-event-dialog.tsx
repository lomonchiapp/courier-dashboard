import { useState, type FormEvent } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useAddShipmentEvent } from "@/hooks/use-api";

interface AddEventDialogProps {
  open: boolean;
  onClose: () => void;
  shipmentId: string;
}

const EVENT_TYPES = [
  { value: "STATUS_UPDATE", label: "Actualizacion de Estado" },
  { value: "CREATED", label: "Creado" },
  { value: "RECEIVED", label: "Recibido" },
  { value: "IN_TRANSIT", label: "En Transito" },
  { value: "IN_CUSTOMS", label: "En Aduanas" },
  { value: "CUSTOMS_HOLD", label: "Retencion Aduanal" },
  { value: "CLEARED", label: "Liberado" },
  { value: "OUT_FOR_DELIVERY", label: "En Ruta de Entrega" },
  { value: "DELIVERED", label: "Entregado" },
  { value: "EXCEPTION", label: "Excepcion" },
  { value: "RETURNED", label: "Devuelto" },
  { value: "PICKUP", label: "Recogida" },
];

const SOURCE_OPTIONS = [
  { value: "MANUAL", label: "Manual" },
  { value: "API", label: "API" },
  { value: "WEBHOOK", label: "Webhook" },
  { value: "SCANNER", label: "Scanner" },
  { value: "SYSTEM", label: "Sistema" },
];

export function AddEventDialog({ open, onClose, shipmentId }: AddEventDialogProps) {
  const toast = useToast();
  const addEventMutation = useAddShipmentEvent();

  const [form, setForm] = useState({
    type: "STATUS_UPDATE",
    source: "MANUAL",
    rawStatus: "",
    location: "",
    idempotencyKey: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleClose = () => {
    resetAndClose();
  };

  const resetAndClose = () => {
    setForm({ type: "STATUS_UPDATE", source: "MANUAL", rawStatus: "", location: "", idempotencyKey: "" });
    setErrors({});
    onClose();
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.type) errs.type = "El tipo es requerido";
    if (!form.source) errs.source = "El origen es requerido";
    if (form.location.trim()) {
      try {
        JSON.parse(form.location);
      } catch {
        errs.location = "JSON invalido";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const location = form.location.trim() ? JSON.parse(form.location) : undefined;
      await addEventMutation.mutateAsync({
        shipmentId,
        type: form.type,
        source: form.source,
        rawStatus: form.rawStatus.trim() || undefined,
        location,
        idempotencyKey: form.idempotencyKey.trim() || undefined,
      });
      toast.success("Evento agregado exitosamente");
      resetAndClose();
    } catch (err: any) {
      toast.error(err?.detail || "Error al agregar el evento");
    }
  };

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <Dialog open={open} onClose={handleClose} title="Agregar Evento" description="Registra un nuevo evento de tracking" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Tipo de Evento"
            options={EVENT_TYPES}
            value={form.type}
            onChange={(e) => update("type", e.target.value)}
            error={errors.type}
          />
          <Select
            label="Origen"
            options={SOURCE_OPTIONS}
            value={form.source}
            onChange={(e) => update("source", e.target.value)}
            error={errors.source}
          />
        </div>

        <Input
          label="Estado Raw"
          placeholder="Paquete recibido en almacen"
          value={form.rawStatus}
          onChange={(e) => update("rawStatus", e.target.value)}
        />

        <Textarea
          label="Ubicacion (JSON)"
          placeholder='{"city": "Santo Domingo", "country": "DO"}'
          value={form.location}
          onChange={(e) => update("location", e.target.value)}
          error={errors.location}
          rows={3}
        />

        <Input
          label="Idempotency Key"
          placeholder="Clave unica para evitar duplicados (opcional)"
          value={form.idempotencyKey}
          onChange={(e) => update("idempotencyKey", e.target.value)}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
          <Button variant="ghost" type="button" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={addEventMutation.isPending}>
            Agregar Evento
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
