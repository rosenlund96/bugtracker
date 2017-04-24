import { Injectable } from '@angular/core';
import { FirebaseConfigService } from "./firebase-config.service";
import { Observable } from "rxjs";
import { Bug } from "../../bug-tracker/model/bug";
import { AngularFire, FirebaseAuthState, firebaseAuthConfig, AuthProviders, AuthMethods } from "angularfire2";
import { Router } from "@angular/router";

@Injectable()
export class BugService {

  loggedInUser: string;

  constructor(private fire: FirebaseConfigService, private af: AngularFire,private router: Router) {
    this.af.auth.subscribe((auth) => {
      if (auth) {
        this.loggedInUser = auth.auth.email;
        console.log(auth.auth.email);
      }
    });
  }

  private bugsDbReference = this.fire.database.ref().child('bugs');


  getAddedBugs(): Observable<any> {
    return Observable.create(obs => {
      // Whenever a new child is added, the child is called "bug"
      this.bugsDbReference.on('child_added', bug => {
        // Cast the newBug as model Bug
        const newBug = bug.val() as Bug;
        newBug.id = bug.key;
        obs.next(newBug);
      },
      err => {
        obs.throw(err);
      });
    });
  }

  //Whenever getAddedBugs() is called, the user has to manually update the page to see the edited bugs
  //This method will avoid this problem by creating a changed child-listener
  changedListener(): Observable<any> {
    return Observable.create(obs => {
      this.bugsDbReference.on('child_changed', bug => {
          const updatedBug = bug.val() as Bug;
          updatedBug.id = bug.key;
          obs.next(updatedBug);
        },
        err => {
          obs.throw(err);
        });
    });
  }


  getUpdatedList(): Observable<any> {
    return Observable.create(obs => {
      this.bugsDbReference.on('child_removed', bug => {
        const deletedBug = bug.val() as Bug;
        deletedBug.id = bug.key;
        console.log(deletedBug.id);
        obs.next(deletedBug);
      },
        err => {
        obs.throw(err);
      });
    });
  }

  addBug(bug: Bug) {
    const newBugReference = this.bugsDbReference.push();
    newBugReference.set({
      title: bug.title,
      status: bug.status,
      severity: bug.severity,
      description: bug.description,
      createdBy: this.loggedInUser,
      createdDate: Date.now(),
    })
      .catch(err => console.error("Unable to add bug to Firebase - ", err));
  }

  //Saves the id of a chosen bug
  updateBug(bug: Bug) {
    const currentBugReference = this.bugsDbReference.child(bug.id);
    bug.id = null;
    bug.updatedBy = this.loggedInUser;
    console.log(this.loggedInUser);
    bug.updatedDate = Date.now();
    currentBugReference.update(bug);
  }

  deleteBug(bug: Bug) {

    const bugsRef = this.bugsDbReference.child(bug.id);
    var savedId: string;
    bug.id = null;
    bugsRef.on("value", function (snapshot) {
      savedId = snapshot.key;
    }, function (error) {
      console.log("Error: " + error.code)
    })
    console.log(savedId);
    this.bugsDbReference.child('bug').child(savedId).remove();
    //bugsRef.child(savedId).remove();
  }
}
