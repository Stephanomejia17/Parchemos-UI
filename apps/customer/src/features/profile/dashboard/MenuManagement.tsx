"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Edit3, ImagePlus, LayoutGrid, List, Loader2, Plus, Star, Trash2, X } from "lucide-react";
import { ApiError, apiFetch, apiUpload } from "@parchemos/shared/auth";
import { PrimaryButton, TemporaryMessage } from "@parchemos/shared/components";

// Categorías permitidas por la API para clasificar los productos del menú.
type Category = "entradas" | "platos_fuertes" | "postres" | "bebidas";
// Estado de publicación del producto: activo o desactivado temporalmente.
type Status = "activo" | "inactivo";

interface Restaurant {
  id: string;
  businessName: string;
}

interface Product {
  id: string;
  restaurantId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  category: Category;
  price: number;
  status: Status;
  featured: boolean;
}

interface ProductPageResponse {
  success: boolean;
  data: { items: Product[]; pagination: { total: number } };
  message: string;
}

interface ProductResponse {
  success: boolean;
  data: Product;
  message: string;
}

// Fuente única para los filtros, formularios y títulos de cada sección.
const CATEGORIES: { value: Category; label: string }[] = [
  { value: "entradas", label: "Entradas" },
  { value: "platos_fuertes", label: "Platos fuertes" },
  { value: "postres", label: "Postres" },
  { value: "bebidas", label: "Bebidas" },
];

// Valores iniciales del formulario de creación de productos.
const emptyForm = { name: "", description: "", category: "platos_fuertes" as Category, price: "", status: "activo" as Status };

