import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getProducts, addProduct, deleteProduct, formatPrice, Product } from "@/lib/store";
import { getWhatsAppNumber, setWhatsAppNumber } from "@/lib/config";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";

import { EditProductModal } from "@/components/edit-product-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Package, Trash2, Edit2, DollarSign, TrendingDown, Phone, Check } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  priceSingle: z.coerce.number().min(0.01),
  priceBulk: z.coerce.number().min(0.01),
  bulkMinQty: z.coerce.number().min(2).optional().or(z.literal(0)),
  currency: z.enum(["USD", "IQD"]),
});

type FormValues = z.infer<typeof formSchema>;

export default function Admin() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [whatsappInput, setWhatsappInput] = useState(() => getWhatsAppNumber());
  const [whatsappSaved, setWhatsappSaved] = useState(false);

  const loadProducts = () => {
    setProducts(getProducts());
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
      priceSingle: 0,
      priceBulk: 0,
      bulkMinQty: 0,
      currency: "USD",
    },
  });

  const selectedCurrency = form.watch("currency");

  const onSubmit = (data: FormValues) => {
    const payload = {
      ...data,
      imageUrl: data.imageUrl || undefined,
      bulkMinQty: data.bulkMinQty || undefined,
    };
    addProduct(payload);
    loadProducts();
    form.reset();
    toast({
      title: t("toast.added"),
      variant: "default",
    });
  };

  const handleDelete = (id: string) => {
    deleteProduct(id);
    loadProducts();
    toast({
      title: t("toast.deleted"),
      variant: "destructive",
    });
  };

  const usdProducts = products.filter((p) => (p.currency ?? "USD") === "USD");
  const iqdProducts = products.filter((p) => (p.currency ?? "USD") === "IQD");

  const avgOf = (arr: Product[], key: "priceSingle" | "priceBulk") =>
    arr.length ? arr.reduce((acc, p) => acc + p[key], 0) / arr.length : null;

  const handleSaveWhatsApp = () => {
    const cleaned = whatsappInput.replace(/\D/g, "");
    if (!cleaned) return;
    setWhatsAppNumber(cleaned);
    setWhatsappInput(cleaned);
    setWhatsappSaved(true);
    setTimeout(() => setWhatsappSaved(false), 2000);
    toast({ title: t("toast.whatsappSaved"), variant: "default" });
  };

  const stats = {
    total: products.length,
    usdAvgSingle: avgOf(usdProducts, "priceSingle"),
    usdAvgBulk: avgOf(usdProducts, "priceBulk"),
    iqdAvgSingle: avgOf(iqdProducts, "priceSingle"),
    iqdAvgBulk: avgOf(iqdProducts, "priceBulk"),
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-3xl md:text-5xl font-black text-primary mb-8 tracking-tight">
        {t("admin.title")}
      </h1>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card className="rounded-3xl border-2 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-primary/10 rounded-2xl text-primary">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <div className="text-sm font-bold text-muted-foreground uppercase">{t("admin.totalProducts")}</div>
              <div className="text-3xl font-black">{stats.total}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-2 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-secondary/10 rounded-2xl text-secondary">
              <DollarSign className="w-8 h-8" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-muted-foreground uppercase">{t("admin.avgSinglePrice")}</div>
              {stats.usdAvgSingle !== null && (
                <div className="text-2xl font-black leading-tight">${stats.usdAvgSingle.toFixed(2)}</div>
              )}
              {stats.iqdAvgSingle !== null && (
                <div className="text-2xl font-black leading-tight">{Math.round(stats.iqdAvgSingle).toLocaleString()} IQD</div>
              )}
              {stats.usdAvgSingle === null && stats.iqdAvgSingle === null && (
                <div className="text-2xl font-black">—</div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-2 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-accent/10 rounded-2xl text-accent">
              <TrendingDown className="w-8 h-8" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-muted-foreground uppercase">{t("admin.avgBulkPrice")}</div>
              {stats.usdAvgBulk !== null && (
                <div className="text-2xl font-black leading-tight">${stats.usdAvgBulk.toFixed(2)}</div>
              )}
              {stats.iqdAvgBulk !== null && (
                <div className="text-2xl font-black leading-tight">{Math.round(stats.iqdAvgBulk).toLocaleString()} IQD</div>
              )}
              {stats.usdAvgBulk === null && stats.iqdAvgBulk === null && (
                <div className="text-2xl font-black">—</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl border-2 shadow-sm mb-8">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-[#25D366]/10 rounded-2xl">
              <Phone className="w-6 h-6 text-[#25D366]" />
            </div>
            <div>
              <div className="font-bold text-base">{t("admin.whatsappNumber")}</div>
              <div className="text-xs text-muted-foreground">{t("admin.whatsappNumberHint")}</div>
            </div>
          </div>
          <div className="flex gap-3">
            <Input
              className="rounded-xl border-2 font-mono text-base flex-1"
              placeholder="e.g. 9647501234567"
              value={whatsappInput}
              onChange={(e) => { setWhatsappInput(e.target.value); setWhatsappSaved(false); }}
              onKeyDown={(e) => e.key === "Enter" && handleSaveWhatsApp()}
            />
            <Button
              onClick={handleSaveWhatsApp}
              className={`rounded-xl font-bold px-5 shrink-0 transition-colors ${whatsappSaved ? "bg-[#25D366] hover:bg-[#25D366]" : ""}`}
            >
              {whatsappSaved ? <Check className="w-4 h-4" /> : t("form.save")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-[1fr_2fr] gap-8">
        <div>
          <Card className="rounded-3xl border-2 shadow-sm sticky top-24">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">{t("admin.addProduct")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.name")}</FormLabel>
                        <FormControl>
                          <Input className="rounded-xl border-2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.description")}</FormLabel>
                        <FormControl>
                          <Textarea className="rounded-xl border-2 resize-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.imageUrl")}</FormLabel>
                        <FormControl>
                          <Input className="rounded-xl border-2" type="url" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.currency")}</FormLabel>
                        <FormControl>
                          <div className="flex rounded-xl border-2 overflow-hidden">
                            <button
                              type="button"
                              onClick={() => field.onChange("USD")}
                              className={`flex-1 py-2 text-sm font-bold transition-colors ${
                                field.value === "USD"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-background text-muted-foreground hover:bg-muted"
                              }`}
                            >
                              $ USD
                            </button>
                            <button
                              type="button"
                              onClick={() => field.onChange("IQD")}
                              className={`flex-1 py-2 text-sm font-bold transition-colors border-l-2 ${
                                field.value === "IQD"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-background text-muted-foreground hover:bg-muted"
                              }`}
                            >
                              IQD
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="priceSingle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("form.priceSingle")} ({selectedCurrency === "IQD" ? "IQD" : "$"})
                          </FormLabel>
                          <FormControl>
                            <Input className="rounded-xl border-2" type="number" step={selectedCurrency === "IQD" ? "1" : "0.01"} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="priceBulk"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("form.priceBulk")} ({selectedCurrency === "IQD" ? "IQD" : "$"})
                          </FormLabel>
                          <FormControl>
                            <Input className="rounded-xl border-2" type="number" step={selectedCurrency === "IQD" ? "1" : "0.01"} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="bulkMinQty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.bulkMinQty")}</FormLabel>
                        <FormControl>
                          <Input className="rounded-xl border-2" type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full rounded-xl font-bold mt-2" data-testid="btn-submit-add">
                    {t("form.submit")}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {products.map((product) => (
            <Card key={product.id} className="rounded-2xl border-2 shadow-sm overflow-hidden flex flex-col sm:flex-row">
              <div className="sm:w-48 h-48 sm:h-auto bg-muted shrink-0">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                    No Image
                  </div>
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h3 className="text-xl font-bold leading-tight">{product.name}</h3>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-xl"
                      onClick={() => setEditingProduct(product)}
                      data-testid={`btn-edit-${product.id}`}
                    >
                      <Edit2 className="h-4 w-4 text-primary" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10" data-testid={`btn-delete-${product.id}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-3xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t("admin.deleteProduct")}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t("admin.confirmDelete")}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">{t("admin.cancel")}</AlertDialogCancel>
                          <AlertDialogAction className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleDelete(product.id)}>
                            {t("admin.deleteProduct")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    (product.currency ?? "USD") === "IQD"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-green-100 text-green-800"
                  }`}>
                    {(product.currency ?? "USD") === "IQD" ? "IQD" : "$ USD"}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-4 mt-auto pt-4">
                  <div>
                    <div className="text-xs font-bold text-muted-foreground uppercase">{t("product.singlePrice")}</div>
                    <div className="text-lg font-black text-foreground">{formatPrice(product.priceSingle, product.currency ?? "USD")}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-muted-foreground uppercase">{t("product.bulkPrice")}</div>
                    <div className="text-lg font-black text-secondary">{formatPrice(product.priceBulk, product.currency ?? "USD")}</div>
                  </div>
                  {product.bulkMinQty && (
                    <div>
                      <div className="text-xs font-bold text-muted-foreground uppercase">Min Qty</div>
                      <div className="text-lg font-black text-foreground">{product.bulkMinQty}</div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
          {products.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              {t("catalog.noResults")}
            </div>
          )}
        </div>
      </div>

      {editingProduct && (
        <EditProductModal 
          product={editingProduct} 
          isOpen={!!editingProduct} 
          onClose={() => setEditingProduct(null)} 
          onSuccess={loadProducts}
        />
      )}
    </div>
  );
}
