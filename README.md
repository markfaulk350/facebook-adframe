<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://adframe.io">
    <img src="docs/images/logo.png" alt="Avatar" width="150">
  </a>

  <h3 align="center">
    <a href="#"><strong>Adframe.io</strong></a>
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


## Getting Started
* Check out the [Getting Started Guide inside Facebook's API Docs](https://developers.facebook.com/docs/business-sdk/getting-started#js)


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

