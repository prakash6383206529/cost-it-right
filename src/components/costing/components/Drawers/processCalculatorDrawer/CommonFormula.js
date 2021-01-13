import {
  checkForDecimalAndNull,
  getConfigurationKey,
} from '../../../../../helper'

const trimNo = getConfigurationKey()

export const passesNo = (mr, doc) => {
  return Math.ceil(mr / doc)
}

export const findRpm = (cuttingSpeed, diameter) => {
  return checkForDecimalAndNull(
    (1000 * cuttingSpeed) / (3.14 * diameter),
    trimNo.NumberOfDecimalForWeightCalculation,
  )
}

export const feedByMin = (feedRev, rpm) => {
  return checkForDecimalAndNull(
    feedRev * rpm,
    trimNo.NumberOfDecimalForWeightCalculation,
  )
}

export const clampingTime = (cutTime, clampingTimePercent) => {
  return checkForDecimalAndNull(
    (cutTime * clampingTimePercent) / 100,
    trimNo.NumberOfDecimalForWeightCalculation,
  )
}

export const totalMachineTime = (cutTime, clampingTimeValue) => {
  return checkForDecimalAndNull(
    cutTime + clampingTimeValue,
    trimNo.NumberOfDecimalForWeightCalculation,
  )
}
