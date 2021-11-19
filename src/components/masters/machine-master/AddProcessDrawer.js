import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Field, reduxForm, reset, formValueSelector } from 'redux-form'
import { Container, Row, Col } from 'reactstrap'
import { acceptAllExceptSingleSpecialCharacter, required } from '../../../helper/validation'
import { renderText } from '../../layout/FormInputs'
import { getMachineSelectList } from '../actions/MachineMaster'
import { getProcessCode, createProcess, updateProcess, getProcessData, } from '../actions/Process'
import { getPlantSelectList } from '../../../actions/Common'
import Toaster from '../../common/Toaster'
import { MESSAGES } from '../../../config/message'
import { loggedInUserId } from '../../../helper/auth'
import Drawer from '@material-ui/core/Drawer'
import moment from 'moment'
import LoaderCustom from '../../common/LoaderCustom'
import saveImg from '../../../assests/images/check.png'
import cancelImg from '../../../assests/images/times.png'
const selector = formValueSelector('AddProcessDrawer');

class AddProcessDrawer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedPlants: [],
      selectedMachine: [],
      ProcessId: '',
      effectiveDate: '',
      isLoader: false
    }
  }

  /**
   * @method componentDidMount
   * @description called after render the component
   */
  componentDidMount() {
    this.props.getPlantSelectList(() => { })
    this.props.getMachineSelectList(() => { })
    this.getData()
  }

  /**
   * @method getData
   * @description Used to get process data
   */
  getData = () => {
    const { isEditFlag, ID } = this.props

    if (isEditFlag) {
      this.setState({ isLoader: true })
      this.props.getProcessData(ID, res => {
        let Data = res.data.Data
        this.setState({
          ProcessId: Data.ProcessId,
          effectiveDate: moment(Data.EffectiveDate).isValid ? moment(Data.EffectiveDate)._d : ''
        })
        this.setState({ isLoader: false })
      })
    } else {
      this.props.getProcessData('', (res) => { })
    }
  }

  toggleDrawer = (event, formData) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return
    }
    this.props.closeDrawer('', formData)
  }

  checkProcessCode = (e) => {
    const { fieldsObj } = this.props
    const value = e.target.value
    if (fieldsObj === undefined) {
      this.props.getProcessCode(value, (res) => {
        if (res && res.data && res.data.Result) {
          let Data = res.data.DynamicData
          this.props.change('ProcessCode', Data.ProcessCode)
        }
      })
    }
  }

  /**
   * @method handlePlants
   * @description Used handle Plants
   */
  handlePlants = (e) => {
    this.setState({ selectedPlants: e })
  }

  /**
   * @method handleMachine
   * @description Used handle Machine
   */
  handleMachine = (e) => {
    this.setState({ selectedMachine: e })
  }

  /**
    * @method handleChange
    * @description Handle Effective Date
    */
  handleEffectiveDateChange = (date) => {
    this.setState({
      effectiveDate: date,
    })
  }

  /**
   * @method renderListing
   * @description Used show listing of unit of measurement
   */
  renderListing = (label) => {
    const { plantSelectList, machineSelectList } = this.props
    const temp = []
    if (label === 'machine') {
      machineSelectList && machineSelectList.map((item) => {
        if (item.Value === '0') return false
        temp.push({ Text: item.Text, Value: item.Value })
        return null
      })
      return temp
    }
    if (label === 'plant') {
      plantSelectList && plantSelectList.map((item) => {
        if (item.Value === '0') return false
        temp.push({ Text: item.Text, Value: item.Value })
        return null
      })
      return temp
    }
  }

  /**
   * @method cancel
   * @description used to Reset form
   */
  cancel = () => {
    const { reset } = this.props
    reset()
    // dispatch(reset('AddProcessDrawer'))
    this.toggleDrawer('')
  }

  /**
   * @method onSubmit
   * @description Used to Submit the form
   */
  onSubmit = (values) => {
    const { selectedPlants, selectedMachine, effectiveDate } = this.state
    const { isEditFlag, isMachineShow, ID } = this.props

    let plantArray =
      selectedPlants && selectedPlants.map((item) => ({
        PlantName: item.Text, PlantId: item.Value,
      }))

    let machineArray =
      selectedMachine && selectedMachine.map((item) => ({
        Machine: item.Text, MachineId: item.Value,
      }))

    /** Update existing detail of supplier master **/
    if (isEditFlag) {
      let formData = {
        ProcessId: ID,
        ProcessName: values.ProcessName,
        ProcessCode: values.ProcessCode,
        LoggedInUserId: loggedInUserId(),
      }
      this.props.reset()
      this.props.updateProcess(formData, (res) => {
        if (res.data.Result) {
          Toaster.success(MESSAGES.UPDATE_PROCESS_SUCCESS)
          this.toggleDrawer('', formData)
        }
      })
    } else {
      /** Add new detail for creating supplier master **/

      let formData = {
        ProcessName: values.ProcessName,
        ProcessCode: values.ProcessCode,
        EffectiveDate: moment(effectiveDate).local().format('YYYY/MM/DD'),
        LoggedInUserId: loggedInUserId(),
      }

      this.props.reset()
      this.props.createProcess(formData, (res) => {
        if (res.data.Result) {
          Toaster.success(MESSAGES.PROCESS_ADD_SUCCESS)
          this.toggleDrawer('', formData)
        }
      })
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
    const { handleSubmit, isEditFlag, isMachineShow } = this.props
    return (
      <div>

        <Drawer anchor={this.props.anchor} open={this.props.isOpen}
        // onClose={(e) => this.toggleDrawer(e)}
        >
          {this.state.isLoader && <LoaderCustom />}
          <Container>
            <div className={'drawer-wrapper'}>
              <form noValidate className="form"
                onSubmit={handleSubmit(this.onSubmit.bind(this))}
                onKeyDown={(e) => { this.handleKeyDown(e, this.onSubmit.bind(this)); }}
              >
                <Row className="drawer-heading">
                  <Col>
                    <div className={'header-wrapper left'}>
                      <h3>{isEditFlag ? 'Update Process' : 'Add Process'}</h3>
                    </div>
                    <div
                      onClick={(e) => this.toggleDrawer(e)}
                      className={'close-button right'}
                    ></div>
                  </Col>
                </Row>
                <Row className="ml-0">
                  <Col md="12">
                    <Field
                      label={`Process Name`}
                      name={'ProcessName'}
                      type="text"
                      placeholder={'Enter'}
                      validate={[required, acceptAllExceptSingleSpecialCharacter]}
                      component={renderText}
                      onBlur={this.checkProcessCode}
                      required={true}
                      className=" "
                      customClassName=" withBorder"
                    // disabled={isEditFlag ? true : false}
                    />
                  </Col>
                  <Col md="12">
                    <Field
                      label={`Process Code`}
                      name={'ProcessCode'}
                      type="text"
                      placeholder={'Enter'}
                      validate={[required]}
                      component={renderText}
                      required={true}
                      className=" "
                      customClassName=" withBorder"
                      disabled={isEditFlag ? true : false}
                    />
                  </Col>
                  {/* <Col md="12">
                    <div className="inputbox date-section mb-5">
                      <Field
                        label="Effective Date"
                        name="EffectiveDate"
                        selected={this.state.effectiveDate}
                        onChange={this.handleEffectiveDateChange}
                        type="text"
                        validate={[required]}
                        autoComplete={'off'}
                        required={true}
                        changeHandler={(e) => {
                          //e.preventDefault()
                        }}
                        component={renderDatePicker}
                        className=" "
                        disabled={isEditFlag ? true : false}
                        customClassName=" withBorder"
                      //minDate={moment()}
                      />
                    </div>
                  </Col> */}
                  {/* <Col md="12">
                    <Field
                      label="Plant"
                      name="Plant"
                      placeholder="Select"
                      selection={
                        this.state.selectedPlants == null || this.state.selectedPlants.length === 0 ? [] : this.state.selectedPlants}
                      options={this.renderListing('plant')}
                      selectionChanged={this.handlePlants}
                      optionValue={(option) => option.Value}
                      optionLabel={(option) => option.Text}
                      validate={(this.state.selectedPlants == null || this.state.selectedPlants.length === 0) ? [required] : []}
                      component={renderMultiSelectField}
                      mendatory={true}
                      className="multiselect-with-border"
                      disabled={false}
                    />
                  </Col> */}
                  {/* {isMachineShow && (
                    <Col md="12">
                      <Field
                        label="Machine"
                        name="Machine"
                        placeholder="Select"
                        selection={
                          this.state.selectedMachine == null || this.state.selectedMachine.length === 0 ? [] : this.state.selectedMachine}
                        options={this.renderListing('machine')}
                        selectionChanged={this.handleMachine}
                        optionValue={(option) => option.Value}
                        optionLabel={(option) => option.Text}
                        validate={(this.state.selectedMachine == null || this.state.selectedMachine.length === 0) ? [required] : []}
                        component={renderMultiSelectField}
                        mendatory={true}
                        className="multiselect-with-border"
                        disabled={false}
                      />
                    </Col>
                  )} */}
                </Row>

                <Row className="sf-btn-footer no-gutters justify-content-between">
                  <div className="col-sm-12 text-right px-3">
                    <button
                      type={'button'}
                      className="mr15 cancel-btn"
                      onClick={this.cancel}
                    >
                      <div className={"cancel-icon"}></div>
                      {'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="user-btn save-btn"
                    >
                      <div className={"save-icon"}></div>
                      {isEditFlag ? 'Update' : 'Save'}
                    </button>
                  </div>
                </Row>
              </form>
            </div>
          </Container>
        </Drawer>
      </div>
    )
  }
}

/**
 * @method mapStateToProps
 * @description return state to component as props
 * @param {*} state
 */
function mapStateToProps(state) {
  const { comman, machine, process } = state
  const { plantSelectList } = comman
  const { machineSelectList } = machine
  const { processUnitData } = process
  const fieldsObj = selector(state, 'ProcessCode')

  let initialValues = {}

  if (processUnitData && processUnitData !== undefined) {
    initialValues = {
      ProcessName: processUnitData.ProcessName,
      ProcessCode: processUnitData.ProcessCode,
    }
  }
  return { plantSelectList, machineSelectList, processUnitData, initialValues, fieldsObj }
}

/**
 * @method connect
 * @description connect with redux
 * @param {function} mapStateToProps
 * @param {function} mapDispatchToProps
 */
export default connect(mapStateToProps, {
  getProcessCode,
  createProcess,
  updateProcess,
  getProcessData,
  getPlantSelectList,
  getMachineSelectList,
})(
  reduxForm({
    form: 'AddProcessDrawer',
    enableReinitialize: true,
  })(AddProcessDrawer),
)
