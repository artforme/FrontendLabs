import { useState } from 'react';
import { Header } from './components/Header';
import { DropZone } from './components/DropZone';
import { ProgressBar } from './components/ProgressBar';
import { BlacklistPanel } from './components/BlacklistPanel';
import { FileTree } from './components/FileTree';
import { AllowedlistPanel } from './components/AllowedlistPanel';
import { ActionButtons } from './components/ActionButtons';
import { Toast } from './components/Toast';

// Modals
import { LoginModal } from './components/Modals/LoginModal';
import { RegisterModal } from './components/Modals/RegisterModal';
import { HistoryModal } from './components/Modals/HistoryModal';
import { DefaultBlacklistModal } from './components/Modals/DefaultBlacklistModal';
import { StructurePreviewModal } from './components/Modals/StructurePreviewModal';

// Hooks
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import { useFileTree } from './hooks/useFileTree';
import { usePanels } from './hooks/usePanels';
import { useHistory } from './hooks/useHistory';
import { useToast } from './hooks/useToast';

function App() {
    // 1. Инициализируем базовые UI хуки
    const { toast, showToast } = useToast();
    // Важно: достаем toggleTheme, чтобы передать его в Header
    const { theme, toggleTheme } = useTheme(); 

    // 2. Auth State
    const auth = useAuth(showToast);

    // 3. File Tree & Panels Logic
    // Инициализируем дерево с пустыми фильтрами. 
    // usePanels обновит дерево сразу после монтирования, применив сохраненные фильтры.
    const treeState = useFileTree([], []); 
    
    const panels = usePanels(
        treeState.fileTree, 
        treeState.setFileTree, 
        treeState.originalStatus,
        showToast
    );

    // 4. History State
    const historyState = useHistory(treeState.simulateFileUpload, showToast);

    // 5. Modal State Management
    // Типизируем стейт, чтобы он совпадал с ожидаемыми значениями
    const [activeModal, setActiveModal] = useState<'login' | 'register' | 'history' | 'defaultBlacklist' | null>(null);

    const closeModal = () => setActiveModal(null);

    return (
        <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-950 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
            <Header 
                auth={auth} 
                theme={theme} 
                toggleTheme={toggleTheme}
                historyCount={historyState.history.length}
                // Обертка нужна для совпадения типов TS
                openModal={(name) => setActiveModal(name)} 
            />

            <main className="max-w-[1800px] mx-auto p-4">
                <DropZone onFileUpload={treeState.simulateFileUpload} />
                
                {/* Фейковый прогресс (можно подключить стейт позже) */}
                <ProgressBar isVisible={false} percent={0} />

                <div className="grid grid-cols-[300px_1fr_300px] gap-4 h-[calc(100vh-280px)] min-h-[500px]">
                    <BlacklistPanel 
                        blacklist={panels.blacklist} 
                        addToBlacklist={panels.addToBlacklist} 
                        removeFromBlacklist={panels.removeFromBlacklist}
                        openDefaultModal={() => setActiveModal('defaultBlacklist')}
                    />

                    <FileTree 
                        treeState={treeState}
                        addToBlacklist={panels.addToBlacklist}
                        addToAllowedlist={panels.addToAllowedlist}
                    />

                    <AllowedlistPanel 
                        allowedlist={panels.allowedlist}
                        addToAllowedlist={panels.addToAllowedlist}
                        removeFromAllowedlist={panels.removeFromAllowedlist}
                    />
                </div>

                <ActionButtons fileTree={treeState.fileTree} showToast={showToast} />
            </main>

            {/* Modals Rendering */}
            {activeModal === 'login' && (
                <LoginModal onClose={closeModal} onLogin={auth.login} />
            )}
            {activeModal === 'register' && (
                <RegisterModal onClose={closeModal} onRegister={auth.register} />
            )}
            {activeModal === 'history' && (
                <HistoryModal 
                    onClose={closeModal} 
                    historyState={historyState} 
                />
            )}
            {activeModal === 'defaultBlacklist' && (
                <DefaultBlacklistModal onClose={closeModal} />
            )}
            
            {/* Модалка превью управляется своим внутренним состоянием внутри hook useHistory, 
                но рендерится здесь, используя данные из historyState */}
            {historyState.previewModalVisible && (
                <StructurePreviewModal 
                    onClose={() => historyState.setPreviewModalVisible(false)}
                    project={historyState.selectedProject}
                    onLoad={historyState.loadProjectFromHistory}
                />
            )}

            {/* Toast Notifications */}
            {toast && (
                <Toast message={toast.message} type={toast.type} onClose={() => {}} />
            )}
        </div>
    );
}

export default App;