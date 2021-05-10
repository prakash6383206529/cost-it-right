import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { required, getVendorCode, alphaNumeric, maxLength80, checkWhiteSpaces, acceptAllExceptSingleSpecialCharacter, maxLength10, positiveAndDecimalNumber, maxLength512, decimalLengthsix } from "../../../helper/validation";
import {
  renderText, renderMultiSelectField, searchableSelect, renderTextAreaField, renderDatePicker
} from "../../layout/FormInputs";
import { getVendorWithVendorCodeSelectList } from '../actions/Supplier';
import {
  createOperationsAPI, getOperationDataAPI,
  updateOperationAPI, fileUploadOperation, fileDeleteOperation, checkAndGetOperationCode
} from '../actions/OtherOperation';
import {
  getTechnologySelectList, getPlantSelectListByType, getPlantBySupplier,
  getUOMSelectList,
} from '../../../actions/Common';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import { getConfigurationKey, loggedInUserId, userDetails } from "../../../helper/auth";
import Switch from "react-switch";
import $ from 'jquery';
import AddVendorDrawer from '../supplier-master/AddVendorDrawer';
import AddUOM from '../uom-master/AddUOM';
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css';
import { FILE_URL, ZBC } from '../../../config/constants';
import { AcceptableOperationUOM } from '../../../config/masterData'
import moment from 'moment';
const selector = formValueSelector('AddOperation');

class AddOperation extends Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    this.state = {
      IsVendor: false,
      selectedTechnology: [],
      selectedPlants: [],

      vendorName: [],
      selectedVendorPlants: [],
      UOM: [],

      isSurfaceTreatment: false,
      remarks: '',
      files: [],
      isVisible: false,
      imageURL: '',

      isEditFlag: false,
      isShowForm: false,
      isOpenVendor: false,
      isOpenUOM: false,
      OperationId: '',
      effectiveDate: '',
      destinationPlant: [],
      DataToCheck: [],
      DropdownChanged: true
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
    const { data, initialConfiguration } = this.props;

