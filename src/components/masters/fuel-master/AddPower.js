import React, { Component, } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector, clearFields } from "redux-form";
import { Row, Col, Table, Label } from 'reactstrap';
import { required, checkForNull, getCodeBySplitting, checkForDecimalAndNull, positiveAndDecimalNumber, maxLength10, decimalLengthFour, decimalLengthThree, number, maxPercentValue, checkWhiteSpaces, percentageLimitValidation } from "../../../helper/validation";
import { searchableSelect, renderMultiSelectField, focusOnError, renderDatePicker, renderText, renderTextInputField, validateForm } from "../../layout/FormInputs";
import { getPowerTypeSelectList, getUOMSelectList, getPlantBySupplier, getAllCity, fetchStateDataAPI, getVendorNameByVendorSelectList, getExchangeRateSource, getCurrencySelectList, fetchCountryDataAPI, fetchCityDataAPI, getCityByCountryAction } from '../../../actions/Common';
import {
  getFuelByPlant, createPowerDetail, updatePowerDetail, getPlantListByAddress, createVendorPowerDetail, updateVendorPowerDetail, getDieselRateByStateAndUOM,
  getPowerDetailData, getVendorPowerDetailData,
  getPlantCurrencyByPlantIds,
} from '../actions/Fuel';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { CBCTypeId, EMPTY_GUID, ENTRY_TYPE_DOMESTIC, ENTRY_TYPE_IMPORT, GENERATOR_DIESEL, GUIDE_BUTTON_SHOW, searchCount, SPACEBAR, VBC_VENDOR_TYPE, VBCTypeId, ZBCTypeId, } from '../../../config/constants';
import { EMPTY_DATA } from '../../../config/constants'
import { getConfigurationKey, IsFetchExchangeRateVendorWiseForParts, loggedInUserId } from "../../../helper/auth";
import "react-datepicker/dist/react-datepicker.css";
import NoContentFound from '../../common/NoContentFound';
import AddVendorDrawer from '../supplier-master/AddVendorDrawer';
import DayTime from '../../common/DayTimeWrapper'
import { calculatePercentageValue, getExchangeRateParams, onFocus, showDataOnHover } from '../../../helper';
import { AcceptablePowerUOM } from '../../../config/masterData';
import LoaderCustom from '../../common/LoaderCustom';
import _, { debounce } from 'lodash';
import AsyncSelect from 'react-select/async';
import { reactLocalStorage } from 'reactjs-localstorage';
import { autoCompleteDropdown, getCostingTypeIdByCostingPermission, getEffectiveDateMaxDate, getEffectiveDateMinDate } from '../../common/CommonFunctions';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { getClientSelectList, } from '../actions/Client';
import TooltipCustom from '../../common/Tooltip';
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from './TourMessages';
import { withTranslation } from 'react-i18next';
import Button from '../../layout/Button';
import { subDays } from 'date-fns';
import { LabelsClass } from '../../../helper/core';
import { getExchangeRateByCurrency } from '../../costing/actions/Costing';
import { getPlantUnitAPI } from '../actions/Plant';
import Switch from 'react-switch'
import WarningMessage from '../../common/WarningMessage';

const selector = formValueSelector('AddPower');

class AddPower extends Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    this.initialState = {
      isEditFlag: false,
      isEditFlagForStateElectricity: false,
      PowerDetailID: '',
      IsVendor: false,
      temp: 0,
      StateName: [],
      isViewMode: this.props?.data?.isViewMode ? true : false,
      isVendorNameNotSelected: false,

      selectedPlants: [],
      effectiveDate: '',

      powerGridEditIndex: '',
      powerGrid: [],
      isEditIndex: false,

      vendorName: [],
      VendorCode: '',
      vendorLocation: [],
      isDetailEntry: false,

      isOpenVendor: false,

      source: [],
      UOM: [],
      isCostPerUnitConfigurable: false,
      checkPowerContribution: false,
      isAddedSEB: false,
      isEditSEBIndex: false,

