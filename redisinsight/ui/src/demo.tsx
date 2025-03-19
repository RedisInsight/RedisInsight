import React from "react"
import cx from "classnames"
import {
  EuiBadge,
  EuiButton,
  EuiIcon,
  EuiImage,
  EuiLink,
  EuiTextColor,
  EuiToolTip
} from "@elastic/eui"
import {
  ColumnsIcon,
  ResetIcon,
  RocketIcon
} from "@redislabsdev/redis-ui-icons"
import CloudIcon from "uiSrc/assets/img/oauth/cloud.svg?react"
import BulkActionsIcon from "uiSrc/assets/img/icons/bulk_actions.svg?react"
import StarsIcon from "uiSrc/assets/img/icons/stars.svg?react"
import RedisLogo from "uiSrc/assets/img/logo_small.svg"
import { EXTERNAL_LINKS, UTM_CAMPAINGS } from "uiSrc/constants/links"
import RawModeIcon from "uiSrc/assets/img/icons/raw_mode.svg?react"
import GroupModeIcon from "uiSrc/assets/img/icons/group_mode.svg?react"
import GithubSVG from "uiSrc/assets/img/sidebar/github.svg"
import CopilotIcon from "uiSrc/assets/img/icons/copilot.svg?react"
import SendIcon from "uiSrc/assets/img/icons/send.svg?react"
import TriggerIcon from "uiSrc/assets/img/bulb.svg?react"
import { getUtmExternalLink } from "uiSrc/utils/links"
import { OAuthSocialSource } from "uiSrc/slices/interfaces"
import UserInCircle from "uiSrc/assets/img/icons/user_in_circle.svg?react"
import styles from "./demo.module.scss"

