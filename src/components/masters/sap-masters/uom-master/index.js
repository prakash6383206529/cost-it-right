import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Button, Table } from 'reactstrap';
import AddUOM from './AddUOM';
import { getUnitOfMeasurementAPI, deleteUnitOfMeasurementAPI, activeInactiveUOM } from '../../../../actions/master/unitOfMeasurment';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import NoContentFound from '../../../common/NoContentFound';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import Switch from "react-switch";
import { loggedInUserId } from '../../../../helper/auth';

class UOMMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            uomId: '',
            dataList: [],
        }
    }

    /**
     * @method componentDidMount
     * @description  called before rendering the component
     */
    componentDidMount() {
        this.getUOMDataList()
    }

    getUOMDataList = () => {
        this.props.getUnitOfMeasurementAPI(res => {
            if (res && res.data && res.data.DataList) {
                let Data = res.data.DataList;
                this.setState({ dataList: Data })
            }
        });
    }

    /**
     * @method openModel
     * @description  used to open filter form 
     */
    openModel = () => {
        this.setState({
            isOpen: true,
            isEditFlag: false
        })
    }

    /**
     * @method closeDrawer
     * @description  used to cancel filter form
     */
    closeDrawer = (e = '') => {
        this.setState({ isOpen: false }, () => {
            this.getUOMDataList()
        })
    }

    /**
    * @method editItemDetails
    * @description confirm delete UOM
    */
    editItemDetails = (Id) => {
        this.setState({
            isEditFlag: true,
            isOpen: true,
            uomId: Id,
        })
    }

    /**
    * @method deleteItem
    * @description confirm delete UOM
    */
    deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDeleteUOM(Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(`Are you sure you want to delete UOM?`, toastrConfirmOptions);
    }

    /**
    * @method confirmDeleteUOM
    * @description confirm delete unit of measurement
    */
    confirmDeleteUOM = (Id) => {
        this.props.deleteUnitOfMeasurementAPI(Id, (res) => {
            if (res.data.Result) {
                toastr.success(MESSAGES.DELETE_UOM_SUCCESS);
                this.getUOMDataList()
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
            Id: row.Id,
            LoggedInUserId: loggedInUserId(),
            IsActive: !cell, //Status of the UOM.
        }
        this.props.activeInactiveUOM(data, res => {
            if (res && res.data && res.data.Result) {
                if (cell == true) {
                    toastr.success(MESSAGES.USER_INACTIVE_SUCCESSFULLY)
                } else {
                    toastr.success(MESSAGES.USER_ACTIVE_SUCCESSFULLY)
                }
                this.getUOMDataList()
            }
        })
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen, isEditFlag, uomId } = this.state;
        const options = {
            clearSearch: true,
            noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
            //exportCSVText: 'Download Excel',
            //onExportToCSV: this.onExportToCSV,
            //paginationShowsTotal: true,
            //paginationShowsTotal: this.renderPaginationShowsTotal,
            //paginationSize: 2,
        };
        return (
            <Container >
                {/* {this.props.loading && <Loader />} */}
                <Row>
                    <Col md={12}>
                        <h3>{`Unit of Measurement Master`}</h3>
                    </Col> <hr />
                    <Col md={12} className='text-right mb15'>
                        <button
                            type={'button'}
                            className={'user-btn'}
                            onClick={this.openModel}>
                            <div className={'plus'}></div>{`ADD UOM`}</button>
                    </Col>
                </Row>


                <Row>
                    <Col>
                        <BootstrapTable
                            data={this.state.dataList}
                            striped={false}
                            bordered={false}
                            hover={true}
                            options={options}
                            search
                            // exportCSV
                            ignoreSinglePage
                            ref={'table'}
                            trClassName={'userlisting-row'}
                            tableHeaderClass='my-custom-class'
                            pagination>
                            <TableHeaderColumn dataField="Unit" csvHeader='Full-Name' dataAlign="center" dataSort={true}>Unit</TableHeaderColumn>
                            <TableHeaderColumn dataField="UnitType" dataSort={true}>Unit Type</TableHeaderColumn>
                            <TableHeaderColumn dataField="IsActive" export={false} dataFormat={this.statusButtonFormatter}>Status</TableHeaderColumn>
                            <TableHeaderColumn dataField="Id" export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>

                        </BootstrapTable>
                    </Col>
                </Row>
                {isOpen && (
                    <AddUOM
                        isOpen={isOpen}
                        closeDrawer={this.closeDrawer}
                        isEditFlag={isEditFlag}
                        ID={uomId}
                        anchor={'right'}
                    />
                )}
            </Container >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ unitOfMeasrement }) {
    const { unitOfMeasurementList, loading } = unitOfMeasrement;
    return { unitOfMeasurementList, loading }
}

export default connect(
    mapStateToProps, {
    getUnitOfMeasurementAPI,
    deleteUnitOfMeasurementAPI,
    activeInactiveUOM,
}
)(UOMMaster);

