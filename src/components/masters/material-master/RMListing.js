import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import AddMaterialType from './AddMaterialType';
import { getMaterialTypeDataListAPI, deleteMaterialTypeAPI } from '../actions/Material';
import { defaultPageSize, EMPTY_DATA } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import Toaster from '../../common/Toaster';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import Association from './Association';
import { RmMaterial } from '../../../config/constants';
import ReactExport from 'react-export-excel';
import { RMLISTING_DOWNLOAD_EXCEl } from '../../../config/masterData';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import LoaderCustom from '../../common/LoaderCustom';
import { PaginationWrapper } from '../../common/commonPagination';
import { searchNocontentFilter } from '../../../helper';
import SelectRowWrapper from '../../common/SelectRowWrapper';

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
            showPopup: false,
            deletedId: '',
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
        this.getListData();
    }
    /**+-
    * @method getListData
    * @description Get list data
    */
    getListData = () => {
        this.setState({ isLoader: true })
        this.props.getMaterialTypeDataListAPI(res => { this.setState({ isLoader: false }) });
    }

    /**
    * @method closeDrawer
    * @description  used to cancel filter form
    */
    closeDrawer = (e = '', formData, type) => {
        this.setState({ isOpen: false }, () => {
            if (type === 'submit') {
                this.setState({ isLoader: true })
                this.getListData()
            }
        })
    }
    /**
       * @method onFloatingFilterChanged
       * @description Filter data when user type in searching input
       */
    onFloatingFilterChanged = (value) => {
        this.props.rawMaterialTypeDataList.length !== 0 && this.setState({ noData: searchNocontentFilter(value, this.state.noData) })
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
        this.setState({ showPopup: true, deletedId: Id })
    }

    /**
    * @method confirmDelete
    * @description confirm delete Raw Material
    */
    confirmDelete = (ID) => {
        this.props.deleteMaterialTypeAPI(ID, (res) => {
            if (res.status === 417 && res.data.Result === false) {
                Toaster.error(res.data.Message)
            } else if (res && res.data && res.data.Result === true) {
                Toaster.success(MESSAGES.DELETE_MATERIAL_SUCCESS);
                this.getListData();
            }
        });
        this.setState({ showPopup: false })
    }
    onPopupConfirm = () => {
        this.confirmDelete(this.state.deletedId);
    }
    closePopUp = () => {
        this.setState({ showPopup: false })
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
                {EditAccessibility && <button title='Edit' className="Edit mr-2" type={'button'} onClick={() => this.editItemDetails(cellValue, rowData)} />}
                {DeleteAccessibility && <button title='Delete' className="Delete" type={'button'} onClick={() => this.deleteItem(cellValue)} />}
            </>
        )
    };

    /**
    * @method hyphenFormatter
    */
    hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
    }

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
        this.state.gridApi.paginationSetPageSize(Number(newPageSize));
    };
    onRowSelect = () => {
        const selectedRows = this.state.gridApi?.getSelectedRows()
        this.setState({ selectedRowData: selectedRows, dataCount: selectedRows.length })
    }

    onBtExport = () => {
        let tempArr = []
        tempArr = this.state.gridApi && this.state.gridApi?.getSelectedRows()
        tempArr = (tempArr && tempArr.length > 0) ? tempArr : (this.props.rawMaterialTypeDataList ? this.props.rawMaterialTypeDataList : [])
        return this.returnExcelColumn(RMLISTING_DOWNLOAD_EXCEl, tempArr)
    };

    returnExcelColumn = (data = [], TempData) => {
        let temp = []
        temp = TempData && TempData.map((item) => {
            if (item.RMName === '-') {
                item.RMName = ' '
            } if (item.RMGrade === '-') {
                item.RMGrade = ' '
            }
            return item
        })
        return (

            <ExcelSheet data={temp} name={RmMaterial}>
                {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
            </ExcelSheet>);
    }

    onFilterTextBoxChanged(e) {
        this.state.gridApi.setQuickFilter(e.target.value);
    }

    resetState() {
        this.state.gridApi.deselectAll()
        gridOptions.columnApi.resetColumnState();
        gridOptions.api.setFilterModel(null);
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen, isEditFlag, ID, noData, dataCount } = this.state;
        const { AddAccessibility, DownloadAccessibility } = this.props;

        const isFirstColumn = (params) => {

            var displayedColumns = params.columnApi.getAllDisplayedColumns();
            var thisIsFirstColumn = displayedColumns[0] === params.column;
            return thisIsFirstColumn;

        }
        const defaultColDef = {
            resizable: true,
            filter: true,
            sortable: true,
            headerCheckboxSelectionFilteredOnly: true,
            checkboxSelection: isFirstColumn
        };

        const frameworkComponents = {
            totalValueRenderer: this.buttonFormatter,
            hyphenFormatter: this.hyphenFormatter,
            customNoRowsOverlay: NoContentFound
        };


        return (
            <div className={`ag-grid-react min-height100vh ${DownloadAccessibility ? "show-table-btn" : ""}`}>
                {this.state.isLoader && <LoaderCustom />}
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
                                <>
                                    <ExcelFile filename={'RmMaterial'} fileExtension={'.xls'} element={
                                        <button title="Download" type="button" className={'user-btn mr5'} ><div className="download mr-0"></div></button>}>
                                        {this.onBtExport()}
                                    </ExcelFile>
                                </>
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
                        <div className={`ag-grid-wrapper height-width-wrapper ${(this.props.rawMaterialTypeDataList && this.props.rawMaterialTypeDataList?.length <= 0) || noData ? "overlay-contain" : ""}`}>
                            <div className="ag-grid-header">
                                <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" onChange={(e) => this.onFilterTextBoxChanged(e)} />
                                <SelectRowWrapper dataCount={dataCount} />
                            </div>
                            <div className={`ag-theme-material ${this.state.isLoader && "max-loader-height"}`}>
                                {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
                                <AgGridReact
                                    defaultColDef={defaultColDef}
                                    floatingFilter={true}
                                    domLayout='autoHeight'
                                    // columnDefs={c}
                                    rowData={this.props.rawMaterialTypeDataList}
                                    pagination={true}
                                    paginationPageSize={defaultPageSize}
                                    onGridReady={this.onGridReady}
                                    gridOptions={gridOptions}
                                    // loadingOverlayComponent={'customLoadingOverlay'}
                                    noRowsOverlayComponent={'customNoRowsOverlay'}
                                    noRowsOverlayComponentParams={{
                                        title: EMPTY_DATA,
                                        imagClass: 'imagClass'
                                    }}
                                    rowSelection={'multiple'}
                                    frameworkComponents={frameworkComponents}
                                    onSelectionChanged={this.onRowSelect}
                                    onFilterModified={this.onFloatingFilterChanged}
                                >
                                    {/* <AgGridColumn field="" cellRenderer={indexFormatter}>Sr. No.yy</AgGridColumn> */}
                                    <AgGridColumn field="RawMaterial" headerName="Material"></AgGridColumn>
                                    <AgGridColumn field="Density"></AgGridColumn>
                                    <AgGridColumn field="RMName" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                    <AgGridColumn field="RMGrade" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                    <AgGridColumn field="MaterialId" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>
                                </AgGridReact>
                                {<PaginationWrapper gridApi={this.gridApi} setPage={this.onPageSizeChanged} />}
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
                {
                    this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.MATERIAL1_DELETE_ALERT}`} />
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

