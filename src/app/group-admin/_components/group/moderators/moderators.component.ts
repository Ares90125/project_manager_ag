import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import * as _ from 'lodash';
import {AccountSettingsService} from '@groupAdminModule/_services/account-settings.service';
import {BaseComponent} from '@sharedModule/components/base.component';
import {GroupsService} from '@sharedModule/services/groups.service';
import {AlertService} from '@sharedModule/services/alert.service';
import {UserService} from '@sharedModule/services/user.service';
import {CountryISO} from 'ngx-intl-tel-input';
import {UserModel} from '@sharedModule/models/user.model';
import {GroupModel} from '@sharedModule/models/group.model';
import {Router} from '@angular/router';
import {InvitationsService} from '@groupAdminModule/_services/invitations.service';
import {OnPropertyChange} from '@sharedModule/decorator/property-changes.decorator';
import {FacebookService} from '@sharedModule/services/facebook.service';
import {PublishService} from '@groupAdminModule/_services/publish.service';

@Component({
	selector: 'app-moderators',
	templateUrl: './moderators.component.html',
	styleUrls: ['./moderators.component.scss']
})
export class ModeratorsComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input()
	@OnPropertyChange('onGroupChange')
	group: GroupModel;
	@Output() closed = new EventEmitter();
	@Output() goToOverviewPage = new EventEmitter();
	@Input() user: UserModel;
	users;
	CountryISO = CountryISO;
	success = false;
	separateDialCode = true;
	preferredCountries: CountryISO[] = [CountryISO.India, CountryISO.UnitedStates];
	moderatorFormOne: FormGroup;
	memberDetails;
	selectedMember;
	isSaving = false;
	isLoading = true;
	sortColumn = {fullname: false, email: true};
	invitationList;

	constructor(
		injector: Injector,
		private readonly userService: UserService,
		private readonly groupsService: GroupsService,
		private readonly alertService: AlertService,
		private readonly router: Router,
		private readonly accountSettingsService: AccountSettingsService,
		private readonly invitationsService: InvitationsService,
		private readonly facebookService: FacebookService,
		private publishService: PublishService
	) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
		this.subscriptionsToDestroy.push(
			this.publishService.selectedGroup.subscribe(group => {
				this.group = group;
			})
		);
		if (this.group) {
			this.router.navigateByUrl(`group-admin/group/${this.group.id}/moderator`);
			super.setPageTitle(`GA - ${this.group.name} - Moderator`, 'GA - Moderator', {
				group_id: this.group.id,
				group_name: this.group.name,
				group_fb_id: this.group.fbGroupId
			});
			this.getGroupMemberDetails();
		}
		this.createModeratorFormOne();
	}

	onGroupChange(group) {
		if (this.group) {
			if (group.role === 'Moderator') {
				this.router.navigateByUrl(`group-admin/group/${group.id}/statistics`);
				this.goToOverviewPage.next(true);
				return;
			}
			this.router.navigateByUrl(`group-admin/group/${this.group.id}/moderator`);
			super.setPageTitle(`GA - ${this.group.name} - Moderator`, 'GA - Moderator', {
				group_id: this.group.id,
				group_name: this.group.name
			});
			this.getGroupMemberDetails();
		}
		this.createModeratorFormOne();
	}
	async getGroupMemberDetails() {
		let users = [];
		this.memberDetails = [];

		const response = await this.groupsService.getGroupMembersDetails(this.group.id);
		response.items.forEach(items => {
			users = users.concat(items);
		});

		const invitationListItems = await this.invitationsService.getInvitations(this.group.id);

		this.invitationList = [];

		invitationListItems.forEach(items => (this.invitationList = this.invitationList.concat(items)));

		this.invitationList = this.invitationList.filter(invitation => !invitation.isDeleted);

		this.getMembersData(users, this.invitationList);
	}

	async getMembersData(users, invitationList) {
		const calls = [];
		users.forEach(user => calls.push(this.accountSettingsService.getUserById(user.userId, this.group.id)));

		const members = await Promise.all(calls);

		this.memberDetails = [];
		members.forEach(async (member, index) => {
			if (!member.errors) {
				this.memberDetails.push(member);
				this.setMemberProfilePicture(member, index);
			}
		});

		invitationList.forEach(async invitation => {
			invitation.isInvited = true;
			invitation.resend = false;
			invitation.fullname = invitation.name;
			invitation.mobileNumber = invitation.mobilenumber;
			if (this.memberDetails.filter(member => member.email === invitation.email).length === 0) {
				this.memberDetails.push(invitation);
			}
		});

		this.isLoading = false;
	}

	async setMemberProfilePicture(member, index) {
		this.memberDetails[index].fbProfilePic = await this.facebookService.getProfilePicture(member.fbUserId);
	}

	isAdditionAllowed(loggedInUserGroupRole, currentUserRole) {
		switch (loggedInUserGroupRole) {
			case 'Owner':
				return currentUserRole !== 'Owner';
			case 'Admin':
				return !(currentUserRole === 'Admin' || currentUserRole === 'Owner');
			case 'Moderator':
				return !currentUserRole;
		}
	}

	isRemovalAllowed(loggedInUserGroupRole, currentUserRole, currentUserId) {
		switch (loggedInUserGroupRole) {
			case 'Owner':
				return currentUserRole !== 'Owner';
			case 'Admin':
				return !(currentUserRole === 'Admin' || currentUserRole === 'Owner');
			case 'Moderator':
				return (currentUserRole === 'Moderator' && this.user.id === currentUserId) || !currentUserRole;
		}
	}

	createModeratorFormOne() {
		this.moderatorFormOne = new FormGroup({
			name: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(30)]),
			email: new FormControl('', [Validators.email, Validators.required]),
			mobileNumber: new FormControl('', [Validators.required])
		});
		this.recordDialogBoxShow('Add new moderator');
	}

	validateEmail(email) {
		const emailField = this.moderatorFormOne.get('email');
		if (this.memberDetails.find(member => member.email.toLowerCase() === email.toLowerCase())) {
			emailField.setErrors({invalid: true});
		} else {
			if (emailField.errors) {
				delete emailField.errors['invalid'];
			}
		}
	}

	validateName(name) {
		const nameField = this.moderatorFormOne.get('name');
		if (name.length < 1 || name.length > 30) {
			nameField.setErrors({invalid: true});
		} else {
			if (nameField.errors) {
				delete nameField.errors['invalid'];
			}
		}
	}

	async onSearchChange(searchValue) {
		searchValue = searchValue.toLowerCase();
		this.memberDetails.forEach(member => {
			member.ishide = !(
				member.fullname.toLowerCase().indexOf(searchValue) > -1 ||
				member.email.toLowerCase().indexOf(searchValue) > -1 ||
				searchValue === ''
			);
		});
	}

	async sortModeratorList(type) {
		this.sortColumn[type] = !this.sortColumn[type];
		this.memberDetails = _.orderBy(this.memberDetails, [mem => mem[type]], [this.sortColumn[type] ? 'asc' : 'desc']);
	}

	navigateToModeratorForm2(event) {
		if (event.code === 'Enter' && this.moderatorFormOne.valid) {
			document.getElementById('continueBtn').click();
		}
	}

	async addModerator(element) {
		this.recordButtonClick(element, this.group);
		this.isSaving = true;

		if (!this.group) {
			return;
		}

		try {
			this.users = await this.userService.getUser();
			const moderators = await this.groupsService.addModeratorForGroups(
				[this.group],
				this.users.fullname,
				this.users.id,
				this.moderatorFormOne.get('email').value.toLowerCase(),
				this.moderatorFormOne.get('mobileNumber').value.dialCode +
					' ' +
					this.moderatorFormOne.get('mobileNumber').value.number,
				this.moderatorFormOne.get('name').value
			);

			this.isLoading = true;
			this.getGroupMemberDetails();
			this.isSaving = false;
			document.getElementById('dismissstep1').click();
			if (moderators.errors) {
				this.alertService.error('Invite sent unsuccessful', moderators.errors[0]?.message, 5000, true);
			} else {
				this.alertService.success(
					'Wait for new moderator to accept your invite',
					'Invite sent successfully',
					5000,
					true
				);
			}
		} catch (e) {
			this.isSaving = false;
			this.alertService.error(
				'Invite sent unsuccessful',
				'An unknown error has occured. Please add the moderator once again',
				10000,
				true
			);
			document.getElementById('dismissstep1').click();
		}
	}

	async removeModerator(selectedMember) {
		if (!this.group) {
			return;
		}

		this.isLoading = true;
		const calls = [];
		if (!selectedMember.isInvited) {
			calls.push(this.groupsService.removeGroupModerator(selectedMember.username, this.group.id));
		} else {
			const createdAtUTCTicks = selectedMember.createdAtUTCTicks;
			calls.push(this.invitationsService.removeInvitation(this.group.id, createdAtUTCTicks));
		}
		try {
			await Promise.all(calls);
			this.getGroupMemberDetails();
		} catch (e) {
			this.alertService.error(
				'Unsuccessful',
				'An unknown error has occured. Please remove the moderator once again',
				10000,
				true
			);
		}

		this.selectedMember = null;
	}

	async sendInvite(selectedMember) {
		const calls = [];
		selectedMember.resend = true;
		calls.push(this.invitationsService.resendInvitation(selectedMember.groupId, selectedMember.createdAtUTCTicks));
		try {
			await Promise.all(calls);
			this.alertService.success('Wait for moderator to accept your invite', 'Invite sent successfully', 5000, true);
		} catch (e) {
			selectedMember.resend = false;
			this.alertService.error(
				'Invite sent unsuccessful',
				'An unknown error has occured. Please resend invitation once again',
				10000,
				true
			);
		}
	}

	close() {
		this.closed.emit(false);
		window.scrollTo(0, 0);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
