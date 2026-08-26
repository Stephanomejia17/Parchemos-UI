-- ============================================================================
-- Parchemos · Migración 001 — Autenticación
-- Alcance EXCLUSIVO: GU-01 (PARCHE-169) y GU-02 (PARCHE-170)
--
-- Trazabilidad de criterios de aceptación:
--
--   GU-01 Registro
--   E1 Registro Comensal .............. trigger handle_new_user() -> estado 'activa'
--   E2 Registro Restaurante ........... trigger handle_new_user() -> 'pendiente_aprobacion'
--   E3 Correo ya registrado ........... auth.users.email (UNIQUE, nativo de Supabase Auth)
--   E4 Contraseña no cumple ........... Supabase Auth: política de contraseñas del proyecto
--   E5 Rol no seleccionado ............ trigger handle_new_user() -> RAISE EXCEPTION
--   E6 Términos no aceptados .......... trigger + CHECK perfiles_terminos_obligatorios
--
--   GU-02 Sesión
--   E1 Login exitoso .................. Supabase Auth + perfiles.rol (redirección por rol)
--   E2 Credenciales incorrectas ....... error genérico (se resuelve en la capa API)
--   E3 Cuenta suspendida .............. perfiles.estado + CHECK perfiles_motivo_si_suspendida
--   E4 Bloqueo por 5 intentos ......... tabla intentos_login + fn_login_bloqueado()
--   E5 Cierre de sesión ............... auth.sessions / auth.refresh_tokens (nativo)
--   E6 Acceso tras cerrar sesión ...... validación de JWT (nativo)
--
-- NOTA: NO se crea tabla de sesiones. Supabase Auth ya gestiona auth.sessions
-- y auth.refresh_tokens, y signOut() los revoca. Duplicarlo sería inseguro.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 1. LIMPIEZA — solo el esquema `public`.
--    NUNCA se toca `auth`, `storage`, `realtime` ni `extensions`:
--    eso rompería Supabase Auth de forma irreversible.
-- ---------------------------------------------------------------------------
drop schema if exists public cascade;
create schema public;

grant usage  on schema public to anon, authenticated, service_role;
grant all    on schema public to postgres, service_role;

alter default privileges in schema public
  grant all on tables    to postgres, anon, authenticated, service_role;
alter default privileges in schema public
  grant all on functions to postgres, anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to postgres, anon, authenticated, service_role;


-- ---------------------------------------------------------------------------
-- 2. TIPOS
-- ---------------------------------------------------------------------------

-- Los 5 roles que inician sesión según GU-02 E1.
-- El autoregistro (GU-01) sólo permite 'comensal' y 'restaurante';
-- los demás se crean desde otras historias (GU-05, GU-06).
create type public.rol_usuario as enum (
  'comensal',
  'restaurante',
  'personal',
  'repartidor',
  'administrador'
);

create type public.estado_cuenta as enum (
  'activa',
  'pendiente_aprobacion',  -- GU-01 E2
  'suspendida',            -- GU-02 E3
  'deshabilitada'
);


-- ---------------------------------------------------------------------------
-- 3. TABLA perfiles — extiende auth.users 1:1
--    Las credenciales (email, hash de contraseña) viven en auth.users.
--    Aquí sólo va lo que Supabase Auth no modela: rol y estado.
-- ---------------------------------------------------------------------------
create table public.perfiles (
  id                     uuid primary key
                           references auth.users (id) on delete cascade,
  rol                    public.rol_usuario  not null,
  estado                 public.estado_cuenta not null default 'activa',
  motivo_estado          text,

  -- GU-01 E6
  terminos_aceptados     boolean     not null,
  terminos_version       text        not null,
  terminos_aceptados_en  timestamptz not null default now(),

  -- GU-02 E4
  bloqueado_hasta        timestamptz,

  creado_en              timestamptz not null default now(),
  actualizado_en         timestamptz not null default now(),

  -- GU-01 E6: es imposible persistir un perfil sin términos aceptados
  constraint perfiles_terminos_obligatorios
    check (terminos_aceptados),

  -- GU-02 E3: una cuenta suspendida siempre debe indicar el motivo
  constraint perfiles_motivo_si_suspendida
    check (estado <> 'suspendida' or motivo_estado is not null)
);

comment on table public.perfiles is
  'Perfil 1:1 con auth.users. Rol y estado de cuenta. GU-01 / GU-02.';

create index perfiles_rol_idx    on public.perfiles (rol);
create index perfiles_estado_idx on public.perfiles (estado);


-- ---------------------------------------------------------------------------
-- 4. TABLA intentos_login — GU-02 E4
--    Se registra por email (texto), no por FK, porque también hay que contar
--    intentos contra correos que no existen (evita enumeración de usuarios).
-- ---------------------------------------------------------------------------
create table public.intentos_login (
  id          bigint generated always as identity primary key,
  email       text        not null,
  usuario_id  uuid        references auth.users (id) on delete set null,
  exito       boolean     not null,
  ip          inet,
  user_agent  text,
  creado_en   timestamptz not null default now()
);

comment on table public.intentos_login is
  'Auditoría de intentos de inicio de sesión. Base del bloqueo por 5 fallos (GU-02 E4).';

