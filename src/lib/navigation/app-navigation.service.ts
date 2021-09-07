import { Injectable } from '@angular/core';
import { Location } from '@angular/common'; 
import { Router, NavigationExtras, QueryParamsHandling, NavigationEnd } from '@angular/router'; 
import { AppValidations } from 'ecomp-lib/validations/validation'; 

@Injectable({
  providedIn: 'root'
})
export class AppNavigationService {

  private errTitle?: string; 
  private errMessage?: string; 
  public isPageError: boolean = false; 
  private hist: string[] = []; 

  constructor(private router: Router, private location: Location) { 
    router.events.subscribe((event) => {
      if(event instanceof NavigationEnd) {
        this.hist.push(event.urlAfterRedirects); 
      }
    }); 
  }

  public navigate(navigateTo: string, errorMessage?: string, returnUrl?: string, qryParamsHand?: QueryParamsHandling, errorTitle?: string, pageAnchor?: string) {
    let objQueryParam = {returnUrl, errorTitle, errorMessage}; 

    if (!(this.router === null || this.router == undefined)) {
        if (!(navigateTo === null || navigateTo == undefined || navigateTo == '')) {
            if(!(returnUrl === null || returnUrl == undefined || returnUrl == '')) {
                objQueryParam["returnUrl"] = returnUrl; 
            }
            if(!(errorTitle === null || errorTitle == undefined || errorTitle == '')) {
                objQueryParam["errorTitle"] = errorTitle; 
            }
            if(!(errorMessage === null || errorMessage == undefined || errorMessage == '')) {
                objQueryParam["errorMessage"] = errorMessage; 
            }
            if(qryParamsHand === null || qryParamsHand == undefined || qryParamsHand == '') {
                qryParamsHand = "merge"; 
            }

            let navigationExtras: NavigationExtras; 

            if(AppValidations.isNullOrEmpty(pageAnchor)){
                navigationExtras = {
                    queryParams: objQueryParam, 
                    queryParamsHandling: qryParamsHand
                }
            } else {
                navigationExtras = {
                    queryParams: objQueryParam, 
                    fragment: pageAnchor, 
                    queryParamsHandling: qryParamsHand
                }
            }
            
            //console.log(objQueryParam); 
            this.router.navigate([navigateTo], navigationExtras); 
        } else {
            this.router.navigate([navigateTo]); 
        }
    }
  }

  public handleAppError(err: any, navigateToUrl:string = "/apperror", errTitle?: string, errMsg?: string, returnUrl?: string, qryPrmHand?: QueryParamsHandling) {
    if(AppValidations.isNullOrEmpty(errTitle)) {
      this.errTitle = "An Error Occurred"; 
    } else {
      this.errTitle = errTitle; 
    }
    if(AppValidations.isNullOrEmpty(errMsg)) {
      this.errMessage = AppValidations.getErrorString(err); 
    } else {
      this.errMessage = errMsg; 
    }
        
    this.isPageError = true; 

    //We want to redirect user here. 
    this.navigate(navigateToUrl, this.errMessage, returnUrl, qryPrmHand, this.errTitle); 
  }

  public back(): void {
    try {
      //Pop the last history element. 
      this.hist.pop(); 
      if(this.hist.length > 0) {
        this.location.back(); 
      } else {
        this.router.navigateByUrl("/"); 
      }
    } catch (err) {
      //In case of any error, don't navigate. 
    }
  }
}