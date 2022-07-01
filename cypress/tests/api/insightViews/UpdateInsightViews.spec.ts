/// <reference types="Cypress" />
import {mutation} from 'gql-query-builder';
import {unauthorizedErrorObject} from '../../../fixtures/api-test/helper-objects/response-objects';

let apierror = unauthorizedErrorObject(
	`updateInsightViews`,
	'Unauthorized',
	'Not Authorized to access updateInsightViews on type InsightViewsConnection',
	2,
	3
);
describe(`Security test cases for UpdateInsightView`, () => {
	it(`C179948 : Verify that an error is retunred when hitting UpdateInsightView API for the group with the authtoken of user that is not an admin`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const campaignData = this.userDataJson.campaignDetails;
		const updateInsightViews = mutation({
			operation: `updateInsightViews`,
			variables: {
				input: {
					value: {
						brand: campaignData.brand,
						campaignId: campaignData.campaignId,
						category: campaignData.category,
						subCategory: `["${campaignData.subcategory}"]`
					},
					required: true,
					type: 'UpdateInsightViewsInput'
				}
			},
			fields: [`items{keywords}`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupToken
			},
			body: updateInsightViews
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C179948 : Verify that an error is retunred when hitting UpdateInsightView API for the group with the authtoken of user that is not an admin`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const campaignData = this.userDataJson.campaignDetails;
		const updateInsightViews = mutation({
			operation: `updateInsightViews`,
			variables: {
				input: {
					value: {
						brand: campaignData.brand,
						campaignId: campaignData.campaignId,
						category: campaignData.category,
						subCategory: `["${campaignData.subcategory}"]`
					},
					required: true,
					type: 'UpdateInsightViewsInput'
				}
			},
			fields: [`items{keywords}`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.brandAdminToken
			},
			body: updateInsightViews
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C179948 : Verify that data is retunred when hitting UpdateInsightView API using cs admin auth token with all the required variables.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const campaignData = this.userDataJson.campaignDetails;
		const updateInsightViews = mutation({
			operation: `updateInsightViews`,
			variables: {
				input: {
					value: {
						brand: campaignData.brand,
						campaignId: campaignData.updateCampaignId,
						category: campaignData.category,
						subCategory: `["${campaignData.subcategory}"]`
					},
					required: true,
					type: 'UpdateInsightViewsInput'
				}
			},
			fields: [`items{keywords,viewName,campaignId}`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.csAdminToken
			},
			body: updateInsightViews
		}).then(({body}) => {
			const {
				data: {
					updateInsightViews: {items}
				}
			} = body;

			expect(items.length).to.be.greaterThan(0);
			items.forEach(data => {
				expect(data.viewName).to.be.not.null;
				expect(data.campaignId).to.be.equal(campaignData.updateCampaignId);
			});
		});
	});

	it(`C179948 : Verify that data is not retunred when hitting UpdateInsightView API using cs admin auth token without all the required variables.`, () => {
		cy.get(`@userDataJson`).then(({campaignDetails: {updateCampaignId, brand, category, subcategory}}: any) => {
			cy.get(`@tokensJson`).then(({csAdminToken}: any) => {
				const appSyncUrl = Cypress.env(`developAppSyncUrl`);
				const updateInsightViews = mutation({
					operation: `updateInsightViews`,
					variables: {
						input: {
							value: {
								campaignId: updateCampaignId,
								category: category,
								subCategory: `["${subcategory}"]`
							},
							required: true,
							type: 'UpdateInsightViewsInput'
						}
					},
					fields: [`items{campaignId,viewName}`]
				});

				// @ts-ignore
				cy.api({
					method: `POST`,
					url: appSyncUrl,
					headers: {
						authorization: csAdminToken
					},
					body: updateInsightViews
				}).then(({body}) => {
					const {
						errors: [{message}]
					} = body;

					expect(message).to.be.equal(`Variable 'input' has coerced Null value for NonNull type 'String!'`);
				});
			});
		});
	});
});
