import {mutation} from 'gql-query-builder';
import {DateTime} from '@sharedModule/models/date-time';
let csAdminAuth;

Cypress.Commands.add(`LoginAsCSAdmin`, function () {
	cy.clearCookies().clearLocalStorage();
	cy.InterceptRoute(`UpdateUser`);
	cy.visit(`cs-admin-login`);
	return cy
		.window()
		.its(`accountService`)
		.invoke(`login`, {
			username: this.credentialsJson.csAdmin.user,
			password: this.credentialsJson.csAdmin.password
		})
		.wait(`@UpdateUser`, {timeout: 30000})
		.its(`request.headers.authorization`)
		.then(auth => (csAdminAuth = auth))
		.get(`[alt="convosight logo"]`, {timeout: 45000})
		.should(`be.visible`)
		.getCookies()
		.then((cookies: any) => {
			Cypress.Cookies.defaults({
				preserve: cookies.map(cookie => cookie.name)
			});
		})
		.as(`csAdminCookies`)
		.saveLocalStorage()
		.contains(`Baby Destination`)
		.click();
});

Cypress.Commands.add(`CreateCampaignWithApi`, (campaignName: string, brandId: string) =>
	cy.fixture(`api-test/user-data.json`).then(({brandDetails: {logoUrl, email}}: any) => {
		const createCMCampaign = mutation({
			operation: `createCMCampaign`,
			variables: {
				input: {
					value: {
						KPIs: '["CRM Leads","Brand Mentions"]',
						brandId: brandId,
						brandLogoURL: logoUrl,
						brandName: `Baby Destination`,
						campaignName: campaignName,
						campaignPeriod: 'Phase 1',
						cmcReportVersion: 2,
						cmcType: '["User Generated Content (UGC)","Lead Generation"]',
						details: '<p>campaign brief</p>',
						endDateAtUTC: new DateTime().utc().startOf('day').add(10, 'days').format(),
						keywordBrand: 'Baby Destination',
						keywords: ['Dettol_Detol|Dtl|Deettol'],
						keywordCategory: 'Hair',
						keywordSubCategories: ['Hair', 'Salon Hair Colour'],
						primaryObjective: 'Objective',
						proposalEmails: `[${email}]`,
						startDateAtUTC: new DateTime().utc().format(),
						status: 'Draft'
					},
					required: true,
					type: 'CreateCMCampaignInput'
				}
			},
			fields: [`brandName`, `campaignId`]
		});

		return cy.request({
			method: `POST`,
			url: Cypress.env(`developAppSyncUrl`),
			headers: {
				authorization: csAdminAuth
			},
			body: createCMCampaign
		});
	})
);
