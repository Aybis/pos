export function formatRupiah(value) {
  const n = Number(value) || 0;
  return "Rp " + n.toLocaleString("id-ID");
}

export function formatDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function uid(prefix = "") {
  return (
    prefix +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 7)
  );
}

// Hitung harga satuan item = harga dasar + delta semua opsi terpilih
export function calcUnitPrice(product, selectedOptions) {
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

// Label ringkas varian terpilih, mis. "Pakai Nasi · Pedas".
// Grup multi dengan >1 pilihan ditampilkan "Campur (A + B)".
export function variantLabel(product, selectedOptions) {
  const parts = [];
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
