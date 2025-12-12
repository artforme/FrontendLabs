import { useRef, useState } from 'react';
import { CloudUpload } from 'lucide-react';

interface DropZoneProps {
    onFileUpload: () => void;
}

export const DropZone = ({ onFileUpload }: DropZoneProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = (file: File | null) => {
        if (file) {
            onFileUpload();
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.zip')) {
            handleFileSelect(file);
        }
    };

    return (
        <div
            className={`drop-zone border-2 border-dashed border-gray-700 rounded-2xl p-8 mb-4 bg-gray-900/50 hover:border-gray-600 transition-all cursor-pointer ${isDragOver ? 'drag-over border-blue-500 bg-blue-500/10' : ''}`}
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                    <CloudUpload className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Перетащите ZIP-архив сюда</h3>
                <p className="text-gray-500 text-sm mb-3">или нажмите для выбора файла</p>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="px-2 py-1 bg-gray-800 rounded">.zip</span>
                    <span className="px-2 py-1 bg-gray-800 rounded">до 100 MB</span>
                </div>
            </div>
            <input
                type="file"
                accept=".zip"
                className="hidden"
                ref={fileInputRef}
                onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
            />
        </div>
    );
};