// Author: Preston Lee

import { Component, OnInit } from '@angular/core';
import { SettingsService } from './settings.service';

import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  constructor(protected toastrService: ToastrService, protected settingsService: SettingsService, public location: Location) {
  }

  ngOnInit() {
    this.reload();
  }

  reload() {
    this.settingsService.reload();
  }

  save() {
    this.settingsService.saveSettings();
    this.toastrService.success("Settings are local to your browser only.", "Settings Saved")
  }

  restore() {
    this.settingsService.forceResetToDefaults();
    this.toastrService.success("All settings have been restored to their defaults.", "Settings Restored")

  }

  back() {
    this.location.back();
  }

}
