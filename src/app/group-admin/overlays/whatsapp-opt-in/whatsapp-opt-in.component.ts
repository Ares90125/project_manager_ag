import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Injector,
	Input,
	OnDestroy,
	OnInit,
	Output
} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BaseComponent} from '@sharedModule/components/base.component';
import {CountryISO, SearchCountryField} from 'ngx-intl-tel-input';
import {UserModel} from '@sharedModule/models/user.model';
import {UserService} from '@sharedModule/services/user.service';
import {WhatsappOptInStatusEnum} from '@sharedModule/enums/whatsapp-type.enum';
import {Observable, Subject, timer} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
	selector: 'app-whatsapp-opt-in',
	templateUrl: './whatsapp-opt-in.component.html',
	styleUrls: ['./whatsapp-opt-in.component.scss']
})
export class WhatsappOptInComponent extends BaseComponent implements OnInit, OnDestroy {
	CountryISO = CountryISO;
	SearchCountryField = SearchCountryField;
	separateDialCode = true;
	success = false;
	preferredCountries: CountryISO[] = [CountryISO.India, CountryISO.UnitedStates];
	whatsappForm: FormGroup;
	isLoading = false;
	user: UserModel;
	@Input() showConfirmation;
	@Input() closeConfirmation;
	// @Input() isInteractionFlow: boolean;
	@Output() hideWhatsAppOverlay = new EventEmitter();
	@Output() hideWAOptInCard = new EventEmitter();
	@Output() hideWAConfirmOptInCard = new EventEmitter();
	@Output() didNotReceiveCardStatus = new EventEmitter();
	currentUser: UserModel;
	showDidNotRecievedPopup = false;
	WhatsAppSubscriptionCheckPolling: Observable<any>;
	stopPolling = new Subject();
	decryptPhoneNumber;
	constructor(
		injector: Injector,
		private readonly formBuilder: FormBuilder,
		private readonly userService: UserService,
		private readonly cdRef: ChangeDetectorRef
	) {
		super(injector);
	}

	ngOnInit(): void {
		super._ngOnInit();
		this.initializeData();
		if (this.showConfirmation) {
			this.startWhatsAppSubscriptionPolling();
		}
		this.subscriptionsToDestroy.push(
			this.userService.currentUser$.subscribe(async user => {
				if (user === null) {
					return;
				}
				if (user.whatsappSubscriptionStatus === WhatsappOptInStatusEnum.Confirmed) {
					this.closeWhatsAppConfirmPopup();
				}
				this.currentUser = user;
			})
		);
	}

	async initializeData() {
		try {
			// decrypt the phonenumber
			const decryptedData = await this.userService.decryptUserData();
			this.decryptPhoneNumber = decryptedData.body ?? '';
			if (!this.decryptPhoneNumber) {
				this.initializeFormField();
				return;
			}
			this.initializeFormField(this.decryptPhoneNumber);
		} catch (e) {
			this.initializeFormField();
			// Error while decrypting mobile number
			this.logger.error(e, 'Error while Decrypting mobile number', {}, 'WhatsappOptInComponent', 'initializeData');
		}
	}

	async initializeFormField(decryptPhoneNumber = null) {
		if (!decryptPhoneNumber) {
			this.whatsappForm = this.formBuilder.group({
				phoneNumber: ['', [Validators.required]]
			});
			this.cdRef.detectChanges();
			return;
		}
		this.whatsappForm = this.formBuilder.group({
			phoneNumber: [decryptPhoneNumber, [Validators.required]]
		});
		this.cdRef.detectChanges();
	}

	startWhatsAppSubscriptionPolling() {
		this.WhatsAppSubscriptionCheckPolling = timer(6000, 4000).pipe(takeUntil(this.stopPolling));
		this.subscriptionsToDestroy.push(
			this.WhatsAppSubscriptionCheckPolling.subscribe(async x => {
				await this.userService.refreshUser();
				const whatsappSubscriptionStatus = (await this.userService.getUser()).whatsappSubscriptionStatus;
				if (whatsappSubscriptionStatus === WhatsappOptInStatusEnum.Confirmed) {
					this.hideWAConfirmOptInCard.next();
					this.stopPolling.next();
					this.showConfirmation = false;
				}
				if (x === 9) {
					this.stopPolling.next();
					return;
				}
			})
		);
	}

