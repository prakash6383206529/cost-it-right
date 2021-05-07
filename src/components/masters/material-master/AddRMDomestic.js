import React, { Component, } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector, isValid, isInvalid } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { required, getVendorCode, positiveAndDecimalNumber, maxLength15, acceptAllExceptSingleSpecialCharacter, maxLength70, maxLength512, checkForDecimalAndNull, checkForNull, decimalLengthFour, decimalLength6, decimalLengthsix } from "../../../helper/validation";
import { renderText, searchableSelect, renderMultiSelectField, renderTextAreaField, focusOnError, renderDatePicker, } from '../../layout/FormInputs'
import { AcceptableRMUOM } from '../../../config/masterData'
import {
  getTechnologySelectList, getRawMaterialCategory, fetchGradeDataAPI, fetchSpecificationDataAPI, getCityBySupplier, getPlantByCity,
  getPlantByCityAndSupplier, fetchRMGradeAPI, getSupplierList, getPlantBySupplier, getUOMSelectList, fetchSupplierCityDataAPI,
  fetchPlantDataAPI, getPlantSelectListByType
} from '../../../actions/Common'
import {
  createRMDomestic, getRawMaterialDetailsAPI, updateRMDomesticAPI, getRawMaterialNameChild, getRMGradeSelectListByRawMaterial,
  getVendorListByVendorType, fileUploadRMDomestic, fileUpdateRMDomestic, fileDeleteRMDomestic, getVendorWithVendorCodeSelectList
} from '../actions/Material'
import { toastr } from 'react-redux-toastr'
import { MESSAGES } from '../../../config/message'
import { loggedInUserId, getConfigurationKey, } from '../../../helper/auth'
import Switch from 'react-switch'
import AddSpecification from './AddSpecification'
import AddGrade from './AddGrade'
import AddCategory from './AddCategory'
import AddUOM from '../uom-master/AddUOM'
import AddVendorDrawer from '../supplier-master/AddVendorDrawer'
import Dropzone from 'react-dropzone-uploader'
import 'react-dropzone-uploader/dist/styles.css'
import $ from 'jquery'
import 'react-datepicker/dist/react-datepicker.css'
import { FILE_URL, ZBC } from '../../../config/constants'
import moment from 'moment';
import TooltipCustom from '../../common/Tooltip';
// import { getVendorWithVendorCodeSelectList } from '../actions/Supplier';
const selector = formValueSelector('AddRMDomestic')

class AddRMDomestic extends Component {
  constructor(props) {
    super(props)
    this.child = React.createRef()
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

      netLandedCost: '',
      freightCost: '',
      singlePlantSelected: []
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
    this.props.getRMGradeSelectListByRawMaterial('', (res) => { })
  }

  /**
   * @method componentDidMount
   * @description Called after rendering the component
   */
  componentDidMount() {
    const { data } = this.props
    this.getDetails(data)
    //this.props.change('NetLandedCost', 0)
    this.props.getRawMaterialCategory((res) => { })
    this.props.fetchSupplierCityDataAPI((res) => { })
    this.props.getVendorListByVendorType(false, () => { })
    this.props.getTechnologySelectList(() => { })
    this.props.fetchSpecificationDataAPI(0, () => { })
    this.props.getPlantSelectListByType(ZBC, () => { })
    console.log(getConfigurationKey().IsDestinationPlantConfigure, "CONFIGURE KEY");
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
    this.props.fetchCategoryAPI(e.target.value, (res) => { })
  }

  /**
   * @method handleSourceSupplierPlant
   * @description Used handle vendor plants
   */
  handleSourceSupplierPlant = (e) => {
    this.setState({ selectedPlants: e })
  }

