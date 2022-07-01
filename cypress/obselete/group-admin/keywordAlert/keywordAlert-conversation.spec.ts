describe(`Keyword Alert Scenarios on Group Admin`, () => {
	const NavigateToReport = (reportName: string) => {
		return cy
			.contains(`[data-test-id="reporntName-table"]`, reportName)
			.should(`be.visible`)
			.within(() => cy.getDataTestId(`keywords-report`).click());
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

	it(`Verify the conversation screen if no conversation are found from past two days`, () => {
		cy.visit(`group-admin/group/c40d1bd5-4737-40b3-9e40-de78b64454df/urgentAlerts`);
		NavigateToReport(`Profanity/abusive`);
		VerifyHeading(`heading-conversation-two-days`, `No conversations in Last 2 days - Today and Yesterday`);
		VerifyHeading(`heading-no-conversation-in-two-days`, `All clear ✅`);
		VerifySubHeading(`subheading-no-conversation-in-two-days`, `No conversations found in last 2 days`);
	});

	it(`Verify the conversation screen if no conversation are found from past 14 days`, () => {
		VerifyHeading(`heading-conversation-fourteen-days`, `No conversations found in last 14 days `);
		VerifyHeading(`heading-no-conversation-in-fourteen-days`, `All clear ✅`);
		VerifySubHeading(`subheading-no-conversation-in-fourteen-days`, `No conversations found in last 14 days`);
	});
	it(`Verify the last two days conversations fetched using combination keyword `, () => {
		const path = `mock-responses/keywordAlert.spec/twoDaysConversations`;
		cy.MockQueryUsingFile(`FetchConversations`, path).MockQueries(`GetKeywordTrackerReport`, path);
		cy.visit(`/group-admin/group/c40d1bd5-4737-40b3-9e40-de78b64454df/urgentAlerts`);
		cy.clock(1627544762000); //Date is set as 29th July
		NavigateToReport(`Medical`);
		cy.window()
			.its(`data`)
			.then(data => {
				const [, , {twoDays}, conversations2Days] = data;
				cy.getDataTestId(`heading-conversation-two-days`)
					.should(`be.visible`)
					.should(`have.text`, twoDays + ` conversations in Last 2 days - Today and Yesterday`);
				cy.getDataTestId(`card-keyword-tracker`)
					.as(`card`)
					.each((card, index) => {
						const {rawText} = conversations2Days[index];
						cy.wrap(card).within(() => {
							cy.getDataTestId(`conversation-two-days-text`).should(`have.text`, rawText);
							cy.getDataTestId(`view-post-fb-link`).should(`be.visible`).should(`have.text`, `View post on Facebook`);
							cy.getDataTestId(`button-remove-member`).should(`be.visible`).should(`have.text`, ` Remove member `);
							cy.getDataTestId(`button-block-user`).should(`be.visible`).should(`have.text`, ` Block user `);
							cy.getDataTestId(`button-mark-read`).should(`be.visible`).should(`have.text`, ` Mark as read `);
							cy.getDataTestId(`button-report`).should(`be.visible`).should(`have.text`, ` Report `);
							cy.getDataTestId(`button-turnoff-commenting`)
								.should(`be.visible`)
								.should(`have.text`, ` Turn off commenting `);
							cy.getDataTestId(`button-remove-post`).should(`be.visible`).should(`have.text`, ` Remove post `);
						});
					});
			});
	});
	it(`Verify the last fourteen days conversations fetched using combination keyword`, () => {
		cy.window()
			.its(`data`)
			.then(data => {
				const [, , {fourteenDays}, , conversations14Days] = data;
				cy.getDataTestId(`heading-conversation-fourteen-days`)
					.should(`be.visible`)
					.should(`have.text`, fourteenDays + ` conversations found in last 14 days `);
				cy.getDataTestId(`card-keyword-tracker-fourteen-days`)
					.as(`card`)
					.each((card, index) => {
						const {rawText} = conversations14Days[index];
						cy.wrap(card).within(() => {
							cy.getDataTestId(`conversation-fourteen-days-text`).should(`have.text`, rawText);
							cy.getDataTestId(`view-post-fb-link-fourteen-days`)
								.should(`be.visible`)
								.should(`have.text`, `View post on Facebook`);
							cy.getDataTestId(`button-remove-member-fourteen-days`)
								.should(`be.visible`)
								.should(`have.text`, ` Remove member `);
							cy.getDataTestId(`button-block-user-fourteen-days`)
								.should(`be.visible`)
								.should(`have.text`, ` Block user `);
							cy.getDataTestId(`button-mark-read-fourteen-days`)
								.should(`be.visible`)
								.should(`have.text`, ` Mark as read `);
							cy.getDataTestId(`button-report-fourteen-days`).should(`be.visible`).should(`have.text`, ` Report `);
							cy.getDataTestId(`button-turnoff-commenting-fourteen-days`)
								.should(`be.visible`)
								.should(`have.text`, ` Turn off commenting `);
							cy.getDataTestId(`button-remove-post-fourteen-days`)
								.should(`be.visible`)
								.should(`have.text`, ` Remove post `);
							cy.getDataTestId(`button-mute-member-fourteen-days`)
								.should(`be.visible`)
								.should(`have.text`, ` Mute member `);
						});
					});
			});
	});
});
