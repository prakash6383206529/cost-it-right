import React, { Component, } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { required, getVendorCode, positiveAndDecimalNumber, acceptAllExceptSingleSpecialCharacter, maxLength512, checkForNull, checkForDecimalAndNull, decimalLengthFour, decimalLengthsix, maxLength70 } from "../../../helper/validation";
import { renderText, searchableSelect, renderMultiSelectField, renderTextAreaField, renderDatePicker } from "../../layout/FormInputs";
import {
  getRawMaterialCategory, fetchGradeDataAPI, fetchSpecificationDataAPI, getCityBySupplier, getPlantByCity,
  getPlantByCityAndSupplier, fetchRMGradeAPI, getSupplierList, getPlantBySupplier, getUOMSelectList,
  getCurrencySelectList, fetchSupplierCityDataAPI, fetchPlantDataAPI, getTechnologySelectList, getPlantSelectListByType
} from '../../../actions/Common';
import {
  createRMImport, getRMImportDataById, updateRMImportAPI, getRawMaterialNameChild,
  getRMGradeSelectListByRawMaterial, getVendorListByVendorType, fileUploadRMDomestic, getVendorWithVendorCodeSelectList
} from '../actions/Material';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import { loggedInUserId, getConfigurationKey } from "../../../helper/auth";
import Switch from "react-switch";
import AddSpecification from './AddSpecification';
import AddGrade from './AddGrade';
import AddCategory from './AddCategory';
import AddUOM from '../uom-master/AddUOM';
import AddVendorDrawer from '../supplier-master/AddVendorDrawer';
import 'react-dropzone-uploader/dist/styles.css'
import Dropzone from 'react-dropzone-uploader';

import "react-datepicker/dist/react-datepicker.css";
import { FILE_URL, INR, ZBC } from '../../../config/constants';
import { AcceptableRMUOM } from '../../../config/masterData'
import $ from 'jquery';
import { getExchangeRateByCurrency } from "../../costing/actions/Costing"
import moment from 'moment';


import LoaderCustom from '../../common/LoaderCustom';
import ConfirmComponent from '../../../helper/ConfirmComponent';
import WarningMessage from '../../common/WarningMessage';
const selector = formValueSelector('AddRMImport');

class AddRMImport extends Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    this.state = {
      isEditFlag: false,
      RawMaterialID: '',

      RawMaterial: [],
      RMGrade: [],
      RMSpec: [],
      Category: [],
      Technology: [],
      selectedPlants: [],

      vendorName: [],
      VendorCode: '',
      selectedVendorPlants: [],
      vendorLocation: [],

      HasDifferentSource: false,
      sourceLocation: [],

      UOM: [],
      currency: [],
      effectiveDate: '',
      remarks: '',

      isShowForm: false,
      IsVendor: false,
      files: [],
      errors: [],

      isRMDrawerOpen: false,
      isOpenGrade: false,
      isOpenSpecification: false,
      isOpenCategory: false,
      isOpenVendor: false,
      isOpenUOM: false,

