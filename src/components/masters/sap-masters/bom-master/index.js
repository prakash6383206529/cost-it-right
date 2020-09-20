import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Button, } from 'reactstrap';
import { getAllBOMAPI, deleteBOMAPI } from '../../../../actions/master/BillOfMaterial';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';

class BOMMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            BOMId: ''
        }
    }

    /**
     * @method componentDidMount
     * @description  Called before rendering the component
     */
    componentDidMount() {
        this.props.getAllBOMAPI(res => { });
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
    * @method editItem
    * @description confirm delete item
    */
    editItem = (index, Id) => {
        this.setState({
            isEditFlag: true,
            isOpen: true,
            BOMId: Id,
            editIndex: index,
        })
    }

    /**
        * @method deleteItem
        * @description confirm delete item
        */
    deleteItem = (index, Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDeletePart(index, Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(`Are you sure you want to delete This BOM ?`, toastrConfirmOptions);
    }

    /**
        * @method confirmDeleteBOM
        * @description confirm delete BOM
        */
    confirmDeletePart = (index, BomId) => {
        this.props.deleteBOMAPI(BomId, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.BOM_DELETE_SUCCESS);
                this.props.getAllBOMAPI(res => { });
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
        return (
            <Container className="top-margin">
                {this.props.loading && <Loader />}
                <Row>
                    <Col>
                        <h3>{`${CONSTANT.BOM} ${CONSTANT.MASTER}`}</h3>
                    </Col>
                    <Col>
                        <Button onClick={this.openModel}>{`${CONSTANT.ADD} ${CONSTANT.BOM} `}</Button>
                    </Col>
                </Row>

            </Container >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ billOfMaterial }) {
    const { BOMListing, loading } = billOfMaterial;
    return { BOMListing, loading }
}


export default connect(
    mapStateToProps, {
    getAllBOMAPI,
    deleteBOMAPI
}
)(BOMMaster);

