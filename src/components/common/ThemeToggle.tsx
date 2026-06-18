import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-[9999] p-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
      aria-label="Toggle Theme"
    >
      {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
    </button>
  );
}
