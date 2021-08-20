import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore'; 
import { localStoreKeys } from 'ecomp-lib/data/local-store';
import { Database, documentDb } from 'ecomp-lib/data/data'; 
import firebase from 'firebase/app';
import 'firebase/firestore'; 
import { LocalStoreService } from '../data/local-store.service';
import { AppValidations } from 'ecomp-lib/validations/validation';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { fbDbOps, FbWhereClause } from 'ecomp-lib/data/firebase';

type CollectionPredicate<T> = string | AngularFirestoreCollection<T>; 
type DocumentPredicate<T> = string | AngularFirestoreDocument<T>; 

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  private _strDBName: string = Database.Firestore; 

  constructor(
    public fireAuth: AngularFireAuth, 
    private afs: AngularFirestore, 
    private localStore: LocalStoreService
    ) { }

  async emailSignUp(email: string, password: string) {
    return await this.fireAuth.createUserWithEmailAndPassword(email, password); 
  }

  async emailLogin(email: string, password: string) {
    return await this.fireAuth.signInWithEmailAndPassword(email, password); 
  }

  async logout() {
    return await this.fireAuth.signOut(); 
  }

  public get dbName(): string {
    return this._strDBName; 
  }

  public getServerTimestamp() {
    return firebase.firestore.FieldValue.serverTimestamp(); 
  }

  //Return GeoPoint Data Refrence to store as GeoPoint in Firestore. 
  geopoint(lat: number, lng: number) {
    return new firebase.firestore.GeoPoint(lat, lng); 
  }

  public uniqueID(): string {
    return this.afs.createId(); 
  }

  public setTimestamp<T extends {id?: string, createdBy?: string, createdOn?: any, updatedBy?: string, updatedOn?: any, isDeleted?: boolean, deletedBy?: string, deletedOn?: any}>(opType: string, data: T): any {
    let newData = data; 
    let timestamp = this.getServerTimestamp(); 
    let userID = this.localStore.getItem(localStoreKeys.userID); 

    if(AppValidations.isNullOrEmpty(userID)) {
      userID = "Root"; 
    }

    switch (opType) {
      case fbDbOps.add:
        newData.createdBy = userID!;
        newData.createdOn = timestamp!; 
        newData.updatedBy = userID!;  
        newData.updatedOn = timestamp!; 
        newData.isDeleted = false;  
        newData.deletedBy = "";
        newData.deletedOn = null; 
        break;
      case fbDbOps.set: 
        newData.updatedBy = userID!; 
        newData.updatedOn = timestamp; 
        break;
      case fbDbOps.update: 
        newData.updatedBy = userID!; 
        newData.updatedOn = timestamp!;
        break; 
      case fbDbOps.softdelete: 
        newData.isDeleted = true; 
        newData.deletedBy = userID!; 
        newData.deletedOn = timestamp!; 
        break; 
    }

    return newData; 
  }

  /**
   * A function to get document collection for a specified path. 
   * @param ref : Collection Reference or String Path of the Collection
   * @param queryFn : Query Function to filter the collection records. 
   * @returns : AngularFireCollection with list of documents. 
   */

  coll<T>(ref: CollectionPredicate<T>, queryFn?: any): AngularFirestoreCollection<T> {
    return typeof ref === 'string' ? this.afs.collection<T>(ref, queryFn) : ref; 
  }

  /**
   * A function to get Document Reference for a given Path. 
   * @param ref : DocumentReference OR string containing document path. 
   * @returns : Document with specified path details. 
   */
  doc<T>(ref: DocumentPredicate<T>): AngularFirestoreDocument<T> {
    return typeof ref === 'string' ? this.afs.doc<T>(ref) : ref; 
  }

  /**
   * To get document by ID within a collection object. 
   * @param ref : Path of the Collection Object in which document resides. 
   * @param docId : Document ID for which you want data to be returned. 
   * @returns : Document data with ID. 
   */
  public getDocById<T extends {id?: string}>(ref: CollectionPredicate<T>, docId: string): Observable<T> {
    return this.coll<T>(ref)
      .doc<T>(docId)
      .snapshotChanges()
      .pipe(
        map(doc => {
          if(doc.payload.exists) {
            const data = doc.payload.data() as any; 
            const id = doc.payload.id; 
            return {id, ...data}
          }
        })
      ); 
  }

  /**
   * To get list of documents under a given collection/colleciton path. 
   * @param ref : Collection Reference OR path of the collection
   * @param queryFn : Where Clause OR Query Function
   * @returns : List of Documents under given collection. 
   */
  public getDocs<T>(ref: CollectionPredicate<T>, queryFn?: any): Observable<T[]> {
    return this.coll(ref, queryFn).snapshotChanges().pipe(map(docs => {
      return docs.map(doc => doc.payload.doc.data()) as T[]; 
    })); 
  }

  /**
   * To get list of documents with ID under a given collection/colleciton path. 
   * @param ref : Collection Reference OR path of the collection
   * @param queryFn : Where Clause OR Query Function
   * @returns : List of Documents with ID under given collection. 
   */
  public getDocsWithIDs<T>(ref: CollectionPredicate<T>, queryFn?: any): Observable<T[]> {
    return this.coll(ref, queryFn).snapshotChanges().pipe(map(docs => {
      return docs.map(doc => {
        const data = doc.payload.doc.data(); 
        const id = doc.payload.doc.id; 
        return {id, ...data} 
      }) as T[]; 
    })); 
  }

  /**
   * To get list of documents under a given collection based on Where Condition. 
   * @param ref : Collection Reference OR path of the collection
   * @param whereClause : Firebase Where Clause Object. 
   * @param orderByClause : Order by Clause. 
   * @param inclDel : Include Soft Deleted Records? 
   * @returns : List of Documents under a given collection. 
   */
  public getDocsByWhereClause<T>(ref: CollectionPredicate<T>, whereClause?:FbWhereClause, orderByClause?: any, inclDel: boolean = false): Observable<T[]> {
    let _queryFn: string = ''; 

    if(!(whereClause === null || whereClause === undefined)) {
        if(!inclDel) {
            whereClause.addClause(documentDb.generalCols.isDeleted, '==', false); 
        }
        _queryFn = "ref => ref" + whereClause.getClause(); 
        return this.getDocs(ref, eval(_queryFn));  
    } else {
        let whrClause: FbWhereClause = new FbWhereClause(); 
        if(!inclDel) {
          whrClause.addClause(documentDb.generalCols.isDeleted, '==', false); 
          _queryFn = "ref => ref" + whrClause.getClause(); 
          return this.getDocs(ref, eval(_queryFn)); 
        } else {
          return this.getDocs(ref);
        }
    }
  }

  /**
   * To get list of documents with ID under a given collection based on Where Condition. 
   * @param ref : Collection Reference OR path of the collection
   * @param whereClause : Firebase Where Clause Object. 
   * @param orderByClause : Order by Clause. 
   * @param inclDel : Include Soft Deleted Records? 
   * @returns : List of Documents with ID under a given collection. 
   */
   public getDocsWithIDsByWhereClause<T>(ref: CollectionPredicate<T>, whereClause?:FbWhereClause, orderByClause?: any, inclDel: boolean = false): Observable<T[]> {
    let _queryFn: string = ''; 

    if(!(whereClause === null || whereClause === undefined)) {
      if(!inclDel) {
          whereClause.addClause(documentDb.generalCols.isDeleted, '==', false); 
      }
      _queryFn = "ref => ref" + whereClause.getClause(); 
      return this.getDocsWithIDs(ref, eval(_queryFn));  
    } else {
        let whrClause: FbWhereClause = new FbWhereClause(); 
        if(!inclDel) {
          whrClause.addClause(documentDb.generalCols.isDeleted, '==', false); 
          _queryFn = "ref => ref" + whrClause.getClause(); 
          return this.getDocsWithIDs(ref, eval(_queryFn)); 
        } else {
          return this.getDocsWithIDs(ref);
        }
    }
  }

  public addDoc<T>(ref: CollectionPredicate<T>, data: T): Promise<T> {
    const docData = this.setTimestamp(fbDbOps.add, data); 

    const promise = new Promise<T>((resolve, reject) => {
      this.coll(ref).add(docData)
        .then(doc => {
          const newDoc = {
            id: doc.id, 
            ...(docData as any)
          }; 
          resolve(newDoc); 
        })
    }); 
    return promise; 
  }

  public setDoc<T extends {id?: string}>(ref: CollectionPredicate<T>, data: T): Promise<T> {
    const docData = this.setTimestamp(fbDbOps.set, data); 

    const promise = new Promise<T>((resolve, reject) => {
      this.coll(ref).doc<T>(docData.id).set(docData)
        .then(() => {
          resolve(docData as any); 
        })
    });
    return promise;  
  }

  public updateDoc<T extends {id?: string}>(ref: CollectionPredicate<T>, data: T): Promise<T> {
    const docData = this.setTimestamp(fbDbOps.update, data); 

    const promise = new Promise<T>((resolve, reject) => {
      this.coll(ref).doc<T>(docData.id).update(docData)
        .then(() => {
          resolve(docData as any); 
        })
    });
    return promise;  
  }

  public softDeleteDoc<T>(ref: CollectionPredicate<T>, data: T): Promise<T> {
    const docData = this.setTimestamp(fbDbOps.softdelete, data); 

    const promise = new Promise<T>((resolve, reject) => {
      this.coll(ref).doc<T>(docData.id).update(docData)
        .then(() => {
          resolve(docData as any); 
        }); 
    }); 

    return promise; 
  }

  public deleteDoc<T>(ref: DocumentPredicate<T>): void {
    this.doc(ref).delete(); 
  }

  /**
   * For creating a new document where Document ID is available. 
   * @param ref: Document Reference
   * @param data : The data structure that needs saving. 
   */
  public set<T>(ref: DocumentPredicate<T>, data: any) {
    const timestamp = this.getServerTimestamp(); 
    let userID: string | null | undefined = this.localStore.getItem(localStoreKeys.userID); 

    //If User ID is not stored in Local Store, then use Root.  
    if(AppValidations.isNullOrEmpty(userID)) {
      userID = "Root"; 
    }

    this.doc(ref).set({
      ...data, 
      createdOn: timestamp, 
      createdBy: userID, 
      updatedOn: timestamp, 
      updatedBy: userID, 
      isDeleted: false
    }); 
  }


  /**
   * To initialize the Firestore Database as default. 
   * CAUTION: ONLY RUN THIS IF YOU DON'T HAVE FIRESTORE SETUP. OTEHRWISE, IT WILL PERMENANTLY DELETE ALL YOUR FIRESTORE DATA. 
   */
  public initializeFirestore = new Observable<string>((observer) => {
    try {
      observer.next("Connecting to Firestore..."); 
      observer.next("Initializing Core Database Structure for First Use...");

      //#region Applications
      /*************************
       * Applications
       *************************/
        observer.next("**************************************"); 
        observer.next("Creating Applications/eCompanyAdmin..."); 
        let eCompAdmin = {
            id: "eCompanyAdmin", 
            name: "eCompany Administration", 
            tagLine: "Business With Intelligence"
        }
        this.addDoc("applications/eCompanyAdmin", eCompAdmin); 
        observer.next("Applications/eCompanyAdmin Created"); 
        //#endregion Applications

    } catch (error) {
      console.log("An Error occurred while creating database ...."); 
      observer.error(error); 
    } finally {
      observer.complete(); 
    }
  }); 
}
