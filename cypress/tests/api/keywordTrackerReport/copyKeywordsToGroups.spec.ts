/// <reference types="Cypress" />
import {mutation} from 'gql-query-builder';
import {unauthorizedErrorObject} from '../../../fixtures/api-test/helper-objects/response-objects';

let apierror = unauthorizedErrorObject(
	`copyKeywordsToGroups`,
	'Unauthorized',
	'Not Authorized to access copyKeywordsToGroups on type KeywordTrackerReport',
	2,
	3
);
describe(`Security test cases for copyKeywordsToGroups`, () => {
	it(`C179949 : Verify that an error is returned when hitting copyKeywordsToGroups API for the group with the authtoken of user that is not an admin`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const copyKeywordsToGroups = mutation({
			operation: `copyKeywordsToGroups`,
			variables: {
				groupIds: {
					value: [
						`${this.userDataJson.addModeratorDetails.moderatorGroupId}`,
						`${this.userDataJson.groupDetails.copyKeywordsGroupId}`
					],
					required: true,
					type: '[String!]'
				},
				append: {
					value: true
				},
				reportName: {value: 'Spamming and Promotions'},
				keywords: {value: this.userDataJson.groupDetails.keywords, required: true}
			},
			fields: [`keywords`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupToken
			},
			body: copyKeywordsToGroups
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});
	it(`C179949 : Verify that data is returned when hitting copyKeywordsToGroups API for the group with required variables`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const copyKeywordsToGroups1 = mutation({
			operation: `copyKeywordsToGroups`,
			variables: {
				groupIds: {
					value: [
						`${this.userDataJson.addModeratorDetails.moderatorGroupId}`,
						`${this.userDataJson.groupDetails.copyKeywordsGroupId}`
					],
					required: true,
					type: '[String!]'
				},
				append: {
					value: true
				},
				reportName: {value: 'Spamming and Promotions'},
				keywords: {value: this.userDataJson.groupDetails.keywords, required: true}
			},
			fields: [`keywords,displayName,ownerId`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: copyKeywordsToGroups1
		}).then(({body}) => {
			const {
				data: {copyKeywordsToGroups}
			} = body;
			expect(copyKeywordsToGroups.length).to.be.greaterThan(0);

			copyKeywordsToGroups.forEach(data => {
				expect(data.keywords).to.be.equal(this.userDataJson.groupDetails.keywords);
				expect(data.displayName).to.be.equal(`Spamming and Promotions`);
			});
		});
	});

	it(`C179949 : Verify that data is not returned when hitting copyKeywordsToGroups API for the group without required variables`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const copyKeywordsToGroups1 = mutation({
			operation: `copyKeywordsToGroups`,
			variables: {
				append: {
					value: true
				},
				reportName: {value: 'Spamming and Promotions'},
				keywords: {value: this.userDataJson.groupDetails.keywords, required: true}
			},
			fields: [`keywords,displayName,ownerId`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: copyKeywordsToGroups1
		}).then(({body}) => {
			const {
				errors: [{message}]
			} = body;

			expect(message).to.be.equal(
				`Validation error of type MissingFieldArgument: Missing field argument groupIds @ 'copyKeywordsToGroups'`
			);
		});
	});
});
