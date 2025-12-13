import { useState } from 'react';
import { CheckCircle, Plus, X } from 'lucide-react';

interface AllowedlistPanelProps {
    allowedlist: string[];
    addToAllowedlist: (item: string) => void;
    removeFromAllowedlist: (index: number) => void;
}

export const AllowedlistPanel = ({ allowedlist, addToAllowedlist, removeFromAllowedlist }: AllowedlistPanelProps) => {
    const [inputValue, setInputValue] = useState('');

    const handleAdd = () => {
        const trimmed = inputValue.trim();
        if (trimmed) {
            addToAllowedlist(trimmed);
            setInputValue('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleAdd();
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="font-semibold text-green-500 flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5" />
                    Whitelist
                </h3>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder=".ts, .tsx, src..."
                        className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-400"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        onClick={handleAdd}
                        className="px-3 py-2 bg-green-100 dark:bg-green-600/20 hover:bg-green-200 dark:hover:bg-green-600/30 text-green-600 dark:text-green-400 rounded-lg transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {allowedlist.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">Список пуст</p>
                ) : (
                    allowedlist.map((item, index) => (
                        <div key={index} className="panel-item bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm flex justify-between items-center group animate-slideIn border border-gray-100 dark:border-transparent">
                            <span className="mono truncate flex-1 text-gray-700 dark:text-gray-200" title={item}>{item}</span>
                            <button
                                onClick={() => removeFromAllowedlist(index)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-green-100 dark:hover:bg-green-500/20 rounded transition-all text-green-500 dark:text-green-400"
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