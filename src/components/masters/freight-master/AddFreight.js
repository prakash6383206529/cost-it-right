import React, { Component } from "react";
import { connect } from "react-redux";
import { Row, Col, Table, Label } from "reactstrap";
import { Field, reduxForm, formValueSelector, clearFields } from "redux-form";
import { required, checkForNull, maxLength10, checkForDecimalAndNull, number, decimalNumberLimit6, checkWhiteSpaces } from "../../../helper/validation";
import { renderTextInputField, searchableSelect } from "../../layout/FormInputs";
import { fetchSupplierCityDataAPI, getAllCity, getVendorNameByVendorSelectList, getPlantSelectListByType, getCityByCountryAction, getExchangeRateSource, getCurrencySelectList } from "../../../actions/Common";
import {
  createFreight, updateFright, getFreightData, getFreightModeSelectList, getFreigtFullTruckCapacitySelectList, getFreigtRateCriteriaSelectList,
} from "../actions/Freight";
import Toaster from "../../common/Toaster";
import { MESSAGES } from "../../../config/message";
import { getConfigurationKey, IsFetchExchangeRateVendorWise, loggedInUserId, userDetails } from "../../../helper/auth";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AddVendorDrawer from "../supplier-master/AddVendorDrawer";
import DayTime from "../../common/DayTimeWrapper"
import NoContentFound from "../../common/NoContentFound";
import { CBCTypeId, EMPTY_DATA, EMPTY_GUID, ENTRY_TYPE_DOMESTIC, ENTRY_TYPE_IMPORT, FullTruckLoad, SPACEBAR, VBCTypeId, VBC_VENDOR_TYPE, ZBC, ZBCTypeId, searchCount } from "../../../config/constants";
import LoaderCustom from "../../common/LoaderCustom";
import { debounce } from "lodash";
import AsyncSelect from 'react-select/async';
import { getExchangeRateParams, onFocus } from "../../../helper";
import { getClientSelectList, } from '../actions/Client';
import { reactLocalStorage } from "reactjs-localstorage";
import { autoCompleteDropdown, getCostingTypeIdByCostingPermission, getEffectiveDateMinDate } from "../../common/CommonFunctions";
import PopupMsgWrapper from "../../common/PopupMsgWrapper";
import { FREIGHT_LOAD_OPTIONS } from "../../../config/masterData";
import { label } from "react-dom-factories";
import { subDays } from "date-fns";
import { withTranslation } from "react-i18next";
import { LabelsClass } from "../../../helper/core";
import { getExchangeRateByCurrency } from "../../costing/actions/Costing";
import { getPlantUnitAPI } from "../actions/Plant";
import Switch from 'react-switch'
import WarningMessage from "../../common/WarningMessage";
import TooltipCustom from "../../common/Tooltip";


