import { toast } from 'react-toastify';
import React from 'react';
import 'react-toastify/dist/ReactToastify.css';
import DayTime from '../components/common/DayTimeWrapper';
import { reactLocalStorage } from 'reactjs-localstorage'
import { checkForDecimalAndNull, checkForNull, isNumber } from './validation'
import {
  PLASTIC, SHEET_METAL, WIRING_HARNESS, PLATING, SPRINGS, HARDWARE, NON_FERROUS_LPDDC, MACHINING,
  ELECTRONICS, RIVET, NON_FERROUS_HPDC, RUBBER, NON_FERROUS_GDC, FORGINGNAME, FASTNERS, RIVETS, RMDOMESTIC, RMIMPORT, BOPDOMESTIC, BOPIMPORT, COMBINED_PROCESS, PROCESS, OPERATIONS, SURFACETREATMENT, MACHINERATE, OVERHEAD, PROFIT, EXCHNAGERATE, DISPLAY_G, DISPLAY_KG, DISPLAY_MG, VARIANCE, EMPTY_GUID, ZBCTypeId, DIECASTING, MECHANICAL_PROPRIETARY, ELECTRICAL_PROPRIETARY, LOGISTICS, CORRUGATEDBOX, FABRICATION, FERROUSCASTING, WIREFORMING, ELECTRONICSNAME, ELECTRIC, Assembly, ASSEMBLYNAME, PLASTICNAME,
  RAWMATERIALINDEX,
  VBCTypeId,
  RAW_MATERIAL,
  BOP,
  RAWMATERIAL,
  APPLICABILITY_OVERHEAD,
  APPLICABILITY_OVERHEAD_EXCL,
  APPLICABILITY_PROFIT,
  APPLICABILITY_PROFIT_EXCL,
  APPLICABILITY_OVERHEAD_PROFIT,
  APPLICABILITY_OVERHEAD_PROFIT_EXCL,
  APPLICABILITY_OVERHEAD_EXCL_PROFIT,
  APPLICABILITY_OVERHEAD_EXCL_PROFIT_EXCL,
  TIME,

} from '../config/constants'
import { IsFetchExchangeRateVendorWiseForParts, IsFetchExchangeRateVendorWiseForZBCRawMaterial, IsShowFreightAndShearingCostFields, getConfigurationKey, showBopLabel } from './auth'
import _ from 'lodash';
import TooltipCustom from '../components/common/Tooltip';
import { FORGING, RMDomesticZBC, SHEETMETAL, DIE_CASTING, TOOLING_ID, IdForMultiTechnology } from '../config/masterData';
import Toaster from '../components/common/Toaster';
/**
 * @method  apiErrors
 * @desc Response error handler.
 * @param res
 */
export const apiErrors = (res) => {
  const response = res ? res.response : undefined
  if (response?.data?.error?.message?.value) {
    toast.warning(response.data.error.message.value)
  } else if (response) {
    response && handleHTTPStatus(response)
  } else {
    if (navigator.userAgent.indexOf("Firefox") !== -1) {
      setTimeout(() => {
        toast.error('Something went wrong please try again.')
      }, 600);
      return;
    }
    toast.error('Something went wrong please try again.')
  }
}

/**
 * @method  handleHTTPStatus
 * @desc HANDLE HTTP STATUS CODE IN RESPONSE OF API'S
 * @param response
 */
const handleHTTPStatus = (response) => {
  const toastrOptions = {
    // draggable: true,
    autoClose: false
  }
  switch (response.status) {
    case 202:
      const errMsg202 = response?.data?.Message ? response.data.Message : 'No Data Available.'
      return toast.error(errMsg202)
    case 203:
      const errMsg203 = response?.data?.Message ? response.data.Message : 'Data is inconsistent. Please refresh your session by re-login.'
      return toast.error(errMsg203)
    case 204:
      const errMsg204 = response?.data?.Message ? response.data.Message : 'Intentionally blank for now.'
      return toast.error(errMsg204)
    case 205:
      const errMsg205 = response?.data?.Message ? response.data.Message : 'Please clear your cache for data to reflect.'
      return toast.error(errMsg205)
    case 206:
      const errMsg206 = response?.data?.Message ? response.data.Message : 'The data might not have been updated properly. Please try again to ensure.'
      return toast.error(errMsg206)
    case 300:
    case 301:
    case 302:
    case 303:
      const errMsg303 = response?.data?.Message ? response.data.Message : 'Something is not right. Please contact your IT Team.'
      return toast.error(errMsg303)
    case 400:
      const errMsg400 = response?.data?.Message ? response.data.Message : 'Bad Request. Please contact your IT Team.'
      return toast.error(errMsg400)
    case 401:
      toast.error('Authentication error. Please contact your IT Team.')
      // reactLocalStorage.setObject("isUserLoggedIn", false);
      // reactLocalStorage.setObject("userDetail", {});
      // reactLocalStorage.set('ModuleId', '');
      // window.location.assign('/login');
      return false
    case 403:
      const errMsg403 = response?.data?.Message ? response.data.Message : 'You are not allowed to access this resource. Please contact your IT Team.'
      return toast.error(errMsg403)
    case 404:
      const errMsg404 = response?.data?.Message ? response.data.Message : 'Not found.'
      return toast.error(errMsg404)
    case 405:
      const errMsg405 = response?.data?.Message ? response.data.Message : 'You are not allowed to access this resource. Please contact your IT Team.'
      return toast.error(errMsg405)
    case 406:
      const errMsg406 = response?.data?.Message ? response.data.Message : 'Something is not right. Please contact your IT Team.'
      return toast.error(errMsg406)
    case 409:
    case 411:
    case 414:
    case 416:
    case 427:
      const errMsg427 = response?.data?.Message ? response.data.Message : 'Something is not right. Please contact your IT Team.'
      return toast.error(errMsg427)
    case 407:
      const errMsg407 = response?.data?.Message ? response.data.Message : 'Proxy Authentication Error. Please contact your IT Team.'
      return toast.error(errMsg407)
    case 408:
      const errMsg408 = response?.data?.Message ? response.data.Message : 'Your request has timed out. Please try again after some time.'
      return toast.error(errMsg408)
    case 410:
      const errMsg410 = response?.data?.Message ? response.data.Message : 'The resource you requested no longer exists.'
      return toast.error(errMsg410)
    case 412:
      const errMsg = response?.data?.Message ? response.data.Message : 'Something is not right. Please contact your IT Team.'
      return toast.error(errMsg)
    case 413:
      const errMsg413 = response?.data?.Message ? response.data.Message : "Server can't process such long request. Please contact your IT Team."
      return toast.error(errMsg413)
    case 415:
      const errMsg415 = response?.data?.Message ? response.data.Message : "This request is not supported by the server. Please contact your IT Team."
      return toast.error(errMsg415)
    case 417:
      const errMsg417 = response?.data?.Message ? response.data.Message : 'Something is not right. Please contact your IT Team.'
      return toast.error(errMsg417)
    case 500:
      const errMsg500 = response?.data?.Message ? response.data.Message : 'Internal server error. Please contact your IT Team.'
      return toast.error(errMsg500)
    case 501:
      const errMsg501 = response?.data?.Message ? response.data.Message : 'Something is not right. Please contact your IT Team.'
      return toast.error(errMsg501)
    case 502:
      const errMsg502 = response?.data?.Message ? response.data.Message : 'Server is unavailable or unreachable. Please contact your IT Team.'
      return toast.error(errMsg502)
    case 503:
      const errMsg503 = response?.data?.Message ? response.data.Message : 'Server is unavailable due to load or maintenance. Please contact your IT Team.'
      return toast.error(errMsg503)
    case 504:
      const errMsg504 = response?.data?.Message ? response.data.Message : 'Server is unavailable due to timeout. Please contact your IT Team.'
      return toast.error(errMsg504)
    default:
      return toast.error('Something is not right. Please contact your IT Team')
  }
}

/**
 * @method  capitalizeFirstLetter
 * @desc CAPILIZE FIRST LETTER
 * @param res
 */
export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

/**
 * @method  formatDate
 * @desc FORMATTED DATE
 */
export function formatDate(date) {
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'June',
    'July',
    'Aug',
    'Sept',
    'Oct',
    'Nov',
    'Dec',
  ]
  const day = date.getDate()
  const monthIndex = date.getMonth()
  const year = date.getFullYear()
  return day + ' ' + monthNames[monthIndex] + ' ' + year
}

/**
 * @method  convertISOToUtcDate
 * @desc CONVERT ISO TO UTC DATE
 * @param res
 */
export function convertISOToUtcDate(date) {
  return DayTime(date).format('MM/DD/YYYY')
}

/**
 * @method  convertISOToUtcForTime
 * @desc CONVERT ISO TO TIME
 * @param res
 */
export function convertISOToUtcForTime(date) {
  return DayTime(date).format('hh:mm A')
}

/**
 * @method stripHtml
 * @desc STRIP HTML FROM STRING
 * @param res
 */
export function stripHtml(text) {
  return text?.replace(/<[^>]+>/g, '')
}

/**
 * @method convertDate
 * @desc CONVERT INTO DATE TIME
 */
export function convertDate(date) {
  return DayTime(date).format('DD-MMM-YYYY hh:mm A')
}

/**
 * @method displayDateTimeFormate
 * @desc DISPLAY DATE TIME FORMATE
 */
