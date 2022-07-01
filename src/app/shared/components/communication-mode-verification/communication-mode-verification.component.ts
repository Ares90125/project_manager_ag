import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CountryISO} from 'ngx-intl-tel-input';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserService} from '@sharedModule/services/user.service';

@Component({
	selector: 'app-communication-mode-verification',
	templateUrl: './communication-mode-verification.component.html',
	styleUrls: ['./communication-mode-verification.component.scss']
})
export class CommunicationModeVerificationComponent implements OnInit {
	@Input() user;
	@Input() modeOfCommunicationToBeVerified;
	@Output() closeDialog = new EventEmitter<boolean>();

	showConfirmationDialog = false;
	emailToBeVerified;
	isUpdating = false;
	CountryISO = CountryISO;
	modeOfCommunication: FormGroup;
	preferredCountries: CountryISO[] = [CountryISO.India, CountryISO.UnitedStates];
	decryptedPhoneNumber;

	constructor(private readonly formBuilder: FormBuilder, private readonly userService: UserService) {}

	ngOnInit() {
		this.modeOfCommunication = this.formBuilder.group({
			whatsapp: ['', Validators.required]
		});
		this.decryptPhoneData();
	}

	async decryptPhoneData() {
		try {
			const decryptedData = await this.userService.decryptUserData();
			this.decryptedPhoneNumber = decryptedData.body ?? '';
			this.modeOfCommunication.get('whatsapp').setValue(this.decryptedPhoneNumber);
			this.emailToBeVerified = this.user.email;
		} catch (e) {
			// error while decrypting Number
		}
	}

	async submitModeOfCommunication(form, type) {
		this.isUpdating = true;
		try {
			let input;
			if (type === 'whatsapp') {
				const mobileNumber = form.value.whatsapp.number.replace(/[ ]/g, '');
				const dialCode = form.value.whatsapp.dialCode.replace(/[+]/g, '');
				const countryCode = form.value.whatsapp.countryCode;
				// const maskedNumber = await this.appService.getMaskedNumber(mobileNumber);
				input = {};
				if (mobileNumber === this.decryptedPhoneNumber.toString().replace(' ', '')) {
					this.userService.subscribeToWhatsApp(this.user.landbotCustomerId, mobileNumber, dialCode, countryCode, false);
				} else {
					this.userService.subscribeToWhatsApp(this.user.landbotCustomerId, mobileNumber, dialCode, countryCode, true);
				}
				this.userService.updateModeOfCommunicationVerificationStatus();
			}
			if (type === 'email') {
				if (this.emailToBeVerified === this.user.email) {
					await this.userService.verifyEmail(null, false);
				} else {
					await this.userService.triggerEmailVerification(this.emailToBeVerified.toLowerCase(), true, true);
				}
				this.userService.updateModeOfCommunicationVerificationStatus();
			}
			if (type === 'decline') {
				this.userService.updateModeOfCommunicationVerificationStatus(
					{cognitoId: this.user.cognitoId, modeOfCommunicationVerificationStatus: 'NotVerified'},
					type
				);
			}
			this.isUpdating = false;
			this.closeDialog.emit(true);
		} catch (error) {
			this.isUpdating = true;
			this.closeDialog.emit(true);
		}
	}
}
