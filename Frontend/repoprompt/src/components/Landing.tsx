import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal';
import ThemeSwitcher from './ThemeSwitcher';

const Landing = () => {
    const [showAuth, setShowAuth] = useState(false);
    const [isLogin, setIsLogin] = useState(true);  // Добавляем состояние для isLogin, по умолчанию login
    const navigate = useNavigate();

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', textAlign: 'center' }}>
            <header style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', alignItems: 'center' }}>
                <ThemeSwitcher />
            </header>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>RepoPrompt</h1>
            <p style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>Загружай проект и генерируй промпты для LLM</p>
            <button 
                style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', marginBottom: '0.5rem' }} 
                onClick={() => navigate('/dashboard')}
            >
                Начать работу
            </button>
            <button 
                style={{ backgroundColor: '#22c55e', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px' }} 
                onClick={() => {
                    setShowAuth(true);
                    setIsLogin(true);  // Можно переключать, но по умолчанию login
                }}
            >
                Login/Register
            </button>
            {showAuth && <AuthModal onClose={() => setShowAuth(false)} isLogin={isLogin} />}
        </div>
    );
};

export default Landing;