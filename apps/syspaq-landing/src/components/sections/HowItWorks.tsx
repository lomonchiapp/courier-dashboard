import {
  Bell,
  PackageCheck,
  Ship,
  FileCheck,
  Truck,
  Receipt,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AnimateOnScroll } from "@/components/ui/AnimateOnScroll";

interface Step {
  number: number;
  icon: LucideIcon;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    number: 1,
    icon: Bell,
    title: "Pre-Alerta",
    description:
      "Tu cliente registra su compra desde el portal self-service. El sistema crea la pre-alerta y queda listo para recibir el paquete.",
  },
  {
    number: 2,
    icon: PackageCheck,
    title: "Recepción en Almacén",
    description:
      "El paquete llega al warehouse. Se pesa, se mide, se vincula con la pre-alerta y se aplican los cargos automáticamente.",
  },
  {
    number: 3,
    icon: Ship,
    title: "Consolidación & Embarque",
    description:
      "Agrupa envíos en contenedores marítimos o aéreos. Genera el manifiesto y transiciona el estado de cada paquete.",
  },
  {
    number: 4,
    icon: FileCheck,
    title: "Despacho de Aduanas",
    description:
      "Genera etiquetas DGA automáticamente. Somete, aprueba y despacha con actualización en bulk por contenedor.",
  },
  {
    number: 5,
    icon: Truck,
    title: "Entrega Final",
    description:
      "Crea órdenes de entrega, asigna chofer, y trackea en tiempo real. Pickup en sucursal, entrega a domicilio o locker.",
  },
  {
    number: 6,
    icon: Receipt,
    title: "Facturación & Cobro",
    description:
      "Genera facturas desde recepciones, aplica pagos con Stripe/PayPal, emite notas de crédito. Todo automatizado.",
  },
];

function StepCard({ step, index }: { step: Step; index: number }) {
  const isEven = index % 2 === 0;

  return (
    <AnimateOnScroll delay={index * 0.08} direction={isEven ? "left" : "right"}>
      <div className="relative flex items-start gap-6 md:items-center">
        {/* Left side — content or spacer */}
        <div className="hidden w-5/12 md:block">
          {isEven && (
            <div className="text-right">
              <h3 className="font-display text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-surface-400">
                {step.description}
              </p>
            </div>
          )}
        </div>

        {/* Center icon */}
        <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-primary-500/40 bg-surface-900 md:mx-auto">
          <step.icon className="h-5 w-5 text-primary-400" />
        </div>

        {/* Right side — content or spacer */}
        <div className="flex-1 md:w-5/12 md:flex-none">
          {/* Always show on mobile */}
          <div className="md:hidden">
            <h3 className="font-display text-lg font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-surface-400">
              {step.description}
            </p>
          </div>
          {/* Show on desktop only for odd steps */}
          {!isEven && (
            <div className="hidden md:block">
              <h3 className="font-display text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-surface-400">
                {step.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </AnimateOnScroll>
  );
}

export function HowItWorks() {
  return (
    <section id="como-funciona" className="relative py-24">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-primary-500/[0.02] to-transparent" />

      <Container className="relative">
        <SectionHeading
          badge="Cómo Funciona"
          title="De la compra al cobro, sin fricción"
          subtitle="Un flujo completo que cubre cada etapa de tu operación courier."
        />

        <div className="relative mx-auto max-w-3xl">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary-500/50 via-primary-500/20 to-transparent md:left-1/2 md:-translate-x-px" />

          <div className="space-y-12">
            {STEPS.map((step, i) => (
              <StepCard key={step.number} step={step} index={i} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
