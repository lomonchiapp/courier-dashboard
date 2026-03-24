import { motion } from "motion/react";
import { ArrowRight, Play } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

function DashboardMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
      className="relative mx-auto mt-16 max-w-5xl"
    >
      {/* Glow behind */}
      <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-primary-500/20 via-accent-500/10 to-primary-500/20 blur-2xl" />

      {/* Browser frame */}
      <div className="relative overflow-hidden rounded-xl border border-surface-700/60 bg-surface-900 shadow-2xl">
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-surface-700/60 px-4 py-3">
          <div className="h-3 w-3 rounded-full bg-surface-600" />
          <div className="h-3 w-3 rounded-full bg-surface-600" />
          <div className="h-3 w-3 rounded-full bg-surface-600" />
          <div className="ml-4 h-5 w-64 rounded bg-surface-800" />
        </div>

        {/* Dashboard content mockup */}
        <div className="p-6">
          <div className="flex gap-6">
            {/* Sidebar mock */}
            <div className="hidden w-48 shrink-0 space-y-3 md:block">
              <div className="h-8 w-32 rounded bg-primary-500/20" />
              <div className="mt-6 space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-6 rounded bg-surface-800"
                    style={{ width: `${60 + Math.random() * 40}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Main content mock */}
            <div className="flex-1 space-y-4">
              {/* KPI row */}
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  { color: "bg-primary-500/20", border: "border-primary-500/30" },
                  { color: "bg-accent-500/20", border: "border-accent-500/30" },
                  { color: "bg-emerald-500/20", border: "border-emerald-500/30" },
                  { color: "bg-purple-500/20", border: "border-purple-500/30" },
                ].map((kpi, i) => (
                  <div
                    key={i}
                    className={`rounded-lg border ${kpi.border} ${kpi.color} p-3`}
                  >
                    <div className="h-3 w-12 rounded bg-surface-600/50" />
                    <div className="mt-2 h-6 w-16 rounded bg-surface-500/30" />
                  </div>
                ))}
              </div>

              {/* Chart mock */}
              <div className="rounded-lg border border-surface-700/40 bg-surface-800/50 p-4">
                <div className="h-3 w-32 rounded bg-surface-600/50" />
                <div className="mt-4 flex items-end gap-1.5 h-28">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-gradient-to-t from-primary-500/40 to-primary-500/10"
                      style={{ height: `${20 + Math.sin(i * 0.7) * 30 + Math.random() * 50}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* Table mock */}
              <div className="rounded-lg border border-surface-700/40 bg-surface-800/50 p-4">
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="h-4 w-24 rounded bg-surface-600/30" />
                      <div className="h-4 w-32 rounded bg-surface-600/20" />
                      <div className="h-4 w-20 rounded bg-primary-500/20" />
                      <div className="h-4 w-16 rounded bg-surface-600/20" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-32 pb-20">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 right-0 h-[600px] w-[600px] rounded-full bg-primary-500/8 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-accent-500/6 blur-[100px]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-surface-400) 1px, transparent 1px), linear-gradient(90deg, var(--color-surface-400) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <Container className="relative">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-400">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-400 animate-pulse" />
              Plataforma para Couriers en LATAM
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-8 font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-7xl"
          >
            Tu operación courier,{" "}
            <span className="bg-gradient-to-r from-primary-400 to-primary-200 bg-clip-text text-transparent">
              simplificada.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-surface-400 leading-relaxed sm:text-xl"
          >
            Gestiona envíos, recepciones, aduanas, entregas y facturación
            desde una sola plataforma. Con API completa, portal de clientes
            e integraciones e-commerce.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button variant="accent" href="#contacto">
              Comenzar Prueba Gratis
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="secondary" href="#como-funciona">
              <Play className="h-4 w-4" />
              Ver Cómo Funciona
            </Button>
          </motion.div>
        </div>

        {/* Dashboard mockup */}
        <DashboardMockup />
      </Container>
    </section>
  );
}
