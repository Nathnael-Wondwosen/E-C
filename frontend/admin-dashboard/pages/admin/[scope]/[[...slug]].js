import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { DEFAULT_ADMIN_SCOPE, getAdminScopeById } from '../../../config/adminScopes';
import { isPathAllowedForScope } from '../../../config/adminScopePermissions';
import { setStoredAdminScope } from '../../../utils/adminScopeService';

const normalizeTargetPath = (slug) => {
  if (!Array.isArray(slug) || slug.length === 0) {
    return '/dashboard';
  }
  return `/${slug.join('/')}`;
};

export default function ScopedAdminRoute() {
  const router = useRouter();
  const { scope, slug } = router.query;

  useEffect(() => {
    if (!scope) return;

    const resolvedScope = getAdminScopeById(scope)?.id || DEFAULT_ADMIN_SCOPE;
    setStoredAdminScope(resolvedScope);

    const targetPath = normalizeTargetPath(slug);
    const safePath = isPathAllowedForScope(resolvedScope, targetPath) ? targetPath : '/dashboard';

    router.replace(`${safePath}?scope=${resolvedScope}`);
  }, [scope, slug, router]);

  return null;
}
