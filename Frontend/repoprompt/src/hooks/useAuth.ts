import { useState, useEffect } from 'react';
import type { User } from '../types';

// Обновили сигнатуру: добавлен аргумент showToast
export const useAuth = (showToast: (message: string, type: 'success' | 'error' | 'info') => void) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            setIsLoggedIn(true);
        }
    }, []);

    const login = (email: string, password: string) => {
        if (!email || !password || password.length < 6) {
            showToast('Неверные данные (пароль мин. 6 символов)', 'error');
            return;
        }
        const mockUser: User = { name: email.split('@')[0], email };
        localStorage.setItem('user', JSON.stringify(mockUser));
        setUser(mockUser);
        setIsLoggedIn(true);
        showToast('Вход выполнен успешно', 'success');
    };

    const register = (name: string, email: string, password: string, confirm: string) => {
        if (!name || !email || password !== confirm || password.length < 6) {
            showToast('Ошибка регистрации (проверьте пароли)', 'error');
            return;
        }
        const mockUser: User = { name, email };
        localStorage.setItem('user', JSON.stringify(mockUser));
        setUser(mockUser);
        setIsLoggedIn(true);
        showToast('Регистрация выполнена успешно', 'success');
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
        setIsLoggedIn(false);
        showToast('Вы вышли из аккаунта', 'info');
    };

    return {
        isLoggedIn,
        user,
        login,
        register,
        logout,
    };
};