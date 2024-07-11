import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, clearFields, reduxForm } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { required, postiveNumber, maxLength5, minValue1, acceptAllExceptSingleSpecialCharacter } from "../../../helper/validation";
import { renderText } from "../../layout/FormInputs";
import { getAssemblyPartSelectList, getDrawerAssemblyPartDetail, } from '../actions/Part';
import { searchCount, SPACEBAR, ASSEMBLYNAME } from '../../../config/constants';
import { getRandomSixDigit, onFocus } from '../../../helper/util';
import LoaderCustom from '../../common/LoaderCustom';
import { PartEffectiveDate } from './AddAssemblyPart';
import AsyncSelect from 'react-select/async';
import { reactLocalStorage } from 'reactjs-localstorage';
import { autoCompleteDropdown } from '../../common/CommonFunctions';

class AddAssemblyForm extends Component {

    static contextType = PartEffectiveDate
    constructor(props) {
        super(props);
        this.myRef = React.createRef();
        this.state = {
            assemblyPart: [],
            parentPart: [],
            isAddMore: false,
            childData: [],
            isLoader: false,
            updateAsyncDropdown: false,
            issubAssembyNoNotSelected: false,
            showErrorOnFocus: false,
            partName: '',
            selectedParts: [],
            mainLoader: false
        }
    }