  /**
   * @method handleVendorName
   * @description called
   */
  handleVendorName = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState(
        { vendorName: newValue, selectedVendorPlants: [], vendorLocation: [] },
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
        selectedVendorPlants: [],
        vendorLocation: [],
      })
      this.props.getPlantBySupplier('', () => { })
    }
  }

  /**
   * @method handleVendorPlant
   * @description called
   */
  handleVendorPlant = (e) => {
    this.setState({ selectedVendorPlants: e })
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
      this.setState({ sourceLocation: newValue })
    } else {
      this.setState({ sourceLocation: [] })
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
  /**
   * @method calculateNetCost
   * @description CALCUALTION NET COST
  */

  calculateNetCost = () => {
    const { initialConfiguration } = this.props
    const { fieldsObj } = this.props
    const netCost = checkForNull(Number(fieldsObj.BasicRate ? fieldsObj.BasicRate : 0) + Number(fieldsObj.FrieghtCharge ? fieldsObj.FrieghtCharge : 0) + Number(fieldsObj.ShearingCost ? fieldsObj.ShearingCost : 0))
    this.props.change('NetLandedCost', checkForDecimalAndNull(netCost, initialConfiguration.NoOfDecimalForPrice))
    this.setState({ netLandedCost: netCost })
  }

  /**
   * @method handleChange
   * @description Handle Effective Date
   */
  handleEffectiveDateChange = (date) => {
    this.setState({
      effectiveDate: date,
    })
  }

  /**
   * @method handleMessageChange
   * @description used remarks handler
   */
  handleMessageChange = (e) => {
    this.setState({
      remarks: e.target.value,
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
      $('html, body').animate({ scrollTop: 0 }, 'slow')
      this.props.getRawMaterialDetailsAPI(data, true, (res) => {
        if (res && res.data && res.data.Result) {
          const Data = res.data.Data
          if (Data.IsVendor) {
            this.props.getVendorWithVendorCodeSelectList(() => { })
          } else {
            this.props.getVendorListByVendorType(Data.IsVendor, () => { })
          }
          this.props.getVendorListByVendorType(Data.IsVendor, () => { })
          this.props.getRMGradeSelectListByRawMaterial(Data.RawMaterial, (res) => { },)
          this.props.fetchSpecificationDataAPI(Data.RMGrade, (res) => { })
          this.props.getPlantBySupplier(Data.Vendor, () => { })
          this.props.change('FrieghtCharge', Data.RMFreightCost ? Data.RMFreightCost : '')
          this.props.change('ShearingCost', Data.RMShearingCost ? Data.RMShearingCost : '')

          setTimeout(() => {
            const { gradeSelectList, rmSpecification, cityList, categoryList, rawMaterialNameSelectList, UOMSelectList, vendorListByVendorType, technologySelectList, plantSelectList } = this.props

            const materialNameObj = rawMaterialNameSelectList && rawMaterialNameSelectList.find((item) => item.Value === Data.RawMaterial,)
            const gradeObj = gradeSelectList && gradeSelectList.find((item) => item.Value === Data.RMGrade)
            const specObj = rmSpecification && rmSpecification.find((item) => item.Value === Data.RMSpec)
            const categoryObj = categoryList && categoryList.find((item) => Number(item.Value) === Data.Category)
            const destinationPlantObj = plantSelectList && plantSelectList.find((item) => item.Value === Data.DestinationPlantId)
            console.log('destinationPlantObj: ', destinationPlantObj);
            const technologyObj = technologySelectList && technologySelectList.find((item) => Number(item.Value) === Data.TechnologyId)


            let plantArray = []
            Data && Data.Plant.map((item) => {
              plantArray.push({ Text: item.PlantName, Value: item.PlantId })
              return plantArray
            })

            const vendorObj = vendorListByVendorType && vendorListByVendorType.find((item) => item.Value === Data.Vendor)

            let vendorPlantArray = []
            Data && Data.VendorPlant.map((item) => {
              vendorPlantArray.push({ Text: item.PlantName, Value: item.PlantId, })
              return vendorPlantArray
            })

            const sourceLocationObj = cityList && cityList.find((item) => Number(item.Value) === Data.SourceLocation)
            const UOMObj = UOMSelectList && UOMSelectList.find((item) => item.Value === Data.UOM)
            this.props.change('EffectiveDate', moment(Data.EffectiveDate)._isValid ? moment(Data.EffectiveDate)._d : '')
            this.setState({
              isEditFlag: true,
              isLoader: false,
              isShowForm: true,
              IsVendor: Data.IsVendor,
              RawMaterial: { label: materialNameObj.Text, value: materialNameObj.Value, },
              RMGrade: gradeObj !== undefined ? { label: gradeObj.Text, value: gradeObj.Value } : [],
              RMSpec: specObj !== undefined ? { label: specObj.Text, value: specObj.Value } : [],
              Category: categoryObj !== undefined ? { label: categoryObj.Text, value: categoryObj.Value } : [],
              selectedPlants: plantArray,
              Technology: technologyObj !== undefined ? { label: technologyObj.Text, value: technologyObj.Value } : [],
              vendorName: vendorObj !== undefined ? { label: vendorObj.Text, value: vendorObj.Value } : [],
              selectedVendorPlants: vendorPlantArray,
              HasDifferentSource: Data.HasDifferentSource,
              sourceLocation: sourceLocationObj !== undefined ? { label: sourceLocationObj.Text, value: sourceLocationObj.Value, } : [],
              UOM: UOMObj !== undefined ? { label: UOMObj.Text, value: UOMObj.Value } : [],
              effectiveDate: moment(Data.EffectiveDate)._isValid ? moment(Data.EffectiveDate)._d : '',
              remarks: Data.Remark,
              files: Data.FileList,
              singlePlantSelected: destinationPlantObj !== undefined ? { label: destinationPlantObj.Text, value: destinationPlantObj.Value } : []
            })
          }, 1000)
        }
      })
    } else {
      this.setState({
        isEditFlag: false,
        isLoader: false,
        RawMaterialID: '',
      })
      this.props.getRawMaterialDetailsAPI('', false, (res) => { })
    }
  }

  /**
   * @method onPressVendor
   * @description Used for Vendor checked
   */
  onPressVendor = () => {
    this.setState(
      {
        IsVendor: !this.state.IsVendor,
        vendorName: [],
        selectedVendorPlants: [],
        vendorLocation: [],
      },
      () => {
        const { IsVendor } = this.state
        if (IsVendor) {
          this.props.getVendorWithVendorCodeSelectList(() => { })
        } else {
          // this.props.getVendorTypeBOPSelectList(() => { })
          this.props.getVendorListByVendorType(IsVendor, () => { })
          this.props.getPlantBySupplier('', () => { })
          this.props.getCityBySupplier(0, () => { })
        }
      },
    )
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
      const { IsVendor } = this.state
      this.props.getVendorListByVendorType(IsVendor, () => {
        const { vendorListByVendorType } = this.props
        if (Object.keys(formData).length > 0) {
          const vendorObj = vendorListByVendorType && vendorListByVendorType.find((item) => item.Text === `${formData.VendorName} (${formData.VendorCode})`)
          this.setState({ vendorName: vendorObj !== undefined ? { label: vendorObj.Text, value: vendorObj.Value } : [], })
        }
      })
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
    const { gradeSelectList, rmSpecification, plantList, filterPlantList, cityList, categoryList, filterCityListBySupplier, rawMaterialNameSelectList, UOMSelectList, vendorListByVendorType, technologySelectList, plantSelectList } = this.props
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
        temp.push({ label: item.Text, value: item.Value })
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
      technologySelectList &&
        technologySelectList.map((item) => {

          if (item.Value === '0') return false
          temp.push({ label: item.Text, value: item.Value })
          return null
        })
      return temp
    }
    if (label === 'plant') {
      plantSelectList && plantSelectList.map((item) => {
        if (item.Value === '0') return false
        temp.push({ Text: item.Text, Value: item.Value })
        return null
      })
      return temp
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
      vendorListByVendorType && vendorListByVendorType.map((item) => {
        if (item.Value === '0') return false
        temp.push({ label: item.Text, value: item.Value })
        return null
      })
      return temp
    }

    if (label === 'VendorPlant') {
      filterPlantList && filterPlantList.map((item) => {
        if (item.Value === '0') return false
        temp.push({ Text: item.Text, Value: item.Value })
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
        temp.push({ label: item.Text, value: item.Value })
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
  clearForm = () => {
    const { reset } = this.props
    reset()
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
    this.props.getRawMaterialDetailsAPI('', false, (res) => { })
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
    return { url: 'https://httpbin.org/post' }
  }

  // called every time a file's `status` changes
  handleChangeStatus = ({ meta, file }, status) => {
    const { files } = this.state

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
        let Data = res.data[0]
        const { files } = this.state
        files.push(Data)
        this.setState({ files: files })
      })
    }

    if (status === 'rejected_file_type') {
      toastr.warning('Allowed only xls, doc, jpeg, pdf files.')
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
      let deleteData = {
        Id: FileId,
        DeletedBy: loggedInUserId(),
      }
      this.props.fileDeleteRMDomestic(deleteData, (res) => {
        toastr.success('File has been deleted successfully.')
        let tempArr = this.state.files.filter((item) => item.FileId !== FileId)
        this.setState({ files: tempArr })
      })
    }
    if (FileId == null) {
      let tempArr = this.state.files.filter(
        (item) => item.FileName !== OriginalFileName,
      )
      this.setState({ files: tempArr })
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
    const { IsVendor, RawMaterial, RMGrade, RMSpec, Category, Technology, selectedPlants, vendorName,
      VendorCode, selectedVendorPlants, HasDifferentSource, sourceLocation,
      UOM, remarks, RawMaterialID, isEditFlag, files, effectiveDate, netLandedCost, singlePlantSelected } = this.state
    const { initialConfiguration } = this.props
    let plantArray = []
    selectedPlants && selectedPlants.map((item) => {
      plantArray.push({ PlantName: item.Text, PlantId: item.Value, PlantCode: '', })
      return plantArray
    })

    let vendorPlantArray = []
    selectedVendorPlants &&
      selectedVendorPlants.map((item) => {
        vendorPlantArray.push({ PlantName: item.Text, PlantId: item.Value, PlantCode: '', })
        return vendorPlantArray
      })

    if (isEditFlag) {
      let updatedFiles = files.map((file) => {
        return { ...file, ContextId: RawMaterialID }
      })
      let requestData = {
        RawMaterialId: RawMaterialID,
        IsVendor: IsVendor,
        HasDifferentSource: HasDifferentSource,
        Source: !IsVendor && !HasDifferentSource ? '' : values.Source,
        SourceLocation: !IsVendor && !HasDifferentSource ? '' : sourceLocation.value,
        Remark: remarks,
        BasicRatePerUOM: values.BasicRate,
        RMFreightCost: values.FrieghtCharge,
        RMShearingCost: values.ShearingCost,
        ScrapRate: values.ScrapRate,
        NetLandedCost: netLandedCost,
        LoggedInUserId: loggedInUserId(),
        EffectiveDate: moment(effectiveDate).local().format('YYYY-MM-DD HH:mm:ss'),
        Attachements: updatedFiles,
      }
      this.props.reset()
      this.props.updateRMDomesticAPI(requestData, (res) => {
        if (res.data.Result) {
          toastr.success(MESSAGES.RAW_MATERIAL_DETAILS_UPDATE_SUCCESS)
          this.clearForm()
          // this.cancel()
        }
      })
    } else {
      const formData = {
        IsVendor: IsVendor,
        RawMaterial: RawMaterial.value,
        RMGrade: RMGrade.value,
        RMSpec: RMSpec.value,
        Category: Category.value,
        TechnologyId: Technology.value,
        Vendor: vendorName.value,
        HasDifferentSource: HasDifferentSource,
        Source: !IsVendor && !HasDifferentSource ? '' : values.Source,
        SourceLocation: !IsVendor && !HasDifferentSource ? '' : sourceLocation.value,
        UOM: UOM.value,
        BasicRatePerUOM: values.BasicRate,
        RMFreightCost: values.FrieghtCharge,
        RMShearingCost: values.ShearingCost,
        ScrapRate: values.ScrapRate,
        NetLandedCost: values.NetLandedCost,
        EffectiveDate: moment(effectiveDate).local().format('YYYY-MM-DD HH:mm:ss'),
        Remark: remarks,
        LoggedInUserId: loggedInUserId(),
        Plant: IsVendor === false ? plantArray : [],
        VendorPlant: initialConfiguration.IsVendorPlantConfigurable ? (IsVendor ? vendorPlantArray : []) : [],
        VendorCode: VendorCode,
        Attachements: files,
        DestinationPlantId: IsVendor ? singlePlantSelected.value : '00000000-0000-0000-0000-000000000000'
      }
      this.props.reset()
      this.props.createRMDomestic(formData, (res) => {
        if (res.data.Result) {
          toastr.success(MESSAGES.MATERIAL_ADD_SUCCESS)
          this.clearForm()
          // this.cancel()
        }
      })

    }
  }


  handleSinglePlant = (newValue) => {
    this.setState({ singlePlantSelected: newValue })
  }

  /**
   * @method render
   * @description Renders the component
   */
  render() {
    const { handleSubmit, initialConfiguration } = this.props
    const { isRMDrawerOpen, isOpenGrade, isOpenSpecification, isOpenCategory, isOpenVendor, isOpenUOM, isEditFlag, isVisible, } = this.state
    console.log(!this.state.IsVendor || getConfigurationKey().IsDestinationPlantConfigure, "SSSSSSSSSSSSSSSSSSSSSS")

    return (
      <>
        <div className="container-fluid">
          <div>
            <div className="login-container signup-form">
              <div className="row">
                <div className="col-md-12">
                  <div className="shadow-lgg login-formg">
                    <div className="row">
                      <div className="col-md-6">
                        <h1>
                          {isEditFlag
                            ? `Update Raw Material (Domestic)`
                            : `Add Raw Material (Domestic)`}
                        </h1>
                      </div>
                    </div>
                    <form
                      noValidate
                      className="form"
                      onSubmit={handleSubmit(this.onSubmit.bind(this))}
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
                              <div className={"right-title"}>Vendor Based</div>
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
                                  validate={
                                    this.state.RawMaterial == null || this.state.RawMaterial.length === 0 ? [required] : []}
                                  required={true}
                                  handleChangeDescription={this.handleRMChange}
                                  valueDescription={this.state.RawMaterial}
                                  disabled={isEditFlag ? true : false}
                                  className="fullinput-icon"
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
                                  validate={this.state.RMGrade == null || this.state.RMGrade.length === 0 ? [required] : []}
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
                                  validate={
                                    this.state.RMSpec == null || this.state.RMSpec.length === 0 ? [required] : []}
                                  required={true}
                                  handleChangeDescription={this.handleSpecChange}
                                  valueDescription={this.state.RMSpec}
                                  disabled={isEditFlag ? true : false}
                                />
                              </div>
                              {/* {this.state.RawMaterial == null ||                                this.state.RawMaterial.length === 0 ||                                this.state.RMGrade == null ||                                this.state.RMGrade.length === 0 ? (
                                  <div
                                    className={
                                      "plus-icon-square blurPlus-icon-square right"
                                    }
                                  ></div>
                                ) : (
                                  !isEditFlag && (
                                    <div
                                      onClick={this.specificationToggler}
                                      className={"plus-icon-square  right"}
                                    ></div>
                                  )
                                )} */}
                            </div>
                          </Col>
                          <Col md="4">
                            <TooltipCustom />
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
                              validate={
                                this.state.Technology == null || this.state.Technology.length === 0 ? [required] : []}
                              required={true}
                              handleChangeDescription={
                                this.handleTechnologyChange
                              }
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
                                    className=" before-box p-0"
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
                                  validate={
                                    this.state.vendorName == null || this.state.vendorName.length === 0 ? [required] : []}
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
                          {initialConfiguration.IsVendorPlantConfigurable && this.state.IsVendor && (
                            <Col md="4">
                              <Field
                                label="Vendor Plant"
                                name="DestinationSupplierPlantId"
                                placeholder={"Select"}
                                selection={this.state.selectedVendorPlants == null || this.state.selectedVendorPlants.length === 0 ? [] : this.state.selectedVendorPlants}
                                options={this.renderListing("VendorPlant")}
                                selectionChanged={this.handleVendorPlant}
                                validate={this.state.selectedVendorPlants == null || this.state.selectedVendorPlants.length === 0 ? [required] : []}
                                required={true}
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
                          <Col md="12" className="filter-block ">
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
                              label={`Basic Rate/ ${this.state.UOM.label ? this.state.UOM.label : 'UOM'} (INR)`}
                              name={"BasicRate"}
                              type="text"
                              placeholder={"Enter"}
                              validate={[required, positiveAndDecimalNumber, maxLength15, decimalLengthsix]}
                              component={renderText}
                              // onChange={thishandleBasicRate.}
                              required={true}
                              disabled={false}
                              className=" "
                              customClassName=" withBorder"
                              maxLength={'15'}
                            />
                          </Col>
                          <Col md="4">
                            <Field
                              label={`Scrap Rate (INR)`}
                              name={"ScrapRate"}
                              type="text"
                              placeholder={"Enter"}
                              validate={[required, positiveAndDecimalNumber, maxLength15, decimalLengthsix]}
                              component={renderText}
                              required={true}
                              className=""
                              customClassName=" withBorder"
                              maxLength="15"
                            />
                          </Col>
                          <Col md="4">
                            <Field
                              label={`RM Freight Cost(INR)`}
                              name={"FrieghtCharge"}
                              type="text"
                              placeholder={"Enter"}
                              // onChange={this.handleFreightCharges}
                              validate={[positiveAndDecimalNumber, maxLength15, decimalLengthsix]}
                              component={renderText}
                              required={false}
                              className=""
                              customClassName=" withBorder"
                              maxLength="15"
                            />
                          </Col>
                          <Col md="4">
                            <Field
                              label={`Shearing Cost (INR)`}
                              name={"ShearingCost"}
                              type="text"
                              placeholder={"Enter"}
                              // onChange={this.handleFreightCharges}
                              validate={[positiveAndDecimalNumber, maxLength15, decimalLengthsix]}
                              component={renderText}
                              required={false}
                              className=""
                              customClassName=" withBorder"
                              maxLength="15"
                            />
                          </Col>
                          <Col md="4">
                            <Field
                              label={`Net Cost (INR/${this.state.UOM.label ? this.state.UOM.label : 'UOM'} )`}
                              name={"NetLandedCost"}
                              type="text"
                              placeholder={""}
                              validate={[required]}
                              component={renderText}
                              required={false}
                              disabled={true}
                              className=" "
                              customClassName=" withBorder"
                            />
                          </Col>
                          <Col md="4">
                            <div className="form-group">
                              {/* <label>
                                Effective Date
                                <span className="asterisk-required">*</span>
                              </label> */}
                              <div className="inputbox date-section mb-3">
                                {/* <DatePicker
                                  name="EffectiveDate"
                                  selected={this.state.effectiveDate}
                                  onChange={this.handleEffectiveDateChange}
                                  showMonthDropdown
                                  showYearDropdown
                                  dateFormat="dd/MM/yyyy"
                                  //minDate={new Date()}
                                  dropdownMode="select"
                                  placeholderText="Select date"
                                  className="withBorder"
                                  autoComplete={"off"}
                                  disabledKeyboardNavigation
                                  onChangeRaw={(e) => e.preventDefault()}
                                  disabled={false}
                                /> */}
                                <Field
                                  label="Effective Date"
                                  name="EffectiveDate"
                                  selected={this.state.effectiveDate}
                                  onChange={this.handleEffectiveDateChange}
                                  type="text"
                                  validate={[required]}
                                  autoComplete={'off'}
                                  required={true}
                                  changeHandler={(e) => {
                                    //e.preventDefault()
                                  }}
                                  component={renderDatePicker}
                                  className="form-control"
                                  disabled={isEditFlag ? true : false}
                                //minDate={moment()}
                                />
                              </div>
                            </div>
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
                              placeholder="Type here..."
                              value={this.state.remarks}
                              className=""
                              customClassName=" textAreaWithBorder"
                              onChange={this.handleMessageChange}
                              validate={[maxLength512]}
                              //required={true}
                              component={renderTextAreaField}
                              maxLength="512"
                              rows="6"
                            />
                          </Col>
                          <Col md="3">
                            <label>Upload Files (upload up to 3 files)</label>
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
                                          this.deleteFile(f.FileId, f.FileName)
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
              AddAccessibilityRMANDGRADE={this.props.AddAccessibilityRMANDGRADE}
              EditAccessibilityRMANDGRADE={this.props.EditAccessibilityRMANDGRADE}
              RawMaterial={""}
              RMGrade={""}
              isRMDomesticSpec={true}
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
              AddAccessibilityRMANDGRADE={this.props.AddAccessibilityRMANDGRADE}
              EditAccessibilityRMANDGRADE={
                this.props.EditAccessibilityRMANDGRADE
              }
              RawMaterial={this.state.RawMaterial}
              RMGrade={this.state.RMGrade}
              isRMDomesticSpec={true}
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
              isRM={true}
              closeDrawer={this.closeVendorDrawer}
              isEditFlag={false}
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

          {/* {isVisible && (
            <ImageModel
              onOk={this.onOk}
              onCancel={this.onCancel}
              modalVisible={isVisible}
              imageURL={this.state.imageURL}
            //modelData={}
            />
          )} */}
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
  const { comman, material, auth } = state
  const fieldsObj = selector(state, 'BasicRate', 'FrieghtCharge', 'ShearingCost')

  const { rowMaterialList, rmGradeList, rmSpecification, plantList, supplierSelectList, filterPlantList, filterCityListBySupplier,
    cityList, technologyList, categoryList, filterPlantListByCity, filterPlantListByCityAndSupplier, UOMSelectList, technologySelectList,
    plantSelectList } = comman

  const { initialConfiguration } = auth;

  const { rawMaterialDetails, rawMaterialDetailsData, rawMaterialNameSelectList, gradeSelectList, vendorListByVendorType, } = material

  let initialValues = {}
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
    rowMaterialList, rmGradeList, rmSpecification, plantList, supplierSelectList, cityList,
    technologyList, categoryList, rawMaterialDetails, filterPlantListByCity,
    filterCityListBySupplier, rawMaterialDetailsData, initialValues, fieldsObj,
    filterPlantListByCityAndSupplier, rawMaterialNameSelectList, gradeSelectList,
    filterPlantList, UOMSelectList, vendorListByVendorType, technologySelectList, plantSelectList,
    initialConfiguration
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
  getTechnologySelectList,
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
  getVendorWithVendorCodeSelectList
})(
  reduxForm({
    form: 'AddRMDomestic',
    enableReinitialize: true,
    onSubmitFail: (errors) => {
      focusOnError(errors)
    },
  })(AddRMDomestic),
)
