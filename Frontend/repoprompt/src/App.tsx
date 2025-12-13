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

// Utils
import { calculateTreeStats } from './utils/treeUtils';

function App() {
    const { toast, showToast, hideToast } = useToast();
    const { theme, toggleTheme } = useTheme();
    const auth = useAuth(showToast);
    const panels = usePanels(showToast);
    const treeState = useFileTree(panels.blacklist, panels.allowedlist);
    const historyState = useHistory(showToast); // Убрали parseZipFile

    const [activeModal, setActiveModal] = useState<'login' | 'register' | 'history' | 'defaultBlacklist' | null>(null);
    const closeModal = () => setActiveModal(null);

    // Определение языка проекта по файлам
    const detectLanguage = (tree: typeof treeState.fileTree): string => {
        if (!tree) return 'Unknown';

        const extensions: Record<string, number> = {};

        const countExtensions = (node: typeof tree) => {
            if (node.type === 'file') {
                const ext = node.name.split('.').pop()?.toLowerCase() || '';
                extensions[ext] = (extensions[ext] || 0) + 1;
            }
            node.children?.forEach(countExtensions);
        };

        countExtensions(tree);

        // Определяем язык по преобладающим расширениям
        if (extensions['tsx'] || extensions['ts']) return 'TypeScript';
        if (extensions['jsx'] || extensions['js']) return 'JavaScript';
        if (extensions['py']) return 'Python';
        if (extensions['vue']) return 'Vue';
        if (extensions['java']) return 'Java';
        if (extensions['go']) return 'Go';
        if (extensions['rs']) return 'Rust';
        if (extensions['rb']) return 'Ruby';
        if (extensions['php']) return 'PHP';

        return 'Unknown';
    };

    // Форматирование размера файла
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    // Обёртка для загрузки файла с обработкой ошибок
    const handleFileUpload = async (file: File) => {
        try {
            await treeState.parseZipFile(file);

            // После успешной загрузки добавляем в историю
            if (treeState.fileTree) {
                const stats = calculateTreeStats(treeState.fileTree);
                historyState.addToHistory({
                    name: file.name.replace('.zip', ''),
                    language: detectLanguage(treeState.fileTree),
                    filesCount: stats.total,
                    allowedCount: stats.allowed,
                    tokensCount: stats.tokens,
                    size: formatFileSize(file.size),
                });
            }

            showToast(`Архив "${file.name}" успешно загружен!`, 'success');
        } catch (error) {
            console.error('Upload error:', error);
            showToast('Ошибка при обработке архива', 'error');
        }
    };

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
                <DropZone
                    onFileUpload={handleFileUpload}
                    isLoading={treeState.isLoading}
                />

                <ProgressBar
                    isVisible={treeState.isLoading}
                    percent={treeState.loadingPercent}
                    stage={treeState.loadingStage}
                    currentFile={treeState.currentFile}
                />

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
                        removeFromBlacklistByValue={panels.removeFromBlacklistByValue}
                        removeFromAllowedlistByValue={panels.removeFromAllowedlistByValue}
                    />

                    <AllowedlistPanel
                        allowedlist={panels.allowedlist}
                        addToAllowedlist={panels.addToAllowedlist}
                        removeFromAllowedlist={panels.removeFromAllowedlist}
                    />
                </div>

                <ActionButtons fileTree={treeState.fileTree} showToast={showToast} />
            </main>

            {/* Modals */}
            {activeModal === 'login' && (
                <LoginModal onClose={closeModal} onLogin={auth.login} />
            )}
            {activeModal === 'register' && (
                <RegisterModal onClose={closeModal} onRegister={auth.register} />
            )}
            {activeModal === 'history' && (
                <HistoryModal onClose={closeModal} historyState={historyState} />
            )}
            {activeModal === 'defaultBlacklist' && (
                <DefaultBlacklistModal onClose={closeModal} />
            )}

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