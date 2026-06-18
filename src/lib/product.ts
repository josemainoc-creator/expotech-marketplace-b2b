export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function discountPercent(regularPrice?: { toString(): string } | number | null, wholesalePrice?: { toString(): string } | number | null) {
  if (!regularPrice || !wholesalePrice) {
    return null;
  }

  const regular = Number(regularPrice.toString());
  const wholesale = Number(wholesalePrice.toString());

  if (!regular || regular <= wholesale) {
    return null;
  }

  return Math.round(((regular - wholesale) / regular) * 100);
}
