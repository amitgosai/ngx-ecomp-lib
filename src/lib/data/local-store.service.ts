import { Injectable } from '@angular/core';
import { AppValidations, Util } from 'ecomp-lib';

import { CookieService } from 'ngx-cookie-service'; 
import { Observable, Subject } from 'rxjs';

export class LocalStoreItem {
    public key: string | null | undefined; 
    public value: any | null | undefined; 

    constructor(key?: string, value?: any) {
        if(!AppValidations.isNullOrEmpty(key)) {
            if(!AppValidations.isNullOrEmpty(value)) {
                this.key = key!;
                this.value = value!; 
            }
        }
    }
}

@Injectable({
  providedIn: 'root'
})
export class LocalStoreService {
  constructor(private cookie: CookieService) { }
  
  private storeItems:LocalStoreItem[] = []; 
  private storeItemsSubj = new Subject<LocalStoreItem[] | null | undefined>(); 

  public getAllLocalStoreItems(): any[] | null | undefined {
      var values = []; 
      var keys = Object.keys(localStorage); 
      var i = keys.length; 

      while (i--) {
          values.push(localStorage.getItem(keys[i])); 
      }

      return values; 
  }

  private setAllLocalStoreItems() {
      var values = []; 
      var keys = Object.keys(localStorage); 
      var i = keys.length; 

      //Clear Array before storing old items. 
      this.storeItems.splice(0, this.storeItems.length); 

      while(i--) {
          this.storeItems.push(new LocalStoreItem(keys[i], JSON.parse(localStorage.getItem(keys[i])!))); 
      }
  }

  public setItem(key: string, value: any) {
    try {
        if (this.hasLocalStorageAccess()) {
            //Set all the previous local store items into array. 
            this.setAllLocalStoreItems(); 

            localStorage.setItem(key, JSON.stringify(value)); 
        } else {
            this.cookie.set(key, JSON.stringify(value)); 
        }

        //Check if item to be set already exists. 
        if(AppValidations.isNullOrEmpty(Util.getItemValueByKey(this.storeItems, key))) {
            //Item Does not exists, push it to array. 
            this.storeItems.push(new LocalStoreItem(key, value)); 
        } else {
            //Remove Item from Array and then push it. 
            this.storeItems = Util.removeArrayItemByKey(this.storeItems, key); 
            this.storeItems.push(new LocalStoreItem(key, value)); 
        }

        //Finally, update the Observable. 
        //console.log("Store Items: ", this.storeItems); 
        this.storeItemsSubj.next(this.storeItems); 
    } catch (err) {
        throw new Error("Cannot use local storage"); 
    }
  }

  public getItem(key: string): any | null | undefined {
    let _retVal: any | null | undefined = null; 
    try {
        if (this.hasLocalStorageAccess()) {
            _retVal = localStorage.getItem(key); 
            if(_retVal != 'undefined' && _retVal != null) {
                _retVal = JSON.parse(_retVal!); 
            }
        } else {
            _retVal = this.cookie.get(key); 
            if(_retVal != 'undefined' && _retVal != null) {
                _retVal = JSON.parse(_retVal!); 
            }
        }
    } catch (err) {
        _retVal = null;  
        throw new Error("Cannot use local storage"); 
    } finally {
        return _retVal; 
    }
  }

  public getItems$(): Observable<any[] | null | undefined> {
      return this.storeItemsSubj.asObservable(); 
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

        //Finally, send the observable. 
        this.storeItemsSubj.next(this.storeItems);
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
