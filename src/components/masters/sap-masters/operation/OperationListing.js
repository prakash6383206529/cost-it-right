import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Button, Table } from 'reactstrap';
import { focusOnError, searchableSelect } from "../../../layout/FormInputs";
import { required } from "../../../../helper/validation";
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import NoContentFound from '../../../common/NoContentFound';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { getOperationsDataList, deleteOperationAPI, getOperationSelectList, } from '../../../../actions/master/OtherOperation';
import {
    getTechnologySelectList, getPlantSelectList, getPlantBySupplier,
    getUOMSelectList,
} from '../../../../actions/master/Comman';
import { getVendorListByVendorType, } from '../../../../actions/master/Material';
import Switch from "react-switch";
import { loggedInUserId } from '../../../../helper/auth';

function enumFormatter(cell, row, enumObject) {
    return enumObject[cell];
}

class OperationListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditFlag: false,
            isOpen: false,
            tableData: [],

            costingHead: [],
            selectedTechnology: [],
            vendorName: [],
            operationName: [],
        }
    }

    /**
    * @method componentWillMount
    * @description called before render the component
    */
    componentWillMount() {

    }

    componentDidMount() {
        this.props.getTechnologySelectList(() => { })
        this.props.getOperationSelectList(() => { })
        this.getTableListData(null, null, null, null)
        this.props.onRef(this)
    }

    // Get updated Supplier's list after any action performed.
    getUpdatedData = () => {
        this.getTableListData(null, null, null, null)
    }

	/**
	* @method getTableListData
	* @description Get user list data
	*/
    getTableListData = (operation_for = null, operation_Name_id = null, technology_id = null, vendor_id = null) => {
        let filterData = {
            operation_for: operation_for,
            operation_Name_id: operation_Name_id,
            technology_id: technology_id,
            vendor_id: vendor_id,
        }
        this.props.getOperationsDataList(filterData, res => {
            if (res.status == 204 && res.data == '') {
                this.setState({ tableData: [], })
            } else if (res && res.data && res.data.DataList) {
                let Data = res.data.DataList;
                this.setState({
                    tableData: Data,
                })
            } else {

            }
        });
    }

	/**
    * @method renderListing
    * @description Used show listing of unit of measurement
    */
    renderListing = (label) => {
        const { technologySelectList, vendorListByVendorType, operationSelectList } = this.props;
        const temp = [];

        if (label === 'technology') {
            technologySelectList && technologySelectList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'costingHead') {
            let tempObj = [
                { label: 'ZBC', value: 'ZBC' },
                { label: 'VBC', value: 'VBC' },
            ]
            return tempObj;
        }
        if (label === 'OperationNameList') {
            operationSelectList && operationSelectList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'VendorList') {
            vendorListByVendorType && vendorListByVendorType.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
    }

	/**
	* @method editItemDetails
	* @description confirm edit item
	*/
    editItemDetails = (Id) => {
        let requestData = {
            isEditFlag: true,
            ID: Id,
        }
        this.props.getDetail(requestData)
    }

	/**
	* @method deleteItem
	* @description confirm delete Item.
	*/
    deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDeleteItem(Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(MESSAGES.OPERATION_DELETE_ALERT, toastrConfirmOptions);
    }

	/**
	* @method confirmDeleteItem
	* @description confirm delete item
	*/
    confirmDeleteItem = (ID) => {
        this.props.deleteOperationAPI(ID, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_OPERATION_SUCCESS);
                this.getTableListData(null, null, null, null)
            }
        });
    }

	/**
	* @method buttonFormatter
	* @description Renders buttons
	*/
    buttonFormatter = (cell, row, enumObject, rowIndex) => {
        return (
            <>
                <button className="Edit mr5" type={'button'} onClick={() => this.editItemDetails(cell)} />
                <button className="Delete" type={'button'} onClick={() => this.deleteItem(cell)} />
            </>
        )
    }

    handleChange = (cell, row, enumObject, rowIndex) => {
        let data = {
            Id: row.VendorId,
            ModifiedBy: loggedInUserId(),
            IsActive: !cell, //Status of the user.
        }
        // this.props.activeInactiveVendorStatus(data, res => {
        //     if (res && res.data && res.data.Result) {
        //         if (cell == true) {
        //             toastr.success(MESSAGES.VENDOR_INACTIVE_SUCCESSFULLY)
        //         } else {
        //             toastr.success(MESSAGES.VENDOR_ACTIVE_SUCCESSFULLY)
        //         }
        //         this.getTableListData(null, null, null, null)
        //     }
        // })
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
    * @method handleTechnology
    * @description called
    */
    handleTechnology = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ selectedTechnology: newValue, });
        } else {
            this.setState({ selectedTechnology: [], })
        }
    };

    /**
    * @method handleOperationName
    * @description called
    */
    handleOperationName = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ operationName: newValue });
        } else {
            this.setState({ operationName: [] })
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
    * @method handleVendorType
    * @description Used to handle vendor type
    */
    handleVendorType = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ vendorType: newValue, vendorName: [], });
        } else {
            this.setState({ vendorType: [], vendorName: [] })
        }
    };


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
                        offColor="#FC5774"
                        id="normal-switch"
                        height={24}
                    />
                </label>
            </>
        )
    }


	/**
	* @method indexFormatter
	* @description Renders serial number
	*/
    indexFormatter = (cell, row, enumObject, rowIndex) => {
        let currentPage = this.refs.table.state.currPage;
        let sizePerPage = this.refs.table.state.sizePerPage;
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
    renderOperationName = () => {
        return <>Operation <br />Name </>
    }
    renderOperationCode = () => {
        return <>Operation <br />Code </>
    }
    renderVendorName = () => {
        return <>Vendor <br />Name </>
    }

    /**
    * @method costingHeadFormatter
    * @description Renders Costing head
    */
    costingHeadFormatter = (cell, row, enumObject, rowIndex) => {
        return cell ? 'VBC' : 'ZBC';
    }

    onExportToCSV = (row) => {
        console.log('row', row)
        // ...
        return this.state.userData; // must return the data which you want to be exported
    }

    renderPaginationShowsTotal(start, to, total) {
        return (
            <p style={{ color: 'blue' }}>
                Showing {start} of {to} entries.
            </p>
        );
    }

	/**
	* @method filterList
	* @description Filter user listing on the basis of role and department
	*/
    filterList = () => {
        const { costingHead, selectedTechnology, vendorName, operationName, } = this.state;
        const costingHeadTemp = costingHead ? costingHead.value : null;
        const operationNameTemp = operationName ? operationName.value : null;
        const technologyTemp = selectedTechnology ? selectedTechnology.value : null;
        const vendorNameTemp = vendorName ? vendorName.value : null;
        this.getTableListData(costingHeadTemp, operationNameTemp, technologyTemp, vendorNameTemp)
    }

	/**
	* @method resetFilter
	* @description Reset user filter
	*/
    resetFilter = () => {
        this.setState({
            costingHead: [],
            vendorName: [],
            selectedTechnology: [],
            operationName: [],
        }, () => {
            this.getTableListData(null, null, null, null)
        })
    }

    formToggle = () => {
        this.props.formToggle()
    }

	/**
	* @name onSubmit
	* @param values
	* @desc Submit the signup form values.
	* @returns {{}}
	*/
    onSubmit(values) {
    }
	/**
	* @method render
	* @description Renders the component
	*/
    render() {
        const { handleSubmit, pristine, submitting, } = this.props;
        const { isOpen, isEditFlag } = this.state;
        const options = {
            clearSearch: true,
            noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
            //exportCSVText: 'Download Excel',
            //onExportToCSV: this.onExportToCSV,
            //paginationShowsTotal: true,
            paginationShowsTotal: this.renderPaginationShowsTotal,
            paginationSize: 2,
        };

        return (
            <>
                {/* {this.props.loading && <Loader />} */}
                <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
                    <Row className="pt-30">
                        <Col md="9" className="filter-block">
                            <div className="d-inline-flex justify-content-start align-items-top w100">
                                <div className="flex-fills"><h5>{`Filter By:`}</h5></div>
                                <div className="flex-fill">
                                    <Field
                                        name="costingHead"
                                        type="text"
                                        label=""
                                        component={searchableSelect}
                                        placeholder={'-Select-'}
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
                                        name="technology"
                                        type="text"
                                        label=""
                                        component={searchableSelect}
                                        placeholder={'-Select-'}
                                        options={this.renderListing('technology')}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        validate={(this.state.selectedTechnology == null || this.state.selectedTechnology.length == 0) ? [required] : []}
                                        required={true}
                                        handleChangeDescription={this.handleTechnology}
                                        valueDescription={this.state.selectedTechnology}
                                    //disabled={isEditFlag ? true : false}
                                    />
                                </div>
                                <div className="flex-fill">
                                    <Field
                                        name="operationName"
                                        type="text"
                                        label=""
                                        component={searchableSelect}
                                        placeholder={'-Select-'}
                                        options={this.renderListing('OperationNameList')}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        validate={(this.state.operationName == null || this.state.operationName.length == 0) ? [required] : []}
                                        required={true}
                                        handleChangeDescription={this.handleOperationName}
                                        valueDescription={this.state.operationName}
                                        disabled={isEditFlag ? true : false}
                                    />
                                </div>
                                <div className="flex-fill">
                                    <Field
                                        name="vendorName"
                                        type="text"
                                        label=""
                                        component={searchableSelect}
                                        placeholder={'-Select-'}
                                        options={this.renderListing('VendorList')}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        validate={(this.state.vendorName == null || this.state.vendorName.length == 0) ? [required] : []}
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
                        <Col md="3" className="search-user-block">
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
                <BootstrapTable
                    data={this.state.tableData}
                    striped={false}
                    bordered={false}
                    hover={true}
                    options={options}
                    search
                    // exportCSV
                    ignoreSinglePage
                    ref={'table'}
                    trClassName={'userlisting-row'}
                    tableHeaderClass='my-custom-header'
                    pagination>
                    <TableHeaderColumn dataField="" width={50} dataAlign="center" dataFormat={this.indexFormatter}>{this.renderSerialNumber()}</TableHeaderColumn>
                    <TableHeaderColumn dataField="CostingHead" width={100} columnTitle={true} dataAlign="center" dataSort={true} dataFormat={this.costingHeadFormatter}>{this.renderCostingHead()}</TableHeaderColumn>
                    <TableHeaderColumn dataField="Technology" width={100} columnTitle={true} dataAlign="center" >{'Technology'}</TableHeaderColumn>
                    <TableHeaderColumn dataField="OperationName" width={100} columnTitle={true} dataAlign="center" >{this.renderOperationName()}</TableHeaderColumn>
                    <TableHeaderColumn dataField="OperationCode" width={100} columnTitle={true} dataAlign="center" >{this.renderOperationCode()}</TableHeaderColumn>
                    <TableHeaderColumn dataField="Plants" width={100} columnTitle={true} dataAlign="center" >{'Plant'}</TableHeaderColumn>
                    <TableHeaderColumn dataField="VendorName" width={100} columnTitle={true} dataAlign="center" >{this.renderVendorName()}</TableHeaderColumn>
                    <TableHeaderColumn dataField="UnitOfMeasurement" width={100} columnTitle={true} dataAlign="center" >{'UOM'}</TableHeaderColumn>
                    <TableHeaderColumn dataField="Rate" width={100} columnTitle={true} dataAlign="center" >{'Rate'}</TableHeaderColumn>
                    {/* <TableHeaderColumn dataField="IsActive" width={100} columnTitle={true} dataAlign="center" dataFormat={this.statusButtonFormatter}>{'Status'}</TableHeaderColumn> */}
                    <TableHeaderColumn className="action" dataField="OperationId" export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
                </BootstrapTable>
            </ >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ comman, material, otherOperation }) {
    const { loading, technologySelectList } = comman;
    const { vendorListByVendorType } = material;
    const { operationSelectList } = otherOperation;
    return { loading, vendorListByVendorType, technologySelectList, operationSelectList };
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getTechnologySelectList,
    getOperationsDataList,
    deleteOperationAPI,
    getVendorListByVendorType,
    getOperationSelectList,
})(reduxForm({
    form: 'OperationListing',
    onSubmitFail: errors => {
        //console.log('Register errors', errors)
        focusOnError(errors);
    },
    enableReinitialize: true,
})(OperationListing));
