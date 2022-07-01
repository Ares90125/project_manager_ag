const validateStatsTimePeriod = (
	numberOfPosts,
	postComparision,
	activityRate,
	activityRateComparision,
	totalImpact,
	impactComparision,
	timePeriod
) => {
	cy.get(`.post-analytics-stats`)
		.should(`be.visible`)
		.within(() => {
			cy.getDataTestId(`tooltip-number-posts`).should(
				`have.attr`,
				`setTooltipText`,
				`Total Posts published via Convosight in the given time period.`
			);
			cy.getDataTestId(`heading-number-of-post`).should(`be.visible`).and(`contain.text`, `Number of posts`);
			cy.getDataTestId(`number-of-post`).should(`be.visible`).and(`contain.text`, numberOfPosts);
			cy.getDataTestId(`post-comparison`).should(`be.visible`).and(`contain.text`, postComparision);
			cy.getDataTestId(`tooltip-analytics`)
				.should(`be.visible`)
				.and(`have.attr`, `setTooltipText`, `Average activity rate of posts published using Convosight`);
			cy.getDataTestId(`heading-analytics`).should(`be.visible`).and(`contain.text`, `Activity rate`);
			cy.getDataTestId(`activity-rate`).should(`be.visible`).and(`contain.text`, activityRate);
			cy.getDataTestId(`activity-rate-comparison`).should(`be.visible`).and(`contain.text`, activityRateComparision);
			cy.getDataTestId(`tooltip-impact`)
				.should(`be.visible`)
				.and(
					`have.attr`,
					`settooltiptext`,
					`Engagement gain by using Convosight's recommended time to post based on increase in activity rate.`
				);
			cy.getDataTestId(`heading-impact`).should(`be.visible`).and(`contain.text`, `Impact`);
			cy.getDataTestId(`number-interaction`).should(`be.visible`).and(`contain.text`, totalImpact);
			cy.getDataTestId(`impact-comparision`).should(`be.visible`).and(`contain.text`, impactComparision);
		});
	cy.getDataTestId(`heading-post-analytics-scheduled-posts`).should(`be.visible`).and(`contain.text`, timePeriod);
	cy.get(`.post-box`).should(`be.visible`).and(`have.length`, numberOfPosts);
};
describe.skip(`Post Composer Scenarios`, () => {
	before('login using facebook', () => {
		cy.fixture(`api-test/convosightLoginWithGroups.json`).then(session => {
			cy.RestoreSession(session);
		});
		cy.visit(`/login-response`).saveLocalStorage();
	});

	beforeEach(`restore the session`, () => {
		cy.restoreLocalStorage();
	});
	it(`Verify that user is able to navigate to post analytics screen.`, () => {
		cy.visit('group-admin/manage');
		cy.contains(`.list-item`, `Test group 2`, {timeout: 60000}).within(() => {
			cy.get(`button.linker`).should(`have.length`, 1).click();
		});
		const path = `mock-responses/post-analytics.spec`;
		cy.MockQueryUsingFile(`ListFbPostModels`, path)
			.MockQueryUsingFile(`ListPostAnalytics`, path)
			.MockQueryUsingFile(`ListGroupMetricsByGroupId`, path);
		cy.getDataTestId(`btn-group-post-analytics`).click();
		cy.get(`.heading`).should(`be.visible`).and(`have.text`, `Posts published via Convosight`);
		cy.getDataTestId(`subheading-post-analytics`)
			.should(`be.visible`)
			.and(
				`have.text`,
				` Check out how your posts are doing in the group. Analytics would be available after 30 minutes of posting `
			);
	});

	it.skip(`Verify last 7 days data statics`, () => {
		const path = `mock-responses/post-analytics.spec`;
		cy.MockQueryUsingFile(`ListFbPostModels`, path)
			.MockQueryUsingFile(`ListPostAnalytics`, path)
			.MockQueryUsingFile(`ListGroupMetricsByGroupId`, path);
		cy.visit(`group-admin/group/85478556-88c6-44c3-af49-9028fab66f74/postanalytics`);
		cy.clock(1627513458000); // Date is set as 29th July 2021
		validateStatsTimePeriod(
			`10`,
			`6% out of 179 posts in the group`,
			`246.6`,
			`247% higher than group average`,
			`17.6K interactions`,
			`248% higher than regular post`,
			`Your scheduled posts 22 Jul - Today`
		);
	});

	it(`Verify last 7 days posts body published via convosight`, () => {
		cy.clock(1627513458000); // Date is set as 29th July 2021
		cy.get(`.published-post-wrapper`)
			.should(`be.visible`)
			.within(() => {
				cy.get(`.published-post-header`)
					.should(`be.visible`)
					.within(() => {
						cy.get(`li`).each((ele, index) => {
							const headings = [`POST`, `SUGGESTED TIMES`, `SUGGESTIONS MET`, ` ACTIVITY `];
							cy.wrap(ele).should(`be.visible`).and(`have.text`, headings[index]);
						});
					});
				cy.get(`.post-box`)
					.should(`be.visible`)
					.and(`have.length`, `10`)
					.first()
					.within(() => {
						cy.get(`.post-box-head`)
							.should(`be.visible`)
							.within(() => {
								cy.get(`figure>img`).should(
									`have.attr`,
									`src`,
									`https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=389973075041148&height=50&width=50&ext=1630063649&hash=AeSPx1Ah7HCVgIU4kq4`
								);
								cy.get(`strong`).should(`be.visible`).should(`have.text`, `Nisha Tiwari`);
								cy.get(`ul>li:nth-child(1)`).should(`be.visible`).and(`contain.text`, `Administrator · 28 Jul 21`);
								cy.get(`ul>li:nth-child(2)>a`)
									.should(`be.visible`)
									.and(
										`have.attr`,
										`href`,
										`https://www.facebook.com/groups/1398172130280892/permalink/4044030345695044`
									);
								cy.get(`ul>li:nth-child(2)>a>div`).should(`be.visible`).and(`have.text`, `View Post`);
							});
						cy.get(`.post-box-body`)
							.should(`be.visible`)
							.within(() => {
								cy.get(`figcaption`).should(`be.visible`).and(`have.text`, `Lithi chokha kiska fvrt h???`);
								cy.get(`figure>img`)
									.should(`be.visible`)
									.and(
										`have.attr`,
										`src`,
										`https://bd-cs-prod-media.s3.us-east-1.amazonaws.com/public/pics/cfe83cf2-5762-40f4-9a2e-27008f7a400f_1627471644624`
									);
								cy.get(`li:nth-child(2)>span`).should(`be.visible`).and(`contain.text`, `Not met`);
								cy.get(`li:nth-child(4)>div>div>strong`).should(`be.visible`).and(`contain.text`, `355`);
								cy.get(`li:nth-child(4)>div>span`).should(`be.visible`).and(`contain.text`, `443%  higher than avg.`);
							});
						cy.get(`.post-box-foot`)
							.should(`be.visible`)
							.within(() => {
								cy.get(`li:nth-child(1)>img`)
									.should(`be.visible`)
									.and(`have.attr`, `src`, `assets/images/like-icon.svg`);
								cy.get(`li:nth-child(1)>span`).should(`be.visible`).and(`have.text`, `213 reactions`);
								cy.get(`li:nth-child(2)>img`)
									.should(`be.visible`)
									.and(`have.attr`, `src`, `assets/images/comment-icon.svg`);
								cy.get(`li:nth-child(2)>span`).should(`be.visible`).and(`have.text`, `142 comments`);
							});
					});
			});
	});
	it(`Verify last 7 days sort functionality`, () => {
		cy.clock(1627513458000); // Date is set as 29th July 2021
		cy.get(`.filters`)
			.should(`be.visible`)
			.click()
			.as(`filters`)
			.within(() => {
				cy.contains(`.dropdown-item`, `Last published`).should(`be.visible`).click();
				cy.contains(`span`, `Sort by`).should(`be.visible`);
				cy.get(`button`).should(`contain.text`, ` Last published `);
			});
		cy.get(`.post-box`)
			.should(`be.visible`)
			.and(`have.length`, `10`)
			.first()
			.within(() => {
				cy.get(`.post-box-head`)
					.should(`be.visible`)
					.within(() => {
						cy.get(`figure>img`).should(
							`have.attr`,
							`src`,
							`https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=389973075041148&height=50&width=50&ext=1630063649&hash=AeSPx1Ah7HCVgIU4kq4`
						);
						cy.get(`strong`).should(`be.visible`).should(`have.text`, `Nisha Tiwari`);
						cy.get(`ul>li:nth-child(1)`).should(`be.visible`).and(`contain.text`, `Administrator · 28 Jul 21`);
						cy.get(`ul>li:nth-child(2)>a`)
							.should(`be.visible`)
							.and(`have.attr`, `href`, `https://www.facebook.com/groups/1398172130280892/permalink/4044030345695044`);
					});
			});
		cy.get(`@filters`).click();
		//Highest Activity option is not working because of existing prod bug.
		cy.contains(`.dropdown-item`, `Most reactions`).should(`be.visible`).click();
		cy.get(`.post-box`)
			.should(`be.visible`)
			.and(`have.length`, `10`)
			.first()
			.within(() => {
				cy.get(`.post-box-head`)
					.should(`be.visible`)
					.within(() => {
						cy.get(`figure>img`).should(
							`have.attr`,
							`src`,
							`https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=389973075041148&height=50&width=50&ext=1629734508&hash=AeRuUEKxgGQWjQaBppM`
						);
						cy.get(`strong`).should(`be.visible`).and(`have.text`, `Nisha Tiwari`);
						cy.get(`ul>li:nth-child(1)`).should(`be.visible`).and(`contain.text`, ` Administrator · 24 Jul 21 `);
						cy.get(`ul>li:nth-child(2)>a`)
							.should(`be.visible`)
							.and(`have.attr`, `href`, `https://www.facebook.com/groups/1398172130280892/permalink/4033325936765485`);
					});
			});
		cy.get(`@filters`).click();
		cy.contains(`.dropdown-item`, `Most comments`).should(`be.visible`).click();
		cy.get(`.post-box`)
			.should(`be.visible`)
			.and(`have.length`, `10`)
			.first()
			.within(() => {
				cy.get(`.post-box-head`)
					.should(`be.visible`)
					.within(() => {
						cy.get(`figure>img`).should(
							`have.attr`,
							`src`,
							`https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=389973075041148&height=50&width=50&ext=1630063649&hash=AeSPx1Ah7HCVgIU4kq4`
						);
						cy.get(`strong`).should(`be.visible`).and(`have.text`, `Nisha Tiwari`);
						cy.get(`ul>li:nth-child(1)`).should(`be.visible`).and(`contain.text`, `Administrator · 28 Jul 21`);
						cy.get(`ul>li:nth-child(2)>a`)
							.should(`be.visible`)
							.and(`have.attr`, `href`, `https://www.facebook.com/groups/1398172130280892/permalink/4044030345695044`);
					});
			});
	});
	it(`Verify that user is able to view last 14 days post published via convosight`, () => {
		cy.clock(1627513458000);
		cy.getDataCsLabel(`7 days`).should(`be.visible`).and(`have.attr`, `class`, `btn-month active`);
		cy.getDataTestId(`heading-number-of-post`).should(`be.visible`).and(`have.text`, `Number of posts`);
		cy.getDataTestId(`activity-rate`).should(`be.visible`);
		cy.getDataTestId(`post-comparison`).should(`be.visible`);
		cy.getDataCsLabel(`14 days`).should(`be.visible`).click();
		cy.getDataCsLabel(`14 days`).should(`be.visible`).and(`have.attr`, `class`, `btn-month active`);
	});
	it.skip(`Verify last 14 days data statics`, () => {
		cy.clock(1627513458000); // Date is set as 29th July 2021
		validateStatsTimePeriod(
			`44`,
			`13% out of 345 posts in the group`,
			`168.27`,
			`140% higher than group average`,
			`9.8K interactions`,
			`140% higher than regular post`,
			`Your scheduled posts 15 Jul - Today`
		);
	});

	it.skip(`Verify last 30 days data statics`, () => {
		cy.clock(1627513458000); // Date is set as 29th July 2021
		cy.getDataCsLabel(`Last 30 days`).should(`be.visible`).click();
		cy.getDataCsLabel(`Last 30 days`).should(`be.visible`).should(`have.attr`, `class`, `btn-month active`);
		validateStatsTimePeriod(
			`50`,
			`6% out of 773 posts in the group`,
			`232.42`,
			`222% higher than group average`,
			`16K interactions`,
			`222% higher than regular post`,
			`Your scheduled posts Last 30 days`
		);
	});

	it(`Verify no post screen`, () => {
		cy.visit(`group-admin/group/9a0f9a0f-a7e0-41f0-99a0-2934f58efaf2/postanalytics`);
		cy.get(`.no-results-found`)
			.should(`be.visible`)
			.within(() => {
				//cy.get(`figure>img`).should(`be.visible`).and(`have.attr`, `src`, `assets/images/icon_noData_analytics.svg`);
				cy.get(`h5`).should(`be.visible`).and(`have.text`, `You have not published any posts in this group`);
				cy.get(`p`).should(`be.visible`).and(`have.text`, `Posts you publish from Convosight will appear here`);
				cy.getDataCsLabel(`Create new post`).should(`be.visible`).and(`contain.text`, `Create new post`);
			});
		cy.getDataCsLabel(`Create new post`).click();
		cy.getDataTestId(`heading-post-composer-page`).should(`be.visible`).and(`have.text`, `New post`);
		cy.getDataTestId(`button-close-post-composer`).should(`be.visible`);
		cy.get(`.publish-btn`).first().should(`be.visible`).and(`have.text`, ` Publish now `).should(`be.disabled`);
	});
});
