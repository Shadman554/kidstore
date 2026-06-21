import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";
import type { Language } from "@/lib/i18n-core";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import WawLogo from "@assets/WAW_logo_1781717964078.svg";
import { useSecretTap } from "@/hooks/use-secret-tap";
import { useSiteSettings } from "@/lib/use-site-settings";

function KurdistanFlag({ size }: { size: number }) {
  const w = Math.round(size * 1.5);
  return (
    <svg width={w} height={size} viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: 2, display: "inline-block", verticalAlign: "middle" }}>
      <rect width="30" height="6.67" fill="#CE1126"/>
      <rect y="6.67" width="30" height="6.67" fill="#FFFFFF"/>
      <rect y="13.33" width="30" height="6.67" fill="#007A3D"/>
      <circle cx="15" cy="10" r="3.8" fill="#F5D000"/>
      <circle cx="15" cy="10" r="2.2" fill="#007A3D"/>
    </svg>
  );
}

function FlagIcon({ lang, size = 20 }: { lang: Language; size?: number }) {
  if (lang === "EN") return <span style={{ fontSize: size * 0.85, lineHeight: 1 }}>🇺🇸</span>;
  if (lang === "AR") return <span style={{ fontSize: size * 0.85, lineHeight: 1 }}>🇮🇶</span>;
  return <KurdistanFlag size={size} />;
}

export function Navbar() {
  const { lang, setLang, t, isRtl } = useI18n();
  const { theme, setTheme } = useTheme();
  const handleSecretTap = useSecretTap();
  const { settings } = useSiteSettings();

  return (
    <nav
      className="hidden md:block sticky top-0 z-50 w-full bg-white dark:bg-card shadow-md"
      style={{ borderBottom: `4px solid ${settings.color1}` }}
    >
      <div className="container mx-auto flex h-18 items-center px-4 md:px-6 py-2">
        <div className={`flex items-center ${isRtl ? 'ml-auto' : 'mr-auto'}`}>
          <Link href="/" className="flex items-center hover:opacity-90 transition-opacity" data-testid="link-home" onClick={handleSecretTap}>
            <img src={WawLogo} alt="WAW" className="h-10 w-auto" />
          </Link>
        </div>

        <div className={`flex items-center gap-2 md:gap-3 ${isRtl ? 'mr-auto' : 'ml-auto'}`}>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 flex items-center justify-center" style={{ ["--tw-ring-color" as string]: settings.color3 }} data-testid="btn-lang-switcher">
                <FlagIcon lang={lang} size={20} />
                <span className="sr-only">Language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl font-sans font-semibold border-2">
              <DropdownMenuItem onClick={() => setLang("EN")} className={`rounded-xl flex items-center gap-2 ${lang === "EN" ? "font-bold" : ""}`} style={lang === "EN" ? { background: `${settings.color1}33` } : {}}>
                <FlagIcon lang="EN" size={18} /> English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLang("AR")} className={`rounded-xl flex items-center gap-2 ${lang === "AR" ? "font-bold" : ""}`} style={lang === "AR" ? { background: `${settings.color2}33` } : {}}>
                <FlagIcon lang="AR" size={18} /> العربية
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLang("KU")} className={`rounded-xl flex items-center gap-2 ${lang === "KU" ? "font-bold" : ""}`} style={lang === "KU" ? { background: `${settings.color3}33` } : {}}>
                <FlagIcon lang="KU" size={18} /> کوردی
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-9 h-9"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            data-testid="btn-theme-toggle"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" style={{ color: settings.color1 }} />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" style={{ color: settings.color2 }} />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
