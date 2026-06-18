import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

const checks = [
  {
    name: "Catalogo exige BUYER aprobado",
    file: "src/app/catalogo/page.tsx",
    patterns: ["requireRole([\"BUYER\"])", "assertBuyerApproved(session.user.id)"]
  },
  {
    name: "Detalle de producto exige BUYER aprobado",
    file: "src/app/producto/[id]/page.tsx",
    patterns: ["requireRole([\"BUYER\"])", "assertBuyerApproved(session.user.id)"]
  },
  {
    name: "Carrito crea pedidos submitted y valida stock/minimos",
    file: "src/app/carrito/actions.ts",
    patterns: ["status: \"submitted\"", "item.quantity < product.minOrderQty", "item.quantity > product.availableStock", "minimumOrderAmount"]
  },
  {
    name: "Comprador solo consulta pedidos propios",
    file: "src/app/mis-pedidos/[id]/page.tsx",
    patterns: ["buyerUserId: session.user.id"]
  },
  {
    name: "Helper canAccessOrder no permite pedidos de otro buyer por empresa",
    file: "src/server/auth/access.ts",
    patterns: ["return user.id === order.buyerUserId;"]
  },
  {
    name: "CLIENT_ADMIN filtra pedidos por mandante",
    file: "src/app/cliente/pedidos/page.tsx",
    patterns: ["campaign: { clientCompanyId: session.user.companyId ?? \"\" }"]
  },
  {
    name: "CLIENT_ADMIN filtra productos por mandante",
    file: "src/app/cliente/productos/page.tsx",
    patterns: ["clientCompanyId: session.user.companyId ?? \"\""]
  },
  {
    name: "Exportaciones cliente filtran por ownership",
    file: "src/app/cliente/export/[type]/route.ts",
    patterns: ["user.status !== \"active\"", "user.role !== \"CLIENT_ADMIN\"", "const ownershipWhere = { campaign: { clientCompanyId } }"]
  },
  {
    name: "requireAuth revalida usuario activo en base",
    file: "src/server/auth/access.ts",
    patterns: ["where: { id: session.user.id }", "user.status !== \"active\"", "session.user.role = user.role"]
  },
  {
    name: "Reportes cliente filtran por ownership",
    file: "src/app/cliente/reportes/page.tsx",
    patterns: ["requireRole([\"CLIENT_ADMIN\"])", "campaign: { clientCompanyId: session.user.companyId ?? \"\" }"]
  },
  {
    name: "Emails fallidos no bloquean pedido",
    file: "src/app/carrito/actions.ts",
    patterns: ["try {", "sendOrderSubmittedEmails(order.id)", "order_submitted_email_failed", "redirect(`/pedido-confirmado?orderId=${order.id}`)"]
  },
  {
    name: "Seed final incluye compradores, productos y pedidos demo",
    file: "prisma/seed.mjs",
    patterns: ["buyerDefinitions", "MTH-PK-005", "seed-final-order-5", "cliente@andes.cl"]
  }
];

let failures = 0;

for (const check of checks) {
  const content = read(check.file);
  const missing = check.patterns.filter((pattern) => !content.includes(pattern));

  if (missing.length > 0) {
    failures += 1;
    console.error(`FAIL ${check.name}`);
    console.error(`  Archivo: ${check.file}`);
    console.error(`  Falta: ${missing.join(" | ")}`);
  } else {
    console.log(`OK   ${check.name}`);
  }
}

if (failures > 0) {
  console.error(`\nQA critico fallo: ${failures} chequeo(s).`);
  process.exit(1);
}

console.log("\nQA critico OK.");
