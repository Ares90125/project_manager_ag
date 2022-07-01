/// <reference types="Cypress" />
import {mutation} from 'gql-query-builder';
import {
	unauthorizedErrorObject,
	staticResponseObject
} from '../../../fixtures/api-test/helper-objects/response-objects';
const apierror = unauthorizedErrorObject(
	`createCMCampaign`,
	'Unauthorized',
	'Not Authorized to access createCMCampaign on type Campaign',
	2,
	3
);
describe(`Security test cases for createCMCampaign`, () => {
	it(`C214635 : Verify that an error is returned when hitting createCMCampaign API for the group with the group admin auth token.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const data = this.userDataJson.brandDetails;
		const createCMCampaign = mutation({
			operation: `createCMCampaign`,
			variables: {
				input: {
					value: {
						brandId: data.id,
						brandLogoURL: data.logoUrl,
						brandName: data.name,
						campaignName: data.newCampaignName,
						proposalEmails: `[${data.email}]`,
						status: 'Draft'
					},
					required: true,
					type: 'CreateCMCampaignInput'
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
			body: createCMCampaign
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C214814 : Verify that an error is not returned when hitting createCMCampaign API with brandAdminToken.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const data = this.userDataJson.brandDetails;
		const createCMCampaign = mutation({
			operation: `createCMCampaign`,
			variables: {
				input: {
					value: {
						brandId: data.id,
						brandLogoURL: data.logoUrl,
						brandName: data.name,
						campaignName: data.newCampaignName,
						proposalEmails: `[${data.email}]`,
						status: 'Draft'
					},
					required: true,
					type: 'CreateCMCampaignInput'
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
			body: createCMCampaign
		})
			.its(`body.data.createCMCampaign.brandName`)
			.should(`eq`, 'Abbott');
	});
});
