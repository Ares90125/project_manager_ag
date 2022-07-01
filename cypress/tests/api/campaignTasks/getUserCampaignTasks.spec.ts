/// <reference types="Cypress" />
import {query} from 'gql-query-builder';
import {
	staticResponseObject,
	unauthorizedErrorObject
} from '../../../fixtures/api-test/helper-objects/response-objects';

const apierror = unauthorizedErrorObject(
	`getUserCampaignTasks`,
	'Unauthorized',
	'Not Authorized to access getUserCampaignTasks on type CampaignTaskConnection',
	1,
	32
);
describe.skip(`Security test cases for getUserCampaignTasks`, () => {
	it(`C215201 : Verify that an error is returned when hitting getUserCampaignTasks API for the group with the group admin auth token.`, function () {
		const appSyncUrl = 'https://dp37z2f4knen3n7ooxyy4l6zke.appsync-api.us-east-1.amazonaws.com/graphql';
		const getUserCampaignTasks = query({
			operation: `getUserCampaignTasks.`,
			variables: {
				campaignId: {value: this.userDataJson.campaignDetails.userCampaignTask, required: true}
			},
			fields: [`items{userName}`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.csAdminToken
			},
			body: getUserCampaignTasks
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C215201 : Verify that an error is not returned when hitting getUserCampaignTasks API for the group with the group admin auth token.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const response = staticResponseObject(`getUserCampaignTasks`, {
			items: [
				{
					userName: 'Ravi Kiran',
					campaignId: '46255946-9137-42e9-b86c-acdb34f127ed',
					groupId: 'c40d1bd5-4737-40b3-9e40-de78b64454df',
					groupName: 'Cs Admin Test Group',
					imageUrls: [
						'https://bd-cs-dev-media.s3.us-east-1.amazonaws.com/public/pics/f01d56fb-dd9b-43be-8ac7-ea745d514410_1623943591492'
					],
					status: 'PendingApproval',
					title: 'Post on time',
					text: null,
					postType: 'Photo'
				}
			]
		});
		const getUserCampaignTasks = query({
			operation: `getUserCampaignTasks.`,
			variables: {
				campaignId: {value: this.userDataJson.campaignDetails.userCampaignTask, required: true}
			},
			fields: [`items{userName,campaignId,groupId,groupName,imageUrls,status,userName,title,text,postType}`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: getUserCampaignTasks
		})
			.its(`body`)
			.should(`deep.eq`, response);
	});
});
