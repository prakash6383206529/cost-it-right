import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { required, number, postiveNumber, maxLength5, minValue1, positiveAndDecimalNumber, } from "../../../helper/validation";
import { renderText, searchableSelect } from "../../layout/FormInputs";
import { getBoughtOutPartSelectList, getDrawerBOPData } from '../actions/Part';
import { } from '../../../actions/Common';
import { BOUGHTOUTPART } from '../../../config/constants';

class AddBOPForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      assemblyPart: [],
      parentPart: [],
      BOPPart: [],
      isAddMore: false,
      selectedParts: [],
    }
  }

  /**
 * @method componentDidMount
 * @description called after render the component
 */
  componentDidMount() {
    const { BOMViewerData } = this.props;
    let tempArr = [];

    this.props.getBoughtOutPartSelectList(() => { })

    BOMViewerData && BOMViewerData.map(el => {
      if (el.PartType === BOUGHTOUTPART) {
        tempArr.push(el.PartId)
      }
      return null;
    })

    this.setState({ selectedParts: tempArr })
  }

  checkRadio = (radioType) => {
    this.setState({ childType: radioType })
  }

  /**
  * @method handleBOPPartChange
  * @description  used to handle 
  */
  handleBOPPartChange = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ BOPPart: newValue }, () => {
        const { BOPPart } = this.state;
        this.props.getDrawerBOPData(BOPPart.value, () => { })
      });
    } else {
      this.setState({ BOPPart: [], });
      this.props.getDrawerBOPData('', () => { })
    }
  }

  /**
  * @method handleParentPartChange
  * @description  used to handle 
  */
  handleParentPartChange = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ parentPart: newValue });
    } else {
      this.setState({ parentPart: [], });
    }
  }

  /**
  * @method renderListing
  * @description Used show listing of unit of measurement
  */
  renderListing = (label) => {
    const { boughtOutPartSelectList } = this.props;
    const { selectedParts } = this.state;
    const temp = [];

    if (label === 'BOPPart') {
      boughtOutPartSelectList && boughtOutPartSelectList.map(item => {
        if (item.Value === '0' || selectedParts.includes(item.Value)) return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }

  }

  /**
  * @method cancel
  * @description used to Reset form
  */
  cancel = () => {
    const { reset } = this.props;
    reset();
    this.props.toggleDrawer('')
    //this.props.getRMSpecificationDataAPI('', res => { });
  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = (values) => {
    const { isAddMore, BOPPart } = this.state;
    const { DrawerPartData } = this.props;

    /** Update existing detail of supplier master **/
    let childData = {
      PartNumber: BOPPart ? BOPPart : [],
      Position: { "x": 600, "y": 50 },
      Outputs: BOPPart ? BOPPart.label : '',
      InnerContent: DrawerPartData && DrawerPartData.Description !== undefined ? DrawerPartData.Description : '',
      PartName: BOPPart ? BOPPart : [],
      Quantity: values.Quantity,
      Level: "L1",
      selectedPartType: this.props.selectedPartType,
      PartId: BOPPart ? BOPPart.value : '',
      PartType: this.props.selectedPartType.Text,
      PartTypeId: this.props.selectedPartType.Value,
      Input: Math.floor(100000 + Math.random() * 900000),
    }

    this.props.getDrawerBOPData('', () => { })

    if (isAddMore) {
      this.setState({
        BOPPart: []
      })
      this.props.setChildParts(childData)
    } else {
      this.props.toggleDrawer('', childData)
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
      <>
        <form
          noValidate
          className="form"
          onSubmit={handleSubmit(this.onSubmit.bind(this))}
          onKeyDown={(e) => { this.handleKeyDown(e, this.onSubmit.bind(this)); }}
        >
          <Row>
            <Col md="6">
              <Field
                name="BOPPartNumber"
                type="text"
                label={"BOP Part No."}
                component={searchableSelect}
                placeholder={"BOP Part"}
                options={this.renderListing("BOPPart")}
                //onKeyUp={(e) => this.changeItemDesc(e)}
                validate={
                  this.state.BOPPart == null ||
                    this.state.BOPPart.length === 0
                    ? [required]
                    : []
                }
                required={true}
                handleChangeDescription={this.handleBOPPartChange}
                valueDescription={this.state.BOPPart}
              />
            </Col>
            <Col md="6">
              <Field
                label={`BOP Part Name`}
                name={"BOPPartName"}
                type="text"
                placeholder={""}
                validate={[]}
                component={renderText}
                // required={true}
                className=""
                customClassName={"withBorder"}
                disabled={true}
              />
            </Col>

            <Col md="6">
              <Field
                label={`BOP Category`}
                name={"BOPCategory"}
                type="text"
                placeholder={""}
                validate={[]}
                component={renderText}
                // required={true}
                className=""
                customClassName={"withBorder"}
                disabled={true}
              />
            </Col>
            <Col md="6">
              <Field
                label={`Specification`}
                name={"Specification"}
                type="text"
                placeholder={""}
                //validate={[required]}
                component={renderText}
                //required={true}
                className=""
                customClassName={"withBorder"}
                disabled={true}
              />
            </Col>

            <Col md="6">
              <Field
                label={`Quantity`}
                name={"Quantity"}
                type="text"
                placeholder={""}
                validate={[positiveAndDecimalNumber, maxLength5, required, minValue1]}
                component={renderText}
                required={true}
                className=""
                customClassName={"withBorder"}
                disabled={false}
              />
            </Col>
          </Row>

          <Row className="sf-btn-footer no-gutters justify-content-between">
            <div className="col-sm-12 text-right d-flex align-items-center justify-content-end pr-3">
              <button
                type={"button"}
                className="reset mt-2 mr-2 cancel-btn"
                onClick={this.cancel}
              >
                <div className={"cancel-icon"}></div>
                {"Cancel"}
              </button>
              <button
                type={"submit"}
                className="submit-button mt-2 mr-2 save-btn"
                onClick={() => this.setState({ isAddMore: true })}
              >
                <div className={"plus"}></div>
                {"ADD MORE"}
              </button>
              <button
                type="submit"
                className="submit-button mt-2 save-btn"
                onClick={() => this.setState({ isAddMore: false })}
              >
                <div className={"save-icon"}></div>
                {isEditFlag ? "Update" : "Save"}
              </button>
            </div>
          </Row>
        </form>
      </>
    );
  }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ part }) {
  const { boughtOutPartSelectList, DrawerPartData } = part;

  let initialValues = {};
  if (DrawerPartData && DrawerPartData !== undefined) {
    initialValues = {
      BOPPartName: DrawerPartData.BoughtOutPartName,
      BOPCategory: DrawerPartData.Category,
      Specification: DrawerPartData.Specification,
    }
  }

  return { boughtOutPartSelectList, DrawerPartData, initialValues, }
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
  getBoughtOutPartSelectList,
  getDrawerBOPData,
})(reduxForm({
  form: 'AddBOPForm',
  enableReinitialize: true,
})(AddBOPForm));
