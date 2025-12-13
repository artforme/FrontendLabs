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
    const { toast, showToast, hideToast } = useToast();
    const { theme, toggleTheme } = useTheme();
    const auth = useAuth(showToast);
    const panels = usePanels(showToast);
    const treeState = useFileTree(panels.blacklist, panels.allowedlist);
    const historyState = useHistory(treeState.simulateFileUpload, showToast);

    const [activeModal, setActiveModal] = useState<'login' | 'register' | 'history' | 'defaultBlacklist' | null>(null);
    const closeModal = () => setActiveModal(null);

    return (
        <div className="min-h-screen transition-colors duration-300 bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
            <Header
                auth={auth}
                theme={theme}
                toggleTheme={toggleTheme}
                historyCount={historyState.history.length}
                openModal={(name) => setActiveModal(name)}
            />

            <main className="max-w-[1800px] mx-auto p-4">
                <DropZone onFileUpload={treeState.simulateFileUpload} />

                <ProgressBar isVisible={treeState.isLoading} percent={treeState.loadingPercent} />

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

                <ActionButtons fileTree={treeState.originalFileTree} showToast={showToast} />
            </main>

            {/* Modals */}
            {activeModal === 'login' && <LoginModal onClose={closeModal} onLogin={auth.login} />}
            {activeModal === 'register' && <RegisterModal onClose={closeModal} onRegister={auth.register} />}
            {activeModal === 'history' && <HistoryModal onClose={closeModal} historyState={historyState} />}
            {activeModal === 'defaultBlacklist' && <DefaultBlacklistModal onClose={closeModal} />}

            {historyState.previewModalVisible && (
                <StructurePreviewModal
                    onClose={() => historyState.setPreviewModalVisible(false)}
                    project={historyState.selectedProject}
                    onLoad={historyState.loadProjectFromHistory}
                />
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
        </div>
    );
}

export default App;