create index intentos_login_email_fecha_idx
  on public.intentos_login (lower(email), creado_en desc);


-- ---------------------------------------------------------------------------
-- 5. FUNCIONES
--    Todas con `search_path = ''` para impedir search_path hijacking
--    (requisito de seguridad en funciones SECURITY DEFINER).
-- ---------------------------------------------------------------------------

-- 5.1 Alta automática de perfil al registrarse — GU-01 E1, E2, E5, E6.
--     Las reglas viven en la BD, así que se cumplen aunque alguien
--     llame a la API saltándose el formulario del frontend.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rol_txt text := new.raw_user_meta_data ->> 'rol';
  v_rol     public.rol_usuario;
  v_estado  public.estado_cuenta;
begin
  -- GU-01 E5: rol obligatorio
  if v_rol_txt is null or v_rol_txt = '' then
    raise exception 'Debe seleccionar un rol (Comensal o Restaurante)'
      using errcode = 'check_violation';
  end if;

  begin
    v_rol := v_rol_txt::public.rol_usuario;
  exception when invalid_text_representation then
    raise exception 'Rol inválido: %', v_rol_txt using errcode = 'check_violation';
  end;

  -- Sólo Comensal y Restaurante pueden autoregistrarse (GU-01 E1/E2).
  -- Impide que alguien se cree como 'administrador' desde el registro público.
  if v_rol not in ('comensal', 'restaurante') then
    raise exception 'El rol % no puede autoregistrarse', v_rol
      using errcode = 'insufficient_privilege';
  end if;

  -- GU-01 E6: términos y condiciones
  if coalesce((new.raw_user_meta_data ->> 'terminos_aceptados')::boolean, false) is not true then
    raise exception 'Debe aceptar los términos y condiciones'
      using errcode = 'check_violation';
  end if;

  -- GU-01 E2: el restaurante nace bloqueado para operar
  v_estado := case
                when v_rol = 'restaurante' then 'pendiente_aprobacion'::public.estado_cuenta
                else 'activa'::public.estado_cuenta
              end;

  insert into public.perfiles (
    id, rol, estado, terminos_aceptados, terminos_version, terminos_aceptados_en
  ) values (
    new.id,
    v_rol,
    v_estado,
    true,
    coalesce(new.raw_user_meta_data ->> 'terminos_version', 'v1'),
    now()
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 5.2 Blindaje anti escalación de privilegios.
--     Sin esto, un usuario autenticado podría hacer
--       update perfiles set rol = 'administrador' where id = auth.uid();
--     y volverse admin. Es la vulnerabilidad clásica de este diseño.
create or replace function public.proteger_campos_sensibles()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role text := current_setting('request.jwt.claims', true)::jsonb ->> 'role';
begin
  -- service_role o conexión directa de confianza: puede todo.
  if v_role is null or v_role not in ('authenticated', 'anon') then
    return new;
  end if;

  if new.rol is distinct from old.rol then
    raise exception 'No autorizado: no puede modificar su propio rol'
      using errcode = 'insufficient_privilege';
  end if;

  if new.estado is distinct from old.estado then
    raise exception 'No autorizado: no puede modificar el estado de su cuenta'
      using errcode = 'insufficient_privilege';
  end if;

  if new.bloqueado_hasta is distinct from old.bloqueado_hasta then
    raise exception 'No autorizado: no puede modificar el bloqueo'
      using errcode = 'insufficient_privilege';
  end if;

  return new;
end;
$$;

create trigger perfiles_proteger_campos
  before update on public.perfiles
  for each row execute function public.proteger_campos_sensibles();


-- 5.3 actualizado_en automático
create or replace function public.tocar_actualizado_en()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.actualizado_en := now();
  return new;
end;
$$;

create trigger perfiles_tocar_actualizado_en
  before update on public.perfiles
  for each row execute function public.tocar_actualizado_en();


-- 5.4 GU-02 E4: ¿está bloqueado este correo?
--     5 fallos dentro de una ventana de 15 minutos.
create or replace function public.fn_login_bloqueado(p_email text)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select count(*) >= 5
  from public.intentos_login
  where lower(email) = lower(p_email)
    and exito = false
    and creado_en > now() - interval '15 minutes';
$$;

revoke execute on function public.fn_login_bloqueado(text) from anon, authenticated;


-- ---------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------
alter table public.perfiles       enable row level security;
alter table public.intentos_login enable row level security;

-- Cada usuario ve únicamente su propio perfil.
create policy perfiles_select_propio
  on public.perfiles
  for select
  to authenticated
  using (id = (select auth.uid()));

-- Puede actualizar su fila, pero rol/estado/bloqueo están blindados por trigger.
create policy perfiles_update_propio
  on public.perfiles
  for update
  to authenticated
  using      (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Sin política de INSERT: los perfiles sólo nacen del trigger on_auth_user_created.
-- Sin política de DELETE: se borran en cascada al borrar el usuario en auth.users.

-- intentos_login: ninguna política => ningún cliente puede leerlo ni escribirlo.
-- Sólo service_role (que hace bypass de RLS) desde el backend.
