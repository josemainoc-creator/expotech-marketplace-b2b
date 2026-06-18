import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();
const demoPassword = "Expotech2026!";

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function upsertCompany(data) {
  return prisma.company.upsert({
    where: { rut: data.rut },
    update: {
      name: data.name,
      businessType: data.businessType,
      contactName: data.contactName,
      email: data.email,
      phone: data.phone,
      region: data.region,
      comuna: data.comuna,
      address: data.address,
      website: data.website,
      status: data.status
    },
    create: data
  });
}

async function upsertUser({ passwordHash, ...data }) {
  return prisma.user.upsert({
    where: { email: data.email },
    update: {
      name: data.name,
      phone: data.phone,
      passwordHash,
      role: data.role,
      status: data.status,
      companyId: data.companyId
    },
    create: {
      ...data,
      passwordHash
    }
  });
}

async function upsertClient({ company, contact }) {
  await prisma.clientProfile.upsert({
    where: { companyId: company.id },
    update: {
      commercialContactName: contact.name,
      commercialContactEmail: contact.email,
      commercialContactPhone: contact.phone,
      billingContactName: contact.billingName,
      billingContactEmail: contact.billingEmail
    },
    create: {
      companyId: company.id,
      commercialContactName: contact.name,
      commercialContactEmail: contact.email,
      commercialContactPhone: contact.phone,
      billingContactName: contact.billingName,
      billingContactEmail: contact.billingEmail
    }
  });
}

async function upsertBuyer({ passwordHash, buyer }) {
  const company = await upsertCompany({
    name: buyer.companyName,
    rut: buyer.rut,
    businessType: buyer.businessType,
    contactName: buyer.name,
    email: buyer.email,
    phone: buyer.phone,
    region: buyer.region,
    comuna: buyer.comuna,
    address: buyer.address,
    status: buyer.companyStatus
  });

  const user = await upsertUser({
    passwordHash,
    name: buyer.name,
    email: buyer.email,
    phone: buyer.phone,
    role: "BUYER",
    status: buyer.userStatus,
    companyId: company.id
  });

  await prisma.buyerProfile.upsert({
    where: { userId: user.id },
    update: {
      companyId: company.id,
      businessType: buyer.businessType,
      monthlyPurchaseEstimate: buyer.monthlyPurchaseEstimate,
      categoriesOfInterest: buyer.categoriesOfInterest,
      approvalStatus: buyer.approvalStatus,
      approvedAt: buyer.approvalStatus === "approved" ? new Date() : null,
      rejectedReason: buyer.rejectedReason
    },
    create: {
      userId: user.id,
      companyId: company.id,
      businessType: buyer.businessType,
      monthlyPurchaseEstimate: buyer.monthlyPurchaseEstimate,
      categoriesOfInterest: buyer.categoriesOfInterest,
      approvalStatus: buyer.approvalStatus,
      approvedAt: buyer.approvalStatus === "approved" ? new Date() : null,
      rejectedReason: buyer.rejectedReason
    }
  });

  return { company, user };
}

async function upsertCategories(campaignId, names) {
  const categoryByName = new Map();

  for (const [index, name] of names.entries()) {
    const category = await prisma.productCategory.upsert({
      where: {
        campaignId_slug: {
          campaignId,
          slug: slugify(name)
        }
      },
      update: {
        name,
        sortOrder: index
      },
      create: {
        campaignId,
        name,
        slug: slugify(name),
        sortOrder: index
      }
    });

    categoryByName.set(name, category.id);
  }

  return categoryByName;
}

