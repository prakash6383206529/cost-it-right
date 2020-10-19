import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import { getAssemblyPartDataList, deleteAssemblyPart, } from '../../../../actions/master/Part';
import { } from '../../../../actions/master/Comman';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant';
import NoContentFound from '../../../common/NoContentFound';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import Switch from "react-switch";
import { loggedInUserId } from '../../../../helper/auth';
import moment from 'moment';
import { GridTotalFormate } from '../../../common/TableGridFunctions';
import BOMViewer from './BOMViewer';
import BOMUpload from '../../../massUpload/BOMUpload';

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
            isBulkUpload: false,
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
                <button className="View mr5" type={'button'} onClick={() => this.visualAdDetails(cell)} />
            </>
        )
    }

    /**
    * @method visualAdDetails
    * @description Renders buttons
    */
    visualAdDetails = (cell) => {
        this.setState({ visualAdId: cell, isOpenVisualDrawer: true })
    }

    /**
    * @method closeVisualDrawer
    * @description CLOSE VISUAL AD DRAWER
    */
    closeVisualDrawer = () => {
        this.setState({ isOpenVisualDrawer: false, visualAdId: '', })
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
        return <GridTotalFormate start={start} to={to} total={total} />
    }

    formToggle = () => {
        this.props.formToggle()
    }

    displayForm = () => {
        this.props.displayForm()
    }


    bulkToggle = () => {
        this.setState({ isBulkUpload: true })
    }

    closeBulkUploadDrawer = () => {
        this.setState({ isBulkUpload: false }, () => {
        })
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpenVisualDrawer, isBulkUpload } = this.state;
        const { AddAccessibility, } = this.props;
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
                                <button
                                    type="button"
                                    className={'user-btn mr5'}
                                    onClick={this.bulkToggle}>
                                    <div className={'upload'}></div>Upload BOM</button>
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
                    hover={false}
                    options={options}
                    search
                    // exportCSV
                    //ignoreSinglePage
                    ref={'table'}
                    trClassName={'userlisting-row'}
                    tableHeaderClass='my-custom-header'
                    pagination>
                    <TableHeaderColumn dataField="BOMNumber" width={'100'}>BOM NO.</TableHeaderColumn>
                    <TableHeaderColumn dataField="PartNumber" width={'100'}>Part No.</TableHeaderColumn>
                    <TableHeaderColumn dataField="PartName" width={'100'}>Name</TableHeaderColumn>
                    <TableHeaderColumn dataField="Plants" width={'100'} >Plant</TableHeaderColumn>
                    <TableHeaderColumn dataField="NumberOfParts" width={'150'}>No. of Child Parts</TableHeaderColumn>
                    <TableHeaderColumn dataField="BOMLevelCount" width={'150'}>BOM Level Count</TableHeaderColumn>
                    <TableHeaderColumn dataField="ECNNumber" width={'70'}>ECN No.</TableHeaderColumn>
                    <TableHeaderColumn dataField="DrawingNumber" width={'100'} >Drawing No.</TableHeaderColumn>
                    <TableHeaderColumn dataField="RevisionNumber" width={'100'} >Revision No.</TableHeaderColumn>
                    <TableHeaderColumn dataField="EffectiveDate" width={'130'} dataFormat={this.effectiveDateFormatter} >Effective Date</TableHeaderColumn>
                    {/* <TableHeaderColumn dataField="IsActive" dataFormat={this.statusButtonFormatter}>Status</TableHeaderColumn> */}
                    <TableHeaderColumn dataField="PartId" dataFormat={this.visualAdFormatter}>Visual Aid</TableHeaderColumn>
                    <TableHeaderColumn className="action" dataField="PartId" export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
                </BootstrapTable>

                {isOpenVisualDrawer && <BOMViewer
                    isOpen={isOpenVisualDrawer}
                    closeDrawer={this.closeVisualDrawer}
                    isEditFlag={true}
                    PartId={this.state.visualAdId}
                    anchor={'right'}
                    isFromVishualAd={true}
                    NewAddedLevelOneChilds={[]}
                />}
                {isBulkUpload && <BOMUpload
                    isOpen={isBulkUpload}
                    closeDrawer={this.closeBulkUploadDrawer}
                    isEditFlag={false}
                    fileName={'BOM'}
                    messageLabel={'BOM'}
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
