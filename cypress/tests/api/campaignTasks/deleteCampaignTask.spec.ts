/// <reference types="Cypress" />
import {mutation} from 'gql-query-builder';
import {unauthorizedErrorObject} from '../../../fixtures/api-test/helper-objects/response-objects';

const apierror = unauthorizedErrorObject(
	`deleteCampaignTask`,
	'Unauthorized',
	'Not Authorized to access deleteCampaignTask on type CampaignTask',
	2,
	3
);
describe(`Security test cases for deleteCampaignTask`, () => {
	it(`C215199 : Verify that an error is returned when hitting deleteCampaignTask API for the group with the group admin auth token.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const deleteCampaignTask = mutation({
			operation: `deleteCampaignTask`,
			variables: {
				taskId: {value: this.userDataJson.campaignDetails.taskId, required: true},
				campaignId: {value: this.userDataJson.campaignDetails.campaignId, required: true}
			},
			fields: [`campaignId`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: deleteCampaignTask
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});
});
