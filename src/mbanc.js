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
  log(
    chalk.greenBright(
      `---------- Running Facebook Transactly Script ----------`,
    ),
  )

  const accessToken = process.env.FB_ACCESS_TOKEN
  const accountId = process.env.FB_AD_ACCOUNT_ID

  const account = await fb.initAccount(accessToken, accountId)

  const doc = await sheets.connect(
    '1ig8bwH7titTnJZAA-zHfTIr_dcWJGvZRY54SJeSA2FQ',
  )

  // const states = await sheets.read_rows_as_objects(doc, "Mbanc States - RAW")
  // log(states)

  // const interest_lists = await sheets.read_columns_as_objects(doc, "Thematic - TEST")
  let interest_lists = await sheets.read_columns_as_objects(
    doc,
    'Adset Structure - TEST',
  )
  // log(columns)

  // NEED TO DEDUPE EACH INTEREST LIST!

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

    if (info && info.keyword && info.id) {
      dict.push(info)
    } else {
      missing_dict.push(info)
    }
  }
  // log(dict)
  // log(missing_dict)

  // const new_sheet = await doc.addSheet({
  //   title: 'Generated Unique Interests - TEST',
  //   headerValues: ['keyword', 'id', 'audience'],
  // })
  // await new_sheet.addRows(dict)

  // if (missing_dict.length > 0) {
  //   const new_unmatched_sheet = await doc.addSheet({
  //     title: 'Unmatched Interests - TEST',
  //     headerValues: ['keyword', 'id', 'audience'],
  //   })
  //   await new_unmatched_sheet.addRows(missing_dict)
  // }

  // Now we need to match each interest, in each group with its info
  // interest_lists = [
  //   {
  //     title: 'Credit',
  //     list: ['Credit history'],
  //     // Only add or load objects containing ID's
  //     list_w_objects: [{keyword: 'Credit history', id: '6003424627940'}],
  //   },
  // ]

  for (let i = 0; i < interest_lists.length; i++) {
    const interest_list = interest_lists[i];

    let list_w_objects = []

    // Loop through interest_list to find match and append if so
    // Remember to match on lowerCase()

    for (let interest of interest_list.list) {

      // Find matching object
      let obj = dict.find(el => el.keyword.toLowerCase() == interest.toLowerCase())

      if(obj) {
        list_w_objects.push(obj)
      }

    }

    interest_list.list_w_objects = list_w_objects
  }

  log(interest_lists)
  log(interest_lists[0].list_w_objects)


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

  // We have 24 states to create campaigns for

  log(chalk.redBright(`---------- Ending Facebook Script ----------`))
}

main()
