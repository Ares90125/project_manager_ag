import {NgModule} from '@angular/core';
import {CSAdminLoginComponent} from './cs-admin-login.component';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {AccountServiceService} from '@sharedModule/services/account-service.service';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatCardModule} from '@angular/material/card';
import {MatInputModule} from '@angular/material/input';
import {MatDialogModule} from '@angular/material/dialog';

@NgModule({
	declarations: [CSAdminLoginComponent],
	imports: [
		CommonModule,
		RouterModule.forChild([{path: '', component: CSAdminLoginComponent}]),
		FormsModule,
		ReactiveFormsModule,
		MatCardModule,
		MatFormFieldModule,
		MatInputModule,
		MatDialogModule
	],
	providers: [AccountServiceService]
})
export class CsAdminModule {}
