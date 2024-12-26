import React, { Component, } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector, clearFields } from "redux-form";
import { Row, Col, Label } from 'reactstrap';
import { required, getCodeBySplitting, maxLength512, number, maxPercentValue, checkWhiteSpaces, percentageLimitValidation, acceptAllExceptSingleSpecialCharacter, validateFileName } from "../../../helper/validation";
import { searchableSelect, renderTextAreaField, renderDatePicker, renderMultiSelectField, renderText, validateForm } from "../../layout/FormInputs";
import { fetchCostingHeadsAPI, getPlantSelectListByType, getVendorNameByVendorSelectList } from '../../../actions/Common';
import {
  createProfit, updateProfit, getProfitData, fileUploadProfit,
} from '../actions/OverheadProfit';
import { getClientSelectList, } from '../actions/Client';
import Toaster from '../../common/Toaster';
import { AttachmentValidationInfo, MESSAGES } from '../../../config/message';
import { getConfigurationKey, loggedInUserId, showBopLabel } from "../../../helper/auth";
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css'
import { CBCTypeId, FILE_URL, GUIDE_BUTTON_SHOW, SPACEBAR, VBCTypeId, VBC_VENDOR_TYPE, ZBC, ZBCTypeId, searchCount } from '../../../config/constants';
import DayTime from '../../common/DayTimeWrapper'
import LoaderCustom from '../../common/LoaderCustom';
import attachClose from '../../../assests/images/red-cross.png'
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

const selector = formValueSelector('AddProfit');

