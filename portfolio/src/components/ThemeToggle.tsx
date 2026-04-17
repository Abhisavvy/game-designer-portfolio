"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ] as const;

  const currentTheme = themes.find(t => t.value === theme) || themes[2];
  const CurrentIcon = currentTheme.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium
                   bg-zinc-100 text-zinc-900 hover:bg-zinc-200
                   dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700
                   transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400"
        aria-label="Toggle theme"
      >
        <CurrentIcon className="w-4 h-4" />
        <span className="hidden sm:inline">{currentTheme.label}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 py-2 w-36 bg-white dark:bg-zinc-800 
                        rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 z-50">
          {themes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => {
                setTheme(value);
                setIsOpen(false);
              }}
              className={`w-full flex items-center space-x-2 px-4 py-2 text-sm
                         hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors
                         ${theme === value ? 'text-orange-600 dark:text-orange-400' : 'text-zinc-900 dark:text-zinc-100'}`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              {theme === value && (
                <span className="ml-auto text-orange-600 dark:text-orange-400">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
      
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

/**
 * Simple theme toggle button (cycles through themes)
 */
export function SimpleThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const handleToggle = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    if (theme === 'light') return Sun;
    if (theme === 'dark') return Moon;
    return Monitor;
  };

  const Icon = getIcon();

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-lg text-white/90 hover:text-white hover:bg-white/15 
                 focus:text-white focus:bg-white/20 transition-all duration-200
                 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 
                 focus:ring-offset-orange-600"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} theme`}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}