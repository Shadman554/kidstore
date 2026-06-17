import { motion } from "framer-motion";
import { Link } from "wouter";
import { Product } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";

interface ProductCardProps {
  product: Product;
  index: number;
}

const CARD_COLORS = [
  { bg: "#FEC00B", text: "#1a1a2e" },
  { bg: "#01BCF3", text: "#ffffff" },
  { bg: "#EE4C9F", text: "#ffffff" },
];

export function ProductCard({ product, index }: ProductCardProps) {
  const { t, isRtl } = useI18n();
  const color = CARD_COLORS[index % 3];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay: index * 0.07, ease: "easeOut" }}
      className="h-full"
    >
      {/* ── MOBILE CARD ── app-style: image dominant, info overlay */}
      <Link href={`/products/${product.id}`} className="block md:hidden h-full" data-testid={`btn-view-mobile-${product.id}`}>
        <div className="relative rounded-3xl overflow-hidden shadow-lg active:scale-95 transition-transform duration-150 h-full min-h-[220px]">
          {/* Image or color background */}
          <div className="absolute inset-0" style={{ background: color.bg }}>
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            )}
            {!product.imageUrl && (
              <div
                className="w-full h-full flex items-center justify-center text-5xl font-display font-bold opacity-30"
                style={{ color: color.text }}
              >
                {product.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Bottom gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          {/* Price badge — top right */}
          <div
            className="absolute top-3 right-3 rtl:left-3 rtl:right-auto px-2.5 py-1 rounded-full text-xs font-display font-bold shadow-lg"
            style={{ background: color.bg, color: color.text }}
          >
            ${product.priceSingle.toFixed(2)}
          </div>

          {/* Info at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-white font-display font-bold text-sm leading-snug line-clamp-2 drop-shadow">
              {product.name}
            </p>
            {product.bulkMinQty && (
              <p className="text-white/70 text-[10px] font-semibold mt-0.5">
                {t("product.bulkPrice")}: ${product.priceBulk.toFixed(2)}
              </p>
            )}
          </div>
        </div>
      </Link>

      {/* ── DESKTOP CARD ── original design */}
      <div className="hidden md:flex overflow-hidden flex-col h-full rounded-3xl border-0 shadow-md hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 bg-white dark:bg-card">
        <div
          className="relative overflow-hidden"
          style={{ background: color.bg }}
        >
          <div className="aspect-[4/3] relative">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-4xl font-display font-bold"
                style={{ color: color.text }}
              >
                {product.name.charAt(0)}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col gap-2">
          <h3 className="font-display font-semibold text-base leading-snug line-clamp-2 text-foreground" title={product.name}>
            {product.name}
          </h3>
          <div className="mt-auto pt-2 flex items-end justify-between gap-2">
            <div>
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{t("product.singlePrice")}</div>
              <div
                className="text-2xl font-display font-bold"
                style={{ color: color.bg === "#FEC00B" ? "#c49200" : color.bg }}
              >
                ${product.priceSingle.toFixed(2)}
              </div>
            </div>
            {product.bulkMinQty && (
              <div className="text-right">
                <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{t("product.bulkPrice")}</div>
                <div className="text-sm font-bold text-muted-foreground">${product.priceBulk.toFixed(2)}</div>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 pb-4">
          <Link href={`/products/${product.id}`} className="w-full block">
            <Button
              className="w-full rounded-2xl font-display font-bold text-sm py-5 border-0 shadow-sm transition-all flex items-center justify-center gap-2"
              style={{ background: color.bg, color: color.text }}
              data-testid={`btn-view-${product.id}`}
            >
              {t("product.viewDetails")}
              {isRtl ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
