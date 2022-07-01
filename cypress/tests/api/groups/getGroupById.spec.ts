/// <reference types="Cypress" />
import {query} from 'gql-query-builder';
import {unauthorizedErrorObject} from '../../../fixtures/api-test/helper-objects/response-objects';
describe(`Security Test cases for getGroupById`, () => {
	it(`C179940 : Verify that an error is returned when hitting getGroupById API for the group with the authtoken of user that is not an admin`, function () {
		//
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getGroupById = query({
			operation: `getGroupById`,
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
			body: getGroupById
		})
			.its(`body`)
			.should(
				`deep.eq`,
				unauthorizedErrorObject(
					`getGroupById`,
					'Unauthorized',
					'Not Authorized to access getGroupById on type Groups',
					1,
					20
				)
			);
	});

	it.skip(`C179940 : Verify that data is returned for fetching getGroupById with required variables.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getGroupById = query({
			operation: `getGroupById`,
			variables: {
				id: {value: this.userDataJson.groupDetails.groupId, required: true, type: 'ID'}
			},
			fields: [`memberCount,metricsAvailableSinceUTC,name,privacy,role`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: getGroupById
		}).then(({body}) => {
			const {
				data: {
					getGroupById: {memberCount, metericsAvailableSinceUTC, name, privacy, role}
				}
			} = body;

			expect(memberCount).to.be.within(0, 10000000);
			expect(metericsAvailableSinceUTC).to.be.not.null;
			expect(name).to.be.equal(this.userDataJson.conversationDetails.conversationGroupName);
			expect(privacy).to.be.not.null;
			expect(role).to.be.not.null;
		});
	});

	it(`C179940 : Verify that data is not returned for fetching getGroupById without required variables.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getGroupById = query({
			operation: `getGroupById`,
			variables: {},
			fields: [`memberCount,metricsAvailableSinceUTC,name,privacy,role`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: getGroupById
		}).then(({body}) => {
			const {
				errors: [{message}]
			} = body;
			expect(message).to.be.equal(
				`Validation error of type MissingFieldArgument: Missing field argument id @ 'getGroupById'`
			);
		});
	});

	it(`C179940 : Verify that data is not returned for fetching getGroupById with invalid required variables.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getGroupById = query({
			operation: `getGroupById`,
			variables: {id: {value: 'invalid', required: true, type: 'ID'}},
			fields: [`memberCount,metricsAvailableSinceUTC,name,privacy,role`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: getGroupById
		})
			.its(`body`)
			.should(
				`deep.eq`,
				unauthorizedErrorObject(
					`getGroupById`,
					'Unauthorized',
					'Not Authorized to access getGroupById on type Groups',
					1,
					20
				)
			);
	});
});
