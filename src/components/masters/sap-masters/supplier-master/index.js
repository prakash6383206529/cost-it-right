import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Button, Table } from 'reactstrap';
import AddSupplier from './AddSupplier';
import { getSupplierDetailAPI } from '../../../../actions/master/Supplier';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import {
    convertISOToUtcDate,
} from '../../../../helper';


class SupplierMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
        }
    }

    componentDidMount() {
        this.props.getSupplierDetailAPI(res => {});
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
        const { isOpen, isEditFlag,editIndex, PartId } = this.state;
        return (
            <Container className="top-margin">
            {/* {this.props.loading && <Loader/>} */}
                <Row>
                    <Col>
                        <h3>{`${CONSTANT.SUPPLIER} ${CONSTANT.MASTER}`}</h3>
                    </Col>
                    <Col>
                        <Button onClick={this.openModel}>{`${CONSTANT.ADD} ${CONSTANT.SUPPLIER} `}</Button>
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col>
                        <h5>{`${CONSTANT.SUPPLIER} ${CONSTANT.MASTER} ${CONSTANT.DETAILS}`}</h5>
                    </Col>
                </Row>
                <Col>
                <Table className="table table-striped" bordered>
                    <thead>
                        <tr>
                        <th>{`${CONSTANT.SUPPLIER} ${CONSTANT.CODE}`}</th>
                        <th>{`${CONSTANT.SUPPLIER} ${CONSTANT.NAME}`}</th>
                        <th>{`${CONSTANT.SUPPLIER} ${CONSTANT.EMAIL}`}</th> 
                        <th>{`${CONSTANT.SUPPLIER} ${CONSTANT.TYPE}`}</th>
                        <th>{`${CONSTANT.SUPPLIER} ${CONSTANT.CITY}`}</th>
                        <th>{`${CONSTANT.SUPPLIER} ${CONSTANT.DESCRIPTION}`}</th>
                        <th>{`${CONSTANT.SUPPLIER} name with code`}</th>
                        <th>{`${CONSTANT.DATE}`}</th>
                        </tr>
                    </thead>
                    <tbody > 
                        {this.props.supplierDetail && this.props.supplierDetail.length > 0 &&
                            this.props.supplierDetail.map((item, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{item.SupplierCode}</td> 
                                        <td >{item.SupplierName}</td>
                                        <td>{item.SupplierEmail}</td>
                                        <td>{item.SupplierType}</td> 
                                        <td>{item.CityName}</td> 
                                        <td>{item.Description}</td> 
                                        <td>{item.SupplierNameWithCode}</td>
                                        <td>{convertISOToUtcDate(item.CreatedDate)}</td>
                                    </tr>

                                )
                        })}
                    </tbody>  
                </Table> 
                </Col>
                {isOpen && (
                    <AddSupplier
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
function mapStateToProps({ supplier }) {
    const { supplierDetail ,loading } = supplier;
    return { supplierDetail, loading }
}


export default connect(
    mapStateToProps, { getSupplierDetailAPI }
)(SupplierMaster);

