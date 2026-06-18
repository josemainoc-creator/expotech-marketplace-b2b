"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

type AddToCartButtonProps = {
  productId: string;
  minOrderQty: number;
  availableStock: number;
  className?: string;
};

type CartItem = {
  productId: string;
  quantity: number;
};

const cartKey = "expotech-cart";

function readCart() {
  try {
    return JSON.parse(window.localStorage.getItem(cartKey) ?? "[]") as CartItem[];
  } catch {
    return [];
  }
}

export function AddToCartButton({ productId, minOrderQty, availableStock, className }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);

  function addToCart() {
    const cart = readCart();
    const existing = cart.find((item) => item.productId === productId);
    const quantity = Math.min(Math.max(existing?.quantity ?? minOrderQty, minOrderQty), availableStock);

    const nextCart = existing
      ? cart.map((item) => (item.productId === productId ? { ...item, quantity } : item))
      : [...cart, { productId, quantity }];

    window.localStorage.setItem(cartKey, JSON.stringify(nextCart));
    window.dispatchEvent(new Event("expotech-cart-updated"));
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <Button type="button" onClick={addToCart} disabled={availableStock <= 0} className={className}>
      {added ? "Agregado" : "Agregar"}
    </Button>
  );
}
