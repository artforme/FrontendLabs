interface ProgressBarProps {
    isVisible: boolean;
    percent: number;
}

export const ProgressBar = ({ isVisible, percent }: ProgressBarProps) => {
    if (!isVisible) return null;

    return (
        <div className="mb-4 bg-gray-900 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Загрузка и парсинг архива...</span>
                <span className="text-sm text-gray-400">{percent}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                    className="progress-bar h-full rounded-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                ></div>
            </div>
        </div>
    );
};