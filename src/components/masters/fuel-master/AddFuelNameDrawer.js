import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, } from 'reactstrap';
import { alphaNumeric, checkWhiteSpaces, required, requiredDropDown } from "../../../helper/validation";
import { renderText, searchableSelect, validateForm, } from "../../layout/FormInputs";
import { createFuel } from '../actions/Fuel';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import Drawer from '@material-ui/core/Drawer';
import { AcceptableFuelUOM } from '../../../config/masterData';
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from './TourMessages';
import { withTranslation } from 'react-i18next';
import Button from '../../layout/Button';
import { GUIDE_BUTTON_SHOW } from '../../../config/constants';

class AddFuelNameDrawer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      unitTypes: [],
      UOM: '',
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

  toggleDrawer = (event, reqData) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    this.props.closeDrawer('', reqData)
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
    if (!this.props.isEditFlag) {
      /** Add detail for creating new UOM  */
      let reqData = {
        FuelName: values.FuelName,
        UnitOfMeasurementId: this.state.UOM.value,
      }
      // this.props.reset()
      this.props.createFuel(reqData, (res) => {
        if (res?.data?.Result === true) {
          Toaster.success(MESSAGES.FUEL_ADD_SUCCESS);
          this.toggleDrawer('', reqData);
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
  * @method renderListing
  * @description Used to show type of listing
  */
  renderListing = (label) => {
    const { UOMSelectList } = this.props;
    const temp = [];

    if (label === 'uom') {
      UOMSelectList && UOMSelectList.map(item => {
        const accept = AcceptableFuelUOM.includes(item.Type)
        if (accept === false) return false
        if (item.Value === '0') return false;
        temp.push({ label: item.Display, value: item.Value })
        return null
      });
      return temp;
    }

  }

  /**
  * @method handleUOM
  * @description called
  */
  handleUOM = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ UOM: newValue, })
    } else {
      this.setState({ UOM: [] })
    }
  };

  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { handleSubmit, isEditFlag, t } = this.props;
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
                    <h3>{isEditFlag ? "Update " : "Add "}Fuel
                      <TourWrapper
                        buttonSpecificProp={{ id: "Add_Fuel_Drawer" }}
                        stepsSpecificProp={{
                          steps: Steps(t).ADD_FUEL_NAME_DRAWERS
                        }} />
                    </h3>
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
                    placeholder={"Enter"}
                    validate={[required, alphaNumeric, checkWhiteSpaces]}
                    component={renderText}
                    required={true}
                    maxLength={26}
                    customClassName={"withBorder"}
                  />
                </div>
                <div className="input-group form-group col-md-12 input-withouticon">
                  <Field
                    name="UnitOfMeasurementId"
                    type="text"
                    label="UOM"
                    component={searchableSelect}
                    placeholder={"Select"}
                    options={this.renderListing("uom")}
                    //onKeyUp={(e) => this.changeItemDesc(e)}
                    validate={
                      this.state.UOM == null ||
                        this.state.UOM.length === 0
                        ? [requiredDropDown]
                        : []
                    }
                    required={true}
                    handleChangeDescription={this.handleUOM}
                    valueDescription={this.state.UOM}
                    disabled={isEditFlag ? true : false}
                  />
                </div>
              </Row>

              <Row className="sf-btn-footer no-gutters justify-content-between">
                <div className="col-sm-12 text-right px-3">
                  <button id="AddFuelNameDrawer_Cancel"
                    type={"button"}
                    className=" mr15 cancel-btn"
                    onClick={this.cancel}
                  >
                    <div className={"cancel-icon"}></div>
                    {"Cancel"}
                  </button>
                  <button id="AddFuelNameDrawer_Save"
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
function mapStateToProps(state) {
  const { comman } = state;
  let initialValues = {};
  const { UOMSelectList } = comman;

  return { initialValues, UOMSelectList };
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
  validate: validateForm,
  enableReinitialize: true,
  touchOnChange: true
})(withTranslation(['FuelPowerMaster'])(AddFuelNameDrawer)),
)
