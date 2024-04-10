// Author: Preston Lee

import { Injectable } from '@angular/core';
import { Permissions } from './models/permissions';
import { RulesFile } from '@asushares/core';

@Injectable({
  providedIn: 'root'
})
export class StatusService {

  public editing: boolean = false;
  public permissions: Permissions = new Permissions();

  constructor() { }

  updatePermissionsFor(rf: RulesFile) {
    console.log("Document request for editing support: " + rf.settings.editable);
    this.permissions.edit = rf.settings.editable;
    if(!rf.settings.editable) {
      this.editing = false;
    }
  }
}
