// 3rd Party Imports
require('dotenv').config()
const chalk = require('chalk')

// Local Imports
const fb = require('./fb')
const sheets = require('./sheets')

// Constants
const log = console.log

// Run
async function main() {
  log(chalk.greenBright(`---------- Running Facebook Script ----------`))

  const accessToken = process.env.FB_ACCESS_TOKEN
  const accountId = process.env.FB_AD_ACCOUNT_ID

  const account = await fb.initAccount(accessToken, accountId)

  // const data = await fb.getRegionId(accessToken, "Washington D. C.", 20)
  // log(data)

  // const doc = await sheets.connect('1ig8bwH7titTnJZAA-zHfTIr_dcWJGvZRY54SJeSA2FQ')

  // const data = await sheets.read_worksheets(doc)

  // let dict = []

  // For each keyword get ID
  // for (let i = 0; i < 5; i++) {
  //   const keyword = data[i];

  //   const interest = await fb.getInterestId(accessToken, keyword, 10)

  //   dict.push(interest)
  // }

  // log(dict)

  // const new_sheet = await doc.addSheet({title: 'Interests 2', headerValues: ['keyword', 'id', 'audience']})
  // const more_rows = await new_sheet.addRows(dict)


  // const campaigns = await fb.getCampaigns(account)
  // log(campaigns[0]._data)

  // const new_campaign = await fb.createCampaign(account, 'Campaign name')
  // log(new_campaign)
  // const new_campaign_id = new_campaign._data.id
  // log(`New Campaign ID: ${new_campaign_id}`)

  // const new_ad_set = await fb.createAdSet(account, new_campaign_id, 'generated adset 2')
  // log(new_ad_set)

  // const adSets = await fb.getAdSets(account)
  // log(adSets)
  // log(adSets[0]._data)

  // const res = await fb.getInterestSuggestions(accessToken, "Home", 5)
  // log(res)

  // const res = await fb.getInterestId(accessToken, "Home", 5)
  // log(res)

  log(chalk.redBright(`---------- Ending Facebook Script ----------`))
}

main()
