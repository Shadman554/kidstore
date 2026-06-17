import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Globe, Moon, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import WawLogo from "@assets/WAW_logo_1781717964078.svg";
import { useSecretTap } from "@/hooks/use-secret-tap";

export function Navbar() {
  const { lang, setLang, t, isRtl } = useI18n();
  const { theme, setTheme } = useTheme();
  const handleSecretTap = useSecretTap();

  return (
    <nav className="hidden md:block sticky top-0 z-50 w-full bg-white dark:bg-card border-b-4 border-[#FEC00B] shadow-md">
      <div className="container mx-auto flex h-18 items-center px-4 md:px-6 py-2">
        <div className={`flex items-center ${isRtl ? 'ml-auto' : 'mr-auto'}`}>
          <Link href="/" className="flex items-center hover:opacity-90 transition-opacity" data-testid="link-home" onClick={handleSecretTap}>
            <img src={WawLogo} alt="WAW" className="h-10 w-auto" />
          </Link>
        </div>

        <div className={`flex items-center gap-2 md:gap-3 ${isRtl ? 'mr-auto' : 'ml-auto'}`}>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 hover:bg-[#EE4C9F]/10" data-testid="btn-lang-switcher">
                <Globe className="h-5 w-5 text-[#EE4C9F]" />
                <span className="sr-only">Language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl font-sans font-semibold border-2">
              <DropdownMenuItem onClick={() => setLang("EN")} className={`rounded-xl ${lang === "EN" ? "bg-[#FEC00B]/20 font-bold" : ""}`}>
                English (EN)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLang("AR")} className={`rounded-xl ${lang === "AR" ? "bg-[#01BCF3]/20 font-bold" : ""}`}>
                العربية (AR)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLang("KU")} className={`rounded-xl ${lang === "KU" ? "bg-[#EE4C9F]/20 font-bold" : ""}`}>
                کوردی (KU)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-9 h-9 hover:bg-[#FEC00B]/10"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            data-testid="btn-theme-toggle"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-[#FEC00B]" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-[#01BCF3]" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
