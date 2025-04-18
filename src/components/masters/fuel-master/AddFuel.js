import React, { Component, } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector, clearFields } from "redux-form";
import { Row, Col, Table, Label } from 'reactstrap';
import { required, checkForDecimalAndNull, positiveAndDecimalNumber, maxLength10, decimalLengthsix, number, getCodeBySplitting, checkForNull } from "../../../helper/validation";
import {
  searchableSelect, focusOnError, renderTextInputField,
  validateForm,
} from "../../layout/FormInputs";
import { getUOMSelectList, fetchStateDataAPI, getAllCity, getPlantSelectListByType, fetchCountryDataAPI, fetchCityDataAPI, getVendorNameByVendorSelectList, getCityByCountryAction, getExchangeRateSource, getCurrencySelectList, } from '../../../actions/Common';
import { getFuelByPlant, createFuelDetail, updateFuelDetail, getFuelDetailData, getUOMByFuelId, getAllFuelAPI } from '../actions/Fuel';
import { MESSAGES } from '../../../config/message';
import { CBCTypeId, EMPTY_DATA, EMPTY_GUID, ENTRY_TYPE_DOMESTIC, ENTRY_TYPE_IMPORT, GUIDE_BUTTON_SHOW, searchCount, SPACEBAR, VBC_VENDOR_TYPE, VBCTypeId, ZBC, ZBCTypeId } from '../../../config/constants'
import { getConfigurationKey, IsFetchExchangeRateVendorWiseForParts, loggedInUserId } from "../../../helper/auth";
import Toaster from '../../common/Toaster';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AddFuelNameDrawer from './AddFuelNameDrawer';
import NoContentFound from '../../common/NoContentFound';
import DayTime from '../../common/DayTimeWrapper'
import { AcceptableFuelUOM } from '../../../config/masterData'
import LoaderCustom from '../../common/LoaderCustom';
import { debounce } from 'lodash';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import AsyncSelect from 'react-select/async';
import { autoCompleteDropdown, getCostingTypeIdByCostingPermission, getEffectiveDateMaxDate, getEffectiveDateMinDate } from '../../common/CommonFunctions';
import { reactLocalStorage } from 'reactjs-localstorage';
import { getExchangeRateParams, onFocus } from '../../../helper';
import { getClientSelectList, } from '../actions/Client';
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from './TourMessages';
import { withTranslation } from 'react-i18next';
import Button from '../../layout/Button';
import { getExchangeRateByCurrency } from "../../costing/actions/Costing";
import { getPlantUnitAPI } from "../actions/Plant";
import Switch from 'react-switch'
import WarningMessage from "../../common/WarningMessage";
import { LabelsClass } from '../../../helper/core';
import TooltipCustom from '../../common/Tooltip';

const selector = formValueSelector('AddFuel');

class AddFuel extends Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    this.initialState = {
      isEditFlag: false,
      FuelDetailId: '',
      isViewMode: this.props?.data?.isViewMode ? true : false,
      fuel: [],
      UOM: [],
      StateName: [],
      effectiveDate: '',

      rateGrid: [],

      files: [],
      errors: [],
      costingTypeId: ZBCTypeId,
      singlePlantSelected: [],
      vendorFilterList: [],
      vendorName: [],
      client: [],
      country: [],
      state: [],
      city: [],

