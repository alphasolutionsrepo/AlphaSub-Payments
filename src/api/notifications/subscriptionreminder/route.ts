import { getHtmlFromCampaign } from "@lib/sitecoresend/sitecoresend";
import { NextRequest, NextResponse } from "next/server";
import { SubscriptionNotification } from "types/notifications/subscriptionNotification";

// This is being called if set up in OrderCloud to get Subscription Notifications.
export async function POST(request: NextRequest) {
    try {
        const notificationRequest: SubscriptionNotification = await request.json();
        console.log("notificationRequest: UTC:" + new Date().toISOString() + " | Local:" + new Date().toLocaleString());
        // ToDo: add check to see if this is a valid request. 
        await SendNotificationEmail(notificationRequest);
        return NextResponse.json({ HttpStatusCode: 200, UnhandledErrorBody: "" }, { status: 200 });
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({}, { status: 500 });
    }
}

// Send a notification to the user that a subscription order is about to be created.
// This is purely an example. You would need to implement your own logic here.
// This is using Sitcore Send/Moosend that unfortunately doesn't handle transactional emails - yet - should be available in the future.
// So we have to perform the "mail merge" ourselves - putting the dynamic data into the template.
// This example pull down the HTML from the campaign, and then replaces the dynamic content with the actual data.
// This means that you can still use use editor in Sitecore Send/Moosend to build you templates. 
async function SendNotificationEmail(notificationRequest: SubscriptionNotification) {
    console.log("SubscriptionReminder.SendEmail. Email:", notificationRequest.Recipient.Email, " | SubscriptionID:", notificationRequest.EventBody.Subscription.ID, " | NextOrderDate:", notificationRequest.EventBody.Subscription.NextOrderDate);
    var templateHTML = await getHtmlFromCampaign(process.env.NEXT_PUBLIC_API_SEND_REMINDER_CAMPAIGNID);
    // Constants for the dynamic content. Could be set in .env or somewhere else. 
    const startTokenReatedContent = "#Products:Recent_Cart:3#";
    const endTokenReatedContent = "#Products:Recent_Cart:end#";
    const imageHostAndPrefix = "https://alphasolutions-cdn.azureedge.net/rsmwordercloud/images/thumbnails/"
    const urlHostAndPrefix = "https://demoshop.alpha-solutions.com/p/"

    // Extract dynamic content
    var startIndex = templateHTML.indexOf(startTokenReatedContent);
    var endIndex = templateHTML.indexOf(endTokenReatedContent);
    var dynamicContentTemplate = templateHTML.substring(startIndex, endIndex + endTokenReatedContent.length);

    var dynamicContent = "";
    notificationRequest.EventBody.LineItems.forEach((lineItem) => {
        var newDynamicContent = new String(dynamicContentTemplate);
        newDynamicContent = newDynamicContent.replace("#product:title#", lineItem.Product.Name);
        newDynamicContent = newDynamicContent.replace("#product:description#", lineItem.Product.Description);
        newDynamicContent = newDynamicContent.replace("#product:productid#", lineItem.ProductID);
        newDynamicContent = newDynamicContent.replace("#product:image#", `${imageHostAndPrefix}${lineItem.Product.xp.productimages[0]}`);
        newDynamicContent = newDynamicContent.replace("#product:price#", lineItem.UnitPrice.toString());
        newDynamicContent = newDynamicContent.replace("#product:quantity#", lineItem.Quantity.toString());
        newDynamicContent = newDynamicContent.replace("#product:linetotal#", lineItem.LineTotal.toString());
        newDynamicContent = newDynamicContent.replace("#product:category#", lineItem.Product.xp.Category);
        newDynamicContent = newDynamicContent.replace("#product:url#", `${urlHostAndPrefix}${lineItem.ProductID}`);
        dynamicContent = dynamicContent + newDynamicContent;
    });

    // Replace the dynamic content in the template
    templateHTML = templateHTML.replace(dynamicContentTemplate, dynamicContent).replace(startTokenReatedContent, "").replace(endTokenReatedContent, "");
    console.log("SubscriptionReminder.SendEmail. Sending email... to:", notificationRequest.Recipient.Email);
    await sendEmail("demoshop@alpha-solutions.us", notificationRequest.Recipient.Email, "Subscription Reminder", templateHTML);
}

async function sendEmail(from: string, to: string, subject: string, html: string) {
    const nodemailer = require('nodemailer');

    const transporter = nodemailer.createTransport({
        host: `${process.env.STMP_HOST}`,
        port: process.env.STMP_PORT,
        secure: process.env.STMP_SECURE === "true" ? true : false,
        auth: {
            user: `${process.env.STMP_USER}`,
            pass: `${process.env.STMP_PASSWORD}`
        }
    });

    const mailOptions = {
        from: `${from}`,
        to: `${to}`,
        subject: `${subject}`,
        html: `${html}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
        } else {
            console.log(`Email sent: ${info.response}`);
        }
    });
}