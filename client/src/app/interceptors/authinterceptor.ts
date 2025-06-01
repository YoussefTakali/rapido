import { HttpClient, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { catchError, Observable, switchMap, throwError } from "rxjs";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private http: HttpClient) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const accessToken = this.authService.getAccessToken();
    let authReq = req;

    if (accessToken) {
      authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${accessToken}`),
      });
    }

    return next.handle(authReq).pipe(
      catchError((error) => {
        if (error.status === 401) {
          // Token expired, try to refresh
          return this.handleRefreshToken(req, next);
        }
        return throwError(() => error);
      }),
    );
  }

  private handleRefreshToken(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const refreshToken = this.authService.getRefreshToken();
    if (!refreshToken) {
      // Redirect to login or logout user
      return throwError(() => new Error('No refresh token'));
    }

    return this.http.post<{ access_token: string; refresh_token?: string }>('/auth/refresh-token', {
      refreshToken,
    }).pipe(
      switchMap((tokens) => {
        this.authService.setAccessToken(tokens.access_token);
        if (tokens.refresh_token) {
          this.authService.setRefreshToken(tokens.refresh_token);
        }
        const clonedReq = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${tokens.access_token}`),
        });
        return next.handle(clonedReq);
      }),
      catchError((err) => {
        // Refresh failed: logout user
        this.authService.removeTokens();
        // redirect to login or show message
        return throwError(() => err);
      }),
    );
  }
}
