describe.skip('group admin opt in cards', () => {
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

	it(`should schedule the demo when clicked on schedule now`, () => {
		cy.getDataTestId(`opt-in-container`)
			.as(`optinContainer`)
			.within(() => {
				cy.getDataCsLabel(`Show more`).should(`be.visible`).as(`moreButton`).click();
				cy.getDataTestId(`card-productDemo-all-prompt-card`).as(`scheduleDemoPromptCard`).should(`be.visible`);
				cy.getDataTestId(`button-schedule-now-product-demo-all-prompt-card`).should(`be.visible`).click();
			})
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
				getBody().find(`[value="Yes"]`).click({force: true});
				getBody().find(`[type = "submit"]`).click();
				getBody()
					.find(`[data-component="confirmation-header"]`)
					.should(`be.visible`)
					.within(() => cy.get(`h1`).should(`contain.text`, `Confirmed`));
			})
			.window()
			.its(`Calendly`)
			.invoke(`closePopupWidget`)
			.get(`@scheduleDemoPromptCard`)
			.should(`not.exist`);
		cy.getCookie(`promptCard`)
			.should(`exist`)
			.then(cookie => {
				const arr = JSON.parse(cookie.value);
				arr.forEach(value => {
					if (value.cardId == 1) {
						const todayDate = new Date().setHours(0, 0, 0, 0);
						const date = new Date(todayDate + 86400 * 1000 * 7).toISOString();
						const {nextDayToBeShownAtUtc, numberOfTime7DaysIntervalConsume} = value.cardActivity;
						expect(nextDayToBeShownAtUtc).to.be.equal(date);
						expect(numberOfTime7DaysIntervalConsume).to.be.equal(1);
					}
				});
			});
	});

	it(`should close schedule card when clicked on close`, () => {
		cy.getDataTestId(`opt-in-container`)
			.as(`optinContainer`)
			.within(() => {
				cy.getDataCsLabel(`Show more`).should(`be.visible`).as(`moreButton`).click();
				cy.getDataTestId(`card-productDemo-all-prompt-card`).should(`be.visible`);
				cy.getDataTestId(`button-close-productDemo-all-prompt-card`).should(`be.visible`).click();
			});
		cy.getDataTestId(`card-productDemo-all-prompt-card`).should(`not.exist`);
		cy.getCookie(`promptCard`)
			.should(`exist`)
			.then(cookie => {
				const arr = JSON.parse(cookie.value);
				arr.forEach(value => {
					if (value.cardId == 1) {
						const todayDate = new Date().setHours(0, 0, 0, 0);
						const date = new Date(todayDate + 86400 * 1000 * 7).toISOString();
						const {nextDayToBeShownAtUtc, numberOfTime7DaysIntervalConsume} = value.cardActivity;
						expect(nextDayToBeShownAtUtc).to.be.equal(date);
						expect(numberOfTime7DaysIntervalConsume).to.be.equal(1);
					}
				});
			});
	});

	it(`should close schedule card when clicked on already done`, () => {
		cy.getDataTestId(`opt-in-container`)
			.as(`optinContainer`)
			.within(() => {
				cy.getDataCsLabel(`Show more`).should(`be.visible`).as(`moreButton`).click();
				cy.getDataTestId(`button-productDemo-alreadyDone-all-prompt-card`)
					.should(`be.visible`)
					.should(`contain.text`, `Already done`)
					.click();
			});
		cy.getDataTestId(`card-productDemo-all-prompt-card`).should(`not.exist`);
		cy.getCookie(`promptCard`)
			.should(`exist`)
			.then(cookie => {
				const arr = JSON.parse(cookie.value);
				arr.forEach(value => {
					if (value.cardId == 1) {
						const todayDate = new Date().setHours(0, 0, 0, 0);
						const date = new Date(todayDate + 86400 * 1000 * 7).toISOString();
						const {nextDayToBeShownAtUtc, numberOfTime7DaysIntervalConsume} = value.cardActivity;
						expect(nextDayToBeShownAtUtc).to.be.equal(date);
						expect(numberOfTime7DaysIntervalConsume).to.be.equal(1);
					}
				});
			});
	});

	it(`should show all four cards when click on show more and show only single card when clicked on show less`, () => {
		cy.getDataTestId(`opt-in-container`)
			.should(`be.visible`)
			.as(`optinContainer`)
			.within(() => {
				cy.getDataCsLabel(`Show more`).should(`be.visible`).as(`moreButton`).click();

				cy.get(`.opt-in-conatiner`).should(`have.lengthOf`, 4);

				cy.getDataTestId(`card-productDemo-all-prompt-card`)
					.should(`be.visible`)
					.should(
						`have.text`,
						`Schedule a product demo ⏰Understand how to use Convosight to supercharge your group’s growth`
					);

				cy.getDataTestId(`card-joinFbGroup-all-prompt-card`)
					.should(`be.visible`)
					.should(
						`have.text`,
						`Join our Facebook Group 💪Join our Facebook group where Facebook power admins hang out`
					);

				cy.getDataTestId(`card-monetisation-all-prompt-card`)
					.should(`be.visible`)
					.should(
						`have.text`,
						`Monetisation Masterclass seriesLearn how to monetise your Facebook group and earn from it`
					);

				cy.getDataTestId(`card-whatsapp-subscrition-all-prompt-card`)
					.should(`be.visible`)
					.should(
						`have.text`,
						`Daily summary on WhatsApp 🔖Subscribe to get daily summary and campaign updates on Whatsapp`
					);

				cy.getDataCsLabel(`Show less`).should(`be.visible`).click();

				cy.get(`.opt-in-conatiner`).should(`have.lengthOf`, 1);
			});
	});
});
