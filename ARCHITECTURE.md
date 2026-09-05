# Arquitectura de Parchemos

`apps` es la única aplicación desplegable. Aloja los cuatro roles del producto (`comensal`, `restaurante`, `administrador` y `personal_restaurante` / workroom) dentro de un mismo Next App.

## Organización de las rutas

Las rutas están agrupadas por audiencia usando *route groups* de Next.js:

```text
app/
├── (public)/      # splash, login, registro y recuperación de contraseña
├── (customer)/    # rutas del comensal
├── (restaurant)/  # rutas del restaurante
├── (admin)/       # rutas del administrador
└── (workroom)/    # rutas del personal del restaurante
```

### Razón de los paréntesis

Los paréntesis indican un grupo de rutas. Next.js utiliza el grupo para
organizar el código y aplicar un `layout.tsx`, pero no incluye su nombre en la
URL.

```text
app/(customer)/home/page.tsx  ->  /home
app/(admin)/users/page.tsx    ->  /users
```

Esto permite separar el código por usuario sin cambiar las URLs existentes. Si
se eliminan los paréntesis, el nombre de la carpeta pasa a formar parte de la
URL (`/customer/home`, `/admin/users`). Por esta razón, los paréntesis son
intencionales y deben conservarse salvo que se decida cambiar el contrato
público de URLs.

Cada grupo privado aplica su autorización mediante `RequireAuth`:

- `(customer)`: rol `comensal`.
- `(restaurant)`: rol `restaurante`.
- `(admin)`: rol `administrador`.
- `(workroom)`: rol `personal_restaurante`.
- `(public)`: no requiere sesión.

## Responsabilidad de cada capa

### `app`

Contiene exclusivamente el ruteo de Next.js y los layouts. Un `page.tsx` debe
ser pequeño y conectar la URL con el módulo que implementa la pantalla. No debe
contener reglas de negocio complejas.

```tsx
import { Home } from "@/modules/customer/home/Home";

export default function HomePage() {
  return <Home />;
}
```

### `modules`

Contiene las funcionalidades del producto. Se organiza por feature, no por
archivo de ruta: autenticación, pedidos, menú, restaurantes, usuarios,
analítica, etc. Aquí viven los componentes de pantalla, estados y reglas
propias de cada funcionalidad.

### `components`

Contiene componentes propios de la aplicación, principalmente navegación y
shells: `Sidebar`, `BottomNav`, `AppShell` y `AdminShell`.

### `shared`

Contiene piezas reutilizables entre módulos: componentes UI, formularios,
media, autenticación, cliente HTTP, servicios de API, constantes y tipos
comunes. Un componente que solo sirve para una feature debe permanecer dentro
de su módulo y no entrar en `shared`.

### `mocks`

Contiene datos simulados usados durante el desarrollo visual o mientras una
funcionalidad todavía no consume la API. Los datos reales y las llamadas HTTP
deben vivir en los servicios correspondientes.

## Servicios y API

`shared/services/http` contiene el cliente HTTP base, el manejo del token y la
renovación de sesión. Los servicios de dominio se separan por responsabilidad:

```text
shared/services/
├── http/       # infraestructura HTTP
├── auth/       # login, registro y recuperación
├── menu/       # menús y productos
├── profile/    # perfil de usuario
├── restaurant/ # restaurantes, sedes y personal
└── admin/      # operaciones administrativas
```

Los módulos deben consumir estos servicios y no realizar llamadas `fetch`
directamente.

## Reglas para agregar una pantalla

1. Crear la carpeta de la URL dentro del grupo de usuario correcto.
2. Mantener `page.tsx` como adaptador entre la ruta y el módulo.
3. Crear la funcionalidad dentro de `modules/<dominio>/<feature>`.
4. Reutilizar UI desde `shared/components`.
5. Usar `shared/services/<dominio>` para llamadas a la API.
6. Usar `mocks` solo para datos temporales o de demostración.

No se debe crear una segunda app por rol ni duplicar la lógica de negocio solo
porque una pantalla se acceda desde grupos de rutas diferentes.

## Aplicación de referencia

`reference/admin-console` conserva el código de la antigua consola de admin
como referencia visual del equipo. No es una app del workspace: no se compila
ni se despliega y no aparece en `pnpm-workspace.yaml`.
