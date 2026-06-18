import type { Campaign, Product, ProductCategory } from "@prisma/client";

import { Button } from "@/components/ui/button";

type ProductFormProps = {
  action: (formData: FormData) => Promise<void>;
  campaigns: Pick<Campaign, "id" | "name">[];
  categories: Pick<ProductCategory, "id" | "name" | "campaignId">[];
  product?: Product;
};

function dateInputValue(value: Date | null | undefined) {
  if (!value) {
    return "";
  }

  return value.toISOString().slice(0, 10);
}

export function ProductForm({ action, campaigns, categories, product }: ProductFormProps) {
  return (
    <form action={action} className="grid gap-6">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium">
          Campana
          <select name="campaignId" defaultValue={product?.campaignId ?? ""} className="h-10 w-full rounded-md border px-3 text-sm" required>
            <option value="">Seleccionar campana</option>
            {campaigns.map((campaign) => (
              <option value={campaign.id} key={campaign.id}>
                {campaign.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm font-medium">
          SKU
          <input name="sku" defaultValue={product?.sku ?? ""} className="h-10 w-full rounded-md border px-3 text-sm" required />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium">
          Nombre
          <input name="name" defaultValue={product?.name ?? ""} className="h-10 w-full rounded-md border px-3 text-sm" required />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Marca
          <input name="brand" defaultValue={product?.brand ?? ""} className="h-10 w-full rounded-md border px-3 text-sm" />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium">
          Categoria
          <select name="categoryId" defaultValue={product?.categoryId ?? ""} className="h-10 w-full rounded-md border px-3 text-sm">
            <option value="">Seleccionar categoria</option>
            {categories.map((category) => (
              <option value={category.id} key={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm font-medium">
          Nueva categoria
          <input name="newCategoryName" className="h-10 w-full rounded-md border px-3 text-sm" placeholder="Opcional" />
        </label>
      </div>

      <label className="space-y-2 text-sm font-medium">
        Descripcion
        <textarea name="description" defaultValue={product?.description ?? ""} className="min-h-24 w-full rounded-md border px-3 py-2 text-sm" />
      </label>

      <div className="grid gap-4 md:grid-cols-4">
        <label className="space-y-2 text-sm font-medium">
          Precio lista
          <input
            name="regularPrice"
            type="number"
            min="0"
            defaultValue={product?.regularPrice?.toString() ?? ""}
            className="h-10 w-full rounded-md border px-3 text-sm"
          />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Precio liquidacion
          <input
            name="liquidationPrice"
            type="number"
            min="0"
            defaultValue={product?.liquidationPrice?.toString() ?? ""}
            className="h-10 w-full rounded-md border px-3 text-sm"
          />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Precio mayorista
          <input
            name="wholesalePrice"
            type="number"
            min="1"
            defaultValue={product?.wholesalePrice?.toString() ?? ""}
            className="h-10 w-full rounded-md border px-3 text-sm"
            required
          />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Minimo
          <input
            name="minOrderQty"
            type="number"
            min="1"
            defaultValue={product?.minOrderQty ?? 1}
            className="h-10 w-full rounded-md border px-3 text-sm"
            required
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <label className="space-y-2 text-sm font-medium">
          Unidad
          <input name="unitType" defaultValue={product?.unitType ?? "unidad"} className="h-10 w-full rounded-md border px-3 text-sm" required />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Unidades caja
          <input
            name="unitsPerBox"
            type="number"
            min="1"
            defaultValue={product?.unitsPerBox ?? ""}
            className="h-10 w-full rounded-md border px-3 text-sm"
          />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Stock
          <input
            name="availableStock"
            type="number"
            min="0"
            defaultValue={product?.availableStock ?? 0}
            className="h-10 w-full rounded-md border px-3 text-sm"
            required
          />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Vencimiento
          <input
            name="expirationDate"
            type="date"
            defaultValue={dateInputValue(product?.expirationDate)}
            className="h-10 w-full rounded-md border px-3 text-sm"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2 text-sm font-medium">
          Estado
          <select name="status" defaultValue={product?.status ?? "draft"} className="h-10 w-full rounded-md border px-3 text-sm">
            <option value="draft">Borrador</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
            <option value="out_of_stock">Agotado</option>
          </select>
        </label>
        <label className="space-y-2 text-sm font-medium md:col-span-2">
          Imagen URL
          <input name="imageUrl" type="url" defaultValue={product?.imageUrl ?? ""} className="h-10 w-full rounded-md border px-3 text-sm" />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} />
        Producto destacado
      </label>

      <div>
        <Button type="submit">{product ? "Guardar producto" : "Crear producto"}</Button>
      </div>
    </form>
  );
}
