/// <reference types="Cypress" />
import {query} from 'gql-query-builder'; //Clean this part
import {unauthorizedErrorObject} from '../../../fixtures/api-test/helper-objects/response-objects';

let apierror = unauthorizedErrorObject(
	`getGRecommendationByDay`,
	'Unauthorized',
	'Not Authorized to access getGRecommendationByDay on type GRecommendationByDay',
	1,
	29
);
describe(`Security test cases for GetGRecommendationByDay`, () => {
	it(`C42113 : Verify that query getGRecommendationByDay throw an error when using an incorrect auth token without group permission for fetching recommendation by day`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getGRecommendationByDay = query({
			operation: `getGRecommendationByDay`,
			variables: {
				groupId: {value: this.userDataJson.addModeratorDetails.moderatorGroupId, required: true}
			},
			fields: [`groupId`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupToken
			},
			body: getGRecommendationByDay
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C42113 : Verify that query getGRecommendationByDay throw an error when using brand admin token.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getGRecommendationByDay = query({
			operation: `getGRecommendationByDay`,
			variables: {
				groupId: {value: this.userDataJson.addModeratorDetails.moderatorGroupId, required: true}
			},
			fields: [`groupId`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.brandAdminToken
			},
			body: getGRecommendationByDay
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C42113 : Verify that query getGRecommendationByDay throw an error when using cs admin token.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getGRecommendationByDay = query({
			operation: `getGRecommendationByDay`,
			variables: {
				groupId: {value: this.userDataJson.addModeratorDetails.moderatorGroupId, required: true}
			},
			fields: [`groupId`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.csAdminToken
			},
			body: getGRecommendationByDay
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it.only(`C42113 : Verify that data is returned for query getGRecommendationByDay. `, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getGRecommendationByDay = query({
			operation: `getGRecommendationByDay`,
			variables: {
				groupId: {value: '9a0f9a0f-a7e0-41f0-99a0-2934f58efaf2', required: true}
			},
			fields: [
				`updatedAtUTC,
			topics,
			timings,
			optLength,
			numOfYear,
			numOfMonth,
			keywords,
			emotions,
			contentTypes,
			categories`
			]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: getGRecommendationByDay
		}).then(({body}) => {
			const {
				data: {getGRecommendationByDay}
			} = body;

			expect(getGRecommendationByDay.topics).to.not.be.empty.and.not.be.null.and.not.be.undefined.and.not.include(
				`undefined`
			);
			expect(getGRecommendationByDay.timings).to.not.be.empty.and.not.be.null.and.not.be.undefined.and.not.include(
				`undefined`
			);
			expect(getGRecommendationByDay.optLength).to.not.be.empty.and.not.be.null.and.not.be.undefined.and.not.include(
				`undefined`
			);
			expect(getGRecommendationByDay.numOfYear).to.not.be.empty.and.not.be.null.and.not.be.undefined.and.not.include(
				`undefined`
			);
			expect(getGRecommendationByDay.numOfMonth).to.not.be.empty.and.not.be.null.and.not.be.undefined.and.not.include(
				`undefined`
			);
			expect(getGRecommendationByDay.emotions).to.not.be.empty.and.not.be.null.and.not.be.undefined.and.not.include(
				`undefined`
			);
			expect(getGRecommendationByDay.contentTypes).to.not.be.empty.and.not.be.null.and.not.be.undefined.and.not.include(
				`undefined`
			);
			expect(getGRecommendationByDay.categories).to.not.be.empty.and.not.be.null.and.not.be.undefined.and.not.include(
				`undefined`
			);
		});
	});
});
