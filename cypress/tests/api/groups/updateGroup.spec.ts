/// <reference types="Cypress" />
import {mutation, query} from 'gql-query-builder';
import {
	staticResponseObject,
	unauthorizedErrorObject
} from '../../../fixtures/api-test/helper-objects/response-objects';

let apierror = unauthorizedErrorObject(
	`updateGroup`,
	'Unauthorized',
	'Not Authorized to access updateGroup on type Groups',
	2,
	3
);
describe(`Security test cases for update group`, () => {
	it(`C179943 : Verify that an error is returned when hitting updategroup API for the group with the authtoken of user that is not an admin`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const groupData = this.userDataJson.updateGroup;
		const updateGroup = mutation({
			operation: `updateGroup`,
			variables: {
				input: {
					value: {
						id: groupData.id,
						businessCategory: groupData.businessCategory,
						name: groupData.createdByAdmin
					},
					required: true,
					type: 'UpdateGroupInput'
				}
			},
			fields: [`businessCategory`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupToken
			},
			body: updateGroup
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C179943 : Verify that an error is returned when hitting updategroup API for the group with the authtoken of user that is not an admin`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const groupData = this.userDataJson.updateGroup;
		const updateGroup = mutation({
			operation: `updateGroup`,
			variables: {
				input: {
					value: {
						id: groupData.id,
						businessCategory: groupData.businessCategory,
						name: groupData.createdByAdmin
					},
					required: true,
					type: 'UpdateGroupInput'
				}
			},
			fields: [`businessCategory`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.brandAdminToken
			},
			body: updateGroup
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C179943 : Verify that data is returned when hitting updategroup API with required variables.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const response1 = staticResponseObject(`updateGroup`, {
			businessCategory: 'Entertainment'
		});
		const response2 = staticResponseObject(`getGroupById`, {
			businessCategory: 'Entertainment',
			country: 'IA',
			name: 'Cs Admin Test Group',
			privacy: 'SECRET',
			state: 'Installed'
		});
		const groupData = this.userDataJson.addModeratorDetails;
		const updateGroup = mutation({
			operation: `updateGroup`,
			variables: {
				input: {
					value: {
						id: groupData.moderatorGroupId,
						businessCategory: this.userDataJson.updateGroup.businessCategory,
						name: this.userDataJson.updateGroup.createdByAdmin
					},
					required: true,
					type: 'UpdateGroupInput'
				}
			},
			fields: [`businessCategory`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: updateGroup
		})
			.its(`body`)
			.should(`deep.eq`, response1);
		const getGroupById = query({
			operation: `getGroupById`,
			variables: {
				id: {value: groupData.moderatorGroupId, required: true, type: 'ID'}
			},
			fields: [`businessCategory,country,name,privacy,state`]
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
			.should(`deep.eq`, response2);
	});

	it(`C179943 : Verify that data is not returned when hitting updategroup API without required variables.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const updateGroup = mutation({
			operation: `updateGroup`,
			variables: {},
			fields: [`businessCategory`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: updateGroup
		}).then(({body}) => {
			const {
				errors: [{message}]
			} = body;

			expect(message).to.be.equal(
				`Validation error of type MissingFieldArgument: Missing field argument input @ 'updateGroup'`
			);
		});
	});

	it(`C179943 : Verify that data is not returned when hitting updategroup API with invalid required variables.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const updateGroup = mutation({
			operation: `updateGroup`,
			variables: {
				input: {
					value: {
						id: 'invalid',
						businessCategory: 'invalid',
						name: 'invalid'
					},
					required: true,
					type: 'UpdateGroupInput'
				}
			},
			fields: [`businessCategory`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: updateGroup
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});
});
