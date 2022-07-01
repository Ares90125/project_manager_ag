describe('Group admin test cases', function () {
	before('login using facebook', () => {
		cy.fixture(`api-test/convosightLoginWithGroups.json`).then(session => {
			cy.RestoreSession(session);
		});
		cy.visit(`/login-response`).saveLocalStorage();
		cy.visit('group-admin/manage');
	});

	beforeEach(() => {
		cy.restoreLocalStorage();
		cy.clearCookie(`promptCard`);
	});

	//@ts-ignore
	it('verify overview page elements when group installation date is less than 2 days.', () => {
		const path = `mock-responses/group-overview.spec`;
		cy.MockQueryUsingFile(`GetGroupsByUserId`, path);
		cy.visit('group-admin/manage');
		cy.clock(1628511937000, [`Date`]); //Date set as 9th August 2021
		cy.contains(`.list-item`, `Cs Admin Test Group`, {timeout: 60000}).within(() => {
			cy.get(`button.linker`).should(`have.length`, 1).click();
		});
		cy.getDataTestId(`heading-overview`).should(`be.visible`).and(`have.text`, `Overview`);
		cy.get(`.no-result-state`)
			.should(`be.visible`)
			.within(() => {
				cy.get(`figure>img`).should(`be.visible`).and(`have.attr`, `src`, `./assets/images/insight_icon.svg`);
				cy.get(`h5`).should(`be.visible`).and(`have.text`, `We are preparing insights for your group`);
				cy.get(`h6`)
					.should(`be.visible`)
					.and(`have.text`, `On average, it takes about 2 days from your date of install`);
			});
		cy.get(`.suggested-steps-wrap`)
			.should(`be.visible`)
			.within(() => {
				cy.get(`.card-head>h5`).should(`be.visible`).and(`have.text`, `🙌 Suggested next steps for you`);
				cy.getDataCsLabel(`Video`).should(`be.visible`);
				cy.get(`.video-info>h6`)
					.should(`be.visible`)
					.and(`have.text`, `What can you do after installing Convosight in your group?`);
				cy.get(`.video-info>div`)
					.should(`be.visible`)
					.and(`have.text`, `Watch this video to learn about the next steps to get the most out of Convosight`);
				cy.getDataTestId(`image-attend-monetisation`)
					.first()
					.should(`be.visible`)
					.and(`have.attr`, `src`, `./assets/images/monetisation-masterclass.svg`);
				cy.get(`.prompt-card-left>div>h6`)
					.first()
					.should(`be.visible`)
					.and(`have.text`, `Attend a Monetisation Masterclass`);
				cy.get(`.prompt-card-left>div>p`)
					.first()
					.should(`be.visible`)
					.and(`contain.text`, `Learn how to monetise your Facebook group and earn from it`);
				cy.getDataCsLabel(`Already attended`).should(`be.visible`).and(`have.text`, ` Already attended `);
				cy.getDataCsLabel(`Register now`).should(`be.visible`).and(`have.text`, ` Register now `);
				cy.get(`.prompt-card-left>figure>img`)
					.eq(1)
					.should(`be.visible`)
					.and(`have.attr`, `src`, `./assets/images/facebook-icon.svg`);
				cy.get(`.prompt-card-left>div>h6`)
					.eq(1)
					.should(`be.visible`)
					.and(`have.text`, `Join our Facebook Group of top admins`);
				cy.get(`.prompt-card-left>div>p`)
					.eq(1)
					.should(`be.visible`)
					.and(`contain.text`, `2000+ admins from all over the world sharing their success secrets`);
				cy.getDataCsLabel(`Already joined`).should(`be.visible`).and(`have.text`, ` Already joined `);
				cy.getDataCsLabel(`Join now`).should(`be.visible`).and(`have.text`, ` Join now `);
			});
	});

	it('verify that clicking on already attend monetization class removes the respective card', () => {
		const path = `mock-responses/group-overview.spec`;
		cy.MockQueryUsingFile(`GetGroupsByUserId`, path);
		cy.visit('group-admin/manage');
		cy.clock(1628511937000, [`Date`]); //Date set as 9th August 2021
		cy.contains(`.list-item`, `Cs Admin Test Group`, {timeout: 60000}).within(() => {
			cy.get(`button.linker`).should(`have.length`, 1).click();
		});
		cy.clock(1628511937000, [`Date`]); //Date set as 9th August 2021
		cy.get(`.suggested-steps-wrap`)
			.should(`be.visible`)
			.within(() => {
				cy.getDataCsLabel(`Already attended`).should(`be.visible`).click();
				cy.getDataCsLabel(`Already attended`).should(`not.exist`);
				cy.getDataTestId(`heading-attend-monetisation`).should(`not.exist`);
				cy.getDataTestId(`subheading-attend-monetisation`).should(`not.exist`);
				cy.getDataCsLabel(`Register now`).should(`not.exist`);
			});
	});

	it('verify that clicking on already joined facebook group removes the respective card', () => {
		const path = `mock-responses/group-overview.spec`;
		cy.MockQueryUsingFile(`GetGroupsByUserId`, path);
		cy.visit('group-admin/manage');
		cy.clock(1628511937000, [`Date`]); //Date set as 9th August 2021
		cy.contains(`.list-item`, `Cs Admin Test Group`, {timeout: 60000}).within(() => {
			cy.get(`button.linker`).should(`have.length`, 1).click();
		});
		cy.clock(1628511937000, [`Date`]); //Date set as 9th August 2021
		cy.get(`.suggested-steps-wrap`)
			.should(`be.visible`)
			.within(() => {
				cy.getDataCsLabel(`Already joined`).should(`be.visible`).click();
				cy.getDataCsLabel(`Join now`).should(`not.exist`);
				cy.getDataTestId(`heading-join-fb`).should(`not.exist`);
				cy.getDataTestId(`subheading-join-fb`).should(`not.exist`);
				cy.getDataCsLabel(`Already joined`).should(`not.exist`);
			});
	});

	it.skip('verify that user is able to schedule monetization class', () => {
		const path = `mock-responses/group-overview.spec`;
		cy.MockQueryUsingFile(`GetGroupsByUserId`, path);
		cy.visit('group-admin/manage');
		cy.clock(1628511937000, [`Date`]); //Date set as 9th August 2021
		cy.contains(`.list-item`, `Cs Admin Test Group`, {timeout: 60000}).within(() => {
			cy.get(`button.linker`).should(`have.length`, 1).click();
		});
		cy.getDataTestId(`heading-overview`).should(`be.visible`).and(`have.text`, `Overview`);
		cy.getDataCsLabel(`Register now`)
			.should(`be.visible`)
			.click()
			.frameLoaded(`.calendly-popup-content > iframe`)
			.should(`be.visible`)
			.enter(`.calendly-popup-content > iframe`)
			.then(getBody => {
				getBody()
					.find(`.calendar-table `)
					.within(() => {
						cy.get(`button:enabled`).first().click();
					});
				getBody().find(`[data-container="time-button"]`).first().click();
				getBody().find(`[data-container="confirm-button"]`).click();
				getBody().find(`[name="full_name"]`).clear().type(`Testing`);
				getBody().find(`[name = "email"]`).clear().type(`test@test.com`);
				getBody().find(`[name = "question_0"]`).clear().type(`test`);
				getBody().find(`[name = "question_1"]`).clear().type(`test`);
				getBody().find(`[name = "question_2"]`).clear().type(`1`);
				getBody().find(`[name = "question_3"]`).first().click({force: true});
				getBody().find(`[name = "question_4"]`).first().click({force: true});
				getBody().find(`[name = "question_5"]`).first().click({force: true});

				getBody().find(`[type = "submit"]`).click();
				getBody()
					.find(`[data-component="confirmation-header"]`)
					.should(`be.visible`)
					.within(() => cy.get(`h2`).should(`contain.text`, `Confirmed`));
			})
			.window()
			.its(`Calendly`)
			.invoke(`closePopupWidget`)
			.getDataCsLabel(`Register now`)
			.should(`not.exist`);
	});
});
