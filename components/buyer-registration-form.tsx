import { Button } from "@/components/ui/button";

type BuyerRegistrationFormProps = {
  action: (formData: FormData) => Promise<void>;
  invitationToken?: string;
  defaults?: {
    companyName?: string | null;
    contactName?: string | null;
    email?: string | null;
    phone?: string | null;
  };
};

const categories = ["Bebes", "Higiene personal", "Cuidado familiar", "Limpieza", "Packs mayoristas"];

export function BuyerRegistrationForm({ action, invitationToken, defaults }: BuyerRegistrationFormProps) {
  return (
    <form action={action} className="grid gap-6">
      {invitationToken ? <input type="hidden" name="invitationToken" value={invitationToken} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium">
          Nombre empresa
          <input
            name="companyName"
            defaultValue={defaults?.companyName ?? ""}
            className="h-10 w-full rounded-md border px-3 text-sm"
            required
          />
        </label>
        <label className="space-y-2 text-sm font-medium">
          RUT
          <input name="rut" className="h-10 w-full rounded-md border px-3 text-sm" required />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Giro o tipo de negocio
          <input name="businessType" className="h-10 w-full rounded-md border px-3 text-sm" required />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Tipo de comercio
          <input name="tradeType" className="h-10 w-full rounded-md border px-3 text-sm" required />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Nombre contacto
          <input
            name="contactName"
            defaultValue={defaults?.contactName ?? ""}
            className="h-10 w-full rounded-md border px-3 text-sm"
            required
          />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Email
          <input
            name="email"
            defaultValue={defaults?.email ?? ""}
            className="h-10 w-full rounded-md border px-3 text-sm"
            type="email"
            required
          />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Telefono
          <input
            name="phone"
            defaultValue={defaults?.phone ?? ""}
            className="h-10 w-full rounded-md border px-3 text-sm"
            required
          />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Region
          <input name="region" className="h-10 w-full rounded-md border px-3 text-sm" required />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Comuna
          <input name="comuna" className="h-10 w-full rounded-md border px-3 text-sm" required />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Direccion
          <input name="address" className="h-10 w-full rounded-md border px-3 text-sm" required />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Volumen estimado de compra
          <input
            name="monthlyPurchaseEstimate"
            className="h-10 w-full rounded-md border px-3 text-sm"
            type="number"
            min="0"
            required
          />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Contrasena
          <input name="password" className="h-10 w-full rounded-md border px-3 text-sm" type="password" required />
        </label>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Categorias de interes</legend>
        <div className="grid gap-3 md:grid-cols-2">
          {categories.map((category) => (
            <label className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm" key={category}>
              <input type="checkbox" name="categoriesOfInterest" value={category} />
              {category}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="acceptedTerms" className="mt-1" required />
        <span>Acepto que mi solicitud sea revisada por Expotech antes de habilitar acceso a ventas privadas.</span>
      </label>

      <div>
        <Button type="submit">Enviar solicitud</Button>
      </div>
    </form>
  );
}
