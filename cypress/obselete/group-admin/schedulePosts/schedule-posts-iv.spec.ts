import dayjs from 'dayjs';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';

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
	it(`C41 : Verify user able to publish a post with the combination of website, text and emojis`, () => {
		cy.get('#postMessage').type(`https://www.convosight.com this is a combination of website,text,emojis`);
		cy.get(`#toggleEmoji`).click();
		cy.get(`ngx-emoji`).as(`emojis`).eq(5).click();
		cy.get(`@emojis`).eq(7).click();
		cy.get(`.publish-btn`).eq(0).should(`be.visible`).click();
		cy.wait(`@CreateFbPostModel`, {timeout: 60000})
			.its(`request.body.variables.input.contentType`)
			.should(`eq`, `Text`);
		cy.wait(`@ListFbPostModels`, {timeout: 60000});
		cy.getDataCsLabel(`Continue`).should(`be.visible`).click();
		cy.contains(
			`.scheduled-post-wrapper > .post-box-wrapper`,
			`https://www.convosight.com this is a combination of website,text,emojis`
		).within(() => {
			cy.get(`.post-box-body > .ng-star-inserted`).should(
				`contain.text`,
				`https://www.convosight.com this is a combination of website,text,emojis`
			);
		});
	});

	it(
		`C42 : Verify user able to publish a post with the combination of website,text,emojis and image`,
		{tags: [`@pullRequest`]},
		() => {
			cy.get('#postMessage').type(`https://www.convosight.com this is a combination of website,text,emojis and image`);
			cy.get(`#toggleEmoji`).click();
			cy.get(`ngx-emoji`).as(`emojis`).eq(5).click();
			cy.get(`@emojis`).eq(7).click();
			cy.get(`input[type="file"]`).attachFile(`../fixtures/files/pictures/pic1.jpg`);
			cy.get(`.thumbnail.image`).should(`have.length`, 1);
			cy.get(`.publish-btn`).eq(0).should(`be.visible`).click();
			cy.wait(`@uploadImage`);
			cy.wait(`@CreateFbPostModel`, {timeout: 60000})
				.its(`request.body.variables.input.contentType`)
				.should(`eq`, `Photo`);
			cy.wait(`@ListFbPostModels`, {timeout: 60000});
			cy.getDataCsLabel(`Continue`).should(`be.visible`).click();
			cy.contains(
				`.scheduled-post-wrapper > .post-box-wrapper`,
				`https://www.convosight.com this is a combination of website,text,emojis and image`
			).within(() => {
				cy.get(`.post-box-body > .ng-star-inserted`)
					.should(`contain.text`, `https://www.convosight.com this is a combination of website,text,emojis and image`)
					.within(() => {
						cy.get(`.post-box-body > .ng-star-inserted`, {withinSubject: null}).should(
							`contain.text`,
							`https://www.convosight.com this is a combination of website,text,emojis and image`
						);
					});
			});
		}
	);

	it(`Verify user able to publish a post using schedule a post`, () => {
		cy.get('#postMessage').type(`https://www.convosight.com this is a combination of website,text,emojis and image`);
		cy.get(`#toggleEmoji`).click();
		cy.get(`ngx-emoji`).as(`emojis`).eq(5).click();
		cy.get(`@emojis`).eq(7).click();
		cy.get(`input[type="file"]`).attachFile(`../fixtures/files/pictures/pic1.jpg`);
		cy.getDataTestId(`thumbnail-image-post-text-area`).should(`have.length`, 1);
		cy.get(`[class="mat-radio-label-content"]:contains("Publish at a custom time")`).eq(0).should(`be.visible`).click();
		cy.getDataCsLabel(`Date picker`).should(`be.visible`);
		cy.get(`.mat-datepicker-toggle`).eq(0).click();
		dayjs.extend(LocalizedFormat);
		const tomorrow = dayjs().add(1, `days`).format('ddd MMM DD YYYY');
		if (dayjs().add(1, `days`).format(`D`) === `1`) cy.get(`.mat-calendar-next-button`).click();
		cy.get(`[aria-label="${tomorrow}"]`).click();
		cy.get(`.fake-input`).eq(0).click();
		const min = dayjs().format(`mm`);
		cy.wrap(dayjs().add(3, 'hours').subtract(Number(min), 'minutes').format(`LT`)).then(time => {
			cy.contains(time).scrollIntoView().click({force: true});
		});
		cy.get(`.publish-btn`).eq(0).should(`be.visible`).click();
		cy.wait(`@uploadImage`);
		cy.wait(`@CreateFbPostModel`, {timeout: 60000})
			.its(`request.body.variables.input.contentType`)
			.should(`eq`, `Photo`);
		cy.wait(`@ListFbPostModels`, {timeout: 60000});
	});
});
