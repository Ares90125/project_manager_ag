describe.skip('brand track test cases', function () {
	before(function () {
		cy.InterceptRoute([`GetBrandsByUserId`, `GetCampaignsByBrandId`]);
		cy.visit(`cs-admin-login`);
		cy.window()
			.its(`accountService`)
			.invoke(`login`, {
				username: this.credentialsJson.brandAdmin.user,
				password: this.credentialsJson.brandAdmin.password
			})
			.get(`[alt="convosight logo"]`, {timeout: 45000})
			.should(`be.visible`)
			.getCookies()
			.then((cookies: any) => {
				Cypress.Cookies.defaults({
					preserve: cookies.map(cookie => cookie.name)
				});
			})
			.saveLocalStorage();
	});

	beforeEach(() => {
		const path = `mock-responses/brand-track.spec`;
		cy.MockQueryUsingFile(`GetKeywordTrackerReport`, path)
			.MockQueries(`FetchConversations`, path)
			.MockQueries(`ListKeywordTrackerMetricByReportId`, path);
		cy.restoreLocalStorage();
		cy.visit(`brand/brand-track`);
		cy.clock(1625885936000, [`Date`]);
		cy.getDataCsParentLabel(`Urgent alerts`).eq(1).should(`be.visible`).click();
	});

	it(`verify the refresh button on brand track page`, {tags: [`@pullRequest`]}, () => {
		cy.get(`.loading-state`, {timeout: 30000}).should(`have.attr`, `hidden`);
		cy.getDataCsLabel(`Refresh conversations`).click({scrollBehavior: false}).should(`have.attr`, `hidden`);
	});

	it(`verify the more keywords button`, () => {
		cy.getDataTestId(`btn-more-keywords-tracker`)
			.should(`be.visible`)
			.click({scrollBehavior: false})
			.getDataTestId(`modal-keyword-tracker`) //Complete pop up
			.should(`be.visible`)
			.within(() => {
				cy.getDataTestId(`modal-header-brand-keyword-tracker`) //pop up details
					.should(`have.text`, ` List of keywords `)
					.get(`#KeywordEditor`)
					.invoke(`attr`, `rows`)
					.should(`be.equal`, '13');
			});
	});

	it(`verify the page elements`, () => {
		cy.getDataTestId(`card-keyword-tracker`)
			.eq(0)
			.should(`be.visible`)
			.within(() => {
				cy.get(`.post-title`)
					.should(`have.text`, `Pediasure se helth me fark pdta`)
					.get(`.text-secondary`)
					.should(`contain.text`, `10:03 AM`);
			})
			.get(`.card-footer`)
			.should(`be.visible`);
	});

	it.skip(`verify the graph in keyword report tracker for current month`, () => {
		cy.get(`.highcharts-point`, {timeout: 70000})
			.should('be.visible')
			.window()
			.its(`brandTrackCurrentMonth`)
			.then(stats => {
				const conversationVolume = stats.chartData.chartOptions.series[0].data;
				cy.get(`.highcharts-point`).each(($ele, index) => {
					if (conversationVolume[index] !== 0) {
						cy.wrap($ele).realHover().wait(1000);
						cy.get(`g.highcharts-tooltip > text > tspan:nth-child(5)`)
							.as(`toolTip`)
							.should('be.visible')
							.should(`contain.text`, conversationVolume[index]);
						//cy.wrap($ele).trigger(`mouseleave`,{force:true}).wait(1000).get(`@toolTip`).should('not.be.visible');
					}
				});
			});
	});

	it.skip(`verify the graph in keyword report tracker for last three months`, () => {
		const path = `mock-responses/brand-track.spec`;
		cy.MockQueries(`ListKeywordTrackerMetricByReportId`, path);
		[
			{
				$month: `#oneMonthTab`,
				windowVariable: `brandTrackLastMonth`
			},
			{
				$month: `#twoMonthsTab`,
				windowVariable: `brandTrackTwoMonth`
			},
			{
				$month: `#threeMonthsTab`,
				windowVariable: `brandTrackThreeMonth`
			}
		].forEach(({$month, windowVariable}) => {
			cy.get($month)
				.click()
				.get(`.highcharts-point`)
				.should('be.visible')
				.window()
				.its(windowVariable)
				.then((stats: any) => {
					const conversationVolume = stats.chartData.chartOptions.series[0].data;
					cy.get(`.highcharts-point`).each(($ele, index) => {
						if (conversationVolume[index] !== 0) {
							cy.wait(1000);
							cy.wrap($ele).realHover();
							cy.get(`g.highcharts-tooltip > text > tspan:nth-child(5)`)
								.as(`toolTip`)
								.should('be.visible')
								.should(`contain.text`, conversationVolume[index]);
							//cy.wrap($ele).trigger(`mouseleave`).wait(1000).get(`@toolTip`).should('not.be.visible');
						}
					});
				});
		});
	});
});
