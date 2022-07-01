/// <reference types="Cypress" />
import {query} from 'gql-query-builder';
import {unauthorizedErrorObject} from '../../../fixtures/api-test/helper-objects/response-objects';
const apierror = unauthorizedErrorObject(
	`getCmcReportWC`,
	'Unauthorized',
	'Not Authorized to access getCmcReportWC on type CmcReportWC',
	1,
	32
);
describe(`Security test cases for getCmcReportWC`, () => {
	it(`C215204 : Verify that an error is returned when hitting getCmcReportWC API for the group with the group admin auth token.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getCmcReportWC = query({
			operation: `getCmcReportWC`,
			variables: {
				campaignId: {value: this.userDataJson.campaignDetails.campaignId, required: true}
			},
			fields: [`duringWC`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: getCmcReportWC
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C215203 : Verify that an error is not returned when hitting getCmcReportMetrics API for the group with both cs admin and brand admin token auth token.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		[this.tokensJson.csAdminToken, this.tokensJson.brandAdminToken].forEach(token => {
			const getCmcReportWC = query({
				operation: `getCmcReportWC`,
				variables: {
					campaignId: {value: '02f49a25-3cb7-4caa-9360-d18107a572e2', required: true}
				},
				fields: [`beforeWC,campaignId,createdAtUTC,duringWC,updatedAtUTC`]
			});
			// @ts-ignore
			cy.api({
				method: `POST`,
				url: appSyncUrl,
				headers: {
					authorization: token
				},
				body: getCmcReportWC
			}).then(({body}) => {
				const {
					data: {getCmcReportWC}
				} = body;
				expect(getCmcReportWC.beforeWC).to.be.not.null.and.not.to.be.undefined.and.not.to.be.empty;
				expect(getCmcReportWC.campaignId).to.be.not.null.and.not.to.be.undefined;
				expect(getCmcReportWC.createdAtUTC).to.be.not.null.and.not.to.be.undefined;
				expect(getCmcReportWC.duringWC).to.be.not.null.and.not.to.be.undefined;
				expect(getCmcReportWC.updatedAtUTC).to.be.not.null.and.not.to.be.undefined;
			});
		});
	});
});
