describe('tooltip_hovered event test cases', function () {
	it('verify properties being sent for  page_loaded event when user logsin.', () => {
		cy.fixture(`api-test/convosightLoginWithGroups.json`).then(session => {
			cy.RestoreSession(session);
		});
		cy.intercept(`POST`, Cypress.env(`pageEventURL`), req => {
			req.destroy();
		});
		cy.intercept(`POST`, Cypress.env(`logsURL`), req => {
			req.destroy();
		});

		cy.intercept(`POST`, Cypress.env(`eventURL`), req => {
			if (typeof req.body == 'string') {
				const reqBodyJsonObj = JSON.parse(req.body);
				if (reqBodyJsonObj.event.includes(`page_loaded`)) {
					const eventProperty = JSON.parse(req.body);
					const {properties} = eventProperty;
					const {application_platform, device_form_factor, is_new_user, page_name, skip_email, user_id} = properties;
					expect(Object.keys(properties).length).to.equal(6);
					expect(application_platform).to.equal(`Website`);
					expect(device_form_factor).to.equal(`Desktop`);
					expect(is_new_user).to.be.false;
					expect(page_name).to.be.equal(`Login Respo213nse Page`);
					expect(skip_email).to.be.false;
					expect(user_id).to.equal(`3a4930da-3da0-4dd2-9cbf-e9ca3860de66`);
				}
				req.destroy();
			} else {
				req.destroy();
			}
		});
		cy.window().then(win => {
			//@ts-ignore
			win.cypressTrackEvent = 'true';
		});
		cy.visit(`/login-response`, {timeout: 60000});
	});
});
