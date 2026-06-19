import { useState, useEffect, useMemo } from "react";
import { getProducts, Product } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { ProductCard } from "@/components/product-card";
import { SkeletonCard } from "@/components/skeleton-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, PackageSearch } from "lucide-react";

const ITEMS_PER_PAGE = 8;

export default function Catalog() {
  const { t, isRtl } = useI18n();
  const [products, setProducts] = useState<Product[]>(() => getProducts());
  const [loading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const lowerSearch = search.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerSearch) ||
        (p.description && p.description.toLowerCase().includes(lowerSearch))
    );
  }, [products, search]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div>
      {/* ── MOBILE HERO ── only shown on mobile */}
      <div className="md:hidden">
        {/* Gradient hero banner */}
        <div className="relative overflow-hidden px-5 pt-5 pb-6" style={{ background: "linear-gradient(135deg, #FEC00B 0%, #EE4C9F 55%, #01BCF3 100%)" }}>
          {/* Decorative blobs */}
          <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/10" />

          <div className={`relative z-10 ${isRtl ? 'text-right' : 'text-left'}`}>
            <p className="font-display text-xl font-bold text-white leading-snug drop-shadow-sm">
              {t("catalog.tagline1")}
            </p>
            <p className="font-sans text-sm text-white/85 mt-1 font-medium leading-relaxed">
              {t("catalog.tagline2")}
            </p>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="px-4 -mt-4 relative z-10">
          <div className="relative">
            <div className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-4' : 'left-0 pl-4'} flex items-center pointer-events-none`}>
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              type="search"
              className={`${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'} h-12 rounded-2xl border-2 bg-white dark:bg-card shadow-lg font-sans text-sm`}
              placeholder={t("catalog.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="mobile-input-search"
            />
          </div>
        </div>

        {/* Mobile product grid */}
        <div className="px-4 pt-5 pb-4">
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="min-h-[220px]">
                  <SkeletonCard index={i} />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-[#FEC00B]/10 p-5 rounded-full mb-4">
                <PackageSearch className="h-10 w-10 text-[#FEC00B]" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">{t("catalog.noResults")}</h2>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                {paginatedProducts.map((product, index) => (
                  <div key={product.id} className="min-h-[220px]">
                    <ProductCard product={product} index={index} />
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-8">
                  <Button
                    variant="outline"
                    className="rounded-full w-11 h-11 p-0 border-2"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    data-testid="mobile-btn-prev-page"
                  >
                    {isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                  </Button>
                  <div className="font-display font-bold text-sm bg-[#FEC00B] text-[#1a1a2e] px-4 py-2 rounded-full shadow-sm">
                    {page} / {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-full w-11 h-11 p-0 border-2"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    data-testid="mobile-btn-next-page"
                  >
                    {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── DESKTOP LAYOUT ── unchanged */}
      <div className="hidden md:block">
        <div className="relative overflow-hidden bg-white dark:bg-card border-b-2 border-border">
          <div className={`absolute top-0 w-2 h-full bg-[#EE4C9F] ${isRtl ? 'right-0' : 'left-0'}`} />
          <div className={`absolute top-0 w-2 h-full bg-[#01BCF3] ${isRtl ? 'right-2' : 'left-2'}`} />
          <div className={`absolute top-0 w-2 h-full bg-[#FEC00B] ${isRtl ? 'right-4' : 'left-4'}`} />
          <div className="container mx-auto px-6 py-8 md:py-10 ps-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <p className="font-display text-lg md:text-2xl font-semibold text-[#EE4C9F] leading-snug">
                  {t("catalog.tagline1")}
                </p>
                <p className="font-sans text-sm md:text-base text-muted-foreground mt-1 font-medium">
                  {t("catalog.tagline2")}
                </p>
              </div>
              <div className="relative w-full md:w-96">
                <div className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-4' : 'left-0 pl-4'} flex items-center pointer-events-none`}>
                  <Search className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  type="search"
                  className={`${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} h-12 rounded-2xl border-2 bg-background focus-visible:ring-2 focus-visible:ring-[#FEC00B] font-sans`}
                  placeholder={t("catalog.search")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  data-testid="input-search"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 md:py-10">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} index={i} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-white dark:bg-card rounded-3xl border-2 border-dashed border-border">
              <div className="bg-[#FEC00B]/10 p-5 rounded-full mb-4">
                <PackageSearch className="h-12 w-12 text-[#FEC00B]" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">{t("catalog.noResults")}</h2>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {paginatedProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-12">
                  <Button
                    variant="outline"
                    className="rounded-full w-12 h-12 p-0 border-2 font-bold"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    data-testid="btn-prev-page"
                  >
                    {isRtl ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                  </Button>
                  <div className="font-display font-bold text-base bg-[#FEC00B] text-[#1a1a2e] px-5 py-2 rounded-full shadow-sm">
                    {page} / {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-full w-12 h-12 p-0 border-2 font-bold"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    data-testid="btn-next-page"
                  >
                    {isRtl ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
