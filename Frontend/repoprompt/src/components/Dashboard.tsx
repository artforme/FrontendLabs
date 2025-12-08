import { useState } from 'react';
import DropZone from './DropZone';
import FileTree from './FileTree';
import FilePreview from './FilePreview';
import FiltersPanel from './FiltersPanel';
import ThemeSwitcher from './ThemeSwitcher';
import AuthModal from './AuthModal';

const Dashboard = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const handleDownload = () => {
    const blob = new Blob(['Mock TXT content'], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'example.txt';
    a.click();
  };

  return (
    <>
      <header>
        <button style={{ backgroundColor: '#3b82f6', color: 'white' }} onClick={() => { setShowAuth(true); setIsLogin(true); }}>
          Войти
        </button>
        <button style={{ backgroundColor: '#22c55e', color: 'white' }} onClick={() => { setShowAuth(true); setIsLogin(false); }}>
          Создать аккаунт
        </button>
        <ThemeSwitcher />
      </header>
      <div className="dashboard">
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '1rem' }}>RepoPrompt</h1>
        <DropZone />
        <div className="panels">
          <div className="panel">
            <FileTree />
          </div>
          <div className="panel">
            <FilePreview />
          </div>
        </div>
        <FiltersPanel />
        <button 
          style={{ marginTop: '1rem', backgroundColor: '#22c55e', color: 'white', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} 
          onClick={handleDownload}
        >
          Generate TXT → Download
        </button>
      </div>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} isLogin={isLogin} />}
    </>
  );
};

export default Dashboard;