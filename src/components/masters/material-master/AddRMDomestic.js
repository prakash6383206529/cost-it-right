import React, { Component, } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Row, Col, Label, } from 'reactstrap';
import { required, getVendorCode, positiveAndDecimalNumber, maxLength15, acceptAllExceptSingleSpecialCharacter, maxLength70, maxLength512, checkForDecimalAndNull, checkForNull, decimalLengthsix } from "../../../helper/validation";
import { renderText, renderNumberInputField, searchableSelect, renderMultiSelectField, renderTextAreaField, focusOnError, renderDatePicker, } from '../../layout/FormInputs'
import { AcceptableRMUOM } from '../../../config/masterData'
import {
  getRawMaterialCategory, fetchGradeDataAPI, fetchSpecificationDataAPI, getCityBySupplier, getPlantByCity,
  getPlantByCityAndSupplier, fetchRMGradeAPI, getSupplierList, getPlantBySupplier, getUOMSelectList, fetchSupplierCityDataAPI,
  fetchPlantDataAPI, getPlantSelectListByType, getCityByCountry, getAllCity
} from '../../../actions/Common'
import {
  createRMDomestic, getRawMaterialDetailsAPI, updateRMDomesticAPI, getRawMaterialNameChild, getRMGradeSelectListByRawMaterial,
  getVendorListByVendorType, fileUploadRMDomestic, fileUpdateRMDomestic, fileDeleteRMDomestic, getVendorWithVendorCodeSelectList, checkAndGetRawMaterialCode,
  masterFinalLevelUser
} from '../actions/Material'
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message'
import { loggedInUserId, getConfigurationKey, userDetails, } from '../../../helper/auth'
import AddSpecification from './AddSpecification'
import AddGrade from './AddGrade'
import AddCategory from './AddCategory'
import AddUOM from '../uom-master/AddUOM'
import AddVendorDrawer from '../supplier-master/AddVendorDrawer'
import Dropzone from 'react-dropzone-uploader'
import 'react-dropzone-uploader/dist/styles.css'
import 'react-datepicker/dist/react-datepicker.css'
import { FILE_URL, ZBC, RM_MASTER_ID, EMPTY_GUID, SPACEBAR, ZBCTypeId, VBCTypeId, CBCTypeId } from '../../../config/constants'
import DayTime from '../../common/DayTimeWrapper'
import TooltipCustom from '../../common/Tooltip';
import LoaderCustom from '../../common/LoaderCustom';
import imgRedcross from '../../../assests/images/red-cross.png'
import { CheckApprovalApplicableMaster, onFocus, showDataOnHover } from '../../../helper';
import MasterSendForApproval from '../MasterSendForApproval'
import { animateScroll as scroll } from 'react-scroll';

import AsyncSelect from 'react-select/async';
import { getCostingSpecificTechnology } from '../../costing/actions/Costing';
import { labelWithUOMAndCurrency } from '../../../helper';
import { getClientSelectList, } from '../actions/Client';


const selector = formValueSelector('AddRMDomestic')

class AddRMDomestic extends Component {
  constructor(props) {
    super(props)
    this.child = React.createRef()
    // ********* INITIALIZE REF FOR DROPZONE ********
    this.dropzone = React.createRef();
    this.state = {
      isEditFlag: false,
      isViewFlag: this.props?.data?.isViewFlag ? true : false,

      RawMaterialID: EMPTY_GUID,
      client: [],
      RawMaterial: [],
      RMGrade: [],
      RMSpec: [],
      Category: [],
      Technology: [],
      selectedPlants: [],

      vendorName: [],
      VendorCode: '',
      vendorLocation: [],
      isVendorNameNotSelected: false,
      updateAsyncDropdown: false,

      HasDifferentSource: false,
      sourceLocation: [],

      UOM: [],
      effectiveDate: '',
      oldDate: '',
      minEffectiveDate: '',
      remarks: '',

      isShowForm: false,
      IsVendor: false,
      files: [],
      errors: [],
      nameDrawer: [],
      costingTypeId: ZBCTypeId,
      isRMDrawerOpen: false,
      isOpenGrade: false,
      isOpenSpecification: false,
      isOpenCategory: false,
      isOpenVendor: false,
      isOpenUOM: false,

      isVisible: false,
      imageURL: '',

      netLandedCost: '',
      freightCost: '',
      singlePlantSelected: [],
      showLoader: false,
      DropdownChanged: true,
      DataToChange: [],
      isDateChange: false,
      isSourceChange: false,
      source: '',
      approveDrawer: false,
      IsFinancialDataChanged: true,
      approvalObj: {},
      uploadAttachements: true,
      isFinalApprovar: false,
      updatedObj: {},
      setDisable: false,
      inputLoader: false,
      attachmentLoader: false,
      showErrorOnFocus: false,
      showErrorOnFocusDate: false
    }
  }
  /**
   * @method componentWillMount
   * @description Called before render the component
   */
  UNSAFE_componentWillMount() {
    if (!(this.props.data.isEditFlag || this.state.isViewFlag)) {
      this.props.getUOMSelectList(() => { })
      this.props.getSupplierList(() => { })
      this.props.fetchPlantDataAPI(() => { })
      this.props.getRMGradeSelectListByRawMaterial('', (res) => { })
    }
  }

  /**
   * @method componentDidMount
   * @description Called after rendering the component
   */
  componentDidMount() {

    const { data } = this.props
    this.getDetails(data)
    if (!this.state.isViewFlag) {
      this.props.getRawMaterialNameChild('', () => { })
      this.props.getAllCity(cityId => {
        this.props.getCityByCountry(cityId, 0, () => { })
      })
    }
    if (!(this.props.data.isEditFlag || this.state.isViewFlag)) {
      this.setState({ inputLoader: true })
      this.props.getRawMaterialCategory((res) => { })
      this.props.getVendorListByVendorType(ZBCTypeId, () => { this.setState({ inputLoader: false }) })
      this.props.getCostingSpecificTechnology(loggedInUserId(), () => { this.setState({ inputLoader: false }) })
      this.props.getPlantSelectListByType(ZBC, () => { })
      this.props.getClientSelectList(() => { })
    }
    if (!this.state.isViewFlag) {
      let obj = {
        MasterId: RM_MASTER_ID,
        DepartmentId: userDetails().DepartmentId,
        LoggedInUserLevelId: userDetails().LoggedInMasterLevelId,
        LoggedInUserId: loggedInUserId()
      }
      this.props.masterFinalLevelUser(obj, (res) => {
        if (res.data.Result) {
          this.setState({ isFinalApprovar: res.data.Data.IsFinalApprovar })
        }
      })
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.fieldsObj !== prevProps.fieldsObj) {
      this.calculateNetCost()
    }
  }

