import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { MatStepper } from "@angular/material/stepper";

import { GoogleAnalyticsService } from "ngx-google-analytics";
import { Subject } from "rxjs";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
})
export class DashboardComponent implements OnInit {
  constructor(
    private _gaService: GoogleAnalyticsService,
    private _httpClient: HttpClient
  ) {
    this._gaService.pageView("/dashboard", "Solar Prediction Dashboard");
  }

  ngOnInit() {}

  refreshChartData$: Subject<any> = new Subject();
  // home inputs
  houseNumber: string = "";
  streetName: string = "";
  streetType: string = "";
  city: string = "";
  state: string = "";
  zip: string = "";
  homeSquareFootage: number = 0;
  additionalFootage: number = 0;
  homeStories: number = 1;

  // panel inputs
  wattage: number = 275;
  deratingFactor: number = 0.85;
  panelLength: number = 65;
  panelWidth: number = 39;
  numberOfPanels: number = 1;

  // chart data
  multi: any[];
  view: any[] = [700, 300];

  // options
  legend: boolean = true;
  showLabels: boolean = true;
  animations: boolean = true;
  xAxis: boolean = true;
  yAxis: boolean = true;
  showYAxisLabel: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = "Date";
  yAxisLabel: string = "GHI";
  timeline: boolean = true;

  nsrbResponse: any = {};

  colorScheme = {
    domain: ["#5AA454", "#E44D25", "#CFC0BB", "#7aa3e5", "#a8385d", "#aae3f5"],
  };

  chartData = [
    {
      name: "GHI Prediction",
      series: [],
    },
  ];

  getInputs(whichInputs?: Array<string>): object {
    const response = {};

    if (!whichInputs) whichInputs = ["home_inputs", "panel_inputs"];
    whichInputs.forEach((inputType) => {
      let inputContainer = document.querySelector(
        'div[id="' + inputType + '"]'
      );
      let inputs = inputContainer.querySelectorAll("input");
      inputs.forEach((input) => {
        Object.assign(response, {
          [input.id]: input.value !== "" ? input.value : "",
        });
      });
    });
    return response;
  }

  testCall() {
    this._httpClient.get("http://localhost:5000/greetings").subscribe((res) => {
      console.log(res);
    });
  }

  getInputsTheNgWay() {
    const response = {
      houseNumber: this.houseNumber.toUpperCase(),
      streetName: this.streetName.toUpperCase(),
      streetType: this.streetType.toUpperCase(),
      city: this.city.toUpperCase(),
      state: this.state.toUpperCase(),
      zip: this.zip,
      additionalFootage: this.additionalFootage,
      homeSquareFootage: this.homeSquareFootage,
      homeStories: this.homeStories,
      wattage: this.wattage,
      deratingFactor: this.deratingFactor,
      panelLength: this.panelLength,
      panelWidth: this.panelWidth,
      numberOfPanels: this.numberOfPanels,
    };

    return response;
  }

  getForecastingData(inputInfo: object): object {
    return {
      "2021-04-15 0000Z": 0,
      "2021-04-15 0100Z": 0,
      "2021-04-15 0200Z": 0,
      "2021-04-15 0300Z": 100,
      "2021-04-15 0400Z": 200,
      "2021-04-15 0500Z": 300,
      "2021-04-15 0600Z": 400,
      "2021-04-15 0700Z": 500,
      "2021-04-15 0800Z": 600,
      "2021-04-15 0900Z": 700,
      "2021-04-15 1000Z": 800,
      "2021-04-15 1100Z": 800,
      "2021-04-15 1200Z": 700,
      "2021-04-15 1300Z": 600,
      "2021-04-15 1400Z": 500,
      "2021-04-15 1500Z": 400,
      "2021-04-15 1600Z": 300,
      "2021-04-15 1700Z": 200,
      "2021-04-15 1800Z": 100,
      "2021-04-15 1900Z": 0,
      "2021-04-15 2000Z": 0,
      "2021-04-15 2100Z": 0,
      "2021-04-15 2200Z": 0,
      "2021-04-15 2300Z": 0,
    };
  }

  populateFinances(totalOutput: number, forecastOutput: object) {
    const costPerKWH = 0.11;
    const saved = (costPerKWH * totalOutput).toFixed(2);
    document.getElementById("savings").innerHTML = saved;
    document.getElementById("output").innerHTML = totalOutput.toFixed(2);
  }

  setCharts(data: object) {
    return;
  }

  doMath(): void {
    // Get the user's address and panel information
    const inputInfo = this.getInputs();
    // Pass the input info to the API which will send back forecasting data
    const forecastData = this.getForecastingData(inputInfo);

    // Grab and convert the panel data
    let rating = parseInt(inputInfo["wattage"]); // in Watts
    let ratingKw = parseFloat(rating.toFixed(2)) / 1000; // In kW
    let derate = parseFloat(inputInfo["derating_factor"]); // A float
    let panel_y = parseInt(inputInfo["panel_length"]) / 39.37; // in meters
    let panel_x = parseInt(inputInfo["panel_width"]) / 39.37; // in meters
    let panel_area = panel_y * panel_x; // in square meters

    // Grab the square footage to be used for paneling
    let usableSquareFootage =
      parseInt(inputInfo["home_square_footage"]) /
        parseInt(inputInfo["stories"]) +
      parseInt(inputInfo["additional_square_footage"]);
    let usableSquareMeters = usableSquareFootage / 10.764; // In meters

    // Set starting values
    let totalOutput = 0;

    // Get ready to build the forecast output object
    let forecastOutput = forecastData;

    for (const [key, value] of Object.entries(forecastData)) {
      let ghiValKw = parseFloat(value.toFixed(2)) / 1000;
      let output = ratingKw * derate * (ghiValKw / 1.0);
      forecastOutput[key] = output;
      totalOutput += output;
    }

    // totalOutput *= inputInfo.number_of_panels
    this.populateFinances(totalOutput, forecastOutput);

    // Need some integral calculation here
    // Basically - each value of GHI is good for the following 60 minutes
    // And generates that 30 minutes of power in kWh
    this.setCharts(forecastData);
  }

  getNsrbData(stepper: MatStepper) {
    // y flask debug not secured???? >:(
    const formData = this.getInputsTheNgWay();
    const apiUri = "http://localhost:8000/getNSRDBData";

    console.log(
      "[DashboardComponent.getnsrbData()] formData to be sent",
      formData
    );

    const getNsrbData$ = this._httpClient.post(apiUri, formData);

    getNsrbData$.subscribe((response) => {
      console.log(
        "[DashboardComponent.getNsrbData()] response received",
        response
      );

      const predictionData = {
        name: "GHI Prediction",
        series: [],
      };

      console.log(
        '[DashboardComponent.getNsrbData()] Object.keys(response["ds"])',
        Object.keys(response["ds"])
      );

      predictionData.series = Object.keys(response["ds"]).map((key) => {
        return { name: response["ds"][key], value: response["yhat"][key] };
      });

      console.log(
        "[DashboardComponent.getNsrbData()] predictionData",
        predictionData
      );

      this.chartData[0].series.length = 0;
      this.chartData[0].series.push(...predictionData.series);

      stepper.next();
    });
  }

  onSelect(data): void {
    console.log("Item clicked", JSON.parse(JSON.stringify(data)));
  }

  onActivate(data): void {
    console.log("Activate", JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data): void {
    console.log("Deactivate", JSON.parse(JSON.stringify(data)));
  }
}
