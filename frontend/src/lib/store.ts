export type Currency = "USD" | "IQD";

export interface Product {
  id: string;
  code: string;
  name: string;
  imageUrl?: string;
  images?: string[];
  description?: string;
  priceSingle: number;
  priceBulk: number;
  bulkMinQty?: number;
  currency: Currency;
  createdAt: string;
}

export function generateProductCode(num: number): string {
  return `WAW-${String(num).padStart(3, "0")}`;
}

export function getFirstImage(product: Product): string | undefined {
  if (product.images && product.images.length > 0) return product.images[0];
  return product.imageUrl;
}

export function formatPrice(price: number, currency: Currency = "USD"): string {
  if (currency === "IQD") {
    return `${Math.round(price).toLocaleString()} IQD`;
  }
  return `$${price.toFixed(2)}`;
}

const STORAGE_KEY = "kid-store-products-v2";

const INITIAL_PRODUCTS: Product[] = [];

export function getProducts(): Product[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    let products: Product[];
    if (!data) {
      products = INITIAL_PRODUCTS;
    } else {
      products = JSON.parse(data);
    }
    let changed = false;
    const isSequentialCode = (code: string) => /^WAW-\d+$/.test(code);
    const sorted = [...products].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    let counter = 1;
    const codeMap = new Map<string, string>();
    for (const p of sorted) {
      if (!p.code || !isSequentialCode(p.code)) {
        codeMap.set(p.id, generateProductCode(counter));
        changed = true;
      }
      counter++;
    }
    if (changed) {
      products = products.map((p) =>
        codeMap.has(p.id) ? { ...p, code: codeMap.get(p.id)! } : p
      );
    }
    if (changed || !data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    }
    return products;
  } catch (error) {
    console.error("Error reading products from localStorage", error);
    return INITIAL_PRODUCTS;
  }
}

export function saveProducts(products: Product[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\w\u0600-\u06FF-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base || Date.now().toString();
}

function uniqueSlug(name: string, existing: Product[]): string {
  const base = slugify(name);
  const ids = new Set(existing.map((p) => p.id));
  if (!ids.has(base)) return base;
  let i = 2;
  while (ids.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

export function addProduct(product: Omit<Product, "id" | "createdAt"> & { code?: string }): Product {
  const products = getProducts();
  const nextNum = products.length + 1;
  const newProduct: Product = {
    ...product,
    code: product.code?.trim() || generateProductCode(nextNum),
    id: uniqueSlug(product.name, products),
    createdAt: new Date().toISOString(),
  };
  saveProducts([newProduct, ...products]);
  return newProduct;
}

export function updateProduct(id: string, updates: Partial<Product>): Product | null {
  const products = getProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;
  
  const updatedProduct = { ...products[index], ...updates };
  products[index] = updatedProduct;
  saveProducts(products);
  return updatedProduct;
}

export function deleteProduct(id: string) {
  const products = getProducts();
  const filtered = products.filter((p) => p.id !== id);
  saveProducts(filtered);
}