	async SubmitForm(form, element) {
		if (form.valid) {
			this.isLoading = true;
			try {
				const mobileNumber = form.value.phoneNumber.number.replace(/[ ]/g, '');
				const dialCode = form.value.phoneNumber.dialCode.replace(/[+]/g, '');
				// if (!this.isInteractionFlow && this.currentUser.totalWhatsappConfirmationRequest >= 5) {
				if (this.currentUser.totalWhatsappConfirmationRequest >= 5) {
					($('#convosight-whatsapp-opt') as any).modal('hide');
					this.isLoading = false;
					this.alert.error(
						'Subscription attempt failed. Please contact support.',
						'Please message us on the chat option below'
					);
					return;
				}
				const maskedNumber = await this.appService.getMaskedNumber(mobileNumber);

				const newInteractionWAResponse = await this.userService.triggerInteractionLandbotOptIn(dialCode, mobileNumber);
				// this.isLoading = false;
				// this.hideWhatsAppOverlay.next(false);

				// if (!this.isInteractionFlow) {
				const whatsAppResponse = await this.userService.triggerWhatsAppOptIn(
					this.currentUser.cognitoId,
					dialCode,
					mobileNumber,
					form.value.phoneNumber.countryCode,
					maskedNumber,
					true
				);

				if (newInteractionWAResponse instanceof Error) {
					($('#convosight-whatsapp-opt') as any).modal('hide');

					const errorMessage = newInteractionWAResponse.message.slice(
						newInteractionWAResponse.message.indexOf('"') + 1,
						newInteractionWAResponse.message.lastIndexOf('"')
					);
					this.alert.error('Subscribing to the WA bot error', errorMessage);
					//use the phone decrypt phonenumber
					this.whatsappForm.patchValue({
						phoneNumber: this.decryptPhoneNumber ? this.decryptPhoneNumber : ''
					});
					this.isLoading = false;
					return;
				}

				if (whatsAppResponse && whatsAppResponse.errors) {
					($('#convosight-whatsapp-opt') as any).modal('hide');
					const errors = whatsAppResponse.errors;
					errors[0].message
						? this.alert.error(errors[0].message, 'Please try again')
						: this.alert.error('Something went wrong', 'Please try again');
					//use the phone decrypt phonenumber
					this.whatsappForm.patchValue({
						phoneNumber: this.decryptPhoneNumber ? this.decryptPhoneNumber : ''
					});
					this.isLoading = false;
					return;
				}

				this.decryptPhoneNumber = mobileNumber;

				this.isLoading = false;

				this.hideWAOptInCard.next(true);
				this.showConfirmation = true;
				this.startWhatsAppSubscriptionPolling();
				// } else {
				// await this.userService.triggerInteractionLandbotOptIn(dialCode, mobileNumber);
				// this.isLoading = false;
				// this.hideWhatsAppOverlay.next(false);
				// }
			} catch (error) {
				this.isLoading = false;
				const e = new Error('Error in WhatsApp Opt In');
				this.logger.error(
					e,
					'Error in WhatsApp Opt In',
					{user_id: this.currentUser.id},
					'WhatsappOptInComponent',
					'SubmitForm'
				);
			}
		}
	}

	async editWANumber() {
		this.initializeFormField(this.decryptPhoneNumber);
		this.showConfirmation = false;
	}

	openDidNotReceivePopup() {
		this.showDidNotRecievedPopup = true;
		this.didNotReceiveCardStatus.next(true);
	}

	closeWhatsAppConfirmPopup() {
		if (this.closeConfirmation) {
			this.showConfirmation = false;
		}
		this.hideWAConfirmOptInCard.emit(false);
	}

	closeDidNotReceiveMsgPopup() {
		this.showDidNotRecievedPopup = false;
		this.didNotReceiveCardStatus.next(false);
	}

	hideWhatsAppOverlap() {
		this.hideWhatsAppOverlay.next(false);
		this.showConfirmation = false;
	}

	openWhatsApp(url) {
		window.open(url, 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
	}

	async closeWhatsAppOptIn() {
		this.showConfirmation = false;
		if (this.currentUser.mobileNumber) {
			this.initializeFormField(this.decryptPhoneNumber);
		}
		if (this.currentUser.whatsappSubscriptionStatus) {
			this.hideWAConfirmOptInCard.next();
			return;
		}
		this.hideWhatsAppOverlay.next(false);
	}

	showToasterAndCloseCard() {
		this.showConfirmation = false;
		this.showDidNotRecievedPopup = false;
		this.hideWAConfirmOptInCard.next(false);
		this.didNotReceiveCardStatus.next(false);
		this.alert.success('Manual WhatsApp verification will be completed in 15 days', '');
	}

	ngOnDestroy() {
		super._ngOnDestroy();
		this.stopPolling.next();
	}
}
