import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import { } from '../../../../actions/master/Comman';
import { focusOnError, } from "../../../layout/FormInputs";
import { getPartDataList, deletePart, activeInactivePartStatus, checkStatusCodeAPI, } from '../../../../actions/master/Part';
import { required } from "../../../../helper/validation";
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import NoContentFound from '../../../common/NoContentFound';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import Switch from "react-switch";
import moment from 'moment';
import { loggedInUserId } from '../../../../helper/auth';
import BulkUpload from '../../../massUpload/BulkUpload';
import { GridTotalFormate } from '../../../common/TableGridFunctions';

function enumFormatter(cell, row, enumObject) {
    return enumObject[cell];
}

class IndivisualPartListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditFlag: false,
            isOpen: false,
            tableData: [],

            isBulkUpload: false,
            ActivateAccessibility: true,
        }
    }

    componentDidMount() {
        this.getTableListData();
        //this.props.checkStatusCodeAPI(412, () => { })
    }

    // Get updated list after any action performed.
    getUpdatedData = () => {
        this.getTableListData()
    }

    /**
    * @method getTableListData
    * @description Get DATA LIST
    */
    getTableListData = () => {
        this.props.getPartDataList((res) => {
            if (res.status === 204 && res.data === '') {
                this.setState({ tableData: [], })
            } else if (res && res.data && res.data.DataList) {
                let Data = res.data.DataList;
                this.setState({
                    tableData: Data,
                })
            } else {

            }
        })
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
        return toastr.confirm(`${MESSAGES.CONFIRM_DELETE}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDeleteItem
    * @description confirm delete user item
    */
    confirmDeleteItem = (ID) => {
        this.props.deletePart(ID, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.PART_DELETE_SUCCESS);
                this.getTableListData();
            }
        });
    }

    /**
    * @method buttonFormatter
    * @description Renders buttons
    */
    buttonFormatter = (cell, row, enumObject, rowIndex) => {
        const { EditAccessibility, DeleteAccessibility } = this.props;
        return (
            <>
                {EditAccessibility && <button className="Edit mr5" type={'button'} onClick={() => this.editItemDetails(cell)} />}
                {DeleteAccessibility && <button className="Delete" type={'button'} onClick={() => this.deleteItem(cell)} />}
            </>
        )
    }

    handleChange = (cell, row, enumObject, rowIndex) => {
        let data = {
            Id: row.PartId,
            ModifiedBy: loggedInUserId(),
            IsActive: !cell, //Status of the user.
        }
        this.props.activeInactivePartStatus(data, res => {
            if (res && res.data && res.data.Result) {
                // if (cell === true) {
                //     toastr.success(MESSAGES.PLANT_INACTIVE_SUCCESSFULLY)
                // } else {
                //     toastr.success(MESSAGES.PLANT_ACTIVE_SUCCESSFULLY)
                // }
                this.getTableListData()
            }
        })
    }

    /**
    * @method statusButtonFormatter
    * @description Renders buttons
    */
    statusButtonFormatter = (cell, row, enumObject, rowIndex) => {
        const { ActivateAccessibility } = this.state;
        if (ActivateAccessibility) {
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
        } else {
            return (
                <>
                    {
                        cell ?
                            <div className={'Activated'}> {'Active'}</div>
                            :
                            <div className={'Deactivated'}>{'Deactive'}</div>
                    }
                </>
            )
        }
    }

    /**
    * @method indexFormatter
    * @description Renders serial number
    */
    indexFormatter = (cell, row, enumObject, rowIndex) => {
        let currentPage = this.refs.table.state.currPage;
        let sizePerPage = this.refs.table.state.sizePerPage;
        let serialNumber = '';
        if (currentPage === 1) {
            serialNumber = rowIndex + 1;
        } else {
            serialNumber = (rowIndex + 1) + (sizePerPage * (currentPage - 1));
        }
        return serialNumber;
    }

    /**
    * @method effectiveDateFormatter
    * @description Renders buttons
    */
    effectiveDateFormatter = (cell, row, enumObject, rowIndex) => {
        return cell != null ? moment(cell).format('DD/MM/YYYY') : '';
    }

    onExportToCSV = (row) => {
        return this.state.userData; // must return the data which you want to be exported
    }

    renderPaginationShowsTotal(start, to, total) {
        return <GridTotalFormate start={start} to={to} total={total} />
    }

    bulkToggle = () => {
        this.setState({ isBulkUpload: true })
    }

    closeBulkUploadDrawer = () => {
        this.setState({ isBulkUpload: false }, () => {
            this.getTableListData()
        })
    }

    formToggle = () => {
        this.props.formToggle()
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isBulkUpload } = this.state;
        const { AddAccessibility, BulkUploadAccessibility } = this.props
        const options = {
            clearSearch: true,
            noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
            //exportCSVText: 'Download Excel',
            //onExportToCSV: this.onExportToCSV,
            //paginationShowsTotal: true,
            paginationShowsTotal: this.renderPaginationShowsTotal,
            paginationSize: 5,
        };

        return (
            <>
                {/* {this.props.loading && <Loader />} */}

                <Row className="pt-30">
                    <Col md="8" className="filter-block">

                    </Col>
                    <Col md="4" className="search-user-block">
                        <div className="d-flex justify-content-end bd-highlight w100">
                            <div>
                                {AddAccessibility && <button
                                    type="button"
                                    className={'user-btn mr5'}
                                    onClick={this.bulkToggle}>
                                    <div className={'upload'}></div>Bulk Upload</button>}
                                {BulkUploadAccessibility && <button
                                    type="button"
                                    className={'user-btn'}
                                    onClick={this.formToggle}>
                                    <div className={'plus'}></div>ADD PART</button>}
                            </div>
                        </div>
                    </Col>
                </Row>


                <BootstrapTable
                    data={this.state.tableData}
                    striped={false}
                    bordered={false}
                    hover={false}
                    options={options}
                    search
                    // exportCSV
                    //ignoreSinglePage
                    ref={'table'}
                    trClassName={'userlisting-row'}
                    tableHeaderClass='my-custom-header'
                    pagination>
                    <TableHeaderColumn dataField="PartNumber" >Part No.</TableHeaderColumn>
                    <TableHeaderColumn dataField="PartName" >Part Name</TableHeaderColumn>
                    <TableHeaderColumn dataField="Plants" >Plant</TableHeaderColumn>
                    <TableHeaderColumn dataField="ECNNumber" >ECN No.</TableHeaderColumn>
                    <TableHeaderColumn dataField="DrawingNumber" >Drawing No.</TableHeaderColumn>
                    <TableHeaderColumn dataField="RevisionNumber" >Revision No.</TableHeaderColumn>
                    <TableHeaderColumn dataField="EffectiveDate" dataFormat={this.effectiveDateFormatter} >Effective Date</TableHeaderColumn>
                    {/* <TableHeaderColumn dataField="IsActive" dataFormat={this.statusButtonFormatter}>Status</TableHeaderColumn> */}
                    <TableHeaderColumn className="action" dataField="PartId" isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
                </BootstrapTable>
                {isBulkUpload && <BulkUpload
                    isOpen={isBulkUpload}
                    closeDrawer={this.closeBulkUploadDrawer}
                    isEditFlag={false}
                    fileName={'PartComponent'}
                    isZBCVBCTemplate={false}
                    messageLabel={'Part'}
                    anchor={'right'}
                />}
            </ >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps() {
    return {};
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/

export default connect(mapStateToProps, {
    getPartDataList,
    deletePart,
    activeInactivePartStatus,
    checkStatusCodeAPI,
})(IndivisualPartListing);
