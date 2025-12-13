import { Moon, Sun, Clock, LogOut } from 'lucide-react';
import type { User } from '../types';

interface HeaderProps {
    auth: {
        isLoggedIn: boolean;
        user: User | null;
        logout: () => void;
    };
    theme: string;
    toggleTheme: () => void;
    historyCount: number;
    openModal: (modalName: 'login' | 'register' | 'history') => void;
}

export const Header = ({ auth, theme, toggleTheme, historyCount, openModal }: HeaderProps) => {
    return (
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
            <div className="max-w-[1800px] mx-auto px-4 py-3 flex items-center justify-between">
                {/* Логотип */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">RepoPrompt</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-500">ZIP → LLM-ready TXT</p>
                    </div>
                </div>

                {/* Правая часть */}
                <div className="flex items-center gap-4">
                    {/* Кнопка Истории */}
                    <button
                        onClick={() => openModal('history')}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-200 transition-colors"
                    >
                        <Clock className="w-5 h-5" />
                        <span className="text-sm hidden md:inline">История</span>
                        {historyCount > 0 && (
                            <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {historyCount}
                            </span>
                        )}
                    </button>

                    {/* Переключатель темы */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
                    >
                        {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </button>

                    {/* Блок авторизации */}
                    {!auth.isLoggedIn ? (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => openModal('login')}
                                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                Войти
                            </button>
                            <button
                                onClick={() => openModal('register')}
                                className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                            >
                                Регистрация
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                                    {auth.user?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <span className="text-gray-700 dark:text-gray-200">{auth.user?.name}</span>
                            </div>
                            <button
                                onClick={auth.logout}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};