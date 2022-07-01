import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BrandAccessService} from '../brand-access.service';
import {CountryISO, SearchCountryField} from 'ngx-intl-tel-input';

@Component({
	selector: 'app-request-access',
	templateUrl: './request-access.component.html',
	styleUrls: ['./request-access.component.scss']
})
export class RequestAccessComponent implements OnInit {
	CountryISO = CountryISO;
	SearchCountryField = SearchCountryField;
	requestAccessForm: FormGroup;
	success = false;
	isLoading = false;
	separateDialCode = true;
	preferredCountries: CountryISO[] = [CountryISO.India, CountryISO.UnitedStates];
	phoneErr = false;
	constructor(private formBuilder: FormBuilder, private brandAccessService: BrandAccessService) {}

	ngOnInit() {
		this.requestAccessForm = this.formBuilder.group({
			name: ['', [Validators.required]],
			companyName: ['', [Validators.required]],
			email: ['', [Validators.required, Validators.email]],
			phoneNumber: ['', [Validators.required]]
		});
	}

	SubmitForm(form) {
		if (form.valid) {
			this.isLoading = true;
			const number = `${form.value.phoneNumber.dialCode}${form.value.phoneNumber.number}`;
			this.brandAccessService
				.createBrandAccessRequest({
					name: form.value.name,
					companyName: form.value.companyName,
					phoneNumber: number,
					email: form.value.email
				})
				.then((res: any) => {
					if (res) {
						this.success = true;
					}
				});
		}
	}
}
