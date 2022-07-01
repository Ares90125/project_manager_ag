export class ConversationTrendsModel {
	topTopics = null;
	topCategories: {[key: string]: number} = null;
	topIssues = null;
	topRemedies = null;
	topProducts = null;
	topBrands = null;
	top10Bigrams = null;
	sentiments = {};
	top10Keywords = [];
	isEmpty = false;

	constructor(metrics) {
		if (!metrics || !metrics.items || metrics.items.length === 0) {
			this.isEmpty = true;
			return;
		}

		this.getConversationTrends(metrics);
	}

	getConversationTrends(metrics) {
		const topTopics = {};
		const topCategories = {};
		const topKeyWords = {};
		const top10Bigrams = {};
		const top10Keywords = {};
		let sentiment = metrics.sentiment
			? JSON.parse(metrics.sentiment)
			: {
					Positive: 0,
					Negative: 0,
					Neutral: 0
			  };

		metrics.items.forEach(item => {
			for (const i of Object.keys(item.top10Tokens)) {
				const key = this.getTitleCase(i);
				if (topTopics.hasOwnProperty(key)) {
					topTopics[key] = topTopics[key] + item.top10Tokens[i];
				} else {
					topTopics[key] = item.top10Tokens[i];
				}
			}
			if (item.top10Bigrams) {
				for (const i of Object.keys(JSON.parse(item.top10Bigrams))) {
					const key = this.getBigramsIntoString(i);
					if (top10Bigrams.hasOwnProperty(key)) {
						top10Bigrams[key] = top10Bigrams[key] + JSON.parse(item.top10Bigrams)[i];
					} else {
						top10Bigrams[key] = JSON.parse(item.top10Bigrams)[i];
					}
				}
			}
			if (item.top10Keywords) {
				this.top10Keywords.push(item.top10Keywords);
			}

			for (const i of Object.keys(item.categories)) {
				const key = this.getTitleCase(i);
				if (topCategories.hasOwnProperty(key)) {
					topCategories[key] =
						topCategories[key] +
						(item.categories[i].numComment ? item.categories[i].numComment : 0) +
						(item.categories[i].numPost ? item.categories[i].numPost : 0);
				} else {
					topCategories[key] =
						(item.categories[i].numComment ? item.categories[i].numComment : 0) +
						(item.categories[i].numPost ? item.categories[i].numPost : 0);
				}
				for (const j of Object.keys(item.categories[i].keyWords)) {
					const keyWordKey = this.getTitleCase(j);
					if (topKeyWords.hasOwnProperty(keyWordKey)) {
						topKeyWords[keyWordKey] = {
							numOccurrences: item.categories[i].keyWords[j].numOccurrences + topKeyWords[keyWordKey].numOccurrences,
							type: item.categories[i].keyWords[j].type
						};
					} else {
						topKeyWords[keyWordKey] = {
							numOccurrences: item.categories[i].keyWords[j].numOccurrences,
							type: item.categories[i].keyWords[j].type
						};
					}
				}
			}
		});
		this.topTopics = this.sortJSONKeysByValue(topTopics);
		this.topCategories = this.sortJSONKeysByValue(topCategories);
		this.topIssues = this.getKeywordsByType(topKeyWords, 'Issues');
		this.topRemedies = this.getKeywordsByType(topKeyWords, 'Remedies');
		this.topProducts = this.getKeywordsByType(topKeyWords, 'Products');
		this.topBrands = this.getKeywordsByType(topKeyWords, 'Brands');
		this.top10Bigrams = this.sortJSONKeysByValue(top10Bigrams);
		this.sentiments = sentiment;
	}

	getTitleCase(keyword: string) {
		return keyword.replace(/\w\S*/g, txt => {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		});
	}

	getBigramsIntoString(keyword: string) {
		return keyword.replace(/[()',]+/g, '').toLowerCase();
	}

	sortJSONKeysByValue(unsortedObj: Object): {[key: string]: number} {
		return Object.entries(unsortedObj)
			.sort(([keyOne, valueA], [keyTwo, valueB]) => <number>valueB - <number>valueA)
			.slice(0, 5)
			.filter(([key, value]) => value > 0)
			.reduce((acc, [key, value]) => ({...acc, [key]: value}), {});
	}

	getKeywordsByType(topKeyWords: any, type: string) {
		const object = {};
		for (const j of Object.keys(topKeyWords)) {
			if (topKeyWords[j].type === type) {
				object[j] = topKeyWords[j].numOccurrences;
			}
		}

		return this.sortJSONKeysByValue(object);
	}
}
