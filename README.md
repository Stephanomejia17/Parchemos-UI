# Parchemos

Monorepo de los productos Parchemos, construido con React, Vite, Tailwind y pnpm workspaces.

## Módulos

- `apps/customer`: aplicación para comensales, con sus vistas existentes.
- `apps/admin`: Parchemos Console para administradores, con sus vistas existentes.
- `apps/business`: estructura vacía para el futuro módulo Business.

## Desarrollo

```bash
pnpm install
pnpm dev:customer
pnpm dev:admin
pnpm build
```

Los tokens y componentes compartidos se encuentran en `shared`. La separación de capas de dominio, aplicación e infraestructura está preparada en `core`.
# Parchemos
