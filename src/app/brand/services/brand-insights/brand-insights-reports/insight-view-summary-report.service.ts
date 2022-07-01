import {Injectable} from '@angular/core';
import {InsightViewMetricModel} from '../../../models/insight-view-metric.model';
import {InsightViewSummaryReportModel} from '../../../models/insight-view-summary-report.model';

@Injectable()
export class InsightViewSummaryReportService {
	constructor() {}

	getSummaryReport(data) {
		const metrics = data as InsightViewMetricModel[];
		const summaryMetrics = new InsightViewSummaryReportModel();

		let numFbComments = 0;
		metrics.forEach(met => {
			summaryMetrics.totalConversations += met.numPostFB + met.numPostWA + met.numCommentFB + met.numCommentWA;
			summaryMetrics.totalPosts += met.numPostFB;
			numFbComments += met.numCommentFB;
			summaryMetrics.totalComments += met.numCommentFB;
		});

		summaryMetrics.totalCommentsPerPosts =
			summaryMetrics.totalPosts !== 0 ? numFbComments / summaryMetrics.totalPosts : 0;

		return summaryMetrics;
	}
}
