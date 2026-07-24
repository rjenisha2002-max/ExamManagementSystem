import { bootstrapApplication } from '@angular/platform-browser';           // Imports standalone bootstrap function
import { provideHttpClient } from '@angular/common/http';                   // Imports HttpClient provider for standalone apps
import { AppComponent } from './app/app.component';                        // Imports the root standalone component

bootstrapApplication(AppComponent, {                                        // Bootstraps the standalone Angular application
  providers: [provideHttpClient()]                                          // Registers HttpClient for dependency injection
}).catch(err => console.error(err));                                        // Logs any bootstrap error to the console
