import { LineItem, Product } from "ordercloud-javascript-sdk"
import { Subscription } from "ordercloud-javascript-sdk/dist/models/Subscription"

export type SubscriptionEventBody = {
  Subscription: Subscription,
  UnavailableProductIDs: Array<string>,
  UnavailableBundleIDs: Array<string>,
  LineItems: Array<LineItem>,
  Products: Array<Product>
}