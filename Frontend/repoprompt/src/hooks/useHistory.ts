import { useState, useEffect } from 'react';
import mockHistory from '../assets/mockHistory.json';
import type { HistoryProject } from '../types';

export const useHistory = (
    simulateFileUpload: () => void,
    showToast: (message: string, type: 'success' | 'error' | 'info') => void
) => {
    const [history, setHistory] = useState<HistoryProject[]>([]);
    const [selectedProject, setSelectedProject] = useState<HistoryProject | null>(null);
    const [previewModalVisible, setPreviewModalVisible] = useState(false);

    useEffect(() => {
        const storedHistory = localStorage.getItem('history');
        if (storedHistory) {
            setHistory(JSON.parse(storedHistory));
        } else {
            setHistory(mockHistory);
            localStorage.setItem('history', JSON.stringify(mockHistory));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('history', JSON.stringify(history));
    }, [history]);

    const deleteFromHistory = (id: number) => {
        const project = history.find(p => p.id === id);
        if (project) {
            setHistory(prev => prev.filter(p => p.id !== id));
            showToast(`Проект "${project.name}" удалён из истории`, 'info');
        }
    };

    const clearHistory = () => {
        if (history.length > 0) {
            setHistory([]);
            showToast('История очищена', 'info');
        }
    };

    const previewStructure = (id: number) => {
        const project = history.find(p => p.id === id);
        if (project) {
            setSelectedProject(project);
            setPreviewModalVisible(true);
        }
    };

    const loadProjectFromHistory = () => {
        if (selectedProject) {
            simulateFileUpload();
            showToast(`Проект "${selectedProject.name}" загружен`, 'success');
            setPreviewModalVisible(false);
        }
    };

    const downloadFromHistory = (id: number) => {
        const project = history.find(p => p.id === id);
        if (!project) return;

        const output = `# ${project.name}\n# Downloaded from History\n# Files: ${project.filesCount}\n# Tokens: ~${project.tokensCount}\n...`;
        const blob = new Blob([output], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.name}-history.txt`;
        a.click();
        URL.revokeObjectURL(url);

        showToast(`Файл "${project.name}" скачан`, 'success');
    };

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
    };
};