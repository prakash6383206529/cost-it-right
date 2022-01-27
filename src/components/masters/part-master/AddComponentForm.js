import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { required, maxLength5, postiveNumber, minValue1, acceptAllExceptSingleSpecialCharacter, } from "../../../helper/validation";
import { renderText } from "../../layout/FormInputs";
import { getComponentPartSelectList, getDrawerComponentPartData, } from '../actions/Part';
import { COMPONENT_PART } from '../../../config/constants';
import AsyncSelect from 'react-select/async';
import TooltipCustom from '../../common/Tooltip';
class AddComponentForm extends Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    this.state = {
      part: [],
      parentPart: [],
      isAddMore: false,
      selectedParts: [],
      updateAsyncDropdown: false,
      isPartNoNotSelected: false,

    }
  }

  /**
 * @method componentDidMount
 * @description called after render the component
 */
  componentDidMount() {
    const { BOMViewerData } = this.props;
    this.props.getComponentPartSelectList(() => { })

    let tempArr = [];
    BOMViewerData && BOMViewerData.map(el => {
      if (el.PartType === COMPONENT_PART) {
        tempArr.push(el.PartId)
      }
      return null;
    })

    this.setState({ selectedParts: tempArr })
  }

  componentWillUnmount() {
    this.props.getDrawerComponentPartData('', res => { })
  }

  checkRadio = (radioType) => {
    this.setState({ childType: radioType })
  }

  /**
  * @method handlePartChange
  * @description  used to handle 
  */
  handlePartChange = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ part: newValue, isPartNoNotSelected: false }, () => {
        const { part } = this.state;
        this.props.getDrawerComponentPartData(part.value, res => { })
      });
    } else {
      this.setState({ part: [], });
      this.props.getDrawerComponentPartData('', res => { })
    }
  }

  /**
  * @method handleParentPartChange
  * @description  used to handle 
  */
  handleParentPartChange = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ parentPart: newValue, });
    } else {
      this.setState({ parentPart: [], });
    }
  }

  /**
  * @method renderListing
  * @description Used show listing of unit of measurement
  */
  renderListing = (label) => {
    const { componentPartSelectList } = this.props;
  
    const { BOMViewerData } = this.props;
    let tempArr = [];
    BOMViewerData && BOMViewerData.map(el => {
      if (el.PartType === COMPONENT_PART) {
        tempArr.push(el.PartId)
      }
      return null;
    })

    const temp = [];
    if (label === 'part') {
      componentPartSelectList && componentPartSelectList.map(item => {
        if (item.Value === '0' || tempArr.includes(item.Value)) return false;
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
    this.props.getDrawerComponentPartData('', res => { })
  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = (values) => {
    const { part, isAddMore } = this.state;
    const { DrawerPartData } = this.props;

    if (part.length <= 0) {
      this.setState({ isPartNoNotSelected: true })      // IF PART NO IS NOT SELECTED THEN WE WILL SHOW THE ERROR MESSAGE MANUALLY
      return false
    }
    this.setState({ isPartNoNotSelected: false })

    let childData = {
      PartNumber: part ? part : [],
      Position: { "x": 600, "y": 50 },
      Outputs: part ? part.label : '',
      InnerContent: DrawerPartData && DrawerPartData.Description !== undefined ? DrawerPartData.Description : '',
      PartName: part ? part : [],
      Quantity: values.Quantity,
      Level: "L1",
      selectedPartType: this.props.selectedPartType,
      PartType: this.props.selectedPartType.Text,
      PartTypeId: this.props.selectedPartType.Value,
      PartId: part ? part.value : '',
      Input: Math.floor(100000 + Math.random() * 900000),
    }
    this.props.getDrawerComponentPartData('', res => { })
    this.setState({
      part: []

    })

    this.props.change('PartNumber', [{ label: '', value: '' }])

    this.myRef.current.select.state.value = []
    if (isAddMore) {

      this.props.setChildParts(childData)
      this.setState({ updateAsyncDropdown: !this.state.updateAsyncDropdown })       //UPDATING RANDOM STATE FOR RERENDERING OF COMPONENT AFTER CLICKING ON ADD MORE BUTTON

    } else {

      this.props.toggleDrawer('', childData)
    }

    setTimeout(() => {
      this.setState({ updateAsyncDropdown: !this.state.updateAsyncDropdown })      // UPDATING RANDOM STATE AFTER 1 SECOND FOR REFRESHING THE ASYNC SELECT DROPDOWN AFTER CLICKING ON  ADD MORE BUTTON
    }, 1000);

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

    const filterList = (inputValue) => {
      let tempArr = []

      tempArr = this.renderListing("part").filter(i =>
        i.label!==null && i.label.toLowerCase().includes(inputValue.toLowerCase())
      );

      if (tempArr.length <= 100) {
        return tempArr
      } else {
        return tempArr.slice(0, 100)
      }
    };

    const promiseOptions = inputValue =>
      new Promise(resolve => {
        resolve(filterList(inputValue));


      });
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
              <label>{"Part No."}<span className="asterisk-required">*</span></label>
              <TooltipCustom customClass='child-component-tooltip' tooltipClass='component-tooltip-container' tooltipText="Please enter first few digits to see the part numbers" />
              <AsyncSelect name="PartNumber" ref={this.myRef} key={this.state.updateAsyncDropdown} cacheOptions defaultOptions loadOptions={promiseOptions} onChange={(e) => this.handlePartChange(e)} />
              {this.state.isPartNoNotSelected && <div className='text-help'>This field is required.</div>}
     
            </Col>
            <Col md="6">
              <Field
                label={`Part Name`}
                name={"PartName"}
                type="text"
                placeholder={""}
                validate={[acceptAllExceptSingleSpecialCharacter]}
                component={renderText}
                className=""
                customClassName={"withBorder"}
                disabled={true}
              />
            </Col>

            <Col md="6">
              <Field
                label={`Part Description`}
                name={"PartDescription"}
                type="text"
                placeholder={""}
                validate={[acceptAllExceptSingleSpecialCharacter]}
                component={renderText}
                className=""
                customClassName={"withBorder"}
                disabled={true}
              />
            </Col>
            <Col md="6">
              <Field
                label={`ECN No.`}
                name={"ECNNumber"}
                type="text"
                placeholder={""}
                validate={[]}
                component={renderText}
                className=""
                customClassName={"withBorder"}
                disabled={true}
              />
            </Col>

            <Col md="6">
              <Field
                label={`Revision No.`}
                name={"RevisionNumber"}
                type="text"
                placeholder={""}
                validate={[]}
                component={renderText}
                className=""
                customClassName={"withBorder"}
                disabled={true}
              />
            </Col>
            <Col md="6">
              <Field
                label={`Drawing No.`}
                name={"DrawingNumber"}
                type="text"
                placeholder={""}
                validate={[]}
                component={renderText}
                className=""
                customClassName={"withBorder"}
                disabled={true}
              />
            </Col>

            <Col md="6">
              <Field
                label={`Group Code`}
                name={"GroupCode"}
                type="text"
                placeholder={""}
                validate={[]}
                component={renderText}
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
                validate={[postiveNumber, maxLength5, required, minValue1]}
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
  const { componentPartSelectList, DrawerPartData } = part;

  let initialValues = {};
  if (DrawerPartData && DrawerPartData !== undefined) {
    initialValues = {
      PartName: DrawerPartData.PartName,
      PartDescription: DrawerPartData.Description,
      ECNNumber: DrawerPartData.ECNNumber,
      RevisionNumber: DrawerPartData.RevisionNumber,
      DrawingNumber: DrawerPartData.DrawingNumber,
      GroupCode: DrawerPartData.GroupCode,
      BOMNumber: DrawerPartData.BOMNumber,
    }

  }

  return { componentPartSelectList, DrawerPartData, initialValues, }
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
  getComponentPartSelectList,
  getDrawerComponentPartData,
})(reduxForm({
  form: 'AddComponentForm',
  enableReinitialize: true,
})(AddComponentForm));
