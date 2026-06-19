import { getAdminToken } from "./admin-auth";
import type { Product } from "./store";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function adminHeaders(): HeadersInit {
  const token = getAdminToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function mapProduct(p: Record<string, unknown>): Product {
  return {
    id: p.id as string,
    code: p.code as string,
    name: p.name as string,
    imageUrl: (p.imageUrl ?? p.image_url) as string | undefined,
    images: (p.images ?? undefined) as string[] | undefined,
    description: (p.description ?? undefined) as string | undefined,
    priceSingle: Number(p.priceSingle ?? p.price_single),
    priceBulk: Number(p.priceBulk ?? p.price_bulk ?? 0),
    bulkMinQty: (p.bulkMinQty ?? p.bulk_min_qty ?? undefined) as number | undefined,
    currency: ((p.currency as string) ?? "USD") as "USD" | "IQD",
    createdAt:
      typeof p.createdAt === "string"
        ? p.createdAt
        : new Date(p.createdAt as string).toISOString(),
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const data = await apiFetch<Record<string, unknown>[]>("/products");
  return data.map(mapProduct);
}

export async function fetchProduct(id: string): Promise<Product> {
  const data = await apiFetch<Record<string, unknown>>(`/products/${id}`);
  return mapProduct(data);
}

export async function createProduct(
  product: Omit<Product, "id" | "code" | "createdAt">,
): Promise<Product> {
  const data = await apiFetch<Record<string, unknown>>("/admin/products", {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify(product),
  });
  return mapProduct(data);
}

export async function updateProduct(
  id: string,
  updates: Partial<Omit<Product, "id" | "code" | "createdAt">>,
): Promise<Product> {
  const data = await apiFetch<Record<string, unknown>>(`/admin/products/${id}`, {
    method: "PUT",
    headers: adminHeaders(),
    body: JSON.stringify(updates),
  });
  return mapProduct(data);
}

export async function deleteProduct(id: string): Promise<void> {
  await apiFetch<void>(`/admin/products/${id}`, {
    method: "DELETE",
    headers: adminHeaders(),
  });
}
