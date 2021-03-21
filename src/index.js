// 3rd Party Imports
require('dotenv').config()
const chalk = require('chalk')
const bizSdk = require('facebook-nodejs-business-sdk')

// Local Imports
const helpers = require('./helpers')
const fb = require('./fb')

// Constants
const log = console.log

// Run
async function main() {
  log(chalk.greenBright(`---------- Running Facebook Script ----------`))

  const accessToken = process.env.FB_ACCESS_TOKEN
  const accountId = `act_${process.env.FB_AD_ACCOUNT_ID}`

  const FacebookAdsApi = bizSdk.FacebookAdsApi.init(accessToken)
  const AdAccount = bizSdk.AdAccount
  const account = new AdAccount(accountId)

  // const x = bizSdk.Campaign
  // log(x)

  // const campaigns = await fb.getCampaigns(account)
  // log(campaigns[0]._data)
  // log(campaigns[1]._data)
  // log(campaigns[2]._data)

  // log(campaigns[0]._data.special_ad_categories)


  // const new_campaign = await fb.createCampaign(account, 'Created Campaign')
  // log(new_campaign)
  // const new_campaign_id = new_campaign._data.id
  // log(`New Campaign ID: ${new_campaign_id}`)

  // const new_campaign_id = '23847919864390119'

  // const new_ad_set = await fb.createAdSet(account, new_campaign_id, 'generated adset 2')
  // log(new_ad_set)

  // const adSets = await fb.getAdSets(account)
  // log(adSets)
  // log(adSets[0]._data)
  // log(adSets[0]._data.promoted_object)
  // log(adSets[0]._data.targeting.flexible_spec)
  // log(adSets[0]._data.targeting.flexible_spec[0].interests)
  // log(adSets[0]._data.targeting.geo_locations)


  const res = await fb.getInterestSuggestions(accessToken, "Motorcycles", 5)
  log(res)


  // ---------- For Reference ----------

  // Show Campaign Fields
  // const Campaign = bizSdk.Campaign
  // const campaign = new Campaign()
  // log({ campaign_fields: campaign._fields })

  // Show AdSet Fields
  // const AdSet = bizSdk.AdSet
  // const adset = new AdSet()
  // log({ adset_fields: adset._fields })

  // Show Ad Fields
  // const Ad = bizSdk.Ad
  // const ad = new Ad()
  // log({ ad_fields: ad._fields })

  // ---------- For Reference ----------

  log(chalk.redBright(`---------- Ending Facebook Script ----------`))
}

main()
