import { toast } from 'react-toastify';
import React from 'react';
import 'react-toastify/dist/ReactToastify.css';
import DayTime from '../components/common/DayTimeWrapper';
import { reactLocalStorage } from 'reactjs-localstorage'
import { checkForNull } from './validation'
import {
  PLASTIC, SHEET_METAL, WIRING_HARNESS, PLATING, SPRINGS, HARDWARE, NON_FERROUS_LPDDC, MACHINING,
  ELECTRONICS, RIVET, NON_FERROUS_HPDC, RUBBER, NON_FERROUS_GDC, FORGING, FASTNERS, RIVETS, RMDOMESTIC, RMIMPORT, BOPDOMESTIC, BOPIMPORT, PROCESS, OPERATIONS, SURFACETREATMENT, MACHINERATE, OVERHEAD, PROFIT, EXCHNAGERATE, DISPLAY_G, DISPLAY_KG, DISPLAY_MG,
} from '../config/constants'
import { getConfigurationKey } from './auth'
import _ from 'lodash';



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
      reactLocalStorage.setObject("isUserLoggedIn", false);
      reactLocalStorage.setObject("userDetail", {});
      reactLocalStorage.set('ModuleId', '');
      window.location.assign('/login');
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
  return text.replace(/<[^>]+>/g, '')
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
  return text.replace(/\r?\n|\r/g, '')
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
  const value = Math.PI * data.OuterDiameter * data.PartLength + (Math.PI / 2) * (Math.pow(data.OuterDiameter, 2) - Math.pow(data.InnerDiameter, 2))
  return checkForNull(value)
}

/**
 * @description getNetSurfaceAreaBothSide
 * @returns {number}
 */
export function getNetSurfaceAreaBothSide(data) {
  const value = Math.PI * data.OuterDiameter * data.PartLength + Math.PI * data.InnerDiameter * data.PartLength + (Math.PI / 2) * (Math.pow(data.OuterDiameter, 2) - Math.pow(data.InnerDiameter, 2))
  return checkForNull(value)
}

