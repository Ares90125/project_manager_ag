import {NgModule} from '@angular/core';
import {BrandLoginComponent} from './brand-login.component';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {AccountServiceService} from '@sharedModule/services/account-service.service';
import {MatInputModule} from '@angular/material/input';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';

@NgModule({
	declarations: [BrandLoginComponent],
	imports: [
		CommonModule,
		RouterModule.forChild([{path: '', component: BrandLoginComponent}]),
		FormsModule,
		ReactiveFormsModule,
		MatInputModule,
		MatCardModule,
		MatFormFieldModule
	],
	providers: [AccountServiceService]
})
export class BrandLoginModule {}
