import { X } from 'lucide-react';
import { DEFAULT_BLACKLIST } from '../../utils/treeUtils';

interface DefaultBlacklistModalProps {
    onClose: () => void;
}

export const DefaultBlacklistModal = ({ onClose }: DefaultBlacklistModalProps) => {
    return (
        <div className="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-2xl p-6 w-96">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-red-400">Дефолтный Blacklist</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-300">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <ul className="space-y-2 max-h-96 overflow-y-auto">
                    {DEFAULT_BLACKLIST.map((item, index) => (
                        <li key={index} className="bg-gray-700 rounded-lg px-3 py-2 text-sm text-red-300">
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};