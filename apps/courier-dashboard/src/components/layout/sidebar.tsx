import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Package,
  Bell,
  PackageCheck,
  CheckCircle,
  Ship,
  FileCheck,
  Truck,
  FileText,
  CreditCard,
  ReceiptText,
  Building2,
  Calculator,
  Webhook,
  BellRing,
  ShoppingCart,
  Upload,
  Settings,
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@blumbox/ui";
import { usePermissions } from "@/hooks/use-permissions";
import { useThemeStore } from "@/stores/theme.store";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  permission: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "General",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, permission: "dashboard" },
      { label: "Analytics", path: "/analytics", icon: BarChart3, permission: "analytics" },
    ],
  },
  {
    title: "Operaciones",
    items: [
      { label: "Clientes", path: "/customers", icon: Users, permission: "customers" },
      { label: "Envíos", path: "/shipments", icon: Package, permission: "shipments" },
      { label: "Pre-Alertas", path: "/pre-alerts", icon: Bell, permission: "pre-alerts" },
      { label: "Recepciones", path: "/receptions", icon: PackageCheck, permission: "receptions" },
      { label: "Post-Alertas", path: "/post-alerts", icon: CheckCircle, permission: "post-alerts" },
    ],
  },
  {
    title: "Logística",
    items: [
      { label: "Contenedores", path: "/containers", icon: Ship, permission: "containers" },
      { label: "DGA", path: "/dga", icon: FileCheck, permission: "dga" },
      { label: "Órdenes de Entrega", path: "/delivery-orders", icon: Truck, permission: "delivery-orders" },
    ],
  },
  {
    title: "Facturación",
    items: [
      { label: "Facturas", path: "/invoices", icon: FileText, permission: "invoices" },
      { label: "Pagos", path: "/payments", icon: CreditCard, permission: "payments" },
      { label: "Notas de Crédito", path: "/credit-notes", icon: ReceiptText, permission: "credit-notes" },
    ],
  },
  {
    title: "Configuración",
    items: [
      { label: "Sucursales", path: "/branches", icon: Building2, permission: "branches" },
      { label: "Tarifas", path: "/rate-tables", icon: Calculator, permission: "rate-tables" },
      { label: "Webhooks", path: "/webhooks", icon: Webhook, permission: "webhooks" },
      { label: "Notificaciones", path: "/notifications", icon: BellRing, permission: "notifications" },
      { label: "E-commerce", path: "/ecommerce", icon: ShoppingCart, permission: "ecommerce" },
      { label: "Import", path: "/bulk-import", icon: Upload, permission: "bulk-import" },
      { label: "Ajustes", path: "/settings", icon: Settings, permission: "settings" },
    ],
  },
];

