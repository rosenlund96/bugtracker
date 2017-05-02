import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { forbiddenStringValidator } from "../../shared/validation/forbidden-string.validator";
import { BugService } from "../../core/service/bug.service";
import { Bug } from "../model/bug";
import { STATUS, SEVERITY } from "../../core/constant/constants";
import { AngularFire, FirebaseAuthState, firebaseAuthConfig, AuthProviders, AuthMethods } from "angularfire2";
import { Router } from "@angular/router";


@Component({
  selector: 'bug-detail',
  templateUrl: 'bug-detail.component.html',
  styleUrls: ['bug-detail.component.css']
})
export class BugDetailComponent implements OnInit {

  private modalId = "bugModal";
  private bugForm: FormGroup;
  private statuses = STATUS;
  private severities = SEVERITY;
  private statusArr: string[] = [];
  private severityArr: string[] = [];
  @Input() private currentBug: Bug = new Bug(null, null, this.statuses.Logged, this.severities.Severe, null, null, null, null, null);

  isLoggedIn: boolean;
  updatedBug: boolean = false;
  public authState: FirebaseAuthState;
  name: any;
  username: string;

  constructor(private formB: FormBuilder, private bugService: BugService, private af: AngularFire,private router: Router) {
    this.af.auth.subscribe((auth) => {
      if (auth) {
        this.name = auth;
        console.log(auth.auth.email);
        this.username = auth.auth.email;
      }
    });
  }

  ngOnInit() {
    this.statusArr = Object.keys(this.statuses).filter(Number);
    this.severityArr = Object.keys(this.severities).filter(Number);
    this.configureForm();
  }

  //Optional with bug object
  configureForm(bug? : Bug) {

    if (bug) {
      this.currentBug = new Bug(
        bug.id,
        bug.title,
        bug.status,
        bug.severity,
        bug.description,
        bug.createdBy,
        bug.createdDate,
        bug.updatedBy,
        bug.updatedDate
      );
      //Save button available when bug is already made
      this.updatedBug = true;
    }

    //Reactive forms
    this.bugForm = this.formB.group({
      title: [this.currentBug.title, [Validators.required, forbiddenStringValidator]],
      status: [this.currentBug.status, Validators.required],
      severity: [this.currentBug.severity, Validators.required],
      description: [this.currentBug.description, Validators.required]
    });
  }

  submitForm() {
    console.log (this.bugForm);
    this.addBug();
    this.resetForm();
  }

  addBug() {
    this.currentBug.title = this.bugForm.value['title'];
    this.currentBug.status = this.bugForm.value['status'];
    this.currentBug.severity = this.bugForm.value['severity'];
    this.currentBug.description = this.bugForm.value['description'];
    //this.currentBug.createdBy = this.authState.auth.displayName;

    if (this.currentBug.id) {
      this.updateBug();
    } else {
      this.bugService.addBug(this.currentBug);
    }
  }

  updateBug() {
    this.bugService.updateBug(this.currentBug);
    this.resetForm();
  }

  resetForm() {
    this.bugForm.reset({status: this.statuses.Logged, severity: this.severities.Severe});
    this.cleanBug();
  }

  cleanBug() {
    this.currentBug = new Bug(null, null, this.statuses.Logged, this.severities.Severe, null, null, null);
  }

  deleteBug() {
    if(confirm("Do you really want to delete this bug?")) {
      this.bugService.deleteBug(this.currentBug);
      this.cleanBug();
    }
  }
}