      netContributionValue: 0,
      netContributionConvertedInLocalCurrency: 0,
      netContributionConvertedInBaseCurrency: 0,
      power: { minMonthlyCharge: '', AvgUnitConsumptionPerMonth: '', SEBCostPerUnit: '', TotalUnitCharges: '', SelfGeneratedCostPerUnit: '', },
      DropdownChanged: true,
      DataToChangeVendor: [],
      DataToChangeZ: [],
      ind: '',
      DeleteChanged: true,
      handleChange: true,
      AddChanged: true,
      setDisable: false,
      inputLoader: false,
      isImport: false,
      hidePlantCurrency: false,
      settlementCurrency: null,
      plantCurrency: null,
      ExchangeSource: [],
      currency: [],
      plantExchangeRateId: '',
      settlementExchangeRateId: '',
      plantCurrencyID: '',
      errorObj: {
        minDemand: false,
        demandCharge: false,
        avgUnit: false,
        maxDemand: false,
        statePowerCont: false,
        source: false,
        unitGenerated: false,
        selfPowerCont: false,
        unitGeneratedDiesel: false
      },
      showErrorOnFocus: false,
      showPopup: false,
      vendorFilterList: [],
      costingTypeId: ZBCTypeId,
      client: [],
      costPerUnitTooltipText: 'Please fill in the mandatory fields of State Electricity Board Power Changes section, as the calculation will be based on them.',
      segCostUnittooltipText: 'Please select the Source of Power, as the calculation will be based on them.',
      country: [],
      city: [],
      isDisabled: false,
      showPlantWarning: false

    }
    this.state = { ...this.initialState };

  }

  /**
   * @method componentDidMount
   * @description Called after rendering the component
   */
  componentDidMount() {
    this.setState({ costingTypeId: getCostingTypeIdByCostingPermission() })
    if (!this.state.isViewMode) {
      this.props.getExchangeRateSource((res) => { })
      this.props.getPowerTypeSelectList(() => { })
      this.props.getUOMSelectList(() => { })
    }
    if (!(this.props.data.isEditFlag || this.props.data.isViewFlag)) {
      this.props.fetchCountryDataAPI(() => { })
      this.props.fetchCityDataAPI(0, () => { })
      this.props.getPlantBySupplier('', () => { })
      this.props.getPowerDetailData('', () => { })
      this.props.getClientSelectList(() => { })
      this.props.fetchStateDataAPI(0, () => { })
    }
    this.getDetails();
    this.props.getCurrencySelectList(() => { })
  }
  callPlantApi = () => {
    const { city, StateName, country } = this.state;
    const isStateOfCountryAvailable = this.state?.country?.length === 0 || this.state?.country?.label === 'India';

    if (city.value) {
      this.props.getPlantListByAddress(city.value, isStateOfCountryAvailable ? StateName.value : null, country.value, () => { })
    }
  }
  componentDidUpdate(prevProps, prevState) {
    if (this.props.fieldsObj !== prevProps.fieldsObj) {
      this.SEBPowerCalculation()
      this.selfPowerCalculation()
      this.powerContributionCalculation()
      this.minMonthlyChargeCalculation()
    }
    if (prevState.netContributionValue !== this.state.netContributionValue) {
      this.handleCalculation(this.state?.netContributionValue)
    }
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
        const { costingHeadTypeId, vendorId, clientId } = getExchangeRateParams({ fromCurrency: fromCurrency, toCurrency: fieldsObj?.plantCurrency, defaultCostingTypeId: costingTypeId, vendorId: vendorName?.value, clientValue: client?.value,plantCurrency:this?.props?.fieldsObj?.plantCurrency});
        
        callAPI(fromCurrency, fieldsObj?.plantCurrency, costingHeadTypeId, vendorId, clientId).then(({ rate: rate1, exchangeRateId: exchangeRateId1, showPlantWarning: showPlantWarning1, showWarning: showWarning1, }) => {
          const { costingHeadTypeId, vendorId, clientId } = getExchangeRateParams({ fromCurrency: fromCurrency, toCurrency: reactLocalStorage.getObject("baseCurrency"), defaultCostingTypeId: costingTypeId, vendorId: vendorName?.value, clientValue: client?.value,plantCurrency:this?.props?.fieldsObj?.plantCurrency});
          callAPI(fieldsObj?.plantCurrency, reactLocalStorage.getObject("baseCurrency"), costingHeadTypeId, vendorId, clientId).then(({ rate: rate2, exchangeRateId: exchangeRateId2, showWarning: showWarning2, showPlantWarning: showPlantWarning2 }) => {
            this.setState({
              plantCurrency: rate1,
              settlementCurrency: rate2,
              plantExchangeRateId: exchangeRateId1,
              settlementExchangeRateId: exchangeRateId2,
              showPlantWarning: showPlantWarning1,
              showWarning: showWarning2

            }, () => {
              this.handleCalculation(fieldsObj?.NetPowerCostPerUnit)
            });
          });
        });
      } else if (this.props.fieldsObj?.plantCurrency !== reactLocalStorage?.getObject("baseCurrency")) {
        // Original single API call for non-import case
        const { costingHeadTypeId, vendorId, clientId } = getExchangeRateParams({ fromCurrency: fromCurrency, toCurrency: toCurrency, defaultCostingTypeId: costingTypeId, vendorId: vendorName?.value, clientValue: client?.value,plantCurrency:this?.props?.fieldsObj?.plantCurrency});
        callAPI(fromCurrency, toCurrency, costingHeadTypeId, vendorId, clientId).then(({ rate, exchangeRateId, showPlantWarning, showWarning }) => {
          this.setState({ plantCurrency: rate, plantExchangeRateId: exchangeRateId, showPlantWarning: showPlantWarning, showWarning: showWarning }, () => {
            this.handleCalculation(fieldsObj?.NetPowerCostPerUnitLocalConversion)
          });
        });
      }
    }

  }
  handleCalculation = (powerRate) => {

    const { fieldsObj } = this.props
    const { plantCurrency, settlementCurrency, isImport, netContributionValue, isDetailEntry } = this.state
    const rate = isDetailEntry ? netContributionValue : powerRate

    if (isImport) {
      const ratePlantCurrency = checkForNull(rate) * checkForNull(plantCurrency)
      this.props.change('NetPowerCostPerUnitLocalConversion', checkForDecimalAndNull(ratePlantCurrency, getConfigurationKey().NoOfDecimalForPrice))
      const rateBaseCurrency = checkForNull(rate) * checkForNull(settlementCurrency)
      this.props.change('NetPowerCostPerUnitConversion', checkForDecimalAndNull(rateBaseCurrency, getConfigurationKey().NoOfDecimalForPrice))
      this.setState({
        netContributionConvertedInBaseCurrency: checkForNull(rateBaseCurrency), netContributionConvertedInLocalCurrency: checkForNull(ratePlantCurrency)
      })
    } else {
      const ratebaseCurrency = checkForNull(rate) * checkForNull(plantCurrency)

      this.props.change('NetPowerCostPerUnitConversion', checkForDecimalAndNull(ratebaseCurrency, getConfigurationKey().NoOfDecimalForPrice))
      this.setState({
        netContributionConvertedInBaseCurrency: checkForNull(ratebaseCurrency), netContributionConvertedInLocalCurrency: checkForNull(netContributionValue)
      })

    }

  }
  /**
   * @method minMonthlyChargeCalculation
   * @description TO CALCULATE MIN MONTHLY CHARGE
  */
  minMonthlyChargeCalculation = () => {
    const { fieldsObj, initialConfiguration } = this.props;
    const { power } = this.state
    const MinDemandKWPerMonth = fieldsObj && fieldsObj.MinDemandKWPerMonth !== undefined ? checkForNull(fieldsObj.MinDemandKWPerMonth) : 0
    const DemandChargesPerKW = fieldsObj && fieldsObj.DemandChargesPerKW !== undefined ? checkForNull(fieldsObj.DemandChargesPerKW) : 0;
    const minMonthlyCharge = MinDemandKWPerMonth * DemandChargesPerKW
    power.minMonthlyCharge = minMonthlyCharge
    this.setState({
      power: {
        ...power, minMonthlyCharge: power.minMonthlyCharge
      }
    })
    this.props.change('MinMonthlyCharge', minMonthlyCharge === 0 ? '' : checkForDecimalAndNull(minMonthlyCharge, initialConfiguration?.NoOfDecimalForPrice))
  }

  /**
   * @method SEBPowerCalculation
   * @description USED TO CALCULATE SEB POWER CALCULATION
   */
  SEBPowerCalculation = () => {
    const { isCostPerUnitConfigurable, power, } = this.state;
    const { fieldsObj, initialConfiguration } = this.props;

    const MinDemandKWPerMonth = fieldsObj && fieldsObj.MinDemandKWPerMonth !== undefined ? checkForNull(fieldsObj.MinDemandKWPerMonth) : 0;
    const DemandChargesPerKW = fieldsObj && fieldsObj.DemandChargesPerKW !== undefined ? checkForNull(fieldsObj.DemandChargesPerKW) : 0;
    const AvgUnitConsumptionPerMonth = fieldsObj && fieldsObj.AvgUnitConsumptionPerMonth !== undefined ? checkForNull(fieldsObj.AvgUnitConsumptionPerMonth) : 0;
    const MaxDemandChargesKW = fieldsObj && fieldsObj.MaxDemandChargesKW !== undefined ? checkForNull(fieldsObj.MaxDemandChargesKW) : 0;

    const MeterRentAndOtherChargesPerAnnum = fieldsObj && fieldsObj.MeterRentAndOtherChargesPerAnnum !== undefined ? checkForNull(fieldsObj.MeterRentAndOtherChargesPerAnnum) : 0;
    const DutyChargesAndFCA = fieldsObj && fieldsObj.DutyChargesAndFCA !== undefined ? checkForNull(fieldsObj.DutyChargesAndFCA) : 0;

    if (fieldsObj && fieldsObj.AvgUnitConsumptionPerMonth !== undefined) {
      const AvgUnitConsumptionPerMonth = fieldsObj.AvgUnitConsumptionPerMonth * 12
      power.AvgUnitConsumptionPerMonth = AvgUnitConsumptionPerMonth
      this.setState({
        power: { ...power, AvgUnitConsumptionPerMonth: power.AvgUnitConsumptionPerMonth }
      })
      this.props.change('UnitConsumptionPerAnnum', checkForDecimalAndNull(AvgUnitConsumptionPerMonth, initialConfiguration?.NoOfDecimalForInputOutput))
    }

    //Formula for SEB COST PER UNIT calculation
    if (!isCostPerUnitConfigurable) {
      if (AvgUnitConsumptionPerMonth <= MinDemandKWPerMonth) {
        const SEBCostPerUnit = checkForNull((MinDemandKWPerMonth * DemandChargesPerKW) / AvgUnitConsumptionPerMonth);
        power.SEBCostPerUnit = SEBCostPerUnit
        this.setState({ costPerUnitTooltipText: 'Cost per Unit = Min Monthly Charge / Avg. Unit Consumption per Month' })
        this.setState({
          power: { ...power, SEBCostPerUnit: power.SEBCostPerUnit }
        })
        this.props.change('SEBCostPerUnit', SEBCostPerUnit === 0 ? '' : checkForDecimalAndNull(SEBCostPerUnit, initialConfiguration?.NoOfDecimalForPrice))
      } else {
        const SEBCostPerUnit = checkForNull(((MinDemandKWPerMonth * DemandChargesPerKW) + ((AvgUnitConsumptionPerMonth - MinDemandKWPerMonth) * MaxDemandChargesKW)) / AvgUnitConsumptionPerMonth);

        power.SEBCostPerUnit = SEBCostPerUnit
        this.setState({
          power: { ...power, SEBCostPerUnit: power.SEBCostPerUnit }
        })
        this.setState({ costPerUnitTooltipText: 'Cost per Unit = (Min Monthly Charge + (Avg. Unit Consumption per Month - Min Demand kW per Month) * Max Demand Charges per kW) / Avg. Unit Consumption per Month' })
        this.props.change('SEBCostPerUnit', SEBCostPerUnit === 0 ? '' : checkForDecimalAndNull(SEBCostPerUnit, initialConfiguration?.NoOfDecimalForPrice))
      }

    }

    //Formula for TOTAL UNIT CHARGES calculation
    const UnitConsumptionPerAnnum = power.AvgUnitConsumptionPerMonth !== undefined ? checkForNull(power.AvgUnitConsumptionPerMonth) : 0;
    const SEBCostPerUnit = power.SEBCostPerUnit !== undefined ? checkForNull(power.SEBCostPerUnit) : 0;

    const TotalUnitCharges = checkForNull(((UnitConsumptionPerAnnum * SEBCostPerUnit) + MeterRentAndOtherChargesPerAnnum + DutyChargesAndFCA) / UnitConsumptionPerAnnum)
    power.TotalUnitCharges = TotalUnitCharges
    this.setState({
      power: { ...power, TotalUnitCharges: power.TotalUnitCharges }
    })
    this.props.change('TotalUnitCharges', checkForDecimalAndNull(TotalUnitCharges, initialConfiguration?.NoOfDecimalForPrice))
  }

  /**
   * @method selfPowerCalculation
   * @description USED TO CALCULATE SELF GENERATED POWER CALCULATION
   */
  selfPowerCalculation = () => {
    const { source, power, } = this.state;
    const { fieldsObj, initialConfiguration } = this.props;

    //CALCULATION OF SELF GENERATOR COST PER UNIT
    if (source && source.value === GENERATOR_DIESEL) {
      const CostPerUnitOfMeasurement = fieldsObj && fieldsObj.CostPerUnitOfMeasurement !== undefined ? checkForNull(fieldsObj.CostPerUnitOfMeasurement) : 0;
      const UnitGeneratedPerUnitOfFuel = fieldsObj && fieldsObj.UnitGeneratedPerUnitOfFuel !== undefined ? checkForNull(fieldsObj.UnitGeneratedPerUnitOfFuel) : 0;
      if (!CostPerUnitOfMeasurement || !UnitGeneratedPerUnitOfFuel) {
        return 0
      }
      const SelfGeneratedCostPerUnit = checkForNull(CostPerUnitOfMeasurement / UnitGeneratedPerUnitOfFuel);
      power.SelfGeneratedCostPerUnit = SelfGeneratedCostPerUnit
      this.setState({
        power: { ...power, SelfGeneratedCostPerUnit: power.SelfGeneratedCostPerUnit }
      })
      this.props.change('SelfGeneratedCostPerUnit', checkForDecimalAndNull(SelfGeneratedCostPerUnit, initialConfiguration?.NoOfDecimalForPrice))
    } else {
      const AnnualCost = fieldsObj && fieldsObj.AnnualCost !== undefined ? checkForNull(fieldsObj.AnnualCost) : 0;
      const UnitGeneratedPerAnnum = fieldsObj && fieldsObj.UnitGeneratedPerAnnum !== undefined ? checkForNull(fieldsObj.UnitGeneratedPerAnnum) : 0;
      if (!AnnualCost || !UnitGeneratedPerAnnum) {
        return 0
      }
      const SelfGeneratedCostPerUnit = checkForNull(AnnualCost / UnitGeneratedPerAnnum);
      power.SelfGeneratedCostPerUnit = SelfGeneratedCostPerUnit
      this.setState({
        power: { ...power, SelfGeneratedCostPerUnit: power.SelfGeneratedCostPerUnit }
      })
      this.props.change('SelfGeneratedCostPerUnit', checkForDecimalAndNull(SelfGeneratedCostPerUnit, initialConfiguration?.NoOfDecimalForPrice))
    }

  }

  /**
   * @method powerContributionCalculation
   * @description USED TO CALCULATE TOTAL POWER CONTRIBUTION SHOULD NOT BE GREATER THAN 100%
   */
  powerContributionCalculation = () => {
    const { powerGrid, isEditIndex, isEditSEBIndex, powerGridEditIndex, } = this.state;
    const { fieldsObj } = this.props;

    //POWER CONTIRBUTION FIELDS
    const electricBoardPowerContribution = fieldsObj && fieldsObj.SEBPowerContributaion !== undefined ? checkForNull(fieldsObj.SEBPowerContributaion) : 0;
    const selfGeneratorPowerContribution = fieldsObj && fieldsObj.SelfPowerContribution !== undefined ? checkForNull(fieldsObj.SelfPowerContribution) : 0;

    //CALCULATION FOR POWER CONTRIBUTION 100%
    const totalContributionFromGrid = powerGrid && powerGrid.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.PowerContributionPercentage);
    }, 0)
    if (totalContributionFromGrid !== 0 && electricBoardPowerContribution !== 0) {

      let powerContributionTotal = 0;
      if (isEditIndex) {
        this.setState({ ind: powerGridEditIndex })
        let rowObj = powerGrid && powerGrid.find((el, index) => index === powerGridEditIndex)
        powerContributionTotal = selfGeneratorPowerContribution + totalContributionFromGrid - checkForNull(rowObj.PowerContributionPercentage);
      } else if (isEditSEBIndex) {
        let rowObj = powerGrid && powerGrid.find((el, index) => index === powerGridEditIndex)
        powerContributionTotal = electricBoardPowerContribution + totalContributionFromGrid - checkForNull(rowObj.PowerContributionPercentage);
      } else {
        powerContributionTotal = selfGeneratorPowerContribution + totalContributionFromGrid;
      }

      if (fieldsObj.SelfPowerContribution > 100 && powerContributionTotal > 100) {
        this.setState({ checkPowerContribution: true })
        Toaster.warning('Total power contribution should not be greater than 100%.')
      } else {
        this.setState({ checkPowerContribution: false })
      }
    }
  }
  /**
   * @method getDetails
   * @description Used to get Details
   */
  getDetails = () => {
    const { data } = this.props;
    if (data && data.isEditFlag) {
      this.setState({
        isEditFlagForStateElectricity: true
      })
    }
    if (data && data?.isEditFlag && data?.IsVendor) {
      this.setState({
        isEditFlag: false,
        isLoader: true,
        PowerDetailID: data.Id,
      })
      this.props.getVendorPowerDetailData(data.Id, res => {
        if (res && res.data && res.data.Result) {

          const Data = res.data.Data;
          this.setState({ DataToChangeVendor: Data })
          this.props.getPlantBySupplier(Data.VendorId, () => { })

          setTimeout(() => {
            this.setState({
              isEditFlag: true,
              isLoader: false,
              IsVendor: Data.IsVendor,
              VendorCode: Data.VendorCode,
              vendorName: Data.VendorName !== undefined ? { label: Data.VendorName, value: Data.VendorId } : [],
            })
            this.props.change('NetPowerCostPerUnit', Data.NetPowerCostPerUnit)
            this.props.change('NetPowerCostPerUnitLocalConversion', Data.NetPowerCostPerUnitLocalConversion)
            this.props.change('NetPowerCostPerUnitConversion', Data.NetPowerCostPerUnitConversion)
            this.props.change('plantCurrency', Data?.PowerEntryType === ENTRY_TYPE_IMPORT ? Data?.LocalCurrency : Data?.Currency)
            this.props.change('Country', Data.CountryName !== undefined ? { label: Data?.CountryName, value: Data?.CountryId } : {})
            this.props.change('State', Data.StateName !== undefined ? { label: Data?.StateName, value: Data.StateId } : {})
            this.props.change('City', Data.CityName !== undefined ? { label: Data?.CityName, value: Data?.CityId } : {})
            if (Data?.LocalCurrency !== reactLocalStorage?.getObject("baseCurrency")) {
              this.setState({ hidePlantCurrency: false })
            } else {
              this.setState({ hidePlantCurrency: true })
            }
          }, 200)
        }
      })

    }
    else if (data && data.isEditFlag) {
      this.setState({
        isEditFlag: false,
        isLoader: true,
        PowerDetailID: data.Id,
      })

      this.props.getPowerDetailData(data, res => {
        if (res && res.data && res.data.Result) {
          const { powerGrid } = this.state;
          const Data = res.data.Data;
          this.setState({ DataToChangeZ: Data })

          let tempArray = [];
          if (Data.SEBChargesDetails.length > 0) {
            tempArray.push(...powerGrid, {
              PowerSEBPCId: Data.SEBChargesDetails[0].PowerSEBPCId,
              PowerSGPCId: '',
              SourcePowerType: 'SEB',
              AssetCost: '',
              AnnualCost: '',
              UnitGeneratedPerAnnum: '',
              CostPerUnit: Data.SEBChargesDetails[0].TotalUnitCharges,
              PowerContributionPercentage: Data.SEBChargesDetails[0].PowerContributaionPersentage,
              UnitOfMeasurementId: '',
              UnitOfMeasurementName: '',
              CostPerUnitOfMeasurement: 0,
              UnitGeneratedPerUnitOfFuel: 0,
              OtherCharges: 0,
              isSelfPowerGenerator: false,
            })
          }
          this.props.change('SEBPowerContributaion', Data.SEBChargesDetails[0].PowerContributaionPersentage)
          if (Data.SGChargesDetails.length > 0) {
            let selfPowerArray = Data && Data.SGChargesDetails.map((item) => item)
            tempArray.push(...powerGrid, ...selfPowerArray)
          }

          setTimeout(() => {
            this.props.change('EffectiveDate', DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '')
            let plantArray = Data && Data.Plants.map((item) => ({ Text: item.PlantName, Value: item.PlantId }))
            this.props.change('NetPowerCostPerUnit', Data.NetPowerCostPerUnit)
            this.props.change('NetPowerCostPerUnitLocalConversion', Data.NetPowerCostPerUnitLocalConversion)
            this.props.change('NetPowerCostPerUnitConversion', Data.NetPowerCostPerUnitConversion)
            this.props.change('plantCurrency', Data?.PowerEntryType === ENTRY_TYPE_IMPORT ? Data?.LocalCurrency : Data?.Currency)
            this.props.change('Country', Data.CountryName !== undefined ? { label: Data?.CountryName, value: Data?.CountryId } : {})
            this.props.change('State', Data.StateName !== undefined ? { label: Data?.StateName, value: Data.StateId } : {})
            this.props.change('City', Data.CityName !== undefined ? { label: Data?.CityName, value: Data?.CityId } : {})

            this.setState({
              isEditFlag: true,
              isLoader: false,
              IsVendor: Data.IsVendor,
              netContributionValue: Data.NetPowerCostPerUnit,
              netContributionConvertedInBaseCurrency: Data?.NetPowerCostPerUnitConversion,
              netContributionConvertedInLocalCurrency: Data?.NetPowerCostPerUnitLocalConversion,
              isAddedSEB: Data.SEBChargesDetails && Data.SEBChargesDetails.length > 0 ? true : false,
              selectedPlants: plantArray,
              StateName: Data.StateName !== undefined ? { label: Data.StateName, value: Data.StateId } : [],
              effectiveDate: DayTime(Data.EffectiveDate),
              powerGrid: tempArray,
              isDetailEntry: Data.IsDetailedForm,
              costingTypeId: Data.CostingTypeId,
              client: { label: `${Data.CustomerName} (${Data.CustomerCode})`, value: Data.CustomerId },
              vendorName: { label: `${Data?.VendorName} (${Data?.VendorCode})`, value: Data?.VendorId },
              ExchangeSource: Data?.ExchangeRateSourceName ? { label: Data?.ExchangeRateSourceName, value: Data?.ExchangeRateSourceId } : [],
              settlementCurrency: Data?.ExchangeRate,
              settlementExchangeRateId: Data?.ExchangeRateId,
              isImport: Data?.PowerEntryType === ENTRY_TYPE_IMPORT ? true : false,
              currency: Data?.Currency ? { label: Data?.Currency, value: Data?.CurrencyId } : [],
              plantCurrency: Data?.PowerEntryType === ENTRY_TYPE_IMPORT ? Data?.LocalCurrencyExchangeRate : Data?.ExchangeRate,
              plantCurrencyID: Data?.PowerEntryType === ENTRY_TYPE_IMPORT ? Data?.LocalCurrencyId : Data?.CurrencyId,
              plantExchangeRateId: Data?.PowerEntryType === ENTRY_TYPE_IMPORT ? Data?.LocalExchangeRateId : Data?.ExchangeRateId,
              city: Data?.CityName !== undefined ? { label: Data?.CityName, value: Data?.CityId } : [],
              country: Data?.CountryName !== undefined ? { label: Data?.CountryName, value: Data?.CountryId } : [],
            }, () => this.setState({ isLoader: false }))

            if (!Data.IsDetailedForm) {
              this.props.change('NetPowerCostPerUnit', Data.NetPowerCostPerUnit)
            }
            if (Data?.LocalCurrency !== reactLocalStorage?.getObject("baseCurrency")) {
              this.setState({ hidePlantCurrency: false })
            } else {
              this.setState({ hidePlantCurrency: true })
            }
          }, 200)
        }
      })

    } else {
      this.setState({
        isEditFlag: false,
        isLoader: false,
        PowerDetailID: '',
      })
      this.props.getPowerDetailData('', () => { })

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
        //this.props.getClientSelectList(() => { })
      }
    });
  };

  /**
  * @method handleVendorName
  * @description called
  */
  handleVendorName = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ vendorName: newValue, isVendorNameNotSelected: false }, () => {
        const { vendorName } = this.state;
        const result = vendorName && vendorName?.label ? getCodeBySplitting(vendorName?.label) : '';
        this.setState({ VendorCode: result })
        this.props.getPlantBySupplier(vendorName.value, () => { })
        if (this.props.fieldsObj?.plantCurrency !== reactLocalStorage?.getObject("baseCurrency")) {
          this.callExchangeRateAPI()
        }
      });
    } else {
      this.setState({ vendorName: [] })
      this.props.getPlantBySupplier('', () => { })
    }
  };

  vendorToggler = () => {
    this.setState({ isOpenVendor: true })
  }
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
  countryHandler = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ country: newValue, StateName: [], city: [], selectedPlants: [] }, () => {
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
      this.setState({ StateName: newValue, city: [] }, () => {
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
      this.props.getCityByCountryAction(country.value, '00000000000000000000000000000000', '', (res) => { })
    } else {
      this.props.fetchStateDataAPI(country.value, () => { })
    }
  }

  /**
  * @method handlePlants
  * @description Used handle Plants
  */
  handlePlants = (e) => {
    const plantValues = e?.map(plant => plant.Value);
    this.setState({ selectedPlants: e })
    if (plantValues !== undefined) {
      this.props.getPlantCurrencyByPlantIds(plantValues, (res) => {
        let Data = res?.data?.Data;
        if (res?.response?.status === 412) {
          this.setState({ isDisabled: true });
          return;
        } else {
          this.setState({ isDisabled: false });
        }
        this.props.change('plantCurrency', Data[0]?.Currency);
        this.setState({ plantCurrencyID: Data[0]?.CurrencyId });
        if (Data[0]?.Currency !== reactLocalStorage?.getObject("baseCurrency")) {
          this.setState({ hidePlantCurrency: false });
        } else {
          this.setState({ hidePlantCurrency: true });
        }
        this.callExchangeRateAPI();
      });
    } else {
      this.props.change('plantCurrency', "");
      this.setState({ isDisabled: false });
    }
    // this.props.getPlantUnitAPI(e?.value, (res) => {
    //   let Data = res?.data?.Data
    //   if (Data?.Currency !== reactLocalStorage?.getObject("baseCurrency")) {
    //     this.props.change('plantCurrency', Data?.Currency)
    //     this.setState({ hidePlantCurrency: false })
    //     this.callExchangeRateAPI()
    //   } else {
    //     this.setState({ hidePlantCurrency: true })
    //   }
    // })
  }
  handleExchangeRateSource = (newValue) => {
    this.setState({ ExchangeSource: newValue }
      , () => {
        this.callExchangeRateAPI()
      }
    );
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

  onNetCostChange = (e) => {
    if (e.target.value) {
      this.setState({ DropdownChanged: false })
    }
    this.handleCalculation(e?.target?.value)
  }

  /**
  * @method handleSource
  * @description called
  */
  handleSource = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      if (newValue.value === GENERATOR_DIESEL) {
        this.setState({ segCostUnittooltipText: 'Cost per Unit = Cost per UOM / Unit Generated per Unit of Fuel' })
      } else {
        this.setState({ segCostUnittooltipText: 'Cost per Unit = Annual Cost / Unit Generated per Annum' })
      }
      this.setState({ source: newValue, })
    } else {
      this.setState({ source: [] })
    }
    this.setState({ handleChange: false })
  };

  findSourceType = (clickedData, arr) => {
    let isSourceType = _.find(arr, function (obj) {
      if (obj.SourcePowerType === clickedData) {
        return true;
      } else {
        return false
      }
    });
    return isSourceType
  }
  /**
  * @method handleUOM
  * @description called
  */
  handleUOM = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ UOM: newValue, }, () => {
        const { StateName, UOM, effectiveDate, client, selectedPlants, vendorName } = this.state;

        if (StateName.length === 0) {
          Toaster.warning("Please select state first.")
          return false
        }

        let data = { StateID: StateName.value, UOMID: UOM.value, plantId: selectedPlants[0].Value, vendorId: vendorName.value, customerId: client.value, effectiveDate: DayTime(effectiveDate).format('DD/MM/YYYY'), fuelId: this.props.fuelId, cityId: this.props.cityId }
        this.props.getDieselRateByStateAndUOM(data, (res) => {
          let DynamicData = res?.data?.DynamicData;
          this.props.change('CostPerUnitOfMeasurement', DynamicData?.FuelRate)
        })
      })
    } else {
      this.setState({ UOM: [] })
    }
    this.setState({ handleChange: false })
  };

  resetpowerKeyValue = () => {
    this.setState({
      power: { minMonthlyCharge: 0, AvgUnitConsumptionPerMonth: 0, SEBCostPerUnit: 0, TotalUnitCharges: 0, SelfGeneratedCostPerUnit: 0, }
    })
  }

  /**
  * @method powerSEBTableHandler
  * @description USED TO SET SEB
  */
  powerSEBTableHandler = (isSelfGenerator) => {
    const { powerGrid, power } = this.state;
    const { fieldsObj } = this.props;

    let powerTotalT = 0
    if (powerGrid) {
      this.state.powerGrid.map((item, index) => {
        powerTotalT = Number(powerTotalT) + Number(item.PowerContributionPercentage)
        return null
      })

      powerTotalT = Number(powerTotalT) + Number(fieldsObj.SEBPowerContributaion)

    }
    if (powerTotalT > 100) {
      Toaster.warning('Total Contribution should not be more than 100%');
      return false;
    }


    const TotalUnitCharges = power.TotalUnitCharges !== undefined ? power.TotalUnitCharges : 0
    const SEBPowerContributaion = fieldsObj && fieldsObj !== undefined ? fieldsObj.SEBPowerContributaion : 0
    let count = 0;

    setTimeout(() => {

      if (fieldsObj.MinDemandKWPerMonth === undefined || Number(fieldsObj.MinDemandKWPerMonth) === 0) {
        this.setState({ errorObj: { ...this.state.errorObj, minDemand: true } })
        count++
      }

      if (fieldsObj.DemandChargesPerKW === undefined || Number(fieldsObj.DemandChargesPerKW) === 0) {
        this.setState({ errorObj: { ...this.state.errorObj, demandCharge: true } })
        count++
      }
      if (fieldsObj.AvgUnitConsumptionPerMonth === undefined || Number(fieldsObj.AvgUnitConsumptionPerMonth) === 0) {
        this.setState({ errorObj: { ...this.state.errorObj, avgUnit: true } })
        count++
      }
      if (fieldsObj.MaxDemandChargesKW === undefined || Number(fieldsObj.MaxDemandChargesKW) === 0) {
        this.setState({ errorObj: { ...this.state.errorObj, maxDemand: true } })
        count++
      }
      if (SEBPowerContributaion === undefined || Number(SEBPowerContributaion) === 0) {
        this.setState({ errorObj: { ...this.state.errorObj, statePowerCont: true } })
        count++
      }
      if (count > 0) {
        return false
      }
      if (this.props.invalid === true) {
        Toaster.warning('Please fill all mandatory fields first')

        return false;
      }
      const tempArray = [];

      tempArray.push(...powerGrid, {
        PowerSEBPCId: '',
        PowerSGPCId: '',
        SourcePowerType: 'SEB',
        AssetCost: '',
        AnnualCost: '',
        UnitGeneratedPerAnnum: '',
        CostPerUnit: TotalUnitCharges,
        PowerContributionPercentage: SEBPowerContributaion,
        UnitOfMeasurementId: '',
        UnitOfMeasurementName: '',
        CostPerUnitOfMeasurement: 0,
        UnitGeneratedPerUnitOfFuel: 0,
        OtherCharges: 0,
        isSelfPowerGenerator: isSelfGenerator,
      })
      const NetPowerCostPerUnit = tempArray && tempArray.reduce((accummlator, el) => {
        return accummlator + checkForNull(el.CostPerUnit * el.PowerContributionPercentage / 100);
      }, 0)

      this.setState({
        isEditFlagForStateElectricity: true,
        powerGrid: tempArray,
        netContributionValue: NetPowerCostPerUnit,
        isAddedSEB: true,
      });
      this.setState({ AddChanged: false })
      this.resetpowerKeyValue()
    }, 200);
  }

  /**
  * @method resetData
  * @description Used to reset State electricity data
  */
  resetData = () => {
    this.setState({
      effectiveDate: new Date()
    })
    this.props.change('SEBPowerContributaion', '')
    this.props.change('DutyChargesAndFCA', '')
    this.props.change('MeterRentAndOtherChargesPerAnnum', '')
    this.props.change('MinDemandKWPerMonth', '')
    this.props.change('DemandChargesPerKW', '')
    this.props.change('AvgUnitConsumptionPerMonth', '')
    this.props.change('MaxDemandChargesKW', '')
    this.props.change('UnitConsumptionPerAnnum', '')
  }
  /**
  * @method updateSEBGrid
  * @description Used to handle updateProcessGrid
  */
  updateSEBGrid = () => {
    const { powerGrid, powerGridEditIndex, power } = this.state;
    const { fieldsObj } = this.props;
    if (checkForNull(fieldsObj?.MinDemandKWPerMont) === 0 && checkForNull(fieldsObj?.MaxDemandChargesKW) === 0 && checkForNull(fieldsObj?.AvgUnitConsumptionPerMonth) === 0 &&
      checkForNull(fieldsObj?.MaxDemandChargesKW) === 0 && checkForNull(fieldsObj?.MeterRentAndOtherChargesPerAnnum) === 0 && checkForNull(fieldsObj?.DutyChargesAndFCA) === 0 &&
      checkForNull(fieldsObj?.SEBPowerContributaion) === 0) {
      return false;
    }
    if (this.props.invalid === true) {
      return false;
    }
    let powerTotalT = 0
    if (powerGrid) {
      this.state.powerGrid.map((item, index) => {
        powerTotalT = Number(powerTotalT) + Number(item.PowerContributionPercentage)
        return null
      })

      powerTotalT = Number(powerTotalT) + Number(fieldsObj.SEBPowerContributaion)

    }

    if (powerTotalT > 100) {
      Toaster.warning('Total Contribution should not be more than 100%');
      return false;
    }



    const TotalUnitCharges = power.TotalUnitCharges !== undefined ? power.TotalUnitCharges : 0
    const SEBPowerContributaion = fieldsObj && fieldsObj !== undefined ? fieldsObj.SEBPowerContributaion : 0


    let tempArray = [];

    let tempData = powerGrid[powerGridEditIndex];
    tempData = { ...tempData, CostPerUnit: TotalUnitCharges, PowerContributionPercentage: SEBPowerContributaion, }

    tempArray = Object.assign([...powerGrid], { [powerGridEditIndex]: tempData })
    const NetPowerCostPerUnit = tempArray && tempArray.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.CostPerUnit * el.PowerContributionPercentage / 100);
    }, 0)

    this.setState({
      powerGrid: tempArray,
      netContributionValue: NetPowerCostPerUnit,
      powerGridEditIndex: '',
      isEditSEBIndex: false,
      isAddedSEB: true,
    }, () => {


    });
    this.setState({ DropdownChanged: false })
    this.resetpowerKeyValue()
  };

  powerTableHandler = (isSelfGenerator) => {
    const { source, UOM, powerGrid } = this.state;
    const { fieldsObj } = this.props;

    let powerTotalT = 0
    if (powerGrid) {
      this.state.powerGrid.map((item, index) => {
        powerTotalT = Number(powerTotalT) + Number(item.PowerContributionPercentage)
        return null
      })

      powerTotalT = Number(powerTotalT) + Number(fieldsObj.SelfPowerContribution)

    }

    if (powerTotalT > 100) {
      Toaster.warning('Total Contribution should not be more than 100%');
      return false;
    }

    let count = 0;

    setTimeout(() => {
      if (source.length === 0) {
        this.setState({ errorObj: { ...this.state.errorObj, source: true } })
        count++;
      }
      if (fieldsObj.UnitGeneratedPerAnnum === undefined || Number(fieldsObj.UnitGeneratedPerAnnum) === 0) {
        this.setState({ errorObj: { ...this.state.errorObj, unitGenerated: true } })
        count++;
      }
      if (fieldsObj?.SelfPowerContribution === undefined || Number(fieldsObj.SelfPowerContribution) === 0) {
        this.setState({ errorObj: { ...this.state.errorObj, selfPowerCont: true } })
        count++;
      }
      if (source?.label === 'Generator Diesel' && (fieldsObj.UnitGeneratedPerUnitOfFuel === undefined || Number(fieldsObj.UnitGeneratedPerUnitOfFuel) === 0)) {
        this.setState({ errorObj: { ...this.state.errorObj, unitGeneratedDiesel: true } })
        count++;
      }
      if (count > 0) {
        return false;
      }

      if (this.props.invalid === true) {
        return false;
      }
      const AssetCost = fieldsObj && fieldsObj.AssetCost !== undefined ? fieldsObj.AssetCost : 0;
      const AnnualCost = fieldsObj && fieldsObj.AnnualCost !== undefined ? fieldsObj.AnnualCost : 0;
      const UnitGeneratedPerAnnum = fieldsObj && fieldsObj.UnitGeneratedPerAnnum !== undefined ? fieldsObj.UnitGeneratedPerAnnum : 0;
      const SelfGeneratedCostPerUnit = fieldsObj && fieldsObj.SelfGeneratedCostPerUnit !== undefined ? fieldsObj.SelfGeneratedCostPerUnit : 0;
      const SelfPowerContribution = fieldsObj && fieldsObj.SelfPowerContribution !== undefined ? fieldsObj.SelfPowerContribution : 0;
      const CostPerUnitOfMeasurement = fieldsObj && fieldsObj.CostPerUnitOfMeasurement !== undefined ? fieldsObj.CostPerUnitOfMeasurement : 0;
      const UnitGeneratedPerUnitOfFuel = fieldsObj && fieldsObj.UnitGeneratedPerUnitOfFuel !== undefined ? fieldsObj.UnitGeneratedPerUnitOfFuel : 0;

      const tempArray = [];

      tempArray.push(...powerGrid, {
        PowerSGPCId: '',
        SourcePowerType: source.value,
        AssetCost: AssetCost,
        AnnualCost: AnnualCost,
        UnitGeneratedPerAnnum: UnitGeneratedPerAnnum,
        CostPerUnit: SelfGeneratedCostPerUnit,
        PowerContributionPercentage: SelfPowerContribution,

        //DIESEL
        UnitOfMeasurementId: source && source.value === GENERATOR_DIESEL ? UOM?.value : '',
        UnitOfMeasurementName: source && source.value === GENERATOR_DIESEL ? UOM?.label : '',
        CostPerUnitOfMeasurement: source && source.value === GENERATOR_DIESEL ? CostPerUnitOfMeasurement : 0,
        UnitGeneratedPerUnitOfFuel: source && source.value === GENERATOR_DIESEL ? UnitGeneratedPerUnitOfFuel : 0,
        OtherCharges: 0,
        isSelfPowerGenerator: isSelfGenerator,
      })
      const NetPowerCostPerUnit = tempArray && tempArray.reduce((accummlator, el) => {
        return accummlator + checkForNull(el.CostPerUnit * el.PowerContributionPercentage / 100);
      }, 0)


      this.setState({
        powerGrid: tempArray,
        netContributionValue: NetPowerCostPerUnit,
        source: [],
        UOM: [],
      }, () => {
        this.props.change('AssetCost', 0)
        this.props.change('AnnualCost', 0)
        this.props.change('UnitGeneratedPerAnnum', 0)
        this.props.change('SelfGeneratedCostPerUnit', 0)
        this.props.change('SelfPowerContribution', 0)
        this.props.change('CostPerUnitOfMeasurement', 0)
        this.props.change('UnitGeneratedPerUnitOfFuel', 0)

      });
      count = 0;
      this.setState({ AddChanged: false, errorObj: { ...this.state.errorObj, source: false, unitGenerated: false, selfPowerCont: false, unitGeneratedDiesel: false } })
    }, 100);
    this.resetpowerKeyValue()
  }

  /**
* @method updatePowerGrid
* @description Used to handle updateProcessGrid
*/
  updatePowerGrid = () => {
    const { source, UOM, powerGrid, powerGridEditIndex } = this.state;
    const { fieldsObj } = this.props;

    let powerTotalT = 0
    if (powerGrid) {
      this.state.powerGrid.map((item, index) => {
        if (index === powerGridEditIndex) {
          powerTotalT = Number(powerTotalT) + Number(fieldsObj.SelfPowerContribution)
        } else {
          powerTotalT = Number(powerTotalT) + Number(item.PowerContributionPercentage)
        }
        return null
      })
    }
    let count = 0;
    setTimeout(() => {

      if (fieldsObj.UnitGeneratedPerAnnum === undefined || Number(fieldsObj.UnitGeneratedPerAnnum) === 0) {
        this.setState({ errorObj: { ...this.state.errorObj, unitGenerated: true } })
        count++;
      }
      if (fieldsObj.SelfPowerContribution === undefined || Number(fieldsObj.SelfPowerContribution) === 0) {
        this.setState({ errorObj: { ...this.state.errorObj, selfPowerCont: true } })
        count++;
      }
      if (source?.label === 'Generator Diesel' && (fieldsObj.UnitGeneratedPerUnitOfFuel === undefined || Number(fieldsObj.UnitGeneratedPerUnitOfFuel) === 0)) {
        this.setState({ errorObj: { ...this.state.errorObj, unitGeneratedDiesel: true } })
        count++;
      }
      if (count > 0) {
        return false;
      }
      if (this.props.invalid === true) {
        return false;
      }
      if (powerTotalT > 100) {
        Toaster.warning('Total Contribution should not be more than 100%');
        return false;
      }

      const AssetCost = fieldsObj && fieldsObj !== undefined ? fieldsObj.AssetCost : 0;
      const AnnualCost = fieldsObj && fieldsObj !== undefined ? fieldsObj.AnnualCost : 0;
      const UnitGeneratedPerAnnum = fieldsObj && fieldsObj !== undefined ? fieldsObj.UnitGeneratedPerAnnum : 0;
      const SelfGeneratedCostPerUnit = fieldsObj && fieldsObj !== undefined ? fieldsObj.SelfGeneratedCostPerUnit : 0;
      const SelfPowerContribution = fieldsObj && fieldsObj !== undefined ? fieldsObj.SelfPowerContribution : 0;
      const CostPerUnitOfMeasurement = fieldsObj && fieldsObj.CostPerUnitOfMeasurement !== undefined ? fieldsObj.CostPerUnitOfMeasurement : 0;
      const UnitGeneratedPerUnitOfFuel = fieldsObj && fieldsObj !== undefined ? fieldsObj.UnitGeneratedPerUnitOfFuel : 0;

      let tempArray = [];

      let tempData = powerGrid[powerGridEditIndex];
      tempData = {
        PowerSGPCId: '',
        SourcePowerType: source.value,
        AssetCost: AssetCost,
        AnnualCost: AnnualCost,
        UnitGeneratedPerAnnum: UnitGeneratedPerAnnum,
        CostPerUnit: SelfGeneratedCostPerUnit,
        PowerContributionPercentage: SelfPowerContribution,
        UnitOfMeasurementId: source && source.value === GENERATOR_DIESEL ? UOM?.value : '',
        UnitOfMeasurementName: source && source.value === GENERATOR_DIESEL ? UOM?.label : '',
        CostPerUnitOfMeasurement: source && source.value === GENERATOR_DIESEL ? CostPerUnitOfMeasurement : 0,
        UnitGeneratedPerUnitOfFuel: source && source.value === GENERATOR_DIESEL ? UnitGeneratedPerUnitOfFuel : 0,
        OtherCharges: 0
      }

      tempArray = Object.assign([...powerGrid], { [powerGridEditIndex]: tempData })
      const NetPowerCostPerUnit = tempArray && tempArray.reduce((accummlator, el) => {
        return accummlator + checkForNull(el.CostPerUnit * el.PowerContributionPercentage / 100);
      }, 0)

      this.setState({
        powerGrid: tempArray,
        source: [],
        UOM: [],
        netContributionValue: NetPowerCostPerUnit,
        powerGridEditIndex: '',
        isEditIndex: false,
      }, () => {
        this.props.change('AssetCost', 0)
        this.props.change('AnnualCost', 0)
        this.props.change('UnitGeneratedPerAnnum', 0)
        this.props.change('SelfGeneratedCostPerUnit', 0)
        this.props.change('SelfPowerContribution', 0)
        this.props.change('CostPerUnitOfMeasurement', 0)
        this.props.change('UnitGeneratedPerUnitOfFuel', 0)

      });
      this.setState({ DropdownChanged: false, errorObj: { unitGenerated: false, selfPowerCont: false, unitGeneratedDiesel: false } })
    }, 200);
    this.resetpowerKeyValue()
  };

  /**
  * @method resetPowerGridData
  * @description Used to handle setTechnologyLevel
  */
  resetPowerGridData = () => {
    this.setState({
      source: [],
      UOM: [],
      powerGridEditIndex: '',
      isEditIndex: false,
    }, () => {
      this.props.change('AssetCost', '')
      this.props.change('AnnualCost', '')
      this.props.change('UnitGeneratedPerAnnum', '')
      this.props.change('SelfGeneratedCostPerUnit', '')
      this.props.change('SelfPowerContribution', '')
      this.props.change('CostPerUnitOfMeasurement', '')
      this.props.change('UnitGeneratedPerUnitOfFuel', '')
    });
  };

  /**
  * @method editItemDetails
  * @description used to Reset form
  */
  editItemDetails = (index, sourceType) => {
    const { powerGrid } = this.state;
    const { UOMSelectList } = this.props;
    const tempData = powerGrid[index];

    if (tempData.SourcePowerType === 'SEB') {

      this.setState({
        isEditFlagForStateElectricity: false,
        powerGridEditIndex: index,
        isEditSEBIndex: true,
        isAddedSEB: false,
      }, () => {
        this.props.change('SEBCostPerUnit', tempData.CostPerUnit)
        this.props.change('SEBPowerContributaion', tempData.PowerContributionPercentage)
      });

    } else {
      let UOMObj = UOMSelectList && UOMSelectList.find(el => el.Value === tempData.UnitOfMeasurementId)
      this.setState({
        isEditFlagForStateElectricity: false,
        powerGridEditIndex: index,
        isEditIndex: true,
        isEditSEBIndex: false,
        source: { label: tempData.SourcePowerType, value: tempData.SourcePowerType },
        UOM: (UOMObj && UOMObj !== undefined && tempData.SourcePowerType === GENERATOR_DIESEL) ? { label: UOMObj.Display, value: UOMObj.Value } : [],
      }, () => {
        this.props.change('AssetCost', tempData.AssetCost)
        this.props.change('AnnualCost', tempData.AnnualCost)
        this.props.change('UnitGeneratedPerAnnum', tempData.UnitGeneratedPerAnnum)
        this.props.change('SelfGeneratedCostPerUnit', tempData.CostPerUnit)
        this.props.change('SelfPowerContribution', tempData.PowerContributionPercentage)
        this.props.change('CostPerUnitOfMeasurement', tempData.CostPerUnitOfMeasurement)
        this.props.change('UnitGeneratedPerUnitOfFuel', tempData.UnitGeneratedPerUnitOfFuel)
      });
    }
  }
  handleCurrency = (newValue) => {
    if (newValue && newValue !== '') {
      this.setState({ currency: newValue }, () => {
        this.callExchangeRateAPI()
      })
    } else {
      this.setState({ currency: [] })
    }
  };
  /**
  * @method deleteItem
  * @description used to Reset form
  */
  deleteItem = (index) => {
    const { powerGrid, netContributionValue } = this.state;
    const tempObj = powerGrid[index]

    if (tempObj.SourcePowerType === 'SEB') {
      this.setState({
        isEditFlagForStateElectricity: false,
        isAddedSEB: false,
        isEditSEBIndex: false
      },
        () => {
          this.props.change('MinDemandKWPerMonth', 0)
          this.props.change('DemandChargesPerKW', 0)
          this.props.change('AvgUnitConsumptionPerMonth', 0)
          this.props.change('UnitConsumptionPerAnnum', 0)
          this.props.change('MaxDemandChargesKW', 0)
          this.props.change('SEBCostPerUnit', 0)
          this.props.change('MeterRentAndOtherChargesPerAnnum', 0)
          this.props.change('DutyChargesAndFCA', 0)
          this.props.change('TotalUnitCharges', 0)
          this.props.change('SEBPowerContributaion', 0)

        }
      )

    } else if (tempObj.SourcePowerType === 'Solar Power' || tempObj.SourcePowerType === 'Generator Diesel' ||
      tempObj.SourcePowerType === 'Hydro Power' || tempObj.SourcePowerType === 'Wind Power') {
      this.setState({
        isEditIndex: false,
        source: []
      },
        () => {
          this.props.change('AssetCost', 0)
          this.props.change('AnnualCost', 0)
          this.props.change('CostPerUnitOfMeasurement', 0)
          this.props.change('UnitGeneratedPerUnitOfFuel', 0)
          this.props.change('UnitGeneratedPerAnnum', 0)
          this.props.change('SelfGeneratedCostPerUnit', 0)
          this.props.change('SelfPowerContribution', 0)
        }
      )
    }
    const tempNetContributionValue = (tempObj.CostPerUnit * tempObj.PowerContributionPercentage / 100)
    const finalNetContribution = netContributionValue - tempNetContributionValue
    let tempData = powerGrid.filter((item, i) => {
      if (i === index) {
        return false;
      }
      return true;
    });

    this.setState({ powerGrid: tempData, netContributionValue: finalNetContribution })
    this.setState({ DeleteChanged: false })
    this.resetpowerKeyValue()
  }
  cityHandler = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ city: newValue }, () => {
        this.callPlantApi()
      });
    } else {
      this.setState({ city: [] });
    }
    this.setState({ DropdownChanged: false })
  };

  /**
  * @method renderListing
  * @description Used to show type of listing
  */
  renderListing = (label) => {
    const { powerTypeSelectList, UOMSelectList, plantSelectList, stateList, clientSelectList, exchangeRateSourceList, countryList, cityList, currencySelectList } = this.props;
    const temp = [];

    if (label === 'state') {
      stateList && stateList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null
      });
      return temp;
    }
    if (label === 'country') {
      countryList && countryList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null
      });
      return temp;
    }
    if (label === 'city') {
      cityList && cityList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null
      });
      return temp;
    }

    if (label === 'plant') {
      plantSelectList && plantSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ Text: item.Text, Value: item.Value })
        return null
      });
      return temp;
    }

    if (label === 'UOM') {
      UOMSelectList && UOMSelectList.map(item => {
        const accept = AcceptablePowerUOM.includes(item.Type)
        if (accept === false) return false
        if (item.Value === '0') return false;
        temp.push({ label: item.Display, value: item.Value })
        return null
      });
      return temp;
    }
    if (label === 'Source') {
      powerTypeSelectList && powerTypeSelectList.map(item => {
        if (item.Value === '0') return false;
        if (this.findSourceType(item.Value, this.state.powerGrid)) return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }

    if (label === 'ClientList') {
      clientSelectList && clientSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'ExchangeSource') {
      exchangeRateSourceList && exchangeRateSourceList.map((item) => {
        if (item.Value === '--Exchange Rate Source Name--') return false
        temp.push({ label: item.Text, value: item.Value })
        return null
      })
      return temp
    } if (label === 'currency') {
      currencySelectList && currencySelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
  }

  /**
  * @method cancel
  * @description used to Reset form
  */
  cancel = (type) => {
    const { reset } = this.props;
    reset();
    this.setState({
      StateName: [],
      selectedPlants: [],
      effectiveDate: new Date(),
      powerGridEditIndex: '',
      powerGrid: [],
      isEditIndex: false,
      vendorName: [],
      vendorLocation: [],
      isOpenVendor: false,
      UOM: [],
      isEditFlag: false,
      IsVendor: false,
    })
    // this.getDetails();
    this.props.hideForm(type)
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
    const { isEditFlag, PowerDetailID, IsVendor, VendorCode, selectedPlants, StateName, powerGrid,
      effectiveDate, vendorName, DataToChangeVendor, DataToChangeZ, DropdownChanged,
      handleChange, DeleteChanged, AddChanged, costingTypeId, isDetailEntry, client, city, country, isImport, netContributionConvertedInLocalCurrency, netContributionConvertedInBaseCurrency, netContributionValue } = this.state;
    const NetContributionConvertedInBaseCurrency = (this.state.isImport || reactLocalStorage?.getObject("baseCurrency") !== this.props?.fieldsObj?.plantCurrency) ? netContributionConvertedInBaseCurrency : netContributionValue
    const NetContributionConvertedInLocalCurrency = (this.state.isImport || reactLocalStorage?.getObject("baseCurrency") !== this.props?.fieldsObj?.plantCurrency) ? netContributionConvertedInLocalCurrency : netContributionValue
    const NetPowerCostPerUnitConversion = (this.state.isImport || reactLocalStorage?.getObject("baseCurrency") !== this.props?.fieldsObj?.plantCurrency) ? this.props.fieldsObj?.NetPowerCostPerUnitConversion : this.props.fieldsObj?.NetPowerCostPerUnitLocalConversion
    const NetPowerCostPerUnitLocalConversion = isDetailEntry ? NetContributionConvertedInLocalCurrency : this.props.fieldsObj?.NetPowerCostPerUnitLocalConversion
    const { fieldsObj } = this.props
    if (IsVendor && vendorName.length <= 0) {
      this.setState({ isVendorNameNotSelected: true, setDisable: false })      // IF VENDOR NAME IS NOT SELECTED THEN WE WILL SHOW THE ERROR MESSAGE MANUALLY AND SAVE BUTTON WILL NOT BE DISABLED
      return false
    }
    const NetPowerCostPerUnit = powerGrid && powerGrid.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.CostPerUnit * el.PowerContributionPercentage / 100);
    }, 0)
    if (!IsVendor && checkForNull(NetPowerCostPerUnit) === 0 && isDetailEntry) {
      Toaster.warning('Net Contribution value should not be 0.')
      return false
    }
    this.setState({ isVendorNameNotSelected: false })
    let plantArray = selectedPlants && selectedPlants.map((item) => {
      return { PlantName: item.Text, PlantId: item.Value, }
    })

    let selfGridDataArray = powerGrid && powerGrid.filter(el => el.SourcePowerType !== 'SEB')
    if (DataToChangeZ.NetPowerCostPerUnit === values.NetPowerCostPerUnit) {
      Toaster.warning('Please change the data to save Power Details');
      return false
    }
    if (isEditFlag) {
      if (IsVendor) {
        this.setState({ setDisable: true })
        let vendorDetailData = {
          PowerDetailId: PowerDetailID,
          VendorId: vendorName.value,
          VendorName: vendorName?.label,
          VendorCode: VendorCode,
          NetPowerCostPerUnit: values.NetPowerCostPerUnit,
          IsVendor: costingTypeId === VBCTypeId,
          IsActive: true,
          CreatedDate: '',
          LoggedInUserId: loggedInUserId(),
          VendorPlant: [],
        }

        this.props.updateVendorPowerDetail(vendorDetailData, (res) => {
          this.setState({ setDisable: false })
          if (res?.data?.Result) {
            Toaster.success(MESSAGES.UPDATE_POWER_DETAIL_SUCESS);
            this.cancel('submit');
          }
        })

      } else {
        let addRow = 0
        let count = 0
        if (selfGridDataArray.length > DataToChangeZ.SGChargesDetails.length) {
          addRow = 1
        }
        if (addRow === 0) {
          for (let i = 0; i < selfGridDataArray.length; i++) {
            let grid = DataToChangeZ.SGChargesDetails[i]
            let sgrid = selfGridDataArray[i]
            if (grid.AssetCost === sgrid.AssetCost && grid.AnnualCost === sgrid.AnnualCost && grid.CostPerUnitOfMeasurement === sgrid.CostPerUnitOfMeasurement &&
              grid.UnitGeneratedPerUnitOfFuel === sgrid.UnitGeneratedPerUnitOfFuel && grid.UnitGeneratedPerAnnum === sgrid.UnitGeneratedPerAnnum &&
              grid.PowerContributionPercentage === sgrid.PowerContributionPercentage) {
              count++
            }
          }
        }
        let sebGrid = DataToChangeZ.SEBChargesDetails[0]
        if (((AddChanged && DropdownChanged) || (sebGrid.MinDemandKWPerMonth === values.MinDemandKWPerMonth && sebGrid.DemandChargesPerKW === values.DemandChargesPerKW &&
          sebGrid.AvgUnitConsumptionPerMonth === values.AvgUnitConsumptionPerMonth && sebGrid.MaxDemandChargesKW === values.MaxDemandChargesKW &&
          sebGrid.MeterRentAndOtherChargesPerAnnum === values.MeterRentAndOtherChargesPerAnnum && sebGrid.DutyChargesAndFCA === values.DutyChargesAndFCA
          && sebGrid.PowerContributaionPersentage === values.SEBPowerContributaion)) && addRow === 0 && count === selfGridDataArray.length && handleChange && DeleteChanged) {

          if ((!isDetailEntry && DropdownChanged) || (isDetailEntry)) {

            this.cancel('cancel')
            return false
          }
        }

        this.setState({ setDisable: true })
        let requestData = {
          PowerId: PowerDetailID,
          PlantId: plantArray && plantArray[0]?.PlantId,
          IsVendor: costingTypeId === VBCTypeId,
          CostingTypeId: costingTypeId,
          IsDetailedForm: isDetailEntry,
          CustomerId: client.value,
          VendorId: vendorName.value,
          Plants: plantArray,
          StateId: StateName.value,
          StateName: StateName?.label,
          IsActive: true,
          NetPowerCostPerUnit: isDetailEntry ? NetPowerCostPerUnit : (this.state.isImport /* || reactLocalStorage?.getObject("baseCurrency") !== this.props?.fieldsObj?.plantCurrency) */ ? this.props.fieldsObj.NetPowerCostPerUnit : this.props.fieldsObj?.NetPowerCostPerUnitLocalConversion),
          VendorPlant: [],
          EffectiveDate: effectiveDate,
          CountryId: country?.value,
          CityId: city?.value,
          SEBChargesDetails: [
            {
              PowerSEBPCId: '',
              MinDemandKWPerMonth: values.MinDemandKWPerMonth,
              DemandChargesPerKW: values.DemandChargesPerKW,
              AvgUnitConsumptionPerMonth: values.AvgUnitConsumptionPerMonth,
              UnitConsumptionPerAnnum: this.state.power.AvgUnitConsumptionPerMonth, // look into this
              MaxDemandChargesKW: values.MaxDemandChargesKW,
              CostPerUnit: this.state.power.SEBCostPerUnit,
              MeterRentAndOtherChargesPerAnnum: values.MeterRentAndOtherChargesPerAnnum,
              DutyChargesAndFCA: values.DutyChargesAndFCA,
              TotalUnitCharges: this.state.power.TotalUnitCharges,
              PowerContributaionPersentage: values.SEBPowerContributaion,
              OtherCharges: 0,
              // EffectiveDate: effectiveDate,
            }
          ],
          SGChargesDetails: selfGridDataArray,
          LoggedInUserId: loggedInUserId(),
          NetPowerCostPerUnitConversion: isDetailEntry ? NetContributionConvertedInBaseCurrency : NetPowerCostPerUnitConversion,
          NetPowerCostPerUnitLocalConversion: NetPowerCostPerUnitLocalConversion,
          PowerEntryType: isImport ? ENTRY_TYPE_IMPORT : ENTRY_TYPE_DOMESTIC,
          ExchangeRateSourceName: this.state.ExchangeSource?.label || null,
          LocalCurrencyId: isImport ? this.state?.plantCurrencyID : null,
          LocalCurrency: isImport ? this.props?.fieldsObj?.plantCurrency : null,
          LocalExchangeRateId: isImport ? this.state?.plantExchangeRateId : null,
          LocalCurrencyExchangeRate: isImport ? this.state?.plantCurrency : null,
          ExchangeRate: isImport ? this.state?.settlementCurrency : this.state?.plantCurrency,
          ExchangeRateId: isImport ? this.state?.settlementExchangeRateId : this.state?.plantExchangeRateId,
          CurrencyId: isImport ? this.state.currency?.value : this.state?.plantCurrencyID,
          Currency: isImport ? this.state?.currency?.label : this.props.fieldsObj?.plantCurrency,
        }

        this.props.updatePowerDetail(requestData, (res) => {
          this.setState({ setDisable: false })
          if (res?.data?.Result) {
            Toaster.success(MESSAGES.UPDATE_POWER_DETAIL_SUCESS);
            this.cancel('submit');
          }
        })
      }

    } else {
      if (IsVendor) {

        this.setState({ setDisable: true })
        const vendorPowerData = {
          VendorId: vendorName.value,
          CostingTypeId: costingTypeId,
          NetPowerCostPerUnit: values.NetPowerCostPerUnit,
          IsVendor: costingTypeId === VBCTypeId,
          LoggedInUserId: loggedInUserId(),
        }
        this.props.createVendorPowerDetail(vendorPowerData, (res) => {
          this.setState({ setDisable: false })
          if (res?.data?.Result) {
            Toaster.success(MESSAGES.POWER_DETAIL_ADD_SUCCESS);
            this.cancel('submit');
          }
        });

      } else {

        this.setState({ setDisable: true })
        const formData = {
          CostingTypeId: costingTypeId,
          IsDetailedForm: isDetailEntry,
          CustomerId: client.value,
          VendorId: vendorName.value,
          PlantId: plantArray && plantArray[0]?.PlantId,
          Plants: plantArray,
          StateId: StateName.value,
          NetPowerCostPerUnit: isDetailEntry ? NetPowerCostPerUnit : (this.state.isImport /* || reactLocalStorage?.getObject("baseCurrency") !== this.props?.fieldsObj?.plantCurrency) */ ? this.props.fieldsObj.NetPowerCostPerUnit : this.props.fieldsObj?.NetPowerCostPerUnitLocalConversion),
          VendorPlant: [],
          EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
          CountryId: country?.value,
          CityId: city?.value,
          SEBChargesDetails: [
            {
              PowerSEBPCId: '',
              MinDemandKWPerMonth: values.MinDemandKWPerMonth,
              DemandChargesPerKW: values.DemandChargesPerKW,
              AvgUnitConsumptionPerMonth: values.AvgUnitConsumptionPerMonth,
              UnitConsumptionPerAnnum: this.state.power.AvgUnitConsumptionPerMonth,
              MaxDemandChargesKW: values.MaxDemandChargesKW,
              CostPerUnit: this.state.power.SEBCostPerUnit,
              MeterRentAndOtherChargesPerAnnum: values.MeterRentAndOtherChargesPerAnnum,
              DutyChargesAndFCA: values.DutyChargesAndFCA,
              TotalUnitCharges: this.state.power.TotalUnitCharges,
              PowerContributaionPersentage: values.SEBPowerContributaion,
              OtherCharges: 0,
              // EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss')
            }
          ],
          SGChargesDetails: selfGridDataArray,
          LoggedInUserId: loggedInUserId(),
          NetPowerCostPerUnitConversion: isDetailEntry ? NetContributionConvertedInBaseCurrency : NetPowerCostPerUnitConversion,
          NetPowerCostPerUnitLocalConversion: NetPowerCostPerUnitLocalConversion,
          PowerEntryType: isImport ? ENTRY_TYPE_IMPORT : ENTRY_TYPE_DOMESTIC,
          ExchangeRateSourceName: this.state.ExchangeSource?.label || null,
          LocalCurrencyId: isImport ? this.state?.plantCurrencyID : null,
          LocalCurrency: isImport ? this.props?.fieldsObj?.plantCurrency : null,
          LocalExchangeRateId: isImport ? this.state?.plantExchangeRateId : null,
          LocalCurrencyExchangeRate: isImport ? this.state?.plantCurrency : null,
          ExchangeRate: isImport ? this.state?.settlementCurrency : this.state?.plantCurrency,
          ExchangeRateId: isImport ? this.state?.settlementExchangeRateId : this.state?.plantExchangeRateId,
          CurrencyId: isImport ? this.state.currency?.value : this.state?.plantCurrencyID,
          Currency: isImport ? this.state?.currency?.label : this.props.fieldsObj?.plantCurrency,
        }

        this.props.createPowerDetail(formData, (res) => {
          this.setState({ setDisable: false })
          if (res?.data?.Result) {
            Toaster.success(MESSAGES.POWER_DETAIL_ADD_SUCCESS);
            this.cancel('submit');
          }
        });
      }
    }
  }, 500)

  handleKeyDown = function (e) {
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault();
    }
  };

  isDetailEntryChange = () => {
    this.setState({ isDetailEntry: !this.state.isDetailEntry })

  }

  handleClient = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ client: newValue }, () => {
        if (this.props.fieldsObj?.plantCurrency !== reactLocalStorage?.getObject("baseCurrency")) {
          this.callExchangeRateAPI();
        }
      });
    } else {
      this.setState({ client: [] })
    }
  };
  importToggle = () => {
    this.setState({ isImport: !this.state.isImport })
  }

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
        : ''}<p>Exchange Rate: 1 {plantCurrencyLabel} = {settlementCurrencyRate} {baseCurrency}</p>
    </>;
  };
  powerRateTitle = () => {
    const rateLabel = this.state.isImport ? `Net Cost/Unit (${this.state?.currency?.label ?? 'Currency'})` : `Net Cost/Unit (${this.props.fieldsObj?.plantCurrency ?? 'Plant Currency'})`
    return {
      tooltipTextPlantCurrency: `${rateLabel} * Plant Currency Rate (${this.state?.plantCurrency ?? ''})`,
      toolTipTextNetCostBaseCurrency: `${rateLabel} * Currency Rate (${this.state?.settlementCurrency ?? ''})`,
    };
  };
  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { handleSubmit, initialConfiguration, t } = this.props;
    const { isEditFlag, source, isOpenVendor, isCostPerUnitConfigurable, isEditFlagForStateElectricity,
      checkPowerContribution, netContributionValue, isViewMode, setDisable, costingTypeId, isDetailEntry, hidePlantCurrency } = this.state;
    const VendorLabel = LabelsClass(t, 'MasterLabels').vendorLabel;

    const filterList = async (inputValue) => {
      const { vendorFilterList } = this.state
      if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
        inputValue = inputValue.trim();
      }
      const resultInput = inputValue.slice(0, searchCount)
      if (inputValue?.length >= searchCount && vendorFilterList !== resultInput) {
        let res
        res = await getVendorNameByVendorSelectList(VBC_VENDOR_TYPE, resultInput)
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
          <div className="login-container signup-form">
            <div className="row">
              <div className="col-md-12">
                <div className="shadow-lgg login-formg">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-heading mb-0">
                        <h1>{isViewMode ? "View" : isEditFlag ? "Update" : "Add"} Power
                          <TourWrapper
                            buttonSpecificProp={{ id: "Add_Power_Form" }}
                            stepsSpecificProp={{
                              steps: Steps(t).ADD_POWER
                            }} />
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
                          {(reactLocalStorage.getObject('CostingTypePermission').zbc) && <Label id="AddPower_zerobased" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
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
                          {(reactLocalStorage.getObject('CostingTypePermission').vbc) && <Label id="AddPower_vendorbased" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
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
                          {(reactLocalStorage.getObject('CostingTypePermission').cbc) && <Label id="AddPower_customerbased" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3 pt-0 radio-box"} check>
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
                      </Row >


                      <Row>
                        <Col md="12" className="filter-block">
                          <div className=" mb-2">
                            <h5>{'Power For:'}</h5>
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
                              validate={(this.state.country == null || this.state.country.length === 0) ? [required] : []}
                              required={true}
                              handleChangeDescription={this.countryHandler}
                              valueDescription={this.state.country}
                              disabled={isViewMode || isEditFlag}
                            />
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
                                validate={(this.state.StateName == null || this.state.StateName.length === 0) ? [required] : []}
                                required={true}
                                handleChangeDescription={this.stateHandler}
                                valueDescription={this.state.StateName}
                                disabled={isViewMode || isEditFlag}
                              />
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
                              validate={(this.state.city == null || this.state.city.length === 0) ? [required] : []}
                              required={true}
                              handleChangeDescription={this.cityHandler}
                              valueDescription={this.state.city}
                              disabled={isViewMode || isEditFlag}
                            />
                          </div>
                        </Col>


                        {costingTypeId === VBCTypeId && <Col md="3">
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
                                isDisabled={isEditFlag ? true : false}
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



                        <Col md="3">
                          <div className="d-flex justify-space-between align-items-center inputwith-icon">
                            <div className="fullinput-icon">
                              <Field
                                label="Plant (Code)"
                                name="Plant"
                                title={showDataOnHover(this.state.selectedPlants)}
                                placeholder="Select"
                                selection={(this.state.selectedPlants == null || this.state.selectedPlants.length === 0) ? [] : this.state.selectedPlants}
                                options={this.renderListing('plant')}
                                selectionChanged={this.handlePlants}
                                optionValue={option => option.Value}
                                optionLabel={option => option.Text}
                                component={renderMultiSelectField}
                                validate={
                                  this.state.selectedPlants == null || this.state.selectedPlants.length === 0 ? [required] : []}
                                mendatory={true}
                                required={true}
                                className="multiselect-with-border"
                                disabled={isEditFlag ? true : false}
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
                              disabled={isEditFlag || isEditFlag}
                              valueDescription={this.state?.ExchangeSource}
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
                        {this.state?.isImport && <Col md="3">
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
                            disabled={isEditFlag ? true : false || isViewMode}
                            customClassName="mb-1"
                          >
                            {this.state?.currency?.label && this.state?.showWarning && <WarningMessage dClass="mt-1" message={`${this.state?.currency?.label} rate is not present in the Exchange Master`} />}
                          </Field>
                        </Col>}
                        <Col md="3">
                          <div className="d-flex justify-space-between align-items-center inputwith-icon">
                            <div className="fullinput-icon">
                              <div className="form-group">
                                <div className="inputbox date-section form-group">
                                  <Field
                                    label="Effective Date"
                                    name="EffectiveDate"
                                    onChange={this.handleEffectiveDateChange}
                                    type="text"
                                    validate={[required]}
                                    autoComplete={'off'}
                                    required={true}
                                    changeHandler={(e) => { }}
                                    component={renderDatePicker}
                                    className="form-control"
                                    disabled={(isEditFlag || isViewMode) ? true : false}
                                    placeholder={isViewMode ? '-' : "Select Date"}
                                    onFocus={() => onFocus(this, true)}
                                    minDate={getEffectiveDateMinDate()}
                                    maxDate={getEffectiveDateMaxDate()}


                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </Col>

                        {!isDetailEntry &&
                          <>
                            {this.state.isImport && < Col md="3">
                              <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                <div className="fullinput-icon">
                                  <Field
                                    label={`Net Cost/Unit (${this.state?.currency?.label ?? 'Currency'})`}
                                    name={"NetPowerCostPerUnit"}
                                    type="text"
                                    placeholder={isViewMode ? '-' : 'Enter'}
                                    validate={[required, positiveAndDecimalNumber, maxLength10, decimalLengthFour, number]}
                                    component={renderTextInputField}
                                    onChange={this.onNetCostChange}
                                    required={true}
                                    className=""
                                    customClassName=" withBorder"
                                    disabled={isViewMode}
                                  />
                                </div>
                              </div>
                            </Col>}
                            < Col md="3">
                              {this.state.isImport && <TooltipCustom disabledIcon={true} id="cost-local" tooltipText={hidePlantCurrency ? this.powerRateTitle()?.toolTipTextNetCostBaseCurrency : this.powerRateTitle()?.tooltipTextPlantCurrency} />}
                              <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                <div className="fullinput-icon">
                                  <Field
                                    label={`Net Cost/Unit (${this.props.fieldsObj?.plantCurrency ?? 'Plant Currency'})`}
                                    name={"NetPowerCostPerUnitLocalConversion"}
                                    type="text"
                                    id="cost-local"
                                    placeholder={isViewMode || this.state.isImport ? '-' : 'Enter'}
                                    validate={[required, positiveAndDecimalNumber, maxLength10, decimalLengthFour, number]}
                                    component={renderTextInputField}
                                    onChange={this.onNetCostChange}
                                    required={true}
                                    className=""
                                    customClassName=" withBorder"
                                    disabled={isViewMode || this.state.isImport}
                                  />
                                </div>
                              </div>
                            </Col>

                            {!this.state.hidePlantCurrency && < Col md="3">
                              <TooltipCustom disabledIcon={true} id="fuel-rate" tooltipText={this.state.isImport ? this.powerRateTitle()?.toolTipTextNetCostBaseCurrency : this.powerRateTitle()?.tooltipTextPlantCurrency} />
                              <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                <div className="fullinput-icon">
                                  <Field
                                    label={`Net Cost/Unit (${reactLocalStorage.getObject("baseCurrency")})`}
                                    name={"NetPowerCostPerUnitConversion"}
                                    id="fuel-rate"
                                    type="text"
                                    placeholder={'-'}
                                    validate={[required, positiveAndDecimalNumber, maxLength10, decimalLengthFour, number]}
                                    component={renderTextInputField}
                                    // onChange={this.onNetCostChange}
                                    required={true}
                                    className=""
                                    customClassName=" withBorder"
                                    disabled={true}
                                  />
                                </div>
                              </div>
                            </Col>}
                          </>
                        }

                        <Col md="3" className={ "mt30 pt-1"}>
                          <label id="AddPower_AddMoreDetails"
                            className={`custom-checkbox w-auto ${isDetailEntry ? 'mb-3' : ''}`}
                            onChange={this.isDetailEntryChange}
                          >
                            Add More Details
                            <input
                              type="checkbox"
                              checked={this.state.isDetailEntry}
                              disabled={isViewMode || isEditFlag}
                            />
                            <span
                              className=" before-box p-0"
                              checked={this.state.isDetailEntry}
                              onChange={this.isDetailEntryChange}
                            />
                          </label>
                        </Col>
                      </Row>


                      {
                        isDetailEntry &&
                        <>
                          <Row className='child-form-container'>
                            <Col md="12" className="filter-block">
                              <div className=" mb-2">
                                <h5>{'State Electricity Board Power Charges:'}</h5>
                              </div>
                            </Col>
                            <Col md="3">
                              <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                <div className="fullinput-icon">
                                  <Field
                                    label={`Min Demand kW/Month`}
                                    name={"MinDemandKWPerMonth"}
                                    type="text"
                                    placeholder={isEditFlagForStateElectricity || isViewMode ? '-' : 'Enter'}
                                    validate={isCostPerUnitConfigurable ? [] : [required, positiveAndDecimalNumber, maxLength10, decimalLengthFour, number]}
                                    component={renderTextInputField}
                                    required={!isCostPerUnitConfigurable ? true : false}
                                    className=""
                                    customClassName=" withBorder"
                                    disabled={isEditFlagForStateElectricity || isViewMode ? true : false}
                                  />
                                  {this.state.errorObj.minDemand && (this.props.fieldsObj.MinDemandKWPerMonth === undefined || Number(this.props.fieldsObj.MinDemandKWPerMonth) === 0) && <div className='text-help p-absolute'>This field is required.</div>}
                                </div>
                              </div>
                            </Col>
                            <Col md="3">
                              <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                <div className="fullinput-icon">
                                  <Field
                                    label={`Demand Charges/kW (${reactLocalStorage.getObject("baseCurrency")})`}
                                    name={"DemandChargesPerKW"}
                                    type="text"
                                    placeholder={isEditFlagForStateElectricity || isViewMode ? '-' : 'Enter'}
                                    validate={isCostPerUnitConfigurable ? [] : [required, positiveAndDecimalNumber, maxLength10, decimalLengthFour, number]}
                                    component={renderTextInputField}
                                    required={!isCostPerUnitConfigurable ? true : false}
                                    className=""
                                    customClassName=" withBorder"
                                    disabled={isEditFlagForStateElectricity || isViewMode ? true : false}
                                  />
                                  {this.state.errorObj.demandCharge && (this.props.fieldsObj.DemandChargesPerKW === undefined || Number(this.props.fieldsObj.DemandChargesPerKW) === 0) && <div className='text-help p-absolute'>This field is required.</div>}
                                </div>
                              </div>
                            </Col>
                            <Col md="3">
                              <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                <div className="fullinput-icon">
                                  <TooltipCustom id={"MinMonthlyCharge"} width="350px" disabledIcon={true} tooltipText={`Min Monthly Charge = Min Demand kW per Month * Demand Charges per kW`} />
                                  <Field
                                    label={`Min Monthly Charge`}
                                    name={"MinMonthlyCharge"}
                                    id={"MinMonthlyCharge"}
                                    type="text"
                                    placeholder={'-'}
                                    component={renderTextInputField}
                                    className=""
                                    customClassName=" withBorder"
                                    disabled={true}
                                  />
                                </div>
                              </div>
                            </Col>
                            <Col md="3">
                              <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                <div className="fullinput-icon">
                                  <Field
                                    label={`Avg. Unit Consumption/Month`}
                                    name={"AvgUnitConsumptionPerMonth"}
                                    type="text"
                                    placeholder={isEditFlagForStateElectricity || isViewMode ? '-' : 'Enter'}
                                    validate={isCostPerUnitConfigurable ? [] : [required, positiveAndDecimalNumber, maxLength10, decimalLengthFour, number]}
                                    component={renderTextInputField}
                                    required={!isCostPerUnitConfigurable ? true : false}
                                    className=""
                                    customClassName=" withBorder"
                                    disabled={isEditFlagForStateElectricity || isViewMode ? true : false}
                                  />
                                  {this.state.errorObj.avgUnit && (this.props.fieldsObj.AvgUnitConsumptionPerMonth === undefined || Number(this.props.fieldsObj.AvgUnitConsumptionPerMonth) === 0) && <div className='text-help p-absolute'>This field is required.</div>}
                                </div>
                              </div>
                            </Col>
                            <Col md="3">
                              <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                <div className="fullinput-icon">
                                  <TooltipCustom id={"UnitConsumptionPerAnnum"} width="350px" disabledIcon={true} tooltipText={`Unit Consumption per Annum = Avg. Unit Consumption per Month * 12`} />
                                  <Field
                                    label={`Unit Consumption/Annum`}
                                    name={"UnitConsumptionPerAnnum"}
                                    type="text"
                                    id={"UnitConsumptionPerAnnum"}
                                    placeholder={'-'}
                                    validate={[]}
                                    component={renderTextInputField}
                                    required={false}
                                    className=""
                                    customClassName=" withBorder"
                                    disabled={true}
                                  />
                                </div>
                              </div>
                            </Col>
                            <Col md="3">
                              <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                <div className="fullinput-icon">
                                  <Field
                                    label={`Max Demand Charges/kW (${reactLocalStorage.getObject("baseCurrency")})`}
                                    name={"MaxDemandChargesKW"}
                                    type="text"
                                    placeholder={isEditFlagForStateElectricity || isViewMode ? '-' : 'Enter'}
                                    validate={isCostPerUnitConfigurable ? [] : [required, positiveAndDecimalNumber, maxLength10, decimalLengthFour, number]}
                                    component={renderTextInputField}
                                    required={!isCostPerUnitConfigurable ? true : false}
                                    className=""
                                    customClassName=" withBorder"
                                    disabled={isEditFlagForStateElectricity || isViewMode ? true : false}
                                  />
                                  {this.state.errorObj.maxDemand && (this.props.fieldsObj.MaxDemandChargesKW === undefined || Number(this.props.fieldsObj.MaxDemandChargesKW) === 0) && <div className='text-help p-absolute'>This field is required.</div>}
                                </div>
                              </div>
                            </Col>
                            <Col md="3">
                              <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                <div className="fullinput-icon">
                                  <TooltipCustom id={"SEBCostPerUnit"} width="350px" disabledIcon={true} tooltipText={this.state.costPerUnitTooltipText} />
                                  <Field
                                    label={`Cost/Unit`}
                                    name={"SEBCostPerUnit"}
                                    id="SEBCostPerUnit"
                                    type="text"
                                    placeholder={!isCostPerUnitConfigurable || isViewMode ? '-' : 'Enter'}
                                    component={renderTextInputField}
                                    className=""
                                    customClassName=" withBorder"
                                    disabled={!isCostPerUnitConfigurable || isViewMode ? true : false}
                                  />
                                </div>
                              </div>
                            </Col>
                            <Col md="3">
                              <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                <div className="fullinput-icon">
                                  <Field
                                    label={`Meter Rent & Other Charges/Yr`}
                                    name={"MeterRentAndOtherChargesPerAnnum"}
                                    type="text"
                                    placeholder={isEditFlagForStateElectricity || isViewMode ? '-' : 'Enter'}
                                    validate={[positiveAndDecimalNumber, maxLength10, decimalLengthFour, number]}
                                    component={renderTextInputField}
                                    className=""
                                    customClassName=" withBorder"
                                    disabled={isEditFlagForStateElectricity || isViewMode ? true : false}
                                  />
                                </div>
                              </div>
                            </Col>
                            <Col md="3">
                              <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                <div className="fullinput-icon">
                                  <Field
                                    label={`Duty charges & FCA`}
                                    name={"DutyChargesAndFCA"}
                                    type="text"
                                    placeholder={isEditFlagForStateElectricity || isViewMode ? '-' : 'Enter'}
                                    validate={[positiveAndDecimalNumber, maxLength10, decimalLengthFour, number]}
                                    component={renderTextInputField}
                                    className=""
                                    customClassName=" withBorder"
                                    disabled={isEditFlagForStateElectricity || isViewMode ? true : false}
                                  />
                                </div>
                              </div>
                            </Col>
                            <Col md="2">
                              <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                <div className="fullinput-icon">
                                  <TooltipCustom id={"TotalUnitCharges"} width="360px" disabledIcon={true} tooltipText={"Total Charge per Unit = ((Unit Consumption per Annum * Cost per Unit) + Meter Rent and Other Charges per Annum + Duty Charges and FCA) / Unit Consumption per Annum"} />
                                  <Field
                                    label={`Total Charge/Unit`}
                                    name={this.state.power.TotalUnitCharges === 0 ? '' : "TotalUnitCharges"}
                                    type="text"
                                    id={"TotalUnitCharges"}
                                    placeholder={'-'}
                                    validate={[positiveAndDecimalNumber, maxLength10, number]}
                                    component={renderTextInputField}
                                    required={false}
                                    className=""
                                    customClassName=" withBorder"
                                    disabled={true}
                                  />
                                </div>
                              </div>
                            </Col>

                            <Col md="auto" className="d-flex">

                              <div className="machine-rate-filed pr-3">
                                <Field
                                  label={`Power Contribution %`}
                                  name={"SEBPowerContributaion"}
                                  type="text"
                                  placeholder={isViewMode ? '-' : 'Enter'}
                                  validate={[required, number, maxPercentValue, checkWhiteSpaces, percentageLimitValidation]}
                                  component={renderText}
                                  required={true}
                                  className=""
                                  customClassName=" withBorder"
                                  disabled={this.state.isAddedSEB ? true : isEditFlagForStateElectricity || isViewMode ? true : false}
                                />
                                {this.state.errorObj.statePowerCont && (this.props.fieldsObj.SEBPowerContributaion === undefined || Number(this.props.fieldsObj.SEBPowerContributaion) === 0) && <div className='text-help p-absolute bottom-37'>This field is required.</div>}
                              </div>
                              <div className="btn-mr-rate pr-0 col-auto mt30 pt-1">
                                {this.state.isEditSEBIndex ?
                                  <>
                                    <button
                                      type="button"
                                      className={`btn ${checkPowerContribution ? 'btn-primary button-disabled' : 'btn-primary'}  pull-left mr5`}
                                      onClick={this.updateSEBGrid}
                                      disabled={checkPowerContribution ? true : false}
                                    >Update</button>
                                    <button
                                      type="button"
                                      className={'reset-btn  pull-left'}
                                      onClick={() => this.setState({ isEditSEBIndex: false })}
                                    >Cancel</button>
                                  </>
                                  :
                                  <>
                                    <button
                                      type="button"
                                      className={`${(checkPowerContribution || this.state.isAddedSEB) ? 'btn-secondary' : 'btn-primary'}  pull-left`}
                                      disabled={(checkPowerContribution || this.state.isAddedSEB) ? true : false}
                                      onClick={() => this.powerSEBTableHandler(false)}>
                                      <div className={'plus'}></div>ADD</button>
                                    <button
                                      type="button"
                                      className={'reset-btn  pull-left ml5'}
                                      onClick={this.resetData}
                                      disabled={(checkPowerContribution || this.state.isAddedSEB) ? true : false}
                                    >Reset</button>
                                  </>
                                }

                              </div>

                            </Col>
                          </Row>

                          <Row className='child-form-container'>
                            <Col md="12" className="filter-block">
                              <div className=" mb-2">
                                <h5>{'Self Generated Power Charges:'}</h5>
                              </div>
                            </Col>
                            <Col md="3">
                              <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                <div className="fullinput-icon">
                                  <Field
                                    name="Source"
                                    type="text"
                                    label="Source"
                                    component={searchableSelect}
                                    placeholder={isViewMode ? '-' : 'Select'}
                                    options={this.renderListing('Source')}
                                    required={true}
                                    handleChangeDescription={this.handleSource}
                                    valueDescription={this.state.source}
                                    disabled={isViewMode}
                                  />
                                  {this.state.errorObj.source && (this.state.source.length === 0) && <div className='text-help p-absolute bottom-7'>This field is required.</div>}
                                </div>
                              </div>
                            </Col>
                            <Col md="3">
                              <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                <div className="fullinput-icon">
                                  <Field
                                    label={`Asset Cost (${reactLocalStorage.getObject("baseCurrency")})`}
                                    name={"AssetCost"}
                                    type="text"
                                    placeholder={isViewMode ? '-' : 'Enter'}
                                    validate={[positiveAndDecimalNumber, maxLength10, decimalLengthFour, number]}
                                    component={renderTextInputField}
                                    className=""
                                    customClassName=" withBorder"
                                    disabled={isViewMode}
                                  />
                                </div>
                              </div>
                            </Col>
                            <Col md="3">
                              <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                <div className="fullinput-icon">
                                  <Field
                                    label={`Annual Cost (${reactLocalStorage.getObject("baseCurrency")})`}
                                    name={"AnnualCost"}
                                    type="text"
                                    placeholder={isViewMode ? '-' : 'Enter'}
                                    validate={[positiveAndDecimalNumber, maxLength10, decimalLengthFour, number]}
                                    component={renderTextInputField}
                                    className=""
                                    customClassName=" withBorder"
                                    disabled={isViewMode}
                                  />
                                </div>
                              </div>
                            </Col>
                            {source && source.value === GENERATOR_DIESEL &&
                              <>
                                <Col md="3">
                                  <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                    <div className="fullinput-icon">
                                      <Field
                                        name="UOM"
                                        type="text"
                                        label="UOM"
                                        component={searchableSelect}
                                        placeholder={isViewMode ? '-' : 'Enter'}
                                        options={this.renderListing('UOM')}
                                        handleChangeDescription={this.handleUOM}
                                        valueDescription={this.state.UOM}
                                        disabled={isViewMode}
                                      />
                                    </div>
                                  </div>
                                </Col>
                                <Col md="3">
                                  <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                    <div className="fullinput-icon">
                                      <Field
                                        label={`Cost/UOM `}
                                        name={"CostPerUnitOfMeasurement"}
                                        type="text"
                                        placeholder={isViewMode ? '-' : 'Enter'}
                                        validate={[positiveAndDecimalNumber, maxLength10, decimalLengthThree, number]}
                                        component={renderTextInputField}
                                        className=""
                                        customClassName=" withBorder"
                                        disabled={isViewMode}
                                      />
                                    </div>
                                  </div>
                                </Col>
                                <Col md="3">
                                  <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                    <div className="fullinput-icon">
                                      <Field
                                        label={`Unit Generated/Unit of fuel `}
                                        name={"UnitGeneratedPerUnitOfFuel"}
                                        type="text"
                                        placeholder={isViewMode ? '-' : 'Enter'}
                                        validate={[required, positiveAndDecimalNumber, maxLength10, decimalLengthThree, number]}
                                        component={renderTextInputField}
                                        required={true}
                                        className=""
                                        customClassName=" withBorder"
                                        disabled={isViewMode}
                                      />
                                      {this.state.errorObj.unitGeneratedDiesel && (this.props.fieldsObj.UnitGeneratedPerUnitOfFuel === undefined || Number(this.props.fieldsObj.UnitGeneratedPerUnitOfFuel) === 0) && <div className='text-help p-absolute'>This field is required.</div>}
                                    </div>
                                  </div>
                                </Col>
                              </>}

                            <Col md="3">
                              <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                <div className="fullinput-icon">
                                  <Field
                                    label={`Unit Generated/Annum (kW)`}
                                    name={"UnitGeneratedPerAnnum"}
                                    type="text"
                                    placeholder={isViewMode ? '-' : 'Enter'}
                                    validate={[positiveAndDecimalNumber, maxLength10, decimalLengthThree, number]}
                                    component={renderTextInputField}
                                    required={true}
                                    className=""
                                    customClassName=" withBorder"
                                    disabled={isViewMode}
                                  />
                                  {this.state.errorObj.unitGenerated && (this.props.fieldsObj.UnitGeneratedPerAnnum === undefined || Number(this.props.fieldsObj.UnitGeneratedPerAnnum) === 0) && <div className='text-help p-absolute'>This field is required.</div>}
                                </div>
                              </div>
                            </Col>
                            <Col md="3">
                              <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                <div className="fullinput-icon">
                                  <TooltipCustom id={"SelfGeneratedCostPerUnit"} width="350px" disabledIcon={true} tooltipText={this.state.segCostUnittooltipText} />
                                  <Field
                                    label={`Cost/Unit`}
                                    name={this.state.power.SelfGeneratedCostPerUnit === 0 ? '' : "SelfGeneratedCostPerUnit"}
                                    type="text"
                                    id="SelfGeneratedCostPerUnit"
                                    placeholder={'-'}
                                    component={renderTextInputField}
                                    className=""
                                    customClassName=" withBorder"
                                    disabled={true}
                                  />
                                </div>
                              </div>
                            </Col>
                            <Col md="3">
                              <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                <div className="fullinput-icon">
                                  <Field
                                    label={`Power contribution`}
                                    name={"SelfPowerContribution"}
                                    type="text"
                                    placeholder={isViewMode ? '-' : 'Enter'}
                                    validate={[positiveAndDecimalNumber, maxLength10, decimalLengthThree, number]}
                                    component={renderTextInputField}
                                    required={true}
                                    className=""
                                    customClassName=" withBorder"
                                    disabled={isViewMode}

                                  />
                                  {this.state.errorObj.selfPowerCont && (this.props.fieldsObj.SelfPowerContribution === undefined || Number(this.props.fieldsObj.SelfPowerContribution) === 0) && <div className='text-help p-absolute'>This field is required.</div>}
                                </div>
                              </div>
                            </Col>
                            <Col md="3">
                              <div className='mt-2'>
                                {this.state.isEditIndex ?
                                  <>
                                    <button
                                      type="button"
                                      className={`btn ${checkPowerContribution ? 'btn-secondary' : 'btn-primary'} mt30 pull-left mr5`}
                                      onClick={this.updatePowerGrid}
                                      disabled={checkPowerContribution ? true : false}
                                    >Update</button>

                                    <button
                                      type="button"
                                      className={'reset-btn mt30 pull-left'}
                                      onClick={this.resetPowerGridData}
                                    >Cancel</button>
                                  </>
                                  :
                                  <>
                                    <button
                                      type="button"
                                      className={`${checkPowerContribution ? 'btn-secondary' : 'btn-primary'} mt30 pull-left`}
                                      disabled={checkPowerContribution || isViewMode ? true : false}
                                      onClick={() => this.powerTableHandler(true)}>
                                      <div className={'plus'}></div>ADD</button>
                                    <button
                                      type="button"
                                      className={'reset-btn mt30 ml5 pull-left'}
                                      onClick={this.resetPowerGridData}
                                      disabled={checkPowerContribution || isViewMode ? true : false}
                                    >Reset</button>
                                  </>}
                              </div>
                            </Col>
                            <Col md="12">
                              <Table className="table border" size="sm" >
                                <thead>
                                  <tr>
                                    <th>{`Source`}</th>
                                    <th>{`Cost/Unit (${reactLocalStorage.getObject("baseCurrency")})`}</th>
                                    <th>{`Contribution (%)`}</th>
                                    <th>{`Contribution Value`}</th>
                                    <th>{`Action`}</th>
                                  </tr>
                                </thead>
                                <tbody >
                                  {
                                    this.state.powerGrid &&
                                    this.state.powerGrid.map((item, index) => {

                                      return (
                                        <tr key={index}>
                                          <td>{item.SourcePowerType}</td>
                                          <td>{item.CostPerUnit ? checkForDecimalAndNull(item.CostPerUnit, initialConfiguration?.NoOfDecimalForPrice) : 0}</td>
                                          <td>{item.PowerContributionPercentage}</td>
                                          {/* Ask which value to use for trim */}
                                          <td>{checkForDecimalAndNull(calculatePercentageValue(item.CostPerUnit, item.PowerContributionPercentage), initialConfiguration?.NoOfDecimalForPrice)}</td>
                                          <td>
                                            <button title='Edit' className="Edit mr-2" type={'button'} disabled={isViewMode} onClick={() => this.editItemDetails(index, item.SourcePowerType)} />
                                            <button title='Delete' className="Delete" type={'button'} disabled={isViewMode} onClick={() => this.deleteItem(index)} />
                                          </td>
                                        </tr>
                                      )
                                    })
                                  }
                                </tbody>

                                <tfoot>
                                  <tr className="bluefooter-butn">
                                    <td></td>
                                    <td colSpan="2" className='text-end'>
                                        {this.state.isImport &&
                                          <strong className='d-block mb-1'>{`Net Contribution Value (${this.props.fieldsObj?.plantCurrency ?? 'Currency'}):`}</strong>
                                        }
                                        <strong className='d-block mb-1'>{`Net Contribution Value (${this.state?.isImport ? this.state?.currency?.label ?? 'Currency' : this.props?.fieldsObj?.plantCurrency ?? 'Currency'}):`}</strong>
                                        {!this.state.hidePlantCurrency &&
                                          <strong className='d-block mb-1'>{`Net Contribution Value (${reactLocalStorage.getObject("baseCurrency")}):`}</strong>
                                        }
                                    </td>
                                    <td colSpan="2">
                                        {this.state.isImport &&
                                          <label className='d-block w-auto mb-1'>{checkForDecimalAndNull(this.state.netContributionConvertedInLocalCurrency, initialConfiguration?.NoOfDecimalForPrice)}</label>
                                        }
                                        <label className='d-block w-auto mb-1'>{checkForDecimalAndNull(this.state.netContributionValue, initialConfiguration?.NoOfDecimalForPrice)}</label>
                                        {!this.state.hidePlantCurrency &&
                                          <label className='d-block w-auto mb-1'>{checkForDecimalAndNull(this.state.netContributionConvertedInBaseCurrency, initialConfiguration?.NoOfDecimalForPrice)}</label>
                                        }
                                    </td>
                                  </tr>
                                </tfoot>

                                {this.state.powerGrid.length === 0 && <tbody>
                                  <tr>
                                    <td colSpan="5">
                                      <NoContentFound title={EMPTY_DATA} />
                                    </td>
                                  </tr>
                                </tbody>}
                              </Table>

                            </Col>
                          </Row>
                        </>
                      }
                    </div >
                    <Row className="sf-btn-footer no-gutters bottom-footer justify-content-between">
                      <div className="col-sm-12 text-right bluefooter-butn">
                        <button id="AddPower_Cancel"
                          type={'button'}
                          className="mr15 cancel-btn"
                          onClick={this.cancelHandler}
                          disabled={setDisable}
                        >
                          <div className={"cancel-icon"}></div> {'Cancel'}
                        </button>
                        {!isViewMode && <button id="AddPower_Save"
                          type="submit"
                          disabled={isViewMode || setDisable || this?.state?.isDisabled}
                          className="user-btn mr5 save-btn" >
                          <div className={"save-icon"}></div>
                          {isEditFlag ? 'Update' : 'Save'}
                        </button>}
                      </div>
                    </Row>

                  </form >
                </div >
              </div >
            </div >
          </div >
        </div >
        {
          this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.CANCEL_MASTER_ALERT}`} />
        }
        {
          isOpenVendor && <AddVendorDrawer
            isOpen={isOpenVendor}
            closeDrawer={this.closeVendorDrawer = this.closeVendorDrawer.bind(this)}
            isEditFlag={false}
            ID={''}
            anchor={'right'}
          />
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
  const { comman, fuel, supplier, auth, client } = state;
  const fieldsObj = selector(state, 'MinDemandKWPerMonth', 'DemandChargesPerKW', 'AvgUnitConsumptionPerMonth',
    'UnitConsumptionPerAnnum', 'MaxDemandChargesKW', 'SEBCostPerUnit', 'MeterRentAndOtherChargesPerAnnum',
    'DutyChargesAndFCA', 'TotalUnitCharges', 'SEBPowerContributaion', 'AssetCost', 'AnnualCost',
    'CostPerUnitOfMeasurement', 'UnitGeneratedPerUnitOfFuel', 'UnitGeneratedPerAnnum', 'SelfGeneratedCostPerUnit',
    'SelfPowerContribution', 'NetPowerCostPerUnit', 'city', 'state', 'country', 'plantCurrency', 'NetPowerCostPerUnitLocalConversion', 'NetPowerCostPerUnitConversion', "NetPowerCostPerUnit", "Currency", "ExchangeSource", "NetPowerCostPerUnitLocalConversion", "NetPowerCostPerUnit", "SEBBaseCostPerUnitConversion", "SEBCostPerUnitLocalConversion");

  const { powerTypeSelectList, UOMSelectList, filterPlantList, stateList, countryList, cityList, currencySelectList, exchangeRateSourceList } = comman;
  const { vendorWithVendorCodeSelectList } = supplier;
  const { plantSelectList, powerData } = fuel;
  const { initialConfiguration } = auth;
  const { clientSelectList } = client;
  // 
  let initialValues = {};
  if (powerData && powerData.SEBChargesDetails && powerData.SEBChargesDetails.length > 0) {
    initialValues = {
      MinDemandKWPerMonth: powerData && powerData.SEBChargesDetails[0].MinDemandKWPerMonth,
      DemandChargesPerKW: powerData && powerData.SEBChargesDetails[0].DemandChargesPerKW,
      AvgUnitConsumptionPerMonth: powerData && powerData.SEBChargesDetails[0].AvgUnitConsumptionPerMonth,
      UnitConsumptionPerAnnum: powerData && powerData.SEBChargesDetails[0].UnitConsumptionPerAnnum,
      MaxDemandChargesKW: powerData && powerData.SEBChargesDetails[0].MaxDemandChargesKW,
      //SEBCostPerUnit: powerData && powerData.SEBChargesDetails[0].CostPerUnit,
      MeterRentAndOtherChargesPerAnnum: powerData && powerData.SEBChargesDetails[0].MeterRentAndOtherChargesPerAnnum,
      DutyChargesAndFCA: powerData && powerData.SEBChargesDetails[0].DutyChargesAndFCA,
      TotalUnitCharges: powerData && powerData.SEBChargesDetails[0].TotalUnitCharges,
      //effectiveDate: powerData && powerData.SEBChargesDetails[0].EffectiveDate,
      // SEBPowerContributaion: powerData && powerData.SEBChargesDetails[0].PowerContributaionPersentage,
    }
  }

  return {
    vendorWithVendorCodeSelectList, powerTypeSelectList, UOMSelectList, filterPlantList,
    plantSelectList, powerData, initialValues, fieldsObj, initialConfiguration, stateList, clientSelectList, countryList, cityList, currencySelectList, exchangeRateSourceList
  }
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
  getPowerTypeSelectList,
  getUOMSelectList,
  getPlantBySupplier,
  getFuelByPlant,
  createPowerDetail,
  updatePowerDetail,
  createVendorPowerDetail,
  updateVendorPowerDetail,
  getPlantListByAddress,
  getDieselRateByStateAndUOM,
  getPowerDetailData,
  getVendorPowerDetailData,
  getClientSelectList,
  getExchangeRateByCurrency,
  getPlantUnitAPI,
  getExchangeRateSource,
  getCurrencySelectList,
  fetchCountryDataAPI,
  fetchCityDataAPI,
  getCityByCountryAction,
  fetchStateDataAPI,
  getPlantCurrencyByPlantIds,
})(reduxForm({
  form: 'AddPower',
  validate: validateForm,
  enableReinitialize: true,
  touchOnChange: true,
  onSubmitFail: errors => {
    focusOnError(errors);
  },
})(withTranslation(['FuelPowerMaster'])(AddPower)),
)
