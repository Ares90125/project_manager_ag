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
	it(`Verify the page elements`, () => {
		cy.contains(`[data-test-id="checkbox-multiselec-group-post-composer"]`, `Cs Admin Test Group`).within(() => {
			cy.get(`[type="checkbox"]`).should(`be.checked`);
		});
		//cy.getDataCsLabel(`Group selection`).should(`have.text`, `Cs Admin Test Group`);
		cy.get(`span:contains("Check content suggestions")`).should(`be.visible`).click();

		cy.get(`.more-tips > .list-unstyled`)
			.should(`be.visible`)
			.within(() => {
				cy.get(`img`)
					.as(`icons`)
					.eq(0)
					.should(`have.attr`, `src`, `assets/images/promise-icon.svg`)
					.get(`@icons`)
					.eq(1)
					.should(`have.attr`, `src`, `assets/images/ask-icon.svg`)
					.get(`@icons`)
					.eq(2)
					.should(`have.attr`, `src`, `assets/images/smile-icon.svg`);
				cy.get(`.tip > h4`)
					.as(`tips`)
					.eq(0)
					.should(`have.text`, `Make a genuine promise`)
					.get(`@tips`)
					.eq(1)
					.should(`have.text`, `Ask a question`)
					.get(`@tips`)
					.eq(2)
					.should(`have.text`, `Use images that invokes emotion`);
				cy.get(`.tip > .text-secondary`)
					.as(`text-secondary`)
					.eq(0)
					.should(`contain.text`, `A genuine promise that your post makes and the content that backs it, is useful`)
					.get(`@text-secondary`)
					.eq(1)
					.should(
						`contain.text`,
						`Asking a question to clarify on what to do and what not to do can help avoid wrong choices.`
					)
					.get(`@text-secondary`)
					.eq(2)
					.should(
						`contain.text`,
						`Pictures that have real people and clear emotions visible on their faces results in more clicks.`
					);
			});
	});

	it(`C27 : verify the user as group admin able to publish a post successfully with Text`, () => {
		cy.get('#postMessage').type(`this is a text post`);
		cy.get(`.publish-btn`)
			.eq(0)
			.should(`be.visible`)
			.click()
			.wait(`@CreateFbPostModel`, {timeout: 60000})
			.then(req => {
				expect(req.request.body.variables.input.contentType).to.be.equal(`Text`);
			});
		cy.wait(`@ListFbPostModels`, {timeout: 60000});
		cy.getDataCsLabel(`Continue`).should(`be.visible`).click();
		cy.contains(`.scheduled-post-wrapper > .post-box-wrapper`, `this is a text post`).within(() => {
			cy.get(`.post-box-body > .ng-star-inserted`).should(`contain.text`, `this is a text post`);
		});
	});

	it(`C28 : Verify the user as group admin able to publish a post successfully with Text with Emoji's and Image`, () => {
		cy.get('#postMessage').type(`this is a text message with emoji`);
		cy.get(`#toggleEmoji`).click();
		cy.get(`ngx-emoji`).as(`emojis`).eq(5).click();
		cy.get(`@emojis`).eq(7).click();
		cy.get(`input[type="file"]`).attachFile(`../fixtures/files/pictures/pic1.jpg`);
		cy.get(`.thumbnail.image`).should(`have.length`, 1);
		cy.get(`.publish-btn`).eq(0).should(`be.visible`).click();
		cy.wait(`@uploadImage`, {timeout: 60000}).its(`response.statusCode`).should(`eq`, 200);
		cy.wait(`@CreateFbPostModel`, {timeout: 60000})
			.its(`request.body.variables.input.contentType`)
			.should(`eq`, `Photo`);
		cy.wait(`@ListFbPostModels`, {timeout: 60000});
		cy.getDataCsLabel(`Continue`).should(`be.visible`).click();
		cy.contains(`.scheduled-post-wrapper > .post-box-wrapper`, `this is a text message with emoji`).within(() => {
			cy.get(`.post-box-body > .ng-star-inserted`).should(`contain.text`, `this is a text message with emoji`);
			cy.get('.ng-star-inserted > img').should(`have.length`, 1);
		});
	});

	it(`C29 : Verify the user as group admin able to publish a post successfully with text and Multiple Images`, () => {
		cy.get('#postMessage').type(`this is a text message with emoji and multiple images`);
		cy.get(`#toggleEmoji`).click();
		cy.get(`ngx-emoji`).as(`emojis`).eq(5).click();
		cy.get(`@emojis`).eq(7).click();
		cy.get(`input[type="file"]`).as(`fileInput`).attachFile(`../fixtures/files/pictures/pic1.jpg`);
		cy.get(`.thumbnail.image`).as(`thumbnail`).should(`have.length`, 1);
		cy.get(`@fileInput`).attachFile(`../fixtures/files/pictures/pic2.jpg`);
		cy.get(`@thumbnail`).should(`have.length`, 2);
		cy.get(`.publish-btn`).eq(0).should(`be.visible`).click();
		cy.wait(`@CreateFbPostModel`, {timeout: 60000})
			.its(`request.body.variables.input.contentType`)
			.should(`eq`, `Album`);
		cy.wait(`@ListFbPostModels`, {timeout: 60000});
		cy.getDataCsLabel(`Continue`).should(`be.visible`).click();
		cy.contains(
			`.scheduled-post-wrapper > .post-box-wrapper`,
			`this is a text message with emoji and multiple images😜😂`
		).within(() => {
			cy.get(`.post-box-body > .ng-star-inserted`).should(
				`contain.text`,
				`this is a text message with emoji and multiple images😜😂`
			);
			cy.get('.ng-star-inserted > img').should(`have.length`, 2);
		});
	});

	it(`C30 : Verify the user as group admin able to publish a post successfully with image as format JPEG`, () => {
		cy.get(`input[type="file"]`).attachFile(`../fixtures/files/pictures/pic1.jpg`);
		cy.get(`.thumbnail.image`).should(`have.length`, 1);
		cy.get(`.publish-btn`).eq(0).should(`be.visible`).click();
		cy.wait(`@CreateFbPostModel`, {timeout: 60000})
			.its(`request.body.variables.input.contentType`)
			.should(`eq`, `Photo`);
		cy.wait(`@ListFbPostModels`, {timeout: 60000});
		cy.getDataCsLabel(`Continue`).should(`be.visible`).click();
	});
});
