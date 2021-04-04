import { Component, OnInit } from "@angular/core";
import * as Chartist from "chartist";
import { GoogleAnalyticsService } from "ngx-google-analytics";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
})
export class DashboardComponent implements OnInit {
  constructor(private _gaService: GoogleAnalyticsService) {
    this._gaService.pageView("/dashboard", "Solar Predict Dashboard");
  }
  getInputs(whichInputs?: Array<string>): object {
    const response = {}
    if (!whichInputs) whichInputs = ['home_inputs','panel_inputs'];
    whichInputs.forEach(inputType => {
      let inputContainer = document.querySelector('div[id="' + inputType + '"]');
      let inputs = inputContainer.querySelectorAll('input');
      inputs.forEach(input => {
        Object.assign(response, {[input.id]: (input.value !== "") ? input.value : ""});
      })
    })
    return response
  }

  getForecastingData(inputInfo: object): object {
    return { 
      '2021-04-15 0000Z' : 0,
      '2021-04-15 0100Z' : 0,
      '2021-04-15 0200Z' : 0,
      '2021-04-15 0300Z' : 100,
      '2021-04-15 0400Z' : 200,
      '2021-04-15 0500Z' : 300,
      '2021-04-15 0600Z' : 400,
      '2021-04-15 0700Z' : 500,
      '2021-04-15 0800Z' : 600,
      '2021-04-15 0900Z' : 700,
      '2021-04-15 1000Z' : 800,
      '2021-04-15 1100Z' : 800,
      '2021-04-15 1200Z' : 700,
      '2021-04-15 1300Z' : 600,
      '2021-04-15 1400Z' : 500,
      '2021-04-15 1500Z' : 400,
      '2021-04-15 1600Z' : 300,
      '2021-04-15 1700Z' : 200,
      '2021-04-15 1800Z' : 100,
      '2021-04-15 1900Z' : 0,
      '2021-04-15 2000Z' : 0,
      '2021-04-15 2100Z' : 0,
      '2021-04-15 2200Z' : 0,
      '2021-04-15 2300Z' : 0,
    }
  }

  doMath(): void {
    const inputInfo = this.getInputs();
    console.log(inputInfo);
    const forecastData = this.getForecastingData(inputInfo);
    console.log(forecastData);
    let rating = parseInt(inputInfo['wattage']) // in Watts
    let ratingKw = (parseFloat(rating.toFixed(2)) / 1000) // In kW
    let derate = parseFloat(inputInfo['derating_factor'])
    let daySum = 0;
    for (const [key, value] of Object.entries(forecastData)) {
      // console.log(`${key}: ${value}`);
      let ghiVal = value; // in Watts/m2
      let ghiValKw = (parseFloat(ghiVal.toFixed(2)) / 1000) // In kW/m2
      let val = (ratingKw * derate) * (ghiValKw / 1.00) // 1.00 is in kW/m2
      daySum += val;
    }
    console.log(daySum + " kWh of energy on April 15th")
    
    // Need some integral calculation here
    // Basically - each value of GHI is good for the following 60 minutes
    // And generates that 30 minutes of power in kWh

  }
  // startAnimationForLineChart(chart) {
  //   let seq: any, delays: any, durations: any;
  //   seq = 0;
  //   delays = 80;
  //   durations = 500;

  //   chart.on("draw", function (data) {
  //     if (data.type === "line" || data.type === "area") {
  //       data.element.animate({
  //         d: {
  //           begin: 600,
  //           dur: 700,
  //           from: data.path
  //             .clone()
  //             .scale(1, 0)
  //             .translate(0, data.chartRect.height())
  //             .stringify(),
  //           to: data.path.clone().stringify(),
  //           easing: Chartist.Svg.Easing.easeOutQuint,
  //         },
  //       });
  //     } else if (data.type === "point") {
  //       seq++;
  //       data.element.animate({
  //         opacity: {
  //           begin: seq * delays,
  //           dur: durations,
  //           from: 0,
  //           to: 1,
  //           easing: "ease",
  //         },
  //       });
  //     }
  //   });