      isVisible: false,
      imageURL: '',
      currencyValue: 1,
      showCurrency: false,
      netCost: '',
      netCurrencyCost: '',
      singlePlantSelected: [],
      DropdownChanged: true,
      DataToChange: [],
      isDateChange: false,
      isSourceChange: false,
      source: '',
      showWarning: false
    }
  }

  /**
  * @method componentWillMount
  * @description Called before render the component
  */
  UNSAFE_componentWillMount() {
    this.props.getRawMaterialNameChild(() => { })
    this.props.getUOMSelectList(() => { })
    this.props.getSupplierList(() => { })
    this.props.fetchPlantDataAPI(() => { })
    this.props.getCurrencySelectList(() => { })
  }

  /**
   * @method componentDidMount
   * @description Called after rendering the component
   */
  componentDidMount() {
    const { data } = this.props;
    this.getDetails(data);
    this.props.change('NetLandedCost', 0)
    this.props.getRawMaterialCategory(res => { });
    this.props.fetchSupplierCityDataAPI(res => { });
    this.props.getVendorListByVendorType(false, () => { })
    this.props.getTechnologySelectList(() => { })
    this.props.fetchSpecificationDataAPI(0, () => { })
    this.props.getPlantSelectListByType(ZBC, () => { })
  }

  componentDidUpdate(prevProps) {

    if (this.props.fieldsObj !== prevProps.fieldsObj) {

      this.handleNetCost()
    }
  }

  /**
  * @method handleRMChange
  * @description  used to handle row material selection
  */
  handleRMChange = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ RawMaterial: newValue, RMGrade: [], }, () => {
        const { RawMaterial } = this.state;
        this.props.getRMGradeSelectListByRawMaterial(RawMaterial.value, res => { })
      });
    } else {
      this.setState({ RMGrade: [], RMSpec: [], RawMaterial: [], });
      this.props.getRMGradeSelectListByRawMaterial(0, res => { });
    }
  }

  /**
  * @method handleGradeChange
  * @description  used to handle row material grade selection
      */
  handleGradeChange = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ RMGrade: newValue, RMSpec: [], }, () => {
        const { RMGrade } = this.state;
        this.props.fetchSpecificationDataAPI(RMGrade.value, res => { });
      })
    } else {
      this.setState({
        RMGrade: [],
        RMSpec: [],
      })
      this.props.fetchSpecificationDataAPI(0, res => { });
    }
  }

  /**
  * @method handleSpecChange
  * @description  used to handle row material grade selection
  */
  handleSpecChange = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ RMSpec: newValue })
    } else {
      this.setState({ RMSpec: [] })
    }
  }

  /**
  * @method handleCategoryChange
  * @description  used to handle category selection
  */
  handleCategoryChange = (newValue, actionMeta) => {
    this.setState({ Category: newValue })
  }

  /**
   * @method handleTechnologyChange
   * @description Use to handle technology change
  */
  handleTechnologyChange = (newValue) => {
    this.setState({ Technology: newValue })
  }

  /**
  * @method handleCategoryType
  * @description  used to handle category type selection
  */
  handleCategoryType = (e) => {
    this.props.fetchCategoryAPI(e.target.value, res => { })
  }

  /**
  * @method handleSourceSupplierPlant
  * @description Used handle vendor plants
  */
  handleSourceSupplierPlant = (e) => {
    this.setState({ selectedPlants: e })
    this.setState({ DropdownChanged: false })
  }

  /**
  * @method handleVendorName
  * @description called
  */
  handleVendorName = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ vendorName: newValue, selectedVendorPlants: [], vendorLocation: [] }, () => {
        const { vendorName } = this.state;
        const result = vendorName && vendorName.label ? getVendorCode(vendorName.label) : '';
        this.setState({ VendorCode: result })
        this.props.getPlantBySupplier(vendorName.value, () => { })
      });
    } else {
      this.setState({ vendorName: [], selectedVendorPlants: [], vendorLocation: [] })
    }
  };

  /**
  * @method handleVendorPlant
  * @description called
  */
  handleVendorPlant = (e) => {
    this.setState({ selectedVendorPlants: e })
  };

  /**
  * @method handleVendorLocation
  * @description called
  */
  handleVendorLocation = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ vendorLocation: newValue, });
    } else {
      this.setState({ vendorLocation: [], })
    }
  };

  /**
   * @method handleSourceSupplierCity
   * @description called
   */
  handleSourceSupplierCity = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {

      this.setState({ sourceLocation: newValue, isSourceChange: true })

    } else {
      this.setState({ sourceLocation: [] })
    }
    // this.setState({ DropdownChanged: false })
  }

  handleSource = (newValue, actionMeta) => {

    if (newValue && newValue !== '') {
      //  if (newValue !== thissource) {
      this.setState({ source: newValue, isSourceChange: true })

    }
  }


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
  * @method handleCurrency
  * @description called
  */
  handleCurrency = (newValue) => {
    if (newValue && newValue !== '') {
      this.setState({ currency: newValue, })
      const { fieldsObj } = this.props
      if (newValue.label === INR) {
        this.setState({ currencyValue: 1, showCurrency: false, })
      } else {
        this.setState({ showCurrency: true })
      }
      this.handleNetCost()
    } else {
      this.setState({ currency: [] })
    }
  };



  /**
  * @method handleChange
  * @description Handle Effective Date
  */
  handleEffectiveDateChange = (date) => {
    if (date !== this.state.effectiveDate) {

      this.setState({ isDateChange: true, effectiveDate: date }, () => { this.handleNetCost() })
    } else {
      this.setState({ isDateChange: false, effectiveDate: date }, () => { this.handleNetCost() })
    }
    // this.setState({ effectiveDate: date }, () => { this.handleNetCost() })
  };

  handleNetCost = () => {

    const { fieldsObj } = this.props
    const { currency, effectiveDate } = this.state
    const netCost = checkForNull(Number(fieldsObj.BasicRate ? fieldsObj.BasicRate : 0) + Number(fieldsObj.FreightCharge ? fieldsObj.FreightCharge : 0) + Number(fieldsObj.ShearingCost ? fieldsObj.ShearingCost : 0))

    if (currency === INR) {
      this.setState({ currencyValue: 1, netCost: checkForNull(netCost * this.state.currencyValue) }, () => {
        this.props.change('NetLandedCost', checkForDecimalAndNull(netCost * this.state.currencyValue, this.props.initialConfiguration.NoOfDecimalForPrice))
      })
    } else {
      if (currency && effectiveDate) {

        this.props.getExchangeRateByCurrency(currency.label, moment(effectiveDate).local().format('YYYY-MM-DD'), res => {
          if (Object.keys(res.data.Data).length === 0) {
            this.setState({ showWarning: true })
          }
          else {
            this.setState({ showWarning: false })
          }
          this.props.change('NetLandedCost', checkForDecimalAndNull(netCost, this.props.initialConfiguration.NoOfDecimalForPrice))
          this.props.change('NetLandedCostCurrency', checkForDecimalAndNull(netCost * res.data.Data.CurrencyExchangeRate, this.props.initialConfiguration.NoOfDecimalForPrice))
          this.setState({ currencyValue: checkForNull(res.data.Data.CurrencyExchangeRate), netCost: checkForNull(netCost), netCurrencyCost: checkForNull(netCost * res.data.Data.CurrencyExchangeRate) })
        })
      }
    }
  }

  /**
  * @method handleMessageChange
  * @description used remarks handler
  */
  handleMessageChange = (e) => {
    this.setState({
      remarks: e.target.value
    })
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
        isShowForm: true,
        RawMaterialID: data.Id,
      })
      $('html, body').animate({ scrollTop: 0 }, 'slow');
      this.props.getRMImportDataById(data, true, res => {
        if (res && res.data && res.data.Result) {
          const Data = res.data.Data;
          this.setState({ DataToChange: Data })
          if (Data.IsVendor) {
            this.props.getVendorWithVendorCodeSelectList(() => { })
          } else {
            this.props.getVendorListByVendorType(Data.IsVendor, () => { })
          }
          this.props.change('EffectiveDate', moment(Data.EffectiveDate)._isValid ? moment(Data.EffectiveDate)._d : '')
          // this.props.getVendorListByVendorType(Data.IsVendor, () => { })
          this.props.getRMGradeSelectListByRawMaterial(Data.RawMaterial, res => {
            this.props.fetchSpecificationDataAPI(Data.RMGrade, res => {

              setTimeout(() => {
                const { gradeSelectList, rmSpecification, cityList, categoryList, rawMaterialNameSelectList, UOMSelectList,
                  vendorListByVendorType, currencySelectList, technologySelectList, plantSelectList } = this.props;

                const materialNameObj = rawMaterialNameSelectList && rawMaterialNameSelectList.find(item => item.Value === Data.RawMaterial)
                const gradeObj = gradeSelectList && gradeSelectList.find(item => item.Value === Data.RMGrade)
                const specObj = rmSpecification && rmSpecification.find(item => item.Value === Data.RMSpec)
                const categoryObj = categoryList && categoryList.find(item => Number(item.Value) === Data.Category)
                const destinationPlantObj = plantSelectList && plantSelectList.find((item) => item.Value === Data.DestinationPlantId)
                const technologyObj = technologySelectList && technologySelectList.find((item) => Number(item.Value) === Data.TechnologyId) //NEED TO UNCOMMENT AFTER KEY ADDED IN BACKEND
                const currencyObj = currencySelectList && currencySelectList.find(item => item.Text === Data.Currency)
                this.props.change('FreightCharge', Data.RMFreightCost ? Data.RMFreightCost : '')
                this.props.change('ShearingCost', Data.RMShearingCost ? Data.RMShearingCost : '')
                this.handleCurrency({ label: currencyObj.Text, value: currencyObj.Value })
                this.props.change('NetLandedCostCurrency', Data.NetLandedCostConversion ? Data.NetLandedCostConversion : '')
                // this.handleEffectiveDateChange(moment(Data.EffectiveDate)._isValid ? moment(Data.EffectiveDate)._d : '')
                // this.props.change('NetLandedCost')

                this.props.change('cutOffPrice', Data.CutOffPrice ? Data.CutOffPrice : '')
                let plantArray = [];
                Data && Data.Plant.map((item) => {
                  plantArray.push({ Text: item.PlantName, Value: item.PlantId })
                  return plantArray;
                })

                const vendorObj = vendorListByVendorType && vendorListByVendorType.find(item => item.Value === Data.Vendor)

                let vendorPlantArray = [];
                Data && Data.VendorPlant.map((item) => {
                  vendorPlantArray.push({ Text: item.PlantName, Value: item.PlantId })
                  return vendorPlantArray;
                })

                //const vendorLocationObj = filterCityListBySupplier && filterCityListBySupplier.find(item => item.Value == Data.VendorLocation)
                const sourceLocationObj = cityList && cityList.find(item => Number(item.Value) === Data.SourceLocation)
                const UOMObj = UOMSelectList && UOMSelectList.find(item => item.Value === Data.UOM)

                this.setState({
                  isEditFlag: true,
                  // isLoader: false,
                  isShowForm: true,
                  IsVendor: Data.IsVendor,
                  RawMaterial: materialNameObj !== undefined ? { label: materialNameObj.Text, value: materialNameObj.Value } : [],
                  RMGrade: gradeObj !== undefined ? { label: gradeObj.Text, value: gradeObj.Value } : [],
                  RMSpec: specObj !== undefined ? { label: specObj.Text, value: specObj.Value } : [],
                  Category: categoryObj !== undefined ? { label: categoryObj.Text, value: categoryObj.Value } : [],
                  Technology: technologyObj !== undefined ? { label: technologyObj.Text, value: technologyObj.Value } : '', //NNED TO UNCOMMENT AFTER KEY ADDED IN BACKEND
                  selectedPlants: plantArray,
                  vendorName: vendorObj !== undefined ? { label: vendorObj.Text, value: vendorObj.Value } : [],
                  selectedVendorPlants: vendorPlantArray,
                  HasDifferentSource: Data.HasDifferentSource,
                  sourceLocation: sourceLocationObj !== undefined ? { label: sourceLocationObj.Text, value: sourceLocationObj.Value } : [],
                  UOM: UOMObj !== undefined ? { label: UOMObj.Text, value: UOMObj.Value } : [],
                  effectiveDate: moment(Data.EffectiveDate)._isValid ? moment(Data.EffectiveDate)._d : '',
                  currency: currencyObj !== undefined ? { label: currencyObj.Text, value: currencyObj.Value } : [],
                  remarks: Data.Remark,
                  files: Data.FileList,
                  singlePlantSelected: destinationPlantObj !== undefined ? { label: destinationPlantObj.Text, value: destinationPlantObj.Value } : [],
                  // FreightCharge:Data.FreightCharge
                  netCurrencyCost: Data.NetLandedCostConversion ? Data.NetLandedCostConversion : '',

                }, () => this.setState({ isLoader: false }))
              }, 200);
            });

          })
          this.props.getPlantBySupplier(Data.Vendor, () => { })
          //this.props.getCityBySupplier(Data.Vendor, () => { })

        }
      })
    } else {
      this.props.getRMImportDataById('', false, res => { })
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
      vendorLocation: [],
    }, () => {
      const { IsVendor } = this.state;
      if (IsVendor) {
        this.props.getVendorWithVendorCodeSelectList(() => { })
      } else {
        // this.props.getVendorTypeBOPSelectList(() => { })
        this.props.getVendorListByVendorType(IsVendor, () => { })
        this.props.getPlantBySupplier('', () => { })
        this.props.getCityBySupplier(0, () => { })
      }
    });
  }

  /**
  * @method onPressDifferentSource
  * @description Used for Different Source checked
  */
  onPressDifferentSource = () => {
    this.setState({ HasDifferentSource: !this.state.HasDifferentSource });
  }

  rmToggler = () => {
    this.setState({ isRMDrawerOpen: true })
  }

  closeRMDrawer = (e = '', data = {}) => {
    this.setState({ isRMDrawerOpen: false }, () => {
      /* FOR SHOWING RM ,GRADE AND SPECIFICATION SELECTED IN RM SPECIFICATION DRAWER*/
      this.props.getRawMaterialNameChild(() => {
        if (Object.keys(data).length > 0) {
          this.props.getRMGradeSelectListByRawMaterial(data.RawMaterialId, (res) => {
            this.props.fetchSpecificationDataAPI(data.GradeId, (res) => {
              const { rawMaterialNameSelectList, gradeSelectList, rmSpecification } = this.props
              const materialNameObj = rawMaterialNameSelectList && rawMaterialNameSelectList.find((item) => item.Value === data.RawMaterialId,)
              const gradeObj = gradeSelectList && gradeSelectList.find((item) => item.Value === data.GradeId)
              const specObj = rmSpecification && rmSpecification.find((item) => item.Text === data.Specification)

              this.setState({
                RawMaterial: { label: materialNameObj.Text, value: materialNameObj.Value, },
                RMGrade: gradeObj !== undefined ? { label: gradeObj.Text, value: gradeObj.Value } : [],
                RMSpec: specObj !== undefined ? { label: specObj.Text, value: specObj.Value } : [],
              })
            })
          })
        }
      })
    })
  }

  gradeToggler = () => {
    this.setState({ isOpenGrade: true })
  }

  /**
  * @method closeGradeDrawer
  * @description  used to toggle grade Popup/Drawer
  */
  closeGradeDrawer = (e = '') => {
    this.setState({ isOpenGrade: false }, () => {
      const { RawMaterial } = this.state;
      this.props.getRMGradeSelectListByRawMaterial(RawMaterial.value, res => { });
    })
  }

  specificationToggler = () => {
    this.setState({ isOpenSpecification: true })
  }

  closeSpecDrawer = (e = '') => {
    this.setState({ isOpenSpecification: false }, () => {
      const { RMGrade } = this.state;
      this.props.fetchSpecificationDataAPI(RMGrade.value, res => { });
    })
  }

  categoryToggler = () => {
    this.setState({ isOpenCategory: true })
  }

  closeCategoryDrawer = (e = '') => {
    this.setState({ isOpenCategory: false })
  }

  vendorToggler = () => {
    this.setState({ isOpenVendor: true })
  }

  closeVendorDrawer = (e = '', formData) => {
    this.setState({ isOpenVendor: false }, () => {
      const { IsVendor } = this.state
      if (!IsVendor) {
        this.props.getVendorListByVendorType(IsVendor, () => {
          const { vendorListByVendorType } = this.props
          if (Object.keys(formData).length > 0) {
            const vendorObj = vendorListByVendorType && vendorListByVendorType.find((item) => item.Text === `${formData.VendorName} (${formData.VendorCode})`)
            this.setState({ vendorName: vendorObj !== undefined ? { label: vendorObj.Text, value: vendorObj.Value } : [], })
          }
        })
      } else {
        this.props.getVendorWithVendorCodeSelectList(() => {
          const { vendorListByVendorType } = this.props
          if (Object.keys(formData).length > 0) {
            const vendorObj = vendorListByVendorType && vendorListByVendorType.find((item) => item.Text === `${formData.VendorName} (${formData.VendorCode})`)
            this.setState({ vendorName: vendorObj !== undefined ? { label: vendorObj.Text, value: vendorObj.Value } : [], })
          }
        })
      }
    })
  }
  uomToggler = () => {
    this.setState({ isOpenUOM: true })
  }

  closeUOMDrawer = (e = '') => {
    this.setState({ isOpenUOM: false }, () => {
      this.props.getUOMSelectList(() => { })
    })
  }

  /**
  * @method renderListing
  * @description Used to show type of listing
  */
  renderListing = (label) => {
    const { gradeSelectList, rmSpecification, plantList, filterPlantList,
      cityList, categoryList, filterCityListBySupplier, rawMaterialNameSelectList,
      UOMSelectList, currencySelectList, vendorListByVendorType, technologySelectList, plantSelectList } = this.props;
    const temp = [];
    if (label === 'material') {
      rawMaterialNameSelectList && rawMaterialNameSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'grade') {
      gradeSelectList && gradeSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'specification') {
      rmSpecification && rmSpecification.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'category') {
      categoryList && categoryList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'technology') {
      technologySelectList &&
        technologySelectList.map((item) => {
          if (item.Value === '0') return false
          temp.push({ label: item.Text, value: item.Value })
          return null
        })
      return temp
    }
    if (label === 'plant') {
      plantSelectList && plantSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ Text: item.Text, Value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'singlePlant') {
      plantSelectList && plantSelectList.map((item) => {
        if (item.Value === '0') return false
        temp.push({ label: item.Text, value: item.Value })
        return null
      })
      return temp
    }
    if (label === 'VendorNameList') {
      vendorListByVendorType && vendorListByVendorType.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'VendorPlant') {
      filterPlantList && filterPlantList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ Text: item.Text, Value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'VendorLocation') {
      filterCityListBySupplier && filterCityListBySupplier.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'SourceLocation') {
      cityList && cityList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'uom') {
      UOMSelectList && UOMSelectList.map((item) => {
        const accept = AcceptableRMUOM.includes(item.Type)
        if (accept === false) return false
        if (item.Value === '0') return false
        temp.push({ label: item.Display, value: item.Value })
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
    if (label === 'city') {
      filterCityListBySupplier && filterCityListBySupplier.map(item => {
        if (item.Value === '0') return false;
        temp.push({ Text: item.Text, Value: item.Value })
        return null;
      });
      return temp;
    }

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
  clearForm = () => {
    const { reset } = this.props;
    reset();
    this.setState({
      RawMaterial: [],
      RMGrade: [],
      RMSpec: [],
      Category: [],
      selectedPlants: [],
      vendorName: [],
      selectedVendorPlants: [],
      vendorLocation: [],
      HasDifferentSource: false,
      sourceLocation: [],
      UOM: [],
      remarks: '',
      isShowForm: false,
      isEditFlag: false,
      IsVendor: false,
    })
    this.props.getRMImportDataById('', false, res => { })
    this.props.fetchSpecificationDataAPI(0, () => { })
    this.props.hideForm()
  }

  /**
  * @method cancel
  * @description used to Reset form
  */
  cancel = () => {
    this.clearForm()
  }

  /**
  * @method resetForm
  * @description used to Reset form
  */
  resetForm = () => {
    this.clearForm()
  }

  // specify upload params and url for your files
  getUploadParams = ({ file, meta }) => {
    return { url: 'https://httpbin.org/post', }

  }

  // called every time a file's `status` changes
  handleChangeStatus = ({ meta, file }, status) => {
    const { files, } = this.state;

    if (status === 'removed') {
      const removedFileName = file.name;
      let tempArr = files.filter(item => item.OriginalFileName !== removedFileName)
      this.setState({ files: tempArr })
    }

    if (status === 'done') {
      let data = new FormData()
      data.append('file', file)
      this.props.fileUploadRMDomestic(data, (res) => {
        let Data = res.data[0]
        const { files } = this.state;
        files.push(Data)
        this.setState({ files: files })
      })
    }

    if (status === 'rejected_file_type') {
      toastr.warning('Allowed only xls, doc, jpeg, pdf files.')
    }
  }

  renderImages = () => {
    this.state.files && this.state.files.map(f => {
      const withOutTild = f.FileURL.replace('~', '')
      const fileURL = `${FILE_URL}${withOutTild}`;
      return (
        <div className={'attachment-wrapper images'}>
          <img src={fileURL} alt={''} />
          <button
            type="button"
            onClick={() => this.deleteFile(f.FileId)}>X</button>
        </div>
      )
    })
  }

  deleteFile = (FileId, OriginalFileName) => {
    if (FileId != null) {
      let deleteData = {
        Id: FileId,
        DeletedBy: loggedInUserId(),
      }
      this.props.fileDeleteRMDomestic(deleteData, (res) => {
        toastr.success('File has been deleted successfully.')
        let tempArr = this.state.files.filter(item => item.FileId !== FileId)
        this.setState({ files: tempArr })
      })
    }
    if (FileId == null) {
      let tempArr = this.state.files.filter(item => item.OriginalFileName !== OriginalFileName)
      this.setState({ files: tempArr })
    }
  }

  Preview = ({ meta }) => {
    return (
      <span style={{ alignSelf: 'flex-start', margin: '10px 3%', fontFamily: 'Helvetica' }}>
        {/* {Math.round(percent)}% */}
      </span>
    )
  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = (values) => {
    const { IsVendor, RawMaterial, RMGrade, RMSpec, Category, selectedPlants, vendorName, VendorCode,
      selectedVendorPlants, HasDifferentSource, sourceLocation, UOM, currency,
      effectiveDate, remarks, RawMaterialID, isEditFlag, files, Technology, netCost, netCurrencyCost, singlePlantSelected, DataToChange, DropdownChanged, isDateChange, isSourceChange } = this.state;

    const { initialConfiguration } = this.props;

    let plantArray = [];
    selectedPlants && selectedPlants.map((item) => {
      plantArray.push({ PlantName: item.Text, PlantId: item.Value, PlantCode: '' })
      return plantArray;
    })

    let vendorPlantArray = [];
    selectedVendorPlants && selectedVendorPlants.map((item) => {
      vendorPlantArray.push({ PlantName: item.Text, PlantId: item.Value, PlantCode: '' })
      return vendorPlantArray;
    })

    if (isEditFlag) {



      // if (DataToChange.IsVendor) {
      //   if (DropdownChanged && DataToChange.Source == values.Source && DataToChange.BasicRatePerUOM == values.BasicRate
      //     && DataToChange.ScrapRate == values.ScrapRate && DataToChange.RMFreightCost == values.FreightCharge && DataToChange.RMShearingCost == values.ShearingCost && DataToChange.Remark == values.Remark) {
      //     this.cancel()
      //     return false
      //   }
      // }

      let updatedFiles = files.map((file) => {
        return { ...file, ContextId: RawMaterialID }
      })
      let requestData = {
        RawMaterialId: RawMaterialID,
        IsVendor: IsVendor,
        HasDifferentSource: HasDifferentSource,
        Source: (!IsVendor && !HasDifferentSource) ? '' : values.Source,
        SourceLocation: (!IsVendor && !HasDifferentSource) ? '' : sourceLocation.value,
        Remark: remarks,
        BasicRatePerUOM: values.BasicRate,
        ScrapRate: values.ScrapRate,
        NetLandedCost: netCost,
        LoggedInUserId: loggedInUserId(),
        EffectiveDate: moment(effectiveDate).local().format('YYYY-MM-DD'),
        Attachements: updatedFiles,
        NetLandedCostConversion: netCurrencyCost,
        RMFreightCost: values.FreightCharge,
        RMShearingCost: values.ShearingCost,
        IsConvertIntoCopy: isDateChange ? true : false,
        IsForcefulUpdated: isDateChange ? false : isSourceChange ? false : true,
        CutOffPrice: values.cutOffPrice,
        IsCutOffApplicable: values.cutOffPrice < netCost ? true : false
      }
      if (isEditFlag) {
        if (isSourceChange) {
          this.props.reset()
          this.props.updateRMImportAPI(requestData, (res) => {
            if (res.data.Result) {
              toastr.success(MESSAGES.RAW_MATERIAL_DETAILS_UPDATE_SUCCESS)
              this.clearForm()
              // this.cancel()
            }
          })
        }
        if (isDateChange) {

          this.props.reset()
          this.props.updateRMImportAPI(requestData, (res) => {
            if (res.data.Result) {
              toastr.success(MESSAGES.RAW_MATERIAL_DETAILS_UPDATE_SUCCESS)
              this.clearForm()
              // this.cancel()
            }
          })
        } else {
          if (DropdownChanged && Number(DataToChange.BasicRatePerUOM) == values.BasicRate && Number(DataToChange.ScrapRate) == values.ScrapRate && Number(DataToChange.NetLandedCost) === values.NetLandedCost && DataToChange.Remark == values.Remark && Number(DataToChange.cutOffPrice) === values.cutOffPrice) {
            this.cancel()
            return false
          }
          const toastrConfirmOptions = {
            onOk: () => {
              this.props.reset()
              this.props.updateRMImportAPI(requestData, (res) => {
                if (res.data.Result) {
                  toastr.success(MESSAGES.RAW_MATERIAL_DETAILS_UPDATE_SUCCESS);
                  this.clearForm();
                }
              })
            },
            onCancel: () => { },
            component: () => <ConfirmComponent />,
          }
          return toastr.confirm(`${'You have changed details, So your all Pending for Approval costing will get Draft. Do you wish to continue?'}`, toastrConfirmOptions,)
        }
      }


    } else {

      const formData = {
        IsVendor: IsVendor,
        RawMaterial: RawMaterial.value,
        RMGrade: RMGrade.value,
        RMSpec: RMSpec.value,
        Category: Category.value,
        TechnologyId: Technology.value,// NEED TO UNCOMMENT AFTER KEY ADDED IN BACKEND
        Vendor: vendorName.value,
        HasDifferentSource: HasDifferentSource,
        Source: (!IsVendor && !HasDifferentSource) ? '' : values.Source,
        SourceLocation: (!IsVendor && !HasDifferentSource) ? '' : sourceLocation.value,
        UOM: UOM.value,
        BasicRatePerUOM: values.BasicRate,
        ScrapRate: values.ScrapRate,
        NetLandedCost: netCost,
        Remark: remarks,
        LoggedInUserId: loggedInUserId(),
        Plant: IsVendor === false ? plantArray : [],
        VendorPlant: initialConfiguration && initialConfiguration.IsVendorPlantConfigurable ? (IsVendor ? vendorPlantArray : []) : [],
        VendorCode: VendorCode,
        Attachements: files,
        Currency: currency.label,
        EffectiveDate: moment(effectiveDate).local().format('YYYY-MM-DD'),
        NetLandedCostConversion: netCurrencyCost,
        RMFreightCost: values.FreightCharge,
        RMShearingCost: values.ShearingCost,
        DestinationPlantId: IsVendor ? singlePlantSelected.value : '00000000-0000-0000-0000-000000000000',
        CutOffPrice: values.cutOffPrice,
        IsCutOffApplicable: values.cutOffPrice < netCost ? true : false
      }
      this.props.reset()
      this.props.createRMImport(formData, (res) => {
        if (res.data.Result) {
          toastr.success(MESSAGES.MATERIAL_ADD_SUCCESS);
          this.clearForm();
        }
      });
    }
  }

  handleKeyDown = function (e) {
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault();
    }
  };

  handleSinglePlant = (newValue) => {
    this.setState({ singlePlantSelected: newValue })
  }
  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { handleSubmit, initialConfiguration } = this.props;
    const { isRMDrawerOpen, isOpenGrade, isOpenSpecification,
      isOpenCategory, isOpenVendor, isOpenUOM, isEditFlag, effectiveDate, RawMaterial } = this.state;

    return (
      <>
        {this.state.isLoader && <LoaderCustom customClass="add-page-loader" />}
        <div className="container-fluid">
          <div>
            <div className="login-container signup-form">
              <div className="row">
                <div className="col-md-12">
                  <div className="shadow-lgg login-formg">
                    <div className="row">
                      <div className="col-md-6">
                        <h2>
                          {isEditFlag
                            ? `Update Raw Material (Import)`
                            : `Add Raw Material (Import)`}
                        </h2>
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
                              <div className={"left-title"}>Zero Based</div>
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
                              <div className={"right-title"}>
                                Vendor Based
                                  </div>
                            </label>
                          </Col>
                        </Row>
                        <Row>
                          <Col md="12" className="filter-block">
                            <div className=" flex-fills mb-2 pl-0">
                              <h5>{"Raw Material:"}</h5>
                            </div>
                          </Col>
                          <Col md="4">
                            <div className="d-flex justify-space-between align-items-center inputwith-icon">
                              <div className="fullinput-icon">
                                <Field
                                  name="RawMaterialId"
                                  type="text"
                                  label="Name"
                                  component={searchableSelect}
                                  placeholder={"Select"}
                                  options={this.renderListing("material")}
                                  //onKeyUp={(e) => this.changeItemDesc(e)}
                                  validate={this.state.RawMaterial == null || this.state.RawMaterial.length === 0 ? [required] : []}
                                  required={true}
                                  handleChangeDescription={this.handleRMChange}
                                  valueDescription={this.state.RawMaterial}
                                  disabled={isEditFlag ? true : false}
                                />
                              </div>
                              {!isEditFlag && (
                                <div
                                  onClick={this.rmToggler}
                                  className={"plus-icon-square  right"}
                                ></div>
                              )}
                            </div>
                          </Col>
                          <Col md="4">
                            <div className="d-flex justify-space-between align-items-center inputwith-icon">
                              <div className="fullinput-icon">
                                <Field
                                  name="RawMaterialGradeId"
                                  type="text"
                                  label="Grade"
                                  component={searchableSelect}
                                  placeholder={"Select"}
                                  options={this.renderListing("grade")}
                                  //onKeyUp={(e) => this.changeItemDesc(e)}
                                  validate={
                                    this.state.RMGrade == null || this.state.RMGrade.length === 0 ? [required] : []}
                                  required={true}
                                  handleChangeDescription={this.handleGradeChange}
                                  valueDescription={this.state.RMGrade}
                                  disabled={isEditFlag ? true : false}
                                />
                              </div>
                              {/* {this.state.RawMaterial == null || this.state.RawMaterial.length === 0 ? (
                                <div
                                  className={
                                    "plus-icon-square blurPlus-icon-square right"
                                  }
                                ></div>
                              ) : (
                                  !isEditFlag && (
                                    <div
                                      onClick={this.gradeToggler}
                                      className={"plus-icon-square right"}
                                    ></div>
                                  )
                                )} */}
                            </div>
                          </Col>
                          <Col md="4">
                            <div className="d-flex justify-space-between align-items-center inputwith-icon">
                              <div className="fullinput-icon">
                                <Field
                                  name="RawMaterialSpecificationId"
                                  type="text"
                                  label="Specification"
                                  component={searchableSelect}
                                  placeholder={"Select"}
                                  options={this.renderListing("specification")}
                                  //onKeyUp={(e) => this.changeItemDesc(e)}
                                  validate={this.state.RMSpec == null || this.state.RMSpec.length === 0 ? [required] : []}
                                  required={true}
                                  handleChangeDescription={this.handleSpecChange}
                                  valueDescription={this.state.RMSpec}
                                  disabled={isEditFlag ? true : false}
                                />
                              </div>
                              {/* {!isEditFlag && (
                                <div
                                  onClick={this.specificationToggler}
                                  className={"plus-icon-square  right"}
                                ></div>
                              )} */}
                            </div>
                          </Col>
                          <Col md="4">
                            <div className="d-flex justify-space-between align-items-center inputwith-icon">
                              <div className="fullinput-icon">
                                <Field
                                  name="CategoryId"
                                  type="text"
                                  label="Category"
                                  component={searchableSelect}
                                  placeholder={"Select"}
                                  options={this.renderListing("category")}
                                  //onKeyUp={(e) => this.changeItemDesc(e)}
                                  validate={this.state.Category == null || this.state.Category.length === 0 ? [required] : []}
                                  required={true}
                                  handleChangeDescription={this.handleCategoryChange}
                                  valueDescription={this.state.Category}
                                  disabled={isEditFlag ? true : false}
                                />
                              </div>
                            </div>
                          </Col>
                          <Col md="4">
                            <Field
                              label="Technology"
                              type="text"
                              name="TechnologyId"
                              component={searchableSelect}
                              placeholder={"Technology"}
                              options={this.renderListing("technology")}
                              //onKeyUp={(e) => this.changeItemDesc(e)}
                              validate={this.state.Technology == null || this.state.Technology.length === 0 ? [required] : []}
                              required={true}
                              handleChangeDescription={this.handleTechnologyChange}
                              valueDescription={this.state.Technology}
                              disabled={isEditFlag ? true : false}
                            />
                          </Col>
                          {(this.state.IsVendor === false && (
                            <Col md="4">
                              <Field
                                label="Plant"
                                name="SourceSupplierPlantId"
                                placeholder={"Select"}
                                selection={
                                  this.state.selectedPlants == null || this.state.selectedPlants.length === 0 ? [] : this.state.selectedPlants}
                                options={this.renderListing("plant")}
                                selectionChanged={this.handleSourceSupplierPlant}
                                validate={
                                  this.state.selectedPlants == null || this.state.selectedPlants.length === 0 ? [required] : []}
                                required={true}
                                optionValue={(option) => option.Value}
                                optionLabel={(option) => option.Text}
                                component={renderMultiSelectField}
                                mendatory={true}
                                className="multiselect-with-border"
                              // disabled={this.state.IsVendor || isEditFlag ? true : false}
                              />
                            </Col>)
                          )}
                          {
                            (this.state.IsVendor === true && getConfigurationKey().IsDestinationPlantConfigure) &&
                            <Col md="4">
                              <Field
                                label={'Destination Plant'}
                                name="DestinationPlant"
                                placeholder={"Select"}
                                // selection={
                                //   this.state.selectedPlants == null || this.state.selectedPlants.length === 0 ? [] : this.state.selectedPlants}
                                options={this.renderListing("singlePlant")}
                                handleChangeDescription={this.handleSinglePlant}
                                validate={this.state.singlePlantSelected == null || this.state.singlePlantSelected.length === 0 ? [required] : []}
                                required={true}
                                // optionValue={(option) => option.Value}
                                // optionLabel={(option) => option.Text}
                                component={searchableSelect}
                                valueDescription={this.state.singlePlantSelected}
                                mendatory={true}
                                className="multiselect-with-border"
                                disabled={isEditFlag ? true : false}
                              />
                            </Col>
                          }
                        </Row>


                        <Row>
                          <Col md="12" className="filter-block">
                            <div className=" flex-fills mb-2 pl-0 d-flex justify-content-between align-items-center">
                              <h5>{"Vendor:"}</h5>
                              {!this.state.IsVendor && (
                                <label
                                  className={`custom-checkbox w-auto mb-0 ${this.state.IsVendor ? "disabled" : ""
                                    }`}
                                  onChange={this.onPressDifferentSource}
                                >
                                  Has Difference Source?
                                  <input
                                    type="checkbox"
                                    checked={this.state.HasDifferentSource}
                                    disabled={this.state.IsVendor ? true : false}
                                  />
                                  <span
                                    className=" before-box"
                                    checked={this.state.HasDifferentSource}
                                    onChange={this.onPressDifferentSource}
                                  />
                                </label>
                              )}
                            </div>
                          </Col>
                          <Col md="4">
                            <div className="d-flex justify-space-between align-items-center inputwith-icon">
                              <div className="fullinput-icon">
                                <Field
                                  name="DestinationSupplierId"
                                  type="text"
                                  label="Vendor Name"
                                  component={searchableSelect}
                                  placeholder={"Select"}
                                  options={this.renderListing("VendorNameList")}
                                  //onKeyUp={(e) => this.changeItemDesc(e)}
                                  validate={this.state.vendorName == null || this.state.vendorName.length === 0 ? [required] : []}
                                  required={true}
                                  handleChangeDescription={this.handleVendorName}
                                  valueDescription={this.state.vendorName}
                                  disabled={isEditFlag ? true : false}
                                />
                              </div>
                              {!isEditFlag && (
                                <div
                                  onClick={this.vendorToggler}
                                  className={"plus-icon-square  right"}
                                ></div>
                              )}
                            </div>
                          </Col>
                          {initialConfiguration && initialConfiguration.IsVendorPlantConfigurable && this.state.IsVendor && (
                            <Col md="4">
                              <Field
                                label="Vendor Plant"
                                name="DestinationSupplierPlantId"
                                placeholder={"Select"}
                                selection={
                                  this.state.selectedVendorPlants == null || this.state.selectedVendorPlants.length === 0 ? [] : this.state.selectedVendorPlants}
                                options={this.renderListing("VendorPlant")}
                                validate={this.state.selectedVendorPlants == null || this.state.selectedVendorPlants.length === 0 ? [required] : []}
                                selectionChanged={this.handleVendorPlant}
                                optionValue={(option) => option.Value}
                                optionLabel={(option) => option.Text}
                                component={renderMultiSelectField}
                                mendatory={true}
                                className="multiselect-with-border"
                                disabled={isEditFlag ? true : false}
                              />
                            </Col>
                          )}
                          {(this.state.HasDifferentSource ||
                            this.state.IsVendor) && (
                              <>
                                <Col md="4">
                                  <Field
                                    label={`Source`}
                                    name={"Source"}
                                    type="text"
                                    placeholder={"Enter"}
                                    validate={[acceptAllExceptSingleSpecialCharacter, maxLength70]}
                                    component={renderText}
                                    //required={true}
                                    disabled={false}
                                    onChange={this.handleSource}
                                    valueDescription={this.state.source}
                                    className=" "
                                    customClassName=" withBorder"
                                  />
                                </Col>
                                <Col md="4">
                                  <Field
                                    name="SourceSupplierCityId"
                                    type="text"
                                    label="Source Location"
                                    component={searchableSelect}
                                    placeholder={"Select"}
                                    options={this.renderListing("SourceLocation")}
                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                    //validate={(this.state.sourceLocation == null || this.state.sourceLocation.length == 0) ? [required] : []}
                                    //required={true}
                                    handleChangeDescription={this.handleSourceSupplierCity}
                                    valueDescription={this.state.sourceLocation}
                                  />
                                </Col>
                              </>
                            )}
                        </Row>




                        <Row>
                          <Col md="12" className="filter-block">
                            <div className=" flex-fills mb-2 pl-0">
                              <h5>{"Cost:"}</h5>
                            </div>
                          </Col>
                          <Col md="4">
                            <div className="d-flex justify-space-between align-items-center inputwith-icon">
                              <div className="fullinput-icon">
                                <Field
                                  name="UnitOfMeasurementId"
                                  type="text"
                                  label="UOM"
                                  component={searchableSelect}
                                  placeholder={"Select"}
                                  options={this.renderListing("uom")}
                                  //onKeyUp={(e) => this.changeItemDesc(e)}
                                  validate={this.state.UOM == null || this.state.UOM.length === 0 ? [required] : []}
                                  required={true}
                                  handleChangeDescription={this.handleUOM}
                                  valueDescription={this.state.UOM}
                                  disabled={isEditFlag ? true : false}
                                />
                              </div>
                              {/* {!isEditFlag && <div
                                                        onClick={this.uomToggler}
                                                        className={'plus-icon-square  right'}>
                                                    </div>} */}
                            </div>
                          </Col>
                          <Col md="4">
                            <Field
                              name="Currency"
                              type="text"
                              label="Currency"
                              component={searchableSelect}
                              placeholder={"Select"}
                              options={this.renderListing("currency")}
                              //onKeyUp={(e) => this.changeItemDesc(e)}
                              validate={this.state.currency == null || this.state.currency.length === 0 ? [required] : []}
                              required={true}
                              handleChangeDescription={this.handleCurrency}
                              valueDescription={this.state.currency}
                              disabled={isEditFlag ? true : false}
                            />
                          </Col>
                          <Col md="4">
                            <div className="form-group">
                              <div className="inputbox date-section">
                                <Field
                                  label="Effective Date"
                                  name="EffectiveDate"
                                  selected={this.state.effectiveDate}
                                  onChange={this.handleEffectiveDateChange}
                                  type="text"
                                  validate={[required]}
                                  autoComplete={'off'}
                                  required={true}
                                  disabled={false}
                                  changeHandler={(e) => {
                                    //e.preventDefault()
                                  }}
                                  component={renderDatePicker}
                                  className="form-control"
                                //minDate={moment()}
                                />
                              </div>
                            </div>
                            {this.state.showWarning && <WarningMessage message={`${this.state.currency.label} rate is not present in the Exchange Master`} />}
                          </Col>
                          <Col md="4">
                            <Field
                              label={`Cut Off Price (${this.state.currency.label === undefined ? 'Currency' : this.state.currency.label}/${this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label})`}
                              name={"cutOffPrice"}
                              type="text"
                              placeholder={""}
                              validate={[]}
                              component={renderText}
                              required={false}
                              disabled={false}
                              className=" "
                              customClassName=" withBorder"
                            />
                          </Col>
                          <Col md="4">
                            <Field
                              label={`Basic Rate(${this.state.currency.label === undefined ? 'Currency' : this.state.currency.label}/${this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label})`}
                              name={"BasicRate"}
                              type="text"
                              placeholder={"Enter"}
                              validate={[required, positiveAndDecimalNumber, decimalLengthsix]}
                              component={renderText}
                              required={true}
                              disabled={false}
                              maxLength="15"
                              className=" "
                              customClassName=" withBorder"
                            />
                          </Col>
                          <Col md="4">
                            <Field
                              label={`Scrap Rate (${this.state.currency.label === undefined ? 'Currency' : this.state.currency.label}/${this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label})`}
                              name={"ScrapRate"}
                              type="text"
                              placeholder={"Enter"}
                              validate={[required, positiveAndDecimalNumber, decimalLengthsix]}
                              component={renderText}
                              required={true}
                              className=""
                              maxLength="15"
                              customClassName=" withBorder"
                            />
                          </Col>
                          <Col md="4">
                            <Field
                              label={`RM Freight Cost (${this.state.currency.label === undefined ? 'Currency' : this.state.currency.label}/${this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label})`}
                              name={"FreightCharge"}
                              type="text"
                              placeholder={"Enter"}
                              validate={[positiveAndDecimalNumber, decimalLengthsix]}
                              component={renderText}
                              required={false}
                              className=""
                              maxLength="15"
                              customClassName=" withBorder"
                            />
                          </Col>
                          <Col md="4">
                            <Field
                              label={`Shearing Cost (${this.state.currency.label === undefined ? 'Currency' : this.state.currency.label}/${this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label})`}
                              name={"ShearingCost"}
                              type="text"
                              placeholder={"Enter"}
                              validate={[positiveAndDecimalNumber, decimalLengthsix]}
                              component={renderText}
                              required={false}
                              className=""
                              maxLength="15"
                              customClassName=" withBorder"
                            />
                          </Col>
                          <Col md="4">
                            <Field
                              label={`Net Cost (${this.state.currency.label === undefined ? 'Currency' : this.state.currency.label}/${this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label})`}
                              name={"NetLandedCost"}
                              type="text"
                              placeholder={""}
                              validate={[]}
                              component={renderText}
                              required={false}
                              disabled={true}
                              className=" "
                              customClassName=" withBorder mb-0"
                            />
                          </Col>
                          {
                            this.state.showCurrency &&
                            <Col md="4">
                              <Field
                                label={`Net Cost (INR/${this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label})`}
                                name={"NetLandedCostCurrency"}
                                type="text"
                                placeholder={""}
                                validate={[]}
                                component={renderText}
                                required={false}
                                disabled={true}
                                className=" "
                                customClassName=" withBorder mb-0"
                              />
                            </Col>
                          }


                        </Row>

                        <Row>
                          <Col md="12" className="filter-block">
                            <div className=" flex-fills mb-2 pl-0">
                              <h5>{"Remarks & Attachments:"}</h5>
                            </div>
                          </Col>
                          <Col md="6">
                            <Field
                              label={"Remarks"}
                              name={`Remark`}
                              placeholder="Type here..."
                              value={this.state.remarks}
                              className=""
                              customClassName=" textAreaWithBorder"
                              onChange={this.handleMessageChange}
                              validate={[maxLength512]}
                              //required={true}
                              component={renderTextAreaField}
                              maxLength="512"
                              rows="10"
                            />
                          </Col>
                          <Col md="3">
                            <label>
                              Upload Files (Upload up to 3 files)
                                </label>
                            {this.state.files.length >= 3 ? (
                              <div class="alert alert-danger" role="alert">
                                Maximum file upload limit has been reached.
                              </div>
                            ) : (
                              <Dropzone
                                getUploadParams={this.getUploadParams}
                                onChangeStatus={this.handleChangeStatus}
                                PreviewComponent={this.Preview}
                                //onSubmit={this.handleSubmit}
                                accept="*"
                                initialFiles={this.state.initialFiles}
                                maxFiles={3}
                                maxSizeBytes={2000000}
                                inputContent={(files, extra) =>
                                  extra.reject ? (
                                    "Image, audio and video files only"
                                  ) : (
                                    <div className="text-center">
                                      <i className="text-primary fa fa-cloud-upload"></i>
                                      <span className="d-block">
                                        Drag and Drop or{" "}
                                        <span className="text-primary">
                                          Browse
                                            </span>
                                        <br />
                                            file to upload
                                          </span>
                                    </div>
                                  )
                                }
                                styles={{
                                  dropzoneReject: {
                                    borderColor: "red",
                                    backgroundColor: "#DAA",
                                  },
                                  inputLabel: (files, extra) =>
                                    extra.reject ? { color: "red" } : {},
                                }}
                                classNames="draper-drop"
                              />
                            )}
                          </Col>
                          <Col md="3">
                            <div className={"attachment-wrapper"}>
                              {this.state.files &&
                                this.state.files.map((f) => {
                                  const withOutTild = f.FileURL.replace(
                                    "~",
                                    ""
                                  );
                                  const fileURL = `${FILE_URL}${withOutTild}`;
                                  return (
                                    <div className={"attachment images"}>
                                      <a href={fileURL} target="_blank">
                                        {f.OriginalFileName}
                                      </a>
                                      {/* <a href={fileURL} target="_blank" download={f.FileName}>
                                                                        <img src={fileURL} alt={f.OriginalFileName} width="104" height="142" />
                                                                    </a> */}
                                      {/* <div className={'image-viwer'} onClick={() => this.viewImage(fileURL)}>
                                                                        <img src={fileURL} height={50} width={100} />
                                                                    </div> */}

                                      <img
                                        className="float-right"
                                        alt={""}
                                        onClick={() =>
                                          this.deleteFile(
                                            f.FileId,
                                            f.FileName
                                          )
                                        }
                                        src={require("../../../assests/images/red-cross.png")}
                                      ></img>
                                    </div>
                                  );
                                })}
                            </div>
                          </Col>
                        </Row>
                      </div>
                      <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                        <div className="col-sm-12 text-right bluefooter-butn">
                          <button
                            type={"button"}
                            className="mr15 cancel-btn"
                            onClick={this.cancel}
                          >
                            <div className={"cross-icon"}>
                              <img
                                src={require("../../../assests/images/times.png")}
                                alt="cancel-icon.jpg"
                              />
                            </div>{" "}
                            {"Cancel"}
                          </button>
                          <button
                            type="submit"
                            className="user-btn mr5 save-btn"
                          >
                            <div className={"check-icon"}>
                              <img
                                src={require("../../../assests/images/check.png")}
                                alt="check-icon.jpg"
                              />
                            </div>{" "}
                            {isEditFlag ? "Update" : "Save"}
                          </button>
                        </div>
                      </Row>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isRMDrawerOpen && (
            <AddSpecification
              isOpen={isRMDrawerOpen}
              closeDrawer={this.closeRMDrawer}
              isEditFlag={false}
              ID={""}
              anchor={"right"}
              AddAccessibilityRMANDGRADE={
                this.props.AddAccessibilityRMANDGRADE
              }
              EditAccessibilityRMANDGRADE={
                this.props.EditAccessibilityRMANDGRADE
              }
            />
          )}
          {isOpenGrade && (
            <AddGrade
              isOpen={isOpenGrade}
              closeDrawer={this.closeGradeDrawer}
              isEditFlag={false}
              RawMaterial={this.state.RawMaterial}
              anchor={"right"}
            />
          )}
          {isOpenSpecification && (
            <AddSpecification
              isOpen={isOpenSpecification}
              closeDrawer={this.closeSpecDrawer}
              isEditFlag={false}
              ID={""}
              anchor={"right"}
              AddAccessibilityRMANDGRADE={
                this.props.AddAccessibilityRMANDGRADE
              }
              EditAccessibilityRMANDGRADE={
                this.props.EditAccessibilityRMANDGRADE
              }
            />
          )}
          {isOpenCategory && (
            <AddCategory
              isOpen={isOpenCategory}
              closeDrawer={this.closeCategoryDrawer}
              isEditFlag={false}
              ID={""}
              anchor={"right"}
            />
          )}
          {isOpenVendor && (
            <AddVendorDrawer
              isOpen={isOpenVendor}
              closeDrawer={this.closeVendorDrawer}
              isEditFlag={false}
              isRM={true}
              IsVendor={this.state.IsVendor}
              ID={""}
              anchor={"right"}
            />
          )}
          {isOpenUOM && (
            <AddUOM
              isOpen={isOpenUOM}
              closeDrawer={this.closeUOMDrawer}
              isEditFlag={false}
              ID={""}
              anchor={"right"}
            />
          )}
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
  const { comman, material, auth } = state;
  const fieldsObj = selector(state, 'BasicRate', 'FreightCharge', 'ShearingCost');

  const { uniOfMeasurementList, rowMaterialList, rmGradeList, rmSpecification, plantList,
    supplierSelectList, filterPlantList, filterCityListBySupplier, cityList, technologyList,
    categoryList, filterPlantListByCity, filterPlantListByCityAndSupplier, UOMSelectList,
    currencySelectList, technologySelectList, plantSelectList } = comman;

  const { initialConfiguration } = auth;

  const { rawMaterialDetails, rawMaterialDetailsData, rawMaterialNameSelectList,
    gradeSelectList, vendorListByVendorType } = material;

  let initialValues = {};
  if (rawMaterialDetails && rawMaterialDetails !== undefined) {
    initialValues = {
      Source: rawMaterialDetails.Source,
      BasicRate: rawMaterialDetails.BasicRatePerUOM,
      ScrapRate: rawMaterialDetails.ScrapRate,
      NetLandedCost: rawMaterialDetails.NetLandedCost,
      Remark: rawMaterialDetails.Remark,
    }
  }

  return {
    uniOfMeasurementList, rowMaterialList, rmGradeList, rmSpecification,
    plantList, supplierSelectList, cityList, technologyList, categoryList, rawMaterialDetails,
    filterPlantListByCity, filterCityListBySupplier, rawMaterialDetailsData, initialValues,
    fieldsObj, filterPlantListByCityAndSupplier, rawMaterialNameSelectList, gradeSelectList,
    filterPlantList, UOMSelectList, vendorListByVendorType, currencySelectList, technologySelectList, plantSelectList,
    initialConfiguration,
  }

}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
  createRMImport,
  getRawMaterialCategory,
  fetchSupplierCityDataAPI,
  fetchGradeDataAPI,
  fetchSpecificationDataAPI,
  getRMImportDataById,
  getCityBySupplier,
  getPlantByCity,
  getPlantByCityAndSupplier,
  updateRMImportAPI,
  fetchRMGradeAPI,
  getRawMaterialNameChild,
  getRMGradeSelectListByRawMaterial,
  getSupplierList,
  getPlantBySupplier,
  getUOMSelectList,
  getVendorListByVendorType,
  fileUploadRMDomestic,
  getCurrencySelectList,
  fetchPlantDataAPI,
  getTechnologySelectList,
  getPlantSelectListByType,
  getExchangeRateByCurrency,
  getVendorWithVendorCodeSelectList
})(reduxForm({
  form: 'AddRMImport',
  enableReinitialize: true,
})(AddRMImport));
