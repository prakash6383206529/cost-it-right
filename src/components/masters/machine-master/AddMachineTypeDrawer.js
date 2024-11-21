import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, } from 'reactstrap';
import { getLabourTypeByMachineTypeSelectList, getLabourTypeDetailsForMachineType, updateLabourTypeForMachineType } from '../actions/Labour'
import { required, checkWhiteSpaces, acceptAllExceptSingleSpecialCharacter, hashValidation } from "../../../helper/validation";
import { renderText, renderMultiSelectField, validateForm, } from "../../layout/FormInputs";
import { createMachineType } from '../actions/MachineMaster';
import { getLabourTypeSelectList } from '../../../actions/Common';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { loggedInUserId } from "../../../helper/auth";
import Drawer from '@material-ui/core/Drawer';
import { showDataOnHover } from '../../../helper';

class AddMachineTypeDrawer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      labourType: [],
      DropdownChanged: true,
      labourIdFromTable: []
    }
  }

  /**
 * @method componentDidMount
 * @description called after render the component
 */
  componentDidMount() {
    this.props.getLabourTypeSelectList(() => { })
    this.props.isEditFlag && this.getDetails();
    let tempArray = [];
    this.props.gridTable.map(e => {
      if (this.props.machineTypeId === e.MachineTypeId.toString()) {
        tempArray.push(e.LabourTypeId.toString())
        return e.LabourTypeId
      }
      return null
    }
    )
    this.setState({ labourIdFromTable: tempArray })
  }
  getDetails = () => {
    this.props.getLabourTypeDetailsForMachineType(this.props.machineTypeId, (res) => {
      if (res && res.data && res.data.Data) {
        let Data = res.data.Data;
        let tempArr = [];
        Data && Data.LabourTypes && Data.LabourTypes.map(item => {
          tempArr.push({ Text: item.LabourTypeName, Value: item.LabourTypeId.toString() })
          return null;
        })
        setTimeout(() => {
          this.setState({ labourType: tempArr })
          this.props.change('MachineType', Data.MachineTypeName)
        }, 400);
      }
    })
  }
  toggleDrawer = (event, formData) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    this.props.closeDrawer('', formData)
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


  labourHandler = (e, option) => {

    if (this.state.labourIdFromTable.includes(option.removedValue && option.removedValue.Value)) {
      Toaster.warning("This labour type exist in the table");
      return;
    }

    this.setState({ labourType: e, DropdownChanged: false });
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
    // let entryInGrid = this.props.gridTable && this.props.gridTable.map(item => item.LabourTypeId)
    // let filteredMachineTypeLabour = this.props.gridTable && this.props.gridTable.filter(e => 
    //   )

    let labourTypeArray = [];
    labourType && labourType.map(item => {
      labourTypeArray.push({ LabourTypeName: item.Text, LabourTypeId: item.Value, IsAssociated: false })
      return null
    })
    if (labourTypeArray.length === 0) {
      return false
    }
    /** Update existing detail of supplier master **/
    if (this.props.isEditFlag) {

      if (this.state.DropdownChanged) {
        this.toggleDrawer('', 'cancel')
        return false
      }
      let formData = {
        MachineTypeId: Number(this.props.machineTypeId),
        MachineTypeName: values.MachineType,
        LabourTypes: labourTypeArray
      }
      this.props.updateLabourTypeForMachineType(formData, (res) => {
        if (res?.data?.Result) {
          Toaster.success(MESSAGES.UPDATE_MACHINE_TYPE_SUCESS);
          this.toggleDrawer('', formData)
        }
      })

    } else {/** Add new detail for creating supplier master **/
      let formData = {
        MachineType: values.MachineType,
        LoggedInUserId: loggedInUserId(),
        LabourTypeIds: labourTypeIds
      }
      this.props.reset()
      this.props.createMachineType(formData, (res) => {
        if (res?.data?.Result) {
          this.props.getLabourTypeByMachineTypeSelectList({ machineTypeId: res?.data?.Identity }, () => { })
          Toaster.success(MESSAGES.MACHINE_TYPE_ADD_SUCCESS);
          this.toggleDrawer('', formData)
        } else {
          this.setState({ labourType: [] })
        }
      });
    }

  }
  validateMachineType = (value) => {
    if (value && typeof value !== 'string') {
      return 'Machine Type must be a string';
    }

    if (value && value.length > 128) {
      return 'Machine Type must not exceed 128 characters';
    }
  };
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
                      placeholder={"Enter"}
                      validate={[required, checkWhiteSpaces, acceptAllExceptSingleSpecialCharacter, hashValidation, this.validateMachineType]}
                      component={renderText}
                      required={!isEditFlag}
                      className=" "
                      customClassName=" withBorder"
                      disabled={isEditFlag}
                    />
                  </Col>
                  <Col md="12" className="mb-3">
                    <Field
                      label="Labour Type"
                      name="LabourTypeIds"
                      placeholder="Select"
                      title={showDataOnHover(this.state.labourType)}
                      selection={
                        this.state.labourType == null || this.state.labourType.length === 0 ? [] : this.state.labourType}
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
                <Row className="sf-btn-footer no-gutters justify-content-between px-3">
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
  const { comman, labour } = state
  const { labourTypeSelectList } = comman;
  const { labourTypeDetailsForMachineType } = labour;
  let initialValues = {};
  // if (supplierData && supplierData !== undefined) {
  //     initialValues = {
  //         VendorName: supplierData.VendorName,
  //     }
  // }
  return { labourTypeSelectList, labourTypeDetailsForMachineType, initialValues }
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
  getLabourTypeByMachineTypeSelectList,
  getLabourTypeDetailsForMachineType,
  updateLabourTypeForMachineType
})(reduxForm({
  form: 'AddMachineTypeDrawer',
  validate: validateForm,
  enableReinitialize: true,
  touchOnChange: true
})(AddMachineTypeDrawer));
