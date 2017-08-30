import React from 'react'
import PropTypes from 'prop-types'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import {cellSize} from '../constants/props'
import * as CMD from '../constants/commands'
import LimitsBaseComponent, {log} from '../components/LimitsBaseComponent.jsx'


export default class SchedulerLimits extends LimitsBaseComponent {
    
    constructor(props){
        super('SchedulerLimits',props)
    }

    render(){
        return <div>
            {this.props.limits.sort(this.comparePN).map((pn_el, j) =>
                <div className="level_wrapper_pn" key={pn_el.pn}>
                    <div className="one">{pn_el.pn}</div>
                    <div className="two">
                        {pn_el.gts.sort(this.compareGT).map((gt_el, j) =>
                            <div className="level_wrapper_gt" key={gt_el.gt}>
                                <div className="one">{gt_el.gt}</div>
                                <div className="two">
                                    {gt_el.bbs.sort(this.compareValue).map((bb_el, j) =>
                                        <div className="level_wrapper_bb" key={bb_el}>
                                            <div className="one">{bb_el}</div>
                                            <div className="two_1">


                                                {/*Тут будем фильровать данные по ключам аккаунтов
                                                    перебираем данные и накидываем аккаунты в лимит - используем функцию фильтра
                                                    this.state.rows.filter().map((acc, j) =>)     

                                                    у аккаунта может быть несколько лимитов - показываем во всех                

                                                */
                                                }
                                                <div className="account_column">acc1
                                                    {/*тут надо сетку с итогами по аккаунту*/}
                                                    {[...Array(this.props.days+1).keys()].map((col, j) =>
                                                        <div className="day_column" key={j}>{col}</div>
                                                    )}
                                                </div>
                                                <div className="account_column">acc2
                                                    {/*тут надо сетку с итогами по аккаунту*/}
                                                    {[...Array(this.props.days+1).keys()].map((col, j) =>
                                                        <div className="day_column" key={j}>{col}</div>
                                                    )}
                                                </div>


                                            </div>
                                        </div>
                                    )}            
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            </div>

    }
}


SchedulerLimits.propTypes = {
    limits: PropTypes.array.isRequired,
    schedulerActions: PropTypes.object.isRequired
}