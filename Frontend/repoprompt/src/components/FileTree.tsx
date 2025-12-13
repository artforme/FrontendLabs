import { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, ChevronRight, Check, X } from 'lucide-react';
import { estimateTokens, getRelativePath } from '../utils/treeUtils';
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
    toggleNodeStatus: (path: string) => boolean | null;
}

interface FileTreeProps {
    treeState: TreeState;
    addToBlacklist: (item: string) => void;
    addToAllowedlist: (item: string) => void;
}

// Иконка папки (заполненная, как в оригинале)
const FolderIcon = ({ allowed }: { allowed: boolean }) => (
    <svg
        className={`w-5 h-5 ${allowed ? 'text-yellow-400' : 'text-gray-500'}`}
        fill="currentColor"
        viewBox="0 0 24 24"
    >
        <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
);

// Иконка файла с цветом по расширению
const FileIcon = ({ name, allowed }: { name: string; allowed: boolean }) => {
    const ext = name.split('.').pop()?.toLowerCase() || '';

    const colors: Record<string, string> = {
        ts: 'text-blue-400',
        tsx: 'text-blue-400',
        js: 'text-yellow-400',
        jsx: 'text-yellow-400',
        json: 'text-yellow-300',
        css: 'text-pink-400',
        scss: 'text-pink-400',
        html: 'text-orange-400',
        md: 'text-gray-300',
        py: 'text-green-400',
        svg: 'text-orange-300',
        ico: 'text-purple-400',
        txt: 'text-gray-400',
        gitignore: 'text-gray-400',
        env: 'text-yellow-500',
    };

    const color = allowed ? (colors[ext] || 'text-blue-400') : 'text-gray-500';

    return (
        <svg
            className={`w-5 h-5 ${color}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
        </svg>
    );
};

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

    const handleToggle = (path: string, node: TreeNode) => {
        const wasAllowed = node.allowed;
        toggleNodeStatus(path);
        const relativePath = getRelativePath(node);

        if (wasAllowed) {
            addToBlacklist(relativePath);
        } else {
            addToAllowedlist(relativePath);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden shadow-sm">
            {/* Toolbar */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <input
                    type="text"
                    placeholder="Поиск файлов..."
                    className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-blue-500 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-400"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <div className="flex items-center gap-1">
                    <button onClick={zoomOut} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400">
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-gray-500 w-12 text-center">{Math.round(zoom * 100)}%</span>
                    <button onClick={zoomIn} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400">
                        <ZoomIn className="w-4 h-4" />
                    </button>
                    <button onClick={resetZoom} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors ml-2 text-gray-600 dark:text-gray-400">
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Canvas */}
            <div
                className="tree-container flex-1 bg-gray-50 dark:bg-gray-950/50 relative min-h-[300px]"
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
                <div
                    className="tree-content p-4 min-w-max"
                    style={{ transform: `translate(${panX}px, ${panY}px) scale(${zoom})`, transformOrigin: '0 0' }}
                >
                    {!fileTree ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                            <p className="text-sm">Загрузите ZIP-архив для просмотра структуры</p>
                        </div>
                    ) : (
                        <RecursiveNode node={fileTree} depth={0} onToggle={handleToggle} />
                    )}
                </div>
            </div>

            {/* Stats Bar */}
            {fileTree && (
                <div className="p-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">
                    <div className="flex items-center gap-4">
                        <span><strong className="text-gray-900 dark:text-gray-200">{stats.total}</strong> файлов</span>
                        <span className="text-green-600 dark:text-green-400"><strong>{stats.allowed}</strong> разрешено</span>
                        <span className="text-red-500 dark:text-red-400"><strong>{stats.forbidden}</strong> запрещено</span>
                    </div>
                    <span>~<strong className="text-gray-900 dark:text-gray-200">{stats.tokens.toLocaleString()}</strong> токенов</span>
                </div>
            )}
        </div>
    );
};

interface RecursiveNodeProps {
    node: TreeNode;
    depth: number;
    onToggle: (path: string, node: TreeNode) => void;
}

const RecursiveNode = ({ node, depth, onToggle }: RecursiveNodeProps) => {
    const [expanded, setExpanded] = useState(node.expanded ?? (depth < 2));
    const indent = depth * 20;
    const isFolder = node.type === 'folder';

    const handleExpandClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isFolder && node.allowed) {
            setExpanded(!expanded);
        }
    };

    const handleStatusClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggle(node.path, node);
    };

    return (
        <div>
            <div
                className={`file-item flex items-center gap-2 py-1 px-2 rounded-lg cursor-pointer transition-colors
                    ${node.allowed
                        ? 'hover:bg-gray-100 dark:hover:bg-gray-800/50'
                        : 'opacity-50 hover:bg-red-50 dark:hover:bg-red-900/10'
                    }`}
                style={{ marginLeft: `${indent}px` }}
            >
                {/* Expand Arrow */}
                {isFolder ? (
                    <button
                        onClick={handleExpandClick}
                        className={`p-0.5 rounded transition-colors ${node.allowed ? 'hover:bg-gray-200 dark:hover:bg-gray-700' : 'cursor-not-allowed'}`}
                        disabled={!node.allowed}
                    >
                        <ChevronRight
                            className={`w-4 h-4 text-gray-400 transition-transform ${expanded && node.allowed ? 'rotate-90' : ''}`}
                        />
                    </button>
                ) : (
                    <span className="w-5" />
                )}

                {/* Icon — теперь кастомные SVG */}
                {isFolder ? (
                    <FolderIcon allowed={node.allowed} />
                ) : (
                    <FileIcon name={node.name} allowed={node.allowed} />
                )}

                {/* Name */}
                <span
                    className={`mono text-sm flex-1 ${node.allowed
                        ? 'text-gray-800 dark:text-gray-200'
                        : 'text-gray-400 dark:text-gray-500 line-through'
                        }`}
                    onClick={handleExpandClick}
                >
                    {node.name}
                </span>

                {/* Status Toggle */}
                <button
                    onClick={handleStatusClick}
                    className={`p-1 rounded transition-colors ${node.allowed
                        ? 'hover:bg-green-100 dark:hover:bg-green-900/30 text-green-500'
                        : 'hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500'
                        }`}
                >
                    {node.allowed ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                </button>
            </div>

            {/* Children */}
            {isFolder && expanded && node.allowed && node.children && (
                <div>
                    {node.children.map(child => (
                        <RecursiveNode
                            key={child.path}
                            node={child}
                            depth={depth + 1}
                            onToggle={onToggle}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};