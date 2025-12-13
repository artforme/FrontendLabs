import { useRef, useState } from 'react';
import { CloudUpload } from 'lucide-react';

interface DropZoneProps {
    onFileUpload: (file: File) => void;
    isLoading?: boolean;
}

export const DropZone = ({ onFileUpload, isLoading }: DropZoneProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleClick = () => {
        if (!isLoading) {
            fileInputRef.current?.click();
        }
    };

    const handleFileSelect = (file: File | null) => {
        if (file && file.name.endsWith('.zip')) {
            onFileUpload(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (!isLoading) {
            setIsDragOver(true);
        }
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        if (isLoading) return;

        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.zip')) {
            handleFileSelect(file);
        }
    };

    return (
        <div
            className={`drop-zone border-2 border-dashed rounded-2xl p-8 mb-4 transition-all ${isLoading
                    ? 'opacity-50 cursor-not-allowed border-gray-300 dark:border-gray-700'
                    : 'cursor-pointer'
                } ${isDragOver
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                    : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:border-gray-400 dark:hover:border-gray-600'
                }`}
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="flex flex-col items-center justify-center text-center">
                <div className={`w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4 ${isLoading ? 'animate-pulse' : ''
                    }`}>
                    <CloudUpload className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-1 text-gray-800 dark:text-gray-100">
                    {isLoading ? 'Обработка архива...' : 'Перетащите ZIP-архив сюда'}
                </h3>
                <p className="text-gray-500 dark:text-gray-500 text-sm mb-3">
                    {isLoading ? 'Пожалуйста, подождите' : 'или нажмите для выбора файла'}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-400">.zip</span>
                    <span className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-400">до 100 MB</span>
                </div>
            </div>
            <input
                type="file"
                accept=".zip"
                className="hidden"
                ref={fileInputRef}
                onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                disabled={isLoading}
            />
        </div>
    );
};