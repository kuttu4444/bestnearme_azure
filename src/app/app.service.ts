import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  constructor(private http: HttpClient) { }
  rootURL = '/api';
  public getIPAddress(): Observable<any> {
    return this.http.get("http://api.ipify.org/?format=json");
  }
  getBearerToken(): Observable<any> {
    var data = JSON.stringify({
      "collection": "States",
      "database": "test",
      "dataSource": "Cluster0",
      "filter": {
        "name": "Telangana"
      }
    });
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const body = data;
    let bearertoken: any;
    return this.http.post('https://realm.mongodb.com/api/client/v2.0/app/data-eiujg/auth/providers/anon-user/login', body, { headers });
  }

  getData(bearertoken: string, data: string): Observable<any> {

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': bearertoken,
    });
    const body = data;
    return this.http.post('https://data.mongodb-api.com/app/data-eiujg/endpoint/data/v1/action/find', body, { headers });
  }



  updateBestData(data: string, BearerToken: string): Observable<any> {
    const body = data;
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': BearerToken,
    });

    return this.http.post('https://data.mongodb-api.com/app/data-eiujg/endpoint/data/v1/action/updateOne', body, { headers })
  }
  getBestData(bearertoken: string, data: string): Observable<any> {

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': bearertoken,
    });
    const body = data;
    return this.http.post('https://data.mongodb-api.com/app/data-eiujg/endpoint/data/v1/action/find', body, { headers });
  }


  addData(data: string, BearerToken: string): Observable<any> {

    const body = data;
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': BearerToken,
    });

    return this.http.post('https://ap-south-1.aws.data.mongodb-api.com/app/data-eiujg/endpoint/data/v1/action/insertOne', body, { headers });


  }

  getLocation(Longitude: number, Latitude: number): Observable<any> {
let url='https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?f=json&featureTypes=&location=';
url=url+Longitude+'%2C'+Latitude;
    return this.http.get(url);
     }

}