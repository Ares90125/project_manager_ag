import dayjs from 'dayjs';

describe('Self Monetization Campaign test cases', function () {
	before('login using facebook', () => {
		cy.fixture(`api-test/convosightLoginWithGroups.json`).then(session => {
			cy.RestoreSession(session);
		});
		cy.visit(`/login-response`).saveLocalStorage();
		cy.visit('group-admin/manage');
	});

	beforeEach(() => {
		cy.restoreLocalStorage();
	});

	it('C9971330 : To verify that Reports section in Campaigns tab is visible to ALPHA users', () => {
		cy.visit(`group-admin/campaigns`);
		cy.getDataTestId(`campaigns-heading`)
			.as(`campaign`)
			.should(`be.visible`)
			.should(`contain.text`, ` Hello Ravi Kiran! `);
		cy.getDataTestId(`campaigns-subheading`)
			.should(`be.visible`)
			.should(`have.text`, ` Welcome to the world of purpose led marketing, with the biggest brands globally `);
		cy.getDataTestId(`campaigns-report-box`).should(`be.visible`);
		cy.getDataCsLabel(`View your reports`).should(`be.visible`).should(`have.text`, ` View your reports `);
		cy.getDataTestId(`campaigns-report-heading`).should(`be.visible`).should(`have.text`, `Reports ALPHA`);
		cy.getDataTestId(`campaigns-report-img`).should(`be.visible`);
	});

	it('C9995121 : To verify the UI of Reports Card on Campaigns page', () => {
		const status = [`ACTIVE`, `COMPLETED`, `ACTIVE`, `ACTIVE`, `ACTIVE`];
		const dates = [
			` 11 Jul 2021 - 16 Dec 2021 `,
			` 11 Jul 2021 - 16 Jun 2021 `,
			` 11 Jul 2021 - 16 Dec 2021 `,
			` 11 Jul 2021 - 16 Dec 2021 `,
			` 11 Jul 2021 - 16 Dec 2021 `
		];
		const path = `mock-responses/self-monetization`;
		cy.MockQueries(`getUserSelfMonetizationCampaigns`, path);
		cy.getDataCsLabel(`View your reports`).should(`be.visible`).click();
		cy.getDataTestId(`heading-campaign-reports`).should(`be.visible`).should(`have.text`, `Your reports`);
		cy.getDataTestId(`subheading-campaign-reports`)
			.should(`be.visible`)
			.should(
				`have.text`,
				` Create and share detailed reports for your self sourced campaigns with our new report generator `
			);
		cy.getDataCsLabel(`Create new Report`).should(`be.visible`).should(`have.text`, `Create new Report`);
		cy.getDataCsLabel(`Report card`)
			.should(`have.length`, `5`)
			.each((card, index) => {
				cy.wrap(card).within(() => {
					cy.getDataTestId(`report-name`).should(`be.visible`).should(`have.text`, `New Test Campaign`);
					cy.getDataTestId(`report-date`).should(`be.visible`).should(`have.text`, dates[index]);
					cy.getDataTestId(`report-status`).should(`be.visible`).should(`have.text`, status[index]);
				});
			});
		cy.get(`.back-btn`).should(`be.visible`).should(`have.text`, `Back`).should(`be.enabled`).click();
		cy.getDataTestId(`campaigns-heading`)
			.as(`campaign`)
			.should(`be.visible`)
			.should(`have.text`, ` Hello Ravi Kiran! `);
		cy.getDataTestId(`campaigns-subheading`)
			.should(`be.visible`)
			.should(`have.text`, ` Welcome to the world of purpose led marketing, with the biggest brands globally `);
	});

	it('C10006100: To verify that Zero state screen is coming if user has no reports generated yet', () => {
		const path = `mock-responses/self-monetization/ZeroStateCampaignReports`;
		cy.MockQueries(`getUserSelfMonetizationCampaigns`, path);
		cy.visit(`group-admin/campaigns/campaign-report`);
		cy.getDataTestId(`heading-campaign-reports`).should(`be.visible`).should(`have.text`, `Your reports`);
		cy.getDataTestId(`subheading-campaign-reports`)
			.should(`be.visible`)
			.should(
				`have.text`,
				` Create and share detailed reports for your self sourced campaigns with our new report generator `
			);
		cy.getDataCsLabel(`Create new Report`).should(`be.visible`).should(`have.text`, `Create new Report`);
		cy.getDataTestId(`empty-report-state-img`).should(`be.visible`);
		cy.getDataTestId(`empty-report-state-heading`)
			.should(`be.visible`)
			.should(`have.text`, `You have not created any reports yet`);
	});
	it('C10072631: To verify that Create New report takes user to create new report page', () => {
		cy.getDataCsLabel(`Create new Report`).should(`be.visible`).click();
		cy.getDataTestId(`heading-create-new-report`).should(`be.visible`).should(`have.text`, `Create a new report`);
	});
	it('C10073443: To verify that user is able to select First post date except future dates', () => {
		cy.visit(`group-admin/campaigns/campaign-report`);
		cy.getDataCsLabel(`Create new Report`).should(`be.visible`).click();
		cy.get(`[formcontrolname="campaignName"]`).should(`be.visible`);
		cy.get(`button[aria-label="Open calendar"]`).eq(0).click();
		cy.get(`.mat-calendar-body`).within(() => {
			cy.get(`[aria-label="${dayjs().add(1, 'day').format(`ddd MMM DD YYYY`)}"]`).should(
				`have.attr`,
				`aria-disabled`,
				`true`
			);
			cy.wait(1000);
			cy.get(`[aria-label="${dayjs().format(`ddd MMM DD YYYY`)}"]`).click({scrollBehavior: `nearest`});
		});
	});
	it('C10073444: To verify that user is able to select Last Post date greater than or equal to First Post date only', () => {
		cy.get(`button[aria-label="Open calendar"]`).eq(1).click();
		cy.get(`.mat-calendar-body`).within(() => {
			cy.get(`[aria-label="${dayjs().subtract(1, 'day').format(`ddd MMM DD YYYY`)}"]`).should(
				`have.attr`,
				`aria-disabled`,
				`true`
			);
			cy.wait(1000);
			cy.get(`[aria-label="${dayjs().format(`ddd MMM DD YYYY`)}"]`)
				.should(`not.have.attr`, `aria-disabled`, `true`)
				.click();
		});
	});
	it('C10073442: To verify that user is able to enter Campaign Name', () => {
		cy.get(`.form-group`)
			.eq(0)
			.click()
			.within(() => {
				cy.get(`label`).should(`be.visible`).should(`have.text`, `Campaign Name*`);
				cy.getDataCsParentLabel(`Tooltip`).should(`have.attr`, `data-cs-label`, `Name for your campaign report`);
				cy.get(`[formcontrolname="campaignName"]`).should(`be.visible`).type(`Test Campaign`);
			});
	});
	it('C10073441: To Verify that Generate you campaign report button is not enabled unless all required fields are filled', () => {
		cy.getDataCsLabel(`Generate your campaign report`).as(`generateButton`).should(`be.visible`).should(`be.disabled`);
		cy.getDataTestId(`text-requiredfield-not-populated`)
			.as(`requiredFields`)
			.should(`be.visible`)
			.should(`have.text`, `At least one brand name or keyword is required to generate a report`);
		cy.get(`.form-group`)
			.eq(1)
			.within(() => {
				cy.get(`label`).should(`be.visible`).should(`have.text`, `First post date*`);
				cy.getDataCsParentLabel(`Tooltip`).should(
					`have.attr`,
					`data-cs-label`,
					`The date when you did the first post for the campaign in your group(s)`
				);
				cy.get(`button[aria-label="Open calendar"]`).eq(0).click();
			});
		cy.get(`.mat-calendar-body`).within(() => {
			cy.wait(1000);
			cy.get(`[aria-label="${dayjs().format(`ddd MMM DD YYYY`)}"]`).click();
		});
		cy.get(`@generateButton`).should(`be.visible`).should(`be.disabled`);
		cy.get(`@requiredFields`)
			.should(`be.visible`)
			.should(`have.text`, `At least one brand name or keyword is required to generate a report`);
		cy.get(`.form-group`)
			.eq(2)
			.within(() => {
				cy.get(`label`).should(`be.visible`).should(`have.text`, `Last post date*`);
				cy.getDataCsParentLabel(`Tooltip`).should(
					`have.attr`,
					`data-cs-label`,
					`The date when you did the last post for the campaign in your group(s)`
				);
				cy.get(`button[aria-label="Open calendar"]`).eq(0).click();
			});
		cy.get(`.mat-calendar-body`).within(() => {
			// eslint-disable-next-line cypress/no-unnecessary-waiting
			cy.wait(1000);
			cy.get(`[aria-label="${dayjs().format(`ddd MMM DD YYYY`)}"]`).click();
		});
		cy.get(`@generateButton`).should(`be.visible`).should(`be.disabled`);
		cy.get(`@requiredFields`)
			.should(`be.visible`)
			.should(`have.text`, `At least one brand name or keyword is required to generate a report`);
		cy.get(`.form-group`)
			.eq(3)
			.within(() => {
				cy.get(`label`).should(`be.visible`).should(`contain.text`, `Participating Facebook groups*`);
				cy.getDataCsParentLabel(`Tooltip`).should(
					`have.attr`,
					`data-cs-label`,
					`All your Facebook Groups involved in this campaign`
				);
				cy.getDataTestId(`button-drop-down`)
					.as(`dropDown`)
					.should(`be.visible`)
					.should(`contain.text`, `Select all your Facebook Groups involved in this campaign`)
					.click();
				cy.contains(`[data-test-id="value-drop-down-checkbox"]`, ` Cs Admin Test Group `).should(`be.visible`).click();
				cy.get(`@dropDown`).should(`be.visible`).should(`have.text`, `Cs Admin Test Group`).realClick();
			});
		cy.get(`@generateButton`).should(`be.visible`).should(`be.disabled`);
		cy.get(`@requiredFields`)
			.should(`be.visible`)
			.should(`have.text`, `At least one brand name or keyword is required to generate a report`);
		cy.get(`.report-body-row`)
			.eq(1)
			.within(() => {
				cy.getDataTestId(`brand-mention-heading`)
					.should(`be.visible`)
					.should(`have.text`, `💼 Which brand do you want to track for this campaign?`);
				cy.get(`label`).should(`be.visible`).should(`contain.text`, `Brand name variations `);
				cy.getDataTestId(`input-brand-mention`)
					.should(`be.visible`)
					.should(`have.attr`, `placeholder`, `Enter comma (,) separated variations of brand name`)
					.type(`Nestle,Haldigram,`);
				cy.getDataTestId(`brand-keyword`).eq(0).should(`be.visible`).should(`contain.text`, `Nestle`);
				cy.getDataTestId(`brand-keyword`).eq(1).should(`be.visible`).should(`contain.text`, `Haldigram`);
				cy.getDataTestId(`brand-mention-note`)
					.should(`be.visible`)
					.should(
						`have.text`,
						` Enter all common spelling variations of the brand name. For example - “Amazon, Amzon, Amazone, AMZN” `
					);
			});
		cy.get(`@generateButton`).should(`be.visible`).should(`be.enabled`);
		cy.getDataTestId(`remove-keyword`).eq(0).should(`be.visible`).realClick();
		cy.getDataTestId(`remove-keyword`).should(`be.visible`).realClick();
		cy.get(`@generateButton`).should(`be.visible`).should(`be.disabled`);
		cy.get(`.report-body-row`)
			.eq(2)
			.within(() => {
				cy.getDataTestId(`heading-keywords`)
					.should(`be.visible`)
					.should(`have.text`, ` 📊 What are the keywords & hashtags you would like to track for this campaign? `);
				cy.get(`label`).should(`be.visible`).should(`contain.text`, `Keywords and hashtags `);
				cy.getDataTestId(`input-keyword-tile`)
					.should(`be.visible`)
					.should(`have.attr`, `placeholder`, `Enter comma (,) separated hashtags and keywords`)
					.type(`#Nestle,#Haldigram,`);
				cy.getDataTestId(`keyword-tile`).eq(0).should(`be.visible`).should(`contain.text`, `#Nestle`);
				cy.getDataTestId(`keyword-tile`).eq(1).should(`be.visible`).should(`contain.text`, `#Haldigram`);
				cy.getDataTestId(`note-keyword-tile`)
					.should(`be.visible`)
					.should(
						`have.text`,
						` Enter all common spelling variations of hashtags and keywords you want to track for this campaign. Example - “#healthyraho, #health, nutrition, parenting” `
					);
			});
		cy.get(`@generateButton`).should(`be.visible`).should(`be.enabled`);
		cy.getDataTestId(`remove-keyword-tile`).eq(0).should(`be.visible`).realClick();
		cy.getDataTestId(`remove-keyword-tile`).should(`be.visible`).realClick();
		cy.get(`@generateButton`).should(`be.visible`).should(`be.disabled`);
	});
	it('C10231791: To verify that user is able to remove the selected group by clicking on checkbox', () => {
		cy.get(`.form-group`)
			.eq(3)
			.within(() => {
				cy.getDataTestId(`button-drop-down`).as(`buttonDropDown`).realClick();
				cy.contains(`[data-test-id="value-drop-down-checkbox"]`, ` Cs Admin Test Group `)
					.should(`be.visible`)
					.within(() => cy.get(`[type="checkbox"]`).should(`be.checked`))
					.click();
				cy.contains(`[data-test-id="value-drop-down-checkbox"]`, ` Cs Admin Test Group `).within(() =>
					cy.get(`[type="checkbox"]`).should(`not.be.checked`)
				);
				cy.get(`@buttonDropDown`).realClick();
				cy.get(`@buttonDropDown`)
					.should(`be.visible`)
					.should(`contain.text`, `Select all your Facebook Groups involved in this campaign`);
			});
	});

	it('C10073445: To Verify that Select groups drop down list is showing all the groups in which user has installed CS', () => {
		cy.get(`.form-group`)
			.eq(3)
			.within(() => {
				cy.getDataTestId(`button-drop-down`).as(`buttonDropDown`).realClick();
				cy.contains(`[data-test-id="value-drop-down-checkbox"]`, ` Cs Admin Test Group `)
					.should(`be.visible`)
					.within(() => cy.get(`[type="checkbox"]`).should(`not.be.checked`));
				cy.contains(`[data-test-id="value-drop-down-checkbox"]`, ` Kids Nutrition and Recipes 👶🍎🍜 `)
					.should(`be.visible`)
					.within(() => cy.get(`[type="checkbox"]`).should(`not.be.checked`));
				cy.contains(`[data-test-id="value-drop-down-checkbox"]`, ` Test group 2 `)
					.should(`be.visible`)
					.within(() => cy.get(`[type="checkbox"]`).should(`not.be.checked`));
				cy.get(`@buttonDropDown`).realClick();
			});
	});
	it('C10073446: To verify that user is able to search groups by typing in search field', () => {
		cy.get(`.form-group`)
			.eq(3)
			.within(() => {
				cy.getDataTestId(`button-drop-down`).as(`buttonDropDown`).realClick();
				cy.get(`input[placeholder="Start typing to search"]`).should(`be.visible`).type(`Test`);
				cy.contains(`[data-test-id="value-drop-down-checkbox"]`, ` Cs Admin Test Group `)
					.should(`be.visible`)
					.within(() => cy.get(`[type="checkbox"]`).should(`not.be.checked`));
				cy.contains(`[data-test-id="value-drop-down-checkbox"]`, ` Kids Nutrition and Recipes 👶🍎🍜 `).should(
					`be.hidden`
				);
				cy.contains(`[data-test-id="value-drop-down-checkbox"]`, ` Test group 2 `)
					.should(`be.visible`)
					.within(() => cy.get(`[type="checkbox"]`).should(`not.be.checked`));
				cy.get(`@buttonDropDown`).realClick();
			});
	});

	it('C10073447: To verify that user can select multiple groups at a time', () => {
		cy.get(`.form-group`)
			.eq(3)
			.within(() => {
				cy.getDataTestId(`button-drop-down`).as(`buttonDropDown`).should(`be.enabled`).realClick();
				cy.contains(`[data-test-id="value-drop-down-checkbox"]`, ` Cs Admin Test Group `)
					.click()
					.within(() => cy.get(`[type="checkbox"]`).should(`be.checked`));
				cy.contains(`[data-test-id="value-drop-down-checkbox"]`, ` Test group 2 `)
					.click()
					.within(() => cy.get(`[type="checkbox"]`).should(`be.checked`));
				cy.get(`@buttonDropDown`).realClick().should(`have.text`, `Test group 2Cs Admin Test Group`);
			});
	});

	it('C23477920 : To verify that share button functionality is working', () => {
		cy.InterceptRoute(`shortenUrl`);
		cy.visit(`group-admin/campaigns`);
		cy.getDataTestId(`campaigns-heading`)
			.as(`campaign`)
			.should(`be.visible`)
			.should(`contain.text`, ` Hello Ravi Kiran! `);
		cy.getDataCsLabel(`View your reports`).should(`be.visible`).click();
		cy.get(`.report-card`).eq(2).click();
		cy.getDataCsLabel(`Share report`).should(`be.visible`).click();
		cy.get(`#shareReport`)
			.as(`shareLinkModal`)
			.should(`be.visible`)
			.within(() => {
				cy.wait(1000);
				cy.get(`[aria-label="Close"]`).should(`be.visible`).should(`be.enabled`).realClick();
			});
		cy.get(`@shareLinkModal`).should(`have.attr`, `aria-hidden`, `true`);
		cy.getDataCsLabel(`Share report`).should(`be.visible`).click();
		cy.wait(`@shortenUrl`, {responseTimeout: 30000});
		cy.get(`#shareReport`)
			.as(`shareLinkModal`)
			.should(`be.visible`)
			.within(() => {
				cy.get(`.modal-header>h5`).should(`be.visible`).should(`have.text`, `Share Report`);
				cy.get(`.modal-body>h6`).should(`be.visible`).should(`have.text`, `Link to share`);
				cy.get(`#copyCode`).should(`be.visible`).should(`have.text`, ``);
				cy.get(`.view-note>span`).should(`be.visible`).should(`have.text`, `Anyone with this link can view the report`);
				cy.getDataCsLabel(`Copy link`).should(`be.visible`).should(`have.text`, `Copy link`).click();
			});
		cy.get(`#toast-container`)
			.should(`be.visible`)
			.within(() => {
				cy.get(`[role="alertdialog"]`)
					.should(`be.visible`)
					.should(`have.text`, ` Link to your campaign report has been copied successfully `);
				cy.get(`[aria-label="Close"]`).click();
			});
	});

	it('C23477926 : To verify that user is able to add campaign summary by typing text and clicking on Done button', () => {
		cy.getDataCsLabel(`Add a campaign summary`).should(`be.visible`).should(`be.enabled`).click();
		cy.get(`#addCampaignSummary`)
			.as(`campaignSummaryModel`)
			.should(`be.visible`)
			.within(() => {
				cy.wait(1000);
				cy.getDataCsLabel(`Close`).should(`be.visible`).should(`be.enabled`).click();
			});
		cy.get(`@campaignSummaryModel`).should(`have.attr`, `aria-hidden`, `true`);
		cy.getDataCsLabel(`Add a campaign summary`).should(`be.visible`).should(`be.enabled`).click();
		cy.get(`@campaignSummaryModel`).within(() => {
			cy.get(`.modal-header>h5`).should(`be.visible`).should(`have.text`, `Add a campaign summary`);
			cy.wait(1000);
			cy.get(`.ql-container>.ql-editor`).type(`Test Campaign Summary`);
			cy.getDataCsLabel(`Done`).should(`be.visible`).should(`have.text`, ` Done `).click();
		});
		cy.get(`.campaign-summary-box`)
			.eq(0)
			.should(`be.visible`)
			.within(() => {
				cy.get(`.summary-box-left>h3`).should(`be.visible`).should(`contain.text`, `Campaign summary`);
			});
		cy.get(`.campaign-summary-box`)
			.eq(1)
			.should(`be.visible`)
			.within(() => {
				cy.get(`.campaign-summary>p`).should(`be.visible`).should(`have.text`, `Test Campaign Summary`);
			});
	});

	it('C23477926 : To verify that user is able to edit campaign summary', () => {
		cy.getDataCsLabel(`Edit`).eq(1).should(`be.visible`).click();
		cy.get(`#addCampaignSummary`).within(() => {
			cy.get(`.modal-header>h5`).should(`be.visible`).should(`have.text`, `Add a campaign summary`);
			cy.wait(1000);
			cy.get(`.ql-container>.ql-editor`).clear();
			cy.getDataCsLabel(`Done`).should(`be.visible`).should(`have.text`, ` Done `).click();
		});
		cy.getDataCsLabel(`Add a campaign summary`).should(`be.visible`).should(`be.enabled`);
	});
});
