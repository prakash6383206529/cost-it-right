import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Button, Table } from 'reactstrap';
import AddUOM from './AddUOM';
import { getUnitOfMeasurementAPI, deleteUnitOfMeasurementAPI } from '../../../../actions/master/unitOfMeasurment';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import NoContentFound from '../../../common/NoContentFound';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

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
                <button className="Edit" type={'button'} onClick={() => this.editItemDetails(cell)} />
                <button className="Delete" type={'button'} onClick={() => this.deleteItem(cell)} />
            </>
        )
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
            <Container className="top-margin">
                {/* {this.props.loading && <Loader />} */}
                <Row>
                    <Col>
                        <h3>{`Unit of Measurement Master`}</h3>
                    </Col>
                    <Col>
                        <button
                            type={'button'}
                            className={'user-btn'}
                            onClick={this.openModel}>{`ADD UOM`}</button>
                    </Col>
                </Row>

                <hr />
                <Row>
                    <Col>
                        <BootstrapTable
                            data={this.state.dataList}
                            striped={true}
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
                            <TableHeaderColumn dataField="Id" export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>

                        </BootstrapTable>
                    </Col>
                </Row>
                {isOpen && (
                    <AddUOM
                        isOpen={isOpen}
                        closeDrawer={this.closeDrawer}
                        isEditFlag={isEditFlag}
                        uomId={uomId}
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
    mapStateToProps, { getUnitOfMeasurementAPI, deleteUnitOfMeasurementAPI }
)(UOMMaster);

