import React from 'react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

// Import all SVG components
import AlarmSvg from 'uiSrc/assets/img/alarm.svg?react'
import BanIconSvg from 'uiSrc/assets/img/monitor/ban.svg?react'
import BulkActionsSvg from 'uiSrc/assets/img/icons/bulk_actions.svg?react'
import BulkUploadSvg from 'uiSrc/assets/img/icons/bulk-upload.svg?react'
import ChampagneSvg from 'uiSrc/assets/img/icons/champagne.svg?react'
import CloudLinkSvg from 'uiSrc/assets/img/oauth/cloud_link.svg?react'
import CloudSvg from 'uiSrc/assets/img/oauth/cloud.svg?react'
import ConnectionSvg from 'uiSrc/assets/img/icons/connection.svg?react'
import CopilotSvg from 'uiSrc/assets/img/icons/copilot.svg?react'
import DefaultPluginDarkSvg from 'uiSrc/assets/img/workbench/default_view_dark.svg?react'
import DefaultPluginLightSvg from 'uiSrc/assets/img/workbench/default_view_light.svg?react'
import DislikeSvg from 'uiSrc/assets/img/icons/dislike.svg?react'
import ExecutionTimeSvg from 'uiSrc/assets/img/workbench/execution_time.svg?react'
import ExtendSvg from 'uiSrc/assets/img/icons/extend.svg?react'
import GithubHelpCenterSVG from 'uiSrc/assets/img/github.svg?react'
import GroupModeSvg from 'uiSrc/assets/img/icons/group_mode.svg?react'
import KeyboardShortcutsSvg from 'uiSrc/assets/img/icons/keyboard-shortcuts.svg?react'
import LikeSvg from 'uiSrc/assets/img/icons/like.svg?react'
import MessageInfoSvg from 'uiSrc/assets/img/icons/help_illus.svg?react'
import MinusInCircleSvg from 'uiSrc/assets/img/icons/minus_in_circle.svg?react'
import NoRecommendationsDarkSvg from 'uiSrc/assets/img/icons/recommendations_dark.svg?react'
import NoRecommendationsLightSvg from 'uiSrc/assets/img/icons/recommendations_light.svg?react'
import NotSubscribedIconDarkSvg from 'uiSrc/assets/img/pub-sub/not-subscribed.svg?react'
import NotSubscribedIconLightSvg from 'uiSrc/assets/img/pub-sub/not-subscribed-lt.svg?react'
import PetardSvg from 'uiSrc/assets/img/icons/petard.svg?react'
import PlayFilledSvg from 'uiSrc/assets/img/icons/play-filled.svg?react'
import PlaySvg from 'uiSrc/assets/img/icons/play.svg?react'
import PlusInCircleSvg from 'uiSrc/assets/img/icons/plus_in_circle.svg?react'
import ProfilerSvg from 'uiSrc/assets/img/icons/profiler.svg?react'
import RawModeSvg from 'uiSrc/assets/img/icons/raw_mode.svg?react'
import RedisDbBlueSvg from 'uiSrc/assets/img/icons/redis_db_blue.svg?react'
import RedisLogoFullSvg from 'uiSrc/assets/img/logo.svg?react'
import RedisLogoSvg from 'uiSrc/assets/img/logo_small.svg?react'
import ResetSvg from 'uiSrc/assets/img/rdi/reset.svg?react'
import RocketSvg from 'uiSrc/assets/img/rdi/rocket.svg?react'
import ShrinkSvg from 'uiSrc/assets/img/icons/shrink.svg?react'
import SilentModeSvg from 'uiSrc/assets/img/icons/silent_mode.svg?react'
import SnoozeSvg from 'uiSrc/assets/img/icons/snooze.svg?react'
import StarsSvg from 'uiSrc/assets/img/icons/stars.svg?react'
import StopIconSvg from 'uiSrc/assets/img/rdi/stopFilled.svg?react'
import SubscribedIconDarkSvg from 'uiSrc/assets/img/pub-sub/subscribed.svg?react'
import SubscribedIconLightSvg from 'uiSrc/assets/img/pub-sub/subscribed-lt.svg?react'
import SurveySvg from 'uiSrc/assets/img/survey_icon.svg?react'
import TextViewIconDarkSvg from 'uiSrc/assets/img/workbench/text_view_dark.svg?react'
import TextViewIconLightSvg from 'uiSrc/assets/img/workbench/text_view_light.svg?react'
import ThreeDotsSvg from 'uiSrc/assets/img/icons/three_dots.svg?react'
import TriggerIcon from 'uiSrc/assets/img/bulb.svg?react'
import UserInCircleSvg from 'uiSrc/assets/img/icons/user_in_circle.svg?react'
import UserSvg from 'uiSrc/assets/img/icons/user.svg?react'
import VersionSvg from 'uiSrc/assets/img/icons/version.svg?react'
import VisTagCloudSvg from 'uiSrc/assets/img/workbench/vis_tag_cloud.svg?react'

