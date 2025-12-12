import { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Folder, File, CheckCircle, XCircle } from 'lucide-react';
import { findNode, estimateTokens } from '../utils/treeUtils';
import type { TreeNode } from '../types';

export interface TreeState {
    fileTree: TreeNode | null;
    zoom: number;
    panX: number;
    panY: number;
    isDragging: boolean;
    search: string;
    setSearch: (s: string) => void;
    zoomIn: () => void;
    zoomOut: () => void;
    resetZoom: () => void;
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseUp: () => void;
    toggleNodeStatus: (path: string) => void;
}

interface FileTreeProps {
    treeState: TreeState;
    addToBlacklist: (item: string) => void;
    addToAllowedlist: (item: string) => void;
}

export const FileTree = ({ treeState, addToBlacklist, addToAllowedlist }: FileTreeProps) => {
    const {
        fileTree, zoom, panX, panY, isDragging, search, setSearch,
        zoomIn, zoomOut, resetZoom, onMouseDown, onMouseMove, onMouseUp, toggleNodeStatus
    } = treeState;

    const calculateStats = (node: TreeNode | null) => {
        if (!node) return { total: 0, allowed: 0, forbidden: 0, tokens: 0 };
        let total = 0, allowed = 0, forbidden = 0, tokens = 0;
        const traverse = (n: TreeNode) => {
            if (n.type === 'file') {
                total++;
                if (n.allowed) {
                    allowed++;
                    tokens += estimateTokens(n.content || '');
                } else {
                    forbidden++;
                }
            }
            n.children?.forEach(traverse);
        };
        traverse(node);
        return { total, allowed, forbidden, tokens };
    };

    const stats = calculateStats(fileTree);

    const handleToggle = (path: string) => {
        toggleNodeStatus(path);
        const node = findNode(fileTree, path);
        if (node) {
            const relativePath = node.path.split('/').slice(1).join('/');
            // Логика: если сейчас разрешен (будет запрещен -> blacklist), если запрещен (будет разрешен -> allowedlist)
            // Примечание: так как toggleNodeStatus асинхронный, мы используем текущее состояние node.allowed
            if (node.allowed) {
                addToBlacklist(relativePath);
            } else {
                addToAllowedlist(relativePath);
            }
        }
    };

    return (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="p-3 border-b border-gray-800 flex items-center justify-between">
                <input
                    type="text"
                    placeholder="Поиск файлов..."
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-blue-500 transition-colors"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <div className="flex items-center gap-1">
                    <button onClick={zoomOut} className="p-2 hover:bg-gray-800 rounded-lg transition-colors" title="Уменьшить">
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-gray-500 w-12 text-center">{Math.round(zoom * 100)}%</span>
                    <button onClick={zoomIn} className="p-2 hover:bg-gray-800 rounded-lg transition-colors" title="Увеличить">
                        <ZoomIn className="w-4 h-4" />
                    </button>
                    <button onClick={resetZoom} className="p-2 hover:bg-gray-800 rounded-lg transition-colors ml-2" title="Сбросить">
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Canvas */}
            <div
                className="tree-container flex-1 bg-gray-950/50 relative"
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
                <div className="tree-content p-4 min-w-max" style={{ transform: `translate(${panX}px, ${panY}px) scale(${zoom})` }}>
                    {!fileTree ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                            <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                            <p className="text-sm">Загрузите ZIP-архив для просмотра структуры</p>
                        </div>
                    ) : (
                        <RecursiveNode node={fileTree} depth={0} toggleStatus={handleToggle} />
                    )}
                </div>
            </div>

            {/* Stats Bar */}
            <div className="p-3 border-t border-gray-800 flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center gap-4">
                    <span><strong>{stats.total}</strong> файлов</span>
                    <span><strong>{stats.allowed}</strong> разрешено</span>
                    <span className="text-red-400"><strong>{stats.forbidden}</strong> запрещено</span>
                </div>
                <span>~<strong>{stats.tokens}</strong> токенов</span>
            </div>
        </div>
    );
};

const RecursiveNode = ({ node, depth, toggleStatus }: { node: TreeNode; depth: number; toggleStatus: (path: string) => void }) => {
    const [expanded, setExpanded] = useState(node.expanded ?? false);
    const indent = depth * 16;

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleStatus(node.path);
    };

    return (
        <div style={{ paddingLeft: `${indent}px` }}>
            <div
                className={`file-item flex items-center gap-2 cursor-pointer ${!node.allowed ? 'forbidden opacity-50 line-through' : 'allowed'}`}
                onClick={() => node.type === 'folder' ? setExpanded(!expanded) : toggleStatus(node.path)}
            >
                {node.type === 'folder' ? <Folder className="w-4 h-4" /> : <File className="w-4 h-4" />}
                <span className="mono text-sm">{node.name}</span>
                <span onClick={handleClick} className="ml-auto icon-status hover:bg-gray-800 rounded p-0.5">
                    {node.allowed ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                </span>
            </div>
            {expanded && node.children?.map(child => (
                <RecursiveNode key={child.path} node={child} depth={0} toggleStatus={toggleStatus} />
            ))}
        </div>
    );
};