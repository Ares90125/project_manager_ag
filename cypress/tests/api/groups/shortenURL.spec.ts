/// <reference types="Cypress" />
import {mutation} from 'gql-query-builder';

describe(`API Test cases for shorten URL`, () => {
	it(`C179943 : Verify that shorten url is provided by the mutation`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const shortenUrl = mutation({
			operation: `shortenUrl`,
			variables: {
				url: {
					value: 'https://develop.convosight.com/app/campaign-report/report-view/ea2c44bc-4b3c-47ae-94b4-8430df58d09c'
				}
			}
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: shortenUrl
		}).then(({body}) => {
			const {
				data: {shortenUrl}
			} = body;
			expect(shortenUrl).to.not.be.null;
			expect(shortenUrl).to.be.equal(`https://cnvo.site/2VKWHU3`);
		});
	});
});
