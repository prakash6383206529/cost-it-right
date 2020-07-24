import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Button, Table } from 'reactstrap';
import { } from '../../../../actions/master/Comman';
import { focusOnError, searchableSelect } from "../../../layout/FormInputs";
import { required } from "../../../../helper/validation";
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import NoContentFound from '../../../common/NoContentFound';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import Switch from "react-switch";
import { loggedInUserId } from '../../../../helper/auth';

function enumFormatter(cell, row, enumObject) {
    return enumObject[cell];
}

class AssemblyPartListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditFlag: false,
            isOpen: false,
            tableData: [],
        }
    }

    componentDidMount() {
        this.getTableListData();
        this.props.onRef(this)
    }

    // Get updated user list after any action performed.
    getUpdatedData = () => {
        this.getTableListData()
    }

	/**
	* @method getTableListData
	* @description Get user list data
	*/
    getTableListData = () => {
        // this.props.getPlantDataAPI(false, (res) => {
        //     if (res && res.data && res.status === 200) {
        //         let Data = res.data.DataList;

        //         this.setState({ tableData: Data })
        //     }
        // })
    }

	/**
	* @method editItemDetails
	* @description confirm edit item
	*/
    editItemDetails = (Id) => {
        let requestData = {
            isEditFlag: true,
            Id: Id,
        }
        this.props.getDetails(requestData)
    }

	/**
	* @method deleteItem
	* @description confirm delete part
	*/
    deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDeleteItem(Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(`${MESSAGES.PLANT_DELETE_ALERT}`, toastrConfirmOptions);
    }

	/**
	* @method confirmDeleteItem
	* @description confirm delete user item
	*/
    confirmDeleteItem = (ID) => {
        // this.props.deletePlantAPI(ID, (res) => {
        //     if (res.data.Result === true) {
        //         toastr.success(MESSAGES.PLANT_DELETE_SUCCESSFULLY);
        //         this.getTableListData();
        //     }
        // });
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
            Id: row.PlantId,
            ModifiedBy: loggedInUserId(),
            IsActive: !cell, //Status of the user.
        }
        // this.props.activeInactiveStatus(data, res => {
        //     if (res && res.data && res.data.Result) {
        //         if (cell == true) {
        //             toastr.success(MESSAGES.PLANT_INACTIVE_SUCCESSFULLY)
        //         } else {
        //             toastr.success(MESSAGES.PLANT_ACTIVE_SUCCESSFULLY)
        //         }
        //         this.getTableListData()
        //     }
        // })
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
                        offColor="#FC5774"
                        id="normal-switch"
                        height={24}
                    />
                </label>
            </>
        )
    }

	/**
	* @method checkIsVendorFormatter
	* @description Renders IsVendor
	*/
    checkIsVendorFormatter = (cell, row, enumObject, rowIndex) => {
        console.log('>>>>>>>>>>>>>>>>', cell, row)
        return (
            <>

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
    * @method renderListing
    * @description Used show listing 
    */
    renderListing = (label) => {
        const { } = this.props;
        const temp = [];

        // if (label === 'country') {
        //     countryList && countryList.map(item =>
        //         temp.push({ label: item.Text, value: item.Value })
        //     );
        //     return temp;
        // }

    }


	/**
	* @method filterList
	* @description Filter user listing on the basis of role and department
	*/
    filterList = () => {

    }

	/**
	* @method resetFilter
	* @description Reset user filter
	*/
    resetFilter = () => {

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
        const { isOpen, isEditFlag, editIndex, PartId, departmentType, roleType } = this.state;
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
                        <Col md="8" className="filter-block">
                            <div className="d-inline-flex justify-content-start align-items-top w100">
                                <div className="flex-fills"><h5>{`Filter By:`}</h5></div>
                                {/* <div className="flex-fill">
                                    <Field
                                        name="CountryId"
                                        type="text"
                                        label=""
                                        component={searchableSelect}
                                        placeholder={'Country'}
                                        options={this.renderListing('country')}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        //validate={(this.state.country == null || this.state.country.length == 0) ? [required] : []}
                                        //required={true}
                                        handleChangeDescription={this.countryHandler}
                                        valueDescription={this.state.country}
                                    />
                                </div> */}

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
                        <Col md="4" className="search-user-block">
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
                    <TableHeaderColumn dataField="Sr. No." width={'70'} dataFormat={this.indexFormatter}>Sr. No.</TableHeaderColumn>
                    <TableHeaderColumn className="action" dataField="PlantId" export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
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
function mapStateToProps({ }) {


    return {};
}


/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/

export default connect(mapStateToProps, {

})(reduxForm({
    form: 'AssemblyPartListing',
    onSubmitFail: errors => {
        //console.log('Register errors', errors)
        focusOnError(errors);
    },
    enableReinitialize: true,
})(AssemblyPartListing));
