import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, retry, shareReplay } from 'rxjs/operators';
import { IHttpHeaders, IHttpParams } from 'ecomp-lib';


@Injectable({
  providedIn: 'root'
})
export class CommsService {

  constructor(private http: HttpClient) { 
  }
  
  public getRequest(url: string, headers?: IHttpHeaders[], params?: IHttpParams[], retries: number = 0, withCred?: boolean) {
      const httpOptions = {
        headers: new HttpHeaders(),
          params: new HttpParams(), 
          withCredentials: withCred
      }
      
      //Set Common Headers first. 
      httpOptions.headers = httpOptions.headers.set('Access-Control-Allow-Origin', '*');
      if (headers) {
        for(let header of headers) {
            httpOptions.headers = httpOptions.headers.set(header.header, header.value); 
        }
      }

      if(params) {
          for(let param of params) {
              httpOptions.params = httpOptions.params.set(param.param, param.value); 
          }
      }

      if(retries > 0) {
        return this.http.get<any>(url, httpOptions)
        .pipe(
            retry(retries), 
            shareReplay(), 
            catchError(this.handleHttpError)
        ); 
      } else {
        return this.http.get<any>(url, httpOptions)
        .pipe(
            shareReplay(), 
            catchError(this.handleHttpError)
        ); 
      }
  }

  public postRequest(url: string, data: any, headers?: IHttpHeaders[], params?: IHttpParams[], retries: number = 0, withCred?: boolean) {
    const httpOptions = {
        headers: new HttpHeaders(),
        params: new HttpParams(), 
        withCredentials: withCred
    }

    httpOptions.headers = httpOptions.headers.set('Access-Control-Allow-Origin', '*');
    if(headers) {
        for(let header of headers) {
            httpOptions.headers = httpOptions.headers.set(header.header, header.value); 
        }
    }

    if(params) {
        for(let param of params) {
            httpOptions.params = httpOptions.params.set(param.param, param.value); 
        }
    }

    if (retries > 0) {
        return this.http.post<any>(url, data, httpOptions)
        .pipe(
            retry(retries), 
            shareReplay(),
            catchError(this.handleHttpError)
        ); 
    } else {
        return this.http.post<any>(url, data, httpOptions)
        .pipe(
            shareReplay(),
            catchError(this.handleHttpError)
        ); 
    }
  }

  public handleHttpError(error: HttpErrorResponse) {
      let retVal: any; 
      if(error.status === 0) {
          // We have a client side error or network error. 
          retVal = { status: error.status, error: error.error, isClientSide: true }
      } else {
          // We have an error from the server/backend. 
          retVal = { status: error.status, error: error.error, isClientSide: false }
      }

      return throwError(retVal); // Return observable with user-facing error message. This is to be handled by the client. 
  }
}