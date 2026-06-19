import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Language = "EN" | "AR" | "KU";

type Translations = Record<string, string>;

const translations: Record<Language, Translations> = {
  EN: {
    "app.name": "WAW",
    "nav.catalog": "Catalog",
    "nav.admin": "Admin",
    "catalog.search": "Search products...",
    "catalog.noResults": "No products found",
    "product.singlePrice": "Single Price",
    "product.bulkPrice": "Bulk Price",
    "product.bulkMinQty": "Min. {qty} units",
    "product.viewDetails": "View Details",
    "product.backToCatalog": "Back to Catalog",
    "product.orderWhatsApp": "Order on WhatsApp",
    "admin.title": "Admin Dashboard",
    "admin.addProduct": "Add Product",
    "admin.editProduct": "Edit Product",
    "admin.deleteProduct": "Delete",
    "admin.totalProducts": "Total Products",
    "admin.avgSinglePrice": "Avg. Single Price",
    "admin.avgBulkPrice": "Avg. Bulk Price",
    "admin.whatsappNumber": "WhatsApp Number",
    "admin.whatsappNumberHint": "Include country code, no + sign (e.g. 9647501234567)",
    "form.name": "Name",
    "form.description": "Description",
    "form.imageUrl": "Image URL",
    "form.priceSingle": "Single Price",
    "form.priceBulk": "Bulk Price",
    "form.bulkMinQty": "Min. Bulk Qty",
    "form.currency": "Currency",
    "form.submit": "Add Product",
    "form.save": "Save Changes",
    "toast.added": "Product added!",
    "toast.updated": "Product updated!",
    "toast.deleted": "Product deleted!",
    "toast.whatsappSaved": "WhatsApp number saved!",
    "general.next": "Next",
    "general.prev": "Previous",
    "product.related": "Related Products",
    "admin.actions": "Actions",
    "admin.confirmDelete": "Are you sure you want to delete this product?",
    "admin.cancel": "Cancel",
    "catalog.tagline1": "Find your child's favorite toy",
    "catalog.tagline2": "Quality products at the best prices",
  },
  AR: {
    "app.name": "متجر الأطفال",
    "nav.catalog": "الكتالوج",
    "nav.admin": "الإدارة",
    "catalog.search": "ابحث عن منتجات...",
    "catalog.noResults": "لا توجد منتجات",
    "product.singlePrice": "سعر المفرد",
    "product.bulkPrice": "سعر الجملة",
    "product.bulkMinQty": "الحد الأدنى {qty} وحدة",
    "product.viewDetails": "عرض التفاصيل",
    "product.backToCatalog": "العودة إلى الكتالوج",
    "product.orderWhatsApp": "اطلب عبر واتساب",
    "admin.title": "لوحة التحكم",
    "admin.addProduct": "إضافة منتج",
    "admin.editProduct": "تعديل المنتج",
    "admin.deleteProduct": "حذف",
    "admin.totalProducts": "إجمالي المنتجات",
    "admin.avgSinglePrice": "متوسط سعر المفرد",
    "admin.avgBulkPrice": "متوسط سعر الجملة",
    "admin.whatsappNumber": "رقم واتساب",
    "admin.whatsappNumberHint": "أدخل رمز الدولة بدون + (مثال: 9647501234567)",
    "form.name": "الاسم",
    "form.description": "الوصف",
    "form.imageUrl": "رابط الصورة",
    "form.priceSingle": "سعر المفرد",
    "form.priceBulk": "سعر الجملة",
    "form.bulkMinQty": "الحد الأدنى للجملة",
    "form.currency": "العملة",
    "form.submit": "إضافة منتج",
    "form.save": "حفظ التغييرات",
    "toast.added": "تمت إضافة المنتج!",
    "toast.updated": "تم تحديث المنتج!",
    "toast.deleted": "تم حذف المنتج!",
    "toast.whatsappSaved": "تم حفظ رقم واتساب!",
    "general.next": "التالي",
    "general.prev": "السابق",
    "product.related": "منتجات ذات صلة",
    "admin.actions": "إجراءات",
    "admin.confirmDelete": "هل أنت متأكد أنك تريد حذف هذا المنتج؟",
    "admin.cancel": "إلغاء",
    "catalog.tagline1": "اكتشف لعبة طفلك المفضلة",
    "catalog.tagline2": "منتجات عالية الجودة بأسعار مناسبة",
  },
  KU: {
    "app.name": "فرۆشگای منداڵان",
    "nav.catalog": "کاتالۆگ",
    "nav.admin": "بەڕێوەبردن",
    "catalog.search": "بەدوای بەرهەمەکان بگەڕێ...",
    "catalog.noResults": "هیچ بەرهەمێک نەدۆزرایەوە",
    "product.singlePrice": "نرخی تاک",
    "product.bulkPrice": "نرخی کۆ",
    "product.bulkMinQty": "لانیکەم {qty} دانە",
    "product.viewDetails": "وردەکاری ببینە",
    "product.backToCatalog": "گەڕانەوە بۆ کاتالۆگ",
    "product.orderWhatsApp": "داواکاری لە واتساپ",
    "admin.title": "داشبۆردی بەڕێوەبردن",
    "admin.addProduct": "بەرهەم زیادبکە",
    "admin.editProduct": "بەرهەم دەستکاری بکە",
    "admin.deleteProduct": "بسڕەوە",
    "admin.totalProducts": "کۆی بەرهەمەکان",
    "admin.avgSinglePrice": "تێکڕای نرخی تاکەکە",
    "admin.avgBulkPrice": "تێکڕای نرخی کۆ",
    "admin.whatsappNumber": "ژمارەی واتساپ",
    "admin.whatsappNumberHint": "کۆدی وڵات تێبنووسە بەبێ + (نموونە: 9647501234567)",
    "form.name": "ناو",
    "form.description": "وەسف",
    "form.imageUrl": "بەستەری وێنە",
    "form.priceSingle": "نرخی تاک",
    "form.priceBulk": "نرخی کۆ",
    "form.bulkMinQty": "کەمترین عەدەد",
    "form.currency": "دراو",
    "form.submit": "بەرهەم زیادبکە",
    "form.save": "گۆڕانکاریەکان پاشەکەوت بکە",
    "toast.added": "بەرهەم زیاد کرا!",
    "toast.updated": "بەرهەم نوێکرایەوە!",
    "toast.deleted": "بەرهەم سڕایەوە!",
    "toast.whatsappSaved": "ژمارەی واتساپ پاشەکەوت کرا!",
    "general.next": "دواتر",
    "general.prev": "پێشتر",
    "product.related": "بەرهەمە پەیوەندیدارەکان",
    "admin.actions": "کردارەکان",
    "admin.confirmDelete": "دڵنیایت دەتەوێت ئەم بەرهەمە بسڕیتەوە؟",
    "admin.cancel": "پاشگەزبونەوە",
    "catalog.tagline1": "یاری دڵخوازی منداڵەکەت بدۆزەرەوە",
    "catalog.tagline2": "یاری باش و کوالێتی بەرز بە نرخێکی گونجاو",
  }
};

let _overrides: Record<string, Record<string, string>> = { EN: {}, AR: {}, KU: {} };
let _refresh: () => void = () => {};

export function setI18nOverrides(overrides: Record<string, Record<string, string>>) {
  _overrides = overrides;
  _refresh();
}

export function getDefaultTranslation(key: string, lang: Language): string {
  return translations[lang]?.[key] ?? key;
}

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isRtl: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem("kid-store-lang");
    return (saved as Language) || "EN";
  });
  const [, setRevision] = useState(0);

  useEffect(() => {
    _refresh = () => setRevision((r) => r + 1);
    return () => { _refresh = () => {}; };
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("kid-store-lang", newLang);
  };

  const isRtl = lang === "AR" || lang === "KU";

  useEffect(() => {
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.lang = lang.toLowerCase();
  }, [lang, isRtl]);

  const t = (key: string, params?: Record<string, string | number>) => {
    const override = _overrides[lang]?.[key];
    let str = override ?? translations[lang]?.[key] ?? key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, String(v));
      });
    }
    return str;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t, isRtl }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
