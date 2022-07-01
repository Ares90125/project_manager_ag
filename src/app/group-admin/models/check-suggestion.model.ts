export class CheckSuggestionModel {
	time?: Time;
	optimumLengthResult?: OptimumLengthResult;
	optimumLength?: OptimumLength;
	categories?: ValueFlag[];
	keywords?: ValueFlag[];
	topics?: ValueFlag[];
}

export class Time {
	expectedTime?: string;
	actualTime?: string;
	flag?: boolean;
}

export class OptimumLengthResult {
	optimumWordCount?: ValueFlag;
	optimumCharacterCount?: ValueFlag;
}

export class ValueFlag {
	value?: string;
	flag?: boolean;
}

export class OptimumLength {
	minWord?: number;
	maxWord?: number;
	minChar?: number;
	maxChar?: number;
}
