import React, { Component, } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Row, Col, } from 'reactstrap';
import {
  required, checkForNull, checkForDecimalAndNull, acceptAllExceptSingleSpecialCharacter, maxLength20, alphaNumeric,
  postiveNumber, maxLength10, positiveAndDecimalNumber, maxLength512, maxLength, decimalLengthFour, decimalLengthsix
} from "../../../helper/validation";
import { renderText, searchableSelect, renderMultiSelectField, renderTextAreaField, renderDatePicker } from "../../layout/FormInputs";
import { fetchMaterialComboAPI, getPlantBySupplier, getUOMSelectList, getCurrencySelectList, getPlantSelectListByType, } from '../../../actions/Common';
import {
  createBOPImport, updateBOPImport, getBOPCategorySelectList, getBOPImportById,
  fileUploadBOPDomestic, fileDeleteBOPDomestic,
} from '../actions/BoughtOutParts';
import { getVendorWithVendorCodeSelectList, getVendorTypeBOPSelectList, } from '../actions/Supplier';
import { getPartSelectList } from '../actions/Part';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import { getConfigurationKey, loggedInUserId } from "../../../helper/auth";
import Switch from "react-switch";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css';
import { FILE_URL, ZBC, INR } from '../../../config/constants';
import AddBOPCategory from './AddBOPCategory';
import AddVendorDrawer from '../supplier-master/AddVendorDrawer';
import AddUOM from '../uom-master/AddUOM';
import moment from 'moment';
import { AcceptableBOPUOM, AcceptableRMUOM } from '../../../config/masterData'
import { getExchangeRateByCurrency } from "../../costing/actions/Costing"
import LoaderCustom from '../../common/LoaderCustom';
import WarningMessage from '../../common/WarningMessage'
import saveImg from '../../../assests/images/check.png'
import cancelImg from '../../../assests/images/times.png'
import imgRedcross from '../../../assests/images/red-cross.png';
import ConfirmComponent from '../../../helper/ConfirmComponent';

const selector = formValueSelector('AddBOPImport');

class AddBOPImport extends Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    this.state = {
      isEditFlag: false,
      IsVendor: false,

      BOPCategory: [],
      isCategoryDrawerOpen: false,

      selectedPartAssembly: [],
      selectedPlants: [],

      isOpenVendor: false,

      vendorName: [],
      selectedVendorPlants: [],

      sourceLocation: [],

      UOM: [],
      isOpenUOM: false,
      currency: [],

      effectiveDate: '',
      files: [],

