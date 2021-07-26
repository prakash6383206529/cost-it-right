import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import AddMaterialType from './AddMaterialType';
import { getMaterialTypeDataListAPI, deleteMaterialTypeAPI } from '../actions/Material';
import { Loader } from '../../common/Loader';
import { CONSTANT } from '../../../helper/AllConastant';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import { toastr } from 'react-redux-toastr';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import ConfirmComponent from '../../../helper/ConfirmComponent';
import { applySuperScripts } from '../../../helper';
import Association from './Association';
import { RmMaterial, RmSpecification } from '../../../config/constants';
import ReactExport from 'react-export-excel';
import { RMLISTING_DOWNLOAD_EXCEl } from '../../../config/masterData';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

class RMListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            ID: '',
            isOpenAssociation: false,
            gridApi: null,
            gridColumnApi: null,
            rowData: null,

        }
    }

    /**
   * @method componentDidMount
   * @description Called after rendering the component
   */
    componentDidMount() {
        this.getListData();
    }

    /**
    * @method getListData
    * @description Get list data
    */
    getListData = () => {
        this.props.getMaterialTypeDataListAPI(res => { });
    }

    /**
    * @method closeDrawer
    * @description  used to cancel filter form
    */
    closeDrawer = (e = '') => {
        this.setState({ isOpen: false }, () => {
            this.getListData()
        })
    }


    /**
  * @method closeDrawer
  * @description  used to cancel filter form
  */
    closeAssociationDrawer = (e = '') => {
        this.setState({ isOpenAssociation: false }, () => {
            this.getListData()
        })
    }

    /**
    * @method editItemDetails
    * @description edit Raw Material
    */
    editItemDetails = (Id) => {
        this.setState({
            isEditFlag: true,
            isOpen: true,
            ID: Id,
        })
    }

    /**
    * @method deleteItem
    * @description confirm delete Raw Material
    */
    deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDelete(Id)
            },
            onCancel: () => { },
            component: () => <ConfirmComponent />
        };
        return toastr.confirm(`${MESSAGES.MATERIAL1_DELETE_ALERT}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete Raw Material
    */
    confirmDelete = (ID) => {
        this.props.deleteMaterialTypeAPI(ID, (res) => {
            if (res.status === 417 && res.data.Result === false) {
                toastr.warning(res.data.Message)
            } else if (res && res.data && res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_MATERIAL_SUCCESS);
                this.getListData();
            }
        });
    }

    /**
   * @method openModel
   * @description  used to open filter form 
   */
    openModel = () => {
        this.setState({
            isOpen: true,
            isEditFlag: false
        })
    }

    openAssociationModel = () => {
        this.setState({
            isOpenAssociation: true
        })
    }

    /**
    * @method indexFormatter
    * @description Renders serial number
    */
    indexFormatter = (cell, row, enumObject, rowIndex) => {
        const { table } = this.refs;
        let currentPage = table && table.state && table.state.currPage ? table.state.currPage : '';
        let sizePerPage = table && table.state && table.state.sizePerPage ? table.state.sizePerPage : '';
        let serialNumber = '';
        if (currentPage === 1) {
            serialNumber = rowIndex + 1;
        } else {
            serialNumber = (rowIndex + 1) + (sizePerPage * (currentPage - 1));
        }
        return serialNumber;
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
    buttonFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;

        const { EditAccessibility, DeleteAccessibility } = this.props;
        return (
            <>
                {EditAccessibility && <button className="Edit mr-2" type={'button'} onClick={() => this.editItemDetails(cellValue, rowData)} />}
                {DeleteAccessibility && <button className="Delete" type={'button'} onClick={() => this.deleteItem(cellValue)} />}
            </>
        )
    };

    renderDensity = (cell, row, enumObject, rowIndex) => {

        // return applySuperScripts('Density(g/cm^3)')
        // return <>Density(g/cm)       </>
        // return <>Vendor <br />Location </>
        return (<>
            Density(g/cm<sup>3</sup>)
        </>)

    }

    onGridReady = (params) => {
        this.gridApi = params.api;
        this.gridApi.sizeColumnsToFit();
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
        console.log(this.state.gridApi, 'this.state.gridApithis.state.gridApi')
        data && data.map((item => {
            tempArr.push(item.data)
        }))

        return this.returnExcelColumn(RMLISTING_DOWNLOAD_EXCEl, tempArr)
    };

    returnExcelColumn = (data = [], TempData) => {
        let temp = []
        TempData.map((item) => {
            if (item.RMName === '-') {
                item.RMName = ' '
            } if (item.RMGrade === '-') {
                item.RMGrade = ' '
            } else {
                return false
            }
            return item
        })
        return (

            <ExcelSheet data={TempData} name={RmMaterial}>
                {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
            </ExcelSheet>);
    }

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
        const { isOpen, isEditFlag, ID } = this.state;
        const { AddAccessibility, DownloadAccessibility } = this.props;
        const options = {
            clearSearch: true,
            noDataText: (this.props.rawMaterialTypeDataList === undefined ? <Loader /> : <NoContentFound title={CONSTANT.EMPTY_DATA} />),
            paginationShowsTotal: this.renderPaginationShowsTotal,
            exportCSVBtn: this.createCustomExportCSVButton,
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
        };


        return (
            <div className={`ag-grid-react ${DownloadAccessibility ? "show-table-btn" : ""}`}>
                {this.props.loading && <Loader />}
                <Row className="pt-4 no-filter-row">
                    <Col md={6} className="text-right search-user-block pr-0">
                        {AddAccessibility && (
                            <button
                                type={"button"}
                                className={"user-btn mr5"}
                                onClick={this.openAssociationModel}
                                title="Add Association"
                            >{"A"}
                                <div className={"plus mr-0 ml5"}></div>
                            </button>
                        )}
                        {AddAccessibility && (
                            <button
                                type={"button"}
                                className={"user-btn mr5"}
                                onClick={this.openModel}
                                title="Add Material"
                            >{"M"}
                                <div className={"plus mr-0 ml5"}></div>
                            </button>
                        )}
                        {
                            DownloadAccessibility &&
                            <>
                                <ExcelFile filename={RmMaterial} fileExtension={'.xls'} element={
                                    <button title={"Download"} type="button" className={'user-btn mr5'}><div className="download mr-0"></div></button>}>
                                    {this.onBtExport()}
                                </ExcelFile>
                            </>
                            //   <button type="button" className={"user-btn mr5"} onClick={this.onBtExport}><div className={"download"} ></div>Download</button>
                        }

                        <button type="button" className="user-btn" title="Reset Grid" onClick={() => this.resetState()}>
                            <div className="refresh mr-0"></div>
                        </button>

                    </Col>

                </Row>

                <Row>
                    <Col>
                        {/*
                        <BootstrapTable
                            data={this.props.rawMaterialTypeDataList}
                            striped={false}
                            bordered={false}
                            hover={false}
                            options={options}
                            search
                            exportCSV={DownloadAccessibility}
                            csvFileName={`${RmMaterial}.csv`}
                            //ignoreSinglePage
                            ref={'table'}
                            className={'RM-table'}
                            pagination>
                            
                            <TableHeaderColumn dataField="RawMaterial" dataAlign="left" dataSort={true}>Material</TableHeaderColumn>
                            <TableHeaderColumn dataField="Density" dataAlign="center" dataSort={true}>{this.renderDensity()}</TableHeaderColumn>
                            <TableHeaderColumn dataField="RMName" dataAlign="center" dataSort={true}>{'Raw Material'}</TableHeaderColumn>
                            <TableHeaderColumn dataField="RMGrade" dataAlign="center" dataSort={true}>{'Grade'}</TableHeaderColumn>
                            <TableHeaderColumn dataField="MaterialId" searchable={false} dataAlign="right" export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>

                        </BootstrapTable> */}

                        <div className="ag-grid-wrapper" style={{ width: '100%', height: '100%' }}>
                            <div className="ag-grid-header">
                                <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" onChange={(e) => this.onFilterTextBoxChanged(e)} />
                            </div>
                            <div
                                className="ag-theme-material"
                                style={{ height: '100%', width: '100%' }}
                            >
                                <AgGridReact
                                    defaultColDef={defaultColDef}
                                    // columnDefs={c}
                                    rowData={this.props.rawMaterialTypeDataList}
                                    pagination={true}
                                    paginationPageSize={10}
                                    onGridReady={this.onGridReady}
                                    gridOptions={gridOptions}
                                    loadingOverlayComponent={'customLoadingOverlay'}
                                    noRowsOverlayComponent={'customNoRowsOverlay'}
                                    noRowsOverlayComponentParams={{
                                        title: CONSTANT.EMPTY_DATA,
                                    }}
                                    frameworkComponents={frameworkComponents}
                                >
                                    {/* <AgGridColumn field="" cellRenderer={indexFormatter}>Sr. No.yy</AgGridColumn> */}
                                    <AgGridColumn field="RawMaterial"></AgGridColumn>
                                    <AgGridColumn field="Density"></AgGridColumn>
                                    <AgGridColumn field="RMName"></AgGridColumn>
                                    <AgGridColumn field="RMGrade"></AgGridColumn>
                                    <AgGridColumn field="MaterialId" headerName="Action" cellRenderer={'totalValueRenderer'}></AgGridColumn>
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
                {isOpen && <AddMaterialType
                    isOpen={isOpen}
                    closeDrawer={this.closeDrawer}
                    isEditFlag={isEditFlag}
                    ID={ID}
                    anchor={'right'}
                />}
                {
                    this.state.isOpenAssociation && <Association
                        isOpen={this.state.isOpenAssociation}
                        closeDrawer={this.closeAssociationDrawer}
                        anchor={'right'} />
                }
            </div>
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ material }) {
    const { rawMaterialTypeDataList } = material;
    return { rawMaterialTypeDataList }
}

export default connect(
    mapStateToProps, {
    getMaterialTypeDataListAPI,
    deleteMaterialTypeAPI,
}
)(RMListing);

