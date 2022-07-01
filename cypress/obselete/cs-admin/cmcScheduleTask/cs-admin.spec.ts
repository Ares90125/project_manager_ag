describe(`CS Admin Test Suite`, function () {
	before(`login using credentials and save the session`, function () {
		cy.InterceptRoute(`GetBrandsByUserId`);
		cy.LoginAsCSAdmin();
	});

	beforeEach(`restore the session from login`, function () {
		cy.restoreLocalStorage();
	});

	it(`verifies the cs admin able to publish a post successfully with image as format TIFF`, function () {
		cy.visit(`cs-admin/manage-brands`);
		cy.contains(`Baby Destination`).click();
		cy.get(`.brand-dropdown-button > figcaption`).should(`contain.text`, 'Baby Destination');
		cy.contains(`Baby Destination`).click();
		cy.visit(`/cs-admin/brands/2bad5887-6191-4797-acc3-ddeefc2673be/manage-brand-campaigns?v=old`, {timeout: 90000});
		cy.get(`.convo-btn-tertiary.convo-btn-normal`).click();
		cy.AddCampaign(`Test Validation`);
		cy.AddCampaignDetails(`Campaign Brief`, `Campaign objective`);
		cy.AddCampaignTask(`Cs Admin Test Group`, `post on time`, `Ravi Kiran (Admin)`, `Launch`, {
			type: `image`,
			files: [`../fixtures/files/pictures/tiff.pic1.tiff`],
			content: `This is a gif image post`
		});
	});

	it(
		`verifies the cs admin not able to publish a post the image which the size is more than 4Mb`,
		{tags: [`@pullRequest`]},
		function () {
			cy.intercept({
				method: `HEAD`,
				url: Cypress.env(`compressionUrl`)
			}).as(`imageCall`);
			cy.visit(`/cs-admin/brands/2bad5887-6191-4797-acc3-ddeefc2673be/manage-brand-campaigns?v=old`, {timeout: 90000});
			cy.get(`.convo-btn-tertiary.convo-btn-normal`).click();
			cy.AddCampaign(`Test Validation`);
			cy.AddCampaignDetails(`Campaign Brief`, `Campaign objective`);
			cy.getDataTestId(`button-add-task`).click();
			cy.get(`.custom-upload > input[type="file"]`).attachFile(`../fixtures/files/pictures/big.pic1.jpg`);
			cy.get(`.text-center.heading-progress`).should(`have.text`, `Image is above 4mb, we are compressing it for you`);
			cy.wait(`@imageCall`, {timeout: 50000})
				.wait(5000)
				.get(`img.check-icon-blue`)
				.should(`exist`)
				.get(`h5.text-center`)
				.should(`have.text`, `The image has been compressed successfully`)
				.get(`[data-cs-label="Confirm"]`)
				.click();
		}
	);

	it(
		`verifies the cs admin able to publish a video successfully with size less than 200MB`,
		{tags: [`@pullRequest`]},
		function () {
			cy.visit(`/cs-admin/brands/2bad5887-6191-4797-acc3-ddeefc2673be/manage-brand-campaigns?v=old`, {timeout: 90000});
			cy.get(`.convo-btn-tertiary.convo-btn-normal`).click();
			cy.AddCampaign(`Test Validation`);
			cy.AddCampaignDetails(`Campaign Brief`, `Campaign objective`);
			cy.AddCampaignTask(`Cs Admin Test Group`, `post on time`, `Ravi Kiran (Admin)`, `Launch`, {
				type: `video`,
				files: [`../fixtures/files/videos/video1.mp4`],
				content: `This is a video post with file under 200mb`
			});
		}
	);

	it(`verifies the cs admin not able to publish a post with combination of video and image`, function () {
		cy.visit(`/cs-admin/brands/2bad5887-6191-4797-acc3-ddeefc2673be/manage-brand-campaigns?v=old`, {timeout: 90000});
		cy.get(`.convo-btn-tertiary.convo-btn-normal`).click();
		cy.AddCampaign(`Test Validation`);
		cy.AddCampaignDetails(`Campaign Brief`, `Campaign objective`);
		cy.getDataTestId(`button-add-task`).click();
		cy.get(`.custom-upload > input[type="file"]`).attachFile(`../fixtures/files/pictures/pic1.jpg`);
		cy.get(`.add-new-media > input[type="file"]`).attachFile(`../fixtures/files/videos/video1.mp4`);
		cy.get(`.modal-body > h5`).should(`have.text`, `Can not upload Video`);
		cy.get(`app-custom-post-text-area > .modal > .modal-dialog > .modal-content > .modal-body > .m-0`).should(
			`have.text`,
			`Videos and images cannot exist together in the same post.`
		);
	});

	it(`verifies the cs admin to publish a post with web link`, function () {
		cy.visit(`/cs-admin/brands/2bad5887-6191-4797-acc3-ddeefc2673be/manage-brand-campaigns?v=old`, {timeout: 90000});
		cy.get(`.convo-btn-tertiary.convo-btn-normal`).click();
		cy.AddCampaign(`Test Validation`);
		cy.AddCampaignDetails(`Campaign Brief`, `Campaign objective`);
		cy.AddCampaignTask(`Cs Admin Test Group`, `post on time`, `Ravi Kiran (Admin)`, `Launch`, {
			type: `text`,
			content: `https://www.convosight.com`
		});
	});

	it(`verifies the cs admin able to publish a post with the combination of web link and text`, function () {
		cy.visit(`/cs-admin/brands/2bad5887-6191-4797-acc3-ddeefc2673be/manage-brand-campaigns?v=old`, {timeout: 90000});
		cy.get(`.convo-btn-tertiary.convo-btn-normal`).click();
		cy.AddCampaign(`Test Validation`);
		cy.AddCampaignDetails(`Campaign Brief`, `Campaign objective`);
		cy.AddCampaignTask(`Cs Admin Test Group`, `post on time`, `Ravi Kiran (Admin)`, `Launch`, {
			type: `text`,
			content: `this is a web link and text post https://www.convosight.com`
		});
	});
});
