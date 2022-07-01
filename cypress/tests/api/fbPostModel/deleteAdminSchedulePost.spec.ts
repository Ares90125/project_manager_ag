/// <reference types="Cypress" />
import {mutation} from 'gql-query-builder';
import dayjs from 'dayjs';

describe(`admin functional posts permissions test cases`, () => {
	it(`C42110 : Verify that Group Admin is able to delete post scheduled by themselves.`, function () {
		const postTime = dayjs().add(2, `days`).unix() + Math.floor(Math.random() * 100);
		const postData = this.userDataJson.postDetails;
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		//schedule post by group admin
		const CreateFbPostModel = mutation({
			operation: `createFbPostModel`,
			variables: {
				input: {
					value: {
						groupId: this.userDataJson.addModeratorDetails.moderatorGroupId,
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

		//delete post scheduled by Admin
		const UpdateFbPost = mutation({
			operation: `updateFbPost`,
			variables: {
				input: {
					value: {
						groupId: this.userDataJson.addModeratorDetails.moderatorGroupId,
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

	it(`C42110 : Verify that Group Admin is able to delete post scheduled by moderator.`, function () {
		const postTime = dayjs().add(2, `days`).unix() + Math.floor(Math.random() * 100);
		const postData = this.userDataJson.postDetails;
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		//schedule post by group admin
		const CreateFbPostModel = mutation({
			operation: `createFbPostModel`,
			variables: {
				input: {
					value: {
						groupId: this.userDataJson.addModeratorDetails.moderatorGroupId,
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
				authorization: this.tokensJson.moderatorToken
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

		//delete post scheduled by Admin
		const UpdateFbPost = mutation({
			operation: `updateFbPost`,
			variables: {
				input: {
					value: {
						groupId: this.userDataJson.addModeratorDetails.moderatorGroupId,
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

	it(`C42110 : Verify that moderator is not able to delete post scheduled by Admin.`, function () {
		const postTime = dayjs().add(2, `days`).unix() + Math.floor(Math.random() * 100);
		const postData = this.userDataJson.postDetails;
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		//schedule post by group admin
		const CreateFbPostModel = mutation({
			operation: `createFbPostModel`,
			variables: {
				input: {
					value: {
						groupId: this.userDataJson.addModeratorDetails.moderatorGroupId,
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
		//delete post scheduled by admin through moderator
		const UpdateFbPost = mutation({
			operation: `updateFbPost`,
			variables: {
				input: {
					value: {
						groupId: this.userDataJson.addModeratorDetails.moderatorGroupId,
						toBePostedAtUTCTicks: postTime,
						isDeleted: true,
						contentType: postData.contentType,
						text: postData.adminText,
						createdByName: postData.createdByAdmin,
						scheduleOption: postData.option,
						createdByRole: postData.role,
						status: postData.postStatus,
						createdById: postData.moderatorUserId
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
				authorization: this.tokensJson.moderatorToken
			},
			body: UpdateFbPost
		}).then(({body}) => {
			const {
				data: {updateFbPost},
				errors: [{errorType, message}]
			} = body;

			expect(updateFbPost).to.be.null;
			expect(message).to.be.equal(`Not Authorized to access updateFbPost on type FbPostModel`);
			expect(errorType).to.be.equal(`Unauthorized`);
		});
	});
	it(`C42110 : Verify that admin is not able to delete post scheduled by other Admin.`, function () {
		const postTime = dayjs().add(2, `days`).unix() + Math.floor(Math.random() * 100);
		const postData = this.userDataJson.postDetails;
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		//schedule post by group admin
		const CreateFbPostModel = mutation({
			operation: `createFbPostModel`,
			variables: {
				input: {
					value: {
						groupId: this.userDataJson.addModeratorDetails.moderatorGroupId,
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

		//delete post scheduled by admin through moderator
		const UpdateFbPost = mutation({
			operation: `updateFbPost`,
			variables: {
				input: {
					value: {
						groupId: this.userDataJson.addModeratorDetails.moderatorGroupId,
						toBePostedAtUTCTicks: postTime,
						isDeleted: true,
						contentType: postData.contentType,
						text: postData.adminText,
						createdByName: postData.createdByAdmin,
						scheduleOption: postData.option,
						createdByRole: postData.role,
						status: postData.postStatus,
						createdById: postData.moderatorUserId
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
				authorization: this.tokensJson.moderatorToken
			},
			body: UpdateFbPost
		}).then(({body}) => {
			const {
				data: {updateFbPost},
				errors: [{errorType, message}]
			} = body;

			expect(updateFbPost).to.be.null;
			expect(message).to.be.equal(`Not Authorized to access updateFbPost on type FbPostModel`);
			expect(errorType).to.be.equal(`Unauthorized`);
		});
	});
});
