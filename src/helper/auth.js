import { reactLocalStorage } from 'reactjs-localstorage'

export function isUserLoggedIn() {
  const isLoggedIn = reactLocalStorage.getObject('isUserLoggedIn')
  if (isLoggedIn === true) {
    return true
  } else {
    return false
  }
}

export function userDetails() {
  const userDetail = JSON.parse(localStorage.getItem('userDetail'))
  return userDetail
}

export function loggedInUserId() {
  const isLoggedIn = reactLocalStorage.getObject('isUserLoggedIn')
  if (isLoggedIn === true) {
    const userDetail = JSON.parse(localStorage.getItem('userDetail'))
    return userDetail.LoggedInUserId
  } else {
    return null
  }
}

export function checkVendorPlantConfigurable() {
  //const userDetail = reactLocalStorage.getObject('userDetail')
  return getConfigurationKey().IsVendorPlantConfigurable
}

/**
 * function for get logged in user auth token
 * @returns {string}
 */
export const getAuthToken = () => {
  let authToken = ''
  if (isUserLoggedIn()) {
    authToken = JSON.parse(localStorage.getItem('userDetail')).Token
  }
  return authToken
}

export function getConfigurationKey() {
  const configurationKey = reactLocalStorage.getObject('InitialConfiguration')
  return configurationKey
}

export function userDepartmetList() {
  const userDetail = reactLocalStorage.getObject('departmentList')
  return userDetail
}
//FUNCTION TO SHOW SA AND LINE NUMBER
export function showSaLineNumber() {
  return getConfigurationKey().IsShowSaAndLineNumberFields
}
//FUNCTION TO HANDLE DEPARTMENT LABEL
export function handleDepartmentHeader() {
  return getConfigurationKey().ManageCompanyOrDepartmentLabel
}
//FUNCTION TO HANDLE BOP LABEL 
export function showBopLabel() {
  return getConfigurationKey().BOPLabel
}

//FUNCTION TO HANDLE BOP LABEL 
export function showBopLabelReverse(label) {
  return getConfigurationKey().BOPLabel === label ? 'BOP' : label
}

/* function to handle freight and shearing cost fields*/
export function IsShowFreightAndShearingCostFields() {
  const configurationKey = reactLocalStorage.getObject('InitialConfiguration')
  return configurationKey.IsShowFreightAndShearingCostFields
}
/* function to handle point of contact dropdown in rfq*/
export function IsSendQuotationToPointOfContact() {
  const configurationKey = reactLocalStorage.getObject('InitialConfiguration')
  return configurationKey?.IsSendQuotationToPointOfContact
}
/* function to handle primary contact checkbox in rfq user */
export function IsSendMailToPrimaryContact() {
  const configurationKey = reactLocalStorage.getObject('InitialConfiguration')
  return configurationKey?.IsSendMailToPrimaryContact
}
export function IsFetchExchangeRateVendorWise() {
  const configurationKey = reactLocalStorage.getObject('InitialConfiguration')
  return configurationKey?.IsFetchExchangeRateVendorWise
}
export function corrugatedBoxPermission() {
  const boxTypeStr = getConfigurationKey().PackagingCalculatorList
  let boxTypeObject = {};
  if (boxTypeStr) {
    let boxTypes = boxTypeStr.split(',').map(item => item.trim());
    boxTypes.forEach(type => {

      let key = type.split(' ').join('');
      boxTypeObject[key] = true;
    });
    return boxTypeObject;
  }
  return boxTypeObject
}