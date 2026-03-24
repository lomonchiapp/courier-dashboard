import {
  Package,
  PackageCheck,
  Ship,
  FileCheck,
  Truck,
  FileText,
  BarChart3,
  Webhook,
  Building2,
  ShoppingCart,
  CreditCard,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AnimateOnScroll } from "@/components/ui/AnimateOnScroll";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

const FEATURES: Feature[] = [
  {
    icon: Package,
    title: "Tracking de Envíos",
    description:
      "Seguimiento completo con 9 fases: desde la creación hasta la entrega. Máquina de estados con eventos y transiciones automáticas.",
    color: "var(--color-primary-500)",
  },
  {
    icon: PackageCheck,
    title: "Recepciones de Almacén",
    description:
      "Registra paquetes con peso real y volumétrico. Aplica cargos automáticos y gestiona el flujo de recepción a entrega.",
    color: "var(--color-accent-500)",
  },
  {
    icon: Ship,
    title: "Contenedores",
    description:
      "Consolida envíos en contenedores marítimos (FCL/LCL) o aéreos. Transiciona estados y genera manifiestos DGA.",
    color: "#8b5cf6",
  },
  {
    icon: FileCheck,
    title: "Aduanas & DGA",
    description:
      "Genera etiquetas DGA automáticamente por contenedor. Seguimiento de estados: pendiente, sometido, aprobado, despachado.",
    color: "#f97316",
  },
  {
    icon: Truck,
    title: "Entregas Última Milla",
    description:
      "Órdenes de entrega con asignación de chofer, tipos de entrega (pickup, domicilio, locker) y tracking en tiempo real.",
    color: "#22c55e",
  },
  {
    icon: FileText,
    title: "Facturación Completa",
    description:
      "Facturas desde borrador hasta cobro. Pagos con múltiples métodos, notas de crédito, y generación automática desde recepciones.",
    color: "#ec4899",
  },
  {
    icon: CreditCard,
    title: "Pasarela de Pagos",
    description:
      "Integración con Stripe y PayPal. Tus clientes pagan online con intents de pago y webhooks automáticos.",
    color: "#6366f1",
  },
  {
    icon: BarChart3,
    title: "Analytics en Tiempo Real",
    description:
      "Dashboard con KPIs de envíos, ingresos, performance de entregas, top clientes y desglose por método de pago.",
    color: "var(--color-primary-500)",
  },
  {
    icon: ShoppingCart,
    title: "E-commerce",
    description:
      "Conecta Shopify y WooCommerce. Recibe órdenes automáticamente y sincroniza el estado de tus envíos.",
    color: "#f59e0b",
  },
  {
    icon: Webhook,
    title: "API & Webhooks",
    description:
      "API REST completa con autenticación JWT y API keys. Webhooks configurables para cada evento del sistema.",
    color: "#14b8a6",
  },
  {
    icon: Users,
    title: "Portal de Clientes",
    description:
      "Tus clientes se registran, crean pre-alertas, consultan envíos, ven facturas y pagan — todo self-service.",
    color: "#a855f7",
  },
  {
    icon: Building2,
    title: "Multi-Sucursal",
    description:
      "Gestiona warehouses, puntos de recogida, oficinas y centros de distribución desde un solo tenant.",
    color: "var(--color-accent-500)",
  },
];

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  return (
    <AnimateOnScroll delay={index * 0.05}>
      <div className="group relative rounded-xl border border-surface-700/50 bg-surface-900/50 p-6 transition-all duration-300 hover:border-primary-500/30 hover:bg-surface-900">
        {/* Hover glow */}
        <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        <div className="relative">
          <div
            className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg"
            style={{
              backgroundColor: `color-mix(in srgb, ${feature.color} 12%, transparent)`,
            }}
          >
            <feature.icon className="h-5 w-5" style={{ color: feature.color }} />
          </div>
          <h3 className="font-display text-lg font-semibold">{feature.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-surface-400">
            {feature.description}
          </p>
        </div>
      </div>
    </AnimateOnScroll>
  );
}

export function Features() {
  return (
    <section id="funciones" className="py-24">
      <Container>
        <SectionHeading
          badge="Funciones"
          title="Todo lo que tu courier necesita"
          subtitle="Desde la pre-alerta hasta el cobro. SysPaq cubre cada paso de tu operación logística."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </Container>
    </section>
  );
}
