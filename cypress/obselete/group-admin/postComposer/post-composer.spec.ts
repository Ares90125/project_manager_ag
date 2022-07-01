import dayjs from 'dayjs';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';

describe(`Post Composer Scenarios`, () => {
	before('login using facebook', () => {
		cy.fixture(`api-test/convosightLoginWithGroups.json`).then(session => {
			cy.RestoreSession(session);
		});
		cy.visit(`/login-response`).saveLocalStorage();
	});

	beforeEach(`restore the session`, () => {
		cy.restoreLocalStorage();
		cy.InterceptRoute([`CreateFbPostModel`, `ListFbPostModels`, `UpdateFbPost`]);
	});

	it(`Verify the page elements`, () => {
		cy.visit('group-admin/manage');
		cy.contains(`.list-item`, `Test group 2`, {timeout: 60000}).within(() => {
			cy.get(`button.linker`).should(`have.length`, 1).click();
		});
		cy.getDataTestId(`btn-group-create-a-post`).click();
		cy.getDataCsLabel(`Continue`).click();
		cy.get(`[data-cs-label="To post page"]`, {timeout: 60000}).click();
		cy.getDataTestId(`heading-post-composer-page`).should(`be.visible`).should(`have.text`, `New post`);
		cy.getDataTestId(`button-close-post-composer`).should(`be.visible`);
		cy.getDataTestId(`heading-multi-group-post-composer`)
			.eq(0)
			.should(`be.visible`)
			.should(`have.text`, `SELECT GROUPS TO PUBLISH`);
		cy.getDataTestId(`subheading-multi-group-post-composer`)
			.eq(0)
			.should(`be.visible`)
			.should(`have.text`, `Select all 3 groups`);
		cy.getDataTestId(`checkbox-select-all-groups-post-composer`).should(`be.visible`);
		cy.getDataTestId(`group-list-post-composer`).should(`have.length.above`, 3);
		cy.contains(`[data-test-id="checkbox-multiselec-group-post-composer"]`, `Cs Admin Test Group`).within(() => {
			cy.get(`[type="checkbox"]`).should(`not.be.checked`);
		});
		cy.contains(`[data-test-id="checkbox-multiselec-group-post-composer"]`, `Kids Nutrition and Recipes`).within(() => {
			cy.get(`[type="checkbox"]`).should(`not.be.checked`);
		});
		cy.contains(`[data-test-id="checkbox-multiselec-group-post-composer"]`, `Test group 2`).within(() => {
			cy.get(`[type="checkbox"]`).should(`be.checked`);
		});
		cy.getDataTestId(`heading-post-composer`).should(`be.visible`).should(`have.text`, `YOUR POST`);
		cy.getDataTestId(`template-link-post-composer`).should(`be.visible`).should(`have.text`, `Use a template`);
		cy.getDataTestId(`link-check-content-suggestion-post-composer`)
			.should(`be.visible`)
			.should(`have.text`, `Check content suggestions`);
		cy.getDataTestId(`heading-select-publish-time`)
			.eq(0)
			.should(`be.visible`)
			.should(`have.text`, `SELECT TIME TO PUBLISH`);
		cy.get(`[id="mat-radio-2-input"]`).should(`be.visible`).should(`be.checked`);
		cy.getDataTestId(`heading-publish-now`).eq(0).should(`be.visible`).should(`have.text`, `✌️ Publish Now`);
		cy.getDataTestId(`subheading-publish-now`)
			.eq(0)
			.should(`be.visible`)
			.should(`have.text`, `Post will be published in the next 15 min`);
		cy.getDataTestId(`first-suggested-post-time`).should(`not.exist`);
		cy.getDataTestId(`second-suggested-post-time`).should(`not.exist`);
		cy.get(`[id="mat-radio-3-input"]`).should(`not.be.checked`);
		cy.getDataTestId(`heading-publish-custom-time`)
			.eq(0)
			.should(`be.visible`)
			.should(`have.text`, `Publish at a custom time`);
		cy.getDataTestId(`subheading-publish-custom-time`)
			.eq(0)
			.should(`be.visible`)
			.should(`have.text`, `Select a date and time to publish your post`);
		cy.getDataTestId(`heading-publish-post-number-groups`)
			.eq(0)
			.should(`be.visible`)
			.should(`have.text`, ` Publishing post in 1 group`);
		cy.get(`.publish-btn`).eq(0).should(`be.visible`).should(`have.text`, ` Publish now `);
		//dummycommit
	});

	it(`Verify the page elements for the group having recommendations.`, () => {
		cy.getDataTestId(`heading-post-composer-page`).should(`be.visible`).should(`have.text`, `New post`);
		cy.reload();
		const path = `mock-responses/recommendation-schedule-post.spec`;
		cy.MockQueryUsingFile(`GetGRecommendationByDay`, path);
		cy.getDataTestId(`heading-post-composer-page`).should(`be.visible`).should(`have.text`, `New post`);
		cy.getDataTestId(`button-close-post-composer`).should(`be.visible`);
		cy.getDataTestId(`heading-multi-group-post-composer`)
			.eq(0)
			.should(`be.visible`)
			.should(`have.text`, `SELECT GROUPS TO PUBLISH`);
		cy.getDataTestId(`subheading-multi-group-post-composer`)
			.eq(0)
			.should(`be.visible`)
			.should(`have.text`, `Select all 3 groups`);
		cy.getDataTestId(`checkbox-select-all-groups-post-composer`).should(`be.visible`);
		cy.getDataTestId(`group-list-post-composer`).should(`have.length.above`, 3);
		cy.contains(`[data-test-id="checkbox-multiselec-group-post-composer"]`, `Cs Admin Test Group`).within(() => {
			cy.get(`[type="checkbox"]`).should(`not.be.checked`);
		});
		cy.contains(`[data-test-id="checkbox-multiselec-group-post-composer"]`, `Kids Nutrition and Recipes`).within(() => {
			cy.get(`[type="checkbox"]`).should(`not.be.checked`);
		});
		cy.contains(`[data-test-id="checkbox-multiselec-group-post-composer"]`, `Test group 2`).within(() => {
			cy.get(`[type="checkbox"]`).should(`be.checked`);
		});
		cy.getDataTestId(`heading-post-composer`).should(`be.visible`).should(`have.text`, `YOUR POST`);
		cy.getDataTestId(`template-link-post-composer`).should(`be.visible`).should(`have.text`, `Use a template`);
		cy.getDataTestId(`link-check-content-suggestion-post-composer`)
			.should(`be.visible`)
			.should(`have.text`, `Check content suggestions`);
		cy.getDataTestId(`heading-select-publish-time`)
			.eq(0)
			.should(`be.visible`)
			.should(`have.text`, `SELECT TIME TO PUBLISH`);
		cy.get(`[id="mat-radio-2-input"]`).should(`be.visible`).should(`be.checked`);
		cy.getDataTestId(`heading-publish-now`).eq(0).should(`be.visible`).should(`have.text`, `✌️ Publish Now`);
		cy.getDataTestId(`subheading-publish-now`)
			.eq(0)
			.should(`be.visible`)
			.should(`have.text`, `Post will be published in the next 15 min`);
		cy.getDataTestId(`first-suggested-post-time`).should(`be.visible`);
		cy.getDataTestId(`second-suggested-post-time`).should(`be.visible`);
		cy.get(`[id="mat-radio-3-input"]`).should(`not.be.checked`);
		cy.getDataTestId(`heading-publish-custom-time`)
			.eq(0)
			.should(`be.visible`)
			.should(`have.text`, `Publish at a custom time`);
		cy.getDataTestId(`subheading-publish-custom-time`)
			.eq(0)
			.should(`be.visible`)
			.should(`have.text`, `Select a date and time to publish your post`);
		cy.getDataTestId(`heading-publish-post-number-groups`)
			.eq(0)
			.should(`be.visible`)
			.should(`have.text`, ` Publishing post in 1 group`);
		cy.get(`.publish-btn`).eq(0).should(`be.visible`).should(`have.text`, ` Publish now `);
	});

	it(`Verify all groups are selected on clicking select all groups and main group is not deselected upon deselection`, () => {
		cy.getDataTestId(`checkbox-select-all-groups-post-composer`).eq(0).should(`be.visible`).click();
		cy.contains(`[data-test-id="checkbox-multiselec-group-post-composer"]`, `Cs Admin Test Group`).within(() => {
			cy.get(`[type="checkbox"]`).should(`be.checked`);
		});
		cy.contains(`[data-test-id="checkbox-multiselec-group-post-composer"]`, `Kids Nutrition and Recipes`).within(() => {
			cy.get(`[type="checkbox"]`).should(`be.checked`);
		});
		cy.contains(`[data-test-id="checkbox-multiselec-group-post-composer"]`, `Test group 2`).within(() => {
			cy.get(`[type="checkbox"]`).should(`be.checked`);
		});
		cy.getDataTestId(`checkbox-select-all-groups-post-composer`).eq(0).should(`be.visible`).click();
		cy.contains(`[data-test-id="checkbox-multiselec-group-post-composer"]`, `Cs Admin Test Group`).within(() => {
			cy.get(`[type="checkbox"]`).should(`not.be.checked`);
		});
		cy.contains(`[data-test-id="checkbox-multiselec-group-post-composer"]`, `Kids Nutrition and Recipes`).within(() => {
			cy.get(`[type="checkbox"]`).should(`not.be.checked`);
		});
		cy.contains(`[data-test-id="checkbox-multiselec-group-post-composer"]`, `Test group 2`).within(() => {
			cy.get(`[type="checkbox"]`).should(`be.checked`);
		});
	});

	it(`Verify same post is posted in multiple groups`, () => {
		cy.visit(`group-admin/group/85478556-88c6-44c3-af49-9028fab66f74/post/create?method=direct`);
		cy.contains(`[data-test-id="group-list-post-composer"]`, `Cs Admin Test Group`).click();
		cy.contains(`[data-test-id="checkbox-multiselec-group-post-composer"]`, `Cs Admin Test Group`).within(() => {
			cy.get(`[type="checkbox"]`).should(`be.checked`);
		});
		cy.contains(`[data-test-id="checkbox-multiselec-group-post-composer"]`, `Kids Nutrition and Recipes`).within(() => {
			cy.get(`[type="checkbox"]`).should(`not.be.checked`);
		});
		cy.contains(`[data-test-id="checkbox-multiselec-group-post-composer"]`, `Test group 2`).within(() => {
			cy.get(`[type="checkbox"]`).should(`be.checked`);
		});
		cy.get('#postMessage').type(`post to be posted in multiple groups`);
		cy.get(`.publish-btn`)
			.eq(0)
			.should(`be.visible`)
			.click()
			.wait(`@CreateFbPostModel`, {timeout: 60000})
			.its(`response.body.data.createFbPostModel.contentType`)
			.should(`equal`, `Text`);
		cy.wait(`@ListFbPostModels`, {timeout: 60000});
		cy.getDataCsLabel(`Continue`).click();
		cy.contains(`[data-test-id="scheduled-post-body"]`, `post to be posted in multiple groups`).as(`post`);
		cy.get(`@post`)
			.parent()
			.within(() => {
				cy.getDataCsLabel(`Delete`)
					.eq(0)
					.should(`be.visible`)
					.should(`have.text`, `Delete`)
					.click()
					.getDataCsLabel(`Confirm`)
					.eq(0)
					.should(`be.visible`)
					.click();
			});
		cy.wait(`@UpdateFbPost`, {timeout: 30000});
		cy.getDataTestId(`toggle-group-list-drop-down`).should(`be.visible`).click();
		cy.contains(`[data-test-id="group-list-drop-down"]`, `Cs Admin Test Group`).click();

		cy.wait(`@ListFbPostModels`, {timeout: 30000});
		cy.wait(3000);
		cy.getDataCsLabel(`To post page`).should(`be.visible`);
		cy.contains(`[data-test-id="scheduled-post-body"]`, `post to be posted in multiple groups`)
			.as(`post`)
			.should(`be.visible`);
		cy.get(`@post`)
			.parent()
			.within(() => {
				cy.getDataCsLabel(`Delete`)
					.eq(0)
					.should(`be.visible`)
					.should(`have.text`, `Delete`)
					.click()
					.getDataCsLabel(`Confirm`)
					.eq(0)
					.should(`be.visible`)
					.click();
			});
		cy.wait(`@UpdateFbPost`, {timeout: 30000});
	});
	it(`Verify same post is scheduled in multiple groups`, {tags: [`@pullRequest`]}, () => {
		cy.visit(`group-admin/group/85478556-88c6-44c3-af49-9028fab66f74/post/create?method=direct`);
		cy.contains(`[data-test-id="group-list-post-composer"]`, `Cs Admin Test Group`).click();
		cy.contains(`[data-test-id="checkbox-multiselec-group-post-composer"]`, `Cs Admin Test Group`).within(() => {
			cy.get(`[type="checkbox"]`).should(`be.checked`);
		});
		cy.contains(`[data-test-id="checkbox-multiselec-group-post-composer"]`, `Kids Nutrition and Recipes`).within(() => {
			cy.get(`[type="checkbox"]`).should(`not.be.checked`);
		});
		cy.contains(`[data-test-id="checkbox-multiselec-group-post-composer"]`, `Test group 2`).within(() => {
			cy.get(`[type="checkbox"]`).should(`be.checked`);
		});
		cy.get('#postMessage').type(`schedule post to be posted in multiple groups`);
		cy.get(`[class="mat-radio-label-content"]:contains("Publish at a custom time")`).eq(0).should(`be.visible`).click();
		cy.getDataCsLabel(`Date picker`).should(`be.visible`);
		cy.get(`.mat-datepicker-toggle`).eq(0).click();
		dayjs.extend(LocalizedFormat);
		const tomorrow = dayjs().add(1, `days`).format(`ddd MMM DD YYYY`);
		if (dayjs().add(1, `days`).format(`D`) === `1`) cy.get(`.mat-calendar-next-button`).click();
		cy.get(`[aria-label="${tomorrow}"]`).click({force: true});
		cy.get(`.fake-input`).eq(0).click();
		const min = dayjs().format(`mm`);
		cy.wrap(dayjs().add(3, 'hours').subtract(Number(min), 'minutes').format(`LT`)).then(time => {
			cy.contains(time).scrollIntoView().click({force: true});
		});
		cy.get(`.publish-btn`).eq(0).should(`be.visible`).click();
		cy.wait(`@ListFbPostModels`, {timeout: 60000});
		cy.getDataCsLabel(`Continue`).click();
		cy.contains(`[data-test-id="scheduled-post-body"]`, `schedule post to be posted in multiple groups`).as(`post`);
		cy.get(`@post`)
			.parent()
			.within(() => {
				cy.getDataCsLabel(`Delete`)
					.eq(0)
					.should(`be.visible`)
					.should(`have.text`, `Delete`)
					.click()
					.getDataCsLabel(`Confirm`)
					.eq(0)
					.should(`be.visible`)
					.click();
			});
		cy.wait(`@UpdateFbPost`, {timeout: 30000});
		cy.getDataTestId(`toggle-group-list-drop-down`).should(`be.visible`).click();
		cy.contains(`[data-test-id="group-list-drop-down"]`, `Cs Admin Test Group`).click();

		cy.wait(`@ListFbPostModels`, {timeout: 30000});
		cy.wait(3000);
		cy.getDataCsLabel(`To post page`).should(`be.visible`);
		cy.contains(`[data-test-id="scheduled-post-body"]`, `schedule post to be posted in multiple groups`)
			.as(`post`)
			.should(`be.visible`);
		cy.get(`@post`)
			.parent()
			.within(() => {
				cy.getDataCsLabel(`Delete`)
					.eq(0)
					.should(`be.visible`)
					.should(`have.text`, `Delete`)
					.click()
					.getDataCsLabel(`Confirm`)
					.eq(0)
					.should(`be.visible`)
					.click();
			});
		cy.wait(`@UpdateFbPost`, {timeout: 30000});
	});

	it(`Verify user is able to edit the scheduled post`, () => {
		cy.visit(`group-admin/group/85478556-88c6-44c3-af49-9028fab66f74/post/create?method=direct`);
		cy.contains(`[data-test-id="checkbox-multiselec-group-post-composer"]`, `Cs Admin Test Group`).within(() => {
			cy.get(`[type="checkbox"]`).should(`not.be.checked`);
		});
		cy.contains(`[data-test-id="checkbox-multiselec-group-post-composer"]`, `Kids Nutrition and Recipes`).within(() => {
			cy.get(`[type="checkbox"]`).should(`not.be.checked`);
		});
		cy.contains(`[data-test-id="checkbox-multiselec-group-post-composer"]`, `Test group 2`).within(() => {
			cy.get(`[type="checkbox"]`).should(`be.checked`);
		});
		cy.get('#postMessage').as(`postContent`).type(`Edit this post`);
		cy.get(`[class="mat-radio-label-content"]:contains("Publish at a custom time")`).eq(0).should(`be.visible`).click();
		cy.getDataCsLabel(`Date picker`).should(`be.visible`);
		cy.get(`.mat-datepicker-toggle`).eq(0).click();
		dayjs.extend(LocalizedFormat);
		const tomorrow = dayjs().add(1, `days`).format(`ddd MMM DD YYYY`);
		if (dayjs().add(1, `days`).format(`D`) === `1`) cy.get(`.mat-calendar-next-button`).click();
		cy.get(`[aria-label="${tomorrow}"]`).click();
		cy.get(`.fake-input`).eq(0).click();
		const min = dayjs().format(`mm`);
		cy.wrap(dayjs().add(3, 'hours').subtract(Number(min), 'minutes').format(`LT`)).then(time => {
			cy.contains(time).scrollIntoView().click({force: true});
		});
		cy.get(`.publish-btn`).eq(0).should(`be.visible`).click();
		cy.wait(`@ListFbPostModels`, {timeout: 60000});
		cy.getDataCsLabel(`Continue`).click();
		cy.contains(`[data-test-id="scheduled-post-body"]`, `Edit this post`).as(`post`);
		cy.wait(10000);
		cy.get(`@post`)
			.parent()
			.within(() => {
				cy.getDataTestId(`edit-post-queue`).eq(0).should(`be.visible`).should(`have.text`, `Edit`).click();
			});
		cy.get(`@postContent`).invoke(`val`).should(`equal`, `Edit this post`);
		cy.get(`@postContent`).clear().type(`post edited successfully`);
		cy.wait(10000);
		cy.get(`.publish-btn`).eq(0).should(`be.visible`).click();
		cy.contains(`[data-test-id="scheduled-post-body"]`, `post edited successfully`).should(`be.visible`);
		cy.contains(`[data-test-id="scheduled-post-body"]`, `post edited successfully`)
			.parent()
			.within(() => {
				cy.getDataCsLabel(`Delete`)
					.eq(0)
					.should(`be.visible`)
					.should(`have.text`, `Delete`)
					.click()
					.getDataCsLabel(`Confirm`)
					.eq(0)
					.should(`be.visible`)
					.click();
			});
	});
});
