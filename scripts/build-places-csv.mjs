import { createReadStream, createWriteStream } from 'node:fs'
import { mkdir, readFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { createInterface } from 'node:readline'

const root = process.cwd()
const mainFile = join(root, 'data', 'geonames', 'main', 'IN.txt')
const admin1File = join(root, 'data', 'geonames', 'admin1CodesASCII.txt')
const admin2File = join(root, 'data', 'geonames', 'admin2Codes.txt')
const alternateFile = join(root, 'data', 'geonames', 'alt', 'IN.txt')
const outputDirectory = join(root, 'data')
const splitAt = process.argv.includes('--split') ? Number(process.argv[process.argv.indexOf('--split') + 1]) : 0
const header = 'name,name_local,alt_names,place_type,district,state,population,lat,lng,source,source_id,source_licence\n'

// GeoNames main columns: geonameid, name, asciiname, alternatenames, latitude,
// longitude, feature class, feature code, country code, cc2, admin1, admin2,
// admin3, admin4, population, elevation, dem, timezone, modification date.
const readLines = async (file, onLine) => {
  const input = createInterface({ input: createReadStream(file, { encoding: 'utf8' }), crlfDelay: Infinity })
  for await (const line of input) if (line) await onLine(line)
}
const csv = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`
const arrayLiteral = (values) => `{${values.filter(Boolean).map((value) => `"${value.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`).join(',')}}`
const codeToType = (code, population) => {
  if (code === 'PPLL') return 'hamlet'
  if (code === 'PPLX') return 'locality'
  if (code.startsWith('PPLA')) return Number(population) >= 100000 ? 'city' : 'town'
  if (code === 'ADM2') return 'district'
  if (code === 'ADM3') return 'taluka'
  if (code === 'PPL') return Number(population) >= 100000 ? 'town' : 'village'
  return null
}

await mkdir(outputDirectory, { recursive: true })
const admin1 = (await readFile(admin1File, 'utf8')).split(/\r?\n/).reduce((map, line) => {
  const [code, name] = line.split('\t')
  if (name) map.set(code, name)
  return map
}, new Map())
const maharashtraCode = [...admin1.entries()].find(([, name]) => name.toLowerCase() === 'maharashtra')?.[0]
if (!maharashtraCode) throw new Error('Could not find Maharashtra in admin1CodesASCII.txt')
const maharashtraAdmin1 = maharashtraCode.includes('.') ? maharashtraCode.split('.')[1] : maharashtraCode
const districts = (await readFile(admin2File, 'utf8')).split(/\r?\n/).reduce((map, line) => {
  const [code, name] = line.split('\t')
  if (code && name) map.set(code, name)
  return map
}, new Map())
const alternateNames = new Map()
await readLines(alternateFile, async (line) => {
  const columns = line.split('\t')
  const id = columns[1]
  if (!id) return
  const language = columns[2]
  const name = columns[3]
  const entry = alternateNames.get(id) || { local: '', variants: [] }
  if (language === 'mr' && !entry.local) {
    entry.local = name
  } else if (language === 'hi' && !entry.local) {
    entry.local = name
  } else if (!['link', 'wkdt', 'post', 'iata', 'icao', 'faac'].includes(language) && !name.startsWith('http') && name) {
    entry.variants.push(name)
  }
  alternateNames.set(id, entry)
})

const writers = []
let rowCount = 0
let outOfBounds = 0
const writeRow = async (row) => {
  if (!writers.length || (splitAt > 0 && writers.at(-1).rows >= splitAt)) {
    const suffix = splitAt > 0 ? `_${writers.length + 1}` : ''
    const path = join(outputDirectory, `places_maharashtra${suffix}.csv`)
    const stream = createWriteStream(path)
    stream.write(header)
    writers.push({ path, stream, rows: 0 })
  }
  const writer = writers.at(-1)
  writer.stream.write(row)
  writer.rows += 1
}
await readLines(mainFile, async (line) => {
  const columns = line.split('\t')
  const [id, name, , , latText, lngText, featureClass, featureCode, country, , admin1Code, admin2Code, , , populationText] = columns
  const population = Number(populationText) || 0
  const isMaharashtra = country === 'IN' && (admin1Code === maharashtraCode || admin1Code === maharashtraAdmin1 || `${country}.${admin1Code}` === maharashtraCode)
  const isTargetFeature = featureClass === 'P' || (featureClass === 'A' && ['ADM2', 'ADM3'].includes(featureCode))
  const type = isMaharashtra && isTargetFeature ? codeToType(featureCode, population) : null
  if (!type) return
  const lat = Number(latText); const lng = Number(lngText)
  if (lat < 6.5 || lat > 37.6 || lng < 68.1 || lng > 97.25) { outOfBounds += 1; return }
  const alternate = alternateNames.get(id) || { local: '', variants: [] }
  const inlineVariants = columns[3] ? columns[3].split(',') : []
  const variants = [...new Set([...inlineVariants, ...alternate.variants].filter((value) => value && value !== name))].slice(0, 40)
  const district = districts.get(`${country}.${admin1Code}.${admin2Code}`) || districts.get(`IN.${admin1Code}.${admin2Code}`) || districts.get(`IN.${admin2Code}`) || (type === 'district' ? name : '')
  await writeRow([name, alternate.local, arrayLiteral(variants), type, district, 'Maharashtra', population, lat, lng, 'geonames', id, 'CC BY 4.0'].map(csv).join(',') + '\n')
  rowCount += 1
})
await Promise.all(writers.map(({ stream }) => new Promise((resolve, reject) => { stream.end(resolve); stream.on('error', reject) })))
console.log(`Wrote ${rowCount} Maharashtra places to ${writers.length} CSV file(s). Coordinates rejected: ${outOfBounds}.`)
for (const writer of writers) {
  const sample = (await readFile(writer.path, 'utf8')).split(/\r?\n/).slice(1, 11)
  console.log(`\n${basename(writer.path)} (${writer.rows} rows)`)
  console.log(sample.join('\n'))
}