    /**
   * @method componentDidMount
   * @description called after render the component
   */
    componentDidMount() {
        const { BOMViewerData } = this.props;
        let tempArr = [];
        BOMViewerData && BOMViewerData.map(el => {
            if (el.PartType === ASSEMBLYNAME) {
                tempArr.push(el.PartId)
            }
            return null;
        })

        this.setState({ selectedParts: tempArr })
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.BOMViewerData !== prevProps.BOMViewerData) {
            const { BOMViewerData } = this.props;

            let tempArr = [];
            BOMViewerData && BOMViewerData.map(el => {
                if (el.PartType === ASSEMBLYNAME) {
                    tempArr.push(el.PartId)
                }
                return null;
            })
            this.setState({ selectedParts: tempArr })
        }
    }

    componentWillUnmount() {
        reactLocalStorage?.setObject('PartData', [])
    }

    /**
    * @method handleAssemblyPartChange
    * @description  used to handle 
    */
    handleAssemblyPartChange = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ assemblyPart: newValue, issubAssembyNoNotSelected: false, mainLoader: true }, () => {
                const { assemblyPart } = this.state;
                this.props.getDrawerAssemblyPartDetail(assemblyPart.value, res => {
                    let Data = res.data.Data
                    this.setState({ mainLoader: false })
                    this.props.change("ECNNumber", Data.ECNNumber)
                    this.props.change('DrawingNumber', Data.DrawingNumber)
                    this.props.change('RevisionNumber', Data.RevisionNumber)
                    this.props.change('AssemblyPartName', Data.AssemblyPartName)
                    this.props.change('PartDescription', Data.Description)
                    this.props.change('GroupCode', Data.GroupCodeList ? (Data.GroupCodeList.length > 0 ? (Data.GroupCodeList[0].GroupCode ? Data.GroupCodeList[0].GroupCode : "") : "") : "")
                })
            });
        } else {
            this.setState({ assemblyPart: [], });
            this.props.getDrawerAssemblyPartDetail('', res => { })
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
        const { BOMViewerData } = this.props;

        const { assemblyPartSelectList } = this.props;
        const { selectedParts } = this.state;
        let tempArr = [];
        BOMViewerData && BOMViewerData.map(el => {
            if (el.PartType === ASSEMBLYNAME) {
                tempArr.push(el.PartId)
            }
            return null;
        })
        //RE
        // const temp = [];
        // if (label === 'assemblyPart') {
        //     assemblyPartSelectList && assemblyPartSelectList.map(item => {
        //         if (item.Value === '0' || selectedParts.includes(item.Value)) return false;
        //         temp.push({ label: item.Text, value: item.Value })
        //         return null;
        //     });
        //     return temp;
        // }
    }

    /**
    * @method cancel
    * @description used to Reset form
    */
    cancel = () => {
        const { reset } = this.props;
        reset();
        this.props.toggleDrawer('')
        this.props.getDrawerAssemblyPartDetail('', res => { })
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { isAddMore, assemblyPart } = this.state;
        const { DrawerPartData } = this.props;
        if (assemblyPart.length <= 0) {
            this.setState({ issubAssembyNoNotSelected: true })
            return false
        }
        this.setState({ issubAssembyNoNotSelected: false })
        let childData = {
            PartNumber: assemblyPart ? assemblyPart : [],
            Position: { "x": 600, "y": 50 },
            Outputs: assemblyPart ? assemblyPart.label : '',
            InnerContent: DrawerPartData && DrawerPartData.Description !== undefined ? DrawerPartData.Description : '',
            PartName: assemblyPart ? assemblyPart : [],
            Quantity: values.Quantity,
            Level: "L1",
            selectedPartType: this.props.selectedPartType,
            PartType: this.props.selectedPartType.Text,
            PartTypeId: this.props.selectedPartType.Value,
            PartId: assemblyPart ? assemblyPart.value : '',
            Input: getRandomSixDigit(),
            Technology: DrawerPartData?.TechnologyName || '',
            RevisionNo: DrawerPartData?.RevisionNumber || null
        }

        this.props.getDrawerAssemblyPartDetail('', res => { })

        if (isAddMore) {
            const allInputFieldsName = ['AssemblyPartName', 'Quantity', 'RevisionNumber', 'ECNNumber', 'DrawingNumber', 'PartDescription', 'GroupCode'];
            allInputFieldsName.forEach(fieldName => {
                this.props.dispatch(clearFields('AddAssemblyForm', false, false, fieldName));
            });
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
        const { handleSubmit, isEditFlag, } = this.props;

        const filterList = async (inputValue) => {
            const { partName, selectedParts } = this.state
            if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
                inputValue = inputValue.trim();
            }
            const resultInput = inputValue.slice(0, searchCount)
            if (inputValue?.length >= searchCount && partName !== resultInput) {
                let obj = {
                    technologyId: this.props?.TechnologySelected.value,
                    date: this.context,
                    partNumber: resultInput,
                    isActive: true
                }
                this.setState({ isLoader: true })
                const res = await getAssemblyPartSelectList(obj)
                this.setState({ isLoader: false })
                this.setState({ partName: resultInput })
                let partDataAPI = res?.data?.SelectList
                if (inputValue) {
                    return autoCompleteDropdown(inputValue, partDataAPI, true, selectedParts, true)
                } else {
                    return partDataAPI
                }
            }
            else {
                if (inputValue?.length < searchCount) return false
                else {
                    let partData = reactLocalStorage?.getObject('Data')
                    if (inputValue) {
                        return autoCompleteDropdown(inputValue, partData, true, selectedParts, false)
                    } else {
                        return partData
                    }
                }
            }
        };

        return (
            <>
                <form
                    noValidate
                    className="form"
                    onSubmit={handleSubmit(this.onSubmit.bind(this))}
                    onKeyDown={(e) => { this.handleKeyDown(e, this.onSubmit.bind(this)); }}
                >
                    {this.state.mainLoader && <LoaderCustom />}
                    <Row>

                        <Col md='6'>
                            <label>{"Assembly Part No."}<span className="asterisk-required">*</span></label>
                            <div className='p-relative'>
                                {this.state.isLoader && <LoaderCustom customClass="input-loader" />}
                                <AsyncSelect
                                    name="AssemblyPart"
                                    ref={this.myRef}
                                    key={this.state.updateAsyncDropdown}
                                    cacheOptions defaultOptions
                                    options={this.renderListing('assemblyPart')}
                                    loadOptions={filterList}
                                    onChange={(e) => this.handleAssemblyPartChange(e)}
                                    noOptionsMessage={({ inputValue }) => inputValue.length < 3 ? 'Enter 3 characters to show data' : "No results found"}
                                    onBlur={() => this.setState({ showErrorOnFocus: true })}
                                    onKeyDown={(onKeyDown) => {
                                        if (onKeyDown.keyCode === SPACEBAR && !onKeyDown.target.value) onKeyDown.preventDefault();
                                    }}
                                />
                                {((this.state.showErrorOnFocus && this.state.assemblyPart.length === 0) || this.state.issubAssembyNoNotSelected) && <div className='text-help'>This field is required.</div>}
                            </div>
                        </Col>
                        <Col md="6">
                            <Field
                                label={`Assembly Name`}
                                name={"AssemblyPartName"}
                                type="text"
                                placeholder={''}
                                validate={[acceptAllExceptSingleSpecialCharacter]}
                                component={renderText}
                                // required={true}
                                className=""
                                customClassName={'withBorder'}
                                disabled={true}
                            />
                        </Col>

                        <Col md="6">
                            <Field
                                label={`Description`}
                                name={"Description"}
                                type="text"
                                placeholder={''}
                                validate={[]}
                                component={renderText}
                                // required={true}
                                className=""
                                customClassName={'withBorder'}
                                disabled={true}
                            />
                        </Col>
                        <Col md="6">
                            <Field
                                label={`ECN No.`}
                                name={"ECNNumber"}
                                type="text"
                                placeholder={''}
                                validate={[]}
                                component={renderText}
                                // required={true}
                                className=""
                                customClassName={'withBorder'}
                                disabled={true}
                            />
                        </Col>

                        <Col md="6">
                            <Field
                                label={`Revision No.`}
                                name={"RevisionNumber"}
                                type="text"
                                placeholder={''}
                                validate={[]}
                                component={renderText}
                                // required={true}
                                className=""
                                customClassName={'withBorder'}
                                disabled={true}
                            />
                        </Col>
                        <Col md="6">
                            <Field
                                label={`Drawing No.`}
                                name={"DrawingNumber"}
                                type="text"
                                placeholder={''}
                                validate={[]}
                                component={renderText}
                                // required={true}
                                className=""
                                customClassName={'withBorder'}
                                disabled={true}
                            />
                        </Col>

                        <Col md="6">
                            <Field
                                label={`Group Code`}
                                name={"GroupCode"}
                                type="text"
                                placeholder={''}
                                validate={[]}
                                component={renderText}
                                // required={true}
                                className=""
                                customClassName={'withBorder'}
                                disabled={true}
                            />
                        </Col>
                        <Col md="6">
                            <Field
                                label={`Quantity`}
                                name={"Quantity"}
                                type="text"
                                placeholder={''}
                                validate={[postiveNumber, maxLength5, required, minValue1]}
                                component={renderText}
                                required={true}
                                className=""
                                customClassName={'withBorder'}
                                disabled={false}
                            />
                        </Col>
                    </Row>

                    <Row className="sf-btn-footer no-gutters justify-content-between mb-3">
                        <div className="col-sm-12 text-right d-flex align-items-center justify-content-end pr-3">
                            <button
                                type={'button'}
                                className="reset mt-2 mr-2 cancel-btn"
                                onClick={this.cancel} >
                                <div className={"cancel-icon"}></div> {'Cancel'}
                            </button>
                            <button
                                type={'submit'}
                                className="submit-button mt-2 mr-2 save-btn"
                                onClick={() => this.setState({ isAddMore: true })} >
                                <div className={'plus'}></div>
                                {'ADD MORE'}
                            </button>
                            <button
                                type="submit"
                                className="submit-button mt-2 save-btn"
                                onClick={() => this.setState({ isAddMore: false })} >
                                <div className={"save-icon"}></div>
                                {isEditFlag ? 'Update' : 'Save'}
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
    const { assemblyPartSelectList, DrawerPartData } = part;
    return { assemblyPartSelectList, DrawerPartData, }
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getAssemblyPartSelectList,
    getDrawerAssemblyPartDetail,
})(reduxForm({
    form: 'AddAssemblyForm',
    enableReinitialize: true,
    touchOnChange: true
})(AddAssemblyForm));
