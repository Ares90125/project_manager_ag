describe(`publish functionality on group manage screen`, () => {
	context(`login with one group`, () => {
		it(`Verify publish tab is not available for the user with one group`, () => {
			cy.fixture(`api-test/convosightWithOneGroup.json`)
				.then(session => {
					cy.RestoreSession(session);
				})
				.visit(`/login-response`)
				.saveLocalStorage();
			cy.restoreLocalStorage().visit(`group-admin/manage`);
			cy.getDataTestId(`image-publish-link`).should(`not.exist`);
			cy.getDataTestId(`button-group-publish`).should(`not.exist`);
		});
	});
});
