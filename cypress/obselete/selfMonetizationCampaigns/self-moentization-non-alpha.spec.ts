describe('Self Monetization Campaign test case for non alpha users', function () {
	it.skip('C9971330 : To verify that Reports section in Campaigns tab is not visible to non ALPHA users', () => {
		cy.fixture(`api-test/convosightLoginWithGroups`).then(session => {
			cy.RestoreSession(session);
		});
		cy.visit(`/login-response`).saveLocalStorage();
		cy.visit('group-admin/manage');
		cy.getDataCsLabel(`Campaigns`).eq(0).should(`be.visible`).click();
		cy.getDataTestId(`campaigns-heading`)
			.as(`campaign`)
			.should(`be.visible`)
			.should(`have.text`, ` Hello automation User! `);
		cy.getDataCsLabel(`View your reports`).should(`not.exist`);
		cy.getDataTestId(`campaigns-report-heading`).should(`not.exist`);
		cy.getDataTestId(`campaigns-report-img`).should(`not.exist`);
	});
});
