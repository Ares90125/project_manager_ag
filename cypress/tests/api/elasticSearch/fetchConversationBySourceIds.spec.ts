/// <reference types="Cypress" />
import {query} from 'gql-query-builder';
import {
	unauthorizedErrorObject,
	withoutValidParameterObject
} from '../../../fixtures/api-test/helper-objects/response-objects';
const apierror = unauthorizedErrorObject(
	`fetchConversationBySourceIds`,
	'Unauthorized',
	'Not Authorized to access fetchConversationBySourceIds on type Conversation',
	1,
	53
);
describe(`Security test cases for fetchConversationBySourceIds`, function () {
	it(`C157616 : Verify that query fetchConversationBySourceIds throw an error when using an invalid auth token.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const fetchConversationBySourceIds = query({
			operation: `fetchConversationBySourceIds`,
			variables: {
				sourceIds: {
					value: [`${this.userDataJson.groupDetails.campaignIdsourceIds}`],
					required: true,
					type: '[String!]'
				},
				groupId: {value: this.userDataJson.groupDetails.groupId, required: true}
			},
			fields: [`contenType,groupname`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				// @ts-ignore
				authorization: this.tokensJson.groupToken
			},
			body: fetchConversationBySourceIds
		}).then(({body}) => {
			const {
				data: {fetchConversationBySourceIds},
				errors: [{errorType, message}]
			} = body;
			expect(fetchConversationBySourceIds).to.be.null;
			expect(message).to.be.equal(`Not Authorized to access fetchConversationBySourceIds on type Conversation`);
			expect(errorType).to.be.equal(`Unauthorized`);
		});
	});

	it(`C157616 : Verify that query fetchConversationBySourceIds throw an error when using brand admin token.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const fetchConversationBySourceIds = query({
			operation: `fetchConversationBySourceIds`,
			variables: {
				sourceIds: {
					value: [`${this.userDataJson.groupDetails.campaignIdsourceIds}`],
					required: true,
					type: '[String!]'
				},
				groupId: {value: this.userDataJson.groupDetails.groupId, required: true}
			},
			fields: [`contenType,groupname`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				// @ts-ignore
				authorization: this.tokensJson.brandAdminToken
			},
			body: fetchConversationBySourceIds
		}).then(({body}) => {
			const {
				data: {fetchConversationBySourceIds},
				errors: [{errorType, message}]
			} = body;
			expect(fetchConversationBySourceIds).to.be.null;
			expect(message).to.be.equal(`Not Authorized to access fetchConversationBySourceIds on type Conversation`);
			expect(errorType).to.be.equal(`Unauthorized`);
		});
	});

	it(`C157616 : Verify that query fetchConversationBySourceIds returns data with valid required variables.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const fetchConversationBySourceIds = query({
			operation: `fetchConversationBySourceIds`,
			variables: {
				sourceIds: {value: [`${this.userDataJson.groupDetails.sourceIds}`], required: true, type: '[String!]'},
				groupId: {value: this.userDataJson.groupDetails.groupId, required: true}
			},
			fields: [`contenType,groupname,groupid`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				// @ts-ignore
				authorization: this.tokensJson.groupAdminToken
			},
			body: fetchConversationBySourceIds
		}).then(({body}) => {
			const {
				data: {fetchConversationBySourceIds}
			} = body;
			expect(fetchConversationBySourceIds.length).to.be.greaterThan(0);
			fetchConversationBySourceIds.forEach(data => {
				expect(data.contenType).to.be.equal(`Post`);
				expect(data.groupname).to.be.equal(this.userDataJson.groupDetails.sourceIdsGroupName);
				expect(data.groupid).to.be.not.null;
			});
		});
	});

	it(`C157616 : Verify that query fetchConversationBySourceIds does not returns data with invalid required variables.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const fetchConversationBySourceIds = query({
			operation: `fetchConversationBySourceIds`,
			variables: {
				sourceIds: {value: [`invalid`], required: true, type: '[String!]'},
				groupId: {value: 'invalid', required: true}
			},
			fields: [`contenType,groupname,groupid`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				// @ts-ignore
				authorization: this.tokensJson.groupAdminToken
			},
			body: fetchConversationBySourceIds
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C157616 : Verify that query fetchConversationBySourceIds does not returns data without the required variables.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const response = withoutValidParameterObject(
			`Validation error of type MissingFieldArgument: Missing field argument groupId @ 'fetchConversationBySourceIds'`,
			1,
			34
		);
		const fetchConversationBySourceIds = query({
			operation: `fetchConversationBySourceIds`,
			variables: {
				sourceIds: {value: [`${this.userDataJson.groupDetails.sourceIds}`], required: true, type: '[String!]'}
			},
			fields: [`contenType,groupname,groupid`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				// @ts-ignore
				authorization: this.tokensJson.groupAdminToken
			},
			body: fetchConversationBySourceIds
		})
			.its(`body`)
			.should(`deep.eq`, response);
	});
});
