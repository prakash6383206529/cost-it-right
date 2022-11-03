import React, { Component, } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Row, Col, Table } from 'reactstrap';
import { required, checkForNull, getVendorCode, checkForDecimalAndNull, positiveAndDecimalNumber, maxLength10, checkPercentageValue, decimalLengthFour, decimalLengthThree } from "../../../helper/validation";
import { renderNumberInputField, searchableSelect, renderMultiSelectField, focusOnError, renderDatePicker } from "../../layout/FormInputs";
import { getPowerTypeSelectList, getUOMSelectList, getPlantBySupplier, getAllCity, fetchStateDataAPI } from '../../../actions/Common';
import { getVendorWithVendorCodeSelectList, } from '../actions/Supplier';
import {
  getFuelByPlant, createPowerDetail, updatePowerDetail, getPlantListByState, createVendorPowerDetail, updateVendorPowerDetail, getDieselRateByStateAndUOM,
  getPowerDetailData, getVendorPowerDetailData,
} from '../actions/Fuel';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { GENERATOR_DIESEL, searchCount, SPACEBAR, } from '../../../config/constants';
import { EMPTY_DATA } from '../../../config/constants'
import { loggedInUserId } from "../../../helper/auth";
import Switch from "react-switch";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import NoContentFound from '../../common/NoContentFound';
import AddVendorDrawer from '../supplier-master/AddVendorDrawer';
import DayTime from '../../common/DayTimeWrapper'
import { calculatePercentageValue, onFocus, showDataOnHover } from '../../../helper';
import { AcceptablePowerUOM } from '../../../config/masterData';
import LoaderCustom from '../../common/LoaderCustom';
import _, { debounce } from 'lodash';
import AsyncSelect from 'react-select/async';
import { reactLocalStorage } from 'reactjs-localstorage';
import { autoCompleteDropdown } from '../../common/CommonFunctios';

const selector = formValueSelector('AddPower');

class AddPower extends Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    this.state = {
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

      isOpenVendor: false,

      source: [],
      UOM: [],
      isCostPerUnitConfigurable: false,
      checkPowerContribution: false,
      isAddedSEB: false,
      isEditSEBIndex: false,

