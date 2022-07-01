/// <reference types="Cypress" />
import {mutation} from 'gql-query-builder';
import {unauthorizedErrorObject} from '../../../fixtures/api-test/helper-objects/response-objects';

const apierror = unauthorizedErrorObject(
	`createCampaignPosts`,
	'Unauthorized',
	'Not Authorized to access createCampaignPosts on type Mutation',
	2,
	3
);
describe(`API test cases for createCampaignPost`, () => {
	it(`C214815 : Verify that an error is not returned when hitting createCMCCampaignPost API with the group admin auth token.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const data = this.userDataJson.createCMCCampaignGroups;
		const createCampaignPosts = mutation({
			operation: `createCampaignPosts`,
			variables: {
				input: {
					value: {
						campaignId: '2628a8a3-3aec-42c7-af1f-327fcce57c2e',
						sourceId: '839666556492043_1250945255364169',
						groupId: data.groupId,
						fbPermlink: 'https://www.facebook.com/groups/839666556492043/permalink/1250945255364169',
						postRawText: 'Test Post',
						postCreatedByName: 'Ravi Kiran'
					},
					required: true,
					type: '[CreateCampaignPostInput!]'
				}
			},
			fields: [
				`fbPermlink
						postCreatedByName
						postRawText
						groupId
						campaignId`
			]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: createCampaignPosts
		}).then(({body}) => {
			const {
				data: {createCampaignPosts}
			} = body;
			expect(createCampaignPosts.length).to.be.equal(1);
			createCampaignPosts.forEach(campaignData => {
				expect(campaignData.campaignId).to.be.equal('2628a8a3-3aec-42c7-af1f-327fcce57c2e');
				expect(campaignData.groupId).to.be.equal(data.groupId);
				expect(campaignData.postRawText).to.be.equal('Test Post');
				expect(campaignData.postCreatedByName).to.be.equal(`Ravi Kiran`);
			});
		});
	});

	it(`C214815 : Verify that an error is returned when hitting createCMCCampaignGroups API with the cs admin auth token.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const data = this.userDataJson.createCMCCampaignGroups;
		const createCampaignPosts = mutation({
			operation: `createCampaignPosts`,
			variables: {
				input: {
					value: {
						campaignId: data.campaignId,
						sourceId: '259751487419009_4155860581141394',
						groupId: 'c86ebcbe-24f7-4822-9b26-ce784fb3bb6c',
						groupName: 'Hello FB API 99'
					},
					required: true,
					type: '[CreateCampaignPostInput!]'
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
			body: createCampaignPosts
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C214815 : Verify that an error is returned when hitting createCMCCampaignPost API with the brand admin auth token.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const data = this.userDataJson.createCMCCampaignGroups;
		const createCampaignPosts = mutation({
			operation: `createCampaignPosts`,
			variables: {
				input: {
					value: {
						campaignId: data.campaignId,
						sourceId: '259751487419009_4155860581141394',
						groupId: 'c86ebcbe-24f7-4822-9b26-ce784fb3bb6c',
						groupName: 'Hello FB API 99'
					},
					required: true,
					type: '[CreateCampaignPostInput!]'
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
			body: createCampaignPosts
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});
});
