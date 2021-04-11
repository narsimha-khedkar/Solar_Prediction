import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { RouterModule } from "@angular/router";

import { AppRoutingModule } from "./app.routing";
import { ComponentsModule } from "./components/components.module";

import { AppComponent } from "./app.component";

import { AgmCoreModule } from "@agm/core";
import { AdminLayoutComponent } from "./layouts/admin-layout/admin-layout.component";
import {
  NgxGoogleAnalyticsModule,
  NgxGoogleAnalyticsRouterModule,
} from "ngx-google-analytics";
import { LoadingSpinnerModule } from "./loading-spinner/loading-spinner.module";
import { LoaderService } from "./services/loader.service";
import { LoaderInterceptor } from "./interceptors/loader-interceptor.service";
import { MatStepperModule } from "@angular/material/stepper";
import { GoogleChartsModule } from "angular-google-charts";

@NgModule({
  imports: [
    BrowserAnimationsModule,
    NgxGoogleAnalyticsModule.forRoot("G-W3T8E40EV7"),
    NgxGoogleAnalyticsRouterModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ComponentsModule,
    RouterModule,
    AppRoutingModule,
    AgmCoreModule.forRoot({
      apiKey: "YOUR_GOOGLE_MAPS_API_KEY",
    }),
    LoadingSpinnerModule,
    MatStepperModule,
    GoogleChartsModule,
  ],
  declarations: [AppComponent, AdminLayoutComponent],
  providers: [
    LoaderService,
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
