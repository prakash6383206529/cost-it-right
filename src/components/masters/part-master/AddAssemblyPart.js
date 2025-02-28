import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Row, Col } from 'reactstrap';
import { required, checkWhiteSpaces, alphaNumeric, acceptAllExceptSingleSpecialCharacter, maxLength75, maxLength20, maxLength80, maxLength512, checkSpacesInString, minLength3, hashValidation, validateFileName, checkForNull } from "../../../helper/validation";
import { getConfigurationKey, loggedInUserId } from "../../../helper/auth";
import { renderText, renderTextAreaField, focusOnError, renderDatePicker, renderMultiSelectField, searchableSelect, validateForm } from "../../layout/FormInputs";
import {
  createAssemblyPart, updateAssemblyPart, getAssemblyPartDetail, fileUploadPart,
  getBOMViewerTreeDataByPartIdAndLevel, getPartDescription, getPartData, convertPartToAssembly, getProductGroupSelectList
} from '../actions/Part';
import Toaster from '../../common/Toaster';
import { AttachmentValidationInfo, MESSAGES } from '../../../config/message';
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css';
import "react-datepicker/dist/react-datepicker.css";
import { BOUGHTOUTPARTSPACING, COMPONENT_PART, FILE_URL, SPACEBAR, ASSEMBLYNAME, searchCount, customHavellsChanges } from '../../../config/constants';
import AddChildDrawer from './AddChildDrawer';
import DayTime from '../../common/DayTimeWrapper'
import BOMViewer from './BOMViewer';
import { getRandomSixDigit, onFocus, showDataOnHover } from '../../../helper/util';
import LoaderCustom from '../../common/LoaderCustom';
import imgRedcross from "../../../assests/images/red-cross.png";
import _, { debounce } from 'lodash';
import WarningMessage from '../../common/WarningMessage'
import Switch from "react-switch";
import { getCostingSpecificTechnology } from '../../costing/actions/Costing'
import { getPartSelectList, getUOMSelectList } from '../../../actions/Common';
import { reactLocalStorage } from 'reactjs-localstorage';
import { autoCompleteDropdown, getEffectiveDateMaxDate, getEffectiveDateMinDate } from '../../common/CommonFunctions';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from './TourMessages';
import { withTranslation } from 'react-i18next';
import Button from '../../layout/Button';
import { AcceptableBOPUOM, LOGISTICS } from '../../../config/masterData';
import AsyncSelect from 'react-select/async';
import { subDays } from 'date-fns';
import TooltipCustom from '../../common/Tooltip';

const selector = formValueSelector('AddAssemblyPart')
export const PartEffectiveDate = React.createContext()

