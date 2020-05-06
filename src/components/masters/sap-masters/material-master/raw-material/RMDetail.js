import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Table, Button } from 'reactstrap';
import { getMaterialTypeDataListAPI, deleteMaterialTypeAPI } from '../../../../../actions/master/Material';
import { Loader } from '../../../../common/Loader';
import { CONSTANT } from '../../../../../helper/AllConastant';
import { convertISOToUtcDate, } from '../../../../../helper';
import NoContentFound from '../../../../common/NoContentFound';
import { MESSAGES } from '../../../../../config/message';
import { toastr } from 'react-redux-toastr';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

class RMDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
        }
    }

    /**
   * @method componentDidMount
   * @description Called after rendering the component
   */
    componentDidMount() {
        this.props.getMaterialTypeDataListAPI(res => { });
    }

    /**
    * @method editItemDetails
    * @description edit Raw Material
    */
    editItemDetails = (Id) => {
        this.props.editRawMaterialHandler(Id);
    }

    /**
    * @method deleteItem
    * @description confirm delete Raw Material
    */
    deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDelete(Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(`${MESSAGES.MATERIAL_DELETE_ALERT}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete Raw Material
    */
    confirmDelete = (ID) => {
        this.props.deleteMaterialTypeAPI(ID, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_MATERIAL_SUCCESS);
                this.props.getMaterialTypeDataListAPI(res => { });
            }
        });
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
        if (currentPage == 1) {
            serialNumber = rowIndex + 1;
        } else {
            serialNumber = (rowIndex + 1) + (sizePerPage * (currentPage - 1));
        }
        return serialNumber;
    }

    /**
    * @method renderPaginationShowsTotal
    * @description Pagination
    */
    renderPaginationShowsTotal(start, to, total) {
        return (
            <p style={{ color: 'blue' }}>
                Showing {start} of {to} entries.
            </p>
        );
    }

    /**
    * @method buttonFormatter
    * @description Renders buttons
    */
    buttonFormatter = (cell, row, enumObject, rowIndex) => {
        return (
            <>
                <Button className="btn btn-secondary mr5" onClick={() => this.editItemDetails(cell)}><i className="fas fa-pencil-alt"></i></Button>
                <Button className="btn btn-danger" onClick={() => this.deleteItem(cell)}><i className="far fa-trash-alt"></i></Button>
            </>
        )
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {

        const options = {
            clearSearch: true,
            noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
            paginationShowsTotal: this.renderPaginationShowsTotal,
            paginationSize: 2,
        };

        return (
            <div>
                {this.props.loading && <Loader />}
                <Row>
                    <Col>
                        {/* <hr /> */}
                        {/* <Table className="table table-striped" size={'sm'} hover bordered>
                            {this.props.rawMaterialTypeDataList && this.props.rawMaterialTypeDataList.length > 0 &&
                                <thead>
                                    <tr>
                                        <th>{`Material`}</th>
                                        <th>{`Density`}</th>
                                        <th>{``}</th>
                                    </tr>
                                </thead>}
                            <tbody >
                                {this.props.rawMaterialTypeDataList && this.props.rawMaterialTypeDataList.length > 0 &&
                                    this.props.rawMaterialTypeDataList.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td >{item.MaterialType}</td>
                                                <td >{item.Density}</td>
                                                <td>
                                                    <Button className="black-btn" onClick={() => this.editItemDetails(item.RawMaterialId)}><i className="fas fa-pencil-alt"></i></Button>
                                                    <Button className="black-btn" onClick={() => this.deleteItem(item.RawMaterialId)}><i className="far fa-trash-alt"></i></Button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                {this.props.rawMaterialTypeDataList === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                            </tbody>
                        </Table> */}
                        <BootstrapTable
                            data={this.props.rawMaterialTypeDataList}
                            striped={true}
                            hover={true}
                            options={options}
                            search
                            // exportCSV
                            ignoreSinglePage
                            ref={'table'}
                            pagination>
                            <TableHeaderColumn dataField="" dataFormat={this.indexFormatter}>Sr. No.</TableHeaderColumn>
                            <TableHeaderColumn dataField="MaterialType" dataAlign="center" dataSort={true}>Material</TableHeaderColumn>
                            <TableHeaderColumn dataField="Density" dataSort={true}>Density</TableHeaderColumn>
                            <TableHeaderColumn dataField="MaterialTypeId" export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>

                        </BootstrapTable>
                    </Col>
                </Row>
            </div>
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ material }) {
    const { rawMaterialTypeDataList } = material;
    return { rawMaterialTypeDataList }
}


export default connect(
    mapStateToProps, {
    getMaterialTypeDataListAPI,
    deleteMaterialTypeAPI,
}
)(RMDetail);

