describe.skip('Group admin test cases', function () {
	// Added comment for build run
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

	it('verify Category page elements', () => {
		const path = `mock-responses/group-conversation.spec`;
		cy.MockQueries(`ListGroupKeywordMetricsByGroupId`, path);
		cy.visit(`group-admin/group/85478556-88c6-44c3-af49-9028fab66f74/conversationtrends#7days`);
		cy.clock(1625356809000, ['Date']);
		cy.getDataTestId(`group-conversation-heading`).should(`be.visible`).should(`have.text`, `Conversations`);
		cy.getDataTestId(`group-conversation-subHeading`)
			.should(`be.visible`)
			.should(`contain.text`, `Detailed insights on the conversations happening in your group`);
		cy.getDataTestId(`category-card-name`).eq(0).as(`nutritionCategory`).should(`be.visible`);
		const path1 = `mock-responses/group-conversation.spec/MikCategory`;
		cy.MockQueries(`ListGroupKeywordMetricsByGroupId`, path1);
		cy.get(`@nutritionCategory`).click();
		cy.getDataTestId(`back-button-conversations`)
			.as(`backLink`)
			.should(`be.visible`)
			.should(`contain.text`, `Conversations`);
		cy.getDataTestId(`heading-category-insights`)
			.should(`be.visible`)
			.should(`contain.text`, `Insights for ‘Nutrition’ category`);
		cy.getDataTestId(`heading-summary-28-days`).should(`be.visible`).should(`contain.text`, `Summary for last 28 days`);
		cy.getDataTestId(`trends-months-range`)
			.should(`be.visible`)
			.within(() => {
				cy.getDataTestId(`trends-Current-month-range`)
					.should(`be.visible`)
					.should(`contain.text`, `Current Month`)
					.should(`be.enabled`);
				cy.getDataTestId(`trends-last-month-range`)
					.should(`be.visible`)
					.should(`contain.text`, `Last 1 month`)
					.should(`be.enabled`);
				cy.getDataTestId(`trends-last-2month-range`)
					.should(`be.visible`)
					.should(`contain.text`, `Last 2 months`)
					.should(`be.enabled`);
				cy.getDataTestId(`trends-last-3month-range`)
					.should(`be.visible`)
					.should(`contain.text`, `Last 3 months`)
					.should(`be.enabled`);
			});
		cy.getDataTestId(`heading-top-keywords`)
			.should(`be.visible`)
			.should(`contain.text`, `Top keywords for last 3 months`);
		cy.getDataTestId(`word-cloud-current-month`).should(`be.visible`).should(`contain.text`, `April, 2021`);
		cy.getDataTestId(`word-cloud-current-month-image`).should(`be.visible`);
		cy.getDataTestId(`word-cloud-last-month`).should(`be.visible`).should(`contain.text`, `May, 2021`);
		cy.getDataTestId(`word-cloud-last-month-image`).should(`be.visible`);
		cy.getDataTestId(`word-cloud-last2-month`).should(`be.visible`).should(`contain.text`, `June, 2021`);
		cy.getDataTestId(`word-cloud-last2-month-image`).should(`be.visible`);
	});

	it('verify Category last 28 days metric values', () => {
		cy.getDataTestId(`heading-summary-conversations`).should(`be.visible`).should(`contain.text`, `Conversations`);
		cy.getDataTestId(`total-no-conversation-28days`).should(`be.visible`).should(`contain.text`, `79655`);
		cy.getDataTestId(`heading-summary-comments`).should(`be.visible`).should(`contain.text`, `Comments`);
		cy.getDataTestId(`total-no-comments-28days`).should(`be.visible`).should(`contain.text`, `74253`);
		cy.getDataTestId(`heading-summary-post`).should(`be.visible`).should(`contain.text`, `Posts`);
		cy.getDataTestId(`total-no-posts-28days`).should(`be.visible`).should(`contain.text`, `5402`);
	});

	it('verify data for category breakup for current month', () => {
		const tooltips = [
			`Issues​●Issues: 4 206`,
			`Remedies​●Remedies: 5 814`,
			`Products​●Products: 1 996`,
			`Brands​●Brands: 581`
		];
		const labels = [`33.4%`, `46.2%`, `15.8%`, `4.6%`];
		const legendText = [`Products`, `Brands`, `Remedies`, `Issues`];
		cy.getDataTestId(`category-breakup-pie-chart`)
			.should(`be.visible`)
			.within(() => {
				cy.getDataTestId(`heading-category-breakup-pie-chart`).should(`be.visible`).should(`contain.text`, `Nutrition`);
				cy.get(`.highcharts-point`, {timeout: 70000}).should('be.visible');
				cy.get(`.highcharts-point`).each(($ele, index) => {
					cy.get(`g.highcharts-data-labels`).should(`be.visible`).should(`contain.text`, labels[index]);
					cy.wrap($ele).realHover().wait(1000);
					cy.get(`g.highcharts-tooltip > text`)
						.as(`toolTip`)
						.should('be.visible')
						.should(`contain.text`, tooltips[index]);
				});
				cy.get(`.legend-text`).each((ele, index) => {
					cy.wrap(ele).should(`be.visible`).should(`contain.text`, legendText[index]);
				});
			});
	});

	it('verify data for Top keywords breakup for current month', () => {
		const tooltips = [
			`Keyword Volume​●Milk: 1 635​`,
			`Keyword Volume​●Calcium: 1 580​`,
			`Keyword Volume​●Constipation: 1 004`,
			`Keyword Volume​●Water: 977`,
			`Keyword Volume​●Fruits: 902​`,
			`Keyword Volume​●Growth: 606​`,
			`Keyword Volume​●Supplement: 580`,
			`Keyword Volume​●Protein: 545`,
			`Keyword Volume​●Vegetables: 538`,
			`Keyword Volume​●Porridge: 532`
		];
		const xAxisText = [
			`Milk`,
			`Calcium`,
			`Constipation`,
			`Water`,
			`Fruits`,
			`Growth`,
			`Supplement`,
			`Protein`,
			`Vegetables`,
			`Porridge`
		];
		const yAxisText = [`0`, `500`, `1000`, `1500`, `2000`];
		cy.getDataTestId(`graph-top-keyowrd-breakUp`)
			.should(`be.visible`)
			.within(() => {
				cy.getDataTestId(`heading-graph-top-keyowrd-breakUp`).should(`be.visible`).should(`contain.text`, `Nutrition`);
				cy.get(`.highcharts-point`, {timeout: 70000}).should('be.visible');
				cy.get(`.highcharts-point`).each(($ele, index) => {
					cy.wrap($ele).realHover().wait(1000);
					cy.get(`g.highcharts-tooltip > text`)
						.as(`toolTip`)
						.should('be.visible')
						.should(`contain.text`, tooltips[index]);
					cy.get(`g.highcharts-xaxis-labels > text`).eq(index).should(`contain.text`, xAxisText[index]);
				});
				yAxisText.forEach((count, index) => {
					cy.get(`g.highcharts-yaxis-labels>text`).eq(index).should(`contain.text`, count);
				});
			});
	});
	it('verify data for Top keywords breakup for last 3 months', () => {
		const dateRange = [`trends-last-month-range`, `trends-last-2month-range`, `trends-last-3month-range`];
		const tooltips = [
			`Keyword Volume​●Fruits: 3 206​`,
			`Keyword Volume​●Fruit: 3 142`,
			`Keyword Volume​●Water: 2 209`,
			`Keyword Volume​●Milestones: 1 804`,
			`Keyword Volume​●Milk: 1 785`,
			`Keyword Volume​●Lactose Free: 1 750​`,
			`Keyword Volume​●Calcium: 1 669`,
			`Keyword Volume​●Protein: 1 602`,
			`Keyword Volume​●Porridge: 1 540`,
			`Keyword Volume​●Dry Fruits: 1 412`
		];
		const xAxisText = [
			`Fruits`,
			`Fruit`,
			`Water`,
			`Milestones`,
			`Milk`,
			`Lactose Free`,
			`Calcium`,
			`Protein`,
			`Porridge`,
			`Dry Fruits`
		];
		const yAxisText = [`0`, `1k`, `2k`, `3k`, `4k`];
		dateRange.forEach(element => {
			cy.getDataTestId(`${element}`).click();
			cy.getDataTestId(`graph-top-keyowrd-breakUp`)
				.should(`be.visible`)
				.within(() => {
					cy.getDataTestId(`heading-graph-top-keyowrd-breakUp`)
						.should(`be.visible`)
						.should(`contain.text`, `Nutrition`);
					cy.get(`.highcharts-point`, {timeout: 70000}).should('be.visible');
					cy.get(`.highcharts-point`).each(($ele, index) => {
						cy.wrap($ele).realHover().wait(1000);
						cy.get(`g.highcharts-tooltip > text`)
							.as(`toolTip`)
							.should('be.visible')
							.should(`contain.text`, tooltips[index]);
						cy.get(`g.highcharts-xaxis-labels > text`).eq(index).should(`contain.text`, xAxisText[index]);
					});
					yAxisText.forEach((count, index) => {
						cy.get(`g.highcharts-yaxis-labels>text`).eq(index).should(`contain.text`, count);
					});
				});
		});
	});

	it('verify data for category breakup for last 3 month', () => {
		const tooltips = [
			`Issues​●Issues: 12 431`,
			`Remedies​●Remedies: 12 506`,
			`Products​●Products: 15 624`,
			`Brands​●Brands: 444`
		];
		const labels = [`30.3%`, `30.5%`, `38.1%`, ``];
		const legendText = [`Products`, `Brands`, `Remedies`, `Issues`];
		const dateRange = [`trends-last-month-range`, `trends-last-2month-range`, `trends-last-3month-range`];
		dateRange.forEach(element => {
			cy.getDataTestId(`${element}`).click();
			cy.getDataTestId(`category-breakup-pie-chart`)
				.should(`be.visible`)
				.within(() => {
					cy.getDataTestId(`heading-category-breakup-pie-chart`)
						.should(`be.visible`)
						.should(`contain.text`, `Nutrition`);
					cy.get(`.highcharts-point`).each(($ele, index) => {
						cy.get(`g.highcharts-data-labels`).should(`be.visible`).should(`contain.text`, labels[index]);
						cy.wrap($ele).realHover().wait(1000);
						cy.get(`g.highcharts-tooltip > text`)
							.as(`toolTip`)
							.should('be.visible')
							.should(`contain.text`, tooltips[index]);
					});
					cy.get(`.legend-text`).each((ele, index) => {
						cy.wrap(ele).should(`be.visible`).should(`contain.text`, legendText[index]);
					});
				});
		});
	});
	it('verify user is able to go back to conversations page', () => {
		const path = `mock-responses/group-conversation.spec`;
		cy.MockQueries(`ListGroupKeywordMetricsByGroupId`, path);
		cy.getDataTestId(`back-button-conversations`).as(`backLink`).click();
		cy.getDataTestId(`group-conversation-heading`).should(`be.visible`).should(`have.text`, `Conversations`);
		cy.getDataTestId(`group-conversation-subHeading`)
			.should(`be.visible`)
			.should(`contain.text`, `Detailed insights on the conversations happening in your group`);
		cy.getDataCsLabel(`7 days`).should(`be.visible`).should(`have.text`, ` 7 days `);
		const path1 = `mock-responses/group-conversation.spec/MikCategory`;
		cy.MockQueries(`ListGroupKeywordMetricsByGroupId`, path1);
		cy.getDataTestId(`category-card-name`).eq(0).click();
		cy.getDataTestId(`heading-category-insights`)
			.should(`be.visible`)
			.should(`contain.text`, `Insights for ‘Nutrition’ category`);
	});
});
