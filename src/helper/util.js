import { toastr } from 'react-redux-toastr'
import Moment from 'moment'
import { MESSAGES } from '../config/message'
import { reactLocalStorage } from 'reactjs-localstorage'
import { checkForNull } from './validation'
import { G, KG, MG } from '../config/constants'

/**
 * @method  apiErrors
 * @desc Response error handler.
 * @param res
 */
export const apiErrors = (res) => {
  const response = res ? res.response : undefined

  if (response?.data?.error?.message?.value) {
    toastr.error(response.data.error.message.value)
  } else if (response) {
    response && handleHTTPStatus(response)
  } else {
    toastr.error('Something went wrong please try again.')
  }
}

/**
 * @method  handleHTTPStatus
 * @desc HANDLE HTTP STATUS CODE IN RESPONSE OF API'S
 * @param response
 */
const handleHTTPStatus = (response) => {
  switch (response.status) {
    case 203:
      return toastr.error('Data is inconsistent. Please refresh your session by re-login')
    case 204:
      return toastr.error('Intentionally blank for now.')
    case 205:
      return toastr.error('Please clear your cache for data to reflect')
    case 206:
      return toastr.error('The data might not have been updated properly. Please try again to ensure')
    case 300:
    case 301:
    case 302:
    case 303:
      return toastr.error('Something is not right. Please contact your IT Team.')
    case 400:
      return toastr.error('Bad Request. Please contact your IT Team.')
    case 401:
      window.location.assign('/login');
      return toastr.error('Authentication error. Please contact your IT Team.')
    case 403:
      return toastr.error('You are not allowed to access this resource. Please contact your IT Team.',)
    case 404:
      return toastr.error('Not found')
    case 405:
      return toastr.error('You are not allowed to access this resource. Please contact your IT Team',)
    case 406:
      const errMsg406 = response?.data?.Message ? response.data.Message : 'Something is not right. Please contact your IT Team.'
      return toastr.error(errMsg406)
    case 409:
    case 411:
    case 414:
    case 416:
    case 427:
      return toastr.error('Something is not right. Please contact your IT Team')
    case 407:
      return toastr.error('Proxy Authentication Error. Please contact your IT Team')
    case 408:
      return toastr.error('Your request has timed out. Please try again after some time.')
    case 410:
      return toastr.error('The resource you requested no longer exists.')
    case 412:
      const errMsg = response?.data?.Message ? response.data.Message : 'Something is not right. Please contact your IT Team.'
      return toastr.error(errMsg)
    case 413:
      return toastr.error("Server can't process such long request. Please contact your IT Team")
    case 415:
      return toastr.error('This request is not supported by the server. Please contact your IT Team')
    case 417:
      const errMsg417 = response?.data?.Message ? response.data.Message : 'Something is not right. Please contact your IT Team.'
      return toastr.error(errMsg417)
    case 500:
      return toastr.error('Internal server error. Please contact your IT Team')
    case 501:
      return toastr.error('Something is not right. Please contact your IT Team')
    case 502:
      return toastr.error('Server is unavailable or unreachable. Please contact your IT Team')
    case 503:
      return toastr.error('Server is unavailable due to load or maintenance. Please contact your IT Team')
    case 504:
      return toastr.error('Server is unavailable due to timeout. Please contact your IT Team')
    default:
      return toastr.error('Something is not right. Please contact your IT Team')
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
  return Moment.utc(date).format('MM/DD/YYYY')
}

/**
 * @method  convertISOToUtcForTime
 * @desc CONVERT ISO TO TIME
 * @param res
 */
export function convertISOToUtcForTime(date) {
  return Moment.utc(date).format('hh:mm A')
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
  return Moment(date).format('DD-MMM-YYYY hh:mm A')
}

/**
 * @method displayDateTimeFormate
 * @desc DISPLAY DATE TIME FORMATE
 */
export function displayDateTimeFormate(date) {
  const currentDate = Moment()
  const dateObj = Moment(date)
  if (Moment(Moment(date).format('YYYY-MM-DD'), 'YYYY-MM-DD', true).isValid()) {
    // check day difference is not less or grater then zero
    if (checkNumberOfDayDiff(date, currentDate) === 0) {
      const remainingTimeInMinutes = currentDate.diff(dateObj, 'minutes')
      if (remainingTimeInMinutes > 720) {
        return `Today ${Moment(date, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format(
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
        return Moment(date, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format('hh:mm A')
      }
    } else if (
      checkNumberOfDayDiff(date, currentDate) >= 1 &&
      checkNumberOfDayDiff(date, currentDate) <= 7
    ) {
      return Moment(date).format('ddd hh:mm A')
    } else {
      return Moment(date, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format(
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
 * @method onLogout
 * @descriptin LOGOUT THEN REDIRECT TO LOGIN PAGE
 **/
function onLogout() {
  reactLocalStorage.setObject('isUserLoggedIn', false)
  reactLocalStorage.setObject('userDetail', {})
  toastr.success(MESSAGES.LOGOUT_SUCCESS)
  setTimeout(() => {
    window.location.assign('/login')
  }, 100)
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
  const currentDate = Moment().format('YYYY-MM-DD')
  // convert date to validate and check with current date
  const checkValidDate = Moment(date, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format(
    'YYYY-MM-DD',
  )
  // convert date is valid or not
  if (Moment(Moment(checkValidDate).format('YYYY-MM-DD'), 'YYYY-MM-DD', true,).isValid()) {
    // check day difference is not less or grater then zero
    if (checkNumberOfDayDiff(checkValidDate, currentDate) === 0) {
      return Moment(date, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format('hh:mm A')
    } else if (checkNumberOfDayDiff(checkValidDate, currentDate) === -1) {
      return 'Yesterday'
    } else {
      return Moment(date, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format('MM/DD/YYYY')
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

export function formViewData(costingSummary) {
  let temp = []
  let dataFromAPI = costingSummary
  let obj = {}

  obj.zbc = dataFromAPI.TypeOfCosting
  obj.IsApprovalLocked = dataFromAPI.IsApprovalLocked
  obj.poPrice = dataFromAPI.NetPOPrice ? dataFromAPI.NetPOPrice : '0'
  obj.costingName = dataFromAPI.DisplayCostingNumber ? dataFromAPI.DisplayCostingNumber : '-'
  obj.costingDate = dataFromAPI.CostingDate ? dataFromAPI.CostingDate : '-'
  obj.CostingNumber = dataFromAPI.CostingNumber ? dataFromAPI.CostingNumber : '-'
  obj.status = dataFromAPI.CostingStatus ? dataFromAPI.CostingStatus : '-'
  obj.rm = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.CostingRawMaterialsCost.length > 0 ? dataFromAPI.CostingPartDetails.CostingRawMaterialsCost[0].RMName : '-'
  obj.gWeight = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.NetGrossWeight ? dataFromAPI.CostingPartDetails.NetGrossWeight : 0
  obj.fWeight = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.NetFinishWeight ? dataFromAPI.CostingPartDetails.NetFinishWeight : 0
  obj.netRM = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.NetRawMaterialsCost ? dataFromAPI.CostingPartDetails.NetRawMaterialsCost : 0
  obj.netBOP = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.NetBoughtOutPartCost ? dataFromAPI.CostingPartDetails.NetBoughtOutPartCost : 0
  obj.pCost = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.NetProcessCost ? dataFromAPI.CostingPartDetails.NetProcessCost : 0
  obj.oCost = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.NetOperationCost ? dataFromAPI.CostingPartDetails.NetOperationCost : 0
  obj.sTreatment = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.NetSurfaceTreatmentCost ? dataFromAPI.CostingPartDetails.NetSurfaceTreatmentCost : 0
  obj.tCost = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.NetTransportationCost ? dataFromAPI.CostingPartDetails.NetTransportationCost : 0
  obj.nConvCost = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.NetConversionCost ? dataFromAPI.CostingPartDetails.NetConversionCost : 0
  obj.modelType = dataFromAPI.CostingPartDetails.ModelType ? dataFromAPI.CostingPartDetails.ModelType : '-'
  obj.aValue = { applicability: 'Applicability', value: 'Value', }
  obj.overheadOn = {
    overheadTitle: dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.CostingOverheadDetail.OverheadApplicability !== null ? dataFromAPI.CostingPartDetails.CostingOverheadDetail.OverheadApplicability : '-',
    overheadValue: dataFromAPI.CostingPartDetails.CostingOverheadDetail && checkForNull(dataFromAPI.CostingPartDetails.CostingOverheadDetail.OverheadCCTotalCost) + checkForNull(dataFromAPI.CostingPartDetails.CostingOverheadDetail.OverheadBOPTotalCost) +
      checkForNull(dataFromAPI.CostingPartDetails.CostingOverheadDetail.OverheadRMTotalCost) + checkForNull(dataFromAPI.CostingPartDetails.CostingOverheadDetail.OverheadFixedTotalCost),
  }
  obj.profitOn = {
    profitTitle: dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.CostingProfitDetail.ProfitApplicability !== null ? dataFromAPI.CostingPartDetails.CostingProfitDetail.ProfitApplicability : '-',
    profitValue: dataFromAPI.CostingPartDetails && checkForNull(dataFromAPI.CostingPartDetails.CostingProfitDetail.ProfitCCTotalCost) +
      checkForNull(dataFromAPI.CostingPartDetails.CostingProfitDetail.ProfitBOPTotalCost) + checkForNull(dataFromAPI.CostingPartDetails.CostingProfitDetail.ProfitRMTotalCost) +
      checkForNull(dataFromAPI.CostingPartDetails.CostingProfitDetail.ProfitFixedTotalCost)
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

  obj.toolMaintenanceCost = dataFromAPI.CostingPartDetails.CostingToolCostResponse.length > 0 && dataFromAPI.CostingPartDetails.CostingToolCostResponse[0].ToolMaintenanceCost !== null ? dataFromAPI.CostingPartDetails.CostingToolCostResponse[0].ToolMaintenanceCost : 0
  obj.toolPrice = dataFromAPI.CostingPartDetails.CostingToolCostResponse.length > 0 && dataFromAPI.CostingPartDetails.CostingToolCostResponse[0].ToolCost !== null ? dataFromAPI.CostingPartDetails.CostingToolCostResponse[0].ToolCost : 0
  obj.amortizationQty = dataFromAPI.CostingPartDetails.CostingToolCostResponse.length > 0 && dataFromAPI.CostingPartDetails.CostingToolCostResponse[0].Life !== null ? dataFromAPI.CostingPartDetails.CostingToolCostResponse[0].Life : 0

  obj.totalToolCost = dataFromAPI.CostingPartDetails.NetToolCost !== null ? dataFromAPI.CostingPartDetails.NetToolCost : 0
  obj.totalCost = dataFromAPI.TotalCost ? dataFromAPI.TotalCost : '-'
  obj.otherDiscount = { discount: 'Discount %', value: 'Value', }
  obj.otherDiscountValue = {
    discountPercentValue: dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.OtherCostDetails.HundiOrDiscountPercentage !== null ? dataFromAPI.CostingPartDetails.OtherCostDetails.HundiOrDiscountPercentage : 0,
    discountValue: dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.OtherCostDetails.HundiOrDiscountValue !== null ? dataFromAPI.CostingPartDetails.OtherCostDetails.HundiOrDiscountValue : 0,
  }
  obj.anyOtherCost = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.OtherCostDetails.AnyOtherCost !== null ? dataFromAPI.CostingPartDetails.OtherCostDetails.AnyOtherCost : 0
  obj.remark = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.OtherCostDetails.Remark !== null ? dataFromAPI.CostingPartDetails.OtherCostDetails.Remark : '-'
  obj.nPOPriceWithCurrency = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.OtherCostDetails.NetPOPriceOtherCurrency !== null ? dataFromAPI.CostingPartDetails.OtherCostDetails.NetPOPriceOtherCurrency : 0
  obj.currency = {
    currencyTitle: dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.OtherCostDetails.Currency !== null ? dataFromAPI.CostingPartDetails.OtherCostDetails.Currency : '-',
    currencyValue: dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.OtherCostDetails.CurrencyExchangeRate ? dataFromAPI.CostingPartDetails.OtherCostDetails.CurrencyExchangeRate : '-',
  }
  obj.nPOPrice = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.OtherCostDetails.NetPOPriceINR !== null ? dataFromAPI.CostingPartDetails.OtherCostDetails.NetPOPriceINR : 0
  obj.effectiveDate = dataFromAPI.EffectiveDate ? dataFromAPI.EffectiveDate : ''
  // // // obj.attachment = "Attachment";
  obj.attachment = dataFromAPI.Attachements ? dataFromAPI.Attachements : ''
  obj.approvalButton = ''
  // //RM
  obj.netRMCostView = dataFromAPI.CostingPartDetails ? dataFromAPI.CostingPartDetails.CostingRawMaterialsCost : []
  // //BOP Cost
  obj.netBOPCostView = dataFromAPI.CostingPartDetails ? dataFromAPI.CostingPartDetails.CostingBoughtOutPartCost : []
  // //COnversion Cost
  obj.netConversionCostView = dataFromAPI.CostingPartDetails ? dataFromAPI.CostingPartDetails.CostingConversionCost : '-'
  obj.netTransportationCostView = dataFromAPI.CostingPartDetails ? dataFromAPI.CostingPartDetails.TransportationDetails : ''
  obj.surfaceTreatmentDetails = dataFromAPI.CostingPartDetails ? dataFromAPI.CostingPartDetails.SurfaceTreatmentDetails : []
  // //OverheadCost and Profit
  obj.netOverheadCostView = dataFromAPI.CostingPartDetails ? dataFromAPI.CostingPartDetails.CostingOverheadDetail : '-'
  obj.netProfitCostView = dataFromAPI.CostingPartDetails ? dataFromAPI.CostingPartDetails.CostingProfitDetail : '-'
  // // Rejection
  obj.netRejectionCostView = dataFromAPI.CostingPartDetails ? dataFromAPI.CostingPartDetails.CostingRejectionDetail : '-'

  // //Net Packaging and Freight
  obj.netPackagingCostView = dataFromAPI.CostingPartDetails ? dataFromAPI.CostingPartDetails.CostingPackagingDetail : []
  obj.netFreightCostView = dataFromAPI.CostingPartDetails ? dataFromAPI.CostingPartDetails.CostingFreightDetail : []
  // //Tool Cost
  obj.netToolCostView = dataFromAPI.CostingPartDetails ? dataFromAPI.CostingPartDetails.CostingToolCostResponse : []
  // //For Drawer Edit
  obj.partId = dataFromAPI.PartNumber ? dataFromAPI.PartNumber : '-'
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
    case G:
      return checkForNull(value)
    case KG:
      return checkForNull(value / 1000)
    case MG:
      return checkForNull(value * 1000)
    default:
      break;
  }
}


