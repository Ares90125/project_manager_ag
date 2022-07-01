/// <reference types="Cypress" />
import dayjs from 'dayjs';
import {query} from 'gql-query-builder'; //Clean this part
import {
	unauthorizedErrorObject,
	withoutValidParameterObject
} from '../../../fixtures/api-test/helper-objects/response-objects';
let apierror = unauthorizedErrorObject(
	`listGroupMetricsByGroupId`,
	'Unauthorized',
	'Not Authorized to access listGroupMetricsByGroupId on type GroupMetricsConnection',
	1,
	75
);
describe(`Security Test cases for listGroupMetricsByGroupId`, () => {
	it(`C179938 : Verify that an error is returned when hitting listGroupMetricsByGroupId API for the group with the authtoken of user that is not an admin`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const listGroupMetricsByGroupId = query({
			operation: `listGroupMetricsByGroupId`,
			variables: {
				groupId: {value: this.userDataJson.groupDetails.groupId, required: true},
				tickOfEndHour: {value: 1601510399, required: true},
				tickOfStartHour: {value: 1598918400, required: true}
			},
			fields: [`__typename`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupToken
			},
			body: listGroupMetricsByGroupId
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it.skip(`C179938 : Verify that data is returned when hitting listGroupMetricsByGroupId API for the group with required variables.`, function () {
		const startTick = dayjs().unix();
		const endTick = dayjs().subtract(30, `days`).unix();
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const listGroupMetricsByGroupId = query({
			operation: `listGroupMetricsByGroupId`,
			variables: {
				groupId: {value: this.userDataJson.groupDetails.groupId, required: true},
				tickOfEndHour: {value: startTick, required: true},
				tickOfStartHour: {value: endTick, required: true}
			},
			fields: [`items{groupId,numComments,numCommentsPerPost,numReactions,numShares,numTextPosts,numWeekOfMonth}`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: listGroupMetricsByGroupId
		}).then(({body}) => {
			const {
				data: {
					listGroupMetricsByGroupId: {items}
				}
			} = body;
			expect(items.length).to.be.greaterThan(0);
			items.forEach(data => {
				expect(data.groupId).to.be.equal(this.userDataJson.groupDetails.groupId);
				expect(data.numComments).to.be.not.null;
				expect(data.numCommentsPerPost).to.be.not.null;
				expect(data.numReactions).to.be.not.null;
				expect(data.numShares).to.be.not.null;
				expect(data.numTextPosts).to.be.not.null;
				expect(data.numWeekOfMonth).to.be.not.null;
			});
		});
	});

	it(`C179938 : Verify that an error is returned when hitting listGroupMetricsByGroupId API for the group without required variables.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const response = withoutValidParameterObject(
			`Validation error of type MissingFieldArgument: Missing field argument groupId @ 'listGroupMetricsByGroupId'`,
			1,
			56
		);
		const listGroupMetricsByGroupId = query({
			operation: `listGroupMetricsByGroupId`,
			variables: {
				tickOfEndHour: {value: 1601510399, required: true},
				tickOfStartHour: {value: 1598918400, required: true}
			},
			fields: [`__typename`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: listGroupMetricsByGroupId
		})
			.its(`body`)
			.should(`deep.eq`, response);
	});

	it(`C179938 : Verify that an error is returned when hitting listGroupMetricsByGroupId API for the group with invalid required variables.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const listGroupMetricsByGroupId = query({
			operation: `listGroupMetricsByGroupId`,
			variables: {
				groupId: {value: 'invalid', required: true},
				tickOfEndHour: {value: 1601510399, required: true},
				tickOfStartHour: {value: 1598918400, required: true}
			},
			fields: [`__typename`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: listGroupMetricsByGroupId
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});
});
