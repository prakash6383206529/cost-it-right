import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { required } from "../../../../helper/validation";
import { searchableSelect } from "../../../layout/FormInputs";
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import { getFreightDataList, deleteFright, } from '../../../../actions/master/Freight';
import { getVendorListByVendorType, } from '../../../../actions/master/Material';
import { fetchSupplierCityDataAPI } from '../../../../actions/master/Comman';
import NoContentFound from '../../../common/NoContentFound';
import { MESSAGES } from '../../../../config/message';
import { toastr } from 'react-redux-toastr';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import moment from 'moment';
import { GridTotalFormate } from '../../../common/TableGridFunctions';

class FreightListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            tableData: [],
            isBulkUpload: false,

            costingHead: [],
            destinationLocation: [],
            sourceLocation: [],
            vendor: [],
        }
    }

    /**
    * @method componentDidMount
    * @description Called after rendering the component
    */
    componentDidMount() {
        this.props.getVendorListByVendorType(true, () => { })
        this.props.fetchSupplierCityDataAPI(res => { });
        this.getDataList()
    }

    /**
    * @method getDataList
    * @description GET DETAILS OF BOP DOMESTIC
    */
    getDataList = (freight_for = '', vendor_id = '', source_city_id = '', destination_city_id = '',) => {
        const filterData = {
            freight_for: freight_for,
            vendor_id: vendor_id,
            source_city_id: source_city_id,
            destination_city_id: destination_city_id,
        }
        this.props.getFreightDataList(filterData, (res) => {
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
                this.confirmDelete(Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(`${MESSAGES.FREIGHT_DELETE_ALERT}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete Raw Material details
    */
    confirmDelete = (ID) => {
        this.props.deleteFright(ID, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_FREIGHT_SUCCESSFULLY);
                this.getDataList()
            }
        });
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
    * @method handleSourceCity
    * @description  HANDLE SOURCE CITY
    */
    handleSourceCity = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ sourceLocation: newValue });
        } else {
            this.setState({ sourceLocation: [], });

        }
    }

    /**
    * @method handleDestinationCity
    * @description  HANDLE DESTINATION CITY
    */
    handleDestinationCity = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ destinationLocation: newValue });
        } else {
            this.setState({ destinationLocation: [], });
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
                {EditAccessibility && <button className="Edit mr5" type={'button'} onClick={() => this.editItemDetails(cell, row)} />}
                {DeleteAccessibility && <button className="Delete" type={'button'} onClick={() => this.deleteItem(cell)} />}
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
        if (currentPage === 1) {
            serialNumber = rowIndex + 1;
        } else {
            serialNumber = (rowIndex + 1) + (sizePerPage * (currentPage - 1));
        }
        return serialNumber;
    }

    renderCostingHead = () => {
        return <>Costing Head </>
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

    /**
    * @method renderListing
    * @description Used to show type of listing
    */
    renderListing = (label) => {
        const { cityList, vendorListByVendorType, } = this.props;
        const temp = [];

        if (label === 'costingHead') {
            let temp = [
                { label: 'ZBC', value: 'ZBC' },
                { label: 'VBC', value: 'VBC' },
            ]
            return temp;
        }
        if (label === 'SourceLocation') {
            cityList && cityList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }

        if (label === 'DestinationLocation') {
            cityList && cityList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'vendor') {
            vendorListByVendorType && vendorListByVendorType.map(item => {
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
        const { costingHead, vendor, sourceLocation, destinationLocation } = this.state;

        const costingHeadTemp = costingHead ? costingHead.value : '';
        const vendorTemp = vendor ? vendor.value : '';
        const sourceTemp = sourceLocation ? sourceLocation.value : '';
        const destinationTemp = destinationLocation ? destinationLocation.value : '';

        this.getDataList(costingHeadTemp, vendorTemp, sourceTemp, destinationTemp,)
    }

    /**
    * @method resetFilter
    * @description Reset user filter
    */
    resetFilter = () => {
        this.setState({
            costingHead: [],
            vendor: [],
            sourceLocation: [],
            destinationLocation: [],
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
        const { handleSubmit, AddAccessibility } = this.props;

        const options = {
            clearSearch: true,
            noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
            paginationShowsTotal: this.renderPaginationShowsTotal,
            paginationSize: 5,
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
                                        placeholder={'-Costing Head-'}
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
                                        name="vendor"
                                        type="text"
                                        label=""
                                        component={searchableSelect}
                                        placeholder={'-Vendor-'}
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
                                        name="SourceLocation"
                                        type="text"
                                        label=""
                                        component={searchableSelect}
                                        placeholder={'--Source City--'}
                                        isClearable={false}
                                        options={this.renderListing('SourceLocation')}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        validate={(this.state.sourceLocation == null || this.state.sourceLocation.length === 0) ? [required] : []}
                                        required={true}
                                        handleChangeDescription={this.handleSourceCity}
                                        valueDescription={this.state.sourceLocation}
                                    />
                                </div>
                                <div className="flex-fill">
                                    <Field
                                        name="DestinationLocation"
                                        type="text"
                                        label=""
                                        component={searchableSelect}
                                        placeholder={'--Destination City--'}
                                        isClearable={false}
                                        options={this.renderListing('DestinationLocation')}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        validate={(this.state.destinationLocation == null || this.state.destinationLocation.length === 0) ? [required] : []}
                                        required={true}
                                        handleChangeDescription={this.handleDestinationCity}
                                        valueDescription={this.state.destinationLocation}
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
                            data={this.state.tableData}
                            striped={false}
                            hover={false}
                            bordered={false}
                            options={options}
                            search
                            // exportCSV
                            ignoreSinglePage
                            ref={'table'}
                            pagination>
                            {/* <TableHeaderColumn dataField="" width={50} dataAlign="center" dataFormat={this.indexFormatter}>{this.renderSerialNumber()}</TableHeaderColumn> */}
                            <TableHeaderColumn dataField="IsVendor" columnTitle={true} dataAlign="center" dataSort={true} dataFormat={this.costingHeadFormatter}>{this.renderCostingHead()}</TableHeaderColumn>
                            <TableHeaderColumn dataField="Mode" columnTitle={true} dataAlign="center" dataSort={true} >{'Mode'}</TableHeaderColumn>
                            <TableHeaderColumn dataField="VendorName" columnTitle={true} dataAlign="center" dataSort={true} >{'Vendor Name'}</TableHeaderColumn>
                            <TableHeaderColumn dataField="SourceCity" columnTitle={true} dataAlign="center" dataSort={true} >{'Source City'}</TableHeaderColumn>
                            <TableHeaderColumn dataField="DestinationCity" columnTitle={true} dataAlign="center"  >{'Destination City'}</TableHeaderColumn>
                            <TableHeaderColumn width={100} dataField="FreightId" export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
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
function mapStateToProps({ freight, material, comman }) {
    const { } = freight;
    const { vendorListByVendorType } = material;
    const { cityList, } = comman;
    return { vendorListByVendorType, cityList }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getFreightDataList,
    deleteFright,
    getVendorListByVendorType,
    fetchSupplierCityDataAPI,
})(reduxForm({
    form: 'FreightListing',
    enableReinitialize: true,
})(FreightListing));