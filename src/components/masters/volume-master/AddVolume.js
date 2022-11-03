import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form'
import { Row, Col, Label } from 'reactstrap'
import { required } from '../../../helper/validation'
import { searchableSelect } from '../../layout/FormInputs'
import { createVolume, updateVolume, getVolumeData, getFinancialYearSelectList, getPartSelectListWtihRevNo, } from '../actions/Volume'
import { getPlantSelectListByType, getPlantBySupplier, getVendorWithVendorCodeSelectList } from '../../../actions/Common'
import { getPartSelectList } from '../actions/Part'
import Toaster from '../../common/Toaster'
import { MESSAGES } from '../../../config/message'
import { getConfigurationKey, loggedInUserId, userDetails } from '../../../helper/auth'
import AddVendorDrawer from '../supplier-master/AddVendorDrawer'
import { CBCTypeId, SPACEBAR, VBCTypeId, ZBC, ZBCTypeId, searchCount } from '../../../config/constants'
import LoaderCustom from '../../common/LoaderCustom'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { EMPTY_DATA } from '../../../config/constants'
import { debounce } from 'lodash'
import AsyncSelect from 'react-select/async';
import { onFocus } from '../../../helper'
import { getClientSelectList, } from '../actions/Client';
import { reactLocalStorage } from 'reactjs-localstorage'
import { autoCompleteDropdown } from '../../common/CommonFunctios'

const gridOptions = {};

// const initialTableData = [
//   {
//     VolumeDetailId: 0,
//     Month: 'April',
//     BudgetedQuantity: 0,
//     ApprovedQuantity: 0,
//   },
//   { VolumeDetailId: 1, Month: 'May', BudgetedQuantity: 0, ApprovedQuantity: 0 },
//   {
//     VolumeDetailId: 2,
//     Month: 'June',
//     BudgetedQuantity: 0,
//     ApprovedQuantity: 0,
//   },
//   {
//     VolumeDetailId: 3,
//     Month: 'July',
//     BudgetedQuantity: 0,
//     ApprovedQuantity: 0,
//   },
//   {
//     VolumeDetailId: 4,
//     Month: 'August',
//     BudgetedQuantity: 0,
//     ApprovedQuantity: 0,
//   },
//   {
//     VolumeDetailId: 5,
//     Month: 'September',
//     BudgetedQuantity: 0,
//     ApprovedQuantity: 0,
//   },
//   {
//     VolumeDetailId: 6,
//     Month: 'October',
//     BudgetedQuantity: 0,
//     ApprovedQuantity: 0,
//   },
//   {
//     VolumeDetailId: 7,
//     Month: 'November',
//     BudgetedQuantity: 0,
//     ApprovedQuantity: 0,
//   },
//   {
//     VolumeDetailId: 8,
//     Month: 'December',
//     BudgetedQuantity: 0,
//     ApprovedQuantity: 0,
//   },
//   {
//     VolumeDetailId: 9,
//     Month: 'January',
//     BudgetedQuantity: 0,
//     ApprovedQuantity: 0,
//   },
//   {
//     VolumeDetailId: 10,
//     Month: 'February',
//     BudgetedQuantity: 0,
//     ApprovedQuantity: 0,
//   },
//   {
//     VolumeDetailId: 11,
//     Month: 'March',
//     BudgetedQuantity: 0,
//     ApprovedQuantity: 0,
//   },
// ]

class AddVolume extends Component {
  constructor(props) {
    super(props)
    this.child = React.createRef()
    this.state = {
      selectedPlants: [],
      vendorName: [],
      part: [],
      year: [],
      tableData: this.props.initialTableData,
      duplicateTableData: [],
      isEditFlag: false,
      isShowForm: false,
      VolumeId: '',
      edit: false,
      DataChanged: [],
      DataToChange: true,
      destinationPlant: [],
      gridApi: null,
      gridColumnApi: null,
      rowData: null,
      setDisable: false,
      inputLoader: false,
      showErrorOnFocus: false,
      isPartNumberNotSelected: false,
      showErrorOnFocusPart: false,
      costingTypeId: ZBCTypeId,
      client: [],
      partName: ''
    }
  }

