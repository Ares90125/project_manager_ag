export enum CampaignTypeEnum {
	Listening = 'Listening',
	CommunityMarketing = 'CommunityMarketing'
}

export enum CampaignStatusEnum {
	Draft = 'Draft',
	Saved = 'Saved',
	PendingApproval = 'PendingApproval',
	Approved = 'Approved',
	Active = 'Active',
	Suspended = 'Suspended',
	Completed = 'Completed',
	Scheduled = 'Scheduled',
	Reactivating = 'Reactivating'
}

export enum CampaignCommunityStatusEnum {
	CampaignBriefSent = 'CampaignBriefSent',
	CampaignAccepted = 'CampaignAccepted',
	CampaignDeclined = 'CampaignDeclined',
	ContentApproved = 'ContentApproved',
	TaskCreated = 'TaskCreated',
	TaskRequestSent = 'TaskRequestSent',
	TaskScheduled = 'TaskScheduled',
	TaskDeclined = 'TaskDeclined',
	TaskCompleted = 'TaskCompleted',
	TaskPaused = 'TaskPaused',
	TaskFailed = 'TaskFailed',
	PaymentSent = 'PaymentSent'
}

export enum CMCWhatsAppNotificationType {
	CampaignBriefAndPricing = 'CampaignBriefAndPricing',
	CampaignStatusUpdate = 'CampaignStatusUpdate',
	CampaignBriefAndPricingReminder = 'CampaignBriefAndPricingReminder',
	TaskReminder = 'TaskReminder',
	CampaignBriefAndContentRequest = 'CampaignBriefAndContentRequest'
}
