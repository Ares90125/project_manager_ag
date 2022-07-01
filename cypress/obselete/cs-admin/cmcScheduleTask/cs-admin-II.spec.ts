describe(`CS Admin Test Suite`, function () {
	before(`login using credentials and save the session`, function () {
		cy.LoginAsCSAdmin();
	});

	beforeEach(`restore the session from login`, function () {
		cy.restoreLocalStorage();
	});
	//dummy
	it(`verifies the header for group admin navigation items`, {tags: [`@pullRequest`]}, function () {
		cy.visit(`cs-admin/manage-brands`);
		cy.getDataCsLabel(`Groups`).should(`not.exist`);
		cy.getDataCsLabel(`Schedule posts`).should(`not.exist`);
		cy.getDataCsLabel(`Campaigns`).should(`not.exist`);
		cy.getDataCsLabel(`Privacy policy`).should(`not.exist`);
		cy.getDataCsLabel(`Product tour`).should(`not.exist`);
		cy.getDataCsLabel(`Bell`).should(`not.exist`);
		cy.get(`[routerlink="/cs-admin/manage-brands"]`).should(`be.visible`);
		cy.getDataCsLabel(`Account`).should(`be.visible`);
		cy.contains(`Baby Destination`).click();
		cy.get(`.brand-dropdown-button > figcaption`).should(`contain.text`, 'Baby Destination');
	});

	it(`verifies the campaign add details validations`, function () {
		cy.visit(`/cs-admin/brands/2bad5887-6191-4797-acc3-ddeefc2673be/manage-brand-campaigns?v=old`, {timeout: 90000});
		cy.get(`.convo-btn-tertiary.convo-btn-normal`).click();
		cy.AddCampaign(`Test Validation`);
		cy.AddCampaignDetails(`Campaign Brief`, `Campaign objective`);
	});

	it(`verifies the cs admin able to publish a post successfully with Text`, function () {
		cy.visit(`/cs-admin/brands/2bad5887-6191-4797-acc3-ddeefc2673be/manage-brand-campaigns?v=old`, {timeout: 90000});
		cy.get(`.convo-btn-tertiary.convo-btn-normal`).click();
		cy.AddCampaign(`Test Validation`);
		cy.AddCampaignDetails(`Campaign Brief`, `Campaign objective`);
		cy.AddCampaignTask(`Cs Admin Test Group`, `post on time`, `Ravi Kiran (Admin)`, `Launch`, {
			type: 'text',
			content: `this is a text post`
		});
	});

	it(`verifies the cs admin able to publish a post successfully with Text with Emoji's and Image`, function () {
		cy.visit(`/cs-admin/brands/2bad5887-6191-4797-acc3-ddeefc2673be/manage-brand-campaigns?v=old`, {timeout: 90000});
		cy.get(`.convo-btn-tertiary.convo-btn-normal`).click();
		cy.AddCampaign(`Test Validation`);
		cy.AddCampaignDetails(`Campaign Brief`, `Campaign objective`);
		cy.AddCampaignTask(`Cs Admin Test Group`, `post on time`, `Ravi Kiran (Admin)`, `Launch`, {
			type: 'image',
			files: [`../fixtures/files/pictures/pic1.jpg`],
			content: `This is an image post with emojis`,
			emojis: [0, 1, 3]
		});
	});

	it(
		`verifies the cs admin able to publish a post successfully with text and Multiple Images`,
		{tags: [`@pullRequest`]},
		function () {
			cy.visit(`/cs-admin/brands/2bad5887-6191-4797-acc3-ddeefc2673be/manage-brand-campaigns?v=old`, {timeout: 90000});
			cy.get(`.convo-btn-tertiary.convo-btn-normal`).click();
			cy.AddCampaign(`Test Validation`);
			cy.AddCampaignDetails(`Campaign Brief`, `Campaign objective`);
			cy.AddCampaignTask(`Cs Admin Test Group`, `post on time`, `Ravi Kiran (Admin)`, `Launch`, {
				type: `image`,
				files: [`../fixtures/files/pictures/pic1.jpg`, `../fixtures/files/pictures/pic2.jpg`],
				content: `This is a multiple image post`
			});
		}
	);
});
