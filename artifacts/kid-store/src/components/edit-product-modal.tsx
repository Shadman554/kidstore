import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Product, updateProduct } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MultiImageUpload } from "@/components/image-upload";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  priceSingle: z.coerce.number().min(0.01),
  priceBulk: z.coerce.number().min(0.01),
  bulkMinQty: z.coerce.number().min(2).optional().or(z.literal(0)),
  currency: z.enum(["USD", "IQD"]),
});

type FormValues = z.infer<typeof formSchema>;

interface EditProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditProductModal({ product, isOpen, onClose, onSuccess }: EditProductModalProps) {
  const { t } = useI18n();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      images: [],
      priceSingle: 0,
      priceBulk: 0,
      bulkMinQty: 0,
      currency: "USD",
    },
  });

  const selectedCurrency = form.watch("currency");

  useEffect(() => {
    if (isOpen && product) {
      const existingImages =
        product.images && product.images.length > 0
          ? product.images
          : product.imageUrl
          ? [product.imageUrl]
          : [];
      form.reset({
        name: product.name,
        description: product.description || "",
        images: existingImages,
        priceSingle: product.priceSingle,
        priceBulk: product.priceBulk,
        bulkMinQty: product.bulkMinQty || 0,
        currency: product.currency ?? "USD",
      });
    }
  }, [isOpen, product, form]);

  const onSubmit = (data: FormValues) => {
    const payload = {
      ...data,
      images: data.images && data.images.length > 0 ? data.images : undefined,
      imageUrl: undefined,
      bulkMinQty: data.bulkMinQty || undefined,
    };

    updateProduct(product.id, payload);
    onSuccess();
    onClose();
    toast({
      title: t("toast.updated"),
      variant: "default",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{t("admin.editProduct")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 overflow-y-auto flex-1 pr-1">
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
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <MultiImageUpload
                      values={field.value ?? []}
                      onChange={field.onChange}
                      label={t("form.imageUrl")}
                    />
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
            <Button type="submit" className="w-full rounded-xl font-bold mt-4" data-testid="btn-submit-edit">
              {t("form.save")}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