function BlumboxLogo() {
  return (
    <svg
      viewBox="0 0 1057 269"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-8 w-auto"
    >
      <path
        d="M144.879 90.0973C151.337 87.2627 157.204 83.2038 162.142 78.1329C172.607 67.4034 178.479 53.1737 178.479 38.3571C178.479 23.5405 172.607 9.3108 162.142 -1.41872C156.573 -7.10498 149.876 -11.549 142.462 -14.4846C135.049 -17.4203 127.079 -18.7862 119.092 -18.4939H2.28516V171.037H121.684C130.134 171.343 138.567 169.842 146.383 166.64C154.199 163.438 161.22 158.605 166.982 152.46C172.335 146.766 176.505 140.077 179.235 132.789C181.966 125.5 183.202 117.755 182.87 109.993C183.076 99.3757 179.506 89.0199 173.003 80.6779C168.022 74.5685 161.523 69.8241 154.131 67.0047C149.655 65.4098 145.007 64.3564 140.282 63.8672C135.201 63.4208 130.098 63.4208 125.017 63.8672L144.879 90.0973ZM49.6999 25.4089H114.748C120.153 25.0614 125.554 25.9857 130.54 28.1102C135.526 30.2348 139.97 33.505 143.543 37.6706C146.697 41.6101 148.992 46.1539 150.284 51.0214C151.576 55.889 151.837 60.97 151.052 65.9445C150.349 70.7697 148.633 75.3954 146.022 79.5204C143.411 83.6454 139.959 87.181 135.891 89.8898C127.462 94.6853 117.732 96.529 108.177 95.1207H49.6999V25.4089ZM128.994 128.618C125.137 132.944 120.283 136.289 114.865 138.346C109.447 140.403 103.62 141.113 97.8772 140.417H49.6999V104.683H97.6408C103.467 103.898 109.402 104.577 114.898 106.66C120.394 108.743 125.283 112.169 129.112 116.637C131.206 119.565 132.616 122.926 133.232 126.473C132.777 127.223 132.022 127.888 131.567 128.618H128.994Z"
        fill="#FEFEFF"
      />
      <path
        d="M202.363 -18.4939V171.154H249.779V-18.4939H202.363Z"
        fill="#FEFEFF"
      />
      <path
        d="M374.334 -18.4939V100.145C374.334 107.918 373.217 115.648 370.988 123.082C369.018 129.6 365.51 135.556 360.748 140.417C356.319 144.827 350.964 148.213 345.074 150.327C339.184 152.441 332.895 153.228 326.668 152.638C320.507 153.163 314.307 152.346 308.492 150.241C302.677 148.135 297.377 144.791 293.003 140.417C288.193 135.584 284.635 129.636 282.651 123.082C280.461 115.636 279.344 107.912 279.338 100.145V-18.4939H232.039V100.145C231.523 115.714 234.743 131.179 241.454 145.236C247.339 157.252 256.78 167.301 268.452 173.926C280.456 180.543 294.03 183.702 307.688 183.041H345.66C359.318 183.702 372.892 180.543 384.896 173.926C396.568 167.301 406.009 157.252 411.895 145.236C418.605 131.179 421.826 115.714 421.309 100.145V-18.4939H374.334Z"
        fill="#FEFEFF"
      />
      <path
        d="M647.535 -18.4939L600.236 78.4893L552.704 -18.4939H490.347V171.154H535.651V42.7553L577.547 128.618H619.443L661.34 42.7553V171.154H708.639V-18.4939H647.535Z"
        fill="#FEFEFF"
      />
      <path
        d="M143.252 201.696H120.447V268.153H143.252C150.587 268.635 157.869 266.597 163.791 262.382C166.282 260.231 168.244 257.542 169.527 254.519C170.811 251.496 171.381 248.22 171.193 244.942C171.405 241.666 170.844 238.387 169.555 235.371C168.265 232.354 166.284 229.683 163.791 227.565C157.887 223.298 150.601 221.226 143.252 221.702H139.075V201.696ZM133.312 212.143H143.252C148.416 211.678 153.571 212.863 157.93 215.514C159.905 217.016 161.474 218.99 162.496 221.258C163.519 223.526 163.961 226.015 163.778 228.497C163.981 230.953 163.571 233.42 162.583 235.676C161.594 237.931 160.058 239.906 158.112 241.429C153.671 243.928 148.556 244.988 143.478 244.457H133.312V212.143ZM133.312 254.568H143.252C148.427 254.079 153.607 255.149 158.112 257.641C160.042 259.124 161.567 261.068 162.545 263.297C163.523 265.527 163.924 267.97 163.708 270.399C163.929 272.859 163.534 275.334 162.556 277.594C161.578 279.854 160.049 281.826 158.112 283.329C153.571 285.828 148.456 286.888 143.378 286.357H133.312V254.568Z"
        fill="#FEFEFF"
      />
      <path
        d="M178.379 201.696V268.153H220.863V257.706H191.034V201.696H178.379Z"
        fill="#FEFEFF"
      />
      <path
        d="M274.887 201.696V244.162C275.13 247.696 274.577 251.239 273.268 254.527C272.25 257.063 270.459 259.209 268.148 260.666C265.716 262.128 262.933 262.878 260.107 262.828C257.291 262.878 254.518 262.128 252.095 260.666C249.81 259.193 248.038 257.044 246.997 254.511C245.664 251.229 245.083 247.686 245.3 244.146V201.679H232.646V244.146C232.195 249.773 233.25 255.417 235.704 260.487C237.894 264.782 241.28 268.347 245.443 270.737C249.779 273.022 254.612 274.182 259.504 274.109H260.993C265.885 274.182 270.718 273.022 275.054 270.737C279.178 268.367 282.548 264.844 284.762 260.592C287.275 255.528 288.375 249.87 287.948 244.222V201.696H274.887Z"
        fill="#FEFEFF"
      />
      <path
        d="M363.371 201.696L340.332 237.606L317.528 201.696H302.892V268.153H315.547V218.331L336.155 249.713H344.393L365.001 218.331V268.153H377.655V201.696H363.371Z"
        fill="#FEFEFF"
      />
      <path
        d="M143.252 201.696H120.447V268.153H143.252C150.587 268.635 157.869 266.597 163.791 262.382C166.282 260.231 168.244 257.542 169.527 254.519C170.811 251.496 171.381 248.22 171.193 244.942C171.405 241.666 170.844 238.387 169.555 235.371C168.265 232.354 166.284 229.683 163.791 227.565C157.887 223.298 150.601 221.226 143.252 221.702H139.075V201.696ZM133.312 212.143H143.252C148.416 211.678 153.571 212.863 157.93 215.514C159.905 217.016 161.474 218.99 162.496 221.258C163.519 223.526 163.961 226.015 163.778 228.497C163.981 230.953 163.571 233.42 162.583 235.676C161.594 237.931 160.058 239.906 158.112 241.429C153.671 243.928 148.556 244.988 143.478 244.457H133.312V212.143ZM133.312 254.568H143.252C148.427 254.079 153.607 255.149 158.112 257.641C160.042 259.124 161.567 261.068 162.545 263.297C163.523 265.527 163.924 267.97 163.708 270.399C163.929 272.859 163.534 275.334 162.556 277.594C161.578 279.854 160.049 281.826 158.112 283.329C153.571 285.828 148.456 286.888 143.378 286.357H133.312V254.568Z"
        fill="#FEFEFF"
      />
      <path
        d="M431.836 201.696L410.407 237.606L388.978 268.153H403.614L410.407 257.706H453.471L460.264 268.153H474.9L431.836 201.696ZM417.2 247.259L431.836 223.981L446.472 247.259H417.2Z"
        fill="#FEFEFF"
      />
      <path
        d="M525.975 225.863C525.975 221.356 524.213 217.034 521.083 213.848C517.953 210.662 513.707 208.867 509.279 208.867H484.667V219.314H509.279C510.983 219.314 512.617 220.001 513.821 221.224C515.026 222.447 515.703 224.107 515.703 225.837C515.703 227.568 515.026 229.228 513.821 230.451C512.617 231.673 510.983 232.361 509.279 232.361H498.221C493.782 232.361 489.525 234.162 486.387 237.357C483.249 240.552 481.484 244.884 481.484 249.403C481.484 253.922 483.249 258.255 486.387 261.449C489.525 264.644 493.782 266.446 498.221 266.446H525.975V255.999H498.221C496.517 255.999 494.883 255.312 493.679 254.089C492.474 252.866 491.798 251.206 491.798 249.476C491.798 247.745 492.474 246.085 493.679 244.862C494.883 243.64 496.517 242.952 498.221 242.952H509.279C513.707 242.952 517.953 241.157 521.083 237.971C524.213 234.785 525.975 230.463 525.975 225.957V225.863Z"
        fill="#FEFEFF"
      />
      <path
        d="M551.764 225.863C551.764 221.356 550.002 217.034 546.872 213.848C543.742 210.662 539.496 208.867 535.068 208.867H510.473V219.314H535.068C536.772 219.314 538.406 220.001 539.61 221.224C540.815 222.447 541.491 224.107 541.491 225.837C541.491 227.568 540.815 229.228 539.61 230.451C538.406 231.673 536.772 232.361 535.068 232.361H524.01C519.571 232.361 515.315 234.162 512.176 237.357C509.038 240.552 507.273 244.884 507.273 249.403C507.273 253.922 509.038 258.255 512.176 261.449C515.315 264.644 519.571 266.446 524.01 266.446H551.764V255.999H524.01C522.306 255.999 520.672 255.312 519.468 254.089C518.263 252.866 517.587 251.206 517.587 249.476C517.587 247.745 518.263 246.085 519.468 244.862C520.672 243.64 522.306 242.952 524.01 242.952H535.068C539.496 242.952 543.742 241.157 546.872 237.971C550.002 234.785 551.764 230.463 551.764 225.957V225.863Z"
        fill="#FEFEFF"
      />
    </svg>
  );
}

