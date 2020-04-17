import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Button, Table
} from 'reactstrap';
import { getAllLevelAPI, deleteUserLevelAPI } from '../../actions/auth/AuthActions';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../config/message';
import { Loader } from '../common/Loader';
import { CONSTANT } from '../../helper/AllConastant';
import NoContentFound from '../common/NoContentFound';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

class LevelsListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditFlag: false,
            tableData: [],
        }
    }

    componentDidMount() {
        this.getLevelsListData();
        this.props.onRef(this);
    }

    getLevelsListData = () => {
        this.props.getAllLevelAPI(res => {
            if (res && res.data && res.data.DataList) {
                let Data = res.data.DataList;
                this.setState({
                    tableData: Data,
                })
            }
        });
    }

    /**
    * @method getUpdatedData
    * @description get updated data after updatesuccess
    */
    getUpdatedData = () => {
        this.getLevelsListData()
    }

    /**
     * @method editItemDetails
     * @description confirm edit item
     */
    editItemDetails = (Id) => {
        let requestData = {
            isEditFlag: true,
            LevelId: Id,
        }
        this.props.getLevelDetail(requestData)
    }

    /**
    * @method deleteItem
    * @description confirm delete level
    */
    deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDeleteItem(Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(`${MESSAGES.LEVEL_DELETE_ALERT}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDeleteItem
    * @description confirm delete level item
    */
    confirmDeleteItem = (LevelId) => {
        this.props.deleteUserLevelAPI(LevelId, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_LEVEL_SUCCESSFULLY);
                this.getLevelsListData()
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
                <Button className="btn btn-secondary mr5" onClick={() => this.editItemDetails(cell)}><i className="fas fa-pencil-alt"></i></Button>
                <Button className="btn btn-danger" onClick={() => this.deleteItem(cell)}><i className="far fa-trash-alt"></i></Button>
            </>
        )
    }

    afterSearch = (searchText, result) => {
        console.log('search', searchText, result)
        //...
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isEditFlag } = this.state;
        const options = {
            clearSearch: true,
            noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
            afterSearch: this.afterSearch,
        };
        return (
            <>
                {this.props.loading && <Loader />}
                <Row>
                    <Col>
                        <h3>{`List of Levels`}</h3>
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col>
                        <BootstrapTable
                            data={this.state.tableData}
                            striped={true}
                            hover={true}
                            options={options}
                            search
                            ignoreSinglePage
                            pagination>
                            <TableHeaderColumn dataField="LevelName" isKey={true} dataAlign="center" dataSort={true}>Level</TableHeaderColumn>
                            <TableHeaderColumn dataField="Sequence" dataAlign="center" dataSort={true}>Sequence</TableHeaderColumn>
                            <TableHeaderColumn dataField="LevelId" dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
                        </BootstrapTable>
                    </Col>
                </Row>
                {/* <Row>
                    <Col>
                        <Table className="table table-striped" size="sm" bordered>
                            {this.props.levelList && this.props.levelList.length > 0 &&
                                <thead>
                                    <tr>
                                        <th>{`Level`}</th>
                                        <th>{'Sequence'}</th>
                                        <th>{''}</th>
                                    </tr>
                                </thead>}
                            <tbody >
                                {this.props.levelList && this.props.levelList.length > 0 &&
                                    this.props.levelList.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td >{item.LevelName}</td>
                                                <td>{item.Sequence}</td>
                                                <td>
                                                    <Button className="btn btn-secondary" onClick={() => this.editItemDetails(index, item.LevelId)}><i className="fas fa-pencil-alt"></i></Button>
                                                    <Button className="btn btn-danger" onClick={() => this.deleteItem(index, item.LevelId)}><i className="far fa-trash-alt"></i></Button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                {this.props.levelList === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                            </tbody>
                        </Table>
                    </Col>
                </Row> */}
            </ >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ auth }) {
    const { levelList, loading } = auth;

    return { levelList, loading };
}


export default connect(mapStateToProps,
    {
        getAllLevelAPI,
        deleteUserLevelAPI,
    })(LevelsListing);

