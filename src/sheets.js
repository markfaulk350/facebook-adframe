const ora = require('ora')
const chalk = require('chalk')
const log = console.log
const { GoogleSpreadsheet } = require('google-spreadsheet')
// const helpers = require('./general_purpose_helpers')
// const _DEBUG_SHEET_LIMIT = 9999

async function connect(sheet_id) {
  try {
    const doc = new GoogleSpreadsheet(sheet_id)

    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/gm, '\n'),
    })

    await doc.loadInfo()

    log(`"${doc.title}" - Loaded`)
    log(`${doc.sheetsByIndex.length} worksheets available`)

    return doc
  } catch (e) {
    log(e)
  }
}

async function read_as_columns(doc, worksheet_name, include_headers) {
  try {

    const sheet = doc.sheetsByTitle[worksheet_name]
    const title = sheet.title ? sheet.title.trim() : ''
    const rows = await sheet.getRows()
    const rows_in_sheet = rows.length + 1
    log(chalk.grey(`${title} has ${rows_in_sheet} rows including the header`))

    let arr = []

    if(include_headers) {
      arr.push(sheet.headerValues)
    }

    for (let j = 0; j < rows.length; j++) {
      let row = rows[j]._rawData
      arr.push(row)
    }

    const columns = await convertRowsToColumns(arr)

    return columns
  } catch (e) {
    log(e)
  }
}

async function read_as_rows(doc, worksheet_name, include_headers) {
  try {

    const sheet = doc.sheetsByTitle[worksheet_name]
    const title = sheet.title ? sheet.title.trim() : ''
    const rows = await sheet.getRows()
    const rows_in_sheet = rows.length + 1
    log(chalk.grey(`${title} has ${rows_in_sheet} rows including the header`))

    let arr = []

    if(include_headers) {
      arr.push(sheet.headerValues)
    }
    
    for (let j = 0; j < rows.length; j++) {
      let row = rows[j]._rawData
      arr.push(row)
    }

    return arr
  } catch (e) {
    log(e)
  }
}

async function read_rows_as_objects(doc, worksheet_name) {
  try {
    const rows = await read_as_rows(doc, worksheet_name, true)

    // Now we have 
    // rows = [
    //   ['name', 'key'],
    //   ['California', 123]
    // ]
    // And we want
    // [{id: 123, name: 'California'}]

    new_arr = []

    // For each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      let new_obj = {}

      // For each row item, set key-value
      for (let j = 0; j < row.length; j++) {
        // What is the value?
        const row_item = row[j];

        // What is the key?
        // In our case, the first row, and the index of the header in the row.
        new_obj[rows[0][j]] = row_item
      }

      // Do not push first row containing header values
      if(i !== 0) {
        new_arr.push(new_obj)
      }
    }

    return new_arr

  } catch (e) {
    log(e)
  }
}

async function convertRowsToColumns(rows) {
  // Sheet data is read in as rows but we need to convert them to columns
  // In addition we want to remove any empty strings, columns & campaigns

  const result = [];

  for (let i = 0; i < rows[0].length; i++) {
    const col = [];
    for (let j = 0; j < rows.length; j++) {
      let data = rows[j][i];
      // Need to make sure the keyword exists and is not empty or undefined
      if (data) {
        col.push(data);
      }
    }
    // If the column is not empty, and there is at least 1 keyword per campaign
    if (col && col.length > 1) {
      result.push(col);
    }
  }

  return result;
}

async function read_columns_as_objects(doc, worksheet_name) {
  try {
    const columns = await read_as_columns(doc, worksheet_name, true)

    // Now we have 
    // columns = [
    //   ['title', 'adset 1', 'adset 2', 'adset 3'],
    //   ['title', 'adset 1', 'adset 2', 'adset 3']
    // ]
    // And we want
    // [{title: 'Credit', list: ['adset 1', 'adset 2', 'adset 3']}]

    new_arr = []

    // For each column
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i];

      new_arr.push({
        title: column[0],
        list: column.slice(1)
      })
    }

    return new_arr

  } catch (e) {
    log(e)
  }
}

// async function read_all_worksheets(sheets_doc) {

//   for (let i = 0; i < sheets_doc.sheetsByIndex.length; i++) {
//     const sheet = sheets_doc.sheetsByIndex[i]
//     const sheet_title = sheet.title ? sheet.title.trim() : ''
//     const sheet_rows = await sheet.getRows()

