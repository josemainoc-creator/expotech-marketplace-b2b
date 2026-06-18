import { cn } from "@/lib/utils";

const statusLabels: Record<string, string> = {
  draft: "Borrador",
  active: "Activa",
  paused: "Pausada",
  closed: "Cerrada",
  archived: "Archivada",
  out_of_stock: "Agotado",
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
  inactive: "Inactivo",
  created: "Creada",
  sent: "Enviada",
  opened: "Abierta",
  registered: "Registrada",
  expired: "Expirada",
  cancelled: "Cancelada",
  new: "Nuevo",
  contacted: "Contactado",
  interested: "Interesado",
  submitted: "Enviado",
  under_review: "En revision",
  fulfilled: "Completado"
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md border px-2.5 py-1 text-xs font-medium",
        status === "active" && "border-emerald-200 bg-emerald-50 text-emerald-700",
        status === "draft" && "border-slate-200 bg-slate-50 text-slate-700",
        status === "paused" && "border-amber-200 bg-amber-50 text-amber-700",
        status === "closed" && "border-zinc-200 bg-zinc-50 text-zinc-700",
        status === "archived" && "border-zinc-200 bg-zinc-100 text-zinc-600",
        status === "pending" && "border-amber-200 bg-amber-50 text-amber-700",
        status === "approved" && "border-emerald-200 bg-emerald-50 text-emerald-700",
        status === "rejected" && "border-red-200 bg-red-50 text-red-700",
        status === "inactive" && "border-zinc-200 bg-zinc-50 text-zinc-600"
      )}
    >
      {statusLabels[status] ?? status}
    </span>
  );
}
