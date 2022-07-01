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
	it(
		`C35 : Verify the user as group admin able to publish a video successfully with size less than 200MB`,
		{tags: [`@pullRequest`]},
		() => {
			cy.get(`input[type="file"]`).attachFile(`../fixtures/files/videos/video1.mp4`);
			cy.get(`video`).should(`have.length`, 1);
			cy.get(`.publish-btn`).eq(0).should(`be.visible`).click();
			cy.wait(`@uploadImage`, {timeout: 30000});
			cy.wait(`@CreateFbPostModel`, {timeout: 60000})
				.its(`request.body.variables.input.contentType`)
				.should(`eq`, `Video`);
			cy.wait(`@ListFbPostModels`, {timeout: 60000});
		}
	);

	it(`C37 : Verify the user as group admin not able to publish a post with combination of video and image`, () => {
		cy.get(`input[type="file"]`).as(`fileInput`).attachFile(`../fixtures/files/videos/video1.mp4`);
		cy.get(`video`).as(`videoThumbnail`).should(`have.length`, 1);
		cy.get(`@fileInput`).attachFile(`../fixtures/files/pictures/tiff.pic1.tiff`);
		cy.get('app-custom-post-text-area > .modal > .modal-dialog > .modal-content > .modal-body').within(() => {
			cy.get(`h5`).should(`have.text`, `Can not upload Image`);
			cy.get(`.m-0`).should(`have.text`, `Videos and images cannot exist together in the same post.`);
		});
		cy.get(`.px-4`).click();
		cy.get(`@videoThumbnail`).should(`have.length`, 1);
	});

	it(`C38 : Verify user able to publish a post with website Links(Eg: www.convosight.com)`, () => {
		cy.get('#postMessage').type(`https://www.convosight.com`);
		cy.get(`.publish-btn`)
			.eq(0)
			.should(`be.visible`)
			.click()
			.wait(`@CreateFbPostModel`, {timeout: 60000})
			.its(`request.body.variables.input.contentType`)
			.should(`eq`, `Text`);
		cy.wait(`@ListFbPostModels`, {timeout: 60000});
		cy.getDataCsLabel(`Continue`).should(`be.visible`).click();
		cy.contains(`.scheduled-post-wrapper > .post-box-wrapper`, `https://www.convosight.com`).within(() => {
			cy.get(`.post-box-body > .ng-star-inserted`).should(`contain.text`, `https://www.convosight.com`);
		});
	});

	it(`C39 : Verify user able to publish a post with multiple website Links(Eg: www.convosight.com)`, () => {
		cy.get('#postMessage').type(`https://www.convosight.com https://www.google.com`);
		cy.get(`.publish-btn`)
			.eq(0)
			.should(`be.visible`)
			.click()
			.wait(`@CreateFbPostModel`, {timeout: 60000})
			.its(`request.body.variables.input.contentType`)
			.should(`eq`, `Text`);
		cy.wait(`@ListFbPostModels`, {timeout: 60000});
		cy.getDataCsLabel(`Continue`).should(`be.visible`).click();
		cy.contains(
			`.scheduled-post-wrapper > .post-box-wrapper`,
			`https://www.convosight.com https://www.google.com`
		).within(() => {
			cy.get(`.post-box-body > .ng-star-inserted`).should(
				`contain.text`,
				`https://www.convosight.com https://www.google.com`
			);
		});
	});

	it(`C40 : Verify user able to publish a post with the combination of website and text`, () => {
		cy.get('#postMessage').type(`https://www.convosight.com this is a combination of website and text`);
		cy.get(`.publish-btn`).eq(0).should(`be.visible`).click();
		cy.wait(`@CreateFbPostModel`, {timeout: 60000}).then(req => {
			expect(req.request.body.variables.input.contentType).to.be.equal(`Text`);
		});
		cy.wait(`@ListFbPostModels`, {timeout: 60000});
		cy.getDataCsLabel(`Continue`).should(`be.visible`).click();
		cy.contains(
			`.scheduled-post-wrapper > .post-box-wrapper`,
			`https://www.convosight.com this is a combination of website and text`
		).within(() => {
			cy.get(`.post-box-body > .ng-star-inserted`).should(
				`contain.text`,
				`https://www.convosight.com this is a combination of website and text`
			);
		});
	});
});
