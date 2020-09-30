import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, } from 'reactstrap';
import { } from '../../../../actions/master/Part';
import { toastr } from 'react-redux-toastr';
import Drawer from '@material-ui/core/Drawer';

class VishualAdDrawer extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    /**
   * @method componentDidMount
   * @description called after render the component
   */
    componentDidMount() {
        //this.props.getLabourTypeSelectList(() => { })
    }

    toggleDrawer = (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        this.props.closeDrawer('')
    };



    /**
    * @method cancel
    * @description used to Reset form
    */
    cancel = () => {
        this.toggleDrawer('')
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { } = this.props;
        return (
            <div>
                <Drawer anchor={this.props.anchor} open={this.props.isOpen} onClose={(e) => this.toggleDrawer(e)}>
                    <Container>
                        <div className={'drawer-wrapper'}>

                            <Row className="drawer-heading">
                                <Col>
                                    <div className={'header-wrapper left'}>
                                        <h3>{'Visual Ad'}</h3>
                                    </div>
                                    <div
                                        onClick={(e) => this.toggleDrawer(e)}
                                        className={'close-button right'}>
                                    </div>
                                </Col>
                            </Row>

                            <Row>

                            </Row>

                        </div>
                    </Container>
                </Drawer>
            </div>
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps() {

    return {}
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {

})(VishualAdDrawer);
