/// <reference types="Cypress" />
import {query} from 'gql-query-builder';
describe(`API test cases for createCampaignPost`, () => {
	it(`C214815 : Verify that an error is not returned when hitting getCampaignPost API with the group admin auth token.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getCampaignPosts = query({
			operation: `getCampaignPosts`,
			variables: {
				campaignId: {value: '2628a8a3-3aec-42c7-af1f-327fcce57c2e', required: true}
			},
			fields: [
				`items{fbPermlink,	
						postCreatedByName,
						postRawText,
						groupId,
						campaignId}`
			]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: getCampaignPosts
		}).then(({body}) => {
			const {
				data: {
					getCampaignPosts: {items}
				}
			} = body;
			expect(items.length).to.be.greaterThan(0);
			items.forEach(data => {
				expect(data.campaignId).to.be.not.null;
			});
		});
	});

	it(`C214815 : Verify that an error is not returned when hitting createCMCCampaignGroups API with the cs admin auth token.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getCampaignPosts = query({
			operation: `getCampaignPosts`,
			variables: {
				campaignId: {value: '2628a8a3-3aec-42c7-af1f-327fcce57c2e', required: true}
			},
			fields: [
				`items{fbPermlink,	
						postCreatedByName,
						postRawText,
						groupId,
						campaignId}`
			]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.csAdminToken
			},
			body: getCampaignPosts
		}).then(({body}) => {
			const {
				data: {
					getCampaignPosts: {items}
				}
			} = body;
			expect(items.length).to.be.greaterThan(0);
			items.forEach(data => {
				expect(data.campaignId).to.be.not.null;
			});
		});
	});

	it(`C214815 : Verify that an error is not returned when hitting createCMCCampaignPost API with the brand admin auth token.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getCampaignPosts = query({
			operation: `getCampaignPosts`,
			variables: {
				campaignId: {value: '2628a8a3-3aec-42c7-af1f-327fcce57c2e', required: true}
			},
			fields: [
				`items{fbPermlink,	
						postCreatedByName,
						postRawText,
						groupId,
						campaignId}`
			]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.brandAdminToken
			},
			body: getCampaignPosts
		}).then(({body}) => {
			const {
				data: {
					getCampaignPosts: {items}
				}
			} = body;
			expect(items.length).to.be.greaterThan(0);
			items.forEach(data => {
				expect(data.campaignId).to.be.not.null;
			});
		});
	});
});
