/// <reference types="Cypress" />
import {mutation} from 'gql-query-builder';
import dayjs from 'dayjs';

describe(`Brand Admin permission tests`, () => {
	let postTime;
	afterEach(`deleting post scheduled by admin`, function () {
		cy.get(`@userDataJson`).then(
			({
				addModeratorDetails: {moderatorGroupId},
				postDetails: {contentType, adminText, createdByAdmin, userId, postStatus, role, option}
			}: any) => {
				cy.get(`@tokensJson`).then(({groupAdminToken}: any) => {
					const appSyncUrl = Cypress.env(`developAppSyncUrl`);
					const postData = this.userDataJson.postDetails;
					//deleting post scheduled- data clean up
					const UpdateFbPost = mutation({
						operation: `updateFbPost`,
						variables: {
							input: {
								value: {
									groupId: moderatorGroupId,
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
			}
		);
	});
	beforeEach(() => {
		postTime = dayjs().add(2, `days`).unix() + Math.floor(Math.random() * 100);
	});

	it(`C160526 : Verify that Mutation updatefbpostmodel throw an error when using an moderator auth token for deleting admin fbpost`, function () {
		//Schedule the post with admin auth token
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const postData = this.userDataJson.postDetails;
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
			fields: [`createdByName`, `text`]
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
					createFbPostModel: {createdByName, text}
				}
			} = body;
			expect(createdByName).to.be.equal('Ravi Kiran');
			expect(text).to.be.equal(postData.adminText);
		});

		//Deleting post scheduled by Admin using Moderator auth token

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

		// @ts-ignore
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

	it(`C160526 : Verify that Mutation updatefbpostmodel throw an error when using an brand admin auth token for updating admin fbpost`, function () {
		//Schedule the post with admin auth token
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const postData = this.userDataJson.postDetails;
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
			fields: [`createdByName`, `text`]
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
					createFbPostModel: {createdByName, text}
				}
			} = body;
			expect(createdByName).to.be.equal('Ravi Kiran');
			expect(text).to.be.equal(postData.adminText);
		});

		//Deleting post scheduled by Admin using brand admin auth token

		const UpdateFbPost = mutation({
			operation: `updateFbPost`,
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
					type: 'UpdateFbPostInput'
				}
			},
			fields: [`createdByName`, `text`, `isDeleted`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.brandAdminToken
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

	it(`C160526 : Verify that Mutation updatefbpostmodel throw an error when using an cs admin auth token for updating admin fbpost`, function () {
		//Schedule the post with admin auth token
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const postData = this.userDataJson.postDetails;
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
			fields: [`createdByName`, `text`]
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
					createFbPostModel: {createdByName, text}
				}
			} = body;
			expect(createdByName).to.be.equal('Ravi Kiran');
			expect(text).to.be.equal(postData.adminText);
		});

		//Deleting post scheduled by Admin using brand admin auth token

		const UpdateFbPost = mutation({
			operation: `updateFbPost`,
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
					type: 'UpdateFbPostInput'
				}
			},
			fields: [`createdByName`, `text`, `isDeleted`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.csAdminToken
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
