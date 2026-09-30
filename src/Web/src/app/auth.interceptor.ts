import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  try {
    const raw = localStorage.getItem('slate.auth');
    const token = raw ? (JSON.parse(raw) as { accessToken?: string }).accessToken : '';
    if (token) {
      return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
    }
  } catch {
    // continue without a token
  }
  return next(req);
};
