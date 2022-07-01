/// <reference types="Cypress" />
import dayjs from 'dayjs';
import {mutation} from 'gql-query-builder';
import {unauthorizedErrorObject} from '../../../fixtures/api-test/helper-objects/response-objects';

const apierror = unauthorizedErrorObject(
	`updateSelfMonetizationCampaignDetails`,
	'Unauthorized',
	'Not Authorized to access updateSelfMonetizationCampaignDetails on type Campaign',
	2,
	3
);
describe(`API test cases for updateSelfMonetizationCampaignDetails`, () => {
	it.skip(`C214635 : Verify that updateSelfMonetizationCampaignDetails  is created when hitting updateSelfMonetizationCampaignDetails API for the user having access to generate report`, function () {
		const campaignData = this.userDataJson.brandDetails;
		const startDate = dayjs().subtract(1, `day`).toISOString();
		const endDate = dayjs().add(4, `day`).toISOString();
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const updateSelfMonetizationCampaignDetails = mutation({
			operation: `updateSelfMonetizationCampaignDetails`,
			variables: {
				input: {
					value: {
						campaignId: `3ba8f60d-ab03-42f5-88af-75b1ada71906`,
						campaignName: campaignData.updateCampaignName,
						brandKeywords: ['Test1'],
						customKeywords: ['Test1'],
						endDateAtUTC: `${endDate}`,
						groupIds: [`${campaignData.updateGroupId}`, `c40d1bd5-4737-40b3-9e40-de78b64454df`],
						hashtags: ['Test1'],
						startDateAtUTC: `${startDate}`
					},
					required: true,
					type: 'UpdateSelfMonetizationCampaignInput'
				}
			},
			fields: [
				`brandKeywords,campaignId,campaignName,customKeywords,endDateAtUTC,groupIds,hashtags,isReportAvailable,startDateAtUTC`
			]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: updateSelfMonetizationCampaignDetails
		}).then(({body}) => {
			const {
				data: {
					updateSelfMonetizationCampaignDetails: {
						brandKeywords: [brandKeyword],
						campaignId,
						campaignName,
						customKeywords: [customKeyword],
						endDateAtUTC,
						groupIds: [group],
						hashtags: [hashtag],
						isReportAvailable,
						startDateAtUTC
					}
				}
			} = body;
			expect(brandKeyword).to.be.equal(`Test1`);
			expect(campaignId).to.be.equal(campaignData.campaignId);
			expect(campaignId).to.not.be.empty;
			expect(campaignName).to.be.equal(campaignData.updateCampaignName);
			expect(customKeyword).to.be.equal(`Test1`);
			expect(group).to.be.equal(`${campaignData.updateGroupId}`);
			expect(hashtag).to.be.equal(`Test1`);
			expect(isReportAvailable).to.not.be.null;
			expect(startDateAtUTC).to.be.equal(startDate);
			expect(endDateAtUTC).to.be.equal(endDate);
		});
	});

	it(`C214635 : Verify that updateSelfMonetizationCampaignDetails  is not updated when hitting updateSelfMonetizationCampaignDetails API for the user not having access to generate report`, function () {
		const campaignData = this.userDataJson.brandDetails;
		const startDate = dayjs().subtract(1, `day`).toISOString();
		const endDate = dayjs().add(4, `day`).toISOString();
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const updateSelfMonetizationCampaignDetails = mutation({
			operation: `updateSelfMonetizationCampaignDetails`,
			variables: {
				input: {
					value: {
						campaignId: campaignData.campaignId,
						campaignName: campaignData.updateCampaignName,
						brandKeywords: ['Test1'],
						customKeywords: ['Test1'],
						endDateAtUTC: `${endDate}`,
						groupIds: [`${campaignData.updateGroupId}`],
						hashtags: ['Test1'],
						startDateAtUTC: `${startDate}`
					},
					required: true,
					type: 'UpdateSelfMonetizationCampaignInput'
				}
			},
			fields: [
				`brandKeywords,campaignId,campaignName,customKeywords,endDateAtUTC,groupIds,hashtags,isReportAvailable,startDateAtUTC`
			]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupToken
			},
			body: updateSelfMonetizationCampaignDetails
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C214635 : Verify that updateSelfMonetizationCampaignDetails  is not updated when hitting updateSelfMonetizationCampaignDetails API with csadmintoken`, function () {
		const campaignData = this.userDataJson.brandDetails;
		const startDate = dayjs().subtract(1, `day`).toISOString();
		const endDate = dayjs().add(4, `day`).toISOString();
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const updateSelfMonetizationCampaignDetails = mutation({
			operation: `updateSelfMonetizationCampaignDetails`,
			variables: {
				input: {
					value: {
						campaignId: campaignData.campaignId,
						campaignName: campaignData.updateCampaignName,
						brandKeywords: ['Test1'],
						customKeywords: ['Test1'],
						endDateAtUTC: `${endDate}`,
						groupIds: [`${campaignData.updateGroupId}`],
						hashtags: ['Test1'],
						startDateAtUTC: `${startDate}`
					},
					required: true,
					type: 'UpdateSelfMonetizationCampaignInput'
				}
			},
			fields: [
				`brandKeywords,campaignId,campaignName,customKeywords,endDateAtUTC,groupIds,hashtags,isReportAvailable,startDateAtUTC`
			]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.csAdminToken
			},
			body: updateSelfMonetizationCampaignDetails
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C214635 : Verify that updateSelfMonetizationCampaignDetails  is not updated when hitting updateSelfMonetizationCampaignDetails API with brandAdminToken`, function () {
		const campaignData = this.userDataJson.brandDetails;
		const startDate = dayjs().subtract(1, `day`).toISOString();
		const endDate = dayjs().add(4, `day`).toISOString();
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const updateSelfMonetizationCampaignDetails = mutation({
			operation: `updateSelfMonetizationCampaignDetails`,
			variables: {
				input: {
					value: {
						campaignId: campaignData.campaignId,
						campaignName: campaignData.updateCampaignName,
						brandKeywords: ['Test1'],
						customKeywords: ['Test1'],
						endDateAtUTC: `${endDate}`,
						groupIds: [`${campaignData.updateGroupId}`],
						hashtags: ['Test1'],
						startDateAtUTC: `${startDate}`
					},
					required: true,
					type: 'UpdateSelfMonetizationCampaignInput'
				}
			},
			fields: [
				`brandKeywords,campaignId,campaignName,customKeywords,endDateAtUTC,groupIds,hashtags,isReportAvailable,startDateAtUTC`
			]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.brandAdminToken
			},
			body: updateSelfMonetizationCampaignDetails
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});
});
