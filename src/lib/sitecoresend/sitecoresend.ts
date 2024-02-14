export async function getHtmlFromCampaign(campaignId: string) {
    try {
        var serviceUrl = `${process.env.NEXT_PUBLIC_API_SEND_URLBASE}/campaigns/${campaignId}/view.json?apikey=${process.env.NEXT_PUBLIC_API_SEND_KEY}`;
        const result = await fetch(serviceUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        }).then((response) => response.json()).then((data) => { return data.Context.HTMLContent; })

        return result;
    } catch (error) {
        console.error(`Error fetching HTML: ${error}`);
        return null; // Or throw another error as needed
    }

    return null;
}

