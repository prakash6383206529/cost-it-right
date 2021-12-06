import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, } from 'reactstrap';
import { alphaNumeric, checkWhiteSpaces, required, } from "../../../helper/validation";
import { renderText, } from "../../layout/FormInputs";
import { createFuel } from '../actions/Fuel';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import Drawer from '@material-ui/core/Drawer';

class AddFuelNameDrawer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      unitTypes: []
    }
  }

  /**
  * @method componentDidMount
  * @description called after render the component
  */
  componentDidMount() {

  }

  /**
  * @method toggleModel
  * @description Used to cancel modal
  */
  toggleModel = () => {
    this.props.onCancel();
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
    const { reset } = this.props;
    reset();
    this.toggleDrawer('')
  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = (values) => {
    /** Update detail of the existing UOM  */
    if (this.props.isEditFlag) {

    } else {
      /** Add detail for creating new UOM  */
      let reqData = {
        FuelName: values.FuelName.trim(),
      }
      this.props.reset()
      this.props.createFuel(reqData, (res) => {
        if (res.data.Result === true) {
          Toaster.success(MESSAGES.FUEL_ADD_SUCCESS);
          this.toggleDrawer('');
        }
      });
    }
  }

  handleKeyDown = function (e) {
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault();
    }
  };

  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { handleSubmit, isEditFlag, } = this.props;
    return (
      <Drawer
        anchor={this.props.anchor}
        open={this.props.isOpen}
      // onClose={(e) => this.toggleDrawer(e)}
      >
        <Container>
          <div className={"drawer-wrapper"}>
            <form
              noValidate
              className="form"
              onSubmit={handleSubmit(this.onSubmit.bind(this))}
              onKeyDown={(e) => { this.handleKeyDown(e, this.onSubmit.bind(this)); }}
            >
              <Row className="drawer-heading">
                <Col>
                  <div className={"header-wrapper left"}>
                    <h3>{isEditFlag ? "UPDATE FUEL" : "ADD FUEL"}</h3>
                  </div>
                  <div
                    onClick={(e) => this.toggleDrawer(e)}
                    className={"close-button right"}
                  ></div>
                </Col>
              </Row>

              <Row className="pl-3">
                <div className="input-group form-group col-md-12 input-withouticon">
                  <Field
                    label="Fuel Name"
                    name={"FuelName"}
                    type="text"
                    placeholder={""}
                    validate={[required, alphaNumeric, checkWhiteSpaces]}
                    component={renderText}
                    required={true}
                    maxLength={26}
                    customClassName={"withBorder"}
                  />
                </div>
              </Row>

              <Row className="sf-btn-footer no-gutters justify-content-between">
                <div className="col-sm-12 text-right px-3">
                  <button
                    type={"button"}
                    className=" mr15 cancel-btn"
                    onClick={this.cancel}
                  >
                    <div className={"cancel-icon"}></div>
                    {"Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="user-btn  save-btn"
                  >
                    <div className={"save-icon"}></div>
                    {isEditFlag ? "Update" : "Save"}
                  </button>
                </div>
              </Row>
            </form>
          </div>
        </Container>
      </Drawer>
    );
  }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps() {
  let initialValues = {};
  return { initialValues };
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
  createFuel,
})(reduxForm({
  form: 'AddFuelNameDrawer',
  enableReinitialize: true,
})(AddFuelNameDrawer));
