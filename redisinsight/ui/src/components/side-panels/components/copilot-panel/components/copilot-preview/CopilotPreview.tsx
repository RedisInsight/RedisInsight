import React, { useContext } from 'react'
import { EuiIcon } from '@elastic/eui'
import ChatLight from 'uiSrc/assets/img/ai/chat_light.svg'
import ChatDark from 'uiSrc/assets/img/ai/chat_dark.svg'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { Theme } from 'uiSrc/constants'
import styles from './styles.module.scss'

// interface AiMessageWrapperProps {
//   children: React.ReactElement
// }

// const AiAnswerMessageWrapper = ({ children }: AiMessageWrapperProps) => (
//   <div className={styles.answerWrapper}>
//     <div className={styles.avatarWrapper}>
//       <div className={styles.chatbotAvatar}>
//         <EuiIcon aria-label="ai message icon" type={LogoSVG} color="#ffffff" />
//       </div>
//     </div>
//     <div>
//       <div
//         className={cx('jsx-markdown', styles.answer)}
//       >
//         {children}
//       </div>
//     </div>
//   </div>
// )

// const AiQuestionMessageWrapper = ({ children }: AiMessageWrapperProps) => (
//   <div className={styles.questionWrapper}>
//     <div
//       className={cx('jsx-markdown', styles.question)}
//     >
//       {children}
//     </div>
//     <div className={styles.userAvatar}>C</div>
//   </div>
// )

const CopilotPreview = () => {
  const { theme } = useContext(ThemeContext)

  const image = theme === Theme.Light ? ChatLight : ChatDark
  return (
    <div className={styles.wrapper}>
      <EuiIcon
        type={image}
        size="original"
        className={styles.previewIcon}
      />
      {/* <div
        className={styles.history}
      >
        <AiQuestionMessageWrapper>
          <span>What can you do for me?</span>
        </AiQuestionMessageWrapper>
        <AiAnswerMessageWrapper>
          <>
            <p>Glad you asked! I can help you with:</p>
            <br />
            <div> &emsp;- Explaining Redis concepts</div>
            <div> &emsp;- Helping with Redis command syntax</div>
            <div> &emsp;- Simplifying data querying</div>
          </>
        </AiAnswerMessageWrapper>
        <AiQuestionMessageWrapper>
          <span>Sounds great! How do I start?</span>
        </AiQuestionMessageWrapper>
        <AiAnswerMessageWrapper>
          <span>Just let me know what you need help with, and I’ll guide you through it!</span>
        </AiAnswerMessageWrapper>
      </div> */}
      {/* <div className={styles.aiRobotWrapper}>
        <div className={styles.iconWrapper}>
          <EuiIcon type={aiRobotIcon} size="original" className={styles.aiRobotIcon} />
        </div>
      </div> */}
    </div>
  )
}

export default CopilotPreview
