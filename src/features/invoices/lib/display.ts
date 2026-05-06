import type { Invoice } from "@/types/invoice";

const avatarTones = [
  "bg-[#e9fff3] text-[#00aa78]",
  "bg-[#fff1e6] text-[#f2994a]",
  "bg-[#eef4ff] text-[#2f80ed]",
  "bg-[#fff0f4] text-[#eb5757]",
  "bg-[#f4f0ff] text-[#7b61ff]",
  "bg-[#f5f8df] text-[#6d8700]",
];

export function invoiceCode(id: string) {
  return `MGL${id
    .replace(/[^a-z0-9]/gi, "")
    .slice(0, 6)
    .toUpperCase()}`;
}

export function invoiceDisplayCode(id: string) {
  return `Inv: ${invoiceCode(id)}`;
}

export function getOrderType(invoice: Invoice) {
  if (invoice.vatRate === 0) {
    return "Withdraw";
  }

  return invoice.status === "paid" ? "01" : "20";
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function invoiceAvatarTone(seed: string) {
  const hash = Array.from(seed).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );

  return avatarTones[hash % avatarTones.length];
}
