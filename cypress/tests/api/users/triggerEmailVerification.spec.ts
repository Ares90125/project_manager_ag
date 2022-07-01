/// <reference types="Cypress" />
import {mutation} from 'gql-query-builder'; //Clean this part

describe(`Security Test cases for triggerEmailVerification`, () => {
	it(`C179954 : Verify that an error is returned when hitting triggerEmailVerification API for the group with the authtoken of user that is not an admin`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const triggerEmailVerification = mutation({
			operation: `triggerEmailVerification`,
			variables: {
				email: {
					value: this.userDataJson.userDetails.invalidEmail,
					required: true
				}
			},
			fields: [`email`, `emailVerificationStatus`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupToken
			},
			body: triggerEmailVerification
		}).then(({body}) => {
			const {
				data: {triggerEmailVerification},
				errors: [{errorType, message}]
			} = body;

			expect(triggerEmailVerification).to.be.null;
			expect(message).to.be.equal(`kd123 is not a valid email.`);
			expect(errorType).to.be.null;
		});
	});
});