// Pantalla principal de administración del menú.
export function MenuManagement({ restaurantId: initialRestaurantId }: { restaurantId?: string }) {
  // Datos y filtros de la pantalla.
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [restaurantId, setRestaurantId] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | Status>("");
  // Vista seleccionada por el usuario: cards por defecto o lista.
  const [view, setView] = useState<"list" | "cards">("cards");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [confirming, setConfirming] = useState<{ product: Product; action: Status } | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState<File | null>(null);
  // Estado del modal y de la imagen que se cargará al guardar.
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Datos derivados: restaurante seleccionado, título del formulario y productos agrupados.
  const selectedRestaurant = restaurants.find(item => item.id === restaurantId);
  const formTitle = editing ? "Editar producto" : "Nuevo producto";
  const hasRestaurants = restaurants.length > 0;
  const productsByCategory = CATEGORIES.map(category => ({ ...category, products: products.filter(product => product.category === category.value) })).filter(category => category.products.length > 0);

  // Carga los restaurantes del usuario al entrar a la pantalla.
  useEffect(() => {
    void loadRestaurants();
  }, []);

  // Recarga los productos cada vez que cambia el restaurante o un filtro.
  useEffect(() => {
    if (restaurantId) void loadProducts(restaurantId);
  }, [restaurantId, categoryFilter, statusFilter]);

  // Genera y limpia la previsualización local de la imagen seleccionada.
  useEffect(() => {
    if (!image) {
      setImagePreview(null);
      return;
    }
    const preview = URL.createObjectURL(image);
    setImagePreview(preview);
    return () => URL.revokeObjectURL(preview);
  }, [image]);

  // Obtiene los restaurantes disponibles y selecciona uno por defecto.
  async function loadRestaurants() {
    setLoading(true);
    try {
      const data = await apiFetch<Restaurant[]>("/restaurantes/mios");
      setRestaurants(data);
      const preferred = initialRestaurantId ? data.find(item => item.id === initialRestaurantId) : data[0];
      if (preferred) setRestaurantId(preferred.id);
    } catch (err) {
      setError(messageFrom(err));
    } finally {
      setLoading(false);
    }
  }

  // Obtiene los productos aplicando categoría y estado.
  async function loadProducts(id: string) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: "1", limit: "100" });
      if (categoryFilter) params.set("category", categoryFilter);
      if (statusFilter) params.set("status", statusFilter);
      const response = await apiFetch<ProductPageResponse>(`/restaurantes/${id}/productos?${params}`);
      setProducts(response.data.items);
    } catch (err) {
      setError(messageFrom(err));
    } finally {
      setLoading(false);
    }
  }

  // Abre el formulario vacío para crear un producto.
  function openCreate() {
    setFormOpen(true);
    setEditing(null);
    setForm(emptyForm);
    setImage(null);
    setError(null);
    setNotice(null);
  }

  // Abre el formulario con los datos del producto seleccionado.
  function openEdit(product: Product) {
    setFormOpen(true);
    setEditing(product);
    setForm({ name: product.name, description: product.description ?? "", category: product.category, price: String(product.price), status: product.status });
    setImage(null);
    setError(null);
    setNotice(null);
  }

  // Valida el archivo antes de mostrarlo y enviarlo al servidor.
  function selectImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setImage(null);
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("La imagen debe ser JPG, PNG o WEBP.");
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede superar los 5 MB.");
      event.target.value = "";
      return;
    }
    setError(null);
    setImage(file);
  }

  // Crea o actualiza el producto y, si aplica, sube su imagen.
  async function save(event: FormEvent) {
    event.preventDefault();
    if (!restaurantId || saving) return;
    const name = form.name.trim();
    const price = Number(form.price);
    if (!name) {
      setError("El nombre del producto es obligatorio.");
      return;
    }
    if (!form.price.trim() || !Number.isFinite(price) || price <= 0) {
      setError("El precio es obligatorio y debe ser mayor que 0.");
      return;
    }
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const body = { ...form, name, description: form.description.trim() || undefined, price };
      const response = editing
        ? await apiFetch<ProductResponse>(`/productos/${editing.id}`, { method: "PATCH", body })
        : await apiFetch<ProductResponse>(`/restaurantes/${restaurantId}/productos`, { method: "POST", body });
      if (image) {
        const upload = new FormData();
        upload.append("file", image);
        await apiUpload<ProductResponse>(`/productos/${response.data.id}/imagen`, upload);
      }
      await loadProducts(restaurantId);
      setEditing(null);
      setFormOpen(false);
      setForm(emptyForm);
      setImage(null);
      setNotice(editing ? "Producto actualizado correctamente." : "Producto creado correctamente.");
    } catch (err) {
      setError(messageFrom(err));
    } finally {
      setSaving(false);
    }
  }

  // Operación PATCH genérica para actualizaciones rápidas del producto.
  async function updateProduct(id: string, body: unknown, successMessage: string) {
    try {
      setError(null);
      await apiFetch<ProductResponse>(`/productos/${id}`, { method: "PATCH", body });
      await loadProducts(restaurantId);
      setNotice(successMessage);
    } catch (err) {
      setError(messageFrom(err));
    }
  }

  // Activa o desactiva la marca de producto destacado.
  async function toggleFeatured(product: Product) {
    try {
      setError(null);
      await apiFetch<ProductResponse>(`/productos/${product.id}/destacado`, { method: "PATCH", body: { featured: !product.featured } });
      await loadProducts(restaurantId);
    } catch (err) {
      setError(messageFrom(err));
    }
  }

  // Activa o desactiva un producto después de la confirmación del usuario.
  async function changeProductStatus(product: Product, action: Status) {
    if (saving) return;
    setSaving(true);
    try {
      setError(null);
      await apiFetch<ProductResponse>(`/productos/${product.id}`, action === "inactivo" ? { method: "DELETE" } : { method: "PATCH", body: { status: "activo" } });
      await loadProducts(restaurantId);
      setNotice(action === "inactivo" ? "Producto desactivado correctamente." : "Producto activado correctamente.");
      setConfirming(null);
    } catch (err) {
      setError(messageFrom(err));
    } finally {
      setSaving(false);
    }
  }

  const productsLabel = useMemo(() => `${products.length} producto${products.length === 1 ? "" : "s"}`, [products.length]);

  // Render de la pantalla: encabezado, mensajes, filtros, productos y modales.
  return (
    <section className="bg-background flex flex-col gap-5">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Gestión del menú</p>
          <h2 className="text-2xl font-bold text-gray-900 font-heading">Productos</h2>
          <p className="text-sm text-muted-foreground mt-1">Crea, edita y administra los productos de tu restaurante.</p>
        </div>
        <PrimaryButton onClick={openCreate} disabled={!hasRestaurants}><Plus className="w-4 h-4" />Nuevo producto</PrimaryButton>
      </header>

      {error && <TemporaryMessage type="error" message={error} onClose={() => setError(null)} />}
      {notice && <TemporaryMessage type="success" message={notice} onClose={() => setNotice(null)} />}

      {!loading && !hasRestaurants ? (
        <div className="bg-white border border-border rounded-2xl p-8 text-center"><p className="font-semibold text-gray-900">Aún no tienes restaurantes registrados.</p><p className="text-sm text-muted-foreground mt-1">Crea un restaurante para comenzar a construir tu menú.</p></div>
      ) : (
        <>
          <div className="bg-white border border-border rounded-2xl p-4 flex flex-col gap-3 md:flex-row md:items-center">
            {!initialRestaurantId && <label className="flex-1 flex flex-col gap-1"><span className="text-xs font-semibold text-gray-600">Restaurante</span><select value={restaurantId} onChange={event => setRestaurantId(event.target.value)} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm"><option value="">Selecciona un restaurante</option>{restaurants.map(item => <option key={item.id} value={item.id}>{item.businessName}</option>)}</select></label>}
            <label className="flex-1 flex flex-col gap-1"><span className="text-xs font-semibold text-gray-600">Categoría</span><select value={categoryFilter} onChange={event => setCategoryFilter(event.target.value)} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm"><option value="">Todas</option>{CATEGORIES.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
            <label className="flex-1 flex flex-col gap-1"><span className="text-xs font-semibold text-gray-600">Estado</span><select value={statusFilter} onChange={event => setStatusFilter(event.target.value as "" | Status)} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm"><option value="">Todos</option><option value="activo">Activos</option><option value="inactivo">Inactivos</option></select></label>
          </div>

          {selectedRestaurant && <div className="flex items-center justify-between gap-3"><p className="text-sm text-muted-foreground">{selectedRestaurant.businessName} · {productsLabel}</p><div className="flex rounded-xl border border-border bg-white p-1" role="group" aria-label="Modo de visualización"><button type="button" onClick={() => setView("list")} aria-label="Vista de lista" aria-pressed={view === "list"} className={`rounded-lg p-2 ${view === "list" ? "bg-orange-50 text-primary" : "text-gray-500 hover:bg-gray-50"}`}><List className="h-4 w-4" /></button><button type="button" onClick={() => setView("cards")} aria-label="Vista de cards" aria-pressed={view === "cards"} className={`rounded-lg p-2 ${view === "cards" ? "bg-orange-50 text-primary" : "text-gray-500 hover:bg-gray-50"}`}><LayoutGrid className="h-4 w-4" /></button></div></div>}
          {loading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div> : products.length === 0 ? <div className="bg-white border border-border rounded-2xl p-8 text-center"><p className="font-semibold text-gray-900">No hay productos con estos filtros.</p><button onClick={openCreate} className="text-sm text-primary font-semibold mt-2 hover:underline">Crear el primer producto</button></div> : <div className="space-y-6">{productsByCategory.map(category => <section key={category.value}><div className="mb-3 flex items-center justify-between"><h3 className="text-lg font-bold text-gray-900">{category.label}</h3><span className="text-xs font-semibold text-muted-foreground">{category.products.length} producto{category.products.length === 1 ? "" : "s"}</span></div>{view === "cards" ? <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">{category.products.map(product => <ProductCard key={product.id} product={product} onEdit={openEdit} onFeatured={toggleFeatured} onRemove={() => setConfirming({ product, action: "inactivo" })} onReactivate={product => setConfirming({ product, action: "activo" })} />)}</div> : <div className="overflow-hidden rounded-2xl border border-border bg-white">{category.products.map(product => <ProductRow key={product.id} product={product} onEdit={openEdit} onFeatured={toggleFeatured} onRemove={() => setConfirming({ product, action: "inactivo" })} onReactivate={product => setConfirming({ product, action: "activo" })} />)}</div>}</section>)}</div>}
        </>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/35 p-4" role="dialog" aria-modal="true" aria-label={formTitle}>
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between gap-4 mb-5"><div><p className="text-xs font-semibold uppercase tracking-wide text-primary">Menú</p><h3 className="text-xl font-bold text-gray-900">{formTitle}</h3></div><button type="button" onClick={() => setFormOpen(false)} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center"><X className="w-4 h-4" /></button></div>
            <form onSubmit={save} className="flex flex-col gap-4" noValidate>
              <label className="flex flex-col gap-1.5"><span className="text-xs font-semibold text-gray-600">Nombre</span><input required minLength={1} maxLength={160} value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm" /></label>
              <label className="flex flex-col gap-1.5"><span className="text-xs font-semibold text-gray-600">Descripción</span><textarea maxLength={2000} rows={3} value={form.description} onChange={event => setForm(current => ({ ...current, description: event.target.value }))} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm resize-none" /></label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><label className="flex flex-col gap-1.5"><span className="text-xs font-semibold text-gray-600">Categoría</span><select value={form.category} onChange={event => setForm(current => ({ ...current, category: event.target.value as Category }))} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm">{CATEGORIES.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><label className="flex flex-col gap-1.5"><span className="text-xs font-semibold text-gray-600">Precio</span><input required type="number" min="0.01" step="0.01" value={form.price} onChange={event => setForm(current => ({ ...current, price: event.target.value }))} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm" /></label></div>
              <label className="flex flex-col gap-1.5"><span className="text-xs font-semibold text-gray-600">Estado</span><select value={form.status} onChange={event => setForm(current => ({ ...current, status: event.target.value as Status }))} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm"><option value="activo">Activo</option><option value="inactivo">Inactivo</option></select></label>
              <label className="flex flex-col gap-1.5"><span className="text-xs font-semibold text-gray-600">Foto del producto</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={selectImage} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-orange-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary" /><span className="text-[11px] text-muted-foreground">JPG, PNG o WEBP. Máximo 5 MB.</span></label>{(imagePreview || editing?.imageUrl) && <div className="overflow-hidden rounded-xl border bg-orange-50"><img src={imagePreview || editing?.imageUrl || ""} alt="Vista previa del producto" className="h-36 w-full object-cover" /><p className="px-3 py-2 text-[11px] text-muted-foreground">Vista previa local. Se subirá al guardar el producto.</p></div>}
              <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setFormOpen(false)} className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700">Cancelar</button><PrimaryButton type="submit" disabled={saving || !form.name.trim() || Number(form.price) <= 0}>{saving ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Guardando...</span> : editing ? "Guardar cambios" : "Crear producto"}</PrimaryButton></div>
            </form>
          </div>
        </div>
      )}
      {confirming && <ConfirmModal product={confirming.product} action={confirming.action} busy={saving} cancel={() => setConfirming(null)} confirm={() => void changeProductStatus(confirming.product, confirming.action)} />}
    </section>
  );
}

// Presentación en cards: muestra imagen, descripción, precio, estado y acciones.
function ProductCard({ product, onEdit, onFeatured, onRemove, onReactivate }: { product: Product; onEdit: (product: Product) => void; onFeatured: (product: Product) => void; onRemove: () => void; onReactivate: (product: Product) => void }) {
  return <article className={`relative rounded-2xl border bg-white p-4 shadow-sm ${product.status === "inactivo" ? "bg-gray-50 border-gray-200" : "border-border"}`}><div className="absolute right-3 top-3"><button onClick={() => onFeatured(product)} title={product.featured ? "Quitar destacado" : "Marcar destacado"} aria-label={product.featured ? "Quitar destacado" : "Marcar destacado"} className={`flex h-8 w-8 items-center justify-center rounded-xl ${product.featured ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-gray-500"}`}><Star className={`h-4 w-4 ${product.featured ? "fill-amber-400" : ""}`} /></button></div><div className="flex gap-4 pr-10"><div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-orange-50">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" /> : <ImagePlus className="h-7 w-7 text-primary/50" />}</div><div className="min-w-0 flex-1"><h3 className="truncate font-bold text-gray-900">{product.name}</h3><p className="mt-1 text-xs font-semibold text-primary">{CATEGORIES.find(item => item.value === product.category)?.label} · ${product.price.toLocaleString("es-CO")}</p><p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{product.description || "Sin descripción"}</p><span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${product.status === "activo" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>{product.status === "activo" ? "Activo" : "Inactivo"}</span></div></div><div className="mt-4 flex items-center justify-end gap-2 border-t border-border pt-3"><button onClick={() => onEdit(product)} className="inline-flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700"><Edit3 className="h-3.5 w-3.5" />Editar</button>{product.status === "activo" ? <button onClick={onRemove} className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">Desactivar</button> : <button onClick={() => onReactivate(product)} className="inline-flex items-center gap-1.5 rounded-xl bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">Activar</button>}</div></article>;
}

// Presentación compacta para la vista de lista.
function ProductRow({ product, onEdit, onFeatured, onRemove, onReactivate }: { product: Product; onEdit: (product: Product) => void; onFeatured: (product: Product) => void; onRemove: () => void; onReactivate: (product: Product) => void }) {
  return <article className="flex items-center gap-3 border-b border-border p-3 last:border-b-0"><div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-orange-50">{product.imageUrl ? <img src={product.imageUrl} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-5 w-5 text-primary/50" />}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-gray-900">{product.name}</p><p className="truncate text-xs text-muted-foreground">{product.description || "Sin descripción"}</p></div><span className="hidden text-xs font-semibold text-primary sm:block">${product.price.toLocaleString("es-CO")}</span><button type="button" onClick={() => onFeatured(product)} aria-label={product.featured ? "Quitar destacado" : "Marcar destacado"} className={`rounded-xl p-2 ${product.featured ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-gray-500"}`}><Star className={`h-4 w-4 ${product.featured ? "fill-amber-400" : ""}`} /></button><button type="button" onClick={() => onEdit(product)} className="rounded-xl bg-gray-100 p-2 text-gray-700" aria-label={`Editar ${product.name}`}><Edit3 className="h-4 w-4" /></button>{product.status === "activo" ? <button type="button" onClick={onRemove} className="rounded-xl bg-red-50 p-2 text-red-700" aria-label={`Desactivar ${product.name}`}><Trash2 className="h-4 w-4" /></button> : <button type="button" onClick={() => onReactivate(product)} className="rounded-xl bg-green-50 p-2 text-green-700" aria-label={`Activar ${product.name}`}><span className="text-xs font-bold">✓</span></button>}</article>;
}

// Modal de seguridad para evitar activar o desactivar accidentalmente un producto.
function ConfirmModal({ product, action, busy, cancel, confirm }: { product: Product; action: Status; busy: boolean; cancel: () => void; confirm: () => void }) {
  const activating = action === "activo";
  return <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-title"><div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl"><h3 id="confirm-title" className="text-lg font-bold text-gray-900">{activating ? "¿Activar producto?" : "¿Desactivar producto?"}</h3><p className="mt-2 text-sm text-gray-600">{activating ? "¿Quieres volver a activar" : "¿Quieres desactivar"} <strong>{product.name}</strong>? {activating ? "Volverá a estar disponible en el menú." : "No se eliminará definitivamente y podrás activarlo después."}</p><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={cancel} disabled={busy} className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700">Cancelar</button><button type="button" onClick={confirm} disabled={busy} className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 ${activating ? "bg-green-600" : "bg-red-600"}`}>{busy ? (activating ? "Activando..." : "Desactivando...") : activating ? "Activar" : "Desactivar"}</button></div></div></div>;
}
// Convierte errores de la API en un texto seguro para mostrar al usuario.
function messageFrom(error: unknown): string { return error instanceof ApiError ? error.message : "No pudimos completar la operación."; }
