import type { Campaign, Company } from "@prisma/client";

import { Button } from "@/components/ui/button";

type CampaignFormProps = {
  action: (formData: FormData) => Promise<void>;
  companies: Pick<Company, "id" | "name" | "rut">[];
  campaign?: Campaign;
};

function dateInputValue(value: Date | null | undefined) {
  if (!value) {
    return "";
  }

  return value.toISOString().slice(0, 10);
}

export function CampaignForm({ action, companies, campaign }: CampaignFormProps) {
  return (
    <form action={action} className="grid gap-6">
      {campaign ? <input type="hidden" name="id" value={campaign.id} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium">
          Nombre campana
          <input
            name="name"
            defaultValue={campaign?.name}
            className="h-10 w-full rounded-md border px-3 text-sm"
            required
          />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Slug
          <input
            name="slug"
            defaultValue={campaign?.slug}
            className="h-10 w-full rounded-md border px-3 text-sm"
            placeholder="venta-privada-mayorista"
            required
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium">
          Empresa mandante
          <select
            name="clientCompanyId"
            defaultValue={campaign?.clientCompanyId ?? ""}
            className="h-10 w-full rounded-md border px-3 text-sm"
          >
            <option value="">Seleccionar mandante</option>
            {companies.map((company) => (
              <option value={company.id} key={company.id}>
                {company.name}
                {company.rut ? ` - ${company.rut}` : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm font-medium">
          Nueva empresa mandante
          <input
            name="newClientCompanyName"
            className="h-10 w-full rounded-md border px-3 text-sm"
            placeholder="Opcional si no existe"
          />
        </label>
      </div>

      <label className="space-y-2 text-sm font-medium">
        Descripcion corta
        <input
          name="shortDescription"
          defaultValue={campaign?.shortDescription ?? ""}
          className="h-10 w-full rounded-md border px-3 text-sm"
          maxLength={240}
        />
      </label>

      <label className="space-y-2 text-sm font-medium">
        Descripcion
        <textarea
          name="description"
          defaultValue={campaign?.description ?? ""}
          className="min-h-24 w-full rounded-md border px-3 py-2 text-sm"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-4">
        <label className="space-y-2 text-sm font-medium">
          Inicio
          <input
            type="date"
            name="startDate"
            defaultValue={dateInputValue(campaign?.startDate)}
            className="h-10 w-full rounded-md border px-3 text-sm"
          />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Termino
          <input
            type="date"
            name="endDate"
            defaultValue={dateInputValue(campaign?.endDate)}
            className="h-10 w-full rounded-md border px-3 text-sm"
          />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Estado
          <select
            name="status"
            defaultValue={campaign?.status ?? "draft"}
            className="h-10 w-full rounded-md border px-3 text-sm"
          >
            <option value="draft">Borrador</option>
            <option value="active">Activa</option>
            <option value="paused">Pausada</option>
            <option value="closed">Cerrada</option>
            <option value="archived">Archivada</option>
          </select>
        </label>
        <label className="space-y-2 text-sm font-medium">
          Acceso
          <select
            name="accessType"
            defaultValue={campaign?.accessType ?? "invitation_only"}
            className="h-10 w-full rounded-md border px-3 text-sm"
          >
            <option value="invitation_only">Solo invitacion</option>
            <option value="approval_required">Requiere aprobacion</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium">
          Minimo de compra
          <input
            type="number"
            name="minimumOrderAmount"
            defaultValue={campaign?.minimumOrderAmount?.toString() ?? ""}
            className="h-10 w-full rounded-md border px-3 text-sm"
            min="0"
          />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Imagen hero URL
          <input
            type="url"
            name="heroImageUrl"
            defaultValue={campaign?.heroImageUrl ?? ""}
            className="h-10 w-full rounded-md border px-3 text-sm"
          />
        </label>
      </div>

      <label className="space-y-2 text-sm font-medium">
        Terminos y condiciones
        <textarea
          name="termsAndConditions"
          defaultValue={campaign?.termsAndConditions ?? ""}
          className="min-h-20 w-full rounded-md border px-3 py-2 text-sm"
        />
      </label>

      <div>
        <Button type="submit">{campaign ? "Guardar cambios" : "Crear campana"}</Button>
      </div>
    </form>
  );
}
