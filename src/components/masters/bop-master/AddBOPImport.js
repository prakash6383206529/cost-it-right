import React, { Component, } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Row, Col, } from 'reactstrap';
import {
  required, checkForNull, checkForDecimalAndNull, acceptAllExceptSingleSpecialCharacter, maxLength20,
  maxLength10, positiveAndDecimalNumber, maxLength512, maxLength, decimalLengthsix, checkWhiteSpaces, checkSpacesInString, maxLength80
} from "../../../helper/validation";
import { renderText, searchableSelect, renderTextAreaField, renderDatePicker, renderNumberInputField, focusOnError } from "../../layout/FormInputs";
import { getPlantBySupplier, getUOMSelectList, getCurrencySelectList, getPlantSelectListByType, getCityByCountry, getAllCity } from '../../../actions/Common';
import {
  createBOPImport, updateBOPImport, getBOPCategorySelectList, getBOPImportById,
  fileUploadBOPDomestic, fileDeleteBOPDomestic,
} from '../actions/BoughtOutParts';
import { getVendorWithVendorCodeSelectList, getVendorTypeBOPSelectList, } from '../actions/Supplier';
import { masterFinalLevelUser } from '../actions/Material'
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { getConfigurationKey, loggedInUserId, userDetails } from "../../../helper/auth";
import Switch from "react-switch";
import "react-datepicker/dist/react-datepicker.css";
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css';
import { FILE_URL, ZBC, INR, BOP_MASTER_ID, EMPTY_GUID } from '../../../config/constants';
import AddBOPCategory from './AddBOPCategory';
import AddVendorDrawer from '../supplier-master/AddVendorDrawer';
import AddUOM from '../uom-master/AddUOM';
import DayTime from '../../common/DayTimeWrapper'
import { AcceptableBOPUOM } from '../../../config/masterData'
import { getExchangeRateByCurrency } from "../../costing/actions/Costing"
import LoaderCustom from '../../common/LoaderCustom';
import WarningMessage from '../../common/WarningMessage'
import { CheckApprovalApplicableMaster } from '../../../helper';  // WILL BE USED LATER WHEN BOP APPROVAL IS DONE
import imgRedcross from '../../../assests/images/red-cross.png';
import MasterSendForApproval from '../MasterSendForApproval'
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { debounce } from 'lodash';
import AsyncSelect from 'react-select/async';


const selector = formValueSelector('AddBOPImport');

