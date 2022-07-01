/// <reference types="Cypress" />
import {query} from 'gql-query-builder';
import {unauthorizedErrorObject} from '../../../fixtures/api-test/helper-objects/response-objects';

let apierror = unauthorizedErrorObject(
	`getNotifications`,
	'Unauthorized',
	'Not Authorized to access getNotifications on type NotificationsConnection',
	1,
	31
);
describe(`Security Test cases for getNotifications`, () => {
	it(`C179950 : Verify that an error is returned when hitting getNotifications API for the group with the authtoken of user that is not an admin`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getNotifications = query({
			operation: `getNotifications`,
			variables: {
				forUserId: {value: this.userDataJson.postDetails.userId, required: true}
			},
			fields: [`items{inAppTitle}`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupToken
			},
			body: getNotifications
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C179950 : Verify that an error is returned when hitting getNotifications API for the group with the authtoken of user that is not an admin`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getNotifications = query({
			operation: `getNotifications`,
			variables: {
				forUserId: {value: this.userDataJson.postDetails.userId, required: true}
			},
			fields: [`items{inAppTitle}`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.brandAdminToken
			},
			body: getNotifications
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});
});
