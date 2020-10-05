import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import { getAssemblyPartDataList, deleteAssemblyPart, } from '../../../../actions/master/Part';
import { } from '../../../../actions/master/Comman';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import NoContentFound from '../../../common/NoContentFound';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import Switch from "react-switch";
import { loggedInUserId } from '../../../../helper/auth';
import moment from 'moment';
import VisualAdDrawer from './VisualAdDrawer';

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

            isOpenVisualDrawer: false,
            visualAdId: '',
            BOMId: '',
        }
    }

    componentDidMount() {
        this.getTableListData();
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
        this.props.getAssemblyPartDataList((res) => {
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
    * @description CONFIRM DELETE PART
    */
    deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDeleteItem(Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(`${MESSAGES.BOM_DELETE_ALERT}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDeleteItem
    * @description DELETE ASSEMBLY PART
    */
    confirmDeleteItem = (ID) => {
        this.props.deleteAssemblyPart(ID, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_BOM_SUCCESS);
                this.getTableListData();
            }
        });
    }

    /**
    * @method effectiveDateFormatter
    * @description Renders buttons
    */
    effectiveDateFormatter = (cell, row, enumObject, rowIndex) => {
        return cell != null ? moment(cell).format('DD/MM/YYYY') : '';
    }

    /**
    * @method visualAdFormatter
    * @description Renders buttons
    */
    visualAdFormatter = (cell, row, enumObject, rowIndex) => {
        return (
            <>
                <button className="View mr5" type={'button'} onClick={() => this.visualAdDetails(cell, row.BOMId)} />
            </>
        )
    }

    /**
    * @method visualAdDetails
    * @description Renders buttons
    */
    visualAdDetails = (cell, BOMId) => {
        this.setState({ visualAdId: cell, BOMId: BOMId, isOpenVisualDrawer: true })
    }

    /**
    * @method closeVisualDrawer
    * @description CLOSE VISUAL AD DRAWER
    */
    closeVisualDrawer = () => {
        this.setState({ isOpenVisualDrawer: false, visualAdId: '', BOMId: '', })
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

    formToggle = () => {
        this.props.formToggle()
    }

    displayForm = () => {
        this.props.displayForm()
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpenVisualDrawer, } = this.state;
        const { AddAccessibility, } = this.props;
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

                <Row className="pt-30">
                    <Col md="8" className="filter-block">

                    </Col>
                    <Col md="4" className="search-user-block">
                        <div className="d-flex justify-content-end bd-highlight w100">
                            <div>
                                {AddAccessibility && <button
                                    type="button"
                                    className={'user-btn'}
                                    onClick={this.displayForm}>
                                    <div className={'plus'}></div>ADD BOM</button>}
                            </div>
                        </div>
                    </Col>
                </Row>

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
                    <TableHeaderColumn dataField="BOMNumber" >BOM NO.</TableHeaderColumn>
                    <TableHeaderColumn dataField="PartNumber" >Part No.</TableHeaderColumn>
                    <TableHeaderColumn dataField="PartName" >Name</TableHeaderColumn>
                    <TableHeaderColumn dataField="Plants" width={150} >Plant</TableHeaderColumn>
                    <TableHeaderColumn dataField="NumberOfParts" width={100}>No. of Child Parts</TableHeaderColumn>
                    <TableHeaderColumn dataField="BOMLevelCount" width={150}>BOM Level Count</TableHeaderColumn>
                    <TableHeaderColumn dataField="ECNNumber" width={150}>ECN No.</TableHeaderColumn>
                    <TableHeaderColumn dataField="DrawingNumber" >Drawing No.</TableHeaderColumn>
                    <TableHeaderColumn dataField="RevisionNumber" >Revision No.</TableHeaderColumn>
                    <TableHeaderColumn dataField="EffectiveDate" dataFormat={this.effectiveDateFormatter} >Effective Date</TableHeaderColumn>
                    {/* <TableHeaderColumn dataField="IsActive" dataFormat={this.statusButtonFormatter}>Status</TableHeaderColumn> */}
                    <TableHeaderColumn dataField="VisualAid" dataFormat={this.visualAdFormatter}>Visual Aid</TableHeaderColumn>
                    <TableHeaderColumn className="action" dataField="PartId" export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
                </BootstrapTable>
                {isOpenVisualDrawer && <VisualAdDrawer
                    isOpen={isOpenVisualDrawer}
                    closeDrawer={this.closeVisualDrawer}
                    isEditFlag={false}
                    ID={this.state.visualAdId}
                    BOMId={this.state.BOMId}
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

export default connect(mapStateToProps,
    {
        getAssemblyPartDataList,
        deleteAssemblyPart,
    })(AssemblyPartListing);
