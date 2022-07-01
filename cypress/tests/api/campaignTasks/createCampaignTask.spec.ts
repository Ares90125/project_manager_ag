/// <reference types="Cypress" />
import {mutation} from 'gql-query-builder';
import dayjs from 'dayjs';
import {unauthorizedErrorObject} from '../../../fixtures/api-test/helper-objects/response-objects';

const apierror = unauthorizedErrorObject(
	`createCampaignTask`,
	'Unauthorized',
	'Not Authorized to access createCampaignTask on type CampaignTask',
	2,
	3
);
describe(`Security test cases for createCampaignTask`, () => {
	it(`C215198 : Verify that an error is returned when hitting createCampaignTask API for the group with the group admin auth token.`, function () {
		const performedByUTC = dayjs();
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const createCampaignTask = mutation({
			operation: `createCampaignTask`,
			variables: {
				campaignTasks: {
					value: {
						groupName: this.userDataJson.groupDetails.groupName,
						groupId: this.userDataJson.groupDetails.groupId,
						campaignId: this.userDataJson.campaignDetails.campaignId,
						toBePerformedByUTC: performedByUTC,
						postType: this.userDataJson.postDetails.contentType,
						title: this.userDataJson.postDetails.text,
						type: this.userDataJson.postDetails.type,
						userId: this.userDataJson.userDetails.userId
					},
					required: true,
					type: '[CreateCampaignTaskInput]'
				},
				brandId: {value: this.userDataJson.brandDetails.id, required: true}
			},
			fields: [`groupName`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: createCampaignTask
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C215198 : Verify that campaign task is created successfully with cs admin auth token`, function () {
		const performedByUTC = dayjs().add(1, 'day');
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const createCampaignTask = mutation({
			operation: `createCampaignTask`,
			variables: {
				campaignTasks: {
					value: {
						groupName: this.userDataJson.campaignDetails.groupName,
						groupId: this.userDataJson.campaignDetails.groupId,
						campaignId: this.userDataJson.campaignDetails.campaignTaskID,
						toBePerformedByUTC: performedByUTC,
						postType: 'Text',
						title: 'Test',
						type: 'Post',
						userId: this.userDataJson.campaignDetails.campaignTaskUserId,
						isPlaceholder: false,
						period: 'Test',
						timezoneName: 'Asia/Aden',
						userName: 'Preeti Mehta',
						imageUrls: [],
						videoUrls: [],
						text: 'Test'
					},
					required: true,
					type: '[CreateCampaignTaskInput!]'
				},
				brandId: {value: this.userDataJson.campaignDetails.campaignTaskBrandId, required: true}
			},
			fields: [`groupName`, `groupId`, `postType`, `text`, `userId`, `campaignId`, `taskId`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.csAdminToken
			},
			body: createCampaignTask
		}).then(({body}) => {
			const {
				data: {
					createCampaignTask: [{groupName, groupId, postType, text, userId, campaignId, taskId}]
				}
			} = body;

			expect(groupName).to.eq(this.userDataJson.campaignDetails.groupName);
			expect(groupId).to.eq(this.userDataJson.campaignDetails.groupId);
			expect(postType).to.eq(`Text`);
			expect(text).to.eq(`Test`);
			expect(userId).to.eq(this.userDataJson.campaignDetails.campaignTaskUserId);
			expect(campaignId).to.eq(this.userDataJson.campaignDetails.campaignTaskID);

			const deleteCampaignTask = mutation({
				operation: `deleteCampaignTask`,
				variables: {
					taskId: {value: taskId, required: true},
					campaignId: {value: this.userDataJson.campaignDetails.campaignTaskID, required: true}
				},
				fields: [`campaignId`, `taskId`]
			});

			// @ts-ignore
			cy.api({
				method: `POST`,
				url: appSyncUrl,
				headers: {
					authorization: this.tokensJson.csAdminToken
				},
				body: deleteCampaignTask
			}).then(({body}) => {
				const {
					data: {
						deleteCampaignTask: {taskId, campaignId}
					}
				} = body;
				expect(campaignId).to.eq(this.userDataJson.campaignDetails.campaignTaskID);
				expect(taskId).to.eq(taskId);
			});
		});
	});
});
