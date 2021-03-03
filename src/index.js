// 3rd Party Imports
require('dotenv').config()
const chalk = require('chalk')
// const ora = require('ora')
const bizSdk = require('facebook-nodejs-business-sdk')

// Local Imports
const helpers = require('./helpers')

// Constants
const log = console.log

// Run
async function main() {
  log(chalk.greenBright(`---------- Running Facebook Script ----------`))

  const accessToken = process.env.FB_ACCESS_TOKEN
  const accountId = `act_{${process.env.FB_AD_ACCOUNT_ID}}`

  const FacebookAdsApi = bizSdk.FacebookAdsApi.init(accessToken)
  const AdAccount = bizSdk.AdAccount
  const Campaign = bizSdk.Campaign

  const account = new AdAccount(accountId)
  var campaigns

  account
    .read([AdAccount.Fields.name])
    .then(account => {
      return account.getCampaigns([Campaign.Fields.name], { limit: 10 }) // fields array and params
    })
    .then(result => {
      campaigns = result
      campaigns.forEach(campaign => console.log(campaign.name))
    })
    .catch(console.error)
}

main()
