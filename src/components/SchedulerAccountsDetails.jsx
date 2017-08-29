import React from 'react'
import LimitsBaseComponent from '../components/LimitsBaseComponent.jsx'
import * as CMD from '../constants/commands'

export default class SchedulerAccountsDetails extends LimitsBaseComponent {
    constructor(props){
        super('ACCOUNT_DETAILS',props)

        this.nextMode = this.nextMode.bind(this)
        this.onChangeAction = this.onChangeAction.bind(this)

    }

    nextMode(){
        return this.props.current_mode === 'edit'?'back to limits':'edit schedules'
    }

    onChangeAction(e) {
        this.props.schedulerActions.performAction(CMD.TOGGLE_MODE,null)
    }

    render(){

        let accs = this.props.accounts
            .filter((row,i)=>{return row.selected})
            .map((row, i)=>{return <div key={row.accid}>{row.accid}</div>})

        //Перебрать детали в вывести информацию по аккаунтам (будет в самих записях аккаунтов)
        return <div>
            <p>
                <button className='btn' onClick={this.onChangeAction}>{this.nextMode()}</button>{' '}
            </p>
            {accs}
        </div>
    }
}