      isOpenFuelDrawer: false,
      AddUpdate: true,
      DeleteChanged: true,
      HandleChanged: true,
      RateChange: [],
      setDisable: false,
      errorObj: {
        state: false,
        rate: false,
        effectiveDate: false
      },
      isGridEdit: false,
      showPopup: false,
      isImport: false,
      hidePlantCurrency: false,
      settlementCurrency: 1,
      plantCurrency: 1,
      ExchangeSource: [],
      currency: null,
      plantExchangeRateId: '',
      settlementExchangeRateId: '',
      plantCurrencyID: '',
      showPlantWarning: false,
      showWarning: false

    }
    this.state = { ...this.initialState };

  }

  /**
   * @method componentDidMount
   * @description Called after rendering the component
   */
  componentDidMount() {
    const { data } = this.props;
    this.setState({ costingTypeId: getCostingTypeIdByCostingPermission() })
    if (!this.state.isViewMode) {
      this.props.getExchangeRateSource((res) => { })
      this.props.getCurrencySelectList(() => { })
      this.props.fetchCountryDataAPI(() => { })
      this.props.fetchStateDataAPI(0, () => { })
      this.props.fetchCityDataAPI(0, () => { })
      this.props.getAllFuelAPI(() => { })
    }
    this.getDetails(data);
    if (!(data.isEditFlag || data.isViewMode)) {
      this.props.getUOMSelectList(() => { })
      this.props.getPlantSelectListByType(ZBC, "MASTER", '', () => { })
      this.props.getClientSelectList(() => { })
    }
  }
  handleCalculation = (rate) => {
    const { plantCurrency, settlementCurrency, isImport } = this.state

    if (isImport) {
      const ratePlantCurrency = checkForNull(rate) * checkForNull(plantCurrency) ?? 1
      this.props.change('RateLocalConversion', checkForDecimalAndNull(ratePlantCurrency, getConfigurationKey().NoOfDecimalForPrice))
      const rateBaseCurrency = checkForNull(checkForDecimalAndNull(ratePlantCurrency, getConfigurationKey().NoOfDecimalForPrice)) * checkForNull(settlementCurrency) ?? 1
      this.props.change('RateConversion', checkForDecimalAndNull(rateBaseCurrency, getConfigurationKey().NoOfDecimalForPrice))
    } else {
      const ratebaseCurrency = checkForNull(rate) * checkForNull(plantCurrency) ?? 1
      this.props.change('RateConversion', checkForDecimalAndNull(ratebaseCurrency, getConfigurationKey().NoOfDecimalForPrice))
    }
  }
  callExchangeRateAPI = () => {
    const { fieldsObj } = this.props
    const { costingTypeId, vendorName, client, effectiveDate, ExchangeSource, currency, isImport } = this.state;


    const fromCurrency = isImport ? currency?.label : fieldsObj?.plantCurrency
    const toCurrency = reactLocalStorage.getObject("baseCurrency")
    const hasCurrencyAndDate = fromCurrency && effectiveDate;

    if (hasCurrencyAndDate) {
      if (IsFetchExchangeRateVendorWiseForParts() && (costingTypeId !== ZBCTypeId && vendorName?.length === 0 && client?.length === 0)) {
        return;
      }

      const callAPI = (from, to, costingType, vendorValue, clientValue) => {
        return new Promise((resolve) => {
          this.props.getExchangeRateByCurrency(
            from,
            costingType,
            DayTime(this.state?.effectiveDate).format('YYYY-MM-DD'),
            vendorValue,
            clientValue,
            false,
            to,
            ExchangeSource?.label ?? null,
            res => {
              resolve({
                rate: checkForNull(res.data.Data.CurrencyExchangeRate),
                exchangeRateId: res?.data?.Data?.ExchangeRateId,
                showWarning: Object.keys(res.data.Data).length === 0,
                showPlantWarning: Object.keys(res.data.Data).length === 0
              });
            }
          );
        });
      };

      if (isImport) {
        // First API call
        if (fieldsObj?.plantCurrency === reactLocalStorage?.getObject("baseCurrency")) {
          const { costingHeadTypeId, vendorId, clientId } = getExchangeRateParams({ fromCurrency: fromCurrency, toCurrency: fieldsObj?.plantCurrency, defaultCostingTypeId: costingTypeId, vendorId: this.state.vendorName?.value, clientValue: client?.value, plantCurrency: this?.props?.fieldsObj?.plantCurrency });
          callAPI(fromCurrency, fieldsObj?.plantCurrency, costingHeadTypeId, vendorId, clientId)
            .then(result => {
              this.setState({
                plantCurrency: result.rate,
                settlementCurrency: 1,
                plantExchangeRateId: result.exchangeRateId,
                settlementExchangeRateId: null,
                showPlantWarning: result.showPlantWarning,
                showWarning: result.showWarning
              });
            });
        } else {
          const { costingHeadTypeId, vendorId, clientId } = getExchangeRateParams({ fromCurrency: fromCurrency, toCurrency: fieldsObj?.plantCurrency, defaultCostingTypeId: costingTypeId, vendorId: vendorName?.value, clientValue: client?.value, plantCurrency: this?.props?.fieldsObj?.plantCurrency });
          callAPI(fromCurrency, fieldsObj?.plantCurrency, costingHeadTypeId, vendorId, clientId)
            .then(({ rate: rate1, exchangeRateId: exchangeRateId1, showPlantWarning: showPlantWarning1, showWarning: showWarning1 }) => {
              const { costingHeadTypeId, vendorId, clientId } = getExchangeRateParams({ fromCurrency: fromCurrency, toCurrency: reactLocalStorage.getObject("baseCurrency"), defaultCostingTypeId: costingTypeId, vendorId: vendorName?.value, clientValue: client?.value, plantCurrency: this?.props?.fieldsObj?.plantCurrency });
              callAPI(fieldsObj?.plantCurrency, reactLocalStorage.getObject("baseCurrency"), costingHeadTypeId, vendorId, clientId)
                .then(({ rate: rate2, exchangeRateId: exchangeRateId2, showWarning: showWarning2, showPlantWarning: showPlantWarning2 }) => {
                  this.setState({
                    plantCurrency: rate1,
                    settlementCurrency: rate2,
                    plantExchangeRateId: exchangeRateId1,
                    settlementExchangeRateId: exchangeRateId2,
                    showPlantWarning: showPlantWarning1,
                    showWarning: showWarning2
                  }, () => {
                    this.handleCalculation(fieldsObj?.Rate)
                  });
                });
            });
        }
      } else if (this.props.fieldsObj?.plantCurrency !== reactLocalStorage?.getObject("baseCurrency")) {
        // Original single API call for non-import case
        const { costingHeadTypeId, vendorId, clientId } = getExchangeRateParams({ fromCurrency: fromCurrency, toCurrency: toCurrency, defaultCostingTypeId: costingTypeId, vendorId: vendorName?.value, clientValue: client?.value, plantCurrency: this?.props?.fieldsObj?.plantCurrency });
        callAPI(fromCurrency, toCurrency, costingHeadTypeId, vendorId, clientId).then(({ rate, exchangeRateId, showPlantWarning, showWarning }) => {
          this.setState({ plantCurrency: rate, plantExchangeRateId: exchangeRateId, showPlantWarning: showPlantWarning, showWarning: showWarning }, () => {
            this.handleCalculation(fieldsObj?.RateLocalConversion)
          });
        });
      }
    }

  }
  /**
  * @method getDetails
  * @description Used to get Details
  */
  getDetails = (data) => {
    if (data && data.isEditFlag) {
      this.setState({
        isEditFlag: false,
        isLoader: true,
        FuelDetailId: data.Id,
      })
      this.props.getFuelDetailData(data.Id, res => {
        if (res && res.data && res.data.Result) {

          const Data = res.data.Data;
          this.setState({ RateChange: Data })
          setTimeout(() => {
            let rateGridArray = Data && Data.FuelDetails.map((item) => {
              return {
                Id: item.Id,
                StateLabel: item.StateName,
                StateId: item.StateId,
                effectiveDate: DayTime(item.EffectiveDate).isValid() ? DayTime(item.EffectiveDate).format('YYYY-MM-DD HH:mm') : '',
                Rate: item.Rate,
                RateConversion: item.RateConversion,
                RateLocalConversion: item.RateLocalConversion,
                country: item.CountryName,
                countryId: item.CountryId,
                city: item.CityName,
                cityId: item.CityId,
              }
            })
            const effectiveDate = rateGridArray[0]?.effectiveDate;
            this.props.change('plantCurrency', Data?.FuelEntryType === ENTRY_TYPE_IMPORT ? Data?.LocalCurrency : Data?.Currency)
            if (Data?.LocalCurrency !== reactLocalStorage?.getObject("baseCurrency")) {
              this.setState({ hidePlantCurrency: false })
            } else {
              this.setState({ hidePlantCurrency: true })
            }
            this.setState({
              singlePlantSelected: { label: `${Data.FuelDetails[0]?.PlantName} (${Data.FuelDetails[0]?.PlantCode})`, value: Data.FuelDetails[0]?.PlantId },
              vendorName: { label: `${Data.FuelDetails[0]?.VendorName} (${Data.FuelDetails[0]?.VendorCode})`, value: Data.FuelDetails[0]?.VendorId },
              client: { label: `${Data.FuelDetails[0]?.CustomerName} (${Data.FuelDetails[0]?.CustomerCode})`, value: Data.FuelDetails[0]?.CustomerId },
              isEditFlag: true,
              fuel: Data.FuelName && Data.FuelName !== undefined ? { label: Data.FuelName, value: Data.FuelId } : [],
              UOM: Data.UnitOfMeasurement !== undefined ? { label: Data.UnitOfMeasurement, value: Data.UnitOfMeasurementId } : [],
              rateGrid: rateGridArray,
              costingTypeId: Data.FuelDetails[0]?.CostingHeadId,
              ExchangeSource: Data?.ExchangeRateSourceName ? { label: Data?.ExchangeRateSourceName, value: Data?.ExchangeRateSourceId } : [],
              plantCurrency: Data?.FuelEntryType === ENTRY_TYPE_IMPORT ? Data?.LocalCurrencyExchangeRate : Data?.ExchangeRate,
              plantCurrencyID: Data?.FuelEntryType === ENTRY_TYPE_IMPORT ? Data?.LocalCurrencyId : Data?.CurrencyId,
              settlementCurrency: Data?.ExchangeRate,
              plantExchangeRateId: Data?.FuelEntryType === ENTRY_TYPE_IMPORT ? Data?.LocalExchangeRateId : Data?.ExchangeRateId,
              settlementExchangeRateId: Data?.ExchangeRateId,
              isImport: Data?.FuelEntryType === ENTRY_TYPE_IMPORT ? true : false,
              currency: Data?.Currency ? { label: Data?.Currency, value: Data?.CurrencyId } : [],
              effectiveDate: effectiveDate

            }, () => this.setState({ isLoader: false }))
          }, 200)
        }
      })
    } else {
      this.setState({
        isEditFlag: false,
        isLoader: false,
        FuelDetailId: '',
      })
      this.props.getFuelDetailData('', res => { })
    }
  }

  /**
  * @method handleFuel
  * @description called
  */
  handleFuel = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ fuel: newValue, })
      this.props.getUOMByFuelId(newValue.value, (res) => {
        let Data = res.data.DynamicData
        this.setState({ UOM: { label: Data?.UnitOfMeasurementName, value: Data?.UnitOfMeasurementId } })
      })
    } else {
      this.setState({ fuel: [] })
    }
  };

  /**
  * @method handleUOM
  * @description called
  */
  handleUOM = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ UOM: newValue, })
    } else {
      this.setState({ UOM: [] })
    }
  };

  /**
  * @method handleState
  * @description called
  */
  handleState = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ StateName: newValue, })
    } else {
      this.setState({ StateName: [] })
    }
    this.setState({ HandleChanged: false })
  };

  checkForSpecialCharacter = (value) => {
    if (value && !/^[+]?([0-9]+(?:[.][0-9]*)?|\.[0-9]+)$/.test(value)) {
      return false;
    }
    return true;
  }

  checkDuplicateRateGrid = (rateGrid, country, effectiveDate, rateGridEditIndex) => {
    let countForGrid = 0

    rateGrid && rateGrid.map((item, index) => {
      if ((String(country?.value) === String(item.countryId)) && (String(this.state.city?.value) === String(item.cityId)) && ((DayTime(effectiveDate).format('DD/MM/YYYY')) === (DayTime(item.effectiveDate).format('DD/MM/YYYY'))) && rateGridEditIndex !== index) {
        if (this.state.StateName && this.state.StateName.length > 0 && (String(this.state.StateName?.value) === String(item.StateId))) {
          return false
        }
        countForGrid++
      }
      return null
    })

    if (countForGrid !== 0) {
      Toaster.warning('Rate for this Data already exist')
    }
    return countForGrid
  }

  rateTableHandler = () => {
    const { StateName, rateGrid, effectiveDate, country, city } = this.state;
    const { fieldsObj } = this.props;
    const tempArray = [];

    let count = 0;
    setTimeout(() => {

      if (!country || Object.keys(country).length === 0) {
        this.setState({ errorObj: { ...this.state.errorObj, country: true } })
        count++;
      }

      if (!city || Object.keys(city).length === 0) {
        this.setState({ errorObj: { ...this.state.errorObj, city: true } })
        count++;
      }

      if (country?.label) {
        const isIndia = country.label === 'India';
        const hasStateName = StateName && Object.keys(StateName).length > 0;

        this.setState({
          errorObj: { ...this.state.errorObj, state: isIndia && !hasStateName },
        });

        if (isIndia && !hasStateName) count++;
      } else {
        this.setState({ errorObj: { ...this.state.errorObj, state: true } });
        count++;
      }


      if (fieldsObj?.RateLocalConversion === undefined || Number(fieldsObj?.RateLocalConversion) === 0) {
        this.setState({ errorObj: { ...this.state.errorObj, rate: true } })
        count++
      }
      if (effectiveDate === "") {
        this.setState({ errorObj: { ...this.state.errorObj, effectiveDate: true } })
        count++
      }
      if (count > 0) {
        return false
      }
      if (this.props.invalid === true) {
        Toaster.warning('Please fill all mandatory fields first')
        return false;
      }
      if (this.checkDuplicateRateGrid(rateGrid, country, effectiveDate) !== 0) {
        return false
      }
      tempArray.push(...rateGrid, {
        Id: '',
        country: country ? country?.label : '',
        countryId: country ? country?.value : '',
        city: city ? city?.label : '',
        cityId: city ? city?.value : '',
        StateLabel: StateName ? StateName?.label : '',
        StateId: StateName ? StateName?.value : '',
        //effectiveDate: moment(effectiveDate).format('DD/MM/YYYY'),
        effectiveDate: effectiveDate,
        Rate: (this.state?.isImport || reactLocalStorage?.getObject("baseCurrency") !== this.props?.fieldsObj?.plantCurrency) ? fieldsObj?.Rate : fieldsObj?.RateLocalConversion,
        RateLocalConversion: fieldsObj?.RateLocalConversion,
        RateConversion: (this.state?.isImport || reactLocalStorage?.getObject("baseCurrency") !== this.props?.fieldsObj?.plantCurrency) ? fieldsObj?.RateConversion : fieldsObj?.RateLocalConversion,
      })
      this.setState({
        rateGrid: tempArray,
        StateName: [],
        effectiveDate: '',
        country: [],
        city: [],
      }, () => {
        this.props.change("RateConversion", '')
        this.props.change("RateLocalConversion", '')
        this.props.change("Rate", '')
        this.props.change('CountryId', null)
        this.props.change('StateId', null)
        this.props.change('CityId', null)
      }
      );
      this.setState({ AddUpdate: false, errorObj: { state: false, rate: false, effectiveDate: false, country: false, city: false } })
    }, 200);
  }


  rateTableReset = () => {

    this.setState({
      StateName: [],
      country: [],
      city: [],
      effectiveDate: "",
      errorObj: { city: false, state: false, rate: false, country: false, effectiveDate: false }

    }, () =>
      this.props.change("RateConversion", ''),
      this.props.change("RateLocalConversion", ''),
      this.props.change("Rate", '')
    );
    this.setState({ AddUpdate: false, isEditIndex: false })
  }

  /**
* @method updateRateGrid
* @description Used to handle updateProcessGrid
*/
  updateRateGrid = () => {
    const { StateName, rateGrid, effectiveDate, rateGridEditIndex, country, city } = this.state;
    const { fieldsObj } = this.props;
    const Rate = fieldsObj && fieldsObj !== undefined ? fieldsObj : 0;
    if (this.checkDuplicateRateGrid(rateGrid, country, effectiveDate, rateGridEditIndex) !== 0) {
      return false
    }
    if (this.props.invalid === true) {
      return false;
    }
    let tempArray = [];
    if (fieldsObj === undefined || Number(fieldsObj) === 0) {
      this.setState({ errorObj: { rate: true } })
      return false;
    }
    let tempData = rateGrid[rateGridEditIndex];
    tempData = {
      Id: tempData.Id,
      StateLabel: StateName?.label,
      StateId: StateName?.value,
      countryId: country?.value ? country?.value : '',
      cityId: city?.value ? city?.value : '',
      country: country?.label ? country?.label : '',
      city: city?.label ? city?.label : "",
      //effectiveDate: moment(effectiveDate).format('DD/MM/YYYY'),
      effectiveDateRate: (this.state?.isImport || reactLocalStorage?.getObject("baseCurrency") !== this.props?.fieldsObj?.plantCurrency) ? fieldsObj?.Rate : fieldsObj?.RateLocalConversion,
      RateLocalConversion: fieldsObj?.RateLocalConversion,
      RateConversion: (this.state?.isImport || reactLocalStorage?.getObject("baseCurrency") !== this.props?.fieldsObj?.plantCurrency) ? fieldsObj?.RateConversion : fieldsObj?.RateLocalConversion,
      Rate: (this.state?.isImport || reactLocalStorage?.getObject("baseCurrency") !== this.props?.fieldsObj?.plantCurrency) ? fieldsObj?.Rate : fieldsObj?.RateLocalConversion
    }
    tempArray = Object.assign([...rateGrid], { [rateGridEditIndex]: tempData })
    this.setState({
      rateGrid: tempArray,
      StateName: [],
      effectiveDate: '',
      rateGridEditIndex: '',
      isEditIndex: false,
      country: {},
      city: {},
    }, () => this.props.change("RateConversion", ''),
      this.props.change("RateLocalConversion", ''),
      this.props.change("Rate", ''));
    this.setState({ AddUpdate: false, errorObj: { rate: false } })
  };

  /**
  * @method resetRateGridData
  * @description Used to handle setTechnologyLevel
  */
  resetRateGridData = () => {
    this.setState({
      StateName: [],
      processGridEditIndex: '',
      isEditIndex: false,
    }, () => this.props.change('Rate', 0));
  };

  /**
  * @method editItemDetails
  * @description used to Reset form
  */
  editItemDetails = (index) => {
    const { rateGrid } = this.state;
    const tempData = rateGrid[index];



    this.setState({
      rateGridEditIndex: index,
      isEditIndex: true,
      effectiveDate: new Date(DayTime(tempData.effectiveDate).format("MM/DD/YYYY")),
      country: { label: tempData.country, value: tempData.countryId },
      city: { label: tempData.city, value: tempData.cityId },
      StateName: { label: tempData.StateLabel, value: tempData.StateId },
    }, () => this.props.change("RateConversion", tempData.RateConversion),
      this.props.change("RateLocalConversion", tempData.RateLocalConversion),
      this.props.change("Rate", tempData.Rate),)
  }

  /**
  * @method deleteItem
  * @description used to Reset form
  */
  deleteItem = (index) => {
    const { rateGrid } = this.state;
    this.setState({
      rateGridEditIndex: '',
      isEditIndex: false,
      effectiveDate: '',

      StateName: '',
    }, () => this.props.change('Rate', 0))
    let tempData = rateGrid.filter((item, i) => {
      if (i === index) {
        return false;
      }
      return true;
    });
    this.setState({
      rateGrid: tempData
    })
    this.setState({ DeleteChanged: false })
  }

  fuelToggler = () => {
    this.setState({ isOpenFuelDrawer: true })
  }

  closeFuelDrawer = (e = '', reqData = {}) => {
    this.setState({ isOpenFuelDrawer: false }, () => {
      setTimeout(() => {
        this.props.getAllFuelAPI((res) => {
          const { fuelDetailList } = this.props;

          /*TO SHOW FUEL NAME VALUE PRE FILLED FROM DRAWER*/
          if (Object.keys(reqData).length > 0) {
            let fuelObj = fuelDetailList && fuelDetailList.find(item => item.FuelName === reqData.FuelName)

            if (fuelObj) {
              this.props.getUOMByFuelId(fuelObj.FuelId, (res) => {
                let Data = res.data.DynamicData
                this.setState({ UOM: { label: Data?.UnitOfMeasurementName, value: Data?.UnitOfMeasurementId } })
              })
            }
            this.setState({ fuel: fuelObj && fuelObj !== undefined ? { label: fuelObj.FuelName, value: fuelObj.FuelId } : [] })
          }
        })
      }, 500);
    })
  }
  onPressVendor = (costingHeadFlag) => {
    this.props.reset();
    // Store current isImport value
    const currentIsImport = this.state.isImport;
    this.setState({
      ...this.initialState, costingTypeId: costingHeadFlag,
      isImport: currentIsImport // Preserve isImport value
    }, () => {
      if (costingHeadFlag === CBCTypeId) {
        //this.props.getClientSelectList(() => { })
      }
    });
  };
  /**
  * @method handleChange
  * @description Handle Effective Date
  */
  handleEffectiveDateChange = (date) => {
    this.setState({
      effectiveDate: date,
    }, () => {
      this.callExchangeRateAPI()
    });
  };
  rateChange = (newValue) => {
    this.handleCalculation(newValue?.target?.value)
  }
  /**
  * @method renderListing
  * @description Used to show type of listing
  */
  renderListing = (label) => {
    const { UOMSelectList, stateList, plantSelectList, clientSelectList, countryList, cityList, fuelDetailList, exchangeRateSourceList, currencySelectList } = this.props;

    const listingMap = {
      fuel: { list: fuelDetailList, labelKey: 'FuelName', valueKey: 'FuelId' },
      uom: { list: UOMSelectList, labelKey: 'Display', valueKey: 'Value', filter: item => AcceptableFuelUOM.includes(item.Type) },
      plant: { list: plantSelectList, labelKey: 'PlantNameCode', valueKey: 'PlantId' },
      country: { list: countryList, labelKey: 'Text', valueKey: 'Value' },
      state: { list: stateList, labelKey: 'Text', valueKey: 'Value' },
      city: { list: cityList, labelKey: 'Text', valueKey: 'Value' },
      ClientList: { list: clientSelectList, labelKey: 'Text', valueKey: 'Value' },
      ExchangeSource: { list: exchangeRateSourceList, labelKey: 'Text', valueKey: 'Value', filter: item => item.Value !== '--Exchange Rate Source Name--' },
      currency: { list: currencySelectList, labelKey: 'Text', valueKey: 'Value', filter: item => item.Text !== this.props?.fieldsObj?.plantCurrency }
    };

    const { list, labelKey, valueKey, filter } = listingMap[label] || {};

    if (!list) return [];

    return list.reduce((acc, item) => {
      if (item[valueKey] === '0') return acc;
      if (filter && !filter(item)) return acc;
      acc.push({ label: item[labelKey], value: item[valueKey] });
      return acc;
    }, []);
  }

  formToggle = () => {
    this.setState({
      isShowForm: !this.state.isShowForm
    })
  }

  /**
  * @method cancel
  * @description used to Reset form
  */
  cancel = (type) => {
    const { reset } = this.props;
    reset();
    this.setState({
      FuelDetailId: '',
      fuel: [],
      UOM: [],
      StateName: [],
      effectiveDate: '',
      rateGrid: [],
      isEditFlag: false,
    })
    if (type === 'submit') {
      this.props.getFuelDetailData('', res => { })
    }
    this.props.hideForm(type, this.state.isImport)
  }
  cancelHandler = () => {
    if (this.state.isViewMode) {
      this.cancel('cancel')
    } else {
      this.setState({ showPopup: true })
    }
  }
  onPopupConfirm = () => {
    this.cancel('cancel')
    this.setState({ showPopup: false })
  }
  closePopUp = () => {
    this.setState({ showPopup: false })
  }
  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = debounce((values) => {
    const { isEditFlag, rateGrid, fuel, UOM, isImport, FuelDetailId, DeleteChanged, HandleChanged, singlePlantSelected, country, StateName, city, costingTypeId, client, vendorName } = this.state;

    if (rateGrid.length === 0) {
      Toaster.warning("Please fill fuel's rate details for atleast one state");
      return false;
    }


    let fuelDetailArray = rateGrid && rateGrid.map((item) => {
      return {
        Id: item.Id ? item.Id : null,
        Rate: isImport ? Number(item?.Rate) : Number(item?.RateLocalConversion),
        RateConversion: Number(item?.RateConversion),
        RateLocalConversion: Number(item?.RateLocalConversion),
        EffectiveDate: DayTime(item.effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
        // StateId: item.StateId,
        PlantId: singlePlantSelected?.value,
        CountryId: item.countryId ? Number(item.countryId) : '',
        StateId: item.StateId ? Number(item.StateId) : null,
        CityId: item.cityId ? Number(item.cityId) : '',
        VendorId: vendorName.value ? vendorName.value : null,
        CustomerId: client.value ? client.value : null,
        CostingHeadId: Number(costingTypeId),
      }
    })

    if (isEditFlag) {



      let addRow = 0
      let count = 0
      if (rateGrid.length >= this.state.RateChange.FuelDetails.length) {
        addRow = 1
      }
      if (addRow === 0) {
        for (let i = 0; i < rateGrid.length; i++) {
          let grid = this.state.RateChange.FuelDetails[i]
          let sgrid = rateGrid[i]
          if (grid.Rate === sgrid.Rate && grid.StateName === sgrid.StateLabel) {
            count++
          }
        }
      }
      // let sebGrid = DataToChangeZ.SEBChargesDetails[0]
      if (HandleChanged && addRow === 0 && count === rateGrid.length && DeleteChanged) {
        Toaster.warning('Please change the data to save Fuel Details');
        return false
      }

      this.setState({ setDisable: true })
      let requestData = {
        FuelGroupEntryId: FuelDetailId,
        LoggedInUserId: loggedInUserId(),
        FuelId: fuel.value,
        UnitOfMeasurementId: UOM.value,
        FuelEntryType: isImport ? ENTRY_TYPE_IMPORT : ENTRY_TYPE_DOMESTIC,
        ExchangeRateSourceName: this.state.ExchangeSource?.label || null,
        ExchangeRate: isImport ? this.state?.settlementCurrency : this.state?.plantCurrency,
        ExchangeRateId: isImport ? this.state?.settlementExchangeRateId : this.state?.plantExchangeRateId,
        CurrencyId: isImport ? this.state.currency?.value : this.state?.plantCurrencyID,
        Currency: isImport ? this.state?.currency?.label : this.props.fieldsObj?.plantCurrency,
        LocalCurrencyId: isImport ? this.state?.plantCurrencyID : null,
        LocalCurrency: isImport ? this.props?.fieldsObj?.plantCurrency : null,
        LocalExchangeRateId: isImport ? this.state?.plantExchangeRateId : null,
        LocalCurrencyExchangeRate: isImport ? this.state?.plantCurrency : null,
        FuelDetails: fuelDetailArray,
      }

      this.props.updateFuelDetail(requestData, (res) => {
        this.setState({ setDisable: false })
        if (res?.data?.Result) {
          Toaster.success(MESSAGES.UPDATE_FUEL_DETAIL_SUCESS);
          this.cancel('submit');
        }
      })

    } else {

      this.setState({ setDisable: true })
      const formData = {
        LoggedInUserId: loggedInUserId(),
        FuelId: Number(fuel.value),
        UnitOfMeasurementId: UOM.value,
        FuelEntryType: isImport ? ENTRY_TYPE_IMPORT : ENTRY_TYPE_DOMESTIC,
        ExchangeRateSourceName: this.state.ExchangeSource?.label || null,
        ExchangeRate: isImport ? this.state?.settlementCurrency : this.state?.plantCurrency,
        ExchangeRateId: isImport ? this.state?.settlementExchangeRateId : this.state?.plantExchangeRateId,
        CurrencyId: isImport ? this.state.currency?.value : this.state?.plantCurrencyID,
        Currency: isImport ? this.state?.currency?.label : this.props.fieldsObj?.plantCurrency,
        LocalCurrencyId: isImport ? this.state?.plantCurrencyID : null,
        LocalCurrency: isImport ? this.props?.fieldsObj?.plantCurrency : null,
        LocalExchangeRateId: isImport ? this.state?.plantExchangeRateId : null,
        LocalCurrencyExchangeRate: isImport ? this.state?.plantCurrency : null,
        FuelDetails: fuelDetailArray,
      }


      this.props.createFuelDetail(formData, (res) => {
        this.setState({ setDisable: false })
        if (res && res?.data && res?.data?.Result) {
          Toaster.success(MESSAGES.FUEL_ADD_SUCCESS);
          this.cancel('submit');
        }
      });
    }
  }, 500)

  handleKeyDown = function (e) {
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault();
    }
  };

  handlePlant = (newValue) => {
    if (newValue && newValue !== '') {
      this.setState({ singlePlantSelected: newValue })
      this.props.getPlantUnitAPI(newValue?.value, (res) => {
        let Data = res?.data?.Data
        this.props.change('plantCurrency', Data?.Currency)
        this.setState({ plantCurrencyID: Data?.CurrencyId })
        if (Data?.Currency !== reactLocalStorage?.getObject("baseCurrency")) {
          this.setState({ hidePlantCurrency: false })
          this.callExchangeRateAPI()
        } else {
          this.setState({ hidePlantCurrency: true })
        }
      })
    } else {
      this.setState({ singlePlantSelected: [] })
    }
  };
  handleExchangeRateSource = (newValue) => {
    this.setState({ ExchangeSource: newValue }
      , () => {
        this.callExchangeRateAPI()
      }
    );
  };
  handleVendorName = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState(
        { vendorName: newValue, isVendorNameNotSelected: false, vendorLocation: [] },
        () => {
          const { vendorName } = this.state
          const result =
            vendorName && vendorName?.label
              ? getCodeBySplitting(vendorName?.label)
              : ''
          this.setState({ VendorCode: result })
          if (this.props?.fieldsObj?.plantCurrency !== reactLocalStorage?.getObject("baseCurrency")) {
            this.callExchangeRateAPI()
          }


          //this.props.getPlantBySupplier(vendorName.value, () => { })
        },
      )
    } else {
      this.setState({
        vendorName: [],
        vendorLocation: [],
      })
      //this.props.getPlantBySupplier('', () => { })
    }
  }

  handleClient = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ client: newValue }, () => {
        if (this.props.fieldsObj?.plantCurrency !== reactLocalStorage?.getObject("baseCurrency")) {
          this.callExchangeRateAPI()
        }
      });
    } else {
      this.setState({ client: [] })
    }
  };


  countryHandler = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ country: newValue, state: [], city: [], StateName: [] }, () => {
        this.getAllCityData()
      });
    } else {
      this.setState({ country: [], state: [], city: [] })
    }
    this.setState({ DropdownChanged: false })
  };

  /**
  * @method stateHandler
  * @description Used to handle state
  */
  stateHandler = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({
        StateName: newValue, city: [], errorObj: {
          ...this.state.errorObj,
          state: false
        }
      }, () => {
        const { StateName } = this.state;
        this.props.fetchCityDataAPI(StateName.value, () => { })
      });
    } else {
      this.setState({ StateName: [], city: [] });
    }

  };

  getAllCityData = () => {
    const { country } = this.state;
    if (country && country?.label !== 'India') {
      this.props.getCityByCountryAction(country?.value, '00000000000000000000000000000000', '', (res) => { })
    } else {
      this.props.fetchStateDataAPI(country?.value, () => { })
    }
  }


  cityHandler = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({
        city: newValue, errorObj: {
          ...this.state.errorObj,
          city: false
        }
      });
    } else {
      this.setState({ city: [] });
    }
    this.setState({ DropdownChanged: false })
  };

  importToggle = () => {
    this.setState({ isImport: !this.state.isImport })
  }
  /**
* @method handleCurrency
* @description called
*/
  handleCurrency = (newValue) => {
    if (newValue && newValue !== '') {
      this.setState({ currency: newValue }, () => {
        this.callExchangeRateAPI()
      })
    } else {
      this.setState({ currency: [] })
    }
  };
  fuelRateTitle = () => {
    const rateLabel = this.state.isImport ? `Rate (${this.state.currency?.label ?? 'Currency'})` : `Rate (${this.props.fieldsObj?.plantCurrency ?? 'Plant Currency'})`
    return {
      tooltipTextPlantCurrency: `${rateLabel} * Plant Currency Rate1 (${this.state?.plantCurrency ?? ''})`,
      toolTipTextNetCostBaseCurrency: this.state?.hidePlantCurrency
        ? `Rate1 (${this.props.fieldsObj?.plantCurrency ?? 'Plant Currency'})  * Currency Rate (${this.state?.plantCurrency ?? ''})`
        : `Rate1 (${this.props.fieldsObj?.plantCurrency ?? 'Plant Currency'})  * Currency Rate (${this.state?.settlementCurrency ?? ''})`,
    };
  };
  getTooltipTextForCurrency = () => {
    const { fieldsObj } = this.props
    const { settlementCurrency, plantCurrency, currency } = this.state
    const currencyLabel = currency?.label ?? 'Currency';
    const plantCurrencyLabel = fieldsObj?.plantCurrency ?? 'Plant Currency';
    const baseCurrency = reactLocalStorage.getObject("baseCurrency");

    // Check the exchange rates or provide a default placeholder if undefined
    const plantCurrencyRate = plantCurrency ?? '-';
    const settlementCurrencyRate = settlementCurrency ?? '-';

    // Generate tooltip text based on the condition
    return <>
      {!this.state?.hidePlantCurrency
        ? `Exchange Rate: 1 ${currencyLabel} = ${plantCurrencyRate} ${plantCurrencyLabel}, `
        : ''}<p>{this.state?.hidePlantCurrency ? `Exchange Rate: 1 ${currencyLabel} = ${plantCurrencyRate} ${plantCurrencyLabel}` : `Exchange Rate: 1 ${plantCurrencyLabel} = ${settlementCurrencyRate} ${baseCurrency}`}</p>
    </>;
  };
  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { handleSubmit, initialConfiguration, t, fieldsObj } = this.props;
    const { isOpenFuelDrawer, isEditFlag, isViewMode, setDisable, isGridEdit, costingTypeId, hidePlantCurrency } = this.state;
    const VendorLabel = LabelsClass(t, 'MasterLabels').vendorLabel;
    const filterList = async (inputValue) => {
      const { vendorFilterList } = this.state
      const resultInput = inputValue.slice(0, searchCount)
      if (inputValue?.length >= searchCount && vendorFilterList !== resultInput) {
        this.setState({ inputLoader: true })
        let res
        res = await getVendorNameByVendorSelectList(VBC_VENDOR_TYPE, resultInput)
        this.setState({ inputLoader: false })
        this.setState({ vendorFilterList: resultInput })
        let vendorDataAPI = res?.data?.SelectList
        if (inputValue) {
          return autoCompleteDropdown(inputValue, vendorDataAPI, false, [], true)
        } else {
          return vendorDataAPI
        }
      }
      else {
        if (inputValue?.length < searchCount) return false
        else {
          let VendorData = reactLocalStorage?.getObject('Data')
          if (inputValue) {
            return autoCompleteDropdown(inputValue, VendorData, false, [], false)
          } else {
            return VendorData
          }
        }
      }
    };

    const isStateOfCountryAvailable = this.state?.country?.length === 0 || this.state?.country?.label === 'India'
    return (
      <>
        {this.state.isLoader && <LoaderCustom />}
        <div className="container-fluid">
          <div className="">
            <div className="login-container signup-form">
              <div className="row">
                <div className="col-md-12">
                  <div className="shadow-lgg login-formg">
                    <div className="row">
                      <div className="col-md-6">
                        <h1>{isViewMode ? "View" : isEditFlag ? "Update" : "Add"} Fuel
                          <TourWrapper
                            buttonSpecificProp={{ id: "Add_Fuel_Form" }}
                            stepsSpecificProp={{
                              steps: Steps(t).ADD_FUEL
                            }} />
                        </h1>
                      </div>
                    </div>
                    <form
                      noValidate
                      className="form"
                      onSubmit={handleSubmit(this.onSubmit.bind(this))}
                      onKeyDown={(e) => { this.handleKeyDown(e, this.onSubmit.bind(this)); }}
                    >
                      <div className="add-min-height">
                        <Row>
                          <Col md="4" className="switch mb15">
                            <label className="switch-level">
                              <div className={"left-title"}>Domestic</div>
                              <Switch
                                onChange={this.importToggle}
                                checked={this.state.isImport}
                                id="normal-switch"
                                disabled={isEditFlag}
                                background="#4DC771"
                                onColor="#4DC771"
                                onHandleColor="#ffffff"
                                offColor="#4DC771"
                                uncheckedIcon={false}
                                checkedIcon={false}
                                height={20}
                                width={46}
                              />
                              <div className={"right-title"}>Import</div>
                            </label>
                          </Col>

                        </Row>
                        <Row>

                          <Col md="12">
                            {(reactLocalStorage.getObject('CostingTypePermission').zbc) && <Label id="AddFuel_zerobased" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
                              <input
                                type="radio"
                                name="costingHead"
                                checked={
                                  costingTypeId === ZBCTypeId ? true : false
                                }
                                onClick={() =>
                                  this.onPressVendor(ZBCTypeId)
                                }
                                disabled={isEditFlag ? true : false}
                              />{" "}
                              <span>Zero Based</span>
                            </Label>}
                            {(reactLocalStorage.getObject('CostingTypePermission').vbc) && <Label id="AddFuel_vendorbased" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
                              <input
                                type="radio"
                                name="costingHead"
                                checked={
                                  costingTypeId === VBCTypeId ? true : false
                                }
                                onClick={() =>
                                  this.onPressVendor(VBCTypeId)
                                }
                                disabled={isEditFlag ? true : false}
                              />{" "}
                              <span>{VendorLabel} Based</span>
                            </Label>}
                            {(reactLocalStorage.getObject('CostingTypePermission').cbc) && <Label id="AddFuel_customerbased" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3 pt-0 radio-box"} check>
                              <input
                                type="radio"
                                name="costingHead"
                                checked={
                                  costingTypeId === CBCTypeId ? true : false
                                }
                                onClick={() =>
                                  this.onPressVendor(CBCTypeId)
                                }
                                disabled={isEditFlag ? true : false}
                              />{" "}
                              <span>Customer Based</span>
                            </Label>}
                          </Col>

                          <Col md="12" className="filter-block">
                            <div className=" flex-fills mb-2 pl-0">
                              <h5>{"Fuel For:"}</h5>
                            </div>
                          </Col>
                          <Col md="3">
                            <div className="d-flex justify-space-between align-items-center inputwith-icon">
                              <div className="fullinput-icon">
                                <Field
                                  label={'Plant (Code)'}
                                  name="plant"
                                  placeholder={"Select"}
                                  options={this.renderListing("plant")}
                                  handleChangeDescription={this.handlePlant}
                                  validate={this.state.singlePlantSelected == null || this.state.singlePlantSelected.length === 0 ? [required] : []}
                                  required={true}
                                  component={searchableSelect}
                                  valueDescription={this.state.singlePlantSelected}
                                  mendatory={true}
                                  className="multiselect-with-border"
                                  disabled={isEditFlag}
                                />
                              </div>
                            </div>
                          </Col>
                          {getConfigurationKey().IsSourceExchangeRateNameVisible && (
                            <Col md="3">
                              <Field
                                label="Exchange Rate Source"
                                name="ExchangeSource"
                                placeholder="Select"
                                options={this.renderListing("ExchangeSource")}
                                handleChangeDescription={this.handleExchangeRateSource}
                                component={searchableSelect}
                                className="multiselect-with-border"
                                disabled={isEditFlag}
                                valueDescription={this.state.ExchangeSource}
                              />
                            </Col>
                          )}
                          <Col md="3">
                            {!this.state.hidePlantCurrency && this.props.fieldsObj?.plantCurrency && !this.state.isImport && <TooltipCustom width="350px" id="plantCurrency" tooltipText={`Exchange Rate: 1 ${this.props.fieldsObj?.plantCurrency} = ${this.state?.plantCurrency ?? '-'} ${reactLocalStorage.getObject("baseCurrency")}`} />}
                            <Field
                              name="plantCurrency"
                              type="text"
                              label="Plant Currency"
                              placeholder={"-"}
                              validate={[]}
                              component={renderTextInputField}
                              required={false}
                              disabled={true}
                              className=" "
                              customClassName=" withBorder mb-1"
                            />
                            {this.state?.showPlantWarning && <WarningMessage dClass="mb-3" message={`${this.props?.fieldsObj?.plantCurrency} rate is not present in the Exchange Master`} />}

                          </Col>
                          {this.state.isImport && <Col md="3">
                            <TooltipCustom id="currency" width="350px" tooltipText={this.getTooltipTextForCurrency()} />
                            <Field
                              name="Currency"
                              type="text"
                              label="Currency"
                              component={searchableSelect}
                              placeholder={isEditFlag ? '-' : "Select"}
                              options={this.renderListing("currency")}
                              validate={
                                this.state.currency == null ||
                                  this.state.currency.length === 0
                                  ? [required]
                                  : []
                              }
                              required={true}
                              handleChangeDescription={this.handleCurrency}
                              valueDescription={this.state.currency}
                              disabled={isEditFlag ? true : false}
                              customClassName="mb-1"
                            >{this.state?.currency?.label && this.state?.showWarning && <WarningMessage dClass="mt-1" message={`${this.state?.currency?.label} rate is not present in the Exchange Master`} />}
                            </Field>
                          </Col>}
                          {costingTypeId === CBCTypeId && (
                            <Col md="3">
                              <Field
                                name="clientName"
                                type="text"
                                label={"Customer (Code)"}
                                component={searchableSelect}
                                placeholder={isEditFlag ? '-' : "Select"}
                                options={this.renderListing("ClientList")}
                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                validate={
                                  this.state.client == null ||
                                    this.state.client.length === 0
                                    ? [required]
                                    : []
                                }
                                required={true}
                                handleChangeDescription={this.handleClient}
                                valueDescription={this.state.client}
                                disabled={isEditFlag ? true : false}
                              />
                            </Col>
                          )}

                          {costingTypeId === VBCTypeId && <Col md="3" className='mb-4'>
                            <label>{`${VendorLabel} (Code)`}<span className="asterisk-required">*</span></label>
                            <div className="d-flex justify-space-between align-items-center async-select">
                              <div className="fullinput-icon p-relative">
                                {this.state.inputLoader && <LoaderCustom customClass={`input-loader`} />}
                                <AsyncSelect
                                  name="DestinationSupplierId"
                                  ref={this.myRef}
                                  key={this.state.updateAsyncDropdown}
                                  loadOptions={filterList}
                                  onChange={(e) => this.handleVendorName(e)}
                                  value={this.state.vendorName}
                                  noOptionsMessage={({ inputValue }) => inputValue.length < 3 ? MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN : "No results found"}
                                  isDisabled={isEditFlag || isViewMode}
                                  onKeyDown={(onKeyDown) => {
                                    if (onKeyDown.keyCode === SPACEBAR && !onKeyDown.target.value) onKeyDown.preventDefault();
                                  }}
                                  onFocus={() => onFocus(this)}
                                />
                              </div>
                            </div>
                            {((this.state.showErrorOnFocus && this.state.vendorName.length === 0) || this.state.isVendorNameNotSelected) && <div className='text-help mt-1'>This field is required.</div>}
                          </Col>
                          }

                          <Col md="12" className="filter-block">
                            <div className=" flex-fills mb-2 pl-0">
                              <h5>{"Fuel:"}</h5>
                            </div>
                          </Col>
                          <Col md="3">
                            <div className="d-flex justify-space-between align-items-center inputwith-icon">
                              <div className="fullinput-icon">
                                <Field
                                  name="Fuel"
                                  type="text"
                                  label="Fuel Name"
                                  component={searchableSelect}
                                  placeholder={"Select"}
                                  options={this.renderListing("fuel")}
                                  validate={
                                    this.state.fuel == null ||
                                      this.state.fuel.length === 0
                                      ? [required]
                                      : []
                                  }
                                  required={true}
                                  handleChangeDescription={this.handleFuel}
                                  valueDescription={this.state.fuel}
                                  disabled={isEditFlag || this?.state?.rateGrid?.length > 0}
                                />
                              </div>
                              {!isEditFlag && (
                                <div id="AddFuel_Toggle"
                                  onClick={this.fuelToggler}
                                  className={"plus-icon-square  right"}
                                ></div>
                              )}
                            </div>
                          </Col>
                          <Col md="3">
                            <div className="d-flex justify-space-between align-items-center inputwith-icon">
                              <div className="fullinput-icon">
                                <Field
                                  name="UnitOfMeasurementId"
                                  type="text"
                                  label="UOM"
                                  component={searchableSelect}
                                  // placeholder={isEditFlag ? '-' : "Select"}
                                  placeholder={'-'} // Here value of "disabled" is set to true so no need to conditionally set the placeholder
                                  options={this.renderListing("uom")}
                                  //onKeyUp={(e) => this.changeItemDesc(e)}
                                  validate={
                                    this.state.UOM == null ||
                                      this.state.UOM.length === 0
                                      ? [required]
                                      : []
                                  }
                                  required={true}
                                  handleChangeDescription={this.handleUOM}
                                  valueDescription={this.state.UOM}
                                  disabled={true}
                                />
                              </div>
                            </div>
                          </Col>
                        </Row>

                        <Row className='rate-form-container'>
                          <Col md="12" className="filter-block">
                            <div className=" flex-fills mb-2 pl-0">
                              <h5>{"Rate:"}</h5>
                            </div>
                          </Col>

                          <Col md="3">
                            <div className="form-group inputbox withBorder ">
                              <Field
                                name="CountryId"
                                type="text"
                                label="Country"
                                component={searchableSelect}
                                placeholder={'Select'}
                                options={this.renderListing('country')}
                                required={true}
                                handleChangeDescription={this.countryHandler}
                                valueDescription={this.state.country}
                                disabled={isViewMode}
                              />
                              {this.state.errorObj?.country && <div className='text-help p-absolute'>This field is required.</div>}
                            </div>
                          </Col>

                          {isStateOfCountryAvailable &&
                            <Col md="3">
                              <div className="form-group inputbox withBorder ">
                                <Field
                                  name="StateId"
                                  type="text"
                                  label="State"
                                  component={searchableSelect}
                                  placeholder={'Select'}
                                  options={this.renderListing('state')}
                                  required={true}
                                  handleChangeDescription={this.stateHandler}
                                  valueDescription={this.state.StateName}
                                  disabled={isViewMode}
                                />
                                {this.state.errorObj?.state && <div className='text-help p-absolute'>This field is required.</div>}
                              </div>
                            </Col>}

                          <Col md="3">
                            <div className="form-group inputbox withBorder ">
                              <Field
                                name="CityId"
                                type="text"
                                label="City"
                                component={searchableSelect}
                                placeholder={'Select'}
                                options={this.renderListing('city')}
                                required={true}
                                handleChangeDescription={this.cityHandler}
                                valueDescription={this.state.city}
                                disabled={isViewMode}
                              />
                              {this.state.errorObj?.city && <div className='text-help p-absolute'>This field is required.</div>}
                            </div>
                          </Col>
                          <Col md="3">
                            <div className="form-group">
                              <label>Effective Date<span className="asterisk-required">*</span>
                              </label>
                              <div id="AddFuel_EffectiveDate" className="inputbox date-section">
                                <DatePicker
                                  required
                                  name="EffectiveDate"
                                  selected={this.state?.effectiveDate ? new Date(this.state.effectiveDate) : ""}
                                  onChange={this.handleEffectiveDateChange}
                                  showMonthDropdown
                                  showYearDropdown
                                  dropdownMode="select"
                                  dateFormat="dd/MM/yyyy"
                                  placeholderText={isViewMode ? '-' : "Select Date"}
                                  className="withBorder"
                                  autoComplete={"off"}
                                  disabledKeyboardNavigation
                                  onChangeRaw={(e) => e.preventDefault()}
                                  disabled={isViewMode || isEditFlag}
                                  minDate={getEffectiveDateMinDate()}
                                  valueDescription={this.state?.effectiveDate}
                                  maxDate={getEffectiveDateMaxDate()}

                                />
                                {this.state.errorObj.effectiveDate && this.state.effectiveDate === "" && <div className='text-help'>This field is required.</div>}
                              </div>
                            </div>
                          </Col>
                          {this.state.isImport && <Col md="3">
                            <div className='p-relative'>
                              <Field
                                label={`Rate (${this.state?.currency?.label ?? 'Currency'})`}
                                name={"Rate"}
                                type="text"
                                placeholder={isViewMode ? '-' : 'Enter'}
                                validate={[positiveAndDecimalNumber, maxLength10, decimalLengthsix, number]}
                                component={renderTextInputField}
                                required={true}
                                onChange={this.rateChange}
                                className=""
                                customClassName="mb-0 withBorder"
                                disabled={isViewMode}
                              />
                              {this.state.errorObj.rate && (this.props.fieldsObj.Rate === undefined || Number(this.props.fieldsObj.Rate) === 0) && <div className='text-help p-absolute'>This field is required.</div>}
                            </div>
                          </Col>}
                          <Col md="3">
                            {this.state.isImport && <TooltipCustom disabledIcon={true} id="rate-local" tooltipText={hidePlantCurrency ? this.fuelRateTitle()?.toolTipTextNetCostBaseCurrency : this.fuelRateTitle()?.tooltipTextPlantCurrency} />}
                            <div className='p-relative'>
                              <Field
                                label={`Rate (${fieldsObj?.plantCurrency ?? 'Currency'})`}
                                name={"RateLocalConversion"}
                                type="text"
                                id="rate-local"
                                placeholder={isViewMode || this.state.isImport ? '-' : 'Enter'}
                                validate={[positiveAndDecimalNumber, maxLength10, decimalLengthsix, number]}
                                component={renderTextInputField}
                                required={true}
                                onChange={this.rateChange}
                                className=""
                                customClassName="mb-0 withBorder"
                                disabled={isViewMode || this.state.isImport}
                              />
                              {this.state.errorObj.rate && (this.props.fieldsObj.RateLocalConversion === undefined || Number(this.props.fieldsObj.RateLocalConversion) === 0) && <div className='text-help p-absolute'>This field is required.</div>}
                            </div>
                          </Col>
                          {!this.state?.hidePlantCurrency &&
                            (
                              <Col md="3">
                                <TooltipCustom disabledIcon={true} id="fuel-rate" tooltipText={this.state.isImport ? this.fuelRateTitle()?.toolTipTextNetCostBaseCurrency : this.fuelRateTitle()?.tooltipTextPlantCurrency} />
                                <div className='p-relative'>
                                  <Field
                                    label={`Rate (${reactLocalStorage.getObject("baseCurrency")})`}
                                    name={"RateConversion"}
                                    id="fuel-rate"
                                    type="text"
                                    placeholder={'-'}
                                    validate={[]}
                                    component={renderTextInputField}
                                    required={false}
                                    className=""
                                    customClassName="mb-0 withBorder"
                                    disabled={true}
                                  />
                                </div>
                              </Col>)}
                          <Col md="3">
                            <div className={`pt-2 mt-4 pr-0 mb-3`}>
                              {this.state.isEditIndex ? (
                                <>
                                  <button type="button" className={"btn btn-primary pull-left mr5"} onClick={this.updateRateGrid}>Update</button>
                                  <button
                                    type="button"
                                    className={"mr15 ml-1 add-cancel-btn cancel-btn my-0"}
                                    disabled={isViewMode}
                                    onClick={this.rateTableReset}
                                  >
                                    <div className={"cancel-icon"}></div>Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button id="AddFuel_AddData"
                                    type="button"
                                    className={"user-btn pull-left mr10"}
                                    disabled={isViewMode}
                                    onClick={this.rateTableHandler}
                                  >
                                    <div className={"plus"}></div>ADD
                                  </button>
                                  <button
                                    type="button"
                                    className={"mr15 ml-1 reset-btn"}
                                    disabled={isViewMode}
                                    onClick={this.rateTableReset}
                                  >
                                    Reset
                                  </button>
                                </>
                              )}
                            </div>
                          </Col>
                          <Col md="12">
                            <Table className="table border" size="sm">
                              <thead>
                                <tr>
                                  <th>{`Country`}</th>
                                  <th>{`City`}</th>
                                  <th>{`State`}</th>
                                  {this.state?.isImport && <th>{`Rate (${this.state?.currency?.label ?? 'Currency'})`}</th>}
                                  <th>{`Rate (${fieldsObj?.plantCurrency ?? 'Currency'})`}</th>
                                  {!this.state?.hidePlantCurrency && <th>{`Rate (${reactLocalStorage.getObject("baseCurrency")})`}</th>}
                                  <th>{`Effective From`}</th>
                                  <th>{`Action`}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {this.state.rateGrid &&
                                  this.state.rateGrid.map((item, index) => {
                                    return (
                                      <tr key={index}>
                                        <td>{item.country}</td>
                                        <td>{item.city}</td>
                                        <td>{item.StateLabel ? item.StateLabel : '-'}</td>
                                        {this.state.isImport && <td>{item?.Rate ? checkForDecimalAndNull(item?.Rate, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>}
                                        <td>{item?.RateLocalConversion ? checkForDecimalAndNull(item?.RateLocalConversion, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
                                        {!this.state?.hidePlantCurrency && <td>{item?.RateConversion ? checkForDecimalAndNull(item?.RateConversion, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>}
                                        {/* <td>{item.effectiveDate}</td> */}
                                        <td>
                                          {DayTime(item.effectiveDate).format(
                                            "DD/MM/YYYY"
                                          )}
                                        </td>
                                        <td>
                                          <button
                                            className="Edit mr-2"
                                            title='Edit'
                                            type={"button"}
                                            disabled={isViewMode || item?.IsAssociated}
                                            onClick={() =>
                                              this.editItemDetails(index)
                                            }
                                          />
                                          <button
                                            className="Delete"
                                            title='Delete'
                                            type={"button"}
                                            disabled={isViewMode || item?.IsAssociated || isGridEdit}
                                            onClick={() =>
                                              this.deleteItem(index)
                                            }
                                          />
                                        </td>
                                      </tr>
                                    );
                                  })}
                              </tbody>

                              {this.state.rateGrid.length === 0 && (
                                <tbody className='border'>
                                  <tr>
                                    <td colSpan={"10"}> <NoContentFound title={EMPTY_DATA} /></td>
                                  </tr>
                                </tbody>
                              )}
                            </Table>
                          </Col>
                        </Row>
                      </div>

                      <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                        <div className="col-sm-12 text-right bluefooter-butn">
                          <button id="AddFuel_Cancel"
                            type={"button"}
                            className="mr15 cancel-btn"
                            onClick={this.cancelHandler}
                            disabled={setDisable}
                          >
                            <div className={"cancel-icon"}></div>
                            {"Cancel"}
                          </button>
                          {!isViewMode && <button id="AddFuel_Save"
                            type="submit"
                            className="user-btn mr5 save-btn"
                            disabled={isViewMode || setDisable || this.state?.showWarning || this.state?.showPlantWarning}
                          >
                            <div className={"save-icon"}></div>
                            {isEditFlag ? "Update" : "Save"}
                          </button>}
                        </div>
                      </Row>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isOpenFuelDrawer && (
            <AddFuelNameDrawer
              isOpen={isOpenFuelDrawer}
              closeDrawer={this.closeFuelDrawer}
              isEditFlag={false}
              ID={""}
              anchor={"right"}
            />
          )}
        </div>
        {
          this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.CANCEL_MASTER_ALERT}`} />
        }
      </>
    );
  }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps(state) {
  const { fuel, auth, comman, client } = state;
  const fieldsObj = selector(state, "Rate", "RateLocalConversion", "Currency", "ExchangeSource", "plantCurrency", "RateConversion");
  let initialValues = {};

  const { UOMSelectList, stateList, plantSelectList, countryList, cityList, exchangeRateSourceList, currencySelectList } = comman;
  const { fuelDetailList } = fuel;
  const { initialConfiguration } = auth;
  const { clientSelectList } = client;

  return { initialValues, fieldsObj, initialConfiguration, UOMSelectList, stateList, plantSelectList, clientSelectList, countryList, cityList, fuelDetailList, exchangeRateSourceList, currencySelectList }

}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
  getFuelByPlant,
  createFuelDetail,
  updateFuelDetail,
  getFuelDetailData,
  getUOMSelectList,
  fetchStateDataAPI,
  getAllCity,
  getUOMByFuelId,
  getClientSelectList,
  getPlantSelectListByType,
  fetchCountryDataAPI,
  fetchCityDataAPI,
  getCityByCountryAction,
  getAllFuelAPI,
  getExchangeRateByCurrency,
  getPlantUnitAPI,
  getExchangeRateSource,
  getCurrencySelectList
})(reduxForm({
  form: 'AddFuel',
  validate: validateForm,
  enableReinitialize: true,
  touchOnChange: true,
  onSubmitFail: errors => {
    focusOnError(errors);
  },
})(withTranslation(['FuelPowerMaster', 'MasterLabels'])(AddFuel)),
)
