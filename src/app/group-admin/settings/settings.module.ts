import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {SettingsHeaderComponent} from '@groupAdminModule/settings/settings-header/settings-header.component';
import {NgxIntlTelInputModule} from 'ngx-intl-tel-input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '@sharedModule/shared.module';
import {MatInputModule} from '@angular/material/input';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatCardModule} from '@angular/material/card';
import {MatSelectModule} from '@angular/material/select';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {OverlaysModule} from '@groupAdminModule/overlays/overlays.module';
import {SettingsNotificationPreferencesComponent} from './settings-notification-preferences/settings-notification-preferences.component';
import {FacebookInsightsUploadComponent} from './facebook-insights-upload/facebook-insights-upload.component';
import {QuillModule} from 'ngx-quill';
import {SettingAdminBioComponent} from './setting-admin-bio/setting-admin-bio.component';
import {UnSavedGuard} from '@sharedModule/guards/un-saved.guard';

@NgModule({
	declarations: [
		SettingsHeaderComponent,
		SettingsNotificationPreferencesComponent,
		FacebookInsightsUploadComponent,

		SettingAdminBioComponent
	],
	providers: [UnSavedGuard],
	imports: [
		CommonModule,
		RouterModule.forChild([
			{path: '', component: SettingsHeaderComponent},
			{path: 'admin-bio', component: SettingAdminBioComponent, canDeactivate: [UnSavedGuard]},
			{path: 'preferences', component: SettingsNotificationPreferencesComponent},
			{path: 'facebook-insights-upload', component: FacebookInsightsUploadComponent}
		]),
		FormsModule,
		SharedModule,
		ReactiveFormsModule,
		MatInputModule,
		NgxIntlTelInputModule,
		MatCardModule,
		MatSelectModule,
		MatFormFieldModule,
		OverlaysModule,
		MatCheckboxModule,
		MatSlideToggleModule,
		QuillModule.forRoot()
	]
})
export class SettingsModule {}
