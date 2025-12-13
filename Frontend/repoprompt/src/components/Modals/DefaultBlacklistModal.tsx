import { X } from 'lucide-react';
import { DEFAULT_BLACKLIST } from '../../utils/treeUtils';

interface DefaultBlacklistModalProps {
    onClose: () => void;
}

export const DefaultBlacklistModal = ({ onClose }: DefaultBlacklistModalProps) => {
    return (
        <div className="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-96 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-red-500">Дефолтный Blacklist</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Эти элементы исключаются автоматически:
                </p>
                <ul className="space-y-2 max-h-96 overflow-y-auto">
                    {DEFAULT_BLACKLIST.map((item, index) => (
                        <li key={index} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2 text-sm text-red-600 dark:text-red-400 mono">
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};