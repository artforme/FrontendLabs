import { useState } from 'react';
import { X, LogIn } from 'lucide-react';

interface LoginModalProps {
    onClose: () => void;
    onLogin: (email: string, password: string) => void;
}

export const LoginModal = ({ onClose, onLogin }: LoginModalProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // В хуке useAuth добавим логику закрытия модалки, если логин успешен, 
        // или будем передавать onClose в onLogin как колбэк (но лучше просто вызывать onClose здесь после успеха, 
        // для упрощения пока вызовем onLogin, он обновит стейт App и модалка исчезнет, так как App перерендерится)
        // В App.tsx: closeModal вызывается если мы явно меняем activeModal на null.
        // Сейчас onLogin вызывает hideModal внутри useAuth, но useAuth не знает про activeModal в App.tsx.
        // Поэтому:
        onLogin(email, password);
        onClose(); // Закрываем модалку сразу (валидацию оставим на совести пользователя для мокапа)
    };

    return (
        <div className="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-2xl p-6 w-96">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Войти</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-300">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Пароль</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                            required
                            minLength={6}
                        />
                    </div>
                    <button type="submit" className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium flex items-center justify-center gap-2">
                        <LogIn className="w-5 h-5" />
                        Войти
                    </button>
                </form>
            </div>
        </div>
    );
};