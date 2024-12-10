import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { checkForNull } from "../../../helper/validation";
import { getBOMViewerTree, getBOMViewerTreeDataByPartIdAndLevel, setActualBOMData } from '../actions/Part';
import { Flowpoint, Flowspace } from 'flowpoints';
import AddChildDrawer from './AddChildDrawer';
import Drawer from '@material-ui/core/Drawer';
import { ASSEMBLYNAME, BOUGHTOUTPARTSPACING } from '../../../config/constants';
import { getRandomSixDigit } from '../../../helper/util';
import VisualAdDrawer from './VisualAdDrawer';
import _, { debounce } from 'lodash'
import LoaderCustom from '../../common/LoaderCustom';
import { withTranslation } from 'react-i18next';
import { validateForm } from '../../layout/FormInputs';

class BOMViewer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      assemblyPart: [],
      parentPart: [],
      BOPPart: [],
      isAddMore: false,
      displayDeleteIcon: false,
      displayEditIcon: false,
      EditIndex: '',
      updatedQuantity: '',
      BOPUom: '',
      BOPUomCreateMode: '',
      isOpenVisualDrawer: false,
      selected_point: null,
      flowpoints: [],
      isOpenChildDrawer: false,
      ActualBOMData: [],
      bomFromAPI: [],
      isCancel: false,
      isSaved: false,
      partType: '',
      isLoader: false,
      zoomOutCount: 9,
      isHoverZoomInBtn: false,
      isHoverZoomOutBtn: false,
      disableZoomInButton: true,
      disableZoomOutButton: false
    }
  }
  /**
   * @method componentDidMount
   * @description called after render the component
  */
  componentDidMount() {
    const { isEditFlag, PartId, NewAddedLevelOneChilds, avoidAPICall } = this.props;
    if (isEditFlag && !avoidAPICall) {
      this.setState({ isLoader: true })
      const debouncedGetBOMViewerTree = debounce(this.props.getBOMViewerTree, 500); // Adjust the delay as per your needs
      debouncedGetBOMViewerTree(PartId, res => {
        if (res && res.status === 200) {
          let Data = res.data.Data;
          this.setState({ bomFromAPI: Data.FlowPoints })
          let tempArray = [...Data.FlowPoints, ...NewAddedLevelOneChilds]
          let outputArray = [];
          tempArray && tempArray.map((el, i) => {
            if (el.Level === 'L1') {
              outputArray.push(el.Input)
              this.setState({ isLoader: false })
            }
            this.setState({ isLoader: false })
            return null;
          })

          //CONDITION TO CHECK BOMViewerData STATE HAS FORM DATA
          let isAvailable = tempArray && tempArray.findIndex(el => el.Level === 'L0')
          tempArray = Object.assign([...tempArray], { [isAvailable]: Object.assign({}, tempArray[isAvailable], { Outputs: outputArray, }) })

          setTimeout(() => {
            this.setState({ flowpoints: tempArray, ActualBOMData: tempArray, isSaved: avoidAPICall })
            this.props.setActualBOMData(tempArray)
          }, 200);

        }
      })
    } else {
      this.setState({
        flowpoints: this.props.BOMViewerData,
        ActualBOMData: this.props.BOMViewerData,
        isSaved: avoidAPICall,
      })
    }
  }

  childDrawerToggle = () => {
    this.setState({ isOpenChildDrawer: true, displayDeleteIcon: false, displayEditIcon: false })
  }

  zoomOut = () => {

    if (this.state.zoomOutCount > 2) {
      this.setState({ disableZoomInButton: false })
      document.getElementsByClassName("flowspace")[0].classList.remove(`zoomclass${this.state.zoomOutCount + 1}`)
      document.getElementsByClassName("flowspace")[0].classList.add(`zoomclass${this.state.zoomOutCount}`)
      this.setState({ zoomOutCount: this.state.zoomOutCount - 1 })
    } else {
      this.setState({ disableZoomOutButton: true })
    }
  }

  zoomIn = () => {

    if (this.state.zoomOutCount < 11) {
      this.setState({ disableZoomOutButton: false })
      document.getElementsByClassName("flowspace")[0].classList.remove(`zoomclass${this.state.zoomOutCount + 1}`)
      document.getElementsByClassName("flowspace")[0].classList.remove(`zoomclass${this.state.zoomOutCount - 1}`)
      document.getElementsByClassName("flowspace")[0].classList.remove(`zoomclass${this.state.zoomOutCount}`)
      document.getElementsByClassName("flowspace")[0].classList.add(`zoomclass${this.state.zoomOutCount + 1}`)
      this.setState({ zoomOutCount: this.state.zoomOutCount + 1 })

    } else {
      this.setState({ disableZoomInButton: true })
    }
  }

  /**
   * @method handleMouseZoomIn
   * @description FOR ZOOM IN BUTTON CHANGE CSS ON MOUSE HOVER
   */
  handleMouseZoomIn = () => {
    this.setState({ isHoverZoomInBtn: true })
  }
  /**
    * @method handleMouseOutZoomIn
    * @description FOR ZOOM IN BUTTON CHANGE CSS ON MOUSE LEAVE
    */
  handleMouseOutZoomIn = () => {
    this.setState({ isHoverZoomInBtn: false })
  }
  /**
    * @method handleMouseZoomOut
    * @description FOR ZOOM OUT BUTTON CHANGE CSS ON MOUSE HOVER
    */
  handleMouseZoomOut = () => {
    this.setState({ isHoverZoomOutBtn: true })
  }
  /**
    * @method handleMouseOutZoomOut
    * @description FOR ZOOM OUT BUTTON CHANGE CSS ON MOUSE LEAVE
    */
  handleMouseOutZoomOut = () => {
    this.setState({ isHoverZoomOutBtn: false })
  }

  closeChildDrawer = (e = '', childData = {}) => {

    this.setState({ isOpenChildDrawer: false, BOPUomCreateMode: childData?.UnitOfMeasurementType }, () => {
      this.setChildPartsData(childData)
    })
  }

  /**
  * @method setChildPartsData
  * @description SET CHILD PARTS DATA IN ASSEMBLY AND BOMViewerData
  */
  setChildPartsData = (childData) => {
    const { flowpoints, } = this.state;

    let tempArray = [];
    let outputArray = [];
    const posX = flowpoints.length > 0 ? 450 * Math.abs(flowpoints.filter(el => el.Level === 'L1').length) : 50;

    if (Object.keys(childData).length > 0 && childData.PartType === ASSEMBLYNAME) {

      this.props.getBOMViewerTreeDataByPartIdAndLevel(childData.PartId, 1, res => {
        let Data = res.data.Data.FlowPoints;


        const DeleteNodeL1 = getRandomSixDigit();
        Data && Data.map((el, index) => {
          tempArray.push({
            PartType: el.PartType,
            PartTypeId: el.PartTypeId,
            PartNumber: el.PartNumber,
            Input: el.Input,
            Position: el.Position,
            Outputs: el.Outputs,
            InnerContent: el.InnerContent,
            PartName: el.PartName,
            Quantity: el.Level === 'L1' ? checkForNull(childData.Quantity) : el.Quantity,
            Level: el.Level,
            selectedPartType: childData.selectedPartType,
            PartId: childData.PartId,
            DeleteNodeL1: DeleteNodeL1,
            Technology: el?.Technology || '',
            RevisionNo: el?.RevisionNo || null
          })
          return null;
        })

        setTimeout(() => {

          tempArray && tempArray.map((el, i) => {
            if (el.Level === 'L1') {
              outputArray.push(el.Input)
            }
            return null;
          })

          //GET INDEX OF L0 LEVEL OBJECTS
          let isAvailable = flowpoints.findIndex(el => el.Level === 'L0')

          let flowPointstempArray = Object.assign([...flowpoints], { [isAvailable]: Object.assign({}, flowpoints[isAvailable], { Outputs: [...flowpoints[isAvailable].Outputs, ...outputArray], }) })

          this.setState({ flowpoints: [...flowPointstempArray, ...tempArray] })

        }, 200)
      })


    } else if (Object.keys(childData).length > 0) {

      tempArray.push(...flowpoints, {
        PartType: childData && childData.PartType ? childData.PartType : '',
        PartTypeId: childData && childData.PartTypeId ? childData.PartTypeId : '',
        PartNumber: childData && childData.PartNumber !== undefined ? childData.PartNumber.label : '',
        Position: { "x": posX, "y": 250 },
        Outputs: [],
        InnerContent: childData && childData.InnerContent !== undefined ? childData.InnerContent : '',
        PartName: childData && childData.PartName !== undefined ? childData.PartName : '',
        Quantity: childData && childData.Quantity !== undefined ? checkForNull(childData.Quantity) : '',
        Level: 'L1',
        selectedPartType: childData.selectedPartType,
        PartId: childData.PartId,
        Input: childData.Input,
        Technology: childData && childData.Technology !== undefined ? childData.Technology.label : '',
        RevisionNo: childData?.RevisionNo || null,
        IsBreakupBoughtOutPart: childData?.IsBreakupBoughtOutPart

      })

      tempArray && tempArray.map((el, i) => {
        if (el.Level === 'L1') {
          outputArray.push(el.Input)
        }
        return null;
      })

      //GET INDEX OF L0 LEVEL OBJECTS
      let isAvailable = tempArray.findIndex(el => el.Level === 'L0')

      tempArray = Object.assign([...tempArray], { [isAvailable]: Object.assign({}, tempArray[isAvailable], { Outputs: outputArray, }) })
      setTimeout(() => {
        this.setState({ flowpoints: tempArray })
      }, 200)

    }
  }

  /**
  * @method editLevelOne
  * @description EDIT LEVEL 1 QUANTITY IN DRAWER
  */
  editLevelOne(index, quantity, partType, BoughtOutPartUOM) {
    this.setState({ isOpenVisualDrawer: true, EditIndex: index, updatedQuantity: quantity, partType: partType, BOPUom: BoughtOutPartUOM })
  }

  /**
  * @method closeVisualDrawer
  * @description CLOSE VISUAL AD DRAWER
  */
  closeVisualDrawer = (quantity = '') => {
    const { flowpoints } = this.state;

    if (quantity !== '') {
      let isAvailable = flowpoints.findIndex((el, i) => i === this.state.EditIndex)

      let tempArray = Object.assign([...flowpoints], { [isAvailable]: Object.assign({}, flowpoints[isAvailable], { Quantity: checkForNull(quantity), }) })
      setTimeout(() => {
        this.setState({ flowpoints: tempArray, isOpenVisualDrawer: false, updatedQuantity: '', EditIndex: '' })
      }, 200)

    } else {
      this.setState({ isOpenVisualDrawer: false, })
    }
  }

  /**
  * @method deleteLevelOne
  * @description DELETE LEVEL 1 PART
  */
  deleteLevelOne(index) {
    const { flowpoints } = this.state;

    let tempArray = flowpoints.filter((el, i) => {
      if (i === index) return false;
      return true;
    })

    let assemblyOutPuts = flowpoints.find((el, i) => {
      if (i === index && el.PartType === ASSEMBLYNAME) return true;
      return false;
    })

    //DELETE ASSEMBLY CHILDS
    if (assemblyOutPuts !== undefined && Object.keys(assemblyOutPuts).length > 0) {
      tempArray = tempArray.filter(el => {
        if (assemblyOutPuts.DeleteNodeL1 === el.DeleteNodeL1) {
          return false;
        }
        return true;
      })
    }

    this.setState({ flowpoints: tempArray, })
  }

  /**
  * @method toggleDrawer
  * @description USED TO TOGGLE DRAWER
  */
  toggleDrawer = (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    let isEqual = _.isEqual(this.state.bomFromAPI, this.state.flowpoints)

    if (this.state.isCancel) {
      this.props.closeDrawer('', this.state.ActualBOMData, this.state.isSaved, true)
    } else {
      // TO CHECK WHETHER THE FLOWPOINTS COMING FROM API AND ON CLOSING DRAWER ARE SAME OR NOT .FOR SAME isEqual WILL BE TRUE ELSE FALSE

      this.props.closeDrawer('', this.state.flowpoints, this.state.isSaved, isEqual)
    }
  };

  /**
  * @method cancel
  * @description used to Reset form
  */
  cancel = () => {
    this.setState({ isCancel: true, isSaved: false, flowpoints: [] }, () => this.toggleDrawer(''))
  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = (values) => {
    const { flowpoints } = this.state;
    this.setState({ flowpoints, isSaved: true, isCancel: false, }, () => this.toggleDrawer(''))
  }

  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { handleSubmit, isEditFlag, isFromVishualAd, initialConfiguration } = this.props;
    const { isOpenChildDrawer, isOpenVisualDrawer, flowpoints } = this.state;
    return (
      <>
        <Drawer
          className={"bom-viewer-main "}
          anchor={this.props.anchor}
          open={this.props.isOpen}
        // onClose={(e) => this.toggleDrawer(e)}
        >
          <>
            <div className={"drawer-wrapper drawer-full-width bom-drawer"}>
              <Row className="drawer-heading">
                <Col md="6">
                  <div className={"header-wrapper left"}>
                    <h3>{"BOM VIEWER"}</h3>
                  </div>
                </Col>
                <Col md="6">
                  <div
                    onClick={(e) => this.toggleDrawer(e)}
                    className={"close-button right"}
                  ></div>
                </Col>
              </Row>
              {this.state.isLoader && <LoaderCustom />}
              <form
                noValidate
                className="form bom-drawer-form"
                onSubmit={handleSubmit(this.onSubmit.bind(this))}
              >
                <Row className="bom-action-row justify-content-end m-0">
                  {(!isEditFlag || initialConfiguration.IsBOMEditable) &&
                    !isFromVishualAd && (
                      <Col md="auto" className="bg-white" >
                        {flowpoints.length > 1 &&
                          <>
                            <button
                              type={"button"}
                              className="pull-right mt10 btn-danger"
                              onClick={() =>
                                this.setState({
                                  displayDeleteIcon: !this.state.displayDeleteIcon,
                                  displayEditIcon: false,
                                })
                              }
                            >
                              <div className={"trashred-icon"}>
                              </div>{" "}
                              {"Delete"}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                this.setState({
                                  displayEditIcon: !this.state.displayEditIcon,
                                  displayDeleteIcon: false,
                                })
                              }
                              className={"user-btn mr15 pull-right mt10"}
                            >
                              <div className={"edit-icon"}></div>
                              {"EDIT"}
                            </button>
                          </>
                        }
                        <button
                          type="button"
                          onClick={this.childDrawerToggle}
                          className={"user-btn mr15 pull-right mt10"}
                        >
                          <div className={"plus"}></div>ADD
                        </button>
                      </Col>
                    )}
                </Row>
                <div className='zoom-container'>
                  <button title='Zoom in' type="button" disabled={this.state.disableZoomInButton} onClick={this.zoomIn} onMouseOver={this.handleMouseZoomIn} onMouseOut={this.handleMouseOutZoomIn} className={"secondary-btn p-1 mb-1"}><div className={`${this.state.isHoverZoomInBtn ? 'zoom-in-hover' : 'zoom-in'}`}></div></button>
                  <button title='Zoom out' type="button" disabled={this.state.disableZoomOutButton} onClick={this.zoomOut} onMouseOver={this.handleMouseZoomOut} onMouseOut={this.handleMouseOutZoomOut} className={"secondary-btn p-1"}><div className={`${this.state.isHoverZoomOutBtn ? 'zoom-out-hover' : 'zoom-out'}`}></div></button>
                </div>
                <Row className="flowspace-row">
                  <Flowspace
                    theme="#2196f3"
                    variant="outlined"
                    arrowStart={false}
                    arrowEnd={true}
                    outputColor="#0c00ff"
                    inputColor="#ff0022"
                    style={{
                      width: "100%",
                      overflow: "auto",
                      maxWidth: "100vw",
                      maxHeight: "calc(100vh - 135px)",

                    }}
                    connectionSize={100}
                    onClick={(e) => this.setState({ selected_point: null })}
                    selected={this.state.selected_point}
                  >
                    {this.state.flowpoints &&
                      this.state.flowpoints.map((el, i) => {
                        return (
                          <Flowpoint
                            key={el.Input}
                            snap={{ x: 10, y: 10 }}
                            startPosition={el.Position}
                            outputs={el.Outputs}
                            selected={false}
                            width={200}
                            height={150}
                            onClick={() => {
                              var selected_point = this.state.selected_point;
                              if (selected_point === el.PartNumber) {
                                selected_point = null;
                              } else {
                                selected_point = el.PartNumber;
                              }
                              this.setState({ selected_point });
                            }}
                          // onDrag={position => {
                          //     var flowpoints = this.state.flowpoints
                          //     flowpoints[i].Position = position
                          //     this.setState({ flowpoints })
                          // }}
                          >
                            <div className="flowpoint-header">
                              <h3 title={el.PartNumber}>{el.PartNumber}</h3>
                              <span className="flowpoint-header-level">
                                {el.Level}
                              </span>
                              <span className="flowpoint-header-qty">
                                Qty:<strong>{el.Quantity}</strong>
                              </span>
                              {this.state.displayEditIcon &&
                                el.Level === "L1" && (
                                  <span className="flowpoint-header-edit">
                                    <button
                                      className="Edit"
                                      onClick={() =>
                                        this.editLevelOne(i, el.Quantity, el.PartType, el.BoughtOutPartUOMType)
                                      }
                                    />
                                  </span>
                                )}
                              {this.state.displayDeleteIcon &&
                                el.Level === "L1" && (
                                  <span className="flowpoint-header-delete">
                                    <button
                                      onClick={() => this.deleteLevelOne(i)}
                                    ><div className="cancel-icon"></div>
                                    </button>
                                  </span>
                                )}
                            </div>
                            <div className="flowpoint-body">
                              <p>
                                Name:<strong title={el?.PartName}>{el?.PartName}</strong>
                              </p>
                              <p>
                                Part Type:<strong title={el?.PartType}>{el?.PartType}</strong>
                              </p>
                              <p>
                                {this.props.t('TechnologyLabel', { defaultValue: 'Technology' })}:
                                <strong title={el?.PartType === BOUGHTOUTPARTSPACING && el?.IsBreakupBoughtOutPart === false ? '-' : el?.Technology}>{el?.PartType === BOUGHTOUTPARTSPACING && el?.IsBreakupBoughtOutPart === false ? '-' : el?.Technology || '-'}</strong>
                              </p>
                              <p>
                                Revision No:<strong title={el?.PartType === BOUGHTOUTPARTSPACING ? '-' : el?.RevisionNo}>{el?.PartType === BOUGHTOUTPARTSPACING ? '-' : el?.RevisionNo || '-'}</strong>
                              </p>
                              {/* {`X=:${el.Position.x}`}
                                                            {`Y=:${el.Position.y}`} */}
                            </div>
                          </Flowpoint>
                        );
                      })}
                  </Flowspace>
                </Row>

                {!isFromVishualAd && <Row className="sf-btn-footer no-gutters justify-content-between">
                  <div className="col-sm-12 text-right bluefooter-butn">
                    <button
                      type={"button"}
                      className="reset mr15 cancel-btn"
                      onClick={this.cancel}
                    >
                      <div className={'cancel-icon'}></div>
                      {"Cancel"}
                    </button>
                    <button
                      type="submit"
                      className="submit-button mr15 save-btn"
                    >
                      <div className={"save-icon"}></div>
                      {"Save"}
                    </button>
                  </div>
                </Row>}
              </form>
            </div>
            {isOpenChildDrawer && (
              <AddChildDrawer
                isOpen={isOpenChildDrawer}
                closeDrawer={this.closeChildDrawer}
                TechnologySelected={this.props.TechnologySelected}
                isEditFlag={false}
                ID={""}
                anchor={"right"}
                setChildPartsData={this.setChildPartsData}
                BOMViewerData={this.state.flowpoints}
                partAssembly={this.props.partAssembly}
              />
            )}
            {isOpenVisualDrawer && (
              <VisualAdDrawer
                isOpen={isOpenVisualDrawer}
                closeDrawer={this.closeVisualDrawer}
                isEditFlag={true}
                anchor={"right"}
                updatedQuantity={this.state.updatedQuantity}
                partType={this.state.partType}
                BOPUom={this.state.BOPUom ? this.state.BOPUom : this.state.BOPUomCreateMode}
              />
            )}
          </>
        </Drawer>
      </>
    );
  }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ part, auth }) {
  const { actualBOMTreeData } = part;
  const { initialConfiguration } = auth;
  return { actualBOMTreeData, initialConfiguration }
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
  getBOMViewerTree,
  getBOMViewerTreeDataByPartIdAndLevel,
  setActualBOMData,
})(reduxForm({
  form: 'BOMViewer',
  validate: validateForm,
  enableReinitialize: true,
  touchOnChange: true
})(withTranslation(['MasterLabels'])(BOMViewer)));
