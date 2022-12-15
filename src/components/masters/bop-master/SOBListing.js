import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { checkForDecimalAndNull } from "../../../helper/validation";
import { defaultPageSize, EMPTY_DATA } from '../../../config/constants';
import { getManageBOPSOBDataList, getInitialFilterData } from '../actions/BoughtOutParts';
import NoContentFound from '../../common/NoContentFound';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import { BOP_SOBLISTING_DOWNLOAD_EXCEl } from '../../../config/masterData';
import ManageSOBDrawer from './ManageSOBDrawer';
import LoaderCustom from '../../common/LoaderCustom';
import { getConfigurationKey, searchNocontentFilter } from '../../../helper';
import { Sob } from '../../../config/constants';
import ReactExport from 'react-export-excel';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { PaginationWrapper } from '../../common/commonPagination';
import SelectRowWrapper from '../../common/SelectRowWrapper';
import DayTime from '../../common/DayTimeWrapper';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

class SOBListing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      isEditFlag: false,
      ID: '',
      tableData: [],
      shown: false,
      costingHead: [],
      BOPCategory: [],
      plant: [],
      vendor: [],
      gridApi: null,
      gridColumnApi: null,
      rowData: null,
      sideBar: { toolPanels: ['columns'] },
      showData: false,
      isLoader: false,
      selectedRowData: false,
      noData: false,
      dataCount: 0
    }
  }

  /**
  * @method componentDidMount
  * @description Called after rendering the component
  */
  componentDidMount() {
    this.getDataList()
  }

  /**
  * @method getDataList
  * @description GET DATALIST OF IMPORT BOP
  */
  getDataList = (bought_out_part_id = null, plant_id = null) => {
    const filterData = {
      bought_out_part_id: bought_out_part_id,
      plant_id: plant_id
    }
    this.setState({ isLoader: true })
    this.props.getManageBOPSOBDataList(filterData, (res) => {
      this.setState({ isLoader: false })
      if (res && res.status === 200) {
        let Data = res.data.DataList;
        this.setState({ tableData: Data })
      } else if (res && res.response && res.response.status === 412) {
        this.setState({ tableData: [] })
      } else {
        this.setState({ tableData: [] })
      }
    })
  }

  /**
  * @method editItemDetails
  * @description edit material type
  */
  editItemDetails = (Id) => {
    this.setState({
      isEditFlag: true,
      ID: Id,
      isOpen: true,
    })
  }

  /**
   * @method onFloatingFilterChanged
   * @description Filter data when user type in searching input
   */
  onFloatingFilterChanged = (value) => {
    this.props.bopSobList.length !== 0 && this.setState({ noData: searchNocontentFilter(value, this.state.noData) })
  }


  /**
  * @method renderPaginationShowsTotal
  * @description Pagination
  */
  renderPaginationShowsTotal(start, to, total) {
    return <GridTotalFormate start={start} to={to} total={total} />
  }

  /**
  * @method buttonFormatter
  * @description Renders buttons
  */
  buttonFormatter = (params) => {
    const { EditAccessibility, } = this.props;
    const cellValue = params?.valueFormatted ? params.valueFormatted : params?.value;
    return (
      <>
        {EditAccessibility && <button title='Edit' className="Edit" type={'button'} onClick={() => this.editItemDetails(cellValue)} />}
      </>
    )
  }

  /**
  * @method costingHeadFormatter
  * @description Renders Costing head
  */
  costingHeadFormatter = (cell, row, enumObject, rowIndex) => {
    return cell ? 'Vendor Based' : 'Zero Based';
  }

  renderweightnet = () => {
    return <>Weighted Net <br /> Cost (INR)</>
  }

  rendernetlandedCost = () => {
    return <>Net <br />Cost(INR)</>
  }

  renderbopNo = () => {
    return <> BOP <br /> Part No. </>
  }

  renderbopName = () => {
    return <> BOP <br /> Part Name </>
  }

  renderbopCategory = () => {
    return <> BOP <br /> Category </>
  }

  renderNoOfVendor = () => {
    return <>No. of <br />Vendors </>
  }

  costRender = (cell, cellValue, row, rowIndex) => {
    return cell !== null ? checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice) : ''
  }

  /**
  * @method renderListing
  * @description Used to show type of listing
  */


  /**
  * @method closeDrawer
  * @description Filter listing
  */
  closeDrawer = (e = '', type) => {
    this.setState({
      isOpen: false,
      isEditFlag: false,
      ID: '',
    }, () => {
      if (type === 'submit') {
        this.getDataList()
      }
    })
  }



  formToggle = () => {
    this.props.displayForm()
  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = (values) => {

  }

  // returnExcelColumn = (data = [], TempData) => {
  //   const ExcelFile = ReactExport.ExcelFile;
  //   const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
  //   const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
  //   let temp = []
  //   temp = TempData.map((item) => {
  //     if (item.CostingHead === true) {
  //       item.CostingHead = 'Vendor Based'
  //     } else if (item.CostingHead === false) {
  //       item.CostingHead = 'Zero Based'
  //     }
  //     return item
  //   })

  //   return (<ExcelSheet data={temp} name={`${Sob}`}>
  //     {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)
  //     }
  //   </ExcelSheet>);
  // }
  // renderColumn = (fileName) => {
  //   let arr = this.props.bopSobList && this.props.bopSobList.length > 0 ? this.props.bopSobList : []
  //   if (arr != []) {
  //     arr && arr.map(item => {
  //       let len = Object.keys(item).length
  //       for (let i = 0; i < len; i++) {
  //         // let s = Object.keys(item)[i]
  //         if (item.Specification === null) {
  //           item.Specification = ' '
  //         } if (item.Plants === '-') {
  //           item.Plants = ' '
  //         }
  //       }
  //     })
  //   }
  //   return this.returnExcelColumn(BOP_SOBLISTING_DOWNLOAD_EXCEl, arr)
  // }




  /**
  * @method hyphenFormatter
  */
  hyphenFormatter = (props) => {
    const cellValue = props?.value;
    return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
  }
  onGridReady = (params) => {
    this.setState({ gridApi: params.api, gridColumnApi: params.columnApi })
    params.api.paginationGoToPage(0);
  };

  onPageSizeChanged = (newPageSize) => {
    this.state.gridApi.paginationSetPageSize(Number(newPageSize));
  };

  onRowSelect = () => {
    const selectedRows = this.state.gridApi?.getSelectedRows()
    this.setState({ selectedRowData: selectedRows, dataCount: selectedRows.length })
  }

  onBtExport = () => {
    let tempArr = []
    tempArr = this.state.gridApi && this.state.gridApi?.getSelectedRows()
    tempArr = (tempArr && tempArr.length > 0) ? tempArr : (this.props.bopSobList ? this.props.bopSobList : [])
    return this.returnExcelColumn(BOP_SOBLISTING_DOWNLOAD_EXCEl, tempArr)
  };

  returnExcelColumn = (data = [], TempData) => {
    let temp = []
    temp = TempData && TempData.map((item) => {
      if (item.Specification === null) {
        item.Specification = ' '
      } if (item.Plants === '-') {
        item.Plants = ' '
      }
      return item
    })
    return (

      <ExcelSheet data={temp} name={Sob}>
        {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
      </ExcelSheet>);
  }

  onFilterTextBoxChanged(e) {
    this.state.gridApi.setQuickFilter(e.target.value);
  }

  /**
   * @method effectiveDateFormatter
   * @description Renders buttons
   */
  effectiveDateFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;

    return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '-';
  }

  resetState() {
    this.state.gridApi.deselectAll()
    gridOptions.columnApi.resetColumnState();
    gridOptions.api.setFilterModel(null);
  }

  createCustomExportCSVButton = (onClick) => {
    return (
      // <ExportCSVButton btnText='Download' onClick={() => this.handleExportCSVButtonClick(onClick)} />
      <button type="button" className={"user-btn mr5"} onClick={this.onBtExport}><div className={"download"} ></div>Download</button>
    );
  }
  commonCostFormatter = (props) => {
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cell != null ? cell : '-';
  }


  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { handleSubmit, DownloadAccessibility } = this.props;
    const { isOpen, isEditFlag, noData } = this.state;

    const isFirstColumn = (params) => {
      var displayedColumns = params.columnApi.getAllDisplayedColumns();
      var thisIsFirstColumn = displayedColumns[0] === params.column;
      return thisIsFirstColumn;
    }

    const defaultColDef = {
      resizable: true,
      filter: true,
      sortable: false,
      headerCheckboxSelectionFilteredOnly: true,
      checkboxSelection: isFirstColumn
    };

    const frameworkComponents = {
      totalValueRenderer: this.buttonFormatter,
      customNoRowsOverlay: NoContentFound,
      hyphenFormatter: this.hyphenFormatter,
      costingHeadFormatter: this.costingHeadFormatter,
      effectiveDateFormatter: this.effectiveDateFormatter,
      commonCostFormatter: this.commonCostFormatter
    };

    return (
      <div className={`ag-grid-react ${DownloadAccessibility ? "show-table-btn" : ""} min-height100vh`}>
        {this.state.isLoader && <LoaderCustom />}
        <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
          <Row className="pt-4 ">


            <Col md="6" className="search-user-block mb-3">
              <div className="d-flex justify-content-end bd-highlight w100">
                {this.state.shown ? (
                  <button type="button" className="user-btn filter-btn-top" onClick={() => this.setState({ shown: !this.state.shown })}>
                    <div className="cancel-icon-white"></div></button>
                ) : (
                  <>
                  </>
                )}
                {
                  DownloadAccessibility &&
                  <>
                    <ExcelFile filename={Sob} fileExtension={'.xls'} element={
                      <button title={`Download ${this.state.dataCount === 0 ? "All" : "(" + this.state.dataCount + ")"}`} type="button" className={'user-btn mr5'}><div className="download mr-1" ></div>
                        {`${this.state.dataCount === 0 ? "All" : "(" + this.state.dataCount + ")"}`}
                      </button>}>
                      {this.onBtExport()}
                    </ExcelFile>
                  </>
                  //   <button type="button" className={"user-btn mr5"} onClick={this.onBtExport}><div className={"download"} ></div>Download</button>
                }

                <button type="button" className="user-btn" title="Reset Grid" onClick={() => this.resetState()}>
                  <div className="refresh mr-0"></div>
                </button>

              </div>
            </Col>
          </Row>

        </form>
        <Row>
          <Col>
            <div className={`ag-grid-wrapper height-width-wrapper ${(this.props.bopSobList && this.props.bopSobList?.length <= 0) || noData ? "overlay-contain" : ""}`}>
              <div className="ag-grid-header">
                <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={'off'} onChange={(e) => this.onFilterTextBoxChanged(e)} />
              </div>
              <div className={`ag-theme-material ${this.state.isLoader && "max-loader-height"}`}>
                {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
                <AgGridReact
                  defaultColDef={defaultColDef}
                  floatingFilter={true}
                  domLayout='autoHeight'
                  // columnDefs={c}
                  rowData={this.props.bopSobList}
                  pagination={true}
                  paginationPageSize={defaultPageSize}
                  onGridReady={this.onGridReady}
                  gridOptions={gridOptions}
                  noRowsOverlayComponent={'customNoRowsOverlay'}
                  noRowsOverlayComponentParams={{
                    title: EMPTY_DATA,
                    imagClass: 'imagClass'
                  }}
                  frameworkComponents={frameworkComponents}
                  rowSelection={'multiple'}
                  onSelectionChanged={this.onRowSelect}
                  onFilterModified={this.onFloatingFilterChanged}
                  suppressRowClickSelection={true}
                >
                  {/* <AgGridColumn field="" cellRenderer={indexFormatter}>Sr. No.yy</AgGridColumn> */}
                  <AgGridColumn field="BoughtOutPartNumber" headerName="BOP Part No."></AgGridColumn>
                  <AgGridColumn field="BoughtOutPartName" headerName="BOP Part Name"></AgGridColumn>
                  <AgGridColumn field="BoughtOutPartCategory" headerName="BOP Category"></AgGridColumn>
                  <AgGridColumn field="Specification" headerName="Specification" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                  <AgGridColumn field="NoOfVendors" headerName="No. of Vendors"></AgGridColumn>
                  <AgGridColumn field="Plant" headerName="Plant (Code)"></AgGridColumn>
                  <AgGridColumn field="ShareOfBusinessPercentage" headerName="Total SOB (%)"></AgGridColumn>
                  <AgGridColumn width={205} field="WeightedNetLandedCost" headerName="Weighted Net Cost (INR)" cellRenderer={'commonCostFormatter'}></AgGridColumn>
                  <AgGridColumn field="EffectiveDate" headerName="Effective Date" cellRenderer={'effectiveDateFormatter'} filter="agDateColumnFilter"></AgGridColumn>
                  <AgGridColumn field="BoughtOutPartNumber" width={120} headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>
                </AgGridReact>
                {<PaginationWrapper gridApi={this.gridApi} setPage={this.onPageSizeChanged} />}
              </div>
            </div>

          </Col>
        </Row>
        {isOpen && <ManageSOBDrawer
          isOpen={isOpen}
          closeDrawer={this.closeDrawer}
          isEditFlag={isEditFlag}
          ID={this.state.ID}
          anchor={'right'}
        />}

      </div >
    );
  }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ boughtOutparts, comman }) {
  const { bopCategorySelectList, vendorAllSelectList, BOPVendorDataList, bopSobList } = boughtOutparts;
  const { plantSelectList, } = comman;
  return { bopCategorySelectList, plantSelectList, vendorAllSelectList, BOPVendorDataList, bopSobList }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
  getManageBOPSOBDataList,
  getInitialFilterData,
})(reduxForm({
  form: 'SOBListing',
  enableReinitialize: true,
})(SOBListing));