import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {BaseComponent} from '@sharedModule/components/base.component';
import {GroupStateEnum} from '@sharedModule/enums/group-state.enum';
import {GroupModel} from '@sharedModule/models/group.model';
import {GroupsService} from '@sharedModule/services/groups.service';
import {PublishService} from 'src/app/group-admin/_services/publish.service';

@Component({
	selector: 'app-group-sidebar',
	templateUrl: './group-sidebar.component.html',
	styleUrls: ['./group-sidebar.component.scss']
})
export class GroupSidebarComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() group: GroupModel;
	@Output() selectedLink = new EventEmitter<string>();
	@Output() selectedTitle = new EventEmitter<string>();
	installedGroups: GroupModel[];
	dontShowToggleButton: boolean = false;
	@Input() hashParam;

	constructor(
		Injector: Injector,
		private readonly groupsService: GroupsService,
		private readonly router: Router,
		private route: ActivatedRoute,
		private publishService: PublishService
	) {
		super(Injector);
	}

	ngOnInit(): void {
		super._ngOnInit();
		this.getGroupData();
	}

	async getGroupData() {
		this.groupsService.init();
		this.subscriptionsToDestroy.push(
			this.groupsService.groups.subscribe(groups => {
				if (!groups) {
					return;
				}

				this.installedGroups = groups.filter(group => group.state === GroupStateEnum.Installed);
				if (this.installedGroups.length === 1) {
					this.dontShowToggleButton = true;
				}
			})
		);
	}

	recordEvents(type) {
		if (type === 'postTrends' && !this.group.isReSharePostTabAvailable()) {
			return;
		}
		this.hashParam = type === 'urgentAlerts' ? 'keywordTracking' : type;
		this.appService.currentPageFragment = '';
		this.appService.currentGroupPageUrl = type;
		this.selectedLink.next(type);
	}

	async goBack(element) {
		this.appService.currentPageFragment = '';
		this.appService.currentGroupPageUrl = '';
		this.recordButtonClick(element, this.group);
		this.router.navigate(['/group-admin/manage']);
	}

	changeGroup(group) {
		this.group = group;
		this.appService.currentGroupPageUrl = this.router.url.split('?')[0].split('/').pop();
		if (!this.router.url.includes('urgentAlerts') && !this.router.url.includes('create')) {
			this.router.navigateByUrl(`group-admin/group/${group.id}/${this.appService.currentGroupPageUrl}`);
		}
		this.publishService.setSelectedGroup(group);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
