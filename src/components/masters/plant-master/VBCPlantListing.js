import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import { getPlantDataAPI, activeInactiveStatus, getFilteredPlantList, deletePlantAPI } from '../actions/Plant';

import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { defaultPageSize, EMPTY_DATA } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import Switch from "react-switch";
import { loggedInUserId } from '../../../helper/auth';
import AddVBCPlant from './AddVBCPlant';
import LoaderCustom from '../../common/LoaderCustom';
import { PlantVbc } from '../../../config/constants';
import ReactExport from 'react-export-excel';
import { VBCPLANT_DOWNLOAD_EXCEl } from '../../../config/masterData';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { PaginationWrapper } from '../../common/commonPagination';
import { showTitleForActiveToggle } from '../../../helper';
import SelectRowWrapper from '../../common/SelectRowWrapper';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};


const VBCPlantListing = ({ ...props }) => {
  const { EditAccessibility, DeleteAccessibility, ViewAccessibility, ActivateAccessibility, DownloadAccessibility, AddAccessibility, } = props;
  const [stateData, setStateData] = useState({
    isEditFlag: false,
    isOpenVendor: false,
    shown: false,
    ID: '',
    tableData: [],
    city: [],
    country: [],
    state: [],
    showPopup: false,
    deletedId: '',
    cellData: {},
    cellValue: '',
    showPopupToggle: false,
    isViewMode: false,
    noData: false,
    countData: 0
  });
  const dispatch = useDispatch();
  const { plantDataList, } = useSelector(state => ({

    plantDataList: state.plant.plantDataList,
  }));



  /**
  * @method getTableListData
  * @description Get user list data
  */
  useEffect(() => {
    const timer = setTimeout(() => {
      getTableListData()
    }, 300);
    // Clean up the timer when component unmounts
    return () => clearTimeout(timer);
  }, []);

  const getTableListData = () => {
    dispatch(getPlantDataAPI(true, (res) => {
      if (res && res.data && res.status === 200) {
        let Data = res.data.DataList;
        setStateData(prevState => ({ ...prevState, tableData: Data }));
      }
    }));
  }





  /**
  * @method deleteItem
  * @description confirm delete part
  */
  const deleteItem = (Id) => {
    setStateData(prevState => ({ ...prevState, showPopup: true, deletedId: Id }));
  };
  /**
  * @method confirmDeleteItem
  * @description confirm delete user item
  */
  const confirmDeleteItem = (Id) => {
    const loggedInUser = loggedInUserId();
    dispatch(deletePlantAPI(Id, loggedInUser, (res) => {
      if (res.data.Result === true) {
        Toaster.success(MESSAGES.PLANT_DELETE_SUCCESSFULLY);
        setStateData(prevState => ({ ...prevState, showPopup: false }));
        filterList()
      }
    }));
  };
  const onPopupConfirm = () => {
    confirmDeleteItem(stateData.deletedId);
  };
  const closePopUp = () => {
    setStateData(prevState => ({
      ...prevState,
      showPopup: false,
      showPopupToggle: false
    }));
  };
  const onPopupConfirmToggle = () => {
    confirmDeactivateItem(stateData.cellData, stateData.cellValue);
  };

  /**
    * @method viewOrEditItemDetails
    * @description confirm edit item
    */
  const viewOrEditItemDetails = (Id, isViewMode) => {
    setStateData(prevState => ({
      ...prevState,
      isOpenVendor: true,
      isEditFlag: true,
      ID: Id,
      isViewMode: isViewMode
    }));
  };

  /**
  * @method buttonFormatter
  * @description Renders buttons
  */

  const buttonFormatter = (cell, row) => {
    const cellValue = cell.value;
    return (
      <>
        {ViewAccessibility && <button title='View' className="View mr-2" type={'button'} onClick={() => viewOrEditItemDetails(cellValue, true)} />}
        {EditAccessibility && <button title='Edit' className="Edit mr-2" type={'button'} onClick={() => viewOrEditItemDetails(cellValue, false)} />}
        {DeleteAccessibility && <button title='Delete' className="Delete" type={'button'} onClick={() => deleteItem(cellValue)} />}
      </>
    );
  };


  const onFloatingFilterChanged = (value) => {
    if (value?.api?.rowModel?.rowsToDisplay?.length === 0) {
      setStateData(prevState => ({
        ...prevState,
        noData: true
      }));
      document.getElementsByClassName("ag-row-no-animation")[0].classList.add('no-content-image-container');
    } else {
      setStateData(prevState => ({
        ...prevState,
        noData: false
      }));
      document.getElementsByClassName("ag-row-no-animation")[0].classList.remove('no-content-image-container');
    }
  };


  const handleChange = (cell, row) => {
    let data = {
      Id: row.PlantId,
      ModifiedBy: loggedInUserId(),
      IsActive: !cell  // Status of the user.
    }
    setStateData(prevState => ({
      ...prevState,
      showPopupToggle: true,
      cellData: data,
      cellValue: cell
    }));
  };

  const confirmDeactivateItem = (data, cell) => {
    dispatch(activeInactiveStatus(data, res => {
      if (res && res.data && res.data.Result) {
        if (cell === true) {
          Toaster.success(MESSAGES.PLANT_INACTIVE_SUCCESSFULLY);
        } else {
          Toaster.success(MESSAGES.PLANT_ACTIVE_SUCCESSFULLY);
        }
        filterList(); // Assuming filterList is another function that updates the list
      }
    }));
    setStateData(prevState => ({
      ...prevState,
      showPopupToggle: false
    }));
  };

  /**
  * @method statusButtonFormatter
  * @description Renders buttons
  */


  const statusButtonFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
    showTitleForActiveToggle(props?.rowIndex, 'Active', 'Inactive');
    if (ActivateAccessibility) {
      return (
        <>
          <label htmlFor="normal-switch" className="normal-switch">
            {/* <span>Switch with default style</span> */}
            <Switch
              onChange={() => handleChange(cellValue, rowData)}
              checked={cellValue}
              background="#ff6600"
              onColor="#4DC771"
              onHandleColor="#ffffff"
              offColor="#FC5774"
              id="normal-switch"
              height={24}
              className={cellValue ? "active-switch" : "inactive-switch"}
            />
          </label>
        </>
      )
    } else {
      return cellValue ? <div className={'Activated'}> {'Active'}</div> : <div className={'Deactivated'}>{'Deactive'}</div>;
    }
  };


  /**
  * @method filterList
  * @description Filter user listing on the basis of role and department
  */
  const filterList = () => {
    const { country, state, city } = stateData;

    // Set isLoader to true before initiating the filter operation
    setStateData(prevState => ({ ...prevState, isLoader: true }));

    let filterData = {
      country: country ? country.value : '',
      state: state ? state.value : '',
      city: city ? city.value : '',
      is_vendor: true
    };

    dispatch(getFilteredPlantList(filterData, (res) => {
      // Handle the response from the filtering action
      if (res.status === 204 && res.data === '') {
        setStateData(prevState => ({ tableData: [], isLoader: false }));
      } else if (res && res.data && res.data.DataList) {
        let Data = res.data.DataList;
        setStateData(prevState => ({ tableData: Data, isLoader: false }));
      } else {
        // Handle any other response scenarios if needed
        setStateData(prevState => ({ tableData: [], isLoader: false }));
      }
    }));
  };




  const formToggle = () => {
    setStateData(prevState => ({ ...prevState, isOpenVendor: true, isViewMode: false }));
  };



  const closeVendorDrawer = (e = '', type) => {
    setStateData(prevState => ({ ...prevState, isOpenVendor: false, isEditFlag: false, ID: '' }));

    if (type === 'submit') {
      filterList()
      getTableListData()
    }
  };



  const onGridReady = params => {
    // gridApi = params.api;
    setStateData(prevState => ({
      ...prevState,
      gridApi: params.api,
      gridColumnApi: params.columnApi
    }));

    if (window.screen.width >= 1600) {
      params.api.sizeColumnsToFit();
    }

    params.api.paginationGoToPage(0);
  };

  const onPageSizeChanged = newPageSize => {
    if (stateData.gridApi) {
      stateData.gridApi.paginationSetPageSize(Number(newPageSize));
    }
  };
  // onBtExport = () => {
  //     let tempArr = this.props.plantDataList && this.props.plantDataList
  //     return this.returnExcelColumn(VBCPLANT_DOWNLOAD_EXCEl, tempArr)
  // };
  const onBtExport = useCallback(() => {
    if (plantDataList) {
      return returnExcelColumn(VBCPLANT_DOWNLOAD_EXCEl, plantDataList);
    }
  }, [plantDataList]);


  // onRowSelect = () => {
  //     const selectedRows = this.state.gridApi?.getSelectedRows()
  //     this.setState({ dataCount: selectedRows?.length })
  // }

  const onRowSelect = () => {
    const selectedRows = stateData.gridApi.getSelectedRows();
    setStateData(prevState => ({
      ...prevState,
      selectedRows
    }));
  };


  const returnExcelColumn = (data = [], TempData) => {
    let temp = TempData && TempData.map((item) => {
      // Clone the item to avoid mutating the original object
      let newItem = { ...item };

      // Update the IsActive property to a string value
      if (item.IsActive === true) {
        newItem.IsActive = 'Active';
      } else if (item.IsActive === false) {
        newItem.IsActive = 'In Active';
      }
      return newItem;
    });

    return (
      <ExcelSheet data={temp} name={PlantVbc}>
        {data && data.map((ele, index) => (
          <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />
        ))}
      </ExcelSheet>
    );
  };


  const onFilterTextBoxChanged = event => {
    if (stateData.gridApi) {
      stateData.gridApi.setQuickFilter(event.target.value);
    }
  };


  const resetState = () => {
    gridOptions.columnApi.resetColumnState();
    gridOptions.api.setFilterModel(null);
  }




  const defaultColDef = {
    resizable: true,
    filter: true,
    sortable: false,
  };

  const frameworkComponents = {
    totalValueRenderer: buttonFormatter,
    customLoadingOverlay: LoaderCustom,
    customNoRowsOverlay: NoContentFound,
    statusButtonFormatter: statusButtonFormatter
  };


  return (
    <div className={`ag-grid-react ${DownloadAccessibility ? "show-table-btn" : ""}`}>
      {/* {this.props.loading && <Loader />} */}
      <form noValidate>
        <Row className="pt-4">

          <Col md="6" className="search-user-block mb-3">
            <div className="d-flex justify-content-end bd-highlight w100">
              <div>

                {AddAccessibility && (
                  <button
                    type="button"
                    className={"user-btn mr5"}
                    onClick={formToggle}
                    title="Add"
                  >
                    <div className={"plus mr-0"}></div>
                  </button>
                )}
                {
                  DownloadAccessibility &&
                  <>
                    <ExcelFile filename={PlantVbc} fileExtension={'.xls'} element={<button type="button" className={'user-btn mr5'} title="Download"><div className="download mr-0"></div></button>}>
                      {onBtExport()}
                    </ExcelFile>
                  </>
                }

                <button type="button" className="user-btn" title="Reset Grid" onClick={() => resetState()}>
                  <div className="refresh mr-0"></div>
                </button>
              </div>
            </div>
          </Col>
        </Row>
      </form>
      <div className={`ag-grid-wrapper height-width-wrapper ${(plantDataList && plantDataList?.length <= 0) || stateData.noData ? "overlay-contain" : ""}`}>
        <div className="ag-grid-header">
          <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
          <SelectRowWrapper dataCount={stateData.dataCount} />
        </div>
        <div className={`ag-theme-material ${stateData.isLoader && "max-loader-height"}`}>
          {stateData.noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
          <AgGridReact
            defaultColDef={defaultColDef}
            floatingFilter={true}
            domLayout='autoHeight'
            // columnDefs={c} // Uncomment if 'c' is defined within the component
            rowData={plantDataList}
            pagination={true}
            paginationPageSize={defaultPageSize}
            onGridReady={onGridReady}
            gridOptions={gridOptions}
            loadingOverlayComponent={'customLoadingOverlay'}
            noRowsOverlayComponent={'customNoRowsOverlay'}
            onFilterModified={onFloatingFilterChanged}
            noRowsOverlayComponentParams={{
              title: EMPTY_DATA, // Assuming 'EMPTY_DATA' is defined elsewhere
              imagClass: 'imagClass'
            }}
            frameworkComponents={frameworkComponents}
            onRowSelected={onRowSelect}
          >
            <AgGridColumn field="VendorName" headerName="Vendor Name1" cellRenderer={'costingHeadFormatter'} />
            <AgGridColumn field="PlantName" headerName="Plant Name" />
            <AgGridColumn field="PlantCode" headerName="Plant Code" />
            <AgGridColumn field="CountryName" headerName="Country" />
            <AgGridColumn field="StateName" headerName="State" />
            <AgGridColumn field="CityName" headerName="City" />
            <AgGridColumn width={100} pinned="right" field="IsActive" headerName="Status" cellRenderer={'statusButtonFormatter'} />
            <AgGridColumn field="PlantId" cellClass="ag-grid-action-container" headerName="Action" type="rightAligned" width={150} cellRenderer={'totalValueRenderer'} />
          </AgGridReact>
          {<PaginationWrapper gridApi={stateData.gridApi} setPage={onPageSizeChanged} />}
        </div>
      </div>

      {stateData.isOpenVendor && <AddVBCPlant
        isOpen={stateData.isOpenVendor}
        closeDrawer={closeVendorDrawer}
        isEditFlag={stateData.isEditFlag}
        isViewMode={stateData.isViewMode}
        ID={stateData.ID}
        anchor={'right'}

      />}
      {
        stateData.showPopup && <PopupMsgWrapper isOpen={stateData.showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.PLANT_DELETE_ALERT}`} />
      }
      {
        stateData.showPopupToggle && <PopupMsgWrapper isOpen={stateData.showPopupToggle} closePopUp={closePopUp} confirmPopup={onPopupConfirmToggle} message={`${stateData.cellValue ? MESSAGES.PLANT_DEACTIVE_ALERT : MESSAGES.PLANT_ACTIVE_ALERT}`} />
      }
    </div>
  );

}

export default VBCPlantListing
