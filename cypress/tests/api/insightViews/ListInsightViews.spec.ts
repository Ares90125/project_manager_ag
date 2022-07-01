/// <reference types="Cypress" />
import {query} from 'gql-query-builder'; //Clean this part
import {unauthorizedErrorObject} from '../../../fixtures/api-test/helper-objects/response-objects';

let apierror = unauthorizedErrorObject(
	`listInsightViews`,
	'Unauthorized',
	'Not Authorized to access listInsightViews on type InsightViewsConnection',
	1,
	31
);
describe(`Security test cases for ListInsightViews`, () => {
	it(`C179947 : Verify that an error is returned when hitting ListInsightViews API with invalid brand admin auth token in request header`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const listInsightViews = query({
			operation: `listInsightViews`,
			variables: {
				campaignId: {value: this.userDataJson.campaignDetails.campaignId}
			},
			fields: [`items{level}`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.brandAdminToken
			},
			body: listInsightViews
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});
	it(`C179947 : Verify that an error is returned when hitting ListInsightViews API with group admin auth token`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const listInsightViews = query({
			operation: `listInsightViews`,
			variables: {
				campaignId: {value: this.userDataJson.campaignDetails.campaignId}
			},
			fields: [`items{level}`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: listInsightViews
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});
});
