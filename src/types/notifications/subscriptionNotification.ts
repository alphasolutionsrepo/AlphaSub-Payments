import { ConfigData } from "../../types/notifications/configData";
import { Recipient } from "../../types/notifications/recipient";
import { SubscriptionEventBody } from "./subscriptionEventBody";

export type SubscriptionNotification = {
    OcLogIdHeader?: string,
    Environment: string,
    BuyerID?: string,
    UserToken?: string,
    Recipient: Recipient,
    MessageType: string,
    CCList: Array<string>,
    EventBody: SubscriptionEventBody
    ConfigData: ConfigData
}