import { X, Clock, FileText, Tag, Folder, Download, Trash } from 'lucide-react';
import { formatRelativeTime, getLanguageGradient, getLanguageIcon } from '../../utils/historyUtils';
import type { HistoryProject } from '../../types';

// Определяем интерфейс для стейта истории, который мы ожидаем
interface HistoryState {
    history: HistoryProject[];
    previewStructure: (id: number) => void;
    downloadFromHistory: (id: number) => void;
    deleteFromHistory: (id: number) => void;
    clearHistory: () => void;
}

interface HistoryModalProps {
    onClose: () => void;
    historyState: HistoryState;
}

export const HistoryModal = ({ onClose, historyState }: HistoryModalProps) => {
    const { history, previewStructure, downloadFromHistory, deleteFromHistory, clearHistory } = historyState;

    return (
        <div className="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-2xl p-6 w-[800px] max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">История проектов</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-300">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-4">
                    {history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                            <Clock className="w-16 h-16 mb-4 opacity-50" />
                            <p className="text-lg font-medium">История пуста</p>
                            <p className="text-sm">Загрузите первый проект</p>
                        </div>
                    ) : (
                        history.map((project, index) => (
                            <div
                                key={project.id}
                                className="history-item bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 rounded-xl p-4 transition-all"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className={`w-12 h-12 bg-gradient-to-br ${getLanguageGradient(project.language)} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                            {getLanguageIcon(project.language)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-lg truncate">{project.name}</h4>
                                            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {formatRelativeTime(project.date)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <FileText className="w-4 h-4" />
                                                    {project.allowedCount}/{project.filesCount} файлов
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Tag className="w-4 h-4" />
                                                    ~{project.tokensCount.toLocaleString()} токенов
                                                </span>
                                                <span className="px-2 py-0.5 bg-gray-700 rounded text-xs">{project.language}</span>
                                                <span className="text-gray-500">{project.size}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => previewStructure(project.id)}
                                            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                            title="Посмотреть структуру"
                                        >
                                            <Folder className="w-4 h-4" />
                                            <span className="hidden sm:inline">Структура</span>
                                        </button>
                                        <button
                                            onClick={() => downloadFromHistory(project.id)}
                                            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                            title="Скачать TXT"
                                        >
                                            <Download className="w-4 h-4" />
                                            <span className="hidden sm:inline">TXT</span>
                                        </button>
                                        <button
                                            onClick={() => deleteFromHistory(project.id)}
                                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            title="Удалить"
                                        >
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                {history.length > 0 && (
                    <button onClick={clearHistory} className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-medium self-end">
                        Очистить историю
                    </button>
                )}
            </div>
        </div>
    );
};