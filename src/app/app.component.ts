import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { map, Observable, startWith } from 'rxjs';
import { AppService } from './app.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { animate, style, transition, trigger } from '@angular/animations';
export interface State {
  name: string;
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('sort', [
      transition('* => void', [
        animate('300ms ease-out', style({
          transform: 'translateX(100%)',
          opacity: 0
        }))
      ]),
      transition('void => *', [      style({        transform: 'translateX(100%)',        opacity: 0      }),      animate('300ms ease-out', style({        transform: 'translateX(0%)',        opacity: 1      }))    ]),
      transition('* => *', [      animate('300ms ease-out', style({        transform: 'translateY(0%)'      }))    ])
    ])
  ]
})

export class AppComponent {
  myControl = new FormControl<string | State>('');
  options: State[] = [{ name: 'Mary' }, { name: 'Shelley' }, { name: 'Igor' }];
  filteredOptions: Observable<State[]> | undefined;
  title = 'bestnearme';
  States: any;
  Districts: any;
  Places: any;
  Area: any;
  Types: any;
  StatesSave: Boolean = false;
  DistrictsSave: Boolean = false;
  PlacesSave: Boolean = false;
  AreaSave: Boolean = false;
  TypesSave: Boolean = false;
  BestSave: Boolean = false;
  bearertoken: any;
  BestData: any;
  BestVoted: any;
  ipAddress: any;
  userAddress:any;
  StatesearchText: any = '';
  DistrictsearchText: any = '';
  PlacesearchText: any = '';
  AreasearchText: any = '';
  BestsearchText: any = '';
  TypesearchText: any = '';
  toggle = false;
  status = 'Enable';
  keyword = 'name';
  lat: number=0;
  lng: number=0;
  votedOption: number=0;
  constructor(private appservice: AppService, private _snackBar: MatSnackBar) { }
  ngOnInit() {
    this.appservice.getBearerToken().subscribe((data) => {
      this.bearertoken = "Bearer " + data.access_token;
      this.getLocation();
      this.getAllStates(this.bearertoken);
      this.getDistricts();
      this.getPlaces();
      this.getArea();
      this.getType();
      this.getBestData();
      this.getIP();
      
    }
    );
  }
  getIP() {
    this.appservice.getIPAddress().subscribe((res: any) => {
      this.ipAddress = res.ip;
    });
  }
  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        if (position) {
          console.log("Latitude: " + position.coords.latitude +
            "Longitude: " + position.coords.longitude);
          this.lat = position.coords.latitude;
          this.lng = position.coords.longitude;
          console.log(this.lat);
          console.log(this.lat);
          this.appservice.getLocation(this.lng,this.lat).subscribe((res: any) => {
            this.userAddress = res.address;
            this.PlacesearchText=this.userAddress.City;
            this.DistrictsearchText=this.userAddress.Subregion;
            this.StatesearchText=this.userAddress.Region;
            this.AreasearchText=this.userAddress.District;
            this.getDistricts();
            this.getPlaces();
            this.getArea();
            this.getType();
            this.getBestData();
          });
        }
      },
        (error: any) => console.log(error));
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }
  SaveBestVoted(name: any, votes: any) {
    this.updateBestData(name, votes);
  }
  updateBestData(name: any, votes: any) {
    var BestValues = JSON.stringify({
      "collection": "Best",
      "database": "test",
      "dataSource": "Cluster0",
      "filter": {
        "name": name,
        "State": this.StatesearchText.length > 0 ? this.StatesearchText : undefined,
        "District": this.DistrictsearchText.length > 0 ? this.DistrictsearchText : undefined,
        "Place": this.PlacesearchText.length > 0 ? this.PlacesearchText : undefined,
        "Area": this.AreasearchText.length > 0 ? this.AreasearchText : undefined,
        "Type": this.TypesearchText.length > 0 ? this.TypesearchText : undefined
      },
      "update": {
        "$set": {
          "votes": +votes + 1,
        }
      }

    });

    this.appservice.updateBestData(BestValues, this.bearertoken).subscribe((data) => {
      this.getBestData()
      this.toggle = true;
      this.votedOption = 1;
    }
    );
  }
  SaveBestNew(newBest: string, State: string, District: string, Place: string, Area: string, Type: string) {
    if(this.StatesearchText && this.DistrictsearchText && this.PlacesearchText && this.AreasearchText && this.TypesearchText )
    {
      var BestValues = JSON.stringify({
        "collection": "Best",
        "database": "test",
        "dataSource": "Cluster0",
        "document": {
          "name": newBest,
          "votes": 1,
          "State": typeof this.StatesearchText ==='object'? this.StatesearchText.name : this.StatesearchText,
          "District": typeof this.DistrictsearchText ==='object'? this.DistrictsearchText.name : this.DistrictsearchText,
          "Place":typeof this.PlacesearchText ==='object'? this.PlacesearchText.name : this.PlacesearchText,
          "Area": typeof this.AreasearchText ==='object'? this.AreasearchText.name : this.AreasearchText,
          "Type": typeof this.TypesearchText ==='object'? this.TypesearchText.name : this.TypesearchText
        }
      });
  
      this.appservice.addData(BestValues, this.bearertoken).subscribe((data) => {
        this.getBestData()
        this.valueAvailable('Best',newBest)
        this.BestSave=false;
        this._snackBar.open("Your Best Preference has been Added", "OK", { duration: 3000 });
      }
      );
    }
    else
    {
      this._snackBar.open("All the Above Details are Required for Saving Best Preference", "OK", { duration: 3000 });
    }
    
  }

  SaveState(State: string) {
    var BestValues = JSON.stringify({
      "collection": "States",
      "database": "test",
      "dataSource": "Cluster0",
      "document": {
        "name": State
      }
    });

    this.appservice.addData(BestValues, this.bearertoken).subscribe((data) => {
      this.getAllStates();
      this._snackBar.open( State + " has been added to State", "OK", { duration: 3000 });
      this.getBestData()
      
    }
    );
  }

  SaveDistrict(State: string, District: string) {
    if(this.StatesearchText)
    {
      var BestValues = JSON.stringify({
        "collection": "Districts",
        "database": "test",
        "dataSource": "Cluster0",
        "document": {
          "name": District,
          "State": State
        }
      });
  
      this.appservice.addData(BestValues, this.bearertoken).subscribe((data) => {
        this.getDistricts();
        this._snackBar.open( District + " has been added to District", "OK", { duration: 3000 });
        this.getBestData()
      }
      );
    }
    else
    {
      this._snackBar.open("State is Required for Saving District", "OK", { duration: 3000 }); 
    }
   
  }

  SavePlace(State: string, District: string, Place: string) {
    if(this.StatesearchText && this.DistrictsearchText)
    {
      var BestValues = JSON.stringify({
        "collection": "Place",
        "database": "test",
        "dataSource": "Cluster0",
        "document": {
          "name": Place,
          "State": State,
          "District": District
        }
      });
  
      this.appservice.addData(BestValues, this.bearertoken).subscribe((data) => {
        this.getPlaces();
        this._snackBar.open( Place + " has been added to Place", "OK", { duration: 3000 });
        this.getBestData()
      }
      );
    }
    else
    {
      this._snackBar.open("State, District is Required for Saving Place", "OK", { duration: 3000 });
    }
    
  }

  SaveArea(State: string, District: string, Place: string, Area: string) {
    if(this.StatesearchText && this.DistrictsearchText && this.PlacesearchText)
    {
      var BestValues = JSON.stringify({
        "collection": "Area",
        "database": "test",
        "dataSource": "Cluster0",
        "document": {
          "name": Area,
          "State": State,
          "District": District,
          "Place": Place
  
        }
      });
  
      this.appservice.addData(BestValues, this.bearertoken).subscribe((data) => {
        this.getArea();
        this._snackBar.open( Area + " has been added to Area", "OK", { duration: 3000 });
        this.getBestData()
      }
      );
    }
    else
    {
      this._snackBar.open("State, District,Place is Required for Saving Area", "OK", { duration: 3000 });
    }
    
  }
  SaveType(State: string, District: string, Place: string, Area: string, Type: string) {
    if(this.StatesearchText && this.DistrictsearchText && this.PlacesearchText && this.AreasearchText)
    {
      var BestValues = JSON.stringify({
        "collection": "Type",
        "database": "test",
        "dataSource": "Cluster0",
        "document": {
          "name": Type,
          "State": State,
          "District": District,
          "Place": Place,
          "Area": Area
  
        }
      });
  
      this.appservice.addData(BestValues, this.bearertoken).subscribe((data) => {
        this.getType();
        this._snackBar.open( Type + " has been added to Category", "OK", { duration: 3000 });
        this.getBestData()
      }
      );
    }
    else
    {
      this._snackBar.open("State, District,Place,Area is Required for Saving Category", "OK", { duration: 3000 }); 
    }
    
  }
  getBestData(State?: string, District?: string, Place?: string, Area?: string, Type?: string) {
    this.StatesearchText= typeof this.StatesearchText ==='object'? this.StatesearchText.name : this.StatesearchText,
    this.DistrictsearchText= typeof this.DistrictsearchText ==='object'? this.DistrictsearchText.name : this.DistrictsearchText,
    this.PlacesearchText= typeof this.PlacesearchText ==='object'? this.PlacesearchText.name : this.PlacesearchText,
    this.AreasearchText= typeof this.AreasearchText ==='object'? this.AreasearchText.name : this.AreasearchText,
    this.TypesearchText= typeof this.TypesearchText ==='object'? this.TypesearchText.name : this.TypesearchText
    var data = JSON.stringify({
      "collection": "Best",
      "database": "test",
      "dataSource": "Cluster0",
      "sort": { "votes": -1 },
      "filter": {
        "State": this.StatesearchText.length > 0 ? this.StatesearchText : undefined,
        "District": this.DistrictsearchText.length > 0 ? this.DistrictsearchText : undefined,
        "Place": this.PlacesearchText.length > 0 ? this.PlacesearchText : undefined,
        "Area": this.AreasearchText.length > 0 ? this.AreasearchText : undefined,
        "Type": this.TypesearchText.length > 0 ? this.TypesearchText : undefined
      }
    });
    this.appservice.getBestData(this.bearertoken, data).subscribe(
      (data) => {
        
        this.BestData = data.documents;
        this.sortItems();
      }
    );
  }

  sortItems() {
    this.BestData.sort((a:any, b:any) => {
      if (a['votes'] > b['votes']) {
        return -1;
      }
      if (a['votes'] < b['votes']) {
        return 1;
      }
      return 0;
    });
  }
  getAllStates(bearertoken?: string) {
    var data = JSON.stringify({
      "collection": "States",
      "database": "test",
      "dataSource": "Cluster0"
    });
    this.appservice.getData(this.bearertoken, data).subscribe((data) => {
      this.States = data.documents;
    });
  }
  getDistricts(State?: string) {
    var data = JSON.stringify({
      "collection": "Districts",
      "database": "test",
      "dataSource": "Cluster0",
      "filter": {
        "State": this.StatesearchText.length > 0 ? this.StatesearchText : undefined
      }
    });
    this.appservice.getData(this.bearertoken, data).subscribe((data) => {
      this.Districts = data.documents;
    });
  }
  getPlaces(State?: string, District?: string) {
    var data = JSON.stringify({
      "collection": "Place",
      "database": "test",
      "dataSource": "Cluster0",
      "filter": {
        "State": this.StatesearchText.length > 0 ? this.StatesearchText : undefined,
        "District": this.DistrictsearchText.length > 0 ? this.DistrictsearchText : undefined
      }
    });
    this.appservice.getData(this.bearertoken, data).subscribe((data) => {
      this.Places = data.documents;
    });
  }
  getArea(State?: string, District?: string, Place?: string) {
    var data = JSON.stringify({
      "collection": "Area",
      "database": "test",
      "dataSource": "Cluster0",
      "filter": {
        "State": this.StatesearchText.length > 0 ? this.StatesearchText : undefined,
        "District": this.DistrictsearchText.length > 0 ? this.DistrictsearchText : undefined,
        "Place": this.PlacesearchText.length > 0 ? this.PlacesearchText : undefined,

      }
    });
    this.appservice.getData(this.bearertoken, data).subscribe((data) => {
      this.Area = data.documents;
    });
  }

  getType(State?: string, District?: string, Place?: string, Area?: string) {
    var data = JSON.stringify({
      "collection": "Type",
      "database": "test",
      "dataSource": "Cluster0",
      "filter": {
        "State": this.StatesearchText.length > 0 ? this.StatesearchText : undefined,
        "District": this.DistrictsearchText.length > 0 ? this.DistrictsearchText : undefined,
        "Place": this.PlacesearchText.length > 0 ? this.PlacesearchText : undefined,
        "Area": this.AreasearchText.length > 0 ? this.AreasearchText : undefined
      }
    });
    this.appservice.getData(this.bearertoken, data).subscribe((data) => {
      this.Types = data.documents;
    });
  }


  displayFn(user: State): string {
    return user && user.name ? user.name : '';
  }
  StateSelected(e: any) {
    let event = e;
    this.StatesearchText = event.name;
    this.getDistricts(this.StatesearchText);
    this.getPlaces(this.StatesearchText);
    this.getArea(this.StatesearchText);
    this.getType(this.StatesearchText);
    this.getBestData();
  }
  DistrictSelected(e: any) {
    let event = e;
    this.DistrictsearchText = event.name;
    this.getPlaces(this.StatesearchText, this.DistrictsearchText);
    this.getArea(this.StatesearchText, this.DistrictsearchText);
    this.getType(this.StatesearchText, this.DistrictsearchText);
    this.getBestData();
  }
  PlaceSelected(e: any) {
    let event = e;
    this.PlacesearchText = event.name;
    this.getArea(this.StatesearchText, this.DistrictsearchText, this.PlacesearchText);
    this.getType(this.StatesearchText, this.DistrictsearchText, this.PlacesearchText);
    this.getBestData();
  }
  AreaSelected(e: any) {
    let event = e;
    this.AreasearchText = event.name;
    this.getType(this.StatesearchText, this.DistrictsearchText, this.PlacesearchText, this.AreasearchText);
    this.getBestData();
  }
  TypeSelected(e: any) {
    let event = e;
    this.TypesearchText = event.name;
    this.getBestData();
  }
  valueAvailable(name: string, searchtext: any) {
    let Available;
    if (name === 'State') {
      Available = this.States.filter((it: { name: string; }) => {
        return it.name.toLowerCase().includes(searchtext.toLowerCase());
      });
      if (Available.length === 0) {
        this.StatesSave = true;
      }
      else {
        this.StatesSave = false;
      }
    }
    if (name === 'District') {
      Available = this.Districts.filter((it: { name: string; }) => {
        return it.name.toLowerCase().includes(searchtext.toLowerCase());
      });
      if (Available.length === 0) {
        this.DistrictsSave = true;
      }
      else {
        this.DistrictsSave = false;
      }
    }
    if (name === 'Place') {
      Available = this.Places.filter((it: { name: string; }) => {
        return it.name.toLowerCase().includes(searchtext.toLowerCase());
      });
      if (Available.length === 0) {
        this.PlacesSave = true;
      }
      else {
        this.PlacesSave = false;
      }
    }
    if (name === 'Area') {
      Available = this.Area.filter((it: { name: string; }) => {
        return it.name.toLowerCase().includes(searchtext.toLowerCase());
      });
      if (Available.length === 0) {
        this.AreaSave = true;
      }
      else {
        this.AreaSave = false;
      }

    }
    if (name === 'Type') {
      Available = this.Types.filter((it: { name: string; }) => {
        return it.name.toLowerCase().includes(searchtext.toLowerCase());
      });
      if (Available.length === 0) {
        this.TypesSave = true;
      }
      else {
        this.TypesSave = true;
      }

    }
    if (name === 'Best') {
      Available = this.BestData.filter((it: { name: string; }) => {
        return it.name.toLowerCase().includes(searchtext.toLowerCase());
      });
      if (Available.length === 0) {
        this.BestSave = true;
      }
      else {
        this.BestSave = false;
      }

    }
    if(searchtext==='')
    {
      this.getDistricts();
      this.getPlaces();
      this.getArea();
      this.getType();
      this.getBestData();
    }

  }
}
