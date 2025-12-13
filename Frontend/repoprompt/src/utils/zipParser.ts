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
 * Определяет общий корневой префикс для всех файлов в архиве
 */
function findCommonRoot(paths: string[]): string | null {
    if (paths.length === 0) return null;

    // Фильтруем служебные папки
    const validPaths = paths.filter(p =>
        p && !p.startsWith('__MACOSX') && !p.startsWith('.')
    );

    if (validPaths.length === 0) return null;

    // Получаем первый сегмент каждого пути
    const firstSegments = validPaths.map(p => p.split('/')[0]);

    // Проверяем, все ли пути начинаются с одной папки
    const firstSegment = firstSegments[0];
    const allSameRoot = firstSegments.every(seg => seg === firstSegment);

    // Если все файлы в одной корневой папке — возвращаем её
    if (allSameRoot && firstSegment) {
        return firstSegment;
    }

    return null;
}

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

    // Собираем все пути файлов
    const allPaths = Object.keys(zip.files);

    // Определяем общий корень
    const commonRoot = findCommonRoot(allPaths);

    // Определяем имя проекта
    const projectName = commonRoot || file.name.replace('.zip', '');

    // Структура для построения дерева
    const root: TreeNode = {
        name: projectName,
        path: '/' + projectName,
        type: 'folder',
        allowed: true,
        expanded: true,
        children: []
    };

    // Карта путей к узлам для быстрого доступа
    const nodeMap = new Map<string, TreeNode>();
    nodeMap.set(root.path, root);

    const entries = Object.entries(zip.files);
    const totalFiles = entries.length;
    let processed = 0;

    for (const [relativePath, zipEntry] of entries) {
        // Пропускаем пустые пути и __MACOSX
        if (!relativePath || relativePath.startsWith('__MACOSX')) {
            processed++;
            continue;
        }

        // Нормализуем путь
        let cleanPath = relativePath.replace(/\/$/, '');
        if (!cleanPath) {
            processed++;
            continue;
        }

        // ★ КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: убираем общий корень из пути
        // Если архив содержит my-project/src/App.tsx,
        // и commonRoot = "my-project",
        // то cleanPath станет "src/App.tsx"
        if (commonRoot && cleanPath.startsWith(commonRoot + '/')) {
            cleanPath = cleanPath.slice(commonRoot.length + 1);
        } else if (commonRoot && cleanPath === commonRoot) {
            // Это сама корневая папка — пропускаем, она уже создана как root
            processed++;
            continue;
        }

        // Пропускаем пустой путь после удаления корня
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
            if (!part) continue; // Пропускаем пустые части

            const newPath = `${currentPath}/${part}`;
            const isLastPart = i === pathParts.length - 1;
            const isFolder = isDirectory || !isLastPart;

            // Проверяем, существует ли уже этот узел
            let node = nodeMap.get(newPath);

            if (!node) {
                // Определяем, должен ли быть запрещён по умолчанию
                const isDefaultBlacklisted = DEFAULT_BLACKLIST.some(pattern => {
                    // Проверяем точное совпадение имени
                    if (part === pattern) return true;
                    // Проверяем паттерны с расширениями (*.log)
                    if (pattern.startsWith('*.')) {
                        const ext = pattern.slice(1); // ".log"
                        return part.endsWith(ext);
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

                // Добавляем к родителю
                if (parentNode.children) {
                    // Проверяем, что такого узла ещё нет
                    const exists = parentNode.children.some(c => c.path === newPath);
                    if (!exists) {
                        parentNode.children.push(node);
                    }
                }
            }

            // Если это файл, читаем содержимое
            if (isLastPart && !isDirectory && node.allowed) {
                try {
                    onProgress?.({
                        stage: 'extracting',
                        percent: 30 + Math.round((processed / totalFiles) * 50),
                        currentFile: cleanPath
                    });

                    const content = await zipEntry.async('string');
                    node.content = content;
                } catch (e) {
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
    if (node.children && node.children.length > 0) {
        node.children.sort((a, b) => {
            if (a.type === 'folder' && b.type === 'file') return -1;
            if (a.type === 'file' && b.type === 'folder') return 1;
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
    ];

    const name = filename.toLowerCase();
    if (textExtensions.includes(name)) return true;

    const ext = '.' + name.split('.').pop();
    return textExtensions.includes(ext);
}