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

```text
modules/<dominio>/<feature>/<Componente>.tsx
```

Ejemplo: `modules/customer/home/Home.tsx`, `modules/auth/login/Login.tsx`,
`modules/account/Profile.tsx`. El componente principal de la feature vive
directo en esa carpeta, no dentro de una subcarpeta `ui/`.

Una subcarpeta `ui/` dentro de un dominio (por ejemplo
`modules/admin/ui/ChartTooltip.tsx`, `SectionHeader.tsx`, `StatCard.tsx`) solo
se justifica cuando esas piezas se reutilizan entre **varias** pantallas del
mismo dominio. Si un componente solo lo usa una pantalla, va junto a ella; no
se crea `ui/` para una sola feature.

### `components`

No existe una carpeta `components` en la raíz de `src`. Los componentes de
navegación compartidos entre roles (`Sidebar`, `BottomNav`,
`NavigationHeader`) viven en `shared/components/navigation`. El "shell" de
cada rol (`CustomerShell`, `RestaurantShell`, `AdminShell`, `WorkroomShell`)
no es compartido: cada uno se define junto a sus rutas, en
`app/(<rol>)/_components/`, porque cada rol compone la navegación y el
layout de forma distinta.

### `shared`

Contiene piezas reutilizables entre módulos: componentes UI, formularios,
media, autenticación, cliente HTTP, servicios de API, constantes y tipos
comunes. Un componente que solo sirve para una feature debe permanecer dentro
de su módulo y no entrar en `shared`.

Regla para `shared/types`: un tipo va ahí solo si lo consumen dos o más
dominios (por ejemplo `restaurant.ts`, usado por `admin` y `restaurant`). Si
un tipo es propio de una sola feature, debe vivir junto a su servicio o
componente dentro de `modules/<dominio>/<feature>`.

### `mocks`

Contiene datos simulados usados durante el desarrollo visual o mientras una
funcionalidad todavía no consume la API. Los datos reales y las llamadas HTTP
deben vivir en los servicios correspondientes.

## Servicios y API

`shared/services/http/api-client.ts` es la única capa que sabe hacer HTTP:
arma la URL base (`NEXT_PUBLIC_API_URL`), inyecta el token, reintenta una vez
tras un 401 renovando la sesión, y normaliza los errores de Nest a `ApiError`.
Expone dos funciones de bajo nivel, `apiFetch` y `apiUpload` (multipart), que
**nunca se llaman directamente desde un módulo**.

Los servicios de dominio son la capa intermedia obligatoria entre un módulo y
`api-client.ts`:

```text
shared/services/
├── http/       # infraestructura HTTP (apiFetch, apiUpload, refresh de token)
├── auth/       # login, registro y recuperación
├── menu/       # menús y productos
├── profile/    # perfil de usuario
├── restaurant/ # restaurantes, sedes y personal
└── admin/      # operaciones administrativas
```

### Regla: un servicio expone métodos con nombre, no `fetch` genérico

Cada servicio debe exponer una función por operación de negocio, con la ruta,
el método HTTP y el tipo de la respuesta ya resueltos adentro. Un módulo
nunca debe conocer ni escribir el string de un endpoint.

```ts
// ❌ Mal: el módulo conoce la ruta del backend
await profileService.fetch("/auth/me", { method: "PATCH", body: payload });

// ✅ Bien: el servicio conoce la ruta, el módulo solo expresa la intención
await profileService.update(payload);
```

```ts
// shared/services/profile/profile.service.ts
export const profileService = {
  update: (payload: UpdateProfilePayload) =>
    apiFetch<void>("/auth/me", { method: "PATCH", body: payload }),
  requestDeletion: () => apiFetch<DeletionRequestResult>("/auth/me", { method: "DELETE" }),
};
```

Ventajas concretas de esta regla (no es solo estilo):

1. **Un solo lugar por endpoint.** Si el backend cambia una ruta, se corrige
   un archivo en `shared/services/`, no cada componente que la llamaba.
2. **El módulo se queda con la lógica que le corresponde**: cuándo llamar
   (submit, click) y qué hacer con el resultado (actualizar estado, mostrar
   error). No con el "cómo" de la llamada HTTP.
3. **Los tipos de la respuesta viven junto al endpoint que los produce**, no
   duplicados dentro de cada componente que los consume. Si el mismo tipo lo
   usan dos o más dominios, se promueve a `shared/types` (ver regla arriba).

Los tipos que representan la forma de un recurso de dominio (`Product`,
`Location`, `StaffMember`, etc.) se definen en el servicio, o en
`shared/types` si los usa más de un dominio, y el módulo los importa — nunca
los redefine.

### Al agregar un endpoint nuevo

1. Agregar el método al servicio del dominio correspondiente
   (`shared/services/<dominio>/<dominio>.service.ts`), tipando el payload y
   la respuesta.
2. Si el tipo de respuesta es nuevo, exportarlo desde ese mismo archivo y
   re-exportarlo en `shared/services/index.ts` (`export type { ... }`).
3. Consumir el método nuevo desde el módulo. Si el módulo necesitaba el tipo
   del payload o la respuesta, se importa desde `@/shared/services` (o
   `@/shared/types`), no se vuelve a declarar.

## Reglas para agregar una pantalla

1. Crear la carpeta de la URL dentro del grupo de usuario correcto.
2. Mantener `page.tsx` como adaptador entre la ruta y el módulo.
3. Crear la funcionalidad dentro de `modules/<dominio>/<feature>`.
4. Reutilizar UI desde `shared/components`.
5. Usar `shared/services/<dominio>` para llamadas a la API.
6. Usar `mocks` solo para datos temporales o de demostración.

No se debe crear una segunda app por rol ni duplicar la lógica de negocio solo
porque una pantalla se acceda desde grupos de rutas diferentes.

## Convenciones de desarrollo

### Formato de código

El proyecto usa Prettier (`.prettierrc.json` en la raíz del repo) integrado
con ESLint. Antes de subir un cambio:

```bash
pnpm format        # reformatea todo el repo
pnpm format:check  # solo valida, no modifica (útil en CI)
pnpm --filter @parchemos/web lint
```

No se debe escribir JSX comprimido en una sola línea ni desactivar Prettier
en archivos puntuales: si una regla de formato molesta, se discute y se
ajusta en `.prettierrc.json` para todo el equipo, no se ignora caso por caso.

### Variables de entorno

`apps/.env.example` documenta las variables esperadas y **debe mantenerse
actualizado y versionado** (no va en `.gitignore`). Hoy solo existe
`NEXT_PUBLIC_API_URL`. Cualquier variable nueva que necesite el cliente:

- se agrega a `.env.example` con un comentario explicando para qué sirve y
  cuáles son sus valores por ambiente (local/staging/producción);
- si es sensible o solo la necesita el servidor, **no** lleva el prefijo
  `NEXT_PUBLIC_` (ese prefijo hace que Next.js la incruste en el bundle que
  llega al navegador);
- si es obligatoria en producción, debe fallar el build cuando falte, como
  hace `resolveBaseUrl()` en `api-client.ts`, en vez de caer en un valor por
  defecto silencioso.

## Aplicación de referencia

`reference/admin-console` conserva el código de la antigua consola de admin
como referencia visual del equipo. No es una app del workspace: no se compila
ni se despliega y no aparece en `pnpm-workspace.yaml`.
