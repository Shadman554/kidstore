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

const STORAGE_KEY = "kid-store-products";

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Rainbow Building Blocks Set",
    description: "100 colorful wooden blocks for endless creativity.",
    priceSingle: 24.99,
    priceBulk: 19.99,
    bulkMinQty: 5,
    currency: "USD",
    imageUrl: "https://picsum.photos/seed/kids-blocks/400/300",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Soft Plush Bear",
    description: "Cuddly and safe teddy bear for toddlers.",
    priceSingle: 14.50,
    priceBulk: 12.00,
    bulkMinQty: 3,
    currency: "USD",
    imageUrl: "https://picsum.photos/seed/kids-bear/400/300",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Dinosaur Puzzle",
    description: "Educational 50-piece puzzle featuring dinosaurs.",
    priceSingle: 12.99,
    priceBulk: 9.99,
    bulkMinQty: 4,
    currency: "USD",
    imageUrl: "https://picsum.photos/seed/kids-puzzle/400/300",
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Interactive Activity Table",
    description: "Engaging activity center with lights and sounds.",
    priceSingle: 45.00,
    priceBulk: 38.00,
    bulkMinQty: 2,
    currency: "USD",
    imageUrl: "https://picsum.photos/seed/kids-table/400/300",
    createdAt: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Children's Book Collection",
    description: "Set of 5 beautifully illustrated bedtime stories.",
    priceSingle: 29.99,
    priceBulk: 24.99,
    bulkMinQty: 3,
    currency: "USD",
    imageUrl: "https://picsum.photos/seed/kids-books/400/300",
    createdAt: new Date().toISOString(),
  },
  {
    id: "6",
    name: "Toy Train Set",
    description: "Classic wooden train tracks and colorful cars.",
    priceSingle: 34.50,
    priceBulk: 29.00,
    bulkMinQty: 4,
    currency: "USD",
    imageUrl: "https://picsum.photos/seed/kids-train/400/300",
    createdAt: new Date().toISOString(),
  },
  {
    id: "7",
    name: "Art Supply Kit",
    description: "Crayons, markers, and sketchpad in a neat case.",
    priceSingle: 18.00,
    priceBulk: 15.00,
    bulkMinQty: 5,
    currency: "USD",
    imageUrl: "https://picsum.photos/seed/kids-art/400/300",
    createdAt: new Date().toISOString(),
  },
  {
    id: "8",
    name: "Musical Xylophone",
    description: "Brightly colored xylophone with two mallets.",
    priceSingle: 22.00,
    priceBulk: 18.50,
    bulkMinQty: 3,
    currency: "USD",
    imageUrl: "https://picsum.photos/seed/kids-xylo/400/300",
    createdAt: new Date().toISOString(),
  },
  {
    id: "9",
    name: "Stuffed Bunny",
    description: "Extremely soft plush bunny, perfect for hugging.",
    priceSingle: 16.99,
    priceBulk: 13.99,
    bulkMinQty: 3,
    currency: "USD",
    imageUrl: "https://picsum.photos/seed/kids-bunny/400/300",
    createdAt: new Date().toISOString(),
  },
  {
    id: "10",
    name: "Kids' Backpack",
    description: "Durable and lightweight backpack for preschool.",
    priceSingle: 25.00,
    priceBulk: 20.00,
    bulkMinQty: 5,
    currency: "USD",
    imageUrl: "https://picsum.photos/seed/kids-bag/400/300",
    createdAt: new Date().toISOString(),
  },
  {
    id: "11",
    name: "Stacking Cups",
    description: "Set of 10 colorful nesting and stacking cups.",
    priceSingle: 9.99,
    priceBulk: 7.99,
    bulkMinQty: 10,
    currency: "USD",
    imageUrl: "https://picsum.photos/seed/kids-cups/400/300",
    createdAt: new Date().toISOString(),
  },
  {
    id: "12",
    name: "Play Tent",
    description: "Easy to assemble indoor play tent.",
    priceSingle: 39.99,
    priceBulk: 32.99,
    bulkMinQty: 2,
    currency: "USD",
    imageUrl: "https://picsum.photos/seed/kids-tent/400/300",
    createdAt: new Date().toISOString(),
  }
];

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

export function addProduct(product: Omit<Product, "id" | "createdAt"> & { code?: string }): Product {
  const products = getProducts();
  const nextNum = products.length + 1;
  const newProduct: Product = {
    ...product,
    code: product.code?.trim() || generateProductCode(nextNum),
    id: Date.now().toString(),
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
