import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    onClose: () => void;
}

export const Toast = ({ message, type, onClose }: ToastProps) => {
    const icons = {
        success: <CheckCircle className="w-5 h-5 text-green-400" />,
        error: <AlertCircle className="w-5 h-5 text-red-400" />, // AlertCircle часто лучше подходит для ошибок
        info: <Info className="w-5 h-5 text-blue-400" />,
    };

    return (
        <div className="fixed bottom-6 right-6 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 shadow-xl flex items-center gap-3 animate-slideIn z-50">
            <span>{icons[type]}</span>
            <span className="text-sm font-medium text-gray-200">{message}</span>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-300 ml-2">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};