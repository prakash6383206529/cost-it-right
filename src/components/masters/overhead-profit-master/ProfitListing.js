import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { required } from "../../../helper/validation";
import {
    getProfitDataList, deleteProfit, activeInactiveProfit, fetchModelTypeAPI,
    getVendorWithVendorCodeSelectList, getProfitVendorFilterByModelSelectList, getProfitModelFilterByVendorSelectList,
} from '../actions/OverheadProfit';
import { searchableSelect } from "../../layout/FormInputs";
import { Loader } from '../../common/Loader';
import { CONSTANT } from '../../../helper/AllConastant';
import { loggedInUserId, } from '../../../helper';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import { toastr } from 'react-redux-toastr';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import Switch from "react-switch";
import { GridTotalFormate } from '../../common/TableGridFunctions';
import { costingHeadObj } from '../../../config/masterData';
import ConfirmComponent from '../../../helper/ConfirmComponent';
import { fetchCostingHeadsAPI, } from '../../../actions/Common';
import LoaderCustom from '../../common/LoaderCustom';
import moment from 'moment';
import { ProfitMaster } from '../../../config/constants';

class ProfitListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            tableData: [],
            IsVendor: false,
            shown: false,

            costingHead: [],
            ModelType: [],
            vendorName: [],
            overheadAppli: [],
        }
    }

    /**
    * @method componentDidMount
    * @description Called after rendering the component
    */
    componentDidMount() {
        this.props.fetchModelTypeAPI('--Model Types--', res => { });
        this.props.fetchCostingHeadsAPI('--Costing Heads--', res => { });
        this.props.getVendorWithVendorCodeSelectList()
        this.getDataList()
    }

    // Get updated Table data list after any action performed.
    getUpdatedData = () => {
        this.getDataList()
    }

    getDataList = (costingHead = null, vendorName = null, overhead = null, modelType = null,) => {
        const filterData = {
            costing_head: costingHead,
            vendor_id: vendorName,
            profit_applicability_type_id: overhead,
            model_type_id: modelType,
        }
        this.props.getProfitDataList(filterData, (res) => {
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
    * @description confirm delete
    */
    deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDelete(Id)
            },
            onCancel: () => { },
            component: () => <ConfirmComponent />
        };
        return toastr.confirm(`${MESSAGES.PROFIT_DELETE_ALERT}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete
    */
    confirmDelete = (ID) => {
        this.props.deleteProfit(ID, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_PROFIT_SUCCESS);
                this.getDataList()
            }
        });
    }

    /**
    * @method renderPaginationShowsTotal
    * @description Pagination
    */
    renderPaginationShowsTotal(start, to, total) {
        return <GridTotalFormate start={start} to={to} total={total} />
    }

    /**
    * @method dashFormatter
    * @description Renders dash
    */
    dashFormatter = (cell, row, enumObject, rowIndex) => {
        return cell == null ? '-' : cell;
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
        let headText = '';
        if (cell === 'ZBC') {
            headText = 'Zero Based';
        } else if (cell === 'VBC') {
            headText = 'Vendor Based';
        } else if (cell === 'CBC') {
            headText = 'Client Based';
        }




        // if (!row.IsVendor && row.VendorName === '-' && row.ClientName === "-") {
        //     headText = 'Zero Based';
        // } else if (cell && row.VendorName !== '-') {
        //     headText = 'Vendor Based';
        // } else if ((cell || cell == null) && row.ClientName !== '-') {
        //     headText = 'Client Based';
        // } 
        return headText;
    }

    /**
  * @method effectiveDateFormatter
  * @description Renders buttons
  */
    effectiveDateFormatter = (cell, row, enumObject, rowIndex) => {
        return cell != null ? moment(cell).format('DD/MM/YYYY') : '';
    }


    renderVendor = () => {
        return <>Vendor <br />Name </>
    }
    renderClient = () => {
        return <>Client <br />Name </>
    }
    renderModelType = () => {
        return <>Model <br />Type </>
    }
    renderOverheadAppli = () => {
        return <>Profit  <br />Applicability</>
    }
    renderOverheadAppliPercent = () => {
        return <>Profit  <br />Applicability (%)</>
    }
    renderOverheadCC = () => {
        return <>Profit  <br />on CC (%)</>
    }
    renderOverheadRM = () => {
        return <>Profit  <br />on RM (%)</>
    }
    renderOverheadBOP = () => {
        return <>Profit  <br />on BOP (%)</>
    }
    renderEffectiveDate = () => {
        return <>Effective <br />Date</>
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
    * @method handleModelTypeChange
    * @description called
    */
    handleModelTypeChange = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ ModelType: newValue, }, () => {
                const { ModelType } = this.state;
                this.props.getProfitVendorFilterByModelSelectList(ModelType.value, () => { })
            });
        } else {
            this.setState({ ModelType: [], })
            this.props.getVendorWithVendorCodeSelectList()
        }
    };

    /**
    * @method handleVendorName
    * @description called
    */
    handleVendorName = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ vendorName: newValue }, () => {
                const { vendorName } = this.state;
                this.props.getProfitModelFilterByVendorSelectList(vendorName.value, () => { })
            });
        } else {
            this.setState({ vendorName: [] })
            this.props.fetchModelTypeAPI('--Model Types--', res => { });
        }
    };

    /**
    * @method handleOverheadChange
    * @description called
    */
    handleOverheadChange = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ overheadAppli: newValue });
        } else {
            this.setState({ overheadAppli: [] })
        }
    };

    /**
    * @method renderListing
    * @description Used to show type of listing
    */
    renderListing = (label) => {
        const { filterOverheadSelectList, costingHead } = this.props;
        const temp = [];

        if (label === 'costingHead') {
            return costingHeadObj;
        }

        if (label === 'ModelType') {
            filterOverheadSelectList && filterOverheadSelectList.modelTypeSelectList && filterOverheadSelectList.modelTypeSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }

        if (label === 'VendorNameList') {
            filterOverheadSelectList && filterOverheadSelectList.VendorsSelectList && filterOverheadSelectList.VendorsSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }
        if (label === 'ProfitApplicability') {
            costingHead && costingHead.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }


    }

    /**
    * @method statusButtonFormatter
    * @description Renders buttons
    */
    statusButtonFormatter = (cell, row, enumObject, rowIndex) => {
        return (
            <>
                <label htmlFor="normal-switch">
                    {/* <span>Switch with default style</span> */}
                    <Switch
                        onChange={() => this.handleChange(cell, row, enumObject, rowIndex)}
                        checked={cell}
                        background="#ff6600"
                        onColor="#4DC771"
                        onHandleColor="#ffffff"
                        id="normal-switch"
                        height={24}
                    />
                </label>
            </>
        )
    }

    handleChange = (cell, row, enumObject, rowIndex) => {
        let data = {
            Id: row.ProfitId,
            LoggedInUserId: loggedInUserId(),
            IsActive: !cell, //Status of the Profit.
        }
        this.props.activeInactiveProfit(data, res => {
            if (res && res.data && res.data.Result) {
                if (cell === true) {
                    toastr.success(MESSAGES.PROFIT_INACTIVE_SUCCESSFULLY)
                } else {
                    toastr.success(MESSAGES.PROFIT_ACTIVE_SUCCESSFULLY)
                }
                this.getDataList(null, null, null, null)
            }
        })
    }

    /**
    * @method filterList
    * @description Filter user listing on the basis of role and department
    */
    filterList = () => {
        const { costingHead, ModelType, vendorName, overheadAppli, } = this.state;
        const costingHeadTemp = costingHead ? costingHead.value : null;
        const ModelTypeTemp = ModelType ? ModelType.value : null;
        const vendorNameTemp = vendorName ? vendorName.value : null;
        const OverheadAppliTemp = overheadAppli ? overheadAppli.value : null;

        this.getDataList(costingHeadTemp, vendorNameTemp, OverheadAppliTemp, ModelTypeTemp)
    }

    /**
    * @method resetFilter
    * @description Reset filter
    */
    resetFilter = () => {
        this.setState({
            costingHead: [],
            ModelType: [],
            vendorName: [],
            overheadAppli: []
        }, () => {
            this.props.fetchModelTypeAPI('--Model Types--', res => { });
            this.props.getVendorWithVendorCodeSelectList()
            this.getDataList(null, null, null, null)
        })

    }

    formToggle = () => {
        this.props.formToggle()
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {

    }

    handleExportCSVButtonClick = (onClick) => {
        onClick();
        let products = []
        products = this.props.overheadProfitList
        return products; // must return the data which you want to be exported
    }

    createCustomExportCSVButton = (onClick) => {
        return (
            <ExportCSVButton btnText='Download' onClick={() => this.handleExportCSVButtonClick(onClick)} />
        );
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, AddAccessibility, DownloadAccessibility } = this.props;
        const { isEditFlag, } = this.state;

        const options = {
            clearSearch: true,
            noDataText: (this.props.overheadProfitList === undefined ? <LoaderCustom /> : <NoContentFound title={CONSTANT.EMPTY_DATA} />),
            paginationShowsTotal: this.renderPaginationShowsTotal,
            exportCSVBtn: this.createCustomExportCSVButton,
            prePage: <span className="prev-page-pg"></span>, // Previous page button text
            nextPage: <span className="next-page-pg"></span>, // Next page button text
            firstPage: <span className="first-page-pg"></span>, // First page button text
            lastPage: <span className="last-page-pg"></span>,

        };

        return (
            <div className={DownloadAccessibility ? "show-table-btn" : ""}>
                {/* {this.props.loading && <Loader />} */}
                <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
                    <Row className="pt-4">
                        {this.state.shown && (
                            <Col md="10" className="filter-block profit-filter-block">
                                <div className="d-inline-flex justify-content-start align-items-top w100">
                                    <div className="flex-fills">
                                        <h5>{`Filter By:`}</h5>
                                    </div>
                                    <div className="flex-fill">
                                        <Field
                                            name="costingHead"
                                            type="text"
                                            label=""
                                            component={searchableSelect}
                                            placeholder={"Costing Head"}
                                            isClearable={false}
                                            options={this.renderListing("costingHead")}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            validate={
                                                this.state.costingHead == null ||
                                                    this.state.costingHead.length === 0
                                                    ? [required]
                                                    : []
                                            }
                                            required={true}
                                            handleChangeDescription={this.handleHeadChange}
                                            valueDescription={this.state.costingHead}
                                        //disabled={isEditFlag ? true : false}
                                        />
                                    </div>
                                    <div className="flex-fill">
                                        <Field
                                            name="ModelType"
                                            type="text"
                                            label=""
                                            component={searchableSelect}
                                            placeholder={"Model Type"}
                                            isClearable={false}
                                            options={this.renderListing("ModelType")}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            validate={
                                                this.state.ModelType == null ||
                                                    this.state.ModelType.length === 0
                                                    ? [required]
                                                    : []
                                            }
                                            required={true}
                                            handleChangeDescription={this.handleModelTypeChange}
                                            valueDescription={this.state.ModelType}
                                        //disabled={isEditFlag ? true : false}
                                        />
                                    </div>
                                    <div className="flex-fill">
                                        <Field
                                            name="ProfitApplicabilityId"
                                            type="text"
                                            label=""
                                            component={searchableSelect}
                                            placeholder={"Profit Applicability"}
                                            options={this.renderListing(
                                                "ProfitApplicability"
                                            )}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            validate={
                                                this.state.overheadAppli == null ||
                                                    this.state.overheadAppli.length === 0
                                                    ? [required]
                                                    : []
                                            }
                                            required={true}
                                            handleChangeDescription={
                                                this.handleOverheadChange
                                            }
                                            valueDescription={this.state.overheadAppli}
                                        //disabled={isEditFlag ? true : false}
                                        />
                                    </div>
                                    <div className="flex-fill">
                                        <Field
                                            name="vendorName"
                                            type="text"
                                            label=""
                                            component={searchableSelect}
                                            placeholder={"Vendor Name"}
                                            isClearable={false}
                                            options={this.renderListing("VendorNameList")}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            validate={
                                                this.state.vendorName == null ||
                                                    this.state.vendorName.length === 0
                                                    ? [required]
                                                    : []
                                            }
                                            required={true}
                                            handleChangeDescription={this.handleVendorName}
                                            valueDescription={this.state.vendorName}
                                            disabled={isEditFlag ? true : false}
                                        />
                                    </div>

                                    <div className="flex-fill">
                                        <button
                                            type="button"
                                            //disabled={pristine || submitting}
                                            onClick={this.resetFilter}
                                            className="reset mr10"
                                        >
                                            {"Reset"}
                                        </button>

                                        <button
                                            type="button"
                                            //disabled={pristine || submitting}
                                            onClick={this.filterList}
                                            className="user-btn mr5"
                                        >
                                            {"Apply"}
                                        </button>
                                    </div>
                                </div>
                            </Col>
                        )}
                        <Col md="6" className="search-user-block mb-3">
                            <div className="d-flex justify-content-end bd-highlight w100">
                                <div>
                                    {this.state.shown ? (
                                        <button type="button" className="user-btn mr5 filter-btn-top" onClick={() => this.setState({ shown: !this.state.shown })}>
                                            <div className="cancel-icon-white"></div></button>
                                    ) : (
                                        <button type="button" className="user-btn mr5" onClick={() => this.setState({ shown: !this.state.shown })}>Show Filter</button>
                                    )}
                                    {AddAccessibility && (
                                        <button
                                            type="button"
                                            className={"user-btn"}
                                            onClick={this.formToggle}
                                        >
                                            <div className={"plus"}></div>ADD
                                        </button>
                                    )}
                                </div>
                            </div>
                        </Col>
                    </Row>
                </form>
                <Row>
                    <Col>
                        <BootstrapTable
                            data={this.props.overheadProfitList}
                            striped={false}
                            hover={false}
                            bordered={false}
                            options={options}
                            search
                            exportCSV={DownloadAccessibility}
                            csvFileName={`${ProfitMaster}.csv`}
                            //ignoreSinglePage
                            ref={'table'}
                            pagination>
                            {/* <TableHeaderColumn dataField="" width={50} dataAlign="center" dataFormat={this.indexFormatter}>{this.renderSerialNumber()}</TableHeaderColumn> */}
                            <TableHeaderColumn dataField="TypeOfHead" width={100} columnTitle={true} dataAlign="left" dataSort={true} dataFormat={this.costingHeadFormatter}>{this.renderCostingHead()}</TableHeaderColumn>
                            <TableHeaderColumn dataField="VendorName" width={110} columnTitle={true} dataAlign="left" >{this.renderVendor()}</TableHeaderColumn>
                            <TableHeaderColumn searchable={false} dataField="ClientName" width={110} columnTitle={true} dataAlign="left" >{this.renderClient()}</TableHeaderColumn>
                            <TableHeaderColumn dataField="ModelType" width={100} columnTitle={true} dataAlign="left" >{this.renderModelType()}</TableHeaderColumn>
                            <TableHeaderColumn dataField="ProfitApplicabilityType" width={150} columnTitle={true} dataAlign="left" >{this.renderOverheadAppli()}</TableHeaderColumn>
                            <TableHeaderColumn searchable={false} dataField="ProfitPercentage" width={150} columnTitle={true} dataAlign="left" dataFormat={this.dashFormatter}>{this.renderOverheadAppliPercent()}</TableHeaderColumn>
                            <TableHeaderColumn searchable={false} dataField="ProfitRMPercentage" width={100} columnTitle={true} dataAlign="left" dataFormat={this.dashFormatter}>{this.renderOverheadRM()}</TableHeaderColumn>
                            <TableHeaderColumn searchable={false} dataField="ProfitBOPPercentage" width={100} columnTitle={true} dataAlign="left" dataFormat={this.dashFormatter}>{this.renderOverheadBOP()}</TableHeaderColumn>
                            <TableHeaderColumn searchable={false} dataField="ProfitMachiningCCPercentage" width={100} columnTitle={true} dataAlign="left" dataFormat={this.dashFormatter}>{this.renderOverheadCC()}</TableHeaderColumn>
                            <TableHeaderColumn width={100} columnTitle={true} dataAlign="left" searchable={false} dataField="EffectiveDate" dataSort={true} dataFormat={this.effectiveDateFormatter} >{this.renderEffectiveDate()}</TableHeaderColumn>
                            {/* <TableHeaderColumn dataField="IsActive" width={100} columnTitle={true} dataAlign="center" dataFormat={this.statusButtonFormatter}>{'Status'}</TableHeaderColumn> */}
                            <TableHeaderColumn dataAlign="right" width={100} searchable={false} dataField="ProfitId" export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
                        </BootstrapTable>
                    </Col>
                </Row>
            </div >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps(state) {
    const { overheadProfit, comman } = state;

    const { filterOverheadSelectList, overheadProfitList } = overheadProfit;

    const { costingHead } = comman;

    return { filterOverheadSelectList, overheadProfitList, costingHead }

}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getProfitDataList,
    deleteProfit,
    activeInactiveProfit,
    fetchModelTypeAPI,
    getVendorWithVendorCodeSelectList,
    getProfitVendorFilterByModelSelectList,
    getProfitModelFilterByVendorSelectList,
    fetchCostingHeadsAPI
})(reduxForm({
    form: 'ProfitListing',
    enableReinitialize: true,
})(ProfitListing));