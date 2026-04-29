const STORAGE_KEY = 'codeflow-active-study-plan'
const EVENT_NAME = 'codeflow-study-plan-updated'

export function getJoinedStudyPlanId() {
  try {
    return window.localStorage.getItem(STORAGE_KEY)
  } catch (error) {
    return ''
  }
}

export function joinStudyPlan(planId) {
  try {
    window.localStorage.setItem(STORAGE_KEY, planId)
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { planId } }))
  } catch (error) {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { planId } }))
  }
}

export function onStudyPlanChange(callback) {
  const handler = (event) => {
    callback(event.detail?.planId || getJoinedStudyPlanId())
  }
  const storageHandler = (event) => {
    if (event.key === STORAGE_KEY) callback(event.newValue || '')
  }

  window.addEventListener(EVENT_NAME, handler)
  window.addEventListener('storage', storageHandler)

  return () => {
    window.removeEventListener(EVENT_NAME, handler)
    window.removeEventListener('storage', storageHandler)
  }
}
