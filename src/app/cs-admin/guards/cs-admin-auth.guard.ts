import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {UserService} from '@sharedModule/services/user.service';
import {UserTypeEnum} from '@sharedModule/enums/user-type.enum';

@Injectable()
export class CSAdminAuthGuard implements CanActivate {
	constructor(private readonly router: Router, private userService: UserService) {}

	async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		return new Promise<boolean>(resolve => {
			this.userService.isLoggedIn.subscribe(async isLoggedInValue => {
				if (!isLoggedInValue) {
					return;
				} else if (isLoggedInValue && (await this.userService.getUser()).userType === UserTypeEnum.CSAdmin) {
					resolve(true);
				} else {
					resolve(false);
				}
			});
		});
	}
}
