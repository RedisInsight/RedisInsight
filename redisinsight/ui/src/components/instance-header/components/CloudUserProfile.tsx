import React from 'react'
import { useSelector } from 'react-redux'
import { cloudUserProfileSelector } from 'uiSrc/slices/user/cloud-user-profile'
import UserProfile from 'uiSrc/components/instance-header/components/user-profile/UserProfile'

export const CloudUserProfile = () => {
  const { data, error } = useSelector(cloudUserProfileSelector)
  if (!data?.name) {
    return null
  }

  return (
    <UserProfile error={error} data={data} />
  )
}
