
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Toast } from 'bootstrap';
import { fromEvent, take } from 'rxjs';
import { ToastEventTypes } from '@asushares/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
})
export class ToastComponent implements OnInit {
  @Output() disposeEvent = new EventEmitter();

  @ViewChild('toastElement', { static: true })
  toastEl!: ElementRef;

  @Input()
  type!: ToastEventTypes;

  @Input()
  title!: string;

  @Input()
  message!: string;

  toast!: Toast;

  ngOnInit() {
    this.show();
  }

  show() {
    this.toast = new Toast(
      this.toastEl.nativeElement,
      this.type === ToastEventTypes.Error
        ? {
            autohide: false,
          }
        : {
            delay: 5000,
          }
    );

    fromEvent(this.toastEl.nativeElement, 'hidden.bs.toast')
      .pipe(take(1))
      .subscribe(() => this.hide());

    this.toast.show();
  }

  hide() {
    this.toast.dispose();
    this.disposeEvent.emit();
  }
}
