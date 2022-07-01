describe(`CS Admin Test Suite`, function () {
	before(`login using credentials and save the session`, function () {
		cy.InterceptRoute(`GetBrandsByUserId`);
		cy.LoginAsCSAdmin();
	});

	beforeEach(`restore the session from login`, function () {
		cy.restoreLocalStorage();
	});
	it(`verifies the cs admin able to publish a post successfully with image as format PNG`, function () {
		cy.visit(`/cs-admin/brands/2bad5887-6191-4797-acc3-ddeefc2673be/manage-brand-campaigns?v=old`, {timeout: 90000});
		cy.get(`.convo-btn-tertiary.convo-btn-normal`).click();
		cy.AddCampaign(`Test Validation`);
		cy.AddCampaignDetails(`Campaign Brief`, `Campaign objective`);
		cy.AddCampaignTask(`Cs Admin Test Group`, `post on time`, `Ravi Kiran (Admin)`, `Launch`, {
			type: `image`,
			files: [`../fixtures/files/pictures/png.pic1.png`],
			content: `This is a png image post`
		});
	});

	it(`verifies the cs admin able to publish a post successfully with image as format GIF`, function () {
		cy.visit(`/cs-admin/brands/2bad5887-6191-4797-acc3-ddeefc2673be/manage-brand-campaigns?v=old`, {timeout: 90000});
		cy.get(`.convo-btn-tertiary.convo-btn-normal`).click();
		cy.AddCampaign(`Test Validation`);
		cy.AddCampaignDetails(`Campaign Brief`, `Campaign objective`);
		cy.AddCampaignTask(`Cs Admin Test Group`, `post on time`, `Ravi Kiran (Admin)`, `Launch`, {
			type: `image`,
			files: [`../fixtures/files/pictures/gif.pic1.gif`],
			content: `This is a gif image post`
		});
	});
	it(`verifies the cs admin able to publish a post with the combination of web link, text and emojis`, function () {
		cy.visit(`/cs-admin/brands/2bad5887-6191-4797-acc3-ddeefc2673be/manage-brand-campaigns?v=old`, {timeout: 90000});
		cy.get(`.convo-btn-tertiary.convo-btn-normal`).click();
		cy.AddCampaign(`Test Validation`);
		cy.AddCampaignDetails(`Campaign Brief`, `Campaign objective`);
		cy.AddCampaignTask(`Cs Admin Test Group`, `post on time`, `Ravi Kiran (Admin)`, `Launch`, {
			type: `text`,
			content: `this is a web link and text post https://www.convosight.com`,
			emojis: [2, 13, 5]
		});
	});

	it(
		`verifies the cs admin able to publish a post with the combination of web link, text, emojis and images`,
		{tags: [`@pullRequest`]},
		function () {
			cy.visit(`/cs-admin/brands/2bad5887-6191-4797-acc3-ddeefc2673be/manage-brand-campaigns?v=old`, {timeout: 90000});
			cy.get(`.convo-btn-tertiary.convo-btn-normal`).click();
			cy.AddCampaign(`Test Validation`);
			cy.AddCampaignDetails(`Campaign Brief`, `Campaign objective`);
			cy.AddCampaignTask(`Cs Admin Test Group`, `post on time`, `Ravi Kiran (Admin)`, `Launch`, {
				type: `image`,
				content: `this is a web link and text post https://www.convosight.com`,
				emojis: [2, 13, 5],
				files: [`../fixtures/files/pictures/pic1.jpg`]
			});
		}
	);

	it(`verifies the cs admin is able to create a shell task`, function () {
		cy.visit(`/cs-admin/brands/2bad5887-6191-4797-acc3-ddeefc2673be/manage-brand-campaigns?v=old`, {timeout: 90000});
		cy.get(`.convo-btn-tertiary.convo-btn-normal`).click();
		cy.AddCampaign(`Test Validation`);
		cy.AddCampaignDetails(`Campaign Brief`, `Campaign objective`);
		cy.AddCampaignTask(`Cs Admin Test Group`, `post on time`, `Ravi Kiran (Admin)`, `Launch`, undefined, 2);
	});
});
