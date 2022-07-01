import {Component, Injector, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
import {GroupProfilePageModel} from '@campaigns/_models/group-profile-page.model';
import {BackendService} from '@sharedModule/services/backend.service';
import {ActivatedRoute, Router} from '@angular/router';
import {PublishService} from '@groupAdminModule/_services/publish.service';
import {GroupsService} from '@sharedModule/services/groups.service';
import {GroupProfilePagesService} from '@groupAdminModule/campaigns/_services/group-profile-pages.service';
import {UserService} from '@sharedModule/services/user.service';
import {SecuredStorageProviderService} from '@sharedModule/services/secured-storage-provider.service';
import {CEPOnboardingStateEnum} from '@groupAdminModule/campaigns/_enums/CEP-onboarding-state.enum';
import Auth from '@aws-amplify/auth';
import {UserModel} from '@sharedModule/models/user.model';
import {AnimationOptions} from 'ngx-lottie';
import {environment} from 'src/environments/environment';
import {AdminBioService} from '@sharedModule/services/admin-bio.service';
// import {CATCH_ERROR_VAR} from '@angular/compiler/src/output/output_ast';

@Component({
	selector: 'app-group-profile',
	templateUrl: './group-profile-page.component.html',
	styleUrls: ['./group-profile-page.component.scss']
})
export class GroupProfilePageComponent extends BaseComponent implements OnInit, OnDestroy {
	isEditAvailable = false;
	profilePage: GroupProfilePageModel;
	openShareModal = false;
	groupInsightsForAge = [];
	adminBio;
	user: UserModel;

	rate: number = 0;
	reviewsModal: boolean = false;
	writeReviewModal: boolean = false;
	writeReviewSuccessModal: boolean = false;
	writeReviewAlertModal: boolean = false;
	editReviewModal: boolean = false;
	removeReviewModal: boolean = false;
	removeReviewSuccessModal: boolean = false;

	reviewRate: number = null;
	reviewText: string = '';

	isSendReviewInProgress: boolean = false;
	newOldReviewModal: boolean = false;
	customOAuthState: any;
	alreadyHandleReviewSection: boolean = false;
	showReviewNotFoundMessage: boolean = false;
	@ViewChild('tooltip') tooltip;

	constructor(
		private readonly injector: Injector,
		private readonly backendService: BackendService,
		private readonly route: ActivatedRoute,
		private readonly router: Router,
		private publishService: PublishService,
		private groupsService: GroupsService,
		private groupProfilePageService: GroupProfilePagesService,
		private userService: UserService,
		private securedStorageService: SecuredStorageProviderService,
		private readonly adminBioService: AdminBioService
	) {
		super(injector);
	}

	profileDefaultReviewImage = 'assets/images/default_user.png';
	bigStarAnimationOption: AnimationOptions = {
		path: './assets/json/star-green.json'
	};
	successAnimationOption: AnimationOptions = {
		path: './assets/json/success-animation.json'
	};
	alertAnimationOption: AnimationOptions = {
		path: './assets/json/alert-animation.json'
	};

	ngOnInit() {
		super._ngOnInit();
		this.addLeadfeederScriptsToHead();
		// this.getProfilePage();
		setTimeout(() => {
			this.tooltip?.show();
		}, 2500);
		this.adminBioService.init();
		this.customOAuthState = JSON.parse(this.securedStorageService.getSessionStorage('login_through_OAuthState'));
		this.securedStorageService.removeSessionStorage('login_through_OAuthState');
		this.subscriptionsToDestroy.concat(
			this.adminBioService.currentDraftAdminBioData$.subscribe(data => {
				this.adminBio = data;
			}),
			this.userService.currentUser$.subscribe(async user => {
				if (user === null) {
					this.getProfilePage();
					return;
				}
				this.user = user;
				this.getProfilePage(this.customOAuthState && this.customOAuthState.writeReviewModal);
			})
		);
	}

	redirectToLandingPage() {
		if (!!window) {
			window.location.href = environment.landingPageUrl;
		}
	}

	showTooltip() {
		if (window.innerWidth > 767) {
			this.tooltip.show();
		}
	}

	hideTooltip() {
		this.tooltip.hide();
	}

	addLeadfeederScriptsToHead() {
		const head = document.getElementsByTagName('head')[0];
		const script = document.createElement('script');

		script.innerHTML = `(function (ss, ex) {
			window.ldfdr =
				window.ldfdr ||
				function () {
					(ldfdr._q = ldfdr._q || []).push([].slice.call(arguments));
				};
			(function (d, s) {
				fs = d.getElementsByTagName(s)[0];
				function ce(src) {
					var cs = d.createElement(s);
					cs.src = src;
					cs.async = 1;
					fs.parentNode.insertBefore(cs, fs);
				}
				ce('https://sc.lfeeder.com/lftracker_v1_' + ss + (ex ? '_' + ex : '') + '.js');
			})(document, 'script');
		})('kn9Eq4ROE2KaRlvP');`;

		head.insertBefore(script, head.firstChild);
	}

	async getProfilePage(shouldOpenWriteReviewModal?: boolean) {
		this.profilePage = await this.backendService.restGet(
			this.user && this.user.id
				? `/groupprofile/getgroupprofile/${this.route.snapshot.params.profileId}?userId=${this.user.id}`
				: '/groupprofile/getgroupprofile/' + this.route.snapshot.params.profileId
		);

		if (shouldOpenWriteReviewModal) {
			this.handleInteractionReviewModalAfterLogin(this.customOAuthState, this.profilePage);
		}

		this.rate = this.profilePage.totalRating;
		this.getGroupInsights();
		this.setTitle();
	}

	async getGroupInsights() {
		try {
			const groupInsights = await this.groupProfilePageService.getGroupInsights(this.profilePage.groupId);

			this.groupInsightsForAge = groupInsights?.groupsAgeGenderInsights;
		} catch (e) {
			this.groupInsightsForAge = [];
		}
	}

	setTitle() {
		super.setPageTitle('GA - Group Profile Page', 'GA - Group Profile Page', {
			is_public_url: true,
			group_id: this.profilePage.groupId,
			group_name: this.profilePage.groupName
		});
	}

	handleOpenModal(event) {
		this.reviewsModal = true;
		this.disableScrolling();
		this.recordButtonClick(event, null, null, null, this.profilePage);
	}

	scrollToSection(event) {
		event.preventDefault();
		var dataHref = event.currentTarget.attributes.datahref.nodeValue;
		$('.nav-link-wrap li a').removeClass('active');
		event.currentTarget.classList.add('active');
		$('html, body').animate(
			{
				scrollTop: $('#' + dataHref).offset().top - 60
			},
			500
		);
	}

	openSharePopup(element) {
		this.recordButtonClick(element, null, null, null, this.profilePage);
		this.openShareModal = true;
	}

	closePopup(event) {
		this.enableScrolling();
		this.showReviewNotFoundMessage = false;
		this.openShareModal = false;
	}

	async signIn(element) {
		const user = await this.userService.getUser();

		if (user) {
			const groupWithProfilePageAccess = (await this.groupsService.listGroupsWithProfilePagesAccess()).sort(
				(a, b) => b.noOfProfilePagesCreated - a.noOfProfilePagesCreated
			);
			if (groupWithProfilePageAccess && groupWithProfilePageAccess.length > 0) {
				this.router.navigateByUrl(
					`/group-admin/campaigns/${groupWithProfilePageAccess[0].id}/profile-pages#groupProfile`
				);
			} else {
				this.router.navigateByUrl('/group-admin/manage');
			}
			return;
		}

		const customStateData = {
			url: window.location.href,
			login_from: 'GroupProfileCTA'
		};
		this.securedStorageService.setSessionStorage('login_through_OAuthState', JSON.stringify(customStateData));
		// @ts-ignore
		await Auth.federatedSignIn({provider: 'Facebook'});
	}

	changeReviewRating(event) {
		this.reviewRate = event;
	}

	changeReviewText(event) {
		this.reviewText = event.target.value;
	}

	async sendGroupProfileReview(isFromEditReviewbutton = false) {
		const reviewData = {
			reviewText: this.reviewText,
			rating: this.reviewRate
		};

		if (!this.user) {
			this.securedStorageService.setCookie('user_group_review', JSON.stringify(reviewData), 0.04);
			await this.facebookLogin(reviewData, isFromEditReviewbutton);
			return;
		}
		this.isSendReviewInProgress = true;

		const response = await this.groupsService.putGroupReview({
			groupId: this.profilePage.groupId,
			rating: this.reviewRate,
			reviewText: this.reviewText
		});

		this.logger.info(
			'reviews_given',
			{
				groupId: this.profilePage.groupId,
				groupName: this.profilePage.groupName,
				rating: this.reviewRate,
				reviewText: this.reviewText,
				profileName: this.profilePage.name,
				profileId: this.profilePage.id,
				profileCreatedBy: this.profilePage.createdByUserId
			},
			'GroupProfilePageComponent',
			'sendGroupProfileReview'
		);
		// this.getProfilePage();
		this.reviewRate = null;
		this.reviewText = '';
		this.reviewsModal = false;
		this.writeReviewModal = false;
		this.editReviewModal = false;
		this.newOldReviewModal = false;
		this.isSendReviewInProgress = false;
		if (response) {
			this.writeReviewSuccessModal = true;
			this.getProfilePage();
		} else {
			this.writeReviewAlertModal = true;
		}
	}

	async removeGroupProfileReview() {
		const response = await this.groupsService.deleteGroupReview({groupId: this.profilePage.groupId});
		this.reviewRate = null;
		this.reviewText = '';
		this.reviewsModal = false;
		this.editReviewModal = false;
		if (response.success) {
			// this.writeReviewSuccessModal = true;
			this.removeReviewModal = false;
			this.removeReviewSuccessModal = true;
			this.getProfilePage();
		}
	}

	async facebookLogin(reviewData, isFromEditReviewbutton = false) {
		const customStateData = {
			url: window.location.href,
			login_from: 'public_group_profile',
			profileId: this.profilePage.id,
			writeReviewModal: true,
			reviewData: reviewData,
			profileName: this.profilePage.name,
			profileCreatedBy: this.profilePage.createdByUserId,
			groupId: this.profilePage.groupId,
			groupName: this.profilePage.groupName,
			isFromEditReviewbutton: isFromEditReviewbutton
		};
		this.securedStorageService.setSessionStorage('login_through_OAuthState', JSON.stringify(customStateData));

		// @ts-ignore
		await Auth.federatedSignIn({provider: 'Facebook'});
	}

	async handleInteractionReviewModal(element?) {
		if (element) await this.recordButtonClick(element, null, null, {is_login_flow: false}, this.profilePage);

		if (this.profilePage.currentUserReview && this.profilePage.currentUserReview.userId) {
			this.reviewRate = this.profilePage.currentUserReview.rating;
			this.reviewText = this.profilePage.currentUserReview.reviewText;
			this.editReviewModal = true;
			this.disableScrolling();
		} else {
			this.writeReviewModal = true;
			this.disableScrolling();
		}
	}

	async handleInteractionReviewModalAfterLogin(reviewDataAfterLogin, profilePage) {
		if (this.alreadyHandleReviewSection) {
			return;
		}

		this.reviewRate = reviewDataAfterLogin?.reviewData?.rating;
		this.reviewText = reviewDataAfterLogin?.reviewData?.reviewText;
		this.alreadyHandleReviewSection = true;

		if (reviewDataAfterLogin.isFromEditReviewbutton) {
			if (this.profilePage.currentUserReview) {
				this.reviewRate = this.profilePage.currentUserReview?.rating;
				this.reviewText = this.profilePage.currentUserReview?.reviewText;
				this.editReviewModal = true;
			} else {
				this.showReviewNotFoundMessage = true;
				this.writeReviewModal = true;
			}
			return;
		}
		// if Review present show new vs old
		if (this.profilePage.currentUserReview) {
			this.newOldReviewModal = true;
			return;
		}
		// submit review
		this.sendGroupProfileReview();
	}

	showEditModal() {
		this.reviewRate = this.profilePage.currentUserReview.rating ?? 0;
		this.reviewText = this.profilePage.currentUserReview.reviewText ?? '';
		this.writeReviewSuccessModal = false;
		this.editReviewModal = true;
	}

	openNewReviewInEditModal() {
		this.reviewRate = this.customOAuthState?.reviewData?.rating ?? 0;
		this.reviewText = this.customOAuthState?.reviewData?.reviewText ?? '';
		this.sendGroupProfileReview();
	}

	openOldReviewInEditModal() {
		this.reviewRate = this.profilePage.currentUserReview?.rating ?? 0;
		this.reviewText = this.profilePage.currentUserReview?.reviewText ?? '';
		this.editReviewModal = true;
		this.newOldReviewModal = false;
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
