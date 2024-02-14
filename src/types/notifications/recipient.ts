// Type: Recipient
import { MeXp } from '../orderCloud/xp';

export type Recipient = {
  ID?: string,
  CompanyID?: string,
  Username?: string,
  Password?: string,
  FirstName?: string,
  LastName?: string,
  Email?: string,
  Phone?: string,
  TermsAccepted?: string,
  Active: boolean,
  xp: MeXp,
  AvailableRoles?: Array<string>,
  Locale?: string,
  DateCreated: Date,
  PasswordLastSetDate: Date
}