async function upsertProducts(campaignId, categoryByName, products) {
  const productsBySku = new Map();

  for (const productData of products) {
    const product = await prisma.product.upsert({
      where: {
        campaignId_sku: {
          campaignId,
          sku: productData.sku
        }
      },
      update: {
        name: productData.name,
        brand: productData.brand,
        categoryId: categoryByName.get(productData.category),
        description: productData.description,
        regularPrice: String(productData.regularPrice),
        wholesalePrice: String(productData.wholesalePrice),
        minOrderQty: productData.minOrderQty,
        unitType: productData.unitType,
        unitsPerBox: productData.unitsPerBox,
        availableStock: productData.availableStock,
        expirationDate: productData.expirationDate,
        status: productData.status,
        featured: productData.featured
      },
      create: {
        campaignId,
        categoryId: categoryByName.get(productData.category),
        sku: productData.sku,
        name: productData.name,
        brand: productData.brand,
        description: productData.description,
        regularPrice: String(productData.regularPrice),
        wholesalePrice: String(productData.wholesalePrice),
        minOrderQty: productData.minOrderQty,
        unitType: productData.unitType,
        unitsPerBox: productData.unitsPerBox,
        availableStock: productData.availableStock,
        expirationDate: productData.expirationDate,
        status: productData.status,
        featured: productData.featured
      }
    });

    productsBySku.set(productData.sku, product);
  }

  return productsBySku;
}

async function upsertLead(campaignId, companyId, status, priority = "medium") {
  return prisma.leadStatus.upsert({
    where: {
      campaignId_companyId: {
        campaignId,
        companyId
      }
    },
    update: {
      status,
      priority,
      source: "seed-final",
      lastContactAt: new Date()
    },
    create: {
      campaignId,
      companyId,
      status,
      priority,
      source: "seed-final",
      lastContactAt: new Date(),
      notes: "Registro demo para QA funcional."
    }
  });
}

async function createSeedOrder({ key, campaign, buyer, items, status = "submitted" }) {
  const existing = await prisma.order.findFirst({
    where: {
      buyerUserId: buyer.user.id,
      adminNotes: key
    },
    select: { id: true }
  });

  if (existing) {
    return existing;
  }

  const subtotal = items.reduce((sum, item) => sum + item.quantity * Number(item.product.wholesalePrice.toString()), 0);

  return prisma.order.create({
    data: {
      campaignId: campaign.id,
      buyerCompanyId: buyer.company.id,
      buyerUserId: buyer.user.id,
      status,
      subtotal: String(subtotal),
      notes: "Pedido demo para QA funcional.",
      paymentConditionRequested: "Credito 30 dias",
      deliveryMethodRequested: "Despacho a local",
      adminNotes: key,
      items: {
        create: items.map((item) => ({
          productId: item.product.id,
          sku: item.product.sku,
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: item.product.wholesalePrice,
          lineTotal: String(item.quantity * Number(item.product.wholesalePrice.toString()))
        }))
      }
    }
  });
}

