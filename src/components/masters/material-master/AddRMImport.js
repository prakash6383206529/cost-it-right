import React, { Component, } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { required, getVendorCode, positiveAndDecimalNumber, acceptAllExceptSingleSpecialCharacter, maxLength512, checkForNull } from "../../../helper/validation";
import { renderText, searchableSelect, renderMultiSelectField, renderTextAreaField } from "../../layout/FormInputs";
import {
  getRawMaterialCategory, fetchGradeDataAPI, fetchSpecificationDataAPI, getCityBySupplier, getPlantByCity,
  getPlantByCityAndSupplier, fetchRMGradeAPI, getSupplierList, getPlantBySupplier, getUOMSelectList,
  getCurrencySelectList, fetchSupplierCityDataAPI, fetchPlantDataAPI, getTechnologySelectList, getPlantSelectListByType
} from '../../../actions/Common';
import {
  createRMImport, getRMImportDataById, updateRMImportAPI, getRawMaterialNameChild,
  getRMGradeSelectListByRawMaterial, getVendorListByVendorType, fileUploadRMDomestic,
} from '../actions/Material';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import { loggedInUserId, checkVendorPlantConfigurable } from "../../../helper/auth";
import Switch from "react-switch";
import AddSpecification from './AddSpecification';
import AddGrade from './AddGrade';
import AddCategory from './AddCategory';
import AddUOM from '../uom-master/AddUOM';
import AddVendorDrawer from '../supplier-master/AddVendorDrawer';
import 'react-dropzone-uploader/dist/styles.css'
import Dropzone from 'react-dropzone-uploader';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FILE_URL, INR, ZBC } from '../../../config/constants';
import { AcceptableRMUOM } from '../../../config/masterData'
import $ from 'jquery';
import { getExchangeRateByCurrency } from "../../costing/actions/Costing"
import { getVendorWithVendorCodeSelectList, } from '../actions/Supplier';
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
      showCurrency: false

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
      this.setState({ sourceLocation: newValue, });
    } else {
      this.setState({ sourceLocation: [], })
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
  * @method handleCurrency
  * @description called
  */
  handleCurrency = (newValue) => {
    if (newValue && newValue !== '') {
      this.setState({ currency: newValue, })
      const { fieldsObj } = this.props
      if (newValue.label === INR) {

        this.setState({ currencyValue: 1, showCurrency: false }, () => {

          this.props.change('NetLandedCost', checkForNull(fieldsObj.BasicRate * this.state.currencyValue))
        })
      } else {
        this.props.getExchangeRateByCurrency(newValue.label, res => {
          this.props.change('NetLandedCost', checkForNull(fieldsObj.BasicRate))
          this.props.change('NetLandedCostCurrency', checkForNull(fieldsObj.BasicRate * res.data.Data.CurrencyExchangeRate))
          this.setState({ currencyValue: checkForNull(res.data.Data.CurrencyExchangeRate), showCurrency: true })
        })
      }
    } else {
      this.setState({ currency: [] })
    }
  };

  /**
  * @method handleBasicRate
  * @description Set value in NetLandedCost
  */
  handleBasicRate = (e) => {
    const { currencyValue } = this.state
    // if (this.state.currency.label === INR) {
    this.props.change('NetLandedCost', (checkForNull(e.target.value)))
    // } else {
    this.props.change('NetLandedCostCurrency', (checkForNull(e.target.value * currencyValue)))
    // }
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

          this.props.getVendorListByVendorType(Data.IsVendor, () => { })
          this.props.getRMGradeSelectListByRawMaterial(Data.RawMaterial, res => { })
          this.props.fetchSpecificationDataAPI(Data.RMGrade, res => { });
          this.props.getPlantBySupplier(Data.Vendor, () => { })
          //this.props.getCityBySupplier(Data.Vendor, () => { })

          setTimeout(() => {
            const { gradeSelectList, rmSpecification, cityList, categoryList,
              rawMaterialNameSelectList, UOMSelectList, vendorListByVendorType, currencySelectList, technologySelectList } = this.props;

            const materialNameObj = rawMaterialNameSelectList && rawMaterialNameSelectList.find(item => item.Value === Data.RawMaterial)
            const gradeObj = gradeSelectList && gradeSelectList.find(item => item.Value === Data.RMGrade)
            const specObj = rmSpecification && rmSpecification.find(item => item.Value === Data.RMSpec)
            const categoryObj = categoryList && categoryList.find(item => item.Value === Data.Category)
            const technologyObj = technologySelectList && technologySelectList.find((item) => item.Value === Data.Technology) //NEED TO UNCOMMENT AFTER KEY ADDED IN BACKEND
            const currencyObj = currencySelectList && currencySelectList.find(item => item.Text === Data.Currency)


            this.handleCurrency({ label: currencyObj.Text, value: currencyObj.Value })

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
            const sourceLocationObj = cityList && cityList.find(item => item.Value === Data.SourceLocation)
            const UOMObj = UOMSelectList && UOMSelectList.find(item => item.Value === Data.UOM)

            this.setState({
              isEditFlag: true,
              isLoader: false,
              isShowForm: true,
              IsVendor: Data.IsVendor,
              RawMaterial: materialNameObj !== undefined ? { label: materialNameObj.Text, value: materialNameObj.Value } : [],
              RMGrade: gradeObj !== undefined ? { label: gradeObj.Text, value: gradeObj.Value } : [],
              RMSpec: specObj !== undefined ? { label: specObj.Text, value: specObj.Value } : [],
              Category: categoryObj !== undefined ? { label: categoryObj.Text, value: categoryObj.Value } : [],
              TechnologyId: technologyObj !== undefined ? technologyObj.Value : '', //NNED TO UNCOMMENT AFTER KEY ADDED IN BACKEND
              selectedPlants: plantArray,
              vendorName: vendorObj !== undefined ? { label: vendorObj.Text, value: vendorObj.Value } : [],
              selectedVendorPlants: vendorPlantArray,
              HasDifferentSource: Data.HasDifferentSource,
              sourceLocation: sourceLocationObj !== undefined ? { label: sourceLocationObj.Text, value: sourceLocationObj.Value } : [],
              UOM: UOMObj !== undefined ? { label: UOMObj.Text, value: UOMObj.Value } : [],
              effectiveDate: Data.EffectiveDate ? new Date(Data.EffectiveDate) : new Date(),
              currency: currencyObj !== undefined ? { label: currencyObj.Text, value: currencyObj.Value } : [],
              remarks: Data.Remark,
              files: Data.FileList,
            })
          }, 500)
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
      this.props.getVendorListByVendorType(IsVendor, () => { })
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
      effectiveDate, remarks, RawMaterialID, isEditFlag, files, Technology } = this.state;

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
        NetLandedCost: values.NetLandedCost,
        LoggedInUserId: loggedInUserId(),
        EffectiveDate: effectiveDate,
        Attachements: updatedFiles,
      }
      this.props.updateRMImportAPI(requestData, (res) => {
        if (res.data.Result) {
          toastr.success(MESSAGES.RAW_MATERIAL_DETAILS_UPDATE_SUCCESS);
          this.clearForm();
        }
      })

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
        NetLandedCost: values.NetLandedCost,
        Remark: remarks,
        LoggedInUserId: loggedInUserId(),
        Plant: IsVendor === false ? plantArray : [],
        VendorPlant: checkVendorPlantConfigurable() ? (IsVendor ? vendorPlantArray : []) : [],
        VendorCode: VendorCode,
        Attachements: files,
        Currency: currency.label,
        EffectiveDate: effectiveDate,
      }

      this.props.createRMImport(formData, (res) => {
        if (res.data.Result) {
          toastr.success(MESSAGES.MATERIAL_ADD_SUCCESS);
          this.clearForm();
        }
      });
    }
  }

  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { handleSubmit, } = this.props;
    const { isRMDrawerOpen, isOpenGrade, isOpenSpecification,
      isOpenCategory, isOpenVendor, isOpenUOM, isEditFlag, } = this.state;

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
                          {!this.state.IsVendor && (
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
                                  this.state.selectedPlants == null || this.state.selectedPlants.length === 0 ? [required] : []} optionValue={(option) => option.Value}
                                optionLabel={(option) => option.Text}
                                component={renderMultiSelectField}
                                mendatory={true}
                                required={true}
                                className="multiselect-with-border"
                                disabled={this.state.IsVendor || isEditFlag ? true : false} />
                            </Col>
                          )}
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
                          {checkVendorPlantConfigurable() &&
                            this.state.IsVendor && (
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
                                    validate={acceptAllExceptSingleSpecialCharacter}
                                    component={renderText}
                                    //required={true}
                                    disabled={false}
                                    maxLength="70"
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
                            <Field
                              label={`Basic Rate/${this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label} (${this.state.currency.label === undefined ? 'Currency' : this.state.currency.label})`}
                              name={"BasicRate"}
                              type="text"
                              placeholder={"Enter"}
                              validate={[required, positiveAndDecimalNumber]}
                              component={renderText}
                              onChange={this.handleBasicRate}
                              required={true}
                              disabled={false}
                              maxLength="15"
                              className=" "
                              customClassName=" withBorder"
                            />
                          </Col>
                          <Col md="4">
                            <Field
                              label={`Scrap Rate (${this.state.currency.label === undefined ? 'Currency' : this.state.currency.label})`}
                              name={"ScrapRate"}
                              type="text"
                              placeholder={"Enter"}
                              validate={[required, positiveAndDecimalNumber]}
                              component={renderText}
                              required={true}
                              className=""
                              maxLength="15"
                              customClassName=" withBorder"
                            />
                          </Col>
                          <Col md="4">
                            <Field
                              label={`Net Landed Cost (${this.state.currency.label === undefined ? 'Currency' : this.state.currency.label}/${this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label})`}
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
                                label={`Net Landed Cost (INR/${this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label})`}
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

                          <Col md="4">
                            <div className="form-group">
                              <label>
                                Effective Date
                                    <span className="asterisk-required">*</span>
                              </label>
                              <div className="inputbox date-section">
                                <DatePicker
                                  name="EffectiveDate"
                                  selected={this.state.effectiveDate}
                                  onChange={this.handleEffectiveDateChange}
                                  showMonthDropdown
                                  showYearDropdown
                                  dateFormat="dd/MM/yyyy"
                                  minDate={new Date()}
                                  dropdownMode="select"
                                  placeholderText="Select date"
                                  className="withBorder form-control"
                                  autoComplete={"off"}
                                  disabledKeyboardNavigation
                                  onChangeRaw={(e) => e.preventDefault()}
                                  disabled={false}
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
                              rows="10"
                            />
                          </Col>
                          <Col md="4">
                            <label>
                              Upload Files (upload up to 3 files)
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
                                accept="image/jpeg,image/jpg,image/png,image/PNG,.xls,.doc,.pdf"
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
                            className="reset mr15 cancel-btn"
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
                            className="submit-button mr5 save-btn"
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
  const { comman, material, } = state;
  const fieldsObj = selector(state, 'BasicRate', 'NetLandedCost');

  const { uniOfMeasurementList, rowMaterialList, rmGradeList, rmSpecification, plantList,
    supplierSelectList, filterPlantList, filterCityListBySupplier, cityList, technologyList,
    categoryList, filterPlantListByCity, filterPlantListByCityAndSupplier, UOMSelectList,
    currencySelectList, technologySelectList, plantSelectList } = comman;

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
    filterPlantList, UOMSelectList, vendorListByVendorType, currencySelectList, technologySelectList, plantSelectList
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
