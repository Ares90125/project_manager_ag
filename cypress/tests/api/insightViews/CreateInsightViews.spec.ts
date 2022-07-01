/// <reference types="Cypress" />
import {mutation} from 'gql-query-builder';
import {unauthorizedErrorObject} from '../../../fixtures/api-test/helper-objects/response-objects';
let apierror = unauthorizedErrorObject(
	`createInsightViews`,
	'Unauthorized',
	'Not Authorized to access createInsightViews on type InsightViewsConnection',
	2,
	3
);
describe(`Security test cases for CreateInsightViews`, () => {
	it(`C179946 : Verify that an error is returned when hitting CreateInsightViews API for the group with the authtoken of user that is not an admin`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const campaignData = this.userDataJson.campaignDetails;
		const createInsightViews = mutation({
			operation: `createInsightViews`,
			variables: {
				input: {
					value: {
						campaignId: campaignData.campaignId,
						brand: campaignData.brand,
						subCategory: `["${campaignData.subcategory}"]`,
						category: campaignData.category
					},
					required: true,
					type: 'CreateInsightViewsInput'
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
			body: createInsightViews
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C179946 : Verify that an error is returned when hitting CreateInsightViews API for the group with the authtoken of user that is not an admin`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const campaignData = this.userDataJson.campaignDetails;
		const createInsightViews = mutation({
			operation: `createInsightViews`,
			variables: {
				input: {
					value: {
						campaignId: campaignData.campaignId,
						brand: campaignData.brand,
						subCategory: `["${campaignData.subcategory}"]`,
						category: campaignData.category
					},
					required: true,
					type: 'CreateInsightViewsInput'
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
			body: createInsightViews
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C179946 : Verify that data is returned when hitting CreateInsightViews API for the group with valid required variables`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const campaignData = this.userDataJson.campaignDetails;
		const createInsightViews = mutation({
			operation: `createInsightViews`,
			variables: {
				input: {
					value: {
						campaignId: campaignData.campaignId,
						brand: campaignData.brand,
						subCategory: `["${campaignData.subcategory}"]`,
						category: campaignData.category
					},
					required: true,
					type: 'CreateInsightViewsInput'
				}
			},
			fields: [`items{keywords}`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.csAdminToken
			},
			body: createInsightViews
		}).then(({body}) => {
			const {
				data: {
					createInsightViews: {items}
				}
			} = body;
			expect(items.length).to.be.greaterThan(0);
			items.forEach(data => {
				expect(data.viewName).to.be.not.null;
			});
		});
	});

	it(`C179946 : Verify that data is not returned when hitting CreateInsightViews API for the group without valid required variables`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const campaignData = this.userDataJson.campaignDetails;
		const createInsightViews = mutation({
			operation: `createInsightViews`,
			variables: {
				input: {
					value: {
						campaignId: campaignData.campaignId,
						brand: campaignData.brand,
						subCategory: `["${campaignData.subcategory}"]`
					},
					required: true,
					type: 'CreateInsightViewsInput'
				}
			},
			fields: [`items{viewName}`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.csAdminToken
			},
			body: createInsightViews
		}).then(({body}) => {
			const {
				errors: [{message}]
			} = body;

			expect(message).to.be.equal(`Variable 'input' has coerced Null value for NonNull type 'String!'`);
		});
	});
});
