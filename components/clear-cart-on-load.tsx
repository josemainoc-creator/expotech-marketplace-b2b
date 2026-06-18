"use client";

import { useEffect } from "react";

export function ClearCartOnLoad() {
  useEffect(() => {
    window.localStorage.removeItem("expotech-cart");
    window.dispatchEvent(new Event("expotech-cart-updated"));
  }, []);

  return null;
}
