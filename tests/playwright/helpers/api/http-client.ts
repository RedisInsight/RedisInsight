import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import https from 'https'

// Logging interceptor for requests
const requestLogger = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    console.log('Request:', config.method?.toUpperCase(), config.url)
    console.log('Headers:', config.headers)
    console.log('Body:', config.data)
    return config
}

// Logging interceptor for responses
const responseLogger = (response: AxiosResponse): AxiosResponse => {
    console.log('Response:', response.status, response.data)
    return response
}

export class HttpClient {
    private instance: AxiosInstance

    constructor(baseURL: string) {
        // if (!baseURL) {
        //     throw new Error('No URL must be passed in')
        // }
        this.instance = axios.create({
            baseURL,
            httpsAgent: new https.Agent({
                rejectUnauthorized: false // allow self-signed or invalid certificates
            })
        })

        // Setup interceptors for logging
        this.instance.interceptors.request.use(
            requestLogger,
            error => Promise.reject(error)
        )
        this.instance.interceptors.response.use(
            responseLogger,
            error => Promise.reject(error)
        )
    }

    async get<T>(url: string, headers?: Record<string, string>): Promise<T> {
        const response = await this.instance.get<T>(url, { headers })
        if (!response.data) throw new Error('GET request returned empty response')
        return response.data
    }

    async post<T>(url: string, body: unknown, headers?: Record<string, string>): Promise<T> {
        const response = await this.instance.post<T>(url, body, { headers })
        if (!response.data) throw new Error('Empty response body on POST request')
        return response.data
    }

    async put<T>(url: string, body: unknown, headers?: Record<string, string>): Promise<T> {
        const response = await this.instance.put<T>(url, body, { headers })
        if (!response.data) throw new Error('Empty response body on PUT request')
        return response.data
    }

    async delete<T>(url: string, headers?: Record<string, string>): Promise<T> {
        const response = await this.instance.delete<T>(url, { headers })
        if (!response.data) throw new Error('Empty response body from DELETE request')
        return response.data
    }
}