// Define icon components
export const AlarmIcon = (props: IconProps) => (
  <Icon icon={AlarmSvg} {...props} isSvg />
)

export const BannedIcon = (props: IconProps) => (
  <Icon icon={BanIconSvg} {...props} isSvg />
)

export const BulkActionsIcon = (props: IconProps) => (
  <Icon icon={BulkActionsSvg} {...props} isSvg />
)

export const BulkUploadIcon = (props: IconProps) => (
  <Icon icon={BulkUploadSvg} {...props} isSvg />
)

export const ChampagneIcon = (props: IconProps) => (
  <Icon icon={ChampagneSvg} {...props} isSvg />
)

export const CloudIcon = (props: IconProps) => (
  <Icon icon={CloudSvg} {...props} isSvg />
)

export const CloudLinkIcon = (props: IconProps) => (
  <Icon icon={CloudLinkSvg} {...props} isSvg />
)

export const ConnectionIcon = (props: IconProps) => (
  <Icon icon={ConnectionSvg} {...props} isSvg />
)

export const CopilotIcon = (props: IconProps) => (
  <Icon icon={CopilotSvg} {...props} isSvg />
)

export const DefaultPluginDarkIcon = (props: IconProps) => (
  <Icon icon={DefaultPluginDarkSvg} {...props} isSvg />
)

export const DefaultPluginLightIcon = (props: IconProps) => (
  <Icon icon={DefaultPluginLightSvg} {...props} isSvg />
)

export const DislikeIcon = (props: IconProps) => (
  <Icon icon={DislikeSvg} {...props} isSvg />
)

export const ExecutionTimeIcon = (props: IconProps) => (
  <Icon icon={ExecutionTimeSvg} {...props} isSvg />
)

export const ExtendIcon = (props: IconProps) => (
  <Icon icon={ExtendSvg} {...props} isSvg />
)

export const GithubHelpCenterIcon = (props: IconProps) => (
  <Icon icon={GithubHelpCenterSVG} {...props} isSvg />
)

export const GroupModeIcon = (props: IconProps) => (
  <Icon icon={GroupModeSvg} {...props} isSvg />
)

export const KeyboardShortcutsIcon = (props: IconProps) => (
  <Icon icon={KeyboardShortcutsSvg} {...props} isSvg />
)

export const LikeIcon = (props: IconProps) => (
  <Icon icon={LikeSvg} {...props} isSvg />
)

export const MessageInfoIcon = (props: IconProps) => (
  <Icon icon={MessageInfoSvg} {...props} isSvg />
)

export const MinusInCircleIcon = (props: IconProps) => (
  <Icon icon={MinusInCircleSvg} {...props} isSvg />
)

export const NoRecommendationsDarkIcon = (props: IconProps) => (
  <Icon icon={NoRecommendationsDarkSvg} {...props} isSvg />
)

