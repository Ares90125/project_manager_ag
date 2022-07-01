describe(`Schedule posts test cases`, () => {
	before('login using facebook', () => {
		cy.fixture(`api-test/convosightLoginWithGroups.json`).then(session => {
			cy.RestoreSession(session);
		});
		cy.visit(`/login-response`).saveLocalStorage();
	});
	beforeEach(`restore the session`, () => {
		cy.intercept({
			method: `PUT`,
			url: Cypress.env(`uploadUrl`)
		}).as(`uploadImage`);
		cy.restoreLocalStorage();
		cy.visit('group-admin/group/c40d1bd5-4737-40b3-9e40-de78b64454df/post/create?method=direct');
		cy.InterceptRoute([`CreateFbPostModel`, `ListFbPostModels`]);
	});
	it(`C34 : Verify the user as group admin not able to publish a post the image which the size is more than 4Mb`, () => {
		cy.InterceptRoute([`CreateFbPostModel`, `ListFbPostModels`]);
		cy.intercept({
			method: `HEAD`,
			url: Cypress.env(`compressionUrl`)
		}).as(`imageCall`);

		cy.get(`input[type="file"]`).attachFile(`../fixtures/files/pictures/big.pic1.jpg`);
		cy.wait(`@imageCall`, {timeout: 50000})
			.wait(5000)
			.get(`img.check-icon-blue`)
			.should(`exist`)
			.get(`h5.text-center`)
			.should(`have.text`, `The image has been compressed successfully`)
			.get(`[data-cs-label="Confirm"]`)
			.click();
		cy.get(`.thumbnail.image`).should(`have.length`, 1);
		cy.get(`.publish-btn`).eq(0).should(`be.visible`).click();
		cy.wait(`@CreateFbPostModel`, {timeout: 60000})
			.its(`request.body.variables.input.contentType`)
			.should(`eq`, `Photo`);
		cy.wait(`@ListFbPostModels`, {timeout: 60000});
	});
	it(`C31 : Verify the user as group admin able to publish a post successfully with image as format PNG`, () => {
		cy.get(`input[type="file"]`).attachFile(`../fixtures/files/pictures/png.pic1.png`);
		cy.get(`.thumbnail.image`).should(`have.length`, 1);
		cy.get(`.publish-btn`).eq(0).should(`be.visible`).click();
		cy.wait(`@uploadImage`);
		cy.wait(`@CreateFbPostModel`, {timeout: 60000})
			.its(`request.body.variables.input.contentType`)
			.should(`eq`, `Photo`);
		cy.wait(`@ListFbPostModels`, {timeout: 60000});
	});

	it(
		`C32 : Verify the user as group admin able to publish a post successfully with image as format GIF`,
		{tags: [`@pullRequest`]},
		() => {
			cy.get(`input[type="file"]`).attachFile(`../fixtures/files/pictures/gif.pic1.gif`);
			cy.getDataTestId(`thumbnail-video-post-text-area`).should(`have.length`, 1);
			cy.get(`.publish-btn`).eq(0).should(`be.visible`).click();
			cy.wait(`@uploadImage`);
			cy.wait(`@CreateFbPostModel`, {timeout: 60000})
				.its(`request.body.variables.input.contentType`)
				.should(`eq`, `Video`);
			cy.wait(`@ListFbPostModels`, {timeout: 60000});
		}
	);

	it(`C33 : Verify the user as group admin able to publish a post successfully with image as format TIFF`, () => {
		cy.get(`input[type="file"]`).attachFile(`../fixtures/files/pictures/tiff.pic1.tiff`);
		cy.get(`.thumbnail.image`).should(`have.length`, 1);
		cy.get(`.publish-btn`).eq(0).should(`be.visible`).click();
		cy.wait(`@uploadImage`);
		cy.wait(`@CreateFbPostModel`, {timeout: 60000})
			.its(`request.body.variables.input.contentType`)
			.should(`eq`, `Photo`);
		cy.wait(`@ListFbPostModels`, {timeout: 60000});
	});
});
