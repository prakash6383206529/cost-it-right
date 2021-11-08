import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form'
import { Row, Col } from 'reactstrap'
import { maxLength, postiveNumber, required } from '../../../helper/validation'
import { searchableSelect } from '../../layout/FormInputs'
// import { getVendorListByVendorType } from '../actions/Material'
import { createVolume, updateVolume, getVolumeData, getFinancialYearSelectList, } from '../actions/Volume'
import { getPlantSelectListByType, getPlantBySupplier, getVendorWithVendorCodeSelectList } from '../../../actions/Common'
import { getPartSelectList } from '../actions/Part'
import { toastr } from 'react-redux-toastr'
import { MESSAGES } from '../../../config/message'
import { getConfigurationKey, loggedInUserId, userDetails } from '../../../helper/auth'
import Switch from 'react-switch'
import AddVendorDrawer from '../supplier-master/AddVendorDrawer'
import { ZBC } from '../../../config/constants'
import LoaderCustom from '../../common/LoaderCustom'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { EMPTY_DATA } from '../../../config/constants'

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
      IsVendor: false,
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

    this.props.getPlantSelectListByType(ZBC, () => { })
    // this.props.getVendorListByVendorType(true, () => { })
    this.props.getVendorWithVendorCodeSelectList()
    this.props.getFinancialYearSelectList(() => { })
    this.props.getPartSelectList(() => { })
    this.getDetail()
  }

  componentWillUnmount() {
    this.setState({ tableData: [] })
  }

  /**
   * @method renderListing
   * @description Used show listing of unit of measurement
   */
  renderListing = (label) => {
    const {
      plantSelectList,
      vendorWithVendorCodeSelectList,
      filterPlantList,
      financialYearSelectList,
      partSelectList,
    } = this.props
    const temp = []

    if (label === 'plant') {
      plantSelectList &&
        plantSelectList.map((item) => {
          if (item.Value === '0') return false
          temp.push({ label: item.Text, value: item.Value })
          return null
        })
      return temp
    }
    if (label === 'VendorNameList') {
      vendorWithVendorCodeSelectList &&
        vendorWithVendorCodeSelectList.map((item) => {
          if (item.Value === '0') return false
          temp.push({ label: item.Text, value: item.Value })
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
    if (label === 'PartList') {
      partSelectList &&
        partSelectList.map((item) => {
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
  }

  /**
   * @method onPressVendor
   * @description Used for Vendor checked
   */
  onPressVendor = () => {
    this.setState({ IsVendor: !this.state.IsVendor })
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
   * @method handlePart
   * @description called
   */
  handlePart = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ part: newValue })
    } else {
      this.setState({ part: [] })
    }
  }

  vendorToggler = () => {
    this.setState({ isOpenVendor: true })
  }

  closeVendorDrawer = (e = '') => {
    this.setState({ isOpenVendor: false }, () => {

      this.props.getVendorWithVendorCodeSelectList()
    })
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

  setStartDate = (date) => {
    this.setState({ year: date })
  }

  /**
   * @method buttonFormatter
   * @description Renders buttons
   */
  buttonFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
    const rowIndex = props?.rowIndex
    return (
      <>
        <button className="Delete" type={'button'} onClick={() => this.deleteItem(cellValue, rowIndex)} />
      </>
    )
  }

  budgetedQuantity = (props) => {
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    const row = props?.valueFormatted ? props.valueFormatted : props?.data;
    const value = this.beforeSaveCell(cell)

    return (
      <>
        <span>{value ? Number(cell) : 0}</span>
      </>
    )
  }

  actualQuantity = (props) => {
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    const row = props?.valueFormatted ? props.valueFormatted : props?.data;
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
        toastr.warning("Value should not be more than 8")
        return false
      }
      return true
    } else if (!/^\+?(0|[0-9]\d*)$/.test(cellValue)) {
      toastr.warning('Please enter a valid positive numbers.')
      return false
    }
  }

  afterSaveCell = (row, cellName, cellValue) => {
    this.setState({ DataToChange: false })
  }

  deleteItem = (ID, index) => {
    const { tableData } = this.state

    let filterData = tableData.map((item) => {
      if (item.VolumeApprovedDetailId === ID) {
        return { ...item, BudgetedQuantity: 0, ApprovedQuantity: 0 }
      }
      return item
    })
    this.setState({ tableData: filterData })
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

          let vendorPlantArray = []
          Data &&
            Data.VendorPlant.map((item) => {
              vendorPlantArray.push({
                Text: item.PlantName,
                Value: item.PlantId,
              })
              return vendorPlantArray
            })

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

              })
            })

          setTimeout(() => {
            const { vendorWithVendorCodeSelectList, financialYearSelectList, partSelectList, plantSelectList } = this.props

            const vendorObj = vendorWithVendorCodeSelectList && vendorWithVendorCodeSelectList.find((item) => item.Value === Data.VendorId,)
            const yearObj = financialYearSelectList && financialYearSelectList.find((item) => item.Text === Data.Year)
            const partObj = partSelectList && partSelectList.find((item) => item.Value === Data.PartId)
            const destinationPlantObj = plantSelectList && plantSelectList.find((item) => item.Value === Data.DestinationPlantId)

            this.setState({
              isEditFlag: true,
              // isLoader: false,
              IsVendor: Data.IsVendor,
              selectedPlants: plantArray,
              vendorName: vendorObj && vendorObj !== undefined ? { label: vendorObj.Text, value: vendorObj.Value } : [],
              year: yearObj && yearObj !== undefined ? { label: yearObj.Text, value: yearObj.Value } : [],
              part: partObj && partObj !== undefined ? { label: partObj.Text, value: partObj.Value } : [],
              destinationPlant: destinationPlantObj && destinationPlantObj !== undefined ? { label: destinationPlantObj.Text, value: destinationPlantObj.Value } : [],
              tableData: tableArray.sort((a, b) => a.Sequence - b.Sequence),
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
  cancel = () => {
    const { reset } = this.props
    const { tableData } = this.state

    // THIS IS FOR RESETING THE VALUE OF TABLE TO ZERO
    tableData.map((item) => {
      item.BudgetedQuantity = 0;
      item.ApprovedQuantity = 0
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
        this.props.hideForm()
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
  onSubmit = (values) => {
    const {
      IsVendor, selectedPlants, vendorName, part, year, tableData, VolumeId, destinationPlant } = this.state
    const userDetail = userDetails()

    // let plantArray = [];
    // selectedPlants && selectedPlants.map((item) => {
    //     plantArray.push({ PlantName: item.Text, PlantId: item.Value, PlantCode: '' })
    //     return plantArray;
    // })

    // CONDITION TO CHECK WHETHER TABLE DATA ONLY CONTAIN 0 VALUE
    const filteredArray = tableData.filter(item => Number(item.BudgetedQuantity) === 0 && Number(item.ApprovedQuantity) === 0)
    if (filteredArray.length === 12) {
      toastr.warning("Please fill atleast one entry")
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
        this.cancel()
        return false
      }
      let updateData = {
        VolumeId: VolumeId,
        LoggedInUserId: loggedInUserId(),
        VolumeApprovedDetails: updateApproveArray,
        VolumeBudgetedDetails: updateBudgetArray,
      }
      this.props.reset()
      this.props.updateVolume(updateData, (res) => {
        if (res.data.Result) {
          toastr.success(MESSAGES.VOLUME_UPDATE_SUCCESS)
          this.cancel()
        }
      })
    } else {
      /** Add new detail for creating supplier master **/

      let formData = {
        IsVendor: IsVendor,
        VendorId: IsVendor ? vendorName.value : userDetail.ZBCSupplierInfo.VendorId,
        PartId: part.value,
        PartNumber: part.label,
        OldPartNumber: '',
        Year: year.label,
        VolumeApprovedDetails: approvedArray,
        VolumeBudgetedDetails: budgetArray,
        Plant: !IsVendor
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
        DestinationPlantId: IsVendor && getConfigurationKey().IsDestinationPlantConfigure ? destinationPlant.value : '',
        DestinationPlant: IsVendor && getConfigurationKey().IsDestinationPlantConfigure ? destinationPlant.label : ''
      }
      this.props.reset()
      this.props.createVolume(formData, (res) => {
        if (res.data.Result) {
          toastr.success(MESSAGES.VOLUME_ADD_SUCCESS)
          this.cancel()
        }
      })
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
    const { isEditFlag, isOpenVendor, edit } = this.state;

    const cellEditProp = {
      mode: 'click',
      blurToSave: true,
      beforeSaveCell: this.beforeSaveCell,
      afterSaveCell: this.afterSaveCell
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
                              <div className={"right-title"}>Vendor Based</div>
                            </label>
                          </Col>
                        </Row>

                        <Row className="z12">
                          {!this.state.IsVendor && (
                            <Col md="3">
                              <Field
                                name="Plant"
                                type="text"
                                label="Plant"
                                component={searchableSelect}
                                placeholder={"Select"}
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
                            </Col>
                          )}
                          {this.state.IsVendor && (
                            <Col md="3">
                              <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                <div className="fullinput-icon">
                                  <Field
                                    name="VendorName"
                                    type="text"
                                    label="Vendor Name"
                                    component={searchableSelect}
                                    placeholder={"Select"}
                                    options={this.renderListing(
                                      "VendorNameList"
                                    )}
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
                                </div>
                                {!isEditFlag && (
                                  <div
                                    onClick={this.vendorToggler}
                                    className={"plus-icon-square mr15 right"}
                                  ></div>
                                )}
                              </div>
                            </Col>

                          )}
                          {
                            this.state.IsVendor && getConfigurationKey().IsDestinationPlantConfigure &&
                            <Col md="3">
                              <Field
                                label={'Destination Plant'}
                                name="DestinationPlant"
                                placeholder={"Select"}
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
                          <Col md="3">
                            <Field
                              name="PartNumber"
                              type="text"
                              label="Part No."
                              component={searchableSelect}
                              placeholder={"Select"}
                              options={this.renderListing("PartList")}
                              //onKeyUp={(e) => this.changeItemDesc(e)}
                              validate={
                                this.state.part == null ||
                                  this.state.part.length === 0
                                  ? [required]
                                  : []
                              }
                              required={true}
                              handleChangeDescription={this.handlePart}
                              valueDescription={this.state.part}
                              disabled={isEditFlag ? true : false}
                            />
                          </Col>
                          <Col md="3">
                            <Field
                              name="FinancialYear"
                              type="text"
                              label="Year"
                              component={searchableSelect}
                              placeholder={"Select"}
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
                        </Row>

                        <Row>
                          <Col md="12">
                            <div className="left-border">{"Quantity:"}</div>
                          </Col>

                          <Col>
                            <div className="ag-grid-wrapper add-volume-table" style={{ width: '100%', height: '100%' }}>
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
                                  <AgGridColumn field="ApprovedQuantity" cellRenderer='actualQuantity' headerName="Approved Quantity"></AgGridColumn>
                                  <AgGridColumn field="VolumeApprovedDetailId" editable='false' cellRenderer='buttonFormatter' headerName="Action" type="rightAligned" ></AgGridColumn>
                                  <AgGridColumn field="VolumeApprovedDetailId" hide></AgGridColumn>
                                  <AgGridColumn field="VolumeBudgetedDetailId" hide></AgGridColumn>
                                </AgGridReact>
                              </div>
                              {/* <BootstrapTable
                            data={this.state.tableData}
                            striped={false}
                            hover={false}
                            bordered={false}
                            cellEdit={cellEditProp}
                            className="add-volume-table"
                          >
                            <TableHeaderColumn dataField="Month" editable={false} > Month  </TableHeaderColumn>
                            <TableHeaderColumn dataField="BudgetedQuantity" editable={true} dataFormat={this.budgetFormatter}>Budgeted Quantity </TableHeaderColumn>
                            <TableHeaderColumn dataField="ApprovedQuantity" editable={true} dataFormat={this.ActualFormatter}>Actual Quantity  </TableHeaderColumn>
                            <TableHeaderColumn dataField="VolumeApprovedDetailId" hidden  > Volume Approv Id </TableHeaderColumn>
                            <TableHeaderColumn dataField="VolumeBudgetedDetailId" hidden  > Vol Budget Id    </TableHeaderColumn>
                            <TableHeaderColumn dataAlign="right" width={100} className="action" dataField="VolumeApprovedDetailId" isKey={true} dataFormat={this.buttonFormatter} >  Actions   </TableHeaderColumn>
                          </BootstrapTable> */}
                              {/* </Col> */}
                            </div>
                          </Col>
                        </Row>
                      </div>
                      <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                        <div className="col-sm-12 text-right bluefooter-butn">
                          <button
                            type={"button"}
                            className="mr15 cancel-btn"
                            onClick={this.cancel}
                          >
                            <div className={"cancel-icon"}></div>{" "}
                            {"Cancel"}
                          </button>
                          <button
                            type="submit"
                            className="user-btn mr5 save-btn"
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
                closeDrawer={this.closeVendorDrawer}
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
function mapStateToProps({ comman, volume, material, part }) {
  const { plantSelectList, filterPlantList, vendorWithVendorCodeSelectList } = comman
  const { volumeData, financialYearSelectList } = volume
  const { vendorListByVendorType } = material
  const { partSelectList } = part

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
    vendorWithVendorCodeSelectList
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
  // getVendorListByVendorType,
  getPlantBySupplier,
  createVolume,
  updateVolume,
  getVolumeData,
  getFinancialYearSelectList,
  getPartSelectList,
  getVendorWithVendorCodeSelectList
})(
  reduxForm({
    form: 'AddVolume',
    enableReinitialize: true,
  })(AddVolume),
)
