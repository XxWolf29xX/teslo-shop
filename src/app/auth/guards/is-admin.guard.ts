import { firstValueFrom } from 'rxjs';
import { inject } from '@angular/core';
import { CanMatchFn, Route, UrlSegment } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const IsAdminGuard: CanMatchFn = async(
  route: Route,
  segments: UrlSegment[]
) => {
  const authService = inject(AuthService);

  await firstValueFrom(authService.checkStatus());

  return authService.isAdmin(); // computed definida en authService, y devuelve true o false
}
