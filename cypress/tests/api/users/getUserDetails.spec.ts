/// <reference types="Cypress" />
import {query} from 'gql-query-builder';

describe(`Security Test cases for getUserDetails`, () => {
	it(`C42104 : Verify that query getUserDetails should only give the details of the user whose auth token is passed.`, function () {
		const appSyncUrl = Cypress.env(`developAppSyncUrl`);
		const getUserDetails = query({
			operation: `getUserDetails`,
			fields: [
				'accessTokenReActivatedAtUTC',
				'birthdate',
				'cognitoId',
				'createdAtUTC',
				'csAdminTeam',
				'email',
				'emailVerificationStatus',
				'expiresAt',
				'familyname',
				'fbUserAccessToken',
				'fbUserId',
				'fcmTokens',
				'fullname',
				'gender',
				'givenname',
				'hasAccessToReportGenerationFeature',
				'id',
				'joinedCSGroupAtDate',
				'landbotCustomerId',
				'locale',
				'loginMethod',
				'middlename',
				'mobileCountryCode',
				'mobileDialCode',
				'mobileNumberMasked',
				'monetizationWorkshopAttendedAtDate',
				'nickname',
				'notificationPrefs',
				'onBoardingStatus',
				'personaSurvey',
				'productDemoedAtDate',
				'profilePictureUrl',
				'receiveEmailNotifications',
				'receiveNotifications',
				'receiveWANotifications',
				'timezoneInfo',
				'timezoneName',
				'timezoneOffsetInMins',
				'totalWhatsappConfirmationRequest',
				'typeformResponseId',
				'updatedAtUTC',
				'userType',
				'username',
				'whatsAppOTPSentAtUTC',
				'whatsappSubscriptionStatus'
			]
		});
		// @ts-ignore
		cy.api({
			method: `POST`,
			url: appSyncUrl,
			headers: {
				Authorization: this.tokensJson.groupAdminToken
			},
			body: getUserDetails
		}).then(({body}) => {
			const {
				data: {
					getUserDetails: {
						accessTokenReActivatedAtUTC,
						cognitoId,
						createdAtUTC,
						email,
						emailVerificationStatus,
						expiresAt,
						familyname,
						fbUserAccessToken,
						fbUserId,
						fullname,
						givenname,
						hasAccessToReportGenerationFeature,
						id,
						loginMethod,
						mobileCountryCode,
						mobileDialCode,
						mobileNumberMasked,
						personaSurvey,
						profilePictureUrl,
						receiveEmailNotifications,
						receiveNotifications,
						receiveWANotifications,
						timezoneInfo,
						username,
						whatsappSubscriptionStatus
					}
				}
			} = body;

			expect(accessTokenReActivatedAtUTC).not.be.undefined.and.not.be.null;
			expect(email).to.be.equal(email);
			expect(cognitoId).to.equal(`37390dd5-8883-4f5d-8533-1e172b8f98c9`).and.not.be.undefined.and.not.be.null;
			expect(createdAtUTC).not.be.undefined.and.not.be.null;
			expect(emailVerificationStatus).to.be.equal(`Verified`);
			expect(expiresAt).not.be.undefined.and.not.be.null;
			expect(familyname).to.be.equal(`Kiran`);
			expect(fbUserAccessToken).not.to.be.undefined.and.not.to.be.null;
			expect(fbUserId).not.to.be.undefined.and.not.to.be.null;
			expect(fullname).to.be.equal(`Ravi Kiran`);
			expect(givenname).to.be.equal(`Ravi`);
			expect(hasAccessToReportGenerationFeature).to.be.equal(true);
			expect(id).to.be.equal(`3a4930da-3da0-4dd2-9cbf-e9ca3860de66`);
			expect(loginMethod).to.be.equal(`Facebook`);
			expect(mobileCountryCode).to.be.equal(`IN`);
			expect(mobileDialCode).to.be.equal(`91`);
			expect(mobileNumberMasked).to.be.equal(`XXXXXX4233`);
			expect(personaSurvey).not.be.undefined.and.not.be.null;
			expect(profilePictureUrl).not.be.undefined.and.not.be.null;
			expect(receiveEmailNotifications).not.be.undefined.and.not.be.null;
			expect(receiveNotifications).not.be.undefined.and.not.be.null;
			expect(receiveWANotifications).not.be.undefined.and.not.be.null;
			expect(timezoneInfo).not.be.undefined.and.not.be.null;
			expect(username).to.be.equal(`ravi_wxjivxi_kiran@tfbnw.net`);
			expect(whatsappSubscriptionStatus).to.be.equal(`PendingConfirmation`);
		});
	});
});
