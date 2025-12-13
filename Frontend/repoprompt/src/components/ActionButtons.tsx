import { Download, Copy } from 'lucide-react';
import { collectFilesForDownload, collectFilesForCopy } from '../utils/treeUtils';
import type { TreeNode } from '../types';

interface ActionButtonsProps {
    fileTree: TreeNode | null;
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const ActionButtons = ({ fileTree, showToast }: ActionButtonsProps) => {

    const handleDownload = () => {
        if (!fileTree) {
            showToast('Сначала загрузите проект', 'error');
            return;
        }

        const output = collectFilesForDownload(fileTree).join('');

        if (!output) {
            showToast('Нет разрешённых файлов для скачивания', 'error');
            return;
        }

        const blob = new Blob([output], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileTree.name}-llm-ready.txt`;
        a.click();
        URL.revokeObjectURL(url);

        showToast('TXT файл успешно скачан!', 'success');
    };

    const handleCopy = () => {
        if (!fileTree) {
            showToast('Сначала загрузите проект', 'error');
            return;
        }

        const output = 'Вот структура и код моего проекта:\n\n' + collectFilesForCopy(fileTree).join('');

        if (output.length < 50) {
            showToast('Нет разрешённых файлов для копирования', 'error');
            return;
        }

        navigator.clipboard.writeText(output).then(() => {
            showToast('Скопировано в буфер обмена!', 'success');
        }).catch(() => {
            showToast('Ошибка копирования', 'error');
        });
    };

    return (
        <div className="flex items-center justify-center gap-4 mt-4">
            <button
                onClick={handleDownload}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/25"
            >
                <Download className="w-5 h-5" />
                Generate TXT → Download
            </button>
            <button
                onClick={handleCopy}
                className="px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl font-medium flex items-center gap-2 transition-colors border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200"
            >
                <Copy className="w-5 h-5" />
                Copy to Clipboard
            </button>
        </div>
    );
};