/// <reference types="Cypress" />
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {mutation} from 'gql-query-builder';
import {unauthorizedErrorObject} from '../../../fixtures/api-test/helper-objects/response-objects';

const apierror = unauthorizedErrorObject(
	`markCampaignStatus`,
	'Unauthorized',
	'Not Authorized to access markCampaignStatus on type Campaign',
	2,
	3
);
describe(`Security test cases for markCampaignStatus`, () => {
	it(`C215003 : Verify that an error is returned when hitting markCampaignStatus API for the group with the group admin auth token.`, function () {
		const postTime = dayjs.extend(utc).unix();
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const campaignData = this.userDataJson.brandDetails;
		const markCampaignStatus = mutation({
			operation: `markCampaignStatus`,
			variables: {
				brandId: {value: campaignData.id, required: true},
				campaignId: {value: campaignData.id, required: true}
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
			body: markCampaignStatus
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});
});