//     if (sheet_title === 'Negative Keywords') {
//       const spin = ora('Reading ' + sheet_title).start()

//       negative_keywords = await get_keywords_arr_from_rows(sheet, sheet_rows)

//       spin.succeed(
//         chalk.blueBright(sheet_title) +
//           ' sheet | Scraped ' +
//           negative_keywords.length +
//           ' keywords',
//       )
//       log(
//         chalk.gray(
//           ' "' + negative_keywords.slice(0, 3).join('", "') + '" [...]',
//         ),
//       )
//     } else if (sheet_title === 'Geo-Inclusion') {
//       const spin = ora('Reading ' + sheet_title).start()

//       geolocation_inclusions = await get_keywords_arr_from_rows(
//         sheet,
//         sheet_rows,
//       )

//       spin.succeed(
//         chalk.blueBright(sheet_title) +
//           ' sheet | Scraped ' +
//           geolocation_inclusions.length +
//           ' locations',
//       )
//       log(
//         chalk.gray(
//           ' "' +
//             (geolocation_inclusions.slice(0, 3).join('", "') + '"').substring(
//               0,
//               process.stdout.columns - 10,
//             ) +
//             ' [...]',
//         ),
//       )
//     } else if (sheet_title === 'Geo-Exclusion') {
//       const spin = ora('Reading ' + sheet_title).start()

//       geolocation_exclusions = await get_keywords_arr_from_rows(
//         sheet,
//         sheet_rows,
//       )

//       spin.succeed(
//         chalk.blueBright(sheet_title) +
//           ' sheet | Scraped ' +
//           geolocation_exclusions.length +
//           ' locations',
//       )
//       log(
//         chalk.gray(
//           ' "' +
//             (geolocation_exclusions.slice(0, 3).join('", "') + '"').substring(
//               0,
//               process.stdout.columns - 10,
//             ) +
//             ' [...]',
//         ),
//       )
//     } else {
//       const spin = ora('Reading ' + sheet_title).start()

//       const keyword_list_obj = {
//         title: sheet_title,
//         words: await get_keywords_arr_from_rows(sheet, sheet_rows),
//       }

//       keyword_lists.push(keyword_list_obj)
//       keyword_lists_titles.push(keyword_list_obj.title)

//       spin.succeed(
//         sheet_title +
//           ' sheet | Scraped ' +
//           keyword_list_obj.words.length +
//           ' keywords',
//       )
//       log(
//         chalk.gray(
//           ' "' +
//             (keyword_list_obj.words.slice(0, 3).join('", "') + '"').substring(
//               0,
//               process.stdout.columns - 10,
//             ) +
//             ' [...]',
//         ),
//       )

//       if (i >= _DEBUG_SHEET_LIMIT + (negative_keywords.length ? -1 : 0)) break
//     }

//     await helpers.sleep(3000)
//   }

//   return {
//     negative_keywords,
//     geolocation_exclusions,
//     geolocation_inclusions,
//     keyword_lists,
//     keyword_lists_titles,
//   }
// }

// // This function is called once per worksheet/campaign to read keywords from rows
// async function get_keywords_arr_from_rows(sheet, sheet_rows) {
//   // NOTE: sheet_rows.length returns 1 less than expected which is why we are adding 1
//   let num_of_rows_in_sheet = sheet_rows.length + 1

//   // Load cells before processing
//   await sheet.loadCells({
//     startRowIndex: 0,
//     endRowIndex: num_of_rows_in_sheet,
//     startColumnIndex: 0,
//     endColumnIndex: 1,
//   })

//   const keyword_arr = []

//   for (let i = 0; i < num_of_rows_in_sheet; i++) {
//     const cell = sheet.getCell(i, 0)
//     // log(cell.valueType)
//     // log(cell.value)

//     try {
//       if (cell.valueType === 'stringValue') {
//         if (cell.value && cell.value.length && cell.value.trim().length) {
//           keyword_arr.push(cell.value.trim())
//         }
//       }
//       if (cell.valueType === 'numberValue') {
//         if (cell.value) {
//           keyword_arr.push(cell.value.toString())
//         }
//       }
//     } catch (e) {
//       // NOOP - don't need to handle empty cells etc.
//     }
//   }

//   return keyword_arr
// }

module.exports = {
  // extract_sheet_id_from_url,
  // get_keywords_arr_from_rows,
  connect,
  read_as_columns,
  read_as_rows,
  read_rows_as_objects,
  read_columns_as_objects
  // read_all_worksheets,
}
