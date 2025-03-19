import React from "react"
import cx from "classnames"
import { EuiBadge, EuiButton, EuiIcon, EuiImage, EuiLink, EuiTextColor, EuiToolTip } from "@elastic/eui"
import {
  ArrowDiagonalIcon,
  CaretRightIcon,
  CheckThinIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ColumnsIcon,
  CopyIcon,
  DeleteIcon,
  DoubleChevronRightIcon,
  DownloadIcon,
  EraserIcon,
  IndicatorExcludedIcon,
  InfoIcon,
  RefreshIcon,
  ResetIcon,
  RocketIcon,
  SendIcon,
  SettingsIcon,
  StarsIcon,
  ToastPlusIcon,
  UploadIcon
} from "@redislabsdev/redis-ui-icons"
import { RedisLogoDarkMinIcon } from "@redislabsdev/redis-ui-icons/multicolor"
import { EXTERNAL_LINKS, UTM_CAMPAINGS } from "uiSrc/constants/links"
import CloudIcon from "uiSrc/assets/img/oauth/cloud.svg?react"
import BulkActionsIcon from "uiSrc/assets/img/icons/bulk_actions.svg?react"
import RedisLogo from "uiSrc/assets/img/logo_small.svg"
import RawModeIcon from "uiSrc/assets/img/icons/raw_mode.svg?react"
import GroupModeIcon from "uiSrc/assets/img/icons/group_mode.svg?react"
import GithubSVG from "uiSrc/assets/img/sidebar/github.svg"
import CopilotIcon from "uiSrc/assets/img/icons/copilot.svg?react"
import { getUtmExternalLink } from "uiSrc/utils/links"
import { OAuthSocialSource } from "uiSrc/slices/interfaces"
import { DestructiveButton, OutlineButton, PrimaryButton } from "uiSrc/components/ui/buttons"
import { IconBulkActions, IconGroup, IconRawMode, IconTrigger, IconUserInCircle } from "uiSrc/components/ui/icon"
import styles from "./demo.module.scss"

