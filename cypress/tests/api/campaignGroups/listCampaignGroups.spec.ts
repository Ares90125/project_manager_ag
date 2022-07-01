/// <reference types="Cypress" />
import {query} from 'gql-query-builder';
import {unauthorizedErrorObject} from '../../../fixtures/api-test/helper-objects/response-objects';

const apierror = unauthorizedErrorObject(
	`listCampaignGroups`,
	'Unauthorized',
	'Not Authorized to access listCampaignGroups on type Query',
	1,
	31
);
describe.skip(`Security test cases for listCampaignGroups`, function () {
	it(`C157465 : Verify that query listCampaignGroups throw an error when using an invalid auth token  for listCampaignGroups API.`, function () {
		const appSyncUrl = 'https://dp37z2f4knen3n7ooxyy4l6zke.appsync-api.us-east-1.amazonaws.com/graphql';
		const data = this.userDataJson.campaignDetails;
		const listCampaignGroups = query({
			operation: `listCampaignGroups`,
			variables: {
				campaignId: {value: data.campaignId}
			},
			fields: [`groupId`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				// @ts-ignore
				authorization: this.tokensJson.groupToken
			},
			body: listCampaignGroups
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C157465 : Verify that query listCampaignGroups throw an error when using brand admin token  for listCampaignGroups API.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const data = this.userDataJson.campaignDetails;
		const listCampaignGroups = query({
			operation: `listCampaignGroups`,
			variables: {
				campaignId: {value: data.campaignId}
			},
			fields: [`items{groupId}`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				// @ts-ignore
				authorization: this.tokensJson.brandAdminToken
			},
			body: listCampaignGroups
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C157465 : Verify that query listCampaignGroups throw an error when using group admin token  for listCampaignGroups API.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const data = this.userDataJson.campaignDetails;
		const listCampaignGroups = query({
			operation: `listCampaignGroups`,
			variables: {
				campaignId: {value: data.campaignId}
			},
			fields: [`items{groupId}`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				// @ts-ignore
				authorization: this.tokensJson.groupAdminToken
			},
			body: listCampaignGroups
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C157465 : Verify that query listCampaignGroups returns campaign data for valid campaign id.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const campaignData = this.userDataJson.campaignDetails;
		const brandData = this.userDataJson.brandDetails;
		const listCampaignGroups1 = query({
			operation: `listCampaignGroups`,
			variables: {
				campaignId: {value: campaignData.validCampaignId},
				brandId: {value: brandData.babyDestinationBrandId}
			},
			fields: [`items{groupId,campaignId}`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				// @ts-ignore
				authorization: this.tokensJson.brandAdminToken
			},
			body: listCampaignGroups1
		}).then(({body}) => {
			const {
				data: {
					listCampaignGroups: {items}
				}
			} = body;

			expect(items.length).to.be.equal(1);
			items.forEach(data => {
				expect(data.campaignId).to.be.equal(campaignData.validCampaignId);
				expect(data.groupId).to.be.equal(campaignData.validCampaignGroupId);
			});
		});
	});

	it(`C157465 : Verify that query listCampaignGroups returns an error when required variables are not provided.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const campaignData = this.userDataJson.campaignDetails;
		const listCampaignGroups1 = query({
			operation: `listCampaignGroups`,
			variables: {
				campaignId: {value: campaignData.validCampaignId}
			},
			fields: [`items{groupId,campaignId}`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				// @ts-ignore
				authorization: this.tokensJson.brandAdminToken
			},
			body: listCampaignGroups1
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});
});
