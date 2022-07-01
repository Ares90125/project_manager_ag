/// <reference types="Cypress" />
import {mutation} from 'gql-query-builder';
import dayjs from 'dayjs';
import {unauthorizedErrorObject} from '../../../fixtures/api-test/helper-objects/response-objects';

let apierror = unauthorizedErrorObject(
	`updateNotifications`,
	'Unauthorized',
	'Not Authorized to access updateNotifications on type Notifications',
	2,
	3
);
describe(`Security Test cases for updateNotifications`, () => {
	it(`C179951 : Verify that an error is returned when hitting updateNotifications API for the group with the authtoken of user that is not an admin`, function () {
		const postTime = dayjs().unix();
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const updateNotifications = mutation({
			operation: `updateNotifications`,
			variables: {
				input: {
					value: {
						createdAtUTCTick: postTime,
						viewedAtUTC: '2020-11-09T05:46:12.821Z',
						forUserId: this.userDataJson.postDetails.userId
					},
					required: true,
					type: 'UpdateNotificationsInput'
				}
			},
			fields: [`inAppTitle`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupToken
			},
			body: updateNotifications
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});
});
