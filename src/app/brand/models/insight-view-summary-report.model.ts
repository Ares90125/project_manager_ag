export class InsightViewSummaryReportModel {
	totalPosts = 0;
	totalConversations = 0;
	totalComments = 0;

	private _totalCommentsPerPosts = 0;

	get totalCommentsPerPosts() {
		return this._totalCommentsPerPosts;
	}

	set totalCommentsPerPosts(input) {
		this._totalCommentsPerPosts = Number(Number(input).toFixed(2));
	}
}
