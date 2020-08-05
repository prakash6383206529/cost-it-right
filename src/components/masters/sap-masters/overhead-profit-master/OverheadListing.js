import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, } from "redux-form";
import { Row, Col, Table, Button } from 'reactstrap';
import { required } from "../../../../helper/validation";
import { fetchModelTypeAPI, fetchCostingHeadsAPI, } from '../../../../actions/master/Comman';
import { getVendorListByVendorType } from '../../../../actions/master/Material';
import { getOverheadDataList, deleteOverhead, activeInactiveOverhead, } from '../../../../actions/master/OverheadProfit';
import { searchableSelect } from "../../../layout/FormInputs";
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import { convertISOToUtcDate, loggedInUserId, } from '../../../../helper';
import NoContentFound from '../../../common/NoContentFound';
import { MESSAGES } from '../../../../config/message';
import { toastr } from 'react-redux-toastr';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import Switch from "react-switch";

class OverheadListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            tableData: [],
            IsVendor: false,

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
        this.props.getVendorListByVendorType(false, () => { })
        this.props.onRef(this)
        this.getDataList(null, null, null, null)
    }

    // Get updated Table data list after any action performed.
    getUpdatedData = () => {
        this.getDataList(null, null, null, null)
    }

    getDataList = (costingHead = null, vendorName = null, overhead = null, modelType = null,) => {
        const filterData = {
            costing_head: costingHead,
            vendor_id: vendorName,
            overhead_applicability_type_id: overhead,
            model_type_id: modelType,
        }
        this.props.getOverheadDataList(filterData, (res) => {
            if (res && res.status == 200) {
                let Data = res.data.DataList;
                this.setState({ tableData: Data })
            } else if (res && res.response && res.response.status == 412) {
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
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(`${MESSAGES.OVERHEAD_DELETE_ALERT}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete
    */
    confirmDelete = (ID) => {
        this.props.deleteOverhead(ID, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_OVERHEAD_SUCCESS);
                this.getDataList(null, null, null, null)
            }
        });
    }

    /**
    * @method renderPaginationShowsTotal
    * @description Pagination
    */
    renderPaginationShowsTotal(start, to, total) {
        return (
            <p style={{ color: 'blue' }}>
                Showing {start} of {to} entries.
            </p>
        );
    }

    /**
    * @method buttonFormatter
    * @description Renders buttons
    */
    buttonFormatter = (cell, row, enumObject, rowIndex) => {
        return (
            <>
                <button className="Edit mr5" type={'button'} onClick={() => this.editItemDetails(cell, row)} />
                <button className="Delete" type={'button'} onClick={() => this.deleteItem(cell)} />
            </>
        )
    }

    /**
    * @method costingHeadFormatter
    * @description Renders Costing head
    */
    costingHeadFormatter = (cell, row, enumObject, rowIndex) => {
        return cell ? 'VBC' : 'ZBC';
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
        if (currentPage == 1) {
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

    renderVendor = () => {
        return <>Vendor <br />Name </>
    }
    renderModelType = () => {
        return <>Model <br />Type </>
    }
    renderOverheadAppli = () => {
        return <>Overhead <br />Applicability</>
    }
    renderOverheadAppliPercent = () => {
        return <>Overhead <br />Applicability (%)</>
    }
    renderOverheadCC = () => {
        return <>Overhead <br />CC (%)</>
    }
    renderOverheadRM = () => {
        return <>Overhead <br />RM (%)</>
    }
    renderOverheadBOP = () => {
        return <>Overhead <br />BOP (%)</>
    }

    /**
    * @method handleHeadChange
    * @description called
    */
    handleHeadChange = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
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
        if (newValue && newValue != '') {
            this.setState({ ModelType: newValue, });
        } else {
            this.setState({ ModelType: [], })
        }
    };

    /**
    * @method handleVendorName
    * @description called
    */
    handleVendorName = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ vendorName: newValue });
        } else {
            this.setState({ vendorName: [] })
        }
    };

    /**
    * @method handleOverheadChange
    * @description called
    */
    handleOverheadChange = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
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
        const { vendorListByVendorType, modelTypes, costingHead } = this.props;
        const temp = [];

        if (label === 'costingHead') {
            let tempObj = [
                { label: 'ZBC', value: 'ZBC' },
                { label: 'VBC', value: 'VBC' },
            ]
            return tempObj;
            // modelTypes && modelTypes.map(item => {
            //     if (item.Value == 0) return false;
            //     temp.push({ label: item.Text, value: item.Value })
            // });
            //return temp;
        }

        if (label === 'ModelType') {
            modelTypes && modelTypes.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }

        if (label === 'OverheadApplicability') {
            costingHead && costingHead.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }

        if (label === 'VendorNameList') {
            vendorListByVendorType && vendorListByVendorType.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
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
            Id: row.OverheadId,
            LoggedInUserId: loggedInUserId(),
            IsActive: !cell, //Status of the UOM.
        }
        this.props.activeInactiveOverhead(data, res => {
            if (res && res.data && res.data.Result) {
                if (cell == true) {
                    toastr.success(MESSAGES.OVERHEAD_INACTIVE_SUCCESSFULLY)
                } else {
                    toastr.success(MESSAGES.OVERHEAD_ACTIVE_SUCCESSFULLY)
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
        const vendorNameTemp = vendorName ? vendorName.value : null;
        const OverheadAppliTemp = overheadAppli ? overheadAppli.value : null;
        const ModelTypeTemp = ModelType ? ModelType.value : null;

        this.getDataList(costingHeadTemp, vendorNameTemp, OverheadAppliTemp, ModelTypeTemp)
    }

	/**
	* @method resetFilter
	* @description Reset user filter
	*/
    resetFilter = () => {
        this.setState({
            costingHead: [],
            ModelType: [],
            vendorName: [],
            overheadAppli: [],
        }, () => {
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

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit } = this.props;
        const { isEditFlag } = this.state;

        const options = {
            clearSearch: true,
            noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
            paginationShowsTotal: this.renderPaginationShowsTotal,
            paginationSize: 2,
        };

        return (
            <div>
                {this.props.loading && <Loader />}
                <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
                    <Row className="pt-30">
                        <Col md="10" className="filter-block">
                            <div className="d-inline-flex justify-content-start align-items-top w100">
                                <div className="flex-fills"><h5>{`Filter By:`}</h5></div>
                                <div className="flex-fill">
                                    <Field
                                        name="costingHead"
                                        type="text"
                                        label=""
                                        component={searchableSelect}
                                        placeholder={'---Select---'}
                                        options={this.renderListing('costingHead')}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        validate={(this.state.costingHead == null || this.state.costingHead.length == 0) ? [required] : []}
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
                                        placeholder={'-ModelType-'}
                                        options={this.renderListing('ModelType')}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        validate={(this.state.ModelType == null || this.state.ModelType.length == 0) ? [required] : []}
                                        required={true}
                                        handleChangeDescription={this.handleModelTypeChange}
                                        valueDescription={this.state.ModelType}
                                    //disabled={isEditFlag ? true : false}
                                    />
                                </div>
                                <div className="flex-fill">
                                    <Field
                                        name="vendorName"
                                        type="text"
                                        label=""
                                        component={searchableSelect}
                                        placeholder={'VendorName'}
                                        options={this.renderListing('VendorNameList')}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        validate={(this.state.vendorName == null || this.state.vendorName.length == 0) ? [required] : []}
                                        required={true}
                                        handleChangeDescription={this.handleVendorName}
                                        valueDescription={this.state.vendorName}
                                        disabled={isEditFlag ? true : false}
                                    />
                                </div>
                                <div className="flex-fill">
                                    <Field
                                        name="OverheadApplicability"
                                        type="text"
                                        label=""
                                        component={searchableSelect}
                                        placeholder={'-Overhead-'}
                                        options={this.renderListing('OverheadApplicability')}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        validate={(this.state.overheadAppli == null || this.state.overheadAppli.length == 0) ? [required] : []}
                                        required={true}
                                        handleChangeDescription={this.handleOverheadChange}
                                        valueDescription={this.state.overheadAppli}
                                    //disabled={isEditFlag ? true : false}
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
                                        className="apply mr5"
                                    >
                                        {'Apply'}
                                    </button>
                                </div>
                            </div>
                        </Col>
                        <Col md="2" className="search-user-block">
                            <div className="d-flex justify-content-end bd-highlight w100">
                                <div>
                                    {!this.props.isShowForm &&
                                        <button
                                            type="button"
                                            className={'user-btn'}
                                            onClick={this.formToggle}>
                                            <div className={'plus'}></div>ADD</button>
                                    }
                                </div>
                            </div>
                        </Col>
                    </Row>

                </form>
                <Row>
                    <Col>
                        <BootstrapTable
                            data={this.state.tableData}
                            striped={true}
                            hover={true}
                            options={options}
                            search
                            // exportCSV
                            ignoreSinglePage
                            ref={'table'}
                            pagination>
                            <TableHeaderColumn dataField="" width={50} dataAlign="center" dataFormat={this.indexFormatter}>{this.renderSerialNumber()}</TableHeaderColumn>
                            <TableHeaderColumn dataField="IsVendor" width={100} columnTitle={true} dataAlign="center" dataSort={true} dataFormat={this.costingHeadFormatter}>{this.renderCostingHead()}</TableHeaderColumn>
                            <TableHeaderColumn dataField="VendorName" width={100} columnTitle={true} dataAlign="center" >{this.renderVendor()}</TableHeaderColumn>
                            <TableHeaderColumn dataField="ModelType" width={100} columnTitle={true} dataAlign="center" >{this.renderModelType()}</TableHeaderColumn>
                            <TableHeaderColumn dataField="OverheadApplicabilityType" width={100} columnTitle={true} dataAlign="center" >{this.renderOverheadAppli()}</TableHeaderColumn>
                            <TableHeaderColumn dataField="OverheadPercentage" width={100} columnTitle={true} dataAlign="center" >{this.renderOverheadAppliPercent()}</TableHeaderColumn>
                            <TableHeaderColumn dataField="OverheadMachiningCCPercentage" width={100} columnTitle={true} dataAlign="center" >{this.renderOverheadCC()}</TableHeaderColumn>
                            <TableHeaderColumn dataField="OverheadRMPercentage" width={100} columnTitle={true} dataAlign="center" >{this.renderOverheadRM()}</TableHeaderColumn>
                            <TableHeaderColumn dataField="OverheadBOPPercentage" width={100} columnTitle={true} dataAlign="center" >{this.renderOverheadBOP()}</TableHeaderColumn>
                            <TableHeaderColumn dataField="IsActive" width={100} columnTitle={true} dataAlign="center" dataFormat={this.statusButtonFormatter}>{'Status'}</TableHeaderColumn>
                            <TableHeaderColumn width={100} dataField="RawMaterialId" export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
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
    const { comman, material, overheadProfit, } = state;

    const { modelTypes, costingHead, } = comman;

    const { vendorListByVendorType } = material;

    return { modelTypes, costingHead, vendorListByVendorType, }

}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getOverheadDataList,
    deleteOverhead,
    fetchModelTypeAPI,
    fetchCostingHeadsAPI,
    getVendorListByVendorType,
    activeInactiveOverhead,
})(reduxForm({
    form: 'OverheadListing',
    enableReinitialize: true,
})(OverheadListing));