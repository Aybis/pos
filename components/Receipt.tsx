"use client";

import { useSettingsStore } from "@/store/useSettingsStore";
import { formatRupiah, formatDateTime } from "@/lib/format";
import { Transaction, TransactionItem } from "@/types";

interface ReceiptProps {
  trx: Transaction;
}

export default function Receipt({ trx }: ReceiptProps) {
  const settings = useSettingsStore((s) => s.settings);

  return (
    <div
      id="receipt-print"
      className="mx-auto w-full max-w-[300px] bg-white px-4 py-5 font-mono text-[12px] leading-relaxed text-black"
    >
      <div className="text-center">
        <div className="text-sm font-bold">{settings.storeName}</div>
        <div>{settings.storeAddress}</div>
        <div>{settings.storePhone}</div>
      </div>
      <div className="my-2 border-t border-dashed border-black" />
      <div className="flex justify-between">
        <span>{trx.id}</span>
        <span>{formatDateTime(trx.createdAt)}</span>
      </div>
      <div className="my-2 border-t border-dashed border-black" />
      {trx.items.map((it, i) => (
        <div key={i} className="mb-1">
          <div>
            {it.name}
            {it.variantText ? ` (${it.variantText})` : ""}
          </div>
          {it.notes && <div className="pl-2 italic">* {it.notes}</div>}
          <div className="flex justify-between">
            <span>
              {it.qty} x {formatRupiah(it.unitPrice)}
            </span>
            <span>{formatRupiah(it.qty * it.unitPrice)}</span>
          </div>
        </div>
      ))}
      <div className="my-2 border-t border-dashed border-black" />
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>{formatRupiah(trx.subtotal)}</span>
      </div>
      {trx.discount > 0 && (
        <div className="flex justify-between">
          <span>Diskon</span>
          <span>-{formatRupiah(trx.discount)}</span>
        </div>
      )}
      {trx.tax > 0 && (
        <div className="flex justify-between">
          <span>Pajak</span>
          <span>{formatRupiah(trx.tax)}</span>
        </div>
      )}
      <div className="flex justify-between font-bold">
        <span>TOTAL</span>
        <span>{formatRupiah(trx.total)}</span>
      </div>
      <div className="my-2 border-t border-dashed border-black" />
      <div className="flex justify-between">
        <span>Metode</span>
        <span>{trx.paymentMethod}</span>
      </div>
      {trx.paymentMethod === "Tunai" && (
        <>
          <div className="flex justify-between">
            <span>Dibayar</span>
            <span>{formatRupiah(trx.paidAmount || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span>Kembali</span>
            <span>{formatRupiah(trx.change || 0)}</span>
          </div>
        </>
      )}
      <div className="mt-3 text-center">{settings.receiptFooter}</div>
    </div>
  );
}