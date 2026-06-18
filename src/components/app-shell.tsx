import Link from "next/link";
import type { ReactNode } from "react";
import { Boxes, Building2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
};

type AppShellProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  navItems?: NavItem[];
  children: ReactNode;
};

export function AppShell({ eyebrow, title, description, navItems = [], children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
            <Boxes className="h-5 w-5 text-accent" aria-hidden="true" />
            Expotech Marketplace B2B
          </Link>
          {navItems.length > 0 ? (
            <nav className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => (
                <Button asChild variant="ghost" size="sm" key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              ))}
            </nav>
          ) : null}
        </div>
      </header>

      <main>
        <section className="border-b bg-muted/40">
          <div className="container flex flex-col gap-3 py-8">
            {eyebrow ? <p className="text-sm font-medium text-accent">{eyebrow}</p> : null}
            <h1 className="max-w-3xl text-3xl font-semibold tracking-normal md:text-4xl">{title}</h1>
            {description ? <p className="max-w-3xl text-base text-muted-foreground">{description}</p> : null}
          </div>
        </section>
        <div className="container py-8">{children}</div>
      </main>
    </div>
  );
}

export function AccessBadge({ variant }: { variant: "admin" | "client" | "buyer" }) {
  const copy = {
    admin: { icon: ShieldCheck, label: "SUPER_ADMIN_EXPOTECH" },
    client: { icon: Building2, label: "CLIENT_ADMIN" },
    buyer: { icon: Boxes, label: "BUYER aprobado" }
  }[variant];
  const Icon = copy.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium",
        "bg-background text-foreground"
      )}
    >
      <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
      {copy.label}
    </div>
  );
}
