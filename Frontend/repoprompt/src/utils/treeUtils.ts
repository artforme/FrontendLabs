import type { TreeNode } from '../types';

// ============ ДЕФОЛТНЫЙ BLACKLIST ============

export const DEFAULT_BLACKLIST = [
    // Git
    '.git',
    '.gitignore',
    '.gitattributes',
    '.gitmodules',

    // Dependencies
    'node_modules',
    'vendor',
    'bower_components',
    'jspm_packages',

    // Python
    '__pycache__',
    '.venv',
    'venv',
    'env',
    '.env',
    '.env.local',
    '.env.*.local',
    '*.pyc',
    '*.pyo',
    '*.egg-info',
    '.eggs',
    '.pytest_cache',
    '.mypy_cache',

    // Build outputs
    'build',
    'dist',
    'out',
    'target',
    '.next',
    '.nuxt',
    '.output',
    '.vercel',
    '.netlify',

    // IDE / Editors
    '.idea',
    '.vscode',
    '*.swp',
    '*.swo',
    '.project',
    '.classpath',
    '.settings',

    // OS files
    '.DS_Store',
    'Thumbs.db',
    'desktop.ini',

    // Logs
    '*.log',
    'npm-debug.log*',
    'yarn-debug.log*',
    'yarn-error.log*',
    'logs',

    // Cache
    '.cache',
    '.parcel-cache',
    '.eslintcache',
    '.stylelintcache',

    // Coverage
    'coverage',
    '.nyc_output',
    'htmlcov',

    // Lock files (опционально, можно убрать)
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    'composer.lock',
    'Gemfile.lock',
    'poetry.lock',

    // Misc
    '.terraform',
    '.serverless',
    '*.min.js',
    '*.min.css',
    '*.map',
];

// ============ GLOB MATCHING ============

/**
 * Преобразует glob-паттерн в RegExp
 * Поддерживает:
 * - * — любые символы кроме /
 * - ** — любые символы включая / (рекурсивно)
 * - ? — один любой символ
 * - *.tsx — все .tsx файлы в текущей директории
 * - **\/*.tsx — все .tsx файлы везде
 */
function globToRegex(pattern: string): RegExp {
    // Экранируем спецсимволы RegExp, кроме * и ?
    let regexStr = pattern
        .replace(/[.+^${}()|[\]\\]/g, '\\$&') // экранируем спецсимволы
        .replace(/\*\*/g, '{{GLOBSTAR}}')      // временно заменяем **
        .replace(/\*/g, '[^/]*')               // * = любые символы кроме /
        .replace(/\?/g, '[^/]')                // ? = один символ кроме /
        .replace(/{{GLOBSTAR}}/g, '.*');       // ** = любые символы

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
    if (pattern.startsWith('.') && !pattern.includes('/') && !pattern.includes('*')) {
        // Проверяем расширение файла
        return name.endsWith(pattern);
    }

    // Случай 2: Паттерн с * но без / — это glob на имя файла
    // *.tsx → любой файл .tsx в любой папке
    if (pattern.includes('*') && !pattern.includes('/')) {
        const extPattern = `**/${pattern}`;
        return globToRegex(extPattern).test(normalizedPath);
    }

    // Случай 3: Паттерн без / и без * — имя файла или папки
    // node_modules → **/node_modules или **/node_modules/**
    if (!pattern.includes('/') && !pattern.includes('*')) {
        // Проверяем точное совпадение имени
        if (name === pattern) return true;
        // Проверяем как часть пути
        const segments = normalizedPath.split('/');
        return segments.includes(pattern);
    }

    // Случай 4: Паттерн с ** — полный glob
    if (pattern.includes('**')) {
        return globToRegex(pattern).test(normalizedPath);
    }

    // Случай 5: Паттерн с / но без ** — конкретный путь
    // src/*.tsx → только файлы .tsx непосредственно в src
    return globToRegex(pattern).test(normalizedPath);
}

/**
 * Проверяет, попадает ли узел под какой-либо паттерн из списка
 */
export function matchesAnyPattern(node: TreeNode, patterns: string[]): boolean {
    const relativePath = getRelativePath(node);
    return patterns.some(pattern => matchesGlob(relativePath, pattern));
}

// ============ TREE NAVIGATION ============

/**
 * Находит узел в дереве по пути
 */
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

/**
 * Устанавливает статус узла и всех его потомков рекурсивно
 */
export function setNodeStatus(node: TreeNode, status: boolean): void {
    node.allowed = status;
    if (node.children) {
        node.children.forEach(child => setNodeStatus(child, status));
    }
}

