import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Button, Table } from 'reactstrap';
import AddLabour from './AddLabour';
import { getLabourDetailAPI, deleteLabourAPI } from '../../../../actions/master/Labour';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import {
    convertISOToUtcDate,
} from '../../../../helper';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';

class LabourMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
        }
    }

    componentDidMount() {
        this.props.getLabourDetailAPI(res => {});
    }

    /**
     * @method openModel
     * @description  used to open filter form 
     */
    openModel = () => {
        this.setState({ isOpen: true, isEditFlag: false })
    }

    /**
     * @method onCancel
     * @description  used to cancel filter form
     */
    onCancel = () => {
        this.setState({ isOpen: false })
    }

      /**
    * @method editDetails
    * @description confirm delete bop
    */
    editDetails = (Id) => {
        this.setState({
            isEditFlag: true,
            isOpen: true,
            labourId: Id,
        })
    }

    /**
    * @method delete 
    * @description confirm delete bop
    */
    deleteBOP = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDelete(Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(`${MESSAGES.CONFIRM_DELETE} this labour ?`, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete bought out part
    */
    confirmDelete = (Id) => {
        this.props.deleteLabourAPI(Id, (res) => {
            if (res.data.Result) {
                toastr.success(MESSAGES.DELETE_LABOUR_SUCCESS);
                this.props.getLabourDetailAPI(res => { });
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        });
    }
    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen, isEditFlag, labourId } = this.state;
        return (
            <Container className="top-margin">
            {/* {this.props.loading && <Loader/>} */}
                <Row>
                    <Col>
                        <h3>{`${CONSTANT.LABOUR} ${CONSTANT.MASTER}`}</h3>
                    </Col>
                    <Col>
                        <Button onClick={this.openModel}>{`${CONSTANT.ADD} ${CONSTANT.LABOUR} `}</Button>
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col>
                        <h5>{`${CONSTANT.LABOUR} ${CONSTANT.MASTER} ${CONSTANT.DETAILS}`}</h5>
                    </Col>
                </Row>
                <Col>
                <Table className="table table-striped" bordered>
                    <thead>
                        <tr>
                        <th>{`${CONSTANT.TECHNOLOGY} ${CONSTANT.NAME}`}</th>
                        <th>{`${CONSTANT.LABOUR} ${CONSTANT.TYPE} ${CONSTANT.NAME}`}</th>
                        <th>{`${CONSTANT.PLANT} ${CONSTANT.NAME}`}</th> 
                        <th>{`${CONSTANT.LABOUR} ${CONSTANT.RATE}`}</th>
                        <th>{`${CONSTANT.DATE}`}</th>
                        <th></th>
                        </tr>
                    </thead>
                    <tbody > 
                        {this.props.labourDetail && this.props.labourDetail.length > 0 &&
                            this.props.labourDetail.map((item, index) => {
                            return (
                                <tr key={index}>
                                    <td>{item.TechnologyName}</td> 
                                    <td >{item.LabourTypeName}</td>
                                    <td>{item.PlantName}</td>
                                    <td>{item.LabourRate}</td> 
                                    <td>{convertISOToUtcDate(item.CreatedDate)}</td>
                                    <div>
                                        <Button className="btn btn-secondary" onClick={() => this.editDetails(item.LabourId)}><i className="fas fa-pencil-alt"></i></Button>
                                        <Button className="btn btn-danger" onClick={() => this.deleteBOP(item.LabourId)}><i className="far fa-trash-alt"></i></Button>
                                    </div> 
                                </tr>
                            )
                        })}
                    </tbody>  
                </Table> 
                </Col>
                {isOpen && (
                    <AddLabour
                        isOpen={isOpen}
                        onCancel={this.onCancel}
                        isEditFlag={isEditFlag}
                        labourId={labourId}
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
function mapStateToProps({ labour }) {
    const { labourDetail ,loading } = labour;
    return { labourDetail, loading }
}


export default connect(
    mapStateToProps, { getLabourDetailAPI,deleteLabourAPI }
)(LabourMaster);

