/// <reference types="Cypress" />
import {mutation, query} from 'gql-query-builder';
import dayjs from 'dayjs';

describe(`Security Test case for listFbPostModels`, () => {
	it(`C42120 : Verify that an error is returned when using an incorrect auth token without group permission for fetching listFbPostModels`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const listFbPostModels = query({
			operation: `listFbPostModels`,
			variables: {
				groupId: {value: this.userDataJson.groupDetails.groupId, required: true},
				tickOfStartHour: {value: 1603006054, required: true}
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
			body: listFbPostModels
		}).then(({body}) => {
			const {
				data: {listFbPostModels},
				errors: [{errorType, message}]
			} = body;

			expect(listFbPostModels).to.be.null;
			expect(message).to.be.equal(`Not Authorized to access listFbPostModels on type FbPostModelConnection`);
			expect(errorType).to.be.equal(`Unauthorized`);
		});
	});
	it(`C42120 : Verify that an error is returned when using an cs admin auth token without group permission for fetching listFbPostModels`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const listFbPostModels = query({
			operation: `listFbPostModels`,
			variables: {
				groupId: {value: this.userDataJson.groupDetails.groupId, required: true},
				tickOfStartHour: {value: 1603006054, required: true}
			},
			fields: [`__typename`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.csAdminToken
			},
			body: listFbPostModels
		}).then(({body}) => {
			const {
				data: {listFbPostModels},
				errors: [{errorType, message}]
			} = body;

			expect(listFbPostModels).to.be.null;
			expect(message).to.be.equal(`Not Authorized to access listFbPostModels on type FbPostModelConnection`);
			expect(errorType).to.be.equal(`Unauthorized`);
		});
	});

	it(`C42120 : Verify that an error is returned when using an brand auth token without group permission for fetching listFbPostModels`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const listFbPostModels = query({
			operation: `listFbPostModels`,
			variables: {
				groupId: {value: this.userDataJson.groupDetails.groupId, required: true},
				tickOfStartHour: {value: 1603006054, required: true}
			},
			fields: [`__typename`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.brandAdminToken
			},
			body: listFbPostModels
		}).then(({body}) => {
			const {
				data: {listFbPostModels},
				errors: [{errorType, message}]
			} = body;

			expect(listFbPostModels).to.be.null;
			expect(message).to.be.equal(`Not Authorized to access listFbPostModels on type FbPostModelConnection`);
			expect(errorType).to.be.equal(`Unauthorized`);
		});
	});

	it(`C42120 : Verify that data is returned for listFBPostModels with required variables.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const postTime = dayjs().add(4, `days`).unix() + Math.floor(Math.random() * 100);
		const postData = this.userDataJson.postDetails;
		//schedule post by group admin
		const CreateFbPostModel = mutation({
			operation: `createFbPostModel`,
			variables: {
				input: {
					value: {
						groupId: `85478556-88c6-44c3-af49-9028fab66f74`,
						toBePostedAtUTCTicks: postTime,
						isDeleted: false,
						contentType: postData.contentType,
						text: postData.adminText,
						createdByName: postData.createdByAdmin,
						scheduleOption: postData.option,
						createdByRole: postData.role,
						status: postData.postStatus,
						createdById: postData.userId
					},
					required: true,
					type: 'CreateFbPostModelInput'
				}
			},
			fields: [`createdByName`, `text`, `isDeleted`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: CreateFbPostModel
		}).then(({body}) => {
			const {
				data: {
					createFbPostModel: {createdByName, text, isDeleted}
				}
			} = body;
			expect(createdByName).to.be.equal(postData.createdByAdmin);
			expect(text).to.be.equal(postData.adminText);
			expect(isDeleted).to.be.equal(false);
		});

		//fetching above created post
		const listFbPostModels = query({
			operation: `listFbPostModels`,
			variables: {
				groupId: {value: `85478556-88c6-44c3-af49-9028fab66f74`, required: true},
				tickOfStartHour: {value: postTime, required: true}
			},
			fields: [`items{groupId,createdByName,createdByRole,text,status}`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: listFbPostModels
		}).then(({body}) => {
			const {
				data: {
					listFbPostModels: {items}
				}
			} = body;

			expect(items.length).to.be.greaterThan(0);
			items.forEach(data => {
				expect(data.groupId).to.be.equal(`85478556-88c6-44c3-af49-9028fab66f74`);
				expect(data.createdByName).satisfy(
					value => value == postData.createdByModerator || value == postData.createdByAdmin
				);
				expect(data.createdByRole).satisfy(value => value == `Admin` || value == `Moderator`);
				expect(data.text).satisfy(value => value == postData.adminText || value == `Test`);
				expect(data.status).to.be.equal(postData.postStatus);
			});
		});

		//delete post scheduled by Admin
		const UpdateFbPost = mutation({
			operation: `updateFbPost`,
			variables: {
				input: {
					value: {
						groupId: `85478556-88c6-44c3-af49-9028fab66f74`,
						toBePostedAtUTCTicks: postTime,
						isDeleted: true,
						contentType: postData.contentType,
						text: postData.adminText,
						createdByName: postData.createdByAdmin,
						scheduleOption: postData.option,
						createdByRole: postData.role,
						status: postData.postStatus,
						createdById: postData.userId
					},
					required: true,
					type: 'UpdateFbPostInput'
				}
			},
			fields: [`createdByName`, `text`, `isDeleted`]
		});

		//@ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: UpdateFbPost
		}).then(({body}) => {
			const {
				data: {
					updateFbPost: {createdByName, text, isDeleted}
				}
			} = body;

			expect(createdByName).to.be.equal(postData.createdByAdmin);
			expect(text).to.be.equal(postData.adminText);
			expect(isDeleted).to.be.equal(true);
		});
	});

	it(`C42120 : Verify that an error is returned for fetching listFbPostModels with invalid required varibales.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const listFbPostModels = query({
			operation: `listFbPostModels`,
			variables: {
				groupId: {value: 'invalid', required: true},
				tickOfStartHour: {value: 1603006054, required: true}
			},
			fields: [`__typename`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: listFbPostModels
		}).then(({body}) => {
			const {
				data: {listFbPostModels},
				errors: [{errorType, message}]
			} = body;

			expect(listFbPostModels).to.be.null;
			expect(message).to.be.equal(`Not Authorized to access listFbPostModels on type FbPostModelConnection`);
			expect(errorType).to.be.equal(`Unauthorized`);
		});
	});
	it(`C42120 : Verify that an error is returned for fetching listFbPostModels without required varibales.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const listFbPostModels = query({
			operation: `listFbPostModels`,
			variables: {
				tickOfStartHour: {value: 1603006054, required: true}
			},
			fields: [`__typename`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: listFbPostModels
		}).then(({body}) => {
			const {
				errors: [{message}]
			} = body;

			expect(message).to.be.equal(
				`Validation error of type MissingFieldArgument: Missing field argument groupId @ 'listFbPostModels'`
			);
		});
	});
});
