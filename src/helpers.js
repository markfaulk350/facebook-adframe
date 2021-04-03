function sleep(ms) {
  return new Promise((r) => {
      // const spin = ora('sleeping ' + ms + 'ms').start()
      setTimeout(() => {
          // spin.stop()
          r()
      }, ms)
  }) 
}

function dedupeArray(arr) {
  deduped = [...new Set(arr)]
  return deduped
}

function convertListToLowerCase(list) {
  return list.map(el => el.toLowerCase())
}

module.exports = {
  sleep,
  dedupeArray,
  convertListToLowerCase
}