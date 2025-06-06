import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
    encapsulation: ViewEncapsulation.Emulated,  // make sure it's not None

})
export class AppComponent {
  title = 'client';
}
