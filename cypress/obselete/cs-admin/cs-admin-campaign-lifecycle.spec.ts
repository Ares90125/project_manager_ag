import {generateRandomNumber} from '../../support/commands/ui';

describe(`CS admin campaign life cycle`, function () {
	let number = generateRandomNumber();
	let campaignName = `New Test Campaign ${number}`;
	const brandEmail: string = `bdbrand.mtf8kzil@mailosaur.io`;

	before(`login using credentials and save the session`, () => {
		cy.LoginAsCSAdmin();
		cy.contains(`Baby Destination`).click();
	});

	beforeEach(`restore the session from login`, function () {
		cy.InterceptRoute([`CreateCampaignTask`, `ListKeywords`]);
		cy.restoreLocalStorage();
		cy.visit(`/cs-admin/brands/2bad5887-6191-4797-acc3-ddeefc2673be/manage-brand-campaigns?v=old`);
	});

	it(`verify the new campaign user journey`, {tags: [`@pullRequest`]}, () => {
		cy.get(`.convo-btn-tertiary`).click();
		cy.AddCampaign(campaignName);
		cy.wait(`@ListKeywords`, {timeout: 120000});
		cy.contains(`Save as Draft`).should('be.disabled');
		cy.get(`[data-target="#finish-campaign"]`).as(`BtnFinishCampaign`).should(`be.disabled`);

		cy.AddCampaignDetails(`Campaign Brief`, `Campaign objective`);
		cy.AddCampaignTask(`Cs Admin Test Group`, `Post on time`, `Ravi Kiran (Admin)`, `Launch First`, {
			type: 'image',
			files: [`../fixtures/files/pictures/pic1.jpg`]
		});
		cy.getDataTestId(`button-save-campaign-task-details`).click();
		cy.AddCampaignBrandEmail(brandEmail);

		//Finish
		cy.get(`@BtnFinishCampaign`)
			.should(`be.enabled`)
			.click()
			.get(`.modal-content`)
			.contains(` Accept `)
			.click()
			.wait(`@CreateCampaignTask`, {timeout: 30000})
			.get(`.toast-title`, {timeout: 60000})
			.should(`have.text`, ` Campaign created successfully `);

		//Assert
		cy.get(`.nav-item`)
			.filter(`:contains("Pending Approval ")`)
			.click()
			.get(`.campaign-row-header`)
			.filter(`:contains("${campaignName}")`)
			.as(`createdCampaign`)
			.should(`contain.text`, `Pending...`);

		//Accept campaign by brand
		cy.get(`#dropdownMenuButton`).should(`be.visible`).click();
		cy.getDataCsLabel(`Log out`).should(`be.visible`).click();
		cy.LoginAsOtherAdmin('baby_destination@convosight.com', '!?}HI?-3uZ');
		cy.AcceptCampaign(campaignName);
		cy.reload();
		//Cs-admin Login to verify campaign is moved to scheduled
		//@ts-ignore
		cy.get(`#dropdownMenuButton`).click();
		cy.getDataCsLabel(`Log out`).should(`be.visible`).click();
		cy.LoginAsOtherAdmin('csadmin@convosight.com', 'EXb5Xj%Y6');
		cy.contains(`Baby Destination`).click();
		cy.get(`.nav-item`)
			.filter(`:contains("Scheduled ")`)
			.click()
			.get(`@createdCampaign`)
			.should(`contain.text`, `Scheduled`);
	});

	it(`verify cs admin able to create a new task for a scheduled campaign`, {tags: [`@pullRequest`]}, () => {
		cy.contains(`.nav-item`, `Scheduled `)
			.click()
			.get(`.campaign-row-header`)
			.filter(`:contains("${campaignName}")`)
			.within(() => {
				cy.get(`.dropdown-toggle > svg`).click().get(`.convo-dropdown-wrapper`).click();
			});
		cy.get(`#daily-report-task-tab`).click();
		cy.AddCampaignTask(`Cs Admin Test Group`, `Post on time`, `Ravi Kiran (Admin)`, `Launch Second`, {
			type: 'image',
			files: [`../fixtures/files/pictures/pic1.jpg`]
		});
	});

	it(`verify the admin able to accept the assigned campaign`, {tags: [`@pullRequest`]}, () => {
		cy.fixture(`api-test/convosightLoginWithGroups.json`).then(session => {
			cy.RestoreSession(session);
		});
		cy.visit('group-admin/manage');
		cy.getDataCsLabel(`Campaigns`).eq(0).click();
		cy.getDataTestId(`${campaignName}-action-btn`).should(`have.length`, 1).scrollIntoView().click({force: true});
		cy.getDataTestId(`tasks-tab`).click();
		cy.getDataTestId(`${campaignName}-accept`).first().click({force: true});
		//cy.getDataCsLabel(`Close`).should(`exist`).getDataCsLabel(`Visit Schedule Posts`).click();
	});

	it.skip(`verify the email are delivered`, () => {
		cy.VerifyEmailWithSubject(`Campaign Approval`)
			.VerifyEmailWithSubject(`Campaign Approved`)
			.VerifyEmailWithSubject(`Campaign Assigned`);
	});

	after(() => {
		cy.task(`deleteTestCampaigns`, {value: number});
	});
});