export function displayDateTimeFormate(date) {
  const currentDate = DayTime()
  const dateObj = DayTime(date)
  if (DayTime(DayTime(date).format('YYYY-MM-DD'), 'YYYY-MM-DD', true).isValid()) {
    // check day difference is not less or grater then zero
    if (checkNumberOfDayDiff(date, currentDate) === 0) {
      const remainingTimeInMinutes = currentDate.diff(dateObj, 'minutes')
      if (remainingTimeInMinutes > 720) {
        return `Today ${DayTime(date, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format(
          'MM/DD/YYYY hh:mm A',
        )}`
      } else if (remainingTimeInMinutes >= 60 && remainingTimeInMinutes < 720) {
        const remainingTimeInHours = currentDate.diff(dateObj, 'hours')
        return `${remainingTimeInHours} hours ago`
      } else if (remainingTimeInMinutes < 60 && remainingTimeInMinutes > 0) {
        return `${remainingTimeInMinutes} min(s) ago`
      } else if (remainingTimeInMinutes === 0) {
        return 'few seconds ago'
      } else {
        return DayTime(date, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format('hh:mm A')
      }
    } else if (
      checkNumberOfDayDiff(date, currentDate) >= 1 &&
      checkNumberOfDayDiff(date, currentDate) <= 7
    ) {
      return DayTime(date).format('ddd hh:mm A')
    } else {
      return DayTime(date, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format(
        'MM/DD/YYYY hh:mm A',
      )
    }
  } else {
    return 'N/A'
  }
}

//let showConnectionAlert = true;
export function requestError(error) { }

/**
 * @method validateText
 * @descriptin RETURN TEXT
 **/
export function validateText(text) {
  let newText = ''
  const numbers =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 '
  for (let i = 0; i < text.length; i++) {
    if (numbers.indexOf(text[i]) > -1) {
      newText = newText + text[i]
    }
  }
  return newText
}

/**
 * @method displayValue
 * @descriptin Used to display value otherwise show N/A
 **/
export const displayValue = (value) => {
  if (
    typeof value !== 'undefined' &&
    typeof value !== 'object' &&
    value.trim() !== ''
  ) {
    return value.trim()
  } else {
    return 'N/A'
  }
}


/**
 * @method convertObjectToArray
 * @descriptin CONVER OBJECT TO ARRAY
 **/
export const convertObjectToArray = (valueArray) => {
  let tempArray = []
  valueArray.map((val) => {
    tempArray.push(val.text)
    return tempArray
  })
}

/**
 * @method getFileExtension
 * @descriptin GET FILE EXTENSION
 **/
export const getFileExtension = (filename) => {
  return filename.split('.').pop()
}

/**
 * @method stringToArray
 * @descriptin CONVER STRING TO ARRAY
 **/
export const stringToArray = (str) => {
  let convertedArray = []
  if (typeof str != undefined && typeof str == 'string') {
    const convertedStr = str.split(',')
    convertedArray = JSON.parse(convertedStr)
  }
  return convertedArray
}

/**
 * @method displayTitle
 * @descriptin DISPLAY TITLE
 **/
export const displayTitle = (text) => {
  return text?.replace(/\r?\n|\r/g, '')
}

export function displayPublishOnDate(date) {
  const currentDate = DayTime().format('YYYY-MM-DD')
  // convert date to validate and check with current date
  const checkValidDate = DayTime(date, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format(
    'YYYY-MM-DD',
  )
  // convert date is valid or not
  if (DayTime(DayTime(checkValidDate).format('YYYY-MM-DD'), 'YYYY-MM-DD', true,).isValid()) {
    // check day difference is not less or grater then zero
    if (checkNumberOfDayDiff(checkValidDate, currentDate) === 0) {
      return DayTime(date, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format('hh:mm A')
    } else if (checkNumberOfDayDiff(checkValidDate, currentDate) === -1) {
      return 'Yesterday'
    } else {
      return DayTime(date, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format('MM/DD/YYYY')
    }
  } else {
    return 'N/A'
  }
}

/**
 * @description GET DAY DIFF
 * @param checkNumberOfDayDiff
 * @returns {string}
 */
export function checkNumberOfDayDiff(date1, date2) {
  let dt1 = new Date(date1)
  let dt2 = new Date(date2)
  return Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) / (1000 * 60 * 60 * 24),)
}

/**
 * @description GET OPTION LIST
 * @param renderOptionList
 * @returns {string}
 */
export function renderOptionList(categoriesMaster) {
  let categoryArray = []
  categoriesMaster.map((val) => {
    let obj = {}
    obj.label = val
    obj.value = val
    categoryArray.push(obj)
    return null
  })
  return categoryArray
}

export function renderAction(menuData = [], Master = '', actionKey = '') { }

/**
 * @description GET MACHINE RATE
 * @param machineRateCalculation
 * @returns {string}
 */
export function machineRateCalculation(Data) {
  const MachineRateCost =
    Data.RateOfInterest +
    Data.TotalDepreciationCost +
    Data.NetPowerCost +
    Data.RateSkilledLabour +
    Data.RateSemiSkilledLabour +
    Data.RateUnskilledLabour +
    Data.RateContractLabour +
    Data.ConsumableCost +
    Data.MaintenanceCharges

  return MachineRateCost
}

/**
 * @description function for get uploaded file extention
 * @param url
 * @returns {string}
 */
export function getFileExtention(url) {
  let ext = ''
  let fileUrl = ''
  if (url.includes('firebasestorage')) {
    fileUrl = url.split('?')
    fileUrl = fileUrl[0].split('.')
    ext = fileUrl[fileUrl.length - 1]
  } else {
    fileUrl = url.split('.')
    ext = fileUrl[fileUrl.length - 1]
  }
  return ext.toUpperCase() + ' '
}

/**
 * @description function for get token header
 * @param customTokenHeader
 * @returns {string}
 */
export function customTokenHeader() {
  const userObj = reactLocalStorage.getObject('userResponse')
  const customHeader = {
    Accept: 'application/json',
    'Content-Type':
      'multipart/form-data; boundary=6ff46e0b6b5148d984f148b6542e5a5d',
    Authorization: `bearer ${userObj.token}`,
  }
  return customHeader
}

/**
 * @description CHECK PERMISSION AND PRIVILEGE
 * @param checkPermission
 * @returns {string}
 */
export function checkPermission(Data) {
  let setAccessibleData = {
    Add: false,
    Edit: false,
    Delete: false,
    View: false,
    Download: false,
    BulkUpload: false,
    Activate: false,
    Copy: false,
    SOB: false,
    SendForReview: false
  }

  Data && Data.map((item) => {
    if ((item.ActionName === 'Add' || item.ActionName === 'Create') && item.IsChecked === true) {
      setAccessibleData.Add = true
    }
    if ((item.ActionName === 'Edit' || item.ActionName === 'Edit All Costing') && item.IsChecked === true) {
      setAccessibleData.Edit = true
    }
    if ((item.ActionName === 'Delete' || item.ActionName === 'Delete My Costing') && item.IsChecked === true) {
      setAccessibleData.Delete = true
    }
    if ((item.ActionName === 'View' || item.ActionName === 'View All Costing') && item.IsChecked === true) {
      setAccessibleData.View = true
    }
    if (item.ActionName === 'Download' && item.IsChecked === true) {
      setAccessibleData.Download = true
    }
    if (item.ActionName === 'Bulk Upload' && item.IsChecked === true) {
      setAccessibleData.BulkUpload = true
    }
    if (item.ActionName === 'Activate' && item.IsChecked === true) {
      setAccessibleData.Activate = true
    }
    if (item.ActionName === 'Copy All Costing' && item.IsChecked === true) {
      setAccessibleData.Copy = true
    }
    if (item.ActionName === 'SOB' && item.IsChecked === true) {
      setAccessibleData.SOB = true
    }
    if (item?.ActionName === 'Send For Review' && item?.IsChecked === true) {
      setAccessibleData.SendForReview = true
    }
    return null;
  })

  return setAccessibleData
}

/**
 * @description CHALCULATE PERCENTAGE 
 * @param calculatePercentage
 * @returns {string}
 */
export function calculatePercentage(value) {
  return value / 100
}

/**
 * @description CALCULATE PERCENTAGE VALUE 
 * @param calculatePercentageValue
 * @returns {string}
 */
export function calculatePercentageValue(value, percent) {
  return value * percent / 100
}
export function calculatePercentageFromValue(BaseValue, input) {
  return (input * 100) / BaseValue
}

/**
 * @description getRandomSixDigit 
 * @returns {number}
 */
export function getRandomSixDigit() {
  return Math.floor(100000 + Math.random() * 900000)
}

/**
 * @description getWeightOfSheet
 * @returns {number}
 */
export function getWeightOfSheet(data) {
  const value = data.Density * (Math.PI / 4) * (Math.pow(data.OuterDiameter, 2) - Math.pow(data.InnerDiameter, 2)) * data.SheetLength
  return checkForNull(value)
}

/**
 * @description getWeightOfPart
 * @returns {number}
 */
export function getWeightOfPart(data) {
  const value = data.Density * (Math.PI / 4) * (Math.pow(data.OuterDiameter, 2) - Math.pow(data.InnerDiameter, 2)) * data.PartLength
  return checkForNull(value)
}

/**
 * @description getWeightOfScrap
 * @returns {number}
 */
export function getWeightOfScrap(data) {
  const value =
    data.Density *
    (Math.PI / 4) *
    (Math.pow(data.OuterDiameter, 2) - Math.pow(data.InnerDiameter, 2)) *
    data.ScrapLength
  return checkForNull(value)
}

/**
 * @description getNetSurfaceArea
 * @returns {number}
 */
export function getNetSurfaceArea(data) {
  const value = Math.PI * data.OuterDiameter * data.PartLengthWithAllowance + (Math.PI / 2) * (Math.pow(data.OuterDiameter, 2) - Math.pow(data.InnerDiameter, 2))
  return checkForNull(value)
}

/**
 * @description getNetSurfaceAreaBothSide
 * @returns {number}
 */
export function getNetSurfaceAreaBothSide(data) {
  const value = Math.PI * data.OuterDiameter * data.PartLengthWithAllowance + Math.PI * data.InnerDiameter * data.PartLengthWithAllowance + (Math.PI / 2) * (Math.pow(data.OuterDiameter, 2) - Math.pow(data.InnerDiameter, 2))
  return checkForNull(value)
}

export const calculationOnTco = (data) => {
  let sum = 0;
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = parseFloat(data[key]);
      if (!isNaN(value)) {
        sum += checkForNull(value);
      }
    }
  }

  return sum;
}

export const TotalTCOCostCal = (tcoData, paymentData) => {
  let sum = 0;
  sum = checkForNull(tcoData?.CalculatedIncoTermValue) + checkForNull(tcoData?.CalculatedQualityPPMValue) + checkForNull(tcoData?.CalculatedWarrantyValue) + checkForNull(paymentData?.NetPaymentTermCost)

  return sum
}

export function formViewData(costingSummary, header = '', isBestCost = false) {
  const setDynamicKeys = (list, value) => {
    let datalist = list && list?.filter(element => element?.Type === 'Other' && element?.SubHeader === value)
    let arr = []
    datalist && datalist?.map(item => {
      let obj = {}
      obj.DynamicHeader = item?.Description
      obj.DynamicApplicabilityCost = item?.ApplicabilityCost
      obj.DynamicPercentage = item?.Value
      obj.DynamicNetCost = item?.NetCost
      arr.push(obj)
    })
    return arr;
  }

  let temp = []
  let dataFromAPI = costingSummary
  let obj = {}
  obj.IsShowCheckBoxForApproval = dataFromAPI?.IsShowCheckBoxForApproval
  obj.zbc = dataFromAPI?.TypeOfCosting || dataFromAPI?.TypeOfCosting === 0 ? dataFromAPI?.TypeOfCosting : '-'
  obj.IsApprovalLocked = dataFromAPI?.IsApprovalLocked !== null ? dataFromAPI?.IsApprovalLocked : '-'
  obj.poPrice = dataFromAPI?.NetPOPrice ? dataFromAPI?.NetPOPrice : '0'
  obj.costingName = dataFromAPI?.DisplayCostingNumber ? dataFromAPI?.DisplayCostingNumber : '-'
  obj.costingDate = dataFromAPI?.CostingDate ? dataFromAPI?.CostingDate : '-'
  obj.CostingNumber = dataFromAPI?.CostingNumber ? dataFromAPI?.CostingNumber : '-'
  obj.status = dataFromAPI?.CostingStatus ? dataFromAPI?.CostingStatus : '-'
  obj.rm = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingRawMaterialsCost?.length > 0 ? dataFromAPI?.CostingPartDetails?.CostingRawMaterialsCost[0]?.RMName : '-'
  obj.gWeight = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetGrossWeight ? dataFromAPI?.CostingPartDetails?.NetGrossWeight : 0
  obj.fWeight = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetFinishWeight ? dataFromAPI?.CostingPartDetails?.NetFinishWeight : 0
  obj.netRM = dataFromAPI?.NetRawMaterialsCost && dataFromAPI?.NetRawMaterialsCost ? dataFromAPI?.NetRawMaterialsCost : 0
  obj.netBOP = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetBoughtOutPartCost ? dataFromAPI?.CostingPartDetails?.NetBoughtOutPartCost : 0
  obj.pCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetProcessCost ? dataFromAPI?.CostingPartDetails?.NetProcessCost : 0
  obj.oCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetOperationCost ? dataFromAPI?.CostingPartDetails?.NetOperationCost : 0
  obj.sTreatment = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.SurfaceTreatmentCost ? dataFromAPI?.CostingPartDetails?.SurfaceTreatmentCost : 0
  obj.nsTreamnt = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetSurfaceTreatmentCost !== undefined ? dataFromAPI?.CostingPartDetails?.NetSurfaceTreatmentCost : 0
  obj.tCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetTransportationCost ? dataFromAPI?.CostingPartDetails?.NetTransportationCost : 0
  obj.nConvCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetConversionCost ? dataFromAPI?.CostingPartDetails?.NetConversionCost : 0
  obj.nTotalRMBOPCC = dataFromAPI?.CostingPartDetails && dataFromAPI?.NetTotalRMBOPCC ? dataFromAPI?.NetTotalRMBOPCC : 0
  obj.netSurfaceTreatmentCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetSurfaceTreatmentCost ? dataFromAPI?.CostingPartDetails?.NetSurfaceTreatmentCost : 0
  obj.RawMaterialCalculatorId = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.RawMaterialCalculatorId ? dataFromAPI?.CostingPartDetails?.RawMaterialCalculatorId : 0
  obj.modelType = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.ModelType ? dataFromAPI?.CostingPartDetails?.ModelType : '-'
  obj.aValue = { applicability: 'Applicability', percentage: 'Percentage (%)', value: 'Value' }
  obj.ForgingScrapWeight = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingRawMaterialsCost.length > 0 ? dataFromAPI?.CostingPartDetails?.CostingRawMaterialsCost[0].ForgingScrapWeight : '-'
  obj.MachiningScrapWeight = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingRawMaterialsCost.length > 0 ? dataFromAPI?.CostingPartDetails?.CostingRawMaterialsCost[0].MachiningScrapWeight : '-'
  obj.BasicRate = (dataFromAPI && dataFromAPI.BasicRate) ? dataFromAPI.BasicRate : 0
  obj.BudgetedPrice = (dataFromAPI && dataFromAPI.BudgetedPrice) ? dataFromAPI.BudgetedPrice : 0
  obj.BudgetedPriceVariance = (dataFromAPI && dataFromAPI.BudgetedPriceVariance) ? dataFromAPI.BudgetedPriceVariance : 0
  obj.CostingPartDetails = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails
  obj.npvCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingNpvResponse?.reduce((acc, obj) => Number(acc) + Number(obj.NpvCost), 0)
  obj.conditionCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingConditionResponse?.reduce((acc, obj) => Number(acc) + Number(obj.ConditionCost), 0)
  obj.netConditionCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetConditionCost
  obj.netNpvCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetNpvCost
  obj.TotalPaintCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.TotalPaintCost
  obj.HangerCostPerPart = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.HangerCostPerPart
  obj.overheadOn = {
    overheadTitle: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingOverheadDetail !== null && dataFromAPI?.CostingPartDetails?.CostingOverheadDetail.OverheadApplicability !== null ? dataFromAPI?.CostingPartDetails?.CostingOverheadDetail.OverheadApplicability : '',
    overheadValue: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetOverheadCost !== null ? dataFromAPI?.CostingPartDetails?.NetOverheadCost : '-',
    overheadPercentage: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingOverheadDetail !== null && dataFromAPI?.CostingPartDetails?.CostingOverheadDetail.OverheadPercentage !== null ? dataFromAPI?.CostingPartDetails?.CostingOverheadDetail.OverheadPercentage : '-',
    overheadRMPercentage: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingOverheadDetail !== null && dataFromAPI?.CostingPartDetails?.CostingOverheadDetail.OverheadRMPercentage !== null ? dataFromAPI?.CostingPartDetails?.CostingOverheadDetail.OverheadRMPercentage : '-',
    overheadBOPPercentage: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingOverheadDetail !== null && dataFromAPI?.CostingPartDetails?.CostingOverheadDetail.OverheadBOPPercentage !== null ? dataFromAPI?.CostingPartDetails?.CostingOverheadDetail.OverheadBOPPercentage : '-',
    overheadCCPercentage: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingOverheadDetail !== null && dataFromAPI?.CostingPartDetails?.CostingOverheadDetail.OverheadCCPercentage !== null ? dataFromAPI?.CostingPartDetails?.CostingOverheadDetail.OverheadCCPercentage : '-',
    OverheadCRMHead: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingOverheadDetail !== null && dataFromAPI?.CostingPartDetails?.CostingOverheadDetail.OverheadCRMHead !== null ? dataFromAPI?.CostingPartDetails?.CostingOverheadDetail.OverheadCRMHead : '-',
    OverheadRemark: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingOverheadDetail !== null && dataFromAPI?.CostingPartDetails?.CostingOverheadDetail.Remark !== null ? dataFromAPI?.CostingPartDetails?.CostingOverheadDetail.Remark : '-',
  }

  obj.profitOn = {
    profitTitle: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingProfitDetail.ProfitApplicability !== null ? dataFromAPI?.CostingPartDetails?.CostingProfitDetail.ProfitApplicability : '', profitValue: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetProfitCost !== null ? dataFromAPI?.CostingPartDetails?.NetProfitCost : '-',
    profitPercentage: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingProfitDetail.ProfitPercentage !== null ? dataFromAPI?.CostingPartDetails?.CostingProfitDetail.ProfitPercentage : '-',
    profitRMPercentage: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingProfitDetail.ProfitRMPercentage !== null ? dataFromAPI?.CostingPartDetails?.CostingProfitDetail.ProfitRMPercentage : '-',
    profitBOPPercentage: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingProfitDetail.ProfitBOPPercentage !== null ? dataFromAPI?.CostingPartDetails?.CostingProfitDetail.ProfitBOPPercentage : '-',
    profitCCPercentage: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingProfitDetail.ProfitCCPercentage !== null ? dataFromAPI?.CostingPartDetails?.CostingProfitDetail.ProfitCCPercentage : '-',
    ProfitCRMHead: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingProfitDetail.ProfitCRMHead !== null ? dataFromAPI?.CostingPartDetails?.CostingProfitDetail.ProfitCRMHead : '-',
    ProfitRemark: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingProfitDetail.Remark !== null ? dataFromAPI?.CostingPartDetails?.CostingProfitDetail.Remark : '-',
  }

  obj.rejectionOn = {
    rejectionTitle: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingRejectionDetail.RejectionApplicability !== null ? dataFromAPI?.CostingPartDetails?.CostingRejectionDetail.RejectionApplicability : '',
    rejectionValue: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetRejectionCost !== null ? dataFromAPI?.CostingPartDetails?.NetRejectionCost : 0,
    rejectionPercentage: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingRejectionDetail.RejectionPercentage !== null ? dataFromAPI?.CostingPartDetails?.CostingRejectionDetail.RejectionPercentage : '-',
    RejectionCRMHead: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingRejectionDetail.RejectionCRMHead !== null ? dataFromAPI?.CostingPartDetails?.CostingRejectionDetail.RejectionCRMHead : '-',
    RejectionRemark: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingRejectionDetail.Remark !== null ? dataFromAPI?.CostingPartDetails?.CostingRejectionDetail.Remark : '-',
  }

  obj.iccOn = {
    iccTitle: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingInterestRateDetail.ICCApplicabilityDetail.ICCApplicability !== null ? dataFromAPI?.CostingPartDetails?.CostingInterestRateDetail.ICCApplicabilityDetail.ICCApplicability : '', iccValue: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingInterestRateDetail.ICCApplicabilityDetail.NetCost !== null ? dataFromAPI?.CostingPartDetails?.CostingInterestRateDetail.ICCApplicabilityDetail.NetCost : 0,
    iccPercentage: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingInterestRateDetail.ICCApplicabilityDetail.InterestRate !== null ? dataFromAPI?.CostingPartDetails?.CostingInterestRateDetail.ICCApplicabilityDetail.InterestRate : '-',
    ICCCRMHead: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingInterestRateDetail.ICCApplicabilityDetail.ICCCRMHead !== null ? dataFromAPI?.CostingPartDetails?.CostingInterestRateDetail.ICCApplicabilityDetail.ICCCRMHead : '-',
    ICCRemark: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingInterestRateDetail.ICCApplicabilityDetail.Remark !== null ? dataFromAPI?.CostingPartDetails?.CostingInterestRateDetail.ICCApplicabilityDetail.Remark : '-',
  }

  obj.netOverheadCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetOverheadCost !== null ? dataFromAPI?.CostingPartDetails?.NetOverheadCost : 0
  obj.netProfitCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetProfitCost !== null ? dataFromAPI?.CostingPartDetails?.NetProfitCost : 0
  obj.netRejectionCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetRejectionCost !== null ? dataFromAPI?.CostingPartDetails?.NetRejectionCost : 0
  obj.netICCCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetICCCost !== null ? dataFromAPI?.CostingPartDetails?.NetICCCost : 0
  const paymentTermDetail = dataFromAPI?.CostingPartDetails?.CostingPaymentTermDetails?.PaymentTermDetail;

  obj.paymentTerms = {
    paymentTitle: paymentTermDetail?.PaymentTermApplicability || '',
    paymentValue: paymentTermDetail?.NetCost || 0,
    paymentPercentage: paymentTermDetail?.InterestRate || '-',
    PaymentTermCRMHead: paymentTermDetail?.PaymentTermCRMHead || '-',
    PaymentTermRemark: paymentTermDetail?.Remark || '-',
  };

  obj.CostingRejectionRecoveryDetails = (dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails.CostingRejectionDetail && dataFromAPI?.CostingPartDetails.CostingRejectionDetail?.CostingRejectionRecoveryDetails) ?? {}

  obj.nOverheadProfit = isBestCost ? (dataFromAPI && dataFromAPI?.NetOverheadAndProfitCost !== undefined ? dataFromAPI?.NetOverheadAndProfitCost : 0) :
    dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetOverheadAndProfitCost ? dataFromAPI?.CostingPartDetails?.NetOverheadAndProfitCost : 0

  obj.packagingCost = dataFromAPI?.CostingPartDetails
    && dataFromAPI?.CostingPartDetails?.NetPackagingCost !== null ? dataFromAPI?.CostingPartDetails?.NetPackagingCost
    : 0
  obj.freight = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetFreightCost !== null ? dataFromAPI?.CostingPartDetails?.NetFreightCost : 0

  obj.nPackagingAndFreight = isBestCost ? (dataFromAPI && dataFromAPI?.NetFreightPackagingCost !== undefined ? dataFromAPI?.NetFreightPackagingCost : 0) :
    dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetFreightPackagingCost ? dataFromAPI?.CostingPartDetails?.NetFreightPackagingCost : 0

  obj.bopPHandlingCharges = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.BOPHandlingCharges !== null ? dataFromAPI?.CostingPartDetails?.BOPHandlingCharges : 0
  obj.bopHandlingPercentage = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.BOPHandlingPercentage !== null ? dataFromAPI?.CostingPartDetails?.BOPHandlingPercentage : 0
  obj.bopHandlingChargeType = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.BOPHandlingChargeType !== null ? dataFromAPI?.CostingPartDetails?.BOPHandlingChargeType : ''

  obj.netAmortizationCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetToolAmortizationCost !== null ? dataFromAPI?.CostingPartDetails?.NetToolAmortizationCost: 0
  obj.netToolMaintenanceCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetToolMaintenanceCost !== null ? dataFromAPI?.CostingPartDetails?.NetToolMaintenanceCost: 0
  obj.netToolInterestCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetToolInterestCost !== null ? dataFromAPI?.CostingPartDetails?.NetToolInterestCost: 0
  obj.toolMaintenanceCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingToolCostResponse.length > 0 && dataFromAPI?.CostingPartDetails?.CostingToolCostResponse[0].ToolMaintenanceCost !== null ? dataFromAPI?.CostingPartDetails?.CostingToolCostResponse[0].ToolMaintenanceCost : 0
  obj.toolPrice = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingToolCostResponse.length > 0 && dataFromAPI?.CostingPartDetails?.CostingToolCostResponse[0].ToolCost !== null ? dataFromAPI?.CostingPartDetails?.CostingToolCostResponse[0].ToolCost : 0
  obj.amortizationQty = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingToolCostResponse.length > 0 && dataFromAPI?.CostingPartDetails?.CostingToolCostResponse[0].Life !== null ? dataFromAPI?.CostingPartDetails?.CostingToolCostResponse[0].Life : 0
  obj.toolApplicability = { applicability: 'Applicability', value: 'Value', }
  obj.toolApplicabilityValue = {
    toolTitle: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingToolCostResponse.length > 0 && dataFromAPI?.CostingPartDetails?.CostingToolCostResponse[0].ToolCostType !== null ? dataFromAPI?.CostingPartDetails?.CostingToolCostResponse[0].ToolCostType : "-",
    toolValue: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingToolCostResponse.length > 0 && dataFromAPI?.CostingPartDetails?.CostingToolCostResponse[0].ToolApplicabilityCost !== null ? dataFromAPI?.CostingPartDetails?.CostingToolCostResponse[0].ToolApplicabilityCost : 0,
  }
  obj.TotalInvestmentcost = calculationOnTco((dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails) ? dataFromAPI?.CostingPartDetails?.CostingTCOResponse : {})
  obj.toolAmortizationCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingToolCostResponse.length > 0 && dataFromAPI?.CostingPartDetails?.CostingToolCostResponse[0].ToolAmortizationCost !== null ? dataFromAPI?.CostingPartDetails?.CostingToolCostResponse[0].ToolAmortizationCost : 0

  obj.TotalTCOCost = dataFromAPI?.CostingPartDetails?.CostingTCOResponse ? TotalTCOCostCal((dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails) ? dataFromAPI?.CostingPartDetails?.CostingTCOResponse : {}, dataFromAPI?.CostingPartDetails?.CostingPaymentTermDetails ?? {}) + checkForNull(dataFromAPI.NetPOPrice) + checkForNull(dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetNpvCost) : 0

  obj.totalToolCost = isBestCost ? (dataFromAPI && dataFromAPI?.NetToolCost !== undefined ? dataFromAPI?.NetToolCost : 0) :
    dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetToolCost !== null ? dataFromAPI?.CostingPartDetails?.NetToolCost : 0

  obj.totalCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.TotalCost ? dataFromAPI?.TotalCost : 0
  obj.otherDiscount = { discount: 'Discount %', value: 'Value', }
  obj.otherDiscountValue = {
    discountPercentValue: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.OtherCostDetails.HundiOrDiscountPercentage !== null ? dataFromAPI?.CostingPartDetails?.OtherCostDetails.HundiOrDiscountPercentage : 0,
    discountValue: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.OtherCostDetails.HundiOrDiscountValue !== null ? dataFromAPI?.CostingPartDetails?.OtherCostDetails.HundiOrDiscountValue : 0,
    discountApplicablity: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.OtherCostDetails.HundiOrDiscountValue !== null ? dataFromAPI?.CostingPartDetails?.OtherCostDetails.DiscountApplicability : 0,
    dicountType: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.OtherCostDetails.DiscountCostType !== null ? dataFromAPI?.CostingPartDetails?.OtherCostDetails.DiscountCostType : '-'
  }
  obj.netDiscountsCost = dataFromAPI?.CostingPartDetails?.NetDiscountsCost
  obj.anyOtherCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.OtherCostDetails.AnyOtherCost !== null ? dataFromAPI?.CostingPartDetails?.OtherCostDetails.AnyOtherCost : 0
  obj.anyOtherCostType = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.OtherCostDetails.OtherCostType !== null ? dataFromAPI?.CostingPartDetails?.OtherCostDetails.OtherCostType : '-'
  obj.anyOtherCostApplicablity = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.OtherCostDetails.AnyOtherCost !== null ? dataFromAPI?.CostingPartDetails?.OtherCostDetails.OtherCostApplicability : 0
  obj.anyOtherCostPercent = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.OtherCostDetails.OtherCostPercentage !== null ? dataFromAPI?.CostingPartDetails?.OtherCostDetails.OtherCostPercentage : 0
  obj.remark = dataFromAPI && dataFromAPI.OtherRemark ? dataFromAPI.OtherRemark : '-'
  obj.nPOPriceWithCurrency = dataFromAPI && dataFromAPI.NetPOPriceInOtherCurrency ? dataFromAPI.NetPOPriceInOtherCurrency : 0
  obj.currency = {
    currencyTitle: dataFromAPI && dataFromAPI.Currency ? dataFromAPI?.Currency : '-',
    currencyValue: dataFromAPI && dataFromAPI.CurrencyExchangeRate ? dataFromAPI?.CurrencyExchangeRate : '-',
  }

  obj.nPOPrice = dataFromAPI?.NetPOPrice && dataFromAPI?.NetPOPrice !== null ? dataFromAPI?.NetPOPrice : 0
  obj.effectiveDate = dataFromAPI?.EffectiveDate ? dataFromAPI?.EffectiveDate : ''

  obj.attachment = dataFromAPI?.Attachements ? dataFromAPI?.Attachements : []
  obj.approvalButton = ''
  // //RM
  obj.netRMCostView = dataFromAPI?.CostingPartDetails ? dataFromAPI?.CostingPartDetails?.CostingRawMaterialsCost : []
  // //BOP Cost
  obj.netBOPCostView = dataFromAPI?.CostingPartDetails ? dataFromAPI?.CostingPartDetails?.CostingBoughtOutPartCost : []
  // //COnversion Cost
  obj.netConversionCostView = dataFromAPI?.CostingPartDetails ? dataFromAPI?.CostingPartDetails?.CostingConversionCost : '-'
  obj.netTransportationCostView = dataFromAPI?.CostingPartDetails ? dataFromAPI?.CostingPartDetails?.ChildPartTransportationDetails ?? [] : []
  obj.HangerCostDetails = dataFromAPI?.CostingPartDetails?.Type === 'Assembly' ? dataFromAPI?.CostingPartDetails?.ChildPartHangerDetails : dataFromAPI?.CostingPartDetails?.HangerDetails ?? []
  obj.PaintAndTapeDetails = dataFromAPI?.CostingPartDetails?.Type === 'Assembly' ? dataFromAPI?.CostingPartDetails?.ChildPartPaintAndTapeDetails : dataFromAPI?.CostingPartDetails?.PaintAndTapeDetails ?? []
  obj.surfaceTreatmentDetails = dataFromAPI?.CostingPartDetails ? dataFromAPI?.CostingPartDetails?.SurfaceTreatmentDetails : []
  // //OverheadCost and Profit
  obj.netOverheadCostView = dataFromAPI?.CostingPartDetails ? dataFromAPI?.CostingPartDetails?.CostingOverheadDetail : '-'
  obj.netProfitCostView = dataFromAPI?.CostingPartDetails ? dataFromAPI?.CostingPartDetails?.CostingProfitDetail : '-'
  // // Rejection
  obj.netRejectionCostView = dataFromAPI?.CostingPartDetails ? dataFromAPI?.CostingPartDetails?.CostingRejectionDetail : '-'

  //payment terms and ICC
  obj.netPaymentIccCostView = dataFromAPI?.CostingPartDetails ? dataFromAPI?.CostingPartDetails?.CostingInterestRateDetail : '-'

  // //Net Packaging and Freight
  obj.netPackagingCostView = dataFromAPI?.CostingPartDetails ? dataFromAPI?.CostingPartDetails?.CostingPackagingDetail : []
  obj.netFreightCostView = dataFromAPI?.CostingPartDetails ? dataFromAPI?.CostingPartDetails?.CostingFreightDetail : []
  // //Tool Cost
  obj.netToolCostView = dataFromAPI?.CostingPartDetails ? dataFromAPI?.CostingPartDetails?.CostingToolCostResponse : []
  obj.totalTabSum = checkForNull(obj.nTotalRMBOPCC) + checkForNull(obj.nsTreamnt) + checkForNull(obj.nOverheadProfit) + checkForNull(obj.nPackagingAndFreight) + checkForNull(obj.totalToolCost)

  // //For Drawer Edit
  obj.partId = dataFromAPI && dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.PartId ? dataFromAPI?.CostingPartDetails?.PartId : '-' // PART NUMBER KEY NAME
  obj.partNumber = dataFromAPI && dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.PartNumber ? dataFromAPI?.CostingPartDetails?.PartNumber : '-'

  // ADD PARTID KEY HERE AND BIND IT WITH PART ID
  obj.plantId = dataFromAPI?.PlantId ? dataFromAPI?.PlantId : '-'
  obj.plantName = dataFromAPI?.PlantName ? dataFromAPI?.PlantName : '-'
  obj.plantCode = dataFromAPI?.PlantCode ? dataFromAPI?.PlantCode : '-'
  obj.vendorId = dataFromAPI?.VendorId ? dataFromAPI?.VendorId : '-'
  obj.vendorName = dataFromAPI?.VendorName ? dataFromAPI?.VendorName : '-'
  obj.vendorCode = dataFromAPI?.VendorCode ? dataFromAPI?.VendorCode : '-'
  obj.vendor = dataFromAPI?.VendorName && dataFromAPI?.VendorCode ? `${dataFromAPI?.VendorName} (${dataFromAPI?.VendorCode})` : '-'
  obj.vendorPlantId = dataFromAPI?.VendorPlantId ? dataFromAPI?.VendorPlantId : ''
  obj.vendorPlantName = dataFromAPI?.VendorPlantName ? dataFromAPI?.VendorPlantName : ''
  obj.vendorPlantCode = dataFromAPI?.VendorPlantCode ? dataFromAPI?.VendorPlantCode : ''
  obj.costingId = dataFromAPI?.CostingId ? dataFromAPI?.CostingId : '-'
  obj.oldPoPrice = dataFromAPI?.OldPOPrice ? dataFromAPI?.OldPOPrice : 0
  obj.technology = dataFromAPI?.Technology ? dataFromAPI?.Technology : '-'
  obj.technologyId = dataFromAPI?.TechnologyId ? dataFromAPI?.TechnologyId : '-'
  obj.shareOfBusinessPercent = dataFromAPI?.ShareOfBusinessPercent ? dataFromAPI?.ShareOfBusinessPercent : 0
  obj.destinationPlantCode = dataFromAPI?.DestinationPlantCode ? dataFromAPI?.DestinationPlantCode : '-'
  obj.destinationPlantName = dataFromAPI?.DestinationPlantName ? dataFromAPI?.DestinationPlantName : '-'
  obj.destinationPlantId = dataFromAPI?.DestinationPlantId ? dataFromAPI?.DestinationPlantId : '-'
  obj.CostingHeading = header
  obj.partName = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.PartName ? dataFromAPI?.CostingPartDetails?.PartName : '-'
  obj.netOtherOperationCost = dataFromAPI && dataFromAPI?.CostingPartDetails?.NetOtherOperationCost ? dataFromAPI?.CostingPartDetails?.NetOtherOperationCost : 0
  obj.masterBatchTotal = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.MasterBatchTotal ? dataFromAPI?.CostingPartDetails?.MasterBatchTotal : 0
  obj.masterBatchRMPrice = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.MasterBatchRMPrice ? dataFromAPI?.CostingPartDetails?.MasterBatchRMPrice : 0
  obj.masterBatchPercentage = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.MasterBatchPercentage ? dataFromAPI?.CostingPartDetails?.MasterBatchPercentage : 0
  obj.isApplyMasterBatch = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.IsApplyMasterBatch ? dataFromAPI?.CostingPartDetails?.IsApplyMasterBatch : false
  obj.IsAssemblyCosting = dataFromAPI?.IsAssemblyCosting ? dataFromAPI?.IsAssemblyCosting : ""
  obj.childPartBOPHandlingCharges = dataFromAPI?.CostingPartDetails?.ChildPartBOPHandlingCharges ? dataFromAPI?.CostingPartDetails?.ChildPartBOPHandlingCharges : []
  obj.masterBatchRMName = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.MasterBatchRMName ? dataFromAPI?.CostingPartDetails?.MasterBatchRMName : '-'
  obj.costingHeadCheck = dataFromAPI?.CostingHead && dataFromAPI?.CostingHead !== null ? dataFromAPI?.CostingHead : '';
  obj.NCCPartQuantity = dataFromAPI?.NCCPartQuantity && dataFromAPI?.NCCPartQuantity !== null ? dataFromAPI?.NCCPartQuantity : '';
  obj.IsRegularized = dataFromAPI?.IsRegularized && dataFromAPI?.IsRegularized !== null ? dataFromAPI?.IsRegularized : '';
  obj.MachiningScrapRate = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingRawMaterialsCost.length > 0 ? dataFromAPI?.CostingPartDetails?.CostingRawMaterialsCost[0].MachiningScrapRate : '-'
  // GETTING WARNING MESSAGE WITH APPROVER NAME AND LEVEL WHEN COSTING IS UNDER APPROVAL 
  obj.getApprovalLockedMessage = dataFromAPI?.ApprovalLockedMessage && dataFromAPI?.ApprovalLockedMessage !== null ? dataFromAPI?.ApprovalLockedMessage : '';

  //MASTER BATCH OBJECT
  obj.CostingMasterBatchRawMaterialCostResponse = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingMasterBatchRawMaterialCostResponse ? dataFromAPI?.CostingPartDetails?.CostingMasterBatchRawMaterialCostResponse : []
  obj.RevisionNumber = dataFromAPI?.RevisionNumber ? dataFromAPI?.RevisionNumber : '-'
  obj.AssemblyCostingId = dataFromAPI?.AssemblyCostingId && dataFromAPI?.AssemblyCostingId !== null ? dataFromAPI?.AssemblyCostingId : '';
  obj.SubAssemblyCostingId = dataFromAPI?.SubAssemblyCostingId && dataFromAPI?.SubAssemblyCostingId !== null ? dataFromAPI?.SubAssemblyCostingId : '';

  //USED FOR DOWNLOAD PURPOSE

  obj.overHeadApplicablity = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingOverheadDetail !== null && dataFromAPI?.CostingPartDetails?.CostingOverheadDetail.OverheadApplicability !== null ? dataFromAPI?.CostingPartDetails?.CostingOverheadDetail.OverheadApplicability : '-'
  obj.overHeadApplicablityValue = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetOverheadCost !== null ? dataFromAPI?.CostingPartDetails?.NetOverheadCost : '-'
  obj.ProfitApplicablity = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingProfitDetail.ProfitApplicability !== null ? dataFromAPI?.CostingPartDetails?.CostingProfitDetail.ProfitApplicability : '-'
  obj.ProfitApplicablityValue = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetProfitCost !== null ? dataFromAPI?.CostingPartDetails?.NetProfitCost : '-'
  obj.rejectionApplicablity = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingRejectionDetail.RejectionApplicability !== null ? dataFromAPI?.CostingPartDetails?.CostingRejectionDetail.RejectionApplicability : '-'
  obj.rejectionApplicablityValue = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingRejectionDetail.RejectionTotalCost !== null ? dataFromAPI?.CostingPartDetails?.CostingRejectionDetail.RejectionTotalCost : 0
  obj.iccApplicablity = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingInterestRateDetail.ICCApplicabilityDetail.ICCApplicability !== null ? dataFromAPI?.CostingPartDetails?.CostingInterestRateDetail.ICCApplicabilityDetail.ICCApplicability : '-'
  obj.iccApplicablityValue = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingInterestRateDetail.ICCApplicabilityDetail.NetCost !== null ? dataFromAPI?.CostingPartDetails?.CostingInterestRateDetail.ICCApplicabilityDetail.NetCost : 0
  obj.paymentApplicablity = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingPaymentTermDetails?.PaymentTermDetail?.PaymentTermApplicability ? dataFromAPI?.CostingPartDetails?.CostingPaymentTermDetails?.PaymentTermDetail?.PaymentTermApplicability : '-'
  obj.paymentcApplicablityValue = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingPaymentTermDetails?.PaymentTermDetail?.NetCost ? dataFromAPI?.CostingPartDetails?.CostingPaymentTermDetails?.PaymentTermDetail?.NetCost : 0
  obj.toolMaintenanceCostApplicablity = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingToolCostResponse.length > 0 && dataFromAPI?.CostingPartDetails?.CostingToolCostResponse[0].ToolCostType !== null ? dataFromAPI?.CostingPartDetails?.CostingToolCostResponse[0].ToolCostType : 0
  obj.toolMaintenanceCostApplicablityValue = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingToolCostResponse.length > 0 && dataFromAPI?.CostingPartDetails?.CostingToolCostResponse[0].ToolApplicabilityCost !== null ? dataFromAPI?.CostingPartDetails?.CostingToolCostResponse[0].ToolApplicabilityCost : 0
  obj.otherDiscountType = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.OtherCostDetails.DiscountCostType !== null ? dataFromAPI?.CostingPartDetails?.OtherCostDetails.DiscountCostType : 0
  obj.otherDiscountApplicablity = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.OtherCostDetails.HundiOrDiscountValue !== null ? dataFromAPI?.CostingPartDetails?.OtherCostDetails.DiscountApplicability : 0
  obj.otherDiscountValuePercent = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.OtherCostDetails.HundiOrDiscountPercentage !== null ? dataFromAPI?.CostingPartDetails?.OtherCostDetails.HundiOrDiscountPercentage : 0
  obj.otherDiscountCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.OtherCostDetails.HundiOrDiscountValue !== null ? dataFromAPI?.CostingPartDetails?.OtherCostDetails.HundiOrDiscountValue : 0
  obj.currencyTitle = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.OtherCostDetails?.Currency !== null ? dataFromAPI?.CostingPartDetails?.OtherCostDetails?.Currency : '-'
  obj.costingHead = dataFromAPI?.TypeOfCosting && dataFromAPI?.TypeOfCosting === 0 ? 'ZBC' : 'VBC'
  obj.costingVersion = DayTime(obj?.costingDate).isValid() ? `${DayTime(obj?.costingDate).format('DD-MM-YYYY')}-${obj?.CostingNumber}${header === 'CostingSummaryMainPage' ? '-' : ''}${header === 'CostingSummaryMainPage' ? obj?.status : ''}` : '-'
  obj.PoPriceWithDate = `${obj?.poPrice} (${(obj?.effectiveDate && obj?.effectiveDate !== '') ? DayTime(obj?.effectiveDate).format('DD-MM-YYYY') : "-"})`
  obj.rmRate = obj?.netRMCostView && (obj?.netRMCostView.length > 1 || obj?.IsAssemblyCosting === true) ? 'Multiple RM' : (obj?.netRMCostView && obj?.netRMCostView[0] && obj?.netRMCostView[0].RMRate)
  obj.scrapRate = obj?.netRMCostView && (obj?.netRMCostView.length > 1 || obj?.IsAssemblyCosting === true) ? 'Multiple RM' : (obj?.netRMCostView && obj?.netRMCostView[0] && obj?.netRMCostView[0].ScrapRate)
  obj.BurningLossWeight = obj?.netRMCostView && (obj?.netRMCostView.length > 1 || obj?.IsAssemblyCosting === true) ? 'Multiple RM' : (obj?.netRMCostView && obj?.netRMCostView[0] && obj?.netRMCostView[0].BurningLossWeight)
  obj.ScrapWeight = obj?.netRMCostView && (obj?.netRMCostView.length > 1 || obj?.IsAssemblyCosting === true) ? 'Multiple RM' : (obj?.netRMCostView && obj?.netRMCostView[0] && obj?.netRMCostView[0].ScrapWeight)
  obj.nPoPriceCurrency = obj?.nPOPriceWithCurrency !== null ? (obj?.currency?.currencyTitle) !== "-" ? (obj?.nPOPriceWithCurrency) : obj?.nPOPrice : '-'
  obj.currencyRate = obj?.CostingHeading !== VARIANCE ? obj?.currency?.currencyValue === '-' ? '' : obj?.currency?.currencyValue : ''
  obj.meltingLoss = obj?.netRMCostView && (obj?.netRMCostView?.length > 1 || obj?.IsAssemblyCosting === true) ? 'Multiple RM' : (obj?.netRMCostView && obj?.netRMCostView[0] && obj?.netRMCostView[0]?.MeltingLoss + " (" + obj?.netRMCostView[0]?.LossPercentage + "%)")
  obj.castingWeight = obj?.netRMCostView && (obj?.netRMCostView.length > 1 || obj?.IsAssemblyCosting === true) ? 'Multiple RM' : (obj?.netRMCostView && obj?.netRMCostView[0] && obj?.netRMCostView[0].CastingWeight)
  obj.costingTypeId = dataFromAPI?.CostingTypeId ? dataFromAPI?.CostingTypeId : ''
  obj.customerId = dataFromAPI?.CustomerId ? dataFromAPI?.CustomerId : EMPTY_GUID
  obj.customerName = dataFromAPI?.CustomerName ? dataFromAPI?.CustomerName : ''
  obj.customerCode = dataFromAPI?.CustomerCode ? dataFromAPI?.CustomerCode : ''
  obj.customer = dataFromAPI?.Customer ? dataFromAPI?.Customer : ''
  obj.plantExcel = dataFromAPI?.CostingTypeId === ZBCTypeId ? (dataFromAPI?.PlantName ? `${dataFromAPI?.PlantName}` : '') : (dataFromAPI?.DestinationPlantName ? `${dataFromAPI?.DestinationPlantName}` : '')
  obj.vendorExcel = dataFromAPI?.VendorName ? `${dataFromAPI?.VendorName} (${dataFromAPI?.VendorCode})` : ''
  obj.sobPercentageExcel = dataFromAPI?.ShareOfBusinessPercent ? `${dataFromAPI?.ShareOfBusinessPercent}%` : 0
  obj.castingWeightExcel = obj?.netRMCostView && (obj?.netRMCostView.length > 1 || obj?.IsAssemblyCosting === true) ? 'Multiple RM' : checkForDecimalAndNull(dataFromAPI?.CostingPartDetails?.CastingWeight, getConfigurationKey().NoOfDecimalForPrice)
  obj.meltingLossExcel = obj?.netRMCostView && (obj?.netRMCostView.length > 1 || obj?.IsAssemblyCosting === true) ? 'Multiple RM' : `${checkForDecimalAndNull(dataFromAPI?.CostingPartDetails?.MeltingLoss, getConfigurationKey().NoOfDecimalForPrice)} (${dataFromAPI?.CostingPartDetails?.LossPercentage ? dataFromAPI?.CostingPartDetails?.LossPercentage : 0}%)`
  // FOR MULTIPLE TECHNOLOGY COSTING SUMMARY DATA
  obj.netChildPartsCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetChildPartsCost ? dataFromAPI?.CostingPartDetails?.NetChildPartsCost : 0
  obj.netOperationCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetOperationCost ? dataFromAPI?.CostingPartDetails?.NetOperationCost : 0
  obj.netProcessCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetProcessCost ? dataFromAPI?.CostingPartDetails?.NetProcessCost : 0
  obj.netBoughtOutPartCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetBoughtOutPartCost ? dataFromAPI?.CostingPartDetails?.NetBoughtOutPartCost : 0
  obj.multiTechnologyCostingDetails = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.MultiTechnologyCostingDetails ? dataFromAPI?.CostingPartDetails?.MultiTechnologyCostingDetails : ''
  obj.isRmCutOffApplicable = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.IsRMCutOffApplicable && dataFromAPI?.CostingPartDetails?.IsRMCutOffApplicable
  obj.isRFQFinalApprovedCosting = dataFromAPI?.IsRFQFinalApprovedCosting
  obj.isIncludeToolCostWithOverheadAndProfit = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.IsIncludeToolCostWithOverheadAndProfit && dataFromAPI?.CostingPartDetails?.IsIncludeToolCostWithOverheadAndProfit
  obj.isIncludeSurfaceTreatmentWithRejection = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.IsIncludeSurfaceTreatmentWithRejection && dataFromAPI?.CostingPartDetails?.IsIncludeSurfaceTreatmentWithRejection
  obj.isIncludeSurfaceTreatmentWithOverheadAndProfit = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.IsIncludeSurfaceTreatmentWithOverheadAndProfit && dataFromAPI?.CostingPartDetails?.IsIncludeSurfaceTreatmentWithOverheadAndProfit
  obj.isIncludeOverheadAndProfitInICC = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.IsIncludeOverheadAndProfitInICC && dataFromAPI?.CostingPartDetails?.IsIncludeOverheadAndProfitInICC
  obj.isIncludeToolCostInCCForICC = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.IsIncludeToolCostInCCForICC && dataFromAPI?.CostingPartDetails?.IsIncludeToolCostInCCForICC
  obj.rawMaterialCostWithCutOff = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.RawMaterialCostWithCutOff ? dataFromAPI?.CostingPartDetails?.RawMaterialCostWithCutOff : ''
  obj.anyOtherCostTotal = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetOtherCost ? dataFromAPI?.CostingPartDetails?.NetOtherCost : '-'
  obj.saNumber = dataFromAPI?.SANumber ?? '-'
  obj.lineNumber = dataFromAPI?.LineNumber ?? '-'
  obj.partType = dataFromAPI?.CostingPartDetails?.Type
  obj.partTypeId = dataFromAPI?.CostingPartDetails?.PartTypeId
  obj.ScrapRecoveryPercentage = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.ScrapRecoveryPercentage
  obj.IsScrapRecoveryPercentageApplied = dataFromAPI?.CostingPartDetails?.CostingRawMaterialsCost && dataFromAPI?.CostingPartDetails?.CostingRawMaterialsCost[0]?.IsScrapRecoveryPercentageApplied
  obj.isToolCostProcessWise = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.IsToolCostProcessWise
  obj.IsScrapRecoveryPercentageApplied = dataFromAPI?.CostingPartDetails?.CostingRawMaterialsCost && dataFromAPI?.CostingPartDetails?.CostingRawMaterialsCost[0]?.IsScrapRecoveryPercentageApplied
  obj.OtherCostDetailsOverhead = setDynamicKeys(dataFromAPI?.CostingPartDetails?.OtherCostDetails, 'OverHead')
  obj.OtherCostDetailsProcess = setDynamicKeys(dataFromAPI?.CostingPartDetails?.OtherCostDetails, 'Process')
  obj.CalculatorType = dataFromAPI?.CostingPartDetails?.CalculatorType ?? ''
  obj.InfoCategory = dataFromAPI?.InfoCategory ? dataFromAPI?.InfoCategory : '-'
  obj.TaxCodeList = dataFromAPI?.CostingPartDetails?.TaxCodeList ? dataFromAPI?.CostingPartDetails?.TaxCodeList : []
  obj.ExchangeRateSourceName = dataFromAPI?.ExchangeRateSourceName
  obj.CostingCurrency = dataFromAPI?.CostingCurrency

  obj.NetRawMaterialsCostLocalConversion = dataFromAPI?.NetRawMaterialsCostLocalConversion
  obj.NetBoughtOutPartCostLocalConversion = dataFromAPI?.NetBoughtOutPartCostLocalConversion
  obj.NetConversionCostLocalConversion = dataFromAPI?.NetConversionCostLocalConversion
  obj.NetProcessCostLocalConversion = dataFromAPI?.NetProcessCostLocalConversion
  obj.NetOperationCostLocalConversion = dataFromAPI?.NetOperationCostLocalConversion
  obj.NetOtherOperationCostLocalConversion = dataFromAPI?.NetOtherOperationCostLocalConversion
  obj.NetTotalRMBOPCCLocalConversion = dataFromAPI?.NetTotalRMBOPCCLocalConversion
  obj.NetSurfaceTreatmentCostLocalConversion = dataFromAPI?.NetSurfaceTreatmentCostLocalConversion
  obj.TransportationCostLocalConversion = dataFromAPI?.TransportationCostLocalConversion
  obj.NetFreightPackagingCostLocalConversion = dataFromAPI?.NetFreightPackagingCostLocalConversion
  obj.NetToolCostLocalConversion = dataFromAPI?.NetToolCostLocalConversion
  obj.NetDiscountsCostLocalConversion = dataFromAPI?.NetDiscountsCostLocalConversion
  obj.NetOtherCostLocalConversion = dataFromAPI?.NetOtherCostLocalConversion
  obj.SurfaceTreatmentCostLocalConversion = dataFromAPI?.SurfaceTreatmentCostLocalConversion
  obj.NetOverheadAndProfitCostLocalConversion = dataFromAPI?.NetOverheadAndProfitCostLocalConversion
  obj.OverheadCostLocalConversion = dataFromAPI?.OverheadCostLocalConversion
  obj.ProfitCostLocalConversion = dataFromAPI?.ProfitCostLocalConversion
  obj.RejectionCostLocalConversion = dataFromAPI?.RejectionCostLocalConversion
  obj.ICCCostLocalConversion = dataFromAPI?.ICCCostLocalConversion
  obj.PaymentTermCostLocalConversion = dataFromAPI?.PaymentTermCostLocalConversion
  obj.PackagingCostLocalConversion = dataFromAPI?.PackagingCostLocalConversion
  obj.FreightCostLocalConversion = dataFromAPI?.FreightCostLocalConversion
  obj.NetChildPartsCostLocalConversion = dataFromAPI?.NetChildPartsCostLocalConversion
  obj.MasterBatchRMPriceLocalConversion = dataFromAPI?.MasterBatchRMPriceLocalConversion
  obj.MasterBatchTotalLocalConversion = dataFromAPI?.MasterBatchTotalLocalConversion
  obj.TotalCostBeforeDiscountAndOtherCostLocalConversion = dataFromAPI?.TotalCostBeforeDiscountAndOtherCostLocalConversion
  obj.DiscountCostLocalConversion = dataFromAPI?.DiscountCostLocalConversion
  obj.OtherCostLocalConversion = dataFromAPI?.OtherCostLocalConversion
  obj.RawMaterialCostWithCutOffLocalConversion = dataFromAPI?.RawMaterialCostWithCutOffLocalConversion
  obj.NetLabourCostLocalConversion = dataFromAPI?.NetLabourCostLocalConversion
  obj.IndirectLaborCostLocalConversion = dataFromAPI?.IndirectLaborCostLocalConversion
  obj.StaffCostLocalConversion = dataFromAPI?.StaffCostLocalConversion
  obj.NetRawMaterialsCostConversion = isBestCost ? dataFromAPI?.NetRawMaterialsCost : dataFromAPI?.NetRawMaterialsCostConversion
  obj.NetBoughtOutPartCostConversion = isBestCost ? dataFromAPI?.NetBoughtOutPartCost : dataFromAPI?.NetBoughtOutPartCostConversion
  obj.NetConversionCostConversion = isBestCost ? dataFromAPI?.NetConversionCost : dataFromAPI?.NetConversionCostConversion
  obj.NetProcessCostConversion = isBestCost ? dataFromAPI?.NetProcessCost : dataFromAPI?.NetProcessCostConversion
  obj.NetOperationCostConversion = isBestCost ? dataFromAPI?.NetOperationCost : dataFromAPI?.NetOperationCostConversion
  obj.NetOtherOperationCostConversion = isBestCost ? dataFromAPI?.NetOtherOperationCost : dataFromAPI?.NetOtherOperationCostConversion
  obj.NetTotalRMBOPCCConversion = isBestCost ? dataFromAPI?.NetTotalRMBOPCC : dataFromAPI?.NetTotalRMBOPCCConversion
  obj.NetSurfaceTreatmentCostConversion = isBestCost ? dataFromAPI?.NetSurfaceTreatmentCost : dataFromAPI?.NetSurfaceTreatmentCostConversion
  obj.TransportationCostConversion = isBestCost ? dataFromAPI?.TransportationCost : dataFromAPI?.TransportationCostConversion
  obj.NetFreightPackagingCostConversion = isBestCost ? dataFromAPI?.NetFreightPackagingCost : dataFromAPI?.NetFreightPackagingCostConversion
  obj.NetToolCostConversion = isBestCost ? dataFromAPI?.NetToolCost : dataFromAPI?.NetToolCostConversion
  obj.NetDiscountsCostConversion = isBestCost ? dataFromAPI?.NetDiscountsCost : dataFromAPI?.NetDiscountsCostConversion
  obj.NetOtherCostConversion = isBestCost ? dataFromAPI?.NetOtherCost : dataFromAPI?.NetOtherCostConversion
  obj.SurfaceTreatmentCostConversion = isBestCost ? dataFromAPI?.SurfaceTreatmentCost : dataFromAPI?.SurfaceTreatmentCostConversion
  obj.NetOverheadAndProfitCostConversion = isBestCost ? dataFromAPI?.NetOverheadAndProfitCost : dataFromAPI?.NetOverheadAndProfitCostConversion
  obj.OverheadCostConversion = isBestCost ? dataFromAPI?.OverheadCost : dataFromAPI?.OverheadCostConversion
  obj.ProfitCostConversion = dataFromAPI?.ProfitCostConversion
  obj.RejectionCostConversion = dataFromAPI?.RejectionCostConversion
  obj.ICCCostConversion = dataFromAPI?.ICCCostConversion
  obj.PaymentTermCostConversion = dataFromAPI?.PaymentTermCostConversion
  obj.PackagingCostConversion = dataFromAPI?.PackagingCostConversion
  obj.FreightCostConversion = dataFromAPI?.FreightCostConversion
  obj.NetChildPartsCostConversion = dataFromAPI?.NetChildPartsCostConversion
  obj.MasterBatchRMPriceConversion = dataFromAPI?.MasterBatchRMPriceConversion
  obj.MasterBatchTotalConversion = dataFromAPI?.MasterBatchTotalConversion
  obj.TotalCostBeforeDiscountAndOtherCostConversion = dataFromAPI?.TotalCostBeforeDiscountAndOtherCostConversion
  obj.DiscountCostConversion = dataFromAPI?.DiscountCostConversion
  obj.OtherCostConversion = dataFromAPI?.OtherCostConversion
  obj.RawMaterialCostWithCutOffConversion = dataFromAPI?.RawMaterialCostWithCutOffConversion
  obj.NetLabourCostConversion = dataFromAPI?.NetLabourCostConversion
  obj.NetLabourCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetLabourCost ? dataFromAPI?.CostingPartDetails?.NetLabourCost : 0
  obj.IndirectLaborCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.IndirectLaborCost ? dataFromAPI?.CostingPartDetails?.IndirectLaborCost : 0
  obj.IndirectLaborCostConversion = dataFromAPI?.IndirectLaborCostConversion
  obj.StaffCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.StaffCost ? dataFromAPI?.CostingPartDetails?.StaffCost : 0
  obj.StaffCostConversion = dataFromAPI?.StaffCostConversion
  obj.LocalCurrency = dataFromAPI?.LocalCurrency
  obj.NetPOPriceLocalConversion = dataFromAPI?.NetPOPriceLocalConversion
  obj.NetPOPriceConversion = dataFromAPI?.NetPOPriceConversion
  obj.BasicRateConversion = dataFromAPI?.BasicRateConversion
  obj.NetToolCostConversion = isBestCost ? dataFromAPI?.NetToolCost : dataFromAPI?.NetToolCostConversion
  obj.NetOverheadAndProfitConversion = dataFromAPI?.NetOverheadAndProfitConversion
  obj.NetSurfaceTreatmentConversion = dataFromAPI?.NetSurfaceTreatmentConversion
  obj.NetFreightPackagingConversion = dataFromAPI?.NetFreightPackagingConversion
  obj.nTotalRMBOPCCLocalConversion = dataFromAPI?.CostingPartDetails && dataFromAPI.NetTotalRMBOPCCLocalConversion ? dataFromAPI.NetTotalRMBOPCCLocalConversion : 0
  obj.QuotationId = dataFromAPI?.QuotationId ?? null
  obj.IsRfqCosting = dataFromAPI?.IsRFQCosting ?? false
  temp.push(obj)
  return temp
}

/*VOLUME AND DENSITY BASED ON DIAMETER*/
export function getVolume(innerDiameter, outerDiameter, height) {
  const value = (Math.PI / 4) * (Math.pow(outerDiameter, 2) - Math.pow(innerDiameter, 2)) * height
  return checkForNull(value)
}

export function getWeightFromDensity(density, innerDiameter, outerDiameter, height) {
  const value = density * getVolume(innerDiameter, outerDiameter, height)
  return value
}

/*VOLUME AND DENSITY BASED ON LENGTH WIDTH AND THICKNESS*/
export function calculateVolume(length, width, thickness) {
  const value = length * width * thickness
  return value
}

export function calculateWeight(density, length, width, thickness) {
  const value = density * calculateVolume(length, width, thickness)

  return value
}

export const applySuperScripts = (cell) => {
  if (cell && cell !== '') {
    const capIndex = cell && cell.indexOf('^');
    const superNumber = cell.substring(capIndex + 1, capIndex + 2);
    const capWithNumber = cell.substring(capIndex, capIndex + 2);
    return cell?.replace(capWithNumber, superNumber.sup());
  } else {
    return '';
  }
}


export function convertmmTocm(value) {
  return value / 10
}

/**g to kg,mg**/
export function setValueAccToUOM(value, UOM) {
  switch (UOM) {
    case DISPLAY_G:
      return checkForNull(value)
    case DISPLAY_KG:
      return checkForNull(value / 1000)
    case DISPLAY_MG:
      return checkForNull(value * 1000)
    default:
      break;
  }
}

export function getTechnologyPermission(technology) {
  switch (technology) {
    case SHEET_METAL:
      return SHEET_METAL;
    case PLASTICNAME:
      return PLASTICNAME;
    case WIRING_HARNESS:
      return WIRING_HARNESS;
    case NON_FERROUS_GDC:
      return NON_FERROUS_GDC;
    case PLATING:
      return PLATING;
    case SPRINGS:
      return SPRINGS;
    case HARDWARE:
      return HARDWARE;
    case MACHINING:
      return MACHINING;
    case ELECTRONICS:
      return ELECTRONICS;
    case RIVET:
      return RIVET;
    case NON_FERROUS_HPDC:
      return NON_FERROUS_HPDC;
    case RUBBER:
      return RUBBER;
    case FORGINGNAME:
      return FORGINGNAME;
    case DIECASTING:
      return DIECASTING
    case MECHANICAL_PROPRIETARY:
      return MECHANICAL_PROPRIETARY;
    case ELECTRICAL_PROPRIETARY:
      return ELECTRICAL_PROPRIETARY;
    case LOGISTICS:
      return LOGISTICS;
    case CORRUGATEDBOX:
      return CORRUGATEDBOX;
    case FABRICATION:
      return FABRICATION;
    case FERROUSCASTING:
      return FERROUSCASTING;
    case WIREFORMING:
      return WIREFORMING
    case ELECTRIC:
      return ELECTRIC;
    case ELECTRONICSNAME:
      return ELECTRONICSNAME
    case FASTNERS:
      return FASTNERS
    case ASSEMBLYNAME:
      return ASSEMBLYNAME

    default:
      break;
  }
}

export function isRMDivisorApplicable(technology) {
  const allowedTechnologyForRMDivisor = [SPRINGS, FASTNERS, RIVETS];
  return allowedTechnologyForRMDivisor.includes(technology);
}



export function findLostWeight(tableVal, isPlastic = false) {
  let sum = 0
  tableVal && tableVal.map(item => {
    if ((Number(item.LossOfType) === 2 || Number(item.LossOfType) === 3) && isPlastic) {
      return false
    } else {
      sum = sum + item.LossWeight
    }
    return null
  })

  return sum
}

//THIS FUNCTION TO CHECK WHETHER MASTER APPROVAL IS APPLICALBE AND ON WHICH MASTER IT IS APPLICABLE (ApprovalMasterArrayList COMING FROM PAGE INIT)
export function CheckApprovalApplicableMaster(number) {
  const isApproval = getConfigurationKey()?.ApprovalMasterArrayList?.includes(number) && getConfigurationKey()?.IsMasterApprovalAppliedConfigure
  return isApproval
}



// THIS FUNCTION WILL BE USED IF WE FOR EDITING OF SIMUALTION,WE DON'T NEED ANY FILTER
export function applyEditCondSimulation(master) {
  const ApplyEditCondition = [RMDOMESTIC, RMIMPORT, BOPDOMESTIC, BOPIMPORT, PROCESS, OPERATIONS, SURFACETREATMENT, MACHINERATE, OVERHEAD, PROFIT, EXCHNAGERATE, RAWMATERIALINDEX]
  return ApplyEditCondition.includes(String(master))
}

//THIS FUNCTION FOR CONDITION RNDERING OF COMPONENT FOR DIFFERENT MASTER
export function getOtherCostingSimulation(master) {
  const useOtherSimulationPage = [EXCHNAGERATE]
  return useOtherSimulationPage.includes(master)
}

// THIS FUNCTION IS TO GET FILTERED DATA FOR RM WHERE IsRMAssociated IS TRUE (ONLY APPLICABLE IN CASE OF SIMULATION)
export function getFilteredData(arr, id) {

  switch (id) {

    case 1:    // CASE 1 FOR RM 

      const list = arr && arr.filter((item => item.IsRMAssociatedForSimulation === true))
      return list


    case 2:   //CASE 2 FOR BOP

      const listBop = arr && arr.filter((item => item.IsBOPAssociatedForSimulation === true))
      return listBop


    case 3:   //CASE 3 FOR OPERATIONS

      const listOperation = arr && arr.filter((item => item.IsOperationAssociatedForSimulation === true))
      return listOperation

    case 4:   //CASE 4 FOR MACHINE

      const listMachine = arr && arr.filter((item => item.IsMachineAssociated === true))
      return listMachine

    default:
      break;


  }


}

export function calculateScrapWeight(grossWeight, finishWeight, ScrapRecoveryPercentage = 100) {
  const scrapWeight = checkForNull(grossWeight - finishWeight) * checkForNull(ScrapRecoveryPercentage / 100)
  return scrapWeight
}

export function calculateScrapCost(scrapWeight, scrapRate) {
  const scrapCost = scrapWeight * scrapRate
  return scrapCost
}

export function calculateNetLandedCost(rmRate, grossWeight, scrapWeight, scrapRate) {
  const netLandedCost = (rmRate * grossWeight) - (scrapWeight * scrapRate)
  return netLandedCost
}

export function isUploadSimulation(master) {
  const isUploadSimulation = [EXCHNAGERATE]
  return isUploadSimulation.includes(String(master))
}

export function getPOPriceAfterDecimal(decimalValue, PoPrice = 0) {
  let netPo = 0
  let quantity = 1
  if (decimalValue === 'RoundOff') {
    netPo = Math.round(PoPrice)
    quantity = 1
    return { netPo, quantity }
  }
  else if (decimalValue === 'Truncate') {
    netPo = checkForDecimalAndNull(PoPrice, 2)
    quantity = 1
    return { netPo, quantity }
  }
  else if (decimalValue === 'Per100') {
    netPo = PoPrice * 100
    quantity = 100
    return { netPo, quantity }
  }
}
export const allEqual = arr => arr.every(val => val === arr[0]);

// FOR SHOWING CURRENCY SYMBOL 
export const getCurrencySymbol = (value) => {
  switch (value) {
    case "USD":
      return "$"
    case "EUR":
      return "€"
    case "GBP":
      return "£"
    case "IDR":
      return "Rp"
    case "JPY":
      return "¥"
    case "VND":
      return "₫"
    case "INR":
      return "₹"
    case "THB":
      return "฿"
    case "SEK":
      return "kr"
    default:
      return "₹"
  }
}
//FOR SHOWING SUPER VALUE FOR UOM
export const displayUOM = (value) => {
  let temp = []
  if (value && value.includes('^')) {
    for (let i = 0; i < value.length; i++) {
      temp.push(value.charAt(i))
    }
    temp.splice(temp.length - 2, 1);
    const UOMValue = <span>{temp.map((item, ind) => {
      if (temp.length !== ind + 1) {
        return <>{item}</>
      } else {
        return <sup>{item}</sup>
      }
    })}
    </span>
    return UOMValue
  }
  return value
}
export const labelWithUOMAndCurrency = (label, UOM, currency) => {
  return <>{label} ({currency ? currency : getConfigurationKey().BaseCurrency}/{UOM ? displayUOM(UOM) : 'UOM'})</>
}

export const labelWithUOMAndUOM = (label, UOM, ScrapUOM) => {
  return <>{label} ({UOM ? displayUOM(UOM) : 'UOM'}/{ScrapUOM ? displayUOM(ScrapUOM) : 'UOM'})</>
}

// THIS FUNCTION SHOWING TITLE ON HOVER FOR ACTIVE AND INACTIVE STATUS IN GRID
export const showTitleForActiveToggle = (index, titleFirst, titleSecond) => {
  setTimeout(() => {
    let titleActive = document.getElementsByClassName("active-switch")[index];

    if (titleActive === undefined || titleActive === null) {
      let rowIndex = index
      let array = Array.from(String(rowIndex), Number)
      if (array.length === 1) {
        rowIndex = array[0]
      } else if (array.length === 2) {
        rowIndex = array[1]
      } else {
        rowIndex = array[2]
      }
      titleActive = document.getElementsByClassName("active-switch")[rowIndex];
    }

    titleActive?.setAttribute('title', titleFirst);
    let titleInactive = document.getElementsByClassName("inactive-switch")[index];

    if (titleInactive === undefined || titleInactive == null) {
      let rowIndex = index
      let array = Array.from(String(rowIndex), Number)
      if (array.length === 1) {
        rowIndex = array[0]
      } else if (array.length === 2) {
        rowIndex = array[1]
      } else {
        rowIndex = array[2]
      }
      titleInactive = document.getElementsByClassName("inactive-switch")[rowIndex];
    }
    titleInactive?.setAttribute('title', titleSecond);

  }, 500);
}
//COMMON FUNCTION FOR MASTERS BULKUPLOAD CHECK
export const checkForSameFileUpload = (master, fileHeads, isBOP = false, isRm = false) => {

  let checkForFileHead, array = []
  let bulkUploadArray = [];   //ARRAY FOR COMPARISON 
  const bopMasterName = showBopLabel()
  array = _.map(master, 'label')
  bulkUploadArray = [...array]
  if (isBOP) {
    bulkUploadArray = bulkUploadArray.map(item =>
      item?.replace('BOP', bopMasterName)?.replace('BoughtOutPart', bopMasterName)
    );
    fileHeads = fileHeads.map(item =>
      item?.replace('BOP', bopMasterName)?.replace('BoughtOutPart', bopMasterName)

    );


  }


  if (isRm) {
    const hasNote = fileHeads.includes('Note') || bulkUploadArray.includes('Note');

    if (hasNote) {
      fileHeads = fileHeads.filter(header => header !== 'Note');
      bulkUploadArray = bulkUploadArray.filter(header => header !== 'Note');
    }
  }

  // if (isRm && !fileHeads.includes('Note')) {
  //   fileHeads.unshift('Note');
  // }

  checkForFileHead = _.isEqual(fileHeads, bulkUploadArray)
  return checkForFileHead
}


// SHOW ALL DATA ON HOVER WHEN DATA INPUT FIELD WILL DISABLE OR VIEW MODE
export const showDataOnHover = (value) => {
  let temp = [];
  value && value.map(item => temp.push(item.Text));
  const data = temp.join(", ");
  return data;
}

// SHOW ERROR ON TOUCH IN VENDOR DROPDOWN AND DATE
export const onFocus = (thisRef, dateFocus) => {
  const temp = thisRef.state.selectValue && thisRef.selectRef.current.inputRef.select();
  if (dateFocus) {
    thisRef.setState({ showErrorOnFocusDate: true })
  } else {
    thisRef.setState({ showErrorOnFocus: true })
  }
  return temp
}

//FOR SHOWING NO DATA FOUND IMAGE WHEN DATA WILL ZERO WHILE USER TYPE
export const searchNocontentFilter = (value, data) => {

  let temp = data
  if (value?.api?.rowModel?.rowsToDisplay?.length === 0) {
    temp = true
  } else {
    temp = false
  }
  return temp;
}

//FOR RESETING CUSTOM TABLE SCROLL
export const scrollReset = (ID) => {

  let temp = document.getElementById(ID);
  temp.scrollLeft = 0;
}

//FOR SHOWING COLOR ON VALUE DECREASE AND INCREASE
export const highlightCostingSummaryValue = (oldValue, newValue) => {
  let getOldValue = oldValue ? oldValue : 0;
  let getNewValue = newValue ? newValue : 0;
  let className = getOldValue === getNewValue ? '' : getOldValue > getNewValue ? 'green-text' : 'red-text';

  return className;
}

export function addDays(theDate, days) {
  return new Date(theDate.getTime() + days * 24 * 60 * 60 * 1000);
}

export function ceilByMultiple(number, multiple = 0.25) {
  var inv = 1.0 / multiple;
  return (Math.ceil(number * inv) / inv).toFixed(getConfigurationKey().NoOfDecimalForInputOutput);
}

export function userTechnologyLevelDetails(approvalTypeId, data = []) {
  let dataList = [...data]
  let filteredData = dataList?.filter(element => Number(element.ApprovalTypeId) === Number(approvalTypeId))
  let obj = {
    Level: filteredData[0]?.Level,
    LevelId: filteredData[0]?.LevelId,
    ApprovalTypeId: filteredData[0]?.ApprovalTypeId,
    length: filteredData?.length
  }
  return obj
}

export function userTechnologyLevelDetailsWithoutCostingToApproval(approvalTypeId, data = []) {
  let dataList = [...data]
  let filteredData = dataList?.filter(element => Number(element.ApprovalTypeId) === Number(approvalTypeId))
  let obj = {
    Level: filteredData[0]?.Level,
    LevelId: filteredData[0]?.LevelId,
    ApprovalTypeId: filteredData[0]?.ApprovalTypeId,
    length: filteredData?.length
  }
  return obj
}

export function userTechnologyDetailByMasterId(costingTypeId, masterId, data = []) {
  let dataList = [...data]
  let filteredData = dataList?.filter(element => (element.MasterId === masterId && element.ApprovalTypeId === costingTypeId))
  let obj = {
    Level: filteredData[0]?.Level,
    LevelId: filteredData[0]?.LevelId,
    ApprovalTypeId: filteredData[0]?.ApprovalTypeId,
    length: filteredData?.length
  }
  return obj
}


export function compareObjects(obj1, obj2) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  // Check if the number of keys is the same
  if (keys1.length !== keys2.length) {
    return false;
  }

  // Check if all key-value pairs are the same
  for (let key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  // All key-value pairs are the same
  return true;
}

export function removeBOPfromApplicability(list) {
  //MINDA
  // export function removeBOPFromList(list) {
  let tempList = list?.filter(item => !item?.label?.includes('BOP'))
  return tempList
}

export const OverheadAndProfitTooltip = (id, object, arr, conditon, NoOfDecimalForPrice) => {
  let applyValue = checkForDecimalAndNull(arr && arr[0]?.RawMaterialCostWithCutOff, NoOfDecimalForPrice)
  let text = ""

  if (id.includes("RM")) {

    text = <>{arr && arr[0]?.IsRMCutOffApplicable && <p>{`RM cut-off price ${applyValue} applied`}</p>}</>;
    return (arr && arr[0]?.IsRMCutOffApplicable) ? <TooltipCustom id={id} width={"290px"} tooltipText={text} /> : ''

  } else if (id.includes("BOP")) {

    text = conditon && <p>{showBopLabel()} cost is not included for {showBopLabel()} part type</p>;
    return conditon ? <TooltipCustom id={id} width={"290px"} tooltipText={text} /> : ''
  } else if (id.includes("Combined")) {
    text = <>{arr[0]?.IsRMCutOffApplicable === true && <p>{`RM cut-off price ${applyValue} applied`}</p>}{object && object?.OverheadApplicability && object?.OverheadApplicability.includes('BOP') && conditon && <p>{showBopLabel()} cost is not included for {showBopLabel()} part type</p>}</>;

    return (arr[0]?.IsRMCutOffApplicable === true && (object?.OverheadApplicability?.includes("RM")) || object?.ProfitApplicability?.includes("RM")) || (object && object?.OverheadApplicability && object?.OverheadApplicability.includes('BOP') && conditon) ? <TooltipCustom id={id} width={"290px"} tooltipText={text} /> : ""
  }
}

export function showRMScrapKeys(technology) {
  let obj = {}
  switch (Number(technology)) {
    case FORGING:
      obj.showForging = true
      obj.showCircleJali = false
      obj.showScrap = false
      obj.name = 'Forging Scrap Rate'
      break;
    case SHEETMETAL:
      obj.showForging = false
      obj.showCircleJali = true
      obj.showScrap = false
      obj.name = 'Circle Jali Scrap Rate'
      break;
    default:
      obj.showForging = false
      obj.showCircleJali = false
      obj.showScrap = true
      obj.name = 'Scrap Rate'
      break;
  }
  return obj
}

export function getValueFromLabel(currency, currencySelectList) {
  const data = currencySelectList && currencySelectList?.filter(element => element?.Text === currency)
  return data[0]
}
// get updated  dynamic bop labels 
export function updateBOPValues(bopLabels = [], bopData = [], bopReplacement = '', labelName) {

  const bopRegex = /BOP|BoughtOutPart/gi;
  const updatedLabels = bopLabels.map(label => ({
    ...label,
    [labelName]: label[labelName]?.replace(bopRegex, bopReplacement),

    // const updatedTempData = bopData.map(dataItem => {
    //   const newDataItem = {};
    //   for (let key in dataItem) {
    //     if (dataItem.hasOwnProperty(key)) {
    //       const newKey = key?.replace(bopRegex, bopReplacement);
    //       newDataItem[newKey] = dataItem[key];
    //     }
    //   }
    //   return newDataItem;
    // });
  }));
  return { updatedLabels };
}
/**
  * @method setLoremIpsum
  * @description show lorem ipsum data when stared application tour
  */
export function setLoremIpsum(obj) {
  const setLorem = (input) => {
    if (Array.isArray(input)) {
      return input.map(innerItem => Array.isArray(innerItem) ? setLorem(innerItem) : typeof innerItem === 'object' && innerItem !== null ? setLorem(innerItem) : "Lorem Ipsum");
    } else if (typeof input === 'object' && input !== null) {
      const newObj = {};
      Object.keys(input).forEach(key => {
        newObj[key] = key === 'data' && Array.isArray(input[key]) && input[key].length > 1 ? [setLorem(input[key][0])] : Array.isArray(input[key]) ? setLorem(input[key]) : typeof input[key] === 'object' && input[key] !== null ? setLorem(input[key]) : "Lorem Ipsum";
      });
      return newObj;
    } else {
      return "Lorem Ipsum";
    }
  };

  return [setLorem(obj)];
}

//

// function for % and & issue in the queryparams
// Utility function to encode query parameters
export function encodeQueryParams(params) {
  return Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}
/**
  * @method getTimeZone
  * @description get time zone
  */
export function getTimeZone() {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Mapping of old names to preferred names
  const timeZoneMap = {
    'Asia/Calcutta': 'Asia/Kolkata'
  };

  // Return the preferred name if it exists in the map, otherwise return the original
  return timeZoneMap[timeZone] || timeZone;
}


export function encodeQueryParamsAndLog(obj) {
  const queryParams = Object.entries(obj)
    .filter(([key, value]) => value !== undefined && value !== "")
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  return queryParams;
}

export function displayNavigationLength() {
  const screenWidth = window.screen.width;

  switch (true) {
    case screenWidth >= 1068 && screenWidth <= 1167:
      return 5;

    case screenWidth >= 1168 && screenWidth <= 1267:
      return 6;

    case screenWidth >= 1268 && screenWidth <= 1365:
      return 7;

    case screenWidth >= 1366 && screenWidth <= 1440:
      return 8;

    case screenWidth >= 1441 && screenWidth <= 1600:
      return 10;

    case screenWidth >= 1661 && screenWidth < 1920:
      return 13;

    case screenWidth >= 1920:
      return 14;

    default:
      return 7;
  }
}

export const changeBOPLabel = (arr, bopReplacement) => {
  const bopRegex = /BOP|BoughtOutPart/gi;
  let tempArr = []
  arr && arr?.map(element => {
    tempArr.push(element?.replace(bopRegex, bopReplacement))
  })
  return tempArr
}
export const getFilteredDropdownOptions = (options, selectedValues) => {
  return options.filter(option => !selectedValues.includes(option.value));
};

export const extenstionTime = (length = 5, timeGap = 1, TimeCategory = 'min') => {
  let temp = [];
  for (let i = 1; i <= length; i++) {
    if (i % timeGap === 0) {
      temp.push({ label: `${i} (${TimeCategory})`, value: i });
    }
  }
  return temp;
}
export const levelDropdown = (length = 6, label = 'Level') => {
  let temp = [];
  for (let i = 1; i <= length; i++) {
    temp.push({ label: `${label}-${i}`, value: i });
  }
  return temp;
}
export const durationTimeDropdown = (length = 12, timeGap = 15) => {
  let temp = [];
  for (let i = timeGap; i <= length * 60; i += timeGap) {
    const minutes = Math.floor(i / 60);
    const seconds = i % 60;
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    temp.push({ label: formattedTime, value: i });
  }
  return temp;
}

export function calculateEndDateTime(startDateTime, duration) {


  if (!startDateTime || !duration) return null;

  // Parse startDateTime
  const startDate = new Date(startDateTime);


  // Adjust for UTC+05:30 (India Standard Time)
  const adjustedStartDate = new Date(startDate.getTime() + (5.5 * 60 * 60 * 1000));


  // Parse duration (HH:MM)
  const [durationHours, durationMinutes] = duration.split(':').map(Number);

  // Calculate endDateTime
  const endDateTime = new Date(adjustedStartDate);
  endDateTime.setHours(adjustedStartDate.getHours() + durationHours);
  endDateTime.setMinutes(adjustedStartDate.getMinutes() + durationMinutes);

  // Format endDateTime as a string (YYYY-MM-DD HH:mm:ss)
  const formattedEndDateTime = endDateTime.toISOString().slice(0, 19).replace('T', ' ');

  return formattedEndDateTime;
}
export function calculateTime(input) {
  // Check if input is a string
  if (typeof input !== 'string') {
    throw new Error('Input must be a string.');
  }

  // Extract the numeric value and the unit from the input string
  const match = input.match(/^(\d+)\s+\(min\)$/);
  if (match) {
    // If input matches "<number> (min)"
    const mins = parseInt(match[1]); // Extract the numeric value as minutes

    // Format minutes to always have 2 digits
    let minsStr = mins.toString().padStart(2, '0');

    // Return the formatted time string in HH:MM format
    return `00:${minsStr}`;
  }

  // Extract the numeric value and the unit from the input string
  const match2 = input.match(/^(\d+(\.\d+)?)\s+\(hours?\)$/);
  if (match2) {
    // If input matches "<number> (hours)" or "<number> (hrs)"
    const value = parseFloat(match2[1]); // Extract the numeric value
    const hours = Math.floor(value); // Extract the integer part as hours
    const mins = Math.round((value - hours) * 60); // Convert decimal part to minutes

    // Format hours and minutes to always have 2 digits
    let hoursStr = hours.toString().padStart(2, '0');
    let minsStr = mins.toString().padStart(2, '0');

    // Return the formatted time string in HH:MM format
    return `${hoursStr}:${minsStr}`;
  }

  throw new Error('Invalid input format. Use "<number> (min)" or "<number> (hours)" or "<number> (hrs)".');
}


export function addTime(time1, time2) {
  // Parse time1
  const [hours1, mins1] = time1.split(':').map(num => num ? parseInt(num) : 0);
  // Parse time2
  const [hours2, mins2] = time2.split(':').map(num => num ? parseInt(num) : 0);

  // Calculate total minutes
  let totalMins = mins1 + mins2;
  let totalHours = hours1 + hours2;

  // Handle overflow of minutes into hours
  if (totalMins >= 60) {
    totalMins -= 60;
    totalHours += 1;
  }

  // Format hours and minutes to always have 2 digits
  let hoursStr = totalHours.toString().padStart(2, '0');
  let minsStr = totalMins.toString().padStart(2, '0');

  // Combine hours and minutes in HH:MM format
  let timeStr = `${hoursStr}:${minsStr}`;

  return timeStr;
}
export function checkTechnologyIdAndRfq(viewCostingData = []) {
  for (const data of viewCostingData) {
    if (data?.technologyId === TOOLING_ID) {
      return true;
    } else if (data?.technologyId === '-') {
      continue;
    }
  }

  return false;
}
// function to remove all spaces from a string
export const removeSpaces = (str = '') => {
  return str?.replace(/\s+/g, '');
};
export const getChangeHighlightClass = (originalValue, updatedValue) => {
  return updatedValue && updatedValue !== originalValue ? 'red-value' : '';
};


//localized listing
export const getLocalizedCostingHeadValue = (cellValue, vendorBasedLabel = '', zeroBasedLabel = '', customerBasedLabel = '', vendorCodeLabel = '') => {
  if (cellValue === true || cellValue === 'Vendor Based' || cellValue === 'VBC') {
    return vendorBasedLabel;
  } else if (cellValue === false || cellValue === 'Zero Based' || cellValue === 'ZBC') {
    return zeroBasedLabel;
  } else if (cellValue === 'Customer Based' || cellValue === 'CBC') {
    return customerBasedLabel;
  } else if (cellValue === 'Vendor(Code)') {
    return vendorCodeLabel;
  }else{
    return cellValue
  }
}
// export const frameBreaker = () => {
//   // Ensure window runs in top-level
//   if (window.self !== window.top) {
//     window.top.location = window.self.location;
//   }
// };
export const RFQ_KEYS = {
  RM_MANDATORY: getConfigurationKey()?.RFQManditFields?.IsRMMandatoryForParts,
  SPECIFICATION_MANDATORY: getConfigurationKey()?.RFQManditFields?.IsSpecificationMandatory,
  ANNUAL_FORECAST_MANDATORY: getConfigurationKey()?.RFQManditFields?.IsAnnualForecastMandatory,
  REMARKS_ATTACHMENT_MANDATORY: getConfigurationKey()?.RFQManditFields?.IsRemarksAndAttachmentMandatory,
  SHOW_N100_HAVELLS: getConfigurationKey()?.RFQManditFields?.IsShowN100andHavellsAndProprietaryType,
  VISIBILITY_CONDITION: getConfigurationKey()?.RFQManditFields?.IsVisibilityConditionMandatory,
  SHOW_RM: getConfigurationKey()?.RFQManditFields?.IsShowRMForRFQ,
  SHOW_BOP: getConfigurationKey()?.RFQManditFields?.IsShowBOPForRFQ,
  SHOW_TOOLING: getConfigurationKey()?.RFQManditFields?.IsShowToolingForRFQ
};
export const calculateBestCost = (arrayList, showConvertedCurrency = false) => {
  if (!arrayList?.length) return [];

  // First, remove any existing bestCost items to prevent duplicates
  const finalArrayList = _.cloneDeep(arrayList).filter(item => !item.bestCost);

  // If array is empty after filtering, return original array
  if (!finalArrayList.length) return arrayList;

  // Check if currency conversion needed
  const isSameCurrency = _.map(finalArrayList, 'Currency')
    .every(element => element === getConfigurationKey().BaseCurrency);

  const minObject = {
    ...finalArrayList[0],
    attachment: [],
    bestCost: true
  };

  // Rest of your existing logic...
  if (isSameCurrency) {
    const keys = ["NetLandedCost", "BasicRatePerUOM", "OtherNetCost"];
    Object.keys(minObject).forEach(key => minObject[key] = "");

    keys.forEach(key => {
      minObject[key] = Math.min(...finalArrayList
        .map(item => isNumber(item[key]) ? checkForNull(item[key]) : Infinity));
    });

    minObject.nPOPrice = keys.reduce((sum, key) =>
      sum + checkForNull(minObject[key]), 0);
  }
  else if (!showConvertedCurrency) {
    Object.keys(minObject).forEach(key => minObject[key] = "");

    const conversionKeys = ["NetLandedCostConversion", "BasicRatePerUOMConversion", "OtherNetCostConversion"];

    conversionKeys.forEach(key => {
      minObject[key] = Math.min(...finalArrayList
        .map(item => isNumber(item[key]) ? checkForNull(item[key]) : Infinity));
    });

    minObject.bestCost = "";
  }
  else {
    const conversionKeys = ["NetLandedCostConversion", "BasicRatePerUOMConversion", "OtherNetCostConversion"];

    Object.keys(minObject).forEach(key => minObject[key] = "");

    conversionKeys.forEach(key => {
      minObject[key] = Math.min(...finalArrayList
        .map(item => isNumber(item[key]) ? checkForNull(item[key]) : Infinity));
    });

    minObject.nPOPrice = conversionKeys.reduce((sum, key) =>
      sum + checkForNull(minObject[key]), 0);
  }

  return [...finalArrayList, minObject];
};


export const canEnableFields = ({
  plant,
  technology,
  type,
  updateButtonPartNoTable,
  isEditMode,
  isViewMode,
  isEditFlagReceived,     // Flag indicating if quotation is received
  showSendButton,  // Add this parameter
  isAddFlag       // Add this parameter
}) => {

  // First check if quotation is received - disable all fields
  if (isEditFlagReceived) {
    return false;
  }

  // Check for view mode - disable all fields
  if (isViewMode) {
    return false;
  }

  // For add mode or draft/predraft status
  if (isAddFlag || showSendButton === 'Draft' || showSendButton === 'PreDraft') {
    // For RM type, need both plant and technology
    if (type === 'RM') {
      return Object.keys(plant || {}).length > 0 &&
        Object.keys(technology || {}).length > 0;
    }
    // For other types, only need plant
    return Object.keys(plant || {}).length > 0;
  }

  // For grid edit operations
  if (updateButtonPartNoTable && isEditMode && !isViewMode) {
    // Disable fields even in edit mode if quotation is received

    return true;
  }


  // For grid edit operations
  if (updateButtonPartNoTable && isEditMode && !isViewMode) {
    return true;
  }

  // Default case - fields should be disabled
  return false;
};
// ... existing code ...

export const getExchangeRateParams = ({ toCurrency, defaultCostingTypeId, vendorId, clientValue, master = "", plantCurrency = "" }) => {
  const isPlantAndTargetBothBase = plantCurrency === reactLocalStorage.getObject("baseCurrency") &&
    toCurrency === reactLocalStorage.getObject("baseCurrency");

  // Handle base currency conversion only for settlement currency, not when both are INR
  if (toCurrency === reactLocalStorage.getObject("baseCurrency") &&
    !isPlantAndTargetBothBase) {
    return {
      costingHeadTypeId: ZBCTypeId,
      vendorId: null,
      clientId: null
    };
  }

  // Handle Raw Material case
  if (master === RAWMATERIAL && defaultCostingTypeId === ZBCTypeId) {

    const useVendorWise = IsFetchExchangeRateVendorWiseForZBCRawMaterial();
    return {
      costingHeadTypeId: useVendorWise ? VBCTypeId : defaultCostingTypeId,
      vendorId: useVendorWise ? vendorId : EMPTY_GUID,
      clientId: clientValue
    };
  }

  // Handle BOP case
  if (master === BOP) {
    const useVendorWise = IsFetchExchangeRateVendorWiseForParts();
    return {
      costingHeadTypeId: useVendorWise ?
        (defaultCostingTypeId === VBCTypeId || defaultCostingTypeId === ZBCTypeId ? VBCTypeId : defaultCostingTypeId)
        : ZBCTypeId,
      vendorId: useVendorWise ? vendorId : EMPTY_GUID,
      clientId: clientValue
    };
  }

  // Handle default case
  const isZBC = defaultCostingTypeId === ZBCTypeId;
  const useVendorWise = IsFetchExchangeRateVendorWiseForParts();

  if (isZBC) {
    return {
      costingHeadTypeId: ZBCTypeId,
      vendorId: EMPTY_GUID,
      clientId: clientValue
    };
  }

  return {
    costingHeadTypeId: useVendorWise ?
      (defaultCostingTypeId === VBCTypeId ? VBCTypeId : defaultCostingTypeId)
      : ZBCTypeId,
    vendorId: useVendorWise ? vendorId : EMPTY_GUID,
    clientId: clientValue
  };
};
/**
 * Calculates net costs based on applicability type
 * @param {number} cost - The cost value
 * @param {object} applicability - The applicability object
 * @param {string} prefix - 'Operation' or 'Process'
 */
export const calculateNetCosts = (cost = 0, applicability, prefix = 'Operation', costWithoutInterestAndDepreciation = 0, isDetailed = false, uomType = '') => {


  const result = {
    [`Net${prefix}CostForOverhead`]: 0,
    [`Net${prefix}CostForProfit`]: 0,
    [`Net${prefix}CostForOverheadAndProfit`]: 0
  };

  // Check if excluding applicability is selected but form is not detailed
  const isExcludingApplicability = [
    APPLICABILITY_OVERHEAD_EXCL,
    APPLICABILITY_PROFIT_EXCL,
    APPLICABILITY_OVERHEAD_PROFIT_EXCL,
    APPLICABILITY_OVERHEAD_EXCL_PROFIT,
    APPLICABILITY_OVERHEAD_EXCL_PROFIT_EXCL
  ].includes(applicability);
  if (isExcludingApplicability) {
    if (!isDetailed || uomType !== TIME) {
      costWithoutInterestAndDepreciation = cost;
    }
  }



  switch (applicability) {
    case APPLICABILITY_OVERHEAD:
      result[`Net${prefix}CostForOverhead`] = cost ?? 0;
      break;
    case APPLICABILITY_OVERHEAD_EXCL:
      result[`Net${prefix}CostForOverhead`] = costWithoutInterestAndDepreciation ?? 0;
      break;
    case APPLICABILITY_PROFIT:
      result[`Net${prefix}CostForProfit`] = cost ?? 0;
      break;
    case APPLICABILITY_PROFIT_EXCL:
      result[`Net${prefix}CostForProfit`] = costWithoutInterestAndDepreciation ?? 0;
      break;
    case APPLICABILITY_OVERHEAD_PROFIT:
      result[`Net${prefix}CostForOverheadAndProfit`] = cost ?? 0;
      break;
    case APPLICABILITY_OVERHEAD_PROFIT_EXCL:
    case APPLICABILITY_OVERHEAD_EXCL_PROFIT:
    case APPLICABILITY_OVERHEAD_EXCL_PROFIT_EXCL:
      result[`Net${prefix}CostForOverheadAndProfit`] = costWithoutInterestAndDepreciation ?? 0;
      break;
    default:
      break;
  }

  return result;
};
export const getOverheadAndProfitCostTotal = (arr = [],technologyId = '') => {
  const totals = {
    overheadOperationCost: 0,
    overheadProcessCost: 0,
    profitOperationCost: 0,
    profitProcessCost: 0,
    overheadWeldingCost: 0,
    profitWeldingCost: 0,
    NetCCForOtherTechnologyCostForOverhead:0,
    NetCCForOtherTechnologyCostForProfit:0
  };

  arr.forEach(item => {
    const {
      OperationCost,
      ProcessCost,
      ProcessCostWithOutInterestAndDepreciation,
      IsDetailed,
      UOMType,
      CostingConditionNumber: type,
      ForType,

    } = item;

    const operation = checkForNull(OperationCost);
    const process = checkForNull(ProcessCost);
    const processExcl =
      IsDetailed && UOMType === TIME
        ? checkForNull(ProcessCostWithOutInterestAndDepreciation)
        : process;

    const isOverhead = [
      APPLICABILITY_OVERHEAD,
      APPLICABILITY_OVERHEAD_PROFIT,
      APPLICABILITY_OVERHEAD_EXCL,
      APPLICABILITY_OVERHEAD_PROFIT_EXCL,
      APPLICABILITY_OVERHEAD_EXCL_PROFIT,
      APPLICABILITY_OVERHEAD_EXCL_PROFIT_EXCL
    ].includes(type);

    const isProfit = [
      APPLICABILITY_PROFIT,
      APPLICABILITY_OVERHEAD_PROFIT,
      APPLICABILITY_PROFIT_EXCL,
      APPLICABILITY_OVERHEAD_PROFIT_EXCL,
      APPLICABILITY_OVERHEAD_EXCL_PROFIT,
      APPLICABILITY_OVERHEAD_EXCL_PROFIT_EXCL
    ].includes(type);

    const useExclForOverhead = [
      APPLICABILITY_OVERHEAD_EXCL,
      APPLICABILITY_OVERHEAD_EXCL_PROFIT,
      APPLICABILITY_OVERHEAD_EXCL_PROFIT_EXCL
    ].includes(type);

    const useExclForProfit = [
      APPLICABILITY_PROFIT_EXCL,
      APPLICABILITY_OVERHEAD_PROFIT_EXCL,
      APPLICABILITY_OVERHEAD_EXCL_PROFIT_EXCL
    ].includes(type);

    if (isOverhead) {
      if ("OperationCost" in item) {
        if (ForType === "Welding") {
          totals.overheadWeldingCost += operation;
        } else {
          totals.overheadOperationCost += operation;
        }
      }
      if ("ProcessCost" in item) {
        totals.overheadProcessCost += useExclForOverhead ? processExcl : process;
      }
    }

    if (isProfit) {
      if ("OperationCost" in item) {
        if (ForType === "Welding") {
          totals.profitWeldingCost += operation;
        } else {
          totals.profitOperationCost += operation;
        }
      }
      if ("ProcessCost" in item) {
        totals.profitProcessCost += useExclForProfit ? processExcl : process;
      }
    }
  });
// console.log(totals,'totals')
  return totals;
};

export const getCostValues = (item = {}, costData = {}, subAssemblyTechnologyArray = []) => {
  const isAssembly = item?.PartType
  const isRequestForMultiTechnology = IdForMultiTechnology.includes(String(costData?.TechnologyId))
  
  let tempArrForCosting = JSON.parse(sessionStorage.getItem('costingArray'))
  let indexForUpdate = tempArrForCosting && tempArrForCosting.findIndex(costingItem => costingItem.PartNumber === item?.PartNumber && costingItem.AssemblyPartNumber === item?.AssemblyPartNumber)
  let objectToGetRMCCData = tempArrForCosting[indexForUpdate]
  
  if (isAssembly === "Assembly" || isAssembly === "Sub Assembly") {

    if (isRequestForMultiTechnology) {//run for multi(Assembly) technology
      const assemblyCostingPartDetails = subAssemblyTechnologyArray[0]?.CostingPartDetails
      
      return {
        netpartCost: checkForNull(assemblyCostingPartDetails?.NetChildPartsCost),
        conversionCost: checkForNull(assemblyCostingPartDetails?.NetOperationCost)+checkForNull(assemblyCostingPartDetails?.NetProcessCost)
      };
    } else {
      return {
        rawMaterialsCost: checkForNull(objectToGetRMCCData?.CosingPartDetails?.TotalRawMaterialsCostWithQuantity),
        conversionCost: checkForNull(objectToGetRMCCData?.CostingPartDetails?.TotalConversionCostWithQuantity)
      };
    }

  } else {
    return {
      rawMaterialsCost: checkForNull(objectToGetRMCCData?.CostingPartDetails?.NetRawMaterialsCost),
      conversionCost: checkForNull(objectToGetRMCCData?.CostingPartDetails?.NetConversionCost)
    };
  }
};
