import React from 'react'
import PropTypes from 'prop-types'

import * as CMD from '../constants/commands'

import LimitsBaseComponent, {log} from '../components/LimitsBaseComponent.jsx'

//https://codepen.io/bbodine1/pen/novBm вот еще прикольные на css

export default class Toggle extends LimitsBaseComponent {
  
  constructor(props) {
    super('TOGGLE',props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    this.props.schedulerActions.performAction(CMD.MARK_ACCOUNT,this.props.accid)
  }

  render() {
    let id = `chkAcc${this.props.accid}`
    //log(id)

    return (
        <p>
          <input id={id} type='checkbox' value='UID8' checked={this.props.selected} onChange={this.handleClick}/>
          <label htmlFor={id}>{this.props.accid}</label>
        </p>
    );
  }

}