import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { MatStepper } from "@angular/material/stepper";
import { ChartType } from "angular-google-charts";

import { GoogleAnalyticsService } from "ngx-google-analytics";
import { ELECTRICITY_DATA } from "./electricity-data";

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

  // home inputs
  houseNumber: string = "";
  streetName: string = "";
  streetType: string = "";
  city: string = "";
  state: string = "";
  zip: string = "";

  // panel inputs
  wattage: number = 275;
  deratingFactor: number = 0.85;
  panelLength: number = 65;
  panelWidth: number = 39;
  numberOfPanels: number = 1;

  firstDate = "";
  lastDate = "";

  // chart data
  chartType = ChartType.LineChart;
  chartData = [];

  ogChartType = ChartType.LineChart;
  ogChartData = [];

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

  populateFinances(state, totalOutput: number) {
    const averages = ELECTRICITY_DATA;

    const stateElectricityData = averages.filter(
      (avg) => avg.State.toUpperCase() === state.toUpperCase()
    )[0];

    const costPerKWH = stateElectricityData.Price / 100;
    const saved = (costPerKWH * totalOutput).toFixed(2);
    document.getElementById("savings").innerHTML = saved;
    document.getElementById("output").innerHTML = totalOutput.toFixed(2);
  }

  setCharts(data: any) {
    this.chartData = Object.values(data).map((value: any) => {
      return [value.name, value.value];
    });
    console.log("predicted data", this.chartData);
  }

  doMath(forecastData): void {
    // Get the user's address and panel information
    // const inputInfo = this.getInputs();
    const inputInfo = this.getInputsTheNgWay();
    // Pass the input info to the API which will send back forecasting data
    // const forecastData = this.getForecastingData(inputInfo);

    // Grab and convert the panel data
    let rating = inputInfo.wattage; // in Watts
    let ratingKw = parseFloat(rating.toFixed(2)) / 1000; // In kW
    let derate = inputInfo.deratingFactor; // A float
    let panel_y = inputInfo.panelLength / 39.37; // in meters
    let panel_x = inputInfo.panelWidth / 39.37; // in meters
    let panel_area = panel_y * panel_x; // in square meters

    // Set starting values
    let totalOutput = 0;

    // Get ready to build the forecast output object
    let forecastOutput = forecastData;

    // for (const [key, value] of Object.entries(forecastData)) {
    for (let i = 0; i < forecastData.length; i++) {
      let ghiValKw = forecastData[i].value / 1000;
      let output = ratingKw * derate * (ghiValKw / 1.0);
      forecastOutput[i].value = output;
      totalOutput += output;
    }

    this.firstDate = forecastData[0].name;
    this.lastDate = forecastData[forecastData.length - 1].name;
    totalOutput *= panel_area;
    totalOutput *= inputInfo.numberOfPanels;
    this.populateFinances(inputInfo.state, totalOutput);

    // Need some integral calculation here
    // Basically - each value of GHI is good for the following 60 minutes
    // And generates that 30 minutes of power in kWh
    this.setCharts(forecastOutput);
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
      const predictionData = Object.keys(response["ds"]).map((key) => {
        return { name: response["ds"][key], value: response["yhat"][key] };
      });

      this.ogChartData = Object.values(predictionData).map((value: any) => {
        return [value.name, value.value];
      });

      this.doMath(predictionData);

      console.log(
        "[DashboardComponent.getNsrbData()] predictionData",
        predictionData
      );

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
