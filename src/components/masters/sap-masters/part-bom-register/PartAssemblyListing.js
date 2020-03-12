import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Button, Table } from 'reactstrap';
import { getAssemblyPartDataListAPI, deleteAssemblyPartAPI } from '../../../../actions/master/BillOfMaterial';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import NoContentFound from '../../../common/NoContentFound';

class PartAssemblyListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
        }
    }

    componentDidMount() {
        this.props.getAssemblyPartDataListAPI(res => { });
    }

    /**
    * @method editItemDetails
    * @description confirm edit item
    */
    editItemDetails = (Id) => {
        let requestData = {
            isEditFlag: true,
            PartId: Id,
        }
        this.props.getAssemblyPartDetail(requestData)
    }

    /**
    * @method deleteItem
    * @description confirm delete Assembly Part
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
    * @description confirm delete Assembly Part
    */
    confirmDeleteItem = (ID) => {
        this.props.deleteAssemblyPartAPI(ID, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_BOM_SUCCESS);
                this.props.getAssemblyPartDataListAPI(res => { });
            }
        });
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { } = this.state;
        return (
            <Container className="listing">
                {this.props.loading && <Loader />}
                <Row>
                    <Col>
                        <h3>{`List of Assembly Parts`}</h3>
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col>
                        <Table className="table table-striped" size={'sm'} hover bordered>
                            {this.props.AssemblyPartDataList && this.props.AssemblyPartDataList.length > 0 &&
                                <thead>
                                    <tr>
                                        <th>{`BOM Number`}</th>
                                        <th>{`Part Number`}</th>
                                        <th>{`BOM Level`}</th>
                                        <th>{`Assembly`}</th>
                                        <th>{`Child Part`}</th>
                                        <th>{`Raw Material`}</th>
                                        <th>{`UOM`}</th>
                                        <th>{''}</th>
                                    </tr>
                                </thead>}
                            <tbody >
                                {this.props.AssemblyPartDataList && this.props.AssemblyPartDataList.length > 0 &&
                                    this.props.AssemblyPartDataList.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td >{item.BOMNumber}</td>
                                                <td>{item.PartNumber}</td>
                                                <td>{item.BOMLevel}</td>
                                                <td>{item.IsAssembly ? 'True' : 'False'}</td>
                                                <td>{item.IsChildPart != null ? 'True' : 'False'}</td>
                                                <td>{item.RawMaterialName}</td>
                                                <td>{item.UnitOfMeasurementName}</td>
                                                <div>
                                                    <Button className="btn btn-secondary" onClick={() => this.editItemDetails(item.PartId)}><i className="fas fa-pencil-alt"></i></Button>
                                                    <Button className="btn btn-danger" onClick={() => this.deleteItem(item.PartId)}><i className="far fa-trash-alt"></i></Button>
                                                </div>
                                            </tr>
                                        )
                                    })}
                                {this.props.AssemblyPartDataList === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </Container >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ billOfMaterial }) {
    const { AssemblyPartDataList } = billOfMaterial;

    return { AssemblyPartDataList };
}


export default connect(mapStateToProps,
    {
        getAssemblyPartDataListAPI,
        deleteAssemblyPartAPI,
    })(PartAssemblyListing);

