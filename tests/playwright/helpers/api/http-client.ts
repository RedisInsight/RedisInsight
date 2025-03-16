import axios, { AxiosInstance } from 'axios'

export class HttpClient {

    private apiUrl: string
    private apiClient: AxiosInstance
    private static instance: HttpClient

    constructor(apiUrl: string) {
        this.apiUrl = apiUrl
        this.apiClient = axios.create({
            baseURL: this.apiUrl, // Change to your API base URL
            httpsAgent: new (require('https').Agent)({
                rejectUnauthorized: false // Allows self-signed/invalid SSL certs
            })
        })

        // Enable logging if DEBUG=1 is set
        if (process.env.DEBUG === '1') {
            this.apiClient.interceptors.request.use(request => {
                console.log('Starting Request', request)
                return request
            })
            this.apiClient.interceptors.response.use(response => {
                console.log('Response:', response)
                return response
            }, error => {
                console.error('Error Response:', error.response)
                return Promise.reject(error)
            })
        }
    }

    getClient(): AxiosInstance {
        return this.apiClient
    }


}
