import { useEffect, useState } from 'react';

const AuthModal = ({ onClose, isLogin }: { onClose: () => void; isLogin: boolean }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="modal">
      <div className={`modal-content ${isVisible ? 'scale-in' : ''}`}>
        <h2 className="text-2xl mb-4">{isLogin ? 'Войти' : 'Создать аккаунт'}</h2>
        <form className="space-y-4">
          <input type="email" placeholder="Email" />
          <input type="password" placeholder="Пароль" />
          <button type="button" style={{ backgroundColor: '#3b82f6', color: 'white', width: '100%' }}>Отправить</button>
        </form>
        <button onClick={onClose} style={{ backgroundColor: '#ef4444', color: 'white', width: '100%', marginTop: '0.5rem' }}>Закрыть</button>
      </div>
    </div>
  );
};

export default AuthModal;