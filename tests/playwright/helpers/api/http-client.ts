import axios, { AxiosInstance } from 'axios'
import https from 'https'

interface CustomAxiosInstance extends AxiosInstance {
    setHeaders: (headers: Record<string, string>) => void
}

export class HttpClient {
    private apiUrl: string

    private apiClient: CustomAxiosInstance

    constructor(apiUrl: string) {
        this.apiUrl = apiUrl
        console.log('+++apiUrl+++', this.apiUrl)
        this.apiClient = axios.create({
            baseURL: this.apiUrl,
            headers: {},
            httpsAgent: new https.Agent({
                rejectUnauthorized: false, // Allows self-signed/invalid SSL certs
            }),
        }) as CustomAxiosInstance

        // Attach setHeaders method to allow setting headers dynamically
        this.apiClient.setHeaders = (headers: Record<string, string>) => {
            Object.assign(this.apiClient.defaults.headers.common, headers)
        }

        // Enable logging if DEBUG is set
        if (process.env.DEBUG) {
            this.apiClient.interceptors.request.use((request) => {
                console.log('Starting Request', request)
                return request
            })
            this.apiClient.interceptors.response.use(
                (response) => {
                    console.log('Response:', response)
                    return response
                },
                (error) => {
                    console.error('Error Response:', error.response)
                    return Promise.reject(error)
                },
            )
        }
    }

    getClient(): CustomAxiosInstance {
        return this.apiClient
    }
}
