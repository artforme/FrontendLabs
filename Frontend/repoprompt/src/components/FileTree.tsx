import { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, ChevronRight, Check, X, MousePointer2 } from 'lucide-react';
import { estimateTokens } from '../utils/treeUtils';
import type { TreeNode } from '../types';

export interface TreeState {
    fileTree: TreeNode | null;
    originalStatus: Record<string, boolean>;
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
    containerRef: React.RefObject<HTMLDivElement | null>;
    toggleNodeStatus: (path: string) => {
        wasAllowed: boolean;
        wasOriginallyAllowed: boolean;
        relativePath: string;
    } | null;
}

interface FileTreeProps {
    treeState: TreeState;
    addToBlacklist: (item: string) => void;
    addToAllowedlist: (item: string) => void;
    removeFromBlacklistByValue: (item: string) => void;
    removeFromAllowedlistByValue: (item: string) => void;
}

// Иконка папки
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
        <svg className={`w-5 h-5 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
        </svg>
    );
};

// Проверка совпадения с поиском
const matchesSearch = (node: TreeNode, query: string): boolean => {
    if (!query) return true;
    const lowerQuery = query.toLowerCase();

    if (node.name.toLowerCase().includes(lowerQuery)) return true;

    if (node.type === 'folder' && node.children) {
        return node.children.some(child => matchesSearch(child, lowerQuery));
    }

    return false;
};

export const FileTree = ({
    treeState,
    addToBlacklist,
    addToAllowedlist,
    removeFromBlacklistByValue,
    removeFromAllowedlistByValue
}: FileTreeProps) => {
    const {
        fileTree, originalStatus, zoom, panX, panY, isDragging, search, setSearch,
        zoomIn, zoomOut, resetZoom, onMouseDown, onMouseMove, onMouseUp, containerRef, toggleNodeStatus
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
        const result = toggleNodeStatus(path);
        if (!result) return;

        const { wasAllowed, wasOriginallyAllowed, relativePath } = result;
        const nowAllowed = !wasAllowed;

        if (nowAllowed) {
            if (wasOriginallyAllowed) {
                removeFromBlacklistByValue(relativePath);
            } else {
                addToAllowedlist(relativePath);
            }
        } else {
            if (wasOriginallyAllowed) {
                addToBlacklist(relativePath);
            } else {
                removeFromAllowedlistByValue(relativePath);
            }
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden shadow-sm">
            {/* Toolbar */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Поиск файлов..."
                        className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-blue-500 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-400"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={zoomOut}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
                        title="Уменьшить (или Scroll Down)"
                    >
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-gray-500 w-12 text-center font-mono">{Math.round(zoom * 100)}%</span>
                    <button
                        onClick={zoomIn}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
                        title="Увеличить (или Scroll Up)"
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 mx-1" />
                    <button
                        onClick={resetZoom}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
                        title="Сбросить zoom и позицию"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Canvas - привязываем ref */}
            <div
                ref={containerRef}
                className="tree-container flex-1 bg-gray-50 dark:bg-gray-950/50 relative min-h-[300px] overflow-hidden"
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                style={{
                    cursor: fileTree
                        ? (isDragging ? 'grabbing' : 'grab')
                        : 'default'
                }}
            >
                <div
                    className="tree-content p-4 min-w-max"
                    style={{
                        transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
                        transformOrigin: '0 0',
                        transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                    }}
                >
                    {!fileTree ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                            <p className="text-sm">Загрузите ZIP-архив для просмотра структуры</p>
                        </div>
                    ) : (
                        <RecursiveNode
                            node={fileTree}
                            depth={0}
                            onToggle={handleToggle}
                            searchQuery={search}
                            originalStatus={originalStatus}
                        />
                    )}
                </div>

                {/* Zoom Hint */}
                {fileTree && (
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1 opacity-60">
                        <MousePointer2 className="w-3 h-3" />
                        Scroll = zoom • Drag = pan
                    </div>
                )}
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
    onToggle: (path: string) => void;
    searchQuery: string;
    originalStatus: Record<string, boolean>;
}

const RecursiveNode = ({ node, depth, onToggle, searchQuery, originalStatus }: RecursiveNodeProps) => {
    const [expanded, setExpanded] = useState(node.expanded ?? (depth < 2));
    const indent = depth * 20;
    const isFolder = node.type === 'folder';

    const matches = matchesSearch(node, searchQuery);
    const isHighlighted = searchQuery && node.name.toLowerCase().includes(searchQuery.toLowerCase());

    const isOriginallyAllowed = originalStatus[node.path] !== false;
    const isModified = node.allowed !== isOriginallyAllowed;

    const handleExpandClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isFolder && node.allowed) {
            setExpanded(!expanded);
        }
    };

    const handleRowClick = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.expand-btn')) return;
        onToggle(node.path);
    };

    return (
        <div>
            <div
                className={`file-item flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer transition-all select-none
                    ${node.allowed
                        ? 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
                        : 'hover:bg-red-50 dark:hover:bg-red-900/20'
                    }
                    ${isHighlighted
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 ring-2 ring-yellow-400 dark:ring-yellow-600'
                        : ''
                    }
                    ${!matches && searchQuery ? 'opacity-30' : 'opacity-100'}
                    ${isModified ? 'ring-1 ring-offset-1 ring-purple-400 dark:ring-purple-600' : ''}
                `}
                style={{ marginLeft: `${indent}px` }}
                onClick={handleRowClick}
                title={isModified ? 'Статус изменён вручную' : undefined}
            >
                {isFolder ? (
                    <button
                        className={`expand-btn p-0.5 rounded transition-colors ${node.allowed
                            ? 'hover:bg-gray-200 dark:hover:bg-gray-700'
                            : 'cursor-not-allowed opacity-50'
                            }`}
                        onClick={handleExpandClick}
                        disabled={!node.allowed}
                    >
                        <ChevronRight
                            className={`w-4 h-4 text-gray-400 transition-transform ${expanded && node.allowed ? 'rotate-90' : ''}`}
                        />
                    </button>
                ) : (
                    <span className="w-5" />
                )}

                {isFolder ? (
                    <FolderIcon allowed={node.allowed} />
                ) : (
                    <FileIcon name={node.name} allowed={node.allowed} />
                )}

                <span
                    className={`mono text-sm flex-1 ${node.allowed
                        ? 'text-gray-800 dark:text-gray-200'
                        : 'text-gray-400 dark:text-gray-500 line-through'
                        }`}
                >
                    {node.name}
                </span>

                <span className={`flex-shrink-0 ${node.allowed ? 'text-green-500' : 'text-red-500'}`}>
                    {node.allowed ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                </span>
            </div>

            {isFolder && expanded && node.allowed && node.children && (
                <div>
                    {node.children.map(child => (
                        <RecursiveNode
                            key={child.path}
                            node={child}
                            depth={depth + 1}
                            onToggle={onToggle}
                            searchQuery={searchQuery}
                            originalStatus={originalStatus}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};