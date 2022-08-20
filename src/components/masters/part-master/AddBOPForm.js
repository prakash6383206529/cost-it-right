import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { required, positiveAndDecimalNumber, postiveNumber, decimalNumberLimit } from "../../../helper/validation";
import { renderText } from "../../layout/FormInputs";
import { getBoughtOutPartSelectList, getDrawerBOPData } from '../actions/Part';
import { BOUGHTOUTPART, DIMENSIONLESS, SPACEBAR } from '../../../config/constants';
import LoaderCustom from '../../common/LoaderCustom';
import { PartEffectiveDate } from './AddAssemblyPart';
import AsyncSelect from 'react-select/async';
import { onFocus } from '../../../helper';

class AddBOPForm extends Component {
  static contextType = PartEffectiveDate

  constructor(props) {
    super(props);
    this.state = {
      assemblyPart: [],
      parentPart: [],
      BOPPart: [],
      isAddMore: false,
      titleObj: {},
      isLoader: false,
      updateAsyncDropdown: false,
      isBOPNoNotSelected: false,
      isDimensionless: false,
      showErrorOnFocus: false,
    }
  }

  /**
 * @method componentDidMount
 * @description called after render the component
 */
  componentDidMount() {
    this.setState({ isLoader: true })
    const date = this.context
    this.props.getBoughtOutPartSelectList(date, () => { this.setState({ isLoader: false }) })

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
      this.setState({ BOPPart: newValue, isPartNoNotSelected: false }, () => {
        const { BOPPart } = this.state;
        this.props.getDrawerBOPData(BOPPart.value, (res) => {
          if (res?.data?.Data?.UnitOfMeasurementType === DIMENSIONLESS) {
            this.setState({ isDimensionless: true })
          } else {
            this.setState({ isDimensionless: false })
          }
        })
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
    const temp = [];
    const { BOMViewerData } = this.props;                    //UPDATING BOMVIEWER DATA ON EVERY RENDERING OF DROPDOWN
    let tempArr = [];

    BOMViewerData && BOMViewerData.map(el => {
      if (el.PartType === BOUGHTOUTPART) {                           //UPDATING BOUGHT OUT PART IN TEMPARR
        tempArr.push(el.PartId)
      }
      return null;
    })


    if (label === 'BOPPart') {
      boughtOutPartSelectList && boughtOutPartSelectList.map(item => {
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
    //this.props.getRMSpecificationDataAPI('', res => { });
  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = (values) => {
    const { isAddMore, BOPPart } = this.state;
    const { DrawerPartData } = this.props;


    if (BOPPart.length <= 0) {
      this.setState({ isBOPNoNotSelected: true })      // IF PART NO IS NOT SELECTED THEN WE WILL SHOW THE ERROR MESSAGE MANUALLY
      return false
    }
    this.setState({ isBOPNoNotSelected: false })
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
      this.props.setChildParts(childData)
      this.setState({ updateAsyncDropdown: !this.state.updateAsyncDropdown })
      return false
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
    const { handleSubmit, isEditFlag, } = this.props;

    const filterList = (inputValue) => {
      let tempArr = []
      tempArr = this.renderListing("BOPPart").filter(i =>
        i.label !== null && i.label.toLowerCase().includes(inputValue.toLowerCase())
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
              <label>{"BOP Part No."}<span className="asterisk-required">*</span></label>
              <div className='p-relative'>
                {this.state.isLoader && <LoaderCustom customClass="input-loader" />}
                <AsyncSelect
                  name="BOPPartNumber"
                  ref={this.myRef}
                  key={this.state.updateAsyncDropdown}
                  cacheOptions
                  loadOptions={promiseOptions}
                  onChange={(e) => this.handleBOPPartChange(e)}
                  noOptionsMessage={({ inputValue }) => !inputValue ? 'Please enter first few digits to see the BOP numbers' : "No results found"}
                  onFocus={() => onFocus(this)}
                  onKeyDown={(onKeyDown) => {
                    if (onKeyDown.keyCode === SPACEBAR && !onKeyDown.target.value) onKeyDown.preventDefault();
                  }}
                />
                {((this.state.showErrorOnFocus && this.state.BOPPart.length === 0) || this.state.isBOPNoNotSelected) && <div className='text-help'>This field is required.</div>}
              </div>
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
                title={this.props.initialValues.Specification}
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
                validate={[(this.state.isDimensionless ? postiveNumber : positiveAndDecimalNumber), required, decimalNumberLimit]}
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
  touchOnChange: true
})(AddBOPForm));
