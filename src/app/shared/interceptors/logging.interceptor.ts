import { HttpEvent, HttpEventType, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { Observable, tap } from "rxjs";


export function loggingInterceptor( // función que recibe un http de tipo unknown
  req: HttpRequest<unknown>,
  next: HttpHandlerFn, // es lo que tenemos que mandar a llamar para que siga ejecutando el procedimiento que quiero
): Observable<HttpEvent<unknown>> {
  return next(req).pipe(
    tap((event) => {
      if (event.type === HttpEventType.Response) {
        console.log(req.url, 'returned a response with status', event.status);
      }
    }),
  );
}
