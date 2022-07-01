/// <reference types="Cypress" />
import {query} from 'gql-query-builder';
import dayjs from 'dayjs';
import {unauthorizedErrorObject} from '../../../fixtures/api-test/helper-objects/response-objects';

let apierror = unauthorizedErrorObject(
	`listInsightViewMetricsByInsightViewId`,
	'Unauthorized',
	'Not Authorized to access listInsightViewMetricsByInsightViewId on type InsightViewMetricsInternalConnection',
	1,
	100
);
describe(`Security test cases for listInsightViewMetricsByInsightViewId`, () => {
	it(`C179944 :Verify that an error is returned when hitting listInsightViewMetricsByInsightViewId API for the group with the authtoken of user that is not an admin`, function () {
		const tickOfHour = dayjs().unix();
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const listInsightViewMetricsByInsightViewId = query({
			operation: `listInsightViewMetricsByInsightViewId`,
			variables: {
				insightViewId: {
					value: this.userDataJson.listInsightViewMetricsByInsightViewId.insightViewId,
					required: true
				},
				tickOfEndHour: {value: tickOfHour, required: true},
				tickOfStartHour: {value: tickOfHour, required: true},
				brandId: {value: this.userDataJson.brandDetails.id, required: true}
			},
			fields: [`items{id}`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupToken
			},
			body: listInsightViewMetricsByInsightViewId
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C179944 :Verify that an error is returned when hitting listInsightViewMetricsByInsightViewId API with invalid brand admin auth token.`, function () {
		const tickOfHour = dayjs().unix();
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const listInsightViewMetricsByInsightViewId = query({
			operation: `listInsightViewMetricsByInsightViewId`,
			variables: {
				insightViewId: {
					value: this.userDataJson.listInsightViewMetricsByInsightViewId.insightViewId,
					required: true
				},
				tickOfEndHour: {value: tickOfHour, required: true},
				tickOfStartHour: {value: tickOfHour, required: true},
				brandId: {value: this.userDataJson.brandDetails.id, required: true}
			},
			fields: [`items{id}`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.brandAdminToken
			},
			body: listInsightViewMetricsByInsightViewId
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C179944 :Verify that an error is  returned when hitting listInsightViewMetricsByInsightViewId API without required variables`, function () {
		const tickOfHour = dayjs().unix();
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const listInsightViewMetricsByInsightViewId = query({
			operation: `listInsightViewMetricsByInsightViewId`,
			variables: {
				tickOfEndHour: {value: tickOfHour, required: true},
				tickOfStartHour: {value: tickOfHour, required: true}
			},
			fields: [`items{id}`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.brandAdminToken
			},
			body: listInsightViewMetricsByInsightViewId
		}).then(({body}) => {
			const {
				errors: [{message}]
			} = body;
			expect(message).to.be.equal(
				`Validation error of type MissingFieldArgument: Missing field argument brandId @ 'listInsightViewMetricsByInsightViewId'`
			);
		});
	});

	it(`C179944 :Verify that an error is  returned when hitting listInsightViewMetricsByInsightViewId API with invalid required variables`, () => {
		const tickOfHour = dayjs().unix();

		cy.get(`@tokensJson`).then(({brandAdminToken}: any) => {
			const appSyncUrl = Cypress.env(`developAppSyncUrl`);
			const listInsightViewMetricsByInsightViewId = query({
				operation: `listInsightViewMetricsByInsightViewId`,
				variables: {
					insightViewId: {value: 'invalid', required: true},
					tickOfEndHour: {value: tickOfHour, required: true},
					tickOfStartHour: {value: tickOfHour, required: true},
					brandId: {value: 'invalid', required: true}
				},
				fields: [`items{id}`]
			});

			// @ts-ignore
			cy.api({
				method: `POST`,
				url: appSyncUrl,
				headers: {
					authorization: brandAdminToken
				},
				body: listInsightViewMetricsByInsightViewId
			})
				.its(`body`)
				.should(`deep.eq`, apierror);
		});
	});
});
