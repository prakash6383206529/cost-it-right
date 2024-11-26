import React, { Component } from 'react';
import { renderText, validateForm } from '../layout/FormInputs';
import { connect } from "react-redux";
import Drawer from '@material-ui/core/Drawer';
import { Container, Row, Col, } from 'reactstrap';
import { Field, reduxForm } from 'redux-form';

class ImpactDrawer extends Component {

    /**
     * @method toggleDrawer
     * @description For closing the drawer
    */
    toggleDrawer = (event, value) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }

        this.setState({
            technology: [],
            level: [],
        })

        this.props.closeDrawer('', value)
    };


    cancel = () => {
        this.toggleDrawer('')
    }

    onSubmit = (values) => {

        const calaculatedValue = 5
        this.toggleDrawer('', calaculatedValue)
    }

    render() {
        const { handleSubmit } = this.props
        return (
            <div>
                {/* {isLoader && <Loader />} */}
                <Drawer className="add-update-level-drawer" anchor={this.props.anchor} open={this.props.isOpen}
                // onClose={(e) => this.toggleDrawer(e)}
                >
                    <Container>
                        <div className={'drawer-wrapper'}>
                            <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>

                                <Row className="drawer-heading">
                                    <Col className="d-flex">
                                        <div className={'header-wrapper left'}>
                                            <h3>{'Impact'}</h3>
                                        </div>
                                        <div
                                            onClick={(e) => this.toggleDrawer(e)}
                                            className={'close-button right'}>
                                        </div>
                                    </Col>
                                </Row>
                                <div className="drawer-body">

                                    <div className="row pr-0">
                                        <div className="input-group  form-group col-md-12 input-withouticon" >
                                            <Field
                                                label="Impact"
                                                name={'Impact'}
                                                type="text"
                                                placeholder={'Enter'}
                                                //validate={[required, checkWhiteSpaces, acceptAllExceptSingleSpecialCharacter, maxLength80]}
                                                component={renderText}
                                                //required={true}
                                                // maxLength={26}
                                                customClassName={'withBorder'}
                                            />

                                        </div>
                                        <div className="input-group col-md-12  form-group input-withouticon mb-0" >
                                            <Field
                                                label="Impact Price"
                                                name={"ImpactPrice"}
                                                type="text"
                                                placeholder={'Enter'}
                                                //validate={[required, checkWhiteSpaces, acceptAllExceptSingleSpecialCharacter, maxLength80]}
                                                component={renderText}
                                                //required={true}
                                                // maxLength={26}
                                                customClassName={'withBorder'}
                                            />
                                        </div>
                                        <div className="input-group col-md-12  form-group input-withouticon mb-0" >
                                            <Field
                                                label="Increase in Price"
                                                name={"IncreasePrice"}
                                                type="text"
                                                placeholder={'Enter'}
                                                //validate={[required, checkWhiteSpaces, acceptAllExceptSingleSpecialCharacter, maxLength80]}
                                                component={renderText}
                                                //required={true}
                                                // maxLength={26}
                                                customClassName={'withBorder'}
                                            />
                                        </div>
                                        <div className="text-right mt-0 col-md-12">
                                            <button
                                                type="submit"
                                                disabled={false}
                                                className="btn-primary save-btn">
                                                <div className={"save-icon"}></div>
                                                {'Save'}
                                            </button>
                                        </div>
                                    </div>


                                </div>

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
const mapStateToProps = (state) => {


    return {};
};

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {

})(reduxForm({
    form: 'ImpactDrawer',
    validate: validateForm,
    enableReinitialize: true,
    touchOnChange: true
})(ImpactDrawer));

// export default ImpactDrawer;