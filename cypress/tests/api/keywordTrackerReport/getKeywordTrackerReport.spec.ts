/// <reference types="Cypress" />
import {query} from 'gql-query-builder';
import {unauthorizedErrorObject} from '../../../fixtures/api-test/helper-objects/response-objects';
let apierror = unauthorizedErrorObject(
	`getKeywordTrackerReport`,
	'Unauthorized',
	'Not Authorized to access getKeywordTrackerReport on type KeywordTrackerReport',
	1,
	29
);
describe(`Security Test cases for getKeywordTrackerReport`, () => {
	it(`C42114 : Verify that query getKeywordTrackerReport throw an error when using an incorrect auth token without owner permission for fetching Keyword tracker report`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getKeywordTrackerReport = query({
			operation: `getKeywordTrackerReport`,
			variables: {
				ownerId: {value: this.userDataJson.groupDetails.groupId, required: true}
			},
			fields: [`name`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupToken
			},
			body: getKeywordTrackerReport
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C42114 : Verify that query getKeywordTrackerReport throw returns data with valid required variables.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getKeywordTrackerReport1 = query({
			operation: `getKeywordTrackerReport`,
			variables: {
				ownerId: {value: this.userDataJson.groupDetails.groupId, required: true}
			},
			fields: [
				`name,reportLevel,ownerId,numOfActionRequired,numOfBlockedUser,
					numOfMutedMembers`
			]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: getKeywordTrackerReport1
		}).then(({body}) => {
			const {
				data: {getKeywordTrackerReport}
			} = body;

			expect(getKeywordTrackerReport.length).to.be.greaterThan(0);

			getKeywordTrackerReport.forEach(data => {
				expect(data.ownerId).to.be.equal(this.userDataJson.groupDetails.groupId);
				expect(data.reportLevel).to.be.equal(`Group`);
				expect(data.numOfActionRequired).to.be.within(0, 5000);
				expect(data.numOfBlockedUser).to.be.not.null;
				expect(data.numOfMutedMembers).to.be.not.null;
			});
		});
	});

	it(`C42114 : Verify that query getKeywordTrackerReport throw an error without required variables`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getKeywordTrackerReport = query({
			operation: `getKeywordTrackerReport`,
			variables: {},
			fields: [`name`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupToken
			},
			body: getKeywordTrackerReport
		}).then(({body}) => {
			const {
				errors: [{message}]
			} = body;

			expect(message).to.be.equal(
				`Validation error of type MissingFieldArgument: Missing field argument ownerId @ 'getKeywordTrackerReport'`
			);
		});
	});

	it(`C42114 : Verify that query getKeywordTrackerReport throw an error with invalid required variables`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getKeywordTrackerReport = query({
			operation: `getKeywordTrackerReport`,
			variables: {ownerId: {value: 'invalid', required: true}},
			fields: [`name`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupToken
			},
			body: getKeywordTrackerReport
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});
});