export function Sidebar() {
  const { canAccess } = usePermissions();
  const { mode, toggle } = useThemeStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[var(--sidebar-border)]">
        <BlumboxLogo />
        <div className="flex flex-col">
          <span className="text-xs font-semibold tracking-wider text-[var(--accent)] uppercase">
            Courier Dashboard
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAV_SECTIONS.map((section) => {
          const visibleItems = section.items.filter((item) => canAccess(item.permission));
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title}>
              <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                {section.title}
              </p>
              <ul className="space-y-0.5">
                {visibleItems.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                          isActive
                            ? "bg-[var(--sidebar-accent)]/15 text-[var(--sidebar-accent)] font-semibold"
                            : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]/10"
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="px-4 py-3 border-t border-[var(--sidebar-border)]">
        <button
          onClick={toggle}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]/10 transition-colors"
        >
          {mode === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          <span>{mode === "dark" ? "Modo Claro" : "Modo Oscuro"}</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-3 left-3 z-50 p-2 rounded-md bg-[var(--card)] border border-[var(--border)] lg:hidden"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static z-40 inset-y-0 left-0 w-[260px] flex flex-col",
          "bg-[var(--sidebar)] border-r border-[var(--sidebar-border)]",
          "transition-transform duration-200 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {navContent}
      </aside>
    </>
  );
}
