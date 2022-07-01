describe(`publish functionality on group manage screen`, () => {
	context(`login with multiple groups`, () => {
		before(`login using facebook`, () => {
			cy.clearCookies();

			cy.fixture(`api-test/convosightLoginWithGroups.json`)
				.then(session => {
					cy.RestoreSession(session);
				})
				.visit(`/login-response`)
				.saveLocalStorage();
		});

		beforeEach(() => {
			cy.InterceptRoute(`ListFbPostModels`);
			cy.restoreLocalStorage();
			cy.visit(`group-admin/manage`);
			cy.getDataTestId(`image-publish-link`).should(`be.visible`);
			cy.getDataTestId(`button-group-publish`).should(`be.visible`).eq(0).should(`contain.text`, `Publish`).click();
			cy.getDataCsLabel(`Continue`).should(`be.visible`).click();
		});
		it(`Verify page elements for publish screen`, () => {
			cy.getDataTestId(`heading-publish-screen`)
				.should(`be.visible`)
				.should(`contain.text`, `Select a group to view its schedule posts:`);
			cy.wait(`@ListFbPostModels`, {timeout: 30000});
			cy.getDataCsLabel(`Create a post`).should(`be.visible`).should(`contain.text`, `Create a post`);
			cy.getDataCsLabel(`Post Analytics`).should(`be.visible`).should(`contain.text`, `Post Analytics`);
			cy.getDataTestId(`heading-group-name`)
				.should(`have.lengthOf`, `3`)
				.eq(0)
				.should(`contain.text`, `Kids Nutrition and Recipes 👶🍎🍜`);
			cy.getDataTestId(`heading-group-name`).eq(1).should(`contain.text`, `Test group 2`);
			cy.getDataTestId(`heading-group-name`).eq(2).should(`contain.text`, `Cs Admin Test Group`);
		});

		it(`Verify post composer screen is loaded for the group selected in publish screen and user is navigated back to publish screen on closing post composer`, () => {
			cy.contains(`[data-test-id ="list-installed-groups"]`, `Cs Admin Test Group`).click();
			cy.getDataTestId(`selected-group-name`).should(`be.visible`).should(`contain.text`, `Cs Admin Test Group`);
			cy.getDataTestId(`fb-group-link`).should(`be.visible`);
			cy.getDataCsLabel(`To post page`).should(`be.visible`).click();
			cy.getDataTestId(`heading-post-composer-page`).should(`be.visible`).should(`contain.text`, `New post`);
			cy.getDataTestId(`button-close-post-composer`).should(`be.visible`);
			cy.getDataTestId(`heading-multi-group-post-composer`)
				.should(`be.visible`)
				.should(`contain.text`, `SELECT GROUPS TO PUBLISH`);
			cy.getDataTestId(`subheading-multi-group-post-composer`)
				.should(`be.visible`)
				.should(`contain.text`, `Select all 3 groups`);
			cy.getDataTestId(`checkbox-select-all-groups-post-composer`).should(`be.visible`);
			cy.contains(`[data-test-id="checkbox-multiselec-group-post-composer"]`, `Cs Admin Test Group`).within(() => {
				cy.get(`[type="checkbox"]`).should(`be.checked`);
			});
			cy.contains(`[data-test-id="checkbox-multiselec-group-post-composer"]`, `Kids Nutrition and Recipes`).within(
				() => {
					cy.get(`[type="checkbox"]`).should(`not.be.checked`);
				}
			);
			cy.contains(`[data-test-id="checkbox-multiselec-group-post-composer"]`, `Test group 2`).within(() => {
				cy.get(`[type="checkbox"]`).should(`not.be.checked`);
			});
			cy.getDataTestId(`button-close-post-composer`).should(`be.visible`).click();
			cy.getDataTestId(`heading-publish-screen`)
				.should(`be.visible`)
				.should(`contain.text`, `Select a group to view its schedule posts:`);
			cy.wait(`@ListFbPostModels`, {timeout: 30000});
		});

		it(`Verify post analytics screen is displayed on clicking post analytics`, () => {
			cy.contains(`[data-test-id ="list-installed-groups"]`, `Cs Admin Test Group`).click();
			cy.wait(`@ListFbPostModels`, {timeout: 30000});
			cy.getDataCsLabel(`To post page`).should(`be.visible`);
			cy.getDataTestId(`selected-group-name`).should(`be.visible`).should(`contain.text`, `Cs Admin Test Group`);
			cy.getDataCsLabel(`Post Analytics`).should(`be.visible`).click();
			cy.getDataTestId(`selected-group-name`).should(`be.visible`).should(`contain.text`, `Cs Admin Test Group`);
			cy.getDataTestId(`heading-post-analytics-scheduled-posts`)
				.should(`be.visible`)
				.should(`contain.text`, `Your scheduled posts`);
			cy.getDataTestId(`post-analytics-body`).should(`be.visible`);
		});
	});
});
