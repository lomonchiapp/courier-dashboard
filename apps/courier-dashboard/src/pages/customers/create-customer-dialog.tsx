import { useState, type FormEvent } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useCreateCustomer } from "@/hooks/use-api";

interface CreateCustomerDialogProps {
  open: boolean;
  onClose: () => void;
}

const ID_TYPE_OPTIONS = [
  { value: "CEDULA", label: "Cedula" },
  { value: "PASSPORT", label: "Pasaporte" },
  { value: "RNC", label: "RNC" },
  { value: "OTHER", label: "Otro" },
];

export function CreateCustomerDialog({ open, onClose }: CreateCustomerDialogProps) {
  const toast = useToast();
  const createMutation = useCreateCustomer();

  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    idType: "",
    idNumber: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isDirty = Object.values(form).some((v) => v !== "");

  const handleClose = () => {
    if (isDirty && !window.confirm("Tienes cambios sin guardar. ¿Deseas cerrar?")) return;
    resetAndClose();
  };

  const resetAndClose = () => {
    setForm({ email: "", firstName: "", lastName: "", phone: "", idType: "", idNumber: "" });
    setErrors({});
    onClose();
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.email.trim()) errs.email = "El email es requerido";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Email invalido";
    if (!form.firstName.trim()) errs.firstName = "El nombre es requerido";
    if (!form.lastName.trim()) errs.lastName = "El apellido es requerido";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await createMutation.mutateAsync({
        email: form.email.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim() || undefined,
        idType: form.idType || undefined,
        idNumber: form.idNumber.trim() || undefined,
      });
      toast.success("Cliente creado exitosamente");
      resetAndClose();
    } catch (err: any) {
      toast.error(err?.detail || "Error al crear el cliente");
    }
  };

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <Dialog open={open} onClose={handleClose} title="Nuevo Cliente" description="Ingresa los datos del nuevo cliente" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="correo@ejemplo.com"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          error={errors.email}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Nombre"
            placeholder="Juan"
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            error={errors.firstName}
          />
          <Input
            label="Apellido"
            placeholder="Perez"
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
            error={errors.lastName}
          />
        </div>

        <Input
          label="Telefono"
          placeholder="+1 809-555-0000"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Tipo de Documento"
            placeholder="Seleccionar..."
            options={ID_TYPE_OPTIONS}
            value={form.idType}
            onChange={(e) => update("idType", e.target.value)}
          />
          <Input
            label="Numero de Documento"
            placeholder="000-0000000-0"
            value={form.idNumber}
            onChange={(e) => update("idNumber", e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
          <Button variant="ghost" type="button" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={createMutation.isPending}>
            Crear Cliente
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
