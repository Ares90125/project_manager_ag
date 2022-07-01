/// <reference types="Cypress" />
import {mutation} from 'gql-query-builder';
import {unauthorizedErrorObject} from '../../../fixtures/api-test/helper-objects/response-objects';

const apierror = unauthorizedErrorObject(
	`updateCampaignPosts`,
	'Unauthorized',
	'Not Authorized to access updateCampaignPosts on type Mutation',
	2,
	3
);
describe(`API test cases for createCampaignPost`, () => {
	it(`C214815 : Verify that an error is returned when hitting createCMCCampaignGroups API with the cs admin auth token.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const data = this.userDataJson.createCMCCampaignGroups;
		const updateCampaignPosts = mutation({
			operation: `updateCampaignPosts`,
			variables: {
				input: {
					value: [
						{
							campaignId: data.campaignId,
							sourceId: '839666556492043_1213110529147642',
							groupId: 'c86ebcbe-24f7-4822-9b26-ce784fb3bb6c',
							groupName: 'BD_Test_ConvosightQA_Activity',
							fbPermlink: 'https://www.facebook.com/groups/839666556492043/permalink/1213110529147642/'
						}
					],
					required: true,
					type: '[UpdateCampaignPostInput]'
				}
			},
			fields: [`campaignId,groupId,groupName,id`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.csAdminToken
			},
			body: updateCampaignPosts
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C214815 : Verify that an error is returned when hitting createCMCCampaignPost API with the brand admin auth token.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const data = this.userDataJson.createCMCCampaignGroups;
		const updateCampaignPosts = mutation({
			operation: `updateCampaignPosts`,
			variables: {
				input: {
					value: [
						{
							campaignId: data.campaignId,
							sourceId: '839666556492043_1213110529147642',
							groupId: 'c86ebcbe-24f7-4822-9b26-ce784fb3bb6c',
							groupName: 'BD_Test_ConvosightQA_Activity',
							fbPermlink: 'https://www.facebook.com/groups/839666556492043/permalink/1213110529147642/'
						}
					],
					required: true,
					type: '[UpdateCampaignPostInput]'
				}
			},
			fields: [`campaignId,groupId,groupName,id`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.brandAdminToken
			},
			body: updateCampaignPosts
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});
});
