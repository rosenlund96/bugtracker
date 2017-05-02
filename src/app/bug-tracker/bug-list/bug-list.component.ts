import { Component, OnInit } from '@angular/core';
import { BugService } from "../../core/service/bug.service";
import { Bug } from "../model/bug";
import {AngularFire} from "angularfire2";
import {Router} from "@angular/router";

@Component({
  moduleId: module.id,
  selector: 'bug-list',
  templateUrl: './bug-list.component.html',
  styleUrls: ['./bug-list.component.css']
})
export class BugListComponent implements OnInit {

  name: any;
  private bugs: Bug[] = [];

  constructor(public af: AngularFire, private router: Router, private bugService: BugService) {
    this.af.auth.subscribe(
      auth => {
        if (auth) {
          this.name = auth;
        }
      }
    )
  }

  ngOnInit() {
    this.getAddedBugs();
    this.getUpdatedBugs();
    this.getUpdatedList();
  }

  getAddedBugs() {
    this.bugService.getAddedBugs()
      .subscribe(bug => {
          this.bugs.push(bug);
          console.log(this.bugs);
        },
        err => {
          console.error("Unable to get added bug - ", err)
        });
  }

  getUpdatedBugs() {
    this.bugService.changedListener()
      .subscribe(updatedBug => {
          //Returns the index of the first occurrence of a value of the array that matches our id
          //After this we use the bugIndex and updates the position with the updated bug
          const bugIndex = this.bugs.map(index => index.id).indexOf(updatedBug['id']);
          this.bugs[bugIndex] = updatedBug;
        },
        err => {
          console.error("Unable to get updated bug - ", err);
        });
  }

  getUpdatedList() {
    this.bugService.getUpdatedList()
      .subscribe(deletedBug => {
          const bugIndex = this.bugs.map(index => index.id).indexOf(deletedBug['id']);
          console.log("bugIndex " + bugIndex);
          console.log(this.bugs);
          this.bugs.splice((bugIndex), 1);
        },
        err => {
          console.error("Unable to get updated list after removal of bugs - ", err);
        })
  }
}
