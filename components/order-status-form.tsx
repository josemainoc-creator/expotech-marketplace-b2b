import type { OrderStatus } from "@prisma/client";

import { Button } from "@/components/ui/button";

type OrderStatusFormProps = {
  orderId: string;
  status: OrderStatus;
  adminNotes?: string | null;
  action: (formData: FormData) => Promise<void>;
};

export function OrderStatusForm({ orderId, status, adminNotes, action }: OrderStatusFormProps) {
  return (
    <form action={action} className="space-y-3 rounded-md border bg-card p-4">
      <input type="hidden" name="orderId" value={orderId} />
      <label className="space-y-2 text-sm font-medium">
        Estado
        <select name="status" defaultValue={status} className="h-10 w-full rounded-md border px-3 text-sm">
          <option value="submitted">Enviado</option>
          <option value="under_review">En revision</option>
          <option value="approved">Aprobado</option>
          <option value="rejected">Rechazado</option>
          <option value="fulfilled">Completado</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </label>
      <label className="space-y-2 text-sm font-medium">
        Nota interna
        <textarea name="adminNotes" defaultValue={adminNotes ?? ""} className="min-h-20 w-full rounded-md border px-3 py-2 text-sm" />
      </label>
      <Button type="submit">Actualizar pedido</Button>
    </form>
  );
}
