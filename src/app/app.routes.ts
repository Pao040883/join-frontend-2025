import { Routes } from '@angular/router';
import { MainContentComponent } from './main-content/main-content.component';
import { HelpSiteComponent } from './help-site/help-site.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { LegalNoticeComponent } from './legal-notice/legal-notice.component';
import { LoginComponent } from './login/login.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { SummaryComponent } from './main-content/summary/summary.component';
import { AddTaskComponent } from './main-content/add-task/add-task.component';
import { BoardComponent } from './main-content/board/board.component';
import { ContactsComponent } from './main-content/contacts/contacts.component';
import { authGuard } from '../shared/auth.guard';

export const routes: Routes = [
  // Login & Signup OHNE MainContent
  { path: 'login', component: LoginComponent },
  { path: 'sign-up', component: SignUpComponent },

  // Alle anderen Routen MIT MainContent
  {
    path: '',
    component: MainContentComponent,
    children: [
      { path: '', redirectTo: 'summary', pathMatch: 'full' },
      { path: 'summary', component: SummaryComponent, canActivate: [authGuard] },
      { path: 'add_task', component: AddTaskComponent, canActivate: [authGuard] },
      { path: 'board', component: BoardComponent, canActivate: [authGuard] },
      { path: 'contacts', component: ContactsComponent, canActivate: [authGuard] },
      { path: 'help', component: HelpSiteComponent, canActivate: [authGuard] },
      { path: 'privacy-policy', component: PrivacyPolicyComponent },
      { path: 'legal-notice', component: LegalNoticeComponent },
    ],
  },

  // Fallback für nicht existierende Routen
  { path: '**', redirectTo: 'summary' },
];
