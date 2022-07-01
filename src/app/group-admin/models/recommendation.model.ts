export class RecommendationModel {
	id: string;

	recommendTime: string;

	optimalLength: {
		minCharacterCount: number;
		minWordCount: number;
	};

	emotions: any;
	contentType: string;
	keywords: string;
	categories: string;
	topics: string;
	iconUrl: string;
	headline: string;
	description: string;
	imageUrls: string;

	createdByUserId: string;
	createdAtUTC: string;

	isDeleted: boolean;
}
