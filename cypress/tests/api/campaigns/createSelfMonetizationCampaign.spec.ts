/// <reference types="Cypress" />
import dayjs from 'dayjs';
import {mutation} from 'gql-query-builder';
import {unauthorizedErrorObject} from '../../../fixtures/api-test/helper-objects/response-objects';
const apierror = unauthorizedErrorObject(
	`createSelfMonetizationCampaign`,
	'Unauthorized',
	'Not Authorized to access createSelfMonetizationCampaign on type Campaign',
	2,
	3
);
describe(`API test cases for createSelfMonetizationCampaign`, () => {
	it(`C214635 : Verify that createSelfMonetizationCampaign  is created when hitting createSelfMonetizationCampaign API for the user having access to generate report`, function () {
		const campaignData = this.userDataJson.brandDetails;
		const startDate = dayjs().toISOString();
		const endDate = dayjs().add(3, `day`).toISOString();
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const createSelfMonetizationCampaign = mutation({
			operation: `createSelfMonetizationCampaign`,
			variables: {
				input: {
					value: {
						campaignName: campaignData.newCampaignName,
						campaignSummary: null,
						brandKeywords: ['Test'],
						customKeywords: ['Test'],
						endDateAtUTC: `${endDate}`,
						groupIds: [`${campaignData.groupId}`],
						hashtags: ['Test'],
						startDateAtUTC: `${startDate}`
					},
					required: true,
					type: 'CreateSelfMonetizationCampaignInput'
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
			body: createSelfMonetizationCampaign
		}).then(({body}) => {
			const {
				data: {
					createSelfMonetizationCampaign: {
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
			expect(brandKeyword).to.be.equal(`Test`);
			expect(campaignId).to.not.be.null;
			expect(campaignId).to.not.be.empty;
			expect(campaignName).to.be.equal(campaignData.newCampaignName);
			expect(customKeyword).to.be.equal(`Test`);
			expect(group).to.be.equal(`${campaignData.groupId}`);
			expect(hashtag).to.be.equal(`Test`);
			expect(isReportAvailable).to.be.null;
			expect(startDateAtUTC).to.be.equal(startDate);
			expect(endDateAtUTC).to.be.equal(endDate);
			cy.task(`deleteTestCampaignsByCampaignId`, {value: campaignId});
		});
	});

	it(`C214635 : Verify that createSelfMonetizationCampaign  is not created when hitting createSelfMonetizationCampaign API for the user not having access to generate report`, function () {
		const campaignData = this.userDataJson.brandDetails;
		const startDate = dayjs().toISOString();
		const endDate = dayjs().add(3, `day`).toISOString();
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const createSelfMonetizationCampaign = mutation({
			operation: `createSelfMonetizationCampaign`,
			variables: {
				input: {
					value: {
						campaignName: campaignData.newCampaignName,
						campaignSummary: null,
						brandKeywords: ['Test'],
						customKeywords: ['Test'],
						endDateAtUTC: `${endDate}`,
						groupIds: [`${campaignData.groupId}`],
						hashtags: ['Test'],
						startDateAtUTC: `${startDate}`
					},
					required: true,
					type: 'CreateSelfMonetizationCampaignInput'
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
			body: createSelfMonetizationCampaign
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C214635 : Verify that createSelfMonetizationCampaign  is not created when hitting createSelfMonetizationCampaign API with csadminauthtoken`, function () {
		const campaignData = this.userDataJson.brandDetails;
		const startDate = dayjs().toISOString();
		const endDate = dayjs().add(3, `day`).toISOString();
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const createSelfMonetizationCampaign = mutation({
			operation: `createSelfMonetizationCampaign`,
			variables: {
				input: {
					value: {
						campaignName: campaignData.newCampaignName,
						campaignSummary: null,
						brandKeywords: ['Test'],
						customKeywords: ['Test'],
						endDateAtUTC: `${endDate}`,
						groupIds: [`${campaignData.groupId}`],
						hashtags: ['Test'],
						startDateAtUTC: `${startDate}`
					},
					required: true,
					type: 'CreateSelfMonetizationCampaignInput'
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
			body: createSelfMonetizationCampaign
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C214635 : Verify that createSelfMonetizationCampaign  is not created when hitting createSelfMonetizationCampaign API with brandAdmin auth token`, function () {
		const campaignData = this.userDataJson.brandDetails;
		const startDate = dayjs().toISOString();
		const endDate = dayjs().add(3, `day`).toISOString();
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const createSelfMonetizationCampaign = mutation({
			operation: `createSelfMonetizationCampaign`,
			variables: {
				input: {
					value: {
						campaignName: campaignData.newCampaignName,
						campaignSummary: null,
						brandKeywords: ['Test'],
						customKeywords: ['Test'],
						endDateAtUTC: `${endDate}`,
						groupIds: [`${campaignData.groupId}`],
						hashtags: ['Test'],
						startDateAtUTC: `${startDate}`
					},
					required: true,
					type: 'CreateSelfMonetizationCampaignInput'
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
			body: createSelfMonetizationCampaign
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});
});