  /**
   * @method componentDidMount
   * @description called after render the component
   */

  componentDidMount() {
    setTimeout(() => {
      this.setState({
        duplicateTableData: this.props.initialTableData,
      })
    }, 100)
    setTimeout(() => {
      this.props.getFinancialYearSelectList(() => { })
      if (!(this.props.data.isEditFlag || this.props.data.isViewFlag)) {
        this.props.getPlantSelectListByType(ZBC, () => { })
      }
    }, 300);
    this.getDetail()
  }

  componentWillUnmount() {
    let data = this.state.tableData && this.state.tableData.map((item) => {
      item.BudgetedQuantity = 0;
      item.ApprovedQuantity = 0
      return item
    })
    this.setState({ tableData: data })
    reactLocalStorage?.setObject('PartData', [])
    reactLocalStorage?.setObject('vendorData', [])
  }

  /**
   * @method renderListing
   * @description Used show listing of unit of measurement
   */
  renderListing = (label) => {
    const { plantSelectList, filterPlantList, financialYearSelectList, clientSelectList } = this.props
    const temp = []

    if (label === 'plant') {
      plantSelectList && plantSelectList.map((item) => {
        if (item.PlantId === '0') return false
        temp.push({ label: item.PlantNameCode, value: item.PlantId })
        return null
      })
      return temp
    }
    if (label === 'yearList') {
      financialYearSelectList &&
        financialYearSelectList.map((item) => {
          if (item.Value === '0') return false
          temp.push({ label: item.Text, value: item.Value })
          return null
        })
      return temp
    }
    if (label === 'VendorPlant') {
      filterPlantList &&
        filterPlantList.map((item) => {
          if (item.Value === '0') return false
          temp.push({ Text: item.Text, Value: item.Value })
          return null
        })
      return temp
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
   * @method onPressVendor
   * @description Used for Vendor checked
   */
  onPressVendor = (costingHeadFlag) => {
    this.setState({
      vendorName: [],
      costingTypeId: costingHeadFlag
    });
    if (costingHeadFlag === VBCTypeId) {
      this.setState({ IsVendor: !this.state.IsVendor })
    }
    else if (costingHeadFlag === CBCTypeId) {
      this.props.getClientSelectList(() => { })
    }
  }


  /**
   * @method handlePlants
   * @description called
   */
  handlePlants = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ selectedPlants: newValue })
    } else {
      this.setState({ selectedPlants: [] })
    }
  }

  /**
   * @method handleVendorName
   * @description called
   */
  handleVendorName = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ vendorName: newValue }, () => {
        //const { vendorName } = this.state;
        //this.props.getPlantBySupplier(vendorName.value, () => { })
      })
    } else {
      this.setState({ vendorName: [] })
    }
  }

  /**
   * @method handlePartName
   * @description called
   */
  handlePartName = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ part: newValue }, () => {
      })
    } else {
      this.setState({ part: [] })
    }
  }

  vendorToggler = () => {
    this.setState({ isOpenVendor: true })
  }

  async closeVendorDrawer(e = '', formData = {}, type) {
    if (type === 'submit') {
      this.setState({ isOpenVendor: false })
      const res = await getVendorWithVendorCodeSelectList(this.state.vendorName)
      let vendorDataAPI = res?.data?.SelectList
      reactLocalStorage?.setObject('vendorData', vendorDataAPI)
      if (Object.keys(formData).length > 0) {
        this.setState({ vendorName: { label: `${formData.VendorName} (${formData.VendorCode})`, value: formData.VendorId }, })
      }
    }
    else {
      this.setState({ isOpenVendor: false })
    }
  }

  /**
   * @method handleFinancialYear
   * @description called
   */
  handleFinancialYear = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ year: newValue })
    } else {
      this.setState({ year: [] })
    }
  }
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
  setStartDate = (date) => {
    this.setState({ year: date })
  }

  /**
   * @method buttonFormatter
   * @description Renders buttons
   */
  buttonFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    const rowIndex = props?.rowIndex
    return (
      <>
        <button className="Delete" type={'button'} onClick={() => this.deleteItem(cellValue, rowIndex)} />
      </>
    )
  }

  budgetedQuantity = (props) => {
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    const value = this.beforeSaveCell(cell)

    return (
      <>
        <span>{value ? Number(cell) : 0}</span>
      </>
    )
  }

  actualQuantity = (props) => {
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    const value = this.beforeSaveCell(cell)

    return (
      <>
        <span>{value ? Number(cell) : 0}</span>
      </>
    )
  }



  /**
   * @method beforeSaveCell
   * @description CHECK FOR ENTER NUMBER IN CELL
   */
  beforeSaveCell = (props) => {
    const cellValue = props
    if (Number.isInteger(Number(cellValue)) && /^\+?(0|[1-9]\d*)$/.test(cellValue) && cellValue.toString().replace(/\s/g, '').length) {
      if (cellValue.length > 8) {
        Toaster.warning("Value should not be more than 8")
        return false
      }
      return true
    } else if (!/^\+?(0|[0-9]\d*)$/.test(cellValue)) {
      Toaster.warning('Please enter a valid positive numbers.')
      return false
    }
  }

  afterSaveCell = (row, cellName, cellValue) => {
    this.setState({ DataToChange: false })
  }

  onCellValueChanged = () => {
    this.setState({ DataToChange: false })
  }

  deleteItem = (ID) => {
    const { tableData } = this.state;
    let tempData = tableData.filter((item, i) => {
      if (item.VolumeApprovedDetailId === ID) {
        return false;
      }
      return true;
    });
    this.setState({ tableData: tempData })
    this.setState({ DataToChange: false })
  }
  /**
   * @method getDetail
   * @description USED TO GET VOLUME DETAIL
   */
  getDetail = () => {
    const { data } = this.props
    if (data && data.isEditFlag) {
      this.setState({
        isLoader: true,
        isEditFlag: false,
        VolumeId: data.ID,
      })
      this.props.getVolumeData(data.ID, (res) => {
        if (res && res.data && res.data.Data) {
          let Data = res.data.Data

          this.setState({ DataChanged: Data })
          let plantArray = []
          if (Data && Data.Plant.length !== 0) {
            plantArray.push({
              label: `${Data.Plant[0].PlantName}.(${Data.Plant[0].PlantCode})`,
              value: Data.Plant[0].PlantId,
            })
          }

          let tableArray = []
          Data &&
            Data.VolumeApprovedDetails.map((item, i) => {
              Data.VolumeBudgetedDetails.map((el) => {
                if (el.Month === item.Month) {
                  tableArray.push({
                    VolumeApprovedDetailId: item.VolumeApprovedDetailId,
                    VolumeBudgetedDetailId: el.VolumeBudgetedDetailId,
                    Month: item.Month,
                    BudgetedQuantity: el.BudgetedQuantity,
                    ApprovedQuantity: item.ApprovedQuantity,
                    Sequence: el.Sequence,
                  })

                  return tableArray.sort()
                }
                return null
              })
              return null
            })

          setTimeout(() => {
            const { financialYearSelectList } = this.props

            const yearObj = financialYearSelectList && financialYearSelectList.find((item) => item.Text === Data.Year)

            this.setState({
              isEditFlag: true,
              // isLoader: false,
              costingTypeId: Data.CostingTypeId,
              selectedPlants: plantArray,
              vendorName: Data.VendorName && Data.VendorName !== undefined ? { label: `${Data.VendorName}(${Data.VendorCode})`, value: Data.VendorId } : [],
              year: yearObj && yearObj !== undefined ? { label: yearObj.Text, value: yearObj.Value } : [],
              part: Data?.PartId ? { label: Data?.PartNumber, value: Data?.PartId } : [],
              destinationPlant: Data.DestinationPlant !== undefined ? { label: Data.DestinationPlant, value: Data.DestinationPlantId } : [],
              tableData: tableArray.sort((a, b) => a.Sequence - b.Sequence),
              client: Data.CustomerName !== undefined ? { label: Data.CustomerName, value: Data.CustomerId } : [],
            }, () => this.setState({ isLoader: false }))
          }, 500)
        }
      })
    } else {
      this.setState({
        isLoader: false,
      })
      this.props.getVolumeData('', () => { })
    }
  }

  onGridReady = (params) => {
    this.setState({ gridApi: params.api, gridColumnApi: params.columnApi })
    this.state.gridApi.sizeColumnsToFit();
    params.api.paginationGoToPage(0);
  };

  /**
   * @method cancel
   * @description used to Reset form
   */
  cancel = (type) => {
    const { reset } = this.props
    const { tableData } = this.state

    // THIS IS FOR RESETING THE VALUE OF TABLE TO ZERO
    tableData.map((item) => {
      item.BudgetedQuantity = 0;
      item.ApprovedQuantity = 0
      return null
    })

    reset('AddVolume')
    this.setState(
      {
        selectedPlants: [],
        vendorName: [],
        tableData: [],
        isEditFlag: false,
      },
      () => {
        this.props.getVolumeData('', () => { })
        this.props.hideForm(type)
      },
    )
  }


  handleDestinationPlant = (newValue) => {
    this.setState({ destinationPlant: newValue })
  }

  /**
   * @method onSubmit
   * @description Used to Submit the form
   */
  onSubmit = debounce((values) => {
    const { selectedPlants, vendorName, part, year, client, tableData, costingTypeId, VolumeId, destinationPlant } = this.state
    const userDetail = userDetails()
    const userDetailsVolume = JSON.parse(localStorage.getItem('userDetail'))
    let returnFalse = 0

    if (costingTypeId === VBCTypeId && vendorName.length <= 0) {
      this.setState({ isVendorNameNotSelected: true, setDisable: false })      // IF VENDOR NAME IS NOT SELECTED THEN WE WILL SHOW THE ERROR MESSAGE MANUALLY 
    }
    if (part.length <= 0) {
      returnFalse = returnFalse + 1
      this.setState({ isPartNumberNotSelected: true, setDisable: false })      // IF Part Number IS NOT SELECTED THEN WE WILL SHOW THE ERROR MESSAGE MANUALLY 
    }
    if (returnFalse > 0) {
      return false
    }
    this.setState({ isVendorNameNotSelected: false, isPartNumberNotSelected: false })
    // CONDITION TO CHECK WHETHER TABLE DATA ONLY CONTAIN 0 VALUE
    const filteredArray = tableData.filter(item => Number(item.BudgetedQuantity) === 0 && Number(item.ApprovedQuantity) === 0)
    if (filteredArray.length === 12) {
      Toaster.warning("Please fill atleast one entry")
      return false
    }
    //CONDITION FOR NEGATIVE VALUE CHECK IN BUDGETED AND ACTUAL QUANTITY
    const filteredArrayForNegativeVlaue = tableData.filter(item => (Number(item.BudgetedQuantity) < 0) || (Number(item.ApprovedQuantity) < 0))
    if (filteredArrayForNegativeVlaue.length !== 0) {
      return false
    }
    let budgetArray = []
    tableData && tableData.map((item) => {
      budgetArray.push({
        Month: item.Month,
        BudgetedQuantity: item.BudgetedQuantity,
        VolumeDetailId: item.VolumeDetailId,
      })
      return budgetArray
    })

    let approvedArray = []
    tableData && tableData.map((item) => {
      approvedArray.push({
        Month: item.Month,
        ApprovedQuantity: item.ApprovedQuantity,
        VolumeDetailId: item.VolumeDetailId,
      })
      return approvedArray
    })

    let updateBudgetArray = []
    tableData && tableData.map((item) => {
      updateBudgetArray.push({
        VolumeBudgetedDetailId: item.VolumeBudgetedDetailId,
        Month: item.Month,
        BudgetedQuantity: item.BudgetedQuantity,
        Sequence: 0,
      })
      return updateBudgetArray
    })

    let updateApproveArray = []
    tableData && tableData.map((item) => {
      updateApproveArray.push({
        VolumeApprovedDetailId: item.VolumeApprovedDetailId,
        Month: item.Month,
        ApprovedQuantity: item.ApprovedQuantity,
        Sequence: 0,
      })
      return updateApproveArray
    })

    /** Update existing detail of supplier master **/
    if (this.state.isEditFlag) {

      if (this.state.DataToChange) {
        this.cancel('cancel')
        return false
      }
      this.setState({ setDisable: true })
      let updateData = {
        VolumeId: VolumeId,
        LoggedInUserId: loggedInUserId(),
        VolumeApprovedDetails: updateApproveArray,
        VolumeBudgetedDetails: updateBudgetArray,
      }

      this.props.updateVolume(updateData, (res) => {
        this.setState({ setDisable: false })
        if (res?.data?.Result) {
          Toaster.success(MESSAGES.VOLUME_UPDATE_SUCCESS)
          this.cancel('submit')
        }
      })
    } else {
      /** Add new detail for creating supplier master **/

      this.setState({ setDisable: true })
      let formData = {
        CostingTypeId: costingTypeId,
        VendorId: costingTypeId === VBCTypeId ? vendorName.value : userDetail.ZBCSupplierInfo.VendorId,
        PartId: part.value,
        PartNumber: part.label,
        OldPartNumber: '',
        Year: year.label,
        VolumeApprovedDetails: approvedArray,
        VolumeBudgetedDetails: budgetArray,
        Plant: costingTypeId === ZBCTypeId
          ? [
            {
              PlantName: selectedPlants.label,
              PlantId: selectedPlants.value,
              PlantCode: '',
            },
          ]
          : [],
        VendorPlant: [], //why ?
        LoggedInUserId: loggedInUserId(),
        IsActive: true,
        DestinationPlantId: (costingTypeId === VBCTypeId && getConfigurationKey().IsDestinationPlantConfigure) ? destinationPlant.value : costingTypeId === ZBCTypeId ? selectedPlants.value : (costingTypeId === CBCTypeId && getConfigurationKey().IsCBCApplicableOnPlant) ? destinationPlant.value : userDetailsVolume.Plants[0].PlantId,
        DestinationPlant: (costingTypeId === VBCTypeId && getConfigurationKey().IsDestinationPlantConfigure) ? destinationPlant.label : costingTypeId === ZBCTypeId ? selectedPlants.label : (costingTypeId === CBCTypeId && getConfigurationKey().IsCBCApplicableOnPlant) ? destinationPlant.value : userDetailsVolume.Plants[0].PlantName,
        CustomerId: costingTypeId === CBCTypeId ? client.value : ''
      }

      this.props.createVolume(formData, (res) => {
        this.setState({ setDisable: false })
        if (res?.data?.Result) {
          Toaster.success(MESSAGES.VOLUME_ADD_SUCCESS)
          this.cancel('submit')
        }
      })
    }
  }, 500)

  handleKeyDown = function (e) {
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault();
    }
  };


  onGridReady = (params) => {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
    this.setState({ gridApi: params.api, gridColumnApi: params.columnApi })
    params.api.paginationGoToPage(0);
  };

  // onPageSizeChanged = (newPageSize) => {
  //   var value = document.getElementById('page-size').value;
  //   this.state.gridApi.paginationSetPageSize(Number(value));
  // };

  onFilterTextBoxChanged(e) {
    this.state.gridApi.setQuickFilter(e.target.value);
  }


  resetState() {
    gridOptions.columnApi.resetColumnState();
  }

  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { handleSubmit, } = this.props;
    const { isEditFlag, isOpenVendor, setDisable, costingTypeId } = this.state;
    const vendorFilterList = async (inputValue) => {
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
    const partFilterList = async (inputValue) => {
      const { partName } = this.state
      const resultInput = inputValue.slice(0, 3)
      if (inputValue?.length >= searchCount && partName !== resultInput) {
        this.setState({ isLoader: true })
        const res = await getPartSelectListWtihRevNo(resultInput)
        this.setState({ isLoader: false })
        this.setState({ partName: resultInput })
        let partDataAPI = res?.data?.SelectList
        reactLocalStorage?.setObject('PartData', partDataAPI)
        let partData = []
        if (inputValue) {
          partData = reactLocalStorage?.getObject('PartData')
          return autoCompleteDropdown(inputValue, partData)
        } else {
          return partData
        }
      }
      else {
        if (inputValue?.length < searchCount) return false
        else {
          let partData = reactLocalStorage?.getObject('PartData')
          if (inputValue) {
            partData = reactLocalStorage?.getObject('PartData')
            return autoCompleteDropdown(inputValue, partData)
          } else {
            return partData
          }
        }
      }
    };

    const defaultColDef = {
      resizable: true,
      filter: true,
      sortable: true,
      editable: true
    };

    const frameworkComponents = {
      buttonFormatter: this.buttonFormatter,
      customLoadingOverlay: LoaderCustom,
      budgetedQuantity: this.budgetedQuantity,
      actualQuantity: this.actualQuantity
    };



    return (
      <>
        <div className={`ag-grid-react`}>
          <div className="container-fluid">
            {this.state.isLoader && <LoaderCustom />}
            <div className="login-container signup-form">
              <div className="row">
                <div className="col-md-12">
                  <div className="shadow-lgg login-formg">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-heading mb-0">
                          <h1>
                            {this.state.isEditFlag
                              ? "Update Volume"
                              : "Add Volume"}
                          </h1>
                        </div>
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
                          {(costingTypeId === ZBCTypeId && (
                            <Col md="3">
                              <Field
                                name="Plant"
                                type="text"
                                label="Plant"
                                component={searchableSelect}
                                placeholder={isEditFlag ? '-' : "Select"}
                                options={this.renderListing("plant")}
                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                validate={
                                  this.state.selectedPlants == null ||
                                    this.state.selectedPlants.length === 0
                                    ? [required]
                                    : []
                                }
                                required={true}
                                handleChangeDescription={this.handlePlants}
                                valueDescription={this.state.selectedPlants}
                                disabled={isEditFlag ? true : false}
                              />
                            </Col>)
                          )}
                          {costingTypeId === VBCTypeId && (
                            <Col md="3">
                              <label>{"Vendor Name"}<span className="asterisk-required">*</span></label>
                              <div className="d-flex justify-space-between align-items-center p-relative async-select">
                                <div className="fullinput-icon p-relative">
                                  {this.state.inputLoader && <LoaderCustom customClass={`input-loader`} />}
                                  <AsyncSelect
                                    name="vendorName"
                                    ref={this.myRef}
                                    key={this.state.updateAsyncDropdown}
                                    loadOptions={vendorFilterList}
                                    onChange={(e) => this.handleVendorName(e)}
                                    value={this.state.vendorName}
                                    noOptionsMessage={({ inputValue }) => inputValue.length < 3 ? "Please enter vendor name/code" : "No results found"}
                                    isDisabled={(isEditFlag) ? true : false}
                                    onKeyDown={(onKeyDown) => {
                                      if (onKeyDown.keyCode === SPACEBAR && !onKeyDown.target.value) onKeyDown.preventDefault();
                                    }}
                                    onBlur={() => onFocus(this)}
                                  />
                                </div>
                                {!isEditFlag && (
                                  <div
                                    onClick={this.vendorToggler}
                                    className={"plus-icon-square  right"}
                                  ></div>
                                )}
                              </div>
                              {((this.state.showErrorOnFocus && this.state.vendorName.length === 0) || this.state.isVendorNameNotSelected) && <div className='text-help mt-1'>This field is required.</div>}
                            </Col>

                          )}
                          {
                            ((costingTypeId === VBCTypeId && getConfigurationKey().IsDestinationPlantConfigure) || (costingTypeId === CBCTypeId && getConfigurationKey().IsCBCApplicableOnPlant)) &&
                            <Col md="3">
                              <Field
                                label={costingTypeId === VBCTypeId ? 'Destination Plant' : 'Plant'}
                                name="DestinationPlant"
                                placeholder={isEditFlag ? '-' : "Select"}
                                // selection={
                                //   this.state.selectedPlants == null || this.state.selectedPlants.length === 0 ? [] : this.state.selectedPlants}
                                options={this.renderListing("plant")}
                                handleChangeDescription={this.handleDestinationPlant}
                                validate={this.state.destinationPlant == null || this.state.destinationPlant.length === 0 ? [required] : []}
                                required={true}
                                // optionValue={(option) => option.Value}
                                // optionLabel={(option) => option.Text}
                                component={searchableSelect}
                                valueDescription={this.state.destinationPlant}
                                mendatory={true}
                                className="multiselect-with-border"
                                disabled={isEditFlag ? true : false}
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
                          <Col md="3">
                            <label>{"Part No.(Revision No.)"}<span className="asterisk-required">*</span></label>
                            <div className="d-flex justify-space-between align-items-center async-select">
                              <div className="fullinput-icon p-relative">
                                <AsyncSelect
                                  name="PartNumber"
                                  ref={this.myRef}
                                  key={this.state.updateAsyncDropdown}
                                  loadOptions={partFilterList}
                                  onChange={(e) => this.handlePartName(e)}
                                  value={this.state.part}
                                  noOptionsMessage={({ inputValue }) => inputValue.length < 3 ? "Enter 3 characters to show data" : "No results found"}
                                  onKeyDown={(onKeyDown) => {
                                    if (onKeyDown.keyCode === SPACEBAR && !onKeyDown.target.value) onKeyDown.preventDefault();
                                  }}
                                  isDisabled={isEditFlag ? true : false}
                                  onBlur={() => this.setState({ showErrorOnFocusPart: true })}
                                />
                                {((this.state.showErrorOnFocusPart && this.state.part.length === 0) || this.state.isPartNumberNotSelected) && <div className='text-help mt-1'>This field is required.</div>}
                              </div>
                            </div>
                          </Col>
                          <Col md="3">
                            <Field
                              name="FinancialYear"
                              type="text"
                              label="Year"
                              component={searchableSelect}
                              placeholder={isEditFlag ? '-' : "Select"}
                              options={this.renderListing("yearList")}
                              //onKeyUp={(e) => this.changeItemDesc(e)}
                              validate={
                                this.state.year == null ||
                                  this.state.year.length === 0
                                  ? [required]
                                  : []
                              }
                              required={true}
                              handleChangeDescription={this.handleFinancialYear}
                              valueDescription={this.state.year}
                              disabled={isEditFlag ? true : false}
                            />
                          </Col>
                          {/* <Col md="3">
                            <Field
                              label={`Budgeted Price`}
                              name={" BudgetedPrice"}
                              type="text"
                              placeholder={isEditFlag ? '-' : "Select"}
                              validate={[required, positiveAndDecimalNumber]}
                              component={renderNumberInputField}
                              required={true}
                              disabled={false}
                              onChange={this.handleRateChange}
                              className=" "
                              customClassName=" withBorder"
                            />
                          </Col>  UNCOMMENT WHEN CODE DEPLYED FROM BACKEND*/}
                        </Row>

                        <Row>
                          <Col md="12">
                            <div className="left-border">{"Quantity:"}</div>
                          </Col>

                          <Col>
                            <div className={`ag-grid-wrapper add-volume-table  ${this.state.tableData && this.state.tableData?.length <= 0 ? "overlay-contain" : ""}`} style={{ width: '100%', height: '100%' }}>
                              {/* <Col md="12"> */}
                              <div
                                className="ag-theme-material"

                              >
                                <AgGridReact
                                  style={{ height: '100%', width: '100%' }}
                                  defaultColDef={defaultColDef}
                                  domLayout='autoHeight'
                                  // columnDefs={c}
                                  rowData={this.state.tableData}
                                  onCellValueChanged={this.onCellValueChanged}
                                  pagination={true}
                                  paginationPageSize={12}
                                  onGridReady={this.onGridReady}
                                  gridOptions={gridOptions}
                                  loadingOverlayComponent={'customLoadingOverlay'}
                                  noRowsOverlayComponent={'customNoRowsOverlay'}
                                  noRowsOverlayComponentParams={{
                                    title: EMPTY_DATA,
                                  }}
                                  frameworkComponents={frameworkComponents}
                                  stopEditingWhenCellsLoseFocus={true}
                                >
                                  <AgGridColumn field="Month" headerName="Month" editable='false'></AgGridColumn>
                                  <AgGridColumn field="BudgetedQuantity" cellRenderer='budgetedQuantity' headerName="Budgeted Quantity"></AgGridColumn>
                                  <AgGridColumn field="ApprovedQuantity" cellRenderer='actualQuantity' headerName="Actual Quantity"></AgGridColumn>
                                  <AgGridColumn field="VolumeApprovedDetailId" editable='false' cellRenderer='buttonFormatter' headerName="Action" type="rightAligned" ></AgGridColumn>
                                  <AgGridColumn field="VolumeApprovedDetailId" hide></AgGridColumn>
                                  <AgGridColumn field="VolumeBudgetedDetailId" hide></AgGridColumn>
                                </AgGridReact>
                              </div>
                            </div>
                          </Col>
                        </Row>
                      </div>
                      <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                        <div className="col-sm-12 text-right bluefooter-butn">
                          <button
                            type={"button"}
                            className="mr15 cancel-btn"
                            onClick={() => { this.cancel('cancel') }}
                            disabled={setDisable}
                          >
                            <div className={"cancel-icon"}></div>{" "}
                            {"Cancel"}
                          </button>
                          <button
                            type="submit"
                            className="user-btn mr5 save-btn"
                            disabled={setDisable}
                          >
                            <div className={"save-icon"}> </div>
                            {isEditFlag ? "Update" : "Save"}
                          </button>
                        </div>
                      </Row>
                    </form></div>
                </div>
              </div>

            </div>
            {isOpenVendor && (
              <AddVendorDrawer
                isOpen={isOpenVendor}
                closeDrawer={this.closeVendorDrawer = this.closeVendorDrawer.bind(this)}
                isEditFlag={false}
                ID={""}
                anchor={"right"}
              />
            )}
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
function mapStateToProps({ comman, volume, material, part, client }) {
  const { plantSelectList, filterPlantList, vendorWithVendorCodeSelectList } = comman
  const { volumeData, financialYearSelectList } = volume
  const { vendorListByVendorType } = material
  const { partSelectList } = part
  const { clientSelectList } = client;

  let initialValues = {}
  if (volumeData && volumeData !== undefined) {
    initialValues = {
      PartNumber: volumeData.PartNumber,
      PartName: volumeData.PartName,
    }
  }

  return {
    plantSelectList,
    vendorListByVendorType,
    filterPlantList,
    volumeData,
    financialYearSelectList,
    partSelectList,
    initialValues,
    vendorWithVendorCodeSelectList,
    clientSelectList
  }
}

/**
 * @method connect
 * @description connect with redux
 * @param {function} mapStateToProps
 * @param {function} mapDispatchToProps
 */
export default connect(mapStateToProps, {
  getPlantSelectListByType,
  getPlantBySupplier,
  createVolume,
  updateVolume,
  getVolumeData,
  getFinancialYearSelectList,
  getPartSelectList,
  getVendorWithVendorCodeSelectList,
  getClientSelectList
})(
  reduxForm({
    form: 'AddVolume',
    enableReinitialize: true,
    touchOnChange: true
  })(AddVolume),
)
