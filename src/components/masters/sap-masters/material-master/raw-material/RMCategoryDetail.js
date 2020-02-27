import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Table, Button } from 'reactstrap';
import { getRowMaterialDataAPI, deleteCategoryAPI } from '../../../../../actions/master/Material';
import { Loader } from '../../../../common/Loader';
import { CONSTANT } from '../../../../../helper/AllConastant';
import { convertISOToUtcDate, } from '../../../../../helper';
import NoContentFound from '../../../../common/NoContentFound';
import { MESSAGES } from '../../../../../config/message';
import { toastr } from 'react-redux-toastr';

class RMCategoryDetail extends Component {
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
        this.props.getRowMaterialDataAPI(res => { });
    }

    /**
    * @method editItemDetails
    * @description edit category type
    */
    editItemDetails = (Id) => {
        this.props.editCategoryHandler(Id);
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
        return toastr.confirm(`${MESSAGES.CATEGORY_DELETE_ALERT}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete Material type
    */
    confirmDelete = (CategoryId) => {
        this.props.deleteCategoryAPI(CategoryId, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_CATEGORY_SUCCESS);
                this.props.getRowMaterialDataAPI(res => { });
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
                {this.props.loading && <Loader />}
                <Row>
                    <Col>
                        {/* <hr /> */}
                        <Table className="table table-striped" size={'sm'} hover bordered>
                            {this.props.rowMaterialCategoryDetail && this.props.rowMaterialCategoryDetail.length > 0 &&
                                <thead>
                                    <tr>
                                        <th>{`${CONSTANT.CATEGORY} ${CONSTANT.NAME}`}</th>
                                        <th>{`${CONSTANT.CATEGORY} ${CONSTANT.DESCRIPTION}`}</th>
                                        <th>{`${CONSTANT.DATE}`}</th>
                                    </tr>
                                </thead>}
                            <tbody >
                                {this.props.rowMaterialCategoryDetail && this.props.rowMaterialCategoryDetail.length > 0 &&
                                    this.props.rowMaterialCategoryDetail.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td >{item.CategoryName}</td>
                                                <td>{item.Description}</td>
                                                <td>{convertISOToUtcDate(item.CreatedDate)}</td>
                                                <td>
                                                    <Button className="black-btn" onClick={() => this.editItemDetails(item.CategoryId)}><i className="fas fa-pencil-alt"></i></Button>
                                                    <Button className="black-btn" onClick={() => this.deleteItem(item.CategoryId)}><i className="far fa-trash-alt"></i></Button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                {this.props.rowMaterialCategoryDetail === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
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
    const { rowMaterialCategoryDetail } = material;
    return { rowMaterialCategoryDetail }
}

export default connect(mapStateToProps,
    {
        getRowMaterialDataAPI,
        deleteCategoryAPI,
    }
)(RMCategoryDetail);

