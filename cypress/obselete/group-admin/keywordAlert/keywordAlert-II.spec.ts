describe(`Keyword Alert Scenarios on Group Admin`, () => {
	const NavigateToReport = (reportName: string) => {
		return cy
			.contains(`[data-test-id="reporntName-table"]`, reportName)
			.should(`be.visible`)
			.within(() => cy.getDataTestId(`keywords-report`).click());
	};

	const ButtonClick = (buttonSelector: string, buttonText: string) => {
		return cy.getDataTestId(buttonSelector).should(`be.visible`).should(`have.text`, buttonText).click();
	};

	const VerifyHeading = (headingSelector: string, headingText: string) => {
		return cy.getDataTestId(headingSelector).should(`be.visible`).should(`have.text`, headingText);
	};
	const VerifySubHeading = (subHeadingSelector: string, subHeadingText: string) => {
		return cy.getDataTestId(subHeadingSelector).should(`be.visible`).should(`have.text`, subHeadingText);
	};

	before('login using facebook', () => {
		cy.fixture(`api-test/convosightLoginWithGroups.json`).then(session => {
			cy.RestoreSession(session);
		});
		cy.visit(`/login-response`).saveLocalStorage();
		cy.visit('group-admin/manage');
	});

	beforeEach(`restore the session`, () => {
		cy.restoreLocalStorage();
	});

	it(`Verify rename modal elements`, () => {
		cy.visit(`group-admin/group/85478556-88c6-44c3-af49-9028fab66f74/urgentAlerts`);
		VerifyHeading(`heading-keywords-alert-page`, `Keyword Alerts`);
		cy.contains(`[data-test-id="heading-report-name"]`, 'Admin', {timeout: 60000}).should(`be.visible`);
		NavigateToReport(`Profanity/abusive`);
		ButtonClick(`link-rename-report`, `Rename`);
		cy.getDataTestId(`heading-rename-report-modal`).should(`be.visible`).should(`have.text`, `Rename Title`);
		cy.getDataTestId(`subheading-rename-report-modal`)
			.should(`be.visible`)
			.should(`have.text`, ` Edit the name of the title below `);
		cy.getDataTestId(`button-close-rename-report-modal`).should(`be.visible`);
		cy.getDataTestId(`button-close-rename-report-modal`).realClick();
		cy.getDataTestId(`rename-report-modal`).should(`be.hidden`);
	});
	it(`Verify user is able to cancel the changes made in rename report`, () => {
		ButtonClick(`link-rename-report`, `Rename`);
		cy.getDataTestId(`type-field-rename-report-modal`).as(`field`).invoke(`val`).should(`equal`, `Profanity/abusive`);
		cy.get(`@field`).clear().type(`Dummy Report`);
		cy.getDataTestId(`button-cancel-rename-report-modal`).click();
		cy.getDataTestId(`heading-page-report-name`)
			.should(`be.visible`)
			.should(`have.text`, ` Profanity/abusive reportRenameCopy keywords to other groups`);
	});

	//@ts-ignore
	it(`Verify user is able to save the changes made in rename report`, () => {
		cy.InterceptRoute(`UpdateKeywordTrackerReport`);
		ButtonClick(`link-rename-report`, `Rename`);
		cy.getDataTestId(`type-field-rename-report-modal`).as(`field`).invoke(`val`).should(`equal`, `Profanity/abusive`);
		cy.get(`@field`).clear().type(`Changed Name`);
		cy.getDataTestId(`button-save-rename-report-modal`).click();
		cy.wait(`@UpdateKeywordTrackerReport`, {timeout: 30000});
		VerifyHeading(`heading-page-report-name`, ` Changed Name reportRenameCopy keywords to other groups`);
		ButtonClick(`link-rename-report`, `Rename`);
		cy.get(`@field`).clear().type(`Profanity/abusive`);
		cy.getDataTestId(`button-save-rename-report-modal`).click();
		cy.wait(`@UpdateKeywordTrackerReport`, {timeout: 30000});
		VerifyHeading(`heading-page-report-name`, ` Profanity/abusive reportRenameCopy keywords to other groups`);
	});
	it(`Verify the back button on keyword report`, () => {
		ButtonClick(`link-back-report-table`, ` Back `);
		VerifyHeading(`heading-keywords-alert-page`, `Keyword Alerts`);
		VerifySubHeading(`subheading-keyword-alert`, ` Setup tracking to find conversations that need your attention `);
		cy.getDataTestId(`keyword-alert-report-table`).should(`be.visible`);
		cy.getDataTestId(`link-back-report-table`).should(`not.exist`);
	});
	it(`Verify page elements for keyword editor`, () => {
		NavigateToReport(`Medical`);
		cy.getDataCsLabel(`Keyword editor`).should(`be.visible`).click();
		VerifyHeading(`heading-keyword-editor`, ` Enter keywords to track. `);
		VerifySubHeading(`subheading-keyword-editor`, ` Enter new keyword in a new line (minimum 1 keyword is required) `);
		cy.getDataTestId(`text-area-keyword-editor`).should(`be.visible`);
		cy.getDataTestId(`button-cancel-keyword-editor`).should(`be.visible`).should(`have.text`, ` Cancel `);
		cy.getDataTestId(`button-save-keyword-editor`).should(`be.visible`).should(`have.text`, ` Save `);
		cy.getDataTestId(`modal-keyword-editor`).as(`keywordEditor`).should(`be.visible`);
		cy.wait(3000);
		cy.getDataTestId(`button-close-keyword-editor`).should(`be.visible`).should(`be.enabled`);
		cy.getDataTestId(`button-close-keyword-editor`).realClick();
		cy.get(`@keywordEditor`).should(`be.hidden`);
	});

	it(`Verify the page elements for copy keywords pop up`, () => {
		cy.getDataTestId(`link-copy-keywords`).click();
		cy.getDataTestId(`select-groups-copy-keywords`).should(`be.visible`).should(`have.text`, `Select Groups`);
		VerifySubHeading(
			`subheading-select-group`,
			` Select all groups where you want to update keywords in Medical Report`
		);
		cy.getDataTestId(`checkbox-select-all`).should(`be.visible`);
		cy.getDataTestId(`button-close-copy-keyword-pop-up`).should(`be.visible`);
		cy.get(`[id="mat-radio-12-input"]`).should(`be.checked`);
		cy.get(`[id="mat-radio-11-input"]`).should(`not.be.checked`);
		cy.getDataTestId(`button-done-copy-keywords`).should(`be.visible`).should(`have.text`, ` Done `);
		cy.wait(3000);
		cy.getDataTestId(`button-close-copy-keyword-pop-up`).should(`be.visible`).realClick();
		cy.getDataCsLabel(`Refresh conversations`).should(`be.visible`).should(`have.text`, ` Refresh conversations `);
		cy.getDataTestId(`copy-keyword-pop-up`).should(`be.hidden`);
	});

	it(`Verify all groups are selected in the copy keywords pop up.`, () => {
		cy.getDataTestId(`link-copy-keywords`).click();
		cy.getDataTestId(`group-selection-copy-keyword-popup`)
			.as(`groupSelection`)
			.within(() => {
				cy.get(`[class="selected-sign ticked"]`).parent().get(`h5`).eq(1).should(`have.text`, `Cs Admin Test Group`);
				cy.get(`[class="selected-sign"]`).parent().get(`h5`).eq(0).should(`have.text`, `Test group 2`);
			});
		cy.getDataTestId(`checkbox-select-all`).should(`be.visible`).click();
		cy.get(`@groupSelection`).within(() => {
			cy.get(`[class="selected-sign ticked"]`).eq(0).parent().get(`h5`).eq(0).should(`have.text`, `Test group 2`);
			cy.get(`[class="selected-sign ticked"]`)
				.parent()
				.eq(1)
				.get(`h5`)
				.eq(1)
				.should(`have.text`, `Cs Admin Test Group`);
		});
	});
});
