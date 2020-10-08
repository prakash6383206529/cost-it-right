import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Label, } from 'reactstrap';
import { getSelectListPartType } from '../../../../actions/master/Part';
import { ASSEMBLY, COMPONENT_PART, BOUGHTOUTPART } from "../../../../config/constants";
import Drawer from '@material-ui/core/Drawer';
import HeaderTitle from '../../../common/HeaderTitle';
import AddAssemblyForm from './AddAssemblyForm';
import AddComponentForm from './AddComponentForm';
import AddBOPForm from './AddBOPForm';

class AddChildDrawer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditFlag: false,
            childType: ASSEMBLY,
            partType: [],
            selectedPartType: {},
        }
    }

    /**
   * @method componentDidMount
   * @description called after render the component
   */
    componentDidMount() {
        this.props.getSelectListPartType(res => {
            if (res && res.status === 200) {
                let Data = res.data.SelectList;
                this.setState({
                    partType: Data && Data.filter(el => el.Value !== '0'),
                    selectedPartType: Data && Data.find(el => el.Text === ASSEMBLY)
                })
            }
        })
    }

    checkRadio = (radioType) => {
        const { partType } = this.state;
        this.setState({ childType: radioType, selectedPartType: partType.find(el => el.Text === radioType) })
    }

    toggleDrawer = (event, childData = {}) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        this.props.closeDrawer('', childData)
    };

    setChildParts = (childData = {}) => {
        this.props.setChildPartsData(childData)
    }

    /**
    * @method cancel
    * @description used to Reset form
    */
    cancel = () => {
        const { reset } = this.props;
        reset();
        this.toggleDrawer('')
        //this.props.getRMSpecificationDataAPI('', res => { });
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isEditFlag, childType } = this.state;
        return (
            <div>
                <Drawer anchor={this.props.anchor} open={this.props.isOpen} onClose={(e) => this.toggleDrawer(e)}>
                    <Container>
                        <div className={'drawer-wrapper drawer-700px'}>

                            <Row className="drawer-heading">
                                <Col>
                                    <div className={'header-wrapper left'}>
                                        <h3>{isEditFlag ? 'Update Child' : 'Add Child'}</h3>
                                    </div>
                                    <div
                                        onClick={(e) => this.toggleDrawer(e)}
                                        className={'close-button right'}>
                                    </div>
                                </Col>
                            </Row>
                            <div className="drawer-body">
                                <Row>
                                    <Col md="12">
                                        <HeaderTitle
                                            title={'Type:'}
                                            customClass={'Personal-Details'} />
                                    </Col>
                                    <Col md="12">
                                        <Label sm={4} className={'pl0 pr0'} check>
                                            <input
                                                type="radio"
                                                name="childType"
                                                checked={childType === ASSEMBLY ? true : false}
                                                onClick={() => this.checkRadio(ASSEMBLY)}
                                            />{' '}
                                                Sub Assembly
                                            </Label>
                                        <Label sm={4} className={'pl0 pr0'} check>
                                            <input
                                                type="radio"
                                                name="childType"
                                                checked={childType === COMPONENT_PART ? true : false}
                                                onClick={() => this.checkRadio(COMPONENT_PART)}
                                            />{' '}
                                                Component
                                            </Label>
                                        <Label sm={4} className={'pl0 pr0'} check>
                                            <input
                                                type="radio"
                                                name="childType"
                                                checked={childType === BOUGHTOUTPART ? true : false}
                                                onClick={() => this.checkRadio(BOUGHTOUTPART)}
                                            />{' '}
                                                Bought Out Part
                                            </Label>
                                    </Col>
                                </Row>


                                {childType === ASSEMBLY &&
                                    <AddAssemblyForm
                                        toggleDrawer={this.toggleDrawer}
                                        selectedPartType={this.state.selectedPartType}
                                        setChildParts={this.setChildParts}
                                        BOMViewerData={this.props.BOMViewerData}
                                    />
                                }

                                {childType === COMPONENT_PART &&
                                    <AddComponentForm
                                        toggleDrawer={this.toggleDrawer}
                                        selectedPartType={this.state.selectedPartType}
                                        setChildParts={this.setChildParts}
                                        BOMViewerData={this.props.BOMViewerData}
                                    />
                                }

                                {childType === BOUGHTOUTPART &&
                                    <AddBOPForm
                                        toggleDrawer={this.toggleDrawer}
                                        selectedPartType={this.state.selectedPartType}
                                        setChildParts={this.setChildParts}
                                        BOMViewerData={this.props.BOMViewerData}
                                    />
                                }

                            </div>

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
    getSelectListPartType,
})(AddChildDrawer);
