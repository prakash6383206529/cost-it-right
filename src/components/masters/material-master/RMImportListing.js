import React, { useMemo } from 'react';
import { Row, Col, } from 'reactstrap';
import {
  deleteRawMaterialAPI, getAllRMDataList,
  setReducerRMListing
} from '../actions/Material';
import { defaultPageSize, DOMESTIC, EMPTY_DATA, ENTRY_TYPE_IMPORT, FILE_URL, RMIMPORT, ZBCTypeId } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import Toaster from '../../common/Toaster';
import 'react-input-range/lib/css/index.css';
import DayTime from '../../common/DayTimeWrapper'
import BulkUpload from '../../massUpload/BulkUpload';
import LoaderCustom from '../../common/LoaderCustom';
import { INR, RM_MASTER_ID, APPROVAL_ID } from '../../../config/constants'
import { RMIMPORT_DOWNLOAD_EXCEl } from '../../../config/masterData';
import ReactExport from 'react-export-excel';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { CheckApprovalApplicableMaster, IsShowFreightAndShearingCostFields, getConfigurationKey, getLocalizedCostingHeadValue, loggedInUserId, searchNocontentFilter, setLoremIpsum, userDepartmetList } from '../../../helper';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { getListingForSimulationCombined, setSelectedRowForPagination } from '../../simulation/actions/Simulation';
import WarningMessage from '../../common/WarningMessage';
import _ from 'lodash';
import { disabledClass, setResetCostingHead, useFetchAPICall } from '../../../actions/Common';
import { reactLocalStorage } from 'reactjs-localstorage';
import AnalyticsDrawer from './AnalyticsDrawer';
import { checkMasterCreateByCostingPermission, hideCustomerFromExcel, hideMultipleColumnFromExcel } from '../../common/CommonFunctions';
import Attachament from '../../costing/components/Drawers/Attachament';
import Button from '../../layout/Button';
import RMSimulation from '../../simulation/components/SimulationPages/RMSimulation';
import { PaginationWrappers } from '../../common/Pagination/PaginationWrappers';
import PaginationControls from '../../common/Pagination/PaginationControls';
import { resetStatePagination, updateCurrentRowIndex, updateGlobalTake, updatePageNumber, updatePageSize } from '../../common/Pagination/paginationAction';
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from '../../common/Tour/TourMessages';
import { useTranslation } from 'react-i18next';
import { useLabels, useWithLocalization } from '../../../helper/core';
import RfqMasterApprovalDrawer from './RfqMasterApprovalDrawer';
import CostingHeadDropdownFilter from './CostingHeadDropdownFilter';
const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};



