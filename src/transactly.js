require('dotenv').config()
const chalk = require('chalk')
const fb = require('./fb')
const sheets = require('./sheets')
const log = console.log
// Need to add variable for pixel ID
const TRANSACTLY_PIXEL_ID = '113947709530596'
const MARKS_PIXEL_ID = '2796607230588778'

async function createAdSet(account, campaign_id, state, pixel_id) {

  const unix_time = Date.now()
  const iso_string = new Date(unix_time).toISOString()
  let start_time = iso_string.split('.')[0]
  start_time += '-0000'

  try {

    const new_ad_set = await account.createAdSet([], {
      campaign_id,
      name: `[AG] ${state.name}`,
      status: 'PAUSED',
      billing_event: 'IMPRESSIONS',
      optimization_goal: 'OFFSITE_CONVERSIONS',
      start_time,
      targeting: {
        age_min: 18,
        age_max: 65,
        // flexible_spec: [
        //   { interests: [{ id: 6003353550130, name: 'Motorcycles' }] },
        // ],
        geo_locations: {
          regions: [
            { key: state.key, name: state.name, country: state.country_code },
          ],
        },
      },
      promoted_object: {
        pixel_id,
        custom_event_type: 'LEAD',
      },
    })

    return new_ad_set
  } catch (e) {
    log(e)
  }
}

// Run
async function main() {
  log(chalk.greenBright(`---------- Running Facebook Transactly Script ----------`))

  const accessToken = process.env.FB_ACCESS_TOKEN
  const accountId = process.env.FB_AD_ACCOUNT_ID
  const account = await fb.initAccount(accessToken, accountId) // Mark's Test Creds

  // const transactlyAccessToken = process.env.TRANSACTLY_FB_ACCESS_TOKEN
  // const transactlyAccountId = process.env.TRANSACTLY_FB_AD_ACCOUNT_ID
  // const account = await fb.initAccount(transactlyAccessToken, transactlyAccountId) // Transactly Creds

  // const new_campaign = await fb.createCampaign(account, "TEST")
  // log(new_campaign)

  const doc = await sheets.connect('1ig8bwH7titTnJZAA-zHfTIr_dcWJGvZRY54SJeSA2FQ')

  // const states = await sheets.read_as_columns(doc, "Transactly States - PROCESSED")
  // log(data)

  // let states = []

  // For each region get info
  // for (let i = 0; i < data[0].length; i++) {
  //   const keyword = data[0][i]
  //   const region = await fb.getRegionId(accessToken, keyword, 10)
  //   states.push(region)
  // }

  // log(states)

  // Save state info to a new G Sheet
  // const new_sheet = await doc.addSheet({
  //   title: 'US States',
  //   headerValues: ['key', 'name', 'country_code'],
  // })
  // const more_rows = await new_sheet.addRows(states)

  const states = await sheets.read_rows_as_objects(doc, "Transactly States - PROCESSED")

  // Loop over each state, create campaign, then use ID to create Ad Set
  for (let state of states) {

    const new_campaign = await fb.createCampaign(account, state.name)
    const new_campaign_id = new_campaign._data.id
    log(`[C] ${state.name} created w ID: ${new_campaign_id}`)

    const new_ad_set = await createAdSet(
      account,
      new_campaign_id,
      state,
      // TRANSACTLY_PIXEL_ID
      MARKS_PIXEL_ID
    )
    const new_ad_set_id = new_ad_set._data.id
    log(`[AG] ${state.name} created w ID: ${new_ad_set_id}`)

  }

  log(chalk.redBright(`---------- Ending Facebook Script ----------`))
}

main()
