const getUrl = (...path: string[]) => `/instance/${path.join('/')}`

export default getUrl
