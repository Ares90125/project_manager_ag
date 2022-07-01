/// <reference types="Cypress" />
import {mutation} from 'gql-query-builder';
import {
	unauthorizedErrorObject,
	staticResponseObject
} from '../../../fixtures/api-test/helper-objects/response-objects';
let apierror = unauthorizedErrorObject(
	`addDateRangeSelectorToBrandInsights`,
	'Unauthorized',
	'Not Authorized to access addDateRangeSelectorToBrandInsights on type InsightViews',
	2,
	3
);
describe(`Security test cases for addDateRangeSelectorToBrandInsights`, () => {
	it(`C179944 : Verify that an error is returned when hitting addDateRangeSelectorToBrandInsights API for the group with the authtoken of user that is not an admin`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const addDateRangeSelectorToBrandInsights = mutation({
			operation: `addDateRangeSelectorToBrandInsights`,
			variables: {
				dateRange: {
					value: {
						startDate: '2020-10-31T18:30:00.000Z',
						endDate: '2020-11-29T18:30:00.000Z'
					},
					required: true,
					type: 'DateRangeInput'
				},
				campaignId: {value: this.userDataJson.campaignDetails.campaignId, required: true},
				viewName: {value: this.userDataJson.campaignDetails.viewName, required: true}
			},
			fields: [`level`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupToken
			},
			body: addDateRangeSelectorToBrandInsights
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C179944 : Verify that an error is returned when hitting addDateRangeSelectorToBrandInsights API for the group with the authtoken of user that is not an admin`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const addDateRangeSelectorToBrandInsights = mutation({
			operation: `addDateRangeSelectorToBrandInsights`,
			variables: {
				dateRange: {
					value: {
						startDate: '2020-10-31T18:30:00.000Z',
						endDate: '2020-11-29T18:30:00.000Z'
					},
					required: true,
					type: 'DateRangeInput'
				},
				campaignId: {value: this.userDataJson.campaignDetails.campaignId, required: true},
				viewName: {value: this.userDataJson.campaignDetails.viewName, required: true}
			},
			fields: [`level`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.brandAdminToken
			},
			body: addDateRangeSelectorToBrandInsights
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C179944 :Verify that an data is returned when hitting addDateRangeSelectorToBrandInsights API with required variables.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const response = staticResponseObject(`addDateRangeSelectorToBrandInsights`, {
			level: null,
			campaignId: '84b7be06-7a34-471f-bf60-60f1ca0f7aa9',
			keywordBrand: null,
			dateRangeSelectors: '[{"endDate":"2020-11-29T18:30:00.000Z","startDate":"2020-10-31T18:30:00.000Z"}]',
			viewName: 'Nutrition'
		});
		const addDateRangeSelectorToBrandInsights = mutation({
			operation: `addDateRangeSelectorToBrandInsights`,
			variables: {
				dateRange: {
					value: {
						startDate: '2020-10-31T18:30:00.000Z',
						endDate: '2020-11-29T18:30:00.000Z'
					},
					required: true,
					type: 'DateRangeInput'
				},
				campaignId: {value: this.userDataJson.campaignDetails.campaignId, required: true},
				viewName: {value: this.userDataJson.campaignDetails.viewName, required: true}
			},
			fields: [`level,campaignId,keywordBrand,dateRangeSelectors,viewName`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.csAdminToken
			},
			body: addDateRangeSelectorToBrandInsights
		}).then(({body}) => {
			const {
				data: {
					addDateRangeSelectorToBrandInsights: {campaignId, viewName}
				}
			} = body;
			expect(campaignId).to.be.equal(campaignId);
			expect(viewName).to.be.equal(`Nutrition`);
		});
	});

	it(`C179944 : Verify that an data is not returned when hitting addDateRangeSelectorToBrandInsights API without required variables.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const addDateRangeSelectorToBrandInsights = mutation({
			operation: `addDateRangeSelectorToBrandInsights`,
			variables: {
				dateRange: {
					value: {
						startDate: '2020-10-31T18:30:00.000Z',
						endDate: '2020-11-29T18:30:00.000Z'
					},
					required: true,
					type: 'DateRangeInput'
				},
				viewName: {value: this.userDataJson.campaignDetails.viewName, required: true}
			},
			fields: [`level`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.brandAdminToken
			},
			body: addDateRangeSelectorToBrandInsights
		}).then(({body}) => {
			const {
				errors: [{message}]
			} = body;

			expect(message).to.be.equal(
				`Validation error of type MissingFieldArgument: Missing field argument campaignId @ 'addDateRangeSelectorToBrandInsights'`
			);
		});
	});
	it(`C179944 : Verify that an data is not returned when hitting addDateRangeSelectorToBrandInsights API with invalid required variables.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const addDateRangeSelectorToBrandInsights = mutation({
			operation: `addDateRangeSelectorToBrandInsights`,
			variables: {
				dateRange: {
					value: {
						startDate: '2020-10-31T18:30:00.000Z',
						endDate: '2020-11-29T18:30:00.000Z'
					},
					required: true,
					type: 'DateRangeInput'
				},
				campaignId: {value: 'invalid', required: true},
				viewName: {value: 'invalid', required: true}
			},
			fields: [`level`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.brandAdminToken
			},
			body: addDateRangeSelectorToBrandInsights
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});
});
