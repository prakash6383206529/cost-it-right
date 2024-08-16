import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, clearFields } from "redux-form";
import { Row, Col } from 'reactstrap';
import { required, checkWhiteSpaces, alphaNumeric, acceptAllExceptSingleSpecialCharacter, maxLength20, maxLength80, maxLength85, maxLength512, checkSpacesInString, minLength3 } from "../../../helper/validation";
import { getConfigurationKey, loggedInUserId } from "../../../helper/auth";
import { focusOnError, renderDatePicker, renderMultiSelectField, renderText, renderTextAreaField, searchableSelect } from "../../layout/FormInputs";
import { createPart, updatePart, getPartData, fileUploadPart, getProductGroupSelectList, getPartDescription } from '../actions/Part';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css'
import DayTime from '../../common/DayTimeWrapper'
import "react-datepicker/dist/react-datepicker.css";
import { FILE_URL, GUIDE_BUTTON_SHOW } from '../../../config/constants';
import LoaderCustom from '../../common/LoaderCustom';
import imgRedcross from "../../../assests/images/red-cross.png";
import _, { debounce } from 'lodash';
import { showDataOnHover } from '../../../helper';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { getCostingSpecificTechnology } from '../../costing/actions/Costing'
import { ASSEMBLY, LOGISTICS } from '../../../config/masterData';
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from './TourMessages';
import { withTranslation } from 'react-i18next';

