import { Routes } from '@angular/router';
import { HelpSiteComponent } from './help-site/help-site.component';
import { AppComponent } from './app.component';
import { SummaryComponent } from './main-content/summary/summary.component';
import { AddTaskComponent } from './main-content/add-task/add-task.component';
import { BoardComponent } from './main-content/board/board.component';
import { ContactsComponent } from './main-content/contacts/contacts.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { LegalNoticeComponent } from './legal-notice/legal-notice.component';

export const routes: Routes = [
    {path: "", component: SummaryComponent},
    {path: "summary", component: SummaryComponent},
    {path: "add_task", component: AddTaskComponent},
    {path: "board", component: BoardComponent},
    {path: "contacts", component: ContactsComponent},
    {path: "help", component: HelpSiteComponent},
    {path: "privacy-policy", component: PrivacyPolicyComponent},
    {path: "legal-notice", component: LegalNoticeComponent},
];
