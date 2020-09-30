import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { required, number, } from "../../../../helper/validation";
import { renderText, searchableSelect } from "../../../layout/FormInputs";
import { getAssemblyPartSelectList, getDrawerAssemblyPartDetail, } from '../../../../actions/master/Part';

class AddAssemblyForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            assemblyPart: [],
            parentPart: [],
            isAddMore: false,
            childData: [],
        }
    }

    /**
   * @method componentDidMount
   * @description called after render the component
   */
    componentDidMount() {
        this.props.getAssemblyPartSelectList(() => { })
    }

    /**
    * @method handleAssemblyPartChange
    * @description  used to handle 
    */
    handleAssemblyPartChange = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ assemblyPart: newValue }, () => {
                const { assemblyPart } = this.state;
                this.props.getDrawerAssemblyPartDetail(assemblyPart.value, res => { })
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
        const { assemblyPartSelectList } = this.props;
        const temp = [];
        if (label === 'assemblyPart') {
            assemblyPartSelectList && assemblyPartSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
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
        this.props.getDrawerAssemblyPartDetail('', res => { })
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { isAddMore, assemblyPart } = this.state;
        const { DrawerPartData } = this.props;

        let childData = {
            PartNumber: assemblyPart ? assemblyPart : [],
            Position: { "x": 600, "y": 50 },
            Outputs: assemblyPart ? assemblyPart.label : '',
            InnerContent: DrawerPartData && DrawerPartData.Description !== undefined ? DrawerPartData.Description : '',
            PartName: assemblyPart ? assemblyPart : [],
            Quantity: values.Quantity,
            Level: "L1",
            selectedPartType: this.props.selectedPartType,
            PartId: assemblyPart ? assemblyPart.value : '',
        }
        this.props.getDrawerAssemblyPartDetail('', res => { })

        if (isAddMore) {
            this.props.setChildParts(childData)
        } else {
            this.props.toggleDrawer('', childData)
        }

    }

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
                >
                    <Row>
                        <Col md='6'>
                            <Field
                                name="AssemblyPart"
                                type="text"
                                label={'Assembly Part No.'}
                                component={searchableSelect}
                                placeholder={'Assembly Part'}
                                options={this.renderListing('assemblyPart')}
                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                validate={(this.state.assemblyPart == null || this.state.assemblyPart.length === 0) ? [required] : []}
                                required={true}
                                handleChangeDescription={this.handleAssemblyPartChange}
                                valueDescription={this.state.assemblyPart}
                            />
                        </Col>
                        <Col md="6">
                            <Field
                                label={`Assembly Name`}
                                name={"AssemblyPartName"}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                component={renderText}
                                required={true}
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
                                validate={[required]}
                                component={renderText}
                                required={true}
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
                                validate={[required]}
                                component={renderText}
                                required={true}
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
                                validate={[required]}
                                component={renderText}
                                required={true}
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
                                validate={[required]}
                                component={renderText}
                                required={true}
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
                                validate={[required]}
                                component={renderText}
                                required={true}
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
                                validate={[number, required]}
                                component={renderText}
                                required={true}
                                className=""
                                customClassName={'withBorder'}
                                disabled={false}
                            />
                        </Col>
                    </Row>

                    <Row className="sf-btn-footer no-gutters justify-content-between">
                        <div className="col-sm-12 text-right bluefooter-butn">
                            <button
                                type={'button'}
                                className="reset mr15 cancel-btn"
                                onClick={this.cancel} >
                                <div className={'cross-icon'}><img src={require('../../../../assests/images/times.png')} alt='cancel-icon.jpg' /></div> {'Cancel'}
                            </button>
                            <button
                                type={'submit'}
                                className="submit-button mr5 save-btn"
                                onClick={() => this.setState({ isAddMore: true })} >
                                <div className={'plus'}></div>
                                {'ADD MORE'}
                            </button>
                            <button
                                type="submit"
                                className="submit-button mr5 save-btn"
                                onClick={() => this.setState({ isAddMore: false })} >
                                <div className={'check-icon'}><img src={require('../../../../assests/images/check.png')} alt='check-icon.jpg' /> </div>
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

    let initialValues = {};
    if (DrawerPartData && DrawerPartData !== undefined) {
        initialValues = {
            AssemblyPartName: DrawerPartData.AssemblyPartName,
            Description: DrawerPartData.Description,
            ECNNumber: DrawerPartData.ECNNumber,
            RevisionNumber: DrawerPartData.RevisionNumber,
            DrawingNumber: DrawerPartData.DrawingNumber,
            GroupCode: DrawerPartData.GroupCode,
        }
    }

    return { assemblyPartSelectList, DrawerPartData, initialValues, }
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
})(AddAssemblyForm));
