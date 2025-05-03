import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, clearFields } from "redux-form";
import { Row, Col } from 'reactstrap';
import { required, checkWhiteSpaces, alphaNumeric, acceptAllExceptSingleSpecialCharacter, maxLength20, maxLength80, maxLength85, maxLength512, checkSpacesInString, minLength3, validateFileName } from "../../../helper/validation";
import { getConfigurationKey, loggedInUserId } from "../../../helper/auth";
import { focusOnError, renderDatePicker, renderMultiSelectField, renderText, renderTextAreaField, searchableSelect, validateForm } from "../../layout/FormInputs";
import { createPart, updatePart, getPartData, fileUploadPart, getProductGroupSelectList, getPartDescription, getModelList, editModel, addModel } from '../actions/Part';
import Toaster from '../../common/Toaster';
import { AttachmentValidationInfo, MESSAGES } from '../../../config/message';
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
import { AcceptableBOPUOM, ASSEMBLY, LOGISTICS } from '../../../config/masterData';
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from './TourMessages';
import { withTranslation } from 'react-i18next';
import { subDays } from 'date-fns';
import { getUOMSelectList } from '../../../actions/Common';
import TooltipCustom from '../../common/Tooltip';
import { getEffectiveDateMaxDate, getEffectiveDateMinDate } from '../../common/CommonFunctions';
import Button from '../../layout/Button';
import AddModel from './AddModel';

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
      showPopup: false,
      uomSelected: [],
      isModelDrawerOpen: false,
      Model: [],
      isModelEditFlag: false,
      modelOptions: [],
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
    this.getModelList()
    this.getDetails()
    this.props.getUOMSelectList(() => { })
    this.getModelList()

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
              uomSelected: ({ label: Data?.UnitOfMeasurementSymbol, value: Data?.UnitOfMeasurementId }),

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
          this.setState({
            disablePartName: true, minEffectiveDate: finalData.EffectiveDate, TechnologySelected: {
              label: finalData.Technology, value: finalData.TechnologyId,
            }, uomSelected: { label: finalData?.UnitOfMeasurementSymbol, value: finalData?.UnitOfMeasurementId }
          })
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
    const { plantSelectList, productGroupSelectList, costingSpecifiTechnology, UOMSelectList } = this.props;

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
    if (label === 'uom') {
      UOMSelectList && UOMSelectList.map(item => {
        const accept = AcceptableBOPUOM.includes(item.Type)
        if (accept === false) return false
        if (item.Value === '0') return false;
        // let display = this.applySuperScriptFormatter(item.Display)
        temp.push({ label: item.Display, value: item.Value })
        return null
      });
      return temp;
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
      if (!validateFileName(file.name)) {
        this.dropzone.current.files.pop()
        this.setDisableFalseFunction()
        return false;
      }
      this.props.fileUploadPart(data, (res) => {
        if (res && res?.status !== 200) {
          this.dropzone.current.files.pop()
          this.setDisableFalseFunction()
          return false
        }
        this.setDisableFalseFunction()
        if ('response' in res) {
          status = res && res?.response?.status
          this.dropzone.current.files.pop()
          this.setState({ attachmentLoader: false })
          this.dropzone.current.files.pop() // Remove the failed file from dropzone
          this.setState({ files: [...this.state.files] }) // Trigger re-render with current files
          Toaster.warning('File upload failed. Please try again.')
        }
        else {
          let Data = res.data[0]
          const { files } = this.state;
          let attachmentFileArray = [...files]
          attachmentFileArray.push(Data)
          this.setState({ attachmentLoader: false, files: attachmentFileArray })
          setTimeout(() => {
            this.setState(prevState => ({ isOpen: !prevState.isOpen }))
          }, 500);
        }
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
  handleUOM = (newValue, actionMeta) => {

    if (newValue && newValue !== '') {
      this.setState({ uomSelected: newValue, })
    }
    else {
      this.setState({ uomSelected: [], })

    }
  };
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
    let isStructureChanges;
    let productArray = (initialConfiguration?.IsProductMasterConfigurable) ? ProductGroup && ProductGroup.map((item) => ({ GroupCode: item.Text, ProductId: item.Value })) : [{ GroupCode: values.GroupCode }];

    if (isEditFlag) {
      let isGroupCodeChange;
      if (!this.state.isBomEditable) {
        if (this.props.initialConfiguration?.IsProductMasterConfigurable) {
          let isEqualValue = _.isEqual(this.state.DataToCheck.GroupCodeList, productArray);
          isGroupCodeChange = isEqualValue ? false : true;
        } else {
          let isEqualValue = String(this.state.DataToCheck.GroupCode) === String(values.GroupCode);
          isGroupCodeChange = isEqualValue ? false : true;
        }
      }
      //THIS CONDITION TO CHECK IF ALL VALUES ARE SAME (IF YES, THEN NO NEED TO CALL UPDATE API JUST SEND IT TO LISTING PAGE)
      if (DropdownChanged && String(DataToCheck.PartName) === String(values.PartName) && String(DataToCheck.Description) === String(values.Description) &&
        String(DataToCheck.ECNNumber) === String(values.ECNNumber) && JSON.stringify(DataToCheck.GroupCodeList) === JSON.stringify(productArray) &&
        String(DataToCheck.RevisionNumber) === String(values.RevisionNumber) && String(DataToCheck.DrawingNumber) === String(values.DrawingNumber)
        && String(DataToCheck.Remark) === String(values.Remark) && (initialConfiguration?.IsSAPCodeRequired ? String(DataToCheck.SAPCode) === String(values.SAPCode) : true) && !isGroupCodeChange && uploadAttachements && JSON.stringify(DataToCheck.Attachements) === JSON.stringify(files)) {
        Toaster.warning('Please change data to save Part Details');
        return false;
      }

      //THIS CONDITION IS TO CHECK IF IsBomEditable KEY FROM API IS FALSE AND THERE IS CHANGE ON ONLY PART DESCRIPTION ,PART NAME AND ATTACHMENT(TO UPDATE EXISTING RECORD)
      if (this.state.isBomEditable === false && !isGroupCodeChange && String(DataToCheck.ECNNumber) === String(values.ECNNumber) &&
        String(DataToCheck.RevisionNumber) === String(values.RevisionNumber) && String(DataToCheck.DrawingNumber) === String(values.DrawingNumber) &&
        String(oldProductGroup) === String(ProductGroup)) {
        isStructureChanges = false;
      }
      //THIS CONDITION IS TO CHECK IF IsBomEditable KEY FROM API IS FALSE AND TEHRE IS CHANGE IN OTHER FIELD ALSO APART FROM PART DESCRIPTION,NAME AND ATTACHMENT (TO CREATE NEW RECORD)
      else if (this.state.isBomEditable === false && (String(DataToCheck.ECNNumber) !== String(values.ECNNumber) ||
        String(DataToCheck.RevisionNumber) !== String(values.RevisionNumber) || String(DataToCheck.DrawingNumber) !== String(values.DrawingNumber)
      )) {
        // IF THERE ARE CHANGES ,THEN REVISION NO SHOULD BE CHANGED
        if (DayTime(DataToCheck.EffectiveDate).format('YYYY-MM-DD HH:mm:ss') === DayTime(this.state.effectiveDate).format('YYYY-MM-DD HH:mm:ss')) {
          Toaster.warning('Please edit Revision no or ECN no, and Effective date');
          return false;
        } else if ((DayTime(DataToCheck.EffectiveDate).format('YYYY-MM-DD HH:mm:ss') !== DayTime(this.state.effectiveDate).format('YYYY-MM-DD HH:mm:ss')) && (String(DataToCheck.RevisionNumber).toLowerCase() === String(values.RevisionNumber).toLowerCase() && String(DataToCheck.ECNNumber).toLowerCase() === String(values.ECNNumber).toLowerCase())) {
          Toaster.warning('Please edit Revision no or ECN no, and Effective date');
          return false;
        } else {
          isStructureChanges = true;
        }
      }
      // THIS CONDITION IS WHEN IsBomEditable KEY FROM API IS TRUE (WHATEVER USER CHANGE OLD RECORD WILL GET UPDATE)
      else {
        isStructureChanges = false;
      }

      this.setState({ setDisable: true });
      let updatedFiles = files.map((file) => {
        return { ...file, ContextId: PartId };
      });

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
        UnitOfMeasurementId: this.state?.uomSelected?.value ? this.state?.uomSelected?.value : "",
        NEPNumber: values.NEP,
        PartModelIdRef: this.state.Model?.value || "",
        PartsModelMaster: this.state.Model?.label || "",
      };

      this.props.updatePart(updateData, (res) => {
        this.setState({ setDisable: false });
        if (res?.data?.Result) {
          Toaster.success(MESSAGES.UPDATE_PART_SUCESS);
          this.cancel('submit');
        }
      });
    } else {
      this.setState({ setDisable: true, isLoader: true });
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
        UnitOfMeasurementId: this.state?.uomSelected?.value ? this.state?.uomSelected?.value : "",
        NEPNumber: values.NEP,
        PartModelIdRef: this.state.Model?.value || "",
        PartsModelMaster: this.state.Model?.label || "",
      };

      this.props.createPart(formData, (res) => {
        this.setState({ setDisable: false, isLoader: false });
        if (res?.data?.Result === true) {
          Toaster.success(MESSAGES.PART_ADD_SUCCESS);
          this.cancel('submit');
        }
      });
    }
  }, 500);

  handleKeyDown = function (e) {
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault();
    }
  };
  modelToggler = (modelId = '') => {
    const { isEditFlag, Model } = this.state;
    
    if (isEditFlag && Model && Model.value) {
      // No need to make API call to fetch model data for edit
      // Just open the drawer with existing model data
      this.setState({ 
        isModelDrawerOpen: true,
        isModelEditFlag: true
      });
    } else {
      // If in add mode, just open the drawer
      this.setState({ 
        isModelDrawerOpen: true,
        isModelEditFlag: false,
        Model: modelId ? { value: modelId } : null
      });
    }
  }
  
  handleModelChange = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ Model: newValue });
      
    } else {
      // this.setState({ BOPCategory: [], });

    }
  }

  getModelList = () => {
    this.setState({ isLoader: true });
    this.props.getModelList((res) => {
      this.setState({ isLoader: false });
      if (res && res.data && res.data.Result) {
        // Transform the SelectList into the format needed for the dropdown
        const modelOptions = res.data.SelectList
          .filter(item => item.Value !== "0") // Filter out the default "Select" option
          .map(item => ({
            label: item.Text,
            value: item.Value
          }));
        this.setState({ modelOptions });
      }
    });
  }

  handleModelSubmit = (modelData) => {
    if (this.state.isModelEditFlag) {
      this.props.editModel({
        PartModelId: modelData.Id,
        PartModelMasterName: modelData.ModelName
      }, (res) => {
        if (res && res.data && res.data.Result) {
          this.getModelList(); // Refresh the model list
          this.setState({ isModelDrawerOpen: false });
        }
      });
    } else {
      this.props.addModel({
        PartModelMasterName: modelData.ModelName
      }, (res) => {
        if (res && res.data && res.data.Result) {
          this.getModelList(); // Refresh the model list
          this.setState({ isModelDrawerOpen: false });
        }
      });
    }
  }


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
                            <div className="d-flex justify-space-between align-items-center inputwith-icon">
                              <div className="fullinput-icon">
                                <Field
                                  name="Model"
                                  type="text"
                                  label={`Model`}
                                  component={searchableSelect}
                                  placeholder={isEditFlag ? '-' : "Select"}
                                  options={this.state.modelOptions}
                                  validate={
                                    this.state.Model == null || this.state.Model.length === 0 ? [required] : []}
                                  required={true}
                                  handleChangeDescription={this.handleModelChange}
                                  valueDescription={this.state.Model}
                                  disabled={isViewMode}
                                />
                              </div>
                              {!isViewMode && (
                                isEditFlag && this.state.Model && this.state.Model.value ? 
                                  <Button
                                    id="Model-edit"
                                    className="drawer-edit mt30"
                                    variant="Edit"
                                    onClick={() => this.modelToggler(this.state.Model.value)}
                                  /> :
                                  <div className='d-flex justify-content-center align-items-center'>
                                    <Button
                                      id="Model-add"
                                      className="mb-3"
                                      variant="plus-icon-square"
                                      onClick={() => this.modelToggler('')}
                                    />
                                  </div>
                              )}
                            </div>
                          </Col>
                        <Col md="3">
                          <span>
                            <Field
                              label={`NEP`}
                              name={"NEP"}
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
                          {initialConfiguration?.IsShowUnitOfMeasurementInPartMaster && <Col md="3">
                            <TooltipCustom id="uom_tooltip" width="350px" tooltipText="If UOM is not selected, 'No.' will be set by default." />

                            <Field
                              name="UOM"
                              type="text"
                              label="UOM"
                              component={searchableSelect}
                              placeholder={"Select"}
                              options={this.renderListing("uom")}
                              //onKeyUp={(e) => this.changeItemDesc(e)}
                              //validate={this.state.UOM == null || this.state.UOM.length === 0 ? [required] : []}
                              // required={true}
                              handleChangeDescription={this.handleUOM}
                              valueDescription={this.state?.uomSelected}
                              disabled={isEditFlag ? true : false || (!isEditFlag && this.state.disablePartName) || isViewMode}
                            />
                          </Col>}
                          <Col md="3">
                            <Field
                              label={t('TechnologyLabel', { ns: 'MasterLabels', defaultValue: 'Technology' })}
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
                                  // maxDate={getEffectiveDateMaxDate()}

                                  // minDate={isEditFlag ? this.state.minEffectiveDate : getEffectiveDateMinDate()}
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
                              Upload Files (upload up to 3 files)<AttachmentValidationInfo />
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
          {console.log(this.state.isModelDrawerOpen)}
          {this.state.isModelDrawerOpen && (
            <AddModel
              isOpen={this.state.isModelDrawerOpen}
              onClose={() => this.setState({ isModelDrawerOpen: false })}
              onSubmit={this.handleModelSubmit}
              ID={this?.state?.Model?.value}
              isEditFlag={this?.state?.isModelEditFlag}
              refreshModelList={this.getModelList}
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
function mapStateToProps({ comman, part, auth, costing }) {
  const { plantSelectList, UOMSelectList } = comman;
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

  return { plantSelectList, partData, initialValues, initialConfiguration, productGroupSelectList, costingSpecifiTechnology, UOMSelectList }
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
  getCostingSpecificTechnology,
  getUOMSelectList,
  getModelList,
  addModel,
  editModel,
})(reduxForm({
  form: 'AddIndivisualPart',
  validate: validateForm,
  enableReinitialize: true,
  touchOnChange: true,
  onSubmitFail: (errors) => {
    focusOnError(errors)
  },
})(withTranslation(['PartMaster', 'MasterLabels'])(AddIndivisualPart)),
)
