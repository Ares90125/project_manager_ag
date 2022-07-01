/// <reference types="Cypress" />
import {query} from 'gql-query-builder';
import {unauthorizedErrorObject} from '../../../fixtures/api-test/helper-objects/response-objects';

let apierror = unauthorizedErrorObject(
	`getGroupModeratorsByGroupId`,
	'Unauthorized',
	'Not Authorized to access getGroupModeratorsByGroupId on type GroupMembersConnection',
	1,
	29
);
describe(`Security test cases for GetGroupModeratorsByGroupId`, () => {
	it(`C42107 :Verify that data is not returned with groupToken for fetching group moderators.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getGroupModeratorsByGroupId = query({
			operation: `getGroupModeratorsByGroupId`,
			variables: {
				groupId: {value: this.userDataJson.groupDetails.groupId, required: true}
			},
			fields: [`items{groupId}`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupToken
			},
			body: getGroupModeratorsByGroupId
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});
	it(`C42123 :  Verify that data is not returned with moderatorToken for fetching group moderators.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getGroupModeratorsByGroupId = query({
			operation: `getGroupModeratorsByGroupId`,
			variables: {
				groupId: {value: this.userDataJson.groupDetails.groupId, required: true}
			},
			fields: [`items{groupId}`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.moderatorToken
			},
			body: getGroupModeratorsByGroupId
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C42123 :  Verify that data is not returned with csAdminToken for fetching group moderators.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getGroupModeratorsByGroupId = query({
			operation: `getGroupModeratorsByGroupId`,
			variables: {
				groupId: {value: this.userDataJson.groupDetails.groupId, required: true}
			},
			fields: [`items{groupId}`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.csAdminToken
			},
			body: getGroupModeratorsByGroupId
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C42123 :  Verify that data is not returned with brandAdminToken for fetching group moderators.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getGroupModeratorsByGroupId = query({
			operation: `getGroupModeratorsByGroupId`,
			variables: {
				groupId: {value: this.userDataJson.groupDetails.groupId, required: true}
			},
			fields: [`items{groupId}`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.brandAdminToken
			},
			body: getGroupModeratorsByGroupId
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C42123 : Verify that data is returned with group admin token for fetching group moderators.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getGroupModeratorsByGroupId = query({
			operation: `getGroupModeratorsByGroupId`,
			variables: {
				groupId: {value: this.userDataJson.addModeratorDetails.moderatorGroupId, required: true}
			},
			fields: [`items{groupId,role,userId}`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: getGroupModeratorsByGroupId
		}).then(({body}) => {
			const {
				data: {
					getGroupModeratorsByGroupId: {items}
				}
			} = body;

			expect(items.length).to.be.greaterThan(0);
			items.forEach(data => {
				expect(data.groupId).to.be.equal(this.userDataJson.addModeratorDetails.moderatorGroupId);
				expect(data.role).to.be.not.null;
				expect(data.userId).to.be.not.null;
			});
		});
	});

	it(`C42123 :  Verify that data is not returned with groupAdminToken for fetching group moderators without required variables.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getGroupModeratorsByGroupId = query({
			operation: `getGroupModeratorsByGroupId`,
			variables: {},
			fields: [`items{groupId}`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: getGroupModeratorsByGroupId
		}).then(({body}) => {
			const {
				errors: [{message}]
			} = body;

			expect(message).to.be.equal(
				`Validation error of type MissingFieldArgument: Missing field argument groupId @ 'getGroupModeratorsByGroupId'`
			);
		});
	});

	it(`C42123 :  Verify that data is not returned with groupAdminToken for fetching group moderators with invalid required variables.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getGroupModeratorsByGroupId = query({
			operation: `getGroupModeratorsByGroupId`,
			variables: {groupId: {value: 'invalid', required: true}},
			fields: [`items{groupId}`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: getGroupModeratorsByGroupId
		}).then(({body}) => {
			const {
				data: {getGroupModeratorsByGroupId},
				errors: [{errorType, message}]
			} = body;
			expect(getGroupModeratorsByGroupId).to.be.null;
			expect(message).to.be.equal(
				`Not Authorized to access getGroupModeratorsByGroupId on type GroupMembersConnection`
			);
			expect(errorType).to.be.equal(`Unauthorized`);
		});
	});
});
