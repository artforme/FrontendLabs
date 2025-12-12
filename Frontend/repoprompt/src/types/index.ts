export interface TreeNode {
    name: string;
    path: string;
    type: 'folder' | 'file';
    allowed: boolean;
    expanded?: boolean;
    children?: TreeNode[];
    content?: string;
}

export interface User {
    name: string;
    email: string;
}

export type Theme = 'dark' | 'light';

export type ModalType = 'login' | 'register' | 'defaultBlacklist' | null;

export interface FileTreeState {
    fileTree: TreeNode | null;
    originalStatus: Record<string, boolean>;
    zoom: number;
    panX: number;
    panY: number;
    isDragging: boolean;
    startX: number;
    startY: number;
}

export interface PanelsState {
    blacklist: string[];
    allowedlist: string[];
}

export interface AuthState {
    isLoggedIn: boolean;
    user: User | null;
}