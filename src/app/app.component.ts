import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { DataService } from './data.service';
import { StatusService } from './status.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule,
    RouterOutlet,
    FormsModule,
    RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [DataService, StatusService]
})
export class AppComponent {
  title = 'rules';
}
