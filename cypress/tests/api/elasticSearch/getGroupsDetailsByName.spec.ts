import {query} from 'gql-query-builder'; //Clean this part
import {
	unauthorizedErrorObject,
	withoutValidParameterObject
} from '../../../fixtures/api-test/helper-objects/response-objects';

let apierror = unauthorizedErrorObject(
	`getGroupsDetailsByName`,
	'Unauthorized',
	'Not Authorized to access getGroupsDetailsByName on type Groups',
	1,
	26
);
describe(` Security test case for Query getGroupsDetailsByName`, () => {
	it(`C158373 : Verify that an error is returned when using an incorrect auth token  for fetching group details by name`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getGroupsDetailsByName = query({
			operation: `getGroupsDetailsByName`,
			variables: {
				name: {value: this.userDataJson.groupDetails.groupName, required: true}
			},
			fields: [`email`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupToken
			},
			body: getGroupsDetailsByName
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C158373 : Verify that an error is returned when using brand admin auth token  for fetching group details by name`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getGroupsDetailsByName = query({
			operation: `getGroupsDetailsByName`,
			variables: {
				name: {value: this.userDataJson.groupDetails.groupName, required: true}
			},
			fields: [`email`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.brandAdminToken
			},
			body: getGroupsDetailsByName
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C158373 : Verify that data is returned when using cs admin auth token  for fetching group details by name with required variables`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);

		const getGroupsDetailsByName = query({
			operation: `getGroupsDetailsByName`,
			variables: {
				name: {value: this.userDataJson.conversationDetails.conversationGroupName, required: true}
			},
			fields: [`email`, `groupType`, `areMetricsAvailable`, `name`, `privacy`]
		});

		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.csAdminToken
			},
			body: getGroupsDetailsByName
		}).then(({body}) => {
			const {
				data: {getGroupsDetailsByName}
			} = body;
			expect(getGroupsDetailsByName.length).to.be.greaterThan(0);
			getGroupsDetailsByName.forEach(data => {
				expect(data.name).to.be.equal(this.userDataJson.conversationDetails.conversationGroupName);
				expect(data.email).to.be.not.null;
				expect(data.groupType).to.be.equal(`Facebook`);
				expect(data.privacy).to.be.equal(`CLOSED`);
			});
		});
	});

	it(`C158373 : Verify that data is not returned when using cs admin auth token  for fetching group details by name with invalid required variables`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getGroupsDetailsByName = query({
			operation: `getGroupsDetailsByName`,
			variables: {
				name: {value: 'invalid', required: true}
			},
			fields: [`email`, `groupType`, `areMetricsAvailable`, `name`, `privacy`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.csAdminToken
			},
			body: getGroupsDetailsByName
		}).then(({body}) => {
			const {
				data: {getGroupsDetailsByName}
			} = body;
			expect(getGroupsDetailsByName.length).to.be.equal(0);
		});
	});
	it(`C158373 : Verify that data is not returned when using cs admin auth token  for fetching group details by name without required variables`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const response = withoutValidParameterObject(
			`Validation error of type MissingFieldArgument: Missing field argument name @ 'getGroupsDetailsByName'`,
			1,
			10
		);
		const getGroupsDetailsByName = query({
			operation: `getGroupsDetailsByName`,
			variables: {},
			fields: [`email`, `groupType`, `areMetricsAvailable`, `name`, `privacy`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.csAdminToken
			},
			body: getGroupsDetailsByName
		})
			.its(`body`)
			.should(`deep.eq`, response);
	});
});
