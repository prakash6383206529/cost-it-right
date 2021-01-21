import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, } from 'reactstrap';
import { required, } from "../../../helper/validation";
import { renderText, renderMultiSelectField, } from "../../layout/FormInputs";
import { createMachineType } from '../actions/MachineMaster';
import { getLabourTypeSelectList } from '../../../actions/Common';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import { loggedInUserId } from "../../../helper/auth";
import Drawer from '@material-ui/core/Drawer';

class AddMachineTypeDrawer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            labourType: [],
        }
    }

    /**
   * @method componentDidMount
   * @description called after render the component
   */
    componentDidMount() {
        this.props.getLabourTypeSelectList(() => { })
    }

    toggleDrawer = (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        this.props.closeDrawer('')
    };

    /**
    * @method renderListing
    * @description Used show listing of unit of measurement
    */
    renderListing = (label) => {
        const { labourTypeSelectList } = this.props;
        const temp = [];

        if (label === 'labourList') {
            labourTypeSelectList && labourTypeSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ Text: item.Text, Value: item.Value })
                return null;
            });
            return temp;
        }

    }

    /**
    * @method labourHandler
    * @description called
    */
    labourHandler = (e) => {
        this.setState({ labourType: e });
    };

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
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { labourType } = this.state;

        let labourTypeIds = labourType && labourType.map(el => el.Value)

        /** Update existing detail of supplier master **/
        if (this.props.isEditFlag) {

            // this.props.updateSupplierAPI(formData, (res) => {
            //     if (res.data.Result) {
            //         toastr.success(MESSAGES.UPDATE_SUPPLIER_SUCESS);
            //         this.toggleDrawer('')
            //     }
            // });

        } else {/** Add new detail for creating supplier master **/
            let formData = {
                MachineType: values.MachineType,
                LoggedInUserId: loggedInUserId(),
                LabourTypeIds: labourTypeIds
            }

            this.props.createMachineType(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.MACHINE_TYPE_ADD_SUCCESS);
                    this.toggleDrawer('')
                }
            });
        }

    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, isEditFlag, } = this.props;
        return (
          <div>
            <Drawer
              anchor={this.props.anchor}
              open={this.props.isOpen}
              onClose={(e) => this.toggleDrawer(e)}
            >
              <Container>
                <div className={"drawer-wrapper"}>
                  <form
                    noValidate
                    className="form"
                    onSubmit={handleSubmit(this.onSubmit.bind(this))}
                  >
                    <Row className="drawer-heading">
                      <Col>
                        <div className={"header-wrapper left"}>
                          <h3>
                            {isEditFlag
                              ? "Update Machine Type"
                              : "Add Machine Type"}
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
                          label={`Machine Type`}
                          name={"MachineType"}
                          type="text"
                          placeholder={""}
                          validate={[required]}
                          component={renderText}
                          required={true}
                          className=" "
                          customClassName=" withBorder"
                        />
                      </Col>
                      <Col md="12" className="mb-3">
                        <Field
                          label="Labour Type"
                          name="LabourTypeIds"
                          placeholder="--Select--"
                          selection={
                            this.state.labourType == null ||
                            this.state.labourType.length === 0
                              ? []
                              : this.state.labourType
                          }
                          options={this.renderListing("labourList")}
                          selectionChanged={this.labourHandler}
                          optionValue={(option) => option.Value}
                          optionLabel={(option) => option.Text}
                          component={renderMultiSelectField}
                          mendatory={true}
                          className="multiselect-with-border"
                          disabled={false}
                        />
                      </Col>
                    </Row>
                  </form>
                  <Row className="sf-btn-footer no-gutters justify-content-between px-3">
                    <div className="col-sm-12 text-right px-3">
                      <button
                        type={"button"}
                        className="reset mr15 cancel-btn"
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
                        className="submit-button  save-btn"
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
function mapStateToProps({ comman }) {
    const { labourTypeSelectList } = comman;

    let initialValues = {};
    // if (supplierData && supplierData !== undefined) {
    //     initialValues = {
    //         VendorName: supplierData.VendorName,
    //     }
    // }
    return { labourTypeSelectList, initialValues }
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    createMachineType,
    getLabourTypeSelectList,
})(reduxForm({
    form: 'AddMachineTypeDrawer',
    enableReinitialize: true,
})(AddMachineTypeDrawer));
