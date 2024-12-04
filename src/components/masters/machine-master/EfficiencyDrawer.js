import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Container, Row, Col, } from 'reactstrap';
import { required, number, checkForNull } from "../../../helper/validation";
import { renderText, validateForm, } from "../../layout/FormInputs";
import Drawer from '@material-ui/core/Drawer';
const selector = formValueSelector('EfficiencyDrawer');

class EfficiencyDrawer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            calculatedEfficiency: 0,
            NoOfWorkingHours: 0
        }
    }

    /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount() {
        this.props.change('NumberOfWorkingHoursPerYear', this.props.NumberOfWorkingHoursPerYear)
        this.props.change('ActualWorkingHrs', this.props.NoOfWorkingHours)
    }

    /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidUpdate(prevProps) {
        if (this.props.fieldsObj !== prevProps.fieldsObj) {
            const { fieldsObj } = this.props
            const NumberOfWorkingHoursPerYear = fieldsObj && fieldsObj.NumberOfWorkingHoursPerYear !== undefined ? checkForNull(fieldsObj.NumberOfWorkingHoursPerYear) : 0;
            const ActualWorkingHrs = fieldsObj && fieldsObj.ActualWorkingHrs !== undefined ? checkForNull(fieldsObj.ActualWorkingHrs) : 0;
            this.setState({ calculatedEfficiency: ActualWorkingHrs / NumberOfWorkingHoursPerYear * 100, NoOfWorkingHours: ActualWorkingHrs })
        }
    }

    toggleDrawer = (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        this.props.closeDrawer('', this.state.calculatedEfficiency, this.state.NoOfWorkingHours)
    };

    /**
    * @method calculateEfficiency
    * @description CALCULATING EFFICIENCY 
    */
    calculateEfficiency = () => {
        this.toggleDrawer('')
    }

    /**
    * @method cancel
    * @description used to Reset form
    */
    cancel = () => {

        if (this.props?.NoOfWorkingHours === 0) {
            this.props.change('ActualWorkingHrs', 0)
        }

        setTimeout(() => this.toggleDrawer(''), 100)
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => { }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, isEditFlag, } = this.props;
        return (
            <div>
                <Drawer anchor={this.props.anchor} open={this.props.isOpen}
                // onClose={(e) => this.toggleDrawer(e)}
                >
                    <Container>
                        <div className={'drawer-wrapper'}>
                            <form
                                noValidate
                                className="form"
                                onSubmit={handleSubmit(this.onSubmit.bind(this))}
                            >
                                <Row className="drawer-heading">
                                    <Col>
                                        <div className={'header-wrapper left'}>
                                            <h3>{isEditFlag ? 'Update Availability' : 'Calculate Availability'}</h3>
                                        </div>
                                        <div
                                            onClick={(e) => this.toggleDrawer(e)}
                                            className={'close-button right'}>
                                        </div>
                                    </Col>
                                </Row>
                                <Row className="pl-3">
                                    <Col md="12">
                                        <Field
                                            label={`No. of Working Hrs/Annum`}
                                            name={"NumberOfWorkingHoursPerYear"}
                                            type="text"
                                            placeholder={''}
                                            validate={[required, number]}
                                            component={renderText}
                                            required={true}
                                            className=" "
                                            customClassName=" withBorder"
                                            disabled={true}
                                        />
                                    </Col>
                                    <Col md="12">
                                        <Field
                                            label={`Actual Working Hrs`}
                                            name={"ActualWorkingHrs"}
                                            type="text"
                                            placeholder={''}
                                            validate={[required, number]}
                                            component={renderText}
                                            required={true}
                                            className=" "
                                            customClassName=" withBorder"
                                            disabled={false}
                                        />
                                    </Col>
                                </Row>

                                <Row className="sf-btn-footer no-gutters justify-content-between">
                                    <div className="col-sm-12 text-right px-3">
                                        <button
                                            type={'button'}
                                            className=" mr15 cancel-btn"
                                            onClick={this.cancel} >
                                            <div className={'cancel-icon'}></div> {'Cancel'}
                                        </button>
                                        <button
                                            type="button"
                                            className="user-btn save-btn"
                                            onClick={this.calculateEfficiency} >
                                            <div className={"save-icon"}></div>
                                            {isEditFlag ? 'Update' : 'Calculate'}
                                        </button>
                                    </div>
                                </Row>
                            </form>
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
function mapStateToProps(state) {
    const fieldsObj = selector(state, 'NumberOfWorkingHoursPerYear', 'ActualWorkingHrs',);
    let initialValues = {};

    return { fieldsObj, initialValues }
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {

})(reduxForm({
    form: 'EfficiencyDrawer',
    validate: validateForm,
    enableReinitialize: true,
    touchOnChange: true
})(EfficiencyDrawer));
