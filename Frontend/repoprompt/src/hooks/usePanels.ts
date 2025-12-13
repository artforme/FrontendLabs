import { useState, useEffect } from 'react';

export const usePanels = (
    showToast: (message: string, type: 'success' | 'error' | 'info') => void
) => {
    const [blacklist, setBlacklist] = useState<string[]>([]);
    const [allowedlist, setAllowedlist] = useState<string[]>([]);

    useEffect(() => {
        const storedBlacklist = localStorage.getItem('blacklist');
        const storedAllowedlist = localStorage.getItem('allowedlist');
        if (storedBlacklist) setBlacklist(JSON.parse(storedBlacklist));
        if (storedAllowedlist) setAllowedlist(JSON.parse(storedAllowedlist));
    }, []);

    useEffect(() => {
        localStorage.setItem('blacklist', JSON.stringify(blacklist));
        localStorage.setItem('allowedlist', JSON.stringify(allowedlist));
    }, [blacklist, allowedlist]);

    const addToBlacklist = (item: string) => {
        if (item && !blacklist.includes(item)) {
            // Удаляем из allowedlist если есть
            if (allowedlist.includes(item)) {
                setAllowedlist(prev => prev.filter(i => i !== item));
            }
            setBlacklist(prev => [...prev, item]);
            showToast(`Добавлено в blacklist: ${item}`, 'info');
        }
    };

    const removeFromBlacklist = (index: number) => {
        setBlacklist(prev => prev.filter((_, i) => i !== index));
        showToast('Удалено из blacklist', 'info');
    };

    const addToAllowedlist = (item: string) => {
        if (item && !allowedlist.includes(item)) {
            // Удаляем из blacklist если есть
            if (blacklist.includes(item)) {
                setBlacklist(prev => prev.filter(i => i !== item));
            }
            setAllowedlist(prev => [...prev, item]);
            showToast(`Добавлено в whitelist: ${item}`, 'info');
        }
    };

    const removeFromAllowedlist = (index: number) => {
        setAllowedlist(prev => prev.filter((_, i) => i !== index));
        showToast('Удалено из whitelist', 'info');
    };

    return {
        blacklist,
        allowedlist,
        addToBlacklist,
        removeFromBlacklist,
        addToAllowedlist,
        removeFromAllowedlist,
    };
};