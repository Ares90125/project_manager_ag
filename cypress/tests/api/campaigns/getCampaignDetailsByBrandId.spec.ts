/// <reference types="Cypress" />
import {query} from 'gql-query-builder';
import {unauthorizedErrorObject} from '../../../fixtures/api-test/helper-objects/response-objects';

const apierror = unauthorizedErrorObject(
	`getCampaignsByBrandId`,
	'Unauthorized',
	'Not Authorized to access getCampaignsByBrandId on type CampaignConnection',
	1,
	29
);
describe(`Security test cases for getCampaignsByBrandId`, () => {
	it(`C214817 : Verify that an error is returned when hitting getCampaignsByBrandId API for the group with the group admin auth token.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const brandData = this.userDataJson.brandDetails;
		const getCampaignsByBrandId = query({
			operation: `getCampaignsByBrandId`,
			variables: {
				brandId: {value: brandData.id, required: true}
			},
			fields: [`items{campaignName}`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: getCampaignsByBrandId
		}).then(({body}) => {
			const {
				data: {getCampaignsByBrandId},
				errors: [{errorType, message}]
			} = body;

			expect(getCampaignsByBrandId).to.be.null;
			expect(message).to.be.equal(`Not Authorized to access getCampaignsByBrandId on type CampaignConnection`);
			expect(errorType).to.be.equal(`Unauthorized`);
		});
	});

	it(`C214817 : Verify that an error is not returned when hitting getCampaignsByBrandId API for the group with the brand admin auth token.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const brandData = this.userDataJson.brandDetails;
		const getCampaignsByBrandId = query({
			operation: `getCampaignsByBrandId`,
			variables: {
				brandId: {value: brandData.babyDestinationBrandId, required: true}
			},
			fields: [`items{campaignName}`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.brandAdminToken
			},
			body: getCampaignsByBrandId
		}).then(({body}) => {
			const {
				data: {getCampaignsByBrandId}
			} = body;
			expect(getCampaignsByBrandId.items).to.not.be.null.and.not.be.empty;
			expect(getCampaignsByBrandId.items.length).to.be.greaterThan(0);
		});
	});
});
