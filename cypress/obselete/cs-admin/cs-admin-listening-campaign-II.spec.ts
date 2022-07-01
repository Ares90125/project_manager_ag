import {generateRandomNumber} from '../../support/commands/ui';

describe(`CS admin listening campaign life cycle`, function () {
	const number = generateRandomNumber();
	let campaignType = `Listening`;
	let campaignName = `New Test Campaign ${number}`;

	before(`login using credentials and save the session`, function () {
		cy.visit(`cs-admin-login`);
		cy.window()
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
		//DummyCommit
	});

	afterEach(`Delete test campaign New Test Campaign`, () => {
		cy.task(`deleteTestCampaigns`, {value: number});
	});

	it(`C10733: Validate that user is able to cancel the changes made on the edit campaign detail screen.`, () => {
		cy.wait(`@ListKeywords`, {timeout: 120000});
		cy.StartDateEndDate(22, 30);
		cy.get(`[data-placeholder="Add Campaign brief"]`).type('Testing Save button after populating brief.');
		cy.get(`[data-placeholder="Add Campaign objective"]`).type('Testing Save button after populating Objective.');
		cy.SelectCategorySubBrand('Makeup', 'Makeup', undefined, 'Music Flower');
		cy.FileUpload(`input[type="File"]`, `../fixtures/files/Worksheets/groupids.csv`);
		cy.get(`a[style]`).as('downloadsheet').should(`be.visible`);
		cy.get(`.btn-cancel`).should(`be.visible`).click();
		cy.get(`[formcontrolname='campaignName']`).should(`have.value`, campaignName);
		cy.get(`[formcontrolname='startDate']`).should(`have.value`, '');
		cy.get(`[formcontrolname='endDate']`).should(`have.value`, '');
		cy.getDataTestId(`drop-down-category-listening-campaign`).should(`be.visible`);
		cy.getDataTestId(`drop-down-sub-category-listening-campaign`).should(`be.visible`);
		cy.getDataTestId(`drop-down-brand-listening-campaign`).should(`be.visible`);
		cy.get(`@downloadsheet`).should(`not.exist`);
	});

	it(`C10717: Verify user  is able to create a new campaign.`, {tags: [`@pullRequest`]}, () => {
		cy.wait(`@ListKeywords`, {timeout: 120000});
		cy.StartDateEndDate(22, 30);
		cy.SelectCategorySubBrand('Makeup', 'Makeup', undefined, 'Music Flower');
		cy.FileUpload(`input[type="File"]`, `../fixtures/files/Worksheets/groupids.csv`);
		cy.get(`a[style]`).should(`be.visible`);
		cy.get(`[class="convo-btn-primary convo-btn-normal ml-2"]:contains('Save')`).should(`be.enabled`).click();
		cy.wait('@CreateInsightViews', {timeout: 30000});
		cy.get(`.toast-title`, {timeout: 60000})
			.should(`be.visible`)
			.should(`have.text`, ` Campaign details updated successfully `);
		cy.get(`.campaign-row-header`)
			.filter(`:contains("${campaignName}")`)
			.as(`createdCampaign`)
			.should(`contain.text`, `Active`);
		cy.get(`.nav-item`).filter(`:contains("Active")`).click().get(`@createdCampaign`).should(`contain.text`, `Active`);
	});

	it(`C11051: Verify that the user is able to create a campaign with multiple sub categories.`, () => {
		cy.wait(`@ListKeywords`, {timeout: 120000});
		cy.StartDateEndDate(22, 30);
		cy.SelectCategorySubBrand('Total Recipes & Dessert', 'Butter', `Milkmaid`, 'President');
		cy.FileUpload(`input[type="File"]`, `../fixtures/files/Worksheets/groupids.csv`);
		cy.get(`a[style]`).should(`be.visible`);
		cy.get(`[class="convo-btn-primary convo-btn-normal ml-2"]:contains('Save')`).should(`be.enabled`).click();
		cy.wait('@CreateInsightViews', {timeout: 30000});
		cy.get(`.toast-title`, {timeout: 60000})
			.should(`be.visible`)
			.should(`have.text`, ` Campaign details updated successfully `);
		cy.get(`.campaign-row-header`).filter(`:contains("${campaignName}")`).should(`contain.text`, `Active`);
	});

	it(`C10891: Validate that user is able to edit the changes on the existing campaign.`, () => {
		cy.StartDateEndDate(22, 30);
		cy.SelectCategorySubBrand('Total Recipes & Dessert', 'Butter', `Milkmaid`, 'President');
		cy.FileUpload(`input[type="File"]`, `../fixtures/files/Worksheets/groupids.csv`);
		cy.get(`a[style]`).should(`be.visible`);
		cy.get(`[class="convo-btn-primary convo-btn-normal ml-2"]:contains('Save')`).should(`be.enabled`).click();
		cy.get(`.toast-title`, {timeout: 60000})
			.should(`be.visible`)
			.should(`have.text`, ` Campaign details updated successfully `);
		cy.get(`.campaign-row-header`)
			.filter(`:contains("${campaignName}")`)
			.as(`createdCampaign`)
			.should(`contain.text`, `Active`)
			.within(() => {
				cy.get(`.d-inline-block > .dropdown-toggle`).should(`be.visible`).click();
				cy.get(`button[class='dropdown-item ng-star-inserted']`).should(`be.visible`).click();
			});
		cy.get(`.form-control`).eq(0).should(`be.visible`).clear().type(`New Test Campaign 772`);
		cy.get(`.box-actions > .convo-btn-primary`).should(`have.text`, ' Save Changes ').should(`be.visible`).click();
		cy.get(`.toast-title`, {timeout: 60000})
			.should(`be.visible`)
			.should(`have.text`, ` Campaign details updated successfully `);
		cy.contains(`.campaign-row-header`, `New Test Campaign 772`).should(`contain.text`, `Active`);
		cy.task(`deleteTestCampaigns`, {value: 772});
	});
});
