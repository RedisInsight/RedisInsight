import { merge } from 'lodash'
import { domainConfig } from './domain'

// Merge domain-related config to default one
merge(window.riConfig, domainConfig)
