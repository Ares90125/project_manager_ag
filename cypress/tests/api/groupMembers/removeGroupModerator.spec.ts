/// <reference types="Cypress" />
import {mutation} from 'gql-query-builder';
import {unauthorizedErrorObject} from '../../../fixtures/api-test/helper-objects/response-objects';
let apierror = unauthorizedErrorObject(
	`removeGroupModerator`,
	'Unauthorized',
	'Not Authorized to access removeGroupModerator on type ResponseObject',
	2,
	3
);
describe(`Security test cases for removeGroupModerator`, () => {
	it(`C179937 : Verify that an error is returned when hitting removeGroupModerator API for the group with the authtoken of user that is not an admin`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const removeGroupModerator = mutation({
			operation: `removeGroupModerator`,
			variables: {
				groupId: {value: this.userDataJson.addModeratorDetails.moderatorGroupId, required: true},
				email: {value: this.userDataJson.addModeratorDetails.email, required: true}
			},
			fields: [`status`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupToken
			},
			body: removeGroupModerator
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});
	it(`C185267 :Verify that an error is returned when hitting removeGroupModerator API for the group with the authtoken of moderator.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const removeGroupModerator = mutation({
			operation: `removeGroupModerator`,
			variables: {
				groupId: {value: this.userDataJson.addModeratorDetails.moderatorGroupId, required: true},
				email: {value: this.userDataJson.addModeratorDetails.email, required: true}
			},
			fields: [`status`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.moderatorToken
			},
			body: removeGroupModerator
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C185267 :Verify that an error is returned when hitting removeGroupModerator API for the group with the authtoken of brandAdmin.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const removeGroupModerator = mutation({
			operation: `removeGroupModerator`,
			variables: {
				groupId: {value: this.userDataJson.addModeratorDetails.moderatorGroupId, required: true},
				email: {value: this.userDataJson.addModeratorDetails.email, required: true}
			},
			fields: [`status`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.brandAdminToken
			},
			body: removeGroupModerator
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C185267 :Verify that an error is returned when hitting removeGroupModerator API for the group with the authtoken of csAdmin.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const removeGroupModerator = mutation({
			operation: `removeGroupModerator`,
			variables: {
				groupId: {value: this.userDataJson.addModeratorDetails.moderatorGroupId, required: true},
				email: {value: this.userDataJson.addModeratorDetails.email, required: true}
			},
			fields: [`status`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.csAdminToken
			},
			body: removeGroupModerator
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});
});
