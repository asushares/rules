// Author: Preston Lee

import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { StatusService } from '../status.service';
import { Rule, RulesFile } from '@asushares/core';
import { CommonModule } from '@angular/common';

import * as uuid from 'uuid';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-open',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './open.component.html',
  styleUrl: './open.component.scss'
})
export class OpenComponent implements OnInit {

  static DEFAULT_REMOTE_URL = 'https://cds-hooks.sandbox.asushares.com/data/sensitivity-rules.json';

  remoteUrl: string = OpenComponent.DEFAULT_REMOTE_URL;
  originalContent: RulesFile | null = null;
  originalFileName: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public dataService: DataService,
    public statusService: StatusService,
    public toastrService: ToastrService
  ) {
    console.log("OpenComponent has been initialized.");
    this.reset();
    // this.toastrService.showInfoToast('DEBUG', 'Loaded OpenComponent');

    // To always start with a new document.
    // this.createFromTemplate();
  }

  ngOnInit() {
    let url = this.route.snapshot.queryParams["url"];
    if (url) {
      this.remoteUrl = url;
      this.loadRemoteUrl();
    }
  }

  loadRemoteUrl() {
    if (!!this.remoteUrl) {
      this.loadRemoteFile(this.remoteUrl);
    } else {
      console.warn('warning', "Need URL. Please provide a URL to load.");
    }
  }

  filenameFor(url: string): string {
    let path = url.substring(url.lastIndexOf("/") + 1);
    return (path.match(/[^.]+(\.[^?#]+)?/) || [])[0]?.toString() || '';
  }

  loadRemoteFile(url: string) {

    let obs = this.dataService.loadFromUrl(url);
    // obs.subscribe((raw) => {
    //   console.log('Downloaded raw remote file from: ' + url);
    //   this.originalFileName = this.filenameFor(url);
    // });
  }

  reset() {
    this.remoteUrl = OpenComponent.DEFAULT_REMOTE_URL;
    this.originalContent = null;
    this.originalFileName = null;
  }

  createFromTemplate() {
    let rf = new RulesFile();
    const r = Rule.fromTemplate();
    rf.rules.push(r);
    this.statusService.updatePermissionsFor(rf);
    this.dataService.rules_file.next(rf);
    this.navigateToEditor();

  }

  navigateToEditor() {
    this.router.navigate(['/editor']);
  }

  openFile(event: any) {
    console.log("Reading...");
    // let input = ;
    if (event.target.files.length > 0) {

      let file: File = event.target.files[0];
      let reader = new FileReader();
      reader.readAsText(file);
      reader.onload = () => {
        // reading has finished
        let parsed: RulesFile = Object.assign(new RulesFile(), JSON.parse(reader.result!.toString()));
        this.statusService.updatePermissionsFor(parsed);
        this.dataService.rules_file.next(parsed);
        // this.dataService.workstream = null;
        this.originalFileName = file.name;
        console.log("File name: " + this.originalFileName);
        this.navigateToEditor();
      }

    } else {
      this.reset();
    }
  }


}
