import { useState } from 'react';
import { Ban, Plus, X } from 'lucide-react';

interface BlacklistPanelProps {
    blacklist: string[];
    addToBlacklist: (item: string) => void;
    removeFromBlacklist: (index: number) => void;
    openDefaultModal: () => void;
}

export const BlacklistPanel = ({ blacklist, addToBlacklist, removeFromBlacklist, openDefaultModal }: BlacklistPanelProps) => {
    const [inputValue, setInputValue] = useState('');

    const handleAdd = () => {
        const trimmed = inputValue.trim();
        if (trimmed) {
            addToBlacklist(trimmed);
            setInputValue('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleAdd();
    };

    return (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-800">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-red-400 flex items-center gap-2">
                        <Ban className="w-5 h-5" />
                        Blacklist
                    </h3>
                    <button
                        onClick={openDefaultModal}
                        className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                    >
                        Дефолтные
                    </button>
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder=".exe, node_modules..."
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 transition-colors"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        onClick={handleAdd}
                        className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {blacklist.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">Список пуст</p>
                ) : (
                    blacklist.map((item, index) => (
                        <div key={index} className="panel-item bg-gray-800 rounded-lg px-3 py-2 text-sm flex justify-between items-center group animate-slideIn">
                            <span className="mono truncate flex-1" title={item}>{item}</span>
                            <button
                                onClick={() => removeFromBlacklist(index)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all text-red-400"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};