/**
 * Получает относительный путь (без имени корневой папки)
 */
export function getRelativePath(node: TreeNode): string {
    const parts = node.path.split('/').filter(Boolean);
    return parts.length > 1 ? parts.slice(1).join('/') : node.name;
}

// ============ ФИЛЬТРАЦИЯ ============

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
        const isDefaultBlacklisted = DEFAULT_BLACKLIST.some(pattern =>
            matchesGlob(relativePath, pattern) || name === pattern
        );

        if (isDefaultBlacklisted) {
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

// ============ СТАТИСТИКА ============

/**
 * Оценивает количество токенов в тексте (примерно 4 символа = 1 токен)
 */
export function estimateTokens(content: string): number {
    if (!content) return 0;
    return Math.ceil(content.length / 4);
}

/**
 * Считает статистику по дереву
 */
export function calculateTreeStats(node: TreeNode | null): {
    total: number;
    allowed: number;
    forbidden: number;
    tokens: number;
} {
    if (!node) return { total: 0, allowed: 0, forbidden: 0, tokens: 0 };

    let total = 0;
    let allowed = 0;
    let forbidden = 0;
    let tokens = 0;

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
}

// ============ ГЕНЕРАЦИЯ СТРУКТУРЫ ============

/**
 * Генерирует текстовое представление структуры дерева
 * @param onlyAllowed - если true, показывает только разрешённые элементы
 */
export function generateTreeStructure(
    node: TreeNode,
    prefix: string = '',
    onlyAllowed: boolean = true
): string[] {
    const lines: string[] = [];

    // Пропускаем запрещённые если нужно
    if (onlyAllowed && !node.allowed) return lines;

    const isRoot = prefix === '';

    // Для корня просто выводим имя
    if (isRoot) {
        lines.push(`📁 ${node.name}/`);
    }

    // Обрабатываем детей
    if (node.type === 'folder' && node.children) {
        const children = onlyAllowed
            ? node.children.filter(c => c.allowed)
            : node.children;

        // Сортируем: папки сначала, потом файлы, алфавитно
        const sortedChildren = [...children].sort((a, b) => {
            if (a.type === 'folder' && b.type === 'file') return -1;
            if (a.type === 'file' && b.type === 'folder') return 1;
            return a.name.localeCompare(b.name);
        });

        sortedChildren.forEach((child, index) => {
            const isLast = index === sortedChildren.length - 1;
            const connector = isLast ? '└── ' : '├── ';
            const newPrefix = prefix + (isLast ? '    ' : '│   ');

            const icon = child.type === 'folder' ? '📁' : '📄';
            const suffix = child.type === 'folder' ? '/' : '';

            lines.push(`${prefix}${connector}${icon} ${child.name}${suffix}`);

            // Рекурсивно для папок
            if (child.type === 'folder' && child.children) {
                const childLines = generateTreeStructure(child, newPrefix, onlyAllowed);
                // Пропускаем первую строку (она уже добавлена выше)
                lines.push(...childLines.slice(1));
            }
        });
    }

    return lines;
}

// ============ DFS СБОР ФАЙЛОВ ============

/**
 * DFS-обход дерева для сбора разрешённых файлов
 * Обходит дерево в глубину: сначала все файлы папки, потом подпапки
 */
export function collectAllowedFilesDFS(
    node: TreeNode,
    output: string[] = []
): string[] {
    // Если узел запрещён — пропускаем его и все вложенные
    if (!node.allowed) {
        return output;
    }

    // Если это файл с содержимым — добавляем
    if (node.type === 'file') {
        if (node.content) {
            const relativePath = getRelativePath(node);

            output.push(`\n${'─'.repeat(60)}\n`);
            output.push(`📄 ${relativePath}\n`);
            output.push(`${'─'.repeat(60)}\n`);
            output.push(`${node.content}\n`);
        }
        return output;
    }

    // Если это папка — рекурсивно обходим детей (DFS)
    if (node.type === 'folder' && node.children) {
        // Сортируем: папки сначала, затем файлы
        const sortedChildren = [...node.children].sort((a, b) => {
            if (a.type === 'folder' && b.type === 'file') return -1;
            if (a.type === 'file' && b.type === 'folder') return 1;
            return a.name.localeCompare(b.name);
        });

        for (const child of sortedChildren) {
            collectAllowedFilesDFS(child, output);
        }
    }

    return output;
}

/**
 * DFS-обход с markdown-форматированием для копирования
 */
export function collectAllowedFilesMarkdown(
    node: TreeNode,
    output: string[] = []
): string[] {
    if (!node.allowed) {
        return output;
    }

    if (node.type === 'file') {
        if (node.content) {
            const relativePath = getRelativePath(node);
            const ext = node.name.split('.').pop() || 'txt';

            output.push(`\n### \`${relativePath}\`\n\n`);
            output.push(`\`\`\`${ext}\n`);
            output.push(`${node.content}\n`);
            output.push(`\`\`\`\n`);
        }
        return output;
    }

    if (node.type === 'folder' && node.children) {
        const sortedChildren = [...node.children].sort((a, b) => {
            if (a.type === 'folder' && b.type === 'file') return -1;
            if (a.type === 'file' && b.type === 'folder') return 1;
            return a.name.localeCompare(b.name);
        });

        for (const child of sortedChildren) {
            collectAllowedFilesMarkdown(child, output);
        }
    }

    return output;
}

// ============ ГЕНЕРАЦИЯ ВЫХОДНЫХ ФАЙЛОВ ============

/**
 * Собирает файлы для скачивания (.txt) с красивым форматированием
 */
export function collectFilesForDownload(node: TreeNode): string[] {
    const output: string[] = [];
    const stats = calculateTreeStats(node);

    // Заголовок
    output.push(`╔${'═'.repeat(60)}╗\n`);
    output.push(`║  Project: ${node.name.padEnd(48)}║\n`);
    output.push(`║  Generated by RepoPrompt                                   ║\n`);
    output.push(`║  ${new Date().toLocaleString('ru-RU').padEnd(57)}║\n`);
    output.push(`╠${'═'.repeat(60)}╣\n`);
    output.push(`║  Files: ${stats.allowed}/${stats.total}`.padEnd(61) + `║\n`);
    output.push(`║  Estimated tokens: ~${stats.tokens.toLocaleString()}`.padEnd(61) + `║\n`);
    output.push(`╚${'═'.repeat(60)}╝\n\n`);

    // Структура проекта
    output.push(`📂 PROJECT STRUCTURE\n`);
    output.push(`${'═'.repeat(60)}\n\n`);

    const structure = generateTreeStructure(node, '', true);
    output.push(structure.join('\n') + '\n\n');

    // Содержимое файлов
    output.push(`\n📝 FILE CONTENTS\n`);
    output.push(`${'═'.repeat(60)}\n`);

    collectAllowedFilesDFS(node, output);

    // Финал
    output.push(`\n\n${'═'.repeat(60)}\n`);
    output.push(`End of ${node.name}\n`);
    output.push(`${'═'.repeat(60)}\n`);

    return output;
}

/**
 * Собирает файлы для копирования в буфер (markdown-формат)
 */
export function collectFilesForCopy(node: TreeNode): string[] {
    const output: string[] = [];
    const stats = calculateTreeStats(node);

    // Заголовок
    output.push(`# 📦 ${node.name}\n\n`);
    output.push(`> Generated by RepoPrompt | ${new Date().toLocaleString('ru-RU')}\n`);
    output.push(`> Files: ${stats.allowed}/${stats.total} | ~${stats.tokens.toLocaleString()} tokens\n\n`);

    // Структура
    output.push(`## 📂 Project Structure\n\n`);
    output.push('```\n');

    const structure = generateTreeStructure(node, '', true);
    output.push(structure.join('\n') + '\n');
    output.push('```\n\n');

    // Файлы
    output.push(`## 📝 Files\n`);

    collectAllowedFilesMarkdown(node, output);

    // Финал
    output.push(`\n---\n`);
    output.push(`*End of ${node.name}*\n`);

    return output;
}

/**
 * DFS-обход с внешней функцией проверки статуса
 */
export function collectAllowedFilesDFSWithStatus(
    node: TreeNode,
    getNodeStatus: (node: TreeNode) => boolean,
    output: string[] = []
): string[] {
    // Если узел запрещён — пропускаем
    if (!getNodeStatus(node)) {
        return output;
    }

    if (node.type === 'file') {
        if (node.content) {
            const relativePath = getRelativePath(node);
            output.push(`\n${'─'.repeat(60)}\n`);
            output.push(`📄 ${relativePath}\n`);
            output.push(`${'─'.repeat(60)}\n`);
            output.push(`${node.content}\n`);
        }
        return output;
    }

    if (node.type === 'folder' && node.children) {
        const sortedChildren = [...node.children].sort((a, b) => {
            if (a.type === 'folder' && b.type === 'file') return -1;
            if (a.type === 'file' && b.type === 'folder') return 1;
            return a.name.localeCompare(b.name);
        });

        for (const child of sortedChildren) {
            collectAllowedFilesDFSWithStatus(child, getNodeStatus, output);
        }
    }

    return output;
}