import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { jwtDecode } from 'jwt-decode';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const where = isPlatformBrowser(platformId) ? 'BROWSER' : 'SERVER';

  console.time(`[RoleGuard:${where}] ${state.url}`);
  console.log(`[RoleGuard:${where}] start`, { url: state.url, roles: route.data?.['roles'] });

  const isBrowser = isPlatformBrowser(platformId) && typeof localStorage !== 'undefined';
  if (!isBrowser) {
    console.timeEnd(`[RoleGuard:${where}] ${state.url}`);
    return router.parseUrl('/');
  }

  let token = localStorage.getItem('tokenusuario');
  if (!token) {
    console.timeEnd(`[RoleGuard:${where}] ${state.url}`);
    return router.parseUrl('/');
  }

  token = token.trim();
  if (token.startsWith('Bearer ')) token = token.slice(7);

  try {
    const payload = jwtDecode<any>(token);
    const rawRole =
      payload?.rol ??
      payload?.role ??
      (Array.isArray(payload?.roles) ? payload.roles[0] : undefined) ??
      (Array.isArray(payload?.authorities) ? payload.authorities[0] : undefined) ??
      '';
    const role = rawRole.toString().toUpperCase().replace(/^ROLE_/, '');

    const allowed = ((route.data?.['roles'] as string[]) ?? []).map(r => r.toUpperCase());
    const ok = allowed.length === 0 || allowed.includes(role);

    return ok ? true : router.parseUrl('/');
  } catch (e) {
    return router.parseUrl('/');
  }
};
