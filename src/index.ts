// 3rd Party Imports
import * as dotenv from 'dotenv'
dotenv.config()
import chalk from 'chalk'
import bizSdk from 'facebook-nodejs-business-sdk'

// Local Imports
// import helpers from './helpers'

// Constants
const log = console.log

// Run
async function main() {
  log(chalk.greenBright(`---------- Running Facebook Script ----------`))

  const accessToken = process.env.FB_ACCESS_TOKEN
  const accountId = `act_${process.env.FB_AD_ACCOUNT_ID}`

  const FacebookAdsApi = bizSdk.FacebookAdsApi.init(accessToken)
  const AdAccount = bizSdk.AdAccount
  const Campaign = bizSdk.Campaign

  const account = new AdAccount(accountId)
  var campaigns

  account
    .read([AdAccount.Fields.name])
    .then(account => {
      // log(account)
      return account.getCampaigns([Campaign.Fields.name], { limit: 10 }) // fields array and params
    })
    .then(result => {
      log({ result: result })
      campaigns = result
      // campaigns.forEach(campaign => log(campaign.name))
    })
    .catch(console.error)

  log(chalk.redBright(`---------- End Facebook Script ----------`))
}

main()
