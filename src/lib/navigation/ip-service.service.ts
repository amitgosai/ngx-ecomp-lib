import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { ExternalAPIUrls }  from 'ecomp-lib/config/config';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
  })
  export class IpServiceService {
    constructor(private http: HttpClient) { }
    public getClientIPAddress(): Observable<any> {
      return this.http.get(ExternalAPIUrls.IPify); 
    }
  }