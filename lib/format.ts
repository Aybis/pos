import { Product, VariantGroup, Transaction } from "@/types";

export function formatRupiah(value: number): string {
  const n = Number(value) || 0;
  return "Rp " + n.toLocaleString("id-ID");
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function uid(prefix: string = ""): string {
  return (
    prefix +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 7)
  );
}

export function calcUnitPrice(
  product: Product,
  selectedOptions: Record<string, string | string[]>
): number {
  let price = Number(product.basePrice) || 0;
  for (const group of product.variantGroups || []) {
    const chosen = selectedOptions?.[group.id];
    if (!chosen) continue;
    const ids = Array.isArray(chosen) ? chosen : [chosen];
    for (const optId of ids) {
      const opt = group.options.find((o) => o.id === optId);
      if (opt) price += Number(opt.priceDelta) || 0;
    }
  }
  return price;
}

export function variantLabel(
  product: Product,
  selectedOptions: Record<string, string | string[]>
): string {
  const parts: string[] = [];
  for (const group of product.variantGroups || []) {
    const chosen = selectedOptions?.[group.id];
    if (!chosen) continue;
    const ids = Array.isArray(chosen) ? chosen : [chosen];
    const names = ids
      .map((optId) => group.options.find((o) => o.id === optId)?.name)
      .filter(Boolean);
    if (names.length === 0) continue;
    if (group.type === "multi" && names.length > 1) {
      parts.push(`Campur (${names.join(" + ")})`);
    } else {
      parts.push(...names);
    }
  }
  return parts.join(" · ");
}