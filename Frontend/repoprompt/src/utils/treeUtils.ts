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

// ============ GLOB MATCHING ============

/**
 * Преобразует glob-паттерн в RegExp
 * Поддерживает:
 *   *      — любые символы кроме /
 *   **     — любые символы включая / (рекурсивно)
 *   ?      — один любой символ
 *   *.tsx  — все .tsx файлы в текущей директории
 *   ** /*.tsx — все .tsx файлы везде
 */
function globToRegex(pattern: string): RegExp {
    // Экранируем спецсимволы RegExp, кроме * и ?
    let regexStr = pattern
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')  // экранируем спецсимволы
        .replace(/\*\*/g, '{{GLOBSTAR}}')       // временно заменяем **
        .replace(/\*/g, '[^/]*')                // * = любые символы кроме /
        .replace(/\?/g, '[^/]')                 // ? = один символ кроме /
        .replace(/\{\{GLOBSTAR\}\}/g, '.*');    // ** = любые символы

    return new RegExp(`^${regexStr}$`);
}

/**
 * Проверяет, совпадает ли путь с glob-паттерном
 */
export function matchesGlob(path: string, pattern: string): boolean {
    // Нормализуем путь (убираем начальный /)
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path;

    // Получаем имя файла/папки
    const name = normalizedPath.split('/').pop() || '';

    // Случай 1: Паттерн начинается с точки — это расширение файла
    // .tsx → **/*.tsx (все файлы с этим расширением везде)
    if (pattern.startsWith('.') && !pattern.includes('/')) {
        const extPattern = `**/*${pattern}`;
        return globToRegex(extPattern).test(normalizedPath);
    }

    // Случай 2: Паттерн без / и без точки — имя файла или папки
    // node_modules → **/node_modules/** или **/node_modules
    if (!pattern.includes('/') && !pattern.startsWith('.')) {
        // Проверяем точное совпадение имени
        if (name === pattern) return true;
        // Проверяем как часть пути
        const segments = normalizedPath.split('/');
        return segments.includes(pattern);
    }

    // Случай 3: Паттерн с ** — полный glob
    if (pattern.includes('**')) {
        return globToRegex(pattern).test(normalizedPath);
    }

    // Случай 4: Паттерн с / но без ** — конкретный путь
    // src/*.tsx → только файлы .tsx непосредственно в src
    // src/components → папка src/components
    return globToRegex(pattern).test(normalizedPath);
}

/**
 * Проверяет, попадает ли узел под какой-либо паттерн из списка
 */
export function matchesAnyPattern(node: TreeNode, patterns: string[]): boolean {
    const relativePath = getRelativePath(node);
    return patterns.some(pattern => matchesGlob(relativePath, pattern));
}

// ============ TREE UTILS ============

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

export function getRelativePath(node: TreeNode): string {
    const parts = node.path.split('/').filter(Boolean);
    return parts.length > 1 ? parts.slice(1).join('/') : node.name;
}

/**
 * Применяет фильтры к дереву
 * @param isInitial - true при первой загрузке (сохраняет originalStatus)
 */
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
        const relativePath = getRelativePath(node);

        // Определяем дефолтное состояние
        let defaultAllowed = true;

        // Проверяем дефолтный blacklist
        if (DEFAULT_BLACKLIST.some(pattern => matchesGlob(relativePath, pattern) || name === pattern)) {
            defaultAllowed = false;
        }

        // Если родитель запрещён — дети тоже
        if (parentForbidden) {
            defaultAllowed = false;
        }

        // При первой загрузке сохраняем исходный статус
        if (isInitial) {
            originalStatus[node.path] = defaultAllowed;
        }

        // Начинаем с дефолтного состояния
        node.allowed = defaultAllowed;

        // Применяем пользовательский blacklist (glob-паттерны)
        if (blacklist.some(pattern => matchesGlob(relativePath, pattern))) {
            node.allowed = false;
        }

        // Применяем пользовательский allowedlist (перезаписывает blacklist)
        if (allowedlist.some(pattern => matchesGlob(relativePath, pattern))) {
            node.allowed = true;
        }

        // Рекурсивно обрабатываем детей
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
        const relativePath = getRelativePath(node);
        output.push(`├─ ${relativePath}\n${node.content}\n\n`);
    }
    if (node.children) {
        node.children.forEach(child => collectFilesForDownload(child, output));
    }
    return output;
}

export function collectFilesForCopy(node: TreeNode, output: string[] = []): string[] {
    if (node.type === 'file' && node.allowed && node.content) {
        const relativePath = getRelativePath(node);
        output.push(`├─ ${relativePath}\n\`\`\`\n${node.content}\n\`\`\`\n\n`);
    }
    if (node.children) {
        node.children.forEach(child => collectFilesForCopy(child, output));
    }
    return output;
}