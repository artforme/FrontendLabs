import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const ThemeSwitcher = () => {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dark]);

  return (
    <button 
      onClick={() => setDark(!dark)} 
      className="theme-switcher"
      style={{ marginLeft: '0.5rem' }}
    >
      {dark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

export default ThemeSwitcher;