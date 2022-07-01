describe.skip('page_loaded event test cases', function () {
	before('login using facebook', () => {
		cy.fixture(`api-test/convosightLoginWithGroups.json`).then(session => {
			cy.RestoreSession(session);
		});
		cy.intercept(`POST`, Cypress.env(`pageEventURL`), req => {
			req.destroy();
		});
		cy.intercept(`POST`, Cypress.env(`logsURL`), req => {
			req.destroy();
		});
		cy.visit(`/login-response`).saveLocalStorage();
	});

	beforeEach(() => {
		cy.restoreLocalStorage();
		cy.intercept(`POST`, Cypress.env(`pageEventURL`), req => {
			req.destroy();
		});
		cy.intercept(`POST`, Cypress.env(`logsURL`), req => {
			req.destroy();
		});

		cy.InterceptEventsProperties('page_loaded');
	});

	it('verify properties being sent for page_loaded event for manage group page.', () => {
		cy.visit('group-admin/manage')
			.window()
			.then(win => {
				//@ts-ignore
				win.cypressTrackEvent = 'true';
			});
		cy.contains(`.list-item`, `Cs Admin Test Group`, {timeout: 60000}).should(`be.visible`);
		cy.getDataCsLabel(`Profile Image`).should(`be.visible`).click().getDataCsLabel(`Settings`).click();
		cy.wait(`@page_loaded`, {responseTimeout: 30000}).then(req => {
			//@ts-ignore
			const eventProperty = JSON.parse(req.request.body);
			const {properties} = eventProperty;
			const {application_platform, device_form_factor, is_new_user, page_name, skip_email} = properties;
			expect(Object.keys(properties).length).to.greaterThan(5);
			expect(application_platform).to.equal(`Website`);
			expect(device_form_factor).to.equal(`Desktop`);
			expect(is_new_user).to.be.false;
			expect(page_name).to.be.not.null;
			expect(page_name).to.be.not.empty;
			expect(skip_email).to.be.false;
		});
	});

	it('verify properties being sent for page_loaded event at group level.', () => {
		cy.visit('group-admin/manage')
			.window()
			.then(win => {
				//@ts-ignore
				win.cypressTrackEvent = 'true';
			});
		cy.window().then(win => {
			//@ts-ignore
			win.cypressTrackEvent = 'true';
		});
		cy.contains(`.list-item`, `Cs Admin Test Group`, {timeout: 60000}).within(() => {
			cy.get(`button.linker`).should(`have.length`, 1).click();
		});
		cy.wait(`@page_loaded`, {timeout: 60000}).then(req => {
			//@ts-ignore
			const eventProperty = JSON.parse(req.request.body);
			const {properties} = eventProperty;
			const {application_platform, device_form_factor, is_new_user, page_name, skip_email} = properties;
			expect(application_platform).to.equal(`Website`);
			expect(device_form_factor).to.equal(`Desktop`);
			expect(is_new_user).to.be.false;
			expect(page_name).to.be.not.null;
			expect(page_name).to.be.not.empty;
			expect(skip_email).to.be.false;
		});
	});
});
