import {Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {UserModel} from '@sharedModule/models/user.model';
import {BaseComponent} from '@sharedModule/components/base.component';
import {AmplifyAppSyncService} from '@sharedModule/services/amplify-app-sync.service';
import {UserService} from '@sharedModule/services/user.service';
import {LoggerCategory} from '@sharedModule/enums/logger-level.enum';

@Component({
	selector: 'app-email-verification',
	templateUrl: './email-verification.component.html',
	styleUrls: ['./email-verification.component.scss']
})
export class EmailVerificationComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() user: UserModel;
	@Input() isEditEmailClicked;
	emailToBeVerified = '';
	sendEmail: boolean = false;
	inputOne = '';
	inputTwo = '';
	inputThree = '';
	inputFour = '';
	inputFive = '';
	inputSix = '';
	otpInvalid = false;
	emailAlreadyExists = false;
	otpModalHide = false;
	showTimer: boolean = false;
	timeLeft: number = 30;
	interval;
	inProgress: boolean = false;
	errorMessage = '';
	@Output() emitUserAction = new EventEmitter<any>();
	constructor(
		injector: Injector,
		private readonly appSync: AmplifyAppSyncService,
		private el: ElementRef,
		private userService: UserService
	) {
		super(injector);
	}

	ngOnInit(): void {
		this.emailToBeVerified = this.user.email ? this.user.email.toLowerCase() : '';
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	async triggerEmailVerification(isTriggerTypeResend) {
		this.errorMessage = '';
		this.emailAlreadyExists = false;
		this.otpInvalid = false;
		this.logger.debug(
			'Initiating Email Verification',
			{
				email: this.emailToBeVerified,
				resend: isTriggerTypeResend
			},
			'EmailVerificationComponent',
			'triggerEmailVerification',
			LoggerCategory.AppLogs
		);
		this.inProgress = true;
		try {
			await this.userService.triggerEmailVerification(this.emailToBeVerified.toLowerCase(), isTriggerTypeResend, true);
			this.sendEmail = true;
			this.logger.debug(
				'Email sent successfully',
				{
					email: this.emailToBeVerified,
					resend: isTriggerTypeResend
				},
				'EmailVerificationComponent',
				'triggerEmailVerification',
				LoggerCategory.AppLogs
			);
		} catch (e) {
			this.emailAlreadyExists = true;
			this.errorMessage = e.errors[0].message;
			this.logger.debug(
				'Sending email failed',
				{
					email: this.emailToBeVerified,
					resend: isTriggerTypeResend
				},
				'EmailVerificationComponent',
				'triggerEmailVerification',
				LoggerCategory.AppLogs
			);
		}
		this.inProgress = false;
	}

	public async sendOTP() {
		var input = this.inputOne + this.inputTwo + this.inputThree + this.inputFour + this.inputFive + this.inputSix;
		this.logger.debug(
			'Initiating OTP verification',
			{otp: input},
			'EmailVerificationComponent',
			'sendOTP',
			LoggerCategory.AppLogs
		);
		this.inProgress = true;
		try {
			await this.userService.verifyEmail(input, true);
			this.otpInvalid = false;
			this.otpModalHide = true;
			this.alert.success('You have successfully verified your email.', 'Email Verified!');
			this.emitUserAction.emit({isVerifyLaterClicked: false, editEmailClicked: false});
			this.logger.setUserProperty(this.user.id, {email: this.emailToBeVerified});
			this.logger.debug(
				'Email verified',
				{otp: input},
				'EmailVerificationComponent',
				'sendOTP',
				LoggerCategory.AppLogs
			);
		} catch (e) {
			this.otpInvalid = true;
			this.errorMessage = e.errors[0].message;
			this.inputFour = '';
			this.inputOne = '';
			this.inputTwo = '';
			this.inputThree = '';
			this.inputFive = '';
			this.inputSix = '';
			this.logger.debug(
				'Error in Email verification',
				{otp: input},
				'EmailVerificationComponent',
				'sendOTP',
				LoggerCategory.AppLogs
			);
		}
		this.inProgress = false;
	}

	changeInput(event, index) {
		this.otpInvalid = false;
		if ((event.key === 'Delete' || event.key === 'Backspace') && index > 1) {
			event.target.parentElement.previousElementSibling.firstChild.focus();
		} else if (event.target.value.length > 0 && index < 6) {
			event.target.parentElement.nextElementSibling.firstChild.focus();
		}
	}

	verifyLater() {
		this.otpModalHide = true;
		this.emitUserAction.emit({isVerifyLaterClicked: true, editEmailClicked: false});
	}
	closeModal() {
		this.otpModalHide = true;
		this.emitUserAction.emit({editEmailClicked: false});
	}

	countdown() {
		this.inputFour = '';
		this.inputOne = '';
		this.inputTwo = '';
		this.inputThree = '';
		this.inputFive = '';
		this.inputSix = '';
		this.triggerEmailVerification(true);
		this.showTimer = true;
		this.interval = setInterval(() => {
			if (this.timeLeft > 0) {
				this.timeLeft--;
			} else {
				this.showTimer = false;
				this.timeLeft = 30;
				clearInterval(this.interval);
			}
		}, 1000);
	}

	pasteOTP(e) {
		const clipboardData = e.clipboardData || e.originalEvent.clipboardData;
		const pastedData = clipboardData.getData('text');
		try {
			let arr = [];
			arr = Array.from(pastedData);
			this.inputOne = arr[0] ? arr[0] : '';
			this.inputTwo = arr[1] ? arr[1] : '';
			this.inputThree = arr[2] ? arr[2] : '';
			this.inputFour = arr[3] ? arr[3] : '';
			this.inputFive = arr[4] ? arr[4] : '';
			this.inputSix = arr[5] ? arr[5] : '';
			e.target.parentElement.parentElement.lastElementChild.firstChild.focus();
			e.stopPropagation();
		} catch (e) {
			this.logger.debug('Error in pasting OTP', pastedData, 'EmailVerificationComponent', 'pasteOTP');
		}
	}
}
