import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { Observable } from 'rxjs';

import * as cConst from "../config/commconst.json";

@Injectable({
    providedIn: 'root'
  })
  export class IpServiceService {

    private cConst: any = (cConst as any).default;

    constructor(private http: HttpClient) { }
    public getClientIPAddress(): Observable<any> {
      return this.http.get(this.cConst.ExternalAPIUrls.IPify); 
    }
  }