/// <reference types="Cypress" />
import {query} from 'gql-query-builder';
import {unauthorizedErrorObject} from '../../../fixtures/api-test/helper-objects/response-objects';
const apierror = unauthorizedErrorObject(
	`getUserSelfMonetizationCampaigns`,
	'Unauthorized',
	'Not Authorized to access getUserSelfMonetizationCampaigns on type CampaignConnection',
	1,
	23
);
describe(`API test cases for getUserSelfMonetizationCampaigns`, () => {
	it(`C214815 : Verify that an error is not returned when hitting getUserSelfMonetizationCampaigns API with the group admin auth token.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getUserSelfMonetizationCampaigns = query({
			operation: `getUserSelfMonetizationCampaigns`,
			variables: {
				limit: {value: 100}
			},
			fields: [
				`items{campaignId,	
							campaignName,
							createdAtUTC,
							groupIds,
							customKeywords,
							hashtags,
							isReportAvailable,
							brandKeywords}`
			]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: getUserSelfMonetizationCampaigns
		}).then(({body}) => {
			const {
				data: {
					getUserSelfMonetizationCampaigns: {items}
				}
			} = body;
			expect(items.length).to.be.greaterThan(0);
			items.forEach(data => {
				expect(data.campaignName).to.be.not.null;
				expect(data.campaignName).to.be.not.empty;
				expect(data.campaignId).to.be.not.null;
				expect(data.campaignId).to.be.not.empty;
				expect(data.groupIds).to.be.not.empty;
				expect(data.groupIds).to.be.not.null;
				expect(data.customKeywords).to.be.not.null;
				expect(data.hashtags).to.be.not.null;
			});
		});
	});

	it(`C214815 : Verify that an error is returned when hitting getUserSelfMonetizationCampaigns API with the cs admin auth token.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getUserSelfMonetizationCampaigns = query({
			operation: `getUserSelfMonetizationCampaigns`,
			variables: {
				limit: {value: 100}
			},
			fields: [
				`items{campaignId,	
							campaignName,
							createdAtUTC,
							groupIds,
							customKeywords,
							hashtags,
							isReportAvailable,
							brandKeywords}`
			]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.csAdminToken
			},
			body: getUserSelfMonetizationCampaigns
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C214815 : Verify that an error is returned when hitting getUserSelfMonetizationCampaigns API when user does not have access to report feature.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getUserSelfMonetizationCampaigns = query({
			operation: `getUserSelfMonetizationCampaigns`,
			variables: {
				limit: {value: 100}
			},
			fields: [
				`items{campaignId,	
							campaignName,
							createdAtUTC,
							groupIds,
							customKeywords,
							hashtags,
							isReportAvailable,
							brandKeywords}`
			]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupToken
			},
			body: getUserSelfMonetizationCampaigns
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C214815 : Verify that an error is returned when hitting getUserSelfMonetizationCampaigns API with the brand admin auth token.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getUserSelfMonetizationCampaigns = query({
			operation: `getUserSelfMonetizationCampaigns`,
			variables: {
				limit: {value: 100}
			},
			fields: [
				`items{campaignId,	
							campaignName,
							createdAtUTC,
							groupIds,
							customKeywords,
							hashtags,
							isReportAvailable,
							brandKeywords}`
			]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.brandAdminToken
			},
			body: getUserSelfMonetizationCampaigns
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});
});
