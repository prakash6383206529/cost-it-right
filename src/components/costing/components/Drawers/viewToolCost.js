import React from 'react';
import { checkForDecimalAndNull } from '../../../../../src/helper';
import { Container, Row, Col, Table } from 'reactstrap'
import Drawer from '@material-ui/core/Drawer'
import { useSelector } from 'react-redux';
import NoContentFound from '../../../common/NoContentFound';
import { EMPTY_DATA } from '../../../../config/constants';
import { useLabels } from '../../../../helper/core';


function ViewToolCost(props) {

  const { viewToolCost, isPDFShow, isToolCostProcessWise } = props
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const { toolMaintenanceCostLabel, toolMaintenanceCostPerPcLabel, toolInterestRatePercentLabel, toolInterestCostLabel, toolInterestCostPerPcLabel } = useLabels();

  const tableData = () => {

    return <>
      {
        isToolCostProcessWise ?
          <Table className="table cr-brdr-main mt-3 mb-0" size="sm" >
            <thead>
              <tr>
                {initialConfiguration?.IsShowCRMHead && <th>{`CRM Head`}</th>}
                <th>{`Parent Part Number`}</th>
                <th>{`Child Part Number`}</th>
                <th>{`Part Quantity`}</th>
                <th>{`Part Type`}</th>
                <th>{`Process/Operation`}</th>
                <th>{`Process/Operation Type`}</th>
                <th>{`Process Run Count`}</th>
                <th>{`Category`}</th>
                <th>{`Tool Name`}</th>
                <th>{`Tool Rate`}</th>
                <th>{`Life/Amortization`}</th>
                <th>{`Tool Amortization Cost`}</th>
                <th>{`Tool Maintenance Applicability`}</th>
                <th>{`Maintenance Tool Cost (%)`}</th>
                <th>{`Cost (Applicability)`}</th>
                <th>{`${toolMaintenanceCostLabel}`}</th>
                <th>{`${toolMaintenanceCostPerPcLabel}`}</th>
                <th>{`${toolInterestRatePercentLabel}`}</th>
                <th>{`${toolInterestCostLabel}`}</th>
                <th>{`${toolInterestCostPerPcLabel}`}</th>
                <th>{`Net Tool Cost`}</th>
              </tr>
            </thead>
            <tbody >
              {
                viewToolCost &&
                viewToolCost.map((item, index) => {
                  return (
                    <tr key={index}>
                      {initialConfiguration?.IsShowCRMHead && <td>{item.ToolCRMHead ? item.ToolCRMHead : '-'}</td>}
                      <td>{item?.ParentPartNumber ?? '-'}</td>
                      <td>{item?.ChildPartNumber ?? '-'}</td>
                      <td>{item?.PartQuantity ?? '-'}</td>
                      <td>{item?.PartType ?? '-'}</td>
                      <td>{item?.ProcessOrOperation ?? '-'}</td>
                      <td>{item?.ProcessOrOperationType ?? "-"}</td>
                      <td>{item?.Quantity ?? '-'}</td>
                      <td>{item?.ToolCategory ?? '-'}</td>
                      <td>{item?.ToolName ?? '-'}</td>
                      <td>{checkForDecimalAndNull(item?.ToolCost, initialConfiguration?.NoOfDecimalForPrice) ?? '-'}</td>
                      <td>{item?.Life ?? '-'}</td>
                      <td>{checkForDecimalAndNull(item?.ToolAmortizationCost, initialConfiguration?.NoOfDecimalForPrice) ?? '-'}</td>
                      <td>{item?.ToolCostType ?? '-'}</td>
                      <td>{checkForDecimalAndNull(item?.ToolMaintenancePercentage, initialConfiguration?.NoOfDecimalForPrice) ?? '-'}</td>
                      <td>{checkForDecimalAndNull(item?.ToolApplicabilityCost, initialConfiguration?.NoOfDecimalForPrice) ?? '-'}</td>
                      <td>{item?.ToolMaintenanceCost ?? '-'}</td>
                      <td>{item?.ToolMaintenanceCostPerPiece ?? '-'}</td>
                      <td>{item?.ToolInterestRatePercent ?? '-'}</td>
                      <td>{item?.ToolInterestCost ?? '-'}</td>
                      <td>{item?.ToolInterestCostPerPiece ?? '-'}</td>
                      <td>{checkForDecimalAndNull(item?.NetToolCost, initialConfiguration?.NoOfDecimalForPrice) ?? '-'}</td>

                    </tr>
                  )
                })
              }
              {viewToolCost?.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <NoContentFound title={EMPTY_DATA} />
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
          :
          <Table className="table cr-brdr-main mt-3 mb-0" size="sm" >
            <thead>
              <tr>
                <th>{`Tool Rate`}</th>
                <th>{`Amortization Quantity (Tool Life)`}</th>
                <th>{`Tool Amortization Cost`}</th>
                <th>{`Tool Maintenance Applicability`}</th>
                <th>{`Maintenance Tool Cost (%)`}</th>
                <th>{`Cost (Applicability)`}</th>
                <th>{toolMaintenanceCostLabel}</th>
                <th>{toolMaintenanceCostPerPcLabel}</th>
                <th>{toolInterestRatePercentLabel}</th>
                <th>{toolInterestCostLabel}</th>
                <th>{toolInterestCostPerPcLabel}</th>
                <th>{`Net Tool Cost`}</th>
                {initialConfiguration?.IsShowCRMHead && <th>{`CRM Head`}</th>}
              </tr>
            </thead>
            <tbody >
              {
                viewToolCost &&
                viewToolCost.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td>{item.ToolCost ? checkForDecimalAndNull(item.ToolCost, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
                      <td>{item.Life ? item.Life : "-"}</td>
                      <td>{checkForDecimalAndNull(item.ToolAmortizationCost, initialConfiguration?.NoOfDecimalForPrice)}</td>
                      <td>{item?.ToolCostType ? item?.ToolCostType : '-'}</td>
                      <td>{checkForDecimalAndNull(item.ToolMaintenancePercentage, initialConfiguration?.NoOfDecimalForPrice)}</td>
                      <td>{checkForDecimalAndNull(item.ToolApplicabilityCost, initialConfiguration?.NoOfDecimalForPrice)}</td>
                      <td>{item.ToolMaintenanceCost ? checkForDecimalAndNull(item.ToolMaintenanceCost, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
                      <td>{item.ToolMaintenanceCostPerPiece ? checkForDecimalAndNull(item.ToolMaintenanceCostPerPiece, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
                      <td>{item.ToolInterestRatePercent ? checkForDecimalAndNull(item.ToolInterestRatePercent, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
                      <td>{item.ToolInterestCost ? checkForDecimalAndNull(item.ToolInterestCost, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
                      <td>{item.ToolInterestCostPerPiece ? checkForDecimalAndNull(item.ToolInterestCostPerPiece, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
                      <td>{item.NetToolCost ? checkForDecimalAndNull(item.NetToolCost, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
                      {initialConfiguration?.IsShowCRMHead && <td>{item.ToolCRMHead ? item.ToolCRMHead : '-'}</td>}
                    </tr>
                  )
                })
              }
              {viewToolCost?.length === 0 && (
                <tr>
                  <td colSpan={12}>
                    <NoContentFound title={EMPTY_DATA} />
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
      }
    </>
  }
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
  return (
    <>
      {!isPDFShow ? <Drawer anchor={props.anchor} open={props.isOpen}
      // onClose={(e) => toggleDrawer(e)}

      >
        <Container>
          <div className={'drawer-wrapper drawer-1500px'}>

            <Row className="drawer-heading">
              <Col>
                <div className={'header-wrapper left'}>
                  <h3>{'View Tool Cost:'}</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  className={'close-button right'}>
                </div>
              </Col>
            </Row>
            <Row className="px-3">
              <Col md="12" className="table-scroller">
                {tableData()}
              </Col>
            </Row>
          </div>
        </Container>
      </Drawer> : ((viewToolCost && viewToolCost.length !== 0) &&
        tableData())}
    </>
  )
}

export default React.memo(ViewToolCost)