export const Demo = () => (
  <div style={{
      display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "50px", margin: "25px", marginBottom: "100px"
  }}>
    <h1 style={{gridColumnStart: "1", gridColumnEnd: "5", textAlign: "center", marginTop: "25px", fontSize: "30px"}}>Buttons</h1>
    <span>EUI</span><span>RUI</span><span>EUI</span><span>RUI</span>
    {/* @formatter:off */}
    <EuiButton fill color="secondary" size="s" className={styles.popoverApproveBtn}>Analyze</EuiButton>
    <PrimaryButton size="small" className={styles.popoverApproveBtn}>Analyze</PrimaryButton>
    <EuiButton fill color="secondary" iconType="playFilled" iconSide="left" size="s">New Report</EuiButton>
    <PrimaryButton icon={CaretRightIcon} size="small">New Report</PrimaryButton>
    <EuiButton fill color="secondary" iconType="arrowRight" iconSide="right" className={styles.nextPage} size="m">Next</EuiButton>
    <PrimaryButton icon={ChevronRightIcon} iconSide="right" className={styles.nextPageRedisUi}>Next</PrimaryButton>
    <EuiButton fill color="secondary" iconType="arrowLeft" iconSide="left" size="s" className={styles.prevPage}>Back</EuiButton>
    <PrimaryButton icon={ChevronLeftIcon} className={styles.prevPageRedisUi} size="small">Back</PrimaryButton>
    <EuiButton type="secondary" size="s" iconType={ResetIcon} className={styles.pipelineBtn}>Reset Pipeline</EuiButton>
    <OutlineButton size="small" icon={ResetIcon} className={styles.pipelineBtn}>Reset Pipeline</OutlineButton>
    <EuiButton color="secondary" fill size="m" className={styles.customBtn}>Save</EuiButton>
    <PrimaryButton className={styles.customBtn}>Save</PrimaryButton>
    <EuiButton type="secondary" size="s" className={styles.pipelineBtn}>Start Pipeline</EuiButton>
    <OutlineButton size="small" className={styles.pipelineBtn}>Start Pipeline</OutlineButton>
    <EuiButton type="secondary" size="s" className={styles.pipelineBtn}>Stop Pipeline</EuiButton>
    <OutlineButton size="small" className={styles.pipelineBtn}>Stop Pipeline</OutlineButton>
    <EuiButton fill className={styles.feedbackBtn} color="secondary" size="s"><EuiLink external={false} className={styles.link} href={EXTERNAL_LINKS.recommendationFeedback} target="_blank"><EuiIcon className={styles.githubIcon} type={GithubSVG} />To Github</EuiLink></EuiButton>
    <PrimaryButton className={styles.feedbackBtn} size="small"><EuiLink external={false} className={styles.link} href={EXTERNAL_LINKS.recommendationFeedback} target="_blank"><EuiIcon className={styles.githubIcon} type={GithubSVG} />To Github</EuiLink></PrimaryButton>
    <EuiButton className={styles.btnSubmit} color="secondary" size="s" fill iconType="iInCircle" disabled>Submit</EuiButton>
    <PrimaryButton className={styles.btnSubmit} size="small" icon={InfoIcon} disabled>Submit</PrimaryButton>
    <EuiButton className={styles.btnSubmit} color="secondary" size="s" fill>+ Upload <span className={styles.hideText}>tutorial</span></EuiButton>
    <PrimaryButton className={styles.btnSubmit} size="small">+ Upload <span className={styles.hideText}>tutorial</span></PrimaryButton>
    <EuiButton className={styles.btn} size="s"><EuiImage className={styles.logo} src={RedisLogo} alt="" /><span>Cloud sign in</span></EuiButton>
    <OutlineButton className={styles.btn} size="small" icon={RedisLogoDarkMinIcon}>Cloud sign in</OutlineButton>
    <EuiButton className={styles.button}>Cancel</EuiButton>
    <OutlineButton className={styles.button}>Cancel</OutlineButton>
    <EuiButton className={styles.stringFooterBtn} size="s" color="secondary" iconType="download" iconSide="right">Download</EuiButton>
    <OutlineButton className={styles.stringFooterBtn} size="small" icon={DownloadIcon} iconSide="right">Download</OutlineButton>
    <EuiButton className={styles.stringFooterBtn} size="s" color="secondary">Load all</EuiButton>
    <OutlineButton className={styles.stringFooterBtn} size="small">Load all</OutlineButton>
    <EuiButton color="secondary" className="btn-cancel btn-back"><EuiTextColor>Cancel</EuiTextColor></EuiButton>
    <OutlineButton className="btn-cancel btn-back"><EuiTextColor>Cancel</EuiTextColor></OutlineButton>
    <EuiButton color="secondary" className="btn-cancel btn-back">Back to adding databases</EuiButton>
    <OutlineButton  className="btn-cancel btn-back">Back to adding databases</OutlineButton>
    <EuiButton color="secondary" className="btn-cancel">Cancel</EuiButton>
    <OutlineButton  className="btn-cancel">Cancel</OutlineButton>
    <EuiButton color="secondary" className={cx(styles.typeBtn, styles.small)}>title</EuiButton>
    <OutlineButton className={cx(styles.typeBtn, styles.small)}>title</OutlineButton>
    <EuiButton color="secondary" className={styles.cancelBtn}>Cancel</EuiButton>
    <OutlineButton className={styles.cancelBtn}>Cancel</OutlineButton>
    <EuiButton color="secondary" className={styles.cancelBtn}>Close</EuiButton>
    <OutlineButton className={styles.cancelBtn}>Close</OutlineButton>
    <EuiButton color="secondary" className={styles.cancelBtn}>Stop</EuiButton>
    <OutlineButton className={styles.cancelBtn}>Stop</OutlineButton>
    <EuiButton color="secondary" className={styles.footerBtn}>Cancel</EuiButton>
    <OutlineButton className={styles.footerBtn}>Cancel</OutlineButton>
    <EuiButton color="secondary" className={styles.typeBtn} href={getUtmExternalLink(EXTERNAL_LINKS.tryFree, { campaign: UTM_CAMPAINGS[OAuthSocialSource.AddDbForm], })} target="_blank"><EuiBadge color="subdued" className={styles.freeBadge}>Free</EuiBadge><RocketIcon className={cx(styles.btnIcon, styles.rocket)} />New database</EuiButton>
    <OutlineButton className={styles.typeBtn}><EuiBadge color="subdued" className={styles.freeBadge}>Free</EuiBadge><RocketIcon className={cx(styles.btnIcon, styles.rocket)} />New database</OutlineButton>
    <EuiButton color="secondary" className={styles.typeBtn}><CloudIcon className={styles.btnIcon} />Add databases</EuiButton>
    <OutlineButton className={styles.typeBtn}>
      <span style={{display: 'flex', alignItems: 'center',flexDirection: 'column', maxHeight: '100%'}}><CloudIcon className={styles.btnIcon} />Add databases</span>
    </OutlineButton>
    <EuiButton color="secondary" fill size="s" className={styles.popoverBtn}>Run</EuiButton>
    <PrimaryButton size="small" className={styles.popoverBtn}>Run</PrimaryButton>
    <EuiButton color="secondary" fill size="s">+ Add RDI Endpoint</EuiButton>
    <PrimaryButton size="small">+ Add RDI Endpoint</PrimaryButton>
    <EuiButton color="secondary" fill size="s">Add Pipeline</EuiButton>
    <PrimaryButton size="small">Add Pipeline</PrimaryButton>
    <EuiButton color="secondary" fill size="s">Databases page</EuiButton>
    <PrimaryButton size="small">Databases page</PrimaryButton>
    <EuiButton color="secondary" iconType="arrowLeft" size="s" className={styles.backBtn}>Back</EuiButton>
    <OutlineButton icon={ChevronLeftIcon} className={styles.backBtn}>Back</OutlineButton>
    <EuiButton color="secondary" size="s" className={styles.btn}>Cancel</EuiButton>
    <OutlineButton size="small" className={styles.btn}>Cancel</OutlineButton>
    <EuiButton color="secondary" size="s" className={styles.popoverBtn}>Change Database</EuiButton>
    <OutlineButton size="small" className={styles.popoverBtn}>Change Database</OutlineButton>
    <EuiButton color="secondary" size="s" fill style={{ marginLeft: 8 }}>Next</EuiButton>
    <PrimaryButton size="small" style={{ marginLeft: 8 }}>Next</PrimaryButton>
    <EuiButton color="secondary" size="s" fill style={{ marginLeft: 8 }}>Take me back</EuiButton>
    <PrimaryButton size="small" style={{ marginLeft: 8 }}>Take me back</PrimaryButton>
    <EuiButton color="secondary" size="s" fill>Show me around</EuiButton>
    <PrimaryButton size="small">Show me around</PrimaryButton>
    <EuiButton color="secondary" size="s" style={{ marginRight: '16px' }}>SQL and JMESPath Editor</EuiButton>
<OutlineButton size="small" style={{ marginRight: '16px' }}>SQL and JMESPath Editor</OutlineButton>
    <EuiButton color="secondary" size="s">Back</EuiButton>
<OutlineButton size="small">Back</OutlineButton>
    <EuiButton color="secondary" size="s">Cancel</EuiButton>
<OutlineButton size="small">Cancel</OutlineButton>
    <EuiButton color="secondary"><EuiTextColor color="default">Cancel</EuiTextColor></EuiButton>
    <OutlineButton><EuiTextColor color="default">Cancel</EuiTextColor></OutlineButton>
    <EuiButton color="secondary">Cancel</EuiButton>
    <OutlineButton>Cancel</OutlineButton>
    <EuiButton fill color="secondary" className={styles.addInstanceBtn}><span>+ Add Redis database</span></EuiButton>
    <PrimaryButton className={styles.addInstanceBtn}><span>+ Add Redis database</span></PrimaryButton>
    <EuiButton fill color="secondary" className={styles.clusterBtn}>Ok</EuiButton>
    <PrimaryButton className={styles.clusterBtn}>Ok</PrimaryButton>
    <EuiButton fill color="secondary" className={styles.editBtn}><EuiIcon type="pencil" /></EuiButton>
    <PrimaryButton className={styles.editBtn}><EuiIcon type="pencil" /></PrimaryButton>
    <EuiButton fill color="secondary" className={styles.footerBtn} size="m" type="submit">Claim</EuiButton>
    <PrimaryButton className={styles.footerBtn}>Claim</PrimaryButton>
    <EuiButton fill color="secondary" className={styles.loadDataBtn}>Load sample data</EuiButton>
    <PrimaryButton className={styles.loadDataBtn}>Load sample data</PrimaryButton>
    <EuiButton fill color="secondary" >Discover</EuiButton>
    <PrimaryButton >Discover</PrimaryButton>
    <EuiButton fill color="secondary" iconType={IconTrigger}>Explore</EuiButton>
    <PrimaryButton icon={IconTrigger}>Explore</PrimaryButton>
    <EuiButton fill color="secondary" size="s" >Test Connection</EuiButton>
    <PrimaryButton size="small" >Test Connection</PrimaryButton>
    <EuiButton fill color="secondary" size="s" className={styles.agreementsAccept} type="button">I accept</EuiButton>
    <PrimaryButton size="small" className={styles.agreementsAccept} type="button">I accept</PrimaryButton>
    <EuiButton fill color="secondary" size="s" href="/" target="_blank">Quick start</EuiButton>
    <PrimaryButton size="small">Quick start</PrimaryButton>
    <EuiButton fill color="secondary" size="s">Analyze Database</EuiButton>
    <PrimaryButton size="small">Analyze Database</PrimaryButton>
    <EuiButton fill color="secondary" size="s">Apply</EuiButton>
    <PrimaryButton size="small">Apply</PrimaryButton>
    <EuiButton fill color="secondary" size="s">Dry Run</EuiButton>
    <PrimaryButton size="small">Dry Run</PrimaryButton>
    <EuiButton fill color="secondary" size="s">Text</EuiButton>
    <PrimaryButton size="small">Text</PrimaryButton>
    <EuiButton fill color="secondary" size="s">Tutorial</EuiButton>
    <PrimaryButton size="small">Tutorial</PrimaryButton>
    <EuiButton fill color="secondary" target="_blank" href="https://redisinsight.io/" size="s">Get Started For Free</EuiButton>
    <PrimaryButton size="small">Get Started For Free</PrimaryButton>
    <EuiButton fill color="secondary" type="submit" iconType="iInCircle">Add Primary Group</EuiButton>
    <PrimaryButton icon={InfoIcon}>Add Primary Group</PrimaryButton>
    <EuiButton fill color="secondary" type="submit">Publish</EuiButton>
    <PrimaryButton>Publish</PrimaryButton>
    <EuiButton fill color="secondary"><span>+ Endpoint</span></EuiButton>
    <PrimaryButton><span>+ Endpoint</span></PrimaryButton>
    <EuiButton fill color="secondary">Create</EuiButton>
    <PrimaryButton>Create</PrimaryButton>
    <EuiButton fill color="secondary">Save</EuiButton>
    <PrimaryButton>Save</PrimaryButton>
    <EuiButton fill color="secondary">Upload</EuiButton>
    <PrimaryButton>Upload</PrimaryButton>
    <EuiButton fill iconType="refresh" color="secondary">Start New</EuiButton>
    <PrimaryButton icon={RefreshIcon}>Start New</PrimaryButton>
    <EuiButton fill iconType={StarsIcon} iconSide="right" className={styles.btn} color="secondary">Start Tutorial</EuiButton>
    <PrimaryButton icon={StarsIcon} iconSide="right" className={styles.btn}>Start Tutorial</PrimaryButton>
    <EuiButton fill iconType={StarsIcon} iconSide="right" className={styles.btn} color="secondary">Workbench</EuiButton>
    <PrimaryButton icon={StarsIcon} iconSide="right" className={styles.btn}>Workbench</PrimaryButton>
    <EuiButton fill isDisabled isLoading={false} color="secondary" className={styles.button} >Select account</EuiButton>
    <PrimaryButton disabled className={styles.button} >Select account</PrimaryButton>
    <EuiButton fill isDisabled={false} isLoading color="secondary" className={styles.button} >Create database</EuiButton>
    <PrimaryButton loading className={styles.button} >Create database</PrimaryButton>
    <EuiButton fill size="m" color="secondary" className="btn-add">Add Key</EuiButton>
    <PrimaryButton size="medium" className="btn-add">Add Key</PrimaryButton>
    <EuiButton fill size="m" color="secondary" iconType="iInCircle">Add selected Databases</EuiButton>
    <PrimaryButton size="medium" icon={InfoIcon}>Add selected Databases</PrimaryButton>
    <EuiButton fill size="m" color="secondary" iconType="iInCircle">Show databases</EuiButton>
    <PrimaryButton size="medium" icon={InfoIcon}>Show databases</PrimaryButton>
    <EuiButton fill size="m" color="secondary">+ Add Redis database</EuiButton>
    <PrimaryButton size="medium">+ Add Redis database</PrimaryButton>
    <EuiButton fill size="m" color="secondary">Create Index</EuiButton>
    <PrimaryButton size="medium">Create Index</PrimaryButton>
    <EuiButton fill size="m" color="secondary">Remove</EuiButton>
    <PrimaryButton size="medium">Remove</PrimaryButton>
    <EuiButton fill size="m" color="secondary">Save</EuiButton>
    <PrimaryButton size="medium">Save</PrimaryButton>
    <EuiButton fill size="m" color="secondary">View Databases</EuiButton>
    <PrimaryButton size="medium">View Databases</PrimaryButton>
    <EuiButton fill size="s" className={styles.btn}>Insert template</EuiButton>
    <PrimaryButton size="small" className={styles.btn}>Insert template</PrimaryButton>
    <EuiButton fill size="s" className={styles.toastSuccessBtn}>Ok</EuiButton>
    <PrimaryButton size="small" className={styles.toastSuccessBtn}>Ok</PrimaryButton>
    <EuiButton fill size="s" color="secondary" className={cx(styles.textBtn, styles.activeBtn)}>by Length</EuiButton>
    <PrimaryButton size="small" className={cx(styles.textBtn, styles.activeBtn)}>by Length</PrimaryButton>
    <EuiButton fill size="s" color="secondary" className={cx(styles.textBtn)}>by Memory</EuiButton>
    <PrimaryButton size="small" className={cx(styles.textBtn)}>by Memory</PrimaryButton>
    <EuiButton fill size="s" color="secondary" className={cx(styles.textBtn)}>by Memory</EuiButton>
    <PrimaryButton size="small" className={cx(styles.textBtn)}>by Memory</PrimaryButton>
    <EuiButton fill size="s" color="secondary" className={cx(styles.textBtn)}>by Number of Keys</EuiButton>
    <PrimaryButton size="small" className={cx(styles.textBtn)}>by Number of Keys</PrimaryButton>
    <EuiButton fill size="s" color="secondary" className={styles.addKey}>+ <span className={styles.addKeyText}>Key</span></EuiButton>
    <PrimaryButton size="small" className={styles.addKey}>+ <span className={styles.addKeyText}>Key</span></PrimaryButton>
    <EuiButton fill size="s" color="secondary">Get Started For Free</EuiButton>
    <PrimaryButton size="small">Get Started For Free</PrimaryButton>
    <EuiButton fill size="s" color="secondary" className={styles.btn} role="button" iconType={CopilotIcon} />
    <PrimaryButton size="medium" className={styles.btn} role="button" icon={StarsIcon} />
    <EuiButton fill size="s" color="secondary" className={styles.btn} role="button" iconType={IconTrigger}><span className={styles.highlighting} /></EuiButton>
    <PrimaryButton size="small" className={styles.btn} role="button" icon={IconTrigger}/>
    <EuiButton fill size="s" color="secondary" className={styles.buttonSubscribe} type="submit" iconType={IconUserInCircle}>Unsubscribe</EuiButton>
    <PrimaryButton size="small" className={styles.buttonSubscribe} type="submit" icon={IconUserInCircle}>Unsubscribe</PrimaryButton>
    <EuiButton fill size="s" color="secondary" className={styles.confirmBtn}>Restart</EuiButton>
    <PrimaryButton size="small" className={styles.confirmBtn}>Restart</PrimaryButton>
    <EuiButton fill size="s" color="secondary" className={styles.openTutorialsBtn}>Open tutorials</EuiButton>
    <PrimaryButton size="small" className={styles.openTutorialsBtn}>Open tutorials</PrimaryButton>
    <EuiButton fill size="s" color="secondary" className={styles.popoverBtn}>Deploy</EuiButton>
    <PrimaryButton size="small" className={styles.popoverBtn}>Deploy</PrimaryButton>
    <EuiButton fill size="s" color="secondary" className={styles.submitBtn} iconType={SendIcon} type="submit" />
    <PrimaryButton size="small" className={styles.submitBtn} icon={SendIcon} type="submit" />
    <EuiButton fill size="s" color="secondary" className={styles.uploadApproveBtn}>Upload</EuiButton>
    <PrimaryButton size="small" className={styles.uploadApproveBtn}>Upload</PrimaryButton>
    <EuiButton fill size="s" color="secondary" iconType="iInCircle">Add Primary Group</EuiButton>
    <PrimaryButton size="small" icon={InfoIcon}>Add Primary Group</PrimaryButton>
    <EuiButton fill size="s" color="secondary" iconType="playFilled" iconSide="right" className={styles.uploadApproveBtn}>Execute</EuiButton>
    <PrimaryButton size="small" icon={CaretRightIcon} iconSide="right" className={styles.uploadApproveBtn}>Execute</PrimaryButton>
    <EuiButton fill size="s" color="secondary" iconType="refresh" className={styles.btn}>Reset Profiler</EuiButton>
    <PrimaryButton size="small" icon={RefreshIcon} className={styles.btn}>Reset Profiler</PrimaryButton>
    <EuiButton fill size="s" color="secondary" iconType={GroupModeIcon} className={cx(styles.btn, styles.textBtn)}>Group results</EuiButton>
    <PrimaryButton size="small" icon={IconGroup} className={cx(styles.btn, styles.textBtn)}>Group results</PrimaryButton>
    <EuiButton fill size="s" color="secondary" iconType={RawModeIcon} className={cx(styles.btn, styles.textBtn)}>Raw mode</EuiButton>
    <PrimaryButton size="small" icon={IconRawMode} className={cx(styles.btn, styles.textBtn)}>Raw mode</PrimaryButton>
    <EuiButton fill size="s" color="secondary" iconType={RocketIcon}>Deploy Pipeline</EuiButton>
    <PrimaryButton size="small" icon={RocketIcon}>Deploy Pipeline</PrimaryButton>
    <EuiButton fill size="s" color="secondary" style={{ marginLeft: 25, height: 26, }} className={styles.btn}><EuiToolTip content="Warning message" position="top" display="inlineBlock"><EuiIcon type="iInCircle" /></EuiToolTip>Scan more</EuiButton>
    <PrimaryButton size="small" style={{ marginLeft: 25, height: 26, }} className={styles.btn}><EuiToolTip content="Warning message" position="top" display="inlineBlock"><EuiIcon type="iInCircle" /></EuiToolTip>Scan more</PrimaryButton>
    <EuiButton fill size="s" color="secondary" type="submit" disabled iconType="iInCircle">Submit</EuiButton>
    <PrimaryButton size="small" type="submit" disabled icon={InfoIcon}>Submit</PrimaryButton>
    <EuiButton fill size="s" color="secondary" type="submit" disabled={false}>Submit</EuiButton>
    <PrimaryButton size="small" type="submit" disabled={false}>Submit</PrimaryButton>
    <EuiButton fill size="s" color="secondary" type="submit" iconType="iInCircle" style={{ marginLeft: 12 }}>Discover Database</EuiButton>
    <PrimaryButton size="small" type="submit" icon={InfoIcon} style={{ marginLeft: 12 }}>Discover Database</PrimaryButton>
    <EuiButton fill size="s" color="secondary" type="submit" iconType="iInCircle">Add Database</EuiButton>
    <PrimaryButton size="small" type="submit" icon={InfoIcon}>Add Database</PrimaryButton>
    <EuiButton fill size="s" color="secondary" type="submit" iconType="iInCircle">Submit</EuiButton>
    <PrimaryButton size="small" type="submit" icon={InfoIcon}>Submit</PrimaryButton>
    <EuiButton fill size="s" color="secondary" type="submit" iconType="iInCircle">text</EuiButton>
    <PrimaryButton size="small" type="submit" icon={InfoIcon}>text</PrimaryButton>
    <EuiButton fill size="s" color="secondary" type="submit">Ok</EuiButton>
    <PrimaryButton size="small" type="submit">Ok</PrimaryButton>
    <EuiButton fill size="s" color="secondary">Apply</EuiButton>
    <PrimaryButton size="small">Apply</PrimaryButton>
    <EuiButton fill size="s" color="secondary">Connect</EuiButton>
    <PrimaryButton size="small">Connect</PrimaryButton>
    <EuiButton fill size="s" color="secondary">Create Redis Cloud database</EuiButton>
    <PrimaryButton size="small">Create Redis Cloud database</PrimaryButton>
    <EuiButton fill size="s" color="secondary">Create</EuiButton>
    <PrimaryButton size="small">Create</PrimaryButton>
    <EuiButton fill size="s" color="secondary">Import</EuiButton>
    <PrimaryButton size="small">Import</PrimaryButton>
    <EuiButton fill size="s" color="secondary">Remove all API keys</EuiButton>
    <PrimaryButton size="small">Remove all API keys</PrimaryButton>
    <EuiButton fill size="s" color="secondary">Restart</EuiButton>
    <PrimaryButton size="small">Restart</PrimaryButton>
    <EuiButton fill size="s" color="secondary">Retry</EuiButton>
    <PrimaryButton size="small">Retry</PrimaryButton>
    <EuiButton fill size="s" color="secondary">Statistics</EuiButton>
    <PrimaryButton size="small">Statistics</PrimaryButton>
    <EuiButton fill size="s" color="secondary">Download from server</EuiButton>
    <PrimaryButton size="small">Download from server</PrimaryButton>
    <EuiButton fill size="s" color="warning" className="toast-danger-btn">Cancel</EuiButton>
    <DestructiveButton size="small" className="toast-danger-btn">Cancel</DestructiveButton>
    <EuiButton fill size="s" color="warning" className="toast-danger-btn">Ok</EuiButton>
    <DestructiveButton size="small" className="toast-danger-btn">Ok</DestructiveButton>
    <EuiButton fill size="s" color="warning" className="toast-danger-btn">Remove API key</EuiButton>
    <DestructiveButton size="small" className="toast-danger-btn">Remove API key</DestructiveButton>
    <EuiButton fill size="s" color="warning" className="toast-danger-btn">Remove API key</EuiButton>
    <DestructiveButton size="small" className="toast-danger-btn">Remove API key</DestructiveButton>
    <EuiButton fill size="s" color="warning" className={styles.deleteApproveBtn}>Delete</EuiButton>
    <DestructiveButton size="small" className={styles.deleteApproveBtn}>Delete</DestructiveButton>
    <EuiButton fill size="s" color="warning" download="error-log.txt" href="/" className="toast-danger-btn">Download Error Log File</EuiButton>
    <DestructiveButton size="small" className="toast-danger-btn">Download Error Log File</DestructiveButton>
    <EuiButton fill size="s" color="warning" iconType="eraser">Clear</EuiButton>
    <DestructiveButton size="small" icon={EraserIcon}>Clear</DestructiveButton>
    <EuiButton fill size="s" color="warning" iconType="trash">Delete</EuiButton>
    <DestructiveButton size="small" icon={DeleteIcon}>Delete</DestructiveButton>
    <EuiButton fill size="s" color="warning" iconType="trash">Remove all API keys</EuiButton>
    <DestructiveButton size="small" icon={DeleteIcon}>Remove all API keys</DestructiveButton>
    <EuiButton fill size="s" color="warning" iconType="trash">Remove</EuiButton>
    <DestructiveButton size="small" icon={DeleteIcon}>Remove</DestructiveButton>
    <EuiButton fill size="s" color="warning">Acknowledge</EuiButton>
    <DestructiveButton size="small">Acknowledge</DestructiveButton>
    <EuiButton fill size="s" color="warning">Proceed</EuiButton>
    <DestructiveButton size="small">Proceed</DestructiveButton>
    <EuiButton fill size="s" iconType="playFilled" iconSide="right" color="secondary">Execute</EuiButton>
    <PrimaryButton size="small" icon={CaretRightIcon} iconSide="right">Execute</PrimaryButton>
    <EuiButton fill size="s" iconType="popout" color="secondary" className={cx(styles.btn)}>Launch database</EuiButton>
    <PrimaryButton size="small" icon={ArrowDiagonalIcon} className={cx(styles.btn)}>Launch database</PrimaryButton>
    <EuiButton fill size="s" iconType="popout" isLoading color="secondary" className={cx(styles.btn)}>Launch database</EuiButton>
    <PrimaryButton size="small" icon={ArrowDiagonalIcon} loading className={cx(styles.btn)}>Launch database</PrimaryButton>
    <EuiButton fill size="s" iconType="popout" isDisabled color="secondary" className={cx(styles.btn)}>Launch database</EuiButton>
    <PrimaryButton size="small" icon={ArrowDiagonalIcon} disabled className={cx(styles.btn)}>Launch database</PrimaryButton>
    <EuiButton fill size="s" color="secondary">Save</EuiButton>
    <PrimaryButton size="small">Save</PrimaryButton>
    <EuiButton fill={false} size="s" color="secondary" className={styles.buttonSubscribe} type="submit" iconType="minusInCircle">Subscribe</EuiButton>
    <OutlineButton size="small" className={styles.buttonSubscribe} icon={IndicatorExcludedIcon}>Subscribe</OutlineButton>
    <EuiButton iconType="check" iconSide="right" color="success" size="s" className={cx(styles.actionBtn, styles.runBtn)}>Run</EuiButton>
    <OutlineButton icon={CheckThinIcon} iconSide="right" size="small" className={cx(styles.actionBtn, styles.runBtn)}>Run</OutlineButton>
    <EuiButton iconType="check" iconSide="right" color="success" size="s" isDisabled className={cx(styles.actionBtn, styles.runBtn)}>Run</EuiButton>
    <OutlineButton icon={CheckThinIcon} iconSide="right" size="small" disabled className={cx(styles.actionBtn, styles.runBtn)}>Run</OutlineButton>
    <EuiButton iconType="check" iconSide="right" color="success" size="s" isLoading className={cx(styles.actionBtn, styles.runBtn)}>Run</EuiButton>
    <OutlineButton icon={CheckThinIcon} iconSide="right" size="small" loading className={cx(styles.actionBtn, styles.runBtn)}>Run</OutlineButton>
    <EuiButton iconType="copy" size="s" className={cx(styles.actionBtn, styles.copyBtn)}>Copy</EuiButton>
    <OutlineButton icon={CopyIcon} size="small" className={cx(styles.actionBtn, styles.copyBtn)}>Copy</OutlineButton>
    <EuiButton iconType="play" iconSide="right" color="success" size="s" className={cx(styles.actionBtn, styles.runBtn)}>Dry run</EuiButton>
    <OutlineButton icon={CaretRightIcon} iconSide="right" size="small" className={cx(styles.actionBtn, styles.runBtn)}>Dry run</OutlineButton>
    <EuiButton iconType="play" iconSide="right" color="success" size="s" className={cx(styles.actionBtn, styles.runBtn)}>Run</EuiButton>
    <OutlineButton icon={CaretRightIcon} iconSide="right" size="small" className={cx(styles.actionBtn, styles.runBtn)}>Run</OutlineButton>
    <EuiButton iconType="playFilled" className={cx(styles.btn, styles.submitButton)}>Run</EuiButton>
    <OutlineButton icon={CaretRightIcon} className={cx(styles.btn, styles.submitButton)}>Run</OutlineButton>
    <EuiButton iconSide="right" iconType="indexRuntime" size="s" className={styles.button} fullWidth color="secondary">Upload</EuiButton>
    <OutlineButton iconSide="right" icon={UploadIcon} size="small" className={styles.button}>Upload</OutlineButton>
    <EuiButton isLoading iconSide="right" iconType="indexRuntime" size="s" className={styles.button} fullWidth color="secondary">Upload</EuiButton>
    <OutlineButton iconSide="right" icon={UploadIcon} size="small" className={styles.button} loading>Upload</OutlineButton>
    <EuiButton size="s" color="secondary" className={styles.ackBtn}>ACK</EuiButton>
    <OutlineButton size="small" className={styles.ackBtn}>ACK</OutlineButton>
    <EuiButton size="s" color="secondary" className={styles.claimBtn}>CLAIM</EuiButton>
    <OutlineButton size="small" className={styles.claimBtn}>CLAIM</OutlineButton>
    <EuiButton size="s" color="secondary" className="btn-cancel" style={{ marginRight: 12 }}>Cancel</EuiButton>
    <OutlineButton size="small" className="btn-cancel" style={{ marginRight: 12 }}>Cancel</OutlineButton>
    <EuiButton size="s" color="secondary" className="btn-cancel">Cancel</EuiButton>
    <OutlineButton size="small" className="btn-cancel">Cancel</OutlineButton>
    <EuiButton size="s" color="secondary" className="infiniteMessage__btn">Cancel</EuiButton>
    <OutlineButton size="small" className="infiniteMessage__btn">Cancel</OutlineButton>
    <EuiButton size="s" color="secondary" iconType="copy">Clone</EuiButton>
    <OutlineButton size="small" icon={CopyIcon}>Clone</OutlineButton>
    <EuiButton size="s" color="secondary" iconType="copy">Clone Connection</EuiButton>
    <OutlineButton size="small" icon={CopyIcon}>Clone Connection</OutlineButton>
    <EuiButton size="s" color="secondary" iconType="download" className={styles.btn}>Download Log</EuiButton>
    <OutlineButton size="small" icon={DownloadIcon} className={styles.btn}>Download Log</OutlineButton>
    <EuiButton size="s" color="secondary" iconType="eraser" className={styles.restartSessionBtn}>Restart session</EuiButton>
    <OutlineButton size="small" icon={EraserIcon} className={styles.restartSessionBtn}>Restart session</OutlineButton>
    <EuiButton size="s" color="secondary" iconType="kqlFunction" className={styles.btnOpen}>Open</EuiButton>
    <OutlineButton size="small" icon={DoubleChevronRightIcon} className={styles.btnOpen}>Open</OutlineButton>
    <EuiButton size="s" color="secondary" iconType={BulkActionsIcon} className={styles.bulkActions}><span className={styles.bulkActionsText}>Bulk Actions</span></EuiButton>
    <OutlineButton size="small" icon={IconBulkActions} className={styles.bulkActions}>Bulk Actions</OutlineButton>
    <EuiButton size="s" color="secondary" iconType={ColumnsIcon} className={styles.columnsButton}><span className={styles.columnsButtonText}>Columns</span></EuiButton>
    <OutlineButton size="small" icon={ColumnsIcon} className={styles.columnsButton}><span className={styles.columnsButtonText}>Columns</span></OutlineButton>
    <EuiButton size="s" color="secondary">Cancel</EuiButton>
    <OutlineButton size="small">Cancel</OutlineButton>
    <EuiButton size="s" color="secondary">Connection Settings</EuiButton>
    <OutlineButton size="small">Connection Settings</OutlineButton>
    <EuiButton size="s" color="warning" className="toast-danger-btn euiBorderWidthThick">Disable Encryption</EuiButton>
    <DestructiveButton size="small" className="toast-danger-btn euiBorderWidthThick">Disable Encryption</DestructiveButton>
    <EuiButton size="s" color="warning" className="toast-danger-btn euiBorderWidthThick">Go to Settings</EuiButton>
    <DestructiveButton size="small" className="toast-danger-btn euiBorderWidthThick">Go to Settings</DestructiveButton>
    <EuiButton size="s" iconType="gear" color="secondary">Configure</EuiButton>
    <OutlineButton size="small" icon={SettingsIcon}>Configure</OutlineButton>
    <EuiButton size="s" iconType="plusInCircle" color="secondary">title</EuiButton>
    <OutlineButton size="small" icon={ToastPlusIcon}>title</OutlineButton>
    <EuiButton type="submit" fill size="s" color="secondary" iconType="iInCircle">Apply Changes</EuiButton>
    <PrimaryButton size="small" icon={InfoIcon}>Apply Changes</PrimaryButton>
    {/* @formatter:on */}
  </div>
)
