import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Button, Table } from 'reactstrap';
import AddPower from './AddPower';
import { } from '../../../../actions/master/PowerMaster';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import { convertISOToUtcDate, } from '../../../../helper';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import NoContentFound from '../../../common/NoContentFound';

class PowerMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            powerId: '',
        }
    }

    /**
   * @method componentDidMount
   * @description Called after rendering the component
   */
    componentDidMount() {
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
  * @description used to edit machine details
  */
    editDetails = (Id) => {
        this.setState({
            isEditFlag: true,
            isOpen: true,
            powerId: Id,
        })
    }

    /**
    * @method delete 
    * @description confirm delete power
    */
    deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDelete(Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(MESSAGES.POWER_DELETE_ALERT, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete power
    */
    confirmDelete = (Id) => {
        // this.props.deleteLabourAPI(Id, (res) => {
        //     if (res.data.Result) {
        //         toastr.success(MESSAGES.DELETE_MACHINE_SUCCESS);
        //         this.props.getLabourDetailAPI(res => { });
        //     } else {
        //         toastr.error(MESSAGES.SOME_ERROR);
        //     }
        // });
    }
    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen, isEditFlag, powerId } = this.state;
        return (
            <Container className="top-margin">
                {this.props.loading && <Loader />}
                <Row>
                    <Col>
                        <h3>{`Machine Master`}</h3>
                    </Col>
                    <Col>
                        <Button onClick={this.openModel}>{`Add Power Master`}</Button>
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col>
                        <Table className="table table-striped" bordered>
                            {/* {this.props.labourDetail && this.props.labourDetail.length > 0 && */}
                            <thead>
                                <tr>
                                    <th>{`Power ID`}</th>
                                    <th>{`Charge Type`}</th>
                                    <th>{`Power supplier Name`}</th>
                                    <th>{`Plant`}</th>
                                    <th>{`UOM`}</th>
                                    <th>{`Fuel`}</th>
                                    <th>{`Contract`}</th>
                                    <th>{`Demand`}</th>
                                    <th>{`Unit Consumption`}</th>
                                    <th>{`Demand Energy`}</th>
                                </tr>
                            </thead>
                            {/* } */}
                            <tbody >
                                {/* {this.props.labourDetail && this.props.labourDetail.length > 0 &&
                                    this.props.labourDetail.map((item, index) => {
                                        return ( */}
                                <tr>
                                    <td>{''}</td>
                                    <td>{''}</td>
                                    <td>{''}</td>
                                    <td>{''}</td>
                                    <td>{''}</td>
                                    <td>{''}</td>
                                    <td>{''}</td>
                                    <td>{''}</td>
                                    <td>{''}</td>
                                    <td>{''}</td>
                                </tr>
                                {/* )
                                    })} */}
                                {/* {this.props.labourDetail === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />} */}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
                {isOpen && (
                    <AddPower
                        isOpen={isOpen}
                        onCancel={this.onCancel}
                        isEditFlag={isEditFlag}
                        powerId={powerId}
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
function mapStateToProps({ power }) {
    const { loading } = power;
    return { loading }
}


export default connect(
    mapStateToProps, {}
)(PowerMaster);

