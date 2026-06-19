import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";

interface MultiImageUploadProps {
  values: string[];
  onChange: (values: string[]) => void;
  label?: string;
}

export function MultiImageUpload({ values: valuesProp, onChange, label }: MultiImageUploadProps) {
  const values = Array.isArray(valuesProp) ? valuesProp : [];
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    let loaded = 0;
    const results: string[] = [];
    files.forEach((file, i) => {
      const reader = new FileReader();
      reader.onload = () => {
        results[i] = reader.result as string;
        loaded++;
        if (loaded === files.length) {
          onChange([...values, ...results]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleRemove = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="text-sm font-medium leading-none">{label}</div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="grid grid-cols-3 gap-2">
        {values.map((src, i) => (
          <div key={i} className="relative rounded-xl overflow-hidden border-2 border-border aspect-square group">
            <img src={src} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={(e) => handleRemove(i, e)}
              className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary"
        >
          <ImagePlus className="w-6 h-6" />
          <span className="text-xs font-semibold">Add</span>
        </button>
      </div>
    </div>
  );
}

/* ── legacy single-image shim (kept for any other usage) ── */
interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label }: ImageUploadProps) {
  return (
    <MultiImageUpload
      values={value ? [value] : []}
      onChange={(vals) => onChange(vals[0] ?? "")}
      label={label}
    />
  );
}
