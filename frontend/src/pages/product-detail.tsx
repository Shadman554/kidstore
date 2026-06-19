import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { getProducts, Product, formatPrice, getFirstImage } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Package, Tag, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product-card";
import { getWhatsAppNumber } from "@/lib/config";
import { useSiteSettings } from "@/lib/use-site-settings";
import { colorForText } from "@/lib/site-settings";

function openWhatsApp(productName: string, priceSingle: number, currency: import("@/lib/store").Currency = "USD") {
  const message = encodeURIComponent(
    `Hi! I'm interested in ordering: ${productName} (${formatPrice(priceSingle, currency)})`
  );
  window.open(`https://wa.me/${getWhatsAppNumber()}?text=${message}`, "_blank");
}

export default function ProductDetail() {
  const [, params] = useRoute("/products/:id");
  const id = params?.id;
  const { t, isRtl } = useI18n();
  const { cardColors } = useSiteSettings();

  const [product, setProduct] = useState<Product | null>(null);
  const [productIndex, setProductIndex] = useState(0);
  const [related, setRelated] = useState<Product[]>([]);
  const [activeImg, setActiveImg] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    window.scrollTo(0, 0);
    setLoading(true);
    setActiveImg(0);
    const allProducts = getProducts();
    const idx = allProducts.findIndex((p) => p.id === id);
    const found = allProducts[idx] ?? null;
    setProduct(found);
    setProductIndex(idx >= 0 ? idx : 0);
    if (found) {
      const others = allProducts.filter((p) => p.id !== id);
      for (let i = others.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [others[i], others[j]] = [others[j], others[i]];
      }
      setRelated(others.slice(0, 4));
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-bold mb-4">{t("catalog.noResults")}</h1>
        <Link href="/"><Button className="rounded-2xl">{t("product.backToCatalog")}</Button></Link>
      </div>
    );
  }

  const color = cardColors[productIndex % 3];
  const allImages = product.images && product.images.length > 0
    ? product.images
    : product.imageUrl
    ? [product.imageUrl]
    : [];
  const currentImg = allImages[activeImg] ?? null;

  return (
    <>
      {/* ════════════════════════════════
          MOBILE LAYOUT
      ════════════════════════════════ */}
      <div className="md:hidden min-h-screen flex flex-col">
        {/* Full-bleed image hero */}
        <div className="relative w-full" style={{ height: "52vw", minHeight: 220, maxHeight: 340, background: color.bg }}>
          {currentImg ? (
            <img
              src={currentImg}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-20 h-20 opacity-20" style={{ color: color.text }} />
            </div>
          )}
          {/* Gradient fade into page */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent" />
          {/* Image dots when multiple */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === activeImg ? "w-5 bg-white" : "bg-white/50"}`}
                />
              ))}
            </div>
          )}
          {/* Floating back button */}
          <Link href="/" className="absolute top-4 left-4 rtl:right-4 rtl:left-auto">
            <button
              className="w-10 h-10 rounded-full bg-white/90 dark:bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-lg"
              data-testid="btn-back"
            >
              {isRtl ? <ChevronRight className="h-5 w-5 text-foreground" /> : <ChevronLeft className="h-5 w-5 text-foreground" />}
            </button>
          </Link>
          {/* Price badge floating */}
          <div
            className="absolute top-4 right-4 rtl:left-4 rtl:right-auto px-3 py-1.5 rounded-full font-display font-bold text-sm shadow-lg"
            style={{ background: color.bg, color: color.text }}
          >
            {formatPrice(product.priceSingle, product.currency ?? "USD")}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 px-5 pt-4 pb-28">
          <h1 className="font-display text-2xl font-bold text-foreground leading-tight mb-3">
            {product.name}
          </h1>

          {product.description && (
            <p className="text-sm text-muted-foreground font-sans leading-relaxed mb-5">
              {product.description}
            </p>
          )}

          {product.bulkMinQty && (
            <div className="rounded-2xl p-4 mb-5 border-2" style={{ background: `${color.bg}18`, borderColor: `${color.bg}40` }}>
              <div className="flex items-center gap-2 mb-1">
                <Tag className="h-4 w-4" style={{ color: colorForText(color.bg) }} />
                <span className="font-display font-bold text-sm text-foreground">{t("product.bulkPrice")}</span>
              </div>
              <p className="text-xs text-muted-foreground font-semibold mb-2">
                {t("product.bulkMinQty", { qty: product.bulkMinQty })}
              </p>
              <span
                className="font-display font-bold text-xl"
                style={{ color: colorForText(color.bg) }}
              >
                {formatPrice(product.priceBulk, product.currency ?? "USD")}
              </span>
            </div>
          )}

          {/* Related products */}
          {related.length > 0 && (
            <div className="mt-4">
              <h2 className="font-display font-bold text-base text-foreground mb-3">{t("product.related")}</h2>
              <div className="grid grid-cols-2 gap-3">
                {related.slice(0, 4).map((p, i) => (
                  <div key={p.id} className="min-h-[180px]">
                    <ProductCard product={p} index={i} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky bottom action bar */}
        <div className="fixed bottom-16 left-0 right-0 z-40 px-5 pb-3 pt-3 bg-background/95 backdrop-blur-sm border-t border-border">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="text-xs text-muted-foreground font-semibold">{t("product.singlePrice")}</div>
              <div
                className="font-display font-bold text-2xl leading-none"
                style={{ color: colorForText(color.bg) }}
              >
                {formatPrice(product.priceSingle, product.currency ?? "USD")}
              </div>
            </div>
            <Button
              size="lg"
              onClick={() => openWhatsApp(product.name, product.priceSingle, product.currency ?? "USD")}
              className="flex-1 rounded-2xl h-12 font-display font-bold text-base border-0 shadow-md flex items-center gap-2"
              style={{ background: "#25D366", color: "#fff" }}
              data-testid="btn-buy-now"
            >
              <ShoppingBag className="w-5 h-5" />
              {t("product.orderWhatsApp")}
            </Button>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════
          DESKTOP LAYOUT
      ════════════════════════════════ */}
      <div className="hidden md:block container mx-auto px-4 py-8 md:py-12">
        <Link href="/" className="inline-flex mb-6">
          <Button variant="ghost" className="rounded-xl hover:bg-muted font-medium text-muted-foreground" data-testid="btn-back-desktop">
            {isRtl ? <ArrowRight className="mr-2 h-4 w-4" /> : <ArrowLeft className="mr-2 h-4 w-4" />}
            {t("product.backToCatalog")}
          </Button>
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-16">
          <div className="flex flex-col gap-3">
            <div
              className="rounded-3xl overflow-hidden shadow-sm aspect-square max-h-[520px] flex items-center justify-center"
              style={{ background: color.bg }}
            >
              {currentImg ? (
                <img src={currentImg} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-4 opacity-30">
                  <Package className="w-24 h-24" style={{ color: color.text }} />
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === activeImg ? "border-foreground shadow-md scale-105" : "border-border opacity-60 hover:opacity-100"}`}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              {product.name}
            </h1>
            <div className="mb-8">
              <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">
                {t("product.singlePrice")}
              </div>
              <div
                className="font-display text-5xl font-bold"
                style={{ color: colorForText(color.bg) }}
              >
                {formatPrice(product.priceSingle, product.currency ?? "USD")}
              </div>
            </div>

            {product.description && (
              <p className="text-lg leading-relaxed text-muted-foreground mb-8">
                {product.description}
              </p>
            )}

            {product.bulkMinQty && (
              <div className="rounded-2xl p-6 mt-auto border-2" style={{ background: `${color.bg}18`, borderColor: `${color.bg}40` }}>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl hidden sm:block" style={{ background: color.bg, color: color.text }}>
                    <Tag className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xl text-foreground mb-1 flex items-center gap-2">
                      {t("product.bulkPrice")}
                      <Badge className="text-xs" style={{ background: color.bg, color: color.text, border: "none" }}>
                        Sale
                      </Badge>
                    </h3>
                    <p className="text-muted-foreground mb-3 font-medium">
                      {t("product.bulkMinQty", { qty: product.bulkMinQty })}
                    </p>
                    <div
                      className="font-display text-3xl font-bold"
                      style={{ color: colorForText(color.bg) }}
                    >
                      {formatPrice(product.priceBulk, product.currency ?? "USD")}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Button
              size="lg"
              onClick={() => openWhatsApp(product.name, product.priceSingle, product.currency ?? "USD")}
              className="mt-6 rounded-2xl h-14 text-lg font-display font-bold shadow-md hover:shadow-lg transition-shadow border-0 flex items-center gap-2"
              style={{ background: "#25D366", color: "#fff" }}
              data-testid="btn-buy-now-desktop"
            >
              <ShoppingBag className="w-5 h-5" />
              {t("product.orderWhatsApp")}
            </Button>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-16 pt-16 border-t-2 border-border">
            <h2 className="font-display text-2xl font-bold mb-8 text-foreground">
              {t("product.related")}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
