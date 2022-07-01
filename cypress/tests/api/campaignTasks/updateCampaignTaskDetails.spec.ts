/// <reference types="Cypress" />
import {mutation} from 'gql-query-builder';
import dayjs from 'dayjs';
import {
	unauthorizedErrorObject,
	staticResponseObject
} from '../../../fixtures/api-test/helper-objects/response-objects';
const apierror = unauthorizedErrorObject(
	`updateCampaignTaskDetails`,
	'Unauthorized',
	'Not Authorized to access updateCampaignTaskDetails on type CampaignTask',
	2,
	3
);
describe(`Security test cases for updateCampaignTaskDetails`, () => {
	it(`C215202 : Verify that an error is returned when hitting updateCampaignTaskDetails API for the group with the group admin auth token.`, function () {
		const toBePerformed = dayjs();
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const updateCampaignTaskDetails = mutation({
			operation: `updateCampaignTaskDetails`,
			variables: {
				input: {
					value: {
						taskId: this.userDataJson.campaignDetails.taskId,
						groupId: this.userDataJson.groupDetails.groupId,
						campaignId: this.userDataJson.campaignDetails.campaignId,
						toBePerformedByUTC: toBePerformed,
						userId: this.userDataJson.userDetails.userId
					},
					required: true,
					type: 'UpdateCampaignTaskInput'
				}
			},
			fields: [`taskId`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: updateCampaignTaskDetails
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it.skip(`C215198 : Verify that campaign task is created successfully with cs admin auth token`, function () {
		const performedByUTC = dayjs().add(1, 'day');
		const response = staticResponseObject(`updateCampaignTaskDetails`, {
			groupName: 'MADDIPOTI',
			groupId: '170b6719-ba85-4295-993f-ff5d23b49727',
			postType: 'Text',
			text: 'test',
			userId: 'c7f8d76d-0ae6-42be-86a7-f1508ac2926a',
			campaignId: 'd02117f1-86b8-4e1b-8675-f3c75db5c351',
			taskId: 'e080a1c3-bd64-49b1-8a63-3a813074e8ca'
		});
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const UpdateCampaignTaskDetails = mutation({
			operation: `updateCampaignTaskDetails`,
			variables: {
				input: {
					value: {
						groupName: 'MADDIPOTI',
						groupId: '78828f57-5d9b-4b16-b55a-8a8eaa465769',
						// groupId: '05268c03-1283-47a4-9550-1c40ea4ae2df',
						// campaignId: 'd02117f1-86b8-4e1b-8675-f3c75db5c351',
						campaignId: '05268c03-1283-47a4-9550-1c40ea4ae2df',
						toBePerformedByUTC: performedByUTC,
						postType: 'Text',
						title: 'test',
						userId: 'c7f8d76d-0ae6-42be-86a7-f1508ac2926a',
						isPlaceholder: false,
						period: 'Prelaunch',
						taskId: 'e080a1c3-bd64-49b1-8a63-3a813074e8ca',
						timezoneName: 'Asia/Calcutta',
						userName: 'Ramu Maddipoti',
						imageUrls: [],
						videoUrls: [],
						text: 'text'
						// fbPermlink: null,
						// status: null
					},
					required: true,
					type: 'UpdateCampaignTaskInput'
				}
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
			body: UpdateCampaignTaskDetails
		})
			.its(`body`)
			.should(`deep.eq`, response);
	});
});
