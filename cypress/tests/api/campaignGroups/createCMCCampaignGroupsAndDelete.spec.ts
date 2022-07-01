/// <reference types="Cypress" />
import {mutation} from 'gql-query-builder';
import {
	unauthorizedErrorObject,
	withoutValidParameterObject
} from '../../../fixtures/api-test/helper-objects/response-objects';
const apierror = unauthorizedErrorObject(
	`createCMCampaignGroups`,
	'Unauthorized',
	`Not Authorized to access createCMCampaignGroups on type CampaignGroup`,
	2,
	3
);
describe(`API test cases for createCMCCampaignGroups`, () => {
	it(`C214815 : Verify that an error is returned when hitting createCMCCampaignGroups API with the group admin auth token.`, function () {
		const data = this.userDataJson.createCMCCampaignGroups;
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const createCMCampaignGroups = mutation({
			operation: `createCMCampaignGroups`,
			variables: {
				input: {
					value: {
						businessCategory: data.businessCategory,
						campaignId: data.campaignId,
						groupId: data.groupId,
						groupInstallationStartedAtUTC: data.groupInstallationStartedAtUTC,
						groupName: data.groupName,
						memberCount: data.memberCount,
						memberEngagementRateUTC: data.memberEngagementRateUTC,
						postEngagementRateUTC: data.postEngagementRateUTC,
						state: data.state,
						weeklyConversationalVolume: data.weeklyConversationalVolume
					},
					required: true,
					type: '[CreateCampaignGroupInput!]'
				}
			},
			fields: [`campaignId,groupId,groupName,id`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: createCMCampaignGroups
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C214815 : Verify that an error is not returned when hitting createCMCCampaignGroups API with the cs admin auth token.`, function () {
		const data = this.userDataJson.createCMCCampaignGroups;
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const createCMCampaignGroups = mutation({
			operation: `createCMCampaignGroups`,
			variables: {
				input: {
					value: {
						businessCategory: data.businessCategory,
						campaignId: data.campaignId,
						groupId: data.groupId,
						groupInstallationStartedAtUTC: data.groupInstallationStartedAtUTC,
						groupName: data.groupName,
						memberCount: data.memberCount,
						memberEngagementRateUTC: data.memberEngagementRateUTC,
						postEngagementRateUTC: data.postEngagementRateUTC,
						state: data.state,
						weeklyConversationalVolume: data.weeklyConversationalVolume
					},
					required: true,
					type: '[CreateCampaignGroupInput!]'
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
			body: createCMCampaignGroups
		}).then(({body}) => {
			const {
				data: {createCMCampaignGroups}
			} = body;

			expect(createCMCampaignGroups.length).to.be.equal(1);
			createCMCampaignGroups.forEach(resData => {
				expect(resData.campaignId).to.be.equal(data.campaignId);
				expect(resData.groupId).to.be.equal(data.groupId);
				expect(resData.groupName).to.be.equal(data.groupName);
				expect(resData.id).to.not.be.null;
				expect(resData.id).to.not.be.empty;
			});
		});

		const deleteCMCampaignGroup = mutation({
			operation: `deleteCMCampaignGroup`,
			variables: {
				campaignId: {value: data.campaignId, required: true},
				groupId: {value: data.groupId, required: true}
			}
		});
		//@ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.csAdminToken
			},
			body: deleteCMCampaignGroup
		})
			.its(`body.data.deleteCMCampaignGroup`)
			.should(`eq`, `Success`);
	});
});
