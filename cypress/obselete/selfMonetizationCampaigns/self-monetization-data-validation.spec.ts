describe.skip('Self Monetization Campaign test cases', function () {
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
	const brandKeyowrds = [`Healthy`, `foof`, `breakfast`, `babies`];
	it('To set up test data for test case C23477925', () => {
		const path = `mock-responses/self-monetization/dataValidation`;
		cy.MockQueries(`getUserSelfMonetizationCampaigns`, path);
		cy.visit(`group-admin/campaigns`);
		cy.getDataTestId(`campaigns-heading`)
			.as(`campaign`)
			.should(`be.visible`)
			.should(`have.text`, ` Hello Ravi Kiran! `);
		cy.getDataCsLabel(`View your reports`).should(`be.visible`).click();
		cy.getDataCsLabel(`Report card`).should(`have.length`, `5`);
	});
	it('C23477925 :To verify the facebook groups, brand keywords and keyword & Hashtags data is coming right', () => {
		cy.intercept(
			{
				method: `GET`,
				url: `https://backend.convosight.com/dev/getCampaignReportWithPosts*`
			},
			req => {
				req.reply({fixture: 'mock-responses/self-monetization/dataValidation/CampaignDetails.json'});
			}
		);
		const path = `mock-responses/self-monetization/dataValidation`;
		cy.MockQueries(`getUserSelfMonetizationCampaigns`, path);
		cy.contains(`[data-test-id="report-name"]`, `Automation Test`).should(`be.visible`).click();
		cy.get(`.report-note-left`)
			.should(`be.visible`)
			.within(() => {
				cy.get(`img`).should(`be.visible`);
				cy.get(`span`)
					.should(`be.visible`)
					.should(`have.text`, `This report uses data for 7 more days after Campaign duration`);
			});
		cy.get(`#facebook-groups`).within(() => {
			cy.get(`h3`).should(`be.visible`).should(`have.text`, `Facebook groups (1)`);
			cy.get(`.badge`).should(`be.visible`).should(`have.text`, `Weight Gain for Kids`);
		});
		cy.get(`#brand-keywords`).within(() => {
			cy.get(`h3`).should(`be.visible`).should(`have.text`, `Brand keywords (4)`);
			cy.get(`.badge`).each((ele, index) =>
				cy.wrap(ele).should(`be.visible`).should(`have.text`, brandKeyowrds[index])
			);
		});
		cy.get(`#keywords-hashtags`)
			.should(`be.visible`)
			.within(() => {
				cy.get(`h3`).should(`be.visible`).should(`have.text`, `Keywords & hashtags (2)`);
				cy.get(`.badge`).eq(0).should(`be.visible`).should(`have.text`, `#healthy`);
				cy.get(`.badge`).eq(1).should(`be.visible`).should(`have.text`, `#healthyBabyFood`);
			});
	});

	it('C23477928 :To verify that view more button is coming if any of the above data count is more than 3', () => {
		cy.get(`.view-link`).should(`be.visible`).should(`have.text`, ` + View more `).click();
		cy.get(`#allKeywordsList`)
			.as(`modelContent`)
			.within(() => {
				cy.get(`.modal-title`).should(`be.visible`).should(`have.text`, `Campaign info`);
				cy.get(`.modal-keywords-row`)
					.eq(0)
					.within(() => {
						cy.get(`h5`).should(`be.visible`).should(`have.text`, `Facebook groups (1)`);
						cy.get(`.badge`).should(`be.visible`).should(`have.text`, `Weight Gain for Kids`);
					});
				cy.get(`.modal-keywords-row`)
					.eq(1)
					.within(() => {
						cy.get(`h5`).should(`be.visible`).should(`have.text`, `Brand keywords (4)`);
						cy.get(`.badge`).each((ele, index) =>
							cy.wrap(ele).should(`be.visible`).should(`have.text`, brandKeyowrds[index])
						);
					});
				cy.get(`.modal-keywords-row`)
					.eq(1)
					.within(() => {
						cy.get(`h5`).should(`be.visible`).should(`have.text`, `Brand keywords (4)`);
						cy.get(`.badge`).each((ele, index) =>
							cy.wrap(ele).should(`be.visible`).should(`have.text`, brandKeyowrds[index])
						);
					});
				cy.get(`.modal-keywords-row`)
					.eq(2)
					.within(() => {
						cy.get(`h5`).should(`be.visible`).should(`have.text`, `Keywords & hashtags (2)`);
						cy.get(`.badge`).eq(0).should(`be.visible`).should(`have.text`, `#healthy`);
						cy.get(`.badge`).eq(1).should(`be.visible`).should(`have.text`, `#healthyBabyFood`);
					});
				cy.wait(2000);
				cy.get(`[aria-label="Close"]`).should(`be.visible`).should(`be.enabled`).realClick();
			});
		cy.get(`@modelContent`).should(`have.attr`, `aria-hidden`, `true`);
	});

	it('C23477931 : To verify the "Keyword & hashtag mention count" count section', () => {
		let tileRow1 = [` Groups `, ` Admin posts `, ` Group member posts `, ` Total reactions `, ` Total comments `];
		let tileValueRow1 = [`1`, `11`, `57`, `1445`, `1211`];
		let tooltipRow1 = [
			`Total number of Facebook groups that participated in the campaign`,
			`Number of posts done by any of your team members added on the “Add moderators” screen for the respective group`,
			`Number of posts by group members using campaign keywords during the campaign duration and next 7 days`,
			`Total number of reactions on posts and comments across campaign and organic posts during campaign duration and next 7 days`,
			`Total number of comments across campaign and organic posts during campaign duration and next 7 days`
		];
		cy.get(`.key-matrix-box`)
			.should(`be.visible`)
			.scrollIntoView()
			.within(() => {
				cy.get(`h3>span`).should(`be.visible`).should(`have.text`, `Key Metrics`);
				cy.getDataCsLabel(`Key performance indicators for the campaign`).should(`be.visible`);
				cy.get(`.matrix-box-ul`).each(element => {
					cy.wrap(element)
						.should(`be.visible`)
						.within(() => {
							cy.get(`.matrix-box-li`).each(element => {
								cy.wrap(element).within(() => {
									cy.get(`img`).should(`be.visible`);
									cy.get(`p`).should(`be.visible`).should(`contain.text`, tileRow1[0]);
									cy.get(`h6`).should(`be.visible`).should(`have.text`, tileValueRow1[0]);
									cy.getDataCsLabel(`${tooltipRow1[0]}`).should(`be.visible`);
									tileRow1.shift();
									tileValueRow1.shift();
									tooltipRow1.shift();
								});
							});
						});
				});
			});
	});
	it('C23477932 : To verify the "Brand mentions and conversations count" section', () => {
		cy.get(`.keyword-box > .keyword-box-header`)
			.eq(0)
			.should(`be.visible`)
			.scrollIntoView()
			.within(() => {
				cy.get(`h3>span`).should(`be.visible`).should(`have.text`, `Keyword & hashtag mention count`);
				cy.getDataCsLabel(
					`Compare number of mentions of campaign keywords and hashtags in participating groups, before and after the campaign`
				).should(`be.visible`);
				cy.contains(`.box-header-right`, `Before campaign`)
					.should(`be.visible`)
					.should(`contain.text`, `Before campaign`);
				cy.contains(`.box-header-right`, `After campaign`)
					.should(`be.visible`)
					.should(`contain.text`, `After campaign`);
				cy.get(`.color-1`).should(`be.visible`);
				cy.get(`.color-2`).should(`be.visible`);
			});
		cy.get(`.keyword-box-table`).within(() => {
			const heading = [`Keyword / HASHTAG`, `VOLUME`, `IMPACT`];
			cy.get(`thead>tr>th`).each(ele => {
				cy.wrap(ele).should(`be.visible`).should(`have.text`, heading[0]);
				heading.shift();
			});
			const keyword = [`#healthy`, `#healthyBabyFood`];
			const beforeCampaignMetric = [`16`, `10`];
			const afterCampaignMetric = [`23`, `21`];
			const impactMetric = [`7`, `11`];
			const impactMetricPercentage = [`(44%)`, `(110%)`];
			cy.get(`tbody>tr`).each((ele, index) => {
				cy.wrap(ele).within(() => {
					cy.get(`td`).eq(0).should(`be.visible`).should(`have.text`, keyword[index]);
					cy.get(`td>.row-graph>.list-unstyled>li >.light-row`).should(`be.visible`);
					cy.get(`td>.row-graph>.list-unstyled>li >span`)
						.should(`be.visible`)
						.should(`have.text`, beforeCampaignMetric[index]);
					cy.get(`td>.row-graph>.list-unstyled>li >.dark-row`).should(`be.visible`);
					cy.get(`td>.row-graph>.list-unstyled>li >strong`)
						.should(`be.visible`)
						.should(`have.text`, afterCampaignMetric[index]);
					cy.get(`td>.up >span`).should(`be.visible`).should(`have.text`, impactMetric[index]);
					cy.get(`td>.up >.impact-change`).should(`be.visible`).should(`contain.text`, impactMetricPercentage[index]);
					cy.get(`td>.up >.impact-change>img`)
						.should(`be.visible`)
						.should(`have.attr`, `src`, `assets/images/reports/up.svg`);
				});
			});
		});
	});

	it('C23477933 : To verify the "Keyword, hashtag & brand mention count by group" section', () => {
		cy.get(`.keyword-box > .keyword-box-header`)
			.eq(1)
			.should(`be.visible`)
			.scrollIntoView()
			.within(() => {
				cy.get(`h3>span`).should(`be.visible`).should(`have.text`, `Brand mentions and conversations count`);
				cy.getDataCsLabel(
					`Compare number of brand conversations and mentions in participating groups, before and after the campaign`
				).should(`be.visible`);
				cy.contains(`.box-header-right`, `Before campaign`)
					.should(`be.visible`)
					.should(`contain.text`, `Before campaign`);
				cy.contains(`.box-header-right`, `After campaign`)
					.should(`be.visible`)
					.should(`contain.text`, `After campaign`);
				cy.get(`.color-1`).should(`be.visible`);
				cy.get(`.color-2`).should(`be.visible`);
			});
		cy.get(`.brand-box-table`).within(() => {
			const heading = [`METRIC`, `COUNT`, `IMPACT`];
			cy.get(`thead>tr>th`).each(ele => {
				cy.wrap(ele).should(`be.visible`).should(`have.text`, heading[0]);
				heading.shift();
			});
			const keyword = [`Brand Mentions`, `Brand Conversations`];
			const convmessage = [
				`The total number of times brand is mentioned across posts and comments during the campaign`,
				`The total number of posts and comments containing brand name during the campaign`
			];
			const beforeCampaignMetric = [`247`, `942`];
			const afterCampaignMetric = [`280`, `1279`];
			const impactMetric = [`33`, `337`];
			const impactMetricPercentage = [`(13%)`, `(36%)`];
			cy.get(`tbody>tr`).each((ele, index) => {
				cy.wrap(ele).within(() => {
					cy.get(`td>div`).eq(0).should(`be.visible`).should(`have.text`, keyword[index]);
					cy.get(`td>span`).should(`be.visible`).should(`have.text`, convmessage[index]);
					cy.get(`td>.row-graph>.list-unstyled>li >.light-row`).should(`be.visible`);
					cy.get(`td>.row-graph>.list-unstyled>li >span`)
						.should(`be.visible`)
						.should(`have.text`, beforeCampaignMetric[index]);
					cy.get(`td>.row-graph>.list-unstyled>li >.dark-row`).should(`be.visible`);
					cy.get(`td>.row-graph>.list-unstyled>li >strong`)
						.should(`be.visible`)
						.should(`have.text`, afterCampaignMetric[index]);
					cy.get(`td>.up >span`).should(`be.visible`).should(`have.text`, impactMetric[index]);
					cy.get(`td>.up >.impact-change`).should(`be.visible`).should(`contain.text`, impactMetricPercentage[index]);
					cy.get(`td>.up >.impact-change>img`)
						.should(`be.visible`)
						.should(`have.attr`, `src`, `assets/images/reports/up.svg`);
				});
			});
		});
	});

	it('C23477934 : To verify the "All Posts" section', () => {
		cy.get(`.all-post-box`)
			.should(`be.visible`)
			.within(() => {
				cy.get(`h3`).should(`be.visible`).should(`have.text`, ` All Posts (5)`);
				cy.get(`table`)
					.should(`be.visible`)
					.scrollIntoView()
					.within(() => {
						const heading = [`TIME`, `POST`, `POSTED IN GROUP`, `Reactions`, `Comments`];
						cy.get(`th`).each((ele, index) => {
							cy.wrap(ele).should(`be.visible`).should(`have.text`, heading[index]);
						});
					});
				cy.fixture(`mock-responses/self-monetization/dataValidation/CampaignDetails.json`).then(data => {
					const time = [
						` 04 Jun, 2021 02:45 PM `,
						` 07 Jun, 2021 03:00 AM `,
						` 07 Jun, 2021 11:05 AM `,
						` 07 Jun, 2021 02:24 PM `,
						` 09 Jun, 2021 `
					];
					const postdesc = [
						` diet chart for 12-19 months babies \n\nmorning wake up time \n7:00 to 8:00\n\nbreast feed or 1 cup milk\n\n... `,
						` chna chaat in breakfast `,
						` power diet for 2-5 years schooler\n\n early-morning(7- 8 am\nday 1-1 cup milk with dried fruits and 1 t... `,
						` poha day special\n 😍😍😍😍\npoha with green peas\npoha with peanuts\npoha uttapam\n😍😍😍😍\nmeri daughte... `,
						` mango desert  ..... \nrecipe bahot simple hai . \naap ek layer mango pulp ka daal do.. uske upar ya to... `
					];
					cy.get(`tbody`).each((ele, index) => {
						cy.wrap(ele)
							.should(`be.visible`)
							.within(() => {
								cy.get(`tr`)
									.eq(0)
									.within(ele => {
										cy.get(`.date-wrap`).should(`be.visible`).should(`contain.text`, time[index]);
										cy.get(`.post-desc>figure>img`)
											.should(`be.visible`)
											.should(`have.attr`, `src`, data.CampaignPosts[index].postPhotoUrl);
										cy.get(`.post-desc>.post-content>h5`).should(`be.visible`).should(`contain.text`, postdesc[index]);
										cy.get(`.post-content>ul>li:nth-child(2)>img`).should(`be.visible`);
										cy.get(`.post-content>ul>li:nth-child(2)>span`)
											.should(`be.visible`)
											.should(`have.text`, `Admin post`);
										cy.get(`.post-content>ul>li:nth-child(3)>span`)
											.should(`be.visible`)
											.should(`have.text`, `by Rahila Jamal`);
										cy.get(`a`).should(`be.visible`).should(`contain.text`, `View post`).click();
										cy.wrap(ele)
											.parent()
											.within(() => {
												cy.get(`.more-info > div:nth-child(2)`)
													.should(`be.visible`)
													.should(`contain.text`, data.CampaignPosts[index].postRawText);
												cy.get(`img`)
													.should(`be.visible`)
													.should(`have.attr`, `src`, data.CampaignPosts[index].postPhotoUrl);
												cy.get(`.view-post-link>a`)
													.should(`be.visible`)
													.should(`have.attr`, `href`, data.CampaignPosts[index].fbPermlink);
												cy.wait(1000);
												cy.get(`.close`).realClick();
											});
										cy.get(`.group-name>div`)
											.should(`be.visible`)
											.should(`have.text`, data.CampaignPosts[index].groupName);
										cy.get(`td:nth-child(4)>div`)
											.should(`be.visible`)
											.should(`have.text`, data.CampaignPosts[index].reactionCount);
										cy.get(`td:nth-child(5)>div`)
											.should(`be.visible`)
											.should(`have.text`, data.CampaignPosts[index].commentCount);
									});
							});
					});
				});
				cy.get(`.pagination-wrap>span`).should(`be.visible`).should(`have.text`, `1-5 of All posts`);
				cy.getDataCsLabel(`Get Previous Conversation`).should(`be.visible`).should(`be.disabled`);
				cy.getDataCsLabel(`Get Next Conversation`).should(`be.visible`).should(`be.disabled`);
			});
	});

	it('C23477935 : To verify that user is able to click on Edit highlights and land respective screen', () => {
		cy.MockQueryUsingFile(`getCampaignPosts`, `mock-responses/self-monetization/dataValidation`);
		cy.getDataCsLabel(`Edit highlights`).should(`be.visible`).click();
		cy.getDataCsLabel(`Add campaign posts`).should(`be.visible`).click();
		cy.getDataTestId(`heading-campaign-highlight`)
			.scrollIntoView()
			.should(`be.visible`)
			.should(`have.text`, `Campaign highlights`);
		cy.getDataCsLabel(`Edit highlights`).click();
		cy.get(`.campaign-report-post-header>h5`).should(`be.visible`).should(`have.text`, `Edit campaign highlights`);
		cy.getDataTestId(`heading-edit-campaign-highlight`)
			.should(`be.visible`)
			.should(
				`have.text`,
				` Campaign highlights are auto-generated screenshots of top posts that you would like to feature for brands to see as proof of engagement during the campaign. `
			);
		cy.getDataTestId(`subheading-edit-campaign-highlight`)
			.should(`be.visible`)
			.should(
				`have.text`,
				`Only posts containing text status, links, images, videos and completed live sessions will be available for selection`
			);
		cy.get(`[placeholder="Search posts"]`).should(`be.visible`);
		cy.get(`.result-row`).should(`be.visible`).should(`contain.text`, `53`);
		cy.get(`.posts-search-wrap > .convo-btn-normal`)
			.should(`be.visible`)
			.should(`be.disabled`)
			.should(`have.text`, ` Search posts `);
		cy.get(`.datepicker-wrap`).should(`be.visible`);
		cy.get(`.campaign-report-post-footer > span`).should(`be.visible`).should(`have.text`, `Select atleast 1 post`);
		cy.get(`.campaign-report-post-footer > .convo-btn-primary`)
			.should(`be.visible`)
			.should(`have.text`, ` Done `)
			.should(`be.disabled`);
	});

	it('To verify that user is able to search post with specific date range', () => {
		cy.get(`[placeholder="Search posts"]`).type(`Test`);
		cy.get(`[aria-label="Open calendar"]`).click();
		cy.get(`.mat-calendar-table`)
			.should(`be.visible`)
			.within(() => {
				cy.wait(1000);
				cy.get(`[aria-label="June 8, 2021"]`).should(`be.visible`).click();
				cy.wait(1000);
				cy.get(`[aria-label="June 15, 2021"]`).should(`be.visible`).click();
			});
		cy.get(`.posts-search-wrap > .convo-btn-normal`).as(`searchPostButton`).should(`be.enabled`).click();
		cy.get(`.result-row`).should(`be.visible`).should(`contain.text`, `3`);
		cy.get(`.result-row`).should(`be.visible`).should(`contain.text`, `Test`);
		cy.get(`.all-post-box`)
			.should(`be.visible`)
			.within(() => {
				cy.get(`table>tbody>tr`).as(`rows`).should(`have.length`, 3);
				cy.get(`@rows`)
					.eq(0)
					.within(() => {
						cy.get(`.date-wrap`).should(`be.visible`).should(`contain.text`, ` 14 Jun, 2021 10:25 AM `);
					});
				cy.get(`@rows`)
					.eq(1)
					.within(() => {
						cy.get(`.date-wrap`).should(`be.visible`).should(`contain.text`, ` 14 Jun, 2021 10:25 AM `);
					});
				cy.get(`@rows`)
					.eq(2)
					.within(() => {
						cy.get(`.date-wrap`).should(`be.visible`).should(`contain.text`, ` 14 Jun, 2021 10:30 AM `);
					});
			});
		cy.get(`@searchPostButton`).should(`be.disabled`);
		cy.wait(1000);
		cy.get(`.search-for > img`).should(`be.visible`).realClick();
		cy.get(`.result-row`).should(`be.visible`).should(`contain.text`, `3`);
	});

	it('To verify that user is able to select post and add it as campaign highlight', () => {
		cy.get(`.campaign-report-post-footer > span`)
			.as(`footerText`)
			.should(`be.visible`)
			.should(`have.text`, `Select atleast 1 post`);
		cy.get(`.campaign-report-post-footer > .convo-btn-primary`).as(`done`).should(`be.disabled`);
		cy.get(`.all-post-box`)
			.should(`be.visible`)
			.within(() => {
				cy.get(`table>tbody>tr`)
					.eq(0)
					.within(() => {
						cy.get(`.select-btn`).should(`be.visible`).should(`contain.text`, `Select`).click();
					});
			});
		cy.get(`@footerText`).should(`be.visible`).should(`have.text`, `1 posts selected`);
		cy.get(`@done`).should(`be.enabled`).click();
		cy.getDataTestId(`heading-generating-report`)
			.should(`be.visible`)
			.should(`have.text`, `Generating your campaign report...`);
		cy.get(`[data-test-id="img-generating-report"]`).should(`be.visible`);
		cy.get(`[data-test-id="subheading-generating-report"]`).should(
			`contain.text`,
			`It usually takes us between 15-30 minutes to build your report. We’ll send you a link to it over Whatsapp and email once it is ready!`
		);
	});

	it.skip('To verify that campaign highlights are being displayed on the report', () => {
		cy.visit(`group-admin/campaigns`);
		cy.getDataCsLabel(`View your reports`).should(`be.visible`).click();
		cy.contains(`[data-test-id="report-name"]`, `Test 213`).should(`be.visible`).click();
		cy.getDataTestId(`heading-campaign-highlight`)
			.scrollIntoView()
			.should(`be.visible`)
			.should(`have.text`, `Campaign highlights`);
		cy.getDataTestId(`subheading-campaignhighlights`)
			.should(`be.visible`)
			.should(`contain.text`, `Screenshots generated on`);
		cy.getDataTestId(`list-screenshot-post-figure`).should(`have.length.above`, 0);
		cy.getDataCsLabel(`Open Image Viewer`).each(ele => {
			cy.wrap(ele).scrollIntoView().should(`be.visible`).should(`have.attr`, `src`);
		});
	});
});
