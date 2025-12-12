import { useState, useEffect } from 'react';
import mockTree from '../assets/mockFileTree.json';
import { applyFilters, findNode, setNodeStatus } from '../utils/treeUtils';
import type { TreeNode } from '../types';

export const useFileTree = (blacklist: string[], allowedlist: string[]) => {
    const [fileTree, setFileTree] = useState<TreeNode | null>(null);
    const [originalStatus, setOriginalStatus] = useState<Record<string, boolean>>({});
    
    // UI State
    const [zoom, setZoom] = useState(1);
    const [panX, setPanX] = useState(0);
    const [panY, setPanY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [search, setSearch] = useState('');

    useEffect(() => {
        setFileTree(mockTree as TreeNode);
        applyFilters(mockTree as TreeNode, blacklist, allowedlist, originalStatus, true);
    }, []);

    useEffect(() => {
        if (fileTree) {
            applyFilters(fileTree, blacklist, allowedlist, originalStatus);
            setFileTree({ ...fileTree });
        }
    }, [blacklist, allowedlist]);

    const zoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
    const zoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
    const resetZoom = () => {
        setZoom(1);
        setPanX(0);
        setPanY(0);
    };

    const onMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setStartX(e.clientX - panX);
        setStartY(e.clientY - panY);
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setPanX(e.clientX - startX);
            setPanY(e.clientY - startY);
        }
    };

    const onMouseUp = () => setIsDragging(false);

    const toggleNodeStatus = (path: string) => {
        if (!fileTree) return;
        const node = findNode(fileTree, path);
        if (node) {
            const newStatus = !node.allowed;
            setNodeStatus(node, newStatus);
            setFileTree({ ...fileTree });
        }
    };

    const simulateFileUpload = () => {
        setFileTree(mockTree as TreeNode);
        const newOriginalStatus = {};
        applyFilters(mockTree as TreeNode, [], [], newOriginalStatus, true);
        setOriginalStatus(newOriginalStatus);
    };

    // Filter tree for search
    const filteredTree = fileTree ? filterTreeBySearch(fileTree, search) : null;

    return {
        fileTree: filteredTree,
        setFileTree,      // <-- ЭТО ВАЖНО, ОНО БЫЛО ПРОПУЩЕНО В ТВОЕМ КОДЕ
        originalStatus,   // <-- И ЭТО
        zoom, panX, panY, isDragging, search,
        setSearch, zoomIn, zoomOut, resetZoom,
        onMouseDown, onMouseMove, onMouseUp,
        toggleNodeStatus,
        simulateFileUpload,
    };
};

function filterTreeBySearch(node: TreeNode, query: string): TreeNode | null {
    if (!query) return node;
    const nameMatch = node.name.toLowerCase().includes(query.toLowerCase());
    
    if (node.type === 'file') {
        return nameMatch ? node : null;
    }

    if (node.type === 'folder') {
        const filteredChildren = node.children
            ?.map(child => filterTreeBySearch(child, query))
            .filter(Boolean) as TreeNode[];
            
        if (nameMatch || (filteredChildren && filteredChildren.length > 0)) {
            return { ...node, children: filteredChildren || [] };
        }
    }
    return null;
}