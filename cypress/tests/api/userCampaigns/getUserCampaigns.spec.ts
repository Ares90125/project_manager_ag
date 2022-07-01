/// <reference types="Cypress" />
import {query} from 'gql-query-builder';

describe(`Security Test cases for getUserCampaigns`, () => {
	it(`C179952 : Verify that an error is returned when hitting getUserCampaigns API for the group with the authtoken of user that is not an admin`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getUserCampaigns = query({
			operation: `getUserCampaigns`,
			fields: [`_typename`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.brandAdminToken
			},
			body: getUserCampaigns
		}).then(({body}) => {
			const {
				errors: [{errorType, message}]
			} = body;
			expect(message).to.be.equal(
				`Validation error of type FieldUndefined: Field '_typename' in type 'UserCampaignConnection' is undefined @ 'getUserCampaigns/_typename'`
			);
		});
	});

	it(`C179952 : Verify that an error is returned when hitting getUserCampaigns API for the group with the authtoken of user that is not an admin`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getUserCampaigns = query({
			operation: `getUserCampaigns`,
			fields: [`items{campaignName,campaignId,status}`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: getUserCampaigns
		}).then(({body}) => {
			const {
				data: {
					getUserCampaigns: {items}
				}
			} = body;
			expect(items.length).to.be.greaterThan(0);
			items.forEach(data => {
				expect(data.campaignName).to.be.not.null.and.not.to.be.undefined;
				expect(data.campaignId).to.be.not.null.and.not.to.be.undefined;
				expect(data.status).to.be.not.null.and.not.to.be.undefined;
			});
		});
	});
});
