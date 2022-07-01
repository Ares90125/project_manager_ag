/// <reference types="Cypress" />
import {query} from 'gql-query-builder'; //Clean this part
import dayjs from 'dayjs';
import {
	unauthorizedErrorObject,
	withoutValidParameterObject
} from '../../../fixtures/api-test/helper-objects/response-objects';
const apierror = unauthorizedErrorObject(
	`getZeroCommentPostsByGroupId`,
	'Unauthorized',
	`Not Authorized to access getZeroCommentPostsByGroupId on type ZeroCommentPosts`,
	1,
	29
);
describe(`Security test case for getZeroCommentPostsByGroupId`, () => {
	it(`C42116 : Verify that an error is returned when using an incorrect auth token without owner permission for fetching getZeroCommentPostsByGroupId`, function () {
		const data = this.userDataJson.groupDetails;
		const getZeroCommentPostsByGroupId = query({
			operation: `getZeroCommentPostsByGroupId`,
			variables: {
				groupId: {value: data.groupId, required: true}
			},
			fields: [`__typename,activityRate`, `commentCount`, `fbGroupId`]
		});

		const appSyncUrl = Cypress.env(`developAppSyncUrl`);

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupToken
			},
			body: getZeroCommentPostsByGroupId
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C42116 : Verify that an error is returned for fetching getZeroCommentPostsByGroupId with csAdmin token`, function () {
		const data = this.userDataJson.groupDetails;
		const getZeroCommentPostsByGroupId = query({
			operation: `getZeroCommentPostsByGroupId`,
			variables: {
				groupId: {value: data.groupId, required: true}
			},
			fields: [`__typename,activityRate`, `commentCount`, `fbGroupId`]
		});

		const appSyncUrl = Cypress.env(`developAppSyncUrl`);

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.csAdminToken
			},
			body: getZeroCommentPostsByGroupId
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C42116 : Verify that an error is returned for fetching getZeroCommentPostsByGroupId with brand admin token`, function () {
		const data = this.userDataJson.groupDetails;
		const getZeroCommentPostsByGroupId = query({
			operation: `getZeroCommentPostsByGroupId`,
			variables: {
				groupId: {value: data.groupId, required: true}
			},
			fields: [`__typename,activityRate`, `commentCount`, `fbGroupId`]
		});

		const appSyncUrl = Cypress.env(`developAppSyncUrl`);

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.brandAdminToken
			},
			body: getZeroCommentPostsByGroupId
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C42115 : Verify post details is returned by API getZeroCommentPostsByGroupId with required variables.`, function () {
		const data = this.userDataJson.groupDetails;
		const currentMonth = dayjs().month() + 1;
		const currentYear = dayjs().year();
		const getZeroCommentPostsByGroupId = query({
			operation: `getZeroCommentPostsByGroupId`,
			variables: {
				groupId: {value: data.groupId, required: true},
				limit: {value: 5, required: true},
				endMonth: {value: currentMonth, required: true},
				endYear: {value: currentYear, required: true},
				startMonth: {value: currentMonth, required: true},
				startYear: {value: currentYear, required: true}
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
			body: getZeroCommentPostsByGroupId
		}).then(({body}) => {
			const {
				data: {getZeroCommentPostsByGroupId}
			} = body;

			getZeroCommentPostsByGroupId.forEach(data => {
				expect(data.postType).to.not.be.null;
				expect(data.activityRate).to.be.within(0, 100000);
				expect(data.fbGroupId).to.not.be.null;
				expect(data.commentCount).to.be.within(0, 100000);
			});
		});
	});

	it(`C42115 : Verify each type of  post are returned by API getZeroCommentPostsByGroupId with required variables.`, function () {
		const currentMonth = dayjs().month() + 1;
		const currentYear = dayjs().year();
		const postTypes = ['Video', 'Photo', 'Text'];
		const data = this.userDataJson.groupDetails;
		postTypes.forEach(post => {
			const getZeroCommentPostsByGroupId = query({
				operation: `getZeroCommentPostsByGroupId`,
				variables: {
					groupId: {value: data.groupId, required: true},
					postType: {value: post, required: true},
					limit: {value: 5, required: true},
					endMonth: {value: currentMonth, required: true},
					endYear: {value: currentYear, required: true},
					startMonth: {value: currentMonth, required: true},
					startYear: {value: currentYear, required: true}
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
				body: getZeroCommentPostsByGroupId
			}).then(({body}) => {
				const {
					data: {getZeroCommentPostsByGroupId}
				} = body;

				getZeroCommentPostsByGroupId.forEach(data => {
					expect(data.postType).to.be.equal(post);
					expect(data.activityRate).to.be.within(0, 100000);
					expect(data.fbGroupId).to.not.be.null;
					expect(data.commentCount).to.be.within(0, 100000);
				});
			});
		});
	});

	it.skip(`C42115 : Verify  records fetched by getZeroCommentPostsByGroupId is according to the date range`, function () {
		const data = this.userDataJson.groupDetails;
		const currentMonth = dayjs().month() + 1;
		const currentYear = dayjs().year();
		const getZeroCommentPostsByGroupId1 = query({
			operation: `getZeroCommentPostsByGroupId`,
			variables: {
				groupId: {value: data.groupId, required: true},
				limit: {value: 5, required: true},
				endMonth: {value: currentMonth, required: true},
				endYear: {value: currentYear, required: true},
				startMonth: {value: currentMonth, required: true},
				startYear: {value: currentYear, required: true}
			},
			fields: [`postCreatedAtUTC`]
		});
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: getZeroCommentPostsByGroupId1
		}).then(({body}) => {
			const {
				data: {getZeroCommentPostsByGroupId}
			} = body;

			getZeroCommentPostsByGroupId.forEach(date => {
				const x1 = dayjs(date.postCreatedAtUTC);

				const month = x1.month() + 1;
				expect(month).to.be.equal(currentMonth);
			});
		});
	});

	it(`C154871 :Verify that an error is returned for API getZeroCommentPostsByGroupId without all required variables.`, function () {
		const response = withoutValidParameterObject(
			"Validation error of type MissingFieldArgument: Missing field argument groupId @ 'getZeroCommentPostsByGroupId'",
			1,
			10
		);
		const getZeroCommentPostsByGroupId = query({
			operation: `getZeroCommentPostsByGroupId`,
			variables: {},
			fields: [`postCreatedAtUTC`]
		});
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: getZeroCommentPostsByGroupId
		}).then(({body}) => {
			const {
				errors: [{message}]
			} = body;
			expect(message).to.be.equal(
				`Validation error of type MissingFieldArgument: Missing field argument groupId @ 'getZeroCommentPostsByGroupId'`
			);
		});
	});
});
