import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { RegisterDetailsComponent } from './register-details/register-details.component';
import { NavBarComponent } from './navbar/navbar.component';
import { ContactComponent } from './contact/contact.component';
import { AboutComponent } from './about/about.component';
import { LoginComponent } from './login/login.component';
import { HomepageComponent } from './homepage/HomepageComponent';
import { LandingComponent } from './landing/landing.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { AuthService } from './services/auth-service';
import { ReactiveFormsModule } from '@angular/forms';
import { ProfileComponent } from './profile/profile.component';
import { SettingsComponent } from './settings/settings.component';
import { AuthGuard } from './services/authguard-service';
import { MessageComponent } from './message/message.component';

const routes: Routes = [
  { path: '', redirectTo: '/landingPage', pathMatch: 'full'},
  { path: 'landingPage', component: LandingComponent },
  { path: 'aboutPage', component: AboutComponent },
  { path: 'contactPage', component: ContactComponent },
  { path: 'registerPage', component: RegisterDetailsComponent },
  { path: 'loginPage', component: LoginComponent },
  { path: 'homePage', component: HomepageComponent },
  { path: 'profilePage', component: ProfileComponent, canActivate: [AuthGuard]  },
  { path: 'settingsPage', component: SettingsComponent },
  { path: 'messagePage', component: MessageComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    RegisterDetailsComponent,
    NavBarComponent,
    ContactComponent,
    LoginComponent,
    HomepageComponent,
    LandingComponent,
    AboutComponent,
    ProfileComponent,
    SettingsComponent,
    MessageComponent
   ],

  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    CommonModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    BsDropdownModule.forRoot(),
    RouterModule.forRoot(routes),
    ReactiveFormsModule

  ],
  providers: [
    AuthService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
