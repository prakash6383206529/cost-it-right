import React, { Component, } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Row, Col, Label } from 'reactstrap';
import { required, maxLength100, getVendorCode, number, maxLength512, positiveAndDecimalNumber, maxLength15, checkPercentageValue, decimalLengthThree } from "../../../helper/validation";
import { renderText, searchableSelect, renderTextAreaField, renderDatePicker } from "../../layout/FormInputs";
import { fetchModelTypeAPI, fetchCostingHeadsAPI, } from '../../../actions/Common';
import { getVendorWithVendorCodeSelectList } from '../actions/Supplier';
import {
  createProfit, updateProfit, getProfitData, fileUploadProfit, fileDeleteProfit,
} from '../actions/OverheadProfit';
import { getClientSelectList, } from '../actions/Client';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import { loggedInUserId, userDetails } from "../../../helper/auth";
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css'
import $ from 'jquery';
import { FILE_URL } from '../../../config/constants';
import moment from 'moment';
import LoaderCustom from '../../common/LoaderCustom';
const selector = formValueSelector('AddProfit');

class AddProfit extends Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    this.state = {
      ProfitID: '',
      costingHead: 'zero',
      isShowForm: false,
      isEditFlag: false,
      IsVendor: false,

      ModelType: [],
      vendorName: [],
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
      effectiveDate: '',
      DropdownChanged: true,
      DataToChange: []
    }
  }

  /**
   * @method componentDidMount
   * @description Called after rendering the component
   */
  componentDidMount() {
    this.props.fetchModelTypeAPI('--Model Types--', res => { });
    this.props.fetchCostingHeadsAPI('--Costing Heads--', res => { });
    this.props.getVendorWithVendorCodeSelectList()
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
        ProfitID: data.Id,
      })
      $('html, body').animate({ scrollTop: 0 }, 'slow');
      this.props.getProfitData(data.Id, res => {
        if (res && res.data && res.data.Result) {

          const Data = res.data.Data;
          this.setState({ DataToChange: Data })
          this.props.change('EffectiveDate', moment(Data.EffectiveDate)._isValid ? moment(Data.EffectiveDate)._d : '')
          setTimeout(() => {
            const { modelTypes, costingHead, vendorWithVendorCodeSelectList, clientSelectList } = this.props;

            const modelObj = modelTypes && modelTypes.find(item => Number(item.Value) === Data.ModelTypeId)
            const AppliObj = costingHead && costingHead.find(item => Number(item.Value) === Data.ProfitApplicabilityId)
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
              effectiveDate: moment(Data.EffectiveDate)._isValid ? moment(Data.EffectiveDate)._d : '',
            }, () => {
              this.checkOverheadFields()
              this.setState({ isLoader: false })
            })
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
    const { vendorWithVendorCodeSelectList, modelTypes, costingHead, clientSelectList } = this.props;
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
        if (item.Value === '0') return false;
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
      this.setState({ vendorName: newValue });
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
        this.setState({ isOverheadPercent: true })
      } else {
        this.checkOverheadFields()
      }

    }
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
        sHideOverhead: false,
        isHideBOP: false,
        isHideCC: false,
        isHideRM: false,
      })
    }
    this.setState({ DropdownChanged: false })
  };

  handlePercent = (e) => {
    if (e.target.value > 100) {
      toastr.warning('Profit Percent can not be greater than 100.')
      $('input[name="ProfitPercentage"]').focus()
    }
  }

  resetFields = () => {
    this.props.change('ProfitPercentage', '')
    this.props.change('ProfitMachiningCCPercentage', '')
    this.props.change('ProfitBOPPercentage', '')
    this.props.change('ProfitRMPercentage', '')
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

  formToggle = () => {
    this.setState({
      isShowForm: !this.state.isShowForm
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
      this.props.fileUploadProfit(data, (res) => {
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
      this.props.fileDeleteProfit(deleteData, (res) => {
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

  /**
  * @method cancel
  * @description used to Cancel form
  */
  cancel = () => {
    const { reset } = this.props;
    reset();
    this.setState({
      remarks: '',
      isShowForm: false,
      IsVendor: false,
      ModelType: [],
      vendorName: [],
      overheadAppli: [],
    })
    this.props.getProfitData('', res => { })
    this.props.hideForm()
  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = (values) => {
    const { costingHead, IsVendor, ModelType, vendorName, client, overheadAppli, remarks, ProfitID,
      isRM, isCC, isBOP, isOverheadPercent, isEditFlag, files, effectiveDate, DataToChange, DropdownChanged } = this.state;
    const userDetail = userDetails()

    if (isEditFlag) {
      console.log(values, 'values')
      console.log(DataToChange, 'DataToChange')

      if (values.ProfitBOPPercentage == '') {
        values.ProfitBOPPercentage = null
      }
      if (values.ProfitMachiningCCPercentage == '') {
        values.ProfitMachiningCCPercentage = null
      }
      if (values.ProfitPercentage == '') {
        values.ProfitPercentage = null
      }
      if (values.ProfitRMPercentage == '') {
        values.ProfitRMPercentage = null
      }

      if (
        DropdownChanged && DataToChange.ProfitBOPPercentage == values.ProfitBOPPercentage && DataToChange.ProfitMachiningCCPercentage == values.ProfitMachiningCCPercentage
        && DataToChange.ProfitPercentage == values.ProfitPercentage && DataToChange.ProfitRMPercentage == values.ProfitRMPercentage
        && DataToChange.Remark == values.Remark) {
        console.log('asdf')
        this.cancel()
        return false
      }

      let updatedFiles = files.map((file) => {
        return { ...file, ContextId: ProfitID }
      })
      let requestData = {
        ProfitId: ProfitID,
        VendorName: IsVendor ? (costingHead === 'vendor' ? vendorName.label : '') : userDetail.ZBCSupplierInfo.VendorName,
        IsClient: costingHead === 'client' ? true : false,
        ClientName: costingHead === 'client' ? client.label : '',
        ProfitApplicabilityType: overheadAppli.label,
        ModelType: ModelType.label,
        IsVendor: IsVendor,
        IsCombinedEntry: !isOverheadPercent ? true : false,
        ProfitPercentage: values.ProfitPercentage,
        ProfitMachiningCCPercentage: values.ProfitMachiningCCPercentage,
        ProfitBOPPercentage: values.ProfitBOPPercentage,
        ProfitRMPercentage: values.ProfitRMPercentage,
        Remark: remarks,
        VendorId: IsVendor ? (costingHead === 'vendor' ? vendorName.value : '') : userDetail.ZBCSupplierInfo.VendorId,
        VendorCode: IsVendor ? (costingHead === 'vendor' ? getVendorCode(vendorName.label) : '') : userDetail.ZBCSupplierInfo.VendorNameWithCode,
        ClientId: costingHead === 'client' ? client.value : '',
        ProfitApplicabilityId: overheadAppli.value,
        ModelTypeId: ModelType.value,
        IsActive: true,
        CreatedDate: '',
        CreatedBy: loggedInUserId(),
        Attachements: updatedFiles,
        EffectiveDate: moment(effectiveDate).local().format('YYYY-MM-DD HH:mm:ss'),
        IsForcefulUpdated: true
      }
      if (isEditFlag) {
        const toastrConfirmOptions = {
          onOk: () => {
            this.props.reset()
            this.props.updateProfit(requestData, (res) => {
              if (res.data.Result) {
                toastr.success(MESSAGES.PROFIT_UPDATE_SUCCESS);
                this.cancel()
              }
            })
          },
          onCancel: () => { },
        }
        return toastr.confirm(`${'You have changed details, So your all Pending for Approval costing will get Draft. Do you wish to continue?'}`, toastrConfirmOptions,)
      }



    } else {

      const formData = {
        IsVendor: IsVendor,
        IsCombinedEntry: !isOverheadPercent ? true : false,
        ProfitPercentage: !isOverheadPercent ? values.ProfitPercentage : '',
        ProfitMachiningCCPercentage: !isCC ? values.ProfitMachiningCCPercentage : '',
        ProfitBOPPercentage: !isBOP ? values.ProfitBOPPercentage : '',
        ProfitRMPercentage: !isRM ? values.ProfitRMPercentage : '',
        Remark: remarks,
        VendorId: IsVendor ? (costingHead === 'vendor' ? vendorName.value : '') : userDetail.ZBCSupplierInfo.VendorId,
        VendorCode: IsVendor ? (costingHead === 'vendor' ? getVendorCode(vendorName.label) : '') : userDetail.ZBCSupplierInfo.VendorNameWithCode,
        ClientId: costingHead === 'client' ? client.value : '',
        ProfitApplicabilityId: overheadAppli.value,
        ModelTypeId: ModelType.value,
        IsActive: true,
        CreatedDate: '',
        CreatedBy: loggedInUserId(),
        Attachements: files,
        EffectiveDate: moment(effectiveDate).local().format('YYYY-MM-DD HH:mm:ss')
      }

      this.props.reset()
      this.props.createProfit(formData, (res) => {
        if (res.data.Result) {
          toastr.success(MESSAGES.PROFIT_ADDED_SUCCESS);
          this.cancel()
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
    const { handleSubmit, } = this.props;
    const { isRM, isCC, isBOP, isOverheadPercent, isEditFlag, costingHead,
      isHideOverhead, isHideBOP, isHideRM, isHideCC } = this.state;

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
                          ? `Update Profit Details`
                          : `Add Profit Details`}
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
                          <Label className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3 radio-box pt-0"} check>
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
                          <Label className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3 radio-box pt-0"} check>
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
                          <Label className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3 radio-box pt-0"} check>
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
                          //disabled={isEditFlag ? true : false}
                          />
                        </Col>
                        {this.state.IsVendor && costingHead === "vendor" && (
                          <Col md="4">
                            <Field
                              name="vendorName"
                              type="text"
                              label={"Vendor Name"}
                              component={searchableSelect}
                              placeholder={"Select"}
                              options={this.renderListing("VendorNameList")}
                              //onKeyUp={(e) => this.changeItemDesc(e)}
                              validate={
                                this.state.vendorName == null ||
                                  this.state.vendorName.length === 0
                                  ? [required]
                                  : []
                              }
                              required={true}
                              handleChangeDescription={
                                this.handleVendorName
                              }
                              valueDescription={this.state.vendorName}
                              disabled={isEditFlag ? true : false}
                            />
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
                            name="ProfitApplicabilityId"
                            type="text"
                            label="Profit Applicability"
                            component={searchableSelect}
                            placeholder={"Select"}
                            options={this.renderListing(
                              "ProfitApplicability"
                            )}
                            //onKeyUp={(e) => this.changeItemDesc(e)}
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
                          //disabled={isEditFlag ? true : false}
                          />
                        </Col>
                        {!isHideOverhead && (
                          <Col md="4">
                            <Field
                              label={`Profit (%)`}
                              name={"ProfitPercentage"}
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
                              max={100}
                              disabled={isOverheadPercent ? true : false}
                            />
                          </Col>
                        )}
                        {!isHideRM && (
                          <Col md="4">
                            <Field
                              label={`Profit on RM (%)`}
                              name={"ProfitRMPercentage"}
                              type="text"
                              placeholder={!isRM ? "Enter" : ""}
                              validate={!isRM ? [required, positiveAndDecimalNumber, maxLength15, decimalLengthThree] : []}
                              component={renderText}
                              //onChange={this.handleCalculation}
                              required={!isRM ? true : false}
                              className=""
                              customClassName=" withBorder"
                              disabled={isRM ? true : false}
                            />
                          </Col>
                        )}
                        {!isHideCC && (
                          <Col md="4">
                            <Field
                              label={`Profit on CC (Machining) (%)`}
                              name={"ProfitMachiningCCPercentage"}
                              type="text"
                              placeholder={!isCC ? "Enter" : ""}
                              validate={!isCC ? [required, positiveAndDecimalNumber, maxLength15, decimalLengthThree] : []}
                              component={renderText}
                              //onChange={this.handleCalculation}
                              required={!isCC ? true : false}
                              className=""
                              customClassName=" withBorder"
                              disabled={isCC ? true : false}
                            />
                          </Col>
                        )}
                        {!isHideBOP && (
                          <Col md="4">
                            <Field
                              label={`Profit on BOP (%)`}
                              name={"ProfitBOPPercentage"}
                              type="text"
                              placeholder={!isBOP ? "Enter" : ""}
                              validate={!isBOP ? [required, positiveAndDecimalNumber, maxLength15, decimalLengthThree] : []}
                              component={renderText}
                              //onChange={this.handleCalculation}
                              required={!isBOP ? true : false}
                              className=""
                              customClassName=" withBorder"
                              disabled={isBOP ? true : false}
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
                                //e.preventDefault()
                              }}
                              component={renderDatePicker}
                              className="form-control"
                              disabled={isEditFlag ? true : false}
                            //minDate={moment()}
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
                          ) : (
                            <Dropzone
                              getUploadParams={this.getUploadParams}
                              onChangeStatus={this.handleChangeStatus}
                              PreviewComponent={this.Preview}
                              //onSubmit={this.handleSubmit}
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
                          )}
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
                                        this.deleteFile(
                                          f.FileId,
                                          f.FileName
                                        )
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
                          className=" mr15 cancel-btn"
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

  const { modelTypes, costingHead, } = comman;
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
    filedObj, initialValues,
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
  updateProfit,
  getProfitData,
  fileUploadProfit,
  fileDeleteProfit,
})(reduxForm({
  form: 'AddProfit',
  enableReinitialize: true,
})(AddProfit));
