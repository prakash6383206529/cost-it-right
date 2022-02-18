import React, { Component, } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Row, Col, Label } from 'reactstrap';
import { required, getVendorCode, positiveAndDecimalNumber, maxLength15, checkPercentageValue, decimalLengthThree } from "../../../helper/validation";
import { searchableSelect, renderTextAreaField, renderText, renderDatePicker } from "../../layout/FormInputs";
import { fetchModelTypeAPI, fetchCostingHeadsAPI, } from '../../../actions/Common';
import { getVendorWithVendorCodeSelectList } from '../actions/Supplier';
import {
  createOverhead, updateOverhead, getOverheadData, fileUploadOverHead,
  fileDeleteOverhead,
} from '../actions/OverheadProfit';
import { getClientSelectList, } from '../actions/Client';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { loggedInUserId, userDetails } from "../../../helper/auth";
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css'
import { FILE_URL } from '../../../config/constants';
import DayTime from '../../common/DayTimeWrapper'
import LoaderCustom from '../../common/LoaderCustom';
import imgRedcross from '../../../assests/images/red-cross.png'
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { debounce } from 'lodash';
import TooltipCustom from '../../common/Tooltip';
import AsyncSelect from 'react-select/async';

const selector = formValueSelector('AddOverhead');

class AddOverhead extends Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    // ********* INITIALIZE REF FOR DROPZONE ********
    this.dropzone = React.createRef();
    this.state = {
      OverheadID: '',
      costingHead: 'zero',
      isEditFlag: false,
      IsVendor: false,
      isViewMode: this.props?.data?.isViewMode ? true : false,
      isVendorNameNotSelected: false,

      ModelType: [],
      vendorName: [],
      vendorCode: '',
      client: [],

      overheadAppli: [],

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
      showPopup: false,
      updatedObj: {},
      setDisable: false,
      disablePopup: false,
      inputLoader: false,

    }
  }

  /**
   * @method componentDidMount
   * @description Called after rendering the component
   */
  componentDidMount() {
    this.props.fetchModelTypeAPI('--Model Types--', res => { });
    this.props.fetchCostingHeadsAPI('--Costing Heads--', res => { });
    this.props.getClientSelectList(() => { })
    this.getDetails();
  }

  /**
  * @method onPressVendor
  * @description Used for Vendor checked
  */
  onPressVendor = (vendorFlag, costingHeadFlag) => {
    this.setState({
      IsVendor: vendorFlag,
      costingHead: costingHeadFlag,
      vendorName: [],
    });
    if (costingHeadFlag === "vendor") {
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
    this.setState({ DropdownChanged: false })
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
        OverheadID: data.Id,
      })
      this.props.getOverheadData(data.Id, res => {
        if (res && res.data && res.data.Result) {

          const Data = res.data.Data;
          this.setState({ DataToChange: Data })
          this.props.change('EffectiveDate', DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '')
          setTimeout(() => {
            const { modelTypes, costingHead, vendorWithVendorCodeSelectList, clientSelectList } = this.props;
            const modelObj = modelTypes && modelTypes.find(item => Number(item.Value) === Data.ModelTypeId)
            const AppliObj = costingHead && costingHead.find(item => Number(item.Value) === Data.OverheadApplicabilityId)
            const vendorObj = vendorWithVendorCodeSelectList && vendorWithVendorCodeSelectList.find(item => item.Value === Data.VendorId)
            const clientObj = clientSelectList && clientSelectList.find(item => item.Value === Data.ClientId)

            let Head = '';
            if (Data.IsVendor === true && Data.VendorId != null) {
              Head = 'vendor';
            } else if (Data.IsClient === true) {
              Head = 'client';
            } else {
              Head = 'zero';
            }

            this.setState({
              isEditFlag: true,
              // isLoader: false,
              IsVendor: Data.IsClient ? Data.IsClient : Data.IsVendor,
              costingHead: Head,
              ModelType: modelObj && modelObj !== undefined ? { label: modelObj.Text, value: modelObj.Value } : [],
              vendorName: vendorObj && vendorObj !== undefined ? { label: vendorObj.Text, value: vendorObj.Value } : [],
              client: clientObj && clientObj !== undefined ? { label: clientObj.Text, value: clientObj.Value } : [],
              overheadAppli: AppliObj && AppliObj !== undefined ? { label: AppliObj.Text, value: AppliObj.Value } : [],
              remarks: Data.Remark,
              files: Data.Attachements,
              effectiveDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '',
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
    const { vendorWithVendorCodeSelectList, clientSelectList, modelTypes, costingHead } = this.props;
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
    this.setState({ DropdownChanged: false })
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
  handleChangeStatus = ({ meta, file, remove }, status) => {

    const { files, } = this.state;

    this.setState({ uploadAttachements: false, setDisable: true })

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

  marked = (files, extra) => {

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
  cancel = () => {
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
    this.props.hideForm()
  }



  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = debounce((values) => {
    const { costingHead, IsVendor, client, ModelType, vendorName, overheadAppli, remarks, OverheadID,
      isRM, isCC, isBOP, isOverheadPercent, isEditFlag, files, effectiveDate, DataToChange, DropdownChanged,uploadAttachements } = this.state;
    const userDetail = userDetails()



    if (vendorName.length <= 0) {

      if (IsVendor && costingHead === 'vendor') {
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

        this.cancel()
        return false
      }
      this.setState({ setDisable: true, disablePopup: false })
      let updatedFiles = files.map((file) => {
        return { ...file, ContextId: OverheadID }
      })
      let requestData = {
        OverheadId: OverheadID,
        VendorName: IsVendor ? (costingHead === 'vendor' ? vendorName.label : '') : userDetail.ZBCSupplierInfo.VendorName,
        IsClient: costingHead === 'client' ? true : false,
        ClientName: costingHead === 'client' ? client.label : '',
        OverheadApplicabilityType: overheadAppli.label,
        ModelType: ModelType.label,
        IsVendor: IsVendor,
        IsCombinedEntry: !isOverheadPercent ? true : false,
        OverheadPercentage: values.OverheadPercentage,
        OverheadMachiningCCPercentage: values.OverheadMachiningCCPercentage,
        OverheadBOPPercentage: values.OverheadBOPPercentage,
        OverheadRMPercentage: values.OverheadRMPercentage,
        Remark: remarks,
        VendorId: IsVendor ? (costingHead === 'vendor' ? vendorName.value : '') : userDetail.ZBCSupplierInfo.VendorId,
        VendorCode: IsVendor ? (costingHead === 'vendor' ? getVendorCode(vendorName.label) : '') : userDetail.ZBCSupplierInfo.VendorNameWithCode,
        ClientId: costingHead === 'client' ? client.value : '',
        OverheadApplicabilityId: overheadAppli.value,
        ModelTypeId: ModelType.value,
        IsActive: true,
        CreatedDate: '',
        CreatedBy: loggedInUserId(),
        Attachements: updatedFiles,
        EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
        IsForcefulUpdated: true
      }
      if (isEditFlag) {
        this.setState({ showPopup: true, updatedObj: requestData })
      }


    } else {

      this.setState({ setDisable: true })
      const formData = {
        EAttachementEntityName: 0,
        IsVendor: IsVendor,
        IsCombinedEntry: !isOverheadPercent ? true : false,
        OverheadPercentage: !isOverheadPercent ? values.OverheadPercentage : '',
        OverheadMachiningCCPercentage: !isCC ? values.OverheadMachiningCCPercentage : '',
        OverheadBOPPercentage: !isBOP ? values.OverheadBOPPercentage : '',
        OverheadRMPercentage: !isRM ? values.OverheadRMPercentage : '',
        Remark: remarks,
        VendorId: IsVendor ? (costingHead === 'vendor' ? vendorName.value : '') : userDetail.ZBCSupplierInfo.VendorId,
        VendorCode: IsVendor ? (costingHead === 'vendor' ? getVendorCode(vendorName.label) : '') : userDetail.ZBCSupplierInfo.VendorNameWithCode,
        ClientId: costingHead === 'client' ? client.value : '',
        OverheadApplicabilityId: overheadAppli.value,
        ModelTypeId: ModelType.value,
        IsActive: true,
        CreatedDate: '',
        CreatedBy: loggedInUserId(),
        Attachements: files,
        EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss')
      }

      this.props.createOverhead(formData, (res) => {
        this.setState({ setDisable: false })
        if (res?.data?.Result) {
          Toaster.success(MESSAGES.OVERHEAD_ADDED_SUCCESS);
          this.cancel();
        }
      });
    }
  }, 500)
  onPopupConfirm = () => {
    this.setState({ disablePopup: true })
    this.props.updateOverhead(this.state.updatedObj, (res) => {
      this.setState({ setDisable: false })
      if (res?.data?.Result) {
        Toaster.success(MESSAGES.OVERHEAD_UPDATE_SUCCESS);
        this.cancel()
      }
    });
  }
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
    const { handleSubmit, } = this.props;
    const { isRM, isCC, isBOP, isOverheadPercent, isEditFlag, costingHead,
      isHideOverhead, isHideBOP, isHideRM, isHideCC, isViewMode, setDisable, disablePopup } = this.state;
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
                      <h1>
                        {isEditFlag
                          ? `Update Overhead Details`
                          : `Add Overhead Details`}
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
                                costingHead === "zero" ? true : false
                              }
                              onClick={() =>
                                this.onPressVendor(false, "zero")
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
                                costingHead === "vendor" ? true : false
                              }
                              onClick={() =>
                                this.onPressVendor(true, "vendor")
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
                                costingHead === "client" ? true : false
                              }
                              onClick={() =>
                                this.onPressVendor(true, "client")
                              }
                              disabled={isEditFlag ? true : false}
                            />{" "}
                            <span>Client Based</span>
                          </Label>
                        </Col>
                      </Row>
                      <Row>
                        <Col md="4" >
                          <Field
                            name="ModelType"
                            type="text"
                            label="Model Type"
                            component={searchableSelect}
                            placeholder={"Select"}
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
                        {this.state.IsVendor && costingHead === "vendor" && (
                          <Col md="4" >
                            <label>{"Vendor Name"}<span className="asterisk-required">*</span></label>
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
                        )}
                        {this.state.IsVendor && costingHead === "client" && (
                          <Col md="4">
                            <Field
                              name="clientName"
                              type="text"
                              label={"Client Name"}
                              component={searchableSelect}
                              placeholder={"Select"}
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

                        <Col md="4" >
                          <Field
                            name="OverheadApplicability"
                            type="text"
                            label="Overhead Applicability"
                            component={searchableSelect}
                            placeholder={"Select"}
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
                          <Col md="4">
                            <Field
                              label={`Overhead (%)`}
                              name={"OverheadPercentage"}
                              type="text"
                              placeholder={
                                !isOverheadPercent ? "Enter" : ""
                              }
                              validate={
                                !isOverheadPercent ? [required, positiveAndDecimalNumber, maxLength15, decimalLengthThree] : []
                              }
                              component={renderText}
                              onBlur={this.handlePercent}
                              required={!isOverheadPercent ? true : false}
                              className=""
                              customClassName=" withBorder"
                              maxLength={15}
                              disabled={isOverheadPercent || isViewMode ? true : false}
                            />
                          </Col>
                        )}
                        {!isHideRM && (
                          <Col md="4">
                            <Field
                              label={`Overhead on RM (%)`}
                              name={"OverheadRMPercentage"}
                              type="text"
                              placeholder={!isRM ? "Enter" : ""}
                              validate={!isRM ? [required, positiveAndDecimalNumber, maxLength15, decimalLengthThree] : []}
                              component={renderText}
                              required={!isRM ? true : false}
                              className=""
                              customClassName=" withBorder"
                              disabled={isRM || isViewMode ? true : false}
                            />
                          </Col>
                        )}
                        {!isHideCC && (
                          <Col md="4">
                            <Field
                              label={`Overhead on CC (%)`}
                              name={"OverheadMachiningCCPercentage"}
                              type="text"
                              placeholder={!isCC ? "Enter" : ""}
                              validate={!isCC ? [required, positiveAndDecimalNumber, maxLength15, decimalLengthThree] : []}
                              component={renderText}
                              required={!isCC ? true : false}
                              className=""
                              customClassName=" withBorder"
                              disabled={isCC || isViewMode ? true : false}
                            />
                          </Col>
                        )}
                        {!isHideBOP && (
                          <Col md="4">
                            <Field
                              label={`Overhead on BOP (%)`}
                              name={"OverheadBOPPercentage"}
                              type="text"
                              placeholder={!isBOP ? "Enter" : ""}
                              validate={!isBOP ? [required, positiveAndDecimalNumber, maxLength15, decimalLengthThree] : []}
                              component={renderText}
                              required={!isBOP ? true : false}
                              className=""
                              customClassName=" withBorder"
                              disabled={isBOP || isViewMode ? true : false}
                            />
                          </Col>
                        )}
                        <Col md="4">

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
                              className="form-control"
                              disabled={isEditFlag ? true : false}

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
                            placeholder="Type here..."
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
                              getUploadParams={this.getUploadParams}
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
                            {this.state.files &&
                              this.state.files.map((f) => {
                                const withOutTild = f.FileURL.replace(
                                  "~",
                                  ""
                                );
                                const fileURL = `${FILE_URL}${withOutTild}`;
                                return (
                                  <div className={"attachment images"}>
                                    <a href={fileURL} target="_blank">
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
                          onClick={this.cancel}
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
          {
            this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} disablePopup={disablePopup} />
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
  const { comman, overheadProfit, client, supplier } = state;
  const filedObj = selector(state, 'OverheadPercentage', 'OverheadRMPercentage', 'OverheadMachiningCCPercentage',
    'OverheadBOPPercentage')

  const { modelTypes, costingHead, } = comman;
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
    vendorWithVendorCodeSelectList, filedObj, initialValues,
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
  createOverhead,
  updateOverhead,
  getOverheadData,
  fileUploadOverHead,
  fileDeleteOverhead,
})(reduxForm({
  form: 'AddOverhead',
  enableReinitialize: true,
})(AddOverhead));
