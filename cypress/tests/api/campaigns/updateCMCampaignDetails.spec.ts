/// <reference types="Cypress" />
import {mutation} from 'gql-query-builder';
import utc from 'dayjs/plugin/utc';
import dayjs from 'dayjs';
import {unauthorizedErrorObject} from '../../../fixtures/api-test/helper-objects/response-objects';

const apierror = unauthorizedErrorObject(
	`updateCMCampaignDetails`,
	'Unauthorized',
	'Not Authorized to access updateCMCampaignDetails on type Campaign',
	2,
	3
);
describe(`Security test cases for updateCMCampaignDetails`, () => {
	it(`C215004 : Verify that an error is returned when hitting updateCMCampaignDetails API for the group with the group admin auth token.`, function () {
		const postTime = dayjs.extend(utc).unix();
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const campaignData = this.userDataJson.campaignDetails;
		const brandData = this.userDataJson.brandDetails;
		const updateCMCampaignDetails = mutation({
			operation: `updateCMCampaignDetails`,
			variables: {
				input: {
					value: {
						brandId: brandData.id,
						campaignName: brandData.newCampaignName,
						campaignId: campaignData.campaignId
					},
					required: true,
					type: 'UpdateCMCampaignInput'
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
			body: updateCMCampaignDetails
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});
});
