/**
 * Check if current URL is on RDI pipeline management config page
 * Matches pattern: /integrate/{instanceId}/pipeline-management/config
 */
const isRdiPipelineConfigPage = (pathname?: string): boolean => {
  const currentPath = pathname || window.location.pathname
  
  // Match pattern: /integrate/{instanceId}/pipeline-management/config
  const rdiPipelineConfigPattern = /^\/integrate\/[^/]+\/pipeline-management\/(config|jobs\/[^/]+)$/
  
  return rdiPipelineConfigPattern.test(currentPath)
}

export default isRdiPipelineConfigPage 