function RMImportListing(props) {
  const { AddAccessibility, BulkUploadAccessibility, ViewRMAccessibility, EditAccessibility, DeleteAccessibility, DownloadAccessibility, isSimulation, selectionForListingMasterAPI, objectForMultipleSimulation, apply, ListFor, isFromVerifyPage } = props;

  const [value, setvalue] = useState({ min: 0, max: 0 });
  const [isBulkUpload, setisBulkUpload] = useState(false);
  const [gridApi, setgridApi] = useState(null);   // DONT DELETE THIS STATE , IT IS USED BY AG GRID
  const [gridColumnApi, setgridColumnApi] = useState(null);   // DONT DELETE THIS STATE , IT IS USED BY AG GRID
  const [loader, setloader] = useState(true);
  const dispatch = useDispatch();
  const rmImportDataList = useSelector((state) => state.material.rmImportDataList);
  const filteredRMData = useSelector((state) => state.material.filteredRMData);
  const { selectedRowForPagination } = useSelector((state => state.simulation))
  const allRmDataList = useSelector((state) => state.material.allRmDataList);
  const { globalTakes } = useSelector((state) => state.pagination);

  const [showPopup, setShowPopup] = useState(false)
  const [deletedId, setDeletedId] = useState('')
  const [showPopupBulk, setShowPopupBulk] = useState(false)
  const [disableDownload, setDisableDownload] = useState(false)
  const [disableFilter, setDisableFilter] = useState(true) // STATE MADE FOR CHECKBOX IN SIMULATION
  const [analyticsDrawer, setAnalyticsDrawer] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState([]);
  //STATES BELOW ARE MADE FOR PAGINATION PURPOSE
  const [warningMessage, setWarningMessage] = useState(false)
  // const [globalTake, setGlobalTake] = useState(defaultPageSize)
  const [filterModel, setFilterModel] = useState({});
  // const [pageNo, setPageNo] = useState(1)
  // const [pageNoNew, setPageNoNew] = useState(1)
  const [totalRecordCount, setTotalRecordCount] = useState(0)
  const [isFilterButtonClicked, setIsFilterButtonClicked] = useState(false)
  // const [currentRowIndex, setCurrentRowIndex] = useState(0)
  // const [pageSize, setPageSize] = useState({ pageSize10: true, pageSize50: false, pageSize100: false })
  const [floatingFilterData, setFloatingFilterData] = useState({ CostingHead: "", TechnologyName: "", RawMaterialName: "", RawMaterialGradeName: "", RawMaterialSpecificationName: "", RawMaterialCode: "", Category: "", MaterialType: "", DestinationPlantName: "", UnitOfMeasurementName: "", VendorName: "", BasicRatePerUOM: "", ScrapRate: "", RMFreightCost: "", RMShearingCost: "", NetLandedCost: "", NetLandedCostConversion: "", EffectiveDate: "", DepartmentName: isSimulation && getConfigurationKey().IsCompanyConfigureOnPlant ? userDepartmetList() : "", CustomerName: "", NetConditionCostConversion: "", NetConditionCost: "", NetCostWithoutConditionCost: "", NetCostWithoutConditionCostConversion: "", RawMaterialShearingCostConversion: "", RawMaterialFreightCostConversion: "", MachiningScrapRateInINR: "", MachiningScrapRate: "", BasicRatePerUOMConversion: "", Currency: "", })
  const [noData, setNoData] = useState(false)
  const [dataCount, setDataCount] = useState(0)
  const [inRangeDate, setinRangeDate] = useState([])
  // const [dateArray, setDateArray] = useState([])
  const [attachment, setAttachment] = useState(false);
  const [viewAttachment, setViewAttachment] = useState([])
  const [editSelectedList, setEditSelectedList] = useState(false)
  const [tempList, setTempList] = useState([])
  const [showExtraData, setShowExtraData] = useState(false)
  const [render, setRender] = useState(true)
  const [disableEdit, setDisableEdit] = useState(true)
  const [compareDrawer, setCompareDrawer] = useState(false)
  const [rowDataForCompare, setRowDataForCompare] = useState([])
  const { t } = useTranslation("common")
  const netCostHeader = `Net Cost (${reactLocalStorage.getObject("baseCurrency")})`
  const { tokenForSimulation, selectedMasterForSimulation } = useSelector(state => state.simulation)
  const { technologyLabel, RMCategoryLabel, vendorLabel, vendorBasedLabel, zeroBasedLabel, customerBasedLabel } = useLabels();
  const headerNames = {
    BasicRate: `Basic Rate (${reactLocalStorage.getObject("baseCurrency")})`,
    ScrapRate: `Scrap Rate (${reactLocalStorage.getObject("baseCurrency")})`,
    MachiningScrapCost: `Machining Scrap Rate (${reactLocalStorage.getObject("baseCurrency")})`,
    FreightCost: `Freight Cost (${reactLocalStorage.getObject("baseCurrency")})`,
    ShearingCost: `Shearing Cost (${reactLocalStorage.getObject("baseCurrency")})`,
    BasicPrice: `Basic Price (${reactLocalStorage.getObject("baseCurrency")})`,
    NetConditionCost: `Net Condition Cost (${reactLocalStorage.getObject("baseCurrency")})`,
    NetCost: `Net Cost (${reactLocalStorage.getObject("baseCurrency")})`,
  }
  const isRfq = props?.quotationId !== null && props?.quotationId !== '' && props?.quotationId !== undefined



  var filterParams = {
    date: "", inRangeInclusive: true, filterOptions: ['equals', 'inRange'],
    comparator: function (filterLocalDateAtMidnight, cellValue) {
      var dateAsString = cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
      var newDate = filterLocalDateAtMidnight != null ? DayTime(filterLocalDateAtMidnight).format('DD/MM/YYYY') : '';
      handleDate(newDate)// FOR COSTING BENCHMARK BOP REPORT
      let date = document.getElementsByClassName('ag-input-field-input')
      for (let i = 0; i < date.length; i++) {
        if (date[i].type == 'radio') {
          date[i].click()
        }
      }

      setDate(newDate)
      if (dateAsString == null) return -1;
      var dateParts = dateAsString.split('/');
      var cellDate = new Date(
        Number(dateParts[2]),
        Number(dateParts[1]) - 1,
        Number(dateParts[0])
      );
      if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
        return 0;
      }
      if (cellDate < filterLocalDateAtMidnight) {
        return -1;
      }
      if (cellDate > filterLocalDateAtMidnight) {
        return 1;
      }
    },

    browserDatePicker: true,
    minValidYear: 2000,

  };

  const params = useMemo(() => {
    let obj = { ...floatingFilterData }

    if (obj?.EffectiveDate) {
      if (obj.EffectiveDate.dateTo) {
        let temp = []
        temp.push(DayTime(obj.EffectiveDate.dateFrom).format('DD/MM/YYYY'))
        temp.push(DayTime(obj.EffectiveDate.dateTo).format('DD/MM/YYYY'))
        obj.dateArray = temp
      }
    }

    obj.RawMaterialEntryType = Number(ENTRY_TYPE_IMPORT)
    obj.Currency = floatingFilterData?.Currency
    obj.ExchangeRateSourceName = floatingFilterData?.ExchangeRateSourceName
    obj.OtherNetCost = floatingFilterData?.OtherNetCost

    return {
      data: { technologyId: props?.technology ?? null },
      skip: 0,
      take: globalTakes,
      isPagination: true,
      obj: obj,
      isImport: true,
      dataObj: obj,
      master: 'RawMaterial',
      tabs: 'Import',
      isMasterSummaryDrawer: props?.isMasterSummaryDrawer
    }
  }, []);

  const { isLoading, isError, error, data } = useFetchAPICall('MastersRawMaterial_GetAllRawMaterialList_Import', params);

  useEffect(() => {
    if (rmImportDataList?.length > 0) {
      setloader(false);
      setTotalRecordCount(rmImportDataList[0].TotalRecordCount)
      setRender(false)
    } else {
      setloader(false);
      setRender(false)
      setNoData(false)
    }
  }, [rmImportDataList])

  useEffect(() => {
    setTimeout(() => {
      reactLocalStorage.setObject('selectedRow', {})
      if (!props?.stopApiCallOnCancel) {

        return () => {
          dispatch(setSelectedRowForPagination([]))
          dispatch(resetStatePagination());

          reactLocalStorage.setObject('selectedRow', {})
        }
      }
    }, 300);


  }, [])

  useEffect(() => {
    setTimeout(() => {
      if (!props?.stopApiCallOnCancel) {
        if (isSimulation && selectionForListingMasterAPI === 'Combined') {
          props?.changeSetLoader(true)
          dispatch(getListingForSimulationCombined(objectForMultipleSimulation, RMIMPORT, (res) => {
            props?.changeSetLoader(false)
            setloader(false)
          }))

        } else {
          if (isSimulation && !isFromVerifyPage) {
            props?.changeTokenCheckBox(false)
          }
        }

        setvalue({ min: 0, max: 0 });
      }
    }, 300);
    return () => {
      dispatch(setResetCostingHead(true, "costingHead"))
    }

  }, [])
  const floatingFilterStatus = {
    maxValue: 1,
    suppressFilterButton: true,
    component: CostingHeadDropdownFilter,
    onFilterChange: (originalValue, value) => {
      setDisableFilter(false);
      setFloatingFilterData(prevState => ({
        ...prevState,
        CostingHead: value
      }));
    }
  };

  /**
  * @method hideForm
  * @description HIDE DOMESTIC, IMPORT FORMS
  */
  const getDataList = (costingHead = null, plantId = null, materialId = null, gradeId = null, vendorId = null, technologyId = 0, skip = 0, take = 10, isPagination = true, dataObj, isReset = false) => {
    const { isSimulation } = props

    if (filterModel?.EffectiveDate && !isReset) {
      if (filterModel.EffectiveDate.dateTo) {
        let temp = []
        temp.push(DayTime(filterModel.EffectiveDate.dateFrom).format('DD/MM/YYYY'))
        temp.push(DayTime(filterModel.EffectiveDate.dateTo).format('DD/MM/YYYY'))

        dataObj.dateArray = temp
      }
    }

    // TO HANDLE FUTURE CONDITIONS LIKE [APPROVED_STATUS, DRAFT_STATUS] FOR MULTIPLE STATUS
    let statusString = [props?.approvalStatus].join(",")

    const filterData = {
      costingHead: isSimulation && filteredRMData && filteredRMData?.costingHeadTemp ? filteredRMData?.costingHeadTemp.value : costingHead,
      plantId: isSimulation && filteredRMData && filteredRMData?.plantId ? filteredRMData?.plantId.value : plantId,
      material_id: isSimulation && filteredRMData && filteredRMData?.RMid ? filteredRMData?.RMid.value : materialId,
      grade_id: isSimulation && filteredRMData && filteredRMData?.RMGradeid ? filteredRMData?.RMGradeid.value : gradeId,
      VendorId: isSimulation && filteredRMData && filteredRMData?.VendorId ? filteredRMData?.VendorId : vendorId,
      technologyId: isSimulation ? (props?.technology ? props?.technology : '') : (technologyId ? technologyId : ''),
      net_landed_min_range: value.min,
      net_landed_max_range: value.max,
      statusId: CheckApprovalApplicableMaster(RM_MASTER_ID) ? APPROVAL_ID : 0,
      ListFor: ListFor,
      StatusId: statusString,
      Vendor: isSimulation && filteredRMData && filteredRMData?.Vendor ? filteredRMData?.Vendor : '',
    }

    if (isPagination === true) {
      setloader(true)
    }
    if (isFromVerifyPage) {
      dataObj.VendorId = filteredRMData && filteredRMData?.VendorId ? filteredRMData?.VendorId : vendorId
      dataObj.CustomerId = filteredRMData && filteredRMData?.CustomerId ? filteredRMData?.CustomerId : ''
      dataObj.Currency = filteredRMData?.Currency
      dataObj.ExchangeRateSourceName = filteredRMData?.ExchangeRateSourceName
      dataObj.OtherNetCost = filteredRMData?.OtherNetCost

    }
    dataObj.RawMaterialEntryType = Number(ENTRY_TYPE_IMPORT)
    //THIS CONDTION IS FOR IF THIS COMPONENT IS RENDER FROM MASTER APPROVAL SUMMARY IN THIS NO GET API
    if (!props?.isMasterSummaryDrawer) {
      dispatch(getAllRMDataList(filterData, skip, take, isPagination, dataObj, true, (res) => {

        if (isSimulation && !isFromVerifyPage) {
          props?.changeTokenCheckBox(true)
        }
        if (res && res.status === 200) {
          setloader(false);

        } else if (res && res.response && res.response.status === 412) {
          setloader(false);

        } else {
          setloader(false);
        }

        if (res && res.status === 204) {
          setTotalRecordCount(0)
          dispatch(updatePageNumber(1))
          // setPageNo(0)
        }

        if (res && isPagination === false) {
          dispatch(disabledClass(false))
          setDisableDownload(false)
          setTimeout(() => {
            let button = document.getElementById('Excel-Downloads-rm-import')
            button && button.click()
          }, 500);
        }

        if (res) {
          let isReset = true
          setTimeout(() => {
            for (var prop in floatingFilterData) {

              if (prop !== "DepartmentName" && prop !== 'RawMaterialEntryType' && floatingFilterData[prop] !== "") {
                isReset = false
              }
            }
            // Sets the filter model via the grid API
            isReset ? (gridOptions?.api?.setFilterModel({})) : (gridOptions?.api?.setFilterModel(filterModel))
          }, 300);

          setTimeout(() => {
            setWarningMessage(false)
            dispatch(setResetCostingHead(false, "costingHead"))

          }, 330);

          setTimeout(() => {
            setIsFilterButtonClicked(false)
          }, 600);
        }
      }))
    }
  }

  var setDate = (date) => {
    setFloatingFilterData((prevState) => ({ ...prevState, EffectiveDate: date }));
    // setState((prevState) => ({ ...prevState, floatingFilterData: { ...prevState.floatingFilterData, newDate: date }, }));
  };

  var handleDate = (newDate) => {
    let temp = inRangeDate
    temp.push(newDate)
    setinRangeDate(temp)        // setState((prevState) => ({ ...prevState, inRangeDate: temp }))
    if (props?.benchMark) {
      props?.handleDate(inRangeDate)
    }
    setTimeout(() => {
      var y = document.getElementsByClassName('ag-radio-button-input');
      var radioBtn = y[0];
      radioBtn?.click()

    }, 300);
  }
  /**
        * @method toggleExtraData
        * @description Handle specific module tour state to display lorem data
        */
  const toggleExtraData = (showTour) => {
    setRender(true)
    setTimeout(() => {
      setShowExtraData(showTour)
      setRender(false)
    }, 100);


  }
  const onFloatingFilterChanged = (value) => {
    setDisableFilter(false)
    const model = gridOptions?.api?.getFilterModel();
    setFilterModel(model)
    setTimeout(() => {
      if (rmImportDataList.length !== 0) {
        setNoData(searchNocontentFilter(value, noData))
        setTotalRecordCount(gridApi?.getDisplayedRowCount())
      }
    }, 500);
    if (!isFilterButtonClicked) {
      setWarningMessage(true)
    }
    if (value?.filterInstance?.appliedModel === null || value?.filterInstance?.appliedModel?.filter === "") {

      let isFilterEmpty = true

      if (model !== undefined && model !== null) {
        if (Object.keys(model).length > 0) {
          isFilterEmpty = false

          for (var property in floatingFilterData) {

            if (property === value.column.colId) {
              floatingFilterData[property] = ""
            }
          }
          setFloatingFilterData(floatingFilterData)
        }

        if (isFilterEmpty) {
          setWarningMessage(false)
          for (var prop in floatingFilterData) {

            if (isSimulation && getConfigurationKey().IsCompanyConfigureOnPlant) {
              if (prop !== "DepartmentName") {
                floatingFilterData[prop] = ""
              }
            } else {
              floatingFilterData[prop] = ""
            }
          }
          setFloatingFilterData(floatingFilterData)
        }
      }

    } else {
      if (value.column.colId === "EffectiveDate" || value.column.colId === "CreatedDate") {
        return false
      }
      setFloatingFilterData({ ...floatingFilterData, [value.column.colId]: value.filterInstance.appliedModel.filter })
    }
  }


  const onSearch = () => {
    setNoData(false)
    setWarningMessage(false)
    setIsFilterButtonClicked(true)
    dispatch(updatePageNumber(1))
    // setPageNo(1)
    // setPageNoNew(1)
    dispatch(updateCurrentRowIndex(10))
    // setCurrentRowIndex(0)
    gridOptions?.columnApi?.resetColumnState();
    getDataList(null, null, null, null, null, 0, 0, globalTakes, true, floatingFilterData)
  }


  /**
  * @method viewOrEditItemDetails
  * @description edit or view material type
  */
  const viewOrEditItemDetails = (Id, rowData = {}, isViewMode) => {
    let data = {
      isEditFlag: true,
      isViewFlag: isViewMode,
      Id: Id,
      costingTypeId: rowData.CostingTypeId,
      IsVendor: rowData.CostingHead === 'Vendor Based' ? true : rowData.CostingHead === 'Zero Based' ? false : rowData.CostingHead,
    }
    props?.getDetails(data, rowData?.IsRMAssociated);
  }

  /**
  * @method deleteItem
  * @description confirm delete Raw Material details
  */
  const deleteItem = (Id) => {
    setShowPopup(true)
    setDeletedId(Id)
  }

  /**
  * @method confirmDelete
  * @description confirm delete Raw Material details
  */
  const confirmDelete = (ID) => {
    const loggedInUser = loggedInUserId()
    dispatch(deleteRawMaterialAPI(ID, loggedInUser, (res) => {
      if (res.status === 417 && res.data.Result === false) {
        Toaster.error(res.data.Message)
      } else if (res && res.data && res.data.Result === true) {
        Toaster.success(MESSAGES.DELETE_RAW_MATERIAL_SUCCESS);
        setDataCount(0)
        resetState()
      }
    }));
    setShowPopup(false)
  }

  const onPopupConfirm = () => {
    confirmDelete(deletedId);
  }
  const closePopUp = () => {
    setShowPopup(false)
    setShowPopupBulk(false)
  }
  const onPopupConfirmBulk = () => {
    confirmDelete(deletedId);
  }
  const handleCompareDrawer = (data) => {
    setCompareDrawer(true)
    setRowDataForCompare([data])
  }
  /**
  * @method buttonFormatter
  * @description Renders buttons
  */
  const { benchMark, isMasterSummaryDrawer } = props
  const buttonFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props?.valueFormatted : props?.value;
    const rowData = props?.valueFormatted ? props?.valueFormatted : props?.data;
    let isEditbale = false
    let isDeleteButton = false


    if (EditAccessibility) {
      isEditbale = true
    } else {
      isEditbale = false
    }

    if (isRfq && isMasterSummaryDrawer) {

      return (
        <button className="Balance mb-0 button-stick" type="button" onClick={() => handleCompareDrawer(rowData)}>

        </button>
      );
    }
    if (showExtraData && props.rowIndex === 0) {
      isDeleteButton = true
    } else {
      if (DeleteAccessibility && !rowData.IsRMAssociated) {
        isDeleteButton = true
      }
    }


    return (
      <>
        <Button
          id={`rmImportListing_movement${props?.rowIndex}`}
          className={"mr-1 Tour_List_Cost_Movement"}
          variant="cost-movement"
          onClick={() => showAnalytics(cellValue, rowData)}
          title={"Cost Movement"}
        />
        {(!benchMark) && (
          <>
            {ViewRMAccessibility && <Button
              id={`rmImportListing_view${props?.rowIndex}`}
              className={"mr-1 Tour_List_View"}
              variant="View"
              onClick={() => viewOrEditItemDetails(cellValue, rowData, true)}
              title={"View"}
            />}
            {isEditbale && <Button
              id={`rmImportListing_edit${props?.rowIndex}`}
              className={"mr-1 Tour_List_Edit"}
              variant="Edit"
              onClick={() => viewOrEditItemDetails(cellValue, rowData, false)}
              title={"Edit"}
            />}
            {isDeleteButton && <Button
              id={`rmImportListing_delete${props?.rowIndex}`}
              className={"mr-1 Tour_List_Delete"}
              variant="Delete"
              onClick={() => deleteItem(cellValue)}
              title={"Delete"}
            />}
          </>
        )}
      </>
    )
  };


  const closeAnalyticsDrawer = () => {
    setAnalyticsDrawer(false)
  }

  const showAnalytics = (cell, rowData) => {
    setSelectedRowData(rowData)
    setAnalyticsDrawer(true)
  }


  /**
  * @method costingHeadFormatter
  * @description Renders Costing head
  */
  const costingHeadFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props?.valueFormatted : props?.value;

    let data = (cellValue === true || cellValue === 'Vendor Based' || cellValue === 'VBC') ? 'Vendor Based' : 'Zero Based';

    return data;
  }


  const costFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props?.valueFormatted : props?.value;
    return cellValue !== INR ? cellValue : '';
  }

  /**
  * @method effectiveDateFormatter
  * @description Renders buttons
  */
  const effectiveDateFormatter = (props) => {
    if (showExtraData && props?.rowIndex === 0) {
      return "Lorem Ipsum";
    } else {
      const cellValue = props?.valueFormatted ? props?.valueFormatted : props?.value;
      return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
    }
  }

  /**
  * @method hyphenFormatter
  */
  const hyphenFormatter = (props) => {
    const cellValue = props?.value;
    return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
  }

  /**
  * @method shearingCostFormatter
  * @description Renders buttons
  */
  const shearingCostFormatter = (props) => {
    const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
    return cell != null ? cell : '-';
  }

  const statusFormatter = (props) => {
    const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
    // CHANGE IN STATUS IN AFTER KAMAL SIR API
    return <div className={row.Status}>{row.DisplayStatus}</div>
  }

  /**
  * @method commonCostFormatter
  * @description Renders buttons
  */
  const commonCostFormatter = (props) => {
    const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
    return cell != null ? cell : '-';
  }
  /**
  * @method currencyFormatter
  * @description Renders buttons
  */
  const currencyFormatter = (props) => {
    const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
    return cell != null ? cell : '-';
  }
  const combinedCostingHeadRenderer = (props) => {
    // Call the existing checkBoxRenderer
    checkBoxRenderer(props);

    // Get and localize the cell value
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    const localizedValue = getLocalizedCostingHeadValue(cellValue, vendorBasedLabel, zeroBasedLabel, customerBasedLabel);

    // Return the localized value (the checkbox will be handled by AgGrid's default renderer)
    return localizedValue;
  };

  const checkBoxRenderer = (props) => {
    const cellValue = props?.valueFormatted ? props?.valueFormatted : props?.value;
    let selectedRowForPagination = reactLocalStorage.getObject('selectedRow').selectedRow
    if (selectedRowForPagination?.length > 0) {
      selectedRowForPagination.map((item) => {
        if (item.RawMaterialId === props?.node.data.RawMaterialId) {
          props?.node.setSelected(true)
        }
        return null
      })
      return cellValue
    } else {
      return cellValue
    }

  }


  const formToggle = () => {
    if (checkMasterCreateByCostingPermission()) {
      props?.formToggle()
    }
  }

  const bulkToggle = () => {
    if (checkMasterCreateByCostingPermission(true)) {
      setisBulkUpload(true);
    }
  }

  const closeBulkUploadDrawer = (event, type) => {
    setisBulkUpload(false);
    if (type !== 'cancel') {
      resetState()
    }
  }
  const closeCompareDrawer = (event, type) => {
    setCompareDrawer(false);
    if (type !== 'cancel') {
      resetState()
    }
  }
  /**
  * @method densityAlert
  * @description confirm Redirection to Material tab.
  */
  const densityAlert = () => {
    setShowPopupBulk(true)
  }


  const onGridReady = (params) => {
    setgridApi(params.api);

    setgridColumnApi(params.columnApi);
    params.api.paginationGoToPage(0);
  };


  const returnExcelColumn = (data = [], TempData) => {
    let excelData = hideCustomerFromExcel(data, "CustomerName")

    if (!IsShowFreightAndShearingCostFields()) {
      excelData = hideMultipleColumnFromExcel(excelData, ['FreightCost', 'ShearingCost', 'RMFreightCost', 'RMShearingCost', 'RawMaterialFreightCostConversion', 'RawMaterialShearingCostConversion'])
    }
    let temp = []
    temp = TempData && TempData.map((item) => {
      if (item.CostingHead === true) {
        item.CostingHead = 'Vendor Based'
        item.EffectiveDate = (item.EffectiveDate)?.slice(0, 10)
      } else if (item.CostingHead === false) {
        item.CostingHead = 'Zero Based'
        item.EffectiveDate = (item.EffectiveDate)?.slice(0, 10)
      } else {
        item.EffectiveDate = (item.EffectiveDate)?.slice(0, 10)
      }
      return item
    })
    return (

      <ExcelSheet data={temp} name={'RM Import'}>
        {excelData && excelData.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
      </ExcelSheet>);
  }


  const onExcelDownload = () => {
    dispatch(disabledClass(true))
    setDisableDownload(true)
    //let tempArr = gridApi && gridApi?.getSelectedRows()
    let tempArr = selectedRowForPagination
    if (tempArr?.length > 0) {
      setTimeout(() => {
        dispatch(disabledClass(false))
        setDisableDownload(false)
        let button = document.getElementById('Excel-Downloads-rm-import')
        button && button.click()
      }, 400);

    } else {

      getDataList(null, null, null, null, null, 0, 0, defaultPageSize, false, floatingFilterData) // FOR EXCEL DOWNLOAD OF COMPLETE DATA
    }

  }

  const RMIMPORT_DOWNLOAD_EXCEl_LOCALIZATION = useWithLocalization(RMIMPORT_DOWNLOAD_EXCEl, "MasterLabels")
  const onBtExport = () => {
    let tempArr = []

    //tempArr = gridApi && gridApi?.getSelectedRows()
    tempArr = selectedRowForPagination
    tempArr = (tempArr && tempArr.length > 0) ? tempArr : (allRmDataList ? allRmDataList : [])
    const filteredLabels = RMIMPORT_DOWNLOAD_EXCEl_LOCALIZATION.filter(column => {
      if (column.value === "ExchangeRateSourceName") {
        return getConfigurationKey().IsSourceExchangeRateNameVisible
      }
      return true;
    })
    return returnExcelColumn(filteredLabels, tempArr)

  };

  const onFilterTextBoxChanged = (e) => {
    gridApi.setQuickFilter(e.target.value);
  }


  const resetState = () => {
    setNoData(false)
    setFilterModel({})
    setinRangeDate([])
    dispatch(setResetCostingHead(true, "costingHead"))
    setIsFilterButtonClicked(false)
    gridOptions?.columnApi?.resetColumnState(null);
    gridOptions?.api?.setFilterModel(null);

    for (var prop in floatingFilterData) {
      if (isSimulation && getConfigurationKey().IsCompanyConfigureOnPlant) {
        if (prop !== "DepartmentName") {
          floatingFilterData[prop] = ""
        }
      } else {
        floatingFilterData[prop] = ""
      }
    }
    setFloatingFilterData(floatingFilterData)
    setWarningMessage(false)
    dispatch(resetStatePagination())
    // setPageNo(1)
    // setCurrentRowIndex(0)
    getDataList(null, null, null, null, null, 0, 0, 10, true, floatingFilterData, true)
    dispatch(setSelectedRowForPagination([]))
    // setGlobalTake(10)
    dispatch(updateGlobalTake(10))
    // setPageSize(prevState => ({ ...prevState, pageSize10: true, pageSize50: false, pageSize100: false }))
    setDataCount(0)
    reactLocalStorage.setObject('selectedRow', {})
    if (isSimulation && !isFromVerifyPage) {
      props?.isReset()
    }
  }


  const isFirstColumn = (params) => {
    var displayedColumns = params.columnApi.getAllDisplayedColumns();
    var thisIsFirstColumn = displayedColumns[0] === params.column;
    if (props?.isMasterSummaryDrawer) {
      return false
    } else {
      return thisIsFirstColumn;
    }
  }

  const onRowSelect = (event) => {

    let selectedRowForPagination = reactLocalStorage.getObject('selectedRow').selectedRow
    var selectedRows = gridApi && gridApi?.getSelectedRows();
    if (props?.isSimulation && selectedRows?.length !== 0) {
      setDisableEdit(false)
    } else {
      setDisableEdit(true)

    }
    if (selectedRows === undefined || selectedRows === null) {    //CONDITION FOR FIRST RENDERING OF COMPONENT
      selectedRows = selectedRowForPagination
    } else if (selectedRowForPagination && selectedRowForPagination.length > 0) {  // CHECKING IF REDUCER HAS DATA

      let finalData = []
      if (event.node.isSelected() === false) {      // CHECKING IF CURRENT CHECKBOX IS UNSELECTED

        for (let i = 0; i < selectedRowForPagination.length; i++) {
          if (selectedRowForPagination[i].RawMaterialId === event.data.RawMaterialId) {       // REMOVING UNSELECTED CHECKBOX DATA FROM REDUCER
            continue;
          }
          finalData.push(selectedRowForPagination[i])
        }

      } else {
        finalData = selectedRowForPagination
      }
      selectedRows = [...selectedRows, ...finalData]
    }

    let uniqeArray = _.uniqBy(selectedRows, "RawMaterialId")           //UNIQBY FUNCTION IS USED TO FIND THE UNIQUE ELEMENTS & DELETE DUPLICATE ENTRY
    reactLocalStorage.setObject('selectedRow', { selectedRow: uniqeArray })  //SETTING CHECKBOX STATE DATA IN LOCAL STORAGE
    setDataCount(uniqeArray.length)
    dispatch(setSelectedRowForPagination(uniqeArray))
    let finalArr = selectedRows
    let length = finalArr?.length
    let uniqueArray = _.uniqBy(finalArr, "RawMaterialId")

    if (isSimulation && !isFromVerifyPage) {
      apply(uniqueArray, length)
    }

    if (props?.benchMark) {
      let uniqueArrayNew = _.uniqBy(selectedRows, v => [v.TechnologyId, v.RawMaterial].join())
      if (uniqueArrayNew.length > 1) {
        dispatch(setSelectedRowForPagination([]))
        gridApi.deselectAll()
        Toaster.warning(`${technologyLabel} & Raw material should be same`)
      }
    }

  }


  const defaultColDef = {
    resizable: true,
    filter: true,
    sortable: false,
    headerCheckboxSelectionFilteredOnly: true,
    headerCheckboxSelection: (isSimulation || props?.benchMark) ? isFirstColumn : false,
    checkboxSelection: isFirstColumn
  };

  const viewAttachmentData = (index) => {
    setAttachment(true)
    setViewAttachment(index)
  }
  const closeAttachmentDrawer = (e = '') => {
    setAttachment(false)
  }
  const attachmentFormatter = (props) => {
    const row = props?.data;
    let files = row?.Attachements
    if (files && files?.length === 0) {
      return '-'
    }
    return (
      <>
        <div className={"attachment images"}>
          {files && files.length === 1 ?
            files.map((f) => {
              const withOutTild = f.FileURL?.replace("~", "");
              const fileURL = `${FILE_URL}${withOutTild}`;
              return (
                <a href={fileURL} target="_blank" rel="noreferrer">
                  {f.OriginalFileName}
                </a>
              )

            }) : <Button
              id={`rmImportListing_attachment${props?.rowIndex}`}
              className={"mr5"}
              variant="btn-a"
              onClick={() => viewAttachmentData(row)}
              title={"View Attachment"}
            >View Attachment</Button>}
        </div>
      </>
    )

  }

  const cancel = () => {
    props?.cancelImportList()
  }

  const editSelectedData = () => {
    setTempList(gridApi?.getSelectedRows() ? gridApi?.getSelectedRows() : [])
    setEditSelectedList(true)
  }

  const backToSimulation = (value) => {
    setEditSelectedList(false)
  }
  const netLanedCostFormatter = (props) => {
    const row = props?.valueFormatted ? props.valueFormatted : props?.data;
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;

    return (row?.NetLandedCost ?? '-');

  }

  const frameworkComponents = {
    totalValueRenderer: buttonFormatter,
    effectiveDateRenderer: effectiveDateFormatter,
    costingHeadRenderer: costingHeadFormatter,
    customNoRowsOverlay: NoContentFound,
    costFormatter: costFormatter,
    commonCostFormatter: commonCostFormatter,
    shearingCostFormatter: shearingCostFormatter,
    statusFormatter: statusFormatter,
    hyphenFormatter: hyphenFormatter,
    combinedCostingHeadRenderer: combinedCostingHeadRenderer,
    checkBoxRenderer: checkBoxRenderer,
    currencyFormatter: currencyFormatter,
    attachmentFormatter: attachmentFormatter,
    statusFilter: CostingHeadDropdownFilter,
    netLanedCostFormatter: netLanedCostFormatter

  };

  return (
    <div>{!editSelectedList && <div className={`ag-grid-react grid-parent-wrapper custom-pagination ${isSimulation ? 'simulation-height' : props?.isMasterSummaryDrawer ? "" : 'min-height100vh'}  ${DownloadAccessibility ? "show-table-btn" : ""}`}>
      {(loader && !props?.isMasterSummaryDrawer) ? <LoaderCustom customClass="simulation-Loader" /> :
        <>
          {disableDownload && <LoaderCustom message={MESSAGES.DOWNLOADING_MESSAGE} />}
          <Row className={`filter-row-large pt-2 ${isSimulation ? "zindex-0" : ""}`}>
            <Col md="3" lg="3">
              <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
              {(!props.isSimulation && !props.benchMark && !props?.isMasterSummaryDrawer) && (<TourWrapper
                buttonSpecificProp={{ id: "RM_Import_Listing_Tour", onClick: toggleExtraData }}
                stepsSpecificProp={{
                  steps: Steps(t, { addLimit: false, copyButton: false, viewBOM: false, status: false, updateAssociatedTechnology: false, addMaterial: false, addAssociation: false, generateReport: false, approve: false, reject: false }).COMMON_LISTING
                }} />)}
            </Col>
            <Col md="9" lg="9" className=" mb-3 d-flex justify-content-end">
              {(!props?.isMasterSummaryDrawer) && <>

                {isSimulation && !isFromVerifyPage &&
                  <div className="warning-message d-flex align-items-center">
                    {warningMessage && !disableDownload && <><WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} /><div className='right-hand-arrow mr-2'></div></>}

                    <Button
                      id="rmImportListing_filter"
                      className={"mr5 Tour_List_Filter"}
                      onClick={() => onSearch()}
                      title={"Filtered data"}
                      icon={"filter"}
                      disabled={disableFilter}
                    />

                  </div>
                }
                {!isSimulation &&
                  <div className="d-flex justify-content-end bd-highlight w100">
                    <>
                      {
                        <div className="warning-message d-flex align-items-center">
                          {warningMessage && !disableDownload && <><WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} /><div className='right-hand-arrow mr-2'></div></>}
                        </div>
                      }

                      <Button
                        id="rmImportListing_filter"
                        className={"mr5 Tour_List_Filter"}
                        onClick={() => onSearch()}
                        title={"Filtered data"}
                        icon={"filter"}
                        disabled={disableFilter}
                      />
                      {/* 
                      {AddAccessibility && (

                        <Button
                          id="rmImportListing_add"
                          className={"mr5 Tour_List_Add"}
                          onClick={formToggle}
                          title={"Add"}
                          icon={"plus"}
                        />
                      )}
                      {BulkUploadAccessibility && (
                        <Button
                          id="rmImportListing_add"
                          className={"mr5 Tour_List_BulkUpload"}
                          onClick={bulkToggle}
                          title={"Bulk Upload"}
                          icon={"upload"}
                        />
                      )} */}
                      {
                        DownloadAccessibility &&
                        <>
                          <Button
                            className="mr5 Tour_List_Download"
                            id={"rmImportListing_excel_download"}
                            onClick={onExcelDownload}
                            title={`Download ${dataCount === 0 ? "All" : "(" + dataCount + ")"}`}
                            icon={"download mr-1"}
                            buttonName={`${dataCount === 0 ? "All" : "(" + dataCount + ")"}`}
                            disabled={totalRecordCount === 0}
                          />
                          <ExcelFile filename={'RM Import'} fileExtension={'.xls'} element={
                            <Button id={"Excel-Downloads-rm-import"} className="p-absolute" />}>
                            {onBtExport()}
                          </ExcelFile>
                        </>
                      }
                    </>
                  </div>
                }
                <Button
                  id={"rmImportListing_refresh"}
                  onClick={() => resetState()}
                  title={"Reset Grid"}
                  icon={"refresh"}
                  className={"mr5 Tour_List_Reset"}
                />
                {isSimulation && isFromVerifyPage && <button type="button" className={"apply"} onClick={cancel}><div className={'back-icon'}></div>Back</button>}
              </>}
            </Col>
          </Row>
          <Row>
            <Col>
              <div className={`ag-grid-wrapper ${(rmImportDataList && rmImportDataList?.length <= 0) || noData ? "overlay-contain" : ""}`}>
                <div className={`ag-theme-material `}>
                  {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
                  {render ? <LoaderCustom customClass="loader-center" /> : <AgGridReact

                    style={{ height: '100%', width: '100%' }}
                    defaultColDef={defaultColDef}
                    floatingFilter={true}

                    domLayout='autoHeight'
                    rowData={showExtraData && rmImportDataList ? [...setLoremIpsum(rmImportDataList[0]), ...rmImportDataList] : rmImportDataList}

                    pagination={true}
                    paginationPageSize={globalTakes}
                    onGridReady={onGridReady}
                    gridOptions={gridOptions}
                    noRowsOverlayComponent={'customNoRowsOverlay'}
                    noRowsOverlayComponentParams={{
                      title: EMPTY_DATA,
                      imagClass: 'imagClass'
                    }}
                    frameworkComponents={frameworkComponents}
                    rowSelection={'multiple'}
                    onFilterModified={onFloatingFilterChanged}
                    //onSelectionChanged={onRowSelect}
                    onRowSelected={onRowSelect}
                    suppressRowClickSelection={true}
                  >
                    <AgGridColumn cellClass="has-checkbox" field="CostingHead" headerName='Costing Head' cellRenderer={combinedCostingHeadRenderer}
                      floatingFilterComponentParams={floatingFilterStatus}
                      floatingFilterComponent="statusFilter"></AgGridColumn>
                    <AgGridColumn field="TechnologyName" headerName={technologyLabel}></AgGridColumn>
                    <AgGridColumn field="RawMaterialName" headerName='Raw Material' ></AgGridColumn>
                    <AgGridColumn field="RawMaterialGradeName" headerName='Grade'></AgGridColumn>
                    <AgGridColumn field="RawMaterialSpecificationName" headerName='Spec'></AgGridColumn>
                    <AgGridColumn field="RawMaterialCode" headerName='Code' cellRenderer='hyphenFormatter'></AgGridColumn>
                    <AgGridColumn field="Category" headerName={RMCategoryLabel}></AgGridColumn>
                    <AgGridColumn field="MaterialType"></AgGridColumn>
                    <AgGridColumn field="DestinationPlantName" headerName="Plant (Code)"></AgGridColumn>
                    <AgGridColumn field="VendorName" headerName={vendorLabel + " (Code)"}></AgGridColumn>
                    {reactLocalStorage.getObject('CostingTypePermission').cbc && <AgGridColumn field="CustomerName" headerName="Customer (Code)" cellRenderer={'hyphenFormatter'}></AgGridColumn>}
                    {/* <AgGridColumn field="DepartmentName" headerName="Department"></AgGridColumn> */}
                    <AgGridColumn field="UnitOfMeasurementName" headerName='UOM'></AgGridColumn>
                    {getConfigurationKey().IsSourceExchangeRateNameVisible && <AgGridColumn field="ExchangeRateSourceName" headerName="Exchange Rate Source"></AgGridColumn>}
                    <AgGridColumn field="Currency" cellRenderer={"currencyFormatter"}></AgGridColumn>

                    <AgGridColumn field="BasicRatePerUOM" headerName="Basic Rate (Currency)" cellRenderer={'commonCostFormatter'}></AgGridColumn>
                    {/* <AgGridColumn field="BasicRatePerUOMConversion" headerName={headerNames?.BasicRate} cellRenderer='commonCostFormatter'></AgGridColumn> */}
                    <AgGridColumn field="IsScrapUOMApply" headerName="Has different Scrap Rate UOM" cellRenderer='commonCostFormatter'></AgGridColumn>
                    <AgGridColumn field="ScrapUnitOfMeasurement" headerName='Scrap Rate UOM' cellRenderer='commonCostFormatter'></AgGridColumn>
                    <AgGridColumn field="CalculatedFactor" headerName='Calculated Factor' cellRenderer='commonCostFormatter'></AgGridColumn>
                    <AgGridColumn field="ScrapRatePerScrapUOM" headerName='Scrap Rate (In Scrap Rate UOM)' cellRenderer='commonCostFormatter'></AgGridColumn>
                    <AgGridColumn field="ScrapRate" headerName="Scrap Rate" cellRenderer='commonCostFormatter'></AgGridColumn>
                    {props?.isMasterSummaryDrawer && <AgGridColumn width="140" field="MachiningScrapRate" cellRenderer='commonCostFormatter' headerName='Machining Scrap Rate'></AgGridColumn>}
                    {/* ON RE FREIGHT COST AND SHEARING COST COLUMN IS COMMENTED //RE */}
                    {/* {getConfigurationKey()?.IsBasicRateAndCostingConditionVisible && ((props?.isMasterSummaryDrawer && rmImportDataList[0]?.CostingTypeId === ZBCTypeId) || !props?.isMasterSummaryDrawer) && !isFromVerifyPage && <AgGridColumn field="NetCostWithoutConditionCost" headerName="Basic Price (Currency)" cellRenderer='commonCostFormatter'></AgGridColumn>}
                    {getConfigurationKey()?.IsBasicRateAndCostingConditionVisible && ((props?.isMasterSummaryDrawer && rmImportDataList[0]?.CostingTypeId === ZBCTypeId) || !props?.isMasterSummaryDrawer) && !isFromVerifyPage && <AgGridColumn field="NetCostWithoutConditionCostConversion" headerName={headerNames?.BasicPrice} cellRenderer='commonCostFormatter'></AgGridColumn>} */}
                    <AgGridColumn field="OtherNetCost" headerName='Other Net Cost' cellRenderer='commonCostFormatter'></AgGridColumn>
                    {getConfigurationKey()?.IsBasicRateAndCostingConditionVisible && ((props?.isMasterSummaryDrawer && rmImportDataList[0]?.CostingTypeId === ZBCTypeId) || !props?.isMasterSummaryDrawer) && !isFromVerifyPage && <AgGridColumn field="NetConditionCost" headerName="Net Condition Cost" cellRenderer='commonCostFormatter'></AgGridColumn>}
                    <AgGridColumn field="NetLandedCost" headerName="Net Cost" cellRenderer='costFormatter'></AgGridColumn>
                    <AgGridColumn field="EffectiveDate" cellRenderer='effectiveDateRenderer' filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
                    {((!isSimulation && !props.isMasterSummaryDrawer) || (isRfq && props?.isMasterSummaryDrawer)) && <AgGridColumn width={160} field="RawMaterialId" cellClass="ag-grid-action-container" pinned="right" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>}

                    <AgGridColumn field="VendorId" hide={true}></AgGridColumn>

                    <AgGridColumn field="TechnologyId" hide={true}></AgGridColumn>
                    {props?.isMasterSummaryDrawer && <AgGridColumn field="Attachements" headerName='Attachments' cellRenderer='attachmentFormatter'></AgGridColumn>}
                    {props?.isMasterSummaryDrawer && <AgGridColumn field="Remark" tooltipField="Remark" ></AgGridColumn>}
                  </AgGridReact >}
                  <div className={`button-wrapper ${props?.isMasterSummaryDrawer ? "dropdown-mt-0" : ""}`}>
                    {<PaginationWrappers gridApi={gridApi} globalTakes={globalTakes} totalRecordCount={totalRecordCount} getDataList={getDataList} floatingFilterData={floatingFilterData} module="RM" />}
                    {(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) &&
                      <PaginationControls totalRecordCount={totalRecordCount} getDataList={getDataList} floatingFilterData={floatingFilterData} module="RM" />                      // <div className="d-flex pagination-button-container">
                    }
                  </div>
                </div >
              </div >
            </Col >
          </Row >
          {
            props.isSimulation && isFromVerifyPage && <Row>
              <Col md="12" className="d-flex justify-content-end align-items-center">
                {disableEdit && <WarningMessage dClass="mr-5" message={"Please check the Raw Material that you want to edit."} />}
                <button type="button" className={"apply"} disabled={disableEdit} onClick={editSelectedData}> <div className={'edit-icon'}></div>Edit</button>
              </Col>
            </Row>
          }
        </>
      }
      {
        isBulkUpload && (
          <BulkUpload
            isOpen={isBulkUpload}
            closeDrawer={closeBulkUploadDrawer}
            isEditFlag={false}
            densityAlert={densityAlert}
            fileName={"RM Import"}
            isZBCVBCTemplate={true}
            messageLabel={"RM Import"}
            anchor={"right"}
            masterId={RM_MASTER_ID}
            typeOfEntryId={ENTRY_TYPE_IMPORT}
          />
        )
      }

      {
        analyticsDrawer &&
        <AnalyticsDrawer
          isOpen={analyticsDrawer}
          ModeId={1}
          closeDrawer={closeAnalyticsDrawer}
          anchor={"right"}
          isReport={analyticsDrawer}
          importEntry={true}
          selectedRowData={selectedRowData}
          isSimulation={true}
          //cellValue={cellValue}
          rowData={selectedRowData}
          import={true}
        />
      }
      {
        attachment && (
          <Attachament
            isOpen={attachment}
            index={viewAttachment}
            closeDrawer={closeAttachmentDrawer}
            anchor={'right'}
            gridListing={true}
          />
        )
      }
      {
        showPopup && <PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.RAW_MATERIAL_DETAIL_DELETE_ALERT}`} />
      }
      {
        showPopupBulk && <PopupMsgWrapper isOpen={showPopupBulk} closePopUp={closePopUp} confirmPopup={onPopupConfirmBulk} message={`Recently Created Material's Density is not created, Do you want to create?`} />
      }

    </div >}
      {
        editSelectedList &&
        <RMSimulation
          isDomestic={false}
          backToSimulation={backToSimulation}
          // isbulkUpload={isbulkUpload}
          // rowCount={rowCount}
          list={tempList ? tempList : []}
          // technology={technology.label}
          // technologyId={technology.value}
          // master={master.label}
          tokenForMultiSimulation={tokenForSimulation?.length !== 0 ? [{ SimulationId: tokenForSimulation?.value }] : []}
        />
      }
      {compareDrawer &&
        <RfqMasterApprovalDrawer
          isOpen={compareDrawer}
          anchor={'right'}
          selectedRows={rowDataForCompare}
          type={'Raw Material'}
          quotationId={props.quotationId}
          closeDrawer={closeCompareDrawer}
          summaryDrawer={props?.isMasterSummaryDrawer}
        // selectedRow = {props.bopDataResponse}
        />

      }
    </div >
  );
}


export default RMImportListing;