    this.props.getTechnologySelectList(() => { })
    this.props.getPlantSelectListByType(ZBC, () => { })
    this.props.getVendorWithVendorCodeSelectList()
    this.getDetail()
    if (initialConfiguration && initialConfiguration.IsOperationCodeConfigure && data.isEditFlag === false) {
      this.props.checkAndGetOperationCode('', (res) => {
        let Data = res.data.DynamicData;
        this.props.change('OperationCode', Data.OperationCode)
      })
    }

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
      // vendorName: [],
      // selectedVendorPlants: [],
      // vendorLocation: [],
    });
  }

  /**
  * @method handleTechnology
  * @description Used handle technology
  */
  handleTechnology = (e) => {
    this.setState({ selectedTechnology: e })
    this.setState({ DropdownChanged: false })
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
      this.setState({ vendorName: newValue, selectedVendorPlants: [] }, () => {
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
    this.setState({ DropdownChanged: false })
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
      $('html, body').animate({ scrollTop: 0 }, 'slow');
      this.props.getOperationDataAPI(data.ID, (res) => {
        if (res && res.data && res.data.Data) {
          let Data = res.data.Data;
          this.setState({ DataToCheck: Data })
          this.props.change('EffectiveDate', moment(Data.EffectiveDate)._isValid ? moment(Data.EffectiveDate)._d : '')

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
              UOM: UOMObj && UOMObj !== undefined ? { label: UOMObj.Text, value: UOMObj.Value } : [],
              isSurfaceTreatment: Data.IsSurfaceTreatmentOperation,
              remarks: Data.Remark,
              files: Data.Attachements,
              // effectiveDate: moment(Data.EffectiveDate).isValid ? moment(Data.EffectiveDate)._d : '',
              destinationPlant: destinationPlantObj !== undefined ? { label: destinationPlantObj.Text, value: destinationPlantObj.Value } : []
            })
          }, 500)

        }
      })
    }
  }

  checkUniqCode = (e) => {
    this.props.checkAndGetOperationCode(e.target.value, res => {
      if (res && res.data && res.data.Result === false) {
        toastr.warning(res.data.Message);
        $('input[name="OperationCode"]').focus()
      }
    })
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
      this.props.fileUploadOperation(data, (res) => {
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
      this.props.fileDeleteOperation(deleteData, (res) => {
        toastr.success('File has been deleted successfully.')
        let tempArr = this.state.files.filter(item => item.FileId !== FileId)
        this.setState({ files: tempArr })
      })
    }
    if (FileId == null) {
      let tempArr = this.state.files.filter(item => item.FileName !== OriginalFileName)
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
  onSubmit = (values) => {
    const { IsVendor, selectedVendorPlants, selectedPlants, vendorName, files,
      UOM, isSurfaceTreatment, selectedTechnology, remarks, OperationId, effectiveDate, destinationPlant, DataToCheck, DropdownChanged } = this.state;
    const { initialConfiguration } = this.props;
    const userDetail = userDetails()

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
      console.log(values, 'values')
      console.log(DataToCheck, 'DataToCheck')
      if (DataToCheck.Rate == values.Rate && DropdownChanged) {
        this.cancel()
        return false;
      }
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
        const toastrConfirmOptions = {
          onOk: () => {
            this.props.reset()
            this.props.updateOperationAPI(updateData, (res) => {
              if (res.data.Result) {
                toastr.success(MESSAGES.OPERATION_UPDATE_SUCCESS);
                this.cancel()
              }
            });
          },
          onCancel: () => { },
        }
        return toastr.confirm(`${'You have changed SOB percent So your all Pending for Approval costing will get Draft. Do you wish to continue?'}`, toastrConfirmOptions,)
      }


    } else {/** Add new detail for creating operation master **/

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
        EffectiveDate: moment(effectiveDate).local().format('YYYY/MM/DD HH:mm:ss'),
        DestinationPlantId: getConfigurationKey().IsDestinationPlantConfigure ? destinationPlant.value : '00000000-0000-0000-0000-000000000000'
      }
      this.props.reset()
      this.props.createOperationsAPI(formData, (res) => {
        if (res.data.Result) {
          toastr.success(MESSAGES.OPERATION_ADD_SUCCESS);
          this.cancel();
        }
      });
    }

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
    const { isEditFlag, isOpenVendor, isOpenUOM } = this.state;
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
                        : "Add Operation"}
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
                          className="multiselect-with-border"
                        //disabled={(this.state.IsVendor || isEditFlag) ? true : false}
                        />
                      </Col>
                      <Col md="3">
                        <Field
                          label={`Operation Name`}
                          name={"OperationName"}
                          type="text"
                          placeholder={"Enter"}
                          validate={[required, acceptAllExceptSingleSpecialCharacter, maxLength80, checkWhiteSpaces]}
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
                          validate={[acceptAllExceptSingleSpecialCharacter, maxLength10, checkWhiteSpaces]}
                          component={renderText}
                          //required={true}
                          onBlur={this.checkUniqCode}
                          disabled={isEditFlag ? true : false}
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
                          //required={true}
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
                            mendatory={true}
                            className="multiselect-with-border"
                            disabled={isEditFlag ? true : false}
                          />
                        </Col>
                      )}
                      {this.state.IsVendor && (
                        <Col md="3">
                          <div className="d-flex justify-space-between align-items-center inputwith-icon">
                            <div className="fullinput-icon">
                              <Field
                                name="VendorName"
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
                                className={
                                  "plus-icon-square mt-2 right"
                                }
                              ></div>
                            )}
                          </div>

                        </Col>

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
                            // selection={
                            //   this.state.selectedPlants == null || this.state.selectedPlants.length === 0 ? [] : this.state.selectedPlants}
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
                          placeholder={"Select"}
                          options={this.renderListing("UOM")}
                          //onKeyUp={(e) => this.changeItemDesc(e)}
                          validate={this.state.UOM == null || this.state.UOM.length === 0 ? [required] : []}
                          required={true}
                          handleChangeDescription={this.handleUOM}
                          valueDescription={this.state.UOM}
                          disabled={false}
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
                          //onChange={this.handleBasicRate}
                          required={true}
                          disabled={false}
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
                          //onChange={this.handleBasicRate}
                          //required={true}
                          disabled={isEditFlag ? true : false}
                          className=" "
                          customClassName=" withBorder"
                        />
                      </Col>}
                      <Col md="3">
                        <div className="inputbox date-section mb-3">
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
                            className=" "
                            disabled={isEditFlag ? true : false}
                            customClassName=" withBorder"
                          //minDate={moment()}
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
                          placeholder="Type here..."
                          value={this.state.remarks}
                          className=""
                          customClassName=" textAreaWithBorder"
                          onChange={this.handleMessageChange}
                          validate={[maxLength512]}
                          //required={true}
                          component={renderTextAreaField}
                          maxLength="512"
                        />
                      </Col>
                      <Col md="3">
                        <label>Upload Files (upload up to 3 files)</label>
                        {this.state.files.length >= 3 ? (
                          <div class="alert alert-danger" role="alert">
                            Maximum file upload limit has been reached.
                          </div>
                        ) :
                          < Dropzone
                            getUploadParams={this.getUploadParams}
                            onChangeStatus={this.handleChangeStatus}
                            PreviewComponent={this.Preview}
                            //onSubmit={this.handleSubmit}
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
                          />}
                      </Col>
                      <Col md="3">
                        <div className={'attachment-wrapper'}>
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

                                  <img
                                    alt={""}
                                    className="float-right"
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
                          />{" "}
                        </div>
                        {isEditFlag ? "Update" : "Save"}
                      </button>
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

