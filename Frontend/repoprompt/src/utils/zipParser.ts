import JSZip from 'jszip';
import type { TreeNode } from '../types';
import { DEFAULT_BLACKLIST } from './treeUtils';

export interface ParseProgress {
    stage: 'reading' | 'extracting' | 'building';
    percent: number;
    currentFile?: string;
}

export type ProgressCallback = (progress: ParseProgress) => void;

/**
 * Парсит ZIP-архив и возвращает дерево файлов
 */
export async function parseZipToTree(
    file: File,
    onProgress?: ProgressCallback
): Promise<TreeNode> {
    // Этап 1: Чтение ZIP
    onProgress?.({ stage: 'reading', percent: 0 });

    const arrayBuffer = await file.arrayBuffer();
    onProgress?.({ stage: 'reading', percent: 20 });

    const zip = await JSZip.loadAsync(arrayBuffer);
    onProgress?.({ stage: 'extracting', percent: 30 });

    // Собираем все файлы
    const entries = Object.entries(zip.files);
    const totalFiles = entries.length;

    // Структура для построения дерева
    const root: TreeNode = {
        name: file.name.replace('.zip', ''),
        path: '/' + file.name.replace('.zip', ''),
        type: 'folder',
        allowed: true,
        expanded: true,
        children: []
    };

    // Карта путей к узлам для быстрого доступа
    const nodeMap = new Map<string, TreeNode>();
    nodeMap.set(root.path, root);

    let processed = 0;

    for (const [relativePath, zipEntry] of entries) {
        // Пропускаем пустые пути и __MACOSX
        if (!relativePath || relativePath.startsWith('__MACOSX')) {
            processed++;
            continue;
        }

        // Нормализуем путь
        const cleanPath = relativePath.replace(/\/$/, ''); // убираем trailing slash
        if (!cleanPath) {
            processed++;
            continue;
        }

        const pathParts = cleanPath.split('/');
        const isDirectory = zipEntry.dir;

        // Строим путь от корня
        let currentPath = root.path;
        let parentNode = root;

        for (let i = 0; i < pathParts.length; i++) {
            const part = pathParts[i];
            const newPath = `${currentPath}/${part}`;
            const isLastPart = i === pathParts.length - 1;
            const isFolder = isDirectory || !isLastPart;

            // Проверяем, существует ли уже этот узел
            let node = nodeMap.get(newPath);

            if (!node) {
                // Определяем, должен ли быть запрещён по умолчанию
                const isDefaultBlacklisted = DEFAULT_BLACKLIST.some(
                    pattern => part === pattern || part.startsWith(pattern + '/')
                );

                node = {
                    name: part,
                    path: newPath,
                    type: isFolder ? 'folder' : 'file',
                    allowed: !isDefaultBlacklisted,
                    expanded: !isDefaultBlacklisted && i < 2, // Раскрываем первые 2 уровня
                    children: isFolder ? [] : undefined,
                    content: undefined
                };

                nodeMap.set(newPath, node);

                // Добавляем к родителю
                if (parentNode.children) {
                    parentNode.children.push(node);
                }
            }

            // Если это файл (последняя часть пути и не директория), читаем содержимое
            if (isLastPart && !isDirectory && node.allowed) {
                try {
                    onProgress?.({
                        stage: 'extracting',
                        percent: 30 + Math.round((processed / totalFiles) * 50),
                        currentFile: cleanPath
                    });

                    // Читаем содержимое файла как текст
                    const content = await zipEntry.async('string');
                    node.content = content;
                } catch (e) {
                    // Бинарный файл или ошибка чтения
                    node.content = `[Binary file or read error: ${part}]`;
                }
            }

            currentPath = newPath;
            parentNode = node;
        }

        processed++;
    }

    // Сортируем: папки сначала, потом файлы, алфавитно
    sortTreeNodes(root);

    onProgress?.({ stage: 'building', percent: 100 });

    return root;
}

/**
 * Рекурсивно сортирует узлы дерева
 */
function sortTreeNodes(node: TreeNode): void {
    if (node.children) {
        node.children.sort((a, b) => {
            // Папки сначала
            if (a.type === 'folder' && b.type === 'file') return -1;
            if (a.type === 'file' && b.type === 'folder') return 1;
            // Алфавитно
            return a.name.localeCompare(b.name);
        });

        node.children.forEach(sortTreeNodes);
    }
}

/**
 * Проверяет, является ли файл текстовым по расширению
 */
export function isTextFile(filename: string): boolean {
    const textExtensions = [
        // Код
        '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
        '.py', '.pyw', '.pyi',
        '.java', '.kt', '.kts', '.scala',
        '.c', '.cpp', '.cc', '.cxx', '.h', '.hpp', '.hxx',
        '.cs', '.fs', '.fsx',
        '.go', '.rs', '.rb', '.php', '.swift', '.m', '.mm',
        '.lua', '.pl', '.pm', '.r', '.R', '.jl',
        '.sh', '.bash', '.zsh', '.fish', '.ps1', '.bat', '.cmd',
        '.sql', '.graphql', '.gql',

        // Web
        '.html', '.htm', '.xhtml',
        '.css', '.scss', '.sass', '.less', '.styl',
        '.vue', '.svelte', '.astro',

        // Конфиги
        '.json', '.json5', '.jsonc',
        '.xml', '.xsl', '.xslt',
        '.yaml', '.yml',
        '.toml', '.ini', '.cfg', '.conf',
        '.env', '.env.local', '.env.development', '.env.production',
        '.properties',

        // Документы
        '.md', '.markdown', '.mdx', '.rst', '.txt', '.text',
        '.csv', '.tsv',

        // Git/Docker/etc
        '.gitignore', '.gitattributes', '.dockerignore',
        '.editorconfig', '.prettierrc', '.eslintrc',
        '.babelrc', '.nvmrc',

        // Без расширения но известные
        'Dockerfile', 'Makefile', 'Rakefile', 'Gemfile',
        'Procfile', 'Vagrantfile',
    ];

    const name = filename.toLowerCase();

    // Проверяем полное имя файла (для файлов без расширения типа Dockerfile)
    if (textExtensions.includes(name)) return true;

    // Проверяем расширение
    const ext = '.' + name.split('.').pop();
    return textExtensions.includes(ext);
}