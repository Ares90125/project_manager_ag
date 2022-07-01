/// <reference types="Cypress" />
import {mutation} from 'gql-query-builder';
import {unauthorizedErrorObject} from '../../../fixtures/api-test/helper-objects/response-objects';
const apierror = unauthorizedErrorObject(
	`createListeningCampaign`,
	'Unauthorized',
	'Not Authorized to access createListeningCampaign on type Campaign',
	2,
	3
);
describe(`Security test cases for createListeningCampaign`, () => {
	it(`C214815 : Verify that an error is returned when hitting createListeningCampaign API for the group with the group admin auth token.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const campaignData = this.userDataJson.brandDetails;
		const groupData = this.userDataJson.groupDetails;
		const createListeningCampaign = mutation({
			operation: `createListeningCampaign`,
			variables: {
				input: {
					value: {
						brandId: campaignData.id,
						groupIds: `[${groupData.groupId}]`,
						brandName: campaignData.name,
						campaignName: campaignData.newCampaignName
					},
					required: true,
					type: 'CreateListeningCampaignInput'
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
			body: createListeningCampaign
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});
	it(`C214816 : Verify that an error is returned when hitting createListeningCampaign API with brandAdmin auth token in request header.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const campaignData = this.userDataJson.brandDetails;
		const groupData = this.userDataJson.groupDetails;
		const createListeningCampaign = mutation({
			operation: `createListeningCampaign`,
			variables: {
				input: {
					value: {
						brandId: campaignData.id,
						groupIds: `[${groupData.groupId}]`,
						brandName: campaignData.name,
						campaignName: campaignData.newCampaignName
					},
					required: true,
					type: 'CreateListeningCampaignInput'
				}
			},
			fields: [`brandName`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.brandAdminToken
			},
			body: createListeningCampaign
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});
});
