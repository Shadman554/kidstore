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

export function MobileHeader() {
  const { lang, setLang } = useI18n();
  const { theme, setTheme } = useTheme();

  return (
    <header className="md:hidden sticky top-0 z-50 bg-white dark:bg-card border-b-4 border-[#FEC00B] flex items-center justify-between px-4 h-14">
      <Link href="/" data-testid="mobile-link-home">
        <img src={WawLogo} alt="WAW" className="h-8 w-auto" />
      </Link>

      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full w-9 h-9" data-testid="mobile-btn-lang">
              <Globe className="h-5 w-5 text-[#EE4C9F]" />
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
          className="rounded-full w-9 h-9"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          data-testid="mobile-btn-theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-[#FEC00B]" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-[#01BCF3]" />
        </Button>
      </div>
    </header>
  );
}
