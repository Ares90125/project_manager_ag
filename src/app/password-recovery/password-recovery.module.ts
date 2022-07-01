import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ForgotPasswordComponent} from './forgot-password/forgot-password.component';
import {ResetForgotPasswordComponent} from './reset-forgot-password/reset-forgot-password.component';
import {ResetPasswordComponent} from './reset-password/reset-password.component';
import {PasswordRecoveryComponent} from './password-recovery.component';
import {CommonModule} from '@angular/common';
import {PasswordRecoveryRoutingModule} from './password-recovery-routing.module';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {AccountServiceService} from '@sharedModule/services/account-service.service';
import {MatInputModule} from '@angular/material/input';

@NgModule({
	declarations: [
		PasswordRecoveryComponent,
		ForgotPasswordComponent,
		ResetForgotPasswordComponent,
		ResetPasswordComponent
	],
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		PasswordRecoveryRoutingModule,
		MatCardModule,
		MatFormFieldModule,
		MatInputModule,
		MatIconModule
	],
	providers: [AccountServiceService]
})
export class PasswordRecoveryModule {}
