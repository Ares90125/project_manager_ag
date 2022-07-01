/// <reference types="Cypress" />
import {query} from 'gql-query-builder';

describe(`Security test cases for listKeywords`, () => {
	it(`C179944 :Verify that an error is returned when hitting listKeywords API for the group with the authtoken of user that is not an admin`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const listKeywords = query({
			operation: `listKeywords`,
			variables: {},
			fields: [`items{category}`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupToken
			},
			body: listKeywords
		}).then(({body}) => {
			const {
				data: {
					listKeywords: {items}
				}
			} = body;

			expect(items.length).to.be.greaterThan(0);
			items.forEach(data => expect(data.category).to.be.not.null);
		});
	});
});
