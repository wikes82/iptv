const util = require('./util')

const debug = false
const types = ['full', 'country', 'content']

let stats = {
  countries: 0,
  channels: 0
}

let buffer = {}

let repo = {
  countries: {}
}

function main() {
  console.log(`Parsing 'index.m3u'...`)
  const playlist = util.parsePlaylist('index.jay.m3u')
  let countries = playlist.items
  if(debug) {
    console.log('Debug mode is turn on')
    countries = countries.slice(0, 1)
  }

  for(let type of types) {
    const filename = `index.${type}.m3u`
    console.log(`Creating '${filename}'...`)
    util.createFile(filename, '#EXTM3U\n')
  }


  for(let country of countries) {
    console.log(`Parsing '${country.url}'...`)
    const playlist = util.parsePlaylist(country.url)

    const c = {
      name: country.name,
      code: util.getBasename(country.url).toUpperCase()
    }

    const epg = playlist.header.attrs['x-tvg-url'] ? `<code>${playlist.header.attrs['x-tvg-url']}</code>` : ''
    repo.countries[c.code] = { country: c.name, channels: playlist.items.length, playlist: `<code>https://iptv-org.github.io/iptv/${country.url}</code>`, epg }

    for(let item of playlist.items) {

      let channel = util.createChannel(item)

      let group = channel.group

      for(const type of types) {
        if(type === 'full') {
          channel.group = [ c.name, channel.group ].filter(i => i).join(';')
        } else if(type === 'country') {
          channel.group = c.name
        } else {
          channel.group = group
        }

        util.appendToFile(`index.${type}.m3u`, channel.toString())
      }

      stats.channels++
    }

    stats.countries++
  }

  const countriesTable = util.generateTable(Object.values(repo.countries), {
    columns: [
      { name: 'Country', align: 'left' },
      { name: 'Channels', align: 'right' },
      { name: 'Playlist', align: 'left', nowrap: true },
      { name: 'EPG', align: 'left' }
    ]
  })

}

main()

console.log(`Countries: ${stats.countries}. Channels: ${stats.channels}.`)