export const Demo = () => (
  <div>
    {/* @formatter:off */}
    <EuiButton fill color="secondary" iconSide="left" size="s" className={styles.popoverApproveBtn}>Analyze</EuiButton>
    <EuiButton fill color="secondary" iconType="playFilled" iconSide="left" size="s">New Report</EuiButton>
    <EuiButton fill color="secondary" iconType="arrowRight" iconSide="right" className={styles.nextPage} size="m">Next</EuiButton>
    <EuiButton fill color="secondary" iconType="arrowLeft" iconSide="left" size="s" className={styles.prevPage}>Back</EuiButton>
    <EuiButton type="secondary" size="s" iconType={ResetIcon} className={cx(styles.pipelineBtn)}>Reset Pipeline</EuiButton>
    <EuiButton color="secondary" fill size="m" className={styles.customBtn}>Save</EuiButton>
    <EuiButton type="secondary" size="s" className={cx(styles.pipelineBtn)}>Start Pipeline</EuiButton>
    <EuiButton type="secondary" size="s" className={cx(styles.pipelineBtn)}>Stop Pipeline</EuiButton>
    <EuiButton fill className={styles.feedbackBtn} color="secondary" size="s"><EuiLink external={false} className={styles.link} href={EXTERNAL_LINKS.recommendationFeedback} target="_blank" data-test-subj="github-repo-link"><EuiIcon className={styles.githubIcon} type={GithubSVG} />To Github</EuiLink></EuiButton>
    <EuiButton className={styles.btnSubmit} color="secondary" size="s" fill iconType="iInCircle" disabled>Submit</EuiButton>
    <EuiButton className={styles.btnSubmit} color="secondary" size="s" fill>+ Upload <span className={styles.hideText}>tutorial</span></EuiButton>
    <EuiButton className={styles.btn} size="s"><EuiImage className={styles.logo} src={RedisLogo} alt="" /><span>Cloud sign in</span></EuiButton>
    <EuiButton className={styles.button} aria-labelledby="close oauth select account dialog">Cancel</EuiButton>
    <EuiButton className={styles.button} aria-labelledby="close oauth select plan dialog">Cancel</EuiButton>
    <EuiButton className={styles.stringFooterBtn} size="s" color="secondary" iconType="download" iconSide="right">Download</EuiButton>
    <EuiButton className={styles.stringFooterBtn} size="s" color="secondary">Load all</EuiButton>
    <EuiButton color="secondary" className="btn-cancel btn-back"><EuiTextColor>Cancel</EuiTextColor></EuiButton>
    <EuiButton color="secondary" className="btn-cancel btn-back"><EuiTextColor>Cancel</EuiTextColor></EuiButton>
    <EuiButton color="secondary" className="btn-cancel btn-back"><EuiTextColor>Cancel</EuiTextColor></EuiButton>
    <EuiButton color="secondary" className="btn-cancel btn-back"><EuiTextColor>Cancel</EuiTextColor></EuiButton>
    <EuiButton color="secondary" className="btn-cancel btn-back"><EuiTextColor>Cancel</EuiTextColor></EuiButton>
    <EuiButton color="secondary" className="btn-cancel btn-back"><EuiTextColor>Cancel</EuiTextColor></EuiButton>
    <EuiButton color="secondary" className="btn-cancel btn-back"><EuiTextColor>Cancel</EuiTextColor></EuiButton>
    <EuiButton color="secondary" className="btn-cancel btn-back"><EuiTextColor>Cancel</EuiTextColor></EuiButton>
    <EuiButton color="secondary" className="btn-cancel btn-back">Back to adding databases</EuiButton>
    <EuiButton color="secondary" className="btn-cancel btn-back">Back to adding databases</EuiButton>
    <EuiButton color="secondary" className="btn-cancel btn-back">Back to adding databases</EuiButton>
    <EuiButton color="secondary" className="btn-cancel btn-back">Back to adding databases</EuiButton>
    <EuiButton color="secondary" className="btn-cancel btn-back">Back to adding databases</EuiButton>
    <EuiButton color="secondary" className="btn-cancel btn-back">Back to adding databases</EuiButton>
    <EuiButton color="secondary" className="btn-cancel btn-back">Back to adding databases</EuiButton>
    <EuiButton color="secondary" className="btn-cancel">Cancel</EuiButton>
    <EuiButton color="secondary" className="btn-cancel">Cancel</EuiButton>
    <EuiButton color="secondary" className="btn-cancel">Cancel</EuiButton>
    <EuiButton color="secondary" className="btn-cancel">Cancel</EuiButton>
    <EuiButton color="secondary" className={cx(styles.typeBtn, styles.small)}>title</EuiButton>
    <EuiButton color="secondary" className={styles.cancelBtn}>Cancel</EuiButton>
    <EuiButton color="secondary" className={styles.cancelBtn}>Cancel</EuiButton>
    <EuiButton color="secondary" className={styles.cancelBtn}>Close</EuiButton>
    <EuiButton color="secondary" className={styles.cancelBtn}>Close</EuiButton>
    <EuiButton color="secondary" className={styles.cancelBtn}>Stop</EuiButton>
    <EuiButton color="secondary" className={styles.footerBtn}>Cancel</EuiButton>
    <EuiButton color="secondary" className={styles.typeBtn} href={getUtmExternalLink(EXTERNAL_LINKS.tryFree, { campaign: UTM_CAMPAINGS[OAuthSocialSource.AddDbForm], })} target="_blank"><EuiBadge color="subdued" className={styles.freeBadge}>Free</EuiBadge><RocketIcon className={cx(styles.btnIcon, styles.rocket)} />New database</EuiButton>
    <EuiButton color="secondary" className={styles.typeBtn}><CloudIcon className={styles.btnIcon} />Add databases</EuiButton>
    <EuiButton color="secondary" fill size="s" className={styles.popoverBtn}>Run</EuiButton>
    <EuiButton color="secondary" fill size="s">+ Add RDI Endpoint</EuiButton>
    <EuiButton color="secondary" fill size="s">Add Pipeline</EuiButton>
    <EuiButton color="secondary" fill size="s">Databases page</EuiButton>
    <EuiButton color="secondary" iconType="arrowLeft" size="s" className={styles.backBtn}>Back</EuiButton>
    <EuiButton color="secondary" size="s" className={styles.btn}>Cancel</EuiButton>
    <EuiButton color="secondary" size="s" className={styles.popoverBtn}>Change Database</EuiButton>
    <EuiButton color="secondary" size="s" fill style={{ marginLeft: 8 }}>Next</EuiButton>
    <EuiButton color="secondary" size="s" fill style={{ marginLeft: 8 }}>Take me back</EuiButton>
    <EuiButton color="secondary" size="s" fill>Show me around</EuiButton>
    <EuiButton color="secondary" size="s" style={{ marginRight: '16px' }}>SQL and JMESPath Editor</EuiButton>
    <EuiButton color="secondary" size="s">Back</EuiButton>
    <EuiButton color="secondary" size="s">Cancel</EuiButton>
    <EuiButton color="secondary" type="button" size="s">Back</EuiButton>
    <EuiButton color="secondary"><EuiTextColor color="default">Cancel</EuiTextColor></EuiButton>
    <EuiButton color="secondary">Cancel</EuiButton>
    <EuiButton fill color="secondary" className={styles.addInstanceBtn}><span>+ Add Redis database</span></EuiButton>
    <EuiButton fill color="secondary" className={styles.clusterBtn}>Ok</EuiButton>
    <EuiButton fill color="secondary" className={styles.editBtn}><EuiIcon type="pencil" /></EuiButton>
    <EuiButton fill color="secondary" className={styles.footerBtn} size="m" type="submit">Claim</EuiButton>
    <EuiButton fill color="secondary" className={styles.loadDataBtn}>Load sample data</EuiButton>
    <EuiButton fill color="secondary" disabled={false}>Discover</EuiButton>
    <EuiButton fill color="secondary" iconType={TriggerIcon}>Explore</EuiButton>
    <EuiButton fill color="secondary" size="s" aria-labelledby="test target connections">Test Connection</EuiButton>
    <EuiButton fill color="secondary" size="s" className={styles.agreementsAccept} type="button">I accept</EuiButton>
    <EuiButton fill color="secondary" size="s" href="/" target="_blank">Quick start</EuiButton>
    <EuiButton fill color="secondary" size="s">Analyze Database</EuiButton>
    <EuiButton fill color="secondary" size="s">Apply</EuiButton>
    <EuiButton fill color="secondary" size="s">Dry Run</EuiButton>
    <EuiButton fill color="secondary" size="s">Text</EuiButton>
    <EuiButton fill color="secondary" size="s">Tutorial</EuiButton>
    <EuiButton fill color="secondary" target="_blank" href="https://redisinsight.io/" size="s">Get Started For Free</EuiButton>
    <EuiButton fill color="secondary" type="submit" iconType="iInCircle">Add Primary Group</EuiButton>
    <EuiButton fill color="secondary" type="submit">Publish</EuiButton>
    <EuiButton fill color="secondary"><span>+ Endpoint</span></EuiButton>
    <EuiButton fill color="secondary">Create</EuiButton>
    <EuiButton fill color="secondary">Save</EuiButton>
    <EuiButton fill color="secondary">Upload</EuiButton>
    <EuiButton fill iconType="refresh" color="secondary">Start New</EuiButton>
    <EuiButton fill iconType="refresh" color="secondary">Start New</EuiButton>
    <EuiButton fill iconType={StarsIcon} iconSide="right" className={styles.btn} color="secondary">Start Tutorial</EuiButton>
    <EuiButton fill iconType={StarsIcon} iconSide="right" className={styles.btn} color="secondary">Workbench</EuiButton>
    <EuiButton fill isDisabled isLoading={false} color="secondary" className={styles.button} aria-labelledby="submit oauth select account dialog">Select account</EuiButton>
    <EuiButton fill isDisabled={false} isLoading color="secondary" className={styles.button} aria-labelledby="submit oauth select plan dialog">Create database</EuiButton>
    <EuiButton fill size="m" color="secondary" className="btn-add">Add Key</EuiButton>
    <EuiButton fill size="m" color="secondary" iconType="iInCircle">Add selected Databases</EuiButton>
    <EuiButton fill size="m" color="secondary" iconType="iInCircle">Show databases</EuiButton>
    <EuiButton fill size="m" color="secondary">+ Add Redis database</EuiButton>
    <EuiButton fill size="m" color="secondary">Create Index</EuiButton>
    <EuiButton fill size="m" color="secondary">Remove</EuiButton>
    <EuiButton fill size="m" color="secondary">Save</EuiButton>
    <EuiButton fill size="m" color="secondary">View Databases</EuiButton>
    <EuiButton fill size="s" className={styles.btn}>Insert template</EuiButton>
    <EuiButton fill size="s" className={styles.toastSuccessBtn}>Ok</EuiButton>
    <EuiButton fill size="s" color="secondary" className={cx(styles.textBtn, styles.activeBtn)}>by Length</EuiButton>
    <EuiButton fill size="s" color="secondary" className={cx(styles.textBtn)}>by Memory</EuiButton>
    <EuiButton fill size="s" color="secondary" className={cx(styles.textBtn)}>by Memory</EuiButton>
    <EuiButton fill size="s" color="secondary" className={cx(styles.textBtn)}>by Number of Keys</EuiButton>
    <EuiButton fill size="s" color="secondary" className={styles.addKey}>+ <span className={styles.addKeyText}>Key</span></EuiButton>
    <EuiButton fill size="s" color="secondary">Get Started For Free</EuiButton>
    <EuiButton fill size="s" color="secondary" className={styles.btn} role="button" iconType={CopilotIcon} />
    <EuiButton fill size="s" color="secondary" className={styles.btn} role="button" iconType={TriggerIcon}><span className={styles.highlighting} /></EuiButton>
    <EuiButton fill size="s" color="secondary" className={styles.buttonSubscribe} type="submit" iconType={UserInCircle}>Unsubscribe</EuiButton>
    <EuiButton fill size="s" color="secondary" className={styles.confirmBtn}>Restart</EuiButton>
    <EuiButton fill size="s" color="secondary" className={styles.openTutorialsBtn}>Open tutorials</EuiButton>
    <EuiButton fill size="s" color="secondary" className={styles.popoverBtn}>Deploy</EuiButton>
    <EuiButton fill size="s" color="secondary" className={styles.submitBtn} iconType={SendIcon} type="submit" />
    <EuiButton fill size="s" color="secondary" className={styles.uploadApproveBtn}>Upload</EuiButton>
    <EuiButton fill size="s" color="secondary" iconType="iInCircle">Add Primary Group</EuiButton>
    <EuiButton fill size="s" color="secondary" iconType="playFilled" iconSide="right" className={styles.uploadApproveBtn}>Execute</EuiButton>
    <EuiButton fill size="s" color="secondary" iconType="refresh" className={styles.btn}>Reset Profiler</EuiButton>
    <EuiButton fill size="s" color="secondary" iconType={GroupModeIcon} className={cx(styles.btn, styles.textBtn)}>Group results</EuiButton>
    <EuiButton fill size="s" color="secondary" iconType={RawModeIcon} className={cx(styles.btn, styles.textBtn)}>Raw mode</EuiButton>
    <EuiButton fill size="s" color="secondary" iconType={RocketIcon}>Deploy Pipeline</EuiButton>
    <EuiButton fill size="s" color="secondary" style={{ marginLeft: 25, height: 26, }} className={styles.btn}><EuiToolTip content="Warning message" position="top" display="inlineBlock"><EuiIcon type="iInCircle" /></EuiToolTip>Scan more</EuiButton>
    <EuiButton fill size="s" color="secondary" type="submit" disabled iconType="iInCircle">Submit</EuiButton>
    <EuiButton fill size="s" color="secondary" type="submit" disabled={false}>Submit</EuiButton>
    <EuiButton fill size="s" color="secondary" type="submit" iconType="iInCircle" style={{ marginLeft: 12 }}>Discover Database</EuiButton>
    <EuiButton fill size="s" color="secondary" type="submit" iconType="iInCircle">Add Database</EuiButton>
    <EuiButton fill size="s" color="secondary" type="submit" iconType="iInCircle">Submit</EuiButton>
    <EuiButton fill size="s" color="secondary" type="submit" iconType="iInCircle">text</EuiButton>
    <EuiButton fill size="s" color="secondary" type="submit">Ok</EuiButton>
    <EuiButton fill size="s" color="secondary">Apply</EuiButton>
    <EuiButton fill size="s" color="secondary">Connect</EuiButton>
    <EuiButton fill size="s" color="secondary">Create Redis Cloud database</EuiButton>
    <EuiButton fill size="s" color="secondary">Create</EuiButton>
    <EuiButton fill size="s" color="secondary">Import</EuiButton>
    <EuiButton fill size="s" color="secondary">Remove all API keys</EuiButton>
    <EuiButton fill size="s" color="secondary">Restart</EuiButton>
    <EuiButton fill size="s" color="secondary">Retry</EuiButton>
    <EuiButton fill size="s" color="secondary">Statistics</EuiButton>
    <EuiButton fill size="s" color="secondary">Download from server</EuiButton>
    <EuiButton fill size="s" color="warning" className="toast-danger-btn">Cancel</EuiButton>
    <EuiButton fill size="s" color="warning" className="toast-danger-btn">Ok</EuiButton>
    <EuiButton fill size="s" color="warning" className="toast-danger-btn">Remove API key</EuiButton>
    <EuiButton fill size="s" color="warning" className="toast-danger-btn">Remove API key</EuiButton>
    <EuiButton fill size="s" color="warning" className={styles.deleteApproveBtn}>Delete</EuiButton>
    <EuiButton fill size="s" color="warning" download="error-log.txt" href="/" className="toast-danger-btn">Download Error Log File</EuiButton>
    <EuiButton fill size="s" color="warning" iconType="eraser">Clear</EuiButton>
    <EuiButton fill size="s" color="warning" iconType="trash">Delete</EuiButton>
    <EuiButton fill size="s" color="warning" iconType="trash">Remove all API keys</EuiButton>
    <EuiButton fill size="s" color="warning" iconType="trash">Remove</EuiButton>
    <EuiButton fill size="s" color="warning">Acknowledge</EuiButton>
    <EuiButton fill size="s" color="warning">Proceed</EuiButton>
    <EuiButton fill size="s" iconType="playFilled" iconSide="right" color="secondary">Execute</EuiButton>
    <EuiButton fill size="s" iconType="popout" isDisabled isLoading color="secondary" className={cx(styles.btn)}>Launch database</EuiButton>
    <EuiButton fill size="s" type="submit" color="secondary">Save</EuiButton>
    <EuiButton fill={false} size="s" color="secondary" className={styles.buttonSubscribe} type="submit" iconType="minusInCircle">Subscribe</EuiButton>
    <EuiButton iconType="check" iconSide="right" color="success" size="s" disabled isLoading className={cx(styles.actionBtn, styles.runBtn)}>Run</EuiButton>
    <EuiButton iconType="copy" size="s" className={cx(styles.actionBtn, styles.copyBtn)}>Copy</EuiButton>
    <EuiButton iconType="play" iconSide="right" color="success" size="s" className={cx(styles.actionBtn, styles.runBtn)}>Dry run</EuiButton>
    <EuiButton iconType="play" iconSide="right" color="success" size="s" className={cx(styles.actionBtn, styles.runBtn)}>Run</EuiButton>
    <EuiButton iconType="playFilled" className={cx(styles.btn, styles.submitButton)}>Run</EuiButton>
    <EuiButton isLoading iconSide="right" iconType="indexRuntime" size="s" className={styles.button} fullWidth color="secondary">Upload</EuiButton>
    <EuiButton size="s" color="secondary" className={styles.ackBtn}>ACK</EuiButton>
    <EuiButton size="s" color="secondary" className={styles.claimBtn}>CLAIM</EuiButton>
    <EuiButton size="s" color="secondary" className="btn-cancel" style={{ marginRight: 12 }}>Cancel</EuiButton>
    <EuiButton size="s" color="secondary" className="btn-cancel">Cancel</EuiButton>
    <EuiButton size="s" color="secondary" className="infiniteMessage__btn">Cancel</EuiButton>
    <EuiButton size="s" color="secondary" iconType="copy">Clone</EuiButton>
    <EuiButton size="s" color="secondary" iconType="copy">Clone Connection</EuiButton>
    <EuiButton size="s" color="secondary" iconType="download" className={styles.btn}>Download Log</EuiButton>
    <EuiButton size="s" color="secondary" iconType="eraser" className={styles.restartSessionBtn}>Restart session</EuiButton>
    <EuiButton size="s" color="secondary" iconType="kqlFunction" className={styles.btnOpen}>Open</EuiButton>
    <EuiButton size="s" color="secondary" iconType={BulkActionsIcon} className={styles.bulkActions}><span className={styles.bulkActionsText}>Bulk Actions</span></EuiButton>
    <EuiButton size="s" color="secondary" iconType={ColumnsIcon} className={styles.columnsButton}><span className={styles.columnsButtonText}>Columns</span></EuiButton>
    <EuiButton size="s" color="secondary">Cancel</EuiButton>
    <EuiButton size="s" color="secondary">Connection Settings</EuiButton>
    <EuiButton size="s" color="warning" className="toast-danger-btn euiBorderWidthThick">Disable Encryption</EuiButton>
    <EuiButton size="s" color="warning" className="toast-danger-btn euiBorderWidthThick">Go to Settings</EuiButton>
    <EuiButton size="s" iconType="gear" color="secondary">Configure</EuiButton>
    <EuiButton size="s" iconType="plusInCircle" color="secondary">title</EuiButton>
    <EuiButton type="submit" fill size="s" color="secondary" iconType="iInCircle">Apply Changes</EuiButton>
    <EuiButton type="submit" fill style={{ display: 'none' }}>Submit</EuiButton>
    {/* @formatter:on */}
  </div>
)
