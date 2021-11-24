import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, } from 'reactstrap';
import { required, decimalLengthFour, checkWhiteSpaces, acceptAllExceptSingleSpecialCharacter, positiveAndDecimalNumber } from "../../../helper/validation";
import { renderText } from "../../layout/FormInputs";
import { createMaterialTypeAPI, getMaterialDetailAPI, getMaterialTypeDataAPI, updateMaterialtypeAPI } from '../actions/Material';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { loggedInUserId } from "../../../helper/auth";
import Drawer from '@material-ui/core/Drawer';
import saveImg from '../../../assests/images/check.png'
import cancelImg from '../../../assests/images/times.png'

class AddMaterialType extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditFlag: false,
      isShowForm: false,
      MaterialTypeId: '',
      DataToChange: []
    }
  }

  /**
  * @method componentDidMount
  * @description Called after rendering the component
  */
  componentDidMount() {
    const { ID, isEditFlag } = this.props;
    if (isEditFlag) {
      this.props.getMaterialTypeDataAPI(ID, res => { });
    } else {
      this.props.getMaterialTypeDataAPI('', res => { });
    }
  }

  /**
  * @method cancel
  * @description used to Reset form
  */
  cancel = () => {
    const { reset } = this.props;
    reset();
    this.props.getMaterialTypeDataAPI('', res => { });
    this.toggleDrawer('')
  }

  toggleDrawer = (event, formData) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    this.props.closeDrawer('', formData)
  };

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = (values) => {
    const { reset, ID, isEditFlag, DataToChange, initialValues } = this.props;

    if (isEditFlag) {



      if (initialValues.CalculatedDensityValue == values.CalculatedDensityValue && initialValues.MaterialType == values.MaterialType) {
        this.cancel()
        return false
      }
      let updateData = {
        MaterialTypeId: ID,
        ModifiedBy: loggedInUserId(),
        CreatedDate: '',
        MaterialType: values.MaterialType,
        CalculatedDensityValue: values.CalculatedDensityValue,
        IsActive: true
      }
      this.props.reset()
      this.props.updateMaterialtypeAPI(updateData, (res) => {
        if (res.data.Result) {
          Toaster.success(MESSAGES.MATERIAL_UPDATE_SUCCESS);
          this.props.getMaterialTypeDataAPI('', res => { });
          reset();
          this.toggleDrawer('', updateData)
        }
      })

    } else {

      let formData = {
        MaterialType: values.MaterialType,
        CalculatedDensityValue: values.CalculatedDensityValue,
        CreatedBy: loggedInUserId(),
        IsActive: true
      }
      this.props.reset()
      this.props.createMaterialTypeAPI(formData, (res) => {
        if (res.data.Result) {
          Toaster.success(MESSAGES.MATERIAL_ADDED_SUCCESS);
          this.props.getMaterialTypeDataAPI('', res => { });
          reset();
          this.toggleDrawer('', formData)
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
      <div>
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
                        {isEditFlag ? "Update Material" : "Add Material"}
                      </h3>
                    </div>
                    <div
                      onClick={(e) => this.toggleDrawer(e)}
                      className={"close-button right"}
                    ></div>
                  </Col>
                </Row>
                <Row className="pl-3">
                  <Col md="12">
                    <Field
                      label={`Material`}
                      name={"MaterialType"}
                      type="text"
                      placeholder={""}
                      validate={[required, checkWhiteSpaces, acceptAllExceptSingleSpecialCharacter]}
                      component={renderText}
                      required={true}
                      className=" "
                      customClassName=" withBorder mb-0"
                      maxLength="80"
                    />
                  </Col>
                  <Col md="12">
                    <Field
                      label={`Density (g/cm3)`}
                      name={"CalculatedDensityValue"}
                      type="text"
                      placeholder={""}
                      validate={[required, positiveAndDecimalNumber, decimalLengthFour]}
                      component={renderText}
                      required={true}
                      className=" withoutBorder"
                      customClassName=" withBorder"
                      maxLength="15"
                    />
                  </Col>
                </Row>

                <Row className=" no-gutters justify-content-between">
                  <div className="col-md-12">
                    <div className="text-right ">
                      {/* <input
                                                //disabled={pristine || submitting}
                                                onClick={this.cancel}
                                                type="button"
                                                value="Cancel"
                                                className="reset mr15 cancel-btn"
                                            />
                                            <input
                                                //disabled={isSubmitted ? true : false}
                                                type="submit"
                                                value={isEditFlag ? 'Update' : 'Save'}
                                                className="submit-button mr5 save-btn"
                                            /> */}
                      <button
                        onClick={this.cancel}
                        type="submit"
                        value="CANCEL"
                        className="mr15 cancel-btn"
                      >
                        <div className={"cancel-icon"}></div>
                        CANCEL
                      </button>
                      <button
                        type="submit"
                        // disabled={isSubmitted ? true : false}
                        className="user-btn save-btn"
                      >
                        {" "}
                        <div className={"save-icon"}></div>
                        {this.state.isEditFlag ? "UPDATE" : "SAVE"}
                      </button>
                    </div>
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
function mapStateToProps({ material }) {
  const { materialTypeData } = material;
  let initialValues = {};
  if (materialTypeData && materialTypeData !== undefined) {
    initialValues = {
      MaterialType: materialTypeData.MaterialType,
      CalculatedDensityValue: materialTypeData.Density,
    }
  }
  return { initialValues, materialTypeData }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
  createMaterialTypeAPI,
  getMaterialDetailAPI,
  getMaterialTypeDataAPI,
  updateMaterialtypeAPI
})(reduxForm({
  form: 'AddMaterialType',
  enableReinitialize: true,
})(AddMaterialType));
