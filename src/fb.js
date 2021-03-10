// https://developers.facebook.com/docs/marketing-api/campaign-structure

const log = console.log

const bizSdk = require('facebook-nodejs-business-sdk')
const AdAccount = bizSdk.AdAccount
const Campaign = bizSdk.Campaign
const AdSet = bizSdk.AdSet
const Ad = bizSdk.Ad

async function getCampaigns(account) {
  try {
    let campaigns

    // account = await account.read([AdAccount.Fields.name])
    campaigns = await account.getCampaigns(
      [
        Campaign.Fields.name,
        Campaign.Fields.status,
        Campaign.Fields.special_ad_categories,
      ],
      { limit: 10 },
    )
    return campaigns
  } catch (e) {
    log(e)
  }
}

async function createCampaign(account, name) {
  try {
    campaign = await account.createCampaign([], {
      [Campaign.Fields.name]: name,
      [Campaign.Fields.status]: Campaign.Status.paused,
      [Campaign.Fields.objective]: Campaign.Objective.page_likes,
      [Campaign.Fields.special_ad_categories]: [],
    })

    return campaign
  } catch (e) {
    log(e)
  }
}

async function createAdSet(account, campaign_id, name) {
  const unix_time = Date.now()
  const iso_string = new Date(unix_time).toISOString()
  // console.log(iso_string)
  // 2021-03-10T19:46:57.638Z
  let start_time = iso_string.split('.')[0]
  start_time += '-0000'
  // console.log(start_time)

  try {
    const new_ad_set = await account.createAdSet([], {
      campaign_id,
      name,
      status: 'PAUSED',
      bid_amount: '100',
      billing_event: 'IMPRESSIONS',
      daily_budget: '100',
      // lifetime_budget: '20000',
      start_time,
      // end_time: '2021-03-10T11:38:37-0800',
      optimization_goal: 'POST_ENGAGEMENT',
      targeting: {
        age_min: 20,
        age_max: 24,
        behaviors: [{ id: 6002714895372, name: 'All travelers' }],
        genders: [1],
        geo_locations: {
          countries: ['US'],
          regions: [{ key: '4081' }],
          cities: [{ key: '777934', radius: 10, distance_unit: 'mile' }],
        },
        interests: [{ id: 6002925969459, name: 'watching movies' }],
        life_events: [{ id: 6002714398172, name: 'Newlywed (1 year)' }],
        facebook_positions: ['feed'],
        publisher_platforms: ['facebook', 'audience_network'],
      },
      promoted_object: { page_id: '113315893898858' },
    })

    return new_ad_set
  } catch (e) {
    log(e)
  }
}

async function createAd(account, adset_id, name) {
  try {
    const new_ad = await account.createAd([], {
      name,
      adset_id,
      creative: { creative_id: '<adCreativeID>' },
      status: 'PAUSED',
    })
    return new_ad
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

async function showCampaignFields() {
  const campaign = new Campaign()
  log({ campaign_fields: campaign._fields })
}

async function showAdSetFields() {
  const adset = new AdSet()
  log({ adset_fields: adset._fields })
}

async function showAdFields() {
  const ad = new Ad()
  log({ ad_fields: ad._fields })
}

module.exports = {
  getCampaigns,
  createCampaign,
  createAdSet,
  createAd,
  getAdSets,
  showCampaignFields,
  showAdSetFields,
  showAdFields,
}
