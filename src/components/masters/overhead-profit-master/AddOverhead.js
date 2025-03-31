import React, { Component, } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector, clearFields } from "redux-form";
import { Row, Col, Label } from 'reactstrap';
import { required, getCodeBySplitting, number, maxPercentValue, checkWhiteSpaces, percentageLimitValidation, maxLength512, acceptAllExceptSingleSpecialCharacter } from "../../../helper/validation";
import { searchableSelect, renderTextAreaField, renderDatePicker, renderMultiSelectField, renderText } from "../../layout/FormInputs";
import { fetchCostingHeadsAPI, getPlantSelectListByType, getVendorNameByVendorSelectList } from '../../../actions/Common';
import {
  createOverhead, updateOverhead, getOverheadData, fileUploadOverHead,
} from '../actions/OverheadProfit';
import { getClientSelectList, } from '../actions/Client';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { getConfigurationKey, loggedInUserId, showBopLabel } from "../../../helper/auth";
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css'
import { CBCTypeId, FILE_URL, GUIDE_BUTTON_SHOW, SPACEBAR, VBCTypeId, VBC_VENDOR_TYPE, ZBC, ZBCTypeId, searchCount } from '../../../config/constants';
import DayTime from '../../common/DayTimeWrapper'
import LoaderCustom from '../../common/LoaderCustom';
import imgRedcross from '../../../assests/images/red-cross.png'
import { debounce } from 'lodash';
import AsyncSelect from 'react-select/async';
import { onFocus, showDataOnHover } from '../../../helper';
import { reactLocalStorage } from 'reactjs-localstorage';
import { autoCompleteDropdown, getCostingTypeIdByCostingPermission, getEffectiveDateMinDate } from '../../common/CommonFunctions';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { getRawMaterialNameChild, getRMGradeSelectListByRawMaterial } from '../actions/Material'
import { ASSEMBLY } from '../../../config/masterData';
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from './TourMessages';
import { withTranslation } from 'react-i18next';
import Button from '../../layout/Button';
import { subDays } from 'date-fns';
import { LabelsClass } from '../../../helper/core';

const selector = formValueSelector('AddOverhead');

