import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { checkForNull } from "../../../helper/validation";
import { getBOMViewerTree, getBOMViewerTreeDataByPartIdAndLevel, setActualBOMData } from '../actions/Part';
import { Flowpoint, Flowspace } from 'flowpoints';
import AddChildDrawer from './AddChildDrawer';
import Drawer from '@material-ui/core/Drawer';
import { ASSEMBLY } from '../../../config/constants';
import { getRandomSixDigit } from '../../../helper/util';
import VisualAdDrawer from './VisualAdDrawer';

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
      isOpenVisualDrawer: false,

      selected_point: null,

      flowpoints: [],
      isOpenChildDrawer: false,

      ActualBOMData: [],
      isCancel: false,
      isSaved: false,
      partType: ''

    }
  }

  /**
  * @method componentDidMount
  * @description called after render the component
  */
  componentDidMount() {
    const { isEditFlag, PartId, NewAddedLevelOneChilds, avoidAPICall } = this.props;
    if (isEditFlag && !avoidAPICall) {
      this.props.getBOMViewerTree(PartId, res => {
        if (res && res.status === 200) {
          let Data = res.data.Data;
          let tempArray = [...Data.FlowPoints, ...NewAddedLevelOneChilds]

          let outputArray = [];

          tempArray && tempArray.map((el, i) => {
            if (el.Level === 'L1') {
              outputArray.push(el.Input)
            }
            return null;
          })

          //CONDITION TO CHECK BOMViewerData STATE HAS FORM DATA
          let isAvailable = tempArray && tempArray.findIndex(el => el.Level === 'L0')
          tempArray = Object.assign([...tempArray], { [isAvailable]: Object.assign({}, tempArray[isAvailable], { Outputs: outputArray, }) })

          setTimeout(() => {
            this.setState({ flowpoints: tempArray, ActualBOMData: tempArray, isSaved: avoidAPICall, })
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
    this.setState({ isOpenChildDrawer: true })
  }

  closeChildDrawer = (e = '', childData = {}) => {

    this.setState({ isOpenChildDrawer: false }, () => {
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

    const posX = flowpoints.length > 0 ? 450 * Math.abs(flowpoints.filter(el => el.Level === 'L1').length - 1) : 50;

    if (Object.keys(childData).length > 0 && childData.PartType === ASSEMBLY) {

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
          })
          return null;
        })

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

    } else if (Object.keys(childData).length > 0) {

      tempArray.push(...flowpoints, {
        PartType: childData && childData.PartType ? childData.PartType : '',
        PartTypeId: childData && childData.PartTypeId ? childData.PartTypeId : '',
        PartNumber: childData && childData.PartNumber !== undefined ? childData.PartNumber.label : '',
        Position: { "x": posX, "y": 250 },
        Outputs: [],
        InnerContent: childData && childData.InnerContent !== undefined ? childData.InnerContent : '',
        PartName: childData && childData.PartNumber !== undefined ? childData.PartNumber.label : '',
        Quantity: childData && childData.Quantity !== undefined ? checkForNull(childData.Quantity) : '',
        Level: 'L1',
        selectedPartType: childData.selectedPartType,
        PartId: childData.PartId,
        Input: childData.Input,
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
  editLevelOne(index, quantity, partType) {
    this.setState({ isOpenVisualDrawer: true, EditIndex: index, updatedQuantity: quantity, partType: partType })
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
      if (i === index && el.PartType === ASSEMBLY) return true;
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

    if (this.state.isCancel) {
      this.props.closeDrawer('', this.state.ActualBOMData, this.state.isSaved)
    } else {
      this.props.closeDrawer('', this.state.flowpoints, this.state.isSaved)
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
          className={"bom-viewer-main"}
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
                              
                              <div className="trashred-icon"></div>
                              
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
                            height={120}
                            onClick={() => {
                              var selected_point = this.state
                                .selected_point;
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
                              <h3>{el.PartNumber}</h3>
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
                                        this.editLevelOne(i, el.Quantity, el.PartType)
                                      }
                                    />
                                  </span>
                                )}
                              {this.state.displayDeleteIcon &&
                                el.Level === "L1" && (
                                  <span className="flowpoint-header-delete">
                                    <button
                                      onClick={() => this.deleteLevelOne(i)}
                                    ><img
                                        src={require("../../../assests/images/times.png")}
                                        alt="cancel-icon.jpg"
                                      />
                                    </button>
                                  </span>
                                )}
                            </div>
                            <div className="flowpoint-body">
                              <p>
                                Name:<strong>{el.PartName}</strong>
                              </p>
                              <p>
                                Part Type:<strong>{el.PartType}</strong>
                              </p>
                              {/* {`X=:${el.Position.x}`}
                                                            {`Y=:${el.Position.y}`} */}
                            </div>
                          </Flowpoint>
                        );
                      })}
                  </Flowspace>
                </Row>

                <Row className="sf-btn-footer no-gutters justify-content-between">
                  <div className="col-sm-12 text-right bluefooter-butn">
                    <button
                      type={"button"}
                      className="reset mr15 cancel-btn"
                      onClick={this.cancel}
                    >
                      <div className={'cancel-icon'}></div>
                      {"Cancel"}
                    </button>
                    {!isFromVishualAd && (
                      <button
                        type="submit"
                        className="submit-button mr5 save-btn"
                      >
                        <div className={"save-icon"}></div>
                        {"Save"}
                      </button>
                    )}
                  </div>
                </Row>
              </form>
            </div>
            {isOpenChildDrawer && (
              <AddChildDrawer
                isOpen={isOpenChildDrawer}
                closeDrawer={this.closeChildDrawer}
                isEditFlag={false}
                ID={""}
                anchor={"right"}
                setChildPartsData={this.setChildPartsData}
                BOMViewerData={this.state.flowpoints}
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
  enableReinitialize: true,
})(BOMViewer));
