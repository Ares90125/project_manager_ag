import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, ErrorHandler, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ToastrModule} from 'ngx-toastr';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BsDropdownModule} from 'ngx-bootstrap/dropdown';
import {ErrorsHandler} from '@sharedModule/services/error-handler.service';
import {HttpInterceptors} from './_interceptors/http-interceptors';
import {GroupAdminModule} from '@groupAdminModule/group-admin.module';
import {LoginResponseComponent} from './group-admin-login/login-response/login-response.component';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {PlaceHolderComponent} from './place-holder.component';
import {CampaignReportService} from '@sharedModule/services/campaign-report.service';
import {Router} from '@angular/router';
import * as Sentry from '@sentry/angular';
import {GroupAdminLoginComponent} from './group-admin-login/landing/group-admin-login.component';

declare global {
	interface Window {
		analytics: any;
	}
}
@NgModule({
	declarations: [AppComponent, LoginResponseComponent, PlaceHolderComponent, GroupAdminLoginComponent],
	imports: [
		BrowserModule,
		AppRoutingModule,
		HttpClientModule,
		BrowserAnimationsModule,
		ToastrModule.forRoot({closeButton: true}),
		BsDropdownModule.forRoot(),
		GroupAdminModule,
		MatProgressBarModule
	],
	providers: [
		CampaignReportService,
		{provide: ErrorHandler, useClass: ErrorsHandler},
		{provide: HTTP_INTERCEPTORS, useClass: HttpInterceptors, multi: true},
		{provide: Sentry.TraceService, deps: [Router]},
		{
			provide: APP_INITIALIZER,
			useFactory: () => () => {},
			deps: [Sentry.TraceService],
			multi: true
		}
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	bootstrap: [AppComponent]
})
export class AppModule {
	constructor(trace: Sentry.TraceService) {}
}
