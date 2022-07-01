import dayjs from 'dayjs';

const FillCampaignDetails = () => {
	cy.get(`[formcontrolname="campaignName"]`).should(`be.visible`).type(`Test Campaign`);
	cy.get(`button[aria-label="Open calendar"]`).eq(0).realClick();
	cy.get(`[aria-label="Previous month"]`).click();
	cy.get(`[aria-label="Previous month"]`).click();
	cy.get(`.mat-calendar-body`).within(() => {
		cy.get(`[aria-label="${dayjs().subtract(2, `month`).format(`ddd MMM DD YYYY`)}"]`).click();
	});
	cy.get(`button[aria-label="Open calendar"]`).eq(1).click();
	cy.get(`.mat-calendar-body`).within(() => {
		cy.get(`[aria-label="${dayjs().format(`ddd MMM DD YYYY`)}"]`).click();
	});
	cy.getDataTestId(`button-drop-down`).as(`dropDown`).click();
	cy.contains(`[data-test-id="value-drop-down-checkbox"]`, ` Cs Admin Test Group `).should(`be.visible`).click();
	cy.contains(`[data-test-id="value-drop-down-checkbox"]`, ` Test group 2 `).should(`be.visible`).click();
	cy.get(`@dropDown`).should(`be.visible`).should(`have.text`, `Test group 2Cs Admin Test Group`).realClick();
};

const generateAndValidateCampaign = () => {
	cy.getDataCsLabel(`Generate your campaign report`).should(`be.visible`).should(`be.enabled`).click();
	cy.wait(`@CreateSelfMonetizationCampaign`, {responseTimeout: 30000}).then(res =>
		cy.wrap(res.response.body.data.createSelfMonetizationCampaign.campaignId).as(`campaignId`)
	);
	cy.getDataTestId(`campaign-name`).should(`be.visible`).should(`have.text`, `Test Campaign`);
	const duration = dayjs().subtract(2, `month`).format(`DD MMM, YYYY`) + ' - ' + dayjs().format(`DD MMM, YYYY`);
	cy.getDataTestId(`campaign-duration`)
		.should(`be.visible`)
		.should(`contain.text`, `Campaign duration : ` + duration + ` `);
	cy.getDataTestId(`subheading-generated-report`)
		.should(`be.visible`)
		.should(
			`have.text`,
			` The data in this report may deviate from actual numbers as Facebook does not send some type of data over APIs. Learn more`
		);
	cy.getDataCsLabel(`Learn more`).should(
		`have.attr`,
		`href`,
		`https://www.notion.so/Why-are-the-numbers-in-my-Convosight-insights-report-lower-d8f880622eb744d1b7c30c5fd2efebc8`
	);
	cy.getDataTestId(`heading-generating-report`)
		.should(`be.visible`)
		.should(`have.text`, `Generating your campaign report...`);
	cy.get(`[data-test-id="img-generating-report"]`).should(`be.visible`);
	cy.get(`[data-test-id="subheading-generating-report"]`).should(
		`contain.text`,
		`It usually takes us between 15-30 minutes to build your report. We’ll send you a link to it over Whatsapp and email once it is ready!`
	);
};

const NavigateToCampaigns = () => {
	cy.visit(`group-admin/campaigns`);
	cy.getDataCsLabel(`View your reports`).should(`be.visible`).click();
	cy.getDataCsLabel(`Create new Report`).should(`be.visible`).click();
	cy.getDataTestId(`heading-create-new-report`).should(`be.visible`).should(`have.text`, `Create a new report`);
	cy.InterceptRoute([`CreateSelfMonetizationCampaign`]);
};

