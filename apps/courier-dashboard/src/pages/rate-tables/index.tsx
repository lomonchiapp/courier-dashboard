import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Plus, Star, Layers, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { KpiSkeleton } from "@/components/shared/loading-skeleton";
import { useToast } from "@/components/ui/toast";
import { useRateTables, useCreateRateTable } from "@/hooks/use-api";
import type { RateTable } from "@/types/api";

export default function RateTablesPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [originZone, setOriginZone] = useState("");
  const [destZone, setDestZone] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const { data, isLoading, isError, refetch } = useRateTables();
  const createMutation = useCreateRateTable();

  const tables = data?.data ?? [];

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        originZone: originZone.trim() || undefined,
        destZone: destZone.trim() || undefined,
        isDefault,
      } as Partial<RateTable>);
      toast.success("Tabla de tarifas creada");
      setShowCreate(false);
      resetForm();
    } catch {
      toast.error("Error al crear la tabla de tarifas");
    }
  };

  const resetForm = () => {
    setName("");
    setOriginZone("");
    setDestZone("");
    setIsDefault(false);
  };

  return (
    <div>
      <PageHeader
        title="Tablas de Tarifas"
        description="Configuracion de precios por peso y zona"
      >
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setShowCreate(true)}
        >
          Nueva Tabla
        </Button>
      </PageHeader>

      {/* Error */}
      {isError && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 text-center mb-6">
          <p className="text-[var(--muted-foreground)] mb-3">
            No se pudieron cargar las tablas de tarifas.
          </p>
          <Button variant="primary" onClick={() => refetch()}>
            Reintentar
          </Button>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <KpiSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && tables.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--muted-foreground)]">
          <Layers className="h-12 w-12 mb-4 opacity-40" />
          <p className="text-lg font-semibold mb-1">Sin tablas de tarifas</p>
          <p className="text-sm mb-4">
            Crea tu primera tabla para definir precios por peso y zona.
          </p>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Crear Tabla
          </Button>
        </div>
      )}

      {/* Cards Grid */}
      {!isLoading && !isError && tables.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tables.map((table, idx) => (
            <motion.div
              key={table.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              onClick={() => navigate(`/rate-tables/${table.id}`)}
              className="group relative rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 cursor-pointer transition-all hover:border-[var(--primary)] hover:shadow-lg hover:shadow-[var(--primary)]/5"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-base font-bold font-display truncate">
                  {table.name}
                </h3>
                {table.isDefault && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 text-amber-400 px-2 py-0.5 text-[10px] font-semibold shrink-0 ml-2">
                    <Star className="h-3 w-3" />
                    DEFAULT
                  </span>
                )}
              </div>

              {(table.originZone || table.destZone) && (
                <p className="text-sm text-[var(--muted-foreground)] mb-3">
                  {table.originZone || "—"} → {table.destZone || "—"}
                </p>
              )}

              <div className="flex items-center justify-between">
                <StatusBadge
                  status={table.isActive ? "ACTIVE" : "INACTIVE"}
                />
                <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog
        open={showCreate}
        onClose={() => {
          setShowCreate(false);
          resetForm();
        }}
        title="Nueva Tabla de Tarifas"
        description="Define un nombre y las zonas de origen y destino."
      >
        <div className="space-y-4">
          <Input
            label="Nombre"
            placeholder="Ej: Tarifa Standard Miami-SDQ"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Zona Origen"
              placeholder="Ej: MIA"
              value={originZone}
              onChange={(e) => setOriginZone(e.target.value)}
            />
            <Input
              label="Zona Destino"
              placeholder="Ej: SDQ"
              value={destZone}
              onChange={(e) => setDestZone(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="h-4 w-4 rounded border-[var(--border)] accent-[var(--primary)]"
            />
            <span className="text-sm font-medium">
              Marcar como tabla predeterminada
            </span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreate(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              isLoading={createMutation.isPending}
              disabled={!name.trim()}
            >
              Crear Tabla
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
