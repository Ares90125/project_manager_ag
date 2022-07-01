import {NgModule} from '@angular/core';
import {RequestAccessComponent} from './request-access/request-access.component';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgxIntlTelInputModule} from 'ngx-intl-tel-input';
import {RouterModule} from '@angular/router';
import {BrandAccessService} from './brand-access.service';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

@NgModule({
	declarations: [RequestAccessComponent],
	imports: [
		CommonModule,
		RouterModule.forChild([{path: '', component: RequestAccessComponent}]),
		FormsModule,
		ReactiveFormsModule,
		MatCardModule,
		MatFormFieldModule,
		MatInputModule,
		NgxIntlTelInputModule
	],
	providers: [BrandAccessService]
})
export class BrandRequestAccessModule {}
