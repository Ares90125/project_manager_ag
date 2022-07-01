/// <reference types="Cypress" />
import {query} from 'gql-query-builder';
import {unauthorizedErrorObject} from '../../../fixtures/api-test/helper-objects/response-objects';
let apierror = unauthorizedErrorObject(
	`listGroupKeywordMetricsByGroupId`,
	'Unauthorized',
	'Not Authorized to access listGroupKeywordMetricsByGroupId on type GroupKeywordMetricsConnection',
	1,
	75
);
describe(`Security test cases for ListGroupKeywordMetricsByGroupID`, () => {
	it(`C42122 : Verify that  an error is returned when using an incorrect auth token without group permission for fetching listGroupKeywordMetricsByGroupId`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const listGroupKeywordMetricsByGroupId = query({
			operation: `listGroupKeywordMetricsByGroupId`,
			variables: {
				groupId: {value: this.userDataJson.groupDetails.groupId, required: true},
				tickOfEndHour: {value: 1604016000, required: true},
				tickOfStartHour: {value: 1603411200, required: true}
			},
			fields: [`items{top10Keywords}`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupToken
			},
			body: listGroupKeywordMetricsByGroupId
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it.skip(`C42122 : Verify that  an error is not returned when using brand admin auth token for fetching listGroupKeywordMetricsByGroupId`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const listGroupKeywordMetricsByGroupId = query({
			operation: `listGroupKeywordMetricsByGroupId`,
			variables: {
				groupId: {value: this.userDataJson.groupDetails.groupId, required: true},
				tickOfEndHour: {value: 1604016000, required: true},
				tickOfStartHour: {value: 1603411200, required: true}
			},
			fields: [`items{top10Keywords,groupId,categories}`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.brandAdminToken
			},
			body: listGroupKeywordMetricsByGroupId
		}).then(({body}) => {
			const {
				data: {
					listGroupKeywordMetricsByGroupId: {items}
				}
			} = body;

			expect(items.length).to.be.greaterThan(0);
			items.forEach(data => {
				expect(data.groupId).to.be.equal(this.userDataJson.groupDetails.groupId);
				expect(data.top10Keywords).to.be.not.null;
				expect(data.categories).to.be.not.null;
			});
		});
	});

	it.skip(`C42122 : Verify that data is returned for fetching listGroupKeywordMetricsByGroupId with all required variables.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);

		const listGroupKeywordMetricsByGroupId = query({
			operation: `listGroupKeywordMetricsByGroupId`,
			variables: {
				groupId: {value: this.userDataJson.groupDetails.groupId, required: true},
				tickOfEndHour: {value: 1604016000, required: true},
				tickOfStartHour: {value: 1603411200, required: true}
			},
			fields: [`items{top10Keywords,groupId,categories}`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: listGroupKeywordMetricsByGroupId
		}).then(({body}) => {
			const {
				data: {
					listGroupKeywordMetricsByGroupId: {items}
				}
			} = body;

			expect(items.length).to.be.greaterThan(0);
			items.forEach(data => {
				expect(data.groupId).to.be.equal(this.userDataJson.groupDetails.groupId);
				expect(data.top10Keywords).to.be.not.null;
				expect(data.categories).to.be.not.null;
			});
		});
	});

	it(`C42122 : Verify that data is not returned for fetching listGroupKeywordMetricsByGroupId without all required variables.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const listGroupKeywordMetricsByGroupId = query({
			operation: `listGroupKeywordMetricsByGroupId`,
			variables: {
				tickOfEndHour: {value: 1604016000, required: true},
				tickOfStartHour: {value: 1603411200, required: true}
			},
			fields: [`items{top10Keywords,groupId,categories}`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: listGroupKeywordMetricsByGroupId
		}).then(({body}) => {
			const {
				errors: [{message}]
			} = body;

			expect(message).to.be.equal(
				`Validation error of type MissingFieldArgument: Missing field argument groupId @ 'listGroupKeywordMetricsByGroupId'`
			);
		});
	});
	it(`C42122 : Verify that data is not returned for fetching listGroupKeywordMetricsByGroupId with invalid required variables.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const listGroupKeywordMetricsByGroupId = query({
			operation: `listGroupKeywordMetricsByGroupId`,
			variables: {
				groupId: {value: 'invalid', required: true},
				tickOfEndHour: {value: 1604016000, required: true},
				tickOfStartHour: {value: 1603411200, required: true}
			},
			fields: [`items{top10Keywords,groupId,categories}`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: listGroupKeywordMetricsByGroupId
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});
});
