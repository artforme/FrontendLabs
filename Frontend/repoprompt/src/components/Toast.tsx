import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    onClose: () => void;
}

export const Toast = ({ message, type, onClose }: ToastProps) => {
    const icons = {
        success: <CheckCircle className="w-5 h-5 text-green-500" />,
        error: <AlertCircle className="w-5 h-5 text-red-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />,
    };

    const bgColors = {
        success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
        error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
        info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    };

    return (
        <div className={`fixed bottom-6 right-6 ${bgColors[type]} border rounded-xl px-4 py-3 shadow-xl flex items-center gap-3 animate-slideIn z-50`}>
            {icons[type]}
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{message}</span>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-2">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};