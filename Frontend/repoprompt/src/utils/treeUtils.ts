import type { TreeNode } from '../types';

export const DEFAULT_BLACKLIST = [
    '.git',
    'node_modules',
    'build',
    'dist',
    '.next',
    '__pycache__',
    '.venv',
    'venv',
    '.env',
    '.DS_Store',
    'Thumbs.db',
    'coverage',
    '.idea',
    '.vscode'
];

export function findNode(tree: TreeNode | null, path: string): TreeNode | null {
    if (!tree) return null;
    if (tree.path === path) return tree;
    if (tree.children) {
        for (const child of tree.children) {
            const found = findNode(child, path);
            if (found) return found;
        }
    }
    return null;
}

export function setNodeStatus(node: TreeNode, status: boolean): void {
    node.allowed = status;
    if (node.children) {
        node.children.forEach(child => setNodeStatus(child, status));
    }
}

export function applyFilters(
    fileTree: TreeNode | null,
    blacklist: string[],
    allowedlist: string[],
    originalStatus: Record<string, boolean>,
    isInitial: boolean = false
): void {
    if (!fileTree) return;

    function applyToNode(node: TreeNode, parentForbidden: boolean = false): void {
        const name = node.name;
        const relativePath = node.path.split('/').filter(Boolean).slice(1).join('/') || name;

        let defaultAllowed = true;

        // Проверяем дефолтный blacklist
        if (DEFAULT_BLACKLIST.some(b => name === b || name.startsWith(b + '/'))) {
            defaultAllowed = false;
        }

        // Если родитель запрещён
        if (parentForbidden) {
            defaultAllowed = false;
        }

        // При первой загрузке сохраняем исходный статус
        if (isInitial) {
            originalStatus[node.path] = defaultAllowed;
        }

        node.allowed = defaultAllowed;

        // Применяем пользовательский blacklist
        if (blacklist.some(b => name === b || name.endsWith(b) || relativePath === b || relativePath.startsWith(b + '/'))) {
            node.allowed = false;
        }

        // Применяем пользовательский whitelist (перезаписывает blacklist)
        if (allowedlist.some(w => name === w || name.endsWith(w) || relativePath === w || relativePath.startsWith(w + '/'))) {
            node.allowed = true;
        }

        if (node.children) {
            node.children.forEach(child => applyToNode(child, !node.allowed));
        }
    }

    applyToNode(fileTree);
}

export function estimateTokens(content: string): number {
    return Math.ceil(content.length / 4);
}

export function collectFilesForDownload(node: TreeNode, output: string[] = []): string[] {
    if (node.type === 'file' && node.allowed && node.content) {
        const relativePath = node.path.split('/').filter(Boolean).slice(1).join('/');
        output.push(`├─ ${relativePath}\n${node.content}\n\n`);
    }
    if (node.children) {
        node.children.forEach(child => collectFilesForDownload(child, output));
    }
    return output;
}

export function collectFilesForCopy(node: TreeNode, output: string[] = []): string[] {
    if (node.type === 'file' && node.allowed && node.content) {
        const relativePath = node.path.split('/').filter(Boolean).slice(1).join('/');
        output.push(`├─ ${relativePath}\n\`\`\`\n${node.content}\n\`\`\`\n\n`);
    }
    if (node.children) {
        node.children.forEach(child => collectFilesForCopy(child, output));
    }
    return output;
}

// ЭТА ФУНКЦИЯ БЫЛА ПРОПУЩЕНА — добавляем её
export function getRelativePath(node: TreeNode): string {
    const parts = node.path.split('/').filter(Boolean);
    return parts.length > 1 ? parts.slice(1).join('/') : node.name;
}