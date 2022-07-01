import {ConvosightLoginNoGroups, ConvosightLoginWithGroups, GetAuthToken} from './cypress/cookie-extractor/scripts';
import data from './cypress/fixtures/users.json';
import axios from 'axios';

const fs = require('fs').promises;

async function GetCognitoAuthToken(username: string, password: string): Promise<any> {
	const url = `https://cognito-idp.us-east-1.amazonaws.com/`;
	const clientSecret = `7j1h56mkgn374r27ph7oindlvn`;
	const body = {
		AuthParameters: {
			USERNAME: username,
			PASSWORD: password
		},
		AuthFlow: 'USER_PASSWORD_AUTH',
		ClientId: clientSecret
	};
	const response = await axios({
		url: url,
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-amz-json-1.1',
			'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth'
		},
		data: body
	});
	return response.data.AuthenticationResult.AccessToken;
}
const {
	groupAdmin: {user: groupAdminUser, password: groupAdminPassword},
	emailVerification: {user: emailVerificationUser, password: emailVerificationPassword},
	moderatorAccount: {user: moderatorAccountUser, password: moderatorAccountPassword},
	csAdmin: {user: csAdminUser, password: csAdminPassword},
	brandAdmin: {user: brandAdminUser, password: brandAdminPassword},
	moderatorAccountB: {user: moderatorAccountUserB, password: moderatorAccountPasswordB},
	userOneGroup: {user: oneGroupUser, password: oneGroupPassword},
	notificationUser: {user: notificationUser, password: notificationPassword},
	adminBioEnabledAndNotCompletedUser: {
		user: adminBioEnabledNotCompletedUser,
		password: adminBioEnabledNotCompletedUserPassword
	}
} = data;

async function generateTokens(): Promise<{
	groupToken: string;
	groupAdminToken: string;
	moderatorToken: string;
	brandAdminToken: string;
	csAdminToken: string;
	moderatorTokenB: string;
}> {
	const groupAdminToken = await GetAuthToken(groupAdminUser, groupAdminPassword);
	console.log(`Token generated for :`, groupAdminUser);
	const emailVerificationToken = await GetAuthToken(emailVerificationUser, emailVerificationPassword);
	console.log(`Token generated for :`, emailVerificationUser);
	const moderatorAccountToken = await GetAuthToken(moderatorAccountUser, moderatorAccountPassword);
	console.log(`Token generated for :`, moderatorAccountUser);
	const moderatorAccountTokenB = await GetAuthToken(moderatorAccountUserB, moderatorAccountPasswordB);
	console.log(`Token generated for :`, moderatorAccountUserB);
	const csAdminToken = await GetCognitoAuthToken(csAdminUser, csAdminPassword);
	console.log(`Token generated for :`, csAdminUser);
	const brandAdminToken = await GetCognitoAuthToken(brandAdminUser, brandAdminPassword);
	console.log(`Token generated for :`, brandAdminUser);
	return {
		groupToken: emailVerificationToken,
		groupAdminToken: groupAdminToken,
		moderatorToken: moderatorAccountToken,
		brandAdminToken: brandAdminToken,
		csAdminToken: csAdminToken,
		moderatorTokenB: moderatorAccountTokenB
	};
}

async function generateConvosightLoginWithGroupsCookies() {
	return await ConvosightLoginWithGroups(groupAdminUser, groupAdminPassword, `https://localhost:4200/login-response`);
}
async function generateConvosightLoginWithGroupsNotificationsCookies() {
	return await ConvosightLoginWithGroups(
		notificationUser,
		notificationPassword,
		`https://localhost:4200/login-response`
	);
}

async function generateConvosightLoginWithOneGroupCookies() {
	return await ConvosightLoginWithGroups(oneGroupUser, oneGroupPassword, `https://localhost:4200/login-response`);
}

async function generateConvosightLoginNoGroupsCookies() {
	return await ConvosightLoginNoGroups(
		emailVerificationUser,
		emailVerificationPassword,
		`https://localhost:4200/login-response`
	);
}

async function generateConvosightLoginWithAdminBioEnabledNotCompletedUserCookies() {
	return await ConvosightLoginWithGroups(
		adminBioEnabledNotCompletedUser,
		adminBioEnabledNotCompletedUserPassword,
		`https://localhost:4200/login-response`
	);
}

const path = `./cypress/fixtures/api-test/tokens.json`;
const convosightWithGroupsPath = `./cypress/fixtures/api-test/convosightLoginWithGroups.json`;
const convosightWithGroupsNotificationPath = `./cypress/fixtures/api-test/convosightWithGroupsNotificationPath.json`;
const convosightWithNoGroupsPath = `./cypress/fixtures/api-test/convosightWithNoGroups.json`;
const convosightWithOneGroupPath = `./cypress/fixtures/api-test/convosightWithOneGroup.json`;
const convosightWithAdminBioEnabledPath = `./cypress/fixtures/api-test/convosightLoginWithAdminBioEnabledNotCompletedUser.json`;

(async () => {
	const tokens = await generateTokens();
	await fs.writeFile(path, JSON.stringify(tokens, null, 2), 'utf8');
	const convosightWithGroupsSession = await generateConvosightLoginWithGroupsCookies();
	await fs.writeFile(convosightWithGroupsPath, JSON.stringify(convosightWithGroupsSession, null, 2), 'utf8');
	console.log(`cookies generation for generateConvosightLoginWithGroupsCookies`);
	// const convosightWithGroupsNotificationSession = await generateConvosightLoginWithGroupsNotificationsCookies();
	// await fs.writeFile(
	// 	convosightWithGroupsNotificationPath,
	// 	JSON.stringify(convosightWithGroupsNotificationSession, null, 2),
	// 	'utf8'
	// );
	// console.log(`cookies generation for convosightWithGroupsNotificationSession`);
	const convosightAdminBioEnabledSession = await generateConvosightLoginWithAdminBioEnabledNotCompletedUserCookies();
	await fs.writeFile(
		convosightWithAdminBioEnabledPath,
		JSON.stringify(convosightAdminBioEnabledSession, null, 2),
		'utf8'
	);
	console.log(`cookies generation for convosightAdminBioEnabledSession`);
	const convosightWithNoGroupsSession = await generateConvosightLoginNoGroupsCookies();
	await fs.writeFile(convosightWithNoGroupsPath, JSON.stringify(convosightWithNoGroupsSession, null, 2), 'utf8');
	console.log(`cookies generation for convosightWithNoGroupsSession`);
	const convosightWithOneGroupSession = await generateConvosightLoginWithOneGroupCookies();
	await fs.writeFile(convosightWithOneGroupPath, JSON.stringify(convosightWithOneGroupSession, null, 2), 'utf8');
	console.log(`cookies generation for convosightWithOneGroupsSession`);
	//await deleteTestCampaigns(`594`);
})().catch(e => {
	console.log(e);
	process.exit();
});
