/// <reference types="Cypress" />
import {query} from 'gql-query-builder';
import {unauthorizedErrorObject} from '../../../fixtures/api-test/helper-objects/response-objects';

describe(`Security Test cases for getGroup`, () => {
	it(`C179939 : Verify that an error is returned when hitting getGroup API for the group with the auth token of user that is not an admin`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getGroup = query({
			operation: `getGroup`,
			variables: {
				id: {value: this.userDataJson.groupDetails.groupId, required: true, type: 'ID'}
			},
			fields: [`__typename`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupToken
			},
			body: getGroup
		})
			.its(`body`)
			.should(
				`deep.eq`,
				unauthorizedErrorObject(`getGroup`, 'Unauthorized', 'Not Authorized to access getGroup on type Query', 1, 20)
			);
	});
});
