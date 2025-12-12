import { useState, useEffect } from 'react';

export const useTheme = () => {
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme') as 'dark' | 'light';
        if (storedTheme) {
            setTheme(storedTheme);
            document.documentElement.classList.toggle('dark', storedTheme === 'dark');
            document.documentElement.classList.toggle('light', storedTheme === 'light');
        } else {
            // Default dark
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        
        document.documentElement.classList.remove('dark', 'light');
        document.documentElement.classList.add(newTheme);
        
        // Также меняем класс на body для надежности
        document.body.className = newTheme === 'dark' ? 'bg-gray-950 text-gray-100' : 'bg-gray-100 text-gray-900';
    };

    return { theme, toggleTheme };
};