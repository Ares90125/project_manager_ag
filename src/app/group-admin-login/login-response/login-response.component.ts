import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
import {ActivatedRoute} from '@angular/router';
import Auth from '@aws-amplify/auth';
import {environment} from 'src/environments/environment';
import {LoggerCategory} from '@sharedModule/enums/logger-level.enum';
import {SecuredStorageProviderService} from '@sharedModule/services/secured-storage-provider.service';
import {UserService} from '@sharedModule/services/user.service';

@Component({
	selector: 'app-landing',
	templateUrl: './login-response.component.html',
	styleUrls: ['./login-response.component.scss']
})
export class LoginResponseComponent extends BaseComponent implements OnInit, OnDestroy {
	showFbLoginBtn = false;
	primaryMessage: string;
	secondaryMessage = 'Logging you in...';
	timerToDestroy;

	constructor(
		injector: Injector,
		private readonly activatedRoute: ActivatedRoute,
		private readonly userService: UserService,
		private readonly securedStorage: SecuredStorageProviderService
	) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
		super.setPageTitle('Login Response Page', 'Login Response Page');
		this.subscriptionsToDestroy.push(
			this.activatedRoute.queryParams.subscribe(queryParams => this.processQueryParams(queryParams))
		);
	}

	async signIn(element) {
		this.recordButtonClick(element);
		this.logger.debug(
			'Initiating federated sign-in when user clicks on Reconnect',
			{},
			'LoginResponseComponent',
			'signIn',
			LoggerCategory.AppLogs
		);
		// @ts-ignore
		await Auth.federatedSignIn({provider: 'Facebook'});
	}

	private async processQueryParams(queryParamsSnapshot: any) {
		if (!!queryParamsSnapshot.error) {
			this.logger.debug(
				'Error in querystring.',
				queryParamsSnapshot.error,
				'LoginResponseComponent',
				'processQueryParams',
				LoggerCategory.AppLogs
			);
			await this.securedStorage.setCookie('convosightLoginStatus', 'false', 3650);
			this.primaryMessage = 'We were unable to log you in. Redirecting you to login page';
			setTimeout(() => {
				window.location.href = `${environment.landingPageUrl}`;
			}, 2000);

			return;
		}

		if (!!queryParamsSnapshot.logout) {
			this.logger.debug(
				'Logout is true in querystring',
				queryParamsSnapshot.error,
				'LoginResponseComponent',
				'processQueryParams',
				LoggerCategory.AppLogs
			);
			await this.securedStorage.setCookie('convosightLoginStatus', 'false', 3650);
			this.primaryMessage = 'We hate to see you leave';
			this.secondaryMessage = 'Logging you out...';
			this.userService.logOut();
			return;
		}

		this.showThrobberMessage();

		if (!!queryParamsSnapshot.code || !!queryParamsSnapshot.state) {
			return;
		}

		this.subscriptionsToDestroy.push(
			this.userService.isLoggedIn.subscribe(async loggedInStatus => {
				if (loggedInStatus || loggedInStatus === null) {
					return;
				}

				// We are now sure user is not logged in and hence, time to redirect him to FB for log
				this.logger.debug(
					'Initiating federated sign-in depending on query parameters',
					{},
					'LoginResponseComponent',
					'checkFBLoginStatus',
					LoggerCategory.AppLogs
				);
				// @ts-ignore
				await Auth.federatedSignIn({provider: 'Facebook'});
			})
		);

		// In case redirection fails to complete in 5 secs, we show the use the FB button
		this.delayFbLoginBtn();
	}

	private delayFbLoginBtn() {
		setTimeout(() => {
			if (this.securedStorage.getCookie('storageClearedForLoginRetry') !== 'true') {
				this.securedStorage.expireAllCookies();
				this.securedStorage.clearLocalStorage();
				this.securedStorage.clearSessionStorage();
				this.securedStorage.setCookie('storageClearedForLoginRetry', 'true');
			}

			this.showFbLoginBtn = true;
			this.logger.debug(
				'Initiating delayed login',
				{},
				'LoginResponseComponent',
				'delayFbLoginBtn',
				LoggerCategory.AppLogs
			);
		}, 15000);
	}

	private showThrobberMessage() {
		const min = 1;
		const max = this.messages.length;
		const index = Math.floor(Math.random() * (+max - +min)) + +min;
		this.primaryMessage = this.messages[index - 1];
		this.logger.debug(
			'Showing throbber message',
			{},
			'LoginResponseComponent',
			'showThrobberMessage',
			LoggerCategory.AppLogs
		);
	}

	messages = [
		'Congratulate yourself for doing difficult things, even if they might not seem difficult to others.',
		'Do you have a glass of water nearby? Time for a sip!',
		"Don't be afraid to offer hugs. Someone probably needs them.",
		"Don't compare yourself to others, they are not you! You are unique!",
		"Don't forget to eat breakfast! It's important fuel for every adventure.",
		'Go get a drink of water. Stay hydrated!',
		'Have you danced today?',
		'Have you listened to your favourite song recently? 🎵',
		'Have you stretched recently? Do it now. It will help.',
		"Have you told someone you're proud of them recently?",
		'Hey! Life is tough, but so are you! 💪',
		'Hey, jump up for a sec and stretch, yeah? 👐',
		"I know it's cheesey but I hope you have a great day!",
		'Identity is fluid! People can change - be accepting.',
		"If you're having a hard day, remember that you can do this because you're amazing!",
		'Is there a window you can look through? The world is beautiful. 🌆',
		'Is your seat comfortable? Can you adjust your chair properly?',
		"It can be hard to get started, can't it? That's okay, you got this.",
		"It's so great to have you here today",
		'Keep growing, keep learning, keep moving forward!',
		'Learning new things is important - open your eyes to the world around you!',
		'Making things awesome...',
		'Novel, new, silly, & unusual activities can help lift your mood.',
		'Play for a few minutes. Doodle, learn solitaire, fold a paper airplane, do something fun.',
		"Please try not to take yourself for granted. You're important.",
		'Please wait, including everyone...',
		'Rest your eyes for a moment. Look at something in the distance and count to five! 🌳',
		"Self care is important, look after and love yourself, you're amazing!",
		'Set aside time for a hobby. Gardening, drone building, knitting, do something for the pure pleasure of it.',
		'So often our power lies not in ourselves, but in how we help others find their own strength',
		'Sometimes doing something nice for somebody else is the best way to feel good about yourself! 👭',
		'Stop. Breathe. Be here now.',
		'Stop. Take three slow deep breaths.',
		'Stuck? Ask for help. Talk to someone.',
		'Take 5 minutes to straighten the space around you. Set a timer.',
		'Take a break before you need it. It will make it easier to prevent burnout.',
		'Take a moment to send a message to someone you love. 😻',
		'Take care of yourself. We need you.',
		'Technology is a tool. Use it wisely.',
		'The impact you leave on the universe can never be erased.',
		'There are no impostors here',
		"There's someone who is so so grateful that you exist together.",
		'Today is a great day to let a friend know how much you appreciate them.',
		"Water is good for you year round. If you're thirsty, you're dehydrated.",
		'We all have superpowers. You included. I hope you are using yours to make your life a joyful one.',
		"When's the last time you treated yourself?",
		'With the dawning of a new day comes a clean slate and lots of opportunity.',
		'You are fantastic',
		'You are loved. <3',
		'You are so very important 💛💛💕',
		'You can do this!',
		'You cannot compare your successes to the apparent achievements of others. 🌄',
		'You deserve to be safe and to have nice things happen to you.',
		'You have the power to change the world.',
		"You're allowed to start small. 🐞",
		'have you hugged anyone lately?',
		"it's time to check your thirst level, human.",
		"💗: please don't forget to take a little bit of time to say hi to a friend",
		'🌸: remember to let your eyes rest and look at a plant please',
		'🙌: take a second to adjust your posture'
	];

	ngOnDestroy() {
		super._ngOnDestroy();
		clearTimeout(this.timerToDestroy);
	}
}
