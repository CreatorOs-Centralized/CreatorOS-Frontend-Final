import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const effectiveTheme = theme === "system" ? systemTheme : theme;
  const nextTheme = effectiveTheme === "dark" ? "light" : "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => setTheme(nextTheme)}
      aria-label="Toggle theme"
    >
      {effectiveTheme === "dark" ? "Light" : "Dark"}
    </Button>
  );
}
