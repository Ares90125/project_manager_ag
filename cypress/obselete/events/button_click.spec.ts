describe.skip('Button_click event test cases', function () {
	before('login using facebook', () => {
		cy.fixture(`api-test/convosightLoginWithGroups.json`).then(session => {
			cy.RestoreSession(session);
		});
		cy.intercept(`POST`, Cypress.env(`pageEventURL`), req => {
			req.destroy();
		});
		cy.InterceptEventsProperties('button_clicked');
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

		cy.InterceptEventsProperties('button_clicked');
		cy.InterceptRoute(`CreateFbPostModel`);
		cy.visit('group-admin/manage')
			.window()
			.then(win => {
				//@ts-ignore
				win.cypressTrackEvent = 'true';
			});
	});

	it('verify properties being sent for  button_click event when group is involved.', () => {
		cy.contains(`.list-item`, `Kids Nutrition and Recipes 👶🍎🍜`, {timeout: 60000}).within(() => {
			cy.get(`button.linker`).should(`have.length`, 1).click();
		});
		cy.wait(`@button_clicked`, {timeout: 60000}).then(req => {
			//@ts-ignore
			const eventProperty = JSON.parse(req.request.body);
			const {properties} = eventProperty;
			const {
				application_platform,
				button_cs_id,
				button_label,
				device_form_factor,
				group_acquired_date,
				group_business_category,
				group_country,
				group_fb_id,
				group_id,
				group_member_count,
				group_name,
				is_new_user,
				page_name,
				skip_email,
				source
			} = properties;
			expect(Object.keys(properties).length).to.equal(15);
			expect(button_cs_id).to.equal(`6c72f124-a774-4b22-8ecf-383b69dc62a5`);
			expect(application_platform).to.equal(`Website`);
			expect(button_label).to.equal(`View Overview`);
			expect(device_form_factor).to.equal(`Desktop`);
			expect(group_acquired_date).to.not.be.null;
			expect(group_acquired_date).to.not.be.undefined;
			expect(group_business_category).to.equal(`Parenting`);
			expect(group_country).to.equal(`IN`);
			expect(group_fb_id).to.equal(`1398172130280892`);
			expect(group_id).to.equal(`9a0f9a0f-a7e0-41f0-99a0-2934f58efaf2`);
			expect(group_member_count).to.be.greaterThan(0);
			expect(group_member_count).to.not.be.null;
			expect(group_member_count).to.not.be.undefined;
			expect(group_name).to.be.equal(`Kids Nutrition and Recipes 👶🍎🍜`);
			expect(is_new_user).to.be.false;
			expect(page_name).to.be.equal(`Group Admin Manage Groups`);
			expect(skip_email).to.be.false;
			expect(source).to.be.equal(`page`);
		});
	});

	it('verify properties being sent for button_click event at user level without users group being involved.', () => {
		cy.getDataCsLabel(`Bell`).eq(0).should(`be.visible`).click();
		cy.wait(`@button_clicked`, {timeout: 60000}).then(req => {
			//@ts-ignore
			const eventProperty = JSON.parse(req.request.body);
			const {properties} = eventProperty;
			const {
				application_platform,
				button_cs_id,
				button_label,
				device_form_factor,
				is_new_user,
				page_name,
				skip_email,
				source
			} = properties;
			expect(Object.keys(properties).length).to.equal(8);
			expect(button_cs_id).to.equal(`4066a6f8-fe9e-40d1-bb0a-a21d867f52c1`);
			expect(application_platform).to.equal(`Website`);
			expect(button_label).to.equal(`Bell`);
			expect(device_form_factor).to.equal(`Desktop`);
			expect(is_new_user).to.be.false;
			expect(page_name).to.be.equal(`Group Admin Manage Groups`);
			expect(skip_email).to.be.false;
			expect(source).to.be.equal(`header`);
		});
	});

	it('verify properties being sent for button_click event when redirected url has query string', () => {
		cy.intercept(`POST`, Cypress.env(`eventURL`), req => {
			if (typeof req.body == 'string') {
				const reqBodyJsonObj = JSON.parse(req.body);
				if (
					reqBodyJsonObj.event.includes(`button_clicked`) &&
					reqBodyJsonObj.properties.button_label.includes('Publish now')
				) {
					console.log(reqBodyJsonObj);
					req.alias = `button_clicked`;
				}
				req.destroy();
			} else {
				req.destroy();
			}
		});
		cy.contains(`.list-item`, `Cs Admin Test Group`, {timeout: 60000}).within(() => {
			cy.get(`button.linker`).should(`have.length`, 1).click();
		});
		cy.getDataTestId(`btn-group-reshare-posts`).should(`be.visible`).click();
		cy.getDataTestId(`tile-lastMonth`).should(`be.visible`).click();
		cy.getDataCsLabel(`Repost this`).eq(0).click();
		cy.getDataTestId(`reshare-post-desc-post-composer`).should(`be.visible`);
		cy.get(`#postMessage`).type(`Test post`);
		cy.get(`.publish-btn`).eq(0).should(`be.visible`).click();
		cy.wait(`@CreateFbPostModel`, {timeout: 60000});
		cy.getDataCsLabel(`Continue`).should(`be.visible`);
		cy.wait(`@button_clicked`, {timeout: 60000}).then(req => {
			const eventProperty = JSON.parse(req.request.body);
			const {properties} = eventProperty;
			console.log(properties);
			const {
				application_platform,
				button_label,
				parent_label,
				device_form_factor,
				group_acquired_date,
				group_business_category,
				group_country,
				group_fb_id,
				group_id,
				group_member_count,
				group_name,
				is_new_user,
				page_name,
				skip_email,
				source,
				qs_method,
				qs_postid
			} = properties;
			expect(Object.keys(properties).length).to.equal(17);
			expect(application_platform).to.equal(`Website`);
			expect(button_label).to.equal(`Publish now`);
			expect(device_form_factor).to.equal(`Desktop`);
			expect(group_acquired_date).to.not.be.null;
			expect(group_acquired_date).to.not.be.undefined;
			expect(group_business_category).to.equal(`Entertainment`);
			expect(group_country).to.equal(`IA`);
			expect(group_fb_id).to.equal(`622589378670635`);
			expect(group_id).to.equal(`c40d1bd5-4737-40b3-9e40-de78b64454df`);
			expect(group_member_count).to.be.greaterThan(0);
			expect(group_member_count).to.not.be.null;
			expect(group_member_count).to.not.be.undefined;
			expect(group_name).to.be.equal(`Cs Admin Test Group`);
			expect(is_new_user).to.be.false;
			expect(page_name).to.be.equal(`Reshare Post`);
			expect(skip_email).to.be.false;
			expect(source).to.be.equal(`page`);
			expect(parent_label).to.be.equal(`Compose post`);
			expect(qs_method).to.not.be.null;
			expect(qs_postid).to.not.be.null;
		});
	});
});
