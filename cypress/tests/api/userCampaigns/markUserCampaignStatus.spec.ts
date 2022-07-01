/// <reference types="Cypress" />
import {mutation} from 'gql-query-builder';
import {unauthorizedErrorObject} from '../../../fixtures/api-test/helper-objects/response-objects';

let apierror = unauthorizedErrorObject(
	`markUserCampaignStatus`,
	'Unauthorized',
	'Not Authorized to access markUserCampaignStatus on type UserCampaign',
	2,
	3
);
describe(`Security Test cases for markUserCampaignStatus`, () => {
	it(`C179953 : Verify that an error is returned when hitting markUserCampaignStatus API for the group with the authtoken of user that is not an admin`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const markUserCampaignStatus = mutation({
			operation: `markUserCampaignStatus`,
			variables: {
				campaignId: {
					value: this.userDataJson.userDetails.userId,
					required: true
				}
			},
			fields: [`status`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupToken
			},
			body: markUserCampaignStatus
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});
});
