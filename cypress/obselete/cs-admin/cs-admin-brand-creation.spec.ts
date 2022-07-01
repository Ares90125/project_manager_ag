describe(`Create brand spec`, () => {
	before(() => {
		cy.LoginAsCSAdmin();
	});

	beforeEach(() => {
		cy.restoreLocalStorage();
		cy.visit(`/cs-admin/manage-brands`);
		cy.get(`[name="search"]`).type(`Adidas Originals`).getDataCsLabel(`Create new brand`).click();
	});

	it(`should redirect to manage brand page on clicking back button`, () => {
		cy.getDataCsLabel(`BACK`)
			.click()
			.url()
			.should('match', /manage-brands/i);
	});

	it(`should upload a file for creating a brand`, () => {
		cy.intercept(`PUT`, Cypress.env(`uploadUrl`), req => req.reply({body: {size: 0, type: 'text/xml'}}));
		cy.FileUpload(`#logo`, `../fixtures/files/pictures/download.png`)
			.get(`.uploaded-brand > figure`)
			.find(`span`)
			.should('have.text', 'Uploaded successfully!');
	});
});
