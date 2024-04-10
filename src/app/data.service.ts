// Author: Preston Lee

import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { StatusService } from './status.service';
import { RulesFile } from '@asushares/core';
import { ToastService } from './toast.service';
import { Router } from '@angular/router';
import { SettingsService } from './settings/settings.service';
import { Buffer } from 'buffer';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  public default_url: string | null = null;
  public rules_file_url: string | null = null;
  public loading = false;
  public rules_file: BehaviorSubject<RulesFile | null> = new BehaviorSubject<RulesFile | null>(null);


  constructor(protected settingsService: SettingsService, protected http: HttpClient, protected statusService: StatusService, protected toastService: ToastService, protected router: Router) {
    this.default_url = (window as any)['DEFAULT_RULES_FILE_URL'].toString();
    // if(this.default_url) {
    //   this.rules_file_url = this.default_url;
    // }
    if (this.default_url && this.default_url.length > 0) {
      console.log("Default rules file URL provided. Will attempt to load: " + this.default_url);
      this.loadFromUrl(this.default_url);
    } else {
      console.log("No default data URL provided.");
    }
  }


  loadFromUrl(url: string) {
    this.loading = true;
    this.http.get<RulesFile>(url).subscribe({
      next: (rf => {
        this.rules_file_url = url;
        this.loading = false;
        this.statusService.updatePermissionsFor(rf);
        this.rules_file.next(rf);
        this.toastService.showSuccessToast("File Loaded!", "Starting app...");
        this.statusService.editing = false; // Seems reasonable
        this.router.navigate(['editor']);
      }),
      error: (e => {
        this.loading = false;
        this.toastService.showWarningToast("Couldn't load URL", "The remote rules file URL couldn't be loaded, sorry. Check the URL and your connectivity and try again.");
      })
    });
    // this.rules_file = this.http.get<RulesFile>(url);
    // ?    return this.rules_file;
  }

  savable(): boolean {
    return !!this.rules_file_url;
  }

  headers() {
    console.log(this.settingsService.settings.cds_username);
    console.log(this.settingsService.settings.cds_password);
    
    let h = new HttpHeaders();
    h = h.set('Content-Type', 'application/json');
    h = h.set('Accept', 'application/json');
    const b64token = Buffer.from(this.settingsService.settings.cds_username + ':' + this.settingsService.settings.cds_password, 'binary').toString('base64');
    h = h.set('Authorization', 'Basic ' + b64token);
    // h = h.set('Authorization', 'Bearer ' + btoa(this.settingsService.settings.cds_username + ':' + this.settingsService.settings.cds_password));
    return h;
  }

  save(url: string, rf: RulesFile) {
    // if(this.rules_file_url) {
    let data = JSON.stringify(rf, null, "\t");
    return this.http.post(url, data, { headers: this.headers() }).subscribe({
      next: data => {
        this.toastService.showSuccessToast('File Saved', 'Successfully updated the server. Changes should be effective immediately.');
      }, error: e => {
        this.toastService.showErrorToast('Error Saving', 'File could not be saved to remote server. Try downloading it locally and posting it later?');
      }
    });
    // } else 
  }

}

