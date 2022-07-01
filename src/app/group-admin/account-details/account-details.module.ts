import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {AccountDetailsComponent} from '@groupAdminModule/account-details/account-details.component';
import {AccountSettingsComponent} from '@groupAdminModule/account-details/account-settings/account-settings.component';
import {BankDetailsComponent} from '@groupAdminModule/account-details/bank-details/bank-details.component';
import {BeneficiaryDetailsComponent} from '@groupAdminModule/account-details/beneficiary-details/beneficiary-details.component';
import {EmailNotificationsComponent} from '@groupAdminModule/account-details/email-notifications/email-notifications.component';
import {AccountTypeComponent} from '@groupAdminModule/account-details/account-type/account-type.component';
import {UploadPanComponent} from '@groupAdminModule/account-details/upload-pan/upload-pan.component';

@NgModule({
	declarations: [
		AccountDetailsComponent,
		AccountSettingsComponent,
		BankDetailsComponent,
		BeneficiaryDetailsComponent,
		EmailNotificationsComponent,
		AccountTypeComponent,
		UploadPanComponent
	],
	providers: [],
	imports: [CommonModule, RouterModule.forChild([{path: '', component: AccountDetailsComponent}])]
})
export class AccountDetailsModule {}
