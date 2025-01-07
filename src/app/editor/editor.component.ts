// Author: Preston Lee

import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { DataService } from '../data.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { StatusService } from '../status.service';
import { BaseComponent } from '../base.component';
import { Rule, RulesFile } from '@asushares/core';

import * as uuid from 'uuid';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../settings/settings.service';
import { ToastrService } from 'ngx-toastr';
// import { toastrService } from '../toast.service';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss',
  // providers: [toastrService]
})
export class EditorComponent extends BaseComponent {
  
  public rules_file: RulesFile | null = null;
  
  public sidebarActive: boolean = true;
  public download_locked: boolean = false;
  
  constructor(protected dataService: DataService, protected settingsService: SettingsService, protected statusService: StatusService, protected toastrService: ToastrService, protected http: HttpClient, protected route: ActivatedRoute, protected router: Router) {
    super();
    // this.toastrService.showInfoToast('DEBUG', 'Loaded EditorComponent');
  }
  
  totalCodesFor(rule: Rule) {
    let count = 0;
    rule.codeSets.forEach(n => {
      count += n.codes.length;
    });
    return count;
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
          // this.toastrService.success("Your rules file has been loaded.", "Document Loaded")
          let rule_id = this.route.snapshot.paramMap.get('id');
          if (!rule_id && this.rules_file.rules.length > 0) {

            this.router.navigate(['editor', 'rules', this.rules_file.rules[0].id]);
          }
        } else if (this.dataService.loading) {
          // Do nothing as the data service is probably downloading something
        } else {
          // Assume the component was loaded with data context and we should force the open screen
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

  selectedRuleId(): string | null {
    let id = null;
    if (this.route.snapshot.firstChild) {
      id = this.route.snapshot.firstChild.paramMap.get('id');
    }
    // console.log(id);
    return id;
  }



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
    a.download = 'rules.json';
    a.click();
    this.toastrService.success("File saved to your browser downloads folder.", "Document Downloaded");
  }

  toggleEditMode() {
    this.statusService.editing = !this.statusService.editing;
  }

  createRule() {
    let r = Rule.fromTemplate();
    this.rules_file?.rules.push(r);
    this.router.navigate(['editor', 'rules', r.id]);
  }

  saveToServer() {
    this.settingsService.reload(); // Seems to be necessary in case credentials haven't initialized from storage.
    if (this.dataService.rules_file_url && this.rules_file) {
      this.dataService.save(this.dataService.rules_file_url, this.rules_file);
    }
  }

  deleteRule(r: Rule) {
    // if (this.workstream?.id == w.id) {
    let i = this.rules_file?.rules.indexOf(r, 0);
    if (i !== undefined && i > -1) {
      this.rules_file?.rules.splice(i, 1);
    }
    if (this.route.snapshot.paramMap.get("id") == r.id) {
      this.router.navigate(['/editor']);
    }
  }

  duplicateRule(r: Rule) {
    const clone = JSON.parse(JSON.stringify(r));
    clone.id += '-copy';
    this.rules_file?.rules.push(clone);
    this.router.navigate(['editor', 'rules', clone.id]);
  }

}
