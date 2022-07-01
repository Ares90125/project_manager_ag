import {generateRandomNumber} from '../../support/commands/ui';

describe(`CS admin listening campaign life cycle`, function () {
	const number = generateRandomNumber();
	let campaignType = `Listening`;
	let campaignName = `New Test Campaign ${number}`;

	before(`login using credentials and save the session`, function () {
		cy.visit(`cs-admin-login`)
			.window()
			.its(`accountService`)
			.invoke(`login`, {
				username: this.credentialsJson.csAdmin.user,
				password: this.credentialsJson.csAdmin.password
			})
			.get(`[alt="convosight logo"]`, {timeout: 60000})
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

	beforeEach(`restore the session from login`, function () {
		cy.InterceptRoute([`CreateInsightViews`, `listInsightViews`, `ListKeywords`]);
		cy.restoreLocalStorage();
	});

	after(`Delete test campaign New Test Campaign`, () => {
		cy.task(`deleteTestCampaigns`, {value: number});
	});

	it(`C10666: Verify the fields present on the Edit Campaign Details screen.`, () => {
		cy.visit(`cs-admin/manage-brands`);
		cy.contains(`Baby Destination`).click();
		cy.visit(`/cs-admin/brands/2bad5887-6191-4797-acc3-ddeefc2673be/manage-brand-campaigns?v=old`);
		cy.get(`span:contains("Campaigns")`).should(`exist`).get(`.convo-btn-tertiary`).should(`be.visible`).click();
		cy.get(`[placeholder="Campaign name"]`)
			.type(campaignName)
			.get(`button`)
			.contains(`Next`)
			.click()
			.get(`li`)
			.contains(campaignType)
			.click()
			.get(`button`)
			.contains(` Continue `)
			.click();
		cy.get(`input[placeholder="Leave blank to use campaign name instead"]`)
			.should(`exist`)
			.as('CampaignName')
			.should(`be.enabled`);
		cy.get(`input[formcontrolname="startDate"]`).should(`be.visible`).should(`be.enabled`);
		cy.get(`[data-placeholder='Add Campaign brief']`).should(`be.visible`);
		cy.get(`[data-placeholder='Add Campaign objective']`).should(`be.visible`);
		cy.getDataTestId(`drop-down-category-listening-campaign`).should(`be.visible`);
		cy.getDataTestId(`drop-down-sub-category-listening-campaign`).should(`be.visible`);
		cy.getDataTestId(`drop-down-brand-listening-campaign`).should(`be.visible`);
	});

	it(`C10729: Verify that Name for listening campaign field is auto populated with the name provided by user on Name new campaign screen.`, () => {
		cy.get(`[formcontrolname="campaignName"]`).should(`have.value`, campaignName);
	});

	it(`C10718: Verify user is not able to create a campaign without populating mandatory fields.`, () => {
		cy.get(`[class="convo-btn-primary convo-btn-normal ml-2"]:contains('Save')`).as(`Save`).should(`be.disabled`);
		cy.StartDateEndDate(22, 30);
		cy.get(`@Save`).should(`be.disabled`);
		cy.get(`[data-placeholder="Add Campaign brief"]`).type('Testing Save button after populating brief.');
		cy.get(`@Save`).should(`be.disabled`);
		cy.get(`[data-placeholder="Add Campaign objective"]`).type('Testing Save button after populating Objective.');
		cy.get(`@Save`).should(`be.disabled`);
		cy.SelectCategorySubBrand('Makeup');
		cy.get(`@Save`).should(`be.disabled`);
		cy.SelectCategorySubBrand(undefined, 'Makeup');
		cy.get(`@Save`).should(`be.disabled`);
		cy.SelectCategorySubBrand(undefined, undefined, undefined, 'Music Flower');
		cy.get(`@Save`).should(`be.disabled`);
		cy.get(`input[formcontrolname="startDate"]`).dblclick().clear();
		cy.FileUpload(`input[type="File"]`, `../fixtures/files/Worksheets/groupids.csv`);
		cy.get(`a[style]`).should(`be.visible`);
		cy.get(`@Save`).should(`be.disabled`);
	});
	it(`C10728: Verify that asterisk is present beside the mandatory fields.`, () => {
		cy.getDataTestId(`text-asterisk-start-date-listening-campaign`).should(`be.visible`);
		cy.getDataTestId(`text-asterisk-end-date-listening-campaign`).should(`be.visible`);
		cy.getDataTestId(`text-asterisk-category-listening-campaign`).should(`be.visible`);
		cy.getDataTestId(`text-asterisk-sub-category-listening-campaign`).should(`be.visible`);
		cy.getDataTestId(`text-asterisk-brand-listening-campaign`).should(`be.visible`);
		cy.getDataTestId(`text-asterisk-group-id-listening-campaign`).should(`be.visible`);
	});
	it(`C10720: Verify user is not able to upload group ids from docx file`, () => {
		cy.FileUpload(`input[type="File"]`, `../fixtures/files/Worksheets/groupids.docx`);
		cy.getDataTestId(`dialog-incorrect-file-listeing-campaign`).within(() => {
			cy.get(`h6`).should(`be.visible`).should(`have.text`, `Incorrect file format`);
			cy.get(`p`).should(`be.visible`).should(`have.text`, `Only files with .csv, .xls or .xlsx extension are allowed`);
		});
		cy.contains(`button`, `Got it`).should(`be.visible`).click({scrollBehavior: `nearest`});
		cy.get(`a[style]`).should(`not.exist`);
	});

	it(`C10720.1: Verify user is not able to upload group ids from csv file having incorrect format`, () => {
		cy.FileUpload(`input[type="File"]`, `../fixtures/files/Worksheets/InvalidContent.csv`);
		cy.get(`#show-file-data-error-message`).within(() => {
			cy.get(`h6`).should(`be.visible`).should(`have.text`, `Incorrect file`);
			cy.get(`p`).should(`be.visible`).should(`have.text`, `Download sample template for reference`);
			cy.contains(`button`, `Got it`).should(`be.visible`).click({scrollBehavior: `nearest`});
		});

		cy.get(`a[style]`).should(`not.exist`);
	});
});
