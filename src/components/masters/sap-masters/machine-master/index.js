import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Button, Table } from 'reactstrap';
import AddMachine from './AddMachine';
import { } from '../../../../actions/master/MachineMaster';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import { convertISOToUtcDate, } from '../../../../helper';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import NoContentFound from '../../../common/NoContentFound';

class MachineMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            machineId: '',
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
            machineId: Id,
        })
    }

    /**
    * @method delete 
    * @description confirm delete machine
    */
    deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDelete(Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(MESSAGES.MACHINE_DELETE_ALERT, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete machine
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
        const { isOpen, isEditFlag, machineId } = this.state;
        return (
            <Container className="top-margin">
                {this.props.loading && <Loader />}
                <Row>
                    <Col>
                        <h3>{`Machine Master`}</h3>
                    </Col>
                    <Col>
                        <Button onClick={this.openModel}>{`Add Machine Master`}</Button>
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col>
                        <Table className="table table-striped" bordered>
                            {/* {this.props.labourDetail && this.props.labourDetail.length > 0 && */}
                            <thead>
                                <tr>
                                    <th>{`Class`}</th>
                                    <th>{`Number`}</th>
                                    <th>{`Power`}</th>
                                    <th>{`Depreciation`}</th>
                                    <th>{`Labour Type`}</th>
                                    <th>{`Fuel Type`}</th>
                                    <th>{`Shift`}</th>
                                    <th>{`Cost`}</th>
                                    <th>{`Mfd year`}</th>
                                    <th>{`Maintenance Cost`}</th>
                                    <th>{`PUC`}</th>
                                    <th>{`Effective Date`}</th>
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
                    <AddMachine
                        isOpen={isOpen}
                        onCancel={this.onCancel}
                        isEditFlag={isEditFlag}
                        machineId={machineId}
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
function mapStateToProps({ machine }) {
    const { loading } = machine;
    return { loading }
}


export default connect(
    mapStateToProps, {}
)(MachineMaster);

