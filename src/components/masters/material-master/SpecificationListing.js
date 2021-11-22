import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Row, Col, } from 'reactstrap';
import {
    getRMSpecificationDataList, deleteRMSpecificationAPI, getRMGradeSelectListByRawMaterial, getGradeSelectList, getRawMaterialNameChild,
    getRawMaterialFilterSelectList, getGradeFilterByRawMaterialSelectList, getRawMaterialFilterByGradeSelectList,
} from '../actions/Material';
import { searchableSelect } from "../../layout/FormInputs";
import { required } from "../../../helper/validation";
import { Loader } from '../../common/Loader';
import { EMPTY_DATA } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import Toaster from '../../common/Toaster';
import AddSpecification from './AddSpecification';
import BulkUpload from '../../massUpload/BulkUpload';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import ConfirmComponent from '../../../helper/ConfirmComponent';
import LoaderCustom from '../../common/LoaderCustom';
import { RmSpecification } from '../../../config/constants';
import { SPECIFICATIONLISTING_DOWNLOAD_EXCEl } from '../../../config/masterData';
import ReactExport from 'react-export-excel';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};


class SpecificationListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            shown: false,
            isEditFlag: false,
            isBulkUpload: false,
            ID: '',
            specificationData: [],
            RawMaterial: [],
            RMGrade: [],
            gridApi: null,
            gridColumnApi: null,
            rowData: null,
            showPopup:false,
            showPopup2:false,
            deletedId:''

        }
    }

    /**
   * @method componentDidMount
   * @description Called after rendering the component
   */
    componentDidMount() {
        this.props.getRawMaterialFilterSelectList(() => { })
        this.getSpecificationListData('', '');
    }

    /**
    * @method getSpecificationListData
    * @description Get user list data
    */
    getSpecificationListData = (materialId = '', gradeId = '') => {
        let data = {
            MaterialId: materialId,
            GradeId: gradeId
        }
        this.props.getRMSpecificationDataList(data, res => {
            if (res.status === 204 && res.data === '') {
                this.setState({ specificationData: [], })
            } else if (res && res.data && res.data.DataList) {
                let Data = res.data.DataList;
                this.setState({ specificationData: Data, })
            }
        });
    }

    /**
    * @method closeDrawer
    * @description  used to cancel filter form
    */
    closeDrawer = (e = '') => {
        this.setState({ isOpen: false }, () => {
            this.getSpecificationListData('', '');
        })
    }

    /**
    * @method renderListing
    * @description Used show listing of row material
    */
    renderListing = (label) => {
        const { filterRMSelectList } = this.props;
        const temp = [];

        if (label === 'material') {
            filterRMSelectList && filterRMSelectList.RawMaterials && filterRMSelectList.RawMaterials.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'grade') {
            filterRMSelectList && filterRMSelectList.Grades && filterRMSelectList.Grades.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
    }

    /**
    * @method handleGrade
    * @description  used to handle type of listing change
    */
    handleGrade = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ RMGrade: newValue }, () => {
                const { RMGrade } = this.state;
                this.props.getRawMaterialFilterByGradeSelectList(RMGrade.value, () => { })
            });
        } else {
            this.setState({ RMGrade: [], });
        }
    }

    /**
    * @method handleMaterialChange
    * @description  used to material change and get grade's
    */
    handleMaterialChange = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ RawMaterial: newValue, RMGrade: [] }, () => {
                const { RawMaterial } = this.state;
                this.props.getGradeFilterByRawMaterialSelectList(RawMaterial.value, res => { })
            });
        } else {
            this.setState({ RawMaterial: [], RMGrade: [] });
        }
    }

    /**
    * @method editItemDetails
    * @description edit RM Specification
    */
    editItemDetails = (Id) => {
        this.setState({
            isEditFlag: true,
            isOpen: true,
            ID: Id,
        })
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

    /**
    * @method deleteItem
    * @description confirm delete RM Specification
    */
    deleteItem = (Id) => {
        this.setState({showPopup:true, deletedId:Id })
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDelete(Id)
            },
            onCancel: () => { },
            component: () => <ConfirmComponent />
        };
        // return Toaster.confirm(`${MESSAGES.SPECIFICATION_DELETE_ALERT}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete RM Specification
    */
    confirmDelete = (ID) => {
        this.props.deleteRMSpecificationAPI(ID, (res) => {
            if (res.status === 417 && res.data.Result === false) {
                //Toaster.warning(res.data.Message)
                Toaster.warning('The specification is associated in the system. Please remove the association to delete')
            } else if (res && res.data && res.data.Result === true) {
                Toaster.success(MESSAGES.DELETE_SPECIFICATION_SUCCESS);
                this.getSpecificationListData('', '');
            }
            this.setState({showPopup:false})
        });
    }
    onPopupConfirm =() => {
        this.confirmDelete(this.state.deletedId);
    }
    closePopUp= () =>{
        this.setState({showPopup:false})
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

        const cellValue = props?.value;
        const rowData = props?.data;

        const { EditAccessibility, DeleteAccessibility } = this.props;
        return (
            <>
                {EditAccessibility && <button className="Edit mr-2" type={'button'} onClick={() => this.editItemDetails(cellValue, rowData)} />}
                {DeleteAccessibility && <button className="Delete" type={'button'} onClick={() => this.deleteItem(cellValue)} />}
            </>
        )
    };


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
    * @method filterList
    * @description Filter user listing on the basis of role and department
    */
    filterList = () => {
        const { RMGrade, RawMaterial } = this.state;
        const filterRM = RawMaterial ? RawMaterial.value : '';
        const filterGrade = RMGrade ? RMGrade.value : '';
        this.getSpecificationListData(filterRM, filterGrade)
    }

    /**
    * @method resetFilter
    * @description Reset user filter
    */
    resetFilter = () => {
        this.setState({
            RMGrade: [],
            RawMaterial: [],
        }, () => {
            const { RMGrade, RawMaterial } = this.state;
            const filterRM = RawMaterial ? RawMaterial.value : '';
            const filterGrade = RMGrade ? RMGrade.value : '';
            this.props.getRawMaterialFilterSelectList(() => { })
            this.getSpecificationListData(filterRM, filterGrade)
        })
    }

    bulkToggle = () => {
        this.setState({ isBulkUpload: true })
    }

    closeBulkUploadDrawer = () => {
        this.setState({ isBulkUpload: false }, () => {
            this.getSpecificationListData('', '');
        })
    }

    /**
    * @method densityAlert
    * @description confirm Redirection to Material tab.
    */
    densityAlert = () => {
        this.setState({showPopup2:true})
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDensity()
            },
            onCancel: () => { }
        };
        // return Toaster.confirm(`Recently Created Material Density is not created, Do you want to create?`, toastrConfirmOptions);
    }

    /**
    * @method confirmDensity
    * @description confirm density popup.
    */
    confirmDensity = () => {
        this.props.toggle('4')
    }
    onPopupConfirm2 =() => {
        this.confirmDensity(this.state.deletedId);
    }
    closePopUp= () =>{
        this.setState({showPopup2:false})
      }
    /**
    * @name onSubmit
    * @param values
    * @desc Submit the signup form values.
    * @returns {{}}
    */
    onSubmit(values) {
    }

    onGridReady = (params) => {
        this.gridApi = params.api;
        this.gridApi.sizeColumnsToFit();
        this.setState({ gridApi: params.api, gridColumnApi: params.columnApi });
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

        return this.returnExcelColumn(SPECIFICATIONLISTING_DOWNLOAD_EXCEl, this.props.rmSpecificationList)
    };

    returnExcelColumn = (data = [], TempData) => {
        let temp = []
        TempData && TempData.map((item) => {
            if (item.RMName === '-') {
                item.RMName = ' '
            } else if (item.RMGrade === '-') {
                item.RMGrade = ' '
            } else {
                return false
            }
            return item
        })
        return (

            <ExcelSheet data={TempData} name={RmSpecification}>
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
    hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return cellValue != null ? cellValue : '-';
    }
    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen, isEditFlag, ID, isBulkUpload, } = this.state;
        const { handleSubmit, AddAccessibility, BulkUploadAccessibility, DownloadAccessibility } = this.props;

        const options = {
            clearSearch: true,
            noDataText: (this.props.rmSpecificationList === undefined ? <LoaderCustom /> : <NoContentFound title={EMPTY_DATA} />),
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
            hyphenFormatter: this.hyphenFormatter
        };


        return (
            <div className={`ag-grid-react ${DownloadAccessibility ? "show-table-btn" : ""}`}>
                {this.props.loading && <Loader />}
                <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
                    <Row className="pt-4">

                        <Col md={6} className="text-right mb-3 search-user-block">
                            {this.state.shown ? (
                                <button type="button" className="user-btn mr5 filter-btn-top" onClick={() => this.setState({ shown: !this.state.shown })}>
                                    <div className="cancel-icon-white"></div></button>
                            ) : (
                                <>
                                </>
                            )}
                            {AddAccessibility && <button
                                type={'button'}
                                className={'user-btn mr5'}
                                title="Add"
                                onClick={this.openModel}>
                                <div className={'plus mr-0'}></div></button>}
                            {BulkUploadAccessibility && <button
                                type="button"
                                className={"user-btn mr5"}
                                onClick={this.bulkToggle}
                                title="Bulk Upload"
                            >
                                <div className={"upload mr-0"}></div>
                                {/* Bulk Upload */}
                            </button>}
                            {
                                DownloadAccessibility &&
                                <>

                                    <ExcelFile filename={RmSpecification} fileExtension={'.xls'} element={
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

                        </Col>
                    </Row>
                </form>

                <Row>
                    <Col>
                        {/* <hr /> */}
                        {/*<BootstrapTable
                            data={this.props.rmSpecificationList}
                            striped={false}
                            bordered={false}
                            hover={false}
                            options={options}
                            search
                            exportCSV={DownloadAccessibility}
                            csvFileName={`${RmSpecification}.csv`}
                            //ignoreSinglePage
                            ref={'table'}
                            pagination>
                         
                            <TableHeaderColumn dataField="RMName" dataAlign="left" dataSort={true}>Raw Material</TableHeaderColumn>
                            <TableHeaderColumn searchable={false} dataField="RMGrade" dataAlign="left" >Grade</TableHeaderColumn>
                            <TableHeaderColumn dataField="RMSpec" dataAlign="left">Specification</TableHeaderColumn>
                            <TableHeaderColumn searchable={false} dataField="SpecificationId" export={false} isKey={true} dataAlign="right" dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
                        </BootstrapTable>  */}

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
                                    domLayout='autoHeight'
                                    // columnDefs={c}
                                    floatingFilter={true}
                                    rowData={this.props.rmSpecificationList}
                                    pagination={true}
                                    paginationPageSize={10}
                                    onGridReady={this.onGridReady}
                                    gridOptions={gridOptions}
                                    loadingOverlayComponent={'customLoadingOverlay'}
                                    noRowsOverlayComponent={'customNoRowsOverlay'}
                                    noRowsOverlayComponentParams={{
                                        title: EMPTY_DATA,
                                        imagClass: 'imagClass'
                                    }}
                                    frameworkComponents={frameworkComponents}
                                >
                                    <AgGridColumn field="RMName"></AgGridColumn>
                                    <AgGridColumn field="RMGrade"></AgGridColumn>
                                    <AgGridColumn field="RMSpec"></AgGridColumn>
                                    <AgGridColumn field="RawMaterialCode" headerName='Code' cellRenderer='hyphenFormatter'></AgGridColumn>
                                    <AgGridColumn field="SpecificationId" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>
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
                {isOpen && <AddSpecification
                    isOpen={isOpen}
                    closeDrawer={this.closeDrawer}
                    isEditFlag={isEditFlag}
                    ID={ID}
                    anchor={'right'}
                    AddAccessibilityRMANDGRADE={this.props.AddAccessibilityRMANDGRADE}
                    EditAccessibilityRMANDGRADE={this.props.EditAccessibilityRMANDGRADE}
                    isRMDomesticSpec={false}
                />}
                {isBulkUpload && <BulkUpload
                    isOpen={isBulkUpload}
                    closeDrawer={this.closeBulkUploadDrawer}
                    isEditFlag={false}
                    densityAlert={this.densityAlert}
                    fileName={'RMSpecification'}
                    messageLabel={'RM Specification'}
                    anchor={'right'}
                />}
                {
            this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.SPECIFICATION_DELETE_ALERT}`}  />
         }
                {
            this.state.showPopup2 && <PopupMsgWrapper isOpen={this.state.showPopup2} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm2} message={`Recently Created Material Density is not created, Do you want to create?`}  />
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
    const { rmSpecificationDetail, filterRMSelectList, rmSpecificationList } = material;
    return { rmSpecificationDetail, filterRMSelectList, rmSpecificationList }
}

export default connect(mapStateToProps, {
    getRMSpecificationDataList,
    deleteRMSpecificationAPI,
    getRawMaterialNameChild,
    getRMGradeSelectListByRawMaterial,
    getGradeSelectList,
    getRawMaterialFilterSelectList,
    getGradeFilterByRawMaterialSelectList,
    getRawMaterialFilterByGradeSelectList,
})(reduxForm({
    form: 'SpecificationListing',
    enableReinitialize: true,
})(SpecificationListing));