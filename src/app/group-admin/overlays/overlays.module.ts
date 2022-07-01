import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AddAppToGroupOverlayComponent} from '../overlays/add-app-to-group-overlay/add-app-to-group-overlay.component';
import {HowAddAppToGroupComponent} from '../overlays/how-add-app-to-group/how-add-app-to-group.component';
import {MobileInstallationComponent} from '../overlays/mobile-installation/mobile-installation.component';
import {PersonaSurveyComponent} from '@groupAdminModule/overlays/persona-survey/persona-survey.component';
import {BusinessCategoryComponent} from '@groupAdminModule/overlays/business-category/business-category.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatRadioModule} from '@angular/material/radio';
import {SharedModule} from '@sharedModule/shared.module';
import {EmailVerificationComponent} from '@groupAdminModule/overlays/email-verification/email-verification.component';
import {MatCardModule} from '@angular/material/card';
import {MatInputModule} from '@angular/material/input';
import {CarouselModule} from 'ngx-owl-carousel-o';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {PublishPermissionOverlayComponent} from './publish-permission-overlay/publish-permission-overlay.component';
import {SwitchFbAccountOverlayComponent} from './switch-fb-account-overlay/switch-fb-account-overlay.component';
import {NgxIntlTelInputModule} from 'ngx-intl-tel-input';

@NgModule({
	declarations: [
		AddAppToGroupOverlayComponent,
		HowAddAppToGroupComponent,
		MobileInstallationComponent,
		PersonaSurveyComponent,
		BusinessCategoryComponent,
		EmailVerificationComponent,
		PublishPermissionOverlayComponent,
		SwitchFbAccountOverlayComponent
	],
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		MatRadioModule,
		SharedModule,
		MatInputModule,
		MatCardModule,
		CarouselModule,
		MatCheckboxModule,
		MatFormFieldModule,
		MatInputModule,
		MatCardModule,
		NgxIntlTelInputModule
	],
	exports: [
		AddAppToGroupOverlayComponent,
		HowAddAppToGroupComponent,
		MobileInstallationComponent,
		PersonaSurveyComponent,
		BusinessCategoryComponent,
		EmailVerificationComponent,
		PublishPermissionOverlayComponent,
		SwitchFbAccountOverlayComponent
	]
})
export class OverlaysModule {}
