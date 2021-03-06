import {Component, Injectable, OnInit} from '@angular/core';
import {TripService} from '../../shared/trip.service';
import {Trip} from '../../entity/trip';
import {ActivatedRoute } from '@angular/router';
import {FormGroup, Validators, FormArray, FormBuilder} from '@angular/forms';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {TicketService} from '../../shared/ticket.service';
import {SnackBarComponent} from '../snack-bar/snack-bar.component';
import {Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import {GlobalRootURL } from 'src/app/GlobalRootURL';
import { User } from 'src/app/entity/user';
import { WalletService } from 'src/app/shared/wallet.service';
import { UserService } from 'src/app/shared/user.service';
import { DataTransferService } from 'src/app/shared/data-transfer.service';
import {CityService} from "../../shared/city.service";

declare var $ :any;
@Component({
  selector: 'app-buy-ticket',
  templateUrl: './buy-ticket.component.html',
  styleUrls: ['./buy-ticket.component.css']
})
@Injectable({
  providedIn: 'root'
})
export class BuyTicketComponent implements OnInit {
  readonly ROOT_URL = GlobalRootURL.BASE_API_URL + 'trips/';
  appTitle = 'Flight Information';
  trip: Trip
  count: number;
  public usersForm: FormGroup;
  error: HttpErrorResponse;
  idT:number;
  idU:number;
  message: any;
  cityFrom:any;
  cityDest:any;
  transport:any;
  userId:number = JSON.parse(localStorage.getItem('user')).userId;
  constructor(public  tripService: TripService,
    public  route: ActivatedRoute,
    public  fb: FormBuilder,
    public  ticketService: TicketService,
    public  errorConnection: SnackBarComponent,
              public  spinnerService: Ng4LoadingSpinnerService,
              public  http: HttpClient,
              public  walletService: WalletService,
              public  userService: UserService,
              public  transfer: DataTransferService,
              public  cityService: CityService){}

    ngOnInit() {
    this.spinnerService.show();
    const tripid = this.route.snapshot.paramMap.get('tripid');
    this.idT = parseInt(tripid);
    this.http.get<Trip>(this.ROOT_URL+ this.idT).subscribe((data: Trip) => {
      this.trip = new Trip(data);
      this.tripService.getCityName(data.cityFrom).subscribe(
        (log: HttpErrorResponse) => {
          this.cityFrom = log;
          }
        );;
      this.tripService.getCityName(data.cityDest).subscribe(
         (log: HttpErrorResponse) => {
           this.cityDest = log;
          }
        );
      this.tripService.getTransportName(data.transport).subscribe(
          (log: HttpErrorResponse) => {
            this.transport = log;
           }
         );
      this.spinnerService.hide();
    });
    this.route.queryParams.subscribe(params => {
        this.count = parseInt(params.count);
      });

    this.usersForm = this.fb.group({
      users: this.fb.array([
        this.fb.group({
          firstName: ['', Validators.required],
          lastName: ['', Validators.required]
        })
      ])
    });
    this.addFormControl();
    //this.usersForm.valueChanges.subscribe((value)=>console.log(value));
  }

  removeFormControl(i) {
    let usersArray = this.usersForm.get('users')['controls'] as FormArray;
    usersArray.removeAt(i);
  }

  addFormControl() {
    for (let i = 1; i < this.count; i++) {
      const usersArray = this.usersForm.get('users')['controls'] as FormArray;
      let arraylen = usersArray.length;
      let newUsergroup: FormGroup = this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required]
      })
      usersArray.insert(arraylen, newUsergroup);
    }
  }

  submit(){
    this.ticketService.submitForm(this.usersForm.get('users')['controls'].value, this.count, this.idT, this.userId)
                .subscribe(
                    () => {
                      this.spinnerService.show();
                    },
                    (error) => {
                      this.spinnerService.show();
                      console.log(error);
                      if(error.status === 200) {
                        this.message = error.error.text;

                      }
                      if(error.status === 400) {
                        this.message = error.error;
                      }
                      //this.message = error.error;
                      if(error.status === 0) {
                        this.errorConnection.openErrorConnection();
                      }
                    }
                );
      setTimeout(() => {

        $('#myModal').modal('show');
        this.userService.getUserById(this.userId).subscribe(
          (data: any)=>{
            this.spinnerService.hide();
              let user = new User(data);
              this.ticketService.loadWallet(data.wallet).subscribe( wallet => {
                  user.setWallet(wallet);
                }
              );

            user.tickets.forEach(ticket => {

              this.cityService.loadCity(ticket.cityFrom.cityId).subscribe( city => {
                  ticket.setCityFrom(city);
                }
              );

              this.cityService.loadCity(ticket.cityDest.cityId).subscribe( city => {
                  ticket.setCityDest(city);
                }
              );
            });
            this.transfer.setUser(user);
            localStorage.setItem('user', JSON.stringify(user));
          }
        );
        },
        7000);
    this.spinnerService.hide();
  }
 }
