import { useState, type FormEvent } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useCreateShipment } from "@/hooks/use-api";

interface CreateShipmentDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateShipmentDialog({ open, onClose }: CreateShipmentDialogProps) {
  const toast = useToast();
  const createMutation = useCreateShipment();

  const [form, setForm] = useState({
    trackingNumber: "",
    reference: "",
    customerId: "",
    metadata: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isDirty = Object.values(form).some((v) => v !== "");

  const handleClose = () => {
    if (isDirty && !window.confirm("Tienes cambios sin guardar. ¿Deseas cerrar?")) return;
    resetAndClose();
  };

  const resetAndClose = () => {
    setForm({ trackingNumber: "", reference: "", customerId: "", metadata: "" });
    setErrors({});
    onClose();
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.trackingNumber.trim()) errs.trackingNumber = "El numero de tracking es requerido";
    if (form.metadata.trim()) {
      try {
        JSON.parse(form.metadata);
      } catch {
        errs.metadata = "JSON invalido";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const metadata = form.metadata.trim() ? JSON.parse(form.metadata) : {};
      await createMutation.mutateAsync({
        trackingNumber: form.trackingNumber.trim(),
        reference: form.reference.trim() || undefined,
        customerId: form.customerId.trim() || undefined,
        metadata,
      });
      toast.success("Envio creado exitosamente");
      resetAndClose();
    } catch (err: any) {
      toast.error(err?.detail || "Error al crear el envio");
    }
  };

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <Dialog open={open} onClose={handleClose} title="Nuevo Envio" description="Registra un nuevo envio en el sistema" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Numero de Tracking"
          placeholder="1Z999AA10123456784"
          value={form.trackingNumber}
          onChange={(e) => update("trackingNumber", e.target.value)}
          error={errors.trackingNumber}
        />

        <Input
          label="Referencia"
          placeholder="Referencia interna (opcional)"
          value={form.reference}
          onChange={(e) => update("reference", e.target.value)}
        />

        <Input
          label="ID de Cliente"
          placeholder="Buscar por casillero o ID..."
          value={form.customerId}
          onChange={(e) => update("customerId", e.target.value)}
        />

        <Textarea
          label="Metadata (JSON)"
          placeholder='{"weight": 2.5, "description": "Electronics"}'
          value={form.metadata}
          onChange={(e) => update("metadata", e.target.value)}
          error={errors.metadata}
          rows={4}
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
          <Button variant="ghost" type="button" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={createMutation.isPending}>
            Crear Envio
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
