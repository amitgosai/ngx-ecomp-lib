import {
    HttpEvent, 
    HttpHandler, 
    HttpRequest, 
    HttpErrorResponse, 
    HttpInterceptor
} from '@angular/common/http'; 
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

export class ErrorInterceptor implements ErrorInterceptor {
    intercept(
        request: HttpRequest<any>, 
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        return next.handle(request)
            .pipe(
                retry(1), 
                catchError((error: HttpErrorResponse) => {
                    let errorMessage = ''; 
                    if(error.error instanceof ErrorEvent) {
                        // Client Side Error
                        errorMessage = `Error: ${error.error.message}`; 
                    } else {
                        // Server Side Error. 
                        errorMessage = `Error Status: ${error.status}\nMessage: ${error.message}`; 
                    }
                    console.log(errorMessage); 
                    return throwError(errorMessage); 
                })
            )
    }
}