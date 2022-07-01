/// <reference types="Cypress" />
import {query} from 'gql-query-builder';
import {unauthorizedErrorObject} from '../../../fixtures/api-test/helper-objects/response-objects';

let apierror = unauthorizedErrorObject(
	`getGroupMembersByGroupId`,
	'Unauthorized',
	'Not Authorized to access getGroupMembersByGroupId on type GroupMembersConnection',
	1,
	29
);
describe(`Security test cases for getGroupMembersByGroupId`, () => {
	it(`C179935 : Verify that an error is returned when hitting getGroupMembersByGroupId API for the group with the authtoken of user that is not an admin`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getGroupMembersByGroupId = query({
			operation: `getGroupMembersByGroupId`,
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
			body: getGroupMembersByGroupId
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C179935 : Verify that an error is returned when hitting getGroupMembersByGroupId API for the group with brand Admin auth token.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getGroupMembersByGroupId = query({
			operation: `getGroupMembersByGroupId`,
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
			body: getGroupMembersByGroupId
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C179935 : Verify that data is returned when hitting getGroupMembersByGroupId API with CS Admin auth token`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getGroupMembersByGroupId = query({
			operation: `getGroupMembersByGroupId`,
			variables: {
				groupId: {value: this.userDataJson.groupDetails.groupId, required: true}
			},
			fields: [`items{groupId,role,userId}`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.csAdminToken
			},
			body: getGroupMembersByGroupId
		}).then(({body}) => {
			const {
				data: {
					getGroupMembersByGroupId: {items}
				}
			} = body;

			expect(items.length).to.be.greaterThan(0);
			items.forEach(data => {
				expect(data.groupId).to.be.equal(this.userDataJson.groupDetails.groupId);
				expect(data.role).to.be.not.null;
				expect(data.userId).to.be.not.null;
			});
		});
	});

	it(`C179935 : Verify that data is returned when hitting getGroupMembersByGroupId API with group admin auth token`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getGroupMembersByGroupId = query({
			operation: `getGroupMembersByGroupId`,
			variables: {
				groupId: {value: this.userDataJson.groupDetails.groupId, required: true}
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
			body: getGroupMembersByGroupId
		}).then(({body}) => {
			const {
				data: {
					getGroupMembersByGroupId: {items}
				}
			} = body;

			expect(items.length).to.be.greaterThan(0);
			items.forEach(data => {
				expect(data.groupId).to.be.equal(this.userDataJson.groupDetails.groupId);
				expect(data.role).to.be.not.null;
				expect(data.userId).to.be.not.null;
			});
		});
	});

	it(`C179935 : Verify that data is not returned when hitting getGroupMembersByGroupId API with group admin auth token without required variable`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getGroupMembersByGroupId = query({
			operation: `getGroupMembersByGroupId`,
			variables: {},
			fields: [`items{groupId,role,userId}`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: getGroupMembersByGroupId
		}).then(({body}) => {
			const {
				errors: [{message}]
			} = body;

			expect(message).to.be.equal(
				`Validation error of type MissingFieldArgument: Missing field argument groupId @ 'getGroupMembersByGroupId'`
			);
		});
	});

	it(`C179935 : Verify that data is not returned when hitting getGroupMembersByGroupId API with group admin auth token with invalid required variable`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getGroupMembersByGroupId = query({
			operation: `getGroupMembersByGroupId`,
			variables: {groupId: {value: 'invalid', required: true}},
			fields: [`items{groupId,role,userId}`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: getGroupMembersByGroupId
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});
});
