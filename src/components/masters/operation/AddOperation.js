import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { required, getVendorCode, maxLength80, checkWhiteSpaces, acceptAllExceptSingleSpecialCharacter, maxLength10, positiveAndDecimalNumber, maxLength512, decimalLengthsix } from "../../../helper/validation";
import { renderText, renderMultiSelectField, searchableSelect, renderTextAreaField, renderDatePicker } from "../../layout/FormInputs";
import { getVendorWithVendorCodeSelectList } from '../actions/Supplier';
import { createOperationsAPI, getOperationDataAPI, updateOperationAPI, fileUploadOperation, fileDeleteOperation, checkAndGetOperationCode } from '../actions/OtherOperation';
import { getTechnologySelectList, getPlantSelectListByType, getPlantBySupplier, getUOMSelectList, } from '../../../actions/Common';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { getConfigurationKey, loggedInUserId, userDetails } from "../../../helper/auth";
import Switch from "react-switch";
import AddVendorDrawer from '../supplier-master/AddVendorDrawer';
import AddUOM from '../uom-master/AddUOM';
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css';
import { FILE_URL, ZBC } from '../../../config/constants';
import { AcceptableOperationUOM } from '../../../config/masterData'
import DayTime from '../../common/DayTimeWrapper'
import imgRedcross from '../../../assests/images/red-cross.png';
import MasterSendForApproval from '../MasterSendForApproval'
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { debounce } from 'lodash';
import AsyncSelect from 'react-select/async';
import LoaderCustom from '../../common/LoaderCustom';
import { CheckApprovalApplicableMaster } from '../../../helper';

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
      selectedVendorPlants: [],
      UOM: [],

      isSurfaceTreatment: false,
      remarks: '',
      files: [],
      isVisible: false,
      imageURL: '',
      isFinalApprovar: false,
      approveDrawer: false,
      approvalObj: {},
      isViewMode: this.props?.data?.isViewMode ? true : false,

      isEditFlag: false,
      isShowForm: false,
      isOpenVendor: false,
      isOpenUOM: false,
      OperationId: '',
      effectiveDate: '',
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
    }
  }

  /**
  * @method componentWillMount
  * @description called before render the component
  */
  UNSAFE_componentWillMount() {
    this.props.getUOMSelectList(() => { })
  }

  /**
   * @method componentDidMount
   * @description called after render the component
   */
  componentDidMount() {

    this.props.getTechnologySelectList(() => { })
    this.props.getPlantSelectListByType(ZBC, () => { })

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
    const { technologySelectList, plantSelectList, vendorWithVendorCodeSelectList, filterPlantList,
      UOMSelectList, } = this.props;
    const temp = [];
    if (label === 'technology') {
      technologySelectList && technologySelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ Text: item.Text, Value: item.Value })
        return null;
      });
      return temp;
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
      vendorWithVendorCodeSelectList && vendorWithVendorCodeSelectList.map(item => {
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
      this.setState({ vendorName: newValue, isVendorNameNotSelected: false, selectedVendorPlants: [] }, () => {
        const { vendorName } = this.state;
        this.props.getPlantBySupplier(vendorName.value, () => { })
      });
    } else {
      this.setState({ vendorName: [], selectedVendorPlants: [], })
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

<<<<<<< HEAD
=======

  closeApprovalDrawer = (e = '', type) => {
    this.setState({ approveDrawer: false })
    if (type === 'submit') {
      this.cancel()
    }
  }

>>>>>>> 570c25545 (operation approval work undergoing)
  /**
  * @method handleVendorPlant
  * @description called
  */
  handleVendorPlant = (e) => {
    this.setState({ selectedVendorPlants: e })
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
    })

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
      this.props.getOperationDataAPI(data.ID, (res) => {
        if (res && res.data && res.data.Data) {
          let Data = res.data.Data;

          this.props.change('EffectiveDate', DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '')

          let plantArray = [];
          Data && Data.Plant.map((item) => {
            plantArray.push({ Text: item.PlantName, Value: item.PlantId })
            return plantArray;
          })

          let technologyArray = [];
          Data && Data.Technology.map((item) => {
            technologyArray.push({ Text: item.Technology, Value: item.TechnologyId })
            return technologyArray;
          })

          let vendorPlantArray = [];
          Data && Data.VendorPlant.map((item) => {
            vendorPlantArray.push({ Text: item.PlantName, Value: item.PlantId })
            return vendorPlantArray;
          })

          setTimeout(() => {
            const { vendorWithVendorCodeSelectList, UOMSelectList, plantSelectList } = this.props;

            const vendorObj = vendorWithVendorCodeSelectList && vendorWithVendorCodeSelectList.find(item => item.Value === Data.VendorId)
            const UOMObj = UOMSelectList && UOMSelectList.find(item => item.Value === Data.UnitOfMeasurementId)
            const destinationPlantObj = plantSelectList && plantSelectList.find((item) => item.Value === Data.DestinationPlantId)

            this.setState({
              isEditFlag: true,
              isLoader: false,
              IsVendor: Data.IsVendor,
              selectedTechnology: technologyArray,
              selectedPlants: plantArray,
              vendorName: vendorObj && vendorObj !== undefined ? { label: vendorObj.Text, value: vendorObj.Value } : [],
              selectedVendorPlants: vendorPlantArray,
              UOM: UOMObj && UOMObj !== undefined ? { label: UOMObj.Display, value: UOMObj.Value } : [],
              isSurfaceTreatment: Data.IsSurfaceTreatmentOperation,
              remarks: Data.Remark,
              files: Data.Attachements,
              // effectiveDate: moment(Data.EffectiveDate).isValid ? moment(Data.EffectiveDate)._d : '',
              destinationPlant: destinationPlantObj !== undefined ? { label: destinationPlantObj.Text, value: destinationPlantObj.Value } : [],
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
    return { url: 'https://httpbin.org/post', }

  }

  /**
  * @method setDisableFalseFunction
  * @description setDisableFalseFunction
  */
  setDisableFalseFunction = () => {
    const loop = Number(this.dropzone.current.files.length) - Number(this.state.files.length)
    if (Number(loop) === 1) {
      this.setState({ setDisable: false })
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
  cancel = () => {
    const { reset } = this.props;
    this.props.getPlantBySupplier('', () => { })
    reset();
    this.setState({
      selectedTechnology: [],
      selectedPlants: [],
      vendorName: [],
      selectedVendorPlants: [],
      UOM: [],
      isSurfaceTreatment: false,
      isShowForm: false,
      isEditFlag: false,
    })
    this.props.getOperationDataAPI('', () => { })
    this.props.hideForm()
  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = debounce((values) => {
    const { IsVendor, selectedVendorPlants, selectedPlants, vendorName, files,
      UOM, isSurfaceTreatment, selectedTechnology, remarks, OperationId, effectiveDate, destinationPlant, dataToChange } = this.state;
    const { initialConfiguration } = this.props;
    const userDetail = userDetails()

    if (vendorName.length <= 0) {
      this.setState({ isVendorNameNotSelected: true, setDisable: false })      // IF VENDOR NAME IS NOT SELECTED THEN WE WILL SHOW THE ERROR MESSAGE MANUALLY AND SAVE BUTTON WILL NOT BE DISABLED
      return false
    }
    this.setState({ isVendorNameNotSelected: false })

    let technologyArray = [];
    selectedTechnology && selectedTechnology.map((item) => {
      technologyArray.push({ Technology: item.Text, TechnologyId: item.Value })
      return technologyArray;
    })

    let plantArray = [];
    selectedPlants && selectedPlants.map((item) => {
      plantArray.push({ PlantName: item.Text, PlantId: item.Value, PlantCode: '' })
      return plantArray;
    })

    let vendorPlants = [];
    selectedVendorPlants && selectedVendorPlants.map((item) => {
      vendorPlants.push({ PlantName: item.Text, PlantId: item.Value, PlantCode: '' })
      return vendorPlants;
    })

    /** Update existing detail of supplier master **/
    if (this.state.isEditFlag) {
      let updatedFiles = files.map((file) => {
        return { ...file, ContextId: OperationId }
      })
      let updateData = {
        OperationId: OperationId,
        UnitOfMeasurementId: UOM.value,
        Rate: values.Rate,
        Technology: technologyArray,
        Remark: remarks,
        Attachements: updatedFiles,
        LoggedInUserId: loggedInUserId(),
        IsForcefulUpdated: true
      }
      if (this.state.isEditFlag) {
        if (dataToChange.UnitOfMeasurementId === UOM.value && dataToChange.Rate === Number(values.Rate)) {
          this.cancel()
          return false
        }
        this.setState({ showPopup: true, updatedObj: updateData })
      }
      this.setState({ setDisable: true })

    } else {/** Add new detail for creating operation master **/

      this.setState({ setDisable: true })
      let formData = {
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
        Plant: !IsVendor ? plantArray : [],
        VendorPlant: initialConfiguration.IsVendorPlantConfigurable ? (IsVendor ? vendorPlants : []) : [],
        Attachements: files,
        LoggedInUserId: loggedInUserId(),
        EffectiveDate: DayTime(effectiveDate).format('YYYY/MM/DD HH:mm:ss'),
        DestinationPlantId: getConfigurationKey().IsDestinationPlantConfigure ? destinationPlant.value : '00000000-0000-0000-0000-000000000000'
      }



      if (CheckApprovalApplicableMaster(OPERATIONS_ID) === true && !this.state.isFinalApprovar) {
        this.setState({ approveDrawer: true, approvalObj: formData })
      } else {
        this.props.reset()
        this.props.createOperationsAPI(formData, (res) => {
          if (res.data.Result) {
            Toaster.success(MESSAGES.OPERATION_ADD_SUCCESS);
            //this.clearForm()
            this.cancel()
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
    const { handleSubmit, initialConfiguration } = this.props;
    const { isEditFlag, isOpenVendor, isOpenUOM, isDisableCode, isViewMode, setDisable, disablePopup } = this.state;
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
      <div className="container-fluid">
        {/* {isLoader && <Loader />} */}
        <div className="login-container signup-form">
          <div className="row">
            <div className="col-md-12">
              <div className="shadow-lgg login-formg">
                <div className="row">
                  <div className="col-md-6">
                    <h2>
                      {this.state.isEditFlag
                        ? "Update Operation"
                        : "Operation"}
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
                          label="Technology"
                          name="technology"
                          placeholder="Select"
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
                          placeholder={"Enter"}
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
                          placeholder={"Enter"}
                          validate={[acceptAllExceptSingleSpecialCharacter, maxLength10, checkWhiteSpaces, required]}
                          component={renderText}
                          required={true}
                          onBlur={this.checkUniqCode}
                          disabled={(isEditFlag || isDisableCode) ? true : false}
                          className=" "
                          customClassName=" withBorder"
                        />
                      </Col>
                      <Col md="3">
                        <Field
                          label={`Description`}
                          name={"Description"}
                          type="text"
                          placeholder={"Enter"}
                          validate={[acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength80]}
                          component={renderText}
                          disabled={isEditFlag ? true : false}
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
                            placeholder="Select"
                            selection={this.state.selectedPlants == null || this.state.selectedPlants.length === 0 ? [] : this.state.selectedPlants}
                            options={this.renderListing("plant")}
                            selectionChanged={this.handlePlants}
                            optionValue={(option) => option.Value}
                            optionLabel={(option) => option.Text}
                            component={renderMultiSelectField}
                            validate={this.state.selectedPlants == null || this.state.selectedPlants.length === 0 ? [required] : []}
                            mendatory={true}   
                            className="multiselect-with-border"
                            disabled={isEditFlag ? true : false}
                          />
                        </Col>
                      )}
                      {this.state.IsVendor && (
<<<<<<< HEAD
                       <Col md="3"><label>{"Vendor Name"}<span className="asterisk-required">*</span></label>
                        {this.state.inputLoader  && <LoaderCustom customClass={`input-loader vendor-input `}/>}
                        <div className="d-flex justify-space-between align-items-center inputwith-icon async-select">
                           <div className="fullinput-icon">
                        <AsyncSelect 
                        name="vendorName" 
                        ref={this.myRef} 
                        key={this.state.updateAsyncDropdown} 
                        loadOptions={promiseOptions} 
                        onChange={(e) => this.handleVendorName(e)} 
                        value={this.state.vendorName} 
                        noOptionsMessage={({inputValue}) => !inputValue ? "Please enter vendor name/code" : "No results found"}
                        isDisabled={isEditFlag ? true : false} />
                        {this.state.isVendorNameNotSelected && <div className='text-help'>This field is required.</div>}
                        </div>
                           {!isEditFlag && (
                                <div
                                  onClick={this.vendorToggler}
                                  className={"plus-icon-square  right"}
                                ></div>
                              )}
                           </div>
                       </Col>
=======
                        <Col md="3"><label>{"Vendor Name"}<span className="asterisk-required">*</span></label>
                          {this.state.inputLoader && <LoaderCustom customClass={`input-loader vendor-input `} />}
                          <AsyncSelect
                            name="vendorName"
                            ref={this.myRef}
                            key={this.state.updateAsyncDropdown}
                            loadOptions={promiseOptions}
                            onChange={(e) => this.handleVendorName(e)}
                            value={this.state.vendorName}
                            noOptionsMessage={({ inputValue }) => !inputValue ? "Please enter vendor name/code" : "No results found"}
                            isDisabled={isEditFlag ? true : false} />
                          {this.state.isVendorNameNotSelected && <div className='text-help'>This field is required.</div>}

                        </Col>
>>>>>>> 570c25545 (operation approval work undergoing)

                      )}
                      {initialConfiguration && initialConfiguration.IsVendorPlantConfigurable && this.state.IsVendor && (
                        <Col md="3">
                          <Field
                            label="Vendor Plant"
                            name="VendorPlant"
                            placeholder="Select"
                            selection={this.state.selectedVendorPlants == null || this.state.selectedVendorPlants.length === 0 ? [] : this.state.selectedVendorPlants}
                            options={this.renderListing("VendorPlant")}
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

                      {
                        this.state.IsVendor && getConfigurationKey().IsDestinationPlantConfigure &&
                        <Col md="3">
                          <Field
                            label={'Destination Plant'}
                            name="DestinationPlant"
                            placeholder={"Select"}
                            options={this.renderListing("singlePlant")}
                            handleChangeDescription={this.handleDestinationPlant}
                            validate={this.state.destinationPlant == null || this.state.destinationPlant.length === 0 ? [required] : []}
                            required={true}
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
                          placeholder={"Select"}
                          options={this.renderListing("UOM")}
                          validate={this.state.UOM == null || this.state.UOM.length === 0 ? [required] : []}
                          required={true}
                          handleChangeDescription={this.handleUOM}
                          valueDescription={this.state.UOM}
                          disabled={isViewMode}
                        />
                      </Col>
                      <Col md="3">
                        <Field
                          label={`Rate (INR)`}
                          name={"Rate"}
                          type="text"
                          placeholder={"Enter"}
                          validate={[required, positiveAndDecimalNumber, maxLength10, decimalLengthsix]}
                          component={renderText}
                          required={true}
                          disabled={isViewMode}
                          className=" "
                          customClassName=" withBorder"
                        />
                      </Col>
                      {initialConfiguration && initialConfiguration.IsOperationLabourRateConfigure && <Col md="3">
                        <Field
                          label={`Labour Rate/${this.state.UOM.label ? this.state.UOM.label : 'UOM'}`}
                          name={"LabourRatePerUOM"}
                          type="text"
                          placeholder={"Enter"}
                          validate={[positiveAndDecimalNumber, maxLength10]}
                          component={renderText}
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
                            autoComplete={'off'}
                            required={true}
                            changeHandler={(e) => {
                            }}
                            component={renderDatePicker}
                            className=" "
                            disabled={isEditFlag ? true : false}
                            customClassName=" withBorder"
                          />
                        </div>
                      </Col>

                    </Row>

                    <Row>
                      <Col md="4" className="mb-5 pb-1">
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
                          placeholder="Type here..."
                          value={this.state.remarks}
                          className=""
                          customClassName=" textAreaWithBorder"
                          onChange={this.handleMessageChange}
                          validate={[maxLength512]}
                          disabled={isViewMode}
                          component={renderTextAreaField}
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
                            disabled={isViewMode}
                            accept="*"
                            initialFiles={this.state.initialFiles}
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
                          {
                            this.state.files && this.state.files.map(f => {
                              const withOutTild = f.FileURL.replace('~', '')
                              const fileURL = `${FILE_URL}${withOutTild}`;
                              return (
                                <div className={'attachment images'}>
                                  <a href={fileURL} target="_blank" rel="noreferrer">{f.OriginalFileName}</a>


                                  {!isViewMode && <img
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
                        onClick={this.cancel}
                        disabled={setDisable}
                      >
                        <div className={"cancel-icon"}></div>
                        {"Cancel"}
                      </button>
                      {
                        (CheckApprovalApplicableMaster(OPERATIONS_ID) === true && !this.state.isFinalApprovar) ?
                          <button type="submit"
                            class="user-btn approval-btn save-btn mr5"
                            disabled={this.state.isFinalApprovar}
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
              // masterId={OPERATIONS_ID}
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
  const { comman, otherOperation, supplier, auth, } = state;
  const filedObj = selector(state, 'OperationCode');
  const { technologySelectList, plantSelectList, filterPlantList, UOMSelectList, } = comman;
  const { operationData } = otherOperation;
  const { vendorWithVendorCodeSelectList } = supplier;
  const { initialConfiguration } = auth;

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
    technologySelectList, plantSelectList, UOMSelectList,
    operationData, filterPlantList, vendorWithVendorCodeSelectList, filedObj,
    initialValues, initialConfiguration,
  }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
  getTechnologySelectList,
  getPlantSelectListByType,
  getVendorWithVendorCodeSelectList,
  getPlantBySupplier,
  getUOMSelectList,
  createOperationsAPI,
  updateOperationAPI,
  getOperationDataAPI,
  fileUploadOperation,
  fileDeleteOperation,
  checkAndGetOperationCode,
})(reduxForm({
  form: 'AddOperation',
  enableReinitialize: true,
})(AddOperation));

