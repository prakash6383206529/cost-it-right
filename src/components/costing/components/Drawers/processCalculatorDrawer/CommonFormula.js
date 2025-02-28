import { getConfigurationKey } from "../../../../../helper"

export const passesNo = (mr, doc) => {
  if (!mr || !doc) {
    return ''
  } else {
    return Math.ceil(mr / doc)
  }
}

export const findRpm = (cuttingSpeed, diameter) => {
  if (!cuttingSpeed || !diameter) {
    return ''
  } else {
    return (1000 * cuttingSpeed) / (3.14 * diameter)
  }
}

export const feedByMin = (feedRev, rpm) => {
  if (!feedRev || !rpm) {
    return ''
  } else {
    return feedRev * rpm
  }
}

export const clampingTime = (cutTime, clampingTimePercent) => {
  if (!cutTime || !clampingTimePercent) {
    return ''
  } else {
    return (cutTime * clampingTimePercent) / 100
  }
}

export const totalMachineTime = (cutTime, clampingTimeValue) => {
  if (!cutTime || !clampingTimeValue) {
    return ''
  } else {
    return cutTime + clampingTimeValue
  }
}

export const sourceCurrencyFormatter = (currencySource) => {
  return currencySource ? currencySource : getConfigurationKey()?.BaseCurrency
}   
