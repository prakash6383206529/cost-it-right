import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, } from 'reactstrap';
import { required, acceptAllExceptSingleSpecialCharacter, maxLength80, checkWhiteSpaces, hashValidation } from "../../../helper/validation";
import { renderText, validateForm, } from "../../layout/FormInputs";
import { createRawMaterialNameChild, getRawMaterialChildById, updateRawMaterialChildName } from '../actions/Material';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { loggedInUserId } from "../../../helper/auth";
import Drawer from '@material-ui/core/Drawer';
import Button from '../../layout/Button';

class AddRawMaterial extends Component {
  constructor(props) {
    super(props);
    this.state = {

    }
  }

  /**
  * @method componentDidMount
  * @description Called after rendering the component
  */
  componentDidMount() {
    const { ID, isEditFlag } = this.props;
    if (isEditFlag) {
      this.props.getRawMaterialChildById(ID, res => {
        let Data = res.data.Data;
        this.props.change('RawMaterialName', Data.RawMaterialName)
      })
    }

  }

  /**
  * @method cancel
  * @description used to Reset form
  */
  cancel = (type) => {
    const { reset } = this.props;
    reset();
    this.toggleDrawer('', '', type)
  }

  toggleDrawer = (event, formData, type) => {

    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    this.props.closeDrawer('', formData, type)
  };

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = (values) => {
    const { ID, isEditFlag } = this.props;

    if (isEditFlag) {

      let formData = {
        RawMaterialId: ID,
        RawMaterialName: values.RawMaterialName,
        LoggedInUserId: loggedInUserId(),
      }
      this.props.reset()
      this.props.updateRawMaterialChildName(formData, (res) => {
        if (res.data.Result === true) {
          Toaster.success(MESSAGES.MATERIAL_UPDATE_SUCCESS);
          this.toggleDrawer('', values, 'submit')
        }
      })

    } else {
      values.LoggedInUserId = loggedInUserId();
      this.props.reset()
      this.props.createRawMaterialNameChild(values, (res) => {
        if (res.data.Result === true) {
          Toaster.success(MESSAGES.MATERIAL_ADDED_SUCCESS);
          this.toggleDrawer('', values, 'submit')
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
    const { handleSubmit, isEditFlag } = this.props;
    return (
      <>
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
                      <h3>
                        {isEditFlag
                          ? "Update Raw Material"
                          : "Add Raw Material"}
                      </h3>
                    </div>
                    <div
                      onClick={(e) => { this.toggleDrawer(e, '', 'cancel') }}
                      className={"close-button right"}
                    ></div>
                  </Col>
                </Row>
                <Row className="pl-3">
                  <Col md="12">
                    <Field
                      label={`Name`}
                      name={"RawMaterialName"}
                      type="text"
                      placeholder={"Enter"}
                      validate={[required, acceptAllExceptSingleSpecialCharacter, maxLength80, checkWhiteSpaces, hashValidation]}
                      component={renderText}
                      required={true}
                      className=" "
                      maxLength="80"
                      customClassName=" withBorder"
                    />
                  </Col>
                </Row>
                <Row className="sf-btn-footer no-gutters justify-content-between">
                  <div className="col-md-12 pl-3 pr-3">
                    <div className="text-right ">
                      <Button
                        id="AddRawMaterial_cancel"
                        onClick={(e) => { this.toggleDrawer(e, '', 'cancel') }}
                        variant="mr15 cancel-btn"
                        icon={"cancel-icon"}
                        buttonName={"Cancel"}
                      />
                      <Button
                        id="AddRawMaterial_submit"
                        type="submit"
                        className="save-btn"
                        icon={"save-icon"}
                        buttonName={this.props.isEditFlag ? "Update" : "Save"}
                      />
                    </div>
                  </div>
                </Row>
              </form>
            </div>
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
function mapStateToProps({ material }) {
  const { rawMaterialData } = material;

  let initialValues = {};
  if (rawMaterialData && rawMaterialData !== undefined) {
    initialValues = {
      RawMaterialName: rawMaterialData.RawMaterialName,
    }
  }

  return { initialValues, rawMaterialData }
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps,
  {
    createRawMaterialNameChild,
    getRawMaterialChildById,
    updateRawMaterialChildName,
  })(reduxForm({
    form: 'AddRawMaterial',
    validate: validateForm,
    enableReinitialize: true,
    touchOnChange: true
  })(AddRawMaterial));
