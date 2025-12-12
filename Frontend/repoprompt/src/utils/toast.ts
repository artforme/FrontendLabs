// src/utils/toast.ts
export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    // Временно console.log, потом реализуем как компонент
    console.log(`[Toast ${type}]: ${message}`);
    // TODO: Implement with React component in later steps
}