async function main() {
  const passwordHash = await hash(demoPassword, 10);

  const expotech = await upsertCompany({
    name: "Expotech",
    rut: "76000000-0",
    businessType: "Operador comercial B2B",
    contactName: "Equipo Expotech",
    email: "admin@expotech.cl",
    phone: "+56910000000",
    region: "Metropolitana",
    comuna: "Santiago",
    address: "Av. Expotech 100",
    website: "https://expotech.cl",
    status: "active"
  });

  await upsertUser({
    passwordHash,
    name: "Admin Expotech",
    email: "admin@expotech.cl",
    phone: "+56910000000",
    role: "SUPER_ADMIN_EXPOTECH",
    status: "active",
    companyId: expotech.id
  });

  const motherna = await upsertCompany({
    name: "Motherna Demo",
    rut: "77000000-1",
    businessType: "Mandante",
    contactName: "Camila Soto",
    email: "cliente@motherna.cl",
    phone: "+56911111111",
    region: "Metropolitana",
    comuna: "Santiago",
    address: "Av. Demo 123",
    website: "https://motherna.example",
    status: "active"
  });

  await upsertClient({
    company: motherna,
    contact: {
      name: "Camila Soto",
      email: "cliente@motherna.cl",
      phone: "+56911111111",
      billingName: "Finanzas Motherna",
      billingEmail: "facturacion@motherna.cl"
    }
  });

  await upsertUser({
    passwordHash,
    name: "Cliente Motherna",
    email: "cliente@motherna.cl",
    phone: "+56911111111",
    role: "CLIENT_ADMIN",
    status: "active",
    companyId: motherna.id
  });

  const andes = await upsertCompany({
    name: "Andes Pharma Demo",
    rut: "77000000-9",
    businessType: "Mandante",
    contactName: "Martin Vidal",
    email: "cliente@andes.cl",
    phone: "+56955555555",
    region: "Metropolitana",
    comuna: "Las Condes",
    address: "Av. Andes 500",
    website: "https://andes.example",
    status: "active"
  });

  await upsertClient({
    company: andes,
    contact: {
      name: "Martin Vidal",
      email: "cliente@andes.cl",
      phone: "+56955555555",
      billingName: "Finanzas Andes",
      billingEmail: "facturacion@andes.cl"
    }
  });

  await upsertUser({
    passwordHash,
    name: "Cliente Andes",
    email: "cliente@andes.cl",
    phone: "+56955555555",
    role: "CLIENT_ADMIN",
    status: "active",
    companyId: andes.id
  });

  const mothernaCampaign = await prisma.campaign.upsert({
    where: { slug: "venta-privada-mayorista-motherna" },
    update: {
      clientCompanyId: motherna.id,
      status: "active",
      minimumOrderAmount: "300000"
    },
    create: {
      slug: "venta-privada-mayorista-motherna",
      name: "Venta Privada Mayorista Motherna",
      clientCompanyId: motherna.id,
      shortDescription: "Liquidacion B2B privada para compradores mayoristas aprobados.",
      description: "Campana demo para validar roles, ownership y administracion final.",
      startDate: new Date("2026-06-01T00:00:00.000Z"),
      endDate: new Date("2026-07-31T00:00:00.000Z"),
      status: "active",
      accessType: "invitation_only",
      termsAndConditions: "Venta privada sujeta a validacion comercial.",
      minimumOrderAmount: "300000"
    }
  });

  const andesCampaign = await prisma.campaign.upsert({
    where: { slug: "venta-privada-andes-pharma" },
    update: {
      clientCompanyId: andes.id,
      status: "active",
      minimumOrderAmount: "250000"
    },
    create: {
      slug: "venta-privada-andes-pharma",
      name: "Venta Privada Andes Pharma",
      clientCompanyId: andes.id,
      shortDescription: "Stock mayorista demo para pruebas de ownership cliente.",
      description: "Campana secundaria para confirmar que un mandante no ve datos de otro.",
      startDate: new Date("2026-06-15T00:00:00.000Z"),
      endDate: new Date("2026-08-15T00:00:00.000Z"),
      status: "active",
      accessType: "approval_required",
      termsAndConditions: "Pedido sujeto a validacion de stock.",
      minimumOrderAmount: "250000"
    }
  });

  const buyerDefinitions = [
    ["Comprador Demo", "Compradora Demo", "78000000-2", "buyer@demo.cl", "Farmacia independiente", "approved", "active", "active", "2500000", ["Bebes", "Higiene personal"], "Valparaiso", "Vina del Mar"],
    ["Comprador Pendiente", "Minimarket Pendiente Demo", "79000000-3", "pendiente@demo.cl", "Minimarket", "pending", "active", "pending", "1200000", ["Higiene personal", "Limpieza"], "Metropolitana", "Nunoa"],
    ["Comprador Rechazado", "Perfumeria Rechazada Demo", "79000000-4", "rechazado@demo.cl", "Perfumeria", "rejected", "active", "inactive", "900000", ["Cuidado familiar"], "Biobio", "Concepcion"],
    ["Comprador Inactivo", "Distribuidora Inactiva Demo", "79000000-5", "inactivo@demo.cl", "Distribuidor regional", "inactive", "inactive", "inactive", "1800000", ["Packs mayoristas"], "Coquimbo", "La Serena"],
    ["Farmacia Norte", "Farmacia Norte Demo", "79000000-6", "farmacia.norte@demo.cl", "Farmacia independiente", "approved", "active", "active", "3200000", ["Higiene personal", "Cuidado familiar"], "Antofagasta", "Antofagasta"],
    ["Panalera Sur", "Panalera Sur Demo", "79000000-7", "panalera.sur@demo.cl", "Panalera", "approved", "active", "active", "2100000", ["Bebes", "Packs mayoristas"], "Los Lagos", "Puerto Montt"],
    ["Mayorista Centro", "Mayorista Centro Demo", "79000000-8", "mayorista.centro@demo.cl", "Mayorista secundario", "approved", "active", "active", "4800000", ["Limpieza", "Packs mayoristas"], "Maule", "Talca"],
    ["Minimarket Costa", "Minimarket Costa Demo", "79000000-9", "minimarket.costa@demo.cl", "Minimarket", "approved", "active", "active", "1500000", ["Higiene personal", "Limpieza"], "Valparaiso", "San Antonio"]
  ];

  const buyers = new Map();

  for (const [name, companyName, rut, email, businessType, approvalStatus, userStatus, companyStatus, estimate, categories, region, comuna] of buyerDefinitions) {
    const buyer = await upsertBuyer({
      passwordHash,
      buyer: {
        name,
        companyName,
        rut,
        email,
        phone: "+569" + rut.slice(0, 8),
        businessType,
        approvalStatus,
        userStatus,
        companyStatus,
        monthlyPurchaseEstimate: estimate,
        categoriesOfInterest: categories,
        region,
        comuna,
        address: "Direccion demo " + rut,
        rejectedReason: approvalStatus === "rejected" ? "No cumple criterios comerciales demo." : null
      }
    });

    const leadStatus = approvalStatus === "pending" ? "new" : approvalStatus;
    buyers.set(email, buyer);
    await upsertLead(mothernaCampaign.id, buyer.company.id, leadStatus, approvalStatus === "approved" ? "high" : "medium");
  }

  const invitationExpiry = new Date();
  invitationExpiry.setDate(invitationExpiry.getDate() + 14);

  await prisma.invitation.upsert({
    where: { token: "motherna-demo-token" },
    update: {
      campaignId: mothernaCampaign.id,
      status: "created",
      expiresAt: invitationExpiry
    },
    create: {
      campaignId: mothernaCampaign.id,
      email: "invitado@demo.cl",
      companyName: "Comprador Invitado Demo",
      contactName: "Ivan Demo",
      phone: "+56944444444",
      token: "motherna-demo-token",
      status: "created",
      expiresAt: invitationExpiry
    }
  });

  const categories = ["Bebes", "Higiene personal", "Cuidado familiar", "Limpieza", "Packs mayoristas"];
  const mothernaCategories = await upsertCategories(mothernaCampaign.id, categories);
  const andesCategories = await upsertCategories(andesCampaign.id, categories);

  const mothernaProducts = [
    ["MTH-BB-001", "Panal premium talla M pack 48", "Motherna", "Bebes", 18990, 11990, 6, "pack", 1, 420],
    ["MTH-BB-002", "Panal premium talla G pack 44", "Motherna", "Bebes", 19990, 12990, 6, "pack", 1, 360],
    ["MTH-BB-003", "Panal premium talla XG pack 40", "Motherna", "Bebes", 20990, 13990, 6, "pack", 1, 330],
    ["MTH-BB-004", "Panal nocturno talla G pack 36", "Motherna", "Bebes", 22990, 14990, 6, "pack", 1, 280],
    ["MTH-HG-001", "Toallitas humedas caja 12 unidades", "Motherna", "Higiene personal", 24990, 15990, 4, "caja", 12, 210],
    ["MTH-HG-002", "Jabon liquido familiar 1 litro", "CarePlus", "Higiene personal", 5990, 3490, 24, "unidad", 12, 800],
    ["MTH-HG-003", "Alcohol gel 500 ml caja 12", "CarePlus", "Higiene personal", 29990, 18990, 6, "caja", 12, 260],
    ["MTH-HG-004", "Pasta dental familiar pack 6", "CarePlus", "Higiene personal", 12990, 7990, 12, "pack", 6, 520],
    ["MTH-CF-001", "Crema corporal familiar 400 ml", "CarePlus", "Cuidado familiar", 7990, 4590, 18, "unidad", 6, 500],
    ["MTH-CF-002", "Shampoo familiar 750 ml", "CarePlus", "Cuidado familiar", 6990, 3990, 18, "unidad", 6, 460],
    ["MTH-CF-003", "Acondicionador familiar 750 ml", "CarePlus", "Cuidado familiar", 6990, 3990, 18, "unidad", 6, 450],
    ["MTH-CF-004", "Protector solar familiar 200 ml", "CarePlus", "Cuidado familiar", 11990, 7290, 12, "unidad", 6, 220],
    ["MTH-LM-001", "Detergente liquido 3 litros", "HomeClean", "Limpieza", 9990, 6290, 12, "unidad", 4, 300],
    ["MTH-LM-002", "Limpiador multiuso caja 6 unidades", "HomeClean", "Limpieza", 17990, 10990, 6, "caja", 6, 180],
    ["MTH-LM-003", "Lavalozas concentrado caja 12", "HomeClean", "Limpieza", 23990, 14990, 4, "caja", 12, 240],
    ["MTH-LM-004", "Cloro gel caja 12", "HomeClean", "Limpieza", 21990, 13990, 4, "caja", 12, 210],
    ["MTH-LM-005", "Suavizante 2 litros caja 6", "HomeClean", "Limpieza", 26990, 16990, 4, "caja", 6, 230],
    ["MTH-PK-001", "Pack mayorista higiene bebe mixto", "Motherna", "Packs mayoristas", 89990, 57990, 2, "pack", 1, 90],
    ["MTH-PK-002", "Pack mayorista limpieza hogar", "HomeClean", "Packs mayoristas", 74990, 48990, 2, "pack", 1, 75],
    ["MTH-PK-003", "Pack farmacia cuidado familiar", "CarePlus", "Packs mayoristas", 119990, 78990, 2, "pack", 1, 60],
    ["MTH-PK-004", "Pack minimarket higiene mensual", "CarePlus", "Packs mayoristas", 99990, 64990, 2, "pack", 1, 70],
    ["MTH-PK-005", "Pack distribuidor mixto alto volumen", "Expotech", "Packs mayoristas", 199990, 129990, 1, "pack", 1, 35]
  ].map(([sku, name, brand, category, regularPrice, wholesalePrice, minOrderQty, unitType, unitsPerBox, availableStock], index) => ({
    sku,
    name,
    brand,
    category,
    description: "Producto demo para validar catalogo privado B2B.",
    regularPrice,
    wholesalePrice,
    minOrderQty,
    unitType,
    unitsPerBox,
    availableStock,
    expirationDate: index % 4 === 0 ? new Date("2026-10-31T00:00:00.000Z") : null,
    status: "active",
    featured: index < 5
  }));

  const andesProducts = [
    ["AND-HG-001", "Gel antibacterial Andes caja 24", "Andes Pharma", "Higiene personal", 48990, 31990, 3, "caja", 24, 120],
    ["AND-CF-001", "Crema reparadora 250 ml caja 12", "Andes Pharma", "Cuidado familiar", 38990, 24990, 4, "caja", 12, 140],
    ["AND-PK-001", "Pack mayorista farmacia Andes", "Andes Pharma", "Packs mayoristas", 149990, 99990, 1, "pack", 1, 45]
  ].map(([sku, name, brand, category, regularPrice, wholesalePrice, minOrderQty, unitType, unitsPerBox, availableStock], index) => ({
    sku,
    name,
    brand,
    category,
    description: "Producto demo secundario para validar ownership de mandante.",
    regularPrice,
    wholesalePrice,
    minOrderQty,
    unitType,
    unitsPerBox,
    availableStock,
    expirationDate: index === 0 ? new Date("2026-11-30T00:00:00.000Z") : null,
    status: "active",
    featured: false
  }));

  const mothernaProductsBySku = await upsertProducts(mothernaCampaign.id, mothernaCategories, mothernaProducts);
  const andesProductsBySku = await upsertProducts(andesCampaign.id, andesCategories, andesProducts);

  await createSeedOrder({
    key: "seed-final-order-1",
    campaign: mothernaCampaign,
    buyer: buyers.get("buyer@demo.cl"),
    status: "submitted",
    items: [
      { product: mothernaProductsBySku.get("MTH-BB-001"), quantity: 12 },
      { product: mothernaProductsBySku.get("MTH-HG-001"), quantity: 8 }
    ]
  });

  await createSeedOrder({
    key: "seed-final-order-2",
    campaign: mothernaCampaign,
    buyer: buyers.get("farmacia.norte@demo.cl"),
    status: "under_review",
    items: [
      { product: mothernaProductsBySku.get("MTH-CF-001"), quantity: 24 },
      { product: mothernaProductsBySku.get("MTH-PK-003"), quantity: 2 }
    ]
  });

  await createSeedOrder({
    key: "seed-final-order-3",
    campaign: mothernaCampaign,
    buyer: buyers.get("panalera.sur@demo.cl"),
    status: "approved",
    items: [
      { product: mothernaProductsBySku.get("MTH-BB-002"), quantity: 18 },
      { product: mothernaProductsBySku.get("MTH-PK-001"), quantity: 3 }
    ]
  });

  await createSeedOrder({
    key: "seed-final-order-4",
    campaign: mothernaCampaign,
    buyer: buyers.get("mayorista.centro@demo.cl"),
    status: "rejected",
    items: [
      { product: mothernaProductsBySku.get("MTH-LM-003"), quantity: 8 },
      { product: mothernaProductsBySku.get("MTH-PK-005"), quantity: 1 }
    ]
  });

  await createSeedOrder({
    key: "seed-final-order-5",
    campaign: andesCampaign,
    buyer: buyers.get("minimarket.costa@demo.cl"),
    status: "submitted",
    items: [
      { product: andesProductsBySku.get("AND-HG-001"), quantity: 6 },
      { product: andesProductsBySku.get("AND-PK-001"), quantity: 2 }
    ]
  });

  await prisma.emailLog.upsert({
    where: { id: "seed-email-log-order-received" },
    update: {
      campaignId: mothernaCampaign.id,
      status: "failed",
      metadata: { reason: "missing_resend_configuration", source: "seed-final" }
    },
    create: {
      id: "seed-email-log-order-received",
      campaignId: mothernaCampaign.id,
      recipientEmail: "buyer@demo.cl",
      subject: "Recibimos tu solicitud de pedido",
      templateName: "order_received_buyer",
      status: "failed",
      metadata: { reason: "missing_resend_configuration", source: "seed-final" }
    }
  });

  console.log("Seed demo final listo.");
  console.log("Password comun: " + demoPassword);
  console.log("SUPER_ADMIN_EXPOTECH: admin@expotech.cl");
  console.log("CLIENT_ADMIN Motherna: cliente@motherna.cl");
  console.log("CLIENT_ADMIN Andes: cliente@andes.cl");
  console.log("BUYER approved: buyer@demo.cl");
  console.log("BUYER pending: pendiente@demo.cl");
  console.log("BUYER rejected: rechazado@demo.cl");
  console.log("BUYER inactive: inactivo@demo.cl");
  console.log("Invitacion demo: /invitacion/motherna-demo-token");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
