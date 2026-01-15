import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { loggingInterceptor } from './shared/interceptors/logging.interceptor';
import { authInterceptor } from './auth/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withHashLocation()), // widthHashLocation facilita los despliegues (responsable del # en la url)
    provideHttpClient(withFetch(),
    withInterceptors([
      // loggingInterceptor,
       authInterceptor])), // Para interceptors
  ]
};
