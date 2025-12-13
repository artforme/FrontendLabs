import { useState, useEffect, useCallback, useRef } from 'react';
import mockTree from '../assets/mockFileTree.json';
import { applyFilters, findNode, setNodeStatus } from '../utils/treeUtils';
import type { TreeNode } from '../types';

export const useFileTree = (blacklist: string[], allowedlist: string[]) => {
    const [fileTree, setFileTree] = useState<TreeNode | null>(null);
    const [originalStatus, setOriginalStatus] = useState<Record<string, boolean>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [loadingPercent, setLoadingPercent] = useState(0);

    // UI State
    const [zoom, setZoom] = useState(1);
    const [panX, setPanX] = useState(0);
    const [panY, setPanY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [search, setSearch] = useState('');

    // Ref для контейнера и актуального состояния fileTree
    const containerRef = useRef<HTMLDivElement | null>(null);
    const fileTreeRef = useRef<TreeNode | null>(null);

    // Синхронизируем ref с state (для доступа в event listener)
    useEffect(() => {
        fileTreeRef.current = fileTree;
    }, [fileTree]);

    // Zoom с ограничениями
    const MIN_ZOOM = 0.25;
    const MAX_ZOOM = 3;
    const ZOOM_STEP = 0.1;

    // Применяем фильтры при изменении blacklist/allowedlist
    useEffect(() => {
        if (fileTree) {
            const treeCopy = JSON.parse(JSON.stringify(fileTree));
            applyFilters(treeCopy, blacklist, allowedlist, originalStatus, false);
            setFileTree(treeCopy);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [blacklist, allowedlist]);

    // Добавляем wheel listener с { passive: false }
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            // Не зумим если дерево не загружено
            if (!fileTreeRef.current) return;

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

        return () => {
            container.removeEventListener('wheel', handleWheel);
        };
    }, []);

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
        // Не драгаем если дерево не загружено
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

    const toggleNodeStatus = useCallback((path: string): {
        wasAllowed: boolean;
        wasOriginallyAllowed: boolean;
        relativePath: string;
    } | null => {
        if (!fileTree) return null;

        const node = findNode(fileTree, path);
        if (!node) return null;

        const wasAllowed = node.allowed;
        const wasOriginallyAllowed = originalStatus[path] !== false;
        const newStatus = !wasAllowed;

        const parts = path.split('/').filter(Boolean);
        const relativePath = parts.length > 1 ? parts.slice(1).join('/') : node.name;

        const treeCopy = JSON.parse(JSON.stringify(fileTree));
        const nodeCopy = findNode(treeCopy, path);
        if (nodeCopy) {
            setNodeStatus(nodeCopy, newStatus);
        }
        setFileTree(treeCopy);

        return {
            wasAllowed,
            wasOriginallyAllowed,
            relativePath
        };
    }, [fileTree, originalStatus]);

    const simulateFileUpload = useCallback(() => {
        setIsLoading(true);
        setLoadingPercent(0);

        // Сбрасываем zoom/pan при новой загрузке
        setZoom(1);
        setPanX(0);
        setPanY(0);

        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);

                setTimeout(() => {
                    const newTree = JSON.parse(JSON.stringify(mockTree)) as TreeNode;
                    const newOriginalStatus: Record<string, boolean> = {};
                    applyFilters(newTree, [], [], newOriginalStatus, true);
                    setOriginalStatus(newOriginalStatus);
                    setFileTree(newTree);
                    setIsLoading(false);
                    setLoadingPercent(0);
                }, 300);
            }
            setLoadingPercent(Math.round(progress));
        }, 100);
    }, []);

    return {
        fileTree,
        originalFileTree: fileTree,
        originalStatus,
        setFileTree,
        isLoading,
        loadingPercent,
        zoom, panX, panY, isDragging, search,
        setSearch, zoomIn, zoomOut, resetZoom,
        onMouseDown, onMouseMove, onMouseUp,
        containerRef,
        toggleNodeStatus,
        simulateFileUpload,
    };
};