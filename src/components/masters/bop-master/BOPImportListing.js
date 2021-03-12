import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { required } from "../../../helper/validation";
import { searchableSelect } from "../../layout/FormInputs";
import { Loader } from '../../common/Loader';
import { CONSTANT } from '../../../helper/AllConastant';
import { getBOPImportDataList, deleteBOP, getBOPCategorySelectList, getAllVendorSelectList, } from '../actions/BoughtOutParts';
import { getPlantSelectList, } from '../../../actions/Common';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import { toastr } from 'react-redux-toastr';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import moment from 'moment';
import BulkUpload from '../../massUpload/BulkUpload';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import { costingHeadObj } from '../../../config/masterData';
import ConfirmComponent from "../../../helper/ConfirmComponent";

class BOPImportListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            tableData: [],
            isBulkUpload: false,

            costingHead: [],
            BOPCategory: [],
            plant: [],
            vendor: [],

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
        this.getDataList()
    }

    /**
    * @method getDataList
    * @description GET DATALIST OF IMPORT BOP
    */
    getDataList = (bopFor = '', CategoryId = '', vendorId = '', plantId = '',) => {
        const filterData = {
            bop_for: bopFor,
            category_id: CategoryId,
            vendor_id: vendorId,
            plant_id: plantId,
        }
        this.props.getBOPImportDataList(filterData, (res) => {
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
    editItemDetails = (Id, rowData) => {
        let data = {
            isEditFlag: true,
            Id: Id,
            IsVendor: rowData.CostingHead,
        }
        this.props.getDetails(data);
    }

    /**
    * @method deleteItem
    * @description confirm delete Raw Material details
    */
    deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDelete(Id);
            },
            onCancel: () => console.log("CANCEL: clicked"),
            component: () => <ConfirmComponent />,
        };
        return toastr.confirm(`${MESSAGES.BOP_DELETE_ALERT}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete BOP
    */
    confirmDelete = (ID) => {
        this.props.deleteBOP(ID, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.BOP_DELETE_SUCCESS);
                this.getDataList()
            }
        });
    }

    bulkToggle = () => {
        this.setState({ isBulkUpload: true })
    }

    closeBulkUploadDrawer = () => {
        this.setState({ isBulkUpload: false }, () => {
            this.getDataList()
        })
    }


    /**
    * @method handleHeadChange
    * @description called
    */
    handleHeadChange = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ costingHead: newValue, });
        } else {
            this.setState({ costingHead: [], })
        }
    };

    /**
    * @method handleCategoryChange
    * @description  used to handle BOP Category Selection
    */
    handleCategoryChange = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ BOPCategory: newValue });
        } else {
            this.setState({ BOPCategory: [], });

        }
    }

    /**
    * @method handlePlantChange
    * @description  PLANT LIST
    */
    handlePlantChange = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ plant: newValue });
        } else {
            this.setState({ plant: [], });

        }
    }

    /**
    * @method handleVendorChange
    * @description  VENDOR LIST
    */
    handleVendorChange = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ vendor: newValue });
        } else {
            this.setState({ vendor: [], });

        }
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
    buttonFormatter = (cell, row, enumObject, rowIndex) => {
        const { EditAccessibility, DeleteAccessibility } = this.props;
        return (
            <>
                {EditAccessibility && <button className="Edit mr-2" type={'button'} onClick={() => this.editItemDetails(cell, row)} />}
                {DeleteAccessibility && <button className="Delete" type={'button'} onClick={() => this.deleteItem(cell)} />}
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

    /**
    * @method effectiveDateFormatter
    * @description Renders buttons
    */
    effectiveDateFormatter = (cell, row, enumObject, rowIndex) => {
        return cell != null ? moment(cell).format('DD/MM/YYYY') : '';
    }

    renderEffectiveDate = () => {
        return <> Effective <br /> Date </>
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

    renderSerialNumber = () => {
        return <>Sr. <br />No. </>
    }

    renderCostingHead = () => {
        return <>Costing <br />Head </>
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
    renderpartAssemblyNumber = () => {
        return <> Part Assembly <br />Number </>
    }
    renderNetLandedCost = () => {
        return <> Net <br />Landed Cost </>
    }

    renderEffectiveDate = () => {
        return <>Effective <br />Date </>
    }

    /**
    * @method renderListing
    * @description Used to show type of listing
    */
    renderListing = (label) => {
        const { bopCategorySelectList, plantSelectList, vendorAllSelectList, } = this.props;
        const temp = [];

        if (label === 'costingHead') {
            return costingHeadObj;
        }

        if (label === 'BOPCategory') {
            bopCategorySelectList && bopCategorySelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }

        if (label === 'plant') {
            plantSelectList && plantSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }

        if (label === 'vendor') {
            vendorAllSelectList && vendorAllSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }

    }

    /**
    * @method filterList
    * @description Filter user listing on the basis of role and department
    */
    filterList = () => {
        const { costingHead, BOPCategory, plant, vendor } = this.state;

        const costingHeadTemp = costingHead ? costingHead.value : '';
        const categoryTemp = BOPCategory ? BOPCategory.value : '';
        const vendorTemp = vendor ? vendor.value : '';
        const plantTemp = plant ? plant.value : '';

        this.getDataList(costingHeadTemp, categoryTemp, vendorTemp, plantTemp)
    }

    /**
    * @method resetFilter
    * @description Reset user filter
    */
    resetFilter = () => {
        this.setState({
            costingHead: [],
            BOPCategory: [],
            plant: [],
            vendor: [],
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

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, AddAccessibility, BulkUploadAccessibility } = this.props;
        const { isBulkUpload } = this.state;
        const options = {
            clearSearch: true,
            noDataText: (this.props.bopImportList === undefined ? <Loader /> : <NoContentFound title={CONSTANT.EMPTY_DATA} />),
            paginationShowsTotal: this.renderPaginationShowsTotal,
            prePage: <span className="prev-page-pg"></span>, // Previous page button text
            nextPage: <span className="next-page-pg"></span>, // Next page button text
            firstPage: <span className="first-page-pg"></span>, // First page button text
            lastPage: <span className="last-page-pg"></span>,
            paginationSize: 5,
        };

        return (
            <div>
                {this.props.loading && <Loader />}
                <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
                    <Row className="pt-4 filter-row-large">
                        {this.state.shown && (
                            <Col md="12" lg="10" className="filter-block">
                                <div className="d-inline-flex justify-content-start align-items-top w100">
                                    <div className="flex-fills"><h5>{`Filter By:`}</h5></div>
                                    <div className="flex-fill">
                                        <Field
                                            name="costingHead"
                                            type="text"
                                            label=""
                                            component={searchableSelect}
                                            placeholder={'Costing Head'}
                                            isClearable={false}
                                            options={this.renderListing('costingHead')}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            validate={(this.state.costingHead == null || this.state.costingHead.length === 0) ? [required] : []}
                                            required={true}
                                            handleChangeDescription={this.handleHeadChange}
                                            valueDescription={this.state.costingHead}
                                        />
                                    </div>
                                    <div className="flex-fill">
                                        <Field
                                            name="category"
                                            type="text"
                                            label=""
                                            component={searchableSelect}
                                            placeholder={'Category'}
                                            isClearable={false}
                                            options={this.renderListing('BOPCategory')}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            validate={(this.state.BOPCategory == null || this.state.BOPCategory.length === 0) ? [required] : []}
                                            required={true}
                                            handleChangeDescription={this.handleCategoryChange}
                                            valueDescription={this.state.BOPCategory}
                                        />
                                    </div>
                                    <div className="flex-fill">
                                        <Field
                                            name="vendor"
                                            type="text"
                                            label=""
                                            component={searchableSelect}
                                            placeholder={'Vendor'}
                                            isClearable={false}
                                            options={this.renderListing('vendor')}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            validate={(this.state.vendor == null || this.state.vendor.length === 0) ? [required] : []}
                                            required={true}
                                            handleChangeDescription={this.handleVendorChange}
                                            valueDescription={this.state.vendor}
                                        />
                                    </div>
                                    <div className="flex-fill">
                                        <Field
                                            name="plant"
                                            type="text"
                                            label=""
                                            component={searchableSelect}
                                            placeholder={'Plant'}
                                            isClearable={false}
                                            options={this.renderListing('plant')}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            validate={(this.state.plant == null || this.state.plant.length === 0) ? [required] : []}
                                            required={true}
                                            handleChangeDescription={this.handlePlantChange}
                                            valueDescription={this.state.plant}
                                        />
                                    </div>

                                    <div className="flex-fill">
                                        <button
                                            type="button"
                                            //disabled={pristine || submitting}
                                            onClick={this.resetFilter}
                                            className="reset mr10"
                                        >
                                            {'Reset'}
                                        </button>

                                        <button
                                            type="button"
                                            //disabled={pristine || submitting}
                                            onClick={this.filterList}
                                            className="apply"
                                        >
                                            {'Apply'}
                                        </button>
                                    </div>
                                </div>
                            </Col>
                        )}

                        <Col md="6" lg="6" className="search-user-block mb-3">
                            <div className="d-flex justify-content-end bd-highlight w100">
                                <div>
                                    {this.state.shown ? (
                                        <button type="button" className="user-btn mr5 filter-btn-top" onClick={() => this.setState({ shown: !this.state.shown })}>
                                            <img src={require("../../../assests/images/times.png")} alt="cancel-icon.jpg" /></button>
                                    ) : (
                                            <button type="button" className="user-btn mr5" onClick={() => this.setState({ shown: !this.state.shown })}>Show Filter</button>
                                        )}
                                    {BulkUploadAccessibility && <button
                                        type="button"
                                        className={'user-btn mr5'}
                                        onClick={this.bulkToggle}>
                                        <div className={'upload'}></div>Bulk Upload</button>}
                                    {AddAccessibility && <button
                                        type="button"
                                        className={'user-btn'}
                                        onClick={this.formToggle}>
                                        <div className={'plus'}></div>ADD</button>}
                                </div>
                            </div>
                        </Col>
                    </Row>

                </form>
                <Row>
                    <Col>
                        <BootstrapTable
                            data={this.props.bopImportList}
                            striped={false}
                            hover={false}
                            bordered={false}
                            options={options}
                            search
                            // exportCSV
                            //ignoreSinglePage
                            ref={'table'}
                            pagination>
                            {/* <TableHeaderColumn dataField="" width={50} dataAlign="center" dataFormat={this.indexFormatter}>{this.renderSerialNumber()}</TableHeaderColumn> */}
                            <TableHeaderColumn width={100} dataField="IsVendor" columnTitle={true} dataAlign="left" dataSort={true} searchable={false} dataFormat={this.costingHeadFormatter}>{this.renderCostingHead()}</TableHeaderColumn>
                            <TableHeaderColumn width={110} dataField="BoughtOutPartNumber" columnTitle={true} dataAlign="left" dataSort={true} >{this.renderbopNo()}</TableHeaderColumn>
                            <TableHeaderColumn width={110} dataField="BoughtOutPartName" columnTitle={true} dataAlign="left" dataSort={true} >{this.renderbopName()}</TableHeaderColumn>
                            <TableHeaderColumn width={110} dataField="BoughtOutPartCategory" columnTitle={true} dataAlign="left" dataSort={true} >{this.renderbopCategory()}</TableHeaderColumn>
                            <TableHeaderColumn width={120} dataField="PartAssemblyNumber" columnTitle={true} dataAlign="left" searchable={false} >{this.renderpartAssemblyNumber()}</TableHeaderColumn>
                            <TableHeaderColumn width={100} dataField="UOM" searchable={false} columnTitle={true} dataAlign="left" >{'UOM'}</TableHeaderColumn>

                            <TableHeaderColumn width={110} dataField="Specification" columnTitle={true} dataAlign="left" searchable={false} >{'Specification'}</TableHeaderColumn>
                            <TableHeaderColumn width={100} dataField="Plants" columnTitle={true} dataAlign="left" dataSort={true} searchable={false} >{'Plant'}</TableHeaderColumn>
                            <TableHeaderColumn width={100} dataField="Vendor" columnTitle={true} dataAlign="left" dataSort={true} >{'Vendor'}</TableHeaderColumn>
                            <TableHeaderColumn width={100} dataField="NumberOfPieces" columnTitle={true} dataAlign="left" searchable={false}  >{'No. of Pcs'}</TableHeaderColumn>
                            <TableHeaderColumn width={100} dataField="BasicRate" columnTitle={true} dataAlign="left" searchable={false}  >{'Basic Rate'}</TableHeaderColumn>
                            <TableHeaderColumn width={120} dataField="NetLandedCost" columnTitle={true} searchable={false} dataAlign="left"  >{this.renderNetLandedCost()}</TableHeaderColumn>
                            <TableHeaderColumn width={100} columnTitle={true} dataAlign="left" searchable={false} dataSort={true} dataField="EffectiveDate" dataFormat={this.effectiveDateFormatter} >{this.renderEffectiveDate()}</TableHeaderColumn>
                            <TableHeaderColumn width={100} dataAlign="right" dataField="BoughtOutPartId" searchable={false} export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
                        </BootstrapTable>
                    </Col>
                </Row>
                {isBulkUpload && <BulkUpload
                    isOpen={isBulkUpload}
                    closeDrawer={this.closeBulkUploadDrawer}
                    isEditFlag={false}
                    fileName={'BOPImport'}
                    isZBCVBCTemplate={true}
                    messageLabel={'BOP Import'}
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
    const { bopCategorySelectList, vendorAllSelectList, bopImportList } = boughtOutparts;
    const { plantSelectList, } = comman;
    return { bopCategorySelectList, plantSelectList, vendorAllSelectList, bopImportList }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getBOPImportDataList,
    deleteBOP,
    getBOPCategorySelectList,
    getPlantSelectList,
    getAllVendorSelectList,
})(reduxForm({
    form: 'BOPImportListing',
    enableReinitialize: true,
})(BOPImportListing));