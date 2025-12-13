import type { HistoryProject } from '../types';

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'только что';
  if (minutes < 60) return `${minutes} мин. назад`;
  if (hours < 24) return `${hours} ч. назад`;
  if (days === 1) return 'вчера';
  if (days < 7) return `${days} дн. назад`;
  return date.toLocaleDateString('ru-RU');
}

export function getLanguageGradient(language: string): string {
  const gradients = {
    TypeScript: 'from-blue-500 to-blue-700',
    JavaScript: 'from-yellow-400 to-yellow-600',
    Python: 'from-green-400 to-blue-500',
    Vue: 'from-green-400 to-emerald-600',
    React: 'from-cyan-400 to-blue-500',
    default: 'from-gray-500 to-gray-700',
  };
  return gradients[language as keyof typeof gradients] || gradients.default;
}

export function getLanguageIcon(language: string): React.ReactNode {
  const icons = {
    TypeScript: <span className="text-white font-bold text-lg">TS</span>,
    JavaScript: <span className="text-white font-bold text-lg">JS</span>,
    Python: <span className="text-white font-bold text-lg">PY</span>,
    Vue: <span className="text-white font-bold text-lg">V</span>,
    React: <span className="text-white font-bold text-lg">R</span>,
  };
  return icons[language as keyof typeof icons] || <span className="text-white font-bold text-lg">?</span>;
}

export function generateMockStructure(project: HistoryProject): React.ReactNode {
  const { language, name } = project;
  switch (language) {
    case 'TypeScript':
      return (
        <div className="space-y-1 text-gray-300">
          <div className="text-yellow-400">📁 {name}/</div>
          <div className="pl-4">📁 src/</div>
          <div className="pl-8">📁 components/</div>
          <div className="pl-12 text-blue-400">📄 Header.tsx</div>
          <div className="pl-12 text-blue-400">📄 Footer.tsx</div>
          <div className="pl-12 text-blue-400">📄 Button.tsx</div>
          <div className="pl-12 text-blue-400">📄 Card.tsx</div>
          <div className="pl-8">📁 hooks/</div>
          <div className="pl-12 text-blue-400">📄 useAuth.ts</div>
          <div className="pl-12 text-blue-400">📄 useFetch.ts</div>
          <div className="pl-8">📁 pages/</div>
          <div className="pl-12 text-blue-400">📄 Home.tsx</div>
          <div className="pl-12 text-blue-400">📄 About.tsx</div>
          <div className="pl-12 text-blue-400">📄 Dashboard.tsx</div>
          <div className="pl-8">📁 utils/</div>
          <div className="pl-12 text-blue-400">📄 helpers.ts</div>
          <div className="pl-12 text-blue-400">📄 constants.ts</div>
          <div className="pl-8 text-blue-400">📄 App.tsx</div>
          <div className="pl-8 text-blue-400">📄 main.tsx</div>
          <div className="pl-4">📁 public/</div>
          <div className="pl-8 text-purple-400">📄 favicon.ico</div>
          <div className="pl-4 text-gray-500 line-through">📁 node_modules/ <span className="text-red-400 text-xs">(excluded)</span></div>
          <div className="pl-4 text-yellow-300">📄 package.json</div>
          <div className="pl-4 text-yellow-300">📄 tsconfig.json</div>
          <div className="pl-4 text-gray-400">📄 README.md</div>
        </div>
      );
    case 'Python':
      return (
        <div className="space-y-1 text-gray-300">
          <div className="text-yellow-400">📁 {name}/</div>
          <div className="pl-4">📁 src/</div>
          <div className="pl-8 text-green-400">📄 main.py</div>
          <div className="pl-8 text-green-400">📄 app.py</div>
          <div className="pl-8">📁 routes/</div>
          <div className="pl-12 text-green-400">📄 api.py</div>
          <div className="pl-12 text-green-400">📄 auth.py</div>
          <div className="pl-8">📁 models/</div>
          <div className="pl-12 text-green-400">📄 user.py</div>
          <div className="pl-12 text-green-400">📄 post.py</div>
          <div className="pl-8">📁 utils/</div>
          <div className="pl-12 text-green-400">📄 helpers.py</div>
          <div className="pl-4 text-gray-500 line-through">📁 __pycache__/ <span className="text-red-400 text-xs">(excluded)</span></div>
          <div className="pl-4 text-gray-500 line-through">📁 .venv/ <span className="text-red-400 text-xs">(excluded)</span></div>
          <div className="pl-4 text-gray-400">📄 requirements.txt</div>
          <div className="pl-4 text-gray-400">📄 README.md</div>
        </div>
      );
    case 'Vue':
      return (
        <div className="space-y-1 text-gray-300">
          <div className="text-yellow-400">📁 {name}/</div>
          <div className="pl-4">📁 src/</div>
          <div className="pl-8">📁 components/</div>
          <div className="pl-12 text-emerald-400">📄 Header.vue</div>
          <div className="pl-12 text-emerald-400">📄 Sidebar.vue</div>
          <div className="pl-12 text-emerald-400">📄 Card.vue</div>
          <div className="pl-12 text-emerald-400">📄 Modal.vue</div>
          <div className="pl-12 text-emerald-400">📄 Chart.vue</div>
          <div className="pl-8">📁 views/</div>
          <div className="pl-12 text-emerald-400">📄 Dashboard.vue</div>
          <div className="pl-12 text-emerald-400">📄 Analytics.vue</div>
          <div className="pl-12 text-emerald-400">📄 Settings.vue</div>
          <div className="pl-8">📁 stores/</div>
          <div className="pl-12 text-blue-400">📄 user.ts</div>
          <div className="pl-12 text-blue-400">📄 dashboard.ts</div>
          <div className="pl-8">📁 composables/</div>
          <div className="pl-12 text-blue-400">📄 useApi.ts</div>
          <div className="pl-8 text-emerald-400">📄 App.vue</div>
          <div className="pl-8 text-blue-400">📄 main.ts</div>
          <div className="pl-4 text-gray-500 line-through">📁 node_modules/ <span className="text-red-400 text-xs">(excluded)</span></div>
          <div className="pl-4 text-yellow-300">📄 package.json</div>
          <div className="pl-4 text-blue-400">📄 vite.config.ts</div>
        </div>
      );
    case 'JavaScript':
      return (
        <div className="space-y-1 text-gray-300">
          <div className="text-yellow-400">📁 {name}/</div>
          <div className="pl-4">📁 src/</div>
          <div className="pl-8 text-yellow-400">📄 index.js</div>
          <div className="pl-8 text-yellow-400">📄 app.js</div>
          <div className="pl-8">📁 routes/</div>
          <div className="pl-12 text-yellow-400">📄 api.js</div>
          <div className="pl-12 text-yellow-400">📄 users.js</div>
          <div className="pl-8">📁 middleware/</div>
          <div className="pl-12 text-yellow-400">📄 auth.js</div>
          <div className="pl-12 text-yellow-400">📄 logger.js</div>
          <div className="pl-4 text-gray-500 line-through">📁 node_modules/ <span className="text-red-400 text-xs">(excluded)</span></div>
          <div className="pl-4 text-yellow-300">📄 package.json</div>
          <div className="pl-4 text-gray-400">📄 .env.example</div>
          <div className="pl-4 text-gray-400">📄 README.md</div>
        </div>
      );
    default:
      return (
        <div className="space-y-1 text-gray-300">
          <div className="text-yellow-400">📁 {name}/</div>
          <div className="pl-4 text-gray-400">Неизвестная структура для {language}</div>
        </div>
      );
  }
}