class AddOverhead extends Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    // ********* INITIALIZE REF FOR DROPZONE ********
    this.dropzone = React.createRef();
    this.state = {
      OverheadID: '',
      isEditFlag: false,
      IsVendor: false,
      isViewMode: this.props?.data?.isViewMode ? true : false,
      isVendorNameNotSelected: false,
      selectedPlants: [],
      ModelType: [],
      vendorName: [],
      vendorCode: '',
      client: [],
      singlePlantSelected: [],
      overheadAppli: [],
      costingTypeId: ZBCTypeId,
      remarks: '',
      files: [],

      isRM: false,
      isCC: false,
      isBOP: false,
      isOverheadPercent: false,

      isHideOverhead: false,
      isHideRM: false,
      isHideCC: false,
      isHideBOP: false,
      DropdownNotChanged: true,
      DataToChange: [],
      effectiveDate: '',
      uploadAttachements: true,
      updatedObj: {},
      setDisable: false,
      inputLoader: false,
      minEffectiveDate: '',
      attachmentLoader: false,
      showErrorOnFocus: false,
      showPopup: false,
      showPartCost: false,
      vendorFilterList: [],
      RawMaterial: [],
      RMGrade: [],
      IsFinancialDataChanged: true,
      isAssemblyCheckbox: false,
    }
  }

  /**
   * @method componentDidMount
   * @description Called after rendering the component
   */
  componentDidMount() {
    this.setState({ costingTypeId: getCostingTypeIdByCostingPermission() })
    if (getCostingTypeIdByCostingPermission() === CBCTypeId) {
      this.props.getClientSelectList(() => { })
    }
    if (getConfigurationKey().IsShowRawMaterialInOverheadProfitAndICC) {
      this.props.getRawMaterialNameChild(() => { })
    }
    this.props.getPlantSelectListByType(ZBC, "MASTER", '', () => { })
    this.props.fetchCostingHeadsAPI('master', false, res => { });
    this.getDetails();
  }
  componentWillUnmount() {
    reactLocalStorage?.setObject('vendorData', [])
  }
  /**
    * @method onPressVendor
    * @description Used for Vendor checked
    */
  onPressVendor = (costingHeadFlag) => {
    const fieldsToClear = [
      'vendorName',
      'EffectiveDate',
      'ModelType',
      'Plant',
      'DestinationPlant',
      'clientName',
      'OverheadApplicability',
      'OverheadPercentage',
      'OverheadRMPercentage',
      'OverheadCCPercentage',
      'OverheadBOPPercentage',
      'RawMaterialGradeId',
      'RawMaterialId',
    ];
    fieldsToClear.forEach(fieldName => {
      this.props.dispatch(clearFields('AddOverhead', false, false, fieldName));
    });
    this.setState({
      vendorName: [],
      costingTypeId: costingHeadFlag
    });
    if (costingHeadFlag === CBCTypeId) {
      this.props.getClientSelectList(() => { })
    }
  }
  /**
  * @method handleModelTypeChange
  * @description called
  */
  handleModelTypeChange = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ ModelType: newValue, });
    } else {
      this.setState({ ModelType: [], })
    }
    if (this.state.ModelType.value === Number(newValue.value)) {
      this.setState({ DropdownNotChanged: true, IsFinancialDataChanged: false, })
    }
    else {
      this.setState({ DropdownNotChanged: false, IsFinancialDataChanged: true })
    }
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
  * @method handlePlant
  * @description Used handle plants
  */
  handlePlant = (e) => {
    this.setState({ selectedPlants: e })
    this.setState({ DropdownNotChanged: false })
  }
  handleSinglePlant = (newValue) => {
    this.setState({ singlePlantSelected: newValue })
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
        OverheadID: data.Id,
      })
      this.props.getOverheadData(data.Id, res => {
        if (res && res.data && res.data.Result) {

          const Data = res.data.Data;
          this.setState({ DataToChange: Data })
          this.props.change('EffectiveDate', DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '')
          this.setState({ minEffectiveDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '' })
          setTimeout(() => {
            const { costingHead } = this.props;
            const AppliObj = costingHead && costingHead.find(item => Number(item.Value) === Data.OverheadApplicabilityId)
            // let Head = '';
            // if (Data.costingTypeId === VBCTypeId && Data.VendorId != null) {
            //   Head = 'vendor';
            // } else if (Data.IsClient === true) {
            //   Head = 'client';
            // } else {
            //   Head = 'zero';
            // }

            this.setState({
              IsFinancialDataChanged: false,
              isEditFlag: true,
              // isLoader: false,
              // IsVendor: Data.IsClient ? Data.IsClient : Data.IsVendor,
              // costingHead: Head,
              costingTypeId: Data.CostingTypeId,
              ModelType: Data.ModelType !== undefined ? { label: Data.ModelType, value: Data.ModelTypeId } : [],
              vendorName: Data.VendorName && Data.VendorName !== undefined ? { label: `${Data.VendorName}`, value: Data.VendorId } : [],
              client: Data.CustomerName !== undefined ? { label: Data.CustomerName, value: Data.CustomerId } : [],
              overheadAppli: AppliObj && AppliObj !== undefined ? { label: AppliObj.Text, value: AppliObj.Value } : [],
              remarks: Data.Remark,
              files: Data.Attachements,
              effectiveDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '',
              selectedPlants: Data && Data.Plants[0] && Data.Plants[0].PlantId ? [{ Text: Data.Plants[0].PlantName, Value: Data.Plants[0].PlantId }] : [],
              singlePlantSelected: Data && Data.Plants[0] && Data.Plants[0]?.PlantId ? { label: Data.Plants[0]?.PlantName, value: Data.Plants[0]?.PlantId } : {},
              RawMaterial: Data.RawMaterialName !== undefined ? { label: Data.RawMaterialName, value: Data.RawMaterialChildId } : [],
              RMGrade: Data.RawMaterialGrade !== undefined ? { label: Data.RawMaterialGrade, value: Data.RawMaterialGradeId } : [],
              isAssemblyCheckbox: Data.TechnologyId === ASSEMBLY ? true : false
            }, () => {
              this.checkOverheadFields()
              this.setState({ isLoader: false })
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
    } else {
      this.setState({
        isLoader: false,
      })
      this.props.getOverheadData('', res => { })
    }
  }

  /**
   * @method renderListing
   * @description Used to show type of listing
   */
  renderListing = (label) => {
    const { clientSelectList, modelTypes, plantSelectList, costingHead, rawMaterialNameSelectList, gradeSelectList } = this.props;
    const temp = [];
    const excludedItems = ['RM', 'RM + CC', 'RM + CC + BOP', 'RM + BOP'];
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

    if (label === 'ModelType') {
      modelTypes && modelTypes.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }

    if (label === 'OverheadApplicability') {
      costingHead && costingHead.map(item => {
        if (item.Value === '0' || item.Text === 'Net Cost') return false;
         if (!this.state.isAssemblyCheckbox && item.Text.includes('Part Cost')) {
          return false;
        }if (this.state.isAssemblyCheckbox && excludedItems.includes(item.Text)) {
          return false;
        }temp.push({ label: item.Text, value: item.Value });
        return null;
      });
      return temp;
    }

    if (label === 'ClientList') {
      clientSelectList && clientSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
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
  }

  /**
  * @method handleVendorName
  * @description called
  */
  handleVendorName = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ vendorName: newValue, isVendorNameNotSelected: false });
    } else {
      this.setState({ vendorName: [] })
    }
    this.setState({ DropdownNotChanged: false })
  };

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

  componentDidUpdate(prevProps) {

    if (prevProps.filedObj !== this.props.filedObj) {

      const { filedObj } = this.props;
      const OverheadPercentage = filedObj && filedObj.OverheadPercentage !== undefined && filedObj.OverheadPercentage !== '' && filedObj.OverheadPercentage !== null ? true : false;
      const OverheadRMPercentage = filedObj && filedObj.OverheadRMPercentage !== undefined && filedObj.OverheadRMPercentage !== '' && filedObj.OverheadRMPercentage !== null ? true : false;
      const OverheadCCPercentage = filedObj && filedObj.OverheadCCPercentage !== undefined && filedObj.OverheadCCPercentage !== '' && filedObj.OverheadCCPercentage !== null ? true : false;
      const OverheadBOPPercentage = filedObj && filedObj.OverheadBOPPercentage !== undefined && filedObj.OverheadBOPPercentage !== '' && filedObj.OverheadBOPPercentage !== null ? true : false;

      if (OverheadPercentage) {
        this.setState({ isRM: true, isCC: true, isBOP: true, })
      } else if (OverheadRMPercentage || OverheadCCPercentage || OverheadBOPPercentage) {
        this.setState({ isOverheadPercent: true })
      } else {
        this.checkOverheadFields()
      }
    }
  }

  /**
  * @method handleOverheadChange
  * @description called
  */
  handleOverheadChange = (newValue, actionMeta) => {
    this.resetFields();
    if (newValue && newValue !== '') {
      if (newValue?.label?.includes('Part Cost')) {
        this.setState({ showPartCost: true })
      }
      else {
        this.setState({ showPartCost: false })
      }
      this.setState({ overheadAppli: newValue, isRM: false, isCC: false, isBOP: false, isOverheadPercent: false }, () => {
        this.checkOverheadFields()
      });
    } else {
      this.setState({
        overheadAppli: [],
        isRM: false,
        isCC: false,
        isBOP: false,
        isOverheadPercent: false,
        isHideOverhead: false,
        isHideBOP: false,
        isHideCC: false,
        isHideRM: false,
      })
    }
    if (this.state.isEditFlag && this.state.overheadAppli.value === newValue.value) {
      this.setState({ DropdownNotChanged: true, IsFinancialDataChanged: false })
    }
    else if (this.state.isEditFlag) {
      this.setState({ DropdownNotChanged: false, IsFinancialDataChanged: true })
    }
  };

  /**
  * @method handleChangeOverheadPercentage
  * @description called
  */
  handleChangeOverheadPercentage = (newValue) => {
    if (this.state.isEditFlag) {
      if (String(newValue) === String(this.state.DataToChange.OverheadPercentage) &&
        String(this.state.overheadAppli.label) === String(this.state.DataToChange.OverheadApplicabilityType) &&
        String(this.state.ModelType.label) === String(this.state.DataToChange.ModelType)) {
        this.setState({ IsFinancialDataChanged: false })
      } else {
        this.setState({ IsFinancialDataChanged: true })
      }
    }
  };

  /**
  * @method handleChangeOverheadPercentageRM
  * @description called
  */
  handleChangeOverheadPercentageRM = (newValue) => {
    if (this.state.isEditFlag) {
      if (String(newValue) === String(this.state.DataToChange.OverheadRMPercentage) &&
        String(this.state.overheadAppli.label) === String(this.state.DataToChange.OverheadApplicabilityType) &&
        String(this.state.ModelType.label) === String(this.state.DataToChange.ModelType)) {
        this.setState({ IsFinancialDataChanged: false })
      } else {
        this.setState({ IsFinancialDataChanged: true })
      }
    }
  };

  /**
  * @method handleChangeOverheadPercentageCC
  * @description called
  */
  handleChangeOverheadPercentageCC = (newValue) => {
    if (this.state.isEditFlag) {
      if (String(newValue) === String(this.state.DataToChange.OverheadCCPercentage) &&
        String(this.state.overheadAppli.label) === String(this.state.DataToChange.OverheadApplicabilityType) &&
        String(this.state.ModelType.label) === String(this.state.DataToChange.ModelType)) {
        this.setState({ IsFinancialDataChanged: false })
      } else {
        this.setState({ IsFinancialDataChanged: true })
      }
    }
  };

  /**
  * @method handleChangeOverheadPercentageBOP
  * @description called
  */
  handleChangeOverheadPercentageBOP = (newValue) => {
    if (this.state.isEditFlag) {
      if (String(newValue) === String(this.state.DataToChange.OverheadBOPPercentage) &&
        String(this.state.overheadAppli.label) === String(this.state.DataToChange.OverheadApplicabilityType) &&
        String(this.state.ModelType.label) === String(this.state.DataToChange.ModelType)) {
        this.setState({ IsFinancialDataChanged: false })
      } else {
        this.setState({ IsFinancialDataChanged: true })
      }
    }
  };
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
          false,
          (res) => { },
        )
      })
    } else {
      this.setState({ RMGrade: [], RMSpec: [], RawMaterial: [] })
      this.props.getRMGradeSelectListByRawMaterial('', false, (res) => { })
      this.props.fetchSpecificationDataAPI(0, () => { })
    }
  }

  /**
   * @method handleGradeChange
   * @description  used to handle row material grade selection
   */
  handleGradeChange = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ RMGrade: newValue })
    } else {
      this.setState({
        RMGrade: [],
      })
    }
  }
  handlePercent = (e) => {
    // if (e.target.value > 100) {
    //   Toaster.warning('Overhead Percent can not be greater than 100.')
    //   $('input[name="OverheadPercentage"]').focus()
    // }
  }

  resetFields = () => {
    this.props.change('OverheadPercentage', '')
    this.props.change('OverheadCCPercentage', '')
    this.props.change('OverheadBOPPercentage', '')
    this.props.change('OverheadRMPercentage', '')
  }

  checkOverheadFields = () => {
    const { overheadAppli } = this.state;
    switch (overheadAppli.label) {
      case 'RM':
      case 'Part Cost':
        return this.setState({
          isRM: false,
          isCC: true,
          isBOP: true,
          isOverheadPercent: true,
          isHideOverhead: true,
          isHideRM: false,
          isHideCC: true,
          isHideBOP: true,
        })
      case 'CC':
        return this.setState({
          isRM: true,
          isCC: false,
          isBOP: true,
          isOverheadPercent: true,
          isHideOverhead: true,
          isHideRM: true,
          isHideCC: false,
          isHideBOP: true,
        })
      case 'BOP':
        return this.setState({
          isRM: true,
          isBOP: false,
          isCC: true,
          isOverheadPercent: true,
          isHideOverhead: true,
          isHideRM: true,
          isHideCC: true,
          isHideBOP: false,
        })
      case 'Fixed':
        return this.setState({
          isRM: true,
          isCC: true,
          isBOP: true,
          isOverheadPercent: true,
          isHideOverhead: true,
          isHideRM: true,
          isHideCC: true,
          isHideBOP: true,
        })
      case 'RM + CC':
      case 'Part Cost + CC':
        return this.setState({
          isRM: false,
          isCC: false,
          isBOP: true,
          isOverheadPercent: false,
          isHideOverhead: false,
          isHideBOP: true,
          isHideRM: false,
          isHideCC: false,
        })
      case 'RM + BOP':
      case 'Part Cost + BOP':
        return this.setState({
          isRM: false,
          isCC: true,
          isBOP: false,
          isOverheadPercent: false,
          isHideOverhead: false,
          isHideCC: true,
          isHideRM: false,
          isHideBOP: false,
        })
      case 'BOP + CC':
        return this.setState({
          isRM: true,
          isBOP: false,
          isCC: false,
          isOverheadPercent: false,
          isHideOverhead: false,
          isHideRM: true,
          isHideBOP: false,
          isHideCC: false,
        })
      case 'RM + CC + BOP':
      case 'Part Cost + CC + BOP':
        return this.setState({
          isRM: false,
          isCC: false,
          isBOP: false,
          isOverheadPercent: false,
          isHideOverhead: false,
          isHideBOP: false,
          isHideCC: false,
          isHideRM: false,
        })
      default:
        return 'foo';
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
  handleChangeStatus = ({ meta, file, remove }, status) => {

    this.setState({ uploadAttachements: false, setDisable: true, attachmentLoader: true })

    this.setState({ uploadAttachements: false, setDisable: true, attachmentLoader: true })

    if (status === 'removed') {
      this.deleteFile(
        file.id,
        file.name
      )
    }
    if (status === 'done') {
      let data = new FormData()
      data.append('file', file)
      this.props.fileUploadOverHead(data, (res) => {
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
      <span style={{ alignSelf: 'flex-start', margin: '10px 3%', fontColor: 'WHITE' }}>
        {/* {Math.round(percent)}% */}
      </span>
    )
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
  * @method cancel
  * @description used to Reset form
  */
  cancel = (type) => {
    const { reset } = this.props;
    reset();
    this.setState({
      remarks: '',
      IsVendor: false,
      ModelType: [],
      vendorName: [],
      overheadAppli: [],
    })
    this.props.getOverheadData('', res => { })
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
    const { client, costingTypeId, ModelType, vendorName, overheadAppli, selectedPlants, remarks, OverheadID, RMGrade,
      isRM, isCC, isBOP, isOverheadPercent, singlePlantSelected, isEditFlag, files, effectiveDate, DataToChange, DropdownNotChanged, uploadAttachements, RawMaterial, IsFinancialDataChanged } = this.state;
    const userDetailsOverhead = JSON.parse(localStorage.getItem('userDetail'))
    let plantArray = []
    if (costingTypeId === VBCTypeId) {
      plantArray.push({ PlantName: singlePlantSelected.label, PlantId: singlePlantSelected.value })
    } else {
      selectedPlants && selectedPlants.map((item) => {
        plantArray.push({ PlantName: item.Text, PlantId: item.Value })
        return plantArray
      })
    }
    let cbcPlantArray = []
    if (getConfigurationKey().IsCBCApplicableOnPlant && costingTypeId === CBCTypeId) {
      cbcPlantArray.push({ PlantName: singlePlantSelected.label, PlantId: singlePlantSelected.value, PlantCode: '', })
    }
    else {
      userDetailsOverhead?.Plants.map((item) => {
        cbcPlantArray.push({ PlantName: item.PlantName, PlantId: item.PlantId, PlantCode: item.PlantCode, })
        return cbcPlantArray
      })
    }
    if (vendorName.length <= 0) {

      if (costingTypeId === VBCTypeId) {
        this.setState({ isVendorNameNotSelected: true, setDisable: false })      // IF VENDOR NAME IS NOT SELECTED THEN WE WILL SHOW THE ERROR MESSAGE MANUALLY AND SAVE BUTTON WILL NOT BE DISABLED
        return false
      }
    }
    this.setState({ isVendorNameNotSelected: false })

    if (isEditFlag) {

      if (values.OverheadPercentage === '') {
        values.OverheadPercentage = null
      }
      if (values.OverheadRMPercentage === '') {
        values.OverheadRMPercentage = null
      }
      if (values.OverheadCCPercentage === '') {
        values.OverheadCCPercentage = null
      }
      if (values.OverheadBOPPercentage === '') {
        values.OverheadBOPPercentage = null
      }

      if (
        (JSON.stringify(files) === JSON.stringify(DataToChange.Attachements)) && DropdownNotChanged && Number(DataToChange.OverheadPercentage) === Number(values.OverheadPercentage) && Number(DataToChange.OverheadRMPercentage) === Number(values.OverheadRMPercentage)
        && Number(DataToChange.OverheadCCPercentage) === Number(values.OverheadCCPercentage) && Number(DataToChange.OverheadBOPPercentage) === Number(values.OverheadBOPPercentage)
        && String(DataToChange.Remark) === String(values.Remark) && uploadAttachements) {
        this.cancel('cancel')
        return false
      }
      this.setState({ setDisable: true })
      let updatedFiles = files.map((file) => {
        return { ...file, ContextId: OverheadID }
      })
      let requestData = {
        OverheadId: OverheadID,
        CostingTypeId: costingTypeId,
        VendorName: costingTypeId === VBCTypeId ? vendorName.label : '',
        IsClient: costingTypeId === CBCTypeId ? true : false,
        CustomerName: costingTypeId === CBCTypeId ? client.label : '',
        OverheadApplicabilityType: overheadAppli.label,
        ModelType: ModelType.label,
        IsCombinedEntry: !isOverheadPercent ? true : false,
        OverheadPercentage: values.OverheadPercentage,
        OverheadMachiningCCPercentage: values.OverheadCCPercentage,
        OverheadBOPPercentage: values.OverheadBOPPercentage,
        OverheadRMPercentage: values.OverheadRMPercentage,
        Remark: remarks,
        VendorId: costingTypeId === VBCTypeId ? vendorName.value : '',
        VendorCode: costingTypeId === VBCTypeId ? getCodeBySplitting(vendorName.label) : '',
        CustomerId: costingTypeId === CBCTypeId ? client.value : '',
        OverheadApplicabilityId: overheadAppli.value,
        ModelTypeId: ModelType.value,
        IsActive: true,
        CreatedDate: '',
        CreatedBy: loggedInUserId(),
        Attachements: updatedFiles,
        EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
        IsForcefulUpdated: true,
        Plants: costingTypeId === CBCTypeId ? cbcPlantArray : plantArray,
        RawMaterialChildId: RawMaterial?.value,
        RawMaterialName: RawMaterial?.label,
        RawMaterialGradeId: RMGrade?.value,
        RawMaterialGrade: RMGrade?.label,
        IsFinancialDataChanged: IsFinancialDataChanged
      }
      if (isEditFlag && IsFinancialDataChanged) {
        if (DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss') === DayTime(DataToChange?.EffectiveDate).format('YYYY-MM-DD HH:mm:ss')) {
          Toaster.warning('Please update the effective date')
          this.setState({ setDisable: false })
          return false
        }
      }
      this.props.updateOverhead(requestData, (res) => {
        this.setState({ setDisable: false })
        if (res?.data?.Result) {
          Toaster.success(MESSAGES.OVERHEAD_UPDATE_SUCCESS);
          this.cancel('submit')
        }
      });
    } else {
      this.setState({ setDisable: true })
      const formData = {
        EAttachementEntityName: 0,
        CostingTypeId: costingTypeId,
        IsCombinedEntry: !isOverheadPercent ? true : false,
        OverheadPercentage: !isOverheadPercent ? values.OverheadPercentage : '',
        OverheadMachiningCCPercentage: !isCC ? values.OverheadCCPercentage : '',
        OverheadBOPPercentage: !isBOP ? values.OverheadBOPPercentage : '',
        OverheadRMPercentage: !isRM ? values.OverheadRMPercentage : '',
        Remark: remarks,
        VendorId: costingTypeId === VBCTypeId ? vendorName.value : '',
        VendorCode: costingTypeId === VBCTypeId ? getCodeBySplitting(vendorName.label) : '',
        CustomerId: costingTypeId === CBCTypeId ? client.value : '',
        OverheadApplicabilityId: overheadAppli.value,
        ModelTypeId: ModelType.value,
        IsActive: true,
        CreatedDate: '',
        CreatedBy: loggedInUserId(),
        Attachements: files,
        Plants: costingTypeId === CBCTypeId ? cbcPlantArray : plantArray,
        EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
        RawMaterialChildId: RawMaterial?.value,
        RawMaterialName: RawMaterial?.label,
        RawMaterialGradeId: RMGrade?.value,
        RawMaterialGrade: RMGrade?.label,
        IsFinancialDataChanged: IsFinancialDataChanged,
        TechnologyId: this.state.isAssemblyCheckbox ? ASSEMBLY : null
      }

      this.props.createOverhead(formData, (res) => {
        this.setState({ setDisable: false })
        if (res?.data?.Result) {
          Toaster.success(MESSAGES.OVERHEAD_ADDED_SUCCESS);
          this.cancel('submit');
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
  * @method onPressAssemblyCheckbox
  * @description Used for Surface Treatment
  */
  onPressAssemblyCheckbox = () => {
    this.setState({ 
      isAssemblyCheckbox: !this.state.isAssemblyCheckbox,
      overheadAppli: [], 
      isRM: false,
      isCC: false,
      isBOP: false,
      isOverheadPercent: false,
      isHideOverhead: false,
      isHideBOP: false,
      isHideCC: false,
      isHideRM: false
    });
    
    this.props.change('OverheadApplicability', '');
  };
  
  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { handleSubmit, t } = this.props;
    const { isRM, isCC, isBOP, isOverheadPercent, isEditFlag, isHideOverhead, isHideBOP, isHideRM, isHideCC, isViewMode, setDisable, IsFinancialDataChanged, costingTypeId } = this.state;
    const VendorLabel = LabelsClass(t, 'MasterLabels').vendorLabel;

    const filterList = async (inputValue) => {
      const { vendorFilterList } = this.state
      if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
        inputValue = inputValue.trim();
      }
      const resultInput = inputValue.slice(0, searchCount)
      if (inputValue?.length >= searchCount && vendorFilterList !== resultInput) {
        this.setState({ inputLoader: true })
        let res
        res = await getVendorNameByVendorSelectList(VBC_VENDOR_TYPE, resultInput)
        this.setState({ inputLoader: false })
        this.setState({ vendorFilterList: resultInput })
        let vendorDataAPI = res?.data?.SelectList
        if (inputValue) {
          return autoCompleteDropdown(inputValue, vendorDataAPI, false, [], true)
        } else {
          return vendorDataAPI
        }
      }
      else {
        if (inputValue?.length < searchCount) return false
        else {
          let VendorData = reactLocalStorage?.getObject('Data')
          if (inputValue) {
            return autoCompleteDropdown(inputValue, VendorData, false, [], false)
          } else {
            return VendorData
          }
        }
      }
    };
    return (
      <>
        {this.state.isLoader && <LoaderCustom />}
        <div className="container-fluid">
          <div className="login-container signup-form">
            <div className="row">
              <div className="col-md-12">
                <div className="shadow-lgg login-formg">
                  <div className="row">
                    <div className="col-md-6">
                      <h1>{isViewMode ? "View" : isEditFlag ? "Update" : "Add"} Overhead Details
                        {!isViewMode && <TourWrapper
                          buttonSpecificProp={{ id: "Add_Overhead_Form" }}
                          stepsSpecificProp={{
                            steps: Steps(t, { isEditFlag: isEditFlag, vendorField: (costingTypeId === VBCTypeId), customerField: (costingTypeId === CBCTypeId), plantField: (costingTypeId === ZBCTypeId && getConfigurationKey().IsPlantRequiredForOverheadProfitInterestRate), destinationPlant: (costingTypeId === VBCTypeId && getConfigurationKey().IsDestinationPlantConfigure) || (costingTypeId === CBCTypeId && getConfigurationKey().IsCBCApplicableOnPlant), isHideOverhead: isHideOverhead, isHideBOP: isHideBOP, isHideRM: isHideRM, isHideCC: isHideCC, isOverheadPercent: isOverheadPercent, isRM: isRM, isCC: isCC, isBOP: isBOP }).ADD_OVERHEADS_DETAILS
                          }} />}
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
                          {reactLocalStorage.getObject('CostingTypePermission').zbc && <Label id="AddOverhead_zerobased" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
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
                          </Label>}
                          {reactLocalStorage.getObject('CostingTypePermission').vbc && <Label id="AddOverhead_vendorbased" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
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
                            <span>{VendorLabel} Based</span>
                          </Label>}
                          {reactLocalStorage.getObject('CostingTypePermission').cbc && <Label id="AddOverhead_customerbased" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3 pt-0 radio-box"} check>
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
                          </Label>}
                        </Col>
                      </Row>
                      <Row>
                        {getConfigurationKey().IsShowRawMaterialInOverheadProfitAndICC &&
                          <>                        <Col md="3">
                            <div className="d-flex justify-space-between align-items-center inputwith-icon">
                              <div className="fullinput-icon">
                                <Field
                                  name="RawMaterialId"
                                  type="text"
                                  label="Raw Material Name"
                                  component={searchableSelect}
                                  placeholder={"Select"}
                                  options={this.renderListing("material")}
                                  required={false}
                                  handleChangeDescription={this.handleRMChange}
                                  valueDescription={this.state.RawMaterial}
                                  className="fullinput-icon"
                                  disabled={isEditFlag || isViewMode}
                                />
                              </div>
                            </div>
                          </Col>
                            <Col md="3">
                              <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                <div className="fullinput-icon">
                                  <Field
                                    name="RawMaterialGradeId"
                                    type="text"
                                    label="Raw Material Grade"
                                    component={searchableSelect}
                                    placeholder={"Select"}
                                    options={this.renderListing("grade")}
                                    required={false}
                                    handleChangeDescription={this.handleGradeChange}
                                    valueDescription={this.state.RMGrade}
                                    disabled={isEditFlag || isViewMode}
                                  />
                                </div>
                              </div>
                            </Col>
                          </>
                        }
                        <Col md="3" >
                          <Field
                            name="ModelType"
                            type="text"
                            label="Model Type"
                            component={searchableSelect}
                            placeholder={isEditFlag ? '-' : "Select"}
                            options={this.renderListing("ModelType")}
                            validate={
                              this.state.ModelType == null ||
                                this.state.ModelType.length === 0
                                ? [required]
                                : []
                            }
                            required={true}
                            handleChangeDescription={
                              this.handleModelTypeChange
                            }
                            valueDescription={this.state.ModelType}
                            disabled={isViewMode}
                          />
                        </Col>
                        {costingTypeId === VBCTypeId && (
                          <Col md="3" >
                            <label>{VendorLabel} (Code)<span className="asterisk-required">*</span></label>
                            <div className='p-relative vendor-loader'>
                              {this.state.inputLoader && <LoaderCustom customClass={`input-loader`} />}
                              <AsyncSelect
                                id="AddOverhead_vendorName"
                                name="vendorName"
                                ref={this.myRef}
                                key={this.state.updateAsyncDropdown}
                                loadOptions={filterList}
                                onChange={(e) => this.handleVendorName(e)}
                                value={this.state.vendorName}
                                noOptionsMessage={({ inputValue }) => inputValue.length < 3 ? MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN : "No results found"}
                                isDisabled={(isEditFlag) ? true : false}
                                onFocus={() => onFocus(this)}
                                onKeyDown={(onKeyDown) => {
                                  if (onKeyDown.keyCode === SPACEBAR && !onKeyDown.target.value) onKeyDown.preventDefault();
                                }}
                              />
                              {((this.state.showErrorOnFocus && this.state.vendorName.length === 0) || this.state.isVendorNameNotSelected) && <div className='text-help mt-1'>This field is required.</div>}
                            </div>
                          </Col>
                        )}
                        {/* {((costingTypeId === ZBCTypeId && !getConfigurationKey().IsPlantRequiredForOverheadProfitInterestRate) && ( */}
                        {((costingTypeId === ZBCTypeId) && (

                          <Col md="3">
                            <Field
                              label="Plant (Code)"
                              name="Plant"
                              placeholder={"Select"}
                              title={showDataOnHover(this.state.selectedPlants)}
                              selection={
                                this.state.selectedPlants == null || this.state.selectedPlants.length === 0 ? [] : this.state.selectedPlants}
                              options={this.renderListing("plant")}
                              selectionChanged={this.handlePlant}
                              validate={
                                this.state.selectedPlants == null || this.state.selectedPlants.length === 0 ? [required] : []}
                              required={true}
                              optionValue={(option) => option.Value}
                              optionLabel={(option) => option.Text}
                              component={renderMultiSelectField}
                              mendatory={true}
                              disabled={isEditFlag || isViewMode}
                              className="multiselect-with-border"
                            />
                          </Col>)
                        )}
                        {
                          ((costingTypeId === VBCTypeId && getConfigurationKey().IsDestinationPlantConfigure) || (costingTypeId === CBCTypeId && getConfigurationKey().IsCBCApplicableOnPlant)) &&
                          <Col md="3">
                            <Field
                              label={'Plant (Code)'}
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
                              disabled={isEditFlag || isViewMode}
                            />
                          </Col>
                        }
                        {costingTypeId === CBCTypeId && (
                          <Col md="3">
                            <Field
                              name="clientName"
                              type="text"
                              label={"Customer (Code)"}
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
                        <Col md="3" className="st-operation mt-4 pt-2">
                          <label id="AddOverhead_ApplyPartCheckbox"
                            className={`custom-checkbox ${this.state.isEditFlag ? "disabled" : ""
                              }`}
                            onChange={this.onPressAssemblyCheckbox}
                          >
                            Manage Applicabilities For Multi Technology Assembly
                            <input
                              type="checkbox"
                              checked={this.state.isAssemblyCheckbox}
                              disabled={isEditFlag ? true : false}
                            />
                            <span
                              className=" before-box"
                              checked={this.state.isAssemblyCheckbox}
                              onChange={this.onPressAssemblyCheckbox}
                            />
                          </label>
                        </Col>
                        <Col md="3" >
                          <Field
                            name="OverheadApplicability"
                            type="text"
                            label="Overhead Applicability"
                            component={searchableSelect}
                            placeholder={isEditFlag ? '-' : "Select"}
                            options={this.renderListing(
                              "OverheadApplicability"
                            )}
                            validate={
                              this.state.overheadAppli == null ||
                                this.state.overheadAppli.length === 0
                                ? [required]
                                : []
                            }
                            required={true}
                            handleChangeDescription={
                              this.handleOverheadChange
                            }
                            valueDescription={this.state.overheadAppli}
                            disabled={isViewMode}
                          />
                        </Col>
                        {!isHideOverhead && (
                          <Col md="3">
                            <Field
                              label={`Overhead (%)`}
                              name={"OverheadPercentage"}
                              type="text"
                              placeholder={isOverheadPercent || isViewMode ? "-" : "Enter"}
                              validate={
                                !isOverheadPercent ? [required, number, maxPercentValue, checkWhiteSpaces, percentageLimitValidation] : []
                              }
                              component={renderText}
                              onBlur={this.handlePercent}
                              required={!isOverheadPercent ? true : false}
                              onChange={(event) => this.handleChangeOverheadPercentage(event.target.value)}
                              className=""
                              customClassName=" withBorder"
                              maxLength={15}
                              disabled={isOverheadPercent || isViewMode ? true : false}
                            />
                          </Col>
                        )}
                        {!isHideRM && (
                          <Col md="3">
                            <Field
                              label={`Overhead on ${this.state.showPartCost ? 'Part Cost' : 'RM'} (%)`}
                              name={"OverheadRMPercentage"}
                              type="text"
                              placeholder={isRM || isViewMode ? "-" : "Enter"}
                              validate={!isRM ? [required, number, maxPercentValue, checkWhiteSpaces, percentageLimitValidation] : []}
                              component={renderText}
                              required={!isRM ? true : false}
                              onChange={(event) => this.handleChangeOverheadPercentageRM(event.target.value)}
                              className=""
                              customClassName=" withBorder"
                              disabled={isRM || isViewMode ? true : false}
                            />
                          </Col>
                        )}
                        {!isHideCC && (
                          <Col md="3">
                            <Field
                              label={`Overhead on CC (%)`}
                              name={"OverheadCCPercentage"}
                              type="text"
                              placeholder={isCC || isViewMode ? "-" : "Enter"}
                              validate={!isCC ? [required, number, maxPercentValue, checkWhiteSpaces, percentageLimitValidation] : []}
                              component={renderText}
                              required={!isCC ? true : false}
                              onChange={(event) => this.handleChangeOverheadPercentageCC(event.target.value)}
                              className=""
                              customClassName=" withBorder"
                              disabled={isCC || isViewMode ? true : false}
                            />
                          </Col>
                        )}
                        {!isHideBOP && (
                          <Col md="3">
                            <Field
                              label={`Overhead on ${showBopLabel()} (%)`}
                              name={"OverheadBOPPercentage"}
                              type="text"
                              placeholder={isBOP || isViewMode ? "-" : "Enter"}
                              validate={!isBOP ? [required, number, maxPercentValue, checkWhiteSpaces, percentageLimitValidation] : []}
                              component={renderText}
                              required={!isBOP ? true : false}
                              onChange={(event) => this.handleChangeOverheadPercentageBOP(event.target.value)}
                              className=""
                              customClassName=" withBorder"
                              disabled={isBOP || isViewMode ? true : false}
                            />
                          </Col>
                        )}
                        <Col md="3">

                          <div className="inputbox date-section form-group">
                            <Field
                              label="Effective Date"
                              name="EffectiveDate"
                              selected={this.state.effectiveDate}
                              onChange={this.handleEffectiveDateChange}
                              type="text"
                              minDate={isEditFlag ? this.state.minEffectiveDate : getEffectiveDateMinDate()}
                              validate={[required]}
                              autoComplete={'off'}
                              required={true}
                              changeHandler={(e) => {
                              }}
                              component={renderDatePicker}
                              className="form-control"
                              disabled={isViewMode || !IsFinancialDataChanged}
                              placeholder={isViewMode || !IsFinancialDataChanged ? '-' : "Select Date"}
                            />
                          </div>
                        </Col>
                      </Row >


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
                            value={this.state.remarks}
                            className=""
                            customClassName=" textAreaWithBorder"
                            onChange={this.handleMessageChange}
                            component={renderTextAreaField}
                            validate={[maxLength512, acceptAllExceptSingleSpecialCharacter]}
                            // maxLength="512"
                            // maxLength="5000"
                            disabled={isViewMode}
                          />
                        </Col>
                        <Col md="3">
                          <label>Upload Files (upload up to {getConfigurationKey().MaxMasterFilesToUpload} files)</label>
                          <div className={`alert alert-danger mt-2 ${this.state.files.length === getConfigurationKey().MaxMasterFilesToUpload ? '' : 'd-none'}`} role="alert">
                            Maximum file upload limit reached.
                          </div>
                          <div id="AddOverhead_UploadFiles" className={`${this.state.files.length >= getConfigurationKey().MaxMasterFilesToUpload ? 'd-none' : ''}`}>
                            <Dropzone
                              ref={this.dropzone}
                              onChangeStatus={this.handleChangeStatus}
                              PreviewComponent={this.Preview}
                              accept="image/jpeg,image/jpg,image/png,image/PNG,.xls,.doc,.pdf,.xlsx"
                              initialFiles={this.state.initialFiles}
                              maxFiles={getConfigurationKey().MaxMasterFilesToUpload}
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
                    </div >
                    <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                      <div className="col-sm-12 text-right bluefooter-butn">
                        <button id="AddOverhead_Cancel"
                          type={"button"}
                          className=" mr15 cancel-btn"
                          onClick={this.cancelHandler}
                          disabled={setDisable}
                        >
                          <div className={"cancel-icon"}></div>
                          {"Cancel"}
                        </button>
                        {/* <button onClick={this.options}>13</button> */}
                        {!isViewMode && <button id="AddOverhead_Save"
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
              </div>
            </div>
          </div>
        </div>
        {
          this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.CANCEL_MASTER_ALERT}`} />
        }
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
  const { comman, overheadProfit, client, supplier, material } = state;
  const filedObj = selector(state, 'OverheadPercentage', 'OverheadRMPercentage', 'OverheadCCPercentage',
    'OverheadBOPPercentage')

  const { modelTypes, costingHead, plantSelectList } = comman;
  const { overheadProfitData, } = overheadProfit;
  const { clientSelectList } = client;
  const { vendorWithVendorCodeSelectList } = supplier;
  const { rawMaterialNameSelectList, gradeSelectList } = material
  let initialValues = {};
  if (overheadProfitData && overheadProfitData !== undefined) {
    initialValues = {
      OverheadPercentage: overheadProfitData.OverheadPercentage !== null ? overheadProfitData.OverheadPercentage : '',
      OverheadRMPercentage: overheadProfitData.OverheadRMPercentage !== null ? overheadProfitData.OverheadRMPercentage : '',
      OverheadCCPercentage: overheadProfitData.OverheadMachiningCCPercentage !== null ? overheadProfitData.OverheadMachiningCCPercentage : '',
      OverheadBOPPercentage: overheadProfitData.OverheadBOPPercentage !== null ? overheadProfitData.OverheadBOPPercentage : '',
      Remark: overheadProfitData.Remark,
    }
  }

  return {
    modelTypes, costingHead, overheadProfitData, clientSelectList,
    vendorWithVendorCodeSelectList, filedObj, initialValues, plantSelectList, rawMaterialNameSelectList, gradeSelectList
  }

}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
  fetchCostingHeadsAPI,
  getClientSelectList,
  getPlantSelectListByType,
  createOverhead,
  updateOverhead,
  getOverheadData,
  fileUploadOverHead,
  getVendorNameByVendorSelectList,
  getRawMaterialNameChild,
  getRMGradeSelectListByRawMaterial
})(reduxForm({
  form: 'AddOverhead',
  enableReinitialize: true,
})(withTranslation(['OverheadsProfits', 'MasterLabels'])(AddOverhead)),
)