const DeleteCampaign = () => {
	cy.get(`@campaignId`).then(campaignId => {
		cy.task(`deleteTestCampaignsByCampaignId`, {value: campaignId});
	});
};
describe('Self Monetization Campaign test cases', function () {
	before('login using facebook', () => {
		cy.fixture(`api-test/convosightLoginWithGroups.json`).then(session => {
			cy.RestoreSession(session);
		});
		cy.visit(`/login-response`).saveLocalStorage();
		cy.visit('group-admin/manage');
	});

	beforeEach(() => {
		cy.restoreLocalStorage();
	});

	it('C23477912 : To verify that User is able to create report with Brand name variation only without keyword and hashtags', () => {
		NavigateToCampaigns();
		FillCampaignDetails();
		cy.getDataTestId(`input-brand-mention`).should(`be.visible`).type(`Test,Posted,This,is,`);
		cy.getDataTestId(`brand-keyword`).eq(0).should(`be.visible`).should(`contain.text`, `Test`);
		cy.getDataTestId(`brand-keyword`).eq(1).should(`be.visible`).should(`contain.text`, `Posted`);
		generateAndValidateCampaign();
		cy.getDataCsLabel(`Back`).should(`be.visible`).click();
		cy.contains(`.report-card`, `Test Campaign`).should(`be.visible`);
		DeleteCampaign();
	});

	it('C23477913 : To verify that User is able to create report with Keyword & only without Brand name variations', () => {
		NavigateToCampaigns();
		FillCampaignDetails();
		cy.getDataTestId(`input-keyword-tile`).should(`be.visible`).type(`#Test,#Posted,#this,is`);
		cy.getDataTestId(`keyword-tile`).eq(0).should(`be.visible`).should(`contain.text`, `#Test`);
		cy.getDataTestId(`keyword-tile`).eq(1).should(`be.visible`).should(`contain.text`, `#Posted`);
		generateAndValidateCampaign();
		DeleteCampaign();
	});

	it('C23477919 : To verify the generated report having both brand names and keywords & hashtags data + more than one group', () => {
		NavigateToCampaigns();
		FillCampaignDetails();
		cy.getDataTestId(`input-brand-mention`).should(`be.visible`).type(`Test,Posted,this,is,`);
		cy.getDataTestId(`brand-keyword`).eq(0).should(`be.visible`).should(`contain.text`, `Test`);
		cy.getDataTestId(`brand-keyword`).eq(1).should(`be.visible`).should(`contain.text`, `Posted`);
		cy.getDataTestId(`input-keyword-tile`).should(`be.visible`).type(`#Test,#Posted,`);
		cy.getDataTestId(`keyword-tile`).eq(0).should(`be.visible`).should(`contain.text`, `#Test`);
		cy.getDataTestId(`keyword-tile`).eq(1).should(`be.visible`).should(`contain.text`, `#Posted`);
		generateAndValidateCampaign();
	});

	it.skip('C23477917 : To verify the WA subscription flow is working fine from Report generator success screen', () => {
		const path = `mock-responses/update-whatsapp.spec`;
		cy.MockQueryUsingFile(`GetUserDetails`, path).MockQueryUsingFile(`UpdateUser`, path);
		NavigateToCampaigns();
		FillCampaignDetails();
		cy.getDataTestId(`input-brand-mention`).should(`be.visible`).type(`Test,Posted,this,is,`);
		cy.getDataTestId(`brand-keyword`).eq(0).should(`be.visible`).should(`contain.text`, `Test`);
		cy.getDataTestId(`brand-keyword`).eq(1).should(`be.visible`).should(`contain.text`, `Posted`);
		cy.getDataTestId(`input-keyword-tile`).should(`be.visible`).type(`#Test,#Posted,`);
		cy.getDataTestId(`keyword-tile`).eq(0).should(`be.visible`).should(`contain.text`, `#Test`);
		cy.getDataTestId(`keyword-tile`).eq(1).should(`be.visible`).should(`contain.text`, `#Posted`);
		generateAndValidateCampaign();
		cy.getDataCsLabel(`Not subscribed to Whatsapp? Subscribe now`)
			.should(`be.visible`)
			.should(`have.text`, `Not subscribed to Whatsapp? Subscribe now`)
			.click();
		cy.getDataTestId(`whatsapp-pop-up-heading`)
			.eq(0)
			.should(`be.visible`)
			.should(`contain.text`, `Subscribe to Whatsapp updates`);
		cy.getDataTestId(`subheading-whatsapp-pop-up`)
			.should(`be.visible`)
			.should(
				`contain.text`,
				`Receive campaign updates and other notifications to monetise and manage your group better.`
			);
		cy.get(`[type="tel"]`).type(`9292923232`).getDataCsLabel(`Confirm`).click();
		cy.getDataCsLabel(`Did not receive a message?`).should(`be.visible`).click();
		cy.getDataTestId(`heading-did-not-receive-msg`).should(`be.visible`);
		cy.getDataCsLabel(`Continue`).should(`be.visible`).click();
	});

	it('C23477922 : To verify that User is able to click on Edit button and lands on edit report screen', () => {
		cy.InterceptRoute(`updateSelfMonetizationCampaignDetails`);
		cy.getDataCsLabel(`Edit`).should(`be.visible`).should(`have.text`, `Edit`).click();
		cy.getDataTestId(`heading-edit-report`).should(`be.visible`).should(`have.text`, `Edit report`);
		cy.get(`[formcontrolname="campaignName"]`).should(`be.visible`).clear().type(`Test Campaign Edited`);
		cy.get(`button[aria-label="Open calendar"]`).eq(0).realClick();
		cy.get(`[aria-label="Previous month"]`).click();
		cy.get(`.mat-calendar-body`).within(() => {
			cy.get(`[aria-label="${dayjs().subtract(3, `month`).format(`ddd MMM DD YYYY`)}"]`).click();
		});
		cy.get(`button[aria-label="Open calendar"]`).eq(1).click();
		cy.get(`.mat-calendar-body`).within(() => {
			cy.get(`[aria-label="${dayjs().format(`ddd MMM DD YYYY`)}"]`).click();
		});
		cy.getDataTestId(`button-drop-down`).as(`dropDown`).click();
		cy.contains(`[data-test-id="value-drop-down-checkbox"]`, ` Test group 2 `).should(`be.visible`).click();
		cy.get(`@dropDown`).should(`be.visible`).should(`have.text`, `Cs Admin Test Group`).realClick();
		cy.get(`.convo-btn-primary`)
			.should(`be.visible`)
			.should(`have.text`, ` Save changes & update report `)
			.should(`be.enabled`)
			.click();
		cy.wait(`@updateSelfMonetizationCampaignDetails`, {timeout: 30000}).then(res =>
			cy.wrap(res.response.body.data.updateSelfMonetizationCampaignDetails.campaignId).as(`campaignId`)
		);
		cy.getDataTestId(`campaign-name`).should(`be.visible`).should(`have.text`, `Test Campaign Edited`);
		const duration = dayjs().subtract(3, `month`).format(`DD MMM, YYYY`) + ' - ' + dayjs().format(`DD MMM, YYYY`);
		cy.getDataTestId(`campaign-duration`)
			.should(`be.visible`)
			.should(`contain.text`, `Campaign duration : ` + duration + ` `);
		cy.getDataTestId(`subheading-generated-report`)
			.should(`be.visible`)
			.should(
				`have.text`,
				` The data in this report may deviate from actual numbers as Facebook does not send some type of data over APIs. Learn more`
			);
		cy.getDataCsLabel(`Learn more`).should(
			`have.attr`,
			`href`,
			`https://www.notion.so/Why-are-the-numbers-in-my-Convosight-insights-report-lower-d8f880622eb744d1b7c30c5fd2efebc8`
		);
		cy.getDataTestId(`heading-generating-report`)
			.should(`be.visible`)
			.should(`have.text`, `Generating your campaign report...`);
		cy.get(`[data-test-id="img-generating-report"]`).should(`be.visible`);
		cy.get(`[data-test-id="subheading-generating-report"]`).should(
			`contain.text`,
			`It usually takes us between 15-30 minutes to build your report. We’ll send you a link to it over Whatsapp and email once it is ready!`
		);
		DeleteCampaign();
	});
});
