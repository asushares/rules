// Author: Preston Lee

import { RouterModule, Routes } from '@angular/router';
import { OpenComponent } from './open/open.component';
import { EditorComponent } from './editor/editor.component';
import { RuleComponent } from './rule/rule.component';
import { SettingsComponent } from './settings/settings.component';
import { NgModule } from '@angular/core';

export const routes: Routes = [
    {
        path: '',
        component: OpenComponent
    },
    {
        path: 'editor',
        component: EditorComponent,
        children: [
            {
                path: 'rules/:id',
                component: RuleComponent
            }
        ]
    },
    {
        path: 'settings',
        component: SettingsComponent
    }
];


@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
