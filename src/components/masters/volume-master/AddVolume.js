import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Field, clearFields, reduxForm } from 'redux-form'
import { Row, Col, Label, Tooltip } from 'reactstrap'
import { required } from '../../../helper/validation'
import { searchableSelect, validateForm } from '../../layout/FormInputs'
import { createVolume, updateVolume, getVolumeData, getFinancialYearSelectList, getPartSelectListWtihRevNo, } from '../actions/Volume'
import { getPlantSelectListByType, getPlantBySupplier, getVendorNameByVendorSelectList } from '../../../actions/Common'
import { getPartSelectList } from '../actions/Part'
import Toaster from '../../common/Toaster'
import { MESSAGES } from '../../../config/message'
import { getConfigurationKey, loggedInUserId, userDetails } from '../../../helper/auth'
import AddVendorDrawer from '../supplier-master/AddVendorDrawer'
import { BOUGHTOUTPARTSPACING, CBCTypeId, PRODUCT_ID, searchCount, SPACEBAR, VBC_VENDOR_TYPE, VBCTypeId, ZBC, ZBCTypeId } from '../../../config/constants'
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
import { autoCompleteDropdown, autoCompleteDropdownPart, getCostingTypeIdByCostingPermission } from '../../common/CommonFunctions'
import PopupMsgWrapper from '../../common/PopupMsgWrapper'
import { getSelectListPartType } from '../actions/Part'
import TourWrapper from '../../common/Tour/TourWrapper'
import { Steps } from './TourMessages'
import { withTranslation } from 'react-i18next'
import { LabelsClass } from '../../../helper/core'

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
      costingTypeId: ZBCTypeId,
      client: [],
      isPartNumberNotSelected: false,
      showErrorOnFocusPart: false,
      partName: '',
      showPopup: false,
      vendorFilter: [],
      viewTooltipBudgeted: false,
      showTooltip: false,
      viewTooltipActual: false,
      partType: [],
      partTypeList: [],
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
        costingTypeId: getCostingTypeIdByCostingPermission()
      })
    }, 100)
    if (getCostingTypeIdByCostingPermission() === CBCTypeId) {
      this.props.getClientSelectList(() => { })
    }
    setTimeout(() => {
      this.props.getFinancialYearSelectList(() => { })
      if (!(this.props.data.isEditFlag || this.props.data.isViewFlag)) {
        this.props.getPlantSelectListByType(ZBC, "MASTER", '', () => { })
      }
    }, 300);
    this.props.getSelectListPartType((res) => {
      this.setState({ partTypeList: res?.data?.SelectList })
    })
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
    const { partTypeList } = this.state
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
    if (label === 'PartType') {
      partTypeList && partTypeList.map((item) => {
        if (item.Value === '0') return false
        if (item.Value === PRODUCT_ID) return false
        if (!getConfigurationKey()?.IsBoughtOutPartCostingConfigured && item.Text === BOUGHTOUTPARTSPACING) return false
        temp.push({ label: item.Text, value: item.Value })
        return null
      })
      return temp
    }
  }
  /**
  * @method onPressVendor
  * @description Used for Vendor checked
  */
  onPressVendor = (costingHeadFlag) => {
    const fieldsToClear = [
      'vendorName',
      'Plant',
      'DestinationPlant',
      'clientName',
      'FinancialYear',
      'PartNumber'
    ];
    fieldsToClear.forEach(fieldName => {
      this.props.dispatch(clearFields('AddVolume', false, false, fieldName));
    });
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
      const res = await getVendorNameByVendorSelectList(VBC_VENDOR_TYPE, this.state.vendorName)
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
  handlePartTypeChange = (newValue) => {
    if (newValue && newValue !== '') {
      this.setState({ partType: newValue })
      this.props.change('PartNumber', '')
      this.setState({ part: [] })
    } else {
      this.setState({ partType: [] })
    }
    this.setState({ partName: [] })
    reactLocalStorage.setObject('PartData', [])
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
    const rowIndex = props?.rowIndex
    const rowData = props?.data;
    const isDisabled = Number(rowData?.BudgetedQuantity) === 0 && Number(rowData?.ApprovedQuantity) === 0;
    return (
      <>
        <button id='AddVolume_Delete' title='Delete' disabled={isDisabled} className="Delete" type={'button'} onClick={() => !isDisabled && this.deleteItem(cellValue, rowIndex)} />
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
      <><div id="actual_Quantity">
        <span>{value ? Number(cell) : 0}</span>
      </div>
      </>
    )
  }
  budgetedHeader = (props) => {
    return (
      <div className='ag-header-cell-label'>
        <span className='ag-header-cell-text'>Budgeted Quantity<i className={`fa fa-info-circle tooltip_custom_right tooltip-icon mb-n3 ml-4 mt2 `} id={"budgeted-tooltip"}></i> </span>
      </div>
    );
  };
  actualHeader = (props) => {
    return (
      <div className='ag-header-cell-label'>
        <span className='ag-header-cell-text'>Actual Quantity<i className={`fa fa-info-circle tooltip_custom_right tooltip-icon mb-n3 ml-4 mt2 `} id={"actual-tooltip"}></i> </span>
      </div>
    );
  };

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

  onCellValueChanged = (params) => {
    this.setState({ DataToChange: false })
    if (params.column.colId === 'BudgetedQuantity' || params.column.colId === 'ApprovedQuantity') {
      const actionColumn = this.state.gridApi.getColumnDef('VolumeApprovedDetailId');
      this.state.gridApi.refreshCells({
        force: true,
        columns: [actionColumn],
      });
    }
  }

  deleteItem = (ID) => {
    const { tableData } = this.state;
    this.setState({ isLoader: true, showTooltip: false })
    let tempData = tableData.filter((item, i) => {
      if (item.VolumeApprovedDetailId === ID) {
        item.BudgetedQuantity = 0
        item.ApprovedQuantity = 0
      }
      return item;
    });
    setTimeout(() => {
      this.setState({ tableData: tempData, isLoader: false })
      this.setState({ DataToChange: false })
    }, 300);
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
              label: `${Data.Plant[0].PlantName} (${Data.Plant[0].PlantCode})`,
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
            let partNumber = `${Data.PartNumber}${Data.RevisionNumber ? ` (${Data.RevisionNumber})` : ''}`

            this.setState({
              isEditFlag: true,
              // isLoader: false,
              costingTypeId: Data.CostingTypeId,
              selectedPlants: plantArray,
              vendorName: Data.VendorName && Data.VendorName !== undefined ? { label: `${Data.VendorName}`, value: Data.VendorId } : [],
              year: yearObj && yearObj !== undefined ? { label: yearObj.Text, value: yearObj.Value } : [],
              part: Data?.PartId ? { label: partNumber, value: Data?.PartId, RevisionNumber: Data?.RevisionNumber } : [],
              destinationPlant: Data.DestinationPlant !== undefined ? { label: Data.DestinationPlant, value: Data.DestinationPlantId } : [],
              tableData: tableArray.sort((a, b) => a.Sequence - b.Sequence),
              client: Data.CustomerName !== undefined ? { label: Data.CustomerName, value: Data.CustomerId } : [],
              partType: Data?.PartType !== undefined ? { label: Data?.PartType, value: Data?.PartTypeId } : [],
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
  cancelHandler = () => {
    if (this.props.data.isViewFlag) {
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
      returnFalse = returnFalse + 1
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
    const filteredArray = tableData.filter(item => {
      const budgetedQuantity = Number(item.BudgetedQuantity);
      const approvedQuantity = Number(item.ApprovedQuantity);

      // Check for valid numbers and non-negative values
      return (isNaN(budgetedQuantity) || isNaN(approvedQuantity)) || (budgetedQuantity === 0 && approvedQuantity === 0);
    });

    if (filteredArray.length === tableData.length) {
      Toaster.warning("Please fill at least one entry");
      return false;
    }

    // CONDITION FOR NEGATIVE VALUE CHECK IN BUDGETED AND APPROVED QUANTITY
    const filteredArrayForNegativeValue = tableData.filter(item => {
      const budgetedQuantity = Number(item.BudgetedQuantity);
      const approvedQuantity = Number(item.ApprovedQuantity);

      // Check for valid numbers and non-negative values
      return isNaN(budgetedQuantity) || isNaN(approvedQuantity) || budgetedQuantity < 0 || approvedQuantity < 0;
    });

    if (filteredArrayForNegativeValue.length !== 0) {
      return false;
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
        PartNumber: part?.label.split(' (')[0],
        RevisionNumber: part.RevisionNumber,
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
    this.setState({ gridApi: params.api, gridColumnApi: params.columnApi })
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
    params.api.paginationGoToPage(0);
    setTimeout(() => {
      this.setState({ showTooltip: true })
    }, 100);
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
    const { handleSubmit, t } = this.props;
    const VendorLabel = LabelsClass(t, 'MasterLabels').vendorLabel;

    const { isEditFlag, isOpenVendor, setDisable, costingTypeId } = this.state;
    const vendorFilterList = async (inputValue) => {
      const { vendorFilter } = this.state
      if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
        inputValue = inputValue.trim();
      }
      const resultInput = inputValue.slice(0, searchCount)
      if (inputValue?.length >= searchCount && vendorFilter !== resultInput) {
        this.setState({ inputLoader: true })
        let res
        res = await getVendorNameByVendorSelectList(VBC_VENDOR_TYPE, resultInput)
        this.setState({ inputLoader: false })
        this.setState({ vendorFilter: resultInput })
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

    const partFilterList = async (inputValue) => {
      const { partName } = this.state
      if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
        inputValue = inputValue.trim();
      }
      const resultInput = inputValue.slice(0, searchCount)
      if (inputValue?.length >= searchCount && partName !== resultInput) {
        const res = await getPartSelectListWtihRevNo(resultInput, null, null, this.state.partType?.value)

        this.setState({ partName: resultInput })
        let partDataAPI = res?.data?.DataList
        if (inputValue) {
          return autoCompleteDropdownPart(inputValue, partDataAPI, false, [], true)
        } else {
          return partDataAPI
        }
      }
      else {
        if (inputValue?.length < searchCount) return false
        else {
          let partData = reactLocalStorage?.getObject('PartData')
          if (inputValue) {
            return autoCompleteDropdownPart(inputValue, partData, false, [], false)
          } else {
            return partData
          }
        }
      }
    };

    const defaultColDef = {
      resizable: true,
      filter: true,
      sortable: false,
      editable: true
    };

    const frameworkComponents = {
      buttonFormatter: this.buttonFormatter,
      customLoadingOverlay: LoaderCustom,
      budgetedQuantity: this.budgetedQuantity,
      actualQuantity: this.actualQuantity,
      budgetedHeader: this.budgetedHeader,
      actualHeader: this.actualHeader
    };
    const tooltipToggleBudgeted = () => {
      this.setState({ viewTooltipBudgeted: !this.state.viewTooltipBudgeted })
    }
    const tooltipToggleActual = () => {
      this.setState({ viewTooltipActual: !this.state.viewTooltipActual })
    }
    return (
      <>
        <div className={`ag-grid-react`}>
          <div className="container-fluid">
            {this.state.isLoader ? <LoaderCustom customClass={"loader-center"} /> :
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
                              <TourWrapper
                                buttonSpecificProp={{ id: "Add_Volume_Form" }}
                                stepsSpecificProp={{
                                  steps: Steps(t,
                                    { isEditFlag: isEditFlag, vendorField: (costingTypeId === VBCTypeId), customerField: (costingTypeId === CBCTypeId), plantField: (costingTypeId === ZBCTypeId), destinationPlant: (costingTypeId === VBCTypeId && getConfigurationKey().IsDestinationPlantConfigure) || (costingTypeId === CBCTypeId && getConfigurationKey().IsCBCApplicableOnPlant) }).ADD_VOLUME
                                }} />
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
                              {(reactLocalStorage.getObject('CostingTypePermission').zbc) && <Label id="Volume_ZeroBased" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
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
                              {(reactLocalStorage.getObject('CostingTypePermission').vbc) && <Label id="Volume_VendorBased" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
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
                              {reactLocalStorage.getObject('CostingTypePermission').cbc && <Label id="Volume_CustomerBased" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3 pt-0 radio-box"} check>
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
                            {(costingTypeId === ZBCTypeId && (
                              <Col md="3">
                                <Field
                                  name="Plant"
                                  type="text"
                                  label="Plant (Code)"
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
                                <label>{VendorLabel} (Code)<span className="asterisk-required">*</span></label>
                                <div className="d-flex justify-space-between align-items-center p-relative async-select">
                                  <div className="fullinput-icon p-relative">
                                    {this.state.inputLoader && <LoaderCustom customClass={`input-loader`} />}
                                    <AsyncSelect
                                      id="AddVolume_vendorName"
                                      name="vendorName"
                                      ref={this.myRef}
                                      key={this.state.updateAsyncDropdown}
                                      loadOptions={vendorFilterList}
                                      onChange={(e) => this.handleVendorName(e)}
                                      value={this.state.vendorName}
                                      noOptionsMessage={({ inputValue }) => inputValue.length < 3 ? MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN : "No results found"}
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
                                      className={"plus-icon-square  right mb-2"}
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
                                  label={costingTypeId === VBCTypeId ? 'Destination Plant (Code)' : 'Plant (Code)'}
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
                            <Col md="3">
                              <Field
                                name="PartType"
                                type="text"
                                label="Part Type"
                                component={searchableSelect}
                                placeholder={isEditFlag ? '-' : "Select"}
                                options={this.renderListing("PartType")}
                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                validate={
                                  this.state.partType == null ||
                                    this.state.partType.length === 0
                                    ? [required]
                                    : []
                                }
                                required={true}
                                handleChangeDescription={this.handlePartTypeChange}
                                valueDescription={this.state.partType}
                                disabled={isEditFlag ? true : false}
                              />
                            </Col>
                            <Col md="3">
                              <label>{"Part No. (Revision No.)"}<span className="asterisk-required">*</span></label>
                              <div className="d-flex justify-space-between align-items-center async-select">
                                <div className="fullinput-icon p-relative">
                                  <AsyncSelect
                                    id="AddVolume_PartNumber"
                                    name="PartNumber"
                                    ref={this.myRef}
                                    key={this.state.updateAsyncDropdown}
                                    loadOptions={partFilterList}
                                    onChange={(e) => this.handlePartName(e)}
                                    value={this.state.part}
                                    noOptionsMessage={({ inputValue }) => inputValue.length < 3 ? MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN : "No results found"}
                                    onKeyDown={(onKeyDown) => {
                                      if (onKeyDown.keyCode === SPACEBAR && !onKeyDown.target.value) onKeyDown.preventDefault();
                                    }}
                                    isDisabled={(isEditFlag || this.state.partType.length === 0) ? true : false}
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
                                {this.state.showTooltip && <Tooltip className="rfq-tooltip-left" placement={"top"} isOpen={this.state.viewTooltipBudgeted} toggle={tooltipToggleBudgeted} target={"budgeted-tooltip"} >{"To edit budgeted quantity please double click on the field."}</Tooltip>}
                                {this.state.showTooltip && <Tooltip className="rfq-tooltip-left" placement={"top"} isOpen={this.state.viewTooltipActual} toggle={tooltipToggleActual} target={"actual-tooltip"} >{"To edit actual quantity please double click on the field."}</Tooltip>}
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
                                    suppressColumnVirtualisation={true}
                                    stopEditingWhenCellsLoseFocus={true}
                                  >
                                    <AgGridColumn field="Month" headerName="Month" editable='false'></AgGridColumn>
                                    <AgGridColumn field="BudgetedQuantity" cellRenderer='budgetedQuantity' headerName="Budgeted Quantity" headerComponent={'budgetedHeader'}></AgGridColumn>
                                    <AgGridColumn field="ApprovedQuantity" cellRenderer='actualQuantity' headerName="Actual Quantity" headerComponent={'actualHeader'}></AgGridColumn>
                                    <AgGridColumn field="VolumeApprovedDetailId" editable='false' cellRenderer='buttonFormatter' cellClass="ag-grid-action-container" headerName="Action" type="rightAligned" ></AgGridColumn>
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
                              id="Volume_CancelBtn"
                              type={"button"}
                              className="mr15 cancel-btn"
                              onClick={this.cancelHandler}
                              disabled={setDisable}
                            >
                              <div className={"cancel-icon"}></div>{" "}
                              {"Cancel"}
                            </button>
                            <button
                              id="Volume_SubmitBtn"
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

              </div>}
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
  getClientSelectList,
  getSelectListPartType
})(
  reduxForm({
    form: 'AddVolume',
    validate: validateForm,
    enableReinitialize: true,
    touchOnChange: true
  })(withTranslation(['VolumeMaster', 'MasterLabels'])(AddVolume)),
)
