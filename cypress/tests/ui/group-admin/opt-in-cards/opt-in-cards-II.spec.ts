describe('group admin opt in cards', () => {
	before('login using facebook', () => {
		cy.fixture(`api-test/convosightLoginWithGroups.json`).then(session => {
			cy.RestoreSession(session);
		});
		cy.visit(`/login-response`)
			.contains(`.list-item`, `Cs Admin Test Group`, {timeout: 60000})
			.should(`be.visible`)
			.saveLocalStorage();
	});

	beforeEach(() => {
		cy.restoreLocalStorage();

		const url = Cypress.env(`developAppSyncUrl`);
		cy.intercept(
			{
				method: `POST`,
				url: url
			},
			req => {
				if (req.body.query.includes(`GetUserDetails`)) {
					req.reply(res => {
						const list = res.body;
						const getUserDetails = list.data.getUserDetails;
						(getUserDetails.demoScheduledAtUTC || getUserDetails.demoScheduledAtUTC === null) &&
							delete getUserDetails.demoScheduledAtUTC;

						(getUserDetails.whatsappDismissedAtUTC || getUserDetails.whatsappDismissedAtUTC === null) &&
							delete getUserDetails.whatsappDismissedAtUTC;

						(getUserDetails.whatsappSubscriptionStatus || getUserDetails.whatsappSubscriptionStatus === null) &&
							delete getUserDetails.whatsappSubscriptionStatus;

						(getUserDetails.joinedFBGroupAtUTC || getUserDetails.joinedFBGroupAtUTC === null) &&
							delete getUserDetails.joinedFBGroupAtUTC;

						(getUserDetails.mobileCountryCode || getUserDetails.mobileCountryCode === null) &&
							delete getUserDetails.mobileCountryCode;

						(getUserDetails.mobileDialCode || getUserDetails.mobileDialCode === null) &&
							delete getUserDetails.mobileDialCode;

						(getUserDetails.mobileNumber || getUserDetails.mobileNumber === null) && delete getUserDetails.mobileNumber;
						(getUserDetails.mobileNumberMasked || getUserDetails.mobileNumberMasked === null) &&
							delete getUserDetails.mobileNumberMasked;

						res.send(list);
					});
				}
			}
		);

		cy.clearCookie(`promptCard`);
		cy.visit('group-admin/manage');
		cy.contains(`.list-item`, `Cs Admin Test Group`, {timeout: 60000}).InterceptRoute([
			`UpdateUser`,
			`TriggerWhatsAppOptIn`
		]);
		cy.getCookie(`promptCard`).should(`exist`);
	});

	it.skip(`should be able to subscribe to whatsapp`, () => {
		cy.get(`.opt-in-btn`)
			.should(`be.visible`)
			.click()
			.getDataTestId(`button-whatsapp-subscribeNow-all-prompt-card`)
			.click()
			.get(`[type="tel"]`)
			.clear()
			.getDataCsLabel(`Confirm`)
			.as(`confirm`)
			.should(`be.disabled`)
			.get(`[type="tel"]`)
			.type(`9717584233`)
			.get(`@confirm`)
			.should(`be.enabled`)
			.click()
			.get(`.whatsapp-confirmation-wrapper`)
			.should(`be.visible`)
			.get(`.number-info-wrap`)
			.should(`contain.text`, `+91-9717584233`)
			.wait(`@TriggerWhatsAppOptIn`, {timeout: 30000})
			.its(`request.body.variables`)
			.should(`have.property`, `phone`);
	});

	it(`should close moentisation card when clicked on already attended`, () => {
		cy.get(`.opt-in-btn`)
			.should(`be.visible`)
			.click()
			.getDataTestId(`button-monetisation-alreadyattended-all-prompt-card`)
			.should(`be.visible`)
			.should(`contain.text`, `Already attended`)
			.click();

		cy.getDataTestId(`card-monetisation-all-prompt-card`).should(`not.exist`);
		cy.getCookie(`promptCard`)
			.should(`exist`)
			.then(cookie => {
				const arr = JSON.parse(cookie.value);
				arr.forEach(value => {
					if (value.cardId == 4) {
						const todayDate = new Date().setHours(0, 0, 0, 0);
						const date = new Date(todayDate + 86400 * 1000 * 14).toISOString();
						const {nextDayToBeShownAtUtc, numberOfTime7DaysIntervalConsume} = value.cardActivity;
						expect(nextDayToBeShownAtUtc).to.be.equal(date);
						expect(numberOfTime7DaysIntervalConsume).to.be.equal(1);
					}
				});
			});
	});

	it(`should close moentisation card when clicked on close button`, () => {
		cy.get(`.opt-in-btn`)
			.should(`be.visible`)
			.click()
			.getDataTestId(`button-close-monetisation-all-prompt-card`)
			.should(`be.visible`)
			.click();

		cy.getDataTestId(`card-monetisation-all-prompt-card`).should(`not.exist`);
		cy.getCookie(`promptCard`)
			.should(`exist`)
			.then(cookie => {
				const arr = JSON.parse(cookie.value);
				arr.forEach(value => {
					if (value.cardId == 4) {
						const todayDate = new Date().setHours(0, 0, 0, 0);
						const date = new Date(todayDate + 86400 * 1000 * 14).toISOString();
						const {nextDayToBeShownAtUtc, numberOfTime7DaysIntervalConsume} = value.cardActivity;
						expect(nextDayToBeShownAtUtc).to.be.equal(date);
						expect(numberOfTime7DaysIntervalConsume).to.be.equal(1);
					}
				});
			});
	});

	it(`should close join facebook group card when clicked on already joined`, () => {
		cy.get(`.opt-in-btn`)
			.should(`be.visible`)
			.click()
			.getDataTestId(`button-joinFbGroup-alreadyJoined-all-prompt-card`)
			.should(`be.visible`)
			.click();
		cy.getDataTestId(`card-joinFbGroup-all-prompt-card`).should(`not.exist`);
		cy.getCookie(`promptCard`)
			.should(`exist`)
			.then(cookie => {
				const arr = JSON.parse(cookie.value);
				arr.forEach(value => {
					if (value.cardId == 3) {
						const todayDate = new Date().setHours(0, 0, 0, 0);
						const date = new Date(todayDate + 86400 * 1000 * 7).toISOString();
						const {nextDayToBeShownAtUtc, numberOfTime7DaysIntervalConsume} = value.cardActivity;
						expect(nextDayToBeShownAtUtc).to.be.equal(date);
						expect(numberOfTime7DaysIntervalConsume).to.be.equal(1);
					}
				});
			});
	});

	it.skip(`should close subscribe to whatsapp card when clicked on close button`, () => {
		cy.get(`.opt-in-btn`)
			.should(`be.visible`)
			.click()
			.getDataTestId(`button-close-whatsappSubscription-all-prompt-card`)
			.should(`be.visible`)
			.click();
		cy.getDataTestId(`card-whatsapp-subscrition-all-prompt-card`).should(`not.exist`);
		cy.getCookie(`promptCard`)
			.should(`exist`)
			.then(cookie => {
				const arr = JSON.parse(cookie.value);
				arr.forEach(value => {
					if (value.cardId == 2) {
						const todayDate = new Date().setHours(0, 0, 0, 0);
						const date = new Date(todayDate + 86400 * 1000).toISOString();
						const {nextDayToBeShownAtUtc, numberOfTime7DaysIntervalConsume} = value.cardActivity;
						expect(nextDayToBeShownAtUtc).to.be.equal(date);
						expect(numberOfTime7DaysIntervalConsume).to.be.equal(0);
					}
				});
			});
	});

	it(`should close join fb group prompt  when clicked on close button`, () => {
		cy.get(`.opt-in-btn`)
			.should(`be.visible`)
			.click()
			.getDataTestId(`button-close-joinFbGroup-all-prompt-card`)
			.should(`be.visible`)
			.click();

		cy.getDataTestId(`card-joinFbGroup-all-prompt-card`).should(`not.exist`);
		cy.getCookie(`promptCard`)
			.should(`exist`)
			.then(cookie => {
				const arr = JSON.parse(cookie.value);
				arr.forEach(value => {
					if (value.cardId == 3) {
						const todayDate = new Date().setHours(0, 0, 0, 0);
						const date = new Date(todayDate + 86400 * 1000 * 7).toISOString();
						const {nextDayToBeShownAtUtc, numberOfTime7DaysIntervalConsume} = value.cardActivity;
						expect(nextDayToBeShownAtUtc).to.be.equal(date);
						expect(numberOfTime7DaysIntervalConsume).to.be.equal(1);
					}
				});
			});
	});

	it.skip(`should be able to schedule monetization class`, () => {
		cy.get(`.opt-in-btn`)
			.should(`be.visible`)
			.click()
			.getDataTestId(`button-monetisation-registerNow-all-prompt-card`)
			.should(`be.visible`)
			.click()
			.frameLoaded(`.calendly-popup-content > iframe`)
			.should(`be.visible`)
			.enter(`.calendly-popup-content > iframe`)
			.then(getBody => {
				getBody()
					.find(`.calendar-table `)
					.within(() => {
						cy.get(`button:enabled`).eq(0).click();
					});
				getBody().find(`[data-container="time-button"]`).eq(0).click();
				getBody().find(`[data-container="confirm-button"]`).click();
				getBody().find(`[name="full_name"]`).clear().type(`Testing`);
				getBody().find(`[name = "email"]`).clear().type(`test@test.com`);
				getBody().find(`[name = "question_0"]`).clear().type(`test`);
				getBody().find(`[name = "question_1"]`).clear().type(`test`);
				getBody().find(`[name = "question_2"]`).clear().type(`1`);
				getBody().find(`[name = "question_3"]`).eq(0).click({force: true});
				getBody().find(`[name = "question_4"]`).eq(0).click({force: true});
				getBody().find(`[name = "question_5"]`).eq(0).click({force: true});

				getBody().find(`[type = "submit"]`).click();
				getBody()
					.find(`[data-component="confirmation-header"]`)
					.should(`be.visible`)
					.within(() => cy.get(`h1`).should(`contain.text`, `Confirmed`));
			})
			.window()
			.its(`Calendly`)
			.invoke(`closePopupWidget`)
			.getDataTestId(`card-monetisation-all-prompt-card`)
			.should(`not.exist`);
		cy.getCookie(`promptCard`)
			.should(`exist`)
			.then(cookie => {
				const arr = JSON.parse(cookie.value);
				arr.forEach(value => {
					if (value.cardId == 4) {
						const todayDate = new Date().setHours(0, 0, 0, 0);
						const date = new Date(todayDate + 86400 * 1000 * 14).toISOString();
						const {nextDayToBeShownAtUtc, numberOfTime7DaysIntervalConsume} = value.cardActivity;
						expect(nextDayToBeShownAtUtc).to.be.equal(date);
						expect(numberOfTime7DaysIntervalConsume).to.be.equal(1);
					}
				});
			});
	});
});