export const NoRecommendationsLightIcon = (props: IconProps) => (
  <Icon icon={NoRecommendationsLightSvg} {...props} isSvg />
)

export const NotSubscribedDarkIcon = (props: IconProps) => (
  <Icon icon={NotSubscribedIconDarkSvg} {...props} isSvg />
)

export const NotSubscribedLightIcon = (props: IconProps) => (
  <Icon icon={NotSubscribedIconLightSvg} {...props} isSvg />
)

export const PetardIcon = (props: IconProps) => (
  <Icon icon={PetardSvg} {...props} isSvg />
)

export const PlayFilledIcon = (props: IconProps) => (
  <Icon icon={PlayFilledSvg} {...props} isSvg />
)

export const PlayIcon = (props: IconProps) => (
  <Icon icon={PlaySvg} {...props} isSvg />
)

export const PlusInCircleIcon = (props: IconProps) => (
  <Icon icon={PlusInCircleSvg} {...props} isSvg />
)

export const ProfilerIcon = (props: IconProps) => (
  <Icon icon={ProfilerSvg} {...props} isSvg />
)

export const RawModeIcon = (props: IconProps) => (
  <Icon icon={RawModeSvg} {...props} isSvg />
)

export const RedisDbBlueIcon = (props: IconProps) => (
  <Icon icon={RedisDbBlueSvg} {...props} isSvg />
)

export const RedisLogo = (props: IconProps) => (
  <Icon icon={RedisLogoSvg} {...props} isSvg />
)

export const RedisLogoFullIcon = (props: IconProps) => (
  <Icon icon={RedisLogoFullSvg} {...props} isSvg />
)

export const RiResetIcon = (props: IconProps) => (
  <Icon icon={ResetSvg} {...props} isSvg />
)

export const RiRocketIcon = (props: IconProps) => (
  <Icon icon={RocketSvg} {...props} isSvg />
)

export const RiStarsIcon = (props: IconProps) => (
  <Icon icon={StarsSvg} {...props} isSvg />
)

export const RiStopIcon = (props: IconProps) => (
  <Icon icon={StopIconSvg} {...props} isSvg />
)

export const RiUserIcon = (props: IconProps) => (
  <Icon icon={UserSvg} {...props} isSvg />
)

export const ShrinkIcon = (props: IconProps) => (
  <Icon icon={ShrinkSvg} {...props} isSvg />
)

export const SilentModeIcon = (props: IconProps) => (
  <Icon icon={SilentModeSvg} {...props} isSvg />
)

export const SnoozeIcon = (props: IconProps) => (
  <Icon icon={SnoozeSvg} {...props} isSvg />
)

export const SubscribedDarkIcon = (props: IconProps) => (
  <Icon icon={SubscribedIconDarkSvg} {...props} isSvg />
)

export const SubscribedLightIcon = (props: IconProps) => (
  <Icon icon={SubscribedIconLightSvg} {...props} isSvg />
)

export const SurveyIcon = (props: IconProps) => (
  <Icon icon={SurveySvg} {...props} isSvg />
)

export const TextViewIconDarkIcon = (props: IconProps) => (
  <Icon icon={TextViewIconDarkSvg} {...props} isSvg />
)

export const TextViewIconLightIcon = (props: IconProps) => (
  <Icon icon={TextViewIconLightSvg} {...props} isSvg />
)

export const ThreeDotsIcon = (props: IconProps) => (
  <Icon icon={ThreeDotsSvg} {...props} isSvg />
)

export const Trigger = (props: IconProps) => (
  <Icon icon={TriggerIcon} {...props} isSvg />
)

export const UserInCircle = (props: IconProps) => (
  <Icon icon={UserInCircleSvg} {...props} isSvg />
)

export const VersionIcon = (props: IconProps) => (
  <Icon icon={VersionSvg} {...props} isSvg />
)

export const VisTagCloudIcon = (props: IconProps) => (
  <Icon icon={VisTagCloudSvg} {...props} isSvg />
)
