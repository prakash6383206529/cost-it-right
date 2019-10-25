import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Button, Table } from 'reactstrap';
import AddProcess from './AddProcess';
import { getProcessDataAPI } from '../../../../actions/master/Process';
import { CONSTANT } from '../../../../helper/AllConastant'

class ProcessMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isOpenModel: false
        }
    }

    componentDidMount() {
        this.props.getProcessDataAPI(res => {});
    }
    /**
     * @method openModel
     * @description  used to open filter form 
     */
    openModel = () => {
        this.setState({ isOpen: true })
    }
    openCategoryModel = () => {
        this.setState({ isOpenModel: true})
    }

    /**
     * @method onCancel
     * @description  used to cancel filter form
     */
    onCancel = () => {
        this.setState({ isOpen: false, isOpenModel: false})
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen,isOpenModel } = this.state;
        return (
            <Container className="top-margin">
                <Row>
                    <Col>
                        <h3>Process Master </h3>
                    </Col>
                    <Col>
                        <Button onClick={this.openModel}>Add Process</Button>
                    </Col>
                </Row>
                <hr />
                <Col>
                    <Table className="table table-striped" bordered>
                        <thead>
                            <tr>
                            <th>{`${CONSTANT.PROCESS} ${CONSTANT.NAME}`}</th>
                            <th>{`${CONSTANT.PROCESS} ${CONSTANT.CODE}`}</th> 
                            <th>{`${CONSTANT.PROCESS} ${CONSTANT.DESCRIPTION}`}</th>
                            <th>{`${CONSTANT.PLANT} ${CONSTANT.NAME}`}</th>
                            </tr>
                        </thead>
                        <tbody > 
                            {this.props.processList && this.props.processList.length > 0 &&
                                this.props.processList.map((item, index) => {
                                    return (
                                        <tr key= {index}>
                                            <td >{item.ProcessName}</td>
                                            <td>{item.ProcessCode}</td> 
                                            <td>{item.Description }</td>
                                            <td>{item.PlantName}</td> 
                                        </tr>
                                    )
                                })}
                        </tbody> 
                    </Table>
                </Col>
                {isOpen && (
                    <AddProcess
                        isOpen={isOpen}
                        onCancel={this.onCancel}
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
function mapStateToProps({ process }) {
    const { processList } = process;
    console.log('processList: ', processList);
    return { processList }
}


export default connect(
    mapStateToProps, { getProcessDataAPI }
)(ProcessMaster);

