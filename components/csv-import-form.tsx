"use client";

import type { ChangeEvent } from "react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { parseCsv } from "@/lib/csv";

type CsvImportFormProps = {
  action: (formData: FormData) => Promise<void>;
  campaigns: { id: string; name: string }[];
};

const requiredColumns = [
  "sku",
  "name",
  "brand",
  "category",
  "description",
  "regularPrice",
  "wholesalePrice",
  "minOrderQty",
  "unitType",
  "unitsPerBox",
  "availableStock",
  "expirationDate"
];

export function CsvImportForm({ action, campaigns }: CsvImportFormProps) {
  const [csvText, setCsvText] = useState("");
  const rows = useMemo(() => parseCsv(csvText), [csvText]);
  const headers = csvText.trim() ? Object.keys(rows[0] ?? {}) : [];
  const missingColumns = requiredColumns.filter((column) => !headers.includes(column));
  const rowErrors = rows.flatMap((row, index) => {
    const errors: string[] = [];

    if (!row.sku) errors.push("SKU requerido");
    if (!row.name) errors.push("nombre requerido");
    if (!row.wholesalePrice || Number(row.wholesalePrice) <= 0) errors.push("precio mayorista invalido");
    if (!row.minOrderQty || Number(row.minOrderQty) <= 0) errors.push("minimo invalido");
    if (row.availableStock === "" || Number(row.availableStock) < 0) errors.push("stock invalido");

    return errors.length > 0 ? [`Fila ${index + 2}: ${errors.join(", ")}`] : [];
  });

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setCsvText(await file.text());
  }

  return (
    <form action={action} className="space-y-5">
      <label className="space-y-2 text-sm font-medium">
        Campana
        <select name="campaignId" className="h-10 w-full rounded-md border px-3 text-sm" required>
          <option value="">Seleccionar campana</option>
          {campaigns.map((campaign) => (
            <option value={campaign.id} key={campaign.id}>
              {campaign.name}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2 text-sm font-medium">
        Archivo CSV
        <input type="file" accept=".csv,text/csv" onChange={handleFileChange} className="block w-full rounded-md border px-3 py-2 text-sm" />
      </label>

      <label className="space-y-2 text-sm font-medium">
        CSV pegado
        <textarea
          name="csvText"
          value={csvText}
          onChange={(event) => setCsvText(event.target.value)}
          className="min-h-48 w-full rounded-md border px-3 py-2 font-mono text-sm"
          placeholder={requiredColumns.join(",")}
          required
        />
      </label>

      <div className="rounded-md border bg-muted/40 p-4">
        <div className="text-sm font-medium">Preview</div>
        {missingColumns.length > 0 && csvText.trim() ? (
          <p className="mt-2 text-sm text-red-700">Faltan columnas: {missingColumns.join(", ")}</p>
        ) : null}
        {rowErrors.length > 0 ? (
          <div className="mt-2 space-y-1 text-sm text-red-700">
            {rowErrors.slice(0, 6).map((error) => (
              <p key={error}>{error}</p>
            ))}
            {rowErrors.length > 6 ? <p>Hay {rowErrors.length - 6} errores adicionales.</p> : null}
          </div>
        ) : null}
        <p className="mt-2 text-sm text-muted-foreground">{rows.length} filas detectadas.</p>
        {rows.length > 0 ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr>
                  {requiredColumns.slice(0, 6).map((column) => (
                    <th className="border-b px-2 py-1 font-medium" key={column}>
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 5).map((row, index) => (
                  <tr key={`${row.sku}-${index}`}>
                    {requiredColumns.slice(0, 6).map((column) => (
                      <td className="border-b px-2 py-1" key={column}>
                        {row[column]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      <Button type="submit" disabled={missingColumns.length > 0 || rowErrors.length > 0 || rows.length === 0}>
        Importar productos
      </Button>
    </form>
  );
}