class AddBOPImport extends Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    // ********* INITIALIZE REF FOR DROPZONE ********
    this.dropzone = React.createRef();
    this.state = {
      isEditFlag: false,
      IsVendor: false,
      isViewMode: this.props?.data?.isViewMode ? true : false,

      BOPCategory: [],
      isCategoryDrawerOpen: false,

      selectedPartAssembly: [],
      selectedPlants: [],

      isOpenVendor: false,
      isVendorNameNotSelected: false,
      IsSendForApproval: false,
      vendorName: [],
      approvalObj: {},
      minEffectiveDate: '',
      sourceLocation: [],
      isFinalApprovar: false,
      approveDrawer: false,
      IsFinancialDataChanged: true,
      oldDate: '',

      UOM: {},
      isOpenUOM: false,
      currency: [],
      isDateChange: false,
      effectiveDate: '',
      files: [],
      dateCount: 0,
      BOPID: EMPTY_GUID,

      netLandedcost: '',
      currencyValue: 1,
      showCurrency: false,
      netLandedConverionCost: '',
      DataToChange: [],
      DropdownChange: true,
      showWarning: false,
      uploadAttachements: true,
      showPopup: false,
      updatedObj: {},
      setDisable: false,
      disablePopup: false,
      inputLoader: false,
      attachmentLoader: false,
      isSourceChange: false,
      source: '',
      remarks: '',
    }
  }

  /**
  * @method componentWillMount
  * @description Called before render the component
  */
  UNSAFE_componentWillMount() {
    if (!(this.props.data.isEditFlag || this.props.data.isViewFlag)) {
      this.props.getUOMSelectList(() => { })
      this.props.getBOPCategorySelectList(() => { })
      this.props.getPlantSelectListByType(ZBC, () => { })
    }
  }

  /**
   * @method componentDidMount
   * @description Called after rendering the component
   */
  componentDidMount() {
    if (!this.state.isViewMode) {
      this.props.getAllCity(cityId => {
        this.props.getCityByCountry(cityId, 0, () => { })
      })
    }
    this.getDetails()
    if (!(this.props.data.isEditFlag || this.props.data.isViewFlag)) {
      this.props.getCurrencySelectList(() => { })
      this.setState({ inputLoader: true })
      this.props.getVendorTypeBOPSelectList(() => { this.setState({ inputLoader: false }) })
    }
    if (!this.state.isViewMode) {
      let obj = {
        MasterId: BOP_MASTER_ID,
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
    if (!this.props.data.isViewFlag) {
      if (this.props.fieldsObj !== prevProps.fieldsObj) {
        this.handleCalculation()
      }
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
      selectedPlants: [],
    }, () => {
      const { IsVendor } = this.state;
      this.setState({ inputLoader: true })
      if (IsVendor) {
        this.props.getVendorWithVendorCodeSelectList(() => { this.setState({ inputLoader: false }) })
      } else {
        this.props.getVendorTypeBOPSelectList(() => { this.setState({ inputLoader: false }) })
      }
    });
  }

  /**
  * @method handleCategoryChange
  * @description  used to handle BOP Category Selection
  */
  handleCategoryChange = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ BOPCategory: newValue });
    } else {
      this.setState({ BOPCategory: [], });
    }
  }

  closeApprovalDrawer = (e = '', type) => {
    this.setState({ approveDrawer: false, setDisable: false })
    if (type === 'submit') {
      //this.clearForm()
      this.cancel()
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
        isEditFlag: false,
        isLoader: true,
        BOPID: data.Id,
      })

      this.props.getBOPImportById(data.Id, res => {
        if (res && res.data && res.data.Result) {

          const Data = res.data.Data;
          this.setState({ DataToChange: Data })

          this.props.change('EffectiveDate', DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '')
          this.setState({ minEffectiveDate: Data.EffectiveDate })

          setTimeout(() => {
            let plantObj;
            this.handleEffectiveDateChange(DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '')

            if (getConfigurationKey().IsDestinationPlantConfigure) {
              plantObj = Data.DestinationPlantName !== undefined ? { label: Data.DestinationPlantName, value: Data.DestinationPlantId } : []
            } else {
              plantObj = Data && Data.Plant.length > 0 ? { label: Data.Plant[0].PlantName, value: Data.Plant[0].PlantId } : []
            }
            this.props.getExchangeRateByCurrency(Data.Currency, DayTime(Data.EffectiveDate).format('YYYY-MM-DD'), res => {
              if (Object.keys(res.data.Data).length === 0) {
                this.setState({ showWarning: true })
              }
              else {
                this.setState({ showWarning: false })
              }
              this.setState({ currencyValue: checkForNull(res.data.Data.CurrencyExchangeRate), showCurrency: true }, () => {
                this.handleCalculation()
              })
            })
            this.setState({
              isEditFlag: true,
              IsFinancialDataChanged: false,
              IsVendor: Data.IsVendor,
              BOPCategory: Data.CategoryName !== undefined ? { label: Data.CategoryName, value: Data.CategoryId } : {},
              selectedPlants: plantObj,
              vendorName: Data.VendorName !== undefined ? { label: Data.VendorName, value: Data.Vendor } : {},
              currency: Data.Currency !== undefined ? { label: Data.Currency, value: Data.CurrencyId } : {},
              sourceLocation: Data.SourceSupplierLocationName !== undefined ? { label: Data.SourceSupplierLocationName, value: Data.SourceLocation } : {},
              effectiveDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '',
              oldDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '',
              files: Data.Attachements,
              UOM: ((Data.UnitOfMeasurement !== undefined) ? { label: Data.UnitOfMeasurement, value: Data.UnitOfMeasurementId } : {}),
              isLoader: false,
            }, () => this.setState({ isLoader: false }))
            // ********** ADD ATTACHMENTS FROM API INTO THE DROPZONE'S PERSONAL DATA STORE **********
            let files = Data.Attachements && Data.Attachements.map((item) => {
              item.meta = {}
              item.meta.id = item.FileId
              item.meta.status = 'done'
              return item
            })
            if (this.dropzone.current !== null) {
              this.dropzone.current.files = files
            }
          }, 500)
        }
      })
    }
    else {
      this.setState({
        isLoader: false,
      })
      this.props.getBOPImportById('', res => { })
    }

  }


  /**
  * @method renderListing
  * @description Used to show type of listing
  */
  renderListing = (label) => {
    const { vendorWithVendorCodeSelectList, bopCategorySelectList, partSelectList, plantSelectList, filterPlantList, cityList,
      UOMSelectList, currencySelectList, } = this.props;
    const temp = [];
    if (label === 'BOPCategory') {
      bopCategorySelectList && bopCategorySelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'PartAssembly') {
      partSelectList && partSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ Text: item.Text, Value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'plant') {
      plantSelectList && plantSelectList.map(item => {
        if (item.PlantId === '0') return false;
        temp.push({ label: item.PlantNameCode, value: item.PlantId })
        return null;
      });
      return temp;
    }
    if (label === 'VendorNameList') {
      vendorWithVendorCodeSelectList && vendorWithVendorCodeSelectList.map(item => {
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
      UOMSelectList && UOMSelectList.map(item => {
        const accept = AcceptableBOPUOM.includes(item.Type)
        if (accept === false) return false
        if (item.Value === '0') return false;
        temp.push({ label: item.Display, value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'currency') {
      currencySelectList && currencySelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }

  }

  categoryToggler = () => {
    this.setState({ isCategoryDrawerOpen: true })
  }

  closeCategoryDrawer = (e = '', formData = {}) => {
    this.setState({ isCategoryDrawerOpen: false, }, () => {
      this.props.getBOPCategorySelectList(() => {
        const { bopCategorySelectList } = this.props;
        if (Object.keys(formData).length > 0) {
          let categoryObj = bopCategorySelectList && bopCategorySelectList.find(item => item.Text === formData.Category)
          this.setState({ BOPCategory: categoryObj && categoryObj !== undefined ? { label: categoryObj.Text, value: categoryObj.Value } : [] })
        }

      })
    })
  }


  /**
  * @method handlePartAssembly
  * @description Used handle Part Assembly
  */
  handlePartAssembly = (e) => {
    this.setState({ selectedPartAssembly: e })
  }

  /**
  * @method handlePlant
  * @description Used handle Plant
  */
  handlePlant = (e) => {
    this.setState({ selectedPlants: e })
  }

  /**
 * @method handleUOM
 * @description called
 */
  handleUOM = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ UOM: newValue, })
    } else {
      this.setState({ UOM: {} })
    }
  };

  /**
  * @method handleVendorName
  * @description called
  */
  handleVendorName = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ vendorName: newValue, isVendorNameNotSelected: false, }, () => {
        const { vendorName } = this.state;
        this.props.getPlantBySupplier(vendorName.value, () => { })
      });
    } else {
      this.setState({ vendorName: [], })
    }
  };

  vendorToggler = () => {
    this.setState({ isOpenVendor: true })
  }

  closeVendorDrawer = (e = '') => {
    this.setState({ isOpenVendor: false }, () => {
      const { IsVendor } = this.state;
      this.setState({ inputLoader: true })
      if (IsVendor) {
        this.props.getVendorWithVendorCodeSelectList(() => { this.setState({ inputLoader: false }) })
      } else {
        this.props.getVendorTypeBOPSelectList(() => { this.setState({ inputLoader: false }) })
      }
    })
  }

  /**
  * @method handleSourceSupplierCity
  * @description called
  */
  handleSourceSupplierCity = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ sourceLocation: newValue, isSourceChange: true });
    } else {
      this.setState({ sourceLocation: [], })
    }
    this.setState({ DropdownChange: false })
  };


  handleSource = (newValue, actionMeta) => {

    if (newValue && newValue !== '') {

      this.setState({ source: newValue, isSourceChange: true })

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
  }  /**
  * @method handleCurrency
  * @description called
  */
  handleCurrency = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      if (newValue.label === INR) {
        this.setState({ showCurrency: false }, () => {
          this.handleCalculation()
        })

      } else {
        this.setState({ showCurrency: true }, () => {
          if (this.state.effectiveDate) {
            this.props.getExchangeRateByCurrency(newValue.label, DayTime(this.state.effectiveDate).format('YYYY-MM-DD'), res => {
              //this.props.change('NetLandedCost', (fieldsObj.BasicRate * res.data.Data.CurrencyExchangeRate))

              if (Object.keys(res.data.Data).length === 0) {

                this.setState({ showWarning: true })
              }
              else {
                this.setState({ showWarning: false })
              }
              this.setState({ currencyValue: checkForNull(res.data.Data.CurrencyExchangeRate), showCurrency: true }, () => {
                this.handleCalculation()
              })
            })
          }
          // this.handleCalculation()
        })
      }
      this.setState({ currency: newValue, })
    } else {
      this.setState({ currency: [] })
    }
  };

  handleCalculation = () => {
    const { fieldsObj, initialConfiguration } = this.props
    const BasicRate = fieldsObj && fieldsObj.BasicRate !== undefined ? fieldsObj.BasicRate : 0;
    const NetLandedCost = checkForNull((BasicRate) * this.state.currencyValue)


    if (this.state.isEditFlag && Number(checkForDecimalAndNull(NetLandedCost, initialConfiguration.NoOfDecimalForPrice)) === Number(checkForDecimalAndNull(this.state.DataToChange?.NetLandedCostConversion, initialConfiguration.NoOfDecimalForPrice))) {
      this.setState({ IsFinancialDataChanged: false })
    }

    this.setState({ netLandedcost: (BasicRate), netLandedConverionCost: NetLandedCost })
    this.props.change('NetLandedCost', checkForDecimalAndNull((BasicRate), initialConfiguration.NoOfDecimalForPrice))
    this.props.change('NetLandedCostCurrency', checkForDecimalAndNull(NetLandedCost, initialConfiguration.NoOfDecimalForPrice))

    // THIS CALCULATION IS FOR MINDA
    // const BasicRate = fieldsObj && fieldsObj.BasicRate !== undefined ? fieldsObj.BasicRate : 0;
    // const NetLandedCost = checkForNull((BasicRate) * this.state.currencyValue)
    // this.setState({ netLandedcost: (BasicRate), netLandedConverionCost: NetLandedCost })
    // this.props.change('NetLandedCost', checkForDecimalAndNull((BasicRate), initialConfiguration.NoOfDecimalForPrice))
  }

  /**
  * @method handleChange
  * @description Handle Effective Date
  */
  handleEffectiveDateChange = (date) => {
    const { data } = this.props;
    if (data && data.isEditFlag) {
      if (this.state.dateCount >= 1) {
        this.setState({ isDateChange: true })       // IF USER DOES NOT EDIT EFFECTIVE DATE IN EDIT MODE THEN ISDATECHANGE WILL NOT BE TRUE
      }
    } else {
      this.setState({ isDateChange: true })
    }

    this.setState({
      effectiveDate: date,
      dateCount: this.state.dateCount + 1,
    });
    const { currency } = this.state
    if (currency.label === INR) {
      this.setState({ currencyValue: 1, showCurrency: false }, () => {
        this.handleCalculation()
      })

    } else {
      if (currency.length !== 0) {
        this.props.getExchangeRateByCurrency(currency.label, DayTime(date).format('YYYY-MM-DD'), res => {
          if (Object.keys(res.data.Data).length === 0) {

            this.setState({ showWarning: true })
          }
          else {
            this.setState({ showWarning: false })
          }
          this.setState({ currencyValue: checkForNull(res.data.Data.CurrencyExchangeRate), showCurrency: true }, () => {
            this.handleCalculation()
          })
        })
      }
    }
  };

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
    const { files, } = this.state;

    this.setState({ uploadAttachements: false, setDisable: true })

    if (status === 'removed') {
      const removedFileName = file.name;
      let tempArr = files.filter(item => item.OriginalFileName !== removedFileName)
      this.setState({ files: tempArr })
    }

    if (status === 'done') {
      let data = new FormData()
      data.append('file', file)
      this.props.fileUploadBOPDomestic(data, (res) => {
        this.setDisableFalseFunction()
        let Data = res.data[0]
        const { files } = this.state;
        files.push(Data)
        this.setState({ files: files })
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
      this.props.fileDeleteBOPDomestic(deleteData, (res) => {
        Toaster.success('File has been deleted successfully.')
        let tempArr = this.state.files.filter(item => item.FileId !== FileId)
        this.setState({ files: tempArr })
      })
    }
    if (FileId == null) {
      let tempArr = this.state.files.filter(item => item.FileName !== OriginalFileName)
      this.setState({ files: tempArr })
    }

    // ********** DELETE FILES THE DROPZONE'S PERSONAL DATA STORE **********
    if (this.dropzone?.current !== null) {
      this.dropzone.current.files.pop()
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
  * @method cancel
  * @description used to Reset form
  */
  cancel = (type) => {
    const { reset } = this.props;
    reset();
    this.setState({
      IsVendor: false,
      selectedPartAssembly: [],
      selectedPlants: [],
      sourceLocation: [],
      UOM: {},
    })
    this.props.getBOPImportById('', res => { })
    this.getDetails()
    this.props.hideForm(type)
  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = debounce((values) => {
    const { IsVendor, BOPCategory, selectedPlants, vendorName, currency, isSourceChange, sourceLocation, BOPID, isEditFlag, files, effectiveDate, oldDate, UOM, netLandedConverionCost, DataToChange, DropdownChange, uploadAttachements, isDateChange, IsFinancialDataChanged } = this.state;

    if (vendorName.length <= 0) {
      this.setState({ isVendorNameNotSelected: true, setDisable: false })      // IF VENDOR NAME IS NOT SELECTED THEN WE WILL SHOW THE ERROR MESSAGE MANUALLY AND SAVE BUTTON WILL NOT BE DISABLED
      return false
    }
    this.setState({ isVendorNameNotSelected: false })


    let plantArray = { PlantName: selectedPlants.label, PlantId: selectedPlants.value, PlantCode: '' }

    if (selectedPlants.length === 0 && !this.state.IsVendor) {
      return false;
    }

    // if (this.state.isFinalApprovar && isEditFlag) {

    // if (DataToChange.IsVendor) {

    // }
    // if (Boolean(DataToChange.IsVendor) === false) {
    //   if (Number(DataToChange.BasicRate) === Number(values.BasicRate) && DataToChange.Remark === values.Remark && uploadAttachements) {
    //     Toaster.warning('Please change data to send BOP for approval')
    //     return false;
    //   }
    // }
    if ((isEditFlag && this.state.isFinalApprovar) || (isEditFlag && CheckApprovalApplicableMaster(BOP_MASTER_ID) !== true)) {

      this.setState({ setDisable: true, disablePopup: false })
      let updatedFiles = files.map((file) => {
        return { ...file, ContextId: BOPID }
      })
      let requestData = {
        EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
        Currency: currency.label,
        BoughtOutPartId: BOPID,
        Source: values.Source,
        SourceLocation: values.sourceLocation,
        BasicRate: values.BasicRate,
        NetLandedCost: this.state.netLandedcost,
        Remark: values.Remark,
        LoggedInUserId: loggedInUserId(),
        Plant: IsVendor === false ? [plantArray] : [],
        VendorPlant: [],
        Attachements: updatedFiles,
        UnitOfMeasurementId: UOM.value,
        NetLandedCostConversion: netLandedConverionCost,
        IsForcefulUpdated: isDateChange ? false : isSourceChange ? false : true,
        NumberOfPieces: 1,
        IsFinancialDataChanged: isDateChange ? true : false
      }


      if (IsFinancialDataChanged) {
        if (isDateChange && (DayTime(oldDate).format("DD/MM/YYYY") !== DayTime(effectiveDate).format("DD/MM/YYYY"))) {
          this.setState({ showPopup: true, updatedObj: requestData })
          return false

        } else {
          this.setState({ setDisable: false })
          Toaster.warning('Please update the effective date')
          return false
        }

      }
      else {
        if (DropdownChange && String(DataToChange.Source) === String(values.Source) &&
          Number(DataToChange.BasicRate) === Number(values.BasicRate) && DataToChange.Remark === values.Remark && JSON.stringify(updatedFiles) === JSON.stringify(DataToChange.Attachements) &&
          ((DataToChange.Source ? DataToChange.Source : '-') === (values.Source ? values.Source : '-')) &&
          ((DataToChange.SourceLocation ? DataToChange.SourceLocation : '-') === (sourceLocation.value ? sourceLocation.value : '-'))) {
          this.cancel('submit')
          return false;
        }
        else {
          if (isSourceChange) {
            this.props.updateBOPImport(requestData, (res) => {
              this.setState({ setDisable: false })
              if (res?.data?.Result) {
                Toaster.success(MESSAGES.UPDATE_BOP_SUCESS);
                this.cancel('submit')
              }
            });
          }
          else {
            this.setState({ showPopup: true, updatedObj: requestData })
          }
          return false
        }
      }
      // if (isEditFlag) {
      //   this.setState({ showPopup: true, updatedObj: requestData })
      //   return false
      // }

    } else {

      if (CheckApprovalApplicableMaster(BOP_MASTER_ID) === true && !this.state.isFinalApprovar) {
        this.setState({ IsSendForApproval: true })
      } else {
        this.setState({ IsSendForApproval: false })
      }
      // this.setState({ setDisable: true })
      const formData = {
        IsSendForApproval: this.state.IsSendForApproval,
        BoughtOutPartId: BOPID,
        Currency: currency.label,
        IsVendor: IsVendor,
        EntryType: 0,
        BoughtOutPartNumber: values.BoughtOutPartNumber,
        BoughtOutPartName: values.BoughtOutPartName,
        CategoryId: BOPCategory.value,
        Specification: values.Specification,
        Vendor: vendorName.value,
        Source: values.Source,
        SourceLocation: sourceLocation.value,
        EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
        BasicRate: values.BasicRate,
        NumberOfPieces: 1,
        NetLandedCost: this.state.netLandedcost,
        Remark: values.Remark,
        IsActive: true,
        LoggedInUserId: loggedInUserId(),
        Plant: IsVendor === false ? [plantArray] : [],
        DestinationPlantId: selectedPlants.value ? selectedPlants.value : "00000000-0000-0000-0000-000000000000",
        Attachements: files,
        UnitOfMeasurementId: UOM.value,
        VendorPlant: [],
        NetLandedCostConversion: netLandedConverionCost,
        IsFinancialDataChanged: isDateChange ? true : false
      }

      if (CheckApprovalApplicableMaster(BOP_MASTER_ID) === true && !this.state.isFinalApprovar) {
        if (DropdownChange && String(DataToChange.Source) === String(values.Source) &&
          Number(DataToChange.BasicRate) === Number(values.BasicRate) && DataToChange.Remark === values.Remark && (files === DataToChange.Attachements) &&
          ((DataToChange.Source ? DataToChange.Source : '-') === (values.Source ? values.Source : '-')) &&
          ((DataToChange.SourceLocation ? DataToChange.SourceLocation : '-') === (sourceLocation.value ? sourceLocation.value : '-'))) {
          Toaster.warning('Please change data to send BOP for approval')
          return false;
        }
        this.setState({ disablePopup: false })
        if (IsFinancialDataChanged) {
          if (isDateChange && (DayTime(oldDate).format("DD/MM/YYYY") !== DayTime(effectiveDate).format("DD/MM/YYYY"))) {
            this.setState({ approveDrawer: true, approvalObj: formData })
            return false

          } else {
            this.setState({ setDisable: false })
            Toaster.warning('Please update the effective date')
            return false
          }
        }

        if (DataToChange.IsVendor) {
          if (DropdownChange &&
            Number(DataToChange.BasicRate) === Number(values.BasicRate) && DataToChange.Remark === values.Remark && (files === DataToChange.Attachements) &&
            ((DataToChange.Source ? DataToChange.Source : '-') === (values.Source ? values.Source : '-')) &&
            ((DataToChange.SourceLocation ? DataToChange.SourceLocation : '-') === (sourceLocation.value ? sourceLocation.value : '-'))) {
            Toaster.warning('Please change data to send BOP for approval')
            // this.cancel()
            return false;
          }
        }
        if (Boolean(DataToChange.IsVendor) === false) {
          if (Number(DataToChange.BasicRate) === Number(values.BasicRate) && DataToChange.Remark === values.Remark && (uploadAttachements === DataToChange.Attachements)) {
            Toaster.warning('Please change data to send BOP for approval')
            // this.cancel()
            return false;
          }
        }

        if ((DataToChange.Remark) === (values.Remark) && (uploadAttachements === DataToChange.Attachements)) {
          Toaster.warning('Please change data to send BOP for approval')
          return false;
        } else {

          this.setState({ approveDrawer: true, approvalObj: formData })
          return false
        }


        // if (isEditFlag) {
        //   this.setState({ showPopup: true, updatedObj: formData })
        //   return false
        // }


      } else {
        this.props.createBOPImport(formData, (res) => {
          this.setState({ setDisable: false })
          if (res.data.Result) {
            Toaster.success(MESSAGES.BOP_ADD_SUCCESS)
            //this.clearForm()
            this.cancel()
          }
        })
      }
    }


  }, 500)

  onPopupConfirm = debounce(() => {
    this.setState({ disablePopup: true })
    this.props.updateBOPImport(this.state.updatedObj, (res) => {
      this.setState({ setDisable: false })
      if (res?.data?.Result) {
        Toaster.success(MESSAGES.UPDATE_BOP_SUCESS);
        this.cancel()
      }
    });
  }, 500)
  closePopUp = () => {
    this.setState({ showPopup: false, setDisable: false })
  }
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
    const { handleSubmit, isBOPAssociated } = this.props;
    const { isCategoryDrawerOpen, isOpenVendor, isOpenUOM, isEditFlag, updatedObj, isViewMode, setDisable, disablePopup, DropdownChange, DataToChange } = this.state;
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
        {this.state.isLoader && <LoaderCustom />}
        <div className="container-fluid">
          <div>
            <div className="login-container signup-form">
              <div className="row">
                <div className="col-md-12">
                  <div className="shadow-lgg login-formg">
                    <div className="row">
                      <div className="col-md-6">
                        <h1>
                          {isViewMode ? "View" : isEditFlag ? "Update" : "Add"} BOP (Import)
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
                          <Col md="12">
                            <div className="left-border">{"BOP:"}</div>
                          </Col>
                          <Col md="3">
                            <Field
                              label={`BOP Part No`}
                              name={"BoughtOutPartNumber"}
                              type="text"
                              placeholder={"Enter"}
                              validate={[required, acceptAllExceptSingleSpecialCharacter, maxLength20, checkWhiteSpaces, checkSpacesInString]}
                              component={renderText}
                              required={true}
                              disabled={isEditFlag ? true : false}
                              className=" "
                              customClassName=" withBorder"
                            />
                          </Col>
                          <Col md="3">
                            <Field
                              label={`BOP Part Name`}
                              name={"BoughtOutPartName"}
                              type="text"
                              placeholder={"Enter"}
                              validate={[required, acceptAllExceptSingleSpecialCharacter, maxLength80, checkWhiteSpaces, checkSpacesInString]}
                              component={renderText}
                              required={true}
                              disabled={isEditFlag ? true : false}
                              className=" "
                              customClassName=" withBorder"
                            />
                          </Col>
                          <Col md="3">
                            <div className="d-flex justify-space-between align-items-center inputwith-icon">
                              <div className="fullinput-icon">
                                <Field
                                  name="BOPCategory"
                                  type="text"
                                  label="BOP Category"
                                  component={searchableSelect}
                                  placeholder={"Select"}
                                  options={this.renderListing("BOPCategory")}
                                  //onKeyUp={(e) => this.changeItemDesc(e)}
                                  validate={
                                    this.state.BOPCategory == null || this.state.BOPCategory.length === 0 ? [required] : []}
                                  required={true}
                                  handleChangeDescription={
                                    this.handleCategoryChange
                                  }
                                  valueDescription={this.state.BOPCategory}
                                  disabled={isEditFlag ? true : false}
                                />
                              </div>
                              {!isEditFlag &&
                                <div
                                  onClick={this.categoryToggler}
                                  className={"plus-icon-square right"}
                                ></div>}
                            </div>
                          </Col>
                          <Col md="3">
                            <Field
                              label={`Specification`}
                              name={"Specification"}
                              type="text"
                              placeholder={isEditFlag ? '-' : "Enter"}
                              validate={[acceptAllExceptSingleSpecialCharacter, maxLength80, checkSpacesInString]}
                              component={renderText}
                              //required={true}
                              disabled={isEditFlag ? true : false}
                              className=" "
                              customClassName=" withBorder"
                            />
                          </Col>

                        </Row>

                        <Row>

                          <Col md="3">
                            <Field
                              name="UOM"
                              type="text"
                              label="UOM"
                              component={searchableSelect}
                              placeholder={isEditFlag ? '-' : "Select"}
                              options={this.renderListing("uom")}
                              //onKeyUp={(e) => this.changeItemDesc(e)}
                              validate={
                                this.state.UOM == null || this.state.UOM.length === 0 ? [required] : []}
                              required={true}
                              handleChangeDescription={this.handleUOM}
                              valueDescription={this.state.UOM}
                              disabled={isEditFlag ? true : false}
                            />
                          </Col>
                          {(this.state.IsVendor === false || getConfigurationKey().IsDestinationPlantConfigure) && (
                            <Col md="3">
                              <Field
                                label={this.state.IsVendor ? 'Destination Plant' : 'Plant'}
                                name="Plant"
                                placeholder={isEditFlag ? '-' : "Select"}
                                //   selection={ this.state.selectedPlants == null || this.state.selectedPlants.length === 0 ? [] : this.state.selectedPlants} 
                                options={this.renderListing("plant")}
                                handleChangeDescription={this.handlePlant}
                                validate={this.state.selectedPlants == null || this.state.selectedPlants.length === 0 ? [required] : []}
                                // optionValue={(option) => option.Value}
                                // optionLabel={(option) => option.Text}
                                component={searchableSelect}
                                valueDescription={this.state.selectedPlants}
                                mendatory={true}
                                required
                                className="multiselect-with-border"
                                disabled={isEditFlag ? true : false}
                              />
                            </Col>
                          )}

                        </Row>

                        <Row>
                          <Col md="12">
                            <div className="left-border">{"Vendor:"}</div>
                          </Col>
                          <Col md="3" className='mb-4'>
                            <label>{"Vendor Name"}<span className="asterisk-required">*</span></label>
                            <div className="d-flex justify-space-between align-items-center async-select">
                              <div className="fullinput-icon p-relative">
                                {!this.state.isLoader && this.state.inputLoader && <LoaderCustom customClass={`input-loader`} />}
                                <AsyncSelect
                                  name="vendorName"
                                  ref={this.myRef}
                                  key={this.state.updateAsyncDropdown}
                                  loadOptions={promiseOptions}
                                  onChange={(e) => this.handleVendorName(e)}
                                  value={this.state.vendorName}
                                  noOptionsMessage={({ inputValue }) => !inputValue ? "Please enter vendor name/code" : "No results found"}
                                  isDisabled={(isEditFlag || this.state.inputLoader) ? true : false} />
                              </div>
                              {!isEditFlag && (
                                <div
                                  onClick={this.vendorToggler}
                                  className={"plus-icon-square  right"}
                                ></div>
                              )}
                            </div>
                            {this.state.isVendorNameNotSelected && <div className='text-help'>This field is required.</div>}
                          </Col>
                          {this.state.IsVendor && (
                            <>
                              <Col md="3">
                                <Field
                                  label={`Source`}
                                  name={"Source"}
                                  type="text"
                                  placeholder={isEditFlag ? '-' : "Enter"}
                                  validate={[acceptAllExceptSingleSpecialCharacter, maxLength80]}
                                  component={renderText}
                                  valueDescription={this.state.source}
                                  onChange={this.handleSource}
                                  disabled={isViewMode}
                                  className=" "
                                  customClassName=" withBorder"
                                />
                              </Col>
                              <Col md="3">
                                <Field
                                  name="SourceLocation"
                                  type="text"
                                  label="Source Location"
                                  component={searchableSelect}
                                  placeholder={isEditFlag ? '-' : "Select"}
                                  options={this.renderListing("SourceLocation")}
                                  disabled={isViewMode}

                                  handleChangeDescription={this.handleSourceSupplierCity}
                                  valueDescription={this.state.sourceLocation}
                                />
                              </Col>
                            </>
                          )}
                        </Row>

                        <Row>
                          <Col md="12">
                            <div className="left-border">{"Cost:"}</div>
                          </Col>
                          <Col md="3">
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
                            >{this.state.showWarning && <WarningMessage dClass="mt-1" message={`${this.state.currency.label} rate is not present in the Exchange Master`} />}
                            </Field>
                          </Col>
                          <Col md="3">
                            <div className="inputbox date-section mb-3 form-group">
                              <Field
                                label="Effective Date"
                                name="EffectiveDate"
                                selected={this.state.effectiveDate}
                                onChange={this.handleEffectiveDateChange}
                                type="text"
                                minDate={this.state.minEffectiveDate}
                                validate={[required]}
                                autoComplete={'off'}
                                required={true}
                                changeHandler={(e) => {
                                }}
                                component={renderDatePicker}
                                className="form-control"
                                disabled={isViewMode || !this.state.IsFinancialDataChanged || (isEditFlag && isBOPAssociated)}
                                placeholder={isEditFlag ? '-' : "Select Date"}
                              />
                            </div>

                          </Col>
                          <Col md="3">
                            <Field
                              label={`Basic Rate (${this.state.currency.label === undefined ? 'Currency' : this.state.currency.label})`}
                              name={"BasicRate"}
                              type="text"
                              placeholder={isEditFlag || (isEditFlag && isBOPAssociated) ? '-' : "Enter"}
                              validate={[required, positiveAndDecimalNumber, maxLength10, decimalLengthsix]}
                              component={renderNumberInputField}
                              required={true}
                              disabled={isViewMode || (isEditFlag && isBOPAssociated)}
                              className=" "
                              customClassName=" withBorder"
                            />
                          </Col>
                          <Col md="3">
                            <Field
                              label={`Net Cost (${this.state.currency.label === undefined ? 'Currency' : this.state.currency.label})`}
                              name={this.state.netLandedcost === 0 ? '' : "NetLandedCost"}
                              type="text"
                              placeholder={"-"}
                              validate={[]}
                              component={renderNumberInputField}
                              required={false}
                              disabled={true}
                              className=" "
                              customClassName=" withBorder"
                            />
                          </Col>
                          {
                            this.state.showCurrency &&
                            <Col md="3">
                              <Field
                                label={`Net Cost (INR)`}
                                name={this.state.netLandedConverionCost === 0 ? '' : "NetLandedCostCurrency"}
                                type="text"
                                placeholder={"-"}
                                validate={[]}
                                component={renderNumberInputField}
                                required={false}
                                disabled={true}
                                className=" "
                                customClassName=" withBorder mb-0"
                              />
                            </Col>
                          }
                          {/* </Row>

                        <Row> */}

                        </Row>

                        <Row>
                          <Col md="12">
                            <div className="left-border">
                              {"Remarks & Attachments:"}
                            </div>
                          </Col>
                          <Col md="6">
                            <Field
                              label={"Remarks"}
                              name={`Remark`}
                              placeholder={isViewMode ? '-' : "Type here..."}
                              className=""
                              customClassName=" textAreaWithBorder"
                              validate={[maxLength512]}
                              value={this.state.remarks}
                              onChange={this.handleMessageChange}
                              disabled={isViewMode}
                              component={renderTextAreaField}
                              maxLength="5000"
                            />
                          </Col>
                          <Col md="3">
                            <label>
                              Upload Files (upload up to 3 files)
                            </label>
                            <div className={`alert alert-danger mt-2 ${this.state.files.length === 3 ? '' : 'd-none'}`} role="alert">
                              Maximum file upload limit has been reached.
                            </div>
                            <div className={`${this.state.files.length >= 3 ? 'd-none' : ''}`}>
                              <Dropzone
                                ref={this.dropzone}
                                onChangeStatus={this.handleChangeStatus}
                                PreviewComponent={this.Preview}
                                accept="*"
                                disabled={isViewMode}
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
                                      <a href={fileURL} target="_blank">
                                        {f.OriginalFileName}
                                      </a>

                                      {!isViewMode && <img
                                        alt={""}
                                        className="float-right"
                                        onClick={() =>
                                          this.deleteFile(
                                            f.FileId,
                                            f.FileName
                                          )
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
                            className=" mr15 cancel-btn"
                            onClick={() => { this.cancel('submit') }}
                            disabled={setDisable}
                          >
                            <div className={"cancel-icon"}></div>
                            {"Cancel"}
                          </button>


                          {
                            (CheckApprovalApplicableMaster(BOP_MASTER_ID) === true && !this.state.isFinalApprovar) ?
                              <button type="submit"
                                class="user-btn approval-btn save-btn mr5"
                                disabled={isViewMode || setDisable}
                              >
                                <div className="send-for-approval"></div>
                                {'Send For Approval'}
                              </button>
                              :
                              <button
                                type="submit"
                                className="user-btn mr5 save-btn"
                                disabled={isViewMode || setDisable}
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
          {isCategoryDrawerOpen && (
            <AddBOPCategory
              isOpen={isCategoryDrawerOpen}
              closeDrawer={this.closeCategoryDrawer}
              isEditFlag={false}
              anchor={"right"}
            />
          )}
          {isOpenVendor && (
            <AddVendorDrawer
              isOpen={isOpenVendor}
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
          {
            this.state.approveDrawer && (
              <MasterSendForApproval
                isOpen={this.state.approveDrawer}
                closeDrawer={this.closeApprovalDrawer}
                isEditFlag={false}
                // masterId={BOP_MASTER_ID}
                type={'Sender'}
                anchor={"right"}
                approvalObj={this.state.approvalObj}
                isBulkUpload={false}
                IsImportEntery={true}
                currency={this.state.currency}
              />
            )
          }
          {
            this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} disablePopup={disablePopup} />
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
  const { comman, supplier, boughtOutparts, part, auth, } = state;
  const fieldsObj = selector(state, 'NumberOfPieces', 'BasicRate',);

  const { bopCategorySelectList, bopData, } = boughtOutparts;
  const { plantList, filterPlantList, filterCityListBySupplier, cityList,
    UOMSelectList, currencySelectList, plantSelectList } = comman;
  const { vendorWithVendorCodeSelectList } = supplier;
  const { partSelectList } = part;
  const { initialConfiguration } = auth;

  let initialValues = {};
  if (bopData && bopData !== undefined) {
    initialValues = {
      BoughtOutPartNumber: bopData.BoughtOutPartNumber,
      BoughtOutPartName: bopData.BoughtOutPartName,
      Specification: bopData.Specification,
      Source: bopData.Source,
      BasicRate: bopData.BasicRate,
      NetLandedCost: bopData.NetLandedCost,
      Remark: bopData.Remark,
    }
  }

  return {
    vendorWithVendorCodeSelectList, bopCategorySelectList, plantList, filterPlantList, filterCityListBySupplier,
    plantSelectList, cityList, partSelectList, UOMSelectList, currencySelectList, fieldsObj, initialValues, initialConfiguration,
  }

}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
  getVendorWithVendorCodeSelectList,
  getVendorTypeBOPSelectList,
  getPlantBySupplier,
  getUOMSelectList,
  getCurrencySelectList,
  createBOPImport,
  updateBOPImport,
  getBOPCategorySelectList,
  getBOPImportById,
  fileUploadBOPDomestic,
  fileDeleteBOPDomestic,
  getPlantSelectListByType,
  getExchangeRateByCurrency,
  masterFinalLevelUser,
  getCityByCountry,
  getAllCity
})(reduxForm({
  form: 'AddBOPImport',
  touchOnChange: true,
  onSubmitFail: (errors) => {
    focusOnError(errors)
  },
  enableReinitialize: true,
})(AddBOPImport));
