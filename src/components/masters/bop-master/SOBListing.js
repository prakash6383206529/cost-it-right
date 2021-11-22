import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { checkForDecimalAndNull, required } from "../../../helper/validation";
import { searchableSelect } from "../../layout/FormInputs";
import { Loader } from '../../common/Loader';
import { EMPTY_DATA } from '../../../config/constants';
import { getManageBOPSOBDataList, getInitialFilterData, getBOPCategorySelectList, getAllVendorSelectList, } from '../actions/BoughtOutParts';
import { getPlantSelectList, } from '../../../actions/Common';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import { BOP_SOBLISTING_DOWNLOAD_EXCEl, costingHeadObj } from '../../../config/masterData';
import ManageSOBDrawer from './ManageSOBDrawer';
import LoaderCustom from '../../common/LoaderCustom';
import { getConfigurationKey } from '../../../helper';
import { Sob } from '../../../config/constants';
import ReactExport from 'react-export-excel';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';

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
      showData: false

    }
  }

  /**
  * @method componentDidMount
  * @description Called after rendering the component
  */
  componentDidMount() {
    this.props.getBOPCategorySelectList(() => { })
    this.props.getPlantSelectList(() => { })
    this.props.getAllVendorSelectList(() => { })
    // this.props.getInitialFilterData('', () => { })
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
    this.props.getManageBOPSOBDataList(filterData, (res) => {
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
  * @method handleHeadChange
  * @description called
  */


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
  buttonFormatter = (cell, row, enumObject, rowIndex) => {
    const { EditAccessibility, } = this.props;
    return (
      <>
        {EditAccessibility && <button className="Edit" type={'button'} onClick={() => this.editItemDetails(cell)} />}
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
    return <>No of <br />Vendors </>
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
  closeDrawer = (e = '') => {
    this.setState({
      isOpen: false,
      isEditFlag: false,
      ID: '',
    }, () => {
      this.getDataList()
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
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cellValue != null ? cellValue : '-';
  }

  onGridReady = (params) => {
    this.setState({ gridApi: params.api, gridColumnApi: params.columnApi })
    params.api.paginationGoToPage(0);
  };

  onPageSizeChanged = (newPageSize) => {
    var value = document.getElementById('page-size').value;
    this.state.gridApi.paginationSetPageSize(Number(value));
  };

  onBtExport = () => {
    let tempArr = []
    const data = this.state.gridApi && this.state.gridApi.getModel().rowsToDisplay
    data && data.map((item => {
      tempArr.push(item.data)
    }))

    return this.returnExcelColumn(BOP_SOBLISTING_DOWNLOAD_EXCEl, tempArr)
  };

  returnExcelColumn = (data = [], TempData) => {
    let temp = []
    TempData.map((item) => {
      if (item.Specification === null) {
        item.Specification = ' '
      } if (item.Plants === '-') {
        item.Plants = ' '
      } else {
        return false
      }
      return item
    })
    return (

      <ExcelSheet data={TempData} name={Sob}>
        {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
      </ExcelSheet>);
  }

  onFilterTextBoxChanged(e) {
    this.state.gridApi.setQuickFilter(e.target.value);
  }


  resetState() {
    gridOptions.columnApi.resetColumnState();
    gridOptions.api.setFilterModel(null);
  }

  createCustomExportCSVButton = (onClick) => {
    return (
      // <ExportCSVButton btnText='Download' onClick={() => this.handleExportCSVButtonClick(onClick)} />
      <button type="button" className={"user-btn mr5"} onClick={this.onBtExport}><div className={"download"} ></div>Download</button>
    );
  }


  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { handleSubmit, DownloadAccessibility } = this.props;
    const { isOpen, isEditFlag } = this.state;

    const onExportToCSV = (row) => {
      // ...
      let products = []
      products = this.props.bopSobList
      return products; // must return the data which you want to be exported
    }

    const options = {
      clearSearch: true,
      noDataText: (this.props.bopSobList === undefined ? <LoaderCustom /> : <NoContentFound title={EMPTY_DATA} />),
      paginationShowsTotal: this.renderPaginationShowsTotal,
      // exportCSVBtn: this.createCustomExportCSVButton,
      // onExportToCSV: this.handleExportCSVButtonClick,
      prePage: <span className="prev-page-pg"></span>, // Previous page button text
      nextPage: <span className="next-page-pg"></span>, // Next page button text
      firstPage: <span className="first-page-pg"></span>, // First page button text
      lastPage: <span className="last-page-pg"></span>,

    };

    const defaultColDef = {
      resizable: true,
      filter: true,
      sortable: true,

    };

    const frameworkComponents = {
      totalValueRenderer: this.buttonFormatter,
      customLoadingOverlay: LoaderCustom,
      customNoRowsOverlay: NoContentFound,
      hyphenFormatter: this.hyphenFormatter,
      costingHeadFormatter: this.costingHeadFormatter,
      effectiveDateFormatter: this.effectiveDateFormatter
    };

    return (
      <div className={`ag-grid-react ${DownloadAccessibility ? "show-table-btn" : ""}`}>
        {/* {this.props.loading && <Loader />} */}
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
                      <button type="button" className={'user-btn mr5'}><div className="download mr-0" title="Download"></div>
                        {/* DOWNLOAD */}
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
            {/* <BootstrapTable
              data={this.props.bopSobList}
              striped={false}
              hover={false}
              bordered={false}
              options={options}
              // exportCSV={DownloadAccessibility}
              // csvFileName={`${Sob}.csv`}
              search
              ref={'table'}
              pagination>
              <TableHeaderColumn width={100} dataField="BoughtOutPartNumber" columnTitle={true} dataAlign="left" dataSort={true} >{this.renderbopNo()}</TableHeaderColumn>
              <TableHeaderColumn width={100} dataField="BoughtOutPartName" columnTitle={true} dataAlign="left" dataSort={true} >{this.renderbopName()}</TableHeaderColumn>
              <TableHeaderColumn width={100} dataField="BoughtOutPartCategory" columnTitle={true} dataAlign="left" dataSort={true} >{this.renderbopCategory()}</TableHeaderColumn>
              <TableHeaderColumn width={110} dataField="Specification" columnTitle={true} dataAlign="left" >{'Specification'}</TableHeaderColumn>
              <TableHeaderColumn width={90} dataField="NoOfVendors" columnTitle={true} dataAlign="left" dataSort={true} >{this.renderNoOfVendor()}</TableHeaderColumn>
              <TableHeaderColumn width={90} dataField="Plant" columnTitle={true} dataAlign="left" dataSort={true} >{'Plant'}</TableHeaderColumn> */}
            {/* <TableHeaderColumn width={120} dataField="NetLandedCost" columnTitle={true} dataAlign="left" dataFormat={this.costRender} dataSort={true} >{this.rendernetlandedCost()}</TableHeaderColumn> */}
            {/* <TableHeaderColumn width={100} dataField="ShareOfBusinessPercentage" columnTitle={true} dataAlign="left"  >{'Total SOB%'}</TableHeaderColumn> */}
            {/* <TableHeaderColumn width={100} dataField="UOM" columnTitle={true} dataAlign="left"  >{'UOM'}</TableHeaderColumn> */}
            {/* <TableHeaderColumn width={140} dataField="WeightedNetLandedCost" columnTitle={true} dataAlign="left"  >{this.renderweightnet()}</TableHeaderColumn>
              <TableHeaderColumn dataAlign="right" width={80} dataField="BoughtOutPartNumber" export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
            </BootstrapTable> */}

            <div className="ag-grid-wrapper height-width-wrapper">
              <div className="ag-grid-header">
                <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" onChange={(e) => this.onFilterTextBoxChanged(e)} />
              </div>
              <div
                className="ag-theme-material"
              >
                <AgGridReact
                  defaultColDef={defaultColDef}
                  floatingFilter={true}
                  domLayout='autoHeight'
                  // columnDefs={c}
                  rowData={this.props.bopSobList}
                  pagination={true}
                  paginationPageSize={10}
                  onGridReady={this.onGridReady}
                  gridOptions={gridOptions}
                  loadingOverlayComponent={'customLoadingOverlay'}
                  noRowsOverlayComponent={'customNoRowsOverlay'}
                  noRowsOverlayComponentParams={{
                    title: EMPTY_DATA,
                  }}
                  frameworkComponents={frameworkComponents}
                >
                  {/* <AgGridColumn field="" cellRenderer={indexFormatter}>Sr. No.yy</AgGridColumn> */}
                  <AgGridColumn field="BoughtOutPartNumber" headerName="BOP Part No."></AgGridColumn>
                  <AgGridColumn field="BoughtOutPartName" headerName="BOP Part Name"></AgGridColumn>
                  <AgGridColumn field="BoughtOutPartCategory" headerName="BOP Category"></AgGridColumn>
                  <AgGridColumn field="Specification" headerName="Specification" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                  <AgGridColumn field="NoOfVendors" headerName="No of Vendors"></AgGridColumn>
                  <AgGridColumn field="Plant" headerName="Plant"></AgGridColumn>
                  <AgGridColumn field="ShareOfBusinessPercentage" headerName="Total SOB%"></AgGridColumn>
                  <AgGridColumn width={205} field="WeightedNetLandedCost" headerName="Weighted Net Cost (INR)"></AgGridColumn>
                  <AgGridColumn field="BoughtOutPartNumber" width={120} headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>
                </AgGridReact>
                <div className="paging-container d-inline-block float-right">
                  <select className="form-control paging-dropdown" onChange={(e) => this.onPageSizeChanged(e.target.value)} id="page-size">
                    <option value="10" selected={true}>10</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
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
  getBOPCategorySelectList,
  getPlantSelectList,
  getAllVendorSelectList,
  getInitialFilterData,
})(reduxForm({
  form: 'SOBListing',
  enableReinitialize: true,
})(SOBListing));