class AddAssemblyPart extends Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    // ********* INITIALIZE REF FOR DROPZONE ********
    this.dropzone = React.createRef();
    this.state = {
      isEditFlag: false,
      isViewMode: this.props?.data?.isViewMode ? true : false,
      isLoader: false,
      PartId: '',
      selectedPlants: [],
      effectiveDate: '',
      files: [],
      ProductGroup: [],
      oldProductGroup: [],
      isOpenChildDrawer: false,
      isOpenBOMViewerDrawer: false,
      BOMViewerData: [],
      childPartArray: [],
      NewAddedLevelOneChilds: [],
      avoidAPICall: false,
      DataToCheck: [],
      DropdownChanged: false,
      BOMChanged: false,
      GroupCode: '',
      updatedObj: {},
      updatedObjDraft: {},
      setDisable: false,
      TechnologySelected: [],
      isBomEditable: false,
      isDisableBomNo: false,
      minEffectiveDate: '',
      warningMessage: false,
      attachmentLoader: false,
      convertPartToAssembly: false,
      partListingData: [],
      warningMessageTechnology: false,
      inputLoader: false,
      convertPartToAssemblyPartId: "",
      uploadAttachements: true,
      IsTechnologyUpdateRequired: false,
      partName: '',
      showPopup: false,
      partAssembly: '',
      uomSelected: []

    }
  }

  /**
  * @method componentDidMount
  * @description 
  */
  componentDidMount() {
    if (!(this.state.isViewMode)) {
      this.props.getCostingSpecificTechnology(loggedInUserId(), () => { })
    }
    if (!this.state.isViewMode) {
      this.props.getProductGroupSelectList(() => { })
    }
    this.getDetails()
    this.props.getUOMSelectList(() => { })

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
        PartId: data.Id,
      })
      this.props.getAssemblyPartDetail(data.Id, res => {
        if (res && res.data && res.data.Result) {
          const Data = res.data.Data;
          let productArray = []
          Data && Data.GroupCodeList.map((item) => {
            productArray.push({ Text: item.GroupCode, Value: item.ProductId })
            return productArray
          })
          this.props.change('EffectiveDate', DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '')
          this.props.change('SAPCode', Data.SAPCode ?? '')
          this.setState({ minEffectiveDate: Data.LatestEffectiveDate })

          this.setState({ DataToCheck: Data })
          setTimeout(() => {
            this.setState({
              isEditFlag: true,
              // isLoader: false,
              effectiveDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '',
              files: Data.Attachements,
              TechnologySelected: { label: Data.TechnologyName ? Data.TechnologyName : "", value: Data.TechnologyIdRef ? Data.TechnologyIdRef : "" },
              ChildParts: Data.ChildParts,
              BOMViewerData: Data.ChildParts,
              ProductGroup: productArray,
              oldProductGroup: productArray,
              isBomEditable: Data.IsBOMEditable,
              warningMessage: true,
              warningMessageTechnology: Data.IsBOMEditable ? true : false,
              IsTechnologyUpdateRequired: Data?.IsTechnologyUpdateRequired,
              uomSelected: ({ label: Data?.UnitOfMeasurementSymbol, value: Data?.UnitOfMeasurementId }),

            }, () => {
              this.setState({ isLoader: false })
              if (this.state.IsTechnologyUpdateRequired) {
                this.setState({ warningMessageTechnology: false })
              }
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

          }, 200)
        }
      })
    } else {
      this.setState({
        isLoader: false,
      })
      this.props.getAssemblyPartDetail('', res => { })
    }
  }


  onSwitchChange = () => {

    setTimeout(() => {
      this.setState({ convertPartToAssembly: !this.state.convertPartToAssembly })
    }, 200);
    let fields = ['EffectiveDate', 'ECNNumber', 'DrawingNumber', 'RevisionNumber', 'AssemblyPartNumber', 'AssemblyPartName', 'BOMNumber', 'SAPCode', 'Description', 'Remark'];
    fields.forEach(field => {
      this.props.change(field, "")
    })
    this.setState({ ProductGroup: [], BOMViewerData: [] })
    this.setState({ minEffectiveDate: "", warningMessage: false, warningMessageTechnology: false, TechnologySelected: [], uomSelected: [] })
    this.setState({ partAssembly: { ...this.state.partAssembly, convertPartToAssembly: false } })
  }

  isRequired = () => {
    if (this.state.convertPartToAssembly) {
      return maxLength20
    } else {
      return required
    }
  }

  onPartNoChange = debounce((e) => {
    const assemblyPartNumber = e?.target?.value;
    const hasSpecialCharacter = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(assemblyPartNumber);

    if (!hasSpecialCharacter) {
      if (!this.state.isEditFlag) {
        this.props.getPartDescription(assemblyPartNumber, 1, (res) => {
          if (res?.data?.Data) {
            let finalData = res.data.Data;
            this.props.change("Description", finalData.Description);
            this.props.change("AssemblyPartName", finalData.PartName);
            this.setState({ disablePartName: true, minEffectiveDate: finalData.EffectiveDate });
          } else {
            this.props.change("Description", "");
            this.props.change("AssemblyPartName", "");
            this.setState({ disablePartName: false, minEffectiveDate: "" });
          }
        });
      }
    }
  }, 600);

  resetDebounceTimer = () => {
    this.onPartNoChange.cancel();
  };

  handlePartNo = (newValue, actionMeta) => {

    if (newValue && newValue !== '') {
      this.setState({ partAssembly: { ...newValue, convertPartToAssembly: true } })

      this.props.getPartData(newValue.value, res => {
        if (res && res.data && res.data.Result) {
          const Data = res.data.Data;
          let productArray = []

          Data && Data.GroupCodeList.map((item) => {
            productArray.push({ Text: item.GroupCode, Value: item.ProductId })
            return productArray
          })
          this.setState({ DataToCheck: Data, convertPartToAssemblyPartId: newValue.value })
          this.props.change("EffectiveDate", DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '')
          this.props.change("ECNNumber", Data?.ECNNumber)
          this.props.change("DrawingNumber", Data?.DrawingNumber)
          this.props.change("RevisionNumber", Data?.RevisionNumber)
          this.props.change("AssemblyPartNumber", Data?.PartNumber)
          this.props.change("AssemblyPartName", Data?.PartName)
          this.props.change("SAPCode", Data?.SAPCode)
          this.props.change("BOMNumber", '')
          this.props.change("Description", Data?.Description)
          this.props.change("Remark", Data?.Remark)
          this.setState({ ProductGroup: productArray, })
          this.setState({ effectiveDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '' })
        }
      })
    }
  };


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
    this.setState({
      effectiveDate: date,
    });
    this.setState({ DropdownChanged: true })
  };

  handleTechnologyChange = (event) => {
    this.setState({ DropdownChanged: true, TechnologySelected: event, })
  }

  closeChildDrawer = (e = '', childData = {}) => {
    this.setState({ isOpenChildDrawer: false }, () => {
      this.setChildPartsData(childData)
    })
  }

  /**
  * @method setChildPartsData
  * @description SET CHILD PARTS DATA IN ASSEMBLY AND BOMViewerData
  */
  setChildPartsData = (childData) => {
    const { BOMViewerData, } = this.state;
    const tempArray = [];

    const posX = BOMViewerData && BOMViewerData.length > 0 ? 450 * (BOMViewerData.filter(el => el.Level === 'L1').length - 1) : 50;

    if (Object.keys(childData).length > 0 && childData.PartType === ASSEMBLYNAME) {
      this.props.getBOMViewerTreeDataByPartIdAndLevel(childData.PartId, 1, res => {
        let Data = res.data.Data.FlowPoints;

        const DeleteNodeL1 = getRandomSixDigit();
        Data && Data.map(el => {
          tempArray.push({
            PartId: childData.PartId,
            PartType: el.PartType,
            PartTypeId: el.PartTypeId,
            PartNumber: el.PartNumber,
            Input: el.Input,
            Position: el.Position,
            Outputs: el.Outputs,
            InnerContent: el.InnerContent,
            PartName: el.PartName,
            Quantity: el.Level === 'L1' ? childData.Quantity : el.Quantity,
            Level: el.Level,
            DeleteNodeL1: DeleteNodeL1,
          })
          return null;
        })

        setTimeout(() => {
          this.setState({ BOMViewerData: [...BOMViewerData, ...tempArray] }, () => this.getLevelOneNewAddedChild())
        }, 200)

      })

    } else if (Object.keys(childData).length > 0) {

      tempArray.push(...BOMViewerData, {
        PartType: childData && childData.PartType ? childData.PartType : '',
        PartTypeId: childData && childData.PartTypeId ? childData.PartTypeId : '',
        PartNumber: childData && childData.PartNumber !== undefined ? childData.PartNumber.label : '',
        Position: { "x": posX, "y": 50 },
        Outputs: [],
        InnerContent: childData && childData.InnerContent !== undefined ? childData.InnerContent : '',
        PartName: childData && childData.PartNumber !== undefined ? childData.PartNumber.label : '',
        Quantity: childData && childData.Quantity !== undefined ? childData.Quantity : '',
        Level: 'L1',
        PartId: childData.PartId,
        Input: getRandomSixDigit(),
      })
      this.setState({ BOMViewerData: tempArray }, () => this.getLevelOneNewAddedChild())
    }
  }

  /**
  * @method getLevelOneNewAddedChild
  * @description USED TO GET NEW ADDED LEVEL ONE CHILD IN EDIT MODE
  */
  getLevelOneNewAddedChild = () => {
    const { BOMViewerData, ChildParts } = this.state;

    let OldChildPartsArray = [];

    ChildParts && ChildParts.map((el) => {
      OldChildPartsArray.push(el.PartId)
      return null;
    })

    let NewAddedLevelOneChilds = BOMViewerData && BOMViewerData.filter(el => {
      if (!OldChildPartsArray.includes(el.PartId) && el.Level === 'L1') {
        return true;
      }

      return false;
    })
    this.setState({ NewAddedLevelOneChilds: NewAddedLevelOneChilds })
  }

  /**
  * @method renderListing
  * @description Used show listing of unit of measurement
  */
  renderListing = (label) => {
    const { plantSelectList, productGroupSelectList, costingSpecifiTechnology, UOMSelectList } = this.props;
    const temp = [];

    if (label === 'plant') {
      plantSelectList && plantSelectList.map(item => {
        if (item.PlantId === '0') return false;
        temp.push({ Text: item.PlantNameCode, Value: item.PlantId })
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
          if (item.Value === '0' || (item.Value === String(LOGISTICS))) return false;
          temp.push({ label: item.Text, value: item.Value })
          return null
        })
      return temp
    }

    if (label === 'partNo') {
      this.state.partListingData.length > 0 && this.state.partListingData.map((item) => {
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

  /**
  * @method checkIsFormFilled
  * @description CHECK BOM FORM IS FILLED BEFORE TRIGGER
  */
  checkIsFormFilled = () => {
    const { fieldsObj } = this.props;
    if ((fieldsObj.BOMNumber === undefined || fieldsObj.BOMNumber === '') || fieldsObj.AssemblyPartNumber === undefined || fieldsObj.AssemblyPartName === undefined || Object.keys(this.state.TechnologySelected).length === 0 || this.state.effectiveDate === "") {
      return false;
    } else {
      return true;
    }
  }

  /**
  * @method toggleBOMViewer
  * @description DISPLAY BOM VIEWER PAGE
  */
  toggleBOMViewer = () => {
    const { fieldsObj } = this.props;
    const { BOMViewerData, isEditFlag } = this.state;


    if (this.checkIsFormFilled() === false) {
      Toaster.warning("Please fill the mandatory fields.")
      return false;
    }

    if (isEditFlag) {
      this.setState({ isOpenBOMViewerDrawer: true, })

      return false;
    }

    let tempArray = [];
    let outputArray = [];

    BOMViewerData && BOMViewerData.map((el, i) => {
      if (el.Level === 'L1') {
        outputArray.push(el.Input)
      }
      return null;
    })

    //CONDITION TO CHECK BOMViewerData STATE HAS FORM DATA
    let isAvailable = BOMViewerData && BOMViewerData.findIndex(el => el.Level === 'L0')

    //BELOW CONDITION WILL PASS WHEN L0 LEVEL IS NOT AVAILABLE
    if (isAvailable === -1) {
      tempArray.push(...BOMViewerData, {
        PartType: ASSEMBLYNAME,
        PartNumber: fieldsObj && fieldsObj.AssemblyPartNumber !== undefined ? fieldsObj.AssemblyPartNumber : '',
        Position: { "x": 750, "y": 50 },
        Outputs: outputArray,
        InnerContent: fieldsObj && fieldsObj.Description !== undefined ? fieldsObj.Description : '',
        PartName: fieldsObj && fieldsObj.AssemblyPartName !== undefined ? fieldsObj.AssemblyPartName : '',
        Quantity: 1,
        Level: 'L0',
        Input: '',
        Technology: this.state.TechnologySelected.label,
        RevisionNo: this.props?.fieldsObj?.RevisionNumber
      })
      this.setState({ BOMViewerData: tempArray, isOpenBOMViewerDrawer: true, })

    } else {

      tempArray = Object.assign([...BOMViewerData], {
        [isAvailable]: Object.assign({}, BOMViewerData[isAvailable], {
          Outputs: outputArray,
          PartNumber: fieldsObj && fieldsObj.AssemblyPartNumber !== undefined ? fieldsObj.AssemblyPartNumber : '', //WHEN EDIT FORM
          PartName: fieldsObj && fieldsObj.AssemblyPartName !== undefined ? fieldsObj.AssemblyPartName : '', //WHEN EDIT FORM
          InnerContent: fieldsObj && fieldsObj.Description !== undefined ? fieldsObj.Description : '', //WHEN EDIT FORM
          Technology: this.state.TechnologySelected.label,
          RevisionNo: this.props?.fieldsObj?.RevisionNumber
        })
      })

      this.setState({ BOMViewerData: tempArray, isOpenBOMViewerDrawer: true, })
    }

  }

  closeBOMViewerDrawer = (e = '', drawerData, isSaved, isEqual) => {
    this.setState({ isOpenBOMViewerDrawer: false, BOMViewerData: drawerData, avoidAPICall: isSaved, BOMChanged: isEqual ? false : true })

    if (drawerData.length !== 1) {
      this.setState({ minEffectiveDate: this.state.effectiveDate, warningMessage: true, warningMessageTechnology: this.state.isEditFlag ? (this.state.isBomEditable ? true : false) : true })
      if (this.state.IsTechnologyUpdateRequired) {
        this.setState({ warningMessageTechnology: false })
      }
    } else if (drawerData.length === 1) {
      this.setState({ minEffectiveDate: "", warningMessage: false, warningMessageTechnology: false })
    }

    if (isEqual) {
      return false
    } else {
      this.setState({ isDisableBomNo: true })
    }
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
    this.setState({ setDisable: true, uploadAttachements: false, attachmentLoader: true })
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
      isEditFlag: false,
      selectedPlants: [],
      effectiveDate: '',
      files: [],
      BOMViewerData: [],
    })
    this.props.getAssemblyPartDetail('', res => { })
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
  * @method confirmDraftItem
  * @description DRAFT ASSEMBLY BOM
  */
  confirmDraftItem = (updateData) => {
    let Data = { ...updateData, IsForceUpdate: true }
    this.props.updateAssemblyPart(Data, (res) => {
      this.setState({ setDisable: false })
      if (res.data.Result) {
        Toaster.success(MESSAGES.UPDATE_BOM_SUCCESS);
        this.cancel('submit')
      }
    });
  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = debounce((values) => {
    const { PartId, isEditFlag, selectedPlants, BOMViewerData, files, avoidAPICall, DataToCheck, DropdownChanged, ProductGroup, BOMChanged, convertPartToAssembly, uploadAttachements } = this.state;
    const { partData, initialConfiguration } = this.props;

    let plantArray = selectedPlants && selectedPlants.map((item) => ({ PlantName: item.Text, PlantId: item.Value, PlantCode: '' }))
    let productArray = (initialConfiguration?.IsProductMasterConfigurable) ? ProductGroup && ProductGroup.map((item) => ({ GroupCode: item.Text, ProductId: item.Value })) : [{ GroupCode: values.GroupCode }]
    let childPartArray = [];
    let isStructureChanges;
    // CONDITION CHANGE FOR (BOMViewerData.length === 0 || BOMViewerData.length === 1)
    if (BOMViewerData && isEditFlag ? (BOMViewerData.length === 0) : (BOMViewerData.length === 0 || BOMViewerData.length === 1)) {
      Toaster.warning('Need to add Child parts');
      return false;
    }

    //GET BOMLEVEL COUNT
    let BOMLevelArrays = BOMViewerData && BOMViewerData.map((el) => {
      return parseInt(el?.Level.substring(1));
    })
    const BOMLevelCount = Math.max.apply(Math, BOMLevelArrays);

    BOMViewerData && BOMViewerData.map((item) => {
      if (item.Level === 'L0') return false;
      if (item.Level === 'L1') {
        childPartArray.push({
          PartId: item.PartType && (item.PartType === ASSEMBLYNAME || item.PartType === COMPONENT_PART) ? item.PartId : '',
          ParentPartId: isEditFlag ? PartId : '',
          BoughtOutPartId: item.PartType && item.PartType === BOUGHTOUTPARTSPACING ? ((item.BoughtOutPartId !== undefined && item.BoughtOutPartId !== null) ? item.BoughtOutPartId : item.PartId) : '',
          PartTypeId: item.PartTypeId ? item.PartTypeId : '',
          PartType: item.PartType ? item.PartType : '',
          BOMLevel: 1,
          Quantity: item.Quantity,
        })
      }
      return childPartArray;
    })

    if (isEditFlag || convertPartToAssembly) {
      let isGroupCodeChange = this.checkGroupCodeChange(values)

      const noChanges = 
        String(DataToCheck?.AssemblyPartName) === String(values?.AssemblyPartName) && 
        String(DataToCheck?.Description) === String(values?.Description) &&
        String(DataToCheck?.ECNNumber) === String(values?.ECNNumber) && 
        String(DataToCheck.RevisionNumber) === String(values.RevisionNumber) &&
        String(DataToCheck?.DrawingNumber) === String(values?.DrawingNumber) && 
        String(DataToCheck?.Remark) === String(values?.Remark) && 
        String(DataToCheck?.SAPCode) === String(values?.SAPCode) 
      if (noChanges) {
        Toaster.warning('Please change data to save Assembly Part Details');
        return false;
      }

      if (!convertPartToAssembly) {
        //THIS CONDITION IS TO CHECK IF IsBomEditable KEY FROM API IS FALSE AND THERE IS CHANGE ON ONLY PART DESCRIPTION ,PART NAME AND ATTACHMENT(TO UPDATE EXISTING RECORD)
        if (this.state.isBomEditable === false && !isGroupCodeChange && String(DataToCheck.ECNNumber) === String(values.ECNNumber) &&
          String(DataToCheck.RevisionNumber) === String(values.RevisionNumber) && String(DataToCheck.DrawingNumber) === String(values.DrawingNumber) && !BOMChanged) {
          isStructureChanges = false
        }

        //THIS CONDITION IS TO CHECK IF IsBomEditable KEY FROM API IS FALSE AND TEHRE IS CHANGE IN OTHER FIELD ALSO APART FROM PART DESCRIPTION,NAME AND ATTACHMENT (TO CREATE NEW RECORD)
        else if (this.state.isBomEditable === false && (String(DataToCheck.ECNNumber) !== String(values.ECNNumber) ||
          String(DataToCheck.RevisionNumber) !== String(values.RevisionNumber) || String(DataToCheck.DrawingNumber) !== String(values.DrawingNumber)
          || BOMChanged)) {
          // IF THERE ARE CHANGES ,THEN REVISION NO SHOULD BE CHANGED
          if (String(DataToCheck.RevisionNumber).toLowerCase() === String(values.RevisionNumber).toLowerCase() || String(DataToCheck.BOMNumber).toLowerCase() === String(values.BOMNumber).toLowerCase() || DayTime(DataToCheck.EffectiveDate).format('YYYY-MM-DD HH:mm:ss') === DayTime(this.state.effectiveDate).format('YYYY-MM-DD HH:mm:ss')) {
            Toaster.warning('Please edit Revision no, ECN no, BOM no and Effective date')
            return false
          } else {
            isStructureChanges = true
          }
        }
        // THIS CONDITION IS WHEN IsBomEditable KEY FROM API IS TRUE (WHATEVER USER CHANGE OLD RECORD WILL GET UPDATE)
        else {
          isStructureChanges = false
        }
      }
      this.setState({ setDisable: true, isLoader: true })
      let updatedFiles = files.map((file) => {
        return { ...file, ContextId: PartId }
      })
      let updateData = {
        BOMNumber: values.BOMNumber,
        LoggedInUserId: loggedInUserId(),
        AssemblyPartId: convertPartToAssembly ? this.state.convertPartToAssemblyPartId : PartId,
        AssemblyPartName: values.AssemblyPartName,
        AssemblyPartNumber: values.AssemblyPartNumber,
        TechnologyIdRef: this.state.TechnologySelected.value ? this.state.TechnologySelected.value : "",
        Description: values.Description,
        ECNNumber: values.ECNNumber,
        RevisionNumber: values.RevisionNumber,
        DrawingNumber: values.DrawingNumber,
        GroupCode: values.GroupCode,
        EffectiveDate: DayTime(this.state.effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
        Remark: values.Remark,
        SAPCode: values.SAPCode,
        Plants: plantArray,
        Attachements: updatedFiles,
        ChildParts: childPartArray,
        NumberOfChildParts: BOMViewerData && avoidAPICall ? BOMViewerData.length - 1 : partData.NumberOfChildParts,
        IsForcefulUpdated: false,
        BOMLevelCount: BOMLevelCount,
        GroupCodeList: productArray,
        IsStructureChanges: isStructureChanges,
        IsConvertedToAssembly: convertPartToAssembly ? true : false,
        IsTechnologyUpdateRequired: false,
        UnitOfMeasurementId: this.state?.uomSelected?.value ? this.state?.uomSelected?.value : "",

      }

      if (convertPartToAssembly) {
        this.props.convertPartToAssembly(updateData, (res) => {
          this.setState({ setDisable: false, isLoader: false })
          if (res?.data?.Result) {
            Toaster.success(MESSAGES.UPDATE_BOM_SUCCESS);
            this.cancel('submit')
          }
        });
      }

      else {
        this.props.updateAssemblyPart(updateData, (res) => {
          this.setState({ setDisable: false, isLoader: false })
          if (res?.data?.Result) {
            Toaster.success(MESSAGES.UPDATE_BOM_SUCCESS);
            this.cancel('submit')
          }
        });
      }


    } else {
      this.setState({ setDisable: true, isLoader: true })
      let formData = {
        AssemblyPartNumber: values.AssemblyPartNumber,
        AssemblyPartName: values.AssemblyPartName,
        AssemblyPartId: '',
        TechnologyIdRef: this.state.TechnologySelected.value ? this.state.TechnologySelected.value : "",
        ChildParts: childPartArray,
        LoggedInUserId: loggedInUserId(),
        BOMNumber: values.BOMNumber,
        Remark: values.Remark,
        Description: values.Description,
        SAPCode: values.SAPCode,
        ECNNumber: values.ECNNumber,
        EffectiveDate: DayTime(this.state.effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
        RevisionNumber: values.RevisionNumber,
        DrawingNumber: values.DrawingNumber,
        GroupCode: values.GroupCode,
        Plants: plantArray,
        Attachements: files,
        NumberOfChildParts: BOMViewerData && BOMViewerData.length - 1,
        BOMLevelCount: BOMLevelCount,
        GroupCodeList: productArray,
        UnitOfMeasurementId: this.state?.uomSelected?.value ? this.state?.uomSelected?.value : "",

      }
      this.props.createAssemblyPart(formData, (res) => {
        this.setState({ setDisable: false, isLoader: false })
        if (res?.data?.Result === true) {
          Toaster.success(MESSAGES.ASSEMBLY_PART_ADD_SUCCESS);
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

  isFieldChange = (event, field) => {
    const { DataToCheck } = this.state
    let isChangeInField = false
    switch (field) {
      case 'ECN':
        if (String(event) !== DataToCheck.ECNNumber && this.state.isBomEditable === false) {
          isChangeInField = true
          this.setState({ isDisableBomNo: isChangeInField })
        }
        return isChangeInField
      case 'Revision':
        if (String(event) !== DataToCheck.RevisionNumber && this.state.isBomEditable === false) {
          isChangeInField = true
          this.setState({ isDisableBomNo: isChangeInField })
        }
        return isChangeInField
      case 'Drawing':
        if (String(event) !== DataToCheck.DrawingNumber && this.state.isBomEditable === false) {
          isChangeInField = true
          this.setState({ isDisableBomNo: isChangeInField })
        }
        return isChangeInField
      case 'Group Code':
        isChangeInField = this.checkGroupCodeChange(event)
        this.setState({ isDisableBomNo: isChangeInField })
        return isChangeInField
      default:
        this.setState({ isDisableBomNo: isChangeInField })
        return isChangeInField

    }
  }
  checkGroupCodeChange = (newGroupCodeValue) => {
    let isGroupCodeChange
    let productArray = (this.props.initialConfiguration?.IsProductMasterConfigurable) ? this.state.ProductGroup && this.state.ProductGroup.map((item) => ({ GroupCode: item.Text })) : [{ GroupCode: newGroupCodeValue.GroupCode }]
    if (!this.state.isBomEditable) {

      if (this.props.initialConfiguration?.IsProductMasterConfigurable) {
        let isEqualValue = _.isEqual(this.state.DataToCheck.GroupCodeList, productArray)
        isGroupCodeChange = isEqualValue ? false : true
      } else {
        let isEqualValue = String(this.state.DataToCheck.GroupCode) === String(newGroupCodeValue.GroupCode)
        isGroupCodeChange = isEqualValue ? false : true
      }
    }

    return isGroupCodeChange
  }
  handleUOM = (newValue, actionMeta) => {

    if (newValue && newValue !== '') {
      this.setState({ uomSelected: newValue, })
    }
    else {
      this.setState({ uomSelected: [], })

    }
  };
  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { handleSubmit, initialConfiguration, t } = this.props;
    const { isEditFlag, isOpenChildDrawer, isOpenBOMViewerDrawer, isViewMode, setDisable, convertPartToAssembly, BOMViewerData } = this.state;
    const filterList = async (inputValue) => {
      const { partName, selectedParts } = this.state
      const resultInput = inputValue.slice(0, searchCount)
      if (inputValue?.length >= searchCount && partName !== resultInput) {

        const res = await getPartSelectList(resultInput)
        this.setState({ partName: resultInput })
        let partDataAPI = res?.data?.SelectList
        if (inputValue) {
          return autoCompleteDropdown(inputValue, partDataAPI, true, selectedParts, true)
        } else {
          return partDataAPI
        }
      }
      else {
        if (inputValue?.length < searchCount) return false
        else {
          let partData = reactLocalStorage?.getObject('Data')
          if (inputValue) {
            return autoCompleteDropdown(inputValue, partData, true, selectedParts, false)
          } else {
            return partData
          }
        }
      }
    };
    return (
      <>
        <div className="container-fluid">
          {this.state.isLoader && <LoaderCustom />}
          <div className="login-container signup-form">
            <Row>
              <Col md="12">
                <div className="shadow-lgg login-formg">
                  <Row>
                    <Col md="6">
                      <div className="form-heading mb-0">
                        <h1>
                          {isViewMode ? "View" : isEditFlag ? "Update" : "Add"} Assembly Part
                          {!isViewMode && <TourWrapper
                            buttonSpecificProp={{ id: "Add_Assembly_Part_Form" }}
                            stepsSpecificProp={{
                              steps: Steps(t, {
                                isEditFlag: isEditFlag,
                                partField: (this.state.convertPartToAssembly)
                              }).ADD_ASSEMBLY_PART
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
                        {!isEditFlag &&
                          <Col md="4" className="switch mb15">
                            <label id='AddAssemblyPart_Switch' className="switch-level">
                              <div className={"left-title"}>Add assembly</div>
                              <Switch
                                onChange={this.onSwitchChange}
                                checked={this.state.convertPartToAssembly}
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
                                Convert part to assembly
                              </div>
                            </label>
                          </Col>
                        }
                      </Row>
                      <Row>
                        <Col md="12">
                          <div className="left-border">
                            {"Assembly Details:"}
                          </div>
                        </Col>

                        {this.state.convertPartToAssembly &&
                          <Col md="3" className='mb-4'>
                            <label>{"Part No"}<span className="asterisk-required">*</span></label>
                            <div className="fullinput-icon w-100 p-relative">
                              {this.state.inputLoader && <LoaderCustom customClass="input-loader" />}
                              <AsyncSelect
                                name="partNo"
                                ref={this.myRef}
                                key={this.state.updateAsyncDropdown}
                                loadOptions={filterList}
                                onFocus={() => onFocus(this)}
                                onChange={(e) => this.handlePartNo(e)}
                                value={this.state.partAssembly}
                                noOptionsMessage={({ inputValue }) => inputValue.length < 3 ? 'Enter 3 characters to show data' : "No results found"}
                                onKeyDown={(onKeyDown) => {
                                  if (onKeyDown.keyCode === SPACEBAR && !onKeyDown.target.value) onKeyDown.preventDefault();
                                }}
                                isDisabled={(isEditFlag || this.state.inputLoader) ? true : false}
                              />
                            </div>
                          </Col>
                        }
                        <Col md="3">
                          <Field
                            label={`BOM No.`}
                            name={"BOMNumber"}
                            type="text"
                            placeholder={(isEditFlag && this.state.isDisableBomNo === false) ? '-' : "Enter"}
                            validate={[required, acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength20, checkSpacesInString, minLength3, hashValidation]}
                            component={renderText}
                            required={true}
                            className=""
                            customClassName={"withBorder"}
                            disabled={(isEditFlag && this.state.isDisableBomNo === false) || (isEditFlag && this.state.isBomEditable) ? true : false}
                          />
                        </Col>
                        <Col md="3">
                          <Field
                            label={`Assembly Part No.`}
                            name={"AssemblyPartNumber"}
                            type="text"
                            placeholder={isEditFlag || convertPartToAssembly ? '-' : "Enter"}
                            validate={[this.isRequired(), acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength20, checkSpacesInString, minLength3, hashValidation]}
                            component={renderText}
                            required={true}
                            onChange={this.onPartNoChange}
                            onKeyUp={(e) => {
                              if (e.keyCode === 8 && e.target.value === "") {
                                this.resetDebounceTimer();
                              }
                            }}
                            className=""
                            customClassName={"withBorder"}
                            disabled={isEditFlag || convertPartToAssembly ? true : false}
                          />
                        </Col>
                        <Col md="3">
                          <Field
                            label={`Assembly Name`}
                            name={"AssemblyPartName"}
                            type="text"
                            placeholder={isViewMode || (!isEditFlag && this.state.disablePartName) || convertPartToAssembly ? '-' : "Enter"}
                            validate={[required, acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength75]}
                            component={renderText}
                            required={true}
                            className=""
                            customClassName={"withBorder"}
                            disabled={isViewMode || (!isEditFlag && this.state.disablePartName) || convertPartToAssembly}
                          />
                        </Col>
                        <Col md="3">
                          <Field
                            label={`Description`}
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
                        </Col>
                        <Col md="3">
                          <Field
                            label={`ECN No.`}
                            name={"ECNNumber"}
                            type="text"
                            placeholder={isViewMode ? '-' : "Enter"}
                            validate={[acceptAllExceptSingleSpecialCharacter, maxLength20, checkWhiteSpaces, checkSpacesInString, hashValidation]}
                            component={renderText}
                            className=""
                            customClassName={"withBorder"}
                            disabled={isViewMode}
                            onChange={e => this.isFieldChange(e.target.value, 'ECN')}

                          />
                        </Col>
                        <Col md="3">
                          <Field
                            label={`Revision No.`}
                            name={"RevisionNumber"}
                            type="text"
                            placeholder={isViewMode ? '-' : "Enter"}
                            validate={[acceptAllExceptSingleSpecialCharacter, maxLength20, checkWhiteSpaces, checkSpacesInString, hashValidation]}
                            component={renderText}
                            className=""
                            customClassName={"withBorder"}
                            disabled={isViewMode}
                            onChange={e => this.isFieldChange(e.target.value, 'Revision')}
                          />
                        </Col>
                        <Col md="3">
                          <Field
                            label={`Drawing No.`}
                            name={"DrawingNumber"}
                            type="text"
                            placeholder={isViewMode ? '-' : "Enter"}
                            validate={[acceptAllExceptSingleSpecialCharacter, maxLength20, checkWhiteSpaces, checkSpacesInString, hashValidation]}
                            component={renderText}
                            className=""
                            customClassName={"withBorder"}
                            disabled={isViewMode}
                            onChange={e => this.isFieldChange(e.target.value, 'Drawing')}
                          />
                        </Col>
                        {initialConfiguration?.IsProductMasterConfigurable ? (
                          // initialConfiguration?.IsGroupCodeDisplay && (
                          <Col md="3">
                            <Field
                              label="Group Code"
                              name="ProductGroup"
                              placeholder={isViewMode ? '-' : "Select"}
                              title={showDataOnHover(this.state.ProductGroup)}
                              selection={
                                this.state.ProductGroup == null || this.state.ProductGroup.length === 0 ? [] : this.state.ProductGroup}
                              options={this.renderListing("ProductGroup")}
                              selectionChanged={this.handleProductGroup}
                              optionValue={(option) => option.Value}
                              optionLabel={(option) => option.Text}
                              component={renderMultiSelectField}
                              className="multiselect-with-border"
                              disabled={isViewMode}
                            />
                          </Col>
                        ) :
                          <Col md="3">
                            <Field
                              label={`Group Code`}
                              name={"GroupCode"}
                              type="text"
                              placeholder={isViewMode ? '-' : "Select Date"}
                              validate={[checkWhiteSpaces, alphaNumeric, maxLength20]}
                              component={renderText}
                              className=""
                              customClassName={"withBorder"}
                              disabled={isViewMode}
                              onChange={e => this.isFieldChange(e.target.value, 'Group Code')}
                            />
                          </Col>
                        }
                      </Row>

                      <Row>
                        {initialConfiguration?.IsSAPCodeRequired && <Col md="3">
                          <Field
                            label={`SAP Code`}
                            name={"SAPCode"}
                            type="text"
                            placeholder={isEditFlag ? '-' : "Enter"}
                            validate={[required, acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength20, checkSpacesInString, hashValidation]}
                            component={renderText}
                            required={true}
                            onChange={() => { }}
                            className=""
                            customClassName={"withBorder"}
                            disabled={(isViewMode || (isEditFlag && !this.state.isBomEditable)) ? true : false}
                          />
                        </Col>}
                        {initialConfiguration?.IsShowUnitOfMeasurementInPartMaster && <Col md="3">
                          <TooltipCustom id="uom_tooltip" width="350px" tooltipText="If UOM is not selected, 'No.' will be set by default" />

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
                            disabled={isEditFlag ? true : false}
                          />
                        </Col>}
                        {/* 
                        //WORK IN PROGRESS DONT DELETE */}
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
                            disabled={isViewMode || this.state.warningMessageTechnology || (isEditFlag && !this.state.isBomEditable)}
                          />
                          {this.state.warningMessageTechnology && !isViewMode && <WarningMessage dClass="assembly-view-bom-wrapper mt-2" message={`Please reset the BOM to change the technology`} />}
                        </Col>
                        <Col md="3">
                          <div className="form-group">
                            <div className="inputbox date-section">
                              <Field
                                label="Effective Date"
                                placeholder={isEditFlag && !isViewMode ? getConfigurationKey().IsBOMEditable ? "Enter" : '-' : (isViewMode) ? '-' : "Enter"}
                                name="EffectiveDate"
                                selected={this.state.effectiveDate}
                                onChange={this.handleEffectiveDateChange}
                                type="text"
                                validate={[required]}
                                autoComplete={'off'}
                                required={true}
                                maxDate={getEffectiveDateMaxDate()}

                                minDate={isEditFlag ? this.state.minEffectiveDate : getEffectiveDateMinDate()}
                                changeHandler={(e) => {
                                }}
                                component={renderDatePicker}
                                className="form-control"
                                disabled={isEditFlag && !isViewMode ? getConfigurationKey().IsBOMEditable ? false : true : (isViewMode)}
                              />
                            </div>
                          </div>
                          {this.state.warningMessage && !isViewMode && <WarningMessage dClass="assembly-view-bom-wrapper date mt-2" message={`Revised date is ${DayTime(this.state?.minEffectiveDate).format('DD/MM/YYYY')} please reset the BOM to select the previous date`} />}
                        </Col>


                        <Col md="3" className='pt-2'>
                          <button
                            id="AssemblyPart_Add_BOM"
                            type="button"
                            disabled={false}
                            onClick={this.toggleBOMViewer}
                            className={"user-btn pull-left mt30 mb-4 "}>
                            <div className={`${!isViewMode && BOMViewerData?.length <= 0 ? 'plus' : 'fa fa-eye pr-1'}`}></div> BOM
                          </button>
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
                          <label>Upload Files (upload up to {getConfigurationKey().MaxMasterFilesToUpload} files) <AttachmentValidationInfo /></label>
                          <div className={`alert alert-danger mt-2 ${this.state.files.length === getConfigurationKey().MaxMasterFilesToUpload ? '' : 'd-none'}`} role="alert">
                            Maximum file upload limit reached.
                          </div>
                          <div id="AddAssemblyPart_UploadFiles" className={`${this.state.files.length >= getConfigurationKey().MaxMasterFilesToUpload ? 'd-none' : ''}`}>
                            <Dropzone
                              ref={this.dropzone}
                              onChangeStatus={this.handleChangeStatus}
                              PreviewComponent={this.Preview}
                              disabled={isViewMode}
                              accept="image/jpeg,image/jpg,image/png,image/PNG,.xls,.doc,.pdf,.xlsx"
                              initialFiles={this.state.initialFiles}
                              maxFiles={getConfigurationKey().MaxMasterFilesToUpload}
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

                                    {!isViewMode &&
                                      <img
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
                        <button id="AddAssemblyPart_Cancel"
                          type={"button"}
                          className=" mr15 cancel-btn"
                          onClick={() => { this.cancelHandler() }}
                          disabled={setDisable}
                        >
                          <div className={"cancel-icon"}></div>
                          {"Cancel"}
                        </button>
                        {!isViewMode && <button id="AddAssemblyPart_Save"
                          type="submit"
                          className="user-btn mr5 save-btn"
                          disabled={isViewMode || setDisable}
                        >
                          <div className={"save-icon"}></div>
                          {isEditFlag ? "Update" : "Save"}
                        </button>}

                      </div>
                    </Row>
                  </form>
                </div>
              </Col>
            </Row>
          </div>
          {
            this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.CANCEL_MASTER_ALERT}`} />
          }
          {isOpenChildDrawer && (
            <AddChildDrawer
              isOpen={isOpenChildDrawer}
              closeDrawer={this.closeChildDrawer}
              isEditFlag={false}
              TechnologySelected={this.state.TechnologySelected}
              ID={""}
              anchor={"right"}
              setChildPartsData={this.setChildPartsData}
              BOMViewerData={this.state.BOMViewerData}
            />
          )}

          {isOpenBOMViewerDrawer && (
            <PartEffectiveDate.Provider value={DayTime(this.state.effectiveDate).format('DD-MM-YYYY')}>
              <BOMViewer
                isOpen={isOpenBOMViewerDrawer}
                closeDrawer={this.closeBOMViewerDrawer}
                TechnologySelected={this.state.TechnologySelected}
                isEditFlag={this.state.isEditFlag}
                PartId={this.state.PartId}
                anchor={"right"}
                BOMViewerData={this.state.BOMViewerData}
                NewAddedLevelOneChilds={this.state.NewAddedLevelOneChilds}
                isFromVishualAd={isViewMode}
                avoidAPICall={this.state.avoidAPICall}
                partAssembly={this.state.partAssembly}
              />
            </PartEffectiveDate.Provider>
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
  const fieldsObj = selector(state, 'BOMNumber', 'AssemblyPartNumber', 'AssemblyPartName', 'ECNNumber', 'RevisionNumber',
    'Description', 'DrawingNumber', 'GroupCode', 'Remark', 'TechnologyId')
  const { comman, part, auth, costing } = state;
  const { plantSelectList, UOMSelectList } = comman;
  const { partData, actualBOMTreeData, productGroupSelectList } = part;
  const { initialConfiguration } = auth;
  const { costingSpecifiTechnology } = costing
  let initialValues = {};
  if (partData && Object.keys(partData).length > 0) {
    initialValues = {
      BOMNumber: partData.BOMNumber,
      AssemblyPartNumber: partData.AssemblyPartNumber,
      AssemblyPartName: partData.AssemblyPartName,
      Description: partData.Description,
      ECNNumber: partData.ECNNumber,
      RevisionNumber: partData.RevisionNumber,
      DrawingNumber: partData.DrawingNumber,
      GroupCode: partData !== null && partData.GroupCodeList[0]?.GroupCode,
      Remark: partData.Remark,
    }
  }

  return { plantSelectList, partData, actualBOMTreeData, fieldsObj, initialValues, initialConfiguration, productGroupSelectList, costingSpecifiTechnology, UOMSelectList }

}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
  fileUploadPart,
  createAssemblyPart,
  updateAssemblyPart,
  convertPartToAssembly,
  getAssemblyPartDetail,
  getBOMViewerTreeDataByPartIdAndLevel,
  getPartDescription,
  getPartData,
  getCostingSpecificTechnology,
  getProductGroupSelectList,
  getPartSelectList,
  getUOMSelectList,

})(reduxForm({
  form: 'AddAssemblyPart',
  validate: validateForm,
  onSubmitFail: errors => {
    focusOnError(errors);
  },
  enableReinitialize: true,
  touchOnChange: true,
})(withTranslation(['PartMaster', 'MasterLabels'])(AddAssemblyPart)),
)
