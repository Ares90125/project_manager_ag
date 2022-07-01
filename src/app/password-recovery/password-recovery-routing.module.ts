import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ForgotPasswordComponent} from './forgot-password/forgot-password.component';
import {ResetPasswordComponent} from './reset-password/reset-password.component';
import {ResetForgotPasswordComponent} from './reset-forgot-password/reset-forgot-password.component';
import {PasswordRecoveryComponent} from './password-recovery.component';

const routes: Routes = [
	{
		path: '',
		component: PasswordRecoveryComponent,
		children: [
			{path: 'forgot-password', component: ForgotPasswordComponent},
			{path: 'reset-password/:key', component: ResetForgotPasswordComponent},
			{path: 'reset-password', component: ResetPasswordComponent}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class PasswordRecoveryRoutingModule {}
