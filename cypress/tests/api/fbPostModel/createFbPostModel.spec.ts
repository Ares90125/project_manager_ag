/// <reference types="Cypress" />
import {mutation} from 'gql-query-builder';
import dayjs from 'dayjs';
import {unauthorizedErrorObject} from '../../../fixtures/api-test/helper-objects/response-objects';
let apierror = unauthorizedErrorObject(
	`createFbPostModel`,
	'Unauthorized',
	'Not Authorized to access createFbPostModel on type FbPostModel',
	2,
	3
);
describe(`Security test case for api CreateFBPostModel`, () => {
	it(`C42110 : Verify that Mutation CreateFbPostModel throw an error when using an invalid auth token for creating fb post`, function () {
		const postTime = dayjs().unix() + Math.floor(Math.random() * 100);
		const postData = this.userDataJson.postDetails;
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const CreateFbPostModel = mutation({
			operation: `createFbPostModel`,
			variables: {
				input: {
					value: {
						groupId: this.userDataJson.addModeratorDetails.moderatorGroupId,
						toBePostedAtUTCTicks: postTime,
						isDeleted: false,
						contentType: postData.contentType,
						text: postData.text,
						createdByName: postData.createdByAdmin
					},
					required: true,
					type: 'CreateFbPostModelInput'
				}
			},
			fields: [`createdByName`, `text`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupToken
			},
			body: CreateFbPostModel
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C42110 : Verify that Mutation CreateFbPostModel throw an error when using brand admin auth token for creating fb post`, function () {
		const postTime = dayjs().unix() + Math.floor(Math.random() * 100);
		const postData = this.userDataJson.postDetails;
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const CreateFbPostModel = mutation({
			operation: `createFbPostModel`,
			variables: {
				input: {
					value: {
						groupId: this.userDataJson.addModeratorDetails.moderatorGroupId,
						toBePostedAtUTCTicks: postTime,
						isDeleted: false,
						contentType: postData.contentType,
						text: postData.text,
						createdByName: postData.createdByAdmin
					},
					required: true,
					type: 'CreateFbPostModelInput'
				}
			},
			fields: [`createdByName`, `text`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.brandAdminToken
			},
			body: CreateFbPostModel
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C42110 : Verify that data is not returned when using group admin auth token  for createFbPostModel with invalid required variables`, function () {
		const postTime = dayjs().unix() + Math.floor(Math.random() * 100);
		const postData = this.userDataJson.postDetails;
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const CreateFbPostModel = mutation({
			operation: `createFbPostModel`,
			variables: {
				input: {
					value: {
						groupId: 'invalid',
						toBePostedAtUTCTicks: postTime,
						isDeleted: false,
						contentType: postData.contentType,
						text: postData.text,
						createdByName: postData.createdByAdmin
					},
					required: true,
					type: 'CreateFbPostModelInput'
				}
			},
			fields: [`createdByName`, `text`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupToken
			},
			body: CreateFbPostModel
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});

	it(`C42110 : Verify that data is not returned when using group admin auth token  for createFbPostModel with invalid required variables`, function () {
		const postTime = dayjs().unix() + Math.floor(Math.random() * 100);
		const postData = this.userDataJson.postDetails;
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const CreateFbPostModel = mutation({
			operation: `createFbPostModel`,
			variables: {
				input: {
					value: {
						groupId: this.userDataJson.addModeratorDetails.moderatorGroupId,
						toBePostedAtUTCTicks: postTime,
						isDeleted: false,
						contentType: postData.contentType,
						text: postData.text,
						createdByName: postData.createdByAdmin
					},
					required: true,
					type: 'CreateFbPostModelInput'
				}
			},
			fields: [`createdByName`, `text`]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				authorization: this.tokensJson.groupToken
			},
			body: CreateFbPostModel
		})
			.its(`body`)
			.should(`deep.eq`, apierror);
	});
});
