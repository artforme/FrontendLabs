import { X, Upload } from 'lucide-react';
import { generateMockStructure } from '../../utils/historyUtils';
import type { HistoryProject } from '../../types';

interface StructurePreviewModalProps {
    onClose: () => void;
    project: HistoryProject | null;
    onLoad: () => void;
}

export const StructurePreviewModal = ({ onClose, project, onLoad }: StructurePreviewModalProps) => {
    if (!project) return null;

    return (
        <div className="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-2xl p-6 w-[600px] flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-xl font-bold">{project.name}</h2>
                        <p className="text-sm text-gray-400">{`${project.filesCount} файлов • ${project.size} • ${project.language}`}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-300">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto bg-gray-900 p-4 rounded-lg text-sm mono mb-4">
                    {generateMockStructure(project)}
                </div>

                <button
                    onClick={() => {
                        onLoad();
                        onClose(); // Закрываем после загрузки
                    }}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                    <Upload className="w-5 h-5" />
                    Загрузить проект
                </button>
            </div>
        </div>
    );
};