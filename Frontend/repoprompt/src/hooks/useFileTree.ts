import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { parseZipToTree, type ParseProgress } from '../utils/zipParser';
import { DEFAULT_BLACKLIST, matchesGlob, getRelativePath } from '../utils/treeUtils';
import type { TreeNode } from '../types';

export const useFileTree = (blacklist: string[], allowedlist: string[]) => {
    // Структура дерева - НЕ меняется после загрузки
    const [fileTree, setFileTree] = useState<TreeNode | null>(null);

    // Только пути, которые пользователь ВРУЧНУЮ запретил (были разрешены → стали запрещены)
    const [manuallyDisabled, setManuallyDisabled] = useState<Set<string>>(new Set());

    // Только пути, которые пользователь ВРУЧНУЮ разрешил (были запрещены → стали разрешены)  
    const [manuallyEnabled, setManuallyEnabled] = useState<Set<string>>(new Set());

    // Loading state
    const [isLoading, setIsLoading] = useState(false);
    const [loadingPercent, setLoadingPercent] = useState(0);
    const [loadingStage, setLoadingStage] = useState<string>('');
    const [currentFile, setCurrentFile] = useState<string>('');

    // UI State
    const [zoom, setZoom] = useState(1);
    const [panX, setPanX] = useState(0);
    const [panY, setPanY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [search, setSearch] = useState('');

    const containerRef = useRef<HTMLDivElement | null>(null);

    const MIN_ZOOM = 0.25;
    const MAX_ZOOM = 3;
    const ZOOM_STEP = 0.1;

    /**
     * Проверяет, разрешён ли узел по умолчанию (без учёта ручных переопределений)
     */
    const isDefaultAllowed = useCallback((node: TreeNode): boolean => {
        const relativePath = getRelativePath(node);
        const name = node.name;

        // Проверяем дефолтный blacklist
        const isDefaultBlacklisted = DEFAULT_BLACKLIST.some(pattern =>
            matchesGlob(relativePath, pattern) || name === pattern
        );
        if (isDefaultBlacklisted) return false;

        // Проверяем пользовательский blacklist
        const isUserBlacklisted = blacklist.some(pattern =>
            matchesGlob(relativePath, pattern)
        );
        if (isUserBlacklisted) return false;

        // Проверяем пользовательский allowedlist (перезаписывает blacklist)
        const isUserAllowed = allowedlist.some(pattern =>
            matchesGlob(relativePath, pattern)
        );
        if (isUserAllowed) return true;

        // По умолчанию разрешён (если не в blacklist)
        return !isDefaultBlacklisted && !isUserBlacklisted;
    }, [blacklist, allowedlist]);

    /**
     * Проверяет, запрещён ли какой-либо родитель
     */
    const isAnyParentDisabled = useCallback((path: string): boolean => {
        const parts = path.split('/').filter(Boolean);
        let currentPath = '';

        for (let i = 0; i < parts.length - 1; i++) {
            currentPath += '/' + parts[i];
            if (manuallyDisabled.has(currentPath)) {
                return true;
            }
        }
        return false;
    }, [manuallyDisabled]);

    /**
     * Получает финальный статус узла с учётом всех факторов
     */
    const getNodeStatus = useCallback((node: TreeNode): boolean => {
        const path = node.path;

        // Если родитель запрещён вручную — мы тоже запрещены
        if (isAnyParentDisabled(path)) {
            return false;
        }

        // Если вручную запрещён
        if (manuallyDisabled.has(path)) {
            return false;
        }

        // Если вручную разрешён
        if (manuallyEnabled.has(path)) {
            return true;
        }

        // Иначе — дефолтный статус
        return isDefaultAllowed(node);
    }, [manuallyDisabled, manuallyEnabled, isDefaultAllowed, isAnyParentDisabled]);

    /**
     * Переключает статус узла
     */
    const toggleNodeStatus = useCallback((path: string): {
        nowAllowed: boolean;
        relativePath: string;
    } | null => {
        if (!fileTree) return null;

        // Находим узел для получения относительного пути
        const findNode = (node: TreeNode): TreeNode | null => {
            if (node.path === path) return node;
            for (const child of node.children || []) {
                const found = findNode(child);
                if (found) return found;
            }
            return null;
        };

        const node = findNode(fileTree);
        if (!node) return null;

        const wasAllowed = getNodeStatus(node);
        const nowAllowed = !wasAllowed;

        const parts = path.split('/').filter(Boolean);
        const relativePath = parts.length > 1 ? parts.slice(1).join('/') : node.name;

        // Собираем все пути узла и его детей для рекурсивного toggle
        const collectPaths = (n: TreeNode): string[] => {
            const paths = [n.path];
            n.children?.forEach(child => {
                paths.push(...collectPaths(child));
            });
            return paths;
        };

        const allPaths = collectPaths(node);

        if (nowAllowed) {
            // Разрешаем: удаляем из disabled, добавляем в enabled
            setManuallyDisabled(prev => {
                const next = new Set(prev);
                allPaths.forEach(p => next.delete(p));
                return next;
            });
            // Добавляем только корневой путь в enabled (чтобы перезаписать дефолт)
            if (!isDefaultAllowed(node)) {
                setManuallyEnabled(prev => new Set(prev).add(path));
            }
        } else {
            // Запрещаем: удаляем из enabled, добавляем в disabled
            setManuallyEnabled(prev => {
                const next = new Set(prev);
                allPaths.forEach(p => next.delete(p));
                return next;
            });
            setManuallyDisabled(prev => new Set(prev).add(path));
        }

        return { nowAllowed, relativePath };
    }, [fileTree, getNodeStatus, isDefaultAllowed]);

    /**
     * Парсинг ZIP-архива
     */
    const parseZipFile = useCallback(async (file: File) => {
        setIsLoading(true);
        setLoadingPercent(0);
        setLoadingStage('reading');
        setCurrentFile('');

        // Сбрасываем состояние
        setZoom(1);
        setPanX(0);
        setPanY(0);
        setManuallyDisabled(new Set());
        setManuallyEnabled(new Set());

        try {
            const handleProgress = (progress: ParseProgress) => {
                setLoadingPercent(progress.percent);
                setLoadingStage(progress.stage);
                if (progress.currentFile) {
                    setCurrentFile(progress.currentFile);
                }
            };

            const tree = await parseZipToTree(file, handleProgress);
            setFileTree(tree);
        } catch (error) {
            console.error('Error parsing ZIP:', error);
            throw error;
        } finally {
            setIsLoading(false);
            setLoadingPercent(0);
            setLoadingStage('');
            setCurrentFile('');
        }
    }, []);

    // Wheel listener для zoom
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            if (!fileTree) return;
            e.preventDefault();

            const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;

            setZoom(prevZoom => {
                const newZoom = Math.min(Math.max(prevZoom + delta, MIN_ZOOM), MAX_ZOOM);
                if (newZoom !== prevZoom) {
                    const rect = container.getBoundingClientRect();
                    const mouseX = e.clientX - rect.left;
                    const mouseY = e.clientY - rect.top;
                    const scale = newZoom / prevZoom;
                    setPanX(prev => mouseX - (mouseX - prev) * scale);
                    setPanY(prev => mouseY - (mouseY - prev) * scale);
                }
                return newZoom;
            });
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, [fileTree]);

    const zoomIn = useCallback(() => {
        if (!fileTree) return;
        setZoom(prev => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
    }, [fileTree]);

    const zoomOut = useCallback(() => {
        if (!fileTree) return;
        setZoom(prev => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
    }, [fileTree]);

    const resetZoom = useCallback(() => {
        setZoom(1);
        setPanX(0);
        setPanY(0);
    }, []);

    const onMouseDown = useCallback((e: React.MouseEvent) => {
        if (!fileTree) return;
        if ((e.target as HTMLElement).closest('.file-item')) return;
        setIsDragging(true);
        setStartX(e.clientX - panX);
        setStartY(e.clientY - panY);
    }, [panX, panY, fileTree]);

    const onMouseMove = useCallback((e: React.MouseEvent) => {
        if (isDragging) {
            setPanX(e.clientX - startX);
            setPanY(e.clientY - startY);
        }
    }, [isDragging, startX, startY]);

    const onMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    return {
        fileTree,
        isLoading,
        loadingPercent,
        loadingStage,
        currentFile,
        zoom, panX, panY, isDragging, search,
        setSearch, zoomIn, zoomOut, resetZoom,
        onMouseDown, onMouseMove, onMouseUp,
        containerRef,
        toggleNodeStatus,
        parseZipFile,
        getNodeStatus, // Новая функция для получения статуса
    };
};