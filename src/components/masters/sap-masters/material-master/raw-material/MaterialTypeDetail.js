import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Table, Button } from 'reactstrap';
import { getMaterialDetailAPI, deleteMaterialTypeAPI } from '../../../../../actions/master/Material';
import { Loader } from '../../../../common/Loader';
import { CONSTANT } from '../../../../../helper/AllConastant';
import { convertISOToUtcDate } from '../../../../../helper';
import NoContentFound from '../../../../common/NoContentFound';
import { MESSAGES } from '../../../../../config/message';
import { toastr } from 'react-redux-toastr';

class MaterialTypeDetail extends Component {
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
        const filterData = {
            PageSize: 0,
            LastIndex: 0,
            TechnologyId: '',
            DestinationSupplierId: '',
            PlantId: '',
        }
        this.props.getMaterialDetailAPI(filterData, res => { });
    }

    /**
    * @method editItemDetails
    * @description edit material type
    */
    editItemDetails = (Id) => {
        this.props.editMaterialTypeHandler(Id);
    }

    /**
    * @method deleteItem
    * @description confirm delete Material type
    */
    deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDelete(Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(`${MESSAGES.MATERIAL_TYPE_DELETE_ALERT}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete Material type
    */
    confirmDelete = (MaterialTypeId) => {
        this.props.deleteMaterialTypeAPI(MaterialTypeId, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_MATERIAL_TYPE_SUCCESS);
                const filterData = {
                    PageSize: 0,
                    LastIndex: 0,
                    TechnologyId: '',
                    DestinationSupplierId: '',
                    PlantId: '',
                }
                this.props.getMaterialDetailAPI(filterData, res => { });
            }
        });
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        return (
            <div>
                {/* {this.props.loading && <Loader/>} */}
                <Row>
                    <Col>
                        <Table className="table table-striped" size={'sm'} hover bordered>
                            {this.props.rmTypeDetail && this.props.rmTypeDetail.length > 0 &&
                                <thead>
                                    <tr>
                                        <th>{`${CONSTANT.MATERIAL} ${CONSTANT.TYPE}`}</th>
                                        <th>{`Density`}</th>
                                        <th>{`${CONSTANT.DATE}`}</th>
                                        <th>{``}</th>
                                    </tr>
                                </thead>}
                            <tbody >
                                {this.props.rmTypeDetail && this.props.rmTypeDetail.length > 0 &&
                                    this.props.rmTypeDetail.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td className="text-left">{item.MaterialType}</td>
                                                <td>{item.Density}</td>
                                                <td>{convertISOToUtcDate(item.CreatedDate)}</td>
                                                <td>
                                                    <Button className="black-btn" onClick={() => this.editItemDetails(item.MaterialTypeId)}><i className="fas fa-pencil-alt"></i></Button>
                                                    <Button className="black-btn" onClick={() => this.deleteItem(item.MaterialTypeId)}><i className="far fa-trash-alt"></i></Button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                {this.props.rmTypeDetail === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                            </tbody>
                        </Table>
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
    const { rmTypeDetail } = material;
    return { rmTypeDetail }
}


export default connect(
    mapStateToProps, {
    getMaterialDetailAPI,
    deleteMaterialTypeAPI,
}
)(MaterialTypeDetail);

