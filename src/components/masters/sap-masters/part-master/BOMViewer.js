import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from "redux-form";
import { Container, Row, Col, } from 'reactstrap';
import { } from "../../../../helper/validation";
import { } from "../../../layout/FormInputs";
import { getBOMViewerTree } from '../../../../actions/master/Part';
import { Flowpoint, Flowspace } from 'flowpoints';
import AddChildDrawer from './AddChildDrawer';
import Drawer from '@material-ui/core/Drawer';

class BOMViewer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            assemblyPart: [],
            parentPart: [],
            BOPPart: [],
            isAddMore: false,
            displayDeleteIcon: false,
            selected_point: null,

            flowpoints: [],
            isOpenChildDrawer: false,

            ActualBOMData: [],
            isCancel: false,
        }
    }

    /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount() {
        const { isEditFlag, PartId } = this.props;
        if (isEditFlag) {
            this.props.getBOMViewerTree(PartId, res => {
                if (res && res.status === 200) {
                    let Data = res.data.Data;
                    this.setState({ flowpoints: Data.FlowPoints })
                }
            })
        } else {
            this.setState({
                flowpoints: this.props.BOMViewerData,
                ActualBOMData: this.props.BOMViewerData,
            })
        }
    }

    childDrawerToggle = () => {
        this.setState({ isOpenChildDrawer: true })
    }

    closeChildDrawer = (e = '', childData = {}) => {
        this.setState({ isOpenChildDrawer: false }, () => {
            this.setChildPartsData(childData)
        })
    }

    /**
    * @method setChildPartsData
    * @description SET CHILD PARTS DATA IN ASSEMBLY AND BOMViewerData
    */
    setChildPartsData = (childData) => {
        const { flowpoints, } = this.state;

        let tempArray = [];
        let outputArray = [];

        const posX = flowpoints.length > 0 ? 450 * (flowpoints.length - 1) : 50;

        if (Object.keys(childData).length > 0) {
            tempArray.push(...flowpoints, {
                PartType: childData && childData.selectedPartType ? childData.selectedPartType.Text : '',
                PartNumber: childData && childData.PartNumber !== undefined ? childData.PartNumber.label : '',
                Position: { "x": posX, "y": 250 },
                Outputs: [],
                InnerContent: childData && childData.InnerContent !== undefined ? childData.InnerContent : '',
                PartName: childData && childData.PartNumber !== undefined ? childData.PartNumber.label : '',
                Quantity: childData && childData.Quantity !== undefined ? childData.Quantity : '',
                Level: 'L1',
                selectedPartType: childData.selectedPartType,
                PartId: childData.PartId,
            })

            tempArray && tempArray.map((el, i) => {
                if (el.Level === 'L1') {
                    outputArray.push(el.PartNumber)
                }
            })

            //GET INDEX OF L0 LEVEL OBJECTS
            let isAvailable = tempArray.findIndex(el => el.Level === 'L0')

            tempArray = Object.assign([...tempArray], { [isAvailable]: Object.assign({}, tempArray[isAvailable], { Outputs: outputArray, }) })
            setTimeout(() => {
                this.setState({ flowpoints: tempArray })
            }, 200)
        }
    }

    /**
    * @method deleteLevelOne
    * @description DELETE LEVEL 1 PART
    */
    deleteLevelOne(index) {
        const { flowpoints } = this.state;

        let tempArray = flowpoints.filter((el, i) => {
            if (i === index) return false;
            return true;
        })
        this.setState({ flowpoints: tempArray })
    }

    toggleDrawer = (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }

        if (this.state.isCancel) {
            this.props.closeDrawer('', this.state.ActualBOMData)
        } else {
            this.props.closeDrawer('', this.state.flowpoints)
        }
    };

    /**
    * @method cancel
    * @description used to Reset form
    */
    cancel = () => {
        this.setState({ isCancel: true }, () => this.toggleDrawer(''))
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { flowpoints } = this.state;
        this.setState({ flowpoints })
        this.toggleDrawer('')
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, isEditFlag } = this.props;
        const { isOpenChildDrawer } = this.state;

        return (
            <>
                <Drawer anchor={this.props.anchor} open={this.props.isOpen} onClose={(e) => this.toggleDrawer(e)}>
                    <Container>
                        <div className={'drawer-wrapper drawer-1500px'}>

                            <Row className="drawer-heading">
                                <Col md="6">
                                    <div className={'header-wrapper left'}>
                                        <h3>{'BOM VIEWER'}</h3>
                                    </div>
                                </Col>
                                <Col md="6">
                                    <div
                                        onClick={(e) => this.toggleDrawer(e)}
                                        className={'close-button right'}>
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col md="8">
                                </Col>
                                {!isEditFlag &&
                                    <Col md="4">
                                        <button
                                            type={'button'}
                                            className="reset mr15 cancel-btn pull-right"
                                            onClick={() => this.setState({ displayDeleteIcon: true })} >
                                            <div className={'cross-icon'}><img src={require('../../../../assests/images/times.png')} alt='cancel-icon.jpg' /></div> {'Delete'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={this.childDrawerToggle}
                                            className={'user-btn mr15 pull-right mt10'}>
                                            <div className={'plus'}></div>ADD</button>
                                    </Col>}
                            </Row>

                            <form
                                noValidate
                                className="form"
                                onSubmit={handleSubmit(this.onSubmit.bind(this))}
                            >

                                <Row>
                                    <Flowspace
                                        theme="#2196f3"
                                        variant="outlined"
                                        arrowStart={false}
                                        arrowEnd={true}
                                        outputColor="#0c00ff"
                                        inputColor="#ff0022"
                                        style={{ height: "100vh", width: "100vw" }}
                                        onClick={e => this.setState({ selected_point: null })}
                                        selected={this.state.selected_point}>

                                        {
                                            this.state.flowpoints && this.state.flowpoints.map((el, i) => {

                                                return (
                                                    <Flowpoint
                                                        key={el.PartNumber}
                                                        snap={{ 'x': 10, 'y': 10 }}
                                                        startPosition={el.Position}
                                                        outputs={el.Outputs}
                                                        selected={false}
                                                        width={200}
                                                        height={120}
                                                        onClick={() => {
                                                            var selected_point = this.state.selected_point
                                                            if (selected_point === el.PartNumber) {
                                                                selected_point = null
                                                            } else {
                                                                selected_point = el.PartNumber
                                                            }
                                                            this.setState({ selected_point })
                                                        }}
                                                    // onDrag={position => {
                                                    //     var flowpoints = this.state.flowpoints
                                                    //     flowpoints[i].Position = position
                                                    //     this.setState({ flowpoints })
                                                    // }}
                                                    >
                                                        <div className="flowpoint-header">
                                                            <h3>{el.PartNumber}</h3>
                                                            <span className="flowpoint-header-level">{el.Level}</span>
                                                            <span className="flowpoint-header-qty">Qty:<strong>{el.Quantity}</strong></span>
                                                            <span className="flowpoint-header-delete">
                                                                {this.state.displayDeleteIcon && el.Level === 'L1' &&
                                                                    <button onClick={() => this.deleteLevelOne(i)}>x</button>}
                                                            </span>
                                                        </div>
                                                        <div className="flowpoint-body">

                                                            <p>Name:<strong>{el.PartName}</strong></p>
                                                            <p>Part Type:<strong>{el.PartType}</strong></p>

                                                        </div>
                                                    </Flowpoint>
                                                )
                                            })
                                        }

                                    </Flowspace>
                                </Row>

                                <Row className="sf-btn-footer no-gutters justify-content-between">
                                    <div className="col-sm-12 text-right bluefooter-butn">
                                        <button
                                            type={'button'}
                                            className="reset mr15 cancel-btn"
                                            onClick={this.cancel} >
                                            <div className={'cross-icon'}><img src={require('../../../../assests/images/times.png')} alt='cancel-icon.jpg' /></div> {'Cancel'}
                                        </button>
                                        <button
                                            type="submit"
                                            className="submit-button mr5 save-btn"
                                        >
                                            <div className={'check-icon'}><img src={require('../../../../assests/images/check.png')} alt='check-icon.jpg' /> </div>
                                            {'Save'}
                                        </button>
                                    </div>
                                </Row>

                            </form>


                        </div>
                        {isOpenChildDrawer && <AddChildDrawer
                            isOpen={isOpenChildDrawer}
                            closeDrawer={this.closeChildDrawer}
                            isEditFlag={false}
                            ID={''}
                            anchor={'right'}
                            setChildPartsData={this.setChildPartsData}
                        />}
                    </Container>
                </Drawer>
            </>
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
    getBOMViewerTree,
})(reduxForm({
    form: 'BOMViewer',
    enableReinitialize: true,
})(BOMViewer));
