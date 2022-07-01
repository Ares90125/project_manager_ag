import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {PublishService} from '../../../_services/publish.service';
import {UserService} from '@sharedModule/services/user.service';
import {UserModel} from '@sharedModule/models/user.model';
import {GroupModel} from 'src/app/shared/models/group.model';
import {BaseComponent} from 'src/app/shared/components/base.component';

@Component({
	selector: 'app-group-keyword',
	templateUrl: './group-keyword.component.html',
	styleUrls: ['./group-keyword.component.scss']
})
export class GroupKeywordComponent extends BaseComponent implements OnInit, OnDestroy {
	group: GroupModel;
	user: UserModel;

	constructor(injector: Injector, private readonly userService: UserService, private publishService: PublishService) {
		super(injector);
	}

	async ngOnInit() {
		this.subscriptionsToDestroy.push(
			this.publishService.selectedGroup.subscribe(group => {
				this.group = group;
			})
		);
		this.user = await this.userService.getUser();
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
