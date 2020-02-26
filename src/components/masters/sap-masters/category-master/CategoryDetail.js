import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Table, Button } from 'reactstrap';
import { getCategoryDataAPI, deleteCategoryMasterAPI } from '../../../../actions/master/Category';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import NoContentFound from '../../../common/NoContentFound';
import { MESSAGES } from '../../../../config/message';
import { toastr } from 'react-redux-toastr';

class CategoryDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
        }
    }

    /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount() {
        this.props.getCategoryDataAPI(res => { });
    }

    /**
    * @method editItem
    * @description confirm category type
    */
    editItem = (Id) => {
        this.props.editCategory(Id)
    }

    /**
    * @method deleteItem
    * @description confirm delete Category Type
    */
    deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDelete(Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(MESSAGES.CATEGORY_DELETE_ALERT, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete Category Type
    */
    confirmDelete = (Id) => {
        this.props.deleteCategoryMasterAPI(Id, (res) => {
            if (res.data.Result) {
                toastr.success(MESSAGES.DELETE_CATEGORY_SUCCESS);
                this.props.getCategoryDataAPI(res => { });
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
                        <Table className="table table-striped" size={'sm'} bordered>
                            {this.props.categoryDetail && this.props.categoryDetail.length > 0 &&
                                <thead>
                                    <tr>
                                        <th>{`${CONSTANT.CATEGORY} ${CONSTANT.NAME}`}</th>
                                        <th>{`${CONSTANT.CATEGORY} ${CONSTANT.TYPE}`}</th>
                                        <th>{`${CONSTANT.CATEGORY} ${CONSTANT.DESCRIPTION}`}</th>
                                        <th>{``}</th>
                                    </tr>
                                </thead>}
                            <tbody >
                                {this.props.categoryDetail && this.props.categoryDetail.length > 0 &&
                                    this.props.categoryDetail.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td >{item.Category}</td>
                                                <td>{item.CategoryType}</td>
                                                <td>{item.Description}</td>
                                                <td>
                                                    <Button className="btn btn-secondary" onClick={() => this.editItem(item.CategoryId)}><i className="fas fa-pencil-alt"></i></Button>
                                                    <Button className="btn btn-danger" onClick={() => this.deleteItem(item.CategoryId)}><i className="far fa-trash-alt"></i></Button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                {this.props.categoryDetail === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
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
function mapStateToProps({ category }) {
    const { categoryDetail } = category;
    return { categoryDetail }
}

export default connect(
    mapStateToProps, {
    getCategoryDataAPI,
    deleteCategoryMasterAPI,
})(CategoryDetail);

