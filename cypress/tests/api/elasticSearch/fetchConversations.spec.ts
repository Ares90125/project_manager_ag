import {query} from 'gql-query-builder'; //Clean this part
import dayjs from 'dayjs';
import {
	unauthorizedErrorObject,
	withoutValidParameterObject
} from '../../../fixtures/api-test/helper-objects/response-objects';

let apierror = unauthorizedErrorObject(
	`fetchConversations`,
	'Unauthorized',
	'Not Authorized to access fetchConversations on type Conversation',
	1,
	53
);
describe(`Security Test case for API fetchConversations`, () => {
	it(`C42118 : Verify that an error is returned when using an incorrect auth token without group permission for fetching conversation`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const fetchConversations = query({
			operation: `fetchConversations`,
			variables: {
				groupIds: {value: [this.userDataJson.groupDetails.groupId], required: true, type: '[String!]'},
				terms: {value: this.userDataJson.conversationDetails.terms, required: true, type: '[String!]'}
			},
			fields: [`contenType`, `createdatutc`, `createdatutcday`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupToken
			},
			body: fetchConversations
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C42118 : Verify that data is retunred for fetchConversation with valid required variable for group Admin token`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const fetchConversations = query({
			operation: `fetchConversations`,
			variables: {
				groupIds: {value: [this.userDataJson.groupDetails.groupId], required: true, type: '[String!]'},
				terms: {value: this.userDataJson.conversationDetails.terms, required: true, type: '[String!]'},
				fromDateAtUTC: {value: '2020-05-05T14:39:51.693Z', type: `AWSDateTime`},
				size: {value: 10},
				from: {value: 0}
			},
			fields: [`groupname`, `groupType`, `groupid`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: fetchConversations
		}).then(({body}) => {
			const {
				data: {fetchConversations}
			} = body;
			expect(fetchConversations.length).to.be.greaterThan(0);
			fetchConversations.forEach(data => {
				expect(data.groupname).to.be.equal(this.userDataJson.conversationDetails.conversationGroupName);
				expect(data.groupid).to.be.equal(this.userDataJson.groupDetails.groupId);
				expect(data.groupType).to.be.equal(`Facebook`);
			});
		});
	});

	it(`C42118 : Verify that data is not retunred for fetchConversation with invalid required variable for group Admin token`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		apierror = unauthorizedErrorObject(
			`fetchConversations`,
			'Unauthorized',
			'Not Authorized to access fetchConversations on type Conversation',
			1,
			86
		);
		const fetchConversations = query({
			operation: `fetchConversations`,
			variables: {
				groupIds: {value: ['Invalid'], required: true, type: '[String!]'},
				fromDateAtUTC: {value: '2020-05-05T14:39:51.693Z', type: `AWSDateTime`},
				size: {value: 10},
				from: {value: 0}
			},
			fields: [`groupname`, `groupType`, `groupid`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: fetchConversations
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C42118 : Verify that data is not retunred for fetchConversation without required variable for group Admin token`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const response = withoutValidParameterObject(
			`Validation error of type MissingFieldArgument: Missing field argument groupIds @ 'fetchConversations'`,
			1,
			83
		);
		const fetchConversations = query({
			operation: `fetchConversations`,
			variables: {
				// groupIds: {value: ["Invalid"], required: true, type: '[String!]'},
				terms: {value: this.userDataJson.conversationDetails.terms, required: true, type: '[String!]'},
				fromDateAtUTC: {value: '2020-05-05T14:39:51.693Z', type: `AWSDateTime`},
				size: {value: 10},
				from: {value: 0}
			},
			fields: [`groupname`, `groupType`, `groupid`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: fetchConversations
		})
			.its(`body`)
			.should(`deep.eq`, response);
	});

	it(`C42118 : Verify that data is retunred for fetchConversation within the limit using valid required variable and group Admin token`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const fetchConversations = query({
			operation: `fetchConversations`,
			variables: {
				groupIds: {value: [this.userDataJson.groupDetails.groupId], required: true, type: '[String!]'},
				terms: {value: this.userDataJson.conversationDetails.terms, required: true, type: '[String!]'},
				fromDateAtUTC: {value: '2020-05-05T14:39:51.693Z', type: `AWSDateTime`},
				size: {value: 10},
				from: {value: 0}
			},
			fields: [`groupname`, `groupType`, `groupid`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: fetchConversations
		}).then(({body}) => {
			const {
				data: {fetchConversations}
			} = body;
			expect(fetchConversations.length).to.be.equal(10);
		});
	});

	it(`C42118 : Verify that data is retunred for fetchConversation within the date range using valid required variable and group Admin token`, function () {
		const fromDate = '2020-05-05T14:39:51.693Z';
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const fetchConversations = query({
			operation: `fetchConversations`,
			variables: {
				groupIds: {value: [this.userDataJson.groupDetails.groupId], required: true, type: '[String!]'},
				terms: {value: this.userDataJson.conversationDetails.terms, required: true, type: '[String!]'},
				fromDateAtUTC: {value: fromDate, type: `AWSDateTime`},
				size: {value: 10},
				from: {value: 0}
			},
			fields: [`groupname`, `groupType`, `groupid`, `createdatutc`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupAdminToken
			},
			body: fetchConversations
		}).then(({body}) => {
			const {
				data: {fetchConversations}
			} = body;
			expect(fetchConversations.length).to.be.greaterThan(0);
			fetchConversations.forEach(date => {
				const createdAtUtcUnix = dayjs(date.createdatutc).unix();
				const fromDateUnix = dayjs(fromDate).unix();
				expect(createdAtUtcUnix).to.be.greaterThan(fromDateUnix);
			});
		});
	});
});