export function formViewData(costingSummary, header = '') {
  let temp = []
  let dataFromAPI = costingSummary
  let obj = {}

  obj.zbc = dataFromAPI.TypeOfCosting || dataFromAPI.TypeOfCosting === 0 ? dataFromAPI.TypeOfCosting : '-'
  obj.IsApprovalLocked = dataFromAPI.IsApprovalLocked !== null ? dataFromAPI.IsApprovalLocked : '-'
  obj.poPrice = dataFromAPI.NetPOPrice ? dataFromAPI.NetPOPrice : '0'
  obj.costingName = dataFromAPI.DisplayCostingNumber ? dataFromAPI.DisplayCostingNumber : '-'
  obj.costingDate = dataFromAPI.CostingDate ? dataFromAPI.CostingDate : '-'
  obj.CostingNumber = dataFromAPI.CostingNumber ? dataFromAPI.CostingNumber : '-'
  obj.status = dataFromAPI.CostingStatus ? dataFromAPI.CostingStatus : '-'
  obj.rm = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.CostingRawMaterialsCost.length > 0 ? dataFromAPI.CostingPartDetails.CostingRawMaterialsCost[0].RMName : '-'
  obj.gWeight = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.NetGrossWeight ? dataFromAPI.CostingPartDetails.NetGrossWeight : 0
  obj.fWeight = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.NetFinishWeight ? dataFromAPI.CostingPartDetails.NetFinishWeight : 0
  obj.netRM = dataFromAPI.NetRawMaterialsCost && dataFromAPI.NetRawMaterialsCost ? dataFromAPI.NetRawMaterialsCost : 0
  obj.netBOP = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.NetBoughtOutPartCost ? dataFromAPI.CostingPartDetails.NetBoughtOutPartCost : 0
  obj.pCost = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.NetProcessCost ? dataFromAPI.CostingPartDetails.NetProcessCost : 0
  obj.oCost = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.NetOperationCost ? dataFromAPI.CostingPartDetails.NetOperationCost : 0
  obj.sTreatment = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.SurfaceTreatmentCost ? dataFromAPI.CostingPartDetails.SurfaceTreatmentCost : 0
  obj.nsTreamnt = dataFromAPI && dataFromAPI.NetSurfaceTreatmentCost !== undefined ? dataFromAPI.NetSurfaceTreatmentCost : 0
  obj.tCost = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.NetTransportationCost ? dataFromAPI.CostingPartDetails.NetTransportationCost : 0
  obj.nConvCost = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.NetConversionCost ? dataFromAPI.CostingPartDetails.NetConversionCost : 0
  obj.nTotalRMBOPCC = dataFromAPI.CostingPartDetails && dataFromAPI.NetTotalRMBOPCC ? dataFromAPI.NetTotalRMBOPCC : 0
  obj.netSurfaceTreatmentCost = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.NetSurfaceTreatmentCost ? dataFromAPI.CostingPartDetails.NetSurfaceTreatmentCost : 0
  obj.RawMaterialCalculatorId = dataFromAPI.RawMaterialCalculatorId && dataFromAPI.RawMaterialCalculatorId ? dataFromAPI.RawMaterialCalculatorId : 0
  obj.modelType = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.ModelType ? dataFromAPI.CostingPartDetails.ModelType : '-'
  obj.aValue = { applicability: 'Applicability', value: 'Value', }
  obj.overheadOn = {
    overheadTitle: dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.CostingOverheadDetail !== null && dataFromAPI.CostingPartDetails.CostingOverheadDetail.OverheadApplicability !== null ? dataFromAPI.CostingPartDetails.CostingOverheadDetail.OverheadApplicability : '-',
    overheadValue: dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.NetOverheadCost !== null ? dataFromAPI.CostingPartDetails.NetOverheadCost : '-'
  }

  obj.profitOn = {
    profitTitle: dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.CostingProfitDetail.ProfitApplicability !== null ? dataFromAPI.CostingPartDetails.CostingProfitDetail.ProfitApplicability : '-',
    profitValue: dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.NetProfitCost !== null ? dataFromAPI.CostingPartDetails.NetProfitCost : '-'
  }

  obj.rejectionOn = {
    rejectionTitle: dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.CostingRejectionDetail.RejectionApplicability !== null ? dataFromAPI.CostingPartDetails.CostingRejectionDetail.RejectionApplicability : '-',
    rejectionValue: dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.CostingRejectionDetail.RejectionTotalCost !== null ? dataFromAPI.CostingPartDetails.CostingRejectionDetail.RejectionTotalCost : 0,
  }

  obj.iccOn = {
    iccTitle: dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.CostingInterestRateDetail.ICCApplicabilityDetail.ICCApplicability !== null ? dataFromAPI.CostingPartDetails.CostingInterestRateDetail.ICCApplicabilityDetail.ICCApplicability : '-',
    iccValue: dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.CostingInterestRateDetail.ICCApplicabilityDetail.NetCost !== null ? dataFromAPI.CostingPartDetails.CostingInterestRateDetail.ICCApplicabilityDetail.NetCost : 0,
  }

  obj.paymentTerms = {
    paymentTitle: dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.CostingInterestRateDetail.PaymentTermDetail.PaymentTermApplicability ? dataFromAPI.CostingPartDetails.CostingInterestRateDetail.PaymentTermDetail.PaymentTermApplicability : '-',
    paymentValue: dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.CostingInterestRateDetail.PaymentTermDetail.NetCost ? dataFromAPI.CostingPartDetails.CostingInterestRateDetail.PaymentTermDetail.NetCost : 0,
  }

  obj.nOverheadProfit = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.NetOverheadAndProfitCost ? dataFromAPI.CostingPartDetails.NetOverheadAndProfitCost : 0

  obj.packagingCost = dataFromAPI.CostingPartDetails
    && dataFromAPI.CostingPartDetails.NetPackagingCost !== null ? dataFromAPI.CostingPartDetails.NetPackagingCost
    : 0
  obj.freight = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.NetFreightCost !== null ? dataFromAPI.CostingPartDetails.NetFreightCost : 0
  obj.nPackagingAndFreight = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.NetFreightPackagingCost ? dataFromAPI.CostingPartDetails.NetFreightPackagingCost : 0


  obj.bopPHandlingCharges = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.BOPHandlingCharges !== null ? dataFromAPI.CostingPartDetails.BOPHandlingCharges : 0
  obj.bopHandlingPercentage = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.BOPHandlingPercentage !== null ? dataFromAPI.CostingPartDetails.BOPHandlingPercentage : 0

  obj.toolMaintenanceCost = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.CostingToolCostResponse.length > 0 && dataFromAPI.CostingPartDetails.CostingToolCostResponse[0].ToolMaintenanceCost !== null ? dataFromAPI.CostingPartDetails.CostingToolCostResponse[0].ToolMaintenanceCost : 0
  obj.toolPrice = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.CostingToolCostResponse.length > 0 && dataFromAPI.CostingPartDetails.CostingToolCostResponse[0].ToolCost !== null ? dataFromAPI.CostingPartDetails.CostingToolCostResponse[0].ToolCost : 0
  obj.amortizationQty = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.CostingToolCostResponse.length > 0 && dataFromAPI.CostingPartDetails.CostingToolCostResponse[0].Life !== null ? dataFromAPI.CostingPartDetails.CostingToolCostResponse[0].Life : 0

  obj.toolApplicability = { applicability: 'Applicability', value: 'Value', }
  obj.toolApplicabilityValue = {
    toolTitle: dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.CostingToolCostResponse.length > 0 && dataFromAPI.CostingPartDetails.CostingToolCostResponse[0].ToolCostType !== null ? dataFromAPI.CostingPartDetails.CostingToolCostResponse[0].ToolCostType : 0,
    toolValue: dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.CostingToolCostResponse.length > 0 && dataFromAPI.CostingPartDetails.CostingToolCostResponse[0].ToolApplicabilityCost !== null ? dataFromAPI.CostingPartDetails.CostingToolCostResponse[0].ToolApplicabilityCost : 0,
  }

  obj.toolAmortizationCost = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.CostingToolCostResponse.length > 0 && dataFromAPI.CostingPartDetails.CostingToolCostResponse[0].ToolAmortizationCost !== null ? dataFromAPI.CostingPartDetails.CostingToolCostResponse[0].ToolAmortizationCost : 0
  obj.totalToolCost = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.NetToolCost !== null ? dataFromAPI.CostingPartDetails.NetToolCost : 0

  obj.totalCost = dataFromAPI.CostingPartDetails && dataFromAPI.TotalCost ? dataFromAPI.TotalCost : '-'
  obj.otherDiscount = { discount: 'Discount %', value: 'Value', }
  obj.otherDiscountValue = {
    discountPercentValue: dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.OtherCostDetails.HundiOrDiscountPercentage !== null ? dataFromAPI.CostingPartDetails.OtherCostDetails.HundiOrDiscountPercentage : 0,
    discountValue: dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.OtherCostDetails.HundiOrDiscountValue !== null ? dataFromAPI.CostingPartDetails.OtherCostDetails.HundiOrDiscountValue : 0,
    discountApplicablity: dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.OtherCostDetails.HundiOrDiscountValue !== null ? dataFromAPI.CostingPartDetails.OtherCostDetails.DiscountApplicability : 0,
    dicountType: dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.OtherCostDetails.DiscountCostType !== null ? dataFromAPI.CostingPartDetails.OtherCostDetails.DiscountCostType : '-'
  }

  obj.anyOtherCost = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.OtherCostDetails.AnyOtherCost !== null ? dataFromAPI.CostingPartDetails.OtherCostDetails.AnyOtherCost : 0
  obj.anyOtherCostType = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.OtherCostDetails.OtherCostType !== null ? dataFromAPI.CostingPartDetails.OtherCostDetails.OtherCostType : '-'
  obj.anyOtherCostApplicablity = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.OtherCostDetails.AnyOtherCost !== null ? dataFromAPI.CostingPartDetails.OtherCostDetails.OtherCostApplicability : 0
  obj.anyOtherCostPercent = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.OtherCostDetails.OtherCostPercentage !== null ? dataFromAPI.CostingPartDetails.OtherCostDetails.OtherCostPercentage : 0
  obj.remark = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.OtherCostDetails.Remark !== null ? dataFromAPI.CostingPartDetails.OtherCostDetails.Remark : '-'
  obj.nPOPriceWithCurrency = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.OtherCostDetails.NetPOPriceOtherCurrency !== null ? dataFromAPI.CostingPartDetails.OtherCostDetails.NetPOPriceOtherCurrency : 0
  obj.currency = {
    currencyTitle: dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.OtherCostDetails.Currency !== null ? dataFromAPI.CostingPartDetails.OtherCostDetails.Currency : '-',
    currencyValue: dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.OtherCostDetails.CurrencyExchangeRate ? dataFromAPI.CostingPartDetails.OtherCostDetails.CurrencyExchangeRate : '-',
  }

  obj.nPOPrice = dataFromAPI.NetPOPrice && dataFromAPI.NetPOPrice !== null ? dataFromAPI.NetPOPrice : 0
  obj.effectiveDate = dataFromAPI.EffectiveDate ? dataFromAPI.EffectiveDate : ''

  obj.attachment = dataFromAPI.Attachements ? dataFromAPI.Attachements : []
  obj.approvalButton = ''
  // //RM
  obj.netRMCostView = dataFromAPI.CostingPartDetails ? dataFromAPI.CostingPartDetails.CostingRawMaterialsCost : []
  // //BOP Cost
  obj.netBOPCostView = dataFromAPI.CostingPartDetails ? dataFromAPI.CostingPartDetails.CostingBoughtOutPartCost : []
  // //COnversion Cost
  obj.netConversionCostView = dataFromAPI.CostingPartDetails ? dataFromAPI.CostingPartDetails.CostingConversionCost : '-'
  obj.netTransportationCostView = dataFromAPI.CostingPartDetails ? dataFromAPI.CostingPartDetails.ChildPartTransportationDetails ?? [] : []
  obj.surfaceTreatmentDetails = dataFromAPI.CostingPartDetails ? dataFromAPI.CostingPartDetails.SurfaceTreatmentDetails : []
  // //OverheadCost and Profit
  obj.netOverheadCostView = dataFromAPI.CostingPartDetails ? dataFromAPI.CostingPartDetails.CostingOverheadDetail : '-'
  obj.netProfitCostView = dataFromAPI.CostingPartDetails ? dataFromAPI.CostingPartDetails.CostingProfitDetail : '-'
  // // Rejection
  obj.netRejectionCostView = dataFromAPI.CostingPartDetails ? dataFromAPI.CostingPartDetails.CostingRejectionDetail : '-'

  //payment terms and ICC
  obj.netPaymentIccCostView = dataFromAPI.CostingPartDetails ? dataFromAPI.CostingPartDetails.CostingInterestRateDetail : '-'

  // //Net Packaging and Freight
  obj.netPackagingCostView = dataFromAPI.CostingPartDetails ? dataFromAPI.CostingPartDetails.CostingPackagingDetail : []
  obj.netFreightCostView = dataFromAPI.CostingPartDetails ? dataFromAPI.CostingPartDetails.CostingFreightDetail : []
  // //Tool Cost
  obj.netToolCostView = dataFromAPI.CostingPartDetails ? dataFromAPI.CostingPartDetails.CostingToolCostResponse : []
  obj.totalTabSum = checkForNull(obj.nTotalRMBOPCC) + checkForNull(obj.nsTreamnt) + checkForNull(obj.nOverheadProfit) + checkForNull(obj.nPackagingAndFreight) + checkForNull(obj.totalToolCost)

  // //For Drawer Edit
  obj.partId = dataFromAPI && dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.PartId ? dataFromAPI.CostingPartDetails.PartId : '-' // PART NUMBER KEY NAME
  obj.partNumber = dataFromAPI && dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.PartNumber ? dataFromAPI.CostingPartDetails.PartNumber : '-'

  // ADD PARTID KEY HERE AND BIND IT WITH PART ID
  obj.plantId = dataFromAPI.PlantId ? dataFromAPI.PlantId : '-'
  obj.plantName = dataFromAPI.PlantName ? dataFromAPI.PlantName : '-'
  obj.plantCode = dataFromAPI.PlantCode ? dataFromAPI.PlantCode : '-'
  obj.vendorId = dataFromAPI.VendorId ? dataFromAPI.VendorId : '-'
  obj.vendorName = dataFromAPI.VendorName ? dataFromAPI.VendorName : '-'
  obj.vendorCode = dataFromAPI.VendorCode ? dataFromAPI.VendorCode : '-'
  obj.vendorPlantId = dataFromAPI.VendorPlantId ? dataFromAPI.VendorPlantId : '-'
  obj.vendorPlantName = dataFromAPI.VendorPlantName ? dataFromAPI.VendorPlantName : '-'
  obj.vendorPlantCode = dataFromAPI.VendorPlantCode ? dataFromAPI.VendorPlantCode : '-'
  obj.costingId = dataFromAPI.CostingId ? dataFromAPI.CostingId : '-'
  obj.oldPoPrice = dataFromAPI.OldPOPrice ? dataFromAPI.OldPOPrice : 0
  obj.technology = dataFromAPI.Technology ? dataFromAPI.Technology : '-'
  obj.technologyId = dataFromAPI.TechnologyId ? dataFromAPI.TechnologyId : '-'
  obj.shareOfBusinessPercent = dataFromAPI.ShareOfBusinessPercent ? dataFromAPI.ShareOfBusinessPercent : 0
  obj.destinationPlantCode = dataFromAPI.DestinationPlantCode ? dataFromAPI.DestinationPlantCode : '-'
  obj.destinationPlantName = dataFromAPI.DestinationPlantName ? dataFromAPI.DestinationPlantName : '-'
  obj.destinationPlantId = dataFromAPI.DestinationPlantId ? dataFromAPI.DestinationPlantId : '-'
  obj.CostingHeading = header
  obj.partName = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.PartName ? dataFromAPI.CostingPartDetails.PartName : '-'
  obj.netOtherOperationCost = dataFromAPI && dataFromAPI.NetOtherOperationCost ? dataFromAPI.NetOtherOperationCost : 0
  obj.masterBatchTotal = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.MasterBatchTotal ? dataFromAPI.CostingPartDetails.MasterBatchTotal : 0
  obj.masterBatchRMPrice = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.MasterBatchRMPrice ? dataFromAPI.CostingPartDetails.MasterBatchRMPrice : 0
  obj.masterBatchPercentage = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.MasterBatchPercentage ? dataFromAPI.CostingPartDetails.MasterBatchPercentage : 0
  obj.isApplyMasterBatch = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.IsApplyMasterBatch ? dataFromAPI.CostingPartDetails.IsApplyMasterBatch : false
  obj.IsAssemblyCosting = dataFromAPI.IsAssemblyCosting ? dataFromAPI.IsAssemblyCosting : ""
  obj.childPartBOPHandlingCharges = dataFromAPI.CostingPartDetails?.ChildPartBOPHandlingCharges ? dataFromAPI.CostingPartDetails.ChildPartBOPHandlingCharges : []
  obj.masterBatchRMName = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.MasterBatchRMName ? dataFromAPI.CostingPartDetails.MasterBatchRMName : '-'

  // GETTING WARNING MESSAGE WITH APPROVER NAME AND LEVEL WHEN COSTING IS UNDER APPROVAL 
  obj.getApprovalLockedMessage = dataFromAPI.ApprovalLockedMessage && dataFromAPI.ApprovalLockedMessage !== null ? dataFromAPI.ApprovalLockedMessage : '';

  //MASTER BATCH OBJECT
  obj.CostingMasterBatchRawMaterialCostResponse = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.CostingMasterBatchRawMaterialCostResponse ? dataFromAPI.CostingPartDetails.CostingMasterBatchRawMaterialCostResponse : []
  obj.RevisionNumber = dataFromAPI.RevisionNumber ? dataFromAPI.RevisionNumber : '-'
  obj.AssemblyCostingId = dataFromAPI.AssemblyCostingId && dataFromAPI.AssemblyCostingId !== null ? dataFromAPI.AssemblyCostingId : '';
  obj.SubAssemblyCostingId = dataFromAPI.SubAssemblyCostingId && dataFromAPI.SubAssemblyCostingId !== null ? dataFromAPI.SubAssemblyCostingId : '';


  //USED FOR DOWNLOAD PURPOSE

  obj.overHeadApplicablity = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.CostingOverheadDetail !== null && dataFromAPI.CostingPartDetails.CostingOverheadDetail.OverheadApplicability !== null ? dataFromAPI.CostingPartDetails.CostingOverheadDetail.OverheadApplicability : '-'
  obj.overHeadApplicablityValue = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.NetOverheadCost !== null ? dataFromAPI.CostingPartDetails.NetOverheadCost : '-'
  obj.ProfitApplicablity = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.CostingProfitDetail.ProfitApplicability !== null ? dataFromAPI.CostingPartDetails.CostingProfitDetail.ProfitApplicability : '-'
  obj.ProfitApplicablityValue = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.NetProfitCost !== null ? dataFromAPI.CostingPartDetails.NetProfitCost : '-'
  obj.rejectionApplicablity = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.CostingRejectionDetail.RejectionApplicability !== null ? dataFromAPI.CostingPartDetails.CostingRejectionDetail.RejectionApplicability : '-'
  obj.rejectionApplicablityValue = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.CostingRejectionDetail.RejectionTotalCost !== null ? dataFromAPI.CostingPartDetails.CostingRejectionDetail.RejectionTotalCost : 0
  obj.iccApplicablity = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.CostingInterestRateDetail.ICCApplicabilityDetail.ICCApplicability !== null ? dataFromAPI.CostingPartDetails.CostingInterestRateDetail.ICCApplicabilityDetail.ICCApplicability : '-'
  obj.iccApplicablityValue = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.CostingInterestRateDetail.ICCApplicabilityDetail.NetCost !== null ? dataFromAPI.CostingPartDetails.CostingInterestRateDetail.ICCApplicabilityDetail.NetCost : 0
  obj.paymentApplicablity = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.CostingInterestRateDetail.PaymentTermDetail.PaymentTermApplicability ? dataFromAPI.CostingPartDetails.CostingInterestRateDetail.PaymentTermDetail.PaymentTermApplicability : '-'
  obj.paymentcApplicablityValue = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.CostingInterestRateDetail.PaymentTermDetail.NetCost ? dataFromAPI.CostingPartDetails.CostingInterestRateDetail.PaymentTermDetail.NetCost : 0
  obj.toolMaintenanceCostApplicablity = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.CostingToolCostResponse.length > 0 && dataFromAPI.CostingPartDetails.CostingToolCostResponse[0].ToolCostType !== null ? dataFromAPI.CostingPartDetails.CostingToolCostResponse[0].ToolCostType : 0
  obj.toolMaintenanceCostApplicablityValue = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.CostingToolCostResponse.length > 0 && dataFromAPI.CostingPartDetails.CostingToolCostResponse[0].ToolApplicabilityCost !== null ? dataFromAPI.CostingPartDetails.CostingToolCostResponse[0].ToolApplicabilityCost : 0
  obj.otherDiscountType = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.OtherCostDetails.DiscountCostType !== null ? dataFromAPI.CostingPartDetails.OtherCostDetails.DiscountCostType : 0
  obj.otherDiscountApplicablity = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.OtherCostDetails.HundiOrDiscountValue !== null ? dataFromAPI.CostingPartDetails.OtherCostDetails.DiscountApplicability : 0
  obj.otherDiscountValuePercent = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.OtherCostDetails.HundiOrDiscountPercentage !== null ? dataFromAPI.CostingPartDetails.OtherCostDetails.HundiOrDiscountPercentage : 0
  obj.otherDiscountCost = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.OtherCostDetails.HundiOrDiscountValue !== null ? dataFromAPI.CostingPartDetails.OtherCostDetails.HundiOrDiscountValue : 0
  obj.currencyTitle = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.OtherCostDetails.Currency !== null ? dataFromAPI.CostingPartDetails.OtherCostDetails.Currency : '-'
  obj.costingHead = dataFromAPI.TypeOfCosting && dataFromAPI.TypeOfCosting === 0 ? 'ZBC' : 'VBC'
  obj.costingVersion = `${DayTime(obj?.costingDate).format('DD-MM-YYYY')}-${obj?.CostingNumber}-${obj?.status}`
  obj.PoPriceWithDate = `${obj?.poPrice}(${(obj?.effectiveDate && obj?.effectiveDate !== '') ? DayTime(obj?.effectiveDate).format('DD-MM-YYYY') : "-"})`
  obj.plantCode = obj?.zbc === 0 ? `${obj?.plantName} (${obj?.plantCode})` : `${obj?.destinationPlantName} (${obj?.destinationPlantCode})`
  obj.rmRate = obj?.netRMCostView && (obj?.netRMCostView.length > 1 || obj?.IsAssemblyCosting === true) ? 'Multiple RM' : (obj?.netRMCostView && obj?.netRMCostView[0] && obj?.netRMCostView[0].RMRate)
  obj.scrapRate = obj?.netRMCostView && (obj?.netRMCostView.length > 1 || obj?.IsAssemblyCosting === true) ? 'Multiple RM' : (obj?.netRMCostView && obj?.netRMCostView[0] && obj?.netRMCostView[0].ScrapRate)
  obj.BurningLossWeight = obj?.netRMCostView && (obj?.netRMCostView.length > 1 || obj?.IsAssemblyCosting === true) ? 'Multiple RM' : (obj?.netRMCostView && obj?.netRMCostView[0] && obj?.netRMCostView[0].BurningLossWeight)
  obj.ScrapWeight = obj?.netRMCostView && (obj?.netRMCostView.length > 1 || obj?.IsAssemblyCosting === true) ? 'Multiple RM' : (obj?.netRMCostView && obj?.netRMCostView[0] && obj?.netRMCostView[0].ScrapWeight)
  obj.nPoPriceCurrency = obj?.nPOPriceWithCurrency !== null ? (obj?.currency?.currencyTitle) !== "-" ? (obj?.nPOPriceWithCurrency) : obj?.nPOPrice : '-'




  // temp = [...temp, obj]
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
    return cell.replace(capWithNumber, superNumber.sup());
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
    case PLASTIC:
      return PLASTIC;
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
    case NON_FERROUS_LPDDC:
      return NON_FERROUS_LPDDC;
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
    case FORGING:
      return FORGING;
    default:
      break;
  }
}

