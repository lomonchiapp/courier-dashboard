import { Container } from "@/components/ui/Container";
import { AnimateOnScroll } from "@/components/ui/AnimateOnScroll";

const LOGOS = [
  "CargoExpress",
  "EnvíoRD",
  "PaqWorld",
  "TransCaribe",
  "AeroBox",
  "FastCourier",
];

export function LogoCloud() {
  return (
    <section className="border-y border-surface-800 py-12">
      <Container>
        <AnimateOnScroll>
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-surface-500">
            Empresas que confían en SysPaq
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {LOGOS.map((name) => (
              <div
                key={name}
                className="font-display text-lg font-semibold text-surface-600 transition-colors hover:text-surface-400"
              >
                {name}
              </div>
            ))}
          </div>
        </AnimateOnScroll>
      </Container>
    </section>
  );
}
