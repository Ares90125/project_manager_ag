/// <reference types="Cypress" />
import {mutation} from 'gql-query-builder';
import utc from 'dayjs/plugin/utc';
import dayjs from 'dayjs';
import {unauthorizedErrorObject} from '../../../fixtures/api-test/helper-objects/response-objects';

const apierror = unauthorizedErrorObject(
	`updateListeningCampaignDetails`,
	'Unauthorized',
	'Not Authorized to access updateListeningCampaignDetails on type Campaign',
	2,
	3
);
describe(`Security test cases for updateListeningCampaignDetails`, () => {
	it(`C215197 : Verify that an error is returned when hitting updateListeningCampaignDetails API for the group with the group admin auth token.`, function () {
		const postTime = dayjs.extend(utc).unix();
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const brandData = this.userDataJson.brandDetails;
		const updateListeningCampaignDetails = mutation({
			operation: `updateListeningCampaignDetails`,
			variables: {
				input: {
					value: {
						brandId: brandData.id,
						campaignName: brandData.newCampaignName,
						campaignId: this.userDataJson.campaignDetails.campaignId,
						groupIds: `[${this.userDataJson.groupDetails.groupId}]`,
						brandName: brandData.name
					},
					required: true,
					type: 'UpdateListeningCampaignInput'
				}
			},
			fields: [`brandName`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: updateListeningCampaignDetails
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});
});
