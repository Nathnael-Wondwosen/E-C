import { ADMIN_SCOPES } from '../config/adminScopes';

export default function AdminScopeSwitcher({ activeScope, onChange }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-none p-4">
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Admin Scope</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Isolated admin contexts for merged Project 1 + Project 2 operations.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {ADMIN_SCOPES.map((scope) => {
            const selected = scope.id === activeScope;
            return (
              <button
                key={scope.id}
                type="button"
                onClick={() => onChange(scope.id)}
                className={`text-left px-3 py-2 border rounded-none transition ${
                  selected
                    ? 'bg-blue-600 text-white border-blue-700'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="text-sm font-semibold">{scope.name}</div>
                <div className={`text-xs ${selected ? 'text-blue-100' : 'text-gray-500 dark:text-gray-300'}`}>
                  {scope.source}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
