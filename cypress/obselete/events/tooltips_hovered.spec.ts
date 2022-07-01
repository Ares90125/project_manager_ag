describe('tooltip_hovered event test cases', function () {
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
		cy.visit('group-admin/manage')
			.window()
			.then(win => {
				//@ts-ignore
				win.cypressTrackEvent = 'true';
			});
	});

	it('verify properties being sent for  page_loaded event when user logsin.', () => {
		cy.InterceptEventsProperties('tooltip_hovered');
		cy.get(`.tooltip-wrapper`).first().realHover();
		cy.wait(`@tooltip_hovered`, {timeout: 60000}).then(req => {
			//@ts-ignore
			const eventProperty = JSON.parse(req.request.body);
			const {properties} = eventProperty;
			const {
				application_platform,
				device_form_factor,
				is_new_user,
				page_name,
				skip_email,
				parent_label,
				button_label,
				source
			} = properties;
			expect(Object.keys(properties).length).to.equal(8);
			expect(application_platform).to.equal(`Website`);
			expect(device_form_factor).to.equal(`Desktop`);
			expect(is_new_user).to.be.false;
			expect(page_name).to.be.equal(`Group Admin Manage Groups`);
			expect(skip_email).to.be.false;
			expect(parent_label).to.equal(`Tooltip`);
			expect(button_label).to.equal(`The total number of groups you are an admin of`);
			expect(source).to.equal(`page`);
		});
	});
});
