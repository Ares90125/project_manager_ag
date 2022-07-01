describe.skip('Group admin test cases', function () {
	const NavigateToOverview = () => {
		const path = `mock-responses/group-overview.spec`;
		cy.MockQueryUsingFile(`GetKeywordTrackerReport`, path);
		cy.visit(`group-admin/group/9a0f9a0f-a7e0-41f0-99a0-2934f58efaf2/overview`);
		cy.clock(Date.UTC(2021, 6, 3));
		cy.getDataTestId(`heading-overview`).should(`contain.text`, `Overview`).should(`be.visible`);
	};
	before('login using facebook', () => {
		cy.fixture(`api-test/convosightLoginWithGroups.json`).then(session => {
			cy.RestoreSession(session);
		});
		cy.visit(`/login-response`).saveLocalStorage();
		cy.visit('group-admin/manage');
	});

	beforeEach(() => {
		cy.InterceptRoute([
			`GetLastdayGroupMetricsByGroupId`,
			`FetchConversations`,
			`ListGroupMetricsByGroupId`,
			`FetchConversationBySourceIds`
		]);
		cy.restoreLocalStorage();
	});

	it('verify yesterdays activity data', () => {
		NavigateToOverview();
		cy.getDataTestId(`meteric-value-engagment-rate-past30Days`).should(`be.visible`);
		cy.getDataTestId(`heading-keyword-alert-card-overview`).should(`be.visible`);
		cy.window()
			.its(`DataLast30Days`, {timeout: 30000})
			.then(DataLast30Days => {
				const {IncreaseMemberCountLast30Days} = DataLast30Days;
				cy.wait(`@GetLastdayGroupMetricsByGroupId`).then(data => {
					if (data) {
						const monthlyAvgIncreaseMemberCount = IncreaseMemberCountLast30Days / 30;
						cy.log(`${monthlyAvgIncreaseMemberCount}`);

						cy.log(data.response.body.data.getLastdayGroupMetricsByGroupId.memberCount);

						if (monthlyAvgIncreaseMemberCount > data.response.body.data.getLastdayGroupMetricsByGroupId.memberCount) {
							cy.getDataTestId(`metric-content-percentage-member-icon-lower-overview`).should(`be.visible`);
							const percentageDecMemberCount = Math.round(
								((monthlyAvgIncreaseMemberCount - data.response.body.data.getLastdayGroupMetricsByGroupId.memberCount) /
									monthlyAvgIncreaseMemberCount) *
									100
							);
							cy.getDataTestId(`metric-content-percentage-lower-member-growth-overview`)
								.should(`be.visible`)
								.should(`contain.text`, percentageDecMemberCount.toLocaleString());
						} else {
							cy.getDataTestId(`metric-content-percentage-member-icon-higher-overview`).should(`be.visible`);
							// const percentageIncMemberCount = Math.round(

							// 		((data.response.body.data.getLastdayGroupMetricsByGroupId.memberCount -
							// 			monthlyAvgIncreaseMemberCount) /
							// 			monthlyAvgIncreaseMemberCount) *
							// 			100

							// );
							// cy.getDataTestId(`metric-content-percentage-higher-member-growth-overview`).should(
							// 	`contain.text`,
							// 	percentageIncMemberCount.toLocaleString()
							// );
						}

						cy.get(`@GetLastdayGroupMetricsByGroupId`, {timeout: 30000}).then(res => {
							//@ts-ignore
							const data = res.response.body.data.getLastdayGroupMetricsByGroupId;

							const {
								memberCount,
								totalPosts,
								totalReactions,
								totalComments,
								positivePostsChange,
								changeInPostsPercentageCount,
								positiveCommentsReactionsChange,
								changeInCommentsReactionsPercentageCount
							} = data;

							const activityRate = totalReactions + totalComments;
							cy.getDataTestId(`meteric-value-member-growth-yesterday-activity`).should(`contain.text`, memberCount);
							cy.getDataTestId(`meteric-value-new-posts-yesterday-activity`).should(`contain.text`, totalPosts);
							cy.getDataTestId(`meteric-value-reactions-comments-yesterday-activity`).should(
								`contain.text`,
								activityRate
							);

							if (positivePostsChange) {
								cy.getDataTestId(`metric-content-percentage-newpost-icon-higher-overview`).should(`be.visible`);
								cy.getDataTestId(`metric-content-percentage-higher-new-post-overview`).should(
									`contain.text`,
									changeInPostsPercentageCount
								);
							} else if (changeInPostsPercentageCount == 0) {
								cy.getDataTestId(`metric-content-percentage-newpost-icon-nochange-overview`).should(`be.visible`);
								cy.getDataTestId(`metric-content-percentage-nochange-new-post-overview`).should(
									`contain.text`,
									changeInPostsPercentageCount
								);
							} else {
								cy.getDataTestId(`metric-content-percentage-newpost-icon-lower-overview`).should(`be.visible`);
								cy.getDataTestId(`metric-content-percentage-lower-new-post-overview`).should(
									`contain.text`,
									changeInPostsPercentageCount
								);
							}
							if (positiveCommentsReactionsChange == true) {
								cy.getDataTestId(`metric-content-percentage-comment&reaction-icon-higher-overview`).should(
									`be.visible`
								);
								cy.getDataTestId(`metric-content-percentage-higher-comment&reactions-overview`).should(
									`contain.text`,
									changeInCommentsReactionsPercentageCount
								);
							} else {
								cy.getDataTestId(`metric-content-percentage-comment&reaction-icon-lower-overview`).should(`be.visible`);
								cy.getDataTestId(`metric-content-percentage-lower-comment&reactions-overview`).should(
									`contain.text`,
									changeInCommentsReactionsPercentageCount
								);
							}
							cy.getDataTestId(`meteric-value-engagment-rate-past30Days`).should(`be.visible`);
							cy.getDataTestId(`meteric-value-activity-rate-past30Days`).should(`be.visible`);
							cy.getDataTestId(`meteric-value-member-growth-past30Days`).should(`be.visible`);
						});
					} else {
						cy.getDataTestId(`heading-data-null`)
							.should(`be.visible`)
							.should(
								`have.text`,
								` We are still in the process of calculating yesterday's activity in your group. Please check back in an hour. `
							);
					}
				});
			});
	});

	it('verify past 30 day data', () => {
		cy.getDataTestId(`heading-overview`).should(`contain.text`, `Overview`).should(`be.visible`);
		cy.getDataTestId(`heading-yesterdayActivity-overview`).should(`contain.text`, ` Yesterday’s activity`);
		cy.getDataTestId(`meteric-value-engagment-rate-past30Days`).as(`past30DaysEngagmentRate`).should(`be.visible`);
		cy.getDataTestId(`meteric-value-activity-rate-past30Days`).as(`past30DaysActivityRate`).should(`be.visible`);
		cy.getDataTestId(`meteric-value-member-growth-past30Days`).as(`past30DaysMemberGrowth`).should(`be.visible`);
		cy.window()
			.its(`DataLast30Days`)
			.then(DataLast30Days => {
				const {engagementRateLast30Days, activityRateLast30Days, IncreaseMemberCountLast30Days} = DataLast30Days;
				cy.get(`@past30DaysEngagmentRate`).should(`contain.text`, Math.round(engagementRateLast30Days));
				cy.get(`@past30DaysActivityRate`).should(`contain.text`, activityRateLast30Days);
				if (Math.abs(IncreaseMemberCountLast30Days) > 100000) {
					const memberGrowth = IncreaseMemberCountLast30Days / 1000;
					cy.get(`@past30DaysMemberGrowth`).should(`contain.text`, `K`);
				} else {
					cy.get(`@past30DaysMemberGrowth`).should(`contain.text`, Math.round(IncreaseMemberCountLast30Days));
				}

				cy.window()
					.its(`Data31To60Days`)
					.then(Data31To60Days => {
						const {activityRate31To60Days, engagementRate31To60Days, increaseinMemberCount31To60Days} = Data31To60Days;
						if (activityRate31To60Days > activityRateLast30Days) {
							cy.getDataTestId(`metric-content-percentage-activity-past30Days-icon-lower-overview`).should(
								`be.visible`
							);
							const percentageChangeActivityRate = Math.round(
								((activityRate31To60Days - activityRateLast30Days) / activityRate31To60Days) * 100
							);
							cy.getDataTestId(`past30Days-metric-content-percentage-lower-activity-overview`).should(
								`contain.text`,
								percentageChangeActivityRate.toLocaleString()
							);
						}
						if (activityRateLast30Days > activityRate31To60Days) {
							cy.getDataTestId(`metric-content-percentage-activity-past30Days-icon-higher-overview`).should(
								`be.visible`
							);
							const percentageChangeActivityRate = Math.round(
								((activityRateLast30Days - activityRate31To60Days) / activityRate31To60Days) * 100
							);
							cy.getDataTestId(`past30Days-metric-content-percentage-higher-activity-overview`).should(
								`contain.text`,
								percentageChangeActivityRate.toLocaleString()
							);
						}
						if (engagementRate31To60Days > engagementRateLast30Days) {
							cy.getDataTestId(`metric-content-percentage-engagment-past30Days-icon-lower-overview`).should(
								`be.visible`
							);
							const percentageChangeEngagementRate = Math.round(
								((engagementRate31To60Days - engagementRateLast30Days) / engagementRate31To60Days) * 100
							);
							cy.getDataTestId(`past30Days-metric-content-percentage-lower-engagment-overview`).should(
								`contain.text`,
								percentageChangeEngagementRate.toLocaleString()
							);
						} else {
							cy.getDataTestId(`metric-content-percentage-engagment-past30Days-icon-higher-overview`).should(
								`be.visible`
							);
							const percentageChangeEngagementRate = Math.round(
								((engagementRateLast30Days - engagementRate31To60Days) / engagementRate31To60Days) * 100
							);
							cy.getDataTestId(`past30Days-metric-content-percentage-higher-engagment-overview`).should(
								`contain.text`,
								percentageChangeEngagementRate.toLocaleString()
							);
						}
						if (increaseinMemberCount31To60Days > IncreaseMemberCountLast30Days) {
							cy.getDataTestId(`metric-content-percentage-member-past30Days-icon-lower-overview`).should(`be.visible`);
							const percentageMemberGrowth = Math.round(
								((increaseinMemberCount31To60Days - IncreaseMemberCountLast30Days) / increaseinMemberCount31To60Days) *
									100
							);
							cy.getDataTestId(`past30Days-metric-content-percentage-lower-member-overview`).should(
								`contain.text`,
								Math.abs(percentageMemberGrowth).toLocaleString()
							);
						} else if (increaseinMemberCount31To60Days < IncreaseMemberCountLast30Days) {
							cy.getDataTestId(`metric-content-percentage-member-past30Days-icon-higher-overview`).should(`be.visible`);
							const percentageMemberGrowth = Math.round(
								((IncreaseMemberCountLast30Days - increaseinMemberCount31To60Days) / increaseinMemberCount31To60Days) *
									100
							);
							cy.getDataTestId(`past30Days-metric-content-percentage-higher-member-overview`).should(
								`contain.text`,
								Math.abs(percentageMemberGrowth).toLocaleString()
							);
						} else if (increaseinMemberCount31To60Days == IncreaseMemberCountLast30Days) {
							cy.getDataTestId(`metric-content-percentage-member-past30Days-icon-nochange-overview`).should(
								`be.visible`
							);
						}
					});
			});
	});

	it('verify overview page elements', () => {
		cy.getDataTestId(`heading-yesterdayActivity-overview`).should(`contain.text`, ` Yesterday’s activity`);
		cy.getDataTestId(`heading-keyword-alert-card-overview`).should(`be.visible`);
		cy.window()
			.its(`past30DayDaterange`)
			.then(past30DayDaterange => {
				cy.getDataTestId(`heading-past30Days-overview`).should(
					`contain.text`,
					` 💪 Past 30 days overview Past 30 days  vs`
				);
				cy.getDataTestId(`heading-past30Days-overview`).should(`contain.text`, past30DayDaterange);
			});
		cy.getDataTestId(`heading-suggestedActions-overview`).should(`contain.text`, ` 🙌 Suggested actions for you `);
		cy.getDataTestId(`heading-suggestedActions-overview`).should(`contain.text`, ` 🙌 Suggested actions for you `);
		cy.getDataTestId(`meteric-title-memberGrowth-overview`)
			.should(`be.visible`)
			.should(`contain.text`, `Member growth`);
		cy.getDataTestId(`meteric-title-newPosts-overview`).should(`be.visible`).should(`contain.text`, `New posts`);
		cy.getDataTestId(`meteric-title-reaction&comments-overview`)
			.should(`be.visible`)
			.should(`contain.text`, `Reactions & comments`);
		cy.getDataTestId(`past30days-meteric-title-memberGrowth-overview`)
			.should(`be.visible`)
			.should(`contain.text`, `Member growth`);
		cy.getDataTestId(`meteric-title-activityRate-overview`)
			.should(`be.visible`)
			.should(`contain.text`, `Activity Rate`);
		cy.getDataTestId(`button-view-group-health-overview`)
			.should(`be.visible`)
			.should(`contain.text`, `View Group Health `);
	});

	it('verify reshare post card button', () => {
		cy.getDataTestId(`reshare-post-card-overview`)
			.should(`be.visible`)
			.should(`contain.text`, `Suggested post based on activity`);
		cy.getDataTestId(`button-redirect-to-post-overview`)
			.should(`be.visible`)
			.should(`contain.text`, `Reshare this post`)
			.click();
		cy.wait(`@FetchConversationBySourceIds`, {timeout: 40000});
		cy.get('#postMessage', {timeout: 60000}).as(`postMessage`).type(`Hello`);
		cy.get(`@postMessage`).click();
		cy.getDataTestId(`reshare-post-desc-post-composer`).should(`be.visible`);
		cy.get(`.publish-btn`).eq(0).should(`be.visible`).should(`be.enabled`);
	});

	it('verify reshare post card link', () => {
		NavigateToOverview();
		cy.getDataTestId(`reshare-post-card-overview`)
			.should(`be.visible`)
			.should(`contain.text`, `Suggested post based on activity`);
		cy.getDataTestId(`link-redirect-to-reshare-posts`)
			.should(`be.visible`)
			.should(`contain.text`, `Find more posts to reshare`)
			.click();
		cy.getDataTestId(`heading-reshare-post`).should(`be.visible`).should(`contain.text`, `Reshare Posts`);
		cy.getDataTestId(`subheading-reshare-post`)
			.should(`be.visible`)
			.should(`contain.text`, `Reshare posts from your group that were previously trending`);
	});

	it('verify Schedule post card', () => {
		NavigateToOverview();
		cy.wait(`@GetLastdayGroupMetricsByGroupId`, {timeout: 30000});
		cy.window()
			.its(`recommendationTimings`, {timeout: 30000})
			.then(recommendationTimings => {
				if (recommendationTimings.length > 0) {
					cy.getDataTestId(`heading-schedule-post-card-overview`)
						.should(`be.visible`)
						.should(`contain.text`, `Schedule a post`);
					cy.getDataTestId(`subheading-schedule-post-card-overview`)
						.should(`be.visible`)
						.should(`contain.text`, `Next best time`);
					cy.getDataTestId(`button-schedule-post-card-overview`)
						.should(`be.visible`)
						.should(`contain.text`, `Schedule post`)
						.click();
				} else {
					cy.getDataTestId(`heading-schedule-post-card-overview`).should(`not.exist`);
				}
			});
	});
});