const selector = formValueSelector("AddFreight");
class AddFreight extends Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    this.initialState = {
      FreightID: "",
      isEditFlag: false,
      isViewMode: this.props?.data?.isViewMode ? true : false,
      isEditMode: this.props?.data?.isEditMode ? true : false,
      IsVendor: false,
      TransportMode: [],
      FullTruckCapacity: [],
      RateCriteria: [],
      isEditIndex: false,
      gridEditIndex: "",
      gridTable: [],
      isOpenVendor: false,
      vendorName: [],
      IsLoadingUnloadingApplicable: false,
      sourceLocation: [],
      destinationLocation: [],
      effectiveDate: "",
      DataToChange: [],
      AddUpdate: true,
      DeleteChanged: true,
      HandleChanged: true,
      setDisable: false,
      isVendorNameNotSelected: false,
      inputLoader: false,
      client: [],
      costingTypeId: ZBCTypeId,
      errorObj: {
        capacity: false,
        criteria: false,
        rate: false,
        load: false
      },
      showErrorOnFocus: false,
      showPopup: false,
      vendorFilterList: [],
      Plant: [],
      showEffectiveDateError: false,
      Load: [],
      isImport: false,
      hidePlantCurrency: false,
      settlementCurrency: null,
      plantCurrency: null,
      ExchangeSource: [],
      currency: null,
      plantExchangeRateId: '',
      settlementExchangeRateId: '',
      plantCurrencyID: '',
      showPlantWarning: false
    };
    this.state = { ...this.initialState };

  }
  /**
   * @method componentDidMount
   * @description Called after rendering the component
   */
  componentDidMount() {
    this.setState({ costingTypeId: getCostingTypeIdByCostingPermission() })
    if (!this.state.isViewMode) {
      this.props.getCurrencySelectList(() => { })
      this.props.getExchangeRateSource((res) => { })
      this.props.getFreigtFullTruckCapacitySelectList((res) => { });
      this.props.getFreigtRateCriteriaSelectList((res) => { });
    }
    if (!(this.props.data.isEditFlag || this.state.isViewMode)) {
      // this.props.getAllCity(cityId => {
      // this.props.getCityByCountry(0, 0,'', () => { })
      this.props.getClientSelectList(() => { })
      // })
    }
    this.props.getPlantSelectListByType(ZBC, "MASTER", '', () => { })
    this.props.getFreightModeSelectList((res) => { });
    this.getDetails();
  }
  componentWillUnmount() {
    reactLocalStorage?.setObject('vendorData', [])
  }

  callExchangeRateAPI = () => {
    const { fieldsObj } = this.props
    const { costingTypeId, vendorName, client, effectiveDate, ExchangeSource, currency, isImport } = this.state;

    
    const fromCurrency = isImport ? currency?.label : fieldsObj?.plantCurrency
    const toCurrency = reactLocalStorage.getObject("baseCurrency")
    const hasCurrencyAndDate = fieldsObj?.plantCurrency && effectiveDate;

    if (hasCurrencyAndDate) {
      if (IsFetchExchangeRateVendorWise() && (costingTypeId !== ZBCTypeId && vendorName?.length === 0 && client?.length === 0)) {
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
        const { costingHeadTypeId, vendorId, clientId } = getExchangeRateParams({ fromCurrency: fromCurrency, toCurrency: fieldsObj?.plantCurrency, defaultCostingTypeId: costingTypeId, vendorId: vendorName?.value, clientValue: client?.value});
        callAPI(fromCurrency, fieldsObj?.plantCurrency, costingHeadTypeId, vendorId, clientId).then(({ rate: rate1, exchangeRateId: exchangeRateId1, showPlantWarning: showPlantWarning1, showWarning: showWarning1, }) => {
          // Second API call
          const { costingHeadTypeId, vendorId, clientId } = getExchangeRateParams({ fromCurrency: fromCurrency, toCurrency: reactLocalStorage.getObject("baseCurrency"), defaultCostingTypeId: costingTypeId, vendorId: vendorName?.value, clientValue: client?.value});
          callAPI(fromCurrency, reactLocalStorage.getObject("baseCurrency"), costingHeadTypeId, vendorId, clientId).then(({ rate: rate2, exchangeRateId: exchangeRateId2, showWarning: showWarning2, showPlantWarning: showPlantWarning2 }) => {
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
      } else if (this.props.fieldsObj?.plantCurrency !== reactLocalStorage?.getObject("baseCurrency")) {
        // Original single API call for non-import case
        const { costingHeadTypeId, vendorId, clientId } = getExchangeRateParams({ fromCurrency: fromCurrency, toCurrency: toCurrency, defaultCostingTypeId: costingTypeId, vendorId: vendorName?.value, clientValue: client?.value});
        callAPI(fromCurrency, toCurrency, costingHeadTypeId, vendorId, clientId).then(({ rate, exchangeRateId, showPlantWarning, showWarning }) => {
          this.setState({ plantCurrency: rate, plantExchangeRateId: exchangeRateId, showPlantWarning: showPlantWarning, showWarning: showWarning }, () => {
            this.handleCalculation(fieldsObj?.RateLocalConversion)
          });
        });
      }
    }

  }
  handleCalculation = (rate) => {
    const { plantCurrency, settlementCurrency, isImport } = this.state
    if (isImport) {
      const ratePlantCurrency = checkForNull(rate) * checkForNull(plantCurrency)
      this.props.change('RateLocalConversion', checkForDecimalAndNull(ratePlantCurrency, getConfigurationKey().NoOfDecimalForPrice))
      const rateBaseCurrency = checkForNull(rate) * checkForNull(settlementCurrency)
      this.props.change('RateConversion', checkForDecimalAndNull(rateBaseCurrency, getConfigurationKey().NoOfDecimalForPrice))
    } else {
      const ratebaseCurrency = checkForNull(rate) * checkForNull(plantCurrency)
      this.props.change('RateConversion', checkForDecimalAndNull(ratebaseCurrency, getConfigurationKey().NoOfDecimalForPrice))
    }
  }
  /**
  * @method onPressVendor
  * @description Used for Vendor checked
  */
  onPressVendor = (costingHeadFlag) => {
    this.props.reset();
    // Store current isImport value
    const currentIsImport = this.state.isImport;
    this.setState({
      ...this.initialState, costingTypeId: costingHeadFlag,
      isImport: currentIsImport // Preserve isImport value
    }, () => {
      if (costingHeadFlag === CBCTypeId) {
        this.props.getClientSelectList(() => { })
      }
    });
  };

  /**
   * @method handleTransportMoodChange
   * @description  used to handle BOP Category Selection
   */
  handleTransportMoodChange = (newValue, actionMeta) => {
    if (newValue && newValue !== "") {
      this.setState({ TransportMode: newValue });
    } else {
      this.setState({ TransportMode: [] });
    }
  };
  /**
* @method handleClient
* @description called
*/
  handleClient = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ client: newValue }, () => {
        this.callExchangeRateAPI()
      });
    } else {
      this.setState({ client: [] })
    }
  };

  /**
  * @method handlePlant
  * @description called
  */
  handlePlant = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ Plant: newValue });
      this.props.getPlantUnitAPI(newValue?.value, (res) => {
        let Data = res?.data?.Data
        this.props.change('plantCurrency', Data?.Currency)
        this.setState({ plantCurrencyID: Data?.CurrencyId })
        if (Data?.Currency !== reactLocalStorage?.getObject("baseCurrency")) {
          this.setState({ hidePlantCurrency: false })
        } else {
          this.setState({ hidePlantCurrency: true })
        }
        this.callExchangeRateAPI()
      })
    } else {
      this.setState({ Plant: [] })
    }
  };
  handleExchangeRateSource = (newValue) => {
    this.setState({ ExchangeSource: newValue }
      , () => {
        this.callExchangeRateAPI()
      }
    );
  };
  /**
  * @method handleLoad
  * @description Load
  */
  handleLoad = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      const { errorObj } = this.state
      let obj = { ...errorObj }
      obj.load = false
      this.setState({
        FullTruckCapacity: [],
        RateCriteria: [],
      }, () => this.props.change("Rate", ''));
      this.setState({ Load: newValue, errorObj: obj });
    } else {
      this.setState({ Load: [] })
    }
  };

  /**
   * @method getDetails
   * @description Used to get Details
   */
  getDetails = () => {
    const { data } = this.props;
    if (data && data.isEditFlag) {
      this.setState({
        isEditFlag: false,
        isLoader: true,
        FreightID: data.Id,
      });

      this.props.getFreightData(data.Id, (res) => {
        if (res && res.data && res.data.Result) {
          const Data = res.data.Data;
          this.setState({ DataToChange: Data })
          setTimeout(() => {
            const { freightModeSelectList, } = this.props;
            let modeObj =
              freightModeSelectList && freightModeSelectList.find((item) => item?.Value === Data.Mode);
            let GridArray =
              Data &&
              Data.FullTruckLoadDetails.map((item) => {
                return {
                  FullTruckLoadId: item?.FullTruckLoadId,
                  FreightId: item?.FreightId,
                  Capacity: item?.Capacity,
                  RateCriteria: item?.RateCriteria,
                  Rate: item?.Rate,
                  RateConversion: item?.RateConversion,
                  RateLocalConversion: item?.RateLocalConversion,
                  Load: { label: item?.FreightLoadType, value: item?.EFreightLoadType },
                  EFreightLoadType: item?.EFreightLoadType,
                  IsFreightAssociated: item?.IsFreightAssociated,
                };
              });
            this.props.change('ExchangeSource', { label: Data?.ExchangeRateSourceName, value: Data?.ExchangeRateSourceName })
            this.props.change('plantCurrency', Data?.FreightEntryType === ENTRY_TYPE_IMPORT ? Data?.LocalCurrency : Data?.Currency)
            if (Data?.LocalCurrency !== reactLocalStorage?.getObject("baseCurrency")) {
              this.setState({ hidePlantCurrency: false })
            } else {
              this.setState({ hidePlantCurrency: true })
            }
            this.setState({
              isEditFlag: true,
              // isLoader: false,
              costingTypeId: Data.CostingTypeId,
              IsLoadingUnloadingApplicable: Data.IsLoadingUnloadingApplicable,
              TransportMode:
                modeObj && modeObj !== undefined
                  ? { label: modeObj.Text, value: modeObj.Value }
                  : [],
              vendorName: Data.VendorName !== undefined ? { label: Data.VendorName, value: Data.VendorId } : [],
              client: Data.CustomerName !== undefined ? { label: Data.CustomerName, value: Data.CustomerId } : [],
              sourceLocation: Data.SourceCityName !== undefined ? { label: Data.SourceCityName, value: Data.SourceCityId } : [],
              destinationLocation: Data.DestinationCityName !== undefined ? { label: Data.DestinationCityName, value: Data.DestinationCityId } : [],
              gridTable: GridArray,
              Plant: { label: Data.PlantName, value: Data.PlantId },
              effectiveDate: DayTime(Data?.EffectiveDate).isValid() ? new Date(Data?.EffectiveDate) : '',
              ExchangeSource: Data?.ExchangeRateSourceName !== undefined ? { label: Data?.ExchangeRateSourceName, value: Data?.ExchangeRateSourceName } : [],
              plantCurrency: Data?.FreightEntryType === ENTRY_TYPE_IMPORT ? Data?.LocalCurrencyExchangeRate : Data?.ExchangeRate,
              plantExchangeRateId: Data?.FreightEntryType === ENTRY_TYPE_IMPORT ? Data?.LocalExchangeRateId : Data?.ExchangeRateId,
              settlementCurrency: Data?.ExchangeRate,
              settlementExchangeRateId: Data?.ExchangeRateId,
              plantCurrencyID: Data?.FreightEntryType === ENTRY_TYPE_IMPORT ? Data?.LocalCurrencyId : Data?.CurrencyId,
              isImport: Data?.FreightEntryType === ENTRY_TYPE_IMPORT ? true : false,
              currency: Data?.Currency ? { label: Data?.Currency, value: Data?.CurrencyId } : []
            }, () => this.setState({ isLoader: false }));
          }, 200);
        }
      });
    } else {
      this.setState({
        isLoader: false,
      })
      this.props.getFreightData("", (res) => { });
    }
  };
  /**
   * @method renderListing
   * @description Used to show type of listing
   */
  renderListing = (label) => {
    const { cityList, clientSelectList, freightModeSelectList, freightFullTruckCapacitySelectList, freightRateCriteriaSelectList, plantSelectList, exchangeRateSourceList, currencySelectList } = this.props;
    const temp = [];
    if (label === "SourceLocation") {
      cityList &&
        cityList.map((item) => {
          if (item?.Value === "0") return false;
          temp.push({ label: item?.Text, value: item?.Value });
          return null
        });
      return temp;
    }
    if (label === "DestinationLocation") {
      cityList &&
        cityList.map((item) => {
          if (item?.Value === "0") return false;
          temp.push({ label: item?.Text, value: item?.Value });
          return null
        });
      return temp;
    }
    if (label === "FREIGHT_MODE") {
      freightModeSelectList &&
        freightModeSelectList.map((item) => {
          if (item?.Value === "0") return false;
          temp.push({ label: item?.Text, value: item?.Value });
          return null
        });
      return temp;
    }
    if (label === "FULL_TRUCK_CAPACITY") {
      freightFullTruckCapacitySelectList &&
        freightFullTruckCapacitySelectList.map((item) => {
          if (item?.Value === "0") return false;
          temp.push({ label: item?.Text, value: item?.Value });
          return null
        });
      return temp;
    }
    if (label === "FREIGHT_RATE_CRITERIA") {
      freightRateCriteriaSelectList &&
        freightRateCriteriaSelectList.map((item) => {
          if (item?.Value === "0") return false;
          temp.push({ label: item?.Text, value: item?.Value });
          return null
        });
      return temp;
    }
    if (label === 'ClientList') {
      clientSelectList && clientSelectList.map(item => {
        if (item?.Value === '0') return false;
        temp.push({ label: item?.Text, value: item?.Value })
        return null;
      });
      return temp;
    }
    if (label === 'Plant') {
      plantSelectList && plantSelectList.map((item) => {
        if (item?.PlantId === '0') return false
        temp.push({ label: item?.PlantNameCode, value: item?.PlantId })
        return null
      })
      return temp
    }
    if (label === 'Load') {
      FREIGHT_LOAD_OPTIONS && FREIGHT_LOAD_OPTIONS.map((item) => {
        temp.push({ label: item?.label, value: item?.value })
        return null
      })
      return temp
    }
    if (label === 'ExchangeSource') {
      exchangeRateSourceList && exchangeRateSourceList.map((item) => {
        if (item.Value === '--Exchange Rate Source Name--') return false
        temp.push({ label: item.Text, value: item.Value })
        return null
      })
      return temp
    }
    if (label === 'currency') {
      currencySelectList && currencySelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
  };
  /**
   * @method handleVendorName
   * @description called
   */
  handleVendorName = (newValue, actionMeta) => {
    if (newValue && newValue !== "") {
      this.setState({ vendorName: newValue, isVendorNameNotSelected: false }, () => {
        this.callExchangeRateAPI()
      });
    } else {
      this.setState({ vendorName: [] });
    }
  };
  vendorToggler = () => {
    this.setState({ isOpenVendor: true });
  };
  async closeVendorDrawer(e = '', formData = {}, type) {
    if (type === 'submit') {
      this.setState({ isOpenVendor: false })
      const res = await getVendorNameByVendorSelectList(VBC_VENDOR_TYPE, this.state.vendorName)
      let vendorDataAPI = res?.data?.SelectList
      reactLocalStorage?.setObject('vendorData', vendorDataAPI)
      if (Object.keys(formData).length > 0) {
        this.setState({ vendorName: { label: `${formData.VendorName} (${formData.VendorCode})`, value: formData.VendorId }, })
      }
    }
    else {
      this.setState({ isOpenVendor: false })
    }
  }
  /**
   * @method handleSourceCity
   * @description called
   */
  handleSourceCity = (newValue, actionMeta) => {
    if (newValue && newValue !== "") {
      this.setState({ sourceLocation: newValue });
    } else {
      this.setState({ sourceLocation: [] });
    }
  };
  /**
   * @method handleDestinationCity
   * @description called
   */
  handleDestinationCity = (newValue, actionMeta) => {
    if (newValue && newValue !== "") {
      this.setState({ destinationLocation: newValue });
    } else {
      this.setState({ destinationLocation: [] });
    }
  };
  /**
   * @method onPressLoadUnload
   * @description USED FOR LOAD UNLOAD CHECKED
   */
  onPressLoadUnload = () => {
    this.setState({
      IsLoadingUnloadingApplicable: !this.state.IsLoadingUnloadingApplicable,
    });
  };
  /**
   * @method handleCapacity
   * @description called
   */
  handleCapacity = (newValue, actionMeta) => {
    if (newValue && newValue !== "") {
      this.setState({ FullTruckCapacity: newValue });
    } else {
      this.setState({ FullTruckCapacity: [] });
    }
    this.setState({ HandleChanged: false })
  };

  /**
   * @method criteriaHandler
   * @description called
   */
  criteriaHandler = (newValue, actionMeta) => {
    if (newValue && newValue !== "") {
      this.setState({ RateCriteria: newValue });
    } else {
      this.setState({ RateCriteria: [] });
    }
    this.setState({ HandleChanged: false })
  };

  rateChange = (newValue) => {
    this.handleCalculation(newValue?.target?.value)
    const { errorObj } = this.state
    let obj = { ...errorObj }
    if (decimalNumberLimit6(newValue?.target?.value) !== undefined || checkWhiteSpaces(newValue?.target?.value) !== undefined || number(newValue?.target?.value) !== undefined) {
      obj.rate = true;
    } else {
      obj.rate = false;
    }
    this.setState({ errorObj: obj });

  }

  /**
   * @method handleChange
   * @description Handle Effective Date
   */
  handleEffectiveDateChange = (date) => {
    this.setState({ effectiveDate: date, showEffectiveDateError: false }, () => {
      this.callExchangeRateAPI()
    });
  };

  checkValidation = () => {
    const { FullTruckCapacity, RateCriteria, Load } = this.state;
    const { fieldsObj } = this.props;

    let count = 0;
    let errorObj = { ...this.state.errorObj };

    if (Load?.value === FullTruckLoad && FullTruckCapacity.length === 0) {
      errorObj.capacity = true;
      count++;
    }

    if (RateCriteria.length === 0) {
      errorObj.criteria = true;
      count++;
    }

    if (fieldsObj === undefined || Number(fieldsObj) === 0) {
      errorObj.rate = true;
      count++;
    }

    if (Load.length === 0) {
      errorObj.load = true;
      count++;
    }

    if (count > 0) {
      this.setState({ errorObj });
    }
    if (count > 0) return true;
    return false;
  }

  gridHandler = () => {
    const {
      FullTruckCapacity,
      RateCriteria,
      gridTable,
      Load
    } = this.state;
    const { fieldsObj } = this.props;

    if (this.checkValidation()) {
      return false
    }

    // CONDITION TO CHECK DUPLICATE ENTRY IN GRID
    const isExist = gridTable.findIndex(
      (el) =>
        (el.Capacity ? el.Capacity : undefined) === (FullTruckCapacity.value ? FullTruckCapacity.value : undefined) &&
        el.RateCriteria === RateCriteria.value &&
        el.EFreightLoadType === Load?.value
    );

    if (isExist !== -1) {
      Toaster.warning("This freight entry already exists.");
      return false;
    }

    const tempArray = [
      ...gridTable,
      {
        FullTruckLoadId: "",
        Capacity: FullTruckCapacity?.label,
        RateCriteria: RateCriteria?.label,
        Rate: this.state.isImport /* || reactLocalStorage?.getObject("baseCurrency") !== this.props?.fieldsObj?.plantCurrency)  */ ? fieldsObj?.Rate : fieldsObj?.RateLocalConversion,
        RateLocalConversion: fieldsObj?.RateLocalConversion,
        RateConversion: (this.state.isImport || reactLocalStorage?.getObject("baseCurrency") !== this.props?.fieldsObj?.plantCurrency) ? fieldsObj?.RateConversion : fieldsObj?.RateLocalConversion,
        Load: Load,
        EFreightLoadType: Load?.value,
        IsFreightAssociated: false
      }
    ];

    this.setState(
      {
        gridTable: tempArray,
        FullTruckCapacity: [],
        RateCriteria: [],
        Load: [],
        AddUpdate: false,

        // errorObj: { capacity: false, criteria: false, rate: false, load: false }
      },
      () => () => {

      }
    );
    // this.props.dispatch(clearFields('AddFreight', false, false, 'RateConversion', 'RateLocalConversion', 'Rate'));
    this.props.change("RateConversion", '')
    this.props.change("RateLocalConversion", '')
    this.props.change("Rate", '')
  };

  /**
   * @method updateGrid
   * @description Used to handle update grid
   */
  updateGrid = () => {
    const { FullTruckCapacity, RateCriteria, gridTable, gridEditIndex, Load } = this.state;
    const { fieldsObj } = this.props;

    //CONDITION TO SKIP DUPLICATE ENTRY IN GRID
    let skipEditedItem = gridTable.filter((el, i) => {
      if (i === gridEditIndex) return false;
      return true;
    });
    if (fieldsObj === undefined || Number(fieldsObj) === 0) {
      this.setState({ errorObj: { rate: true } })
      return false
    }

    if (this.checkValidation()) {
      return false
    }

    //CONDITION TO CHECK DUPLICATE ENTRY EXCEPT EDITED RECORD
    const isExist = skipEditedItem.findIndex(
      (el) =>
        el.Capacity === FullTruckCapacity.value &&
        el.RateCriteria === RateCriteria.value &&
        el.EFreightLoadType === Load?.value
    );
    if (isExist !== -1) {
      Toaster.warning("This freight entry already exists.");
      return false;
    }
    let tempArray = [];
    let tempData = gridTable[gridEditIndex];

    tempData = {
      ...tempData,
      Capacity: FullTruckCapacity?.label,
      RateCriteria: RateCriteria?.label,
      Rate: this.state.isImport /* || reactLocalStorage?.getObject("baseCurrency") !== this.props?.fieldsObj?.plantCurrency)  */ ? fieldsObj?.Rate : fieldsObj?.RateLocalConversion,
      RateLocalConversion: fieldsObj?.RateLocalConversion,
      RateConversion: (this.state.isImport || reactLocalStorage?.getObject("baseCurrency") !== this.props?.fieldsObj?.plantCurrency) ? fieldsObj?.RateConversion : fieldsObj?.RateLocalConversion,
      Load: Load,
      EFreightLoadType: Load?.value,
    };
    tempArray = Object.assign([...gridTable], { [gridEditIndex]: tempData });
    this.setState({
      gridTable: tempArray,
      FullTruckCapacity: [],
      RateCriteria: [],
      gridEditIndex: "",
      isEditIndex: false,
      Load: []
    }, () => this.props.change("RateConversion", ''),
      this.props.change("RateLocalConversion", ''),
      this.props.change("Rate", '')

    );

    this.setState({ AddUpdate: false, errorObj: { rate: false } })
  };
  /**
   * @method resetGridData
   * @description Used to handle resetGridData
   */
  resetGridData = () => {
    this.setState(
      {
        FullTruckCapacity: [],
        RateCriteria: [],
        gridEditIndex: "",
        isEditIndex: false,
        Load: [],
        errorObj: {
          capacity: false,
          criteria: false,
          rate: false,
          load: false
        }
      },
    );
    this.props.change("RateConversion", '')
    this.props.change("RateLocalConversion", '')
    this.props.change("Rate", '')
  };
  /**
   * @method editGridItemDetails
   * @description used to Edit grid data
   */
  editGridItemDetails = (index) => {
    const { gridTable } = this.state;
    const tempData = gridTable[index];
    this.setState(
      {
        gridEditIndex: index,
        isEditIndex: true,
        FullTruckCapacity: {
          label: tempData.Capacity,
          value: tempData.Capacity,
        },
        RateCriteria: {
          label: tempData.RateCriteria,
          value: tempData.RateCriteria,
        },
        Load: tempData?.Load
      },
      () => this.props.change("RateConversion", tempData.RateConversion),
      this.props.change("RateLocalConversion", tempData.RateLocalConversion),
      this.props.change("Rate", tempData.Rate),
    );

  };
  /**
   * @method deleteGridItem
   * @description DELETE GRID ITEM
   */
  deleteGridItem = (index) => {
    const { gridTable } = this.state;
    let tempData = gridTable.filter((item, i) => {
      if (i === index) return false;
      return true;
    });
    this.resetGridData()
    this.setState({ gridTable: tempData });
    this.setState({ DeleteChanged: false });
  };
  /**
   * @method cancel
   * @description used to Reset form
   */
  cancel = (type) => {
    const { reset } = this.props;
    reset();
    this.setState({
      IsVendor: false,
      isOpenVendor: false,
      vendorName: [],
      sourceLocation: [],
      destinationLocation: [],
    });
    this.props.hideForm(type);
  };
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
    const { TransportMode, vendorName, IsLoadingUnloadingApplicable, sourceLocation, destinationLocation, client,
      FreightID, gridTable, isEditFlag, DataToChange, HandleChanged, AddUpdate, DeleteChanged, costingTypeId, isImport, plantCurrency, settlementCurrency, plantExchangeRateId, ExchangeSource } = this.state;

    if (this.state.effectiveDate === '' || !this.state.effectiveDate) {
      this.setState({ showEffectiveDateError: true })
      return false
    }
    if (checkForNull(this.state?.gridTable?.length) === 0) {
      Toaster.warning("Please add at least one data in Load Section.")
      return false
    }
    if (costingTypeId === VBCTypeId && vendorName.length <= 0) {
      this.setState({ isVendorNameNotSelected: true, setDisable: false })      // IF VENDOR NAME IS NOT SELECTED THEN WE WILL SHOW THE ERROR MESSAGE MANUALLY AND SAVE BUTTON WILL NOT BE DISABLED
      return false
    }
    this.setState({ isVendorNameNotSelected: false })

    const userDetail = userDetails();
    if (isEditFlag) {
      if (
        DataToChange.LoadingUnloadingCharges === values.LoadingUnloadingCharges &&
        DataToChange.PartTruckLoadRatePerCubicFeet === values.PartTruckLoadRatePerCubicFeet &&
        DataToChange.PartTruckLoadRatePerKilogram === values.PartTruckLoadRatePerKilogram
        &&
        (AddUpdate && HandleChanged) &&
        DeleteChanged
      ) {

        this.cancel('cancel')
        return false
      }
      this.setState({ setDisable: true })
      let requestData = {
        FreightId: FreightID,
        IsLoadingUnloadingApplicable: IsLoadingUnloadingApplicable,
        LoadingUnloadingCharges: values.LoadingUnloadingCharges,
        PartTruckLoadRatePerKilogram: values.PartTruckLoadRatePerKilogram,
        PartTruckLoadRatePerCubicFeet: values.PartTruckLoadRatePerCubicFeet,
        FullTruckLoadDetails: gridTable,
        LoggedInUserId: loggedInUserId(),
        PlantId: this.state.Plant?.value,

        CostingTypeId: costingTypeId,
        Mode: "Road",
        VendorId: costingTypeId === VBCTypeId ? vendorName.value : userDetail.ZBCSupplierInfo.VendorId,
        CustomerId: costingTypeId === CBCTypeId ? client.value : '',
        EffectiveDate: this.state.effectiveDate,
        FreightEntryType: isImport ? ENTRY_TYPE_IMPORT : ENTRY_TYPE_DOMESTIC,
        ExchangeRateSourceName: this.state.ExchangeSource?.label || null,
        LocalCurrencyId: isImport ? this.state?.plantCurrencyID : null,
        LocalCurrency: isImport ? this.props?.fieldsObj?.plantCurrency : null,
        ExchangeRate: isImport ? this.state?.settlementCurrency : this.state?.plantCurrency,
        LocalCurrencyExchangeRate: isImport ? this.state?.plantCurrency : null,
        CurrencyId: isImport ? this.state.currency?.value : this.state?.plantCurrencyID,
        Currency: isImport ? this.state?.currency?.label : this.props.fieldsObj?.plantCurrency,
        ExchangeRateId: isImport ? this.state.settlementExchangeRateId : this.state?.plantExchangeRateId,
        LocalExchangeRateId: isImport ? this.state?.plantExchangeRateId : null,
      };


      this.props.updateFright(requestData, (res) => {
        this.setState({ setDisable: false })
        if (res?.data?.Result) {
          Toaster.success(MESSAGES.UPDATE_FREIGHT_SUCCESSFULLY);
          this.cancel('submit');
        }
      });
      this.setState({ HandleChanged: true, AddUpdate: true, DeleteChanged: true })
    } else {
      this.setState({ setDisable: true })
      const formData = {
        CostingTypeId: costingTypeId,
        Mode: "Road",
        VendorId: costingTypeId === VBCTypeId ? vendorName.value : userDetail.ZBCSupplierInfo.VendorId,
        SourceCityId: sourceLocation.value,
        DestinationCityId: destinationLocation.value,
        IsLoadingUnloadingApplicable: IsLoadingUnloadingApplicable,
        LoadingUnloadingCharges: values.LoadingUnloadingCharges,
        PartTruckLoadRatePerKilogram: values.PartTruckLoadRatePerKilogram,
        PartTruckLoadRatePerCubicFeet: values.PartTruckLoadRatePerCubicFeet,
        FullTruckLoadDetails: gridTable,
        LoggedInUserId: loggedInUserId(),
        CustomerId: costingTypeId === CBCTypeId ? client.value : '',
        EffectiveDate: DayTime(this.state.effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
        PlantId: this.state.Plant?.value,
        FreightEntryType: isImport ? ENTRY_TYPE_IMPORT : ENTRY_TYPE_DOMESTIC,
        ExchangeRateSourceName: this.state.ExchangeSource?.label || null,
        LocalCurrencyId: isImport ? this.state?.plantCurrencyID : null,
        LocalCurrency: isImport ? this.props?.fieldsObj?.plantCurrency : null,
        ExchangeRate: isImport ? this.state?.settlementCurrency : this.state?.plantCurrency,
        LocalCurrencyExchangeRate: isImport ? this.state?.plantCurrency : null,
        CurrencyId: isImport ? this.state.currency?.value : this.state?.plantCurrencyID,
        Currency: isImport ? this.state?.currency?.label : this.props.fieldsObj?.plantCurrency,
        ExchangeRateId: isImport ? this.state.settlementExchangeRateId : this.state?.plantExchangeRateId,
        LocalExchangeRateId: isImport ? this.state?.plantExchangeRateId : null,
      };
      this.props.createFreight(formData, (res) => {
        this.setState({ setDisable: false })
        if (res?.data?.Result) {
          Toaster.success(MESSAGES.ADD_FREIGHT_SUCCESSFULLY);
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

  freightRateTitle = () => {
    const rateLabel = this.state.isImport ? `Rate (${this.state.currency?.label ?? 'Currency'})` : `Rate (${this.props.fieldsObj?.plantCurrency ?? 'Plant Currency'})`
    return {
      tooltipTextPlantCurrency: `${rateLabel} * Plant Currency Rate (${this.state?.plantCurrency ?? ''})`,
      toolTipTextNetCostBaseCurrency: `${rateLabel} * Currency Rate (${this.state?.settlementCurrency ?? ''})`,
    };
  };
  getTooltipTextForCurrency = () => {
    const { fieldsObj } = this.props
    const { settlementCurrency, plantCurrency, currency } = this.state
    const currencyLabel = currency?.label ?? 'Currency';
    const plantCurrencyLabel = fieldsObj?.plantCurrency ?? 'Plant Currency';
    const baseCurrency = reactLocalStorage.getObject("baseCurrency");

    // Check the exchange rates or provide a default placeholder if undefined
    const plantCurrencyRate = plantCurrency ?? '0';
    const settlementCurrencyRate = settlementCurrency ?? '0';

    // Generate tooltip text based on the condition
    return <>
      {!this.state?.hidePlantCurrency
        ? `Exchange Rate: 1 ${currencyLabel} = ${plantCurrencyRate} ${plantCurrencyLabel}, `
        : ''}<p>Exchange Rate: 1 {currencyLabel} = {settlementCurrencyRate} {baseCurrency}</p>
    </>;
  };

  /**
   * @method render
   * @description Renders the component
   */
  render() {
    const { handleSubmit, initialConfiguration, t } = this.props;
    const { hidePlantCurrency } = this.state;
    const VendorLabel = LabelsClass(t, 'MasterLabels').vendorLabel;
    const { isOpenVendor, isEditFlag, isViewMode, setDisable, costingTypeId, isEditMode } = this.state;
    const filterList = async (inputValue) => {
      const { vendorFilterList } = this.state
      if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
        inputValue = inputValue.trim();
      }
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

    return (
      <>
        {this.state.isLoader && <LoaderCustom />}
        <div className="container-fluid">
          <div>
            <div className="login-container signup-form">
              <div className="row">
                <div className="col-md-12">
                  <div className="shadow-lgg login-formg">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-heading mb-0">
                          <h1>
                            {isViewMode ? "View" : isEditFlag ? "Update" : "Add"} Freight
                          </h1>
                        </div>
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
                            {(reactLocalStorage.getObject('CostingTypePermission').zbc) && <Label className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
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
                            {(reactLocalStorage.getObject('CostingTypePermission').vbc) && <Label className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
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
                            {reactLocalStorage.getObject('CostingTypePermission').cbc && <Label className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3 pt-0 radio-box"} check>
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
                        </Row>
                        <Row>
                          <Col md="12">
                            <div className="left-border">{"Freight:"}</div>
                          </Col>
                          {/* <Col md="3">
                            <div className="d-flex justify-space-between align-items-center inputwith-icon">
                              <div className="fullinput-icon">
                                <Field
                                  name="Mode"
                                  type="text"
                                  label="Mode"
                                  component={searchableSelect}
                                  placeholder={isEditFlag ? '-' : "Select"}
                                  options={this.renderListing("FREIGHT_MODE")}
                                  //onKeyUp={(e) => this.changeItemDesc(e)}
                                  validate={
                                    this.state.TransportMode == null ||
                                      this.state.TransportMode.length === 0
                                      ? [required]
                                      : []
                                  }
                                  required={true}
                                  handleChangeDescription={
                                    this.handleTransportMoodChange
                                  }
                                  valueDescription={this.state.TransportMode}
                                  disabled={isEditFlag ? true : false}
                                />
                              </div>
                            </div>
                          </Col> */}
                          {costingTypeId === VBCTypeId && (
                            <Col md="3">
                              <label>{VendorLabel} (Code)<span className="asterisk-required">*</span></label>
                              <div className="d-flex justify-space-between align-items-center async-select">
                                <div className="fullinput-icon p-relative">
                                  {this.state.inputLoader && <LoaderCustom customClass={`input-loader`} />}
                                  <AsyncSelect
                                    name="vendorName"
                                    ref={this.myRef}
                                    key={this.state.updateAsyncDropdown}
                                    loadOptions={filterList}
                                    onChange={(e) => this.handleVendorName(e)}
                                    value={this.state.vendorName}
                                    noOptionsMessage={({ inputValue }) => inputValue.length < 3 ? MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN : "No results found"}
                                    isDisabled={(isEditFlag || this.state.gridTable.length > 0) ? true : false}
                                    onKeyDown={(onKeyDown) => {
                                      if (onKeyDown.keyCode === SPACEBAR && !onKeyDown.target.value) onKeyDown.preventDefault();
                                    }}
                                    onFocus={() => onFocus(this)}
                                  />
                                </div>
                                {!isEditFlag && (
                                  <div
                                    onClick={this.vendorToggler}
                                    className={"plus-icon-square  right"}
                                  ></div>
                                )}
                              </div>
                              {((this.state.showErrorOnFocus && this.state.vendorName.length === 0) || this.state.isVendorNameNotSelected) && <div className='text-help mt-1'>This field is required.</div>}
                            </Col>
                          )}
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
                                disabled={(isEditFlag || this.state.gridTable.length > 0) ? true : false}
                              />
                            </Col>
                          )}
                          <Col md="3">
                            <Field
                              name="Plant"
                              type="text"
                              label={"Plant (Code)"}
                              component={searchableSelect}
                              placeholder={isEditFlag ? '-' : "Select"}
                              options={this.renderListing("Plant")}
                              //onKeyUp={(e) => this.changeItemDesc(e)}
                              validate={
                                this.state.Plant == null ||
                                  this.state.Plant.length === 0
                                  ? [required]
                                  : []
                              }
                              required={true}
                              handleChangeDescription={this.handlePlant}
                              valueDescription={this.state.Plant}
                              disabled={(isEditFlag || this.state.gridTable.length > 0) ? true : false}
                            />
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
                                disabled={(isEditFlag || this.state.gridTable.length > 0) ? true : false}
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
                            {this.state?.showPlantWarning && <WarningMessage dClass="mt-0" message={`${this.props?.fieldsObj?.plantCurrency} rate is not present in the Exchange Master`} />}

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

                          <Col md="3">
                            <div className="form-group">
                              <label>Effective Date<span className="asterisk-required">*</span></label>
                              <div className="inputbox date-section">
                                <DatePicker
                                  name="EffectiveDate"
                                  selected={DayTime(this.state.effectiveDate).isValid() ? this.state.effectiveDate : ""}
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
                                  disabled={isViewMode || isEditMode || this.state.gridTable.length > 0}
                                  minDate={getEffectiveDateMinDate()}

                                />
                                {this.state.showEffectiveDateError && <div className='text-help'>This field is required.</div>}
                              </div>
                            </div >
                          </Col >
                          {/* <Col md="3">
                            <Field
                              name="SourceLocation"
                              type="text"
                              label="Source City"
                              component={searchableSelect}
                              placeholder={isViewMode ? '-' : 'Select'}
                              options={this.renderListing("SourceLocation")}
                              //onKeyUp={(e) => this.changeItemDesc(e)}
                              validate={
                                this.state.sourceLocation == null ||
                                  this.state.sourceLocation.length === 0
                                  ? [required]
                                  : []
                              }
                              required={true}
                              handleChangeDescription={this.handleSourceCity}
                              valueDescription={this.state.sourceLocation}
                              disabled={isEditFlag ? true : false}
                            />
                          </Col> */}
                          {/* <Col md="3">
                            <Field
                              name="DestinationLocation"
                              type="text"
                              label="Destination City"
                              component={searchableSelect}
                              placeholder={isViewMode ? '-' : 'Select'}
                              options={this.renderListing("DestinationLocation")}
                              //onKeyUp={(e) => this.changeItemDesc(e)}
                              validate={
                                this.state.destinationLocation == null ||
                                  this.state.destinationLocation.length === 0
                                  ? [required]
                                  : []
                              }
                              required={true}
                              handleChangeDescription={this.handleDestinationCity}
                              valueDescription={this.state.destinationLocation}
                              disabled={isEditFlag ? true : false}
                            />
                          </Col> */}
                        </Row>
                        {/* <Row className="mb27">
                          <Col md="12">
                            <label
                              className={`custom-checkbox w-auto ${isViewMode ? "disabled" : ""}`}
                              onChange={this.onPressLoadUnload}
                            >
                              Loading/Unloading Charges
                              <input
                                type="checkbox"
                                checked={this.state.IsLoadingUnloadingApplicable}
                                disabled={isViewMode}
                              />
                              <span
                                className=" before-box"
                                checked={this.state.IsLoadingUnloadingApplicable}
                                onChange={this.onPressLoadUnload}
                              />
                            </label>
                          </Col>
                          <Col md="3" className="hide-label-inside">
                            <Field
                              label={``}
                              name={"LoadingUnloadingCharges"}
                              type="text"
                              placeholder={isViewMode ? '-' : 'Enter'}
                              validate={[positiveAndDecimalNumber, maxLength10, decimalLengthFour, number]}
                              component={renderTextInputField}
                              disabled={isViewMode}
                              className=""
                              customClassName=" withBorder mn-height-auto"
                            />
                          </Col>
                        </Row> */}
                        <Row>
                          {/* <Col md="12">
                            <div className="left-border">
                              {"Part Truck Load:"}
                            </div>
                          </Col>
                          <Col md="3">
                            <Field
                              label={`Rate (${reactLocalStorage.getObject("baseCurrency")}/Kg)`}
                              name={"PartTruckLoadRatePerKilogram"}
                              type="text"
                              placeholder={isViewMode ? '-' : 'Enter'}
                              validate={[positiveAndDecimalNumber, maxLength10, decimalLengthFour, number]}
                              component={renderTextInputField}
                              disabled={isViewMode}
                              className=" "
                              customClassName=" withBorder"
                            />
                          </Col>
                          <Col md="3">
                            <Field
                              label={`Rate (${reactLocalStorage.getObject("baseCurrency")}/Cubic Feet)`}
                              name={"PartTruckLoadRatePerCubicFeet"}
                              type="text"
                              placeholder={isViewMode ? '-' : 'Enter'}
                              validate={[positiveAndDecimalNumber, maxLength10, decimalLengthFour, number]}
                              component={renderTextInputField}
                              disabled={isViewMode}
                              className=" "
                              customClassName=" withBorder"
                            />
                          </Col> */}


                        </Row>
                        <Row className="truck-load-form-container align-items-center pb-2">
                          <Col md="12">
                            <div className="left-border">
                              {"Load:"}
                            </div>
                          </Col>
                          <Col md="3">
                            <div className="d-flex justify-space-between align-items-center inputwith-icon">
                              <div className="fullinput-icon">
                                <Field
                                  name="Load"
                                  type="text"
                                  label="Load"
                                  component={searchableSelect}
                                  placeholder={isViewMode ? '-' : 'Select'}
                                  options={this.renderListing("Load")}
                                  handleChangeDescription={this.handleLoad}
                                  valueDescription={this.state?.Load}
                                  disabled={isViewMode}
                                  required={true}
                                />
                                {this.state?.errorObj?.load && <div className='text-help p-absolute bottom-7'>This field is required.</div>}
                              </div>
                            </div>
                          </Col>
                          {this.state.Load?.value === FullTruckLoad && <Col md="3">
                            <div className="d-flex justify-space-between align-items-center inputwith-icon">
                              <div className="fullinput-icon">
                                <Field
                                  name="Capacity"
                                  type="text"
                                  label="Capacity"
                                  component={searchableSelect}
                                  placeholder={isViewMode ? '-' : 'Select'}
                                  options={this.renderListing(
                                    "FULL_TRUCK_CAPACITY"
                                  )}

                                  handleChangeDescription={this.handleCapacity}
                                  valueDescription={this.state.FullTruckCapacity}
                                  disabled={isViewMode}
                                  required={true}
                                />
                                {this.state.errorObj.capacity && this.state.FullTruckCapacity.length === 0 && <div className='text-help p-absolute bottom-7'>This field is required.</div>}
                              </div>
                            </div>
                          </Col>}
                          <Col md="3" className="inputwith-icon">
                            <Field
                              name="RateCriteria"
                              type="text"
                              label="Criteria"
                              component={searchableSelect}
                              placeholder={isViewMode ? '-' : 'Select'}
                              options={this.renderListing(
                                "FREIGHT_RATE_CRITERIA"
                              )}
                              disabled={isViewMode}
                              handleChangeDescription={this.criteriaHandler}
                              valueDescription={this.state.RateCriteria}
                              required={true}
                            />
                            {this.state.errorObj?.criteria && this.state?.RateCriteria.length === 0 && <div className='text-help p-absolute bottom-7'>This field is required.</div>}
                          </Col>
                          {this.state.isImport && <Col md="3">
                            <Field
                              label={`Rate (${this.state.currency?.label ?? 'Currency'})`}
                              name={"Rate"}
                              type="text"
                              placeholder={isViewMode ? '-' : 'Enter'}
                              validate={[decimalNumberLimit6, maxLength10, number]}
                              component={renderTextInputField}
                              onChange={this.rateChange}
                              required={true}
                              disabled={isViewMode}
                              className=" "
                              customClassName="withBorder"
                            />
                            {this.state.errorObj.rate && (this.props.fieldsObj === undefined || Number(this.props.fieldsObj) === 0) && <div className='text-help p-absolute'>This field is required.</div>}
                          </Col>}
                          <Col md="3">
                            {this.state.isImport && <TooltipCustom disabledIcon={true} id="rate-local" tooltipText={hidePlantCurrency ? this.freightRateTitle()?.toolTipTextNetCostBaseCurrency : this.freightRateTitle()?.tooltipTextPlantCurrency} />}
                            <Field
                              label={`Rate (${this.props.fieldsObj?.plantCurrency ?? 'Currency'})`}
                              name={"RateLocalConversion"}
                              type="text"
                              id="rate-local"
                              placeholder={isViewMode || this.state.isImport ? '-' : 'Enter'}
                              validate={[decimalNumberLimit6, maxLength10, number]}
                              component={renderTextInputField}
                              onChange={this.rateChange}
                              required={true}
                              disabled={isViewMode || this.state.isImport}
                              className=" "
                              customClassName="withBorder"
                            />
                            {this.state.errorObj.rate && (this.props.fieldsObj === undefined || Number(this.props.fieldsObj) === 0) && <div className='text-help p-absolute'>This field is required.</div>}
                          </Col>
                          {!hidePlantCurrency && <Col md="3">
                            <TooltipCustom disabledIcon={true} id="freight-rate" tooltipText={this.state.isImport ? this.freightRateTitle()?.toolTipTextNetCostBaseCurrency : this.freightRateTitle()?.tooltipTextPlantCurrency} />
                            <Field
                              label={`Rate (${reactLocalStorage.getObject("baseCurrency")})`}
                              name={"RateConversion"}
                              type="text"
                              id="freight-rate"
                              placeholder={'-'}
                              validate={[]}
                              component={renderTextInputField}
                              onChange={() => { }}
                              required={false}
                              disabled={true}
                              className=" "
                              customClassName="withBorder"
                            />
                          </Col>}
                          <Col md="3" className="pb-2">

                            {this.state.isEditIndex ? (
                              <>
                                <button
                                  type="button"
                                  className={
                                    "btn btn-primary pull-left mr5 px-2 mb-2"
                                  }
                                  onClick={this.updateGrid}
                                >
                                  Update
                                </button>
                                <button
                                  type="button"
                                  className={"reset-btn pull-left mb-2 w-auto px-1"}

                                  onClick={this.resetGridData}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  disabled={isViewMode}
                                  className={"user-btn pull-left"}
                                  onClick={this.gridHandler}
                                >
                                  <div className={"plus"}></div>
                                  ADD
                                </button>
                                <button
                                  type="button"
                                  className={"reset-btn ml5 pull-left"}
                                  onClick={this.resetGridData}
                                  disabled={isViewMode}
                                >
                                  Reset
                                </button>
                              </>
                            )}
                          </Col>
                        </Row >
                        <Row>
                          <Col md="12">
                            <Table className="table border" size="sm">
                              <thead>
                                <tr>
                                  <th>{`Load`}</th>
                                  <th>{`Capacity`}</th>
                                  <th>{`Criteria`}</th>
                                  {this.state.isImport && <th>{`Rate (${this.state.currency?.label ?? 'Currency'})`}</th>}
                                  <th>{`Rate (${this.props.fieldsObj?.plantCurrency ?? 'Currency'})`}</th>
                                  {!this.state?.hidePlantCurrency && <th>{`Rate (${reactLocalStorage.getObject("baseCurrency")})`}</th>}
                                  <th>{`Action`}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {this.state.gridTable &&
                                  this.state.gridTable.map((item, index) => {
                                    return (
                                      <tr key={index}>
                                        <td>{item?.Load?.label ? item?.Load?.label : '-'}</td>
                                        <td>{item?.Capacity ? item?.Capacity : '-'}</td>
                                        <td>{item?.RateCriteria ? item?.RateCriteria : '-'}</td>
                                        {this.state.isImport && <td>{item?.Rate ? checkForDecimalAndNull(item?.Rate, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>}
                                        <td>{item?.RateLocalConversion ? checkForDecimalAndNull(item?.RateLocalConversion, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
                                        {!this.state?.hidePlantCurrency && <td>{item?.RateConversion ? checkForDecimalAndNull(item?.RateConversion, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>}
                                        <td>
                                          <button className="Edit mr-2" type={"button"} disabled={isViewMode || item?.IsFreightAssociated} onClick={() => this.editGridItemDetails(index)} />
                                          <button className="Delete" type={"button"} disabled={isViewMode || item?.IsFreightAssociated} onClick={() => this.deleteGridItem(index)} />
                                        </td>
                                      </tr>
                                    );
                                  })}
                              </tbody>
                              {this.state.gridTable.length === 0 && <tbody className="border">
                                <tr>
                                  <td colSpan={"10"}> <NoContentFound title={EMPTY_DATA} /></td>
                                </tr>
                              </tbody>}
                            </Table>
                          </Col>

                        </Row>
                      </div >
                      <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                        <div className="col-sm-12 text-right bluefooter-butn">
                          <button
                            type={"button"}
                            className="mr15 cancel-btn"
                            onClick={this.cancelHandler}
                            disabled={setDisable}
                          >
                            <div className={"cancel-icon"}></div>
                            {"Cancel"}
                          </button>
                          {!isViewMode && <button
                            type="submit"
                            disabled={isViewMode || setDisable}
                            className="user-btn mr5 save-btn"
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
          {
            this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.CANCEL_MASTER_ALERT}`} />
          }
          {isOpenVendor && (
            <AddVendorDrawer
              isOpen={isOpenVendor}
              closeDrawer={this.closeVendorDrawer = this.closeVendorDrawer.bind(this)}
              isEditFlag={false}
              ID={""}
              anchor={"right"}
            />
          )
          }
        </div>
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
  const fieldsObj = selector(state, "Rate", "RateLocalConversion", "Currency", "ExchangeSource", "plantCurrency", "RateConversion", 'vendorName');
  const { comman, freight, auth, client } = state;
  const { initialConfiguration } = auth;
  const { cityList, vendorWithVendorCodeSelectList, plantSelectList, exchangeRateSourceList, currencySelectList } = comman;
  const { clientSelectList } = client;
  const {
    freightData,
    freightModeSelectList,
    freightFullTruckCapacitySelectList,
    freightRateCriteriaSelectList,
  } = freight;
  let initialValues = {};
  if (freightData && freightData !== undefined) {
    initialValues = {
      PartTruckLoadRatePerKilogram: freightData.PartTruckLoadRatePerKilogram,
      PartTruckLoadRatePerCubicFeet: freightData.PartTruckLoadRatePerCubicFeet,
      LoadingUnloadingCharges: freightData.LoadingUnloadingCharges, clientSelectList
    };
  }
  return {
    cityList,
    vendorWithVendorCodeSelectList,
    freightModeSelectList,
    freightFullTruckCapacitySelectList,
    freightRateCriteriaSelectList,
    freightData,
    fieldsObj,
    initialValues,
    initialConfiguration,
    clientSelectList,
    plantSelectList,
    exchangeRateSourceList,
    currencySelectList
  };
}
/**
 * @method connect
 * @description connect with redux
 * @param {function} mapStateToProps
 * @param {function} mapDispatchToProps
 */
export default connect(mapStateToProps, {
  fetchSupplierCityDataAPI,
  createFreight,
  updateFright,
  getFreightData,
  getFreightModeSelectList,
  getFreigtFullTruckCapacitySelectList,
  getFreigtRateCriteriaSelectList,
  getCityByCountryAction,
  getAllCity,
  getClientSelectList,
  getPlantSelectListByType,
  getExchangeRateByCurrency,
  getPlantUnitAPI,
  getExchangeRateSource,
  getCurrencySelectList
})(
  reduxForm({
    form: "AddFreight",
    enableReinitialize: true,
    touchOnChange: true
  })(withTranslation(['FreightMaster', 'MasterLabels'])(AddFreight)),
)
