# Parchemos

Monorepo de los productos Parchemos, construido con Next.js (App Router), React, Tailwind y pnpm workspaces.

## Módulos

- `apps/customer`: aplicación para comensales, con sus vistas existentes.
- `apps/admin`: Parchemos Console para administradores, con sus vistas existentes.
- `apps/business`: estructura vacía para el futuro módulo Business.

## Desarrollo

Las vistas del comensal y del administrador de restaurante están separadas en el flujo, esto es algo momentaneo, ya que, por el momento se busca mostrar los mockups iniciales de la aplicación Parchemos

```bash
pnpm install
pnpm dev:customer
pnpm dev:admin
pnpm build
```

Los tokens y componentes compartidos se encuentran en `shared`. La separación de capas de dominio, aplicación e infraestructura está preparada en `core`.
# Parchemos

## Autenticación (GU-01 / GU-02)

Las pantallas de sesión ya no están quemadas: hablan con `PARCHEMOS-API`.

```bash
# 1. Levanta la API (otro repo)
cd ../../PARCHEMOS-API && npm run start:dev   # http://localhost:3001/api

# 2. Levanta el front
pnpm dev:customer   # http://localhost:3000
pnpm dev:admin      # http://localhost:3002
```

Cada app lee `NEXT_PUBLIC_API_URL` de su `.env.local` (ver `.env.example`).

- `shared/auth` concentra el cliente HTTP, el `AuthProvider` y `RequireAuth`.
- El access token vive **solo en memoria**; la sesión sobrevive a un F5 gracias
  a la cookie httpOnly del refresh token, que JavaScript no puede leer.
- `apps/customer`: `/registro` y `/login` reales; todo lo que cuelga de
  `(shell)` exige sesión.
- `apps/admin`: `/login` propio; la consola solo admite el rol `administrador`.