      netLandedcost: '',
      currencyValue: 1,
      showCurrency: false,
      netLandedConverionCost: '',
      DataToChange: [],
      DropdownChange: true,
      showWarning: false
    }
  }

  /**
  * @method componentWillMount
  * @description Called before render the component
  */
  UNSAFE_componentWillMount() {
    this.props.getUOMSelectList(() => { })
    this.props.getBOPCategorySelectList(() => { })
    this.props.getPartSelectList(() => { })
    this.props.getPlantSelectListByType(ZBC, () => { })
  }

  /**
   * @method componentDidMount
   * @description Called after rendering the component
   */
  componentDidMount() {
    this.props.fetchMaterialComboAPI(res => { });
    this.props.getVendorTypeBOPSelectList(() => { })
    this.props.getCurrencySelectList(() => { })
    this.getDetails()
  }

  componentDidUpdate(prevProps) {
    if (this.props.fieldsObj !== prevProps.fieldsObj) {
      this.handleCalculation()
    }
  }

  /**
  * @method onPressVendor
  * @description Used for Vendor checked
  */
  onPressVendor = () => {
    this.setState({
      IsVendor: !this.state.IsVendor,
      vendorName: [],
      selectedVendorPlants: [],
      selectedPlants: [],
    }, () => {
      const { IsVendor } = this.state;
      if (IsVendor) {
        this.props.getVendorWithVendorCodeSelectList(() => { })
      } else {
        this.props.getVendorTypeBOPSelectList(() => { })
      }
    });
  }

  /**
  * @method handleCategoryChange
  * @description  used to handle BOP Category Selection
  */
  handleCategoryChange = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ BOPCategory: newValue });
    } else {
      this.setState({ BOPCategory: [], });
    }
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
        BOPID: data.Id,
      })

      this.props.getBOPImportById(data.Id, res => {
        if (res && res.data && res.data.Result) {

          const Data = res.data.Data;
          this.setState({ DataToChange: Data })

          this.props.change('EffectiveDate', moment(Data.EffectiveDate)._isValid ? moment(Data.EffectiveDate)._d : '')
          if (Data.IsVendor) {
            this.props.getVendorWithVendorCodeSelectList(() => { })
          } else {
            this.props.getVendorTypeBOPSelectList(() => { })
          }
          this.props.getPlantBySupplier(Data.Vendor, () => { })

          setTimeout(() => {
            const { cityList, bopCategorySelectList, vendorWithVendorCodeSelectList, currencySelectList, UOMSelectList, plantSelectList } = this.props;
            let plantObj;
            let categoryObj = bopCategorySelectList && bopCategorySelectList.find(item => Number(item.Value) === Data.CategoryId)
            let vendorObj = vendorWithVendorCodeSelectList && vendorWithVendorCodeSelectList.find(item => item.Value === Data.Vendor)
            let currencyObj = currencySelectList && currencySelectList.find(item => item.Text === Data.Currency)
            // let partArray = Data && Data.Part.map((item) => ({ Text: item.PartNumber, Value: item.PartId }))
            let vendorPlantArray = Data && Data.VendorPlant.map((item) => ({ Text: item.PlantName, Value: item.PlantId }))
            let sourceLocationObj = cityList && cityList.find(item => Number(item.Value) === Data.SourceLocation)
            let uomObject = UOMSelectList && UOMSelectList.find(item => item.Value === Data.UnitOfMeasurementId)
            this.handleCurrency({ label: currencyObj.Text, value: currencyObj.Value })
            this.handleEffectiveDateChange(moment(Data.EffectiveDate)._isValid ? moment(Data.EffectiveDate)._d : '')

            if (getConfigurationKey().IsDestinationPlantConfigure) {
              let obj = plantSelectList && plantSelectList.find(item => item.Value === Data.DestinationPlantId)
              plantObj = { label: obj.Text, value: obj.Value }
            } else {
              plantObj = Data && Data.Plant.length > 0 ? { label: Data.Plant[0].PlantName, value: Data.Plant[0].PlantId } : []
            }


            this.setState({
              isEditFlag: true,
              // isLoader: false,
              IsVendor: Data.IsVendor,
              BOPCategory: categoryObj && categoryObj !== undefined ? { label: categoryObj.Text, value: categoryObj.Value } : [],
              selectedPlants: plantObj,
              vendorName: vendorObj && vendorObj !== undefined ? { label: vendorObj.Text, value: vendorObj.Value } : [],
              currency: currencyObj && currencyObj !== undefined ? { label: currencyObj.Text, value: currencyObj.Value } : [],
              selectedVendorPlants: vendorPlantArray,
              sourceLocation: sourceLocationObj && sourceLocationObj !== undefined ? { label: sourceLocationObj.Text, value: sourceLocationObj.Value } : [],
              effectiveDate: moment(Data.EffectiveDate)._isValid ? moment(Data.EffectiveDate)._d : '',
              files: Data.Attachements,
              UOM: uomObject && uomObject !== undefined ? { label: uomObject.Display, value: uomObject.Value } : [],
            }, () => this.setState({ isLoader: false }))
          }, 500)
        }
      })
    }
    else {
      this.setState({
        isLoader: false,
      })
      this.props.getBOPImportById('', res => { })
    }

  }


  /**
  * @method renderListing
  * @description Used to show type of listing
  */
  renderListing = (label) => {
    const { vendorWithVendorCodeSelectList, bopCategorySelectList, partSelectList, plantSelectList, filterPlantList, cityList,
      UOMSelectList, currencySelectList, } = this.props;
    const temp = [];
    if (label === 'BOPCategory') {
      bopCategorySelectList && bopCategorySelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'PartAssembly') {
      partSelectList && partSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ Text: item.Text, Value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'plant') {
      plantSelectList && plantSelectList.map(item => {
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
    if (label === 'VendorPlant') {
      filterPlantList && filterPlantList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ Text: item.Text, Value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'SourceLocation') {
      cityList && cityList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'uom') {
      UOMSelectList && UOMSelectList.map(item => {
        const accept = AcceptableBOPUOM.includes(item.Type)
        if (accept === false) return false
        if (item.Value === '0') return false;
        temp.push({ label: item.Display, value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'currency') {
      currencySelectList && currencySelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }

  }

  categoryToggler = () => {
    this.setState({ isCategoryDrawerOpen: true })
  }

  closeCategoryDrawer = (e = '', formData = {}) => {
    this.setState({ isCategoryDrawerOpen: false, }, () => {
      this.props.getBOPCategorySelectList(() => {
        const { bopCategorySelectList } = this.props;
        if (Object.keys(formData).length > 0) {
          let categoryObj = bopCategorySelectList && bopCategorySelectList.find(item => item.Text === formData.Category)
          this.setState({ BOPCategory: categoryObj && categoryObj !== undefined ? { label: categoryObj.Text, value: categoryObj.Value } : [] })
        }

      })
    })
  }


  /**
  * @method handlePartAssembly
  * @description Used handle Part Assembly
  */
  handlePartAssembly = (e) => {
    this.setState({ selectedPartAssembly: e })
  }

  /**
  * @method handlePlant
  * @description Used handle Plant
  */
  handlePlant = (e) => {
    this.setState({ selectedPlants: e })
  }

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
  };

  /**
  * @method handleVendorName
  * @description called
  */
  handleVendorName = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ vendorName: newValue, selectedVendorPlants: [], }, () => {
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
      const { IsVendor } = this.state;
      if (IsVendor) {
        this.props.getVendorWithVendorCodeSelectList(() => { })
      } else {
        this.props.getVendorTypeBOPSelectList(() => { })
      }
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
  * @method handleSourceSupplierCity
  * @description called
  */
  handleSourceSupplierCity = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ sourceLocation: newValue, });
    } else {
      this.setState({ sourceLocation: [], })
    }
    this.setState({ DropdownChange: false })
  };

  /**
  * @method handleCurrency
  * @description called
  */
  handleCurrency = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      if (newValue.label === INR) {
        this.setState({ showCurrency: false }, () => {
          this.handleCalculation()
        })

      } else {
        this.setState({ showCurrency: true }, () => {
          if (this.state.effectiveDate) {
            this.props.getExchangeRateByCurrency(newValue.label, moment(this.state.effectiveDate).local().format('YYYY-MM-DD'), res => {
              //this.props.change('NetLandedCost', (fieldsObj.BasicRate * res.data.Data.CurrencyExchangeRate))

              if (Object.keys(res.data.Data).length === 0) {

                this.setState({ showWarning: true })
              }
              else {
                this.setState({ showWarning: false })
              }
              this.setState({ currencyValue: checkForNull(res.data.Data.CurrencyExchangeRate), showCurrency: true }, () => {
                this.handleCalculation()
              })
            })
          }
          // this.handleCalculation()
        })
      }
      this.setState({ currency: newValue, })
    } else {
      this.setState({ currency: [] })
    }
  };

  handleCalculation = () => {
    const { fieldsObj, initialConfiguration } = this.props
    const NoOfPieces = fieldsObj && fieldsObj.NumberOfPieces !== undefined ? fieldsObj.NumberOfPieces : 0;
    // COMMENTED FOR MINDA
    // const BasicRate = fieldsObj && fieldsObj.BasicRate !== undefined ? fieldsObj.BasicRate : 0;
    // const NetLandedCost = checkForNull((BasicRate / NoOfPieces) * this.state.currencyValue)
    // this.setState({ netLandedcost: (BasicRate / NoOfPieces), netLandedConverionCost: NetLandedCost })
    // this.props.change('NetLandedCost', checkForDecimalAndNull((BasicRate / NoOfPieces), initialConfiguration.NoOfDecimalForPrice))
    const BasicRate = fieldsObj && fieldsObj.BasicRate !== undefined ? fieldsObj.BasicRate : 0;
    const NetLandedCost = checkForNull((BasicRate) * this.state.currencyValue)
    this.setState({ netLandedcost: (BasicRate), netLandedConverionCost: NetLandedCost })
    this.props.change('NetLandedCost', checkForDecimalAndNull((BasicRate), initialConfiguration.NoOfDecimalForPrice))
    this.props.change('NetLandedCostCurrency', checkForDecimalAndNull(NetLandedCost, initialConfiguration.NoOfDecimalForPrice))
  }

  /**
  * @method handleChange
  * @description Handle Effective Date
  */
  handleEffectiveDateChange = (date) => {
    this.setState({
      effectiveDate: date,
    });
    const { currency } = this.state
    if (currency.label === INR) {
      this.setState({ currencyValue: 1, showCurrency: false }, () => {
        this.handleCalculation()
      })

    } else {
      this.props.getExchangeRateByCurrency(currency.label, moment(date).local().format('YYYY-MM-DD'), res => {
        //this.props.change('NetLandedCost', (fieldsObj.BasicRate * res.data.Data.CurrencyExchangeRate))

        if (Object.keys(res.data.Data).length === 0) {

          this.setState({ showWarning: true })
        }
        else {
          this.setState({ showWarning: false })
        }
        this.setState({ currencyValue: checkForNull(res.data.Data.CurrencyExchangeRate), showCurrency: true }, () => {
          this.handleCalculation()
        })
      })
    }
  };


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
      this.props.fileUploadBOPDomestic(data, (res) => {
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
      this.props.fileDeleteBOPDomestic(deleteData, (res) => {
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
    const { name, percent, status } = meta
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
  cancel = () => {
    const { reset } = this.props;
    reset();
    this.setState({
      IsVendor: false,
      selectedPartAssembly: [],
      selectedPlants: [],
      selectedVendorPlants: [],
      sourceLocation: [],
      UOM: [],
    })
    this.props.getBOPImportById('', res => { })
    this.props.hideForm()
  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = (values) => {
    const { IsVendor, BOPCategory, selectedPartAssembly, selectedPlants, vendorName, currency,
      selectedVendorPlants, sourceLocation, BOPID, isEditFlag, files, effectiveDate, UOM, netLandedConverionCost, DataToChange, DropdownChange } = this.state;

    const { initialConfiguration } = this.props;

    let partArray = selectedPartAssembly && selectedPartAssembly.map(item => ({ PartNumber: item.Text, PartId: item.Value }))
    let plantArray = { PlantName: selectedPlants.label, PlantId: selectedPlants.value, PlantCode: '' }
    let vendorPlantArray = selectedVendorPlants && selectedVendorPlants.map(item => ({ PlantName: item.Text, PlantId: item.Value, PlantCode: '' }))

    if (selectedPlants.length === 0 && !this.state.IsVendor) {
      return false;
    }

    if (isEditFlag) {


      if (DataToChange.IsVendor) {
        if (DropdownChange && DataToChange.Source == values.Source && DataToChange.NumberOfPieces == values.NumberOfPieces &&
          DataToChange.BasicRate == values.BasicRate) {
          this.cancel()
          return false;
        }
      }
      if (DataToChange.IsVendor == false) {
        if (DataToChange.NumberOfPieces == values.NumberOfPieces && DataToChange.BasicRate == values.BasicRate) {
          this.cancel()
          return false;
        }
      }
      let updatedFiles = files.map((file) => {
        return { ...file, ContextId: BOPID }
      })
      let requestData = {
        Currency: currency.label,
        BoughtOutPartId: BOPID,
        Source: values.Source,
        SourceLocation: values.sourceLocation,
        BasicRate: values.BasicRate,
        NetLandedCost: this.state.netLandedcost,
        Remark: values.Remark,
        LoggedInUserId: loggedInUserId(),
        Plant: IsVendor === false ? [plantArray] : [],
        Attachements: updatedFiles,
        UnitOfMeasurementId: UOM.value,
        NetLandedCostConversion: netLandedConverionCost,
        IsForcefulUpdated: true,
        NumberOfPieces: values.NumberOfPieces,
      }
      if (isEditFlag) {
        const toastrConfirmOptions = {
          onOk: () => {
            this.props.reset()
            this.props.updateBOPImport(requestData, (res) => {
              if (res.data.Result) {
                toastr.success(MESSAGES.UPDATE_BOP_SUCESS);
                this.cancel();
              }
            })
          },
          onCancel: () => { },
          component: () => <ConfirmComponent />
        }
        return toastr.confirm(`${'You have changed details, So your all Pending for Approval costing will get Draft. Do you wish to continue?'}`, toastrConfirmOptions,)
      }


    } else {

      const formData = {
        Currency: currency.label,
        IsVendor: IsVendor,
        EntryType: 0,
        BoughtOutPartNumber: values.BoughtOutPartNumber,
        BoughtOutPartName: values.BoughtOutPartName,
        CategoryId: BOPCategory.value,
        Specification: values.Specification,
        Vendor: vendorName.value,
        Source: values.Source,
        SourceLocation: sourceLocation.value,
        EffectiveDate: moment(effectiveDate).local().format('YYYY-MM-DD'),
        BasicRate: values.BasicRate,
        NumberOfPieces: values.NumberOfPieces,
        NetLandedCost: this.state.netLandedcost,
        Remark: values.Remark,
        IsActive: true,
        LoggedInUserId: loggedInUserId(),
        Plant: IsVendor === false ? [plantArray] : [],
        DestinationPlantId: selectedPlants.value ? selectedPlants.value : "00000000-0000-0000-0000-000000000000",
        VendorPlant: getConfigurationKey().IsVendorPlantConfigurable ? (IsVendor ? vendorPlantArray : []) : [],
        Attachements: files,
        UnitOfMeasurementId: UOM.value,
        NetLandedCostConversion: netLandedConverionCost
      }
      this.props.reset()
      this.props.createBOPImport(formData, (res) => {
        if (res.data.Result) {
          toastr.success(MESSAGES.BOP_ADD_SUCCESS);
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
    const { isCategoryDrawerOpen, isOpenVendor, isOpenUOM, isEditFlag, } = this.state;

    return (
      <>
        {this.state.isLoader && <LoaderCustom />}
        <div className="container-fluid">
          <div>
            <div className="login-container signup-form">
              <div className="row">
                <div className="col-md-12">
                  <div className="shadow-lgg login-formg">
                    <div className="row">
                      <div className="col-md-6">
                        <h1>
                          {isEditFlag
                            ? `Update Insert (Import)`
                            : `Add Insert (Import)`}
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
                              <div className={"right-title"}>
                                Vendor Based
                              </div>
                            </label>
                          </Col>
                        </Row>

                        <Row>
                          <Col md="12">
                            <div className="left-border">{"Insert:"}</div>
                          </Col>
                          <Col md="3">
                            <Field
                              label={`Insert Part No`}
                              name={"BoughtOutPartNumber"}
                              type="text"
                              placeholder={"Enter"}
                              validate={[required, acceptAllExceptSingleSpecialCharacter, maxLength20]}
                              component={renderText}
                              required={true}
                              disabled={isEditFlag ? true : false}
                              className=" "
                              customClassName=" withBorder"
                            />
                          </Col>
                          <Col md="3">
                            <Field
                              label={`Insert Part Name`}
                              name={"BoughtOutPartName"}
                              type="text"
                              placeholder={"Enter"}
                              validate={[required, acceptAllExceptSingleSpecialCharacter, maxLength(80)]}
                              component={renderText}
                              required={true}
                              disabled={isEditFlag ? true : false}
                              className=" "
                              customClassName=" withBorder"
                            />
                          </Col>
                          <Col md="3">
                            <div className="d-flex justify-space-between align-items-center inputwith-icon">
                              <div className="fullinput-icon">
                                <Field
                                  name="BOPCategory"
                                  type="text"
                                  label="Insert Category"
                                  component={searchableSelect}
                                  placeholder={"Select"}
                                  options={this.renderListing("BOPCategory")}
                                  //onKeyUp={(e) => this.changeItemDesc(e)}
                                  validate={
                                    this.state.BOPCategory == null || this.state.BOPCategory.length === 0 ? [required] : []}
                                  required={true}
                                  handleChangeDescription={
                                    this.handleCategoryChange
                                  }
                                  valueDescription={this.state.BOPCategory}
                                  disabled={isEditFlag ? true : false}
                                />
                              </div>
                              <div
                                onClick={this.categoryToggler}
                                className={"plus-icon-square right"}
                              ></div>
                            </div>
                          </Col>
                          <Col md="3">
                            <Field
                              label={`Specification`}
                              name={"Specification"}
                              type="text"
                              placeholder={"Enter"}
                              validate={[acceptAllExceptSingleSpecialCharacter, maxLength(80)]}
                              component={renderText}
                              //required={true}
                              disabled={isEditFlag ? true : false}
                              className=" "
                              customClassName=" withBorder"
                            />
                          </Col>

                        </Row>

                        <Row>

                          <Col md="3">
                            <Field
                              name="UOM"
                              type="text"
                              label="UOM"
                              component={searchableSelect}
                              placeholder={"Select"}
                              options={this.renderListing("uom")}
                              //onKeyUp={(e) => this.changeItemDesc(e)}
                              validate={
                                this.state.UOM == null || this.state.UOM.length === 0 ? [required] : []}
                              required={true}
                              handleChangeDescription={this.handleUOM}
                              valueDescription={this.state.UOM}
                              disabled={isEditFlag ? true : false}
                            />
                          </Col>
                          {(this.state.IsVendor === false || getConfigurationKey().IsDestinationPlantConfigure) && (
                            <Col md="3">
                              <Field
                                label={this.state.IsVendor ? 'Destination Plant' : 'Plant'}
                                name="Plant"
                                placeholder={"Select"}
                                //   selection={ this.state.selectedPlants == null || this.state.selectedPlants.length === 0 ? [] : this.state.selectedPlants} 
                                options={this.renderListing("plant")}
                                handleChangeDescription={this.handlePlant}
                                validate={this.state.selectedPlants == null || this.state.selectedPlants.length === 0 ? [required] : []}
                                // optionValue={(option) => option.Value}
                                // optionLabel={(option) => option.Text}
                                component={searchableSelect}
                                valueDescription={this.state.selectedPlants}
                                mendatory={true}
                                required
                                className="multiselect-with-border"
                                disabled={isEditFlag ? true : false}
                              />
                            </Col>
                          )}
                          {/* <Col md="3">
                            <Field
                              label="Part/ Assembly No."
                              name="PartAssemblyNo"
                              placeholder={"Select"}
                              selection={
                                this.state.selectedPartAssembly == null || this.state.selectedPartAssembly.length === 0 ? [] : this.state.selectedPartAssembly}
                              options={this.renderListing("PartAssembly")}
                              selectionChanged={this.handlePartAssembly}
                              optionValue={(option) => option.Value}
                              optionLabel={(option) => option.Text}
                              component={renderMultiSelectField}
                              // mendatory={true}
                              className="multiselect-with-border"
                            //disabled={(this.state.IsVendor || isEditFlag) ? true : false}
                            />
                          </Col> */}
                        </Row>

                        <Row>
                          <Col md="12">
                            <div className="left-border">{"Vendor:"}</div>
                          </Col>
                          <Col md="3">
                            <div className="d-flex justify-space-between align-items-center inputwith-icon">
                              <div className="fullinput-icon">
                                <Field
                                  name="vendorName"
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
                              {/* <div
                                                        onClick={this.vendorToggler}
                                                        className={'plus-icon-square mr15 right'}>
                                                    </div> */}
                            </div>
                          </Col>
                          {(getConfigurationKey().IsVendorPlantConfigurable && this.state.IsVendor) && (
                            <Col md="3">
                              <Field
                                label="Vendor Plant"
                                name="VendorPlant"
                                placeholder={"Select"}
                                selection={
                                  this.state.selectedVendorPlants == null || this.state.selectedVendorPlants.length === 0 ? [] : this.state.selectedVendorPlants}
                                options={this.renderListing("VendorPlant")}
                                selectionChanged={this.handleVendorPlant}
                                validate={
                                  this.state.selectedVendorPlants == null || this.state.selectedVendorPlants.length === 0 ? [required] : []}
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
                            <>
                              <Col md="3">
                                <Field
                                  label={`Source`}
                                  name={"Source"}
                                  type="text"
                                  placeholder={"Enter"}
                                  validate={[acceptAllExceptSingleSpecialCharacter, maxLength(80)]}
                                  component={renderText}
                                  // required={true}
                                  disabled={false}
                                  className=" "
                                  customClassName=" withBorder"
                                />
                              </Col>
                              <Col md="3">
                                <Field
                                  name="SourceLocation"
                                  type="text"
                                  label="Source Location"
                                  component={searchableSelect}
                                  placeholder={"Select"}
                                  options={this.renderListing("SourceLocation")}
                                  //onKeyUp={(e) => this.changeItemDesc(e)}
                                  // validate={
                                  //   this.state.sourceLocation == null || this.state.sourceLocation.length === 0 ? [required] : []}
                                  // required={true}
                                  handleChangeDescription={this.handleSourceSupplierCity}
                                  valueDescription={this.state.sourceLocation}
                                />
                              </Col>
                            </>
                          )}
                        </Row>



                        <Row>
                          <Col md="12">
                            <div className="left-border">{"Cost:"}</div>
                          </Col>
                          <Col md="3">
                            <Field
                              name="Currency"
                              type="text"
                              label="Currency"
                              component={searchableSelect}
                              placeholder={"Select"}
                              options={this.renderListing("currency")}
                              //onKeyUp={(e) => this.changeItemDesc(e)}
                              validate={
                                this.state.currency == null ||
                                  this.state.currency.length === 0
                                  ? [required]
                                  : []
                              }
                              required={true}
                              handleChangeDescription={this.handleCurrency}
                              valueDescription={this.state.currency}
                              disabled={isEditFlag ? true : false}
                            >{this.state.showWarning && <WarningMessage dClass="mt-1" message={`${this.state.currency.label} rate is not present in the Exchange Master`} />}
                            </Field>
                          </Col>
                          <Col md="3">
                            <div className="inputbox date-section mb-3 form-group">
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
                          <Col md="3">
                            <Field
                              label={`Minimum Order Quantity`}
                              name={"NumberOfPieces"}
                              type="text"
                              placeholder={"Enter"}
                              validate={[postiveNumber, maxLength10]}
                              component={renderText}
                              required={false}
                              className=""
                              customClassName=" withBorder"
                            />
                          </Col>
                          <Col md="3">
                            <Field
                              label={`Basic Rate (${this.state.currency.label === undefined ? 'Currency' : this.state.currency.label})`}
                              name={"BasicRate"}
                              type="text"
                              placeholder={"Enter"}
                              validate={[required, positiveAndDecimalNumber, maxLength10, decimalLengthsix]}
                              component={renderText}
                              required={true}
                              disabled={false}
                              className=" "
                              customClassName=" withBorder"
                            />
                          </Col>
                          <Col md="3">
                            <Field
                              label={`Net Cost (${this.state.currency.label === undefined ? 'Currency' : this.state.currency.label})`}
                              name={"NetLandedCost"}
                              type="text"
                              placeholder={""}
                              validate={[]}
                              component={renderText}
                              required={false}
                              disabled={true}
                              className=" "
                              customClassName=" withBorder"
                            />
                          </Col>
                          {
                            this.state.showCurrency &&
                            <Col md="3">
                              <Field
                                label={`Net Cost (INR)`}
                                name={"NetLandedCostCurrency"}
                                type="text"
                                placeholder={""}
                                validate={[]}
                                component={renderText}
                                required={false}
                                disabled={true}
                                className=" "
                                customClassName=" withBorder mb-0"
                              />
                            </Col>
                          }
                          {/* </Row>

                        <Row> */}

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
                              className=""
                              customClassName=" textAreaWithBorder"
                              validate={[maxLength512]}
                              //required={true}
                              component={renderTextAreaField}
                              maxLength="5000"
                            />
                          </Col>
                          <Col md="3">
                            <label>
                              Upload Files (upload up to 3 files)
                            </label>
                            {this.state.files &&
                              this.state.files.length >= 3 ? (
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
                            <div className={"cancel-icon"}></div>
                            {"Cancel"}
                          </button>
                          <button
                            type="submit"
                            className="user-btn mr5 save-btn"
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
          {isCategoryDrawerOpen && (
            <AddBOPCategory
              isOpen={isCategoryDrawerOpen}
              closeDrawer={this.closeCategoryDrawer}
              isEditFlag={false}
              anchor={"right"}
            />
          )}
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
  const { comman, supplier, boughtOutparts, part, auth, } = state;
  const fieldsObj = selector(state, 'NumberOfPieces', 'BasicRate',);

  const { bopCategorySelectList, bopData, } = boughtOutparts;
  const { plantList, filterPlantList, filterCityListBySupplier, cityList,
    UOMSelectList, currencySelectList, plantSelectList } = comman;
  const { vendorWithVendorCodeSelectList } = supplier;
  const { partSelectList } = part;
  const { initialConfiguration } = auth;

  let initialValues = {};
  if (bopData && bopData !== undefined) {
    initialValues = {
      BoughtOutPartNumber: bopData.BoughtOutPartNumber,
      BoughtOutPartName: bopData.BoughtOutPartName,
      Specification: bopData.Specification,
      Source: bopData.Source,
      BasicRate: bopData.BasicRate,
      NumberOfPieces: bopData.NumberOfPieces,
      NetLandedCost: bopData.NetLandedCost,
      Remark: bopData.Remark,
    }
  }

  return {
    vendorWithVendorCodeSelectList, bopCategorySelectList, plantList, filterPlantList, filterCityListBySupplier,
    plantSelectList, cityList, partSelectList, UOMSelectList, currencySelectList, fieldsObj, initialValues, initialConfiguration,
  }

}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
  getVendorWithVendorCodeSelectList,
  getVendorTypeBOPSelectList,
  getPlantBySupplier,
  getPartSelectList,
  fetchMaterialComboAPI,
  getUOMSelectList,
  getCurrencySelectList,
  createBOPImport,
  updateBOPImport,
  getBOPCategorySelectList,
  getBOPImportById,
  fileUploadBOPDomestic,
  fileDeleteBOPDomestic,
  getPlantSelectListByType,
  getExchangeRateByCurrency
})(reduxForm({
  form: 'AddBOPImport',
  enableReinitialize: true,
})(AddBOPImport));
