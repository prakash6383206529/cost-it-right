import React, { Component, } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Row, Col, Label } from 'reactstrap';
import { required, getVendorCode, positiveAndDecimalNumber, maxLength15, checkPercentageValue, decimalLengthThree } from "../../../helper/validation";
import { searchableSelect, renderTextAreaField, renderDatePicker, renderNumberInputField, renderMultiSelectField } from "../../layout/FormInputs";
import { fetchModelTypeAPI, fetchCostingHeadsAPI, getPlantSelectListByType } from '../../../actions/Common';
import { getVendorWithVendorCodeSelectList } from '../actions/Supplier';
import {
  createOverhead, updateOverhead, getOverheadData, fileUploadOverHead,
  fileDeleteOverhead,
} from '../actions/OverheadProfit';
import { getClientSelectList, } from '../actions/Client';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { getConfigurationKey, loggedInUserId, userDetails } from "../../../helper/auth";
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css'
import { CBCTypeId, FILE_URL, SPACEBAR, VBCTypeId, ZBC, ZBCTypeId } from '../../../config/constants';
import DayTime from '../../common/DayTimeWrapper'
import LoaderCustom from '../../common/LoaderCustom';
import imgRedcross from '../../../assests/images/red-cross.png'
import { debounce } from 'lodash';
import AsyncSelect from 'react-select/async';
import { onFocus, showDataOnHover } from '../../../helper';

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
      DropdownChanged: true,
      DataToChange: [],
      effectiveDate: '',
      uploadAttachements: true,
      updatedObj: {},
      setDisable: false,
      inputLoader: false,
      minEffectiveDate: '',
      isDataChanged: this.props.data.isEditFlag,
      attachmentLoader: false,
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
    this.props.fetchCostingHeadsAPI('--Costing Heads--', res => { });
    if (!this.state.isViewMode) {
      this.props.fetchModelTypeAPI('--Model Types--', res => { });
    }
    if (!(this.props.data.isEditFlag || this.props.data.isViewFlag)) {
      this.props.getClientSelectList(() => { })
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
    if (costingHeadFlag === VBCTypeId) {
      this.setState({ inputLoader: true })
      this.props.getVendorWithVendorCodeSelectList(() => { this.setState({ inputLoader: false }) })
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
              isEditFlag: true,
              // isLoader: false,
              // IsVendor: Data.IsClient ? Data.IsClient : Data.IsVendor,
              // costingHead: Head,
              costingTypeId: String(Data.CostingTypeId),
              ModelType: Data.ModelType !== undefined ? { label: Data.ModelType, value: Data.ModelTypeId } : [],
              vendorName: Data.VendorName && Data.VendorName !== undefined ? { label: `${Data.VendorName}`, value: Data.VendorId } : [],
              client: Data.CustomerName !== undefined ? { label: Data.CustomerName, value: Data.CustomerId } : [],
              overheadAppli: AppliObj && AppliObj !== undefined ? { label: AppliObj.Text, value: AppliObj.Value } : [],
              remarks: Data.Remark,
              files: Data.Attachements,
              effectiveDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '',
              selectedPlants: Data.Plants[0].PlantId ? [{ Text: Data.Plants[0].PlantName, Value: Data.Plants[0].PlantId }] : [],
              singlePlantSelected: Data.Plants[0]?.PlantId ? { label: Data.Plants[0]?.PlantName, value: Data.Plants[0]?.PlantId } : {},
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
    const { vendorWithVendorCodeSelectList, clientSelectList, modelTypes, plantSelectList, costingHead } = this.props;
    const temp = [];

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
        temp.push({ label: item.Text, value: item.Value })
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
    this.setState({ DropdownChanged: false })
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
      if (this.props.filedObj.OverheadPercentage) {
        checkPercentageValue(this.props.filedObj.OverheadPercentage, "Overhead percentage should not be more than 100") ? this.props.change('OverheadPercentage', this.props.filedObj.OverheadPercentage) : this.props.change('OverheadPercentage', 0)
      }
      if (this.props.filedObj.OverheadRMPercentage) {
        checkPercentageValue(this.props.filedObj.OverheadRMPercentage, "Overhead RM percentage should not be more than 100") ? this.props.change('OverheadRMPercentage', this.props.filedObj.OverheadRMPercentage) : this.props.change('OverheadRMPercentage', 0)
      }
      if (this.props.filedObj.OverheadMachiningCCPercentage) {
        checkPercentageValue(this.props.filedObj.OverheadMachiningCCPercentage, "Overhead CC percentage should not be more than 100") ? this.props.change('OverheadMachiningCCPercentage', this.props.filedObj.OverheadMachiningCCPercentage) : this.props.change('OverheadMachiningCCPercentage', 0)
      }
      if (this.props.filedObj.OverheadBOPPercentage) {
        checkPercentageValue(this.props.filedObj.OverheadBOPPercentage, "Overhead BOP percentage should not be more than 100") ? this.props.change('OverheadBOPPercentage', this.props.filedObj.OverheadBOPPercentage) : this.props.change('OverheadBOPPercentage', 0)
      }

      const OverheadPercentage = filedObj && filedObj.OverheadPercentage !== undefined && filedObj.OverheadPercentage !== '' ? true : false;
      const OverheadRMPercentage = filedObj && filedObj.OverheadRMPercentage !== undefined && filedObj.OverheadRMPercentage !== '' ? true : false;
      const OverheadMachiningCCPercentage = filedObj && filedObj.OverheadMachiningCCPercentage !== undefined && filedObj.OverheadMachiningCCPercentage !== '' ? true : false;
      const OverheadBOPPercentage = filedObj && filedObj.OverheadBOPPercentage !== undefined && filedObj.OverheadBOPPercentage !== '' ? true : false;

      if (OverheadPercentage) {
        this.setState({ isRM: true, isCC: true, isBOP: true, })
      } else if (OverheadRMPercentage || OverheadMachiningCCPercentage || OverheadBOPPercentage) {
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
    this.setState({ DropdownChanged: false, isDataChanged: false })
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
        this.setState({ isDataChanged: true })
      } else {
        this.setState({ isDataChanged: false })

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
        this.setState({ isDataChanged: true })
      } else {
        this.setState({ isDataChanged: false })

      }

    }
  };

  /**
  * @method handleChangeOverheadPercentageCC
  * @description called
  */
  handleChangeOverheadPercentageCC = (newValue) => {
    if (this.state.isEditFlag) {
      if (String(newValue) === String(this.state.DataToChange.OverheadMachiningCCPercentage) &&
        String(this.state.overheadAppli.label) === String(this.state.DataToChange.OverheadApplicabilityType) &&
        String(this.state.ModelType.label) === String(this.state.DataToChange.ModelType)) {
        this.setState({ isDataChanged: true })
      } else {
        this.setState({ isDataChanged: false })

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
        this.setState({ isDataChanged: true })
      } else {
        this.setState({ isDataChanged: false })

      }

    }
  };

  handlePercent = (e) => {
    // if (e.target.value > 100) {
    //   Toaster.warning('Overhead Percent can not be greater than 100.')
    //   $('input[name="OverheadPercentage"]').focus()
    // }
  }

  resetFields = () => {
    this.props.change('OverheadPercentage', '')
    this.props.change('OverheadMachiningCCPercentage', '')
    this.props.change('OverheadBOPPercentage', '')
    this.props.change('OverheadRMPercentage', '')
  }

  checkOverheadFields = () => {
    const { overheadAppli } = this.state;
    switch (overheadAppli.label) {
      case 'RM':
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
    if (Number(loop) === 1) {
      this.setState({ setDisable: false, attachmentLoader: false })
    }
  }

  // called every time a file's `status` changes
  handleChangeStatus = ({ meta, file, remove }, status) => {

    const { files, } = this.state;

    this.setState({ uploadAttachements: false, setDisable: true, attachmentLoader: true })

    if (status === 'removed') {
      this.deleteFile(
        file.id,
        file.name
      )

      let tempArr = files.filter(item => item.OriginalFileName === file.name)
      let FileId = tempArr.FileId
      let OriginalFileName = tempArr.OriginalFileName
      if (FileId != null) {
        let deleteData = {
          Id: FileId,
          DeletedBy: loggedInUserId(),
        }
        this.props.fileDeleteOverhead(deleteData, (res) => {
          Toaster.success('File has been deleted successfully.')
          let tempArr = this.state.files.filter(item => item.FileId !== FileId)
          this.setState({ files: tempArr })
        })
      }
      if (FileId == null) {
        let tempArr = this.state.files.filter(item => item.FileName !== OriginalFileName)
        this.setState({ files: tempArr })
      }
      this.setState({ files: tempArr })
    }
    if (status === 'done') {
      let data = new FormData()
      data.append('file', file)
      this.props.fileUploadOverHead(data, (res) => {
        this.setDisableFalseFunction()

        let Data = res.data[0]
        const { files } = this.state;
        files.push(Data)
        this.setState({ files: files })
      })
      // remove()
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
    let tempArr

    if (FileId != null) {
      let deleteData = {
        Id: FileId,
        DeletedBy: loggedInUserId(),
      }
      this.props.fileDeleteOverhead(deleteData, (res) => {
        Toaster.success('File has been deleted successfully.')
        tempArr = this.state.files.filter(item => item.FileId !== FileId)
        this.setState({ files: tempArr })
      })
    }
    if (FileId == null) {
      tempArr = this.state.files.filter(item => item.FileName !== OriginalFileName)
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


  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = debounce((values) => {
    const { client, costingTypeId, ModelType, vendorName, overheadAppli, selectedPlants, remarks, OverheadID,
      isRM, isCC, isBOP, isOverheadPercent, singlePlantSelected, isEditFlag, files, effectiveDate, DataToChange, DropdownChanged, uploadAttachements } = this.state;
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
    if (costingTypeId === CBCTypeId) {
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
      if (values.OverheadMachiningCCPercentage === '') {
        values.OverheadMachiningCCPercentage = null
      }
      if (values.OverheadBOPPercentage === '') {
        values.OverheadBOPPercentage = null
      }

      if (
        DropdownChanged && Number(DataToChange.OverheadPercentage) === Number(values.OverheadPercentage) && Number(DataToChange.OverheadRMPercentage) === Number(values.OverheadRMPercentage)
        && Number(DataToChange.OverheadMachiningCCPercentage) === Number(values.OverheadMachiningCCPercentage) && Number(DataToChange.OverheadBOPPercentage) === Number(values.OverheadBOPPercentage)
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
        OverheadMachiningCCPercentage: values.OverheadMachiningCCPercentage,
        OverheadBOPPercentage: values.OverheadBOPPercentage,
        OverheadRMPercentage: values.OverheadRMPercentage,
        Remark: remarks,
        VendorId: costingTypeId === VBCTypeId ? vendorName.value : '',
        VendorCode: costingTypeId === VBCTypeId ? getVendorCode(vendorName.label) : '',
        CustomerId: costingTypeId === CBCTypeId ? client.value : '',
        OverheadApplicabilityId: overheadAppli.value,
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
        this.props.updateOverhead(requestData, (res) => {
          this.setState({ setDisable: false })
          if (res?.data?.Result) {
            Toaster.success(MESSAGES.OVERHEAD_UPDATE_SUCCESS);
            this.cancel('submit')
          }
        });
      }


    } else {

      this.setState({ setDisable: true })
      const formData = {
        EAttachementEntityName: 0,
        CostingTypeId: costingTypeId,
        IsCombinedEntry: !isOverheadPercent ? true : false,
        OverheadPercentage: !isOverheadPercent ? values.OverheadPercentage : '',
        OverheadMachiningCCPercentage: !isCC ? values.OverheadMachiningCCPercentage : '',
        OverheadBOPPercentage: !isBOP ? values.OverheadBOPPercentage : '',
        OverheadRMPercentage: !isRM ? values.OverheadRMPercentage : '',
        Remark: remarks,
        VendorId: costingTypeId === VBCTypeId ? vendorName.value : '',
        VendorCode: costingTypeId === VBCTypeId ? getVendorCode(vendorName.label) : '',
        CustomerId: costingTypeId === CBCTypeId ? client.value : '',
        OverheadApplicabilityId: overheadAppli.value,
        ModelTypeId: ModelType.value,
        IsActive: true,
        CreatedDate: '',
        CreatedBy: loggedInUserId(),
        Attachements: files,
        Plants: costingTypeId === CBCTypeId ? cbcPlantArray : plantArray,
        EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss')
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
  * @method render
  * @description Renders the component
  */
  render() {
    const { handleSubmit, } = this.props;
    const { isRM, isCC, isBOP, isOverheadPercent, isEditFlag,
      isHideOverhead, isHideBOP, isHideRM, isHideCC, costingTypeId, isViewMode, setDisable, isDataChanged } = this.state;
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
          <div className="login-container signup-form">
            <div className="row">
              <div className="col-md-12">
                <div className="shadow-lgg login-formg">
                  <div className="row">
                    <div className="col-md-6">
                      <h1>{isViewMode ? "View" : isEditFlag ? "Update" : "Add"} Overhead Details
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
                          <Label className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
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
                          <Label className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
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
                          <Label className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3 pt-0 radio-box"} check>
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
                            <label>{"Vendor Name"}<span className="asterisk-required">*</span></label>
                            <div className='p-relative'>
                              {this.state.inputLoader && <LoaderCustom customClass={`input-loader`} />}
                              <AsyncSelect
                                name="vendorName"
                                ref={this.myRef}
                                key={this.state.updateAsyncDropdown}
                                loadOptions={promiseOptions}
                                onChange={(e) => this.handleVendorName(e)}
                                value={this.state.vendorName}
                                noOptionsMessage={({ inputValue }) => !inputValue ? "Please enter vendor name/code" : "No results found"}
                                isDisabled={(isEditFlag || this.state.inputLoader) ? true : false}
                                onFocus={() => onFocus(this)}
                                onKeyDown={(onKeyDown) => {
                                  if (onKeyDown.keyCode === SPACEBAR && !onKeyDown.target.value) onKeyDown.preventDefault();
                                }}
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
                            />
                          </Col>)
                        )}
                        {
                          (costingTypeId === VBCTypeId && getConfigurationKey().IsDestinationPlantConfigure) &&
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
                                !isOverheadPercent ? [required, positiveAndDecimalNumber, maxLength15, decimalLengthThree] : []
                              }
                              component={renderNumberInputField}
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
                              label={`Overhead on RM (%)`}
                              name={"OverheadRMPercentage"}
                              type="text"
                              placeholder={isRM || isViewMode ? "-" : "Enter"}
                              validate={!isRM ? [required, positiveAndDecimalNumber, maxLength15, decimalLengthThree] : []}
                              component={renderNumberInputField}
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
                              name={"OverheadMachiningCCPercentage"}
                              type="text"
                              placeholder={isCC || isViewMode ? "-" : "Enter"}
                              validate={!isCC ? [required, positiveAndDecimalNumber, maxLength15, decimalLengthThree] : []}
                              component={renderNumberInputField}
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
                              label={`Overhead on BOP (%)`}
                              name={"OverheadBOPPercentage"}
                              type="text"
                              placeholder={isBOP || isViewMode ? "-" : "Enter"}
                              validate={!isBOP ? [required, positiveAndDecimalNumber, maxLength15, decimalLengthThree] : []}
                              component={renderNumberInputField}
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
                              minDate={this.state.minEffectiveDate}
                              validate={[required]}
                              autoComplete={'off'}
                              required={true}
                              changeHandler={(e) => {
                              }}
                              component={renderDatePicker}
                              className="form-control"
                              disabled={isViewMode || isDataChanged}
                              placeholder={isViewMode || isDataChanged ? '-' : "Select Date"}
                              onFocus={() => onFocus(this, true)}
                            />
                          </div>
                          {this.state.showErrorOnFocusDate && this.state.effectiveDate === '' && <div className='text-help mt-1 p-absolute bottom-22'>This field is required.</div>}
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
                            component={renderTextAreaField}
                            maxLength="512"
                            disabled={isViewMode}
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
                              onChangeStatus={this.handleChangeStatus}
                              PreviewComponent={this.Preview}
                              accept="*"
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
                        <button
                          type={"button"}
                          className=" mr15 cancel-btn"
                          onClick={() => { this.cancel('cancel') }}
                          disabled={setDisable}
                        >
                          <div className={"cancel-icon"}></div>
                          {"Cancel"}
                        </button>
                        {/* <button onClick={this.options}>13</button> */}
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
  const { comman, overheadProfit, client, supplier } = state;
  const filedObj = selector(state, 'OverheadPercentage', 'OverheadRMPercentage', 'OverheadMachiningCCPercentage',
    'OverheadBOPPercentage')

  const { modelTypes, costingHead, plantSelectList } = comman;
  const { overheadProfitData, } = overheadProfit;
  const { clientSelectList } = client;
  const { vendorWithVendorCodeSelectList } = supplier;

  let initialValues = {};
  if (overheadProfitData && overheadProfitData !== undefined) {
    initialValues = {
      OverheadPercentage: overheadProfitData.OverheadPercentage !== null ? overheadProfitData.OverheadPercentage : '',
      OverheadRMPercentage: overheadProfitData.OverheadRMPercentage !== null ? overheadProfitData.OverheadRMPercentage : '',
      OverheadMachiningCCPercentage: overheadProfitData.OverheadMachiningCCPercentage !== null ? overheadProfitData.OverheadMachiningCCPercentage : '',
      OverheadBOPPercentage: overheadProfitData.OverheadBOPPercentage !== null ? overheadProfitData.OverheadBOPPercentage : '',
      Remark: overheadProfitData.Remark,
    }
  }

  return {
    modelTypes, costingHead, overheadProfitData, clientSelectList,
    vendorWithVendorCodeSelectList, filedObj, initialValues, plantSelectList
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
  getPlantSelectListByType,
  createOverhead,
  updateOverhead,
  getOverheadData,
  fileUploadOverHead,
  fileDeleteOverhead,
})(reduxForm({
  form: 'AddOverhead',
  enableReinitialize: true,
})(AddOverhead));
