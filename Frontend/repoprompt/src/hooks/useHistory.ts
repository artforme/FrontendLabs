import { useState, useEffect, useCallback } from 'react';
import type { HistoryProject } from '../types';

// Мок-данные
const MOCK_HISTORY: HistoryProject[] = [
    {
        id: 1,
        name: "My React App",
        date: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        language: "TypeScript",
        filesCount: 45,
        allowedCount: 32,
        tokensCount: 12000,
        size: "2.5 MB"
    },
    {
        id: 2,
        name: "Backend API",
        date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        language: "JavaScript",
        filesCount: 28,
        allowedCount: 25,
        tokensCount: 8500,
        size: "1.8 MB"
    },
    {
        id: 3,
        name: "Data Analysis Script",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        language: "Python",
        filesCount: 15,
        allowedCount: 12,
        tokensCount: 4500,
        size: "800 KB"
    },
    {
        id: 4,
        name: "Vue Dashboard",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        language: "Vue",
        filesCount: 52,
        allowedCount: 40,
        tokensCount: 15000,
        size: "3.2 MB"
    },
    {
        id: 5,
        name: "Utility Library",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        language: "TypeScript",
        filesCount: 20,
        allowedCount: 18,
        tokensCount: 6000,
        size: "1.2 MB"
    }
];

export const useHistory = (
    showToast: (message: string, type: 'success' | 'error' | 'info') => void
) => {
    const [history, setHistory] = useState<HistoryProject[]>([]);
    const [selectedProject, setSelectedProject] = useState<HistoryProject | null>(null);
    const [previewModalVisible, setPreviewModalVisible] = useState(false);

    // Загружаем историю при монтировании
    useEffect(() => {
        const storedHistory = localStorage.getItem('history');
        if (storedHistory) {
            try {
                const parsed = JSON.parse(storedHistory);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setHistory(parsed);
                } else {
                    setHistory(MOCK_HISTORY);
                    localStorage.setItem('history', JSON.stringify(MOCK_HISTORY));
                }
            } catch {
                setHistory(MOCK_HISTORY);
                localStorage.setItem('history', JSON.stringify(MOCK_HISTORY));
            }
        } else {
            setHistory(MOCK_HISTORY);
            localStorage.setItem('history', JSON.stringify(MOCK_HISTORY));
        }
    }, []);

    // Сохраняем при изменении
    useEffect(() => {
        if (history.length > 0) {
            localStorage.setItem('history', JSON.stringify(history));
        }
    }, [history]);

    const deleteFromHistory = useCallback((id: number) => {
        const project = history.find(p => p.id === id);
        if (project) {
            setHistory(prev => prev.filter(p => p.id !== id));
            showToast(`Проект "${project.name}" удалён из истории`, 'info');
        }
    }, [history, showToast]);

    const clearHistory = useCallback(() => {
        if (history.length > 0) {
            setHistory([]);
            localStorage.removeItem('history');
            showToast('История очищена', 'info');
        }
    }, [history.length, showToast]);

    const previewStructure = useCallback((id: number) => {
        const project = history.find(p => p.id === id);
        if (project) {
            setSelectedProject(project);
            setPreviewModalVisible(true);
        }
    }, [history]);

    // Пока просто показываем toast — в ЛР6 здесь будет реальная загрузка из IndexedDB
    const loadProjectFromHistory = useCallback(() => {
        if (selectedProject) {
            showToast(`Загрузка проекта "${selectedProject.name}" будет доступна в следующей версии`, 'info');
            setPreviewModalVisible(false);
        }
    }, [selectedProject, showToast]);

    const downloadFromHistory = useCallback((id: number) => {
        const project = history.find(p => p.id === id);
        if (!project) return;

        const output = `# ${project.name}

Downloaded from History
Language: ${project.language}
Files: ${project.allowedCount}/${project.filesCount}
Tokens: ~${project.tokensCount}
Size: ${project.size}

// This is a mock download from history
// In ЛР6, this would contain actual file contents from IndexedDB
`;

        const blob = new Blob([output], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.name}-history.txt`;
        a.click();
        URL.revokeObjectURL(url);

        showToast(`Файл "${project.name}" скачан`, 'success');
    }, [history, showToast]);

    const resetToMocks = useCallback(() => {
        setHistory(MOCK_HISTORY);
        localStorage.setItem('history', JSON.stringify(MOCK_HISTORY));
        showToast('История восстановлена', 'info');
    }, [showToast]);

    // Функция для добавления нового проекта в историю (будет использоваться после загрузки ZIP)
    const addToHistory = useCallback((project: Omit<HistoryProject, 'id' | 'date'>) => {
        const newProject: HistoryProject = {
            ...project,
            id: Date.now(),
            date: new Date().toISOString(),
        };
        setHistory(prev => [newProject, ...prev].slice(0, 10)); // Храним только 10 последних
    }, []);

    return {
        history,
        selectedProject,
        previewModalVisible,
        setPreviewModalVisible,
        previewStructure,
        loadProjectFromHistory,
        downloadFromHistory,
        deleteFromHistory,
        clearHistory,
        resetToMocks,
        addToHistory, // Новая функция для добавления проектов
    };
};