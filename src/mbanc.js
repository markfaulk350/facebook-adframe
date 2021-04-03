require('dotenv').config()
const chalk = require('chalk')
const fb = require('./fb')
const sheets = require('./sheets')
const helpers = require('./helpers')
const log = console.log

const TRANSACTLY_PIXEL_ID = '113947709530596'
const MARKS_PIXEL_ID = '2796607230588778'

async function createAdSet(account, campaign_id, name, state, interests, pixel_id) {
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
        flexible_spec: [
          { interests },
          // { interests: [{ id: 6003353550130, name: 'Motorcycles' }] },
        ],
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
  try {
    
  log(chalk.greenBright(`---------- Running Facebook Transactly Script ----------`))

  const accessToken = process.env.FB_ACCESS_TOKEN
  const accountId = process.env.FB_AD_ACCOUNT_ID
  const account = await fb.initAccount(accessToken, accountId)

  // const transactlyAccessToken = process.env.TRANSACTLY_FB_ACCESS_TOKEN
  // const transactlyAccountId = process.env.TRANSACTLY_FB_AD_ACCOUNT_ID
  // const account = await fb.initAccount(transactlyAccessToken, transactlyAccountId)

  const doc = await sheets.connect('1ig8bwH7titTnJZAA-zHfTIr_dcWJGvZRY54SJeSA2FQ')

  const states = await sheets.read_rows_as_objects(doc, "Mbanc States - TEST")
  // log(states)

  let interest_lists = await sheets.read_columns_as_objects(doc,'Adset Structure - TEST')

  // DEDUPE EACH INTEREST LIST!
  for(let interest_list of interest_lists) {
    let copy = interest_list.list

    // Need to convert each interest to lowercase, then dedupe, then replace the list
    copy = helpers.convertListToLowerCase(copy)
    copy = helpers.dedupeArray(copy)
    interest_list.list = copy
  }

  // Push each interest list into a single list
  let all_interests = []

  interest_lists.forEach(el => {
    all_interests.push(...el.list)
  })

  // Convert interests to lowercase
  // all_interests = helpers.convertListToLowerCase(all_interests)

  // Remove duplicate interests with entire sheet in mind
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

  // Loop through interest_lists to match interest objects
  for (let i = 0; i < interest_lists.length; i++) {
    const interest_list = interest_lists[i];

    let list_w_objects = []

    // Loop through interest_list to find match
    for (let interest of interest_list.list) {

      // Find matching object
      let obj = dict.find(el => el.keyword.toLowerCase() == interest.toLowerCase())

      if(obj) {
        list_w_objects.push(obj)
      }
    }
    interest_list.list_w_objects = list_w_objects
  }
  // log(interest_lists)
  // log(interest_lists[0].list_w_objects)

  for(let state of states) {

    const new_campaign = await fb.createCampaign(account, state.name)
    const new_campaign_id = new_campaign._data.id
    log(`[C] ${state.name} created w ID: ${new_campaign_id}`)


    for(let list of interest_lists) {

      let interests = list.list_w_objects.map(el => {
        return {
          id: el.id,
          name: el.keyword
        }
      })

      // Create an AdSet with name of interest_list
      // add list of interests to AdSet
      const new_ad_set = await createAdSet(
      account,
      new_campaign_id,
      list.title,
      state,
      interests,
      // TRANSACTLY_PIXEL_ID
      MARKS_PIXEL_ID
    )
    const new_ad_set_id = new_ad_set._data.id
    log(`[AG] ${list.title} created w ID: ${new_ad_set_id}`)
    }

  }



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
} catch (e) {
  log(e)
}
}

main()
