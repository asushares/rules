import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app/app-routes.module';
import { provideToastr, ToastrModule } from 'ngx-toastr';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(AppRoutingModule, BrowserModule, FormsModule),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
    provideToastr()
 ],
})
  .catch((err) => console.error(err));