export function isRMDivisorApplicable(technology) {
  const allowedTechnologyForRMDivisor = [SPRINGS, HARDWARE, FASTNERS, RIVETS];
  return allowedTechnologyForRMDivisor.includes(technology);
}



export function findLostWeight(tableVal) {
  let sum = 0
  tableVal && tableVal.map(item => {
    if (Number(item.LossOfType) === 2) {
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
  const isApproval = getConfigurationKey().ApprovalMasterArrayList.includes(number) && getConfigurationKey().IsMasterApprovalAppliedConfigure
  return isApproval
}



// THIS FUNCTION WILL BE USED IF WE FOR EDITING OF SIMUALTION,WE DON'T NEED ANY FILTER
export function applyEditCondSimulation(master) {
  const ApplyEditCondition = [RMDOMESTIC, RMIMPORT, BOPDOMESTIC, BOPIMPORT, PROCESS, OPERATIONS, SURFACETREATMENT, MACHINERATE, OVERHEAD, PROFIT]
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

export function calculateScrapWeight(grossWeight, finishWeight) {
  const scrapWeight = checkForNull(grossWeight - finishWeight)
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
    default:
      break;
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
    const UOMValue = <div className='p-relative'>{temp.map(item => {
      return <span className='unit-text'>{item}</span>
    })}
    </div>
    return UOMValue
  }
  return value
}
export const labelWithUOMAndCurrency = (label, UOM, currency) => {
  return <div>
    <span className='d-flex'>{label} ({currency ? currency : getConfigurationKey().BaseCurrency}/{UOM ? displayUOM(UOM) : 'UOM'})</span>
  </div>
}

// THIS FUNCTION SHOWING TITLE ON HOVER FOR ACTIVE AND INACTIVE STATUS IN GRID
export const showTitleForActiveToggle = (index) => {
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

    titleActive?.setAttribute('title', 'Active');
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

    titleInactive?.setAttribute('title', 'Inactive');
  }, 500);
}
//COMMON FUNCTION FOR MASTERS BULKUPLOAD CHECK
export const checkForSameFileUpload = (master, fileHeads) => {
  let checkForFileHead, array = []
  let bulkUploadArray = [];   //ARRAY FOR COMPARISON 
  array = _.map(master, 'label')
  bulkUploadArray = [...array]
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