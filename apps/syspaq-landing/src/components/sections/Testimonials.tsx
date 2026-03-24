import { Star } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AnimateOnScroll } from "@/components/ui/AnimateOnScroll";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
  initials: string;
  color: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Antes manejábamos todo en Excel. Con SysPaq redujimos el tiempo de procesamiento en un 70% y nuestros clientes tienen visibilidad total de sus paquetes.",
    name: "María González",
    role: "Gerente de Operaciones",
    company: "CargoExpress RD",
    initials: "MG",
    color: "var(--color-primary-500)",
  },
  {
    quote:
      "La integración con Shopify fue un game-changer. Las órdenes llegan automáticamente y el tracking se actualiza solo. Nuestro equipo se enfoca en lo que importa.",
    name: "Carlos Reyes",
    role: "CEO",
    company: "FastBox Panamá",
    initials: "CR",
    color: "var(--color-accent-500)",
  },
  {
    quote:
      "El módulo de DGA nos ahorró horas de trabajo manual. Generar las etiquetas por contenedor y hacer el bulk update es increíble.",
    name: "Ana Martínez",
    role: "Directora de Logística",
    company: "AeroBox Colombia",
    initials: "AM",
    color: "#8b5cf6",
  },
];

export function Testimonials() {
  return (
    <section className="py-24">
      <Container>
        <SectionHeading
          badge="Testimonios"
          title="Lo que dicen nuestros clientes"
          subtitle="Couriers en toda Latinoamérica confían en SysPaq para sus operaciones diarias."
        />

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <AnimateOnScroll key={t.name} delay={i * 0.1}>
              <div className="flex h-full flex-col rounded-xl border border-surface-700/50 bg-surface-900/50 p-6">
                {/* Stars */}
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className="h-4 w-4 fill-accent-500 text-accent-500"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="flex-1 text-sm leading-relaxed text-surface-300">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="mt-6 flex items-center gap-3 border-t border-surface-800 pt-4">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: t.color }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-surface-500">
                      {t.role}, {t.company}
                    </p>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </Container>
    </section>
  );
}
