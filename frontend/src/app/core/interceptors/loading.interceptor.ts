import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  const skipLoader = req.headers.has('x-skip-loader');

  if (skipLoader) {
    return next(req);
  }

  loadingService.start();

  return next(req).pipe(finalize(() => loadingService.stop()));
};
