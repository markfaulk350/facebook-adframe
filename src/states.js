require('dotenv').config()
const chalk = require('chalk')
const fb = require('./fb')
const sheets = require('./sheets')
const log = console.log

// Run
async function main() {
  log(chalk.greenBright(`---------- Running Facebook Transactly Script ----------`))

  const accessToken = process.env.FB_ACCESS_TOKEN
  const accountId = process.env.FB_AD_ACCOUNT_ID
  const account = await fb.initAccount(accessToken, accountId)

  const doc = await sheets.connect('1ig8bwH7titTnJZAA-zHfTIr_dcWJGvZRY54SJeSA2FQ')

  const data = await sheets.read_as_columns(doc, "Mbanc States - RAW", true)
  log(data)

  let states = []

  // For each region get info
  for (let i = 0; i < data[0].length; i++) {
    const keyword = data[0][i]
    const region = await fb.getRegionId(accessToken, keyword, 10)
    states.push(region)
  }

  log(states)

  // Save state info to a new G Sheet
  const new_sheet = await doc.addSheet({
    title: 'Mbanc States - PROCESSED',
    headerValues: ['key', 'name', 'country_code'],
  })
  const more_rows = await new_sheet.addRows(states)

  log(chalk.redBright(`---------- Ending Facebook Script ----------`))
}

main()
