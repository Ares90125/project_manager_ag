/// <reference types="Cypress" />
import dayjs from 'dayjs';
import {query} from 'gql-query-builder';
import {
	unauthorizedErrorObject,
	withoutValidParameterObject
} from '../../../fixtures/api-test/helper-objects/response-objects';
const apierror = unauthorizedErrorObject(
	`getTopPostsByGroupId`,
	'Unauthorized',
	`Not Authorized to access getTopPostsByGroupId on type TopPosts`,
	1,
	29
);
describe(`Test cases for API getTopPostsByGroupId`, function () {
	it(`C42115 : Verify that query getTopPostsByGroupId throw an error when using an incorrect auth token without owner permission for fetching top post.`, function () {
		const data = this.userDataJson.groupDetails;
		const getTopPostsByGroupId = query({
			operation: `getTopPostsByGroupId`,
			variables: {
				groupId: {value: data.groupId, required: true}
			},
			fields: [`activityRate`, `commentCount`, `fbGroupId`]
		});

		const appSyncUrl = Cypress.env(`developAppSyncUrl`);

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupToken
			},
			body: getTopPostsByGroupId
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C42115 : Verify that query getTopPostsByGroupId throw an error when using csAdminToken`, function () {
		const data = this.userDataJson.groupDetails;
		const getTopPostsByGroupId = query({
			operation: `getTopPostsByGroupId`,
			variables: {
				groupId: {value: data.groupId, required: true}
			},
			fields: [`activityRate`, `commentCount`, `fbGroupId`]
		});

		const appSyncUrl = Cypress.env(`developAppSyncUrl`);

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.csAdminToken
			},
			body: getTopPostsByGroupId
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});
	it(`C42115 : Verify that query getTopPostsByGroupId throw an error when using brand Admin token.`, function () {
		const data = this.userDataJson.groupDetails;
		const getTopPostsByGroupId = query({
			operation: `getTopPostsByGroupId`,
			variables: {
				groupId: {value: data.groupId, required: true}
			},
			fields: [`activityRate`, `commentCount`, `fbGroupId`]
		});

		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.brandAdminToken
			},
			body: getTopPostsByGroupId
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});
	it(`C42115 : Verify top post are returned by API getTopPostsByGroupId with required variables.`, function () {
		const data = this.userDataJson.groupDetails;
		const getTopPostsByGroupId = query({
			operation: `getTopPostsByGroupId`,
			variables: {
				groupId: {value: data.groupId, required: true},
				postType: {value: 'Video', required: true},
				limit: {value: 5, required: true},
				endMonth: {value: 11, required: true},
				endYear: {value: 2020, required: true},
				startMonth: {value: 11, required: true},
				startYear: {value: 2019, required: true}
			},
			fields: [`activityRate`, `commentCount`, `fbGroupId`, `postType`]
		});

		const appSyncUrl = Cypress.env(`developAppSyncUrl`);

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: getTopPostsByGroupId
		})
			.its(`body.data.getTopPostsByGroupId`)
			.each(data => {
				cy.wrap(data.postType).should(`eq`, `Video`);
				cy.wrap(data.activityRate).should(`be.within`, 0, 100000);
				cy.wrap(data.activityRate).should(`not.be.null`);
				cy.wrap(data.commentCount).should(`be.within`, 0, 100000);
			});
	});

	it(`C42115 : Verify each type of top post are returned by API getTopPostsByGroupId with required variables.`, function () {
		const data = this.userDataJson.groupDetails;
		const postTypes = ['Video', 'Photo', 'Text'];
		postTypes.forEach(post => {
			const getTopPostsByGroupId = query({
				operation: `getTopPostsByGroupId`,
				variables: {
					groupId: {value: data.groupId, required: true},
					postType: {value: post, required: true},
					limit: {value: 5, required: true},
					endMonth: {value: 11, required: true},
					endYear: {value: 2020, required: true},
					startMonth: {value: 11, required: true},
					startYear: {value: 2019, required: true}
				},
				fields: [`activityRate`, `commentCount`, `fbGroupId`, `postType`]
			});

			const appSyncUrl = Cypress.env(`developAppSyncUrl`);

			// @ts-ignore
			cy.api({
				method: `POST`,
				url: appSyncUrl,
				headers: {
					authorization: this.tokensJson.groupAdminToken
				},
				body: getTopPostsByGroupId
			})
				.its(`body.data.getTopPostsByGroupId`)
				.each(data => {
					cy.wrap(data.postType).should(`eq`, post);
					cy.wrap(data.activityRate).should(`be.within`, 0, 100000);
					cy.wrap(data.activityRate).should(`not.be.null`);
					cy.wrap(data.commentCount).should(`be.within`, 0, 100000);
				});
		});
	});
	it(`C42115 : Verify number of records fetched by getTopPostByGroupId is according to the limit value.`, function () {
		const data = this.userDataJson.groupDetails;
		const getTopPostsByGroupId = query({
			operation: `getTopPostsByGroupId`,
			variables: {
				groupId: {value: data.groupId, required: true},
				postType: {value: 'Video', required: true},
				limit: {value: 5, required: true},
				endMonth: {value: 11, required: true},
				endYear: {value: 2020, required: true},
				startMonth: {value: 11, required: true},
				startYear: {value: 2019, required: true}
			},
			fields: [`activityRate`, `commentCount`, `fbGroupId`, `postType`]
		});

		const appSyncUrl = Cypress.env(`developAppSyncUrl`);

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: getTopPostsByGroupId
		})
			.its(`body.data.getTopPostsByGroupId`)
			.should(`have.length`, `5`);
	});

	it(`C42115 : Verify number of records fetched by getTopPostByGroupId is according to the date range`, () => {
		cy.get(`@userDataJson`).then(({groupDetails: {groupId}}: any) => {
			const getTopPostsByGroupId1 = query({
				operation: `getTopPostsByGroupId`,
				variables: {
					groupId: {value: groupId, required: true},
					postType: {value: 'Video', required: true},
					limit: {value: 5, required: true},
					endMonth: {value: 11, required: true},
					endYear: {value: 2020, required: true},
					startMonth: {value: 11, required: true},
					startYear: {value: 2020, required: true}
				},
				fields: [`postCreatedAtUTC`]
			});

			const appSyncUrl = Cypress.env(`developAppSyncUrl`);
			cy.get(`@tokensJson`).then(({groupAdminToken}: any) => {
				// @ts-ignore
				cy.api({
					method: `POST`,
					url: appSyncUrl,
					headers: {
						authorization: groupAdminToken
					},
					body: getTopPostsByGroupId1
				})
					.its(`body.data.getTopPostsByGroupId`)
					.each(date => {
						const x1 = dayjs(date.postCreatedAtUTC);
						const month = x1.month() + 1;
						cy.wrap(month).should(`eq`, 11);
					});
			});
		});
	});

	it(`C154871 :Verify error is returned for API getTopPostsByGroupId without all required variables.`, () => {
		const response = withoutValidParameterObject(
			"Validation error of type MissingFieldArgument: Missing field argument groupId @ 'getTopPostsByGroupId'",
			1,
			10
		);
		const getTopPostsByGroupId = query({
			operation: `getTopPostsByGroupId`,
			variables: {},
			fields: [`postCreatedAtUTC`]
		});
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		cy.get(`@tokensJson`).then(({groupAdminToken}: any) => {
			// @ts-ignore
			cy.api({
				method: `POST`,
				url: appSyncUrl,
				headers: {
					authorization: groupAdminToken
				},
				body: getTopPostsByGroupId
			})
				.its(`body`)
				.should(`deep.eq`, response);
		});
	});
});
