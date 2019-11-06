import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Button, Table } from 'reactstrap';
import AddBOM from './AddBOM';
import { getAllBOMAPI } from '../../../../actions/master/BillOfMaterial';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import NoContentFound from '../../../common/NoContentFound';

class BOMMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
        }
    }

    /**
     * @method componentDidMount
     * @description  Called before rendering the component
     */
    componentDidMount() {
        this.props.getAllBOMAPI(res => {});
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
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen } = this.state;
        return (
            <Container className="top-margin">
            {this.props.loading && <Loader/>}
                <Row>
                    <Col>
                        <h3>{`${CONSTANT.BOM} ${CONSTANT.MASTER}`}</h3>
                    </Col>
                    <Col>
                        <Button onClick={this.openModel}>{`${CONSTANT.ADD} ${CONSTANT.BOM} `}</Button>
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col>
                        <h5>{`${CONSTANT.BOM} ${CONSTANT.MASTER} ${CONSTANT.DETAILS}`} </h5>
                    </Col>
                </Row>
                <Col>
                <Table  className="table table-striped" bordered>
                { this.props.BOMListing && this.props.BOMListing.length > 0 &&
                    <thead>
                        <tr>
                        <th>{`${CONSTANT.BILL} ${CONSTANT.NUMBER}`}</th>
                        <th>{`${CONSTANT.BOM} ${CONSTANT.CODE}`}</th> 
                        <th>{`${CONSTANT.PART} ${CONSTANT.NUMBER}`}</th>
                        <th>{`${CONSTANT.MATERIAL} ${CONSTANT.CODE}`}</th>
                        <th>{`${CONSTANT.MATERIAL} ${CONSTANT.DESCRIPTION}` }</th>
                        <th>{`${CONSTANT.QUANTITY}`}</th>
                        <th>{`Assembly ${CONSTANT.PART} ${CONSTANT.NUMBER}`}</th>
                        <th>{`${CONSTANT.BOM} ${CONSTANT.LEVEL}`}</th> 
                        <th>{`ECO ${CONSTANT.NUMBER}`}</th>
                        <th>{`${CONSTANT.REVISION} ${CONSTANT.NUMBER}`}</th>
                        </tr>
                    </thead> }
                    <tbody > 
                    {this.props.BOMListing && this.props.BOMListing.length > 0 &&
                        this.props.BOMListing.map((item, index) => {
                            return (
                                <tr key= {index}>
                                    <td >{item.BillNumber}</td>
                                    <td>{item.BillOfMaterialCode}</td> 
                                    <td>{item.PartNumber ? item.PartNumber : 'N/A'}</td>
                                    <td>{item.MaterialCode ? item.MaterialCode : 'N/A'}</td> 
                                    <td>{item.MaterialDescription ? item.MaterialDescription : 'N/A'}</td> 
                                    <td>{item.Quantity}</td>
                                    <td>{item.AssemblyPartNumberMark}</td>
                                    <td>{item.BOMLevel}</td>
                                    <td>{item.EcoNumber}</td>
                                    <td>{item.RevisionNumber}</td>
                                    <div> 
                                    </div>
                                </tr>
                            )
                        })}
                        {this.props.BOMListing === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                    </tbody> 
                </Table>
                </Col>
                {isOpen && (
                    <AddBOM
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
function mapStateToProps({ billOfMaterial}) {
    const { BOMListing ,loading } = billOfMaterial;;
    return { BOMListing, loading }
}


export default connect(
    mapStateToProps, {getAllBOMAPI}
)(BOMMaster);

