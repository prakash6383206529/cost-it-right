import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { required, getVendorCode, maxLength80, checkWhiteSpaces, acceptAllExceptSingleSpecialCharacter, maxLength10, maxLength15, positiveAndDecimalNumber, maxLength512, decimalLengthsix, checkSpacesInString } from "../../../helper/validation";
import { renderText, renderMultiSelectField, searchableSelect, renderTextAreaField, renderDatePicker, renderNumberInputField, focusOnError } from "../../layout/FormInputs";
import { getVendorWithVendorCodeSelectList } from '../actions/Supplier';
import { createOperationsAPI, getOperationDataAPI, updateOperationAPI, fileUploadOperation, fileDeleteOperation, checkAndGetOperationCode } from '../actions/OtherOperation';
import { getPlantSelectListByType, getPlantBySupplier, getUOMSelectList, } from '../../../actions/Common';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { getConfigurationKey, loggedInUserId, userDetails } from "../../../helper/auth";
import Switch from "react-switch";
import AddVendorDrawer from '../supplier-master/AddVendorDrawer';
import AddUOM from '../uom-master/AddUOM';
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css';
import { FILE_URL, OPERATIONS_ID, ZBC, EMPTY_GUID } from '../../../config/constants';
import { AcceptableOperationUOM } from '../../../config/masterData'
import DayTime from '../../common/DayTimeWrapper'
import imgRedcross from '../../../assests/images/red-cross.png';
import MasterSendForApproval from '../MasterSendForApproval'
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { debounce } from 'lodash';
import AsyncSelect from 'react-select/async';
import LoaderCustom from '../../common/LoaderCustom';
import { CheckApprovalApplicableMaster } from '../../../helper';
import { masterFinalLevelUser } from '../actions/Material'
import { getCostingSpecificTechnology } from '../../costing/actions/Costing'

const selector = formValueSelector('AddOperation');

