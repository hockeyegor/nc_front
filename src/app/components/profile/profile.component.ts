import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { User } from 'src/app/entity/user';
import {DataTransferService} from '../../shared/data-transfer.service';
import {Ticket} from '../../entity/ticket';
import {Reservation} from '../../entity/reservation';
import {NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs/operators';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import {ConfirmEmailService} from "../../core/auth/shared/confirm-email.service";
import {FormControl, FormGroup} from "@angular/forms";
import {UserService} from "../../shared/user.service";
import {identityPasswordValidator} from "../../core/auth/shared/identity-password.directive";
import {SnackBarComponent} from "../snack-bar/snack-bar.component";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy{
  public  user: User;
  public  reservations: Reservation[] = [];
  public  tickets: Ticket[] = [];
  public  changeForm;
  public  errorPassword;


  constructor(public  transfer: DataTransferService,
    public  router: Router,
              public  successfulChanging: SnackBarComponent,
              public  userService: UserService,
              public  spinnerService: Ng4LoadingSpinnerService,
              public  confirmService: ConfirmEmailService) {

    this.changeForm = new FormGroup({
      hashPass: new FormControl('', ),
      repeatPass: new FormControl('')
    }, {validators: identityPasswordValidator});

    this.spinnerService.show();

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        this.spinnerService.hide();

        this.user = JSON.parse(localStorage.getItem('user'));

        if (this.transfer.user$.getValue() !== undefined) {
          this.transfer.user$.subscribe(value => {
            this.user = value;
            if (!!this.user) {
              localStorage.setItem('user', JSON.stringify(this.user));
            }
          });
        } else {
          this.user = JSON.parse(localStorage.getItem('user'));
        }
        if(!!this.user) {
          this.reservations = this.user.reservations;
          this.tickets = this.user.tickets;
        }
      });
  }

  sendConfirmEmail(userName: string) {
    this.confirmService.confirmEmail(userName).subscribe(
      ()=> {},
      error1 => {
        console.log(error1);
      }
    );
  }

  submit(data: any) {
    this.errorPassword = false;
    const userName = JSON.parse(localStorage.getItem('user')).userName;
    this.userService.updatePassword(userName, data.hashPass).subscribe(
      () => {
        this.successfulChanging.openSuccessfulChangingPassword();
      },
      () => {
        this.errorPassword = true;
      }
    );
  }

  ngOnInit() {
    this.errorPassword = false;
  }

  ngOnDestroy() {}

  isLater(date: string): boolean {
    return new Date(date) > new Date();
  }
}
