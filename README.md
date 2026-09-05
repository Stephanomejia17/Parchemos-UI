# Parchemos

Monorepo de los productos Parchemos, construido con Next.js (App Router), React, Tailwind y pnpm workspaces.

## Módulos

- `apps`: única app real, aloja los cuatro roles del producto
  (comensal, restaurante, administrador, personal_restaurante/workroom).
- `reference/admin-console`: referencia visual de la antigua consola de
  admin. No forma parte del workspace (no se compila ni se despliega);
  sirve para consultar patrones de UI mientras se construye el rol
  `administrador` dentro de `apps`.

## Desarrollo

```bash
pnpm install
pnpm dev:customer
pnpm build
```

Los tokens y componentes compartidos se encuentran en `apps/src/shared`. La
separación de dominio/aplicación/infraestructura vive dentro de
`apps/src/modules/<feature>`.

## Autenticación (GU-01 / GU-02)

Las pantallas de sesión no están quemadas: hablan con `PARCHEMOS-API`.

```bash
# 1. Levanta la API (otro repo)
cd ../../PARCHEMOS-API && npm run start:dev   # http://localhost:3001/api

# 2. Levanta el front
pnpm dev:customer   # http://localhost:3000
```

Cada app lee `NEXT_PUBLIC_API_URL` de su `.env.local` (ver `.env.example`).

- `apps/src/shared/auth` concentra el cliente HTTP, el `AuthProvider` y `RequireAuth`.
- El access token vive **solo en memoria**; la sesión sobrevive a un F5 gracias
  a la cookie httpOnly del refresh token, que JavaScript no puede leer.
- `modules/auth` (login/registro) es compartido por los cuatro roles;
  `roleHomePath(user.role)` decide a dónde aterriza cada uno tras iniciar
  sesión.
