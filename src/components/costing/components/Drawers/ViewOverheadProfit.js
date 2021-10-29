import React, { useState, useEffect } from 'react'
import NoContentFound from '../../../common/NoContentFound'
import { CONSTANT } from '../../../../config/constants'
import { Container, Row, Col, Table } from 'reactstrap'
import Drawer from '@material-ui/core/Drawer'
import { useForm, Controller, useWatch } from 'react-hook-form';
import { TextFieldHookForm } from '../../../layout/HookFormInputs';
import { checkForDecimalAndNull } from '../../../../helper'
import { useSelector } from 'react-redux'
function ViewOverheadProfit(props) {
  const { overheadData, profitData, rejectAndModelType } = props

  const { rejectData, modelType } = rejectAndModelType

  const { register, control } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  const [viewOverheadData, setViewOverheadData] = useState({})
  const [viewProfitData, setViewProfitData] = useState({})
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)

  useEffect(() => {
    setViewOverheadData(overheadData)
    setViewProfitData(profitData)
  }, [])
  /**
  * @method toggleDrawer
  * @description closing drawer
  */
  const toggleDrawer = (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return
    }
    props.closeDrawer('')
  }

  console.log(rejectData, "viewOverheadData");
  return (
    <>
      <Drawer
        anchor={props.anchor}
        open={props.isOpen}
      // onClose={(e) => toggleDrawer(e)}
      >
        <Container>
          <div className={"drawer-wrapper drawer-1500px"}>
            <Row className="drawer-heading">
              <Col>
                <div className={"header-wrapper left"}>
                  <h3>{"View Overhead & Profit Cost:"}</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  className={"close-button right"}
                ></div>
              </Col>
            </Row>

            <div className="input-group form-group col-md-4 input-withouticon">
              <TextFieldHookForm
                label="Model Type for Overhead/Profit"
                name={"modeltype"}
                Controller={Controller}
                control={control}
                register={register}
                mandatory={false}
                handleChange={() => { }}
                //defaultValue={`${viewRM[0].RMName}`}
                defaultValue={modelType}
                className=""
                customClassName={"withBorder"}
                //errors={errors.ECNNumber}
                disabled={true}
              />
            </div>
            <div
            // className="cr-process-costwrap"
            >
              <Row className="px-3">
                <Col md="12">
                  <div className="left-border">{"Overheads"}</div>
                </Col>
              </Row>
              <Row className="px-3">
                {/* OVERHEAD RENDERING */}
                <Col md="12">
                  <Table className="table cr-brdr-main" size="sm">
                    <thead>
                      <tr>
                        <th>{`Overhead On`}</th>
                        <th>{`Percentage(%)`}</th>
                        <th>{`Cost (Applicability)`}</th>
                        <th>{`Overhead`}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewOverheadData && (
                        <>
                          {viewOverheadData.IsOverheadFixedApplicable && (
                            <tr>
                              <td>{`Fixed`}</td>
                              <td>
                                {viewOverheadData.OverheadFixedPercentage ? viewOverheadData.OverheadFixedPercentage : "-"}
                              </td>
                              <td>
                                {viewOverheadData.OverheadFixedCost ? viewOverheadData.OverheadFixedCost : "-"}
                              </td>
                              <td>
                                {viewOverheadData.OverheadFixedTotalCost ? viewOverheadData.OverheadFixedTotalCost : "-"}
                              </td>
                            </tr>
                          )}
                          {viewOverheadData.IsOverheadRMApplicable && (
                            <tr>
                              <td>{`RM`}</td>
                              <td>
                                {viewOverheadData.OverheadRMPercentage ? viewOverheadData.OverheadRMPercentage : "-"}
                              </td>
                              <td>
                                {viewOverheadData.OverheadRMCost ? viewOverheadData.OverheadRMCost : "-"}
                              </td>
                              <td>
                                {viewOverheadData.OverheadRMTotalCost ? viewOverheadData.OverheadRMTotalCost : "-"}
                              </td>
                            </tr>
                          )}
                          {viewOverheadData.IsOverheadBOPApplicable && (
                            <tr>
                              <td>{`BOP`}</td>
                              <td>
                                {viewOverheadData.OverheadBOPPercentage ? viewOverheadData.OverheadBOPPercentage : "-"}
                              </td>
                              <td>
                                {viewOverheadData.OverheadBOPCost ? viewOverheadData.OverheadBOPCost : "-"}
                              </td>
                              <td>
                                {viewOverheadData.OverheadBOPTotalCost ? viewOverheadData.OverheadBOPTotalCost : "-"}
                              </td>
                            </tr>
                          )}
                          {viewOverheadData.IsOverheadCCApplicable && (
                            <tr>
                              <td>{`CC`}</td>
                              <td>
                                {viewOverheadData.OverheadCCPercentage ? viewOverheadData.OverheadCCPercentage : "-"}
                              </td>
                              <td>
                                {viewOverheadData.OverheadCCCost ? viewOverheadData.OverheadCCCost : "-"}
                              </td>
                              <td>
                                {viewOverheadData.OverheadCCTotalCost ? viewOverheadData.OverheadCCTotalCost : "-"}
                              </td>
                            </tr>
                          )}
                          {viewOverheadData.IsOverheadCombined && (
                            <tr>
                              <td>{viewOverheadData.OverheadApplicability}</td>
                              <td>
                                {viewOverheadData.OverheadPercentage ? viewOverheadData.OverheadPercentage : "-"}
                              </td>
                              <td>
                                {viewOverheadData.OverheadCombinedCost ? viewOverheadData.OverheadCombinedCost : "-"}
                              </td>
                              <td>
                                {viewOverheadData.OverheadCombinedTotalCost ? viewOverheadData.OverheadCombinedTotalCost : "-"}
                              </td>
                            </tr>
                          )}
                        </>
                      )}
                      {(viewOverheadData.IsOverheadFixedApplicable === null && viewOverheadData.IsOverheadRMApplicable === null && viewOverheadData.IsOverheadBOPApplicable === null && viewOverheadData.IsOverheadCCApplicable === null && viewOverheadData.IsOverheadCombined === null) && (
                        <tr>
                          <td colSpan={12}>
                            <NoContentFound title={CONSTANT.EMPTY_DATA} />
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Col>
                <Col md="12"><hr /></Col>
              </Row>

              <div>
                <Row className="px-3">
                  <Col md="8">
                    <div className="left-border">{"Profits:"}</div>
                  </Col>
                </Row>
                <Row className="px-3">
                  {/*PROFIT RENDERING */}

                  <Col md="12">
                    <Table className="table cr-brdr-main" size="sm">
                      <thead>
                        <tr>
                          <th>{`Profits (Fixed)`}</th>
                          <th>{`Percentage(%)`}</th>
                          <th>{`Cost (Applicability)`}</th>
                          <th>{`Profit`}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewProfitData && (
                          <>
                            {viewProfitData.IsProfitFixedApplicable && (
                              <tr>
                                <td>{`Fixed`}</td>
                                <td>
                                  {viewProfitData.ProfitFixedPercentage ? viewProfitData.ProfitFixedPercentage : "-"}
                                </td>
                                <td>
                                  {viewProfitData.ProfitFixedCost ? viewProfitData.ProfitFixedCost : "-"}
                                </td>
                                <td>
                                  {viewProfitData.ProfitFixedTotalCost ? viewProfitData.ProfitFixedTotalCost : "-"}
                                </td>
                              </tr>
                            )}
                            {viewProfitData.IsProfitRMApplicable && (
                              <tr>
                                <td>{`RM`}</td>
                                <td>
                                  {viewProfitData.ProfitRMPercentage ? viewProfitData.ProfitRMPercentage : "-"}
                                </td>
                                <td>
                                  {viewProfitData.ProfitRMCost ? viewProfitData.ProfitRMCost : "-"}
                                </td>
                                <td>
                                  {viewProfitData.ProfitRMTotalCost ? viewProfitData.ProfitRMTotalCost : "-"}
                                </td>
                              </tr>
                            )}
                            {viewProfitData.IsProfitBOPApplicable && (
                              <tr>
                                <td>{`BOP`}</td>
                                <td>
                                  {viewProfitData.ProfitBOPPercentage ? viewProfitData.ProfitBOPPercentage : "-"}
                                </td>
                                <td>
                                  {viewProfitData.ProfitBOPCost ? viewProfitData.ProfitBOPCost : "-"}
                                </td>
                                <td>
                                  {viewProfitData.ProfitBOPTotalCost ? viewProfitData.ProfitBOPTotalCost : "-"}
                                </td>
                              </tr>
                            )}
                            {viewProfitData.IsProfitCCApplicable && (
                              <tr>
                                <td>{`CC`}</td>
                                <td>
                                  {viewProfitData.ProfitCCPercentage ? viewProfitData.ProfitCCPercentage : "-"}
                                </td>
                                <td>
                                  {viewProfitData.ProfitCCCost ? viewProfitData.ProfitCCCost : "-"}
                                </td>
                                <td>
                                  {viewProfitData.ProfitCCTotalCost
                                    ? viewProfitData.ProfitCCTotalCost
                                    : "-"}
                                </td>
                              </tr>
                            )}
                            {viewProfitData.IsProfitCombined && (
                              <tr>
                                <td>{viewProfitData.ProfitApplicability}</td>
                                <td>
                                  {viewProfitData.ProfitPercentage ? viewProfitData.ProfitPercentage : "-"}
                                </td>
                                <td>
                                  {viewProfitData.ProfitCombinedCost ? viewProfitData.ProfitCombinedCost : "-"}
                                </td>
                                <td>
                                  {viewProfitData.ProfitCombinedTotalCost
                                    ? viewProfitData.ProfitCombinedTotalCost
                                    : "-"}
                                </td>
                              </tr>
                            )}
                          </>
                        )}
                        {(viewProfitData.IsProfitFixedApplicable === null && viewProfitData.IsProfitRMApplicable === null && viewProfitData.IsProfitBOPApplicable === null && viewProfitData.IsProfitCCApplicable === null && viewProfitData.IsProfitCombined === null) && (
                          <tr>
                            <td colSpan={12}>
                              <NoContentFound title={CONSTANT.EMPTY_DATA} />
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </Col>
                  <Col md="12"><hr /></Col>
                </Row>
              </div>
              <div>
                <Row className="px-3">
                  <Col md="10">
                    <div className="left-border">{"Rejection:"}</div>
                  </Col>
                </Row>
                <Row className="px-3">
                  {/*REJECTION RENDERING */}

                  <Col md="12">
                    <Table className="table cr-brdr-main " size="sm">
                      <thead>
                        <tr>
                          <th>{`Applicability`}</th>
                          <th>{`Rejection ${rejectData.RejectionApplicability === 'Fixed' ? '' : '(%)'}`}</th>
                          <th>{`Cost (Applicability)`}</th>
                          <th>{`Net Rejection`}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {
                          (rejectData.RejectionApplicability === null) ?
                            <tr>
                              <td colSpan={8}>
                                <NoContentFound title={CONSTANT.EMPTY_DATA} />
                              </td>
                            </tr> :
                            <tr>
                              <td>{rejectData.RejectionApplicability ? rejectData.RejectionApplicability : '-'}</td>
                              <td>{rejectData.RejectionPercentage ? rejectData.RejectionPercentage : '-'}</td>
                              <td>{rejectData.RejectionCost ? rejectData.RejectionCost : '-'}</td>
                              <td>{rejectData.RejectionTotalCost ? rejectData.RejectionTotalCost : '-'}</td>
                            </tr>
                        }
                        {/* {rejectData && (
                          <tr>
                            <td>{rejectData.RejectionApplicability}</td>
                            <td>{rejectData.RejectionPercentage}</td>
                            <td>{rejectData.RejectionCost}</td>
                            <td>{rejectData.RejectionTotalCost}</td>
                          </tr>
                        )} */}
                        {/* {(rejectData.RejectionApplicability === null && rejectData.RejectionPercentage === null && rejectData.RejectionCost === null && rejectData.RejectionTotalCost === null) && (
                          <tr>
                            <td colSpan={8}>
                              <NoContentFound title={CONSTANT.EMPTY_DATA} />
                            </td>
                          </tr>
                        )} */}
                      </tbody>
                    </Table>
                  </Col>
                </Row>
              </div>
            </div>
          </div>
        </Container>
      </Drawer>
    </>
  );
}

export default React.memo(ViewOverheadProfit)
