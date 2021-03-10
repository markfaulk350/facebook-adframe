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
  // const Campaign = bizSdk.Campaign
  // let campaigns

  // await fb.getCampaigns(account)

  // const new_campaign = await fb.createCampaign(account, '[C] Created Campaign')
  // log(new_campaign)
  // const new_campaign_id = new_campaign._data.id
  // log(`New Campaign ID: ${new_campaign_id}`)

  const new_campaign_id = '23847857089530119'

  const new_ad_set = await fb.createAdSet(account, new_campaign_id, 'generated adset')
  log(new_ad_set)

  log(chalk.redBright(`---------- Ending Facebook Script ----------`))
}

main()