class AddOperation extends Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    // ********* INITIALIZE REF FOR DROPZONE ********
    this.dropzone = React.createRef();
    this.state = {
      IsVendor: false,
      selectedTechnology: [],
      selectedPlants: [],
      isVendorNameNotSelected: false,

      vendorName: [],
      oldDate: '',
      UOM: [],
      isViewMode: this.props?.data?.isViewMode ? true : false,
      oldUOM: [],
      isDateChange: false,
      IsSendForApproval: false,
      IsFinancialDataChanged: true,
      DataToChange: [],

      isSurfaceTreatment: false,
      remarks: '',
      files: [],
      isVisible: false,
      imageURL: '',

      isEditFlag: false,
      isShowForm: false,
      isOpenVendor: false,
      isOpenUOM: false,
      OperationId: EMPTY_GUID,
      effectiveDate: '',
      minEffectiveDate: '',
      destinationPlant: [],
      changeValue: true,
      dataToChange: '',
      uploadAttachements: true,
      isDisableCode: false,
      showPopup: false,
      updatedObj: {},
      setDisable: false,
      disablePopup: false,
      inputLoader: false,
      attachmentLoader: false
    }
  }

  /**
  * @method componentWillMount
  * @description called before render the component
  */
  UNSAFE_componentWillMount() {
    if (!this.state.isViewMode) {
      this.props.getUOMSelectList(() => { })
    }
  }

  /**
   * @method componentDidMount
   * @description called after render the component
   */
  componentDidMount() {
    if (!(this.props.data.isEditFlag || this.props.data.isViewFlag)) {
      this.props.getCostingSpecificTechnology(loggedInUserId(), () => { })
      this.props.getPlantSelectListByType(ZBC, () => { })
    }
    let obj = {
      MasterId: OPERATIONS_ID,
      DepartmentId: userDetails().DepartmentId,
      LoggedInUserLevelId: userDetails().LoggedInMasterLevelId,
      LoggedInUserId: loggedInUserId()
    }
    this.props.masterFinalLevelUser(obj, (res) => {
      if (res.data.Result) {
        this.setState({ isFinalApprovar: res.data.Data.IsFinalApprovar })
      }
    })
    this.getDetail()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.filedObj !== this.props.filedObj) {
      const { filedObj } = this.props;
      if (filedObj && filedObj !== undefined && filedObj.length > 4) {
      }
    }
  }

  /**
  * @method renderListing
  * @description Used show listing of unit of measurement
  */
  renderListing = (label) => {
    const { costingSpecifiTechnology, plantSelectList, vendorWithVendorCodeSelectList,
      UOMSelectList, } = this.props;
    const temp = [];
    if (label === 'technology') {
      costingSpecifiTechnology && costingSpecifiTechnology.map(item => {
        if (item.Value === '0') return false;
        temp.push({ Text: item.Text, Value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'plant') {
      plantSelectList && plantSelectList.map(item => {
        if (item.PlantId === '0') return false;
        temp.push({ Text: item.PlantNameCode, Value: item.PlantId })
        return null;
      });
      return temp;
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
      vendorWithVendorCodeSelectList && vendorWithVendorCodeSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'UOM') {
      UOMSelectList && UOMSelectList.map(item => {
        const accept = AcceptableOperationUOM.includes(item.Type)
        if (accept === false) return false
        if (item.Value === '0') return false;
        temp.push({ label: item.Display, value: item.Value })
        return null;
      });
      return temp;
    }
  }

  /**
  * @method onPressVendor
  * @description Used for Vendor checked
  */
  onPressVendor = () => {
    this.setState({
      IsVendor: !this.state.IsVendor,
    });
    this.setState({ inputLoader: true })
    this.props.getVendorWithVendorCodeSelectList(() => { this.setState({ inputLoader: false }) })
  }

  /**
  * @method handleTechnology
  * @description Used handle technology
  */
  handleTechnology = (e) => {
    this.setState({ selectedTechnology: e })
  }

  /**
  * @method handlePlants
  * @description Used handle Plants
  */
  handlePlants = (e) => {
    this.setState({ selectedPlants: e })
  }

  /**
  * @method handleVendorName
  * @description called
  */
  handleVendorName = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ vendorName: newValue, isVendorNameNotSelected: false }, () => {
        const { vendorName } = this.state;
        this.props.getPlantBySupplier(vendorName.value, () => { })
      });
    } else {
      this.setState({ vendorName: [] })
    }
  };

  vendorToggler = () => {
    this.setState({ isOpenVendor: true })
  }

  closeVendorDrawer = (e = '') => {
    this.setState({ isOpenVendor: false }, () => {
      this.props.getVendorWithVendorCodeSelectList(() => { })
    })
  }


  closeApprovalDrawer = (e = '', type) => {
    this.setState({ approveDrawer: false, setDisable: false })
    if (type === 'submit') {
      this.cancel('submit')
    }
  }

  /**
  * @method handleUOM
  * @description called
  */
  handleUOM = (newValue) => {
    if (newValue && newValue !== '') {

      this.setState({ UOM: newValue, })
    } else {
      this.setState({ UOM: [] })
    }
  };

  uomToggler = () => {
    this.setState({ isOpenUOM: true })
  }

  closeUOMDrawer = (e = '') => {
    this.setState({ isOpenUOM: false }, () => {
      this.props.getUOMSelectList(() => { })
    })
  }

  /**
    * @method handleChange
    * @description Handle Effective Date
    */
  handleEffectiveDateChange = (date) => {
    this.setState({
      effectiveDate: date,
      isDateChange: true,
    })

  }


  handleRateChange = (value) => {

    if (this.state.isEditFlag && Number(this.state.DataToChange?.Rate) === Number(value?.target?.value)) {
      this.setState({ IsFinancialDataChanged: false })

    } else if (this.state.isEditFlag) {
      this.setState({ IsFinancialDataChanged: true })

    }
  }

  /**
  * @method onPressSurfaceTreatment
  * @description Used for Surface Treatment
  */
  onPressSurfaceTreatment = () => {
    this.setState({ isSurfaceTreatment: !this.state.isSurfaceTreatment });
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
  * @method getDetail
  * @description used to get user detail
  */
  getDetail = () => {
    const { data } = this.props;
    if (data && data.isEditFlag) {
      this.setState({
        isLoader: true,
        isEditFlag: true,
        OperationId: data.ID,
      })
      // this.props.getVendorWithVendorCodeSelectList(() => { this.setState({ inputLoader: false }) })
      this.props.getOperationDataAPI(data.ID, (res) => {
        if (res && res.data && res.data.Data) {
          let Data = res.data.Data;
          this.setState({ DataToChange: Data })
          this.props.change('EffectiveDate', DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '')
          this.setState({ minEffectiveDate: Data.EffectiveDate })

          let technologyArray = [];
          Data && Data.Technology.map((item) => {
            technologyArray.push({ Text: item.Technology, Value: item.TechnologyId })
            return technologyArray;
          })

          setTimeout(() => {
            this.setState({
              isEditFlag: true,
              IsFinancialDataChanged: false,
              isLoader: false,
              IsVendor: Data.IsVendor,
              selectedTechnology: technologyArray,
              selectedPlants: [{ Text: Data.DestinationPlantName, Value: Data.DestinationPlantId }],
              vendorName: Data.VendorName && Data.VendorName !== undefined ? { label: Data.VendorName, value: Data.VendorId } : [],
              UOM: Data.UnitOfMeasurement !== undefined ? { label: Data.UnitOfMeasurement, value: Data.UnitOfMeasurementId } : [],
              oldUOM: Data.UnitOfMeasurement !== undefined ? { label: Data.UnitOfMeasurement, value: Data.UnitOfMeasurementId } : [],
              isSurfaceTreatment: Data.IsSurfaceTreatmentOperation,
              remarks: Data.Remark,
              files: Data.Attachements,
              // effectiveDate: moment(Data.EffectiveDate).isValid ? moment(Data.EffectiveDate)._d : '',
              effectiveDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '',
              oldDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '',
              destinationPlant: Data.DestinationPlantName !== undefined ? { label: Data.DestinationPlantName, value: Data.DestinationPlantId } : [],
              dataToChange: Data
            })
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
  }

  checkUniqCode = (e) => {
    this.props.checkAndGetOperationCode(e.target.value, '', res => {
      if (res && res.data && res.data.Result === false) {
        Toaster.warning(res.data.Message);
        this.props.change('OperationCode', "")
      }
    })
  }
  checkUniqCodeByName = (e) => {
    this.props.checkAndGetOperationCode('', e.target.value, res => {
      if (res && res.data && res.data.Result === false) {

        Toaster.warning(res.data.Message);
      } else {
        this.setState({ isDisableCode: res.data.DynamicData.IsExist }, () => {
          this.props.change('OperationCode', res.data.DynamicData.OperationCode ? res.data.DynamicData.OperationCode : '')
        })
      }
    })
  }

  // specify upload params and url for your files
  getUploadParams = ({ file, meta }) => {
    this.setState({ attachmentLoader: true })
    return { url: 'https://httpbin.org/post', }

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
      this.props.fileUploadOperation(data, (res) => {
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
      this.props.fileDeleteOperation(deleteData, (res) => {
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

  handleDestinationPlant = (newValue) => {
    this.setState({ destinationPlant: newValue })
  }


  /**
  * @method cancel
  * @description used to Reset form
  */
  cancel = (type) => {
    const { reset } = this.props;
    this.props.getPlantBySupplier('', () => { })
    reset();
    this.setState({
      selectedTechnology: [],
      selectedPlants: [],
      vendorName: [],
      UOM: [],
      isSurfaceTreatment: false,
      isShowForm: false,
      isEditFlag: false,
    })
    this.props.getOperationDataAPI('', () => { })
    this.props.hideForm(type)
  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = debounce((values) => {
    const { IsVendor, selectedPlants, vendorName, files,
      UOM, oldUOM, isSurfaceTreatment, selectedTechnology, remarks, OperationId, oldDate, effectiveDate, destinationPlant, DataToChange, uploadAttachements, isDateChange, IsFinancialDataChanged, isEditFlag } = this.state;
    const { initialConfiguration, filedObj } = this.props;
    const userDetail = userDetails()

    if (vendorName.length <= 0) {
      if (IsVendor) {
        this.setState({ isVendorNameNotSelected: true, setDisable: false })      // IF VENDOR NAME IS NOT SELECTED THEN WE WILL SHOW THE ERROR MESSAGE MANUALLY AND SAVE BUTTON WILL NOT BE DISABLED
        return false
      }
    }
    this.setState({ isVendorNameNotSelected: false })

    let technologyArray = [];
    selectedTechnology && selectedTechnology.map((item) => {
      technologyArray.push({ Technology: item.Text, TechnologyId: item.Value })
      return technologyArray;
    })
    let plantArray = []
    if (IsVendor) {
      plantArray.push({ PlantName: destinationPlant.label, PlantId: destinationPlant.value, PlantCode: '', })
    } else {

      selectedPlants && selectedPlants.map((item) => {
        plantArray.push({ PlantName: item.Text, PlantId: item.Value, PlantCode: '', })
        return plantArray
      })
    }
    /** Update existing detail of supplier master **/
    // if (this.state.isEditFlag && this.state.isFinalApprovar) {
    if (Number(DataToChange.Rate) === Number(values.Rate) && DataToChange.Remark === values.Remark && UOM.value === oldUOM.value
      && DataToChange.Description === values.Description && uploadAttachements) {
      Toaster.warning('Please change data to send operation for approval')
      return false
    }

    if ((isEditFlag && this.state.isFinalApprovar) || (isEditFlag && CheckApprovalApplicableMaster(OPERATIONS_ID) !== true)) {

      let updatedFiles = files.map((file) => {
        return { ...file, ContextId: OperationId }
      })


      let updateData = {
        EffectiveDate: DayTime(effectiveDate).format('YYYY/MM/DD HH:mm:ss'),
        OperationId: OperationId,
        UnitOfMeasurementId: UOM.value,
        Rate: values.Rate,
        VendorPlant: [],
        Technology: technologyArray,
        Description: values.Description,
        Remark: remarks,
        Attachements: updatedFiles,
        LoggedInUserId: loggedInUserId(),
        IsForcefulUpdated: true,
        IsFinancialDataChanged: isDateChange ? true : false
      }
      // if (this.state.isEditFlag) {
      // if (dataToChange.UnitOfMeasurementId === UOM.value && dataToChange.Rate === Number(values.Rate) && uploadAttachements) {
      //   this.cancel()
      //   return false
      // }

      if (IsFinancialDataChanged) {

        if (isDateChange && (DayTime(oldDate).format("DD/MM/YYYY") !== DayTime(effectiveDate).format("DD/MM/YYYY"))) {
          this.setState({ showPopup: true, updatedObj: updateData })
          this.setState({ setDisable: true })
          return false

        } else {

          this.setState({ setDisable: false })
          Toaster.warning('Please update the effective date')
          return false
        }

      }


      if (isEditFlag) {
        this.setState({ showPopup: true, updatedObj: updateData })
        this.setState({ setDisable: true })
        return false
      }


    } else {/** Add new detail for creating operation master **/


      if (CheckApprovalApplicableMaster(OPERATIONS_ID) === true && !this.state.isFinalApprovar) {
        this.setState({ IsSendForApproval: true })
      } else {
        this.setState({ IsSendForApproval: false })
      }

      this.setState({ setDisable: true })
      let formData = {
        IsFinancialDataChanged: isDateChange ? true : false,
        IsSendForApproval: this.state.IsSendForApproval,
        OperationId: OperationId,
        IsVendor: IsVendor,
        OperationName: values.OperationName,
        OperationCode: values.OperationCode,
        Description: values.Description,
        VendorId: IsVendor ? vendorName.value : userDetail.ZBCSupplierInfo.VendorId,
        VendorCode: IsVendor ? getVendorCode(vendorName.label) : userDetail.ZBCSupplierInfo.VendorNameWithCode,
        UnitOfMeasurementId: UOM.value,
        IsSurfaceTreatmentOperation: isSurfaceTreatment,
        //SurfaceTreatmentCharges: values.SurfaceTreatmentCharges,
        Rate: values.Rate,
        LabourRatePerUOM: initialConfiguration && initialConfiguration.IsOperationLabourRateConfigure ? values.LabourRatePerUOM : '',
        Technology: technologyArray,
        Remark: remarks,
        plant: plantArray,
        Attachements: files,
        LoggedInUserId: loggedInUserId(),
        EffectiveDate: DayTime(effectiveDate).format('YYYY/MM/DD HH:mm:ss'),
        VendorPlant: []
      }



      if (CheckApprovalApplicableMaster(OPERATIONS_ID) === true && !this.state.isFinalApprovar) {

        if (IsFinancialDataChanged) {

          if (isDateChange && (DayTime(oldDate).format("DD/MM/YYYY") !== DayTime(effectiveDate).format("DD/MM/YYYY"))) {
            this.setState({ approveDrawer: true, approvalObj: formData })
            this.setState({ setDisable: true })
            return false

          } else {

            this.setState({ setDisable: false })
            Toaster.warning('Please update the effective date')
            return false
          }
        }


        if (Number(DataToChange.Rate) === Number(values.Rate) && DataToChange.Remark === values.Remark && UOM.value === oldUOM.value && DataToChange.Description === values.Description && uploadAttachements) {
          this.cancel('Cancel')
          return false
        } else {
          this.setState({ approveDrawer: true, approvalObj: formData })
        }


      } else {

        this.props.createOperationsAPI(formData, (res) => {
          this.setState({ setDisable: false })
          if (res.data.Result) {
            Toaster.success(MESSAGES.OPERATION_ADD_SUCCESS);
            //this.clearForm()
            this.cancel('submit')
          }
        })
      }

      // this.props.createOperationsAPI(formData, (res) => {
      //   this.setState({ setDisable: false })
      //   if (res?.data?.Result) {
      //     Toaster.success(MESSAGES.OPERATION_ADD_SUCCESS);
      //     this.cancel();
      //   }
      // });


    }

  }, 500)

  onPopupConfirm = debounce(() => {
    this.setState({ disablePopup: true })
    this.props.updateOperationAPI(this.state.updatedObj, (res) => {
      this.setState({ setDisable: false })
      if (res?.data?.Result) {
        Toaster.success(MESSAGES.OPERATION_UPDATE_SUCCESS);
        this.cancel('submit')
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
    const { handleSubmit, initialConfiguration, isOperationAssociated } = this.props;
    const { isEditFlag, isOpenVendor, isOpenUOM, isDisableCode, isViewMode, setDisable, disablePopup, selectedTechnology } = this.state;
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
    let temp = [];
    selectedTechnology && selectedTechnology.map(item => {
      temp.push(item.Text)
    }
    )
    const technologyTitle = temp.join(",")
    return (
      <div className="container-fluid">
        {/* {isLoader && <Loader />} */}
        <div className="login-container signup-form">
          <div className="row">
            <div className="col-md-12">
              <div className="shadow-lgg login-formg">
                <div className="row">
                  <div className="col-md-6">
                    <h2>{this.state.isViewMode ? "View" : this.state.isEditFlag ? "Update" : "Add"} Operation
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
                          <div className={"right-title"}>Vendor Based</div>
                        </label>
                      </Col>
                    </Row>
                    <Row>
                      <Col md="3">
                        <Field
                          title={isEditFlag && technologyTitle}
                          label="Technology"
                          name="technology"
                          placeholder={isEditFlag ? '-' : 'Select'}
                          selection={
                            this.state.selectedTechnology == null ||
                              this.state.selectedTechnology.length === 0
                              ? []
                              : this.state.selectedTechnology
                          }
                          options={this.renderListing("technology")}
                          selectionChanged={this.handleTechnology}
                          optionValue={(option) => option.Value}
                          optionLabel={(option) => option.Text}
                          component={renderMultiSelectField}
                          mendatory={true}
                          validate={this.state.selectedTechnology == null || this.state.selectedTechnology.length === 0 ? [required] : []}
                          className="multiselect-with-border"
                          disabled={isEditFlag ? true : false}
                        />
                      </Col>
                      <Col md="3">
                        <Field
                          label={`Operation Name`}
                          name={"OperationName"}
                          type="text"
                          placeholder={isEditFlag ? '-' : "Select"}
                          validate={[required, acceptAllExceptSingleSpecialCharacter, maxLength80, checkWhiteSpaces]}
                          onBlur={this.checkUniqCodeByName}
                          component={renderText}
                          required={true}
                          disabled={isEditFlag ? true : false}
                          className=" "
                          customClassName=" withBorder"
                        />
                      </Col>
                      <Col md="3">
                        <Field
                          label={`Operation Code`}
                          name={"OperationCode"}
                          type="text"
                          placeholder={(isEditFlag || isDisableCode || initialConfiguration.IsOperationCodeConfigure) ? '-' : "Select"}
                          validate={[acceptAllExceptSingleSpecialCharacter, maxLength15, checkWhiteSpaces, required, checkSpacesInString]}
                          component={renderText}
                          required={true}
                          onBlur={this.checkUniqCode}
                          disabled={(isEditFlag || isDisableCode || initialConfiguration.IsOperationCodeConfigure) ? true : false}
                          className=" "
                          customClassName=" withBorder"
                        />
                      </Col>
                      <Col md="3">
                        <Field
                          label={`Description`}
                          name={"Description"}
                          type="text"
                          placeholder={isViewMode ? '-' : "Select"}
                          validate={[acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength80]}
                          component={renderText}
                          disabled={isViewMode ? true : false}
                          className=" "
                          customClassName=" withBorder"
                        />
                      </Col>
                    </Row>

                    <Row>
                      {!this.state.IsVendor && (
                        <Col md="3">
                          <Field
                            label="Plant"
                            name="Plant"
                            placeholder={isEditFlag ? '-' : 'Select'}
                            selection={this.state.selectedPlants == null || this.state.selectedPlants.length === 0 ? [] : this.state.selectedPlants}
                            options={this.renderListing("plant")}
                            selectionChanged={this.handlePlants}
                            optionValue={(option) => option.Value}
                            optionLabel={(option) => option.Text}
                            component={renderMultiSelectField}
                            mendatory={true}
                            validate={this.state.selectedPlants == null || this.state.selectedPlants.length === 0 ? [required] : []}
                            className="multiselect-with-border"
                            disabled={isEditFlag ? true : false}
                          />
                        </Col>
                      )}
                      {this.state.IsVendor && (
                        <Col md="3"><label>{"Vendor Name"}<span className="asterisk-required">*</span></label>
                          <div className="d-flex justify-space-between align-items-center async-select">
                            <div className="fullinput-icon p-relative">
                              {this.state.inputLoader && <LoaderCustom customClass={`input-loader`} />}
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

                      )}
                      {
                        this.state.IsVendor && getConfigurationKey().IsDestinationPlantConfigure &&
                        <Col md="3">
                          <Field
                            label={'Destination Plant'}
                            name="DestinationPlant"
                            placeholder={isEditFlag ? '-' : "Select"}
                            options={this.renderListing("singlePlant")}
                            handleChangeDescription={this.handleDestinationPlant}
                            validate={this.state.destinationPlant == null || this.state.destinationPlant.length === 0 ? [required] : []}
                            required={true}
                            // optionValue={(option) => option.Value}
                            // optionLabel={(option) => option.Text}
                            component={searchableSelect}
                            valueDescription={this.state.destinationPlant}
                            mendatory={true}
                            className="multiselect-with-border"
                            disabled={isEditFlag ? true : false}
                          />
                        </Col>
                      }
                      <Col md="3">
                        <Field
                          name="UnitOfMeasurementId"
                          type="text"
                          label="UOM"
                          component={searchableSelect}
                          placeholder={isViewMode || (isEditFlag && isOperationAssociated) ? '-' : "Select"}
                          options={this.renderListing("UOM")}
                          //onKeyUp={(e) => this.changeItemDesc(e)}
                          validate={this.state.UOM == null || this.state.UOM.length === 0 ? [required] : []}
                          required={true}
                          handleChangeDescription={this.handleUOM}
                          valueDescription={this.state.UOM}
                          disabled={isViewMode || (isEditFlag && isOperationAssociated)}
                        />
                      </Col>
                      <Col md="3">
                        <Field
                          label={`Rate (INR)`}
                          name={"Rate"}
                          type="text"
                          placeholder={isViewMode || (isEditFlag && isOperationAssociated) ? '-' : "Select"}
                          validate={[required, positiveAndDecimalNumber, maxLength10, decimalLengthsix]}
                          component={renderNumberInputField}
                          required={true}
                          disabled={isViewMode || (isEditFlag && isOperationAssociated)}
                          onChange={this.handleRateChange}
                          className=" "
                          customClassName=" withBorder"
                        />
                      </Col>
                      {initialConfiguration && initialConfiguration.IsOperationLabourRateConfigure && <Col md="3">
                        <Field
                          label={`Labour Rate/${this.state.UOM.label ? this.state.UOM.label : 'UOM'}`}
                          name={"LabourRatePerUOM"}
                          type="text"
                          placeholder={isViewMode ? '-' : "Select"}
                          validate={[positiveAndDecimalNumber, maxLength10]}
                          component={renderNumberInputField}
                          disabled={isEditFlag ? true : false}
                          className=" "
                          customClassName=" withBorder"
                        />
                      </Col>}
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
                              //e.preventDefault()
                            }}
                            component={renderDatePicker}
                            className=" "
                            disabled={isViewMode || !this.state.IsFinancialDataChanged}
                            customClassName=" withBorder"
                            placeholder={isViewMode || !this.state.IsFinancialDataChanged ? '-' : "Select Date"}
                          />
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col md="4" className="mb-5 pb-1 st-operation">
                        <label
                          className={`custom-checkbox ${this.state.isEditFlag ? "disabled" : ""
                            }`}
                          onChange={this.onPressSurfaceTreatment}
                        >
                          Surface Treatment Operation
                          <input
                            type="checkbox"
                            checked={this.state.isSurfaceTreatment}
                            disabled={isEditFlag ? true : false}
                          />
                          <span
                            className=" before-box"
                            checked={this.state.isSurfaceTreatment}
                            onChange={this.onPressSurfaceTreatment}
                          />
                        </label>
                      </Col>
                      {/* {this.state.isSurfaceTreatment &&
                          <Col md='3'>
                              <Field
                                  label={`Surface Treatment Charges`}
                                  name={"SurfaceTreatmentCharges"}
                                  type="text"
                                  placeholder={'Enter'}
                                  validate={[required]}
                                  component={renderNumberInputField}
                                  //onChange={this.handleBasicRate}
                                  required={true}
                                  disabled={isEditFlag ? true : false}
                                  className=" "
                                  customClassName=" withBorder"
                              />
                          </Col>} */}
                    </Row>

                    <Row>
                      <Col md="12">
                        <div className="left-border">
                          {'Remarks & Attachments:'}
                        </div>
                      </Col>
                      <Col md="6">
                        <Field
                          label={'Remarks'}
                          name={`Remark`}
                          placeholder={isViewMode ? '-' : "Type here..."}
                          value={this.state.remarks}
                          className=""
                          customClassName=" textAreaWithBorder"
                          onChange={this.handleMessageChange}
                          validate={[maxLength512]}
                          //required={true}
                          component={renderTextAreaField}
                          disabled={isViewMode}
                          maxLength="512"
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
                            getUploadParams={this.getUploadParams}
                            onChangeStatus={this.handleChangeStatus}
                            PreviewComponent={this.Preview}
                            //onSubmit={this.handleSubmit}
                            accept="*"
                            initialFiles={this.state.initialFiles}
                            disabled={isViewMode}
                            maxFiles={3}
                            maxSizeBytes={2000000}
                            inputContent={(files, extra) => (extra.reject ? 'Image, audio and video files only' : (<div className="text-center">
                              <i className="text-primary fa fa-cloud-upload"></i>
                              <span className="d-block">
                                Drag and Drop or{" "}
                                <span className="text-primary">
                                  Browse
                                </span>
                                <br />
                                file to upload
                              </span>
                            </div>))}
                            styles={{
                              dropzoneReject: { borderColor: 'red', backgroundColor: '#DAA' },
                              inputLabel: (files, extra) => (extra.reject ? { color: 'red' } : {}),
                            }}
                            classNames="draper-drop"
                          />
                        </div>
                      </Col>
                      <Col md="3">
                        <div className={'attachment-wrapper'}>
                          {this.state.attachmentLoader && <LoaderCustom customClass="attachment-loader" />}
                          {
                            this.state.files && this.state.files.map(f => {
                              const withOutTild = f.FileURL.replace('~', '')
                              const fileURL = `${FILE_URL}${withOutTild}`;
                              return (
                                <div className={'attachment images'}>
                                  <a href={fileURL} target="_blank">{f.OriginalFileName}</a>
                                  {/* <a href={fileURL} target="_blank" download={f.FileName}>
                                                                        <img src={fileURL} alt={f.OriginalFileName} width="104" height="142" />
                                                                    </a> */}
                                  {/* <div className={'image-viwer'} onClick={() => this.viewImage(fileURL)}>
                                                                        <img src={fileURL} height={50} width={100} />
                                                                    </div> */}
                                  {!isViewMode &&
                                    <img
                                      alt={""}
                                      className="float-right"
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
                        onClick={() => { this.cancel('Cancel') }}
                        disabled={setDisable}
                      >
                        <div className={"cancel-icon"}></div>
                        {"Cancel"}
                      </button>
                      {
                        (CheckApprovalApplicableMaster(OPERATIONS_ID) === true && !this.state.isFinalApprovar) ?
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
              masterId={OPERATIONS_ID}
              type={'Sender'}
              anchor={"right"}
              approvalObj={this.state.approvalObj}
              isBulkUpload={false}
              IsImportEntery={false}
            />
          )
        }
        {
          this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} disablePopup={disablePopup} />
        }
      </div>
    );
  }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps(state) {
  const { comman, otherOperation, supplier, auth, costing } = state;
  const filedObj = selector(state, 'OperationCode', 'text');
  const { plantSelectList, filterPlantList, UOMSelectList, } = comman;
  const { operationData } = otherOperation;
  const { vendorWithVendorCodeSelectList } = supplier;
  const { initialConfiguration } = auth;
  const { costingSpecifiTechnology } = costing

  let initialValues = {};
  if (operationData && operationData !== undefined) {
    initialValues = {
      OperationName: operationData.OperationName,
      OperationCode: operationData.OperationCode,
      Description: operationData.Description,
      Rate: operationData.Rate,
      LabourRatePerUOM: operationData.LabourRatePerUOM,
      Remark: operationData.Remark,
    }
  }

  return {
    plantSelectList, UOMSelectList,
    operationData, filterPlantList, vendorWithVendorCodeSelectList, filedObj,
    initialValues, initialConfiguration, costingSpecifiTechnology
  }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
  getPlantSelectListByType,
  getVendorWithVendorCodeSelectList,
  getPlantBySupplier,
  getUOMSelectList,
  createOperationsAPI,
  updateOperationAPI,
  getOperationDataAPI,
  fileUploadOperation,
  fileDeleteOperation,
  masterFinalLevelUser,
  checkAndGetOperationCode,
  getCostingSpecificTechnology
})(reduxForm({
  form: 'AddOperation',
  touchOnChange: true,
  onSubmitFail: (errors) => {
    focusOnError(errors)
  },
  enableReinitialize: true,
})(AddOperation));

