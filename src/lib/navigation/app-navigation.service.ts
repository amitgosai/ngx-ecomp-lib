import { Injectable } from '@angular/core';
import { Router, NavigationExtras, QueryParamsHandling } from '@angular/router'; 
import { AppValidations } from 'ecomp-lib/validations/validation'; 

@Injectable({
  providedIn: 'root'
})
export class AppNavigationService {

  private static errTitle?: string; 
  private static errMessage?: string; 
  public static isPageError: boolean = false; 

  constructor(private router: Router) { }

  public static navigate(router: Router, navigateTo: string, errorMessage?: string, returnUrl?: string, qryParamsHand?: QueryParamsHandling, errorTitle?: string, pageAnchor?: string) {
    let objQueryParam = {returnUrl, errorTitle, errorMessage}; 

    if (!(router === null || router == undefined)) {
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
            router.navigate([navigateTo], navigationExtras); 
        } else {
            router.navigate([navigateTo]); 
        }
    }
  }

  public static handleAppError(router: Router, err: any, navigateToUrl:string = "/apperror", errTitle?: string, errMsg?: string, returnUrl?: string, qryPrmHand?: QueryParamsHandling) {
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
    this.navigate(router, navigateToUrl, this.errMessage, returnUrl, qryPrmHand, this.errTitle); 
  }
}