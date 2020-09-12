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
import { getVolumeDataList, deleteVolume } from '../../../../actions/master/Volume';
import { getPlantSelectList, getPlantBySupplier, } from '../../../../actions/master/Comman';
import { getVendorListByVendorType, } from '../../../../actions/master/Material';
import Switch from "react-switch";
import { loggedInUserId } from '../../../../helper/auth';
import { Years, Months } from '../../../../config/masterData';

function enumFormatter(cell, row, enumObject) {
    return enumObject[cell];
}

class VolumeListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditFlag: false,
            isOpen: false,
            tableData: [],

            costingHead: [],
            year: [],
            month: [],
            vendorName: [],
            plant: [],
        }
    }

    /**
    * @method componentWillMount
    * @description called before render the component
    */
    componentWillMount() {

    }

    componentDidMount() {
        this.props.getPlantSelectList(() => { })
        this.getTableListData(null, null, null, null, null)
        this.props.onRef(this)
    }

    // Get updated Supplier's list after any action performed.
    getUpdatedData = () => {
        this.getTableListData(null, null, null, null, null)
    }

    /**
    * @method getTableListData
    * @description Get user list data
    */
    getTableListData = (costing_head = null, year = null, month = null, vendor_id = null, plant_id = null) => {
        let filterData = {
            costing_head: costing_head,
            year: year,
            month: month,
            vendor_id: vendor_id,
            plant_id: plant_id,
        }
        this.props.getVolumeDataList(filterData, res => {
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
        const { vendorListByVendorType, plantSelectList, } = this.props;
        const temp = [];
        if (label === 'costingHead') {
            let tempObj = [
                { label: 'ZBC', value: 'ZBC' },
                { label: 'VBC', value: 'VBC' },
            ]
            return tempObj;
        }
        if (label === 'VendorList') {
            vendorListByVendorType && vendorListByVendorType.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'year') {
            Years && Years.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'month') {
            Months && Months.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'plant') {
            plantSelectList && plantSelectList.map(item => {
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
        return toastr.confirm(MESSAGES.VOLUME_DELETE_ALERT, toastrConfirmOptions);
    }

    /**
    * @method confirmDeleteItem
    * @description confirm delete item
    */
    confirmDeleteItem = (ID) => {
        this.props.deleteVolume(ID, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_VOLUME_SUCCESS);
                this.getTableListData(null, null, null, null, null)
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
                {/* <button className="Delete" type={'button'} onClick={() => this.deleteItem(cell)} /> */}
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
        //         this.getTableListData(null, null, null, null, null)
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
    * @method handleYear
    * @description called
    */
    handleYear = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ year: newValue, });
        } else {
            this.setState({ year: [], })
        }
    };

    /**
    * @method handleMonth
    * @description called
    */
    handleMonth = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ month: newValue, });
        } else {
            this.setState({ month: [], })
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
    * @method handlePlant
    * @description called
    */
    handlePlant = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ plant: newValue });
        } else {
            this.setState({ plant: [] })
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
        const { costingHead, year, month, vendorName, plant } = this.state;
        const costingHeadTemp = costingHead ? costingHead.value : null;
        const yearTemp = year ? year.value : null;
        const monthTemp = month ? month.value : null;
        const vendorNameTemp = vendorName ? vendorName.value : null;
        const plantTemp = plant ? plant.value : null;
        this.getTableListData(costingHeadTemp, yearTemp, monthTemp, vendorNameTemp, plantTemp)
    }

    /**
    * @method resetFilter
    * @description Reset user filter
    */
    resetFilter = () => {
        this.setState({
            costingHead: [],
            year: [],
            month: [],
            vendorName: [],
            plant: [],
        }, () => {
            this.getTableListData(null, null, null, null, null)
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
                        <Col md="11" className="filter-block">
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
                                        name="year"
                                        type="text"
                                        label=""
                                        component={searchableSelect}
                                        placeholder={'-Select-'}
                                        options={this.renderListing('year')}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        validate={(this.state.year == null || this.state.year.length == 0) ? [required] : []}
                                        required={true}
                                        handleChangeDescription={this.handleYear}
                                        valueDescription={this.state.year}
                                    //disabled={isEditFlag ? true : false}
                                    />
                                </div>
                                <div className="flex-fill">
                                    <Field
                                        name="month"
                                        type="text"
                                        label=""
                                        component={searchableSelect}
                                        placeholder={'-Select-'}
                                        options={this.renderListing('month')}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        validate={(this.state.month == null || this.state.month.length == 0) ? [required] : []}
                                        required={true}
                                        handleChangeDescription={this.handleMonth}
                                        valueDescription={this.state.month}
                                    //disabled={isEditFlag ? true : false}
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
                                    <Field
                                        name="plant"
                                        type="text"
                                        label=""
                                        component={searchableSelect}
                                        placeholder={'-Select-'}
                                        options={this.renderListing('plant')}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        validate={(this.state.plant == null || this.state.plant.length == 0) ? [required] : []}
                                        required={true}
                                        handleChangeDescription={this.handlePlant}
                                        valueDescription={this.state.plant}
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
                        <Col md="1" className="search-user-block">
                            <div className="d-flex justify-content-end bd-highlight">
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
                    <TableHeaderColumn dataField="Year" width={100} columnTitle={true} dataAlign="center" dataSort={true} >{'Year'}</TableHeaderColumn>
                    <TableHeaderColumn dataField="Month" width={100} columnTitle={true} dataAlign="center" dataSort={true} >{'Month'}</TableHeaderColumn>
                    <TableHeaderColumn dataField="CostingHead" columnTitle={true} dataAlign="center" dataSort={true} dataFormat={this.costingHeadFormatter}>{this.renderCostingHead()}</TableHeaderColumn>
                    <TableHeaderColumn dataField="VendorName" columnTitle={true} dataAlign="center" dataSort={true} >{'Vendor Name'}</TableHeaderColumn>
                    <TableHeaderColumn dataField="PlantCode" columnTitle={true} dataAlign="center" dataSort={true} >{'PlantCode'}</TableHeaderColumn>
                    <TableHeaderColumn dataField="PartNumber" columnTitle={true} dataAlign="center" dataSort={true} >{'Part No.'}</TableHeaderColumn>
                    <TableHeaderColumn dataField="PartName" columnTitle={true} dataAlign="center" dataSort={true} >{'Part Name'}</TableHeaderColumn>
                    <TableHeaderColumn dataField="BudgetedQuantity" columnTitle={true} dataAlign="center" dataSort={true} >{'Budgeted Quantity'}</TableHeaderColumn>
                    <TableHeaderColumn dataField="ApprovedQuantity" columnTitle={true} dataAlign="center" dataSort={true} >{'Actual Quantity '}</TableHeaderColumn>
                    {/* <TableHeaderColumn dataField="IsActive" width={100} columnTitle={true} dataAlign="center" dataFormat={this.statusButtonFormatter}>{'Status'}</TableHeaderColumn> */}
                    <TableHeaderColumn className="action" dataField="VolumeId" export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
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
function mapStateToProps({ comman, material, volume }) {
    const { loading, plantSelectList, } = comman;
    const { vendorListByVendorType } = material;
    const { } = volume;
    return { loading, vendorListByVendorType, plantSelectList, };
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getPlantSelectList,
    getVendorListByVendorType,
    getVolumeDataList,
    deleteVolume,
})(reduxForm({
    form: 'VolumeListing',
    onSubmitFail: errors => {
        focusOnError(errors);
    },
    enableReinitialize: true,
})(VolumeListing));
