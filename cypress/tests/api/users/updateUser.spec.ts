/// <reference types="Cypress" />
import {mutation} from 'gql-query-builder'; //Clean this part

describe(`Security Test cases for updateUser`, () => {
	it(`C182580 : Verify that an error is returned when hitting updateUser API for the group with the authtoken of user that is not an admin`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const updateUser = mutation({
			operation: `updateUser`,
			variables: {
				input: {
					value: {cognitoId: this.userDataJson.userDetails.cognitoId},
					required: true,
					type: 'UpdateUserInput'
				}
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
			body: updateUser
		}).then(({body}) => {
			const {
				data: {updateUser},
				errors: [{errorType, message}]
			} = body;

			expect(updateUser).to.be.null;
			expect(message).to.be.equal(`Not Authorized to access updateUser on type Users`);
			expect(errorType).to.be.equal(`Unauthorized`);
		});
	});
});
