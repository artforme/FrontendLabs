import { useState, useEffect, useCallback } from 'react';

export const useTheme = () => {
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    const applyTheme = useCallback((newTheme: 'dark' | 'light') => {
        const root = document.documentElement;

        // Удаляем оба класса
        root.classList.remove('dark', 'light');

        // Добавляем нужный
        root.classList.add(newTheme);

        // Также устанавливаем data-theme для совместимости
        root.setAttribute('data-theme', newTheme);

        console.log('Theme applied:', newTheme, 'Classes:', root.classList.toString());
    }, []);

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
        const initialTheme = storedTheme || 'dark';
        setTheme(initialTheme);
        applyTheme(initialTheme);
    }, [applyTheme]);

    const toggleTheme = useCallback(() => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    }, [theme, applyTheme]);

    return { theme, toggleTheme };
};