class AddIndivisualPart extends Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    // ********* INITIALIZE REF FOR DROPZONE ********
    this.dropzone = React.createRef();
    this.state = {
      isEditFlag: false,
      isLoader: false,
      PartId: '',
      isViewMode: this.props?.data?.isViewMode ? true : false,
      IsTechnologyUpdateRequired: false,
      selectedPlants: [],
      effectiveDate: '',
      ProductGroup: [],
      oldProductGroup: [],
      TechnologySelected: [],
      files: [],
      DataToCheck: [],
      DropdownChanged: true,
      uploadAttachements: true,
      updatedObj: {},
      setDisable: false,
      isBomEditable: false,
      minEffectiveDate: '',
      disablePartName: false,
      attachmentLoader: false,
      showPopup: false
    }
  }

  /**
  * @method componentDidMount
  * @description 
  */
  componentDidMount() {
    if (!this.state.isViewMode) {
      this.props.getProductGroupSelectList(() => { })
      this.props.getCostingSpecificTechnology(loggedInUserId(), () => { })
    }
    this.getDetails()
  }

  /**
  * @method getDetails
  * @description 
  */
  getDetails = () => {
    const { data } = this.props;
    if (data && data.isEditFlag) {
      this.setState({
        isEditFlag: false,
        isLoader: true,
        PartId: data?.Id,
      })
      this.props.getPartData(data.Id, res => {
        if (res && res?.data && res?.data?.Result) {
          const Data = res.data.Data;
          let productArray = []
          Data && Data.GroupCodeList.map((item) => {
            productArray.push({ Text: item.GroupCode, Value: item.ProductId })
            return productArray
          })
          this.setState({ DataToCheck: Data })
          this.props.change("EffectiveDate", DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '')
          this.props.change("SAPCode", Data.SAPCode ?? '')
          this.setState({ minEffectiveDate: Data.LatestEffectiveDate })

          setTimeout(() => {
            this.setState({
              isEditFlag: true,
              effectiveDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '',
              files: Data.Attachements,
              ProductGroup: productArray,
              oldProductGroup: productArray,
              isBomEditable: Data.IsBOMEditable,
              TechnologySelected: ({ label: Data.TechnologyName, value: Data.TechnologyIdRef }),
              IsTechnologyUpdateRequired: Data.IsTechnologyUpdateRequired
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
    } else {
      this.setState({
        isLoader: false,
      })
      this.props.getPartData('', res => { })
    }
  }


  onPartNoChange = debounce((e) => {

    if (!this.state.isEditFlag) {
      this.props.getPartDescription(e?.target?.value, 2, (res) => {
        if (res?.data?.Data) {
          let finalData = res.data.Data
          this.props.change("Description", finalData.Description)
          this.props.change("PartName", finalData.PartName)
          this.setState({ disablePartName: true, minEffectiveDate: finalData.EffectiveDate, TechnologySelected: { label: finalData.Technology, value: finalData.TechnologyId } })
        } else {
          this.props.change("Description", "")
          this.props.dispatch(clearFields('AddIndivisualPart', false, false, 'PartName'));
          this.setState({ disablePartName: false, minEffectiveDate: "", TechnologySelected: [] })
        }
      })
    }
  }, 600)

  /**
  * @method handlePlant
  * @description Used handle plants
  */
  handlePlant = (e) => {
    this.setState({ selectedPlants: e })
  }


  handleProductGroup = (e) => {
    this.setState({ ProductGroup: e })
  }

  /**
  * @method handleChange
  * @description Handle Effective Date
  */
  handleEffectiveDateChange = (date) => {
    this.setState({ effectiveDate: DayTime(date).isValid() ? DayTime(date) : '', });
    this.setState({ DropdownChanged: false })
  };

  /**
  * @method renderListing
  * @description Used show listing of unit of measurement
  */
  renderListing = (label) => {
    const { plantSelectList, productGroupSelectList, costingSpecifiTechnology } = this.props;
    const temp = [];
    if (label === 'plant') {
      plantSelectList && plantSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ Text: item.Text, Value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'ProductGroup') {
      productGroupSelectList && productGroupSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ Text: item.Text, Value: item.Value })
        return null;
      })
      return temp;
    }

    if (label === 'technology') {
      costingSpecifiTechnology &&
        costingSpecifiTechnology.map((item) => {
          if (item.Value === '0' || Number(item.Value) === Number(ASSEMBLY) || item.Value === String(LOGISTICS)) return false
          temp.push({ label: item.Text, value: item.Value })
          return null
        })
      return temp
    }

  }

  handleTechnologyChange = (event) => {
    this.setState({ DropdownChanged: true, TechnologySelected: event, })
  }

  /**
  * @method setDisableFalseFunction
  * @description setDisableFalseFunction
  */
  setDisableFalseFunction = () => {
    const loop = Number(this.dropzone.current.files.length) - Number(this.state.files.length)
    if (Number(loop) === 1 || Number(this.dropzone.current.files.length) === Number(this.state.files.length)) {
      this.setState({ setDisable: false, attachmentLoader: false })
    }
  }

  // called every time a file's `status` changes
  handleChangeStatus = ({ meta, file }, status) => {
    const { files, } = this.state;

    this.setState({ uploadAttachements: false, setDisable: true, attachmentLoader: true })

    if (status === 'removed') {
      const removedFileName = file.name;
      let tempArr = files.filter(item => item.OriginalFileName !== removedFileName)
      this.setState({ files: tempArr })
    }

    if (status === 'done') {
      let data = new FormData()
      data.append('file', file)
      this.props.fileUploadPart(data, (res) => {
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
      <span style={{ alignSelf: 'flex-start', margin: '10px 3%', fontFamily: 'Helvetica' }}>
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
      RawMaterial: [],
      selectedPlants: [],
    })
    // this.props.getPartData('', res => { })
    this.props.hideForm(type)
  }
  cancelHandler = () => {
    if (this.state.isViewMode) {
      this.cancel('cancel')
    } else {
      this.setState({ showPopup: true })
    }
  }
  onPopupConfirm = () => {
    this.cancel('cancel')
    this.setState({ showPopup: false })
  }
  closePopUp = () => {
    this.setState({ showPopup: false })
  }
  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = debounce((values) => {
    const { PartId, effectiveDate, isEditFlag, files, DataToCheck, DropdownChanged, ProductGroup, oldProductGroup, uploadAttachements } = this.state;
    const { initialConfiguration } = this.props;
    let isStructureChanges
    let productArray = (initialConfiguration?.IsProductMasterConfigurable) ? ProductGroup && ProductGroup.map((item) => ({ GroupCode: item.Text, ProductId: item.Value })) : [{ GroupCode: values.GroupCode }]

    if (isEditFlag) {
      let isGroupCodeChange
      if (!this.state.isBomEditable) {
        if (this.props.initialConfiguration?.IsProductMasterConfigurable) {
          let isEqualValue = _.isEqual(this.state.DataToCheck.GroupCodeList, productArray)
          isGroupCodeChange = isEqualValue ? false : true
        } else {
          let isEqualValue = String(this.state.DataToCheck.GroupCode) === String(values.GroupCode)
          isGroupCodeChange = isEqualValue ? false : true
        }
      }
      //THIS CONDITION TO CHECK IF ALL VALUES ARE SAME (IF YES, THEN NO NEED TO CALL UPDATE API JUST SEND IT TO LISTING PAGE)
      if (DropdownChanged && String(DataToCheck.PartName) === String(values.PartName) && String(DataToCheck.Description) === String(values.Description) &&
        String(DataToCheck.ECNNumber) === String(values.ECNNumber) && JSON.stringify(DataToCheck.GroupCodeList) === JSON.stringify(productArray) &&
        String(DataToCheck.RevisionNumber) === String(values.RevisionNumber) && String(DataToCheck.DrawingNumber) === String(values.DrawingNumber)
        && String(DataToCheck.Remark) === String(values.Remark) && (initialConfiguration?.IsSAPCodeRequired ? String(DataToCheck.SAPCode) === String(values.SAPCode) : true) && !isGroupCodeChange && uploadAttachements && JSON.stringify(DataToCheck.Attachements) === JSON.stringify(files)) {
        this.cancel('cancel')
        return false;
      }

      //THIS CONDITION IS TO CHECK IF IsBomEditable KEY FROM API IS FALSE AND THERE IS CHANGE ON ONLY PART DESCRIPTION ,PART NAME AND ATTACHMENT(TO UPDATE EXISTING RECORD)
      if (this.state.isBomEditable === false && !isGroupCodeChange && String(DataToCheck.ECNNumber) === String(values.ECNNumber) &&
        String(DataToCheck.RevisionNumber) === String(values.RevisionNumber) && String(DataToCheck.DrawingNumber) === String(values.DrawingNumber) &&
        String(oldProductGroup) === String(ProductGroup)) {
        isStructureChanges = false
      }

      //THIS CONDITION IS TO CHECK IF IsBomEditable KEY FROM API IS FALSE AND TEHRE IS CHANGE IN OTHER FIELD ALSO APART FROM PART DESCRIPTION,NAME AND ATTACHMENT (TO CREATE NEW RECORD)
      else if (this.state.isBomEditable === false && (String(DataToCheck.ECNNumber) !== String(values.ECNNumber) ||
        String(DataToCheck.RevisionNumber) !== String(values.RevisionNumber) || String(DataToCheck.DrawingNumber) !== String(values.DrawingNumber)
      )) {
        // IF THERE ARE CHANGES ,THEN REVISION NO SHOULD BE CHANGED
        if (DayTime(DataToCheck.EffectiveDate).format('YYYY-MM-DD HH:mm:ss') === DayTime(this.state.effectiveDate).format('YYYY-MM-DD HH:mm:ss')) {
          Toaster.warning('Please edit Revision no or ECN no, and Effective date')
          return false
        } else if ((DayTime(DataToCheck.EffectiveDate).format('YYYY-MM-DD HH:mm:ss') !== DayTime(this.state.effectiveDate).format('YYYY-MM-DD HH:mm:ss')) && (String(DataToCheck.RevisionNumber).toLowerCase() === String(values.RevisionNumber).toLowerCase() && String(DataToCheck.ECNNumber).toLowerCase() === String(values.ECNNumber).toLowerCase())) {
          Toaster.warning('Please edit Revision no or ECN no, and Effective date')
          return false
        } else {
          isStructureChanges = true
        }
      }
      // THIS CONDITION IS WHEN IsBomEditable KEY FROM API IS TRUE (WHATEVER USER CHANGE OLD RECORD WILL GET UPDATE)
      else {
        isStructureChanges = false
      }


      this.setState({ setDisable: true })
      let updatedFiles = files.map((file) => {
        return { ...file, ContextId: PartId }
      })
      let updateData = {
        LoggedInUserId: loggedInUserId(),
        PartId: PartId,
        PartName: values.PartName,
        PartNumber: values.PartNumber,
        SAPCode: values.SAPCode,
        Description: values.Description,
        ECNNumber: values.ECNNumber,
        RevisionNumber: values.RevisionNumber,
        DrawingNumber: values.DrawingNumber,
        GroupCode: values.GroupCode,
        Remark: values.Remark,
        EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
        Attachements: updatedFiles,
        IsForcefulUpdated: false,
        GroupCodeList: productArray,
        IsStructureChanges: isStructureChanges,
        TechnologyIdRef: this.state.TechnologySelected.value ? this.state.TechnologySelected.value : "",
        TechnologyName: this.state.TechnologySelected.label ? this.state.TechnologySelected.label : "",
        IsTechnologyUpdateRequired: false,
      }

      this.props.updatePart(updateData, (res) => {
        this.setState({ setDisable: false })
        if (res?.data?.Result) {
          Toaster.success(MESSAGES.UPDATE_PART_SUCESS);
          this.cancel('submit')
        }
      });

    } else {

      this.setState({ setDisable: true, isLoader: true })
      let formData = {
        LoggedInUserId: loggedInUserId(),
        BOMLevel: 0,
        Quantity: 1,
        Remark: values.Remark,
        PartNumber: values.PartNumber,
        PartName: values.PartName,
        SAPCode: values.SAPCode,
        Description: values.Description,
        ECNNumber: values.ECNNumber,
        EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD'),
        RevisionNumber: values.RevisionNumber,
        DrawingNumber: values.DrawingNumber,
        GroupCode: values.GroupCode,
        Attachements: files,
        GroupCodeList: productArray,
        TechnologyIdRef: this.state.TechnologySelected.value ? this.state.TechnologySelected.value : "",
        TechnologyName: this.state.TechnologySelected.label ? this.state.TechnologySelected.label : "",
      }

      this.props.createPart(formData, (res) => {
        this.setState({ setDisable: false, isLoader: false })
        if (res?.data?.Result === true) {
          Toaster.success(MESSAGES.PART_ADD_SUCCESS);
          this.cancel('submit')
        }
      });
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
    const { handleSubmit, initialConfiguration, t } = this.props;
    const { isEditFlag, isViewMode, setDisable } = this.state;

    return (
      <>

        <div className="container-fluid">
          <div>
            {this.state.isLoader && <LoaderCustom />}
            <div className="login-container signup-form">
              <Row>
                <Col md="12">
                  <div className="shadow-lgg login-formg">
                    <Row>
                      <Col md="6">
                        <div className="form-heading mb-0">
                          <h1>
                            {this.state.isViewMode ? "View" : this.state.isEditFlag ? "Update" : "Add"} Component/ Part
                            {!isViewMode && <TourWrapper
                              buttonSpecificProp={{ id: "Add_Indivisual_Part_Form" }}
                              stepsSpecificProp={{
                                steps: Steps(t, { isEditFlag: isEditFlag }).ADD_COMPONENT_PART
                              }} />}
                          </h1>
                        </div>
                      </Col>
                    </Row>
                    <form
                      noValidate
                      className="form"
                      onSubmit={handleSubmit(this.onSubmit.bind(this))}
                      onKeyDown={(e) => { this.handleKeyDown(e, this.onSubmit.bind(this)); }}
                    >
                      <div className="add-min-height">
                        <Row>
                          <Col md="3">
                            <Field
                              label={`Part No.`}
                              name={"PartNumber"}
                              type="text"
                              placeholder={isEditFlag ? '-' : "Enter"}
                              validate={[required, acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength20, checkSpacesInString, minLength3]}
                              component={renderText}
                              required={true}
                              onChange={this.onPartNoChange}
                              className=""
                              customClassName={"withBorder"}
                              disabled={isEditFlag ? true : false}
                            />
                          </Col>
                          <Col md="3">
                            <Field
                              label={`Part Name`}
                              name={"PartName"}
                              type="text"
                              placeholder={isViewMode || (!isEditFlag && this.state.disablePartName) || isEditFlag ? '-' : "Enter"}
                              validate={[required, acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength85]}
                              component={renderText}
                              required={true}
                              className=""
                              customClassName={"withBorder"}
                              disabled={isViewMode || (!isEditFlag && this.state.disablePartName) || isEditFlag}
                            />
                          </Col>

                          <Col md="3">
                            <span>
                              <Field
                                label={`Part Description`}
                                name={"Description"}
                                type="text"
                                placeholder={isViewMode ? '-' : "Enter"}
                                validate={[acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength80, checkSpacesInString]}
                                component={renderText}
                                required={false}
                                className=""
                                customClassName={"withBorder"}
                                disabled={isViewMode}
                              />
                            </span>
                          </Col>
                          {initialConfiguration?.IsProductMasterConfigurable ? (

                            <Col md="3">
                              <Field
                                label="Group Code"
                                name="ProductGroup"
                                type="text"
                                title={showDataOnHover(this.state.ProductGroup)}
                                placeholder={isViewMode ? '-' : "Select"}
                                selection={
                                  this.state.ProductGroup == null || this.state.ProductGroup.length === 0 ? [] : this.state.ProductGroup}
                                options={this.renderListing("ProductGroup")}
                                selectionChanged={this.handleProductGroup}
                                optionValue={(option) => option.Value}
                                optionLabel={(option) => option.Text}
                                component={renderMultiSelectField}
                                className="multiselect-with-border"
                                disabled={isViewMode}
                              // disabled={this.state.IsVendor || isEditFlag ? true : false}
                              />
                            </Col>
                          ) :
                            <Col md="3">
                              <Field
                                label={`Group Code`}
                                name={"GroupCode"}
                                type="text"
                                placeholder={isViewMode ? '-' : "Enter"}
                                validate={[checkWhiteSpaces, alphaNumeric, maxLength20]}
                                component={renderText}
                                required={false}
                                className=""
                                customClassName={"withBorder"}
                                disabled={isViewMode}
                              />
                            </Col>
                          }
                        </Row>

                        <Row>
                          <Col md="3">
                            <Field
                              label={`ECN No.`}
                              name={"ECNNumber"}
                              type="text"
                              placeholder={isViewMode ? '-' : "Enter"}
                              validate={[acceptAllExceptSingleSpecialCharacter, maxLength20, checkWhiteSpaces, checkSpacesInString]}
                              component={renderText}
                              className=""
                              customClassName={"withBorder"}
                              disabled={isViewMode}
                            />
                          </Col>
                          <Col md="3">
                            <Field
                              label={`Revision No.`}
                              name={"RevisionNumber"}
                              type="text"
                              placeholder={isViewMode ? '-' : "Enter"}
                              validate={[acceptAllExceptSingleSpecialCharacter, maxLength20, checkWhiteSpaces, checkSpacesInString]}
                              component={renderText}
                              className=""
                              customClassName={"withBorder"}
                              disabled={isViewMode}
                            />
                          </Col>
                          <Col md="3">
                            <Field
                              label={`Drawing No.`}
                              name={"DrawingNumber"}
                              type="text"
                              placeholder={isViewMode ? '-' : "Enter"}
                              validate={[acceptAllExceptSingleSpecialCharacter, maxLength20, checkWhiteSpaces, checkSpacesInString]}
                              component={renderText}
                              className=""
                              customClassName={"withBorder"}
                              disabled={isViewMode}
                            />
                          </Col>

                          <Col md="3">
                            <Field
                              label={t('commonFields.technology', { ns: 'MasterLabels', defaultValue: 'Technology' })}
                              type="text"
                              name="TechnologyId"
                              component={searchableSelect}
                              placeholder={isViewMode ? '-' : "Select"}
                              options={this.renderListing("technology")}
                              validate={
                                this.state.TechnologySelected == null || Object.keys(this.state.TechnologySelected).length === 0 ? [required] : []}
                              required={true}
                              handleChangeDescription={
                                this.handleTechnologyChange
                              }
                              valueDescription={this.state.TechnologySelected}
                              disabled={(isViewMode) || (!isEditFlag && this.state.disablePartName) || (isEditFlag && !((isEditFlag && this.state.IsTechnologyUpdateRequired && this.state.isBomEditable)))}
                            />
                          </Col>
                          {initialConfiguration?.IsSAPCodeRequired && <Col md="3">
                            <Field
                              label={`SAP Code`}
                              name={"SAPCode"}
                              type="text"
                              placeholder={isEditFlag ? '-' : "Enter"}
                              validate={[required, acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength20, checkSpacesInString]}
                              component={renderText}
                              required={true}
                              onChange={() => { }}
                              className=""
                              customClassName={"withBorder"}
                              disabled={(isViewMode || (isEditFlag && !this.state.isBomEditable)) ? true : false}
                            />
                          </Col>}

                          <Col md="3">
                            <div className="form-group">
                              <div className="inputbox date-section">
                                <Field
                                  label="Effective Date"
                                  name="EffectiveDate"
                                  placeholder={isEditFlag && !isViewMode ? getConfigurationKey().IsBOMEditable ? "Enter" : '-' : (isViewMode) ? '-' : "Enter"}
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
                                  disabled={isEditFlag && !isViewMode ? getConfigurationKey().IsBOMEditable ? false : true : (isViewMode)}
                                />
                              </div>
                            </div>
                          </Col>
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
                              validate={[maxLength512, checkWhiteSpaces, acceptAllExceptSingleSpecialCharacter]}
                              component={renderTextAreaField}
                              maxLength="5000"
                              disabled={isViewMode}
                            />
                          </Col>
                          <Col md="3">
                            <label>
                              Upload Files (upload up to 3 files)
                            </label>
                            <div className={`alert alert-danger mt-2 ${this.state.files.length === 3 ? '' : 'd-none'}`} role="alert">
                              Maximum file upload limit reached.
                            </div>
                            <div id="AddIndivisualPart_UploadFiles" className={`${this.state.files.length >= 3 ? 'd-none' : ''}`}>
                              <Dropzone
                                ref={this.dropzone}
                                onChangeStatus={this.handleChangeStatus}
                                PreviewComponent={this.Preview}
                                accept="image/jpeg,image/jpg,image/png,image/PNG,.xls,.doc,.pdf,.xlsx"
                                initialFiles={this.state.initialFiles}
                                maxFiles={3}
                                disabled={isViewMode}
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
                                      <a href={fileURL} target="_blank" rel="noreferrer">
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
                          <button id="AddIndivisualPart_Cancel"
                            type={"button"}
                            className="mr15 cancel-btn"
                            onClick={() => { this.cancelHandler() }}
                            disabled={setDisable}
                          >
                            <div className={"cancel-icon"}></div>
                            {"Cancel"}
                          </button>
                          <button
                            id="AddIndivisualPart_Save"
                            type="submit"
                            className="user-btn mr5 save-btn"
                            disabled={isViewMode || setDisable}
                          >
                            <div className={"save-icon"}></div>
                            {isEditFlag ? "Update" : "Save"}
                          </button>
                        </div>
                      </Row>
                    </form>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
          {
            this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.CANCEL_MASTER_ALERT}`} />
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
function mapStateToProps({ comman, part, auth, costing }) {
  const { plantSelectList, } = comman;
  const { partData, productGroupSelectList } = part;
  const { initialConfiguration } = auth;
  const { costingSpecifiTechnology } = costing

  let initialValues = {};
  if (partData && Object.keys(partData).length > 0) {
    initialValues = {
      PartNumber: partData.PartNumber,
      PartName: partData.PartName,
      BOMNumber: partData.BOMNumber,
      Description: partData.Description,
      GroupCode: partData !== null && partData.GroupCodeList[0]?.GroupCode,
      ECNNumber: partData.ECNNumber,
      DrawingNumber: partData.DrawingNumber,
      RevisionNumber: partData.RevisionNumber,
      Remark: partData.Remark,
    }
  }

  return { plantSelectList, partData, initialValues, initialConfiguration, productGroupSelectList, costingSpecifiTechnology }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
  createPart,
  updatePart,
  getPartData,
  fileUploadPart,
  getProductGroupSelectList,
  getPartDescription,
  getCostingSpecificTechnology
})(reduxForm({
  form: 'AddIndivisualPart',
  enableReinitialize: true,
  touchOnChange: true,
  onSubmitFail: (errors) => {
    focusOnError(errors)
  },
})(withTranslation(['PartMaster', 'MasterLabels'])(AddIndivisualPart)),
)
