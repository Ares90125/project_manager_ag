import {ChangeDetectorRef, Component, Injector, Input, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
import {WhatsappOptInStatusEnum} from '@sharedModule/enums/whatsapp-type.enum';
import {UserModel} from '@sharedModule/models/user.model';
import {SecuredStorageProviderService} from '@sharedModule/services/secured-storage-provider.service';
import {environment} from 'src/environments/environment';
import {DateTime} from '@sharedModule/models/date-time';
import {Router} from '@angular/router';
import {GroupsService} from '@sharedModule/services/groups.service';

declare var window: any;
@Component({
	selector: 'app-all-prompt-card',
	templateUrl: './all-prompt-card.component.html',
	styleUrls: ['./all-prompt-card.component.scss']
})
export class AllPromptCardComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() user: UserModel;
	@Input() groupsService: GroupsService;
	openAdminBioModal = false;
	allPromptCardData = [
		{
			cardId: 1,
			header: 'Schedule a product demo ⏰',
			subHeader: 'See how you can use Convosight to showcase your achievements and pitch your group to brands',
			icon: './assets/images/schedule-demo-icon.svg',
			testId: 'card-productDemo-all-prompt-card',
			tag: '',
			closeMethod: () => {
				this.closePromptCard('1');
			},
			closeBtnCsId: 'b2e7db92-0ae6-469e-996c-58b4be136161',
			closeTestId: 'button-close-productDemo-all-prompt-card',
			button: [
				{
					text: 'Already done',
					class: 'convo-btn-secondary',
					csId: '39e6e599-49d2-4ab4-aa3a-821aa90e8da3',
					testId: 'button-productDemo-alreadyDone-all-prompt-card',
					clickEvent: () => {
						this.closePromptCard('1', true);
					}
				},
				{
					text: 'Schedule now',
					class: 'convo-btn-primary',
					csId: '0f8f5ff6-91ff-458f-9685-4157d67747d4',
					testId: 'button-schedule-now-product-demo-all-prompt-card',
					clickEvent: () => {
						this.openCalendly('scheduleDemo');
					}
				}
			]
		},
		{
			cardId: 2,
			header: 'Daily summary on WhatsApp 🔖',
			subHeader: 'Subscribe to get daily summary and campaign updates on Whatsapp',
			icon: './assets/images/whatsapp-icon.svg',
			testId: 'card-whatsapp-subscrition-all-prompt-card',
			tag: '',
			closeMethod: () => {
				this.closePromptCard('2');
			},
			closeBtnCsId: '917a2215-cdb6-4acb-b3ee-45d78b1924bc',
			closeTestId: 'button-close-whatsappSubscription-all-prompt-card',
			button: [
				{
					text: 'Subscribe now',
					class: 'convo-btn-primary',
					csId: '24dac94c-1655-4d57-9e62-a08630c32a19',
					testId: 'button-whatsapp-subscribeNow-all-prompt-card',
					clickEvent: () => {
						this.whatsappOptInOverlay('2');
					}
				}
			]
		},
		{
			cardId: 3,
			header: 'Join our Facebook Group 💪',
			subHeader: 'Join our Facebook group, where Facebook community leaders like you are present',
			icon: './assets/images/join-fb-group.svg',
			testId: 'card-joinFbGroup-all-prompt-card',
			tag: '',
			closeMethod: () => {
				this.closePromptCard('3');
			},
			closeBtnCsId: '9db09012-607e-49b3-80cd-248257471d09',
			closeTestId: 'button-close-joinFbGroup-all-prompt-card',
			button: [
				{
					text: 'Already joined',
					class: 'convo-btn-secondary',
					csId: '4a24e7e8-f389-4b61-b543-202359c5dc66',
					testId: 'button-joinFbGroup-alreadyJoined-all-prompt-card',
					clickEvent: () => {
						this.closePromptCard('3', true);
					}
				},
				{
					text: 'Join now',
					class: 'convo-btn-primary',
					csId: 'dfae2b80-b540-4a44-b23a-3668c3af34fd',
					testId: 'button-joinFbGroup-joinNow-all-prompt-card',
					clickEvent: () => {
						if(this.user.timezoneName.includes('Asia/Calcutta') || this.user.timezoneName.includes('Asia/Kolkata')) {
							this.openFbJoinGroupPopup('https://www.facebook.com/groups/fbgroupgrowth');
						} else {
							this.openFbJoinGroupPopup('https://www.facebook.com/groups/1293580737757204');
						}
					}
				}
			]
		},
		{
			cardId: 4,
			header: 'Confirm Whatsapp subscription',
			subHeader: 'Your Whatsapp subscription is pending. Please confirm to complete the subscription',
			icon: './assets/images/whatsapp-icon.svg',
			testId: 'card-confirmWhatsapp-all-prompt-card',
			tag: '',
			closeMethod: () => {
				this.closePromptCard('4');
			},
			closeBtnCsId: 'fedb5025-0043-483b-8c87-ebe1c6b5d18e',
			closeTestId: 'button-close-confirmWhatsapp-all-prompt-card',
			button: [
				{
					text: 'Confirm now',
					class: 'convo-btn-primary',
					csId: 'b974b5b0-09a5-44fe-8e6b-2600efd9fe9e',
					testId: 'button-confirmWhatsapp-confrimNow-all-prompt-card',
					clickEvent: () => {
						this.whatsappOptInOverlay('4');
					}
				}
			]
		},
		{
			cardId: 5,
			header: 'Upload Group Insights',
			subHeader: "Upload your Group's Facebook Insights to boost eligibility for getting a campaign",
			icon: './assets/images/upload-group-insights-icon.svg',
			testId: 'card-facebookInsightsUpload-all-prompt-card',
			tag: '',
			closeMethod: () => {
				this.closePromptCard('5', true);
			},
			closeBtnCsId: 'fedb5025-0043-483b-8c87-ebe1c6b5sd18e',
			closeTestId: 'button-close-facebookInsightsUpload-all-prompt-card',
			button: [
				{
					text: 'Upload now',
					class: 'convo-btn-primary',
					csId: 'b974b5b0-09a5-44fe-8e6b-26a00efd9fe9e',
					testId: 'button-facebookInsightsUpload-uploadInsights-all-prompt-card',
					clickEvent: () => {
						this.hideInsightsUploadCard();
						this.router.navigate(['group-admin/settings/facebook-insights-upload']);
					}
				}
			]
		}
	];
	promptCardActivity: any;
	promptCardForUI = [];
	promptCard: {cardId: string; userId: string; cardActivity: any; cardOrder: number[]}[];
	selectedCard: any;
	optInCardOpen = false;
	loaderForCard = true;
	showWhatsappOptInOverlay = false;
	showWAConfirmation = false;
	showDidNotReceivedPopup = false;

	private unlisten;

	constructor(
		injector: Injector,
		private readonly securedStorage: SecuredStorageProviderService,
		private readonly renderer2: Renderer2,
		private readonly cdRef: ChangeDetectorRef,
		private router: Router
	) {
		super(injector);
		this.cdRef.markForCheck();
	}

	ngOnInit() {
		super._ngOnInit();
		this.checkPromptCardOrderAndInitialize();
	}

	async checkPromptCardOrderAndInitialize() {
		// get the promptCard data for showing in UI

		// API call to get the promptCard from dynamodb
		this.promptCard = await this.getPromptCardData(this.user.id);

		// Method to get the promptCard Order from the promptCard
		const cardOrder = this.promptCard.find(card => card.cardId === '-1').cardOrder;

		// show the card on UI and update the order
		this.showPromptAsPerOrder(cardOrder);
		this.cdRef.detectChanges();
	}

	async getPromptCardData(userId) {
		const promptCard = this.securedStorage.getCookie('promptCard');
		const promptCardLength = promptCard ? JSON.parse(promptCard).length : 0;
		const initialData = [
			{
				cardId: '1',
				userId: userId,
				cardActivity: {}
			},
			{
				cardId: '2',
				userId: userId,
				cardActivity: {}
			},
			{
				cardId: '3',
				userId: userId,
				cardActivity: {}
			},
			{
				cardId: '4',
				userId: userId,
				cardActivity: {}
			},
			{
				cardId: '5',
				userId: userId,
				cardActivity: {}
			},
			{
				cardId: '-1',
				userId: userId,
				cardActivity: {},
				cardOrder: [1, 2, 3, 4, 5]
			}
		];
		if (promptCardLength && promptCardLength === initialData.length) {
			return JSON.parse(promptCard);
		}

		if (promptCardLength && promptCardLength < initialData.length) {
			let promptData = JSON.parse(promptCard);
			// replace the cardOrder so new card will will have it's own order
			const cardOrder = initialData.filter(x => x.cardId === '-1')[0];

			// get all the new card
			promptData.push(
				...initialData.filter(({cardId: id1}) => !promptData.some(({cardId: id2}) => String(id2) === String(id1)))
			);

			promptData = promptData.map(card => {
				if (card.cardId === cardOrder.cardId) {
					return cardOrder;
				} else {
					return card;
				}
			});

			const cardOrderIndex = promptData.findIndex(x => x.cardId === '-1');
			const cardOrderObject = promptData.find(x => x.cardId === '-1');

			promptData = [...promptData.slice(0, cardOrderIndex), ...promptData.slice(cardOrderIndex + 1), cardOrderObject];

			this.securedStorage.setCookie('promptCard', JSON.stringify(promptData));
			return promptData;
		}

		this.securedStorage.setCookie('promptCard', JSON.stringify(initialData));
		return initialData;
	}

	showPromptAsPerOrder(cardOrder) {
		this.promptCardForUI = [];
		let cardOrderInfo = cardOrder;
		const dateNowTicks = new DateTime().unix();
		if (typeof cardOrder === typeof '') {
			cardOrderInfo = JSON.parse(cardOrder);
		}
		cardOrderInfo.map(async card => {
			const selectedCard = this.allPromptCardData.find(promptCard => card === promptCard.cardId);

			const nextDayShownTime = this.promptCard[card - 1].cardActivity.nextDayToBeShownAtUtc;
			const hasNumberOfTime7DaysExceedTwo = this.promptCard[card - 1].cardActivity.numberOfTime7DaysIntervalConsume > 2;
			const nextDateTicks = new DateTime().parseUTCString(nextDayShownTime).unix();
			switch (card) {
				case 1:
					if (nextDayShownTime) {
						if (!this.user.productDemoedAtDate && dateNowTicks > nextDateTicks && !hasNumberOfTime7DaysExceedTwo) {
							this.promptCardForUI.push(selectedCard);
						}
					} else {
						if (!this.user.productDemoedAtDate) {
							this.promptCardForUI.push(selectedCard);
						}
					}
					break;
				case 2:
					if (nextDayShownTime) {
						if (
							!this.user.whatsappSubscriptionStatus &&
							dateNowTicks > nextDateTicks &&
							!hasNumberOfTime7DaysExceedTwo
						) {
							this.promptCardForUI.push(selectedCard);
						}
					} else {
						if (!this.user.whatsappSubscriptionStatus) {
							this.promptCardForUI.push(selectedCard);
						}
					}
					break;
				case 3:
					if (nextDayShownTime) {
						if (!this.user.joinedCSGroupAtDate && dateNowTicks > nextDateTicks && !hasNumberOfTime7DaysExceedTwo) {
							this.promptCardForUI.push(selectedCard);
						}
					} else {
						if (!this.user.joinedCSGroupAtDate) {
							this.promptCardForUI.push(selectedCard);
						}
					}
					break;
				case 4:
					if (nextDayShownTime) {
						if (
							this.user.whatsappSubscriptionStatus === WhatsappOptInStatusEnum.PendingConfirmation &&
							dateNowTicks > nextDateTicks &&
							!hasNumberOfTime7DaysExceedTwo
						) {
							this.promptCardForUI.push(selectedCard);
						}
					} else {
						if (this.user.whatsappSubscriptionStatus === WhatsappOptInStatusEnum.PendingConfirmation) {
							this.promptCardForUI.push(selectedCard);
						}
					}
					break;
				case 5:
					if (!this.groupsService.checkEligibilityForInsightsUploadCard()) {
						return;
					}
					if (nextDayShownTime && dateNowTicks > nextDateTicks) {
						this.promptCardForUI.push(selectedCard);
					} else if (!nextDayShownTime) {
						this.promptCardForUI.push(selectedCard);
					}
					break;
			}
		});
		this.selectedCard = this.promptCardForUI[0];
		cardOrderInfo.push(cardOrderInfo.shift());
		this.setOrder(JSON.stringify(cardOrderInfo));
		this.loaderForCard = false;
	}

	setOrder(cardOrder) {
		const response = this.securedStorage.getCookie('promptCard');
		let promptCard = JSON.parse(response);
		promptCard = promptCard.map(card => {
			if (card.cardId === '-1') {
				card.cardOrder = cardOrder;
			}
			return card;
		});
		this.securedStorage.setCookie('promptCard', JSON.stringify(promptCard));
	}

	closePromptCard(cardId, skipToastMsg = false) {
		this.loaderForCard = false;
		// Update the card activity nextDayToBeShownAtUtc numberOfTimesShownInSuccession numberOfTime7DaysIntervalConsume

		const cardIndex = this.promptCard.findIndex(card => card.cardId === cardId);
		const nextDate = this.getNextDateToShown(cardId, this.promptCard[cardIndex]);
		if (!skipToastMsg) {
			this.showToastMessage(cardId);
		}
		this.promptCard[cardIndex].cardActivity.nextDayToBeShownAtUtc = nextDate;
		if (cardId === '2' || cardId === '4') {
			if (this.promptCard[cardIndex].cardActivity.numberOfTimesShownInSuccession) {
				this.promptCard[cardIndex].cardActivity.numberOfTimesShownInSuccession = 0;
				this.promptCard[cardIndex].cardActivity.numberOfTime7DaysIntervalConsume += 1;
			} else {
				if (!this.promptCard[cardIndex].cardActivity.numberOfTime7DaysIntervalConsume) {
					this.promptCard[cardIndex].cardActivity.numberOfTime7DaysIntervalConsume = 0;
				}
				this.promptCard[cardIndex].cardActivity.numberOfTimesShownInSuccession = 1;
			}
		} else {
			if (!this.promptCard[cardIndex].cardActivity.numberOfTime7DaysIntervalConsume) {
				this.promptCard[cardIndex].cardActivity.numberOfTime7DaysIntervalConsume = 1;
			} else {
				this.promptCard[cardIndex].cardActivity.numberOfTime7DaysIntervalConsume += 1;
			}
		}

		// Method to get the promptCard Order from the promptCard
		const cardOrder = this.promptCard.find(card => card.cardId === '-1').cardOrder;
		// show the card on UI and update the order
		this.showPromptAsPerOrder(cardOrder);

		// Update the card activity
		this.updateCardActivity(this.promptCard);
		this.cdRef.detectChanges();
	}

	showToastMessage(cardId) {
		switch (cardId) {
			case '1':
				this.alert.success('Product Demo can be scheduled any time by sending a message on chat.', '');
				break;
			case '2':
				this.alert.success('WhatsApp Subscription preference can be updated from the settings screen.', '');
				break;
			case '3':
				this.alert.success('Our Facebook Community can be joined using link on Convosight.com', '');
				break;
			case '4':
				this.alert.success('WhatsApp Subscription preference can be updated from the settings screen.', '');
				break;
		}
	}

	getNextDateToShown(cardId, promptCard) {
		const todayDate = new DateTime().startOf('d');
		// For WhatsApp
		if (cardId === '2' || cardId === '4') {
			if (promptCard.cardActivity && promptCard.cardActivity.numberOfTimesShownInSuccession) {
				return todayDate.add(7, 'd').toDate();
			} else {
				return todayDate.add(1, 'd').toDate();
			}
		}
		// For Others
		return todayDate.add(7, 'd').toDate();
	}

	updateCardActivity(cardActivity) {
		this.securedStorage.setCookie('promptCard', JSON.stringify(cardActivity));
	}

	private processWindowMessage(event) {
		if (event?.data?.event !== 'calendly.event_scheduled' || !window.Calendly) {
			return;
		}
		let demoType;
		let cardId;

		if (window.Calendly.popupWidget.url === environment.calendlyScheduleDemoLink) {
			demoType = 'Schedule Demo';
			cardId = '1';
		}
		this.logger.info('demo_schedule', {demo_type: demoType}, 'ManageGroupsComponent', 'openCalendly');
		this.closePromptCard(cardId, true);
		this.unlisten();
	}

	openCalendly(type) {
		this.unlisten = this.renderer2.listen(window, 'message', event => this.processWindowMessage(event));
		if (!window.Calendly) {
			this.alert.error('Something went wrong', 'Please try again');
			return;
		} else {
			if (type === 'scheduleDemo') {
				window.Calendly.initPopupWidget({url: environment.calendlyScheduleDemoLink});
			} 
		}
	}

	showAllCard(element) {
		this.recordButtonClick(element);
		this.optInCardOpen = true;
	}

	showOneCard(element) {
		this.recordButtonClick(element);
		this.optInCardOpen = false;
	}

	openFbJoinGroupPopup(url) {
		window.open(
			url,
			'popUpWindow',
			'height=560,width=680,left=10,top=10,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,directories=no,status=yes'
		);
		this.closePromptCard('3', true);
	}

	hideWhatsAppOverlay() {
		this.showWhatsappOptInOverlay = false;
		this.removeBootstrapBackDrop();
	}

	didNotReceiveCardStatus(event) {
		this.showDidNotReceivedPopup = event;
	}

	hideWAConfirmOptInCard() {
		this.showWhatsappOptInOverlay = false;
		this.removeBootstrapBackDrop();
		this.closePromptCard('4', true);
	}

	hideWAOptInCard() {
		this.closePromptCard('2', true);
	}

	hideInsightsUploadCard() {
		this.closePromptCard('5', true);
	}

	whatsappOptInOverlay(cardId) {
		this.showWAConfirmation = cardId !== '2';
		this.showWhatsappOptInOverlay = true;
	}

	removeBootstrapBackDrop() {
		let modalBackdropList = document.getElementsByClassName('modal-backdrop');
		for (let i = 0; i < modalBackdropList.length; i++) {
			modalBackdropList[i].remove();
		}
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
