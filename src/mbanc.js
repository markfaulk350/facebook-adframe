require('dotenv').config()
const chalk = require('chalk')
const fb = require('./fb')
const sheets = require('./sheets')
const helpers = require('./helpers')
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

  const doc = await sheets.connect('1ig8bwH7titTnJZAA-zHfTIr_dcWJGvZRY54SJeSA2FQ')

  // const states = await sheets.read_rows_as_objects(doc, "Mbanc States - RAW")
  // log(states)

  const interest_lists = await sheets.read_columns_as_objects(doc, "Thematic - TEST")
  // log(columns)

  // Push each interest list into a single list
  let all_interests = []

  interest_lists.forEach(el => {
    all_interests.push(...el.list)
  })

  // Convert interests to lowercase
  all_interests = all_interests.map(interest => {
    return interest.toLowerCase()
  })

  // Remove duplicate interests
  let unique_interests = helpers.dedupeArray(all_interests)

  log(`${all_interests.length} interests`)
  log(`${unique_interests.length} unique interests`)

  // For now lets just generate a new sheet with the unique interests
  let dict = []
  let missing_dict = []

  for (let interest of unique_interests) {
    const info = await fb.getInterestId(accessToken, interest, 10)

    if(info && info.keyword && info.id) {
      dict.push(info)
    } else {
      missing_dict.push(info)
    }
  }
  // log(dict)
  // log(missing_dict)

  // const new_sheet = await doc.addSheet({title: 'Generated Unique Interests', headerValues: ['keyword', 'id', 'audience']})
  // await new_sheet.addRows(dict)

  // if(missing_dict.length > 0) {
  //   const new_unmatched_sheet = await doc.addSheet({title: 'Unmatched Interests', headerValues: ['keyword', 'id', 'audience']})
  //   await new_unmatched_sheet.addRows(missing_dict)
  // }




  // Need to cross reference what interests we already have with what is needed
  

  // Read RAW list of states x 24
  // Get info for those states & save to a new worksheet

  // Read Raw lists of interests from G Sheets
  // Read list of Processed interests form G Sheets

  // Compile a list with all interests & dedupe
  // Determine what interests we dont have stored, make api calls for those interests info & update the G Sheet.
  // Match each interests info with its interest in each list

  // Create 23 campaigns, each named after a state
  // Create Ad Sets for each interest list, target geolocation, + add all interests
















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