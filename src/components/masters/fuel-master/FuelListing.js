import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, } from "redux-form";
import { Row, Col, } from 'reactstrap';
import {
    getFuelDetailDataList, getFuelComboData, deleteFuelDetailAPI,
    getStateListByFuel,
    getFuelListByState,
} from '../actions/Fuel';
import { searchableSelect } from "../../layout/FormInputs";
import { Loader } from '../../common/Loader';
import { CONSTANT } from '../../../helper/AllConastant';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import { toastr } from 'react-redux-toastr';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-input-range/lib/css/index.css'
import moment from 'moment';
import BulkUpload from '../../massUpload/BulkUpload';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import LoaderCustom from '../../common/LoaderCustom';
import { checkForDecimalAndNull } from '../../../helper';

class FuelListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditFlag: false,
            tableData: [],
            isBulkUpload: false,
            fuel: [],
            StateName: [],
        }
    }

    /**
    * @method componentDidMount
    * @description Called after rendering the component
    */
    componentDidMount() {
        this.props.getFuelComboData(() => { })
        this.getDataList('', '')
    }

    getDataList = (fuelName = '', stateName = '') => {
        const filterData = {
            fuelName: fuelName,
            stateName: stateName,
        }
        this.props.getFuelDetailDataList(filterData, (res) => {
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
    * @description Edit Fuel
    */
    editItemDetails = (Id, rowData) => {
        let data = {
            isEditFlag: true,
            Id: Id,
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
            onCancel: () => { }
        };
        return toastr.confirm(`${MESSAGES.FUEL_DELETE_ALERT}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete Fuel details
    */
    confirmDelete = (ID) => {
        // this.props.deleteFuelDetailAPI(ID, (res) => {
        //     if (res.data.Result === true) {
        //         toastr.success(MESSAGES.DELETE_FUEL_DETAIL_SUCCESS);
        //         this.getDataList()
        //     }
        // });
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
        const { EditAccessibility } = this.props;
        return (
            <>
                {EditAccessibility && <button className="Edit " type={'button'} onClick={() => this.editItemDetails(cell, row)} />}
                {/* <button className="Delete" type={'button'} onClick={() => this.deleteItem(cell)} /> */}
            </>
        )
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
    costFormatter = (cell, row, enumObject, rowIndex) => {
        const { initialConfiguration } = this.props
        return cell != null ? checkForDecimalAndNull(cell,initialConfiguration.NoOfDecimalForPrice) : '';
    }
    /**
    * @method effectiveDateFormatter
    * @description Renders buttons
    */
    effectiveDateFormatter = (cell, row, enumObject, rowIndex) => {
        return cell != null ? moment(cell).format('DD/MM/YYYY') : '';
    }

    renderEffectiveDate = () => {
        return <>Effective Date</>
    }

    /**
    * @method renderListing
    * @description Used to show type of listing
    */
    renderListing = (label) => {
        const { fuelComboSelectList } = this.props;
        const temp = [];
        if (label === 'fuel') {
            fuelComboSelectList && fuelComboSelectList.Fuels && fuelComboSelectList.Fuels.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'state') {
            fuelComboSelectList && fuelComboSelectList.States && fuelComboSelectList.States.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }

    }

    /**
    * @method handleFuel
    * @description called
    */
    handleFuel = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ fuel: newValue, }, () => {
                const { fuel } = this.state;
                this.props.getStateListByFuel(fuel.value, () => { })
            })
        } else {
            this.setState({ fuel: [] })
        }
    };

    /**
    * @method handleState
    * @description called
    */
    handleState = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ StateName: newValue, }, () => {
                const { StateName } = this.state;
                this.props.getFuelListByState(StateName.value, () => { })
            })
        } else {
            this.setState({ StateName: [] })
        }
    };

    /**
    * @method filterList
    * @description Filter user listing on the basis of role and department
    */
    filterList = () => {
        const { StateName, fuel } = this.state;
        const fuelID = fuel ? fuel.value : null;
        const stateId = StateName ? StateName.value : null;

        this.getDataList(fuelID, stateId)
    }

    /**
    * @method resetFilter
    * @description Reset user filter
    */
    resetFilter = () => {
        this.setState({
            fuel: [],
            StateName: [],
        }, () => {
            this.props.getFuelComboData(() => { })
            this.getDataList('', '')
        })
    }

    formToggle = () => {
        this.props.formToggle()
    }

    bulkToggle = () => {
        this.setState({ isBulkUpload: true })
    }

    closeBulkUploadDrawer = () => {
        this.setState({ isBulkUpload: false }, () => this.getDataList('', ''))
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => { }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, AddAccessibility, BulkUploadAccessibility } = this.props;
        const { isBulkUpload } = this.state;
        const options = {
            clearSearch: true,
            noDataText: (this.props.fuelDataList === undefined ? <LoaderCustom /> : <NoContentFound title={CONSTANT.EMPTY_DATA} />),
            paginationShowsTotal: this.renderPaginationShowsTotal,
            prePage: <span className="prev-page-pg"></span>, // Previous page button text
            nextPage: <span className="next-page-pg"></span>, // Next page button text
            firstPage: <span className="first-page-pg"></span>, // First page button text
            lastPage: <span className="last-page-pg"></span>,

        };

        return (
            <div>
                {/* {this.props.loading && <Loader />} */}
                <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
                    <Row className="pt-4">
                        {this.state.shown && (
                            <Col md="8" className="filter-block">
                                <div className="d-inline-flex justify-content-start align-items-top w100">
                                    <div className="flex-fills"><h5>{`Filter By:`}</h5></div>
                                    <div className="flex-fill">
                                        <Field
                                            name="Fuel"
                                            type="text"
                                            label=""
                                            component={searchableSelect}
                                            placeholder={'Select Fuel'}
                                            isClearable={false}
                                            options={this.renderListing('fuel')}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            //validate={(this.state.fuel == null || this.state.fuel.length == 0) ? [required] : []}
                                            //required={true}
                                            handleChangeDescription={this.handleFuel}
                                            valueDescription={this.state.fuel}
                                            disabled={false}
                                        />
                                    </div>
                                    <div className="flex-fill">
                                        <Field
                                            name="state"
                                            type="text"
                                            label=""
                                            component={searchableSelect}
                                            placeholder={'Select State'}
                                            isClearable={false}
                                            options={this.renderListing('state')}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            //validate={(this.state.StateName == null || this.state.StateName.length == 0) ? [required] : []}
                                            //required={true}
                                            handleChangeDescription={this.handleState}
                                            valueDescription={this.state.StateName}
                                            disabled={false}
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
                            </Col>)}
                        <Col md="6" className="search-user-block mb-3">
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
                            data={this.props.fuelDataList}
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
                            <TableHeaderColumn dataField="FuelName" columnTitle={true} dataAlign="left" dataSort={true} >{'Fuel'}</TableHeaderColumn>
                            <TableHeaderColumn dataField="UnitOfMeasurementName" columnTitle={true} dataAlign="left" dataSort={true} >{'UOM'}</TableHeaderColumn>
                            <TableHeaderColumn dataField="StateName" columnTitle={true} dataAlign="left" dataSort={true} >{'State'}</TableHeaderColumn>
                            <TableHeaderColumn dataField="Rate" width={100} columnTitle={true} dataAlign="left" dataSort={true} dataFormat={this.costFormatter} >{'Rate (INR)'}</TableHeaderColumn>
                            <TableHeaderColumn width={180} columnTitle={true} dataAlign="left" dataField="EffectiveDate" dataSort={true} dataFormat={this.effectiveDateFormatter} >{this.renderEffectiveDate()}</TableHeaderColumn>
                            <TableHeaderColumn width={180} columnTitle={true} dataAlign="left" dataField="ModifiedDate" dataFormat={this.effectiveDateFormatter} >{'Date Of Modification'}</TableHeaderColumn>
                            <TableHeaderColumn dataAlign="right" searchable={false} width={100} dataField="FuelDetailId" export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
                        </BootstrapTable>
                    </Col>
                </Row>
                {isBulkUpload && <BulkUpload
                    isOpen={isBulkUpload}
                    closeDrawer={this.closeBulkUploadDrawer}
                    isEditFlag={false}
                    fileName={'Fuel'}
                    messageLabel={'Fuel'}
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
function mapStateToProps({ fuel, auth }) {
    const { fuelComboSelectList, fuelDataList } = fuel;
    const { initialConfiguration } = auth;

    return { fuelComboSelectList, fuelDataList, initialConfiguration }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getFuelDetailDataList,
    getFuelComboData,
    deleteFuelDetailAPI,
    getStateListByFuel,
    getFuelListByState,
})(reduxForm({
    form: 'FuelListing',
    enableReinitialize: true,
})(FuelListing));