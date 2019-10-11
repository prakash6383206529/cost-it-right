import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { displayValue } from '../../helper/util';
import { Redirect } from 'react-router-dom';
import { Col } from 'reactstrap';


class OpportunityRoleTile extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isApplyRole: false,
            isNextClicked: false
        };
    }
    // onClickApplyOnRole = (castingRoleId, castingCallId) => {
    //     return <Redirect
    //         to={{
    //             pathname: "/ApplyRole",
    //             // search: "?utm=your+face",
    //             state: {
    //                 castingCallId: castingCallId,
    //                 castingRoleId: castingRoleId
    //             }
    //         }}
    //     />
    // }


    /**
   * @method renderAccolades
   * @description used to render award
   */

    renderEthnicAppearance = (appearances) => {
        if (typeof appearances != 'object') {
            return (
                <Col>N/A</Col>
            );
        } else {
            const appearancString = appearances.map((val) => {
                return val;
            }).join(', ');
            if (appearancString) {
                return (
                    <Col>{appearancString}</Col>
                );
            } else {
                return (
                    <Col>N/A</Col>
                );
            }
        }
    }

    render() {
        const { characterName, gender,
            bio, _id, castingCallId,
            minimumAge, maximumAge,
            minimumHeight, maximumHeight,
            ethnicAppearance,
            isApplied, castingRoleId,
        } = this.props.opportunityRoleInfo;

        const { isNextClicked, isApplyRole } = this.state;

        // console.log('this.props.opportunityRoleInfo ', this.props.opportunityRoleInfo);

        if (isNextClicked === true) {
            return <Redirect push
                to={{
                    pathname: `/role-detail/${_id}`,
                    // search: "?utm=your+face",
                    state: {
                        opportunityId: _id,
                        castingCallId: castingCallId,
                        castingRoleId: castingRoleId,
                        isApplied: this.props.opportunityRoleInfo.isApplied
                    }
                }}
            />
        }

        if (isApplyRole === true) {
            return <Redirect push
                to={{
                    pathname: `/apply-role/${_id}/${castingRoleId}`,
                    // search: "?utm=your+face",
                    state: {
                        opportunityId: _id,
                        castingCallId: castingCallId,
                        castingRoleId: castingRoleId
                    }
                }}
            />
        }
        return (
            <button onClick={() => this.setState({ isNextClicked: true })} >
                <div>
                    <div>
                        <div>
                            <div>
                                <Col>{characterName} </Col>
                            </div>
                            {(isApplied === false) && (
                                <div>
                                    <button onClick={() => this.setState({ isApplyRole: true })}>
                                        <Col>APPLY</Col>
                                    </button>
                                </div>
                            )}
                            {(isApplied === true) && (
                                <div>
                                    <div disabled>
                                        <Col>APPLIED</Col>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div>
                            <div>
                                <Col>{displayValue(bio)}</Col>
                            </div>
                        </div>
                        <div>
                            <div>
                                <div>
                                    <div>
                                        <div>
                                            <div>
                                                <Col>{displayValue(gender)}, {minimumAge}-{maximumAge}</Col>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div>
                                        <div>
                                            <div>
                                                <Col> {this.renderEthnicAppearance(ethnicAppearance)}</Col>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div>
                                        <div>
                                            <div>
                                                <Col>{minimumHeight != null ? `${minimumHeight}'-${maximumHeight}'` : 'N/A'} </Col>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </button>
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
const mapStateToProps = ({ opportunity, opportunityList }) => {
    const { loading, opportunityData, opportunityFilter } = opportunity;
    const { screenName } = opportunityList;
    return { opportunityData, loading, opportunityFilter, screenName };
};

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, null)(OpportunityRoleTile);
