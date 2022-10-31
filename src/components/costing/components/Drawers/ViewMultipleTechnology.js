import React, { useState, useEffect, Fragment } from 'react'
import { checkForDecimalAndNull } from '../../../../helper'
import { Container, Row, Col, Table } from 'reactstrap'
import Drawer from '@material-ui/core/Drawer'
import NoContentFound from '../../../common/NoContentFound'
import { EMPTY_DATA } from '../../../../config/constants'
import { useSelector } from 'react-redux'

function ViewMultipleTechnology(props) {
    const { multipleTechnologyData, isPDFShow } = props
    const [viewMultiCost, setViewMultiCost] = useState([])
    console.log('viewMultiCost: ', viewMultiCost);
    const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
    useEffect(() => {
        setViewMultiCost(multipleTechnologyData)
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
    const bopDataTable = () => {
        return <>
            <Row>
                <Col md="12">
                    <Table className="table cr-brdr-main" size="sm">
                        <thead>
                            <tr>
                                <th>{`Costing Number`}</th>
                                <th>{`Part Number`}</th>
                                <th>{`Name`}</th>
                                <th>{`Part Type`}</th>
                                <th>{`Technology`}</th>
                                <th>{`Quantity`}</th>
                                <th>{`Part Cost/Pc`}</th>
                                <th>{`BOP Cost`}</th>
                                <th className="costing-border-right">{`Part Cost/Assembly`}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {viewMultiCost &&
                                viewMultiCost.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td className={`${isPDFShow ? '' : ''}`}><span title={item.CostingNumber}>{item.CostingNumber}</span></td>
                                            <td className={`${isPDFShow ? '' : ''}`}><span title={item.PartNumber}>{item.PartNumber}</span></td>
                                            <td className={`${isPDFShow ? '' : ''}`}><span title={item.PartName}>{item.PartName}</span></td>
                                            <td className={`${isPDFShow ? '' : ''}`}><span title={item.PartTypeName}>{item.PartTypeName}</span></td>

                                            <td className={`${isPDFShow ? '' : ''}`}><span title={item.TechnologyName}>{item.TechnologyName}</span></td>
                                            <td> {item.Quantity}</td>
                                            <td>
                                                {checkForDecimalAndNull(item.NetBoughtOutPartCost, initialConfiguration.NoOfDecimalForPrice)}
                                            </td>
                                            <td>
                                                {checkForDecimalAndNull(item.NetBoughtOutPartCostWithQuantity, initialConfiguration.NoOfDecimalForPrice)}
                                            </td>
                                            <td>
                                                {checkForDecimalAndNull(item.NetChildPartsCostWithQuantity, initialConfiguration.NoOfDecimalForPrice)}
                                            </td>
                                        </tr>
                                    )
                                })}
                            {viewMultiCost?.length === 0 && (
                                <tr>
                                    <td colSpan={9}>
                                        <NoContentFound title={EMPTY_DATA} />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </>
    }
    return (
        <Fragment>
            {!isPDFShow ?
                <Drawer
                    anchor={props.anchor}
                    open={props.isOpen}
                // onClose={(e) => toggleDrawer(e)}
                >
                    <Container>
                        <div className={'drawer-wrapper drawer-1500px'}>
                            <Row className="drawer-heading">
                                <Col>
                                    <div className={'header-wrapper left'}>
                                        <h3>{'View Multiple Technology cost:'}</h3>
                                    </div>
                                    <div
                                        onClick={(e) => toggleDrawer(e)}
                                        className={'close-button right'}
                                    ></div>
                                </Col>
                            </Row>
                            {bopDataTable()}


                        </div>
                    </Container>
                </Drawer> : <div className='mt-2'>
                    {viewMultiCost.length !== 0 && bopDataTable()}</div>}
        </Fragment>
    )
}

export default React.memo(ViewMultipleTechnology)
