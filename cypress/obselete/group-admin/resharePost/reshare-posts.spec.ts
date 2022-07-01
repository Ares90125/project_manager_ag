describe(`Schedule posts test cases`, () => {
	before('login using facebook', () => {
		cy.fixture(`api-test/convosightLoginWithGroups.json`).then(session => {
			cy.RestoreSession(session);
		});
		cy.visit(`/login-response`).saveLocalStorage();
	});

	beforeEach(`restore the session`, () => {
		cy.intercept({
			method: `PUT`,
			url: Cypress.env(`uploadUrl`)
		}).as(`uploadImage`);
		cy.restoreLocalStorage();
		cy.visit('group-admin/group/c40d1bd5-4737-40b3-9e40-de78b64454df/post/create?method=direct');
		cy.InterceptRoute([`CreateFbPostModel`, `ListFbPostModels`]);
	});
	it(`Verify user is able to navigate to reshare post screen.`, () => {
		cy.visit('group-admin/manage');
		cy.contains(`.list-item`, `Kids Nutrition and Recipes 👶🍎🍜`, {timeout: 60000}).within(() => {
			cy.get(`button.linker`).should(`have.length`, 1).click();
		});
		cy.getDataTestId(`btn-group-reshare-posts`).click();
		cy.getDataTestId(`heading-reshare-post`).should(`be.visible`).and(`have.text`, `Reshare Posts`);
		cy.getDataTestId(`subheading-reshare-post`)
			.should(`be.visible`)
			.and(`have.text`, `Reshare posts from your group that were previously trending`);
	});
});
