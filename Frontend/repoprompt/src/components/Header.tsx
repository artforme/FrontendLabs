import { Moon, Sun, Clock, LogOut } from 'lucide-react';
import type { User } from '../types';

// 1. Описываем, что компонент ожидает получить
interface HeaderProps {
    auth: {
        isLoggedIn: boolean;
        user: User | null;
        logout: () => void;
    };
    theme: string;
    toggleTheme: () => void;
    historyCount: number;
    openModal: (modalName: 'login' | 'register' | 'history') => void; // Типизируем имена модалок
}

// 2. Деструктурируем пропсы в аргументах функции
export const Header = ({ auth, theme, toggleTheme, historyCount, openModal }: HeaderProps) => {

    return (
        <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-40">
            <div className="max-w-[1800px] mx-auto px-4 py-3 flex items-center justify-between">
                {/* Логотип (без изменений) */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">RepoPrompt</h1>
                        <p className="text-xs text-gray-500">ZIP → LLM-ready TXT</p>
                    </div>
                </div>

                {/* Правая часть */}
                <div className="flex items-center gap-4">
                    {/* Кнопка Истории */}
                    <button onClick={() => openModal('history')} className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        <span className="text-sm hidden md:inline">История</span>
                        {/* Используем пропс historyCount */}
                        <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {historyCount}
                        </span>
                    </button>

                    {/* Переключатель темы */}
                    <button onClick={toggleTheme} className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700">
                        {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </button>

                    {/* Блок авторизации */}
                    {!auth.isLoggedIn ? (
                        <div className="flex items-center gap-2">
                            <button onClick={() => openModal('login')} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white">
                                Войти
                            </button>
                            <button onClick={() => openModal('register')} className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 rounded-lg">
                                Регистрация
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-sm font-bold">U</div>
                                <span>{auth.user?.name}</span>
                            </div>
                            <button onClick={auth.logout}><LogOut className="w-5 h-5" /></button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};