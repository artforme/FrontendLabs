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
        <div className="bg-gray-900 rounded-2xl border border-gray-800 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-800">
                <h3 className="font-semibold text-green-400 flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5" />
                    Whitelist
                </h3>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder=".ts, .tsx, src..."
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 transition-colors"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        onClick={handleAdd}
                        className="px-3 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {allowedlist.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">Список пуст</p>
                ) : (
                    allowedlist.map((item, index) => (
                        <div key={index} className="panel-item bg-gray-800 rounded-lg px-3 py-2 text-sm flex justify-between items-center group animate-slideIn">
                            <span className="mono truncate flex-1" title={item}>{item}</span>
                            <button
                                onClick={() => removeFromAllowedlist(index)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-green-500/20 rounded transition-all text-green-400"
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