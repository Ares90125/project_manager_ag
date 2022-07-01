/// <reference types="Cypress" />
import {query} from 'gql-query-builder';
import {unauthorizedErrorObject} from '../../../fixtures/api-test/helper-objects/response-objects';

const apierror = unauthorizedErrorObject(
	`getCampaignTasks`,
	'Unauthorized',
	'Not Authorized to access getCampaignTasks on type CampaignTaskConnection',
	1,
	51
);
describe(`Security test cases for getCampaignTasks`, () => {
	it(`C215200 : Verify that an error is returned when hitting getCampaignTasks API for the group with the group admin auth token.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getCampaignTasks = query({
			operation: `getCampaignTasks`,
			variables: {
				brandId: {value: this.userDataJson.brandDetails.id, required: true},
				campaignId: {value: this.userDataJson.campaignDetails.campaignId, required: true}
			},
			fields: [`items{userName}`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: getCampaignTasks
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C215200 : Verify that an error is not returned when hitting getCampaignTasks API for the group with cs admin auth token.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getCampaignTasks = query({
			operation: `getCampaignTasks`,
			variables: {
				brandId: {value: this.userDataJson.campaignDetails.campaignTaskBrandId, required: true},
				campaignId: {value: this.userDataJson.campaignDetails.campaignTaskID, required: true}
			},
			fields: [`items{userName,text,groupId,groupName,imageUrls,postType,toBePerformedByUTC,campaignId}`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.csAdminToken
			},
			body: getCampaignTasks
		}).then(({body}) => {
			const {
				data: {
					getCampaignTasks: {items}
				}
			} = body;
			expect(items.length).to.be.greaterThan(0);
			items.forEach(data => {
				expect(data.campaignId).to.be.not.null.and.not.to.be.undefined;
				expect(data.userName).to.be.not.null.and.not.to.be.undefined;
				expect(data.groupId).to.be.not.null.and.not.to.be.undefined;
				expect(data.groupName).to.be.not.null.and.not.to.be.undefined;
				expect(data.imageUrls).to.be.not.null.and.not.to.be.undefined;
				expect(data.postType).to.be.not.null.and.not.to.be.undefined;
				expect(data.toBePerformedByUTC).to.be.not.null.and.not.to.be.undefined;
				expect(data.userName).to.be.not.null.and.not.to.be.undefined;
			});
		});
	});
});
