import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSiteSettings } from "@/lib/site-settings-context";
import { FONT_PRESETS, FontPreset } from "@/lib/site-settings";
import { useI18n, getDefaultTranslation, Language } from "@/lib/i18n";
import { RotateCcw } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const TEXT_SECTIONS = [
  {
    title: "Homepage",
    keys: [
      { key: "catalog.tagline1", label: "Main Tagline" },
      { key: "catalog.tagline2", label: "Sub Tagline" },
      { key: "catalog.search", label: "Search Placeholder" },
      { key: "catalog.noResults", label: "No Results Text" },
      { key: "app.name", label: "Store Name" },
    ],
  },
  {
    title: "Products",
    keys: [
      { key: "product.singlePrice", label: "Single Price Label" },
      { key: "product.bulkPrice", label: "Bulk Price Label" },
      { key: "product.viewDetails", label: "View Details Button" },
      { key: "product.backToCatalog", label: "Back Button" },
      { key: "product.related", label: "Related Products Title" },
      { key: "product.orderWhatsApp", label: "WhatsApp Button Text" },
    ],
  },
  {
    title: "Navigation",
    keys: [
      { key: "nav.catalog", label: "Catalog Tab" },
      { key: "nav.admin", label: "Admin Tab" },
    ],
  },
];

const COLOR_LABELS = ["Color 1 (Yellow)", "Color 2 (Blue)", "Color 3 (Pink)"];
const COLOR_KEYS = ["color1", "color2", "color3"] as const;

export function SiteSettingsModal({ open, onClose }: Props) {
  const { settings, update } = useSiteSettings();
  const { lang } = useI18n();
  const [editLang, setEditLang] = useState<Language>(lang as Language);

  const overridesForLang = settings.textOverrides[editLang] ?? {};

  const handleTextChange = (key: string, value: string) => {
    const updated = {
      ...settings.textOverrides,
      [editLang]: {
        ...overridesForLang,
        [key]: value,
      },
    };
    update({ textOverrides: updated });
  };

  const handleTextClear = (key: string) => {
    const updated = { ...overridesForLang };
    delete updated[key];
    update({
      textOverrides: { ...settings.textOverrides, [editLang]: updated },
    });
  };

  const resetColors = () => {
    update({ color1: "#FEC00B", color2: "#01BCF3", color3: "#EE4C9F" });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[540px] rounded-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Site Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="appearance" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="rounded-2xl mb-4 shrink-0">
            <TabsTrigger value="appearance" className="rounded-xl text-sm font-bold">Appearance</TabsTrigger>
            <TabsTrigger value="text" className="rounded-xl text-sm font-bold">Text</TabsTrigger>
          </TabsList>

          {/* ── APPEARANCE TAB ── */}
          <TabsContent value="appearance" className="overflow-y-auto flex-1 space-y-6 pr-1">
            {/* Colors */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Brand Colors</div>
                <button
                  onClick={resetColors}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {COLOR_KEYS.map((key, i) => (
                  <label key={key} className="cursor-pointer">
                    <div
                      className="w-full h-16 rounded-2xl border-2 border-border mb-2 overflow-hidden flex items-center justify-center relative group"
                      style={{ background: settings[key] }}
                    >
                      <input
                        type="color"
                        value={settings[key]}
                        onChange={(e) => update({ [key]: e.target.value })}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      />
                      <span className="text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 text-white px-2 py-0.5 rounded-full">
                        Pick
                      </span>
                    </div>
                    <div className="text-xs text-center text-muted-foreground font-medium">{COLOR_LABELS[i]}</div>
                    <div className="text-xs text-center font-mono text-foreground">{settings[key].toUpperCase()}</div>
                  </label>
                ))}
              </div>
            </div>

            {/* Font */}
            <div>
              <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Font</div>
              <div className="grid grid-cols-1 gap-2">
                {(Object.entries(FONT_PRESETS) as [FontPreset, typeof FONT_PRESETS[FontPreset]][]).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => update({ font: key })}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl border-2 transition-all text-left ${
                      settings.font === key
                        ? "border-foreground bg-foreground/5 font-bold"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <span className="text-sm font-semibold">{preset.label}</span>
                    {settings.font === key && (
                      <span className="text-xs bg-foreground text-background px-2 py-0.5 rounded-full font-bold">Active</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ── TEXT TAB ── */}
          <TabsContent value="text" className="overflow-y-auto flex-1 space-y-5 pr-1">
            {/* Language selector */}
            <div>
              <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Editing language</div>
              <div className="flex rounded-xl border-2 overflow-hidden">
                {(["EN", "AR", "KU"] as Language[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setEditLang(l)}
                    className={`flex-1 py-2 text-sm font-bold transition-colors ${
                      editLang === l
                        ? "bg-foreground text-background"
                        : "bg-background text-muted-foreground hover:bg-muted"
                    } ${l !== "EN" ? "border-l-2" : ""}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {TEXT_SECTIONS.map((section) => (
              <div key={section.title}>
                <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">{section.title}</div>
                <div className="space-y-2">
                  {section.keys.map(({ key, label }) => {
                    const current = overridesForLang[key] ?? "";
                    const placeholder = getDefaultTranslation(key, editLang);
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="text-xs text-muted-foreground mb-1 font-medium">{label}</div>
                          <Input
                            className="rounded-xl border-2 text-sm h-9"
                            value={current}
                            onChange={(e) => handleTextChange(key, e.target.value)}
                            placeholder={placeholder}
                          />
                        </div>
                        {current && (
                          <button
                            onClick={() => handleTextClear(key)}
                            className="mt-5 p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
                            title="Reset to default"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
