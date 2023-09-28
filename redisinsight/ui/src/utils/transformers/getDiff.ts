export default function getDiff(obj: any, previous: any) {
  Object.keys(obj).forEach((key) =>
    (obj[key] && typeof obj[key] === 'object' && !Object.keys(getDiff(obj[key], previous[key])).length && delete obj[key])
      || ((obj[key] === previous[key] || (obj[key] === '' && !previous[key])) && delete obj[key]))
  return obj
}
