<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://adframe.io">
    <img src="docs/images/logo.png" width="150">
  </a>

  <h3 align="center">
    <a href="https://adframe.io"><strong>Adframe.io</strong></a>
  </h3>

  <p align="center">
    The smarter way to build ad accounts.
    <br />
    <a href="#"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="#">View Demo</a>
    ·
    <a href="#">Report Bug</a>
    ·
    <a href="#">Request Feature</a>
  </p>
</p>

<!-- TABLE OF CONTENTS -->
# Table of Contents

* [Important Links](#important-links)
* [Getting Started](#getting-started)
* [Ryans Instructions](#ryans-instructions)


## Important Links
* [Facebook Marketing API](https://developers.facebook.com/docs/marketing-apis/overview)
* [Facebook Business SDK for NodeJS](https://www.npmjs.com/package/facebook-nodejs-business-sdk)
* [Ad Campaign Structure](https://developers.facebook.com/docs/marketing-api/campaign-structure)
* [Google Sheet with Facebook Ads](https://docs.google.com/spreadsheets/d/1KVPB4aYLS-q3DzjFjJ56XoDcYhCk6zRUcXJqKpSI9iA/edit#gid=0)
* [Youtube Video on FB Marketing API](https://www.youtube.com/watch?v=to4uTxSNo6Q)
* [FB Nodejs SDK Github](https://github.com/facebook/facebook-nodejs-business-sdk)
* [FB Interests Targeting](https://developers.facebook.com/docs/marketing-api/audiences/reference/targeting-search#interests)
* [Generate FB interest ID's - Medium Article](https://medium.com/@interestexplorerio/how-to-use-the-facebook-marketing-api-to-reveal-1000s-of-interests-that-are-hidden-in-the-facebook-e20ee5bdcd17)

## Getting Started
* Check out the [Getting Started Guide inside Facebook's API Docs](https://developers.facebook.com/docs/business-sdk/getting-started#js)

* Go to [Facebook for developers](https://developers.facebook.com/) and create a developer account
* Create an app. Select "Manage Business Integrations"
* Copy the `App ID` from the Dashboard "274942674190815"
* Copy the `App Secret` from "Settings", "Basic". "6b59817eabfd5db8d808a9f7c39e6a4c"
* Visit the App Dashboard and add the "Marketing API" product to your app.
* You can get an access token by going to the FB App Dashboard. On the left hand side-nav you should see the "Marketing API" product. Click on it, then click on "Tools", you should be able to generate an access token there.
* From the Dashboard, click on "Tools" at the top right. Then you should see "Access Token Tool". Copy the `App Token` into env.
* You can also get an access token from the Dashboard "Tools", "Graph API Explorer"


## Ryans Instructions
I need to build something for Facebook, basically a list of interests, and geolocations... need a prototype for Paul.

Means of input: A list of interests on Facebook

```txt
{Columns}
{ID} {Name}
{Location ID} {Location Name}
```

### Output
1. Create a campaign in the special ads category - Housing named '[C] Real Estate Broker' with a $10 a day budget with 'Campaign Budget Optimization' enabled.


2. Within the newly created campaign: Create two Ad Set's, one named '[AG] Real Estate Broker', set Detailed Targeting to 'Real Estate Broker', the other '[AG] Real estate' with detailed targeting set to 'Real estate' - note the detailed targeting is simply an interest.


3. On the newly created Ad Set's Locations, set targeting to Arizona, California, Colorado, Connecticut, Florida, Georgia, Idaho, Illinois, Maryland, Michigan, New Jersey, North Carolina, Oregon, Pennsylvania, Tennessee, Texas, Utah, Virginia, Washington, Washington, District of Columbia

# Get Interest ID's
```txt
https://graph.facebook.com/search?type=adinterestsuggestion&interest_list=[“Golf”]&limit=10&locale=en_US&access_token=your-access-token
```

# Object fields we are interested in
### Campaign
Fields in the UI
* Campaign Name - ([C] name)
* Special Ads Categories - (Housing)
* Campaign Details
  * Buying Type (Auction)
  * Campiagn Objective - (Conversions)
  * Campaign Spending Limit - optional
* A/B Test - Not used
* Campaign Budget Optimization - (On)
  * Campaign Budget - (Daily)
  * Amount ($10.00)
  * Campaign Bid Strategy - (Lowest cost)

```json 
{
  "name": "[C] Created Campaign",
  "status": "PAUSED",
  "objective": "CONVERSIONS",
  "daily_budget": "1000",
  "special_ad_categories": [ "HOUSING" ],
  "special_ad_category": "HOUSING",
  "bid_strategy": "LOWEST_COST_WITHOUT_CAP",
  "id": "23847919864390119"
}
```

### Ad Set
Fields in the UI
* Ad Set Name - ([AG] name)
* Conversion
  * Conversions event location - (Website, App, Messenger, WhatsApp)
  * Pixel - (ID?)
  * Conversion Event - (Lead, or lots of others)
* Dynamic Creative - (off, we arent using it)
* Budget & Schedule
  * Start date/time
  * end date/time
* Audience - can create new audience or use saved one
  * Exclusions
  * Locations
  * Age
  * Gender
  * Detailed Targeting
    * Interests - (will be same as Ad Set Name)
    * Detailed Targeting Expansion - (Off)
  * Languages - (all)
* Placements - (auto)
* Optimization & Delivery - (conversions)