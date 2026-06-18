# Etapa 2 - Usuarios, empresas, roles y campanas

## Alcance construido

- Usuarios con roles `SUPER_ADMIN_EXPOTECH`, `CLIENT_ADMIN` y `BUYER`.
- Empresas mandantes y compradoras.
- Perfiles `BuyerProfile` y `ClientProfile`.
- Campanas asociadas a una empresa mandante.
- Dashboard admin con conteos basicos.
- CRUD basico de campanas para Expotech.
- Panel cliente con campanas filtradas por `clientCompanyId`.
- Pagina `/mi-cuenta` para comprador.
- Seed minimo para probar roles.

## Control de acceso

- Ninguna ruta protegida acepta usuarios sin sesion.
- `/admin` exige `SUPER_ADMIN_EXPOTECH`.
- `/cliente` exige `CLIENT_ADMIN`.
- `/mi-cuenta` exige `BUYER`.
- `assertClientOwnsCampaign()` bloquea campañas de otros mandantes.

## Fuera de alcance

- Catalogo completo.
- Carrito.
- Pedidos.
- Emails.
- Metricas.
- Pagos.
- ERP.
- Logistica.
