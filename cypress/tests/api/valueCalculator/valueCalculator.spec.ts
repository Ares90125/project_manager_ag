/// <reference types="Cypress" />
describe(`API Test case for Value Calculator`, () => {
	it(`C42104 : Verify that error is returned for invalid facebook group url`, () => {
		const appSyncUrl = Cypress.env(`valueCalculatorURL`);
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			body: {groupURL: 'https://www.facebook.com/groups/1231'}
		})
			.its(`body`)
			.should(`deep.eq`, {
				error: 'URL is not Valid'
			});
	});
});
