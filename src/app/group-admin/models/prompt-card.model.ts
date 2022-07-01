export class PromptCard {
	userId: string;
	cardId: string;
	cardActivity?: CardActivity;
	cardOrder?: any;
}

export class CardActivity {
	nextDayToBeShownAtUtc?: string;
	numberOfTimesShownInSuccession?: number;
	numberOfTime7DaysIntervalConsume?: number;
	confirmationPendingSinceUtc?: string;
	numberOfTimeBookingDone?: number;
}