      netContributionValue: 0,

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
      showErrorOnFocus: false
    }
  }

  /**
   * @method componentDidMount
   * @description Called after rendering the component
   */
  componentDidMount() {
    if (!this.state.isViewMode) {
      this.props.getPowerTypeSelectList(() => { })
      this.props.getUOMSelectList(() => { })
    }
    if (!(this.props.data.isEditFlag || this.props.data.isViewFlag)) {
      this.props.getAllCity(countryId => {
        this.props.fetchStateDataAPI(countryId, () => { })
      })
      this.props.getPlantListByState('', () => { })
      this.props.getPlantBySupplier('', () => { })
      this.props.getPowerDetailData('', () => { })
    }
    this.getDetails();
  }

  componentDidUpdate(prevProps) {
    if (this.props.fieldsObj !== prevProps.fieldsObj) {
      const { SelfPowerContribution, SEBPowerContributaion } = this.props.fieldsObj
      // if (Number(SelfPowerContribution) > 100 || Number(SelfPowerContribution) !== 0) {
      checkPercentageValue(SelfPowerContribution, "Power contribution percentage should not be more than 100") ? this.props.change('SelfPowerContribution', SelfPowerContribution) : this.props.change('SelfPowerContribution', 0)
      // }
      // if (Number(SEBPowerContributaion) > 100 || Number(SEBPowerContributaion) !== 0) {
      checkPercentageValue(SEBPowerContributaion, "Power contribution percentage should not be more than 100") ? this.props.change('SEBPowerContributaion', SEBPowerContributaion) : this.props.change('SEBPowerContributaion', 0)
      // }
      this.SEBPowerCalculation()
      this.selfPowerCalculation()
      this.powerContributionCalculation()
      this.minMonthlyChargeCalculation()

    }
  }
  componentWillUnmount() {
    reactLocalStorage?.setObject('vendorData', [])
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
    this.props.change('MinMonthlyCharge', minMonthlyCharge === 0 ? '' : checkForDecimalAndNull(minMonthlyCharge, initialConfiguration.NoOfDecimalForPrice))
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
      this.props.change('UnitConsumptionPerAnnum', checkForDecimalAndNull(AvgUnitConsumptionPerMonth, initialConfiguration.NoOfDecimalForInputOutput))
    }

    //Formula for SEB COST PER UNIT calculation
    if (!isCostPerUnitConfigurable) {
      if (AvgUnitConsumptionPerMonth <= MinDemandKWPerMonth) {
        const SEBCostPerUnit = checkForNull((MinDemandKWPerMonth * DemandChargesPerKW) / AvgUnitConsumptionPerMonth);
        power.SEBCostPerUnit = SEBCostPerUnit
        this.setState({
          power: { ...power, SEBCostPerUnit: power.SEBCostPerUnit }
        })
        this.props.change('SEBCostPerUnit', SEBCostPerUnit === 0 ? '' : checkForDecimalAndNull(SEBCostPerUnit, initialConfiguration.NoOfDecimalForPrice))
      } else {
        const SEBCostPerUnit = checkForNull(((MinDemandKWPerMonth * DemandChargesPerKW) + ((AvgUnitConsumptionPerMonth - MinDemandKWPerMonth) * MaxDemandChargesKW)) / AvgUnitConsumptionPerMonth);

        power.SEBCostPerUnit = SEBCostPerUnit
        this.setState({
          power: { ...power, SEBCostPerUnit: power.SEBCostPerUnit }
        })
        this.props.change('SEBCostPerUnit', SEBCostPerUnit === 0 ? '' : checkForDecimalAndNull(SEBCostPerUnit, initialConfiguration.NoOfDecimalForPrice))
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
    this.props.change('TotalUnitCharges', checkForDecimalAndNull(TotalUnitCharges, initialConfiguration.NoOfDecimalForPrice))
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
      this.props.change('SelfGeneratedCostPerUnit', checkForDecimalAndNull(SelfGeneratedCostPerUnit, initialConfiguration.NoOfDecimalForPrice))
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
      this.props.change('SelfGeneratedCostPerUnit', checkForDecimalAndNull(SelfGeneratedCostPerUnit, initialConfiguration.NoOfDecimalForPrice))
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
    if (data && data.isEditFlag && data.IsVendor) {
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
          }, 200)
        }
      })

    } else if (data && data.isEditFlag && data.IsVendor === false) {
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

            this.setState({
              isEditFlag: true,
              isLoader: false,
              IsVendor: Data.IsVendor,
              netContributionValue: Data.NetPowerCostPerUnit,
              isAddedSEB: Data.SEBChargesDetails && Data.SEBChargesDetails.length > 0 ? true : false,
              selectedPlants: plantArray,
              StateName: Data.StateName !== undefined ? { label: Data.StateName, value: Data.StateId } : [],
              effectiveDate: DayTime(Data.EffectiveDate),
              powerGrid: tempArray,
            }, () => this.setState({ isLoader: false }))
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
  onPressVendor = () => {
    this.setState({
      IsVendor: !this.state.IsVendor,
      vendorName: [],
    });
  }

  /**
  * @method handleVendorName
  * @description called
  */
  handleVendorName = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ vendorName: newValue, isVendorNameNotSelected: false }, () => {
        const { vendorName } = this.state;
        const result = vendorName && vendorName.label ? getVendorCode(vendorName.label) : '';
        this.setState({ VendorCode: result })
        this.props.getPlantBySupplier(vendorName.value, () => { })
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
      const res = await getVendorWithVendorCodeSelectList(this.state.vendorName)
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
  * @method handleState
  * @description called
  */
  handleState = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ StateName: newValue, selectedPlants: [] }, () => {
        const { StateName } = this.state;
        this.props.getPlantListByState(StateName.value, () => { })
      })
    } else {
      this.setState({ StateName: [], selectedPlants: [] })
      this.props.getPlantListByState('', () => { })
    }
  };

  /**
  * @method handlePlants
  * @description Used handle Plants
  */
  handlePlants = (e) => {
    this.setState({ selectedPlants: e })
  }

  /**
 * @method handleChange
 * @description Handle Effective Date
 */
  handleEffectiveDateChange = (date) => {
    this.setState({
      effectiveDate: date,
    });
  };

  /**
  * @method handleSource
  * @description called
  */
  handleSource = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
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
        const { StateName, UOM } = this.state;

        if (StateName.length === 0) {
          Toaster.warning("Please select state first.")
          return false
        }

        let data = { StateID: StateName.value, UOMID: UOM.value }
        this.props.getDieselRateByStateAndUOM(data, (res) => {
          let DynamicData = res.data.DynamicData;
          this.props.change('CostPerUnitOfMeasurement', DynamicData.FuelRate)
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
      if (fieldsObj.SelfPowerContribution === undefined || Number(fieldsObj.SelfPowerContribution) === 0) {
        this.setState({ errorObj: { ...this.state.errorObj, selfPowerCont: true } })
        count++;
      }
      if (source.label === 'Generator Diesel' && (fieldsObj.UnitGeneratedPerUnitOfFuel === undefined || Number(fieldsObj.UnitGeneratedPerUnitOfFuel) === 0)) {
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
        UnitOfMeasurementId: source && source.value === GENERATOR_DIESEL ? UOM.value : '',
        UnitOfMeasurementName: source && source.value === GENERATOR_DIESEL ? UOM.label : '',
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
      if (source.label === 'Generator Diesel' && (fieldsObj.UnitGeneratedPerUnitOfFuel === undefined || Number(fieldsObj.UnitGeneratedPerUnitOfFuel) === 0)) {
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
        UnitOfMeasurementId: source && source.value === GENERATOR_DIESEL ? UOM.value : '',
        UnitOfMeasurementName: source && source.value === GENERATOR_DIESEL ? UOM.label : '',
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
        UOM: (UOMObj && UOMObj !== undefined && tempData.SourcePowerType === GENERATOR_DIESEL) ? { label: UOMObj.Text, value: UOMObj.Value } : [],
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

  /**
  * @method renderListing
  * @description Used to show type of listing
  */
  renderListing = (label) => {
    const { powerTypeSelectList, UOMSelectList, plantSelectList, stateList } = this.props;
    const temp = [];

    if (label === 'state') {
      stateList && stateList.map(item => {
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

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = debounce((values) => {
    const { isEditFlag, PowerDetailID, IsVendor, VendorCode, selectedPlants, StateName, powerGrid,
      effectiveDate, vendorName, DataToChangeVendor, DataToChangeZ, DropdownChanged,
      handleChange, DeleteChanged, AddChanged } = this.state;

    if (IsVendor && vendorName.length <= 0) {
      this.setState({ isVendorNameNotSelected: true, setDisable: false })      // IF VENDOR NAME IS NOT SELECTED THEN WE WILL SHOW THE ERROR MESSAGE MANUALLY AND SAVE BUTTON WILL NOT BE DISABLED
      return false
    }
    const NetPowerCostPerUnit = powerGrid && powerGrid.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.CostPerUnit * el.PowerContributionPercentage / 100);
    }, 0)
    if (!IsVendor && checkForNull(NetPowerCostPerUnit) === 0) {
      Toaster.warning('Net Contribution value should not be 0.')
      return false
    }
    this.setState({ isVendorNameNotSelected: false })
    let plantArray = selectedPlants && selectedPlants.map((item) => {
      return { PlantName: item.Text, PlantId: item.Value, }
    })

    let selfGridDataArray = powerGrid && powerGrid.filter(el => el.SourcePowerType !== 'SEB')

    if (isEditFlag) {
      if (IsVendor) {
        if (DataToChangeVendor.NetPowerCostPerUnit === values.NetPowerCostPerUnit) {
          this.cancel('cancel')
          return false
        }
        this.setState({ setDisable: true })
        let vendorDetailData = {
          PowerDetailId: PowerDetailID,
          VendorId: vendorName.value,
          VendorName: vendorName.label,
          VendorCode: VendorCode,
          NetPowerCostPerUnit: values.NetPowerCostPerUnit,
          IsVendor: IsVendor,
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
          this.cancel('cancel')
          return false
        }

        this.setState({ setDisable: true })
        let requestData = {
          PowerId: PowerDetailID,
          PlantId: plantArray && plantArray[0]?.PlantId,
          IsVendor: IsVendor,
          Plants: plantArray,
          StateId: StateName.value,
          StateName: StateName.label,
          IsActive: true,
          NetPowerCostPerUnit: NetPowerCostPerUnit,
          VendorPlant: [],
          EffectiveDate: effectiveDate,
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
          NetPowerCostPerUnit: values.NetPowerCostPerUnit,
          IsVendor: IsVendor,
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
          IsVendor: IsVendor,
          PlantId: plantArray && plantArray[0]?.PlantId,
          Plants: plantArray,
          StateId: StateName.value,
          NetPowerCostPerUnit: NetPowerCostPerUnit,
          VendorPlant: [],
          EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
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

  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { handleSubmit, initialConfiguration } = this.props;
    const { isEditFlag, source, isOpenVendor, isCostPerUnitConfigurable, isEditFlagForStateElectricity,
      checkPowerContribution, netContributionValue, isViewMode, setDisable } = this.state;
    const filterList = async (inputValue) => {
      const { vendorName } = this.state
      const resultInput = inputValue.slice(0, 3)
      if (inputValue?.length >= searchCount && vendorName !== resultInput) {
        let res
        res = await getVendorWithVendorCodeSelectList(resultInput)
        this.setState({ vendorName: resultInput })
        let vendorDataAPI = res?.data?.SelectList
        reactLocalStorage?.setObject('vendorData', vendorDataAPI)
        let VendorData = []
        if (inputValue) {
          VendorData = reactLocalStorage?.getObject('vendorData')
          return autoCompleteDropdown(inputValue, VendorData)
        } else {
          return VendorData
        }
      }
      else {
        if (inputValue?.length < searchCount) return false
        else {
          let VendorData = reactLocalStorage?.getObject('vendorData')
          if (inputValue) {
            VendorData = reactLocalStorage?.getObject('vendorData')
            return autoCompleteDropdown(inputValue, VendorData)
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
          <div className="login-container signup-form">
            <div className="row">
              <div className="col-md-12">
                <div className="shadow-lgg login-formg">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-heading mb-0">
                        <h1>{isViewMode ? "View" : isEditFlag ? "Update" : "Add"} Power</h1>
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
                            <div className={'left-title'}>Zero Based</div>
                            <Switch
                              onChange={this.onPressVendor}
                              checked={this.state.IsVendor}
                              id="normal-switch"
                              disabled={isEditFlag ? true : false}
                              background="#4DC771"
                              onColor="#4DC771"
                              onHandleColor="#ffffff"
                              offColor="#4DC771"
                              uncheckedIcon={false}
                              checkedIcon={false}
                              height={20}
                              width={46}
                            />
                            <div className={'right-title'}>Vendor Based</div>
                          </label>
                        </Col>
                      </Row>

                      <Row>
                        {this.state.IsVendor &&
                          <>
                            <Col md="3">

                              <label>{"Vendor Name"}<span className="asterisk-required">*</span></label>
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
                                    noOptionsMessage={({ inputValue }) => inputValue.length < 3 ? "Please enter vendor name/code" : "No results found"}
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
                            </Col>
                            <Col md="3">
                              <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                <div className="fullinput-icon">
                                  <Field
                                    label={`Net Cost/Unit (INR)`}
                                    name={"NetPowerCostPerUnit"}
                                    type="text"
                                    placeholder={isViewMode ? '-' : 'Enter'}
                                    validate={[required, positiveAndDecimalNumber, maxLength10, decimalLengthFour]}
                                    component={renderNumberInputField}
                                    required={true}
                                    className=""
                                    customClassName=" withBorder"
                                    disabled={isViewMode}
                                  />
                                </div>
                              </div>
                            </Col>
                          </>}
                      </Row>

                      {!this.state.IsVendor &&
                        <>
                          <Row>
                            <Col md="12" className="filter-block">
                              <div className=" mb-2">
                                <h5>{'Power For:'}</h5>
                              </div>
                            </Col>
                            <Col md="3">
                              <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                <div className="fullinput-icon">
                                  <Field
                                    name="state"
                                    type="text"
                                    label="State"
                                    component={searchableSelect}
                                    placeholder={isEditFlag ? '-' : 'Select'}
                                    options={this.renderListing('state')}
                                    validate={(this.state.StateName == null || this.state.StateName.length === 0) ? [required] : []}
                                    required={true}
                                    handleChangeDescription={this.handleState}
                                    valueDescription={this.state.StateName}
                                    disabled={isEditFlag ? true : false}
                                  />
                                </div>
                              </div>
                            </Col>
                            <Col md="3">
                              <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                <div className="fullinput-icon">
                                  <Field
                                    label="Plant"
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

                            <Col md="auto">
                              <div className="d-flex justify-space-between align-items-center inputwith-icon date-filed">
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
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Col>

                          </Row>

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
                                    validate={isCostPerUnitConfigurable ? [] : [required, positiveAndDecimalNumber, maxLength10, decimalLengthFour]}
                                    component={renderNumberInputField}
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
                                    label={`Demand Charges/kW (INR)`}
                                    name={"DemandChargesPerKW"}
                                    type="text"
                                    placeholder={isEditFlagForStateElectricity || isViewMode ? '-' : 'Enter'}
                                    validate={isCostPerUnitConfigurable ? [] : [required, positiveAndDecimalNumber, maxLength10, decimalLengthFour]}
                                    component={renderNumberInputField}
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
                                  <Field
                                    label={`Min Monthly Charge`}
                                    name={"MinMonthlyCharge"}
                                    type="text"
                                    placeholder={'-'}
                                    component={renderNumberInputField}
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
                                    validate={isCostPerUnitConfigurable ? [] : [required, positiveAndDecimalNumber, maxLength10, decimalLengthFour]}
                                    component={renderNumberInputField}
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
                                  <Field
                                    label={`Unit Consumption/Annum`}
                                    name={"UnitConsumptionPerAnnum"}
                                    type="text"
                                    placeholder={'-'}
                                    validate={[]}
                                    component={renderNumberInputField}
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
                                    label={`Max Demand Charges/kW (INR)`}
                                    name={"MaxDemandChargesKW"}
                                    type="text"
                                    placeholder={isEditFlagForStateElectricity || isViewMode ? '-' : 'Enter'}
                                    validate={isCostPerUnitConfigurable ? [] : [required, positiveAndDecimalNumber, maxLength10, decimalLengthFour]}
                                    component={renderNumberInputField}
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
                                  <Field
                                    label={`Cost/Unit`}
                                    name={"SEBCostPerUnit"}
                                    type="text"
                                    placeholder={!isCostPerUnitConfigurable || isViewMode ? '-' : 'Enter'}
                                    component={renderNumberInputField}
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
                                    validate={[positiveAndDecimalNumber, maxLength10, decimalLengthFour]}
                                    component={renderNumberInputField}
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
                                    validate={[positiveAndDecimalNumber, maxLength10, decimalLengthFour]}
                                    component={renderNumberInputField}
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
                                  <Field
                                    label={`Total Charge/Unit`}
                                    name={this.state.power.TotalUnitCharges === 0 ? '' : "TotalUnitCharges"}
                                    type="text"
                                    placeholder={'-'}
                                    validate={[positiveAndDecimalNumber, maxLength10]}
                                    component={renderNumberInputField}
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
                                  validate={[required, positiveAndDecimalNumber, maxLength10, decimalLengthThree]}
                                  component={renderNumberInputField}
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
                                    label={`Asset Cost (INR)`}
                                    name={"AssetCost"}
                                    type="text"
                                    placeholder={isViewMode ? '-' : 'Enter'}
                                    validate={[positiveAndDecimalNumber, maxLength10, decimalLengthFour]}
                                    component={renderNumberInputField}
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
                                    label={`Annual Cost (INR)`}
                                    name={"AnnualCost"}
                                    type="text"
                                    placeholder={isViewMode ? '-' : 'Enter'}
                                    validate={[positiveAndDecimalNumber, maxLength10, decimalLengthFour]}
                                    component={renderNumberInputField}
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
                                        placeholder={'Select'}
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
                                        validate={[positiveAndDecimalNumber, maxLength10, decimalLengthThree]}
                                        component={renderNumberInputField}
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
                                        label={`Unit Generated/Unit Of fuel `}
                                        name={"UnitGeneratedPerUnitOfFuel"}
                                        type="text"
                                        placeholder={isViewMode ? '-' : 'Enter'}
                                        validate={[required, positiveAndDecimalNumber, maxLength10, decimalLengthThree]}
                                        component={renderNumberInputField}
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
                                    validate={[positiveAndDecimalNumber, maxLength10, decimalLengthThree]}
                                    component={renderNumberInputField}
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
                                  <Field
                                    label={`Cost/Unit`}
                                    name={this.state.power.SelfGeneratedCostPerUnit === 0 ? '' : "SelfGeneratedCostPerUnit"}
                                    type="text"
                                    placeholder={'-'}
                                    component={renderNumberInputField}
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
                                    validate={[positiveAndDecimalNumber, maxLength10, decimalLengthThree]}
                                    component={renderNumberInputField}
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
                                    <th>{`Cost/Unit (INR)`}</th>
                                    <th>{`Contribution(%)`}</th>
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
                                          <td>{item.CostPerUnit ? checkForDecimalAndNull(item.CostPerUnit, initialConfiguration.NoOfDecimalForPrice) : 0}</td>
                                          <td>{item.PowerContributionPercentage}</td>
                                          {/* Ask which value to use for trim */}
                                          <td>{checkForDecimalAndNull(calculatePercentageValue(item.CostPerUnit, item.PowerContributionPercentage), initialConfiguration.NoOfDecimalForPrice)}</td>
                                          <td>
                                            <button className="Edit mr-2" type={'button'} disabled={isViewMode} onClick={() => this.editItemDetails(index, item.SourcePowerType)} />
                                            <button className="Delete" type={'button'} disabled={isViewMode} onClick={() => this.deleteItem(index)} />
                                          </td>
                                        </tr>
                                      )
                                    })
                                  }
                                </tbody>

                                <tfoot>

                                  <tr className="bluefooter-butn">
                                    <td></td>
                                    <td></td>
                                    <td className="text-right"><label>{`Net Contribution Value:`}</label> </td>
                                    <td><label> {checkForDecimalAndNull(netContributionValue, initialConfiguration.NoOfDecimalForPrice)}</label></td>
                                    <td></td>
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
                    </div>
                    <Row className="sf-btn-footer no-gutters bottom-footer justify-content-between">
                      <div className="col-sm-12 text-right bluefooter-butn">
                        <button
                          type={'button'}
                          className="mr15 cancel-btn"
                          onClick={() => { this.cancel('cancel') }}
                          disabled={setDisable}
                        >
                          <div className={"cancel-icon"}></div> {'Cancel'}
                        </button>
                        <button
                          type="submit"
                          disabled={isViewMode || setDisable}
                          className="user-btn mr5 save-btn" >
                          <div className={"save-icon"}></div>
                          {isEditFlag ? 'Update' : 'Save'}
                        </button>
                      </div>
                    </Row>

                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        {isOpenVendor && <AddVendorDrawer
          isOpen={isOpenVendor}
          closeDrawer={this.closeVendorDrawer = this.closeVendorDrawer.bind(this)}
          isEditFlag={false}
          ID={''}
          anchor={'right'}
        />}
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
  const { comman, fuel, supplier, auth } = state;
  const fieldsObj = selector(state, 'MinDemandKWPerMonth', 'DemandChargesPerKW', 'AvgUnitConsumptionPerMonth',
    'UnitConsumptionPerAnnum', 'MaxDemandChargesKW', 'SEBCostPerUnit', 'MeterRentAndOtherChargesPerAnnum',
    'DutyChargesAndFCA', 'TotalUnitCharges', 'SEBPowerContributaion', 'AssetCost', 'AnnualCost',
    'CostPerUnitOfMeasurement', 'UnitGeneratedPerUnitOfFuel', 'UnitGeneratedPerAnnum', 'SelfGeneratedCostPerUnit',
    'SelfPowerContribution');

  const { powerTypeSelectList, UOMSelectList, filterPlantList, stateList } = comman;
  const { vendorWithVendorCodeSelectList } = supplier;
  const { plantSelectList, powerData } = fuel;
  const { initialConfiguration } = auth;
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
    plantSelectList, powerData, initialValues, fieldsObj, initialConfiguration, stateList
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
  getPlantListByState,
  getDieselRateByStateAndUOM,
  getVendorWithVendorCodeSelectList,
  getPowerDetailData,
  getVendorPowerDetailData,
  getAllCity,
  fetchStateDataAPI
})(reduxForm({
  form: 'AddPower',
  enableReinitialize: true,
  touchOnChange: true,
  onSubmitFail: errors => {
    focusOnError(errors);
  },
})(AddPower));
