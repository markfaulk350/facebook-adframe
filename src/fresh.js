// This is a fresh start as of May 15th 2021. Its been a month since I've looked at any of this

require('dotenv').config()
const chalk = require('chalk')
// const fb = require('./fb')
const sheets = require('./sheets')
// const helpers = require('./helpers')
const _ = require('lodash')
const bizSdk = require('facebook-nodejs-business-sdk')
const AdAccount = bizSdk.AdAccount
const Campaign = bizSdk.Campaign
const log = console.log


const MARKS_PIXEL_ID = '2796607230588778'
const accessToken = process.env.FB_ACCESS_TOKEN
const accountId = process.env.FB_AD_ACCOUNT_ID

const TRANSACTLY_PIXEL_ID = '113947709530596'
const transactlyAccessToken = process.env.TRANSACTLY_FB_ACCESS_TOKEN
const transactlyAccountId = process.env.TRANSACTLY_FB_AD_ACCOUNT_ID


async function initAccount(accessToken, accountId) {
  const FacebookAdsApi = bizSdk.FacebookAdsApi.init(accessToken)
  const account = new AdAccount(`act_${accountId}`)
  return account
}

async function createCampaign(account, name) {

  try {
    campaign = await account.createCampaign([], {
      [Campaign.Fields.name]: `${name}`,
      [Campaign.Fields.status]: Campaign.Status.paused,
      [Campaign.Fields.objective]: Campaign.Objective.conversions,
      [Campaign.Fields.special_ad_categories]: ['HOUSING'], // NONE, EMPLOYMENT, HOUSING, CREDIT, ISSUES_ELECTIONS_POLITICS
      [Campaign.Fields.bid_strategy]: 'LOWEST_COST_WITHOUT_CAP', // LOWEST_COST_WITHOUT_CAP, LOWEST_COST_WITH_BID_CAP, COST_CAP
      [Campaign.Fields.daily_budget]: '1000', // cents
    })

    return campaign
  } catch (e) {
    log(e)
  }
}

async function createAdSet(
  account,
  campaign_id,
  name,
  interests,
  pixel_id,
) {
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
          countries: ['US'],
          // location_types: [ 'home' ] // default + optional
          // regions: [
          //   { key: '3847', name: 'California', country: 'US' },
          //   { key: '3845', name: 'Arizona', country: 'US' },
          // ],
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

async function createResources(campaigns, account) {
  for (let campaign of campaigns) {
    const new_campaign = await createCampaign(account, campaign.campaign_name)

    if (new_campaign && new_campaign._data && new_campaign._data.id) {
      const new_campaign_id = new_campaign._data.id
      log(`${campaign.campaign_name} created w ID: ${new_campaign_id}`)

      for (let adgroup of campaign.adgroups) {

        let interests = adgroup.interests.map(el => {
          return {
            id: el['Interest ID'],
            name: el['Interest Name'],
          }
        })
      

        // Create an AdSet with name of interest_list
        // add list of interests to AdSet
        const new_ad_set = await createAdSet(
          account,
          new_campaign_id,
          adgroup.adgroup_name,
          interests,
          TRANSACTLY_PIXEL_ID
          // MARKS_PIXEL_ID,
        )

        if (new_ad_set && new_ad_set._data && new_ad_set._data.id) {
          const new_ad_set_id = new_ad_set._data.id
          log(`[AG] ${adgroup.adgroup_name} created w ID: ${new_ad_set_id}`)
        } else {
          log(chalk.yellowBright(`---------- Adset ${adgroup.adgroup_name} Not Created. No _data ----------`))
          break
        }
      }
    } else {
      log(chalk.yellowBright(`---------- Campaign ${campaign.campaign_name} Not Created. No _data ----------`))
      break
    }
  }
}


  // We start with an array of objects containing interests

  // [{
  //   'Campaign Name': '[C] Auto | Career | Business | Consumer',
  //   'AdGroup Name': 'Size 1',
  //   'Interest Name': 'Entertainment',
  //   'Interest ID': '6003349442621',
  //   'Audience Size': '2,072,337,260'
  // }, ...]

  // We need an array of campaigns with interests sorted by adgroups

  // let campaigns = [
  //   {
  //     campaign_name = '[C] Auto | Career | Business | Consumer',
  //     ad_groups = [
  //     {
  //       adgroup_name: "[AG] Size 1", interests: [
  //       {
  //         'Interest Name': 'Entertainment',
  //         'Interest ID': '6003349442621',
  //         'Audience Size': '2,072,337,260'
  //       },
  //       {
  //         'Interest Name': 'Facebook',
  //         'Interest ID': '6003142505790',
  //         'Audience Size': '1,340,297,230'
  //       },
  //     ]}
  //   ]}
  // ]

// Run
async function main() {
  try {
    log(chalk.greenBright(`---------- Running Facebook Transactly Script ----------`))

    // CONNECT TO GOOGLE SPREADSHEET
    const doc = await sheets.connect('1KVPB4aYLS-q3DzjFjJ56XoDcYhCk6zRUcXJqKpSI9iA')

    // PUSH EACH ROW INTO AN ARRAY OF OBJECTS USING HEADER VALUES AS THE "KEY"
    const interests_list = await sheets.read_rows_as_objects(doc,`Interests w ID's`)

    // Returns an object grouped by campaign name
    let sorted_campaigns = _.groupBy(interests_list, 'Campaign Name')
    let campaigns = []

    for (let sorted_campaign in sorted_campaigns) {
      let campaign_name = sorted_campaign
      let campaign_interests = sorted_campaigns[sorted_campaign]

      // Organize the adgroups for this campaign
      let sortedAdGroups = _.groupBy(campaign_interests, 'AdGroup Name')
      let adgroups = []

      for (let sortedAdGroup in sortedAdGroups) {
        let adgroup_name = sortedAdGroup
        let interests = sortedAdGroups[sortedAdGroup]

        let temp_adgroup = {
          adgroup_name,
          interests // Can remove unused data if needed, might make removing duplicates easier
        }
        adgroups.push(temp_adgroup)
      }

      let temp_campaign = {
        campaign_name,
        // campaign_interests,
        adgroups
      }
      campaigns.push(temp_campaign)
    }

    // log(campaigns)

    
    // CONNECT TO FACEBOOK API W CREDENTIALS
    // const account = await initAccount(accessToken, accountId)
    const account = await initAccount(transactlyAccessToken, transactlyAccountId)


    await createResources(campaigns, account)

    log(chalk.redBright(`---------- Ending Facebook Script ----------`))
  } catch (e) {
    log(e)
  }
}

main()