  //   seq = 0;
  // }
  // startAnimationForBarChart(chart) {
  //   let seq2: any, delays2: any, durations2: any;

  //   seq2 = 0;
  //   delays2 = 80;
  //   durations2 = 500;
  //   chart.on("draw", function (data) {
  //     if (data.type === "bar") {
  //       seq2++;
  //       data.element.animate({
  //         opacity: {
  //           begin: seq2 * delays2,
  //           dur: durations2,
  //           from: 0,
  //           to: 1,
  //           easing: "ease",
  //         },
  //       });
  //     }
  //   });

  //   seq2 = 0;
  // }
  ngOnInit() {
    /* ----------==========     Daily Sales Chart initialization For Documentation    ==========---------- */

    // const dataDailySalesChart: any = {
    //   labels: ["M", "T", "W", "T", "F", "S", "S"],
    //   series: [[12, 17, 7, 17, 23, 18, 38]],
    // };

    // const optionsDailySalesChart: any = {
    //   lineSmooth: Chartist.Interpolation.cardinal({
    //     tension: 0,
    //   }),
    //   low: 0,
    //   high: 50, // creative tim: we recommend you to set the high sa the biggest value + something for a better look
    //   chartPadding: { top: 0, right: 0, bottom: 0, left: 0 },
    // };

    // var dailySalesChart = new Chartist.Line(
    //   "#dailySalesChart",
    //   dataDailySalesChart,
    //   optionsDailySalesChart
    // );

    // this.startAnimationForLineChart(dailySalesChart);

    /* ----------==========     Completed Tasks Chart initialization    ==========---------- */

    // const dataCompletedTasksChart: any = {
    //   labels: ["12p", "3p", "6p", "9p", "12p", "3a", "6a", "9a"],
    //   series: [[230, 750, 450, 300, 280, 240, 200, 190]],
    // };

    // const optionsCompletedTasksChart: any = {
    //   lineSmooth: Chartist.Interpolation.cardinal({
    //     tension: 0,
    //   }),
    //   low: 0,
    //   high: 1000, // creative tim: we recommend you to set the high sa the biggest value + something for a better look
    //   chartPadding: { top: 0, right: 0, bottom: 0, left: 0 },
    // };

    // var completedTasksChart = new Chartist.Line(
    //   "#completedTasksChart",
    //   dataCompletedTasksChart,
    //   optionsCompletedTasksChart
    // );

    // start animation for the Completed Tasks Chart - Line Chart
    // this.startAnimationForLineChart(completedTasksChart);

    /* ----------==========     Emails Subscription Chart initialization    ==========---------- */

    // var datawebsiteViewsChart = {
    //   labels: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
    //   series: [[542, 443, 320, 780, 553, 453, 326, 434, 568, 610, 756, 895]],
    // };
    // var optionswebsiteViewsChart = {
    //   axisX: {
    //     showGrid: false,
    //   },
    //   low: 0,
    //   high: 1000,
    //   chartPadding: { top: 0, right: 5, bottom: 0, left: 0 },
    // };
    // var responsiveOptions: any[] = [
    //   [
    //     "screen and (max-width: 640px)",
    //     {
    //       seriesBarDistance: 5,
    //       axisX: {
    //         labelInterpolationFnc: function (value) {
    //           return value[0];
    //         },
    //       },
    //     },
    //   ],
    // ];
    // var websiteViewsChart = new Chartist.Bar(
    //   "#websiteViewsChart",
    //   datawebsiteViewsChart,
    //   optionswebsiteViewsChart,
    //   responsiveOptions
    // );

    // //start animation for the Emails Subscription Chart
    // this.startAnimationForBarChart(websiteViewsChart);
  }
}
