import React, { Component } from 'react';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Table, Button } from 'reactstrap';
import { getRowMaterialDataAPI, deleteRMGradeAPI } from '../../actions/Material';
import { Loader } from '../../../../common/Loader';
import { MATERIAL, GRADE, TYPE, DATE, EMPTY_DATA } from '../../../config/constants';
import { convertISOToUtcDate, } from '../../../../../helper';
import NoContentFound from '../../../../common/NoContentFound';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../../../config/message';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';

class RMGradeDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            showPopup:false,
            deletedId:''
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
    * @description edit RM Grade
    */
    editItemDetails = (Id) => {
        this.props.editRMGradeHandler(Id);
    }

    /**
    * @method deleteItem
    * @description confirm delete RM Grade
    */
    deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDelete(Id)
            },
            onCancel: () => { }
        };
        // return Toaster.confirm(`${MESSAGES.RM_GRADE_DELETE_ALERT}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete RM Grade
    */
    confirmDelete = (ID) => {
        this.props.deleteRMGradeAPI(ID, (res) => {
            if (res.data.Result === true) {
                Toaster.success(MESSAGES.DELETE_RM_GRADE_SUCCESS);
                this.props.getRowMaterialDataAPI(res => { });
            }
        });
        this.setState({showPopup:false})
    }
    onPopupConfirm =() => {
        this.confirmDeleteItem(this.state.deletedId);
    }
    closePopUp= () =>{
        this.setState({showPopup:false})
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
                            {this.props.rowMaterialGradeDetail && this.props.rowMaterialGradeDetail.length > 0 &&
                                <thead>
                                    <tr>
                                        <th>{`${MATERIAL} ${GRADE}`}</th>
                                        <th>{`${MATERIAL} ${TYPE}`}</th>
                                        {/* <th>{`${CONSTANT.CATEGORY} ${CONSTANT.DESCRIPTION}`}</th> */}
                                        <th>{`${DATE}`}</th>
                                        <th>{``}</th>
                                    </tr>
                                </thead>}
                            <tbody >
                                {this.props.rowMaterialGradeDetail && this.props.rowMaterialGradeDetail.length > 0 &&
                                    this.props.rowMaterialGradeDetail.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td >{item.Grade}</td>
                                                <td>{item.MaterialTypeName}</td>
                                                {/* <td>{item.Description}</td> */}
                                                <td>{convertISOToUtcDate(item.CreatedDate)}</td>
                                                <td>
                                                    <Button className="black-btn" onClick={() => this.editItemDetails(item.GradeId)}><i className="fas fa-pencil-alt"></i></Button>
                                                    <Button className="black-btn" onClick={() => this.deleteItem(item.GradeId)}><i className="far fa-trash-alt"></i></Button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                {this.props.rowMaterialGradeDetail === undefined && <NoContentFound title={EMPTY_DATA} />}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
                {
            this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.RM_GRADE_DELETE_ALERT}`}  />
         }
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
    const { rowMaterialGradeDetail } = material;
    return { rowMaterialGradeDetail }
}


export default connect(
    mapStateToProps, {
    getRowMaterialDataAPI,
    deleteRMGradeAPI,
}
)(RMGradeDetail);

