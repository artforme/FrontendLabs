import { useState, useEffect, useCallback, useRef } from 'react';
import { parseZipToTree, type ParseProgress } from '../utils/zipParser';
import { applyFilters, getRelativePath } from '../utils/treeUtils';
import type { TreeNode } from '../types';

export const useFileTree = (blacklist: string[], allowedlist: string[]) => {
    const [fileTree, setFileTree] = useState<TreeNode | null>(null);

    // Удалены manuallyDisabled / manuallyEnabled - теперь списки это единственный источник правды

    // Loading state
    const [isLoading, setIsLoading] = useState(false);
    const [loadingPercent, setLoadingPercent] = useState(0);
    const [loadingStage, setLoadingStage] = useState<string>('');
    const [currentFile, setCurrentFile] = useState<string>('');

    // Zoom & Pan states
    const [zoom, setZoom] = useState(1);
    const [search, setSearch] = useState('');

    // Refs for zoom/pan logic
    const panRef = useRef({ x: 0, y: 0 });
    const isDraggingRef = useRef(false);
    const startPosRef = useRef({ x: 0, y: 0 });
    const contentRef = useRef<HTMLDivElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const MIN_ZOOM = 0.25;
    const MAX_ZOOM = 3;
    const ZOOM_STEP = 0.1;

    // === Sync Logic: Пересчитываем дерево при изменении списков ===
    useEffect(() => {
        if (fileTree) {
            // Эта функция мутирует свойство .allowed внутри fileTree
            applyFilters(fileTree, blacklist, allowedlist);

            // Форсируем обновление компонента, создавая новую ссылку на объект
            // (React не увидит изменений внутри глубокого объекта без этого)
            setFileTree({ ...fileTree });
        }
    }, [blacklist, allowedlist, fileTree]); // fileTree в зависимостях нужен, чтобы при загрузке нового файла сразу применились фильтры

    // === Zoom/Pan Logic (без изменений) ===
    const applyTransform = useCallback(() => {
        if (contentRef.current) {
            const { x, y } = panRef.current;
            contentRef.current.style.transform = `translate(${x}px, ${y}px) scale(${zoom})`;
        }
    }, [zoom]);

    const onMouseDown = useCallback((e: React.MouseEvent) => {
        if (!fileTree) return;
        if ((e.target as HTMLElement).closest('.file-item')) return;
        isDraggingRef.current = true;
        startPosRef.current = {
            x: e.clientX - panRef.current.x,
            y: e.clientY - panRef.current.y
        };
        if (containerRef.current) containerRef.current.style.cursor = 'grabbing';
    }, [fileTree]);

    const onMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDraggingRef.current) return;
        panRef.current = {
            x: e.clientX - startPosRef.current.x,
            y: e.clientY - startPosRef.current.y
        };
        requestAnimationFrame(applyTransform);
    }, [applyTransform]);

    const onMouseUp = useCallback(() => {
        isDraggingRef.current = false;
        if (containerRef.current) containerRef.current.style.cursor = fileTree ? 'grab' : 'default';
    }, [fileTree]);

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
                    panRef.current = {
                        x: mouseX - (mouseX - panRef.current.x) * scale,
                        y: mouseY - (mouseY - panRef.current.y) * scale
                    };
                }
                return newZoom;
            });
        };
        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, [fileTree]);

    useEffect(() => {
        applyTransform();
    }, [zoom, applyTransform]);

    const zoomIn = useCallback(() => { if (fileTree) setZoom(prev => Math.min(prev + ZOOM_STEP, MAX_ZOOM)); }, [fileTree]);
    const zoomOut = useCallback(() => { if (fileTree) setZoom(prev => Math.max(prev - ZOOM_STEP, MIN_ZOOM)); }, [fileTree]);
    const resetZoom = useCallback(() => { setZoom(1); panRef.current = { x: 0, y: 0 }; applyTransform(); }, [applyTransform]);

    // === Parsing ===
    const parseZipFile = useCallback(async (file: File) => {
        setIsLoading(true);
        setLoadingPercent(0);
        setLoadingStage('reading');
        setCurrentFile('');
        setZoom(1);
        panRef.current = { x: 0, y: 0 };

        try {
            const handleProgress = (progress: ParseProgress) => {
                setLoadingPercent(progress.percent);
                setLoadingStage(progress.stage);
                if (progress.currentFile) setCurrentFile(progress.currentFile);
            };

            const tree = await parseZipToTree(file, handleProgress);
            // Сразу применяем текущие фильтры к новому дереву
            applyFilters(tree, blacklist, allowedlist);
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
    }, [blacklist, allowedlist]); // Зависимости важны

    // Helper для получения статуса (теперь просто читает свойство)
    const getNodeStatus = useCallback((node: TreeNode): boolean => {
        return node.allowed;
    }, []);

    // Helper для получения относительного пути
    const getPath = useCallback((node: TreeNode): string => {
        return getRelativePath(node);
    }, []);

    return {
        fileTree,
        isLoading,
        loadingPercent,
        loadingStage,
        currentFile,
        zoom,
        search,
        setSearch,
        zoomIn,
        zoomOut,
        resetZoom,
        onMouseDown,
        onMouseMove,
        onMouseUp,
        containerRef,
        contentRef,
        parseZipFile,
        getNodeStatus,
        getPath, // Экспортируем helper
    };
};