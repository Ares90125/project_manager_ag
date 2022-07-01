/// <reference types="Cypress" />
import {query} from 'gql-query-builder';

describe(`API test cases for communityCitiesByCountriesOrRegions`, () => {
	it(`C214817 : Verify that an data is returned when hitting communityCitiesByCountriesOrRegions API with cs admin auth token`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const communityCitiesByCountriesOrRegions = query({
			operation: `communityCitiesByCountriesOrRegions`,
			variables: {
				countries: {value: ['AF', 'IN', 'US'], type: `[String]`}
			}
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.csAdminToken
			},
			body: communityCitiesByCountriesOrRegions
		}).then(({body}) => {
			const {
				data: {communityCitiesByCountriesOrRegions}
			} = body;

			expect(communityCitiesByCountriesOrRegions).to.not.be.null;
			expect(communityCitiesByCountriesOrRegions).to.not.be.empty;
		});
	});
});
