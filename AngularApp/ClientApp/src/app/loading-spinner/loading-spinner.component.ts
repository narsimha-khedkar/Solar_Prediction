import { Component, OnInit } from "@angular/core";
import { LoaderService } from "../services/loader.service";

@Component({
  selector: "app-loading-spinner",
  templateUrl: "./loading-spinner.component.html",
  styleUrls: ["./loading-spinner.component.css"],
})
export class LoadingSpinnerComponent implements OnInit {
  loading: boolean;

  constructor(private loaderService: LoaderService) {
    this.loaderService.isLoading.subscribe((v) => {
      this.loading = v;
    });
  }
  ngOnInit(): void {}
}
