import {generateRandomNumber} from '../../support/commands/ui';

describe(`CS admin listening campaign life cycle`, function () {
	let number: any = generateRandomNumber();
	let campaignName = `New Test Campaign ${number}`;
	let campaigntype = `Listening`;

	before(`login using credentials and save the session`, () => {
		cy.InterceptRoute(`GetBrandsByUserId`);
		cy.LoginAsCSAdmin();
		cy.contains(`Baby Destination`).click();
	});

	beforeEach(`restore the session from login`, function () {
		cy.restoreLocalStorage();
		cy.visit(`cs-admin/manage-brands`);
		cy.contains(`Baby Destination`).click();
		//dummycommit
		cy.get(`span:contains("Campaigns")`).should(`exist`).get(`.convo-btn-tertiary`).should(`be.visible`).click();
	});
	it(`C10665: Verify user has the option to create a new campaign of Listening  type.`, () => {
		cy.get(`[placeholder="Campaign name"]`).type(campaignName).get(`button`).contains(`Next`).click();
		cy.get(`li`).contains(campaigntype).should(`exist`);
	});
	it(`C10721: Verify Back button is working on Name new campaign and select a solution screen`, () => {
		cy.get(`[placeholder="Campaign name"]`)
			.as('NewCampaignName')
			.type(campaignName)
			.get(`button`)
			.contains(`Next`)
			.click();
		cy.get('.select-solution > .back-btn > span').should(`be.visible`).click();
		cy.get(`@NewCampaignName`).should(`be.visible`);
		cy.get(`.add-new-campaign > .back-btn > span`).should(`be.visible`).click();
		cy.get('span:contains("Campaigns")').should(`be.visible`);
	});
	it(`C10722: Verify Next button is disabled on Name new campaign screen if the field is blank.`, () => {
		cy.get(`[placeholder="Campaign name"]`).as('NewCampaignName').should(`have.value`, '');
		cy.get(`button`).contains(`Next`).should(`be.disabled`);
	});
	it(`C10723: Verify Next button is enabled on Name new campaign screen if the field is not blank.`, () => {
		cy.get(`[placeholder="Campaign name"]`).as('NewCampaignName').type(campaignName).should(`have.value`, campaignName);
		cy.get(`button`).contains(`Next`).should(`be.enabled`);
	});
	it(`C10725: Verify that Continue button is disabled or enabled,if user has selected or not selected a solution for the campaign.`, () => {
		cy.get(`[placeholder="Campaign name"]`).as('NewCampaignName').type(campaignName);
		cy.get(`button`).contains(`Next`).should(`be.enabled`).click();
		cy.get(`li`).contains(campaigntype).as(`campaign`).should(`not.be.selected`);
		cy.get(`button`).contains(` Continue `).as('Continuebtn').should(`be.disabled`);
		cy.get(`@campaign`).click();
		cy.get(`li`).filter(`.selected`).should(`exist`);
		cy.get(`@Continuebtn`).should(`be.enabled`);
	});

	after(() => {
		cy.task(`deleteTestCampaigns`, {value: number});
	});
});
