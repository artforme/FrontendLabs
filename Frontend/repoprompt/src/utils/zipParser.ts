// utils/zipParser.ts - оптимизированная версия

import JSZip from 'jszip';
import type { TreeNode } from '../types';
import { DEFAULT_BLACKLIST } from './treeUtils';

// ★ Список бинарных расширений - НЕ читаем их содержимое
const BINARY_EXTENSIONS = new Set([
    // Изображения
    'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico', 'bmp', 'tiff',
    // Шрифты
    'woff', 'woff2', 'ttf', 'otf', 'eot',
    // Аудио/Видео
    'mp3', 'mp4', 'wav', 'ogg', 'webm', 'avi', 'mov',
    // Архивы
    'zip', 'rar', '7z', 'tar', 'gz',
    // Бинарники
    'exe', 'dll', 'so', 'dylib', 'bin',
    // Документы
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    // Прочее
    'lock', 'map',
]);

// ★ Максимальный размер файла для чтения (в байтах)
const MAX_FILE_SIZE = 1024 * 1024; // 1 MB

export interface ParseProgress {
    stage: 'reading' | 'extracting' | 'building';
    percent: number;
    currentFile?: string;
}

export type ProgressCallback = (progress: ParseProgress) => void;

function isBinaryFile(filename: string): boolean {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    return BINARY_EXTENSIONS.has(ext);
}

function findCommonRoot(paths: string[]): string | null {
    const validPaths = paths.filter(p =>
        p && !p.startsWith('__MACOSX') && !p.startsWith('.')
    );

    if (validPaths.length === 0) return null;

    const firstSegments = validPaths.map(p => p.split('/')[0]);
    const firstSegment = firstSegments[0];
    const allSameRoot = firstSegments.every(seg => seg === firstSegment);

    if (allSameRoot && firstSegment) {
        return firstSegment;
    }

    return null;
}

export async function parseZipToTree(
    file: File,
    onProgress?: ProgressCallback
): Promise<TreeNode> {
    onProgress?.({ stage: 'reading', percent: 0 });

    const arrayBuffer = await file.arrayBuffer();
    onProgress?.({ stage: 'reading', percent: 20 });

    const zip = await JSZip.loadAsync(arrayBuffer);
    onProgress?.({ stage: 'extracting', percent: 30 });

    const allPaths = Object.keys(zip.files);
    const commonRoot = findCommonRoot(allPaths);
    const projectName = commonRoot || file.name.replace('.zip', '');

    const root: TreeNode = {
        name: projectName,
        path: '/' + projectName,
        type: 'folder',
        allowed: true,
        expanded: true,
        children: []
    };

    const nodeMap = new Map<string, TreeNode>();
    nodeMap.set(root.path, root);

    const entries = Object.entries(zip.files);
    // const totalFiles = entries.length;
    let processed = 0;

    // ★ Сначала строим структуру БЕЗ чтения содержимого
    for (const [relativePath, zipEntry] of entries) {
        if (!relativePath || relativePath.startsWith('__MACOSX')) {
            processed++;
            continue;
        }

        let cleanPath = relativePath.replace(/\/$/, '');
        if (!cleanPath) {
            processed++;
            continue;
        }

        if (commonRoot && cleanPath.startsWith(commonRoot + '/')) {
            cleanPath = cleanPath.slice(commonRoot.length + 1);
        } else if (commonRoot && cleanPath === commonRoot) {
            processed++;
            continue;
        }

        if (!cleanPath) {
            processed++;
            continue;
        }

        const pathParts = cleanPath.split('/');
        const isDirectory = zipEntry.dir;

        let currentPath = root.path;
        let parentNode = root;

        for (let i = 0; i < pathParts.length; i++) {
            const part = pathParts[i];
            if (!part) continue;

            const newPath = `${currentPath}/${part}`;
            const isLastPart = i === pathParts.length - 1;
            const isFolder = isDirectory || !isLastPart;

            let node = nodeMap.get(newPath);

            if (!node) {
                const isDefaultBlacklisted = DEFAULT_BLACKLIST.some(pattern => {
                    if (part === pattern) return true;
                    if (pattern.startsWith('*.')) {
                        return part.endsWith(pattern.slice(1));
                    }
                    return false;
                });

                node = {
                    name: part,
                    path: newPath,
                    type: isFolder ? 'folder' : 'file',
                    allowed: !isDefaultBlacklisted,
                    expanded: !isDefaultBlacklisted && i < 2,
                    children: isFolder ? [] : undefined,
                    content: undefined
                };

                nodeMap.set(newPath, node);

                if (parentNode.children) {
                    const exists = parentNode.children.some(c => c.path === newPath);
                    if (!exists) {
                        parentNode.children.push(node);
                    }
                }
            }

            currentPath = newPath;
            parentNode = node;
        }

        processed++;
    }

    onProgress?.({ stage: 'extracting', percent: 50 });

    // ★ Теперь читаем только РАЗРЕШЁННЫЕ ТЕКСТОВЫЕ файлы
    let contentProcessed = 0;
    const nodesToRead: { node: TreeNode; zipEntry: JSZip.JSZipObject }[] = [];

    // Собираем файлы для чтения
    for (const [relativePath, zipEntry] of entries) {
        if (zipEntry.dir) continue;

        let cleanPath = relativePath.replace(/\/$/, '');
        if (commonRoot && cleanPath.startsWith(commonRoot + '/')) {
            cleanPath = cleanPath.slice(commonRoot.length + 1);
        }

        const nodePath = root.path + '/' + cleanPath;
        const node = nodeMap.get(nodePath);

        if (node && node.allowed && node.type === 'file') {
            // ★ Пропускаем бинарные файлы
            if (isBinaryFile(node.name)) {
                node.content = `[Binary file: ${node.name}]`;
                continue;
            }

            nodesToRead.push({ node, zipEntry });
        }
    }

    // Читаем содержимое
    for (const { node, zipEntry } of nodesToRead) {
        try {
            onProgress?.({
                stage: 'extracting',
                percent: 50 + Math.round((contentProcessed / nodesToRead.length) * 40),
                currentFile: node.name
            });

            // ★ Проверяем размер файла
            // @ts-ignore - _data существует в JSZip
            const fileSize = zipEntry._data?.uncompressedSize || 0;

            if (fileSize > MAX_FILE_SIZE) {
                node.content = `[File too large: ${(fileSize / 1024 / 1024).toFixed(2)} MB]`;
            } else {
                const content = await zipEntry.async('string');
                node.content = content;
            }
        } catch (e) {
            node.content = `[Read error: ${node.name}]`;
        }

        contentProcessed++;
    }

    sortTreeNodes(root);
    onProgress?.({ stage: 'building', percent: 100 });

    return root;
}

function sortTreeNodes(node: TreeNode): void {
    if (node.children && node.children.length > 0) {
        node.children.sort((a, b) => {
            if (a.type === 'folder' && b.type === 'file') return -1;
            if (a.type === 'file' && b.type === 'folder') return 1;
            return a.name.localeCompare(b.name);
        });

        node.children.forEach(sortTreeNodes);
    }
}

export function isTextFile(filename: string): boolean {
    return !isBinaryFile(filename);
}