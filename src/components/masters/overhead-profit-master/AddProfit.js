import React, { Component, } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Row, Col, Label } from 'reactstrap';
import { required, getVendorCode, maxLength512, positiveAndDecimalNumber, maxLength15, checkPercentageValue, decimalLengthThree } from "../../../helper/validation";
import { searchableSelect, renderTextAreaField, renderDatePicker, renderNumberInputField, renderMultiSelectField } from "../../layout/FormInputs";
import { fetchModelTypeAPI, fetchCostingHeadsAPI, getPlantSelectListByType } from '../../../actions/Common';
import { getVendorWithVendorCodeSelectList } from '../actions/Supplier';
import {
  createProfit, updateProfit, getProfitData, fileUploadProfit, fileDeleteProfit,
} from '../actions/OverheadProfit';
import { getClientSelectList, } from '../actions/Client';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { getConfigurationKey, loggedInUserId, userDetails } from "../../../helper/auth";
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css'
import { CBCTypeId, FILE_URL, SPACEBAR, VBCTypeId, ZBC, ZBCTypeId, searchCount } from '../../../config/constants';
import DayTime from '../../common/DayTimeWrapper'
import LoaderCustom from '../../common/LoaderCustom';
import attachClose from '../../../assests/images/red-cross.png'
import { debounce } from 'lodash';
import AsyncSelect from 'react-select/async';
import { onFocus, showDataOnHover } from '../../../helper';
import { reactLocalStorage } from 'reactjs-localstorage';
import { autoCompleteDropdown } from '../../common/CommonFunctions';

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

      isHideProfit: false,
      isHideRM: false,
      isHideCC: false,
      isHideBOP: false,
      effectiveDate: '',
      DropdownChanged: true,
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
      showErrorOnFocusDate: false
    }
  }


  /**
   * @method componentDidMount
   * @description Called after rendering the component   
   */
  componentDidMount() {
    this.props.getPlantSelectListByType(ZBC, () => { })
    this.props.fetchCostingHeadsAPI('master', res => { });
    if (!this.state.isViewMode) {
      this.props.fetchModelTypeAPI('--Model Types--', res => { });
    }
    this.getDetails();
  }

  /**
     * @method onPressVendor
     * @description Used for Vendor checked
     */
  onPressVendor = (costingHeadFlag) => {
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
    this.setState({ DropdownChanged: false, isDataChanged: false })
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
              selectedPlants: Data.Plants[0].PlantId ? [{ Text: Data.Plants[0].PlantName, Value: Data.Plants[0].PlantId }] : [],
              singlePlantSelected: Data.Plants[0].PlantId ? { label: Data.Plants[0].PlantName, value: Data.Plants[0].PlantId } : {},
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
    const { modelTypes, costingHead, clientSelectList, plantSelectList } = this.props;
    const temp = [];

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
    this.setState({ DropdownChanged: false })
  }
  handleSinglePlant = (newValue) => {
    this.setState({ singlePlantSelected: newValue })
  }

  componentDidUpdate(prevProps) {
    if (prevProps.filedObj !== this.props.filedObj) {
      const { filedObj } = this.props;

      if (this.props.filedObj.ProfitPercentage) {
        checkPercentageValue(this.props.filedObj.ProfitPercentage, "Profit percentage should not be more than 100") ? this.props.change('ProfitPercentage', this.props.filedObj.ProfitPercentage) : this.props.change('ProfitPercentage', 0)
      }
      if (this.props.filedObj.ProfitRMPercentage) {
        checkPercentageValue(this.props.filedObj.ProfitRMPercentage, "Profit RM percentage should not be more than 100") ? this.props.change('ProfitRMPercentage', this.props.filedObj.ProfitRMPercentage) : this.props.change('ProfitRMPercentage', 0)
      }
      if (this.props.filedObj.ProfitMachiningCCPercentage) {
        checkPercentageValue(this.props.filedObj.ProfitMachiningCCPercentage, "Profit CC percentage should not be more than 100") ? this.props.change('ProfitMachiningCCPercentage', this.props.filedObj.ProfitMachiningCCPercentage) : this.props.change('ProfitMachiningCCPercentage', 0)
      }
      if (this.props.filedObj.ProfitBOPPercentage) {
        checkPercentageValue(this.props.filedObj.ProfitBOPPercentage, "Profit BOP percentage should not be more than 100") ? this.props.change('ProfitBOPPercentage', this.props.filedObj.ProfitBOPPercentage) : this.props.change('ProfitBOPPercentage', 0)
      }


      const ProfitPercentage = filedObj && filedObj.ProfitPercentage !== undefined && filedObj.ProfitPercentage !== '' ? true : false;
      const ProfitRMPercentage = filedObj && filedObj.ProfitRMPercentage !== undefined && filedObj.ProfitRMPercentage !== '' ? true : false;
      const ProfitMachiningCCPercentage = filedObj && filedObj.ProfitMachiningCCPercentage !== undefined && filedObj.ProfitMachiningCCPercentage !== '' ? true : false;
      const ProfitBOPPercentage = filedObj && filedObj.ProfitBOPPercentage !== undefined && filedObj.ProfitBOPPercentage !== '' ? true : false;
      if (ProfitPercentage) {
        this.setState({ isRM: true, isCC: true, isBOP: true, })
      } else if (ProfitRMPercentage || ProfitMachiningCCPercentage || ProfitBOPPercentage) {
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
    this.setState({ DropdownChanged: false, isDataChanged: false })
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
        this.setState({ isDataChanged: true })
      } else {
        this.setState({ isDataChanged: false })

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
        this.setState({ isDataChanged: true })
      } else {
        this.setState({ isDataChanged: false })

      }

    }
  };

  /**
  * @method handleChangeProfitPercentageCC
  * @description called
  */
  handleChangeProfitPercentageCC = (newValue) => {
    if (this.state.isEditFlag) {
      if (String(newValue) === String(this.state.DataToChange.ProfitMachiningCCPercentage) &&
        String(this.state.profitAppli.label) === String(this.state.DataToChange.ProfitApplicabilityType) &&
        String(this.state.ModelType.label) === String(this.state.DataToChange.ModelType)) {
        this.setState({ isDataChanged: true })
      } else {
        this.setState({ isDataChanged: false })

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
        this.setState({ isDataChanged: true })
      } else {
        this.setState({ isDataChanged: false })

      }

    }
  };

  handlePercent = (e) => {
    if (e.target.value > 100) {
      Toaster.warning('Profit Percent can not be greater than 100.')
    }
  }

  resetFields = () => {
    this.props.change('ProfitPercentage', '')
    this.props.change('ProfitMachiningCCPercentage', '')
    this.props.change('ProfitBOPPercentage', '')
    this.props.change('ProfitRMPercentage', '')
  }

  checkProfitFields = () => {
    const { profitAppli } = this.state;

    switch (profitAppli.label) {
      case 'RM':
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
    if (Number(loop) === 1) {
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
      this.props.fileUploadProfit(data, (res) => {
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
      this.props.fileDeleteProfit(deleteData, (res) => {
        Toaster.success('File deleted successfully.')
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

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = debounce((values) => {
    const { IsVendor, ModelType, costingTypeId, vendorName, client, selectedPlants, profitAppli, remarks, ProfitID,
      isRM, isCC, isBOP, isProfitPercent, isEditFlag, files, singlePlantSelected, effectiveDate, DataToChange, DropdownChanged, uploadAttachements } = this.state;
    const userDetail = userDetails()
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
      if (values.ProfitMachiningCCPercentage === '') {
        values.ProfitMachiningCCPercentage = null
      }
      if (values.ProfitPercentage === '') {
        values.ProfitPercentage = null
      }
      if (values.ProfitRMPercentage === '') {
        values.ProfitRMPercentage = null
      }

      if (
        DropdownChanged && Number(DataToChange.ProfitBOPPercentage) === Number(values.ProfitBOPPercentage) && Number(DataToChange.ProfitMachiningCCPercentage) === Number(values.ProfitMachiningCCPercentage)
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
        ProfitMachiningCCPercentage: values.ProfitMachiningCCPercentage,
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
        Plants: costingTypeId === CBCTypeId ? cbcPlantArray : plantArray
      }
      if (isEditFlag) {
        if (DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss') === DayTime(DataToChange?.EffectiveDate).format('YYYY-MM-DD HH:mm:ss')) {
          Toaster.warning('Please update the effective date')
          this.setState({ setDisable: false })
          return false
        }
        this.props.updateProfit(requestData, (res) => {
          this.setState({ setDisable: false })
          if (res?.data?.Result) {
            Toaster.success(MESSAGES.PROFIT_UPDATE_SUCCESS);
            this.cancel('submit')
          }
        });
      }


    } else {
      this.setState({ setDisable: true })
      const formData = {
        CostingTypeId: costingTypeId,
        IsCombinedEntry: !isProfitPercent ? true : false,
        ProfitPercentage: !isProfitPercent ? values.ProfitPercentage : '',
        ProfitMachiningCCPercentage: !isCC ? values.ProfitMachiningCCPercentage : '',
        ProfitBOPPercentage: !isBOP ? values.ProfitBOPPercentage : '',
        ProfitRMPercentage: !isRM ? values.ProfitRMPercentage : '',
        Remark: remarks,
        VendorId: costingTypeId === VBCTypeId ? vendorName.value : '',
        VendorCode: costingTypeId === VBCTypeId ? getVendorCode(vendorName.label) : '',
        CustomerId: costingTypeId === CBCTypeId ? client.value : '',
        ProfitApplicabilityId: profitAppli.value,
        ModelTypeId: ModelType.value,
        IsActive: true,
        CreatedDate: '',
        CreatedBy: loggedInUserId(),
        Attachements: files,
        EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
        Plants: costingTypeId === CBCTypeId ? cbcPlantArray : plantArray
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
  * @method render
  * @description Renders the component
  */
  render() {
    const { handleSubmit, } = this.props;
    const { isRM, isCC, isBOP, isProfitPercent, costingTypeId, isEditFlag,
      isHideProfit, isHideBOP, isHideRM, isHideCC, isViewMode, setDisable, isDataChanged } = this.state;
    const filterList = async (inputValue) => {
      const { vendorName } = this.state
      const resultInput = inputValue.slice(0, 3)
      if (inputValue?.length >= searchCount && vendorName !== resultInput) {
        this.setState({ inputLoader: true })
        let res
        res = await getVendorWithVendorCodeSelectList(resultInput)
        this.setState({ inputLoader: false })
        this.setState({ vendorName: resultInput })
        let vendorDataAPI = res?.data?.SelectList
        reactLocalStorage?.setObject('vendorData', vendorDataAPI)
        let VendorData = []
        if (inputValue) {
          VendorData = reactLocalStorage?.getObject('vendorData')
          return autoCompleteDropdown(inputValue, VendorData)
        } else {
          return VendorData
        }
      }
      else {
        if (inputValue?.length < searchCount) return false
        else {
          let VendorData = reactLocalStorage?.getObject('vendorData')
          if (inputValue) {
            VendorData = reactLocalStorage?.getObject('vendorData')
            return autoCompleteDropdown(inputValue, VendorData)
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
                          <Label className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3 radio-box pt-0"} check>
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
                          </Label>
                          <Label className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3 radio-box pt-0"} check>
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
                            <span>Vendor Based</span>
                          </Label>
                          <Label className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3 radio-box pt-0"} check>
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
                          </Label>
                        </Col>
                      </Row>
                      <Row>
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
                            <label>{"Vendor Name"}<span className="asterisk-required">*</span></label>
                            <div className='p-relative'>
                              {this.state.inputLoader && <LoaderCustom customClass={`input-loader`} />}
                              <AsyncSelect
                                name="vendorName"
                                ref={this.myRef}
                                key={this.state.updateAsyncDropdown}
                                loadOptions={filterList}
                                onChange={(e) => this.handleVendorName(e)}
                                value={this.state.vendorName}
                                noOptionsMessage={({ inputValue }) => inputValue.length < 3 ? "Enter 3 characters to show data" : "No results found"}
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
                        {((costingTypeId === ZBCTypeId && getConfigurationKey().IsPlantRequiredForOverheadProfitInterestRate) && (
                          <Col md="3">
                            <Field
                              label="Plant"
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
                              label={'Plant'}
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
                              label={"Customer Name"}
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
                              placeholder={
                                isProfitPercent || isViewMode ? "-" : "Enter"
                              }
                              validate={
                                !isProfitPercent ? [required, positiveAndDecimalNumber, maxLength15, decimalLengthThree] : []
                              }
                              component={renderNumberInputField}
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
                              label={`Profit on RM (%)`}
                              name={"ProfitRMPercentage"}
                              type="text"
                              placeholder={isRM || isViewMode ? "-" : "Enter"}
                              validate={!isRM ? [required, positiveAndDecimalNumber, maxLength15, decimalLengthThree] : []}
                              onChange={(event) => this.handleChangeProfitPercentageRM(event.target.value)}
                              component={renderNumberInputField}
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
                              name={"ProfitMachiningCCPercentage"}
                              type="text"
                              placeholder={isCC || isViewMode ? "-" : "Enter"}
                              validate={!isCC ? [required, positiveAndDecimalNumber, maxLength15, decimalLengthThree] : []}
                              onChange={(event) => this.handleChangeProfitPercentageCC(event.target.value)}
                              component={renderNumberInputField}
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
                              label={`Profit on BOP (%)`}
                              name={"ProfitBOPPercentage"}
                              type="text"
                              placeholder={isBOP || isViewMode ? "-" : "Enter"}
                              validate={!isBOP ? [required, positiveAndDecimalNumber, maxLength15, decimalLengthThree] : []}
                              onChange={(event) => this.handleChangeProfitPercentageBOP(event.target.value)}
                              component={renderNumberInputField}
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
                              minDate={this.state.minEffectiveDate}
                              validate={[required]}
                              autoComplete={'off'}
                              required={true}
                              changeHandler={(e) => {

                              }}
                              component={renderDatePicker}
                              className="form-control"
                              disabled={isViewMode || isDataChanged}
                              placeholder={isViewMode || isDataChanged ? '-' : 'Enter'}
                              onFocus={() => onFocus(this, true)}
                            />
                            {this.state.showErrorOnFocusDate && this.state.effectiveDate === '' && <div className='text-help mt-1 p-absolute bottom-7'>This field is required.</div>}
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
                            validate={[maxLength512]}
                            //required={true}
                            component={renderTextAreaField}
                            maxLength="512"
                            disabled={isViewMode}
                          />
                        </Col>
                        <Col md="3">
                          <label>Upload Files (upload up to 3 files)</label>
                          <div className={`alert alert-danger mt-2 ${this.state.files.length === 3 ? '' : 'd-none'}`} role="alert">
                            Maximum file upload limit reached.
                          </div>
                          <div className={`${this.state.files.length >= 3 ? 'd-none' : ''}`}>
                            <Dropzone
                              ref={this.dropzone}
                              onChangeStatus={this.handleChangeStatus}
                              PreviewComponent={this.Preview}
                              disabled={isViewMode}
                              accept="*"
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
                    </div>
                    <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                      <div className="col-sm-12 text-right bluefooter-butn">
                        <button
                          type={"button"}
                          className=" mr15 cancel-btn"
                          onClick={() => { this.cancel('cancel') }}
                          disabled={setDisable}
                        >
                          <div className={"cancel-icon"}></div>
                          {"Cancel"}
                        </button>
                        <button
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
              </div>
            </div>
          </div>
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
  const { comman, supplier, overheadProfit, client, } = state;
  const filedObj = selector(state, 'ProfitPercentage', 'ProfitRMPercentage', 'ProfitMachiningCCPercentage',
    'ProfitBOPPercentage')

  const { modelTypes, costingHead, plantSelectList } = comman;
  const { overheadProfitData, } = overheadProfit;
  const { clientSelectList } = client;
  const { vendorWithVendorCodeSelectList } = supplier;

  let initialValues = {};
  if (overheadProfitData && overheadProfitData !== undefined) {
    initialValues = {
      ProfitPercentage: overheadProfitData.ProfitPercentage !== null ? overheadProfitData.ProfitPercentage : '',
      ProfitRMPercentage: overheadProfitData.ProfitRMPercentage !== null ? overheadProfitData.ProfitRMPercentage : '',
      ProfitMachiningCCPercentage: overheadProfitData.ProfitMachiningCCPercentage !== null ? overheadProfitData.ProfitMachiningCCPercentage : '',
      ProfitBOPPercentage: overheadProfitData.ProfitBOPPercentage !== null ? overheadProfitData.ProfitBOPPercentage : '',
      Remark: overheadProfitData.Remark,
    }
  }

  return {
    modelTypes, costingHead, vendorWithVendorCodeSelectList, overheadProfitData, clientSelectList,
    filedObj, initialValues, plantSelectList
  }

}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
  fetchModelTypeAPI,
  fetchCostingHeadsAPI,
  getVendorWithVendorCodeSelectList,
  getClientSelectList,
  createProfit,
  getPlantSelectListByType,
  updateProfit,
  getProfitData,
  fileUploadProfit,
  fileDeleteProfit,
})(reduxForm({
  form: 'AddProfit',
  enableReinitialize: true,
})(AddProfit));
