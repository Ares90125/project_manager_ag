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

	const PopulateTestKeywords = () => {
		cy.getDataTestId(`text-area-keyword-editor`).should(`be.visible`).clear().type(`hello{enter}changes`);
		cy.getDataTestId(`button-save-keyword-editor`).should(`be.visible`).click();
		cy.wait(`@UpdateKeywordTrackerReport`, {timeout: 45000});
		cy.getDataCsLabel(`Keyword editor`).should(`be.visible`).click();
	};
	const VerifyHeading = (headingSelector: string, headingText: string) => {
		return cy.getDataTestId(headingSelector).should(`be.visible`).should(`contain.text`, headingText);
	};
	const VerifySubHeading = (subHeadingSelector: string, subHeadingText: string) => {
		return cy.getDataTestId(subHeadingSelector).should(`be.visible`).should(`have.text`, subHeadingText);
		//DummyCOmmit
	};

	before('login using facebook', () => {
		cy.fixture(`api-test/convosightLoginWithGroups.json`).then(session => {
			cy.RestoreSession(session);
		});
		cy.visit(`/login-response`).saveLocalStorage();
		cy.visit('group-admin/manage');
		//dummyCommit
	});

	beforeEach(`restore the session`, () => {
		cy.restoreLocalStorage();
	});

	it(`Verify the page elements for admin report table`, () => {
		cy.visit(`group-admin/group/c40d1bd5-4737-40b3-9e40-de78b64454df/urgentAlerts`);
		VerifyHeading(`heading-keywords-alert-page`, `Keyword Alerts`);
		cy.contains(`[data-test-id="heading-report-name"]`, 'Admin', {timeout: 45000}).should(`be.visible`);
		VerifySubHeading(`subheading-keyword-alert`, ` Setup tracking to find conversations that need your attention `);
		cy.getDataTestId(`keyword-alert-report-table`).should(`be.visible`);
		cy.getDataTestId(`number-conversation`).should(`be.visible`);
		cy.wait(5000);
		cy.window()
			.its(`data`)
			.then(data => {
				const [
					keywordsCount,
					{
						reportDisplayName: {
							Admin,
							Medical,
							'Profanity/Abusive': ProfanityAbusive,
							'Spamming and Promotions': SpammingPromotions
						}
					}
				] = data;
				cy.contains(`[data-test-id = "reporntName-table"]`, `Admin`)
					.should(`be.visible`)
					.within(() => {
						cy.getDataTestId(`count-keywords-report`)
							.should(`be.visible`)
							.should(`have.text`, ` ` + keywordsCount[0] + ` Keywords`);
						if (Admin > 1) {
							cy.getDataTestId(`number-conversation`)
								.should(`be.visible`)
								.should(`have.text`, ` ` + Admin + ` conversations found in last 2 days`);
						} else {
							cy.getDataTestId(`number-conversation`)
								.should(`be.visible`)
								.should(`have.text`, ` ` + Admin + ` conversation found in last 2 days`);
						}
					});
				cy.contains(`[data-test-id = "reporntName-table"]`, `Medical`)
					.should(`be.visible`)
					.within(() => {
						cy.getDataTestId(`count-keywords-report`)
							.should(`be.visible`)
							.should(`have.text`, ` ` + keywordsCount[1] + ` Keywords`);
						if (Medical > 1) {
							cy.getDataTestId(`number-conversation`)
								.should(`be.visible`)
								.should(`have.text`, ` ` + Medical + ` conversations found in last 2 days`);
						} else {
							cy.getDataTestId(`number-conversation`)
								.should(`be.visible`)
								.should(`have.text`, ` ` + Medical + ` conversation found in last 2 days`);
						}
					});

				cy.contains(`[data-test-id = "reporntName-table"]`, `Profanity/abusive`)
					.should(`be.visible`)
					.within(() => {
						cy.getDataTestId(`count-keywords-report`)
							.should(`be.visible`)
							.should(`have.text`, ` ` + keywordsCount[2] + ` Keywords`);
						if (ProfanityAbusive > 1) {
							cy.getDataTestId(`number-conversation`)
								.should(`be.visible`)
								.should(`have.text`, ` ` + ProfanityAbusive + ` conversations found in last 2 days`);
						} else {
							cy.getDataTestId(`number-conversation`)
								.should(`be.visible`)
								.should(`have.text`, ` ` + ProfanityAbusive + ` conversation found in last 2 days`);
						}
					});

				cy.contains(`[data-test-id = "reporntName-table"]`, `Spamming And Promotions`)
					.should(`be.visible`)
					.within(() => {
						cy.getDataTestId(`count-keywords-report`)
							.should(`be.visible`)
							.should(`have.text`, ` ` + keywordsCount[3] + ` Keywords`);
						if (SpammingPromotions > 1) {
							cy.getDataTestId(`number-conversation`)
								.should(`be.visible`)
								.should(`have.text`, ` ` + SpammingPromotions + ` conversations found in last 2 days`);
						} else {
							cy.getDataTestId(`number-conversation`)
								.should(`be.visible`)
								.should(`have.text`, ` ` + SpammingPromotions + ` conversation found in last 2 days`);
						}
					});
			});
	});
	it(`Verify the page elements for admin report `, () => {
		NavigateToReport(`Spamming And Promotions`);
		VerifyHeading(`heading-page-report-name`, ` Spamming And Promotions reportRenameCopy keywords to other groups`);
		VerifySubHeading(`subheading-page-report`, ` Input keywords to find conversations about Spamming and Promotions `);
		cy.getDataTestId(`link-rename-report`).should(`be.visible`).should(`have.text`, `Rename`);
		cy.getDataTestId(`link-copy-keywords`).should(`be.visible`).should(`have.text`, `Copy keywords to other groups`);
		cy.getDataTestId(`link-back-report-table`).should(`be.visible`).should(`have.text`, ` Back `);
		cy.getDataCsLabel(`Refresh conversations`).should(`be.visible`).should(`have.text`, ` Refresh conversations `);
		cy.getDataTestId(`list-keyword-selected-report`).should(`be.visible`);
		cy.contains(`[data-test-id="dropdown-button"]`, `Type`).should(`be.visible`);
		cy.contains(`[data-test-id="dropdown-button"]`, `Action`).should(`be.visible`);
	});

	it(`Verify user is able to cancel the changes made on the keywords list`, () => {
		ButtonClick(`link-back-report-table`, ` Back `);
		NavigateToReport(`Profanity/abusive`);
		cy.getDataCsLabel(`Keyword editor`).should(`be.visible`).click();
		cy.getDataTestId(`modal-keyword-editor`).as(`keywordEditor`).should(`be.visible`);
		cy.getDataTestId(`text-area-keyword-editor`).should(`be.visible`).clear().type(`changes`);
		cy.getDataTestId(`button-cancel-keyword-editor`).should(`be.visible`).click();
		cy.getDataCsLabel(`Keyword editor`).should(`be.visible`).click();
		cy.getDataTestId(`text-area-keyword-editor`)
			.should(`be.visible`)
			.invoke(`val`)
			.should(`equal`, `testing\nnot\ndone`);
	});
	it(`Verify admin  is able to add the keywords`, () => {
		cy.getDataTestId(`button-close-keyword-editor`).realClick();
		cy.InterceptRoute(`UpdateKeywordTrackerReport`);
		cy.getDataCsLabel(`Keyword editor`).should(`be.visible`).click();
		cy.getDataTestId(`modal-keyword-editor`).as(`keywordEditor`).should(`be.visible`);
		PopulateTestKeywords();
		cy.getDataTestId(`text-area-keyword-editor`).should(`be.visible`).invoke(`val`).should(`equal`, `hello\nchanges`);
		cy.getDataTestId(`text-area-keyword-editor`).should(`be.visible`).clear().type(`testing{enter}not{enter}done`);
		cy.getDataTestId(`button-save-keyword-editor`).should(`be.visible`).click();
		cy.wait(`@UpdateKeywordTrackerReport`, {timeout: 45000});
	});

	it(`Verify group moderator  is not  able to modify the keywords`, () => {
		cy.InterceptRoute(`FetchConversations`);
		cy.visit(`group-admin/group/9a0f9a0f-a7e0-41f0-99a0-2934f58efaf2/urgentAlerts`);
		VerifyHeading(`heading-keywords-alert-page`, `Keyword Alerts`);
		NavigateToReport(`Profanity/abusive`);
		cy.getDataCsLabel(`Keyword editor`).should(`be.visible`).click();
		cy.getDataTestId(`modal-keyword-editor`).as(`keywordEditor`).should(`be.visible`);
		cy.getDataTestId(`text-area-keyword-editor`).clear({force: true}).type(`hello{enter}changes`);
		cy.getDataTestId(`button-save-keyword-editor`).should(`be.visible`).should(`be.disabled`);
	});

	it(`Verify user is able to filter the conversation based on the Action filter applied when no type is selected`, () => {
		cy.InterceptRoute(`FetchConversations`);
		cy.getDataTestId(`button-close-keyword-editor`).realClick();
		cy.contains(`[data-test-id="dropdown-button"]`, `Action`).should(`be.visible`).click();
		cy.getDataTestId(`checkbox-action-type`).eq(0).click({force: true});
		const filterText = [
			`Action required`,
			`Blocked user`,
			`Comment hidden`,
			`Comment removed`,
			`Muted member`,
			`Removed member`,
			`Removed post`,
			`Reported`,
			`Turned off commenting`,
			`Marked as read`
		];
		cy.getDataTestId(`action-filter-checkbox`)
			.as(`actionType`)
			.each((actionType, index) => {
				cy.wrap(actionType).within(() => cy.getDataTestId(`checkbox-action-type`).click({force: true}));
				cy.get(`[data-test-id="applied-filter-name"]`)
					.eq(index)
					.should(`be.visible`)
					.should(`have.text`, `Action: ` + filterText[index] + ` `);
			});
		cy.contains(`[data-test-id="dropdown-button"]`, `Action`).should(`be.visible`).click();
		filterText.forEach(text => {
			cy.getDataTestId(`close-filter-tag`).eq(0).should(`be.visible`).click();
			cy.wait(`@FetchConversations`, {responseTimeout: 30000});
			cy.contains(`[data-test-id="applied-filter-name"]`, text).should(`not.exist`);
		});
	});

	it(`Verify user is able to filter the conversation based on the Action filter applied when type post is selected`, () => {
		cy.InterceptRoute(`FetchConversations`);
		cy.contains(`[data-test-id="dropdown-button"]`, `Type`).should(`be.visible`).click();
		cy.contains(`[data-cs-parent-label="Take Action"]`, `Posts`).should(`be.visible`).click();
		cy.contains(`[data-test-id="dropdown-button"]`, `Action`).as(`action`).should(`be.visible`).click();
		const filterText = [
			`Posts`,
			`Action required`,
			`Blocked user`,
			`Muted member`,
			`Removed member`,
			`Removed post`,
			`Reported`,
			`Turned off commenting`,
			`Marked as read`
		];
		cy.getDataTestId(`action-filter-checkbox`)
			.as(`actionType`)
			.each((actionType, index) => {
				cy.wrap(actionType).within(() => cy.getDataTestId(`checkbox-action-type`).click({force: true}));
				cy.get(`[data-test-id="applied-filter-name"]`)
					.eq(index)
					.should(`be.visible`)
					.should(`contain.text`, filterText[index]);
			});
		cy.get(`@action`).click();
		filterText.forEach(text => {
			cy.getDataTestId(`close-filter-tag`).eq(0).should(`be.visible`).click();
			cy.wait(`@FetchConversations`, {responseTimeout: 30000});
			cy.contains(`[data-test-id="applied-filter-name"]`, text).should(`not.exist`);
		});
	});

	it(`Verify user is able to filter the conversation based on the Action filter applied when type comments is selected`, () => {
		cy.InterceptRoute(`FetchConversations`);
		cy.contains(`[data-test-id="dropdown-button"]`, `Type`).should(`be.visible`).click();
		cy.contains(`[data-cs-parent-label="Take Action"]`, `Comments`).should(`be.visible`).click();
		cy.contains(`[data-test-id="dropdown-button"]`, `Action`).as(`action`).should(`be.visible`).click();
		const filterText = [
			`Comments`,
			`Action required`,
			`Comment hidden`,
			`Comment removed`,
			`Muted member`,
			`Removed member`,
			`Marked as read`
		];
		cy.getDataTestId(`action-filter-checkbox`)
			.as(`actionType`)
			.each((actionType, index) => {
				cy.wrap(actionType).within(() => cy.getDataTestId(`checkbox-action-type`).click({force: true}));
				cy.get(`[data-test-id="applied-filter-name"]`)
					.eq(index)
					.should(`be.visible`)
					.should(`contain.text`, filterText[index]);
			});
		cy.get(`@action`).click();
		filterText.forEach(text => {
			cy.getDataTestId(`close-filter-tag`).eq(0).should(`be.visible`).click();
			cy.wait(`@FetchConversations`, {responseTimeout: 30000});
			cy.contains(`[data-test-id="applied-filter-name"]`, text).should(`not.exist`);
		});
	});
});
