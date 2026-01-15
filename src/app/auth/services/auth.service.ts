import { computed, inject, Injectable, signal } from '@angular/core';
import { User } from '../interfaces/user.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.development';
import { AuthResponse } from '../interfaces/auth-response.interface';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { rxResource } from '@angular/core/rxjs-interop';

type AuthStatus = 'checking' | 'authenticated' | 'non-authenticated';
const baseUrl = environment.baseUrl;

@Injectable({providedIn: 'root'})
export class AuthService {
  private _authStatus = signal<AuthStatus>('checking'); // Esta señal internamente va a manejar el tipo status
  private _user = signal<User | null>(null); // Son privadas porque me interesa que no se puedan manipular desde el exterior, solo van a ser manipulables desde authService
  private _token = signal<string | null>(localStorage.getItem('token'));

  private http = inject(HttpClient);

  checkStatusResource = rxResource({
    stream: () => this.checkStatus(),
  })

  authStatus = computed(() => {
    if (this._authStatus() === 'checking') return 'checking';

    if (this._user()) return 'authenticated';

    return 'non-authenticated'
  });

  user = computed<User | null>(() => this._user());
  token = computed(this._token);
  isAdmin = computed(() => this._user()?.roles.includes('admin') ?? false); // Pregunta si el user tiene el rol admin

  login(email: string, password: string): Observable<boolean>{
    return this.http.post<AuthResponse>(`${baseUrl}/auth/login`, {
      email: email,
      password: password,
    }).pipe(
      map( resp => this.handleAuthSucces(resp)), // Antes era tap(...)
      // map(() => true),
      catchError((error: any) => this.HandleAuthError(error))
    )
  }

  register(email: string, password: string, userName: string): Observable<boolean>{
    return this.http.post<AuthResponse>(`${baseUrl}/auth/register`, {
      email: email,
      password: password,
      fullName: userName,
    }).pipe(
      map( resp => this.handleAuthSucces(resp)),
      catchError((error: any) => this.HandleAuthError(error))
    )
  }

  checkStatus():Observable<boolean>{
    const token = localStorage.getItem('token');
    if(!token){ // Sí no hay token, se limpia la info y se marca como no autenticado
      this.logout();
      return of(false);
    };

    return this.http.get<AuthResponse>(`${baseUrl}/auth/check-status`, {
      // headers:{
      //   Authorization: `Bearer ${token}`,
      // },
    }).pipe(
        map( resp => this.handleAuthSucces(resp)),
        // map(() => true),
        catchError((error: any) => this.HandleAuthError(error))
    )
  }

  logout(){ // Cierre de sesión
    this._user.set(null);
    this._token.set(null);
    this._authStatus.set('non-authenticated');

    localStorage.removeItem('token');
  }

  private handleAuthSucces(resp: AuthResponse){
    this._user.set(resp.user);
    this._authStatus.set('authenticated');
    this._token.set(resp.token);

    localStorage.setItem('token', resp.token); // grabo el token en el local storage

    return true; // Para reemplazar el map(() => true) y cambiar el tap(...) por map(...)
  }

  private HandleAuthError(error: any){
    this.logout();
    return of(false);
  }
}