class AddProfit extends Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    // ********* INITIALIZE REF FOR DROPZONE ********
    this.dropzone = React.createRef();
    this.state = {
      ProfitID: '',
      isShowForm: false,
      isEditFlag: false,
      isViewMode: this.props?.data?.isViewMode ? true : false,
      isVendorNameNotSelected: false,
      singlePlantSelected: [],
      ModelType: [],
      vendorName: [],
      client: [],
      costingTypeId: ZBCTypeId,
      profitAppli: [],

      remarks: '',
      files: [],

      isRM: false,
      isCC: false,
      isBOP: false,
      isProfitPercent: false,
      IsFinancialDataChanged: true,
      isHideProfit: false,
      isHideRM: false,
      isHideCC: false,
      isHideBOP: false,
      effectiveDate: '',
      DropdownNotChanged: true,
      DataToChange: [],
      uploadAttachements: true,
      updatedObj: {},
      setDisable: false,
      inputLoader: false,
      minEffectiveDate: '',
      isDataChanged: this.props.data.isEditFlag,
      attachmentLoader: false,
      vendorCode: "",
      showErrorOnFocus: false,
      showPopup: false,
      showPartCost: false,
      vendorFilterList: [],
      RawMaterial: [],
      RMGrade: [],
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
      'ProfitApplicabilityId',
      'ProfitPercentage',
      'ProfitRMPercentage',
      'ProfitCCPercentage',
      'ProfitBOPPercentage',
      'RawMaterialGradeId',
      'RawMaterialId',
    ];
    fieldsToClear.forEach(fieldName => {
      this.props.dispatch(clearFields('AddProfit', false, false, fieldName));
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
      remarks: e?.target?.value
    })
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
        ProfitID: data.Id,
      })
      this.props.getProfitData(data.Id, res => {
        if (res && res.data && res.data.Result) {

          const Data = res.data.Data;
          this.setState({ DataToChange: Data })
          Data?.ProfitApplicabilityType === "Part Cost" ? this.setState({ showPartCost: true }) : this.setState({ showPartCost: false })
          this.props.change('EffectiveDate', DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '')
          this.setState({ minEffectiveDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '' })
          setTimeout(() => {
            const { costingHead } = this.props;

            const AppliObj = costingHead && costingHead.find(item => Number(item.Value) === Data.ProfitApplicabilityId)
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
              costingTypeId: Data.CostingTypeId,
              ModelType: Data.ModelType !== undefined ? { label: Data.ModelType, value: Data.ModelTypeId } : [],
              vendorName: Data.VendorName && Data.VendorName !== undefined ? { label: `${Data.VendorName}`, value: Data.VendorId } : [],
              client: Data.CustomerName !== undefined ? { label: Data.CustomerName, value: Data.CustomerId } : [],
              profitAppli: AppliObj && AppliObj !== undefined ? { label: AppliObj.Text, value: AppliObj.Value } : [],
              remarks: Data.Remark,
              files: Data.Attachements,
              effectiveDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '',
              vendorCode: (Data.VendorCode && Data.VendorCode !== undefined) ? Data.VendorCode : "",
              selectedPlants: Data && Data.Plants[0] && Data.Plants[0].PlantId ? [{ Text: Data.Plants[0].PlantName, Value: Data.Plants[0].PlantId }] : [],
              singlePlantSelected: Data && Data.Plants[0] && Data.Plants[0].PlantId ? { label: Data.Plants[0].PlantName, value: Data.Plants[0].PlantId } : {},
              RawMaterial: Data.RawMaterialName !== undefined ? { label: Data.RawMaterialName, value: Data.RawMaterialChildId } : [],
              RMGrade: Data.RawMaterialGrade !== undefined ? { label: Data.RawMaterialGrade, value: Data.RawMaterialGradeId } : [],
              isAssemblyCheckbox: Data.TechnologyId === ASSEMBLY ? true : false

            }, () => {
              this.checkProfitFields()
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
      this.props.getProfitData('', res => { })
    }
  }

  /**
  * @method renderListing
  * @description Used to show type of listing
  */
  renderListing = (label) => {
    const { modelTypes, costingHead, clientSelectList, plantSelectList, rawMaterialNameSelectList, gradeSelectList } = this.props;
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

    if (label === 'ProfitApplicability') {
      costingHead && costingHead.map(item => {
        if (item.Value === '0' || item.Text === 'Net Cost') return false;
        if (this.state.isAssemblyCheckbox && excludedItems.includes(item.Text)) return false
        temp.push({ label: item.Text, value: item.Value })
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

  componentDidUpdate(prevProps) {
    if (prevProps.filedObj !== this.props.filedObj) {
      const { filedObj } = this.props;
      const ProfitPercentage = filedObj && filedObj.ProfitPercentage !== undefined && filedObj.ProfitPercentage !== '' && filedObj.ProfitPercentage !== null ? true : false;
      const ProfitRMPercentage = filedObj && filedObj.ProfitRMPercentage !== undefined && filedObj.ProfitRMPercentage !== '' && filedObj.ProfitRMPercentage !== null ? true : false;
      const ProfitCCPercentage = filedObj && filedObj.ProfitCCPercentage !== undefined && filedObj.ProfitCCPercentage !== '' && filedObj.ProfitCCPercentage !== null ? true : false;
      const ProfitBOPPercentage = filedObj && filedObj.ProfitBOPPercentage !== undefined && filedObj.ProfitBOPPercentage !== '' && filedObj.ProfitBOPPercentage !== null ? true : false;
      if (ProfitPercentage) {
        this.setState({ isRM: true, isCC: true, isBOP: true, })
      } else if (ProfitRMPercentage || ProfitCCPercentage || ProfitBOPPercentage) {
        this.setState({ isProfitPercent: true })
      } else {
        this.checkProfitFields()
      }

    }
  }
  componentWillUnmount() {
    reactLocalStorage?.setObject('vendorData', [])
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
  * @method handleProfitChange
  * @description called
  */
  handleProfitChange = (newValue, actionMeta) => {
    this.resetFields();
    if (newValue && newValue !== '') {
      if (newValue?.label?.includes('Part Cost')) {
        this.setState({ showPartCost: true })
      }
      else {
        this.setState({ showPartCost: false })
      }
      this.setState({ profitAppli: newValue, isRM: false, isCC: false, isBOP: false, isProfitPercent: false }, () => {
        this.checkProfitFields()
      });
    } else {
      this.setState({
        profitAppli: [],
        isRM: false,
        isCC: false,
        isBOP: false,
        isProfitPercent: false,
        isHideBOP: false,
        isHideCC: false,
        isHideRM: false,
      })
    }
    if (this.state.isEditFlag && this.state.profitAppli.value === newValue.value) {
      this.setState({ DropdownNotChanged: true, IsFinancialDataChanged: false })
    }
    else if (this.state.isEditFlag) {
      this.setState({ DropdownNotChanged: false, IsFinancialDataChanged: true })
    }
  };

  /**
  * @method handleChangeProfitPercentage
  * @description called
  */
  handleChangeProfitPercentage = (newValue) => {
    if (this.state.isEditFlag) {
      if (String(newValue) === String(this.state.DataToChange.ProfitPercentage) &&
        String(this.state.profitAppli.label) === String(this.state.DataToChange.ProfitApplicabilityType) &&
        String(this.state.ModelType.label) === String(this.state.DataToChange.ModelType)) {
        this.setState({ IsFinancialDataChanged: false })
      } else {
        this.setState({ IsFinancialDataChanged: true })

      }

    }
  };

  /**
  * @method handleChangeProfitPercentageRM
  * @description called
  */
  handleChangeProfitPercentageRM = (newValue) => {
    if (this.state.isEditFlag) {
      if (String(newValue) === String(this.state.DataToChange.ProfitRMPercentage) &&
        String(this.state.profitAppli.label) === String(this.state.DataToChange.ProfitApplicabilityType) &&
        String(this.state.ModelType.label) === String(this.state.DataToChange.ModelType)) {
        this.setState({ IsFinancialDataChanged: false })
      } else {
        this.setState({ IsFinancialDataChanged: true })

      }

    }
  };

  /**
  * @method handleChangeProfitPercentageCC
  * @description called
  */
  handleChangeProfitPercentageCC = (newValue) => {
    if (this.state.isEditFlag) {
      if (String(newValue) === String(this.state.DataToChange.ProfitCCPercentage) &&
        String(this.state.profitAppli.label) === String(this.state.DataToChange.ProfitApplicabilityType) &&
        String(this.state.ModelType.label) === String(this.state.DataToChange.ModelType)) {
        this.setState({ IsFinancialDataChanged: false })
      } else {
        this.setState({ IsFinancialDataChanged: true })

      }

    }
  };

  /**
  * @method handleChangeProfitPercentageBOP
  * @description called
  */
  handleChangeProfitPercentageBOP = (newValue) => {
    if (this.state.isEditFlag) {
      if (String(newValue) === String(this.state.DataToChange.ProfitBOPPercentage) &&
        String(this.state.profitAppli.label) === String(this.state.DataToChange.ProfitApplicabilityType) &&
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
    if (e.target.value > 100) {
      Toaster.warning('Profit Percent can not be greater than 100.')
    }
  }

  resetFields = () => {
    this.props.change('ProfitPercentage', '')
    this.props.change('ProfitCCPercentage', '')
    this.props.change('ProfitBOPPercentage', '')
    this.props.change('ProfitRMPercentage', '')
  }

  checkProfitFields = () => {
    const { profitAppli } = this.state;

    switch (profitAppli.label) {
      case 'RM':
      case 'Part Cost':
        return this.setState({
          isRM: false,
          isCC: true,
          isBOP: true,
          isProfitPercent: true,
          isHideProfit: true,
          isHideRM: false,
          isHideCC: true,
          isHideBOP: true,
        })
      case 'CC':
        return this.setState({
          isRM: true,
          isCC: false,
          isBOP: true,
          isProfitPercent: true,
          isHideProfit: true,
          isHideRM: true,
          isHideCC: false,
          isHideBOP: true,
        })
      case 'BOP':
        return this.setState({
          isRM: true,
          isBOP: false,
          isCC: true,
          isProfitPercent: true,
          isHideProfit: true,
          isHideRM: true,
          isHideCC: true,
          isHideBOP: false,
        })
      case 'Fixed':
        return this.setState({
          isRM: true,
          isCC: true,
          isBOP: true,
          isProfitPercent: true,
          isHideProfit: true,
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
          isProfitPercent: false,
          isHideProfit: false,
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
          isProfitPercent: false,
          isHideProfit: false,
          isHideCC: true,
          isHideRM: false,
          isHideBOP: false,
        })
      case 'BOP + CC':
        return this.setState({
          isRM: true,
          isBOP: false,
          isCC: false,
          isProfitPercent: false,
          isHideProfit: false,
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
          isProfitPercent: false,
          isHideProfit: false,
          isHideBOP: false,
          isHideCC: false,
          isHideRM: false,
        })
      default:
        return 'foo';
    }
  }

  formToggle = () => {
    this.setState({
      isShowForm: !this.state.isShowForm
    })
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
      this.props.fileUploadProfit(data, (res) => {
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
  * @description used to Cancel form
  */
  cancel = (type) => {
    const { reset } = this.props;
    reset();
    this.setState({
      remarks: '',
      isShowForm: false,
      IsVendor: false,
      ModelType: [],
      vendorName: [],
      profitAppli: [],
    })
    this.props.getProfitData('', res => { })
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
    const { ModelType, costingTypeId, vendorName, client, selectedPlants, profitAppli, remarks, ProfitID,
      isRM, isCC, isBOP, isProfitPercent, isEditFlag, files, singlePlantSelected, effectiveDate, DataToChange, DropdownNotChanged, uploadAttachements, RawMaterial, RMGrade, IsFinancialDataChanged } = this.state;
    const userDetailsProfit = JSON.parse(localStorage.getItem('userDetail'))
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
      userDetailsProfit?.Plants.map((item) => {
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



      if (values.ProfitBOPPercentage === '') {
        values.ProfitBOPPercentage = null
      }
      if (values.ProfitCCPercentage === '') {
        values.ProfitCCPercentage = null
      }
      if (values.ProfitPercentage === '') {
        values.ProfitPercentage = null
      }
      if (values.ProfitRMPercentage === '') {
        values.ProfitRMPercentage = null
      }

      if (
        (JSON.stringify(files) === JSON.stringify(DataToChange.Attachements)) && DropdownNotChanged && Number(DataToChange.ProfitBOPPercentage) === Number(values.ProfitBOPPercentage) && Number(DataToChange.ProfitCCPercentage) === Number(values.ProfitCCPercentage)
        && Number(DataToChange.ProfitPercentage) === Number(values.ProfitPercentage) && Number(DataToChange.ProfitRMPercentage) === Number(values.ProfitRMPercentage)
        && String(DataToChange.Remark) === String(values.Remark) && uploadAttachements) {

        this.cancel('cancel')
        return false
      }
      this.setState({ setDisable: true })
      let updatedFiles = files.map((file) => {
        return { ...file, ContextId: ProfitID }
      })
      let requestData = {
        ProfitId: ProfitID,
        VendorName: costingTypeId === VBCTypeId ? vendorName.label : '',
        IsClient: costingTypeId === CBCTypeId ? true : false,
        CustomerName: costingTypeId === CBCTypeId ? client.label : '',
        ProfitApplicabilityType: profitAppli.label,
        ModelType: ModelType.label,
        CostingTypeId: costingTypeId,
        IsCombinedEntry: !isProfitPercent ? true : false,
        ProfitPercentage: values.ProfitPercentage,
        ProfitMachiningCCPercentage: values.ProfitCCPercentage,
        ProfitBOPPercentage: values.ProfitBOPPercentage,
        ProfitRMPercentage: values.ProfitRMPercentage,
        Remark: remarks,
        VendorId: costingTypeId === VBCTypeId ? vendorName.value : '',
        VendorCode: this.state.vendorCode ? this.state.vendorCode : "",
        CustomerId: costingTypeId === CBCTypeId ? client.value : '',
        ProfitApplicabilityId: profitAppli.value,
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
      this.props.updateProfit(requestData, (res) => {
        this.setState({ setDisable: false })
        if (res?.data?.Result) {
          Toaster.success(MESSAGES.PROFIT_UPDATE_SUCCESS);
          this.cancel('submit')
        }
      });

    } else {
      this.setState({ setDisable: true })
      const formData = {
        CostingTypeId: costingTypeId,
        IsCombinedEntry: !isProfitPercent ? true : false,
        ProfitPercentage: !isProfitPercent ? values.ProfitPercentage : '',
        ProfitMachiningCCPercentage: !isCC ? values.ProfitCCPercentage : '',
        ProfitBOPPercentage: !isBOP ? values.ProfitBOPPercentage : '',
        ProfitRMPercentage: !isRM ? values.ProfitRMPercentage : '',
        Remark: remarks,
        VendorId: costingTypeId === VBCTypeId ? vendorName.value : '',
        VendorCode: costingTypeId === VBCTypeId ? getCodeBySplitting(vendorName.label) : '',
        CustomerId: costingTypeId === CBCTypeId ? client.value : '',
        ProfitApplicabilityId: profitAppli.value,
        ModelTypeId: ModelType.value,
        IsActive: true,
        CreatedDate: '',
        CreatedBy: loggedInUserId(),
        Attachements: files,
        EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
        Plants: costingTypeId === CBCTypeId ? cbcPlantArray : plantArray,
        RawMaterialChildId: RawMaterial?.value,
        RawMaterialName: RawMaterial?.label,
        RawMaterialGradeId: RMGrade?.value,
        RawMaterialGrade: RMGrade?.label,
        IsFinancialDataChanged: IsFinancialDataChanged,
        TechnologyId: this.state.isAssemblyCheckbox ? ASSEMBLY : null
      }

      this.props.createProfit(formData, (res) => {
        this.setState({ setDisable: false })
        if (res?.data?.Result) {
          Toaster.success(MESSAGES.PROFIT_ADDED_SUCCESS);
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
  * @method onPressAssemblyCheckbox
  * @description Used for Surface Treatment
  */
  onPressAssemblyCheckbox = () => {
    this.setState({ isAssemblyCheckbox: !this.state.isAssemblyCheckbox });
  }
  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { handleSubmit, t } = this.props;
    const { isRM, isCC, isBOP, isProfitPercent, costingTypeId, isEditFlag,
      isHideProfit, isHideBOP, isHideRM, isHideCC, isViewMode, setDisable, IsFinancialDataChanged } = this.state;
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
                      <h1> {isViewMode ? "View" : isEditFlag ? "Update" : "Add"} Profit Details
                        {!isViewMode && <TourWrapper
                          buttonSpecificProp={{ id: "Add_Profit_Form" }}
                          stepsSpecificProp={{
                            steps: Steps(t,
                              { isEditFlag: isEditFlag, vendorField: (costingTypeId === VBCTypeId), customerField: (costingTypeId === CBCTypeId), plantField: (costingTypeId === ZBCTypeId && getConfigurationKey().IsPlantRequiredForOverheadProfitInterestRate), destinationPlant: (costingTypeId === VBCTypeId && getConfigurationKey().IsDestinationPlantConfigure) || (costingTypeId === CBCTypeId && getConfigurationKey().IsCBCApplicableOnPlant), isProfitPercent: isProfitPercent, isRM: isRM, isCC: isCC, isBOP: isBOP, isHideProfit: isHideProfit, isHideBOP: isHideBOP, isHideRM: isHideRM, isHideCC: isHideCC, }).ADD_PROFIT_DETAILS
                          }} />}
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
                        <Col md="12">
                          {reactLocalStorage.getObject('CostingTypePermission').zbc && <Label id="AddProfit_zeroBased" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3 radio-box pt-0"} check>
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
                          {reactLocalStorage.getObject('CostingTypePermission').vbc && <Label id="AddProfit_vendorBased" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3 radio-box pt-0"} check>
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
                          {reactLocalStorage.getObject('CostingTypePermission').cbc && <Label id="AddProfit_customerBased" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3 radio-box pt-0"} check>
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
                            placeholder={isViewMode ? '-' : "Select"}
                            options={this.renderListing("ModelType")}
                            //onKeyUp={(e) => this.changeItemDesc(e)}
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
                          <Col md="3">
                            <label>{VendorLabel} (Code)<span className="asterisk-required">*</span></label>
                            <div className='p-relative vendor-loader'>
                              {this.state.inputLoader && <LoaderCustom customClass={`input-loader`} />}
                              <AsyncSelect
                                id="addProfit_vendorContainer"
                                name="vendorName"
                                ref={this.myRef}
                                key={this.state.updateAsyncDropdown}
                                loadOptions={filterList}
                                onChange={(e) => this.handleVendorName(e)}
                                value={this.state.vendorName}
                                noOptionsMessage={({ inputValue }) => inputValue.length < 3 ? MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN : "No results found"}
                                isDisabled={(isEditFlag) ? true : false}
                                onKeyDown={(onKeyDown) => {
                                  if (onKeyDown.keyCode === SPACEBAR && !onKeyDown.target.value) onKeyDown.preventDefault();
                                }}
                                onFocus={() => onFocus(this)}
                              />
                              {((this.state.showErrorOnFocus && this.state.vendorName.length === 0) || this.state.isVendorNameNotSelected) && <div className='text-help mt-1'>This field is required.</div>}
                            </div>
                          </Col>
                        )}
                        {/* {((costingTypeId === ZBCTypeId && getConfigurationKey().IsPlantRequiredForOverheadProfitInterestRate) && ( */}
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
                              valueDescription={this.state.selectedPlants}
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
                              placeholder={isViewMode ? '-' : "Select"}
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
                          <label id="AddProfit_ApplyPartCheckbox"
                            className={`custom-checkbox ${this.state.isEditFlag ? "disabled" : ""
                              }`}
                            onChange={this.onPressAssemblyCheckbox}
                          >
                            Apply for Part Type
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
                            name="ProfitApplicabilityId"
                            type="text"
                            label="Profit Applicability"
                            component={searchableSelect}
                            placeholder={isViewMode ? '-' : "Select"}
                            options={this.renderListing(
                              "ProfitApplicability"
                            )}
                            //onKeyUp={(e) => this.changeItemDesc(e)}
                            validate={
                              this.state.profitAppli == null ||
                                this.state.profitAppli.length === 0
                                ? [required]
                                : []
                            }
                            required={true}
                            handleChangeDescription={
                              this.handleProfitChange
                            }
                            valueDescription={this.state.profitAppli}
                            disabled={isViewMode}
                          />
                        </Col>
                        {!isHideProfit && (
                          <Col md="3">
                            <Field
                              label={`Profit (%)`}
                              name={"ProfitPercentage"}
                              type="text"
                              placeholder={isProfitPercent || isViewMode ? "-" : "Enter"}
                              validate={!isProfitPercent ? [required, number, maxPercentValue, checkWhiteSpaces, percentageLimitValidation] : []}
                              component={renderText}
                              onBlur={this.handlePercent}
                              required={!isProfitPercent ? true : false}
                              onChange={(event) => this.handleChangeProfitPercentage(event.target.value)}
                              className=""
                              customClassName=" withBorder"
                              max={100}
                              disabled={isProfitPercent || isViewMode ? true : false}
                            />
                          </Col>
                        )}
                        {!isHideRM && (
                          <Col md="3">
                            <Field
                              label={`Profit on ${this.state.showPartCost ? 'Part Cost' : 'RM'} (%)`}
                              name={"ProfitRMPercentage"}
                              type="text"
                              placeholder={isRM || isViewMode ? "-" : "Enter"}
                              validate={!isRM ? [required, number, maxPercentValue, checkWhiteSpaces, percentageLimitValidation] : []}
                              onChange={(event) => this.handleChangeProfitPercentageRM(event.target.value)}
                              component={renderText}
                              required={!isRM ? true : false}
                              className=""
                              customClassName=" withBorder"
                              disabled={isRM || isViewMode ? true : false}
                            />
                          </Col>
                        )}
                        {!isHideCC && (
                          <Col md="3">
                            <Field
                              label={`Profit on CC (%)`}
                              name={"ProfitCCPercentage"}
                              type="text"
                              placeholder={isCC || isViewMode ? "-" : "Enter"}
                              validate={!isCC ? [required, number, maxPercentValue, checkWhiteSpaces, percentageLimitValidation] : []}
                              onChange={(event) => this.handleChangeProfitPercentageCC(event.target.value)}
                              component={renderText}
                              //onChange={this.handleCalculation}
                              required={!isCC ? true : false}
                              className=""
                              customClassName=" withBorder"
                              disabled={isCC || isViewMode ? true : false}
                            />
                          </Col>
                        )}
                        {!isHideBOP && (
                          <Col md="3">
                            <Field
                              label={`Profit on ${showBopLabel()} (%)`}
                              name={"ProfitBOPPercentage"}
                              type="text"
                              placeholder={isBOP || isViewMode ? "-" : "Enter"}
                              validate={!isBOP ? [required, number, maxPercentValue, checkWhiteSpaces, percentageLimitValidation] : []}
                              onChange={(event) => this.handleChangeProfitPercentageBOP(event.target.value)}
                              component={renderText}
                              //onChange={this.handleCalculation}
                              required={!isBOP ? true : false}
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
                            value={this.state.remarks}
                            className=""
                            customClassName=" textAreaWithBorder"
                            onChange={this.handleMessageChange}
                            validate={[maxLength512, acceptAllExceptSingleSpecialCharacter]}
                            component={renderTextAreaField}
                            // maxLength="512"
                            // maxLength="5000"
                            disabled={isViewMode}
                          />
                        </Col>
                        <Col md="3">
                          <label>Upload Files (upload up to {getConfigurationKey().MaxMasterFilesToUpload} files) <AttachmentValidationInfo /></label>
                          <div className={`alert alert-danger mt-2 ${this.state.files.length === getConfigurationKey().MaxMasterFilesToUpload ? '' : 'd-none'}`} role="alert">
                            Maximum file upload limit reached.
                          </div>
                          <div id="AddProfit_UploadFiles" className={`${this.state.files.length >= getConfigurationKey().MaxMasterFilesToUpload ? 'd-none' : ''}`}>
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
                                    {/* <a href={fileURL} target="_blank" download={f.FileName}>
                                                                        <img src={fileURL} alt={f.OriginalFileName} width="104" height="142" />
                                                                    </a> */}
                                    {/* <div className={'image-viwer'} onClick={() => this.viewImage(fileURL)}>
                                                                        <img src={fileURL} height={50} width={100} />
                                                                    </div> */}

                                    {!isViewMode && <img
                                      alt={""}
                                      className="float-right"
                                      onClick={() =>
                                        this.deleteFile(
                                          f.FileId,
                                          f.FileName
                                        )
                                      }
                                      src={attachClose}
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
                        <button id="AddProfit_Cancel"
                          type={"button"}
                          className=" mr15 cancel-btn"
                          onClick={this.cancelHandler}
                          disabled={setDisable}
                        >
                          <div className={"cancel-icon"}></div>
                          {"Cancel"}
                        </button>
                        {!isViewMode && <button id="AddProfit_Save"
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
function mapStateToProps(state) {
  const { comman, supplier, overheadProfit, client, material } = state;
  const filedObj = selector(state, 'ProfitPercentage', 'ProfitRMPercentage', 'ProfitCCPercentage',
    'ProfitBOPPercentage')

  const { modelTypes, costingHead, plantSelectList } = comman;
  const { overheadProfitData, } = overheadProfit;
  const { clientSelectList } = client;
  const { vendorWithVendorCodeSelectList } = supplier;
  const { rawMaterialNameSelectList, gradeSelectList } = material

  let initialValues = {};
  if (overheadProfitData && overheadProfitData !== undefined) {
    initialValues = {
      ProfitPercentage: overheadProfitData.ProfitPercentage !== null ? overheadProfitData.ProfitPercentage : '',
      ProfitRMPercentage: overheadProfitData.ProfitRMPercentage !== null ? overheadProfitData.ProfitRMPercentage : '',
      ProfitCCPercentage: overheadProfitData.ProfitMachiningCCPercentage !== null ? overheadProfitData.ProfitMachiningCCPercentage : '',
      ProfitBOPPercentage: overheadProfitData.ProfitBOPPercentage !== null ? overheadProfitData.ProfitBOPPercentage : '',
      Remark: overheadProfitData.Remark,
    }
  }

  return {
    modelTypes, costingHead, vendorWithVendorCodeSelectList, overheadProfitData, clientSelectList,
    filedObj, initialValues, plantSelectList, rawMaterialNameSelectList, gradeSelectList
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
  createProfit,
  getPlantSelectListByType,
  updateProfit,
  getProfitData,
  fileUploadProfit,
  getVendorNameByVendorSelectList,
  getRawMaterialNameChild,
  getRMGradeSelectListByRawMaterial
})(reduxForm({
  form: 'AddProfit',
  validate: validateForm,
  enableReinitialize: true,
})(withTranslation(['OverheadsProfits', 'MasterLabels'])(AddProfit)),
)
