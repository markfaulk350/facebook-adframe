// https://developers.facebook.com/docs/marketing-api/campaign-structure

const log = console.log


const axios = require('axios')
const bizSdk = require('facebook-nodejs-business-sdk')
const AdAccount = bizSdk.AdAccount
const Campaign = bizSdk.Campaign
const AdSet = bizSdk.AdSet
const Ad = bizSdk.Ad

async function initAccount(accessToken, accountId) {
  const FacebookAdsApi = bizSdk.FacebookAdsApi.init(accessToken)
  const account = new AdAccount(`act_${accountId}`)
  return account
}

async function getCampaigns(account) {
  try {
    let campaigns = await account.getCampaigns(
      [
        Campaign.Fields.name,
        Campaign.Fields.status,
        Campaign.Fields.objective,
        Campaign.Fields.daily_budget,
        Campaign.Fields.special_ad_categories,
        Campaign.Fields.special_ad_category,
        Campaign.Fields.bid_strategy,
      ],
      { limit: 10 },
    )
    return campaigns
  } catch (e) {
    log(e)
  }
}

async function createCampaign(account, name) {
  // https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group#fields

  try {
    campaign = await account.createCampaign([], {
      [Campaign.Fields.name]: `[C] ${name}`,
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

async function getAdSets(account) {
  try {
    const adsets = await account.getAdSets(
      [
        AdSet.Fields.name,
        AdSet.Fields.targeting,
        AdSet.Fields.daily_budget,
        AdSet.Fields.bid_amount,
        AdSet.Fields.promoted_object,
        AdSet.Fields.billing_event,
        AdSet.Fields.optimization_goal,
      ],
      {
        limit: 10,
      },
    )
    return adsets
  } catch (e) {
    log(e)
  }
}

async function createAdSet(account, campaign_id, name) {
  // https://developers.facebook.com/docs/marketing-api/reference/ad-campaign#fields

  // Format we need:               2021-03-10T11:38:37-0800
  // Format ISO String gives us:   2021-03-10T19:46:57.638Z

  const unix_time = Date.now()
  const iso_string = new Date(unix_time).toISOString()
  // log(iso_string)
  let start_time = iso_string.split('.')[0]
  start_time += '-0000'
  // log(start_time)

  try {
    // Keep in mind that when using speacial ads categories like "Housing" there are some fields we cant change, age, gender, etc...

    const new_ad_set = await account.createAdSet([], {
      campaign_id,
      name: `[AG] ${name}`,
      status: 'PAUSED',
      billing_event: 'IMPRESSIONS',
      optimization_goal: 'OFFSITE_CONVERSIONS',
      start_time,
      // end_time: '2021-03-10T11:38:37-0800',
      targeting: {
        age_min: 18,
        age_max: 65,
        // genders: [1],
        flexible_spec: [
          { interests: [{ id: 6003353550130, name: 'Motorcycles' }] },
        ],
        geo_locations: {
          // countries: ['US'],
          // location_types: [ 'home' ] // default + optional
          regions: [
            { key: '3847', name: 'California', country: 'US' },
            { key: '3845', name: 'Arizona', country: 'US' },
          ],
        },
        // brand_safety_content_filter_levels: [
        //   'FACEBOOK_STANDARD',
        //   'AN_STANDARD',
        // ],
      },
      // promoted_object: {
      //   pixel_id: '2796607230588778',
      //   custom_event_type: 'LEAD',
      // },
    })

    return new_ad_set
  } catch (e) {
    log(e)
  }
}

// async function createAd(account, adset_id, name) {
//   // Not finished, just copied an example!!!
//   try {
//     const new_ad = await account.createAd([], {
//       name,
//       adset_id,
//       creative: { creative_id: '<adCreativeID>' },
//       status: 'PAUSED',
//     })
//     return new_ad
//   } catch (e) {
//     log(e)
//   }
// }

async function getInterestSuggestions(access_token, keyword, limit) {
  // https://developers.facebook.com/docs/marketing-api/audiences/reference/targeting-search/#interest_suggestions

  const url = `https://graph.facebook.com/search?type=adinterestsuggestion&interest_list=["${keyword}"]&limit=${limit}&locale=en_US&access_token=${access_token}`

  // We can also filter by speacial ads categories like "HOUSING"
  // &regulated_categories=[HOUSING]

  try {
    const res = await axios.get(url)
    const data = res.data.data
    return data
  } catch (e) {
    log(e)
  }
}

async function getInterestId(access_token, keyword, limit) {
  // https://developers.facebook.com/docs/marketing-api/audiences/reference/targeting-search#interests

  const url = `https://graph.facebook.com/search?type=adinterest&q=${keyword}&limit=${limit}&locale=en_US&access_token=${access_token}`
  
  try {
    const res = await axios.get(url)
    const data = res.data.data
    // log(data)

    // Keywords are case sensitive and weird!!! (Examples on left work)
    // "Home repair"       vs "home repair"
    // "Home Appliances"   vs "Home appliances" - (The Case of the second word matters!!!)

    // Convert the interest names & keyword to lowercase before checking for match.

    // Find an exact match for the interest name, and return the ID
    const record = data.find(
      el => el.name.toLowerCase() === keyword.toLowerCase(),
    )
    // log(record)
    // log(data)

    if (record && record.id && record.name) {
      // It might be best to return an object containing the interest name and ID so we know the capitalization is correct.
      return { id: record.id , keyword: record.name, audience: record.audience_size }
    } else {
      return { id: "" , audience: "", keyword }
    }
  } catch (e) {
    log(e)
  }
}

module.exports = {
  initAccount,
  getCampaigns,
  createCampaign,
  getAdSets,
  createAdSet,
  // createAd,
  getInterestSuggestions,
  getInterestId,
}
