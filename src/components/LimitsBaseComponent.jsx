import React from 'react'
import PropTypes from 'prop-types'

export const log = console.log.bind(console);

export default class LimitsBaseComponent extends React.Component {

    constructor(name, props){
        super()

        log('BASE:', name, props)

        this.name = name
        this.sortLimits = this.sortLimits.bind(this);
        this.comparePN = this.comparePN.bind(this);
        this.compareGT = this.compareGT.bind(this);
        this.compareBB = this.compareBB.bind(this);
        this.compareAccount = this.compareAccount.bind(this);      
    }

    //перекрыт потомками
    render(){
        log('RENDER:',this.name)
        return null;
    }

    // _log(methodName, args){
    //     console.log(`${this.name}::${methodName}`, args )
    // } 

    componentDidlUpdate(){
        log(this.name,'componentDidUpdate', arguments)
    } 
    
    componentWillUnmount(){
        log(this.name,'componentWillUnmount', arguments)
    }

    componentDidMount(){
        log(this.name,"componentDidMount", arguments);
    }

    componentWillUnmount(){
        log(this.name,"componentWillUnmount", arguments);
    }

    componentWillUpdate(){
        log(this.name,'componentWillUpdate', arguments)
    }


    compareLimitValue(a,b){
        if (a<b)  return -1;
        if (a>b) return 1;
        return 0;
    }

    comparePN(a,b){
        return this.compareLimitValue(a.pn,b.pn);;
    }

    compareGT(a,b){
        return this.compareLimitValue(a.gt,b.gt);
    }

    compareBB(a,b){
        return this.compareLimitValue(a.bb,b.bb);
    }

    compareAccount(a,b){
        return this.compareLimitValue(a.account,b.account);
    }

    sortLimits(a,b){
        let v = this.compareLimitValue(a.pn,b.pn);
        if(v==0)   {
            v = this.compareLimitValue(a.gt,b.gt);
            if(v==0)   {
                v = this.compareLimitValue(a.bb,b.bb);
                if(v==0)   {
                    v = this.compareLimitValue(a.account,b.account);
                } 
            } 
        } 
        return v;
    }


    createRowKey(r){
        return `${r.pn}_${r.gt}_${r.bb}_${r.account}`
    }


}