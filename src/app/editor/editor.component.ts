// Author: Preston Lee

import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { DataService } from '../data.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { StatusService } from '../status.service';
import { BaseComponent } from '../base.component';
import { RulesFile } from '../models/rules_file';
import { Rule } from '../models/rule';

import * as uuid from 'uuid';
import { CommonModule } from '@angular/common';
import { ToasterComponent } from '../toaster/toaster.component';
import { ToastComponent } from '../toast/toast.component';
import { ToastService } from '../toast.service';
import { FormsModule } from '@angular/forms';
// import { ToastService } from '../toast.service';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, ToasterComponent, ToastComponent, RouterModule, FormsModule],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss',
  providers: [ToastService]
})
export class EditorComponent extends BaseComponent {

  public rules_file: RulesFile | null = null;
  // workstream: Workstream | null = null;
  // route_workstream_id: string | null = null;

  public sidebarActive: boolean = true;
  public download_locked: boolean = false;

  constructor(protected dataService: DataService, protected statusService: StatusService, protected toastService: ToastService, protected http: HttpClient, protected route: ActivatedRoute, protected router: Router) {
    super();
    // this.route_workstream_id = this.route.snapshot.paramMap.get('workstream_id')!;
  }

  ruleForId(id: string): Rule | null {
    let r: Rule | null = null;
    this.rules_file?.rules.forEach(n => {
      if (id == n.id) {
        r = n;
      }
    }
    );
    return r;
  }

  ngOnInit(): void {
    this.dataService.rules_file
      .subscribe(rf => {
        if (rf) {
          // When not null, the service has finished loading data
          this.rules_file = rf;
          // if (dd.workstreams.length > 0) {
          //   this.router.navigate(['/editor','rules',rf.rules[0].id]);
          // }
          // this.toastService.showSuccessToast("Document Loaded", "Your rules file has been loaded.")
        } else if (this.dataService.loading) {
          // Do nothing as the data service is probably downloading something
        } else {
          // Assume the dashboard was loaded with data context and we should force the open screen
          console.log("Editor forcing navigation to open component.");
          this.router.navigate(['/']);
        }
      }
      );
  }

  toggleSidebar() {
    this.sidebarActive = !this.sidebarActive;
    console.log("Toggled sidebar to " + this.sidebarActive);
  }

  // selectWorkstream(workstream: Workstream) {
  //   this.workstream = workstream;
  //   console.log("Workstream selected: " + this.workstream.name);
  // }



  downloadRulesFile() {
    // Download mechanism via: https://blog.logrocket.com/programmatic-file-downloads-in-the-browser-9a5186298d5c/
    let copy = JSON.parse(JSON.stringify(this.rules_file));
    if (this.statusService.permissions.edit) { // Only set document editability if use has permission to do so
      copy.settings.editable = !this.download_locked;
    }
    const blob = new Blob([JSON.stringify(copy, null, "\t")], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dashboard.json';
    a.click();
    this.toastService.showSuccessToast("Document Downloaded", "File saved to your browser downloads folder.");
  }

  toggleEditMode() {
    this.statusService.editing = !this.statusService.editing;
  }

  createRule() {
    let r = Rule.fromTemplate();
    this.rules_file?.rules.push(r);
  }

  deleteRule(r: Rule) {
    // if (this.workstream?.id == w.id) {
    if (this.route.snapshot.paramMap.get("rule_id") == r.id) {
      this.router.navigate(['/editor']);
      // this.workstream = null;
    }
    let i = this.rules_file?.rules.indexOf(r, 0);
    if (i !== undefined && i > -1) {
      this.rules_file?.rules.splice(i, 1);
    }
  }
  duplicateRule(r: Rule) {
    const clone = JSON.parse(JSON.stringify(r));
    clone.id += '-copy';
    this.rules_file?.rules.push(clone);
  }
}
