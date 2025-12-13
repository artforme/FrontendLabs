interface ProgressBarProps {
    isVisible: boolean;
    percent: number;
    stage?: string;
    currentFile?: string;
}

export const ProgressBar = ({ isVisible, percent, stage, currentFile }: ProgressBarProps) => {
    if (!isVisible) return null;

    const stageLabels: Record<string, string> = {
        reading: '📦 Чтение архива...',
        extracting: '📂 Извлечение файлов...',
        building: '🌳 Построение дерева...',
    };

    return (
        <div className="mb-4 bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {stageLabels[stage || 'reading'] || 'Обработка...'}
                    </span>
                    {currentFile && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5" title={currentFile}>
                            {currentFile}
                        </p>
                    )}
                </div>
                <span className="text-sm font-mono text-gray-500 dark:text-gray-400 ml-4">
                    {percent}%
                </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                    className="progress-bar h-full rounded-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
};