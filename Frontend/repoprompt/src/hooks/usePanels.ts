import { useState, useEffect, useCallback } from 'react';

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

    /**
     * Добавляет в blacklist (и удаляет из allowedlist если есть)
     */
    const addToBlacklist = useCallback((item: string) => {
        if (!item) return;

        // Удаляем из allowedlist если есть
        setAllowedlist(prev => prev.filter(i => i !== item));

        // Добавляем в blacklist если ещё нет
        setBlacklist(prev => {
            if (prev.includes(item)) return prev;
            showToast(`Добавлено в blacklist: ${item}`, 'info');
            return [...prev, item];
        });
    }, [showToast]);

    /**
     * Удаляет из blacklist
     */
    const removeFromBlacklist = useCallback((index: number) => {
        setBlacklist(prev => prev.filter((_, i) => i !== index));
    }, []);

    /**
     * Удаляет из blacklist по значению (для использования из дерева)
     */
    const removeFromBlacklistByValue = useCallback((item: string) => {
        setBlacklist(prev => {
            const filtered = prev.filter(i => i !== item);
            if (filtered.length < prev.length) {
                // Что-то удалили — не показываем toast, это автоматическое действие
            }
            return filtered;
        });
    }, []);

    /**
     * Добавляет в allowedlist (и удаляет из blacklist если есть)
     */
    const addToAllowedlist = useCallback((item: string) => {
        if (!item) return;

        // Удаляем из blacklist если есть
        setBlacklist(prev => prev.filter(i => i !== item));

        // Добавляем в allowedlist если ещё нет
        setAllowedlist(prev => {
            if (prev.includes(item)) return prev;
            showToast(`Добавлено в allowedlist: ${item}`, 'info');
            return [...prev, item];
        });
    }, [showToast]);

    /**
     * Удаляет из allowedlist
     */
    const removeFromAllowedlist = useCallback((index: number) => {
        setAllowedlist(prev => prev.filter((_, i) => i !== index));
    }, []);

    /**
     * Удаляет из allowedlist по значению (для использования из дерева)
     */
    const removeFromAllowedlistByValue = useCallback((item: string) => {
        setAllowedlist(prev => prev.filter(i => i !== item));
    }, []);

    return {
        blacklist,
        allowedlist,
        addToBlacklist,
        removeFromBlacklist,
        removeFromBlacklistByValue,
        addToAllowedlist,
        removeFromAllowedlist,
        removeFromAllowedlistByValue,
    };
};