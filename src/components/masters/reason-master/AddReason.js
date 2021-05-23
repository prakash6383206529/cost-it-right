import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, } from 'reactstrap';
import { acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength80, required } from "../../../helper/validation";
import { renderText, focusOnError } from "../../layout/FormInputs";
import { createReasonAPI, getReasonAPI, updateReasonAPI, setEmptyReason } from '../actions/ReasonMaster';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message'
import { loggedInUserId } from '../../../helper/auth';
import $ from 'jquery';
import Drawer from '@material-ui/core/Drawer';
import LoaderCustom from '../../common/LoaderCustom';

class AddReason extends Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    this.state = {
      IsActive: true,
      ReasonId: '',
      DataToCheck: []
    }
  }

  /**
  * @method componentDidMount
  * @description called after render the component
  */
  componentDidMount() {
    this.getDetail()
  }

  /**
  * @method activeHandler
  * @description Used to for status
  */
  activeHandler = () => {
    this.setState({ IsActive: !this.state.IsActive })
  }

  /**
  * @method getDetail
  * @description used to get Reason detail
  */
  getDetail = () => {
    const { isEditFlag, ID } = this.props;
    if (isEditFlag) {
      this.setState({
        isLoader: true,
        ReasonId: ID,
      })
      $('html, body').animate({ scrollTop: 0 }, 'slow');
      setTimeout(() => {
        this.props.getReasonAPI(ID, res => {
          if (res && res.data && res.data.Data) {
            const Data = res.data.Data;
            this.setState({ DataToCheck: Data })
            this.setState({ IsActive: Data.IsActive })
          }
        })
        this.setState({ isLoader: false })
      }, 300);
    }
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
    this.setState({
      IsActive: true,
      isEditFlag: false,
    })
    this.props.setEmptyReason();
    this.toggleDrawer('')
  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = (values) => {
    const { ReasonId, DataToCheck } = this.state;
    const { isEditFlag } = this.props;

    /** Update detail of the existing UOM  */
    if (isEditFlag) {
      if (DataToCheck.Reason == values.Reason) {

        this.toggleDrawer('')
        return false
      }
      let formData = {
        ReasonId: ReasonId,
        Reason: values.Reason,
        IsActive: this.state.IsActive,
        LoggedInUserId: loggedInUserId(),
      }
      this.props.reset()
      this.props.updateReasonAPI(formData, (res) => {
        toastr.success(MESSAGES.UPDATE_REASON_SUCESS);
        this.cancel()
      });
    } else {

      /** Add detail for creating new UOM  */
      //values.IsActive = this.state.IsActive;
      values.IsActive = true;
      values.LoggedInUserId = loggedInUserId();


      this.props.reset()
      this.props.createReasonAPI(values, (res) => {
        if (res.data.Result === true) {
          toastr.success(MESSAGES.REASON_ADD_SUCCESS);
          this.cancel()
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
        {this.state.isLoader && <LoaderCustom />}
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
                    <h3>{isEditFlag ? "UPDATE REASON" : "ADD REASON"}</h3>
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
                    label={`Reason`}
                    name={"Reason"}
                    type="text"
                    placeholder={""}
                    validate={[required, checkWhiteSpaces, maxLength80, acceptAllExceptSingleSpecialCharacter]}
                    component={renderText}
                    required={true}
                    className=" "
                    customClassName=" withBorder"
                    disabled={this.state.isEditFlag ? true : false}
                  />
                </Col>
                {/* <Col md="6">
                                    <Col className={'pull-right'}>
                                        <label
                                            className="custom-checkbox pull-right"
                                            onChange={this.activeHandler}
                                        >
                                            Status
                                                <input
                                                type="checkbox"
                                                checked={this.state.IsActive}
                                                disabled={isEditFlag ? true : false}
                                            />
                                            <span
                                                className=" before-box"
                                                checked={this.state.IsActive}
                                                onChange={this.activeHandler}
                                            />
                                        </label>
                                    </Col>
                                </Col> */}
              </Row>

              <Row className="sf-btn-footer no-gutters justify-content-between px-3">
                <div className="col-sm-12 text-right px-3">
                  <button
                    type={"button"}
                    className=" mr15 cancel-btn"
                    onClick={this.cancel}
                  >
                    <div className={"cross-icon"}>
                      <img
                        src={require("../../../assests/images/times.png")}
                        alt="cancel-icon.jpg"
                      />
                    </div>{" "}
                    {"Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="user-btn save-btn"
                  >
                    <div className={"check-icon"}>
                      <img
                        src={require("../../../assests/images/check.png")}
                        alt="check-icon.jpg"
                      />{" "}
                    </div>
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
function mapStateToProps({ reason }) {
  const { reasonData } = reason;
  let initialValues = {};
  if (reasonData && reasonData !== undefined) {
    initialValues = {
      Reason: reasonData.Reason,
    }
  }
  return { reasonData, initialValues };
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
  createReasonAPI,
  getReasonAPI,
  updateReasonAPI,
  setEmptyReason,
})(reduxForm({
  form: 'AddReason',
  onSubmitFail: errors => {
    focusOnError(errors);
  },
  enableReinitialize: true,
})(AddReason));
