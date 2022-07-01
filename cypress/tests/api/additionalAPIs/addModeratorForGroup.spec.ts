/// <reference types="Cypress" />
import {mutation} from 'gql-query-builder';
import {
	staticResponseObject,
	unauthorizedErrorObject,
	withoutValidParameterObject
} from '../../../fixtures/api-test/helper-objects/response-objects';

describe(`Add Moderator API Test cases`, function () {
	const apierror = unauthorizedErrorObject(
		`addModeratorForGroup`,
		'Unauthorized',
		`Not Authorized to access addModeratorForGroup on type Notifications`,
		2,
		3
	);
	after(`deleting moderator after test suite`, function () {
		const data = this.userDataJson.addModeratorDetails;
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const removeGroupModerator = mutation({
			operation: `removeGroupModerator`,
			variables: {
				groupId: {value: data.moderatorGroupId, required: true},
				email: {value: data.email, required: true}
			},
			fields: [`status`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: removeGroupModerator
		})
			.its(`body.data.removeGroupModerator.status`)
			.should(`eq`, `Success`);
	});
	it(`C42109 : Verify that Mutation addModeratorForGroup throw an error when using an moderator auth token  for sending moderator invite`, function () {
		const data = this.userDataJson.addModeratorDetails;
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const addModeratorForGroup = mutation({
			operation: `addModeratorForGroup`,
			variables: {
				email: {value: data.email, required: true},
				groupDetails: {
					value: `[{"id":"${data.moderatorgroupId}","name":"${data.groupName}"}]`,
					required: true,
					type: 'AWSJSON'
				},
				inviterName: {value: data.inviterName, required: true},
				inviterUserId: {value: data.inviterUserId, required: true},
				mobilenumber: {value: data.mobileNumber, required: true},
				name: {value: data.newModeratorName, required: true}
			},
			fields: [`createdAtUTC,type`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				// @ts-ignore
				authorization: this.tokensJson.moderatorToken
			},
			body: addModeratorForGroup
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C154871 : Verify that Mutation addModeratorForGroup throw an error when using an invalid auth token for sending moderator invite`, function () {
		const data = this.userDataJson.addModeratorDetails;
		const addModeratorForGroup = mutation({
			operation: `addModeratorForGroup`,
			variables: {
				email: {value: data.email, required: true},
				groupDetails: {
					value: `[{"id":"${data.moderatorgroupId}","name":"${data.groupName}"}]`,
					required: true,
					type: 'AWSJSON'
				},
				inviterName: {value: data.inviterName, required: true},
				inviterUserId: {value: data.inviterUserId, required: true},
				mobilenumber: {value: data.mobileNumber, required: true},
				name: {value: data.newModeratorName, required: true}
			},
			fields: [`createdAtUTC,type`]
		});
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupToken
			},
			body: addModeratorForGroup
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C154871 : Verify moderator is added successfully upon hitting mutuation addModeratorForGroup with required parameters. `, function () {
		const data = this.userDataJson.addModeratorDetails;
		const response = staticResponseObject(`addModeratorForGroup`, {
			type: 'AddedAsModerator',
			status: null,
			payload:
				'{"groupIds":["c40d1bd5-4737-40b3-9e40-de78b64454df"],"senderId":"3a4930da-3da0-4dd2-9cbf-e9ca3860de66","forUserName":"Devashish","forUserMail":"katyald1994@gmail.com"}'
		});
		const addModeratorForGroup = mutation({
			operation: `addModeratorForGroup`,
			variables: {
				email: {value: data.email, required: true},
				groupDetails: {
					value: `[{"id":"${data.moderatorGroupId}","name":"${data.groupName}"}]`,
					required: true,
					type: 'AWSJSON'
				},
				inviterName: {value: data.inviterAdminName, required: true},
				inviterUserId: {value: data.inviterAdminId, required: true},
				mobilenumber: {value: data.mobileNumber, required: true},
				name: {value: data.newModeratorName, required: true}
			},
			fields: [`type,status,payload`]
		});

		const appSyncUrl = Cypress.env(`developAppSyncUrl`);

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: addModeratorForGroup
		})
			.its(`body`)
			.should(`deep.eq`, response);
	});
	it(`C154871 :Verify moderator is not added to the group without all required variables.`, function () {
		const data = this.userDataJson.addModeratorDetails;
		const response = withoutValidParameterObject(
			"Validation error of type MissingFieldArgument: Missing field argument inviterName @ 'addModeratorForGroup'",
			2,
			3
		);
		const addModeratorForGroup = mutation({
			operation: `addModeratorForGroup`,
			variables: {
				email: {value: data.email, required: true},
				groupDetails: {
					value: `[{"id":"${data.moderatorgroupId}","name":"${data.groupName}"}]`,
					required: true,
					type: 'AWSJSON'
				},
				inviterUserId: {value: data.inviterAdminId, required: true},
				mobilenumber: {value: data.mobileNumber, required: true},
				name: {value: data.newModeratorName, required: true}
			},
			fields: [`type,status,payload`]
		});

		const appSyncUrl = Cypress.env(`developAppSyncUrl`);

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.moderatorToken
			},
			body: addModeratorForGroup
		})
			.its(`body`)
			.should(`deep.eq`, response);
	});

	it(`C154871 : Verify that exisiting moderator is not added again. `, function () {
		const data = this.userDataJson.addModeratorDetails;
		const response = unauthorizedErrorObject(
			'addModeratorForGroup',
			null,
			'User has already been added as a Moderator!',
			2,
			3
		);
		const addModeratorForGroup = mutation({
			operation: `addModeratorForGroup`,
			variables: {
				email: {value: data.email, required: true},
				groupDetails: {
					value: `[{"id":"${data.moderatorGroupId}","name":"${data.groupName}"}]`,
					required: true,
					type: 'AWSJSON'
				},
				inviterName: {value: data.inviterAdminName, required: true},
				inviterUserId: {value: data.inviterAdminId, required: true},
				mobilenumber: {value: data.mobileNumber, required: true},
				name: {value: data.newModeratorName, required: true}
			},
			fields: [`type,status,payload`]
		});

		const appSyncUrl = Cypress.env(`developAppSyncUrl`);

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: addModeratorForGroup
		})
			.its(`body`)
			.should(`deep.eq`, response);
	});
});
