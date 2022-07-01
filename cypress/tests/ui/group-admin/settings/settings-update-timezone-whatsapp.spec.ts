describe(`Email verification test cases`, () => {
	const NavigateToSettings = () => {
		cy.visit(`group-admin/manage`);
		cy.contains(`.list-item`, `Cs Admin Test Group`, {timeout: 60000}).should(`be.visible`);
		cy.getDataCsLabel(`Profile Image`).click().getDataCsLabel(`Settings`).click();
		cy.getDataTestId(`general-settings-card-timezone`).should(`be.visible`);
	};
	before(`login using facebook`, () => {
		cy.fixture(`api-test/convosightLoginWithGroups.json`)
			.then(session => {
				cy.RestoreSession(session);
			})
			.visit(`/login-response`)
			.saveLocalStorage();
		//dummycommit
	});
	beforeEach(`Intercept Route`, () => {
		cy.InterceptRoute([`ExecuteFacebookGraphApi`, `UpdateUser`]);
		cy.restoreLocalStorage();
	});
	it(`Verify page elements for update timezone`, () => {
		NavigateToSettings();
		cy.getDataTestId(`general-settings-card-timezone`).should(`be.visible`);
		cy.getDataTestId(`edit-timezone`).should(`be.visible`).click();
		cy.getDataTestId(`edit-timezone`).should(`not.exist`);
		cy.getDataTestId(`heading-edit-timezone`).should(`be.visible`).should(`contain.text`, `Time Zone`);
		cy.getDataTestId(`subheading-edit-timezone`)
			.should(`be.visible`)
			.should(`contain.text`, `Choose your preferred options:`);
		cy.getDataTestId(`button-save-edit-timezone`).should(`be.visible`).should(`contain.text`, `Save`);
		cy.getDataTestId(`timezone-search-wrapper`).should(`be.visible`);
		cy.getDataTestId(`button-cancel-edit-timezone`).should(`be.visible`).should(`contain.text`, `Cancel`).click();
	});

	it.skip(`Verify user is able to save the changes`, () => {
		cy.getDataTestId(`selected-value-timezone`).should(`be.visible`).as(`originalTimezoneValue`);
		cy.getDataTestId(`edit-timezone`).should(`be.visible`).click();
		cy.getDataTestId(`edit-timezone`).should(`not.exist`);
		cy.getDataTestId(`timezone-search-wrapper`).should(`be.visible`).click();
		cy.getDataTestId(`search-timezone-text`).type(`(UTC -06:00) America/Regina`);
		cy.getDataTestId(`searched-timezone-value`)
			.should(`be.visible`)
			.should(`contain.text`, `(UTC -06:00) America/Regina`)
			.click();
		cy.getDataTestId(`button-save-edit-timezone`).should(`be.visible`).should(`contain.text`, `Save`).click();
		cy.wait(`@UpdateUser`, {timeout: 30000});
		cy.get(`@originalTimezoneValue`).should(`be.visible`).should(`contain.text`, `(UTC -06:00) America/Regina`);
	});
	it.skip(`Verify page elements for update whatsapp`, () => {
		const path = `mock-responses/update-whatsapp.spec`;
		cy.MockQueryUsingFile(`GetUserDetails`, path).MockQueryUsingFile(`UpdateUser`, path);
		NavigateToSettings();
		cy.getDataTestId(`general-settings-card-timezone`).should(`be.visible`);
		cy.getDataTestId(`heading-whatsapp-setting`).should(`be.visible`).should(`contain.text`, `Whatsapp Updates`);
		cy.getDataTestId(`subheading-whatsapp-setting`)
			.should(`be.visible`)
			.should(`contain.text`, `Subscribe to WhatsApp to stay updated on important information about your group.`);
		cy.getDataTestId(`button-whatsapp-subscribe`)
			.as(`subscribeWhatsapp`)
			.should(`be.visible`)
			.should(`contain.text`, `Subscribe`)
			.click();
		cy.getDataTestId(`whatsapp-pop-up-heading`)
			.eq(0)
			.should(`be.visible`)
			.should(`contain.text`, `Subscribe to Whatsapp updates`);
		cy.getDataTestId(`subheading-whatsapp-pop-up`)
			.should(`be.visible`)
			.should(
				`contain.text`,
				`Receive campaign updates and other notifications to monetise and manage your group better.`
			);
		cy.get(`[type="tel"]`).clear().type(`9717584233`).getDataCsLabel(`Confirm`).click();
		cy.getDataCsLabel(`Did not receive a message?`).should(`be.visible`).click();
		cy.getDataTestId(`heading-did-not-receive-msg`).should(`be.visible`);
		cy.getDataCsLabel(`Continue`).should(`be.visible`).click();
	});
	it.skip(`Verify update whatsapp number`, () => {
		NavigateToSettings();
		cy.getDataTestId(`general-settings-card-timezone`).should(`be.visible`);
		cy.getDataTestId(`button-pending-verification`)
			.should(`be.visible`)
			.should(`contain.text`, ` Pending Verification `);
		cy.getDataTestId(`whatsapp-edit`).should(`be.visible`).click();
		cy.getDataTestId(`whatsapp-pop-up-heading`)
			.eq(0)
			.should(`be.visible`)
			.should(`contain.text`, `Subscribe to Whatsapp updates`);
		cy.getDataTestId(`subheading-whatsapp-pop-up`)
			.should(`be.visible`)
			.should(
				`contain.text`,
				`Receive campaign updates and other notifications to monetise and manage your group better.`
			);
		cy.get(`[type="tel"]`)
			.clear()
			.type(`9717584233`)
			.getDataCsLabel(`Confirm`)
			.as(`confirm`)
			.click()
			.get(`.whatsapp-confirmation-wrapper`)
			.should(`be.visible`)
			.get(`.number-info-wrap`)
			.should(`contain.text`, `+91-9717584233 Incorrect number? Edit `);
	});
	it.skip(`Verify subscribe to whatsapp pop up is closed.`, () => {
		const path = `mock-responses/update-whatsapp.spec`;
		cy.MockQueryUsingFile(`GetUserDetails`, path).MockQueryUsingFile(`UpdateUser`, path);
		NavigateToSettings();
		cy.getDataTestId(`general-settings-card-timezone`).should(`be.visible`);
		cy.getDataTestId(`heading-whatsapp-setting`).should(`be.visible`).should(`contain.text`, `Whatsapp Updates`);
		cy.getDataTestId(`subheading-whatsapp-setting`).should(`be.visible`);
		cy.getDataTestId(`button-whatsapp-subscribe`).as(`subscribeWhatsapp`).should(`be.visible`).click();
		cy.getDataTestId(`subheading-whatsapp-pop-up`).should(`be.visible`);
		cy.get(`#convosight-whatsapp-opt > div > div > app-whatsapp-opt-in > div > div.modal-header > button`)
			.should(`be.visible`)
			.click();
		cy.get(`#convosight-whatsapp-opt`).should(`have.attr`, `aria-hidden`, `true`);
	});
});
