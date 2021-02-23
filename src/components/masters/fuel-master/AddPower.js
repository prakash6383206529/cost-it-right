import React, { Component, } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Row, Col, Table } from 'reactstrap';
import { required, checkForNull, trimTwoDecimalPlace, getVendorCode, checkForDecimalAndNull, positiveAndDecimalNumber, maxLength10, postiveNumber, maxLength20, checkPercentageValue } from "../../../helper/validation";
import { renderNumberInputField, searchableSelect, renderMultiSelectField, focusOnError, renderText, } from "../../layout/FormInputs";
import { getPowerTypeSelectList, getUOMSelectList, getPlantBySupplier, } from '../../../actions/Common';
import { getVendorWithVendorCodeSelectList, } from '../actions/Supplier';
import {
  getFuelComboData, createPowerDetail, updatePowerDetail, getPlantListByState,
  createVendorPowerDetail, updateVendorPowerDetail, getDieselRateByStateAndUOM,
  getPowerDetailData, getVendorPowerDetailData,
} from '../actions/Fuel';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import { GENERATOR_DIESEL, } from '../../../config/constants';
import { CONSTANT } from '../../../helper/AllConastant'
import { loggedInUserId } from "../../../helper/auth";
import Switch from "react-switch";
import $ from 'jquery';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import NoContentFound from '../../common/NoContentFound';
import AddVendorDrawer from '../supplier-master/AddVendorDrawer';
import moment from 'moment';
import { calculatePercentageValue } from '../../../helper';
import { AcceptablePowerUOM } from '../../../config/masterData';
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

      StateName: [],

      selectedPlants: [],
      effectiveDate: new Date(),

      powerGridEditIndex: '',
      powerGrid: [],
      isEditIndex: false,

      vendorName: [],
      VendorCode: '',
      selectedVendorPlants: [],
      vendorLocation: [],

      isOpenVendor: false,

      source: [],
      UOM: [],
      isCostPerUnitConfigurable: false,
      checkPowerContribution: false,
      isAddedSEB: false,
      isEditSEBIndex: false,

      netContributionValue: 0,

      power: { minMonthlyCharge: '', AvgUnitConsumptionPerMonth: '', SEBCostPerUnit: '', TotalUnitCharges: '', SelfGeneratedCostPerUnit: '', }
    }
  }

  /**
   * @method componentDidMount
   * @description Called after rendering the component
   */
  componentDidMount() {
    this.props.getPlantListByState('', () => { })
    this.props.getPlantBySupplier('', () => { })
    this.props.getPowerTypeSelectList(() => { })
    this.props.getFuelComboData(() => { })
    this.props.getUOMSelectList(() => { })
    this.props.getVendorWithVendorCodeSelectList();
    this.getDetails();
  }

  componentDidUpdate(prevProps) {
    if (this.props.fieldsObj !== prevProps.fieldsObj) {
      const { SelfPowerContribution, SEBPowerContributaion } = this.props.fieldsObj

      if (SelfPowerContribution) {
        checkPercentageValue(SelfPowerContribution, "Power contribution percentage should not be more than 100") ? this.props.change('SelfPowerContribution', SelfPowerContribution) : this.props.change('SelfPowerContribution', 0)
      }
      if (SEBPowerContributaion) {
        checkPercentageValue(SEBPowerContributaion, "Power contribution percentage should not be more than 100") ? this.props.change('SEBPowerContributaion', SEBPowerContributaion) : this.props.change('SEBPowerContributaion', 0)
      }
      this.SEBPowerCalculation()
      this.selfPowerCalculation()
      this.powerContributionCalculation()
      this.minMonthlyChargeCalculation()

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
    this.props.change('MinMonthlyCharge', checkForDecimalAndNull(minMonthlyCharge, initialConfiguration.NoOfDecimalForPrice))
  }

  /**
   * @method SEBPowerCalculation
   * @description USED TO CALCULATE SEB POWER CALCULATION
   */
  SEBPowerCalculation = () => {
    const { isCostPerUnitConfigurable, power, } = this.state;
    const { fieldsObj, initialConfiguration } = this.props;
    console.log(initialConfiguration, "Config");
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
        const SEBCostPerUnit = ((MinDemandKWPerMonth * DemandChargesPerKW) / AvgUnitConsumptionPerMonth);
        power.SEBCostPerUnit = SEBCostPerUnit
        this.setState({
          power: { ...power, SEBCostPerUnit: power.SEBCostPerUnit }
        })
        this.props.change('SEBCostPerUnit', checkForDecimalAndNull(SEBCostPerUnit, initialConfiguration.NoOfDecimalForPrice))
      } else {
        const SEBCostPerUnit = ((MinDemandKWPerMonth * DemandChargesPerKW) + ((AvgUnitConsumptionPerMonth - MinDemandKWPerMonth) * MaxDemandChargesKW)) / AvgUnitConsumptionPerMonth;

        power.SEBCostPerUnit = SEBCostPerUnit
        this.setState({
          power: { ...power, SEBCostPerUnit: power.SEBCostPerUnit }
        })
        this.props.change('SEBCostPerUnit', checkForDecimalAndNull(SEBCostPerUnit, initialConfiguration.NoOfDecimalForPrice))
      }

    }

    //Formula for TOTAL UNIT CHARGES calculation
    const UnitConsumptionPerAnnum = power.AvgUnitConsumptionPerMonth !== undefined ? checkForNull(power.AvgUnitConsumptionPerMonth) : 0;
    const SEBCostPerUnit = power.SEBCostPerUnit !== undefined ? checkForNull(power.SEBCostPerUnit) : 0;

    const TotalUnitCharges = ((UnitConsumptionPerAnnum * SEBCostPerUnit) + MeterRentAndOtherChargesPerAnnum + DutyChargesAndFCA) / UnitConsumptionPerAnnum
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
      const SelfGeneratedCostPerUnit = CostPerUnitOfMeasurement / UnitGeneratedPerUnitOfFuel;
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
      const SelfGeneratedCostPerUnit = AnnualCost / UnitGeneratedPerAnnum;
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
    const { powerGrid, isEditIndex, isEditSEBIndex, powerGridEditIndex, power } = this.state;
    const { fieldsObj } = this.props;

    //POWER CONTIRBUTION FIELDS
    const electricBoardPowerContribution = fieldsObj && fieldsObj.SEBPowerContributaion !== undefined ? checkForNull(fieldsObj.SEBPowerContributaion) : 0;
    const selfGeneratorPowerContribution = fieldsObj && fieldsObj.SelfPowerContribution !== undefined ? checkForNull(fieldsObj.SelfPowerContribution) : 0;

    //CALCULATION FOR POWER CONTRIBUTION 100%
    const totalContributionFromGrid = powerGrid && powerGrid.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.PowerContributionPercentage);
    }, 0)

    let powerContributionTotal = 0;
    if (isEditIndex) {
      let rowObj = powerGrid && powerGrid.find((el, index) => index === powerGridEditIndex)
      powerContributionTotal = selfGeneratorPowerContribution + totalContributionFromGrid - checkForNull(rowObj.PowerContributionPercentage);
    } else if (isEditSEBIndex) {
      let rowObj = powerGrid && powerGrid.find((el, index) => index === powerGridEditIndex)
      powerContributionTotal = electricBoardPowerContribution + totalContributionFromGrid - checkForNull(rowObj.PowerContributionPercentage);
    } else {
      powerContributionTotal = selfGeneratorPowerContribution + totalContributionFromGrid;
    }

    if (powerContributionTotal > 100) {
      this.setState({ checkPowerContribution: true })
      toastr.warning('Power contribution should not be greater than 100%.')
    } else {
      this.setState({ checkPowerContribution: false })
    }
  }

  /**
  * @method getDetails
  * @description Used to get Details
  */
  getDetails = () => {
    const { data } = this.props;
    console.log(data, "Data");
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
      $('html, body').animate({ scrollTop: 0 }, 'slow');
      this.props.getVendorPowerDetailData(data.Id, res => {
        if (res && res.data && res.data.Result) {

          const Data = res.data.Data;
          this.props.getPlantBySupplier(Data.VendorId, () => { })

          setTimeout(() => {
            const { vendorWithVendorCodeSelectList } = this.props;

            const vendorObj = vendorWithVendorCodeSelectList && vendorWithVendorCodeSelectList.find(item => item.Value === Data.VendorId)

            let tempVendorPlant = Data && Data.VendorPlants.map((item) => {
              return { Text: item.VendorPlantName, Value: item.VendorPlantId }
            })

            this.setState({
              isEditFlag: true,
              isLoader: false,
              IsVendor: Data.IsVendor,
              VendorCode: Data.VendorCode,
              selectedVendorPlants: tempVendorPlant,
              vendorName: vendorObj && vendorObj !== undefined ? { label: vendorObj.Text, value: vendorObj.Value } : [],
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
      $('html, body').animate({ scrollTop: 0 }, 'slow');
      this.props.getPowerDetailData(data.Id, res => {
        if (res && res.data && res.data.Result) {
          const { powerGrid } = this.state;
          const Data = res.data.Data;
          console.log(Data, "DATA POWER");
          this.props.getPlantListByState(Data.StateId, () => { })

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

          if (Data.SGChargesDetails.length > 0) {
            let selfPowerArray = Data && Data.SGChargesDetails.map((item) => item)
            tempArray.push(...powerGrid, ...selfPowerArray)
          }

          setTimeout(() => {
            const { fuelComboSelectList, } = this.props;

            const stateObj = fuelComboSelectList && fuelComboSelectList.States && fuelComboSelectList.States.find(item => item.Value === Data.StateId)

            let plantArray = Data && Data.Plants.map((item) => ({ Text: item.PlantName, Value: item.PlantId }))

            this.setState({
              isEditFlag: true,
              isLoader: false,
              IsVendor: Data.IsVendor,
              netContributionValue: Data.NetPowerCostPerUnit,
              isAddedSEB: Data.SEBChargesDetails && Data.SEBChargesDetails.length > 0 ? true : false,
              selectedPlants: plantArray,
              StateName: stateObj && stateObj !== undefined ? { label: stateObj.Text, value: stateObj.Value } : [],
              effectiveDate: moment(Data.SEBChargesDetails[0].EffectiveDate)._d,
              powerGrid: tempArray,
            })
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
      //this.props.getVendorPowerDetailData('', () => { })
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
      selectedVendorPlants: [],
    }, () => {
      this.props.getVendorWithVendorCodeSelectList()
    });
  }

  /**
  * @method handleVendorName
  * @description called
  */
  handleVendorName = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ vendorName: newValue, selectedVendorPlants: [] }, () => {
        const { vendorName } = this.state;
        const result = vendorName && vendorName.label ? getVendorCode(vendorName.label) : '';
        this.setState({ VendorCode: result })
        this.props.getPlantBySupplier(vendorName.value, () => { })
      });
    } else {
      this.setState({ vendorName: [], selectedVendorPlants: [], })
      this.props.getPlantBySupplier('', () => { })
    }
  };

  vendorToggler = () => {
    this.setState({ isOpenVendor: true })
  }

  closeVendorDrawer = (e = '') => {
    this.setState({ isOpenVendor: false }, () => {
      this.props.getVendorWithVendorCodeSelectList()
    })
  }

  handleVendorPlant = (e) => {
    this.setState({ selectedVendorPlants: e })
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
  };

  /**
  * @method handleUOM
  * @description called
  */
  handleUOM = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ UOM: newValue, }, () => {
        const { StateName, UOM } = this.state;

        if (StateName.length === 0) {
          toastr.warning("Please select state first.")
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

    // const TotalUnitCharges = fieldsObj && fieldsObj !== undefined ? fieldsObj.TotalUnitCharges : 0;
    // const SEBPowerContributaion = fieldsObj && fieldsObj !== undefined ? fieldsObj.SEBPowerContributaion : 0;

    const TotalUnitCharges = power.TotalUnitCharges !== undefined ? power.TotalUnitCharges : 0
    const SEBPowerContributaion = fieldsObj && fieldsObj !== undefined ? fieldsObj.SEBPowerContributaion : 0

    if (TotalUnitCharges === 'NaN' || SEBPowerContributaion === undefined) {
      toastr.warning('Fields should not be empty.')
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
    console.log(NetPowerCostPerUnit, "Net Power");
    this.setState({
      isEditFlagForStateElectricity: true,
      powerGrid: tempArray,
      netContributionValue: NetPowerCostPerUnit,
      isAddedSEB: true,
    });
    this.resetpowerKeyValue()
  }

  /**
  * @method updateSEBGrid
  * @description Used to handle updateProcessGrid
  */
  updateSEBGrid = () => {
    const { powerGrid, powerGridEditIndex, power } = this.state;
    const { fieldsObj } = this.props;

    // const TotalUnitCharges = fieldsObj && fieldsObj !== undefined ? fieldsObj.TotalUnitCharges : 0;
    // const SEBPowerContributaion = fieldsObj && fieldsObj !== undefined ? fieldsObj.SEBPowerContributaion : 0;
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

      //this.props.change('SEBCostPerUnit', 0)
      //this.props.change('SEBPowerContributaion', 0)
    });
    this.resetpowerKeyValue()
  };

  powerTableHandler = (isSelfGenerator) => {
    const { source, UOM, powerGrid, power } = this.state;
    const { fieldsObj } = this.props;

    if (source.length === 0) {
      toastr.warning('Fields should not be empty');
      return false;
    }

    const AssetCost = fieldsObj && fieldsObj.AssetCost !== undefined ? fieldsObj.AssetCost : 0;
    const AnnualCost = fieldsObj && fieldsObj.AnnualCost !== undefined ? fieldsObj.AnnualCost : 0;
    const UnitGeneratedPerAnnum = fieldsObj && fieldsObj.UnitGeneratedPerAnnum !== undefined ? fieldsObj.UnitGeneratedPerAnnum : 0;
    const SelfGeneratedCostPerUnit = fieldsObj && fieldsObj.SelfGeneratedCostPerUnit !== undefined ? fieldsObj.SelfGeneratedCostPerUnit : 0;
    const SelfPowerContribution = fieldsObj && fieldsObj.SelfPowerContribution !== undefined ? fieldsObj.SelfPowerContribution : 0;
    const CostPerUnitOfMeasurement = power.CostPerUnitOfMeasurement !== undefined ? power.CostPerUnitOfMeasurement : 0;
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
    console.log(NetPowerCostPerUnit, "Net Power");

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
    this.resetpowerKeyValue()
  }

  /**
* @method updatePowerGrid
* @description Used to handle updateProcessGrid
*/
  updatePowerGrid = () => {
    const { source, UOM, powerGrid, powerGridEditIndex, power } = this.state;
    const { fieldsObj } = this.props;

    const AssetCost = fieldsObj && fieldsObj !== undefined ? fieldsObj.AssetCost : 0;
    const AnnualCost = fieldsObj && fieldsObj !== undefined ? fieldsObj.AnnualCost : 0;
    const UnitGeneratedPerAnnum = fieldsObj && fieldsObj !== undefined ? fieldsObj.UnitGeneratedPerAnnum : 0;
    const SelfGeneratedCostPerUnit = fieldsObj && fieldsObj !== undefined ? fieldsObj.SelfGeneratedCostPerUnit : 0;
    const SelfPowerContribution = fieldsObj && fieldsObj !== undefined ? fieldsObj.SelfPowerContribution : 0;
    const CostPerUnitOfMeasurement = power.CostPerUnitOfMeasurement !== undefined ? power.CostPerUnitOfMeasurement : 0;
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
      this.props.change('AssetCost', 0)
      this.props.change('AnnualCost', 0)
      this.props.change('UnitGeneratedPerAnnum', 0)
      this.props.change('SelfGeneratedCostPerUnit', 0)
      this.props.change('SelfPowerContribution', 0)
      this.props.change('CostPerUnitOfMeasurement', 0)
      this.props.change('UnitGeneratedPerUnitOfFuel', 0)
    });
  };

  /**
  * @method editItemDetails
  * @description used to Reset form
  */
  editItemDetails = (index, sourceType) => {
    const { powerGrid } = this.state;
    const { fuelComboSelectList } = this.props;
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
      let UOMObj = fuelComboSelectList && fuelComboSelectList.UnitOfMeasurements.find(el => el.Value === tempData.UnitOfMeasurementId)
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
    console.log(tempObj, "Temporary Object");
    if (tempObj.SourcePowerType === 'SEB') {
      this.setState({
        isEditFlagForStateElectricity: false,
        isAddedSEB: false
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
    this.resetpowerKeyValue()
  }

  /**
  * @method renderListing
  * @description Used to show type of listing
  */
  renderListing = (label) => {
    const { powerTypeSelectList, vendorWithVendorCodeSelectList, filterPlantList,
      UOMSelectList, plantSelectList, fuelComboSelectList } = this.props;
    const temp = [];

    if (label === 'VendorNameList') {
      vendorWithVendorCodeSelectList && vendorWithVendorCodeSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
      });
      return temp;
    }

    if (label === 'VendorPlant') {
      filterPlantList && filterPlantList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ Text: item.Text, Value: item.Value })
      });
      return temp;
    }

    if (label === 'state') {
      fuelComboSelectList && fuelComboSelectList.States && fuelComboSelectList.States.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
      });
      return temp;
    }

    if (label === 'plant') {
      plantSelectList && plantSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ Text: item.Text, Value: item.Value })
      });
      return temp;
    }

    if (label === 'UOM') {
      UOMSelectList && UOMSelectList.map(item => {
        const accept = AcceptablePowerUOM.includes(item.Type)
        if (accept === false) return false
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })

      });
      return temp;
    }

    if (label === 'Source') {
      powerTypeSelectList && powerTypeSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
      });
      return temp;
    }
  }

  /**
  * @method cancel
  * @description used to Reset form
  */
  cancel = () => {
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
      selectedVendorPlants: [],
      vendorLocation: [],
      isOpenVendor: false,
      UOM: [],
      isEditFlag: false,
      IsVendor: false,
    })
    this.getDetails();
    this.props.hideForm()
  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = (values) => {
    const { isEditFlag, PowerDetailID, IsVendor, VendorCode, selectedPlants, StateName, powerGrid,
      effectiveDate, vendorName, selectedVendorPlants } = this.state;

    let plantArray = selectedPlants && selectedPlants.map((item) => {
      return { PlantName: item.Text, PlantId: item.Value, }
    })

    let vendorPlantArray = selectedVendorPlants && selectedVendorPlants.map((item) => {
      return { VendorPlantName: item.Text, VendorPlantId: item.Value, }
    })

    if (IsVendor && vendorPlantArray.length === 0) return false;

    const NetPowerCostPerUnit = powerGrid && powerGrid.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.CostPerUnit * el.PowerContributionPercentage / 100);
    }, 0)



    let selfGridDataArray = powerGrid && powerGrid.filter(el => el.SourcePowerType !== 'SEB')

    if (isEditFlag) {

      if (IsVendor) {

        let vendorDetailData = {
          PowerDetailId: PowerDetailID,
          VendorId: vendorName.value,
          VendorName: vendorName.label,
          VendorCode: VendorCode,
          VendorPlants: vendorPlantArray,
          NetPowerCostPerUnit: values.NetPowerCostPerUnit,
          IsVendor: IsVendor,
          IsActive: true,
          CreatedDate: '',
          LoggedInUserId: loggedInUserId(),
        }
        this.props.updateVendorPowerDetail(vendorDetailData, (res) => {
          if (res.data.Result) {
            toastr.success(MESSAGES.UPDATE_POWER_DETAIL_SUCESS);
            this.cancel();
          }
        })

      } else {

        let requestData = {
          PowerId: PowerDetailID,
          IsVendor: IsVendor,
          Plants: plantArray,
          StateId: StateName.value,
          StateName: StateName.label,
          IsActive: true,
          NetPowerCostPerUnit: NetPowerCostPerUnit,
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
              EffectiveDate: effectiveDate,
            }
          ],
          SGChargesDetails: selfGridDataArray,
          LoggedInUserId: loggedInUserId(),
        }
        this.props.updatePowerDetail(requestData, (res) => {
          if (res.data.Result) {
            toastr.success(MESSAGES.UPDATE_POWER_DETAIL_SUCESS);
            this.cancel();
          }
        })
      }

    } else {

      if (IsVendor) {

        const vendorPowerData = {
          VendorId: vendorName.value,
          VendorPlants: vendorPlantArray,
          NetPowerCostPerUnit: values.NetPowerCostPerUnit,
          IsVendor: IsVendor,
          LoggedInUserId: loggedInUserId(),
        }
        this.props.createVendorPowerDetail(vendorPowerData, (res) => {
          if (res.data.Result) {
            toastr.success(MESSAGES.POWER_DETAIL_ADD_SUCCESS);
            this.cancel();
          }
        });

      } else {

        const formData = {
          IsVendor: IsVendor,
          Plants: plantArray,
          StateId: StateName.value,
          NetPowerCostPerUnit: NetPowerCostPerUnit,
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
              EffectiveDate: effectiveDate,
            }
          ],
          SGChargesDetails: selfGridDataArray,
          LoggedInUserId: loggedInUserId(),
        }

        this.props.createPowerDetail(formData, (res) => {
          if (res.data.Result) {
            toastr.success(MESSAGES.POWER_DETAIL_ADD_SUCCESS);
            this.cancel();
          }
        });
      }
    }
  }

  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { handleSubmit, initialConfiguration } = this.props;
    const { isEditFlag, source, isOpenVendor, isCostPerUnitConfigurable, isEditFlagForStateElectricity,
      checkPowerContribution, netContributionValue } = this.state;

    return (
      <>
        <div>
          <div className="login-container signup-form">
            <div className="row">
              <div className="col-md-12">
                <div className="shadow-lgg login-formg">
                  <div className="row">
                    <div className="col-md-6 mt-15">
                      <div className="form-heading">
                        <h2>{isEditFlag ? `Update Power` : `Add Power`}</h2>
                      </div>
                    </div>
                  </div>
                  <form
                    noValidate
                    className="form"
                    onSubmit={handleSubmit(this.onSubmit.bind(this))}
                  >
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
                            <div className="d-flex justify-space-between align-items-center inputwith-icon">
                              <div className="fullinput-icon">
                                <Field
                                  name="VendorName"
                                  type="text"
                                  label="Vendor Name"
                                  component={searchableSelect}
                                  placeholder={'--select--'}
                                  options={this.renderListing('VendorNameList')}
                                  //onKeyUp={(e) => this.changeItemDesc(e)}
                                  validate={(this.state.vendorName == null || this.state.vendorName.length === 0) ? [required] : []}
                                  required={true}
                                  handleChangeDescription={this.handleVendorName}
                                  valueDescription={this.state.vendorName}
                                  disabled={isEditFlag ? true : false}
                                  className="fullinput-icon"
                                />
                              </div>
                              {!isEditFlag && <div
                                onClick={this.vendorToggler}
                                className={'plus-icon-square right'}>
                              </div>}
                            </div>
                          </Col>
                          <Col md="3">
                            <Field
                              label="Vendor Plant"
                              name="VendorPlant"
                              placeholder="--- Plant ---"
                              selection={(this.state.selectedVendorPlants == null || this.state.selectedVendorPlants.length === 0) ? [] : this.state.selectedVendorPlants}
                              options={this.renderListing('VendorPlant')}
                              selectionChanged={this.handleVendorPlant}
                              optionValue={option => option.Value}
                              optionLabel={option => option.Text}
                              component={renderMultiSelectField}
                              mendatory={true}
                              className="multiselect-with-border"
                              disabled={false}
                            />
                          </Col>
                          <Col md="3">
                            <div className="d-flex justify-space-between align-items-center inputwith-icon">
                              <div className="fullinput-icon">
                                <Field
                                  label={`Net Cost/Unit (INR)`}
                                  name={"NetPowerCostPerUnit"}
                                  type="text"
                                  placeholder={'Enter'}
                                  validate={[required]}
                                  component={renderNumberInputField}
                                  required={true}
                                  className=""
                                  customClassName=" withBorder"
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
                            <div className=" flex-fills mb-2">
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
                                  placeholder={'--- Select ---'}
                                  options={this.renderListing('state')}
                                  //onKeyUp={(e) => this.changeItemDesc(e)}
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
                                  placeholder="--Select--"
                                  selection={(this.state.selectedPlants == null || this.state.selectedPlants.length === 0) ? [] : this.state.selectedPlants}
                                  options={this.renderListing('plant')}
                                  selectionChanged={this.handlePlants}
                                  optionValue={option => option.Value}
                                  optionLabel={option => option.Text}
                                  component={renderMultiSelectField}
                                  mendatory={true}
                                  className="multiselect-with-border"
                                  disabled={isEditFlag ? true : false}
                                />
                              </div>
                            </div>
                          </Col>

                        </Row>

                        <Row>
                          <Col md="12" className="filter-block">
                            <div className=" flex-fills mb-2">
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
                                  placeholder={'Enter'}
                                  validate={isCostPerUnitConfigurable ? [] : [required, positiveAndDecimalNumber, maxLength10]}
                                  component={renderText}
                                  required={!isCostPerUnitConfigurable ? true : false}
                                  className=""
                                  customClassName=" withBorder"
                                  disabled={isEditFlagForStateElectricity ? true : false}
                                />
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
                                  placeholder={'Enter'}
                                  validate={isCostPerUnitConfigurable ? [] : [required, positiveAndDecimalNumber, maxLength10]}
                                  component={renderNumberInputField}
                                  required={!isCostPerUnitConfigurable ? true : false}
                                  className=""
                                  customClassName=" withBorder"
                                  disabled={isEditFlagForStateElectricity ? true : false}
                                />
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
                                  placeholder={'Enter'}
                                  validate={isCostPerUnitConfigurable ? [] : [required]}
                                  component={renderNumberInputField}
                                  required={!isCostPerUnitConfigurable ? true : false}
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
                                  placeholder={'Enter'}
                                  validate={isCostPerUnitConfigurable ? [] : [required, positiveAndDecimalNumber, maxLength10]}
                                  component={renderNumberInputField}
                                  required={!isCostPerUnitConfigurable ? true : false}
                                  className=""
                                  customClassName=" withBorder"
                                  disabled={isEditFlagForStateElectricity ? true : false}
                                />
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
                                  placeholder={'Enter'}
                                  validate={[required]}
                                  component={renderNumberInputField}
                                  required={true}
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
                                  placeholder={'Enter'}
                                  validate={isCostPerUnitConfigurable ? [] : [required, positiveAndDecimalNumber, maxLength10]}
                                  component={renderNumberInputField}
                                  required={!isCostPerUnitConfigurable ? true : false}
                                  className=""
                                  customClassName=" withBorder"
                                  disabled={isEditFlagForStateElectricity ? true : false}
                                />
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
                                  placeholder={'Enter'}
                                  validate={[required]}
                                  component={renderNumberInputField}
                                  required={true}
                                  className=""
                                  customClassName=" withBorder"
                                  disabled={!isCostPerUnitConfigurable ? true : false}
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
                                  placeholder={'Enter'}
                                  validate={[required, positiveAndDecimalNumber, maxLength10]}
                                  component={renderText}
                                  required={true}
                                  className=""
                                  customClassName=" withBorder"
                                  disabled={isEditFlagForStateElectricity ? true : false}
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
                                  placeholder={'Enter'}
                                  validate={[required, positiveAndDecimalNumber, maxLength10]}
                                  component={renderNumberInputField}
                                  required={true}
                                  className=""
                                  customClassName=" withBorder"
                                  disabled={isEditFlagForStateElectricity ? true : false}
                                />
                              </div>
                            </div>
                          </Col>
                          <Col md="3">
                            <div className="d-flex justify-space-between align-items-center inputwith-icon">
                              <div className="fullinput-icon">
                                <Field
                                  label={`Total Charge/Unit`}
                                  name={"TotalUnitCharges"}
                                  type="text"
                                  placeholder={'Enter'}
                                  validate={[required, positiveAndDecimalNumber, maxLength10]}
                                  component={renderNumberInputField}
                                  required={true}
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
                                <div className="form-group">
                                  <label>
                                    Effective Date
                                                                    {/* <span className="asterisk-required">*</span> */}
                                  </label>
                                  <div className="inputbox date-section">
                                    <DatePicker
                                      name="EffectiveDate"
                                      selected={this.state.effectiveDate}
                                      onChange={this.handleEffectiveDateChange}
                                      showMonthDropdown
                                      showYearDropdown
                                      dateFormat="dd/MM/yyyy"
                                      maxDate={new Date()}
                                      dropdownMode="select"
                                      placeholderText="Select date"
                                      className="withBorder"
                                      autoComplete={'off'}
                                      disabledKeyboardNavigation
                                      onChangeRaw={(e) => e.preventDefault()}
                                      disabled={isEditFlag ? true : false}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Col>
                          <Col md="3">
                            <div className="d-flex justify-space-between align-items-center inputwith-icon">
                              <div className="fullinput-icon">
                                <Field
                                  label={`Power Contribution %`}
                                  name={"SEBPowerContributaion"}
                                  type="text"
                                  placeholder={'Enter'}
                                  validate={[required, positiveAndDecimalNumber, maxLength10]}
                                  component={renderText}
                                  required={true}
                                  className=""
                                  customClassName=" withBorder"
                                  disabled={this.state.isAddedSEB ? true : isEditFlagForStateElectricity ? true : false}
                                />
                              </div>
                            </div>
                          </Col>
                          <Col md="3">
                            <div>
                              {this.state.isEditSEBIndex ?
                                <>
                                  <button
                                    type="button"
                                    className={`btn ${checkPowerContribution ? 'btn-secondary' : 'btn-primary'} mt30 pull-left mr5`}
                                    onClick={this.updateSEBGrid}
                                    disabled={checkPowerContribution ? true : false}
                                  >Update</button>
                                  <button
                                    type="button"
                                    className={'cancel-btn mt30 pull-left'}
                                    onClick={() => this.setState({ isEditSEBIndex: false })}
                                  >Cancel</button>
                                </>
                                :
                                <button
                                  type="button"
                                  className={`${(checkPowerContribution || this.state.isAddedSEB) ? 'btn-secondary' : 'btn-primary'} mb-4 pull-left`}
                                  disabled={(checkPowerContribution || this.state.isAddedSEB) ? true : false}
                                  onClick={() => this.powerSEBTableHandler(false)}>
                                  <div className={'plus'}></div>ADD</button>
                              }

                            </div>
                          </Col>
                        </Row>

                        <Row>
                          <Col md="12" className="filter-block">
                            <div className=" flex-fills mb-2">
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
                                  placeholder={'--- Select ---'}
                                  options={this.renderListing('Source')}
                                  //onKeyUp={(e) => this.changeItemDesc(e)}
                                  //validate={(this.state.source == null || this.state.source.length == 0) ? [required] : []}
                                  //required={true}
                                  handleChangeDescription={this.handleSource}
                                  valueDescription={this.state.source}
                                  disabled={false}
                                />
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
                                  placeholder={'Enter'}
                                  validate={[positiveAndDecimalNumber, maxLength10]}
                                  component={renderText}
                                  //required={true}
                                  className=""
                                  customClassName=" withBorder"
                                  disabled={false}
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
                                  placeholder={'Enter'}
                                  validate={[positiveAndDecimalNumber, maxLength10]}
                                  component={renderText}
                                  //required={true}
                                  className=""
                                  customClassName=" withBorder"
                                  disabled={false}
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
                                      placeholder={'--- Select ---'}
                                      options={this.renderListing('UOM')}
                                      //onKeyUp={(e) => this.changeItemDesc(e)}
                                      //validate={(this.state.UOM == null || this.state.UOM.length == 0) ? [required] : []}
                                      //required={true}
                                      handleChangeDescription={this.handleUOM}
                                      valueDescription={this.state.UOM}
                                      disabled={false}
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
                                      placeholder={'Enter'}
                                      //validate={[required]}
                                      component={renderNumberInputField}
                                      //required={true}
                                      className=""
                                      customClassName=" withBorder"
                                      disabled={false}
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
                                      placeholder={'Enter'}
                                      validate={[positiveAndDecimalNumber, maxLength10]}
                                      component={renderText}
                                      //required={true}
                                      className=""
                                      customClassName=" withBorder"
                                      disabled={false}
                                    />
                                  </div>
                                </div>
                              </Col>
                            </>}

                          <Col md="3">
                            <div className="d-flex justify-space-between align-items-center inputwith-icon">
                              <div className="fullinput-icon">
                                <Field
                                  label={`Unit Generated/Annum`}
                                  name={"UnitGeneratedPerAnnum"}
                                  type="text"
                                  placeholder={'Enter'}
                                  validate={[positiveAndDecimalNumber, maxLength20]}
                                  component={renderText}
                                  //required={true}
                                  className=""
                                  customClassName=" withBorder"
                                  disabled={false}
                                />
                              </div>
                            </div>
                          </Col>
                          <Col md="3">
                            <div className="d-flex justify-space-between align-items-center inputwith-icon">
                              <div className="fullinput-icon">
                                <Field
                                  label={`Cost/Unit`}
                                  name={"SelfGeneratedCostPerUnit"}
                                  type="text"
                                  placeholder={'Enter'}
                                  //validate={[required]}
                                  component={renderNumberInputField}
                                  //required={true}
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
                                  placeholder={'Enter'}
                                  validate={[positiveAndDecimalNumber, maxLength10]}
                                  component={renderText}
                                  //required={true}
                                  className=""
                                  customClassName=" withBorder"
                                  disabled={false}
                                />
                              </div>
                            </div>
                          </Col>
                          <Col md="3">
                            <div>
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
                                    className={'cancel-btn mt30 pull-left'}
                                    onClick={this.resetPowerGridData}
                                  >Cancel</button>
                                </>
                                :
                                <button
                                  type="button"
                                  className={`${checkPowerContribution ? 'btn-secondary' : 'btn-primary'} mt30 pull-left`}
                                  disabled={checkPowerContribution ? true : false}
                                  onClick={() => this.powerTableHandler(true)}>
                                  <div className={'plus'}></div>ADD</button>}

                            </div>
                          </Col>
                          <Col md="12">
                            <Table className="table" size="sm" >
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
                                        <th>{checkForDecimalAndNull(calculatePercentageValue(item.CostPerUnit, item.PowerContributionPercentage), initialConfiguration.NoOfDecimalForInputOutput)}</th>
                                        <td>
                                          <button className="Edit mr-2" type={'button'} onClick={() => this.editItemDetails(index, item.SourcePowerType)} />
                                          <button className="Delete" type={'button'} onClick={() => this.deleteItem(index)} />
                                        </td>
                                      </tr>
                                    )
                                  })
                                }
                              </tbody>

                              <tfoot>
                                {/* <div className="bluefooter-butn border row">
                                                                    <div className="col-md-12 text-right"> */}
                                <tr className="bluefooter-butn">
                                  <td></td>
                                  <td></td>
                                  <td className="text-right"><label>{`Net Contribution Value:`}</label> </td>
                                  <td><label> {checkForDecimalAndNull(netContributionValue, initialConfiguration.NoOfDecimalForInputOutput)}</label></td>
                                  <td></td>
                                </tr>
                                {/* </div>
                                                                </div> */}
                              </tfoot>

                              {this.state.powerGrid.length === 0 && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                            </Table>
                            {/* <div className="bluefooter-butn border row">
                                                            <div className="col-md-12 text-right">
                                                                <span className="col-md-12">
                                                                    {`Net Loss Weight:`}
                                                                    {1}
                                                                </span>
                                                            </div>
                                                        </div> */}
                          </Col>
                        </Row>
                      </>
                    }

                    <Row className="sf-btn-footer no-gutters justify-content-between">
                      <div className="col-sm-12 text-right bluefooter-butn">
                        <button
                          type={'button'}
                          className="reset mr15 cancel-btn"
                          onClick={this.cancel} >
                          <div className={'cross-icon'}><img src={require('../../../assests/images/times.png')} alt='cancel-icon.jpg' /></div> {'Cancel'}
                        </button>
                        <button
                          type="submit"
                          className="submit-button mr5 save-btn" >
                          <div className={'check-icon'}><img src={require('../../../assests/images/check.png')} alt='check-icon.jpg' /> </div>
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
          closeDrawer={this.closeVendorDrawer}
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

  const { powerTypeSelectList, UOMSelectList, filterPlantList, } = comman;
  const { vendorWithVendorCodeSelectList } = supplier;
  const { fuelComboSelectList, plantSelectList, powerData } = fuel;
  const { initialConfiguration } = auth;
  // console.log(init);
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
      SEBPowerContributaion: powerData && powerData.SEBChargesDetails[0].PowerContributaionPersentage,
    }
  }

  return {
    vendorWithVendorCodeSelectList, powerTypeSelectList, UOMSelectList, filterPlantList,
    fuelComboSelectList, plantSelectList, powerData, initialValues, fieldsObj, initialConfiguration
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
  getFuelComboData,
  createPowerDetail,
  updatePowerDetail,
  createVendorPowerDetail,
  updateVendorPowerDetail,
  getPlantListByState,
  getDieselRateByStateAndUOM,
  getVendorWithVendorCodeSelectList,
  getPowerDetailData,
  getVendorPowerDetailData,
})(reduxForm({
  form: 'AddPower',
  enableReinitialize: true,
  onSubmitFail: errors => {
    focusOnError(errors);
  },
})(AddPower));
