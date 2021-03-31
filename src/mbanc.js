require('dotenv').config()
const chalk = require('chalk')
const fb = require('./fb')
const sheets = require('./sheets')
const log = console.log

async function createAdSet(account, campaign_id, name, state) {

  const unix_time = Date.now()
  const iso_string = new Date(unix_time).toISOString()
  let start_time = iso_string.split('.')[0]
  start_time += '-0000'

  try {

    const new_ad_set = await account.createAdSet([], {
      campaign_id,
      name: `[AG] ${name}`,
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
        pixel_id: '2796607230588778',
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

  const account = await fb.initAccount(accessToken, accountId)

  const doc = await sheets.connect('1tczjiBNSlHTqZ7lYdIujjn0LVaba69S6w5i5T7Rm4gY')

  // const states = await sheets.read_rows_as_objects(doc, "US States")
  // log(states)

  // const columns = await sheets.read_as_columns(doc, "Adsets", true)
  // log(columns)

  const columns = await sheets.read_columns_as_objects(doc, "Adsets")
  log(columns)

  

  // Need to read the list of states x 24

  // Need to read the lists of Ad Sets with Interests x 23 x someNumber

  // Need to get state info

  // For Each State, Create a campaign. Then create every Ad Set with all of its asigned interests



  // let states = []

  // For each region get info
  // for (let i = 0; i < data.length; i++) {
  //   const keyword = data[i]
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
  

  // Loop over each state, create campaign, then use ID to create Ad Set
  // for (let i = 0; i < states.length; i++) {
  //   const state = states[i]

  //   const new_campaign = await fb.createCampaign(account, state.name)
  //   // log(new_campaign)
  //   const new_campaign_id = new_campaign._data.id
  //   log(`New "${state.name}" Campaign ID: ${new_campaign_id}`)

  //   const new_ad_set = await createAdSet(
  //     account,
  //     new_campaign_id,
  //     state.name,
  //     state
  //   )
  //   // log(new_ad_set)
  //   log(new_ad_set._data.id)
  // }

  log(chalk.redBright(`---------- Ending Facebook Script ----------`))
}

main()