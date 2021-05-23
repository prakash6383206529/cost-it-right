import {
  checkForDecimalAndNull,
  getConfigurationKey,
} from '../../../../../helper'

const trimNo = getConfigurationKey()

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
    return checkForDecimalAndNull(
      (1000 * cuttingSpeed) / (3.14 * diameter),
      trimNo.NumberOfDecimalForWeightCalculation,
    )
  }
}

export const feedByMin = (feedRev, rpm) => {
  if (!feedRev || !rpm) {
    return ''
  } else {
    return checkForDecimalAndNull(
      feedRev * rpm,
      trimNo.NumberOfDecimalForWeightCalculation,
    )
  }
}

export const clampingTime = (cutTime, clampingTimePercent) => {
  if (!cutTime || !clampingTimePercent) {
    return ''
  } else {
    return checkForDecimalAndNull(
      (cutTime * clampingTimePercent) / 100,
      trimNo.NumberOfDecimalForWeightCalculation,
    )
  }
}

export const totalMachineTime = (cutTime, clampingTimeValue) => {
  if (!cutTime || !clampingTimeValue) {
    return ''
  } else {
    return checkForDecimalAndNull(
      cutTime + clampingTimeValue,
      trimNo.NumberOfDecimalForWeightCalculation,
    )
  }
}
