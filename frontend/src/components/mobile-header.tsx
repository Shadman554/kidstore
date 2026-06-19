import { Link } from "wouter";
import { Globe, Moon, Sun } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import WawLogo from "@assets/WAW_logo_1781717964078.svg";
import { useSecretTap } from "@/hooks/use-secret-tap";
import { useSiteSettings } from "@/lib/use-site-settings";

export function MobileHeader() {
  const { lang, setLang, isRtl } = useI18n();
  const { theme, setTheme } = useTheme();
  const handleSecretTap = useSecretTap();
  const { settings } = useSiteSettings();

  return (
    <header
      className="md:hidden sticky top-0 z-50 bg-white dark:bg-card flex items-center justify-between px-4 h-14"
      style={{ borderBottom: `4px solid ${settings.color1}` }}
    >
      <Link href="/" data-testid="mobile-link-home" onClick={handleSecretTap}>
        <img src={WawLogo} alt="WAW" className="h-8 w-auto" />
      </Link>

      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full w-9 h-9" data-testid="mobile-btn-lang">
              <Globe className="h-5 w-5" style={{ color: settings.color3 }} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isRtl ? "start" : "end"} className="rounded-2xl font-sans font-semibold border-2">
            <DropdownMenuItem onClick={() => setLang("EN")} className={`rounded-xl ${lang === "EN" ? "font-bold" : ""}`} style={lang === "EN" ? { background: `${settings.color1}33` } : {}}>
              English (EN)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLang("AR")} className={`rounded-xl ${lang === "AR" ? "font-bold" : ""}`} style={lang === "AR" ? { background: `${settings.color2}33` } : {}}>
              العربية (AR)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLang("KU")} className={`rounded-xl ${lang === "KU" ? "font-bold" : ""}`} style={lang === "KU" ? { background: `${settings.color3}33` } : {}}>
              کوردی (KU)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full w-9 h-9"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          data-testid="mobile-btn-theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" style={{ color: settings.color1 }} />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" style={{ color: settings.color2 }} />
        </Button>
      </div>
    </header>
  );
}
