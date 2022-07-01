import {SocialProfileEnum} from '../enums/social-profile.enum';

export class GetAdminBioModel {
	draftBio: AdminBioModel;
	mainBio: AdminBioModel;
}

export class GetAdminBioAnalyticsModel {
	error: string;
	kudosList?: KudosList[];
	userId: string;
	totalKudos: Number;
	totalContactRequests: Number;
}

export class AdminBioModel {
	userId: string;
	firstName: string;
	lastName: string;
	bio: string;
	country: string;
	countryFullName?: string;
	profileUrl?: string;
	profileUrlSlug?: string;
	oldProfileUrlSlug?: string;
	oldSlugExpiredDate?: string;
	selectedAdministratedGroups?: AdminGroups[];
	selectedSupportedGroups?: AdminGroups[];
	profilePictureUrl?: string | void;
	pitchVideo?: AdminBioFiles;
	keyAchievements?: string[];
	mediaCoverages?: AdminBioMediaCoverage[];
	files?: AdminBioFiles[];
	socialProfiles?: AdminSocialProfile[];
	isBioCompleted?: Boolean;
	kudos?: Number;
	publishedStatus?: string | null;
}

export class AdminBioPersonalModel {
	firstName: string;
	lastName: string;
	bio: string;
	country: string;
	profileUrl?: string;
}
export interface AdminBioMediaCoverage {
	url: string;
	title: string;
	description: string;
	imageUrl: string;
}

export interface AdminBioFiles {
	title: string;
	url: string | void;
	size: number;
	fileThumbnailURL: string;
}

export interface AdminSocialProfile {
	platform: SocialProfileEnum;
	profileLink: string;
}

export interface AdminGroups {
	id: string;
	fbGroupId: string;
	coverImage: string;
	memberCount: Number;
	profilePictureUrl: string;
}

export interface KudosList {
	createdAtUTC: string;
	createdAtUTCTick: string;
	error: string;
	fullName: string;
	id: string;
	profilePictureUrl: string;
	srcUserId: string;
	updatedAtUTC: string;
	isBioAvailable: boolean;
	profileUrl: string;
	profileError: string;
}

export interface AdminBioContactLead {
	fullName: string;
	emailAddress: string;
	companyName?: string;
	phoneNumber?: string;
	message?: string;
	targets?: string[];
	time?: string;
	createdAtUTCTick?: number;
	createdAtUTC?: string;
}

export interface AdminBioContactInput {
	items: AdminBioContactLead[];
	nextToken: string;
}
