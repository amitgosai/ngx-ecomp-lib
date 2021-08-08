import { Injectable } from '@angular/core';

import { CookieService } from 'ngx-cookie-service'; 

@Injectable({
  providedIn: 'root'
})
export class LocalStoreService {

  constructor(private cookie: CookieService) { }

  public setItem(key: string, value: string) {
    try {
        if (this.hasLocalStorageAccess()) {
            localStorage.setItem(key, value); 
        } else {
            this.cookie.set(key, value); 
        }
    } catch (err) {
        throw new Error("Cannot use local storage"); 
    }
  }

  public getItem(key: string): string | null {
    let _retVal: string | null = null; 
    try {
        if (this.hasLocalStorageAccess()) {
            _retVal = localStorage.getItem(key); 
        } else {
            this.cookie.get(key); 
        }
    } catch (err) {
        _retVal = null;  
        throw new Error("Cannot use local storage"); 
    } finally {
        return _retVal; 
    }
  }

  public removeItem(key: string): boolean {
    let _retVal: boolean = false; 

    try {
        if(this.hasLocalStorageAccess()) {
            localStorage.removeItem(key); 
        } else {
            this.cookie.delete(key); 
        }
        _retVal = true; 
    } catch (err) {
        _retVal = false; 
        throw new Error("Cannot remove local storage value"); 
    } finally {
        return _retVal; 
    }
  }

  public setCookieWithTimeout(key: string, value: string, days: number) {
    try {
        this.cookie.set(key, value, days); //Set for three months.
    } catch (err) {
        throw new Error("Cannot set cookie"); 
    }
  }
  public getCookie(key: string): string | null {
    let _retVal: string | null = null; 
    try {
        _retVal = this.cookie.get(key); 
    } catch (err) {
        _retVal = null;  
        throw new Error("Cannot get cookie"); 
    } finally {
        return _retVal;
    }
  }
  public deleteCookie(key: string): boolean {
    let _retVal: boolean = false; 

    try {
        this.cookie.delete(key); 
        _retVal = true; 
    } catch (err) {
        _retVal = false; 
    } finally {
        return _retVal; 
    }
  }

  private hasLocalStorageAccess(): boolean {
    try {
        localStorage.setItem("TestItem", "TestItem"); 
        localStorage.removeItem("TestItem"); 
        return true; 
    } catch(err) {
        return false; 
    }
  }
}