  /**
   * @method handleRMChange
   * @description  used to handle row material selection
   */
  handleRMChange = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ RawMaterial: newValue, RMGrade: [] }, () => {
        const { RawMaterial } = this.state
        this.props.getRMGradeSelectListByRawMaterial(
          RawMaterial.value,
          (res) => { },
        )
      })
    } else {
      this.setState({ RMGrade: [], RMSpec: [], RawMaterial: [] })
      this.props.getRMGradeSelectListByRawMaterial('', (res) => { })
      this.props.fetchSpecificationDataAPI(0, () => { })
    }
  }

  /**
   * @method handleGradeChange
   * @description  used to handle row material grade selection
   */
  handleGradeChange = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ RMGrade: newValue, RMSpec: [] }, () => {
        const { RMGrade } = this.state
        this.props.fetchSpecificationDataAPI(RMGrade.value, (res) => { })
      })
    } else {
      this.setState({
        RMGrade: [],
        RMSpec: [],
      })
      this.props.fetchSpecificationDataAPI(0, (res) => { })
    }
  }

  /**
   * @method handleSpecChange
   * @description  used to handle row material grade selection
   */
  handleSpecChange = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ RMSpec: newValue })
      this.props.change('Code', newValue.RawMaterialCode ? newValue.RawMaterialCode : '')
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
    // this.setState({ isRMDrawerOpen: false })
    if (newValue && newValue !== '') {
      this.setState({ Technology: newValue, nameDrawer: true }, () => {
        this.setState({ RawMaterial: [] })
      })
    }
  }
  /**
  * @method handleClient
  * @description called
  */
  handleClient = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ client: newValue });
    } else {
      this.setState({ client: [] })
    }
  };
  /**
   * @method handleCategoryType
   * @description  used to handle category type selection
   */
  handleCategoryType = (e) => {
    this.props.fetchCategoryAPI(e.target.value, (res) => { })
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
      this.setState(
        { vendorName: newValue, isVendorNameNotSelected: false, vendorLocation: [] },
        () => {
          const { vendorName } = this.state
          const result =
            vendorName && vendorName.label
              ? getVendorCode(vendorName.label)
              : ''
          this.setState({ VendorCode: result })
          this.props.getPlantBySupplier(vendorName.value, () => { })
        },
      )
    } else {
      this.setState({
        vendorName: [],
        vendorLocation: [],
      })
      this.props.getPlantBySupplier('', () => { })
    }
  }
  /**
   * @method handleVendorLocation
   * @description called
   */
  handleVendorLocation = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ vendorLocation: newValue })
    } else {
      this.setState({ vendorLocation: [] })
    }
  }

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

  }


  handleCutOffPrice = (newValue) => {

    if (newValue && newValue !== '') {

      this.setState({ isSourceChange: true })

    }

  }

  handleSource = (newValue, actionMeta) => {

    if (newValue && newValue !== '') {

      this.setState({ source: newValue, isSourceChange: true })

    }
  }

  /**
   * @method handleUOM
   * @description called
   */
  handleUOM = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ UOM: newValue })
    } else {
      this.setState({ UOM: [] })
    }
  }

  handleScrapRate = (newValue, actionMeta) => {
    const { fieldsObj } = this.props
    if (Number(newValue.target.value) > Number(fieldsObj.BasicRate)) {
      Toaster.warning("Scrap rate should not be greater than basic rate")
      return false
    }

    if (this.state.isEditFlag) {

      if (Number(fieldsObj.ScrapRate) === Number(this.state.DataToChange.ScrapRate) && Number(this.state.netLandedCost) === Number(this.state.DataToChange?.NetLandedCost)) {
        this.setState({ IsFinancialDataChanged: false })
      } else {
        this.setState({ IsFinancialDataChanged: true })

      }

    }
  }



  handleBasicRate = (newValue, actionMeta) => {
    const { fieldsObj } = this.props
    if (Number(newValue.target.value) < Number(fieldsObj.ScrapRate)) {
      Toaster.warning("Scrap rate should not be greater than basic rate")
      return false
    }

  }

  /**
   * @method calculateNetCost
   * @description CALCUALTION NET COST
  */

  calculateNetCost = () => {
    const { initialConfiguration } = this.props
    const { fieldsObj } = this.props
    const netCost = checkForNull(Number(fieldsObj.BasicRate ? fieldsObj.BasicRate : 0) + Number(fieldsObj.FrieghtCharge ? fieldsObj.FrieghtCharge : 0) + Number(fieldsObj.ShearingCost ? fieldsObj.ShearingCost : 0))

    if (this.state.isEditFlag && Number(netCost) === Number(this.state.DataToChange?.NetLandedCost) && Number(fieldsObj.ScrapRate) === Number(this.state.DataToChange?.ScrapRate)) {

      this.setState({ IsFinancialDataChanged: false })
    } else if (this.state.isEditFlag) {
      this.setState({ IsFinancialDataChanged: true })

    }


    this.props.change('NetLandedCost', checkForDecimalAndNull(netCost, initialConfiguration.NoOfDecimalForPrice))
    this.setState({ netLandedCost: netCost })
  }

  /**
   * @method handleChange
   * @description Handle Effective Date
   */
  handleEffectiveDateChange = (date) => {
    if (date !== this.state.effectiveDate) {

      this.setState({ isDateChange: true, effectiveDate: date, })
    } else {
      this.setState({ isDateChange: false, effectiveDate: date, })
    }

  }

  /**
   * @method handleMessageChange
   * @description used remarks handler
   */
  handleMessageChange = (e) => {
    this.setState({
      remarks: e.target.value,
      isSourceChange: true
    })
  }

  /**
   * @method getDetails
   * @description Used to get Details
   */
  getDetails = (data) => {

    if (data && data.isEditFlag) {
      this.setState({
        isEditFlag: false, isLoader: true, isShowForm: true, RawMaterialID: data.Id,
      })
      this.props.getRawMaterialDetailsAPI(data, true, (res) => {
        if (res && res.data && res.data.Result) {
          const Data = res.data.Data
          this.setState({ DataToChange: Data })
          // this.props.getPlantBySupplier(Data.Vendor, () => { })
          this.props.change('FrieghtCharge', Data.RMFreightCost ? Data.RMFreightCost : '')
          this.props.change('ShearingCost', Data.RMShearingCost ? Data.RMShearingCost : '')
          this.props.change('cutOffPrice', Data.CutOffPrice ? Data.CutOffPrice : '')
          this.props.change('Code', Data.RawMaterialCode ? Data.RawMaterialCode : '')
          // this.props.getRMGradeSelectListByRawMaterial(Data.RawMaterial, (res) => {

          // this.props.fetchSpecificationDataAPI(Data.RMGrade, (res) => {
          setTimeout(() => {
            this.props.change('EffectiveDate', DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : "")
            this.setState({ minEffectiveDate: Data.EffectiveDate })
            this.setState({
              IsFinancialDataChanged: false,
              isEditFlag: true,
              isShowForm: true,
              costingTypeId: Data.CostingTypeId,
              client: Data.CustomerName !== undefined ? { label: Data.CustomerName, value: Data.CustomerId } : [],
              RawMaterial: Data.RawMaterialName !== undefined ? { label: Data.RawMaterialName, value: Data.RawMaterialId } : [],
              RMGrade: Data.RawMaterialGradeName !== undefined ? { label: Data.RawMaterialGradeName, value: Data.RMGrade } : [],
              RMSpec: Data.RawMaterialSpecificationName !== undefined ? { label: Data.RawMaterialSpecificationName, value: Data.RMSpec } : [],
              Category: Data.RawMaterialCategoryName !== undefined ? { label: Data.RawMaterialCategoryName, value: Data.Category } : [],
              selectedPlants: [{ Text: Data.DestinationPlantName, Value: Data.DestinationPlantId }],
              Technology: Data.TechnologyName !== undefined ? { label: Data.TechnologyName, value: Data.TechnologyId } : [],
              vendorName: Data.VendorName !== undefined ? { label: Data.VendorName, value: Data.Vendor } : [],
              HasDifferentSource: Data.HasDifferentSource,
              sourceLocation: Data.SourceSupplierLocationName !== undefined ? { label: Data.SourceSupplierLocationName, value: Data.SourceLocation } : [],
              UOM: Data.UnitOfMeasurementName !== undefined ? { label: Data.UnitOfMeasurementName, value: Data.UOM } : [],
              effectiveDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '',
              oldDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '',
              remarks: Data.Remark,
              files: Data.FileList,
              singlePlantSelected: Data.DestinationPlantName !== undefined ? { label: Data.DestinationPlantName, value: Data.DestinationPlantId } : [],
              netLandedCost: Data.NetLandedCost ? Data.NetLandedCost : ''
            }, () => this.setState({ isLoader: false }))
            // ********** ADD ATTACHMENTS FROM API INTO THE DROPZONE'S PERSONAL DATA STORE **********
            let files = Data.FileList && Data.FileList.map((item) => {
              item.meta = {}
              item.meta.id = item.FileId
              item.meta.status = 'done'
              return item
            })
            if (this.dropzone.current !== null) {
              this.dropzone.current.files = files
            }
          }, 200)
        }
      })
    } else {
      this.setState({
        isEditFlag: false,
        isLoader: false,
        RawMaterialID: EMPTY_GUID,
      })
      this.props.getRawMaterialDetailsAPI('', false, (res) => { })
    }
  }

  /**
   * @method onPressVendor
   * @description Used for Vendor checked
   */
  onPressVendor = (costingHeadFlag) => {
    this.setState({
      vendorName: [],
      costingTypeId: costingHeadFlag
    });
    if (costingHeadFlag === VBCTypeId) {
      this.setState({ inputLoader: true })
      this.props.getVendorWithVendorCodeSelectList(() => { this.setState({ inputLoader: false }) })
    }
    else if (costingHeadFlag === CBCTypeId) {
      this.props.getClientSelectList(() => { })
    }
    else {
      this.props.getVendorListByVendorType(ZBCTypeId, () => { this.setState({ inputLoader: false }) })
      this.props.getPlantBySupplier('', () => { })
      this.props.getCityBySupplier(0, () => { })
    }
  }

  /**
   * @method onPressDifferentSource
   * @description Used for Different Source checked
   */
  onPressDifferentSource = () => {
    this.setState({ HasDifferentSource: !this.state.HasDifferentSource })
  }

  rmToggler = () => {
    this.setState({ isRMDrawerOpen: true })
  }

  closeRMDrawer = (e = '', data = {}) => {
    this.setState({ isRMDrawerOpen: false }, () => {
      /* FOR SHOWING RM ,GRADE AND SPECIFICATION SELECTED IN RM SPECIFICATION DRAWER*/
      this.props.getRawMaterialNameChild('', () => {

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
                RMSpec: specObj !== undefined ? { label: specObj.Text, value: specObj.Value, RawMaterialCode: specObj.RawMaterialCode } : [],
              })
              this.props.change('Code', specObj.RawMaterialCode ? specObj.RawMaterialCode : '')
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
   * @description  used to toggle grade Drawer
   */
  closeGradeDrawer = (e = '') => {
    this.setState({ isOpenGrade: false }, () => {
      const { RawMaterial } = this.state
      this.props.getRMGradeSelectListByRawMaterial(
        RawMaterial.value,
        (res) => { },
      )
    })
  }

  specificationToggler = () => {
    this.setState({ isOpenSpecification: true })
  }

  closeSpecDrawer = (e = '') => {
    this.setState({ isOpenSpecification: false }, () => {
      const { RMGrade } = this.state
      this.props.fetchSpecificationDataAPI(RMGrade.value, (res) => { })
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

  closeVendorDrawer = (e = '', formData = {}) => {
    this.setState({ isOpenVendor: false }, () => {
      const { costingTypeId } = this.state
      if (costingTypeId !== VBCTypeId) {
        this.props.getVendorListByVendorType(ZBCTypeId, () => {
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
  closeApprovalDrawer = (e = '', type) => {
    this.setState({ approveDrawer: false, setDisable: false })
    if (type === 'submit') {
      this.clearForm('submit')
      this.cancel('submit')
    }
  }

  /**
   * @method onCancel
   * @description called
   */
  onCancel = () => {
    this.setState({
      modalVisible: false,
      isVisible: false,
      imageURL: '',
    })
  }

  viewImage = (fileURL) => {
    this.setState({
      isVisible: true,
      imageURL: fileURL,
    })
  }

  /**
   * @method renderListing
   * @description Used to show type of listing
   */
  renderListing = (label) => {
    const { gradeSelectList, rmSpecification, cityList, clientSelectList, categoryList, filterCityListBySupplier, rawMaterialNameSelectList, UOMSelectList, vendorListByVendorType, plantSelectList, costingSpecifiTechnology } = this.props
    const temp = []

    if (label === 'material') {
      rawMaterialNameSelectList && rawMaterialNameSelectList.map((item) => {
        if (item.Value === '0') return false
        temp.push({ label: item.Text, value: item.Value })
        return null
      })
      return temp
    }

    if (label === 'grade') {
      gradeSelectList && gradeSelectList.map((item) => {
        if (item.Value === '0') return false
        temp.push({ label: item.Text, value: item.Value })
        return null
      })
      return temp
    }

    if (label === 'specification') {
      rmSpecification && rmSpecification.map((item) => {
        if (item.Value === '0') return false
        temp.push({ label: item.Text, value: item.Value, RawMaterialCode: item.RawMaterialCode })
        return null
      })
      return temp
    }

    if (label === 'category') {
      categoryList && categoryList.map((item) => {
        if (item.Value === '0') return false
        temp.push({ label: item.Text, value: item.Value })
        return null
      })
      return temp
    }

    if (label === 'technology') {
      costingSpecifiTechnology &&
        costingSpecifiTechnology.map((item) => {

          if (item.Value === '0') return false
          temp.push({ label: item.Text, value: item.Value })
          return null
        })
      return temp
    }
    if (label === 'plant') {
      plantSelectList && plantSelectList.map((item) => {
        if (item.PlantId === '0') return false
        temp.push({ Text: item.PlantNameCode, Value: item.PlantId })
        return null
      })
      return temp
    }

    if (label === 'singlePlant') {
      plantSelectList && plantSelectList.map((item) => {
        if (item.PlantId === '0') return false
        temp.push({ label: item.PlantNameCode, value: item.PlantId })
        return null
      })
      return temp
    }

    if (label === 'VendorNameList') {
      vendorListByVendorType && vendorListByVendorType.map((item) => {
        if (item.Value === '0') return false
        temp.push({ label: item.Text, value: item.Value })
        return null
      })
      return temp
    }

    if (label === 'VendorLocation') {
      filterCityListBySupplier && filterCityListBySupplier.map((item) => {
        if (item.Value === '0') return false
        temp.push({ label: item.Text, value: item.Value })
        return null
      })
      return temp
    }

    if (label === 'SourceLocation') {
      cityList && cityList.map((item) => {
        if (item.Value === '0') return false
        temp.push({ label: item.Text, value: item.Value })
        return null
      })
      return temp
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

    if (label === 'city') {
      filterCityListBySupplier && filterCityListBySupplier.map((item) => {
        if (item.Value === '0') return false
        temp.push({ Text: item.Text, Value: item.Value })
        return null
      })
      return temp
    }

    if (label === 'ClientList') {
      clientSelectList && clientSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
  }

  formToggle = () => {
    this.setState({
      isShowForm: !this.state.isShowForm,
    })
  }

  /**
   * @method cancel
   * @description used to Reset form
   */
  clearForm = (type) => {
    const { reset } = this.props
    reset()
    this.setState({
      RawMaterial: [],
      RMGrade: [],
      RMSpec: [],
      Category: [],
      selectedPlants: [],
      vendorName: [],
      vendorLocation: [],
      HasDifferentSource: false,
      sourceLocation: [],
      UOM: [],
      remarks: '',
      isShowForm: false,
      isEditFlag: false,
      IsVendor: false,
      updatedObj: {}
    })
    this.props.getRawMaterialDetailsAPI('', false, (res) => { })
    this.props.fetchSpecificationDataAPI(0, () => { })
    this.props.hideForm(type)
  }

  /**
   * @method cancel
   * @description used to Reset form
   */
  cancel = (type) => {
    this.clearForm(type)
  }

  /**
   * @method resetForm
   * @description used to Reset form
   */
  resetForm = () => {
    this.clearForm()
  }

  /**
  * @method setDisableFalseFunction
  * @description setDisableFalseFunction
  */
  setDisableFalseFunction = () => {
    const loop = Number(this.dropzone.current.files.length) - Number(this.state.files.length)
    if (Number(loop) === 1) {
      this.setState({ setDisable: false, attachmentLoader: false })
    }
  }

  // called every time a file's `status` changes
  handleChangeStatus = ({ meta, file }, status) => {
    const { files } = this.state
    this.setState({ uploadAttachements: false, setDisable: true, attachmentLoader: true })

    if (status === 'removed') {
      const removedFileName = file.name
      let tempArr = files.filter(
        (item) => item.OriginalFileName !== removedFileName,
      )
      this.setState({ files: tempArr })
    }

    if (status === 'done') {
      let data = new FormData()
      data.append('file', file)
      this.props.fileUploadRMDomestic(data, (res) => {
        this.setDisableFalseFunction()
        let Data = res.data[0]
        const { files } = this.state
        let attachmentFileArray = [...files]
        attachmentFileArray.push(Data)
        this.setState({ files: attachmentFileArray })
      })
    }

    if (status === 'rejected_file_type') {
      this.setDisableFalseFunction()
      Toaster.warning('Allowed only xls, doc, jpeg, pdf files.')
    } else if (status === 'error_file_size') {
      this.setDisableFalseFunction()
      this.dropzone.current.files.pop()
      Toaster.warning("File size greater than 2 mb not allowed")
    } else if (status === 'error_validation'
      || status === 'error_upload_params' || status === 'exception_upload'
      || status === 'aborted' || status === 'error_upload') {
      this.setDisableFalseFunction()
      this.dropzone.current.files.pop()
      Toaster.warning("Something went wrong")
    }
  }

  renderImages = () => {
    this.state.files &&
      this.state.files.map((f) => {
        const withOutTild = f.FileURL.replace('~', '')
        const fileURL = `${FILE_URL}${withOutTild}`
        return (
          <div className={'attachment-wrapper images'}>
            <img src={fileURL} alt={''} />
            <button type="button" onClick={() => this.deleteFile(f.FileId)}>
              X
            </button>
          </div>
        )
      })
  }

  deleteFile = (FileId, OriginalFileName) => {
    if (FileId != null) {
      // this.props.fileDeleteRMDomestic(deleteData, (res) => {
      //   Toaster.success('File has been deleted successfully.')
      //   let tempArr = this.state.files.filter((item) => item.FileId !== FileId)
      //   this.setState({ files: tempArr })
      // })
      let tempArr = this.state.files.filter((item) => item.FileId !== FileId)
      this.setState({ files: tempArr })
    }
    if (FileId == null) {
      let tempArr = this.state.files.filter(
        (item) => item.FileName !== OriginalFileName,
      )
      this.setState({ files: tempArr })
    }

    // ********** DELETE FILES THE DROPZONE'S PERSONAL DATA STORE **********
    if (this.dropzone?.current !== null) {
      this.dropzone.current.files.pop()
    }
  }

  Preview = ({ meta }) => {
    return (
      <span
        style={{
          alignSelf: 'flex-start',
          margin: '10px 3%',
          fontFamily: 'Helvetica',
        }}
      >
        {/* {Math.round(percent)}% */}
      </span>
    )
  }

  /**
   * @method onSubmit
   * @description Used to Submit the form
   */
  onSubmit = (values) => {
    const { RawMaterial, RMGrade, RMSpec, Category, client, Technology, selectedPlants, costingTypeId, vendorName,
      VendorCode, HasDifferentSource, sourceLocation,
      UOM, remarks, RawMaterialID, isEditFlag, files, effectiveDate, netLandedCost, oldDate, singlePlantSelected, DataToChange, DropdownChanged, isDateChange, isSourceChange, IsFinancialDataChanged } = this.state
    const { fieldsObj } = this.props
    const userDetails = JSON.parse(localStorage.getItem('userDetail'))
    if (costingTypeId !== CBCTypeId && vendorName.length <= 0) {
      this.setState({ isVendorNameNotSelected: true, setDisable: false })      // IF VENDOR NAME IS NOT SELECTED THEN WE WILL SHOW THE ERROR MESSAGE MANUALLY AND SAVE BUTTON WILL NOT BE DISABLED
      return false
    }
    if (Number(fieldsObj.BasicRate) < Number(fieldsObj.ScrapRate)) {
      this.setState({ setDisable: false })
      Toaster.warning("Scrap rate should not be greater than basic rate")
      return false
    }
    this.setState({ isVendorNameNotSelected: false })

    let plantArray = []
    if (costingTypeId === VBCTypeId) {
      plantArray.push({ PlantName: singlePlantSelected.label, PlantId: singlePlantSelected.value, PlantCode: '', })
    } else if (costingTypeId === ZBCTypeId) {
      selectedPlants && selectedPlants.map((item) => {
        plantArray.push({ PlantName: item.Text, PlantId: item.Value, PlantCode: '', })
        return plantArray
      })
    }
    let cbcPlantArray = []
    if (costingTypeId === CBCTypeId) {
      userDetails?.Plants.map((item) => {
        cbcPlantArray.push({ PlantName: item.PlantName, PlantId: item.PlantId, PlantCode: item.PlantCode, })
        return cbcPlantArray
      })
    }
    let sourceLocationValue = (costingTypeId !== VBCTypeId && !HasDifferentSource ? '' : sourceLocation.value)

    if ((isEditFlag && this.state.isFinalApprovar) || (isEditFlag && CheckApprovalApplicableMaster(RM_MASTER_ID) !== true)) {
      //this.setState({ updatedObj: requestData })
      let updatedFiles = files.map((file) => {
        return { ...file, ContextId: RawMaterialID }
      })
      let requestData = {
        RawMaterialId: RawMaterialID,
        CostingTypeId: costingTypeId,
        HasDifferentSource: HasDifferentSource,
        Source: costingTypeId !== VBCTypeId && !HasDifferentSource ? '' : values.Source,
        SourceLocation: costingTypeId !== VBCTypeId && !HasDifferentSource ? '' : sourceLocation.value,
        Remark: remarks,
        BasicRatePerUOM: values.BasicRate,
        RMFreightCost: values.FrieghtCharge,
        RMShearingCost: values.ShearingCost,
        ScrapRate: values.ScrapRate,
        NetLandedCost: netLandedCost,
        LoggedInUserId: loggedInUserId(),
        EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
        Attachements: updatedFiles,
        IsConvertIntoCopy: isDateChange ? true : false,
        IsForcefulUpdated: isDateChange ? false : isSourceChange ? false : true,
        CutOffPrice: values.cutOffPrice,
        IsCutOffApplicable: values.cutOffPrice < values.NetLandedCost ? true : false,
        RawMaterialCode: values.Code,
        IsFinancialDataChanged: isDateChange ? true : false,
        VendorPlant: [],
      }
      if (IsFinancialDataChanged) {

        if ((isDateChange) && (DayTime(oldDate).format("DD/MM/YYYY") !== DayTime(effectiveDate).format("DD/MM/YYYY"))) {
          this.props.updateRMDomesticAPI(requestData, (res) => {
            this.setState({ setDisable: false })
            if (res?.data?.Result) {
              Toaster.success(MESSAGES.RAW_MATERIAL_DETAILS_UPDATE_SUCCESS)
              this.clearForm('submit')

            }
          })
          this.setState({ updatedObj: requestData })
          return

        } else {
          this.setState({ setDisable: false })
          Toaster.warning('Please update the effective date')
          return false
        }

      }
      else {
        if ((JSON.stringify(files) === JSON.stringify(DataToChange.FileList)) && DropdownChanged && Number(DataToChange.BasicRatePerUOM) === values.BasicRate && Number(DataToChange.ScrapRate) === Number(values.ScrapRate)
          && Number(DataToChange.NetLandedCost) === Number(values.NetLandedCost) && ((DataToChange.Remark ? DataToChange.Remark : '') === (values.Remark ? values.Remark : ''))
          && ((DataToChange.CutOffPrice ? Number(DataToChange.CutOffPrice) : '') === (values.cutOffPrice ? Number(values.cutOffPrice) : ''))
          && String(DataToChange.RawMaterialCode) === String(values.Code)
          && ((DataToChange.Source ? String(DataToChange.Source) : '-') === (values.Source ? String(values.Source) : '-'))
          && ((DataToChange.SourceLocation ? String(DataToChange.SourceLocation) : '') === (sourceLocationValue ? String(sourceLocationValue) : ''))) {
          this.cancel('submit')
          return false
        }
        else {

          this.props.updateRMDomesticAPI(requestData, (res) => {
            this.setState({ setDisable: false })
            if (res?.data?.Result) {
              Toaster.success(MESSAGES.RAW_MATERIAL_DETAILS_UPDATE_SUCCESS)
              this.clearForm('submit')
            }
          })
          return false

        }

      }

    }

    else {
      // this.setState({ setDisable: true })
      let formData = {}
      // const formData = {
      formData.RawMaterialId = RawMaterialID
      formData.IsFinancialDataChanged = isDateChange ? true : false
      formData.CostingTypeId = costingTypeId
      formData.RawMaterial = RawMaterial.value
      formData.RMGrade = RMGrade.value
      formData.RMSpec = RMSpec.value
      formData.Category = Category.value
      formData.TechnologyId = Technology.value
      formData.Vendor = costingTypeId === (VBCTypeId && ZBCTypeId) ? vendorName.value : ''
      formData.HasDifferentSource = HasDifferentSource
      formData.Source = costingTypeId !== VBCTypeId && !HasDifferentSource ? '' : values.Source
      formData.SourceLocation = costingTypeId !== VBCTypeId && !HasDifferentSource ? '' : sourceLocation.value
      formData.UOM = UOM.value
      formData.BasicRatePerUOM = values.BasicRate
      formData.RMFreightCost = values.FrieghtCharge
      formData.RMShearingCost = values.ShearingCost
      formData.ScrapRate = values.ScrapRate
      formData.NetLandedCost = netLandedCost
      formData.EffectiveDate = DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss')
      formData.Remark = remarks
      formData.LoggedInUserId = loggedInUserId()
      formData.Plant = costingTypeId === CBCTypeId ? cbcPlantArray : plantArray
      formData.VendorCode = costingTypeId === (VBCTypeId && ZBCTypeId) ? VendorCode : ''
      formData.VendorPlant = []
      formData.Attachements = files
      formData.CutOffPrice = values.cutOffPrice
      formData.IsCutOffApplicable = false
      formData.RawMaterialCode = values.Code
      formData.CustomerId = costingTypeId === CBCTypeId ? client.value : ''
      if (CheckApprovalApplicableMaster(RM_MASTER_ID) === true && !this.state.isFinalApprovar) {
        formData.NetLandedCostConversion = 0
        formData.Currency = "INR"
        formData.IsSendForApproval = true
      } else {
        formData.IsSendForApproval = false
      }
      // }
      // THIS CONDITION TO CHECK IF IT IS FOR MASTER APPROVAL THEN WE WILL SEND DATA FOR APPROVAL ELSE CREATE API WILL BE CALLED
      if (CheckApprovalApplicableMaster(RM_MASTER_ID) === true && !this.state.isFinalApprovar) {
        // 
        // 
        // 
        if (((files ? JSON.stringify(files) : []) === (DataToChange.FileList ? JSON.stringify(DataToChange.FileList) : [])) && DropdownChanged && Number(DataToChange.BasicRatePerUOM) === values.BasicRate && Number(DataToChange.ScrapRate) === Number(values.ScrapRate)
          && Number(DataToChange.NetLandedCost) === Number(values.NetLandedCost) && ((DataToChange.Remark ? DataToChange.Remark : '') === (values.Remark ? values.Remark : ''))
          && ((DataToChange.CutOffPrice ? Number(DataToChange.CutOffPrice) : '') === (values.cutOffPrice ? Number(values.cutOffPrice) : ''))
          && String(DataToChange.RawMaterialCode) === String(values.Code)
          && ((DataToChange.Source ? String(DataToChange.Source) : '-') === (values.Source ? String(values.Source) : '-'))
          && ((DataToChange.SourceLocation ? String(DataToChange.SourceLocation) : '') === (sourceLocationValue ? String(sourceLocationValue) : ''))) {
          Toaster.warning('Please change data to send RM for approval')
          return false
        }
        this.setState({ setDisable: true })

        if (IsFinancialDataChanged) {

          if (isDateChange && (DayTime(oldDate).format("DD/MM/YYYY") !== DayTime(effectiveDate).format("DD/MM/YYYY"))) {
            this.setState({ approveDrawer: true, approvalObj: formData })
            return

          } else {

            this.setState({ setDisable: false })
            Toaster.warning('Please update the effective date')
            return false
          }

        }

        if (isSourceChange) {
          this.setState({ approveDrawer: true, approvalObj: formData })
          this.setState({ setDisable: false })
          return

        } else {

          if (isEditFlag) {
            if ((JSON.stringify(files) === JSON.stringify(DataToChange.FileList)) && DropdownChanged && Number(DataToChange.BasicRatePerUOM) === values.BasicRate && Number(DataToChange.ScrapRate) === values.ScrapRate
              && Number(DataToChange.NetLandedCost) === values.NetLandedCost && (DataToChange.Remark ? DataToChange.Remark : '') === (values.Remark ? values.Remark : '')
              && (Number(DataToChange.CutOffPrice) === values.cutOffPrice || values.cutOffPrice === undefined)
              && DataToChange.RawMaterialCode === values.Code) {
              Toaster.warning('Please change data to send RM for approval')
              return false
            }

          }
          this.setState({ approveDrawer: true, approvalObj: formData })
        }


      } else {
        this.props.createRMDomestic(formData, (res) => {
          this.setState({ setDisable: false })
          if (res?.data?.Result) {
            Toaster.success(MESSAGES.MATERIAL_ADD_SUCCESS)
            this.clearForm('submit')
            this.cancel('submit')
          }
        })
      }

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




  // sendForMasterApproval = () => {

  // }

  /**
   * @method render
   * @description Renders the component
   */
  render() {

    const { handleSubmit, initialConfiguration, isRMAssociated } = this.props
    const { isRMDrawerOpen, isOpenGrade, isOpenSpecification, costingTypeId, isOpenCategory, isOpenVendor, isOpenUOM, isEditFlag, isViewFlag, setDisable } = this.state

    const filterList = (inputValue) => {
      let tempArr = []

      tempArr = this.renderListing("VendorNameList").filter(i =>
        i.label !== null && i.label.toLowerCase().includes(inputValue.toLowerCase())
      );

      if (tempArr.length <= 100) {
        return tempArr
      } else {
        return tempArr.slice(0, 100)
      }
    };

    const promiseOptions = inputValue =>
      new Promise(resolve => {
        resolve(filterList(inputValue));


      });

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
                        <h1>
                          {isViewFlag ? 'View' : isEditFlag ? 'Update' : 'Add'} Raw Material (Domestic)
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
                          <Col md="12">
                            <Label className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
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
                            </Label>
                            <Label className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
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
                              <span>Vendor Based</span>
                            </Label>
                            <Label className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3 pt-0 radio-box"} check>
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
                            </Label>
                          </Col>
                        </Row>
                        <Row>
                          <Col md="12" className="filter-block">
                            <div className=" flex-fills mb-2 pl-0">
                              <h5>{"Raw Material:"}</h5>
                            </div>
                          </Col>
                          <Col md="3">
                            <Field
                              label="Technology"
                              type="text"
                              name="TechnologyId"
                              component={searchableSelect}
                              placeholder={"Technology"}
                              options={this.renderListing("technology")}
                              validate={
                                this.state.Technology == null || this.state.Technology.length === 0 ? [required] : []}
                              required={true}
                              handleChangeDescription={
                                this.handleTechnologyChange
                              }
                              valueDescription={this.state.Technology}
                              disabled={isEditFlag || isViewFlag}
                            />
                          </Col>
                          <Col md="3">
                            <div className="d-flex justify-space-between align-items-center inputwith-icon">
                              <div className="fullinput-icon">
                                <Field
                                  name="RawMaterialId"
                                  type="text"
                                  label="Name"
                                  component={searchableSelect}
                                  placeholder={"Select"}
                                  options={this.renderListing("material")}
                                  validate={this.state.RawMaterial == null || this.state.RawMaterial.length === 0 ? [required] : []}
                                  required={true}
                                  handleChangeDescription={this.handleRMChange}
                                  valueDescription={this.state.RawMaterial}
                                  className="fullinput-icon"
                                  disabled={isEditFlag || isViewFlag}
                                />
                              </div>
                              {(!isEditFlag) && (
                                <div
                                  onClick={this.rmToggler}
                                  className={"plus-icon-square  right"}
                                ></div>
                              )}
                            </div>
                          </Col>
                          <Col md="3">
                            <div className="d-flex justify-space-between align-items-center inputwith-icon">
                              <div className="fullinput-icon">
                                <Field
                                  name="RawMaterialGradeId"
                                  type="text"
                                  label="Grade"
                                  component={searchableSelect}
                                  placeholder={"Select"}
                                  options={this.renderListing("grade")}
                                  validate={this.state.RMGrade == null || this.state.RMGrade.length === 0 ? [required] : []}
                                  required={true}
                                  handleChangeDescription={this.handleGradeChange}
                                  valueDescription={this.state.RMGrade}
                                  disabled={isEditFlag || isViewFlag}
                                />
                              </div>
                            </div>
                          </Col>
                          <Col md="3">
                            <div className="d-flex justify-space-between align-items-center inputwith-icon">
                              <div className="fullinput-icon">
                                <Field
                                  name="RawMaterialSpecificationId"
                                  type="text"
                                  label="Specification"
                                  component={searchableSelect}
                                  placeholder={"Select"}
                                  options={this.renderListing("specification")}
                                  validate={
                                    this.state.RMSpec == null || this.state.RMSpec.length === 0 ? [required] : []}
                                  required={true}
                                  handleChangeDescription={this.handleSpecChange}
                                  valueDescription={this.state.RMSpec}
                                  disabled={isEditFlag || isViewFlag}
                                />
                              </div>
                            </div>
                          </Col>
                          <Col md="3">
                            <TooltipCustom tooltipText="RM category will come here like CutToFit, CutToLength." />
                            <Field
                              name="CategoryId"
                              type="text"
                              label="Category"
                              component={searchableSelect}
                              placeholder={"Select"}
                              options={this.renderListing("category")}
                              validate={this.state.Category == null || this.state.Category.length === 0 ? [required] : []}
                              required={true}
                              handleChangeDescription={this.handleCategoryChange}
                              valueDescription={this.state.Category}
                              disabled={isEditFlag || isViewFlag}
                            />
                          </Col>
                          <Col md="3">
                            <Field
                              label={`Code`}
                              name={'Code'}
                              type="text"
                              placeholder={initialConfiguration?.IsAutoGeneratedRawMaterialCode ? '-' : "Enter"}
                              validate={[required]}
                              component={renderText}
                              required={true}
                              className=" "
                              customClassName=" withBorder"
                              disabled={true}
                            />
                          </Col>

                          {((costingTypeId === ZBCTypeId || (costingTypeId === ZBCTypeId && getConfigurationKey().IsCBCApplicableOnPlant)) && (
                            <Col md="3">
                              <Field
                                label="Plant"
                                name="SourceSupplierPlantId"
                                placeholder={"Select"}
                                title={showDataOnHover(this.state.selectedPlants)}
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
                                disabled={isEditFlag || isViewFlag}
                                className="multiselect-with-border"
                              />
                            </Col>)
                          )}
                          {
                            (costingTypeId === VBCTypeId && getConfigurationKey().IsDestinationPlantConfigure) &&
                            <Col md="3">
                              <Field
                                label={'Destination Plant'}
                                name="DestinationPlant"
                                placeholder={"Select"}
                                options={this.renderListing("singlePlant")}
                                handleChangeDescription={this.handleSinglePlant}
                                validate={this.state.singlePlantSelected == null || this.state.singlePlantSelected.length === 0 ? [required] : []}
                                required={true}
                                component={searchableSelect}
                                valueDescription={this.state.singlePlantSelected}
                                mendatory={true}
                                className="multiselect-with-border"
                                disabled={isEditFlag || isViewFlag}
                              />
                            </Col>
                          }
                          {costingTypeId === CBCTypeId && (
                            <Col md="3">
                              <Field
                                name="clientName"
                                type="text"
                                label={"Customer Name"}
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
                        </Row>

                        <Row>
                          {costingTypeId !== CBCTypeId && (
                            <>
                              <Col md="12" className="filter-block">
                                <div className=" flex-fills mb-2 pl-0 d-flex justify-content-between align-items-center">
                                  <h5>{"Vendor:"}</h5>
                                  {costingTypeId !== VBCTypeId && (
                                    <label
                                      className={`custom-checkbox w-auto mb-0 ${costingTypeId === VBCTypeId ? "disabled" : ""
                                        }`}
                                      onChange={this.onPressDifferentSource}
                                    >
                                      Has Difference Source?
                                      <input
                                        type="checkbox"
                                        checked={this.state.HasDifferentSource}
                                        disabled={costingTypeId === VBCTypeId ? true : false}
                                      />
                                      <span
                                        className=" before-box p-0"
                                        checked={this.state.HasDifferentSource}
                                        onChange={this.onPressDifferentSource}
                                      />
                                    </label>
                                  )}
                                </div>
                              </Col>
                              <Col md="3" className='mb-4'>
                                <label>{"Vendor Name"}<span className="asterisk-required">*</span></label>
                                <div className="d-flex justify-space-between align-items-center async-select">
                                  <div className="fullinput-icon p-relative">
                                    {!this.state.isLoader && this.state.inputLoader && <LoaderCustom customClass={`input-loader`} />}
                                    <AsyncSelect
                                      name="DestinationSupplierId"
                                      ref={this.myRef}
                                      key={this.state.updateAsyncDropdown}
                                      loadOptions={promiseOptions}
                                      onChange={(e) => this.handleVendorName(e)}
                                      value={this.state.vendorName}
                                      noOptionsMessage={({ inputValue }) => !inputValue ? "Please enter vendor name/code" : "No results found"}
                                      isDisabled={isEditFlag || isViewFlag || this.state.inputLoader}
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
                            </>
                          )}
                          {(this.state.HasDifferentSource ||
                            costingTypeId === VBCTypeId) && (
                              <>
                                <Col md="3">
                                  <Field
                                    label={`Source`}
                                    name={"Source"}
                                    type="text"
                                    placeholder={isViewFlag ? '-' : "Enter"}
                                    validate={[acceptAllExceptSingleSpecialCharacter, maxLength70]}
                                    component={renderText}
                                    onChange={this.handleSource}
                                    valueDescription={this.state.source}
                                    className=" "
                                    customClassName=" withBorder"
                                    disabled={isViewFlag}

                                  />
                                </Col>
                                <Col md="3">
                                  <Field
                                    name="SourceSupplierCityId"
                                    type="text"
                                    label="Source Location"
                                    component={searchableSelect}
                                    placeholder={isViewFlag ? '-' : "Select"}
                                    options={this.renderListing("SourceLocation")}
                                    handleChangeDescription={this.handleSourceSupplierCity}
                                    valueDescription={this.state.sourceLocation}
                                    disabled={isViewFlag}
                                  />
                                </Col>
                              </>
                            )}
                        </Row>


                        <Row className='UOM-label-container'>
                          <Col md="12" className="filter-block ">
                            <div className=" flex-fills mb-2 pl-0">
                              <h5>{"Cost:"}</h5>
                            </div>
                          </Col>
                          <Col md="3" className='dropdown-flex'>
                            <Field
                              name="UnitOfMeasurementId"
                              type="text"
                              label="UOM"
                              component={searchableSelect}
                              placeholder={"Select"}
                              options={this.renderListing("uom")}
                              validate={this.state.UOM == null || this.state.UOM.length === 0 ? [required] : []}
                              required={true}
                              handleChangeDescription={this.handleUOM}
                              valueDescription={this.state.UOM}
                              disabled={isEditFlag || isViewFlag}
                            />
                          </Col>

                          {/* NOT APPLICABLE IN RE */}
                          {/* <Col md="3">
                            <Field
                              label={labelWithUOMAndCurrency("Cut Off Price", this.state.UOM.label)}
                              name={"cutOffPrice"}
                              type="text"
                              placeholder={isViewFlag || (isEditFlag && isRMAssociated) ? '-' : "Enter"}
                              validate={[positiveAndDecimalNumber, maxLength15]}
                              component={renderNumberInputField}
                              required={false}
                              disabled={isViewFlag || (isEditFlag && isRMAssociated)}
                              onChange={this.handleCutOffPrice}
                              className=" "
                              customClassName=" withBorder"
                            />
                          </Col> */}
                          <Col md="3">
                            <Field
                              label={labelWithUOMAndCurrency("Basic Rate", this.state.UOM.label)}
                              name={"BasicRate"}
                              type="text"
                              placeholder={isViewFlag || (isEditFlag && isRMAssociated) ? '-' : "Enter"}
                              validate={[required, positiveAndDecimalNumber, maxLength15, decimalLengthsix]}
                              component={renderNumberInputField}
                              onChange={this.handleBasicRate}
                              required={true}
                              disabled={isViewFlag || (isEditFlag && isRMAssociated)}
                              className=" "
                              customClassName=" withBorder"
                              maxLength={'15'}
                            />
                          </Col>
                          <Col md="3">
                            <Field
                              label={labelWithUOMAndCurrency("Scrap Rate", this.state.UOM.label)}
                              name={"ScrapRate"}
                              type="text"
                              placeholder={isViewFlag || (isEditFlag && isRMAssociated) ? '-' : "Enter"}
                              validate={[required, positiveAndDecimalNumber, maxLength15, decimalLengthsix]}
                              component={renderNumberInputField}
                              required={true}
                              className=""
                              customClassName=" withBorder"
                              maxLength="15"
                              onChange={this.handleScrapRate}
                              disabled={isViewFlag || (isEditFlag && isRMAssociated)}
                            />
                          </Col>
                          {/* <Col md="3">
                            <Field
                              label={labelWithUOMAndCurrency("Freight Cost", this.state.UOM.label)}
                              name={"FrieghtCharge"}
                              type="text"
                              placeholder={isViewFlag || (isEditFlag && isRMAssociated) ? '-' : "Enter"}
                              // onChange={this.handleFreightCharges}
                              validate={[positiveAndDecimalNumber, maxLength15, decimalLengthsix]}
                              component={renderNumberInputField}
                              required={false}
                              className=""
                              customClassName=" withBorder"
                              maxLength="15"
                              disabled={isViewFlag || (isEditFlag && isRMAssociated)}
                            />
                          </Col>
                          <Col md="3">
                            <Field
                              label={labelWithUOMAndCurrency("Shearing Cost", this.state.UOM.label)}
                              name={"ShearingCost"}
                              type="text"
                              placeholder={isViewFlag || (isEditFlag && isRMAssociated) ? '-' : "Enter"}
                              validate={[positiveAndDecimalNumber, maxLength15, decimalLengthsix]}
                              component={renderNumberInputField}
                              required={false}
                              className=""
                              customClassName=" withBorder"
                              maxLength="15"
                              disabled={isViewFlag || (isEditFlag && isRMAssociated)}


                            />
                          </Col> */}
                          <Col md="3">
                            <Field
                              label={labelWithUOMAndCurrency("Net Cost", this.state.UOM.label)}
                              name={`${this.state.netLandedCost === 0 ? '-' : "NetLandedCost"}`}
                              type="text"
                              placeholder={"-"}
                              validate={[required]}
                              component={renderText}
                              required={false}
                              disabled={true}
                              isViewFlag={true}
                              className=" "
                              customClassName=" withBorder"
                            />
                          </Col>
                          <Col md="3">
                            <div className="inputbox date-section form-group">
                              <Field
                                label="Effective Date"
                                name="EffectiveDate"
                                selected={this.state.effectiveDate}
                                onChange={this.handleEffectiveDateChange}
                                type="text"
                                validate={[required]}
                                minDate={this.state.minEffectiveDate}
                                autoComplete={'off'}
                                required={true}
                                changeHandler={(e) => {
                                }}
                                component={renderDatePicker}
                                className="form-control"
                                disabled={isViewFlag || !this.state.IsFinancialDataChanged || (isEditFlag && isRMAssociated)}
                                placeholder={isViewFlag || !this.state.IsFinancialDataChanged || (isEditFlag && isRMAssociated) ? '-' : "Select Date"}
                                onFocus={() => onFocus(this, true)}
                              />
                            </div>
                            {this.state.showErrorOnFocusDate && this.state.effectiveDate === '' && <div className='text-help mt-1 p-absolute bottom-22'>This field is required.</div>}
                          </Col>
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
                              placeholder={isViewFlag ? '-' : "Type here..."}
                              value={this.state.remarks}
                              className=""
                              customClassName=" textAreaWithBorder"
                              onChange={this.handleMessageChange}
                              validate={[maxLength512]}
                              required={false}
                              component={renderTextAreaField}
                              maxLength="512"
                              rows="6"
                              disabled={isViewFlag}
                            />
                          </Col>
                          <Col md="3">
                            <label>Upload Files (upload up to 3 files)</label>
                            <div className={`alert alert-danger mt-2 ${this.state.files.length === 3 ? '' : 'd-none'}`} role="alert">
                              Maximum file upload limit has been reached.
                            </div>

                            <div className={`${this.state.files.length >= 3 ? 'd-none' : ''}`}>
                              <Dropzone
                                ref={this.dropzone}
                                onChangeStatus={this.handleChangeStatus}
                                PreviewComponent={this.Preview}
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
                                disabled={isViewFlag}
                              />
                            </div>
                          </Col>
                          <Col md="3">
                            <div className={"attachment-wrapper"}>
                              {this.state.attachmentLoader && <LoaderCustom customClass="attachment-loader" />}
                              {this.state.files &&
                                this.state.files.map((f) => {
                                  const withOutTild = f.FileURL.replace(
                                    "~",
                                    ""
                                  );
                                  const fileURL = `${FILE_URL}${withOutTild}`;
                                  return (
                                    <div className={"attachment images"}>
                                      <a href={fileURL} target="_blank" rel="noreferrer" title={f.OriginalFileName}>
                                        {f.OriginalFileName}
                                      </a>


                                      {!isViewFlag && <img
                                        className="float-right"
                                        alt={""}
                                        onClick={() =>
                                          this.deleteFile(f.FileId, f.FileName)
                                        }
                                        src={imgRedcross}
                                      ></img>}
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
                            onClick={() => { this.cancel('submit') }}
                            disabled={setDisable}
                          >
                            <div className={"cancel-icon"}></div>
                            {"Cancel"}
                          </button>
                          {!isViewFlag && (CheckApprovalApplicableMaster(RM_MASTER_ID) === true && !this.state.isFinalApprovar) ?
                            <button type="submit"
                              class="user-btn approval-btn save-btn mr5"
                              onClick={() => scroll.scrollToTop()}
                              disabled={isViewFlag || setDisable}

                            >
                              <div className="send-for-approval"></div>
                              {'Send For Approval'}
                            </button>
                            :
                            <button
                              type="submit"
                              className="user-btn mr5 save-btn"
                              disabled={isViewFlag || setDisable}
                            >
                              <div className={"save-icon"}></div>
                              {isEditFlag ? "Update" : "Save"}

                            </button>
                          }


                        </div>
                      </Row>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {
            isRMDrawerOpen && (
              <AddSpecification
                isOpen={isRMDrawerOpen}
                closeDrawer={this.closeRMDrawer}
                isEditFlag={false}
                ID={""}
                anchor={"right"}
                AddAccessibilityRMANDGRADE={this.props.AddAccessibilityRMANDGRADE}
                EditAccessibilityRMANDGRADE={this.props.EditAccessibilityRMANDGRADE}
                RawMaterial={""}
                RMGrade={""}
                isRMDomesticSpec={true}
                Technology={this.state.Technology.value}
              />
            )
          }

          {
            isOpenGrade && (
              <AddGrade
                isOpen={isOpenGrade}
                closeDrawer={this.closeGradeDrawer}
                isEditFlag={false}
                RawMaterial={this.state.RawMaterial}
                anchor={"right"}
              />
            )
          }

          {
            isOpenSpecification && (
              <AddSpecification
                isOpen={isOpenSpecification}
                closeDrawer={this.closeSpecDrawer}
                isEditFlag={false}
                ID={""}
                anchor={"right"}
                AddAccessibilityRMANDGRADE={this.props.AddAccessibilityRMANDGRADE}
                EditAccessibilityRMANDGRADE={
                  this.props.EditAccessibilityRMANDGRADE
                }
                RawMaterial={this.state.RawMaterial}
                RMGrade={this.state.RMGrade}
                isRMDomesticSpec={true}
              />
            )
          }

          {
            isOpenCategory && (
              <AddCategory
                isOpen={isOpenCategory}
                closeDrawer={this.closeCategoryDrawer}
                isEditFlag={false}
                ID={""}
                anchor={"right"}
              />
            )
          }

          {
            isOpenVendor && (
              <AddVendorDrawer
                isOpen={isOpenVendor}
                isRM={true}
                IsVendor={this.state.IsVendor}
                closeDrawer={this.closeVendorDrawer}
                isEditFlag={false}
                ID={""}
                anchor={"right"}
              />
            )
          }

          {
            isOpenUOM && (
              <AddUOM
                isOpen={isOpenUOM}
                closeDrawer={this.closeUOMDrawer}
                isEditFlag={false}
                ID={""}
                anchor={"right"}
              />
            )
          }
          {
            this.state.approveDrawer && (
              <MasterSendForApproval
                isOpen={this.state.approveDrawer}
                closeDrawer={this.closeApprovalDrawer}
                isEditFlag={false}
                masterId={RM_MASTER_ID}
                type={'Sender'}
                anchor={"right"}
                UOM={this.state.UOM}
                approvalObj={this.state.approvalObj}
                isBulkUpload={false}
                IsImportEntery={false}
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
  const { comman, material, auth, costing, client } = state
  const fieldsObj = selector(state, 'BasicRate', 'FrieghtCharge', 'ShearingCost', 'ScrapRate')

  const { rowMaterialList, rmGradeList, rmSpecification, plantList, supplierSelectList, filterPlantList, filterCityListBySupplier,
    cityList, technologyList, costingHead, categoryList, filterPlantListByCity, filterPlantListByCityAndSupplier, UOMSelectList,
    plantSelectList } = comman
  const { costingSpecifiTechnology } = costing
  const { clientSelectList } = client;
  const { initialConfiguration } = auth;

  const { rawMaterialDetails, rawMaterialDetailsData, rawMaterialNameSelectList, gradeSelectList, vendorListByVendorType } = material


  let initialValues = {}
  if (rawMaterialDetails && rawMaterialDetails !== undefined) {
    initialValues = {
      Source: rawMaterialDetails.Source,
      cutOffPrice: rawMaterialDetails.cutOffPrice,
      BasicRate: rawMaterialDetails.BasicRatePerUOM,
      ScrapRate: rawMaterialDetails.ScrapRate,
      NetLandedCost: rawMaterialDetails.NetLandedCost,
      Remark: rawMaterialDetails.Remark,
    }
  }

  return {
    rowMaterialList, rmGradeList, rmSpecification, plantList, supplierSelectList, cityList,
    technologyList, categoryList, rawMaterialDetails, filterPlantListByCity,
    filterCityListBySupplier, rawMaterialDetailsData, initialValues, fieldsObj,
    filterPlantListByCityAndSupplier, rawMaterialNameSelectList, gradeSelectList,
    filterPlantList, UOMSelectList, vendorListByVendorType, plantSelectList,
    initialConfiguration, costingSpecifiTechnology, costingHead, clientSelectList
  }
}

/**
 * @method connect
 * @description connect with redux
 * @param {function} mapStateToProps
 * @param {function} mapDispatchToProps
 */
export default connect(mapStateToProps, {
  createRMDomestic,
  getRawMaterialCategory,
  getCostingSpecificTechnology,
  fetchSupplierCityDataAPI,
  fetchGradeDataAPI,
  fetchPlantDataAPI,
  fetchSpecificationDataAPI,
  getRawMaterialDetailsAPI,
  getCityBySupplier,
  getPlantByCity,
  getPlantByCityAndSupplier,
  updateRMDomesticAPI,
  fetchRMGradeAPI,
  getRawMaterialNameChild,
  getRMGradeSelectListByRawMaterial,
  getSupplierList,
  getPlantBySupplier,
  getUOMSelectList,
  getVendorListByVendorType,
  fileUploadRMDomestic,
  fileUpdateRMDomestic,
  fileDeleteRMDomestic,
  getPlantSelectListByType,
  getVendorWithVendorCodeSelectList,
  checkAndGetRawMaterialCode,
  getCityByCountry,
  getAllCity,
  masterFinalLevelUser,
  getClientSelectList
})(
  reduxForm({
    form: 'AddRMDomestic',
    enableReinitialize: true,
    touchOnChange: true,
    onSubmitFail: (errors) => {
      focusOnError(errors)
    },
  })(AddRMDomestic),
)
