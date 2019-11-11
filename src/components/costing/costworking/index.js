import React, { Component } from 'react';
import { connect } from 'react-redux';
import { UncontrolledCollapse, Button, CardBody, Card,Col } from 'reactstrap';
import { Loader } from '../../common/Loader';
import { CONSTANT } from '../../../helper/AllConastant';
import { toastr } from 'react-redux-toastr';
import classnames from 'classnames';
import AddWeightCosting from './AddWeightCosting';


class CostWorking extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: '1',
            isOpen: false
        }
    }

    /**
     * @method componentDidMount
     * @description  called before mounting the component
     */
    componentDidMount() {

    }

    /**
   * @method toggle
   * @description toggling the tabs
   */
    toggle = (tab) => {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
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
        this.setState({ isOpen: false });
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen } = this.state;
        return (
            <div>
                {this.props.loading && <Loader />}
                <Col md="12">
                    <h5>{`Cost working`}</h5>
                    <hr/>
                    <Button color="secondary" id="toggler" style={{ marginBottom: '3rem' }}>
                        New Costing
                    </Button>
                    <UncontrolledCollapse toggler="#toggler">
                    <Card>
                        <CardBody>
                           <Col><button>Add RM</button></Col> 
                           <hr/>
                           <Col><button onClick={this.openModel}>Add Weight</button></Col>
                           <hr/>
                           <Col><button>Add BOP</button></Col>
                           <hr/>
                           <Col><button>Add Process</button></Col>
                           <hr/>
                           <Col><button>Add other operation</button></Col>
                           <hr/>
                        </CardBody>
                    </Card>
                    </UncontrolledCollapse>
                </Col>
                {isOpen && (
                    <AddWeightCosting
                        isOpen={isOpen}
                        onCancel={this.onCancel}
                    />
                )}

            </div >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ }) {
    return {}
}


export default connect(
    mapStateToProps, null
)(CostWorking);

