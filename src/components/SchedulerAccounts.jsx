import React from 'react'
import PropTypes from 'prop-types'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import * as CMD from '../constants/commands'
import LimitsBaseComponent, {log} from '../components/LimitsBaseComponent.jsx'
import Toggle from '../components/Toggle.jsx'
import classNames from 'classnames'
import '../modules/colorGenerator'

import '../scss/accounts_table.scss'

export default class SchedulerAccounts extends LimitsBaseComponent {

    //Два режима
    //просмотр - выбираем аккаунты для включения в расписание
    //редактирование - выбираем аккаунт которыми оперируем (текущий аккаунт в стейте), все остальные не отображаются

    constructor(props){
        super('ACCOUNTS',props)

        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.clickCallBack = this.clickCallBack.bind(this);

        //---------------------------------------------------
        this._handleSearch = this._handleSearch.bind(this)
        this._handleSort = this._handleSort.bind(this)


        //В зависимости от режима разный состав колонок (точнее нет колонки с флажками отметками)
        this.titles = ['*','*','accid','name'] //Вынести в стейт, сделать объектами, добавить признак сортировки (пусто, возр, убыв)

    }

    clickCallBack(accid, e) {
        log("вызвали обновление строки")
        this.props.schedulerActions.performAction(CMD.SET_ACCOUNT,accid)
        //TODO: Показываем детальные данные
    }
    


    _handleSort(column, e) {
        this.props.schedulerActions.performAction(CMD.SORT_ACCOUNTS,column)
    }

    _handleSearch(e) {
        this.props.schedulerActions.performAction(CMD.SEARCH_ACCOUNT, e.target.value)
    }

    //Изменение текста элемента УДАЛИТЬ
    handleChange(e) {
        this.props.schedulerActions.performAction(CMD.SET_ACCOUNT,+e.target.value)
    }

    //Найти по лимиту - добавить в нужный уровень
    handleSubmit(e) {
        e.preventDefault();
        // log('SUBMIT PROPS', this.props)
        // log('SUBMIT STATE', this.state)
        let newItem = {
            accid: this.props.current_account,
            name:'accid',
            selected:true
        };
        
        this.props.schedulerActions.performAction(CMD.ADD_ACCOUNT,newItem)
    }

    //PN GT BBScale AccId + строка которая апдейтится в базу данных
    //после того как закоммитили - меняем статус - обновляется контрол

    render() {

        //TODO: Нужна отметка аккаунтов
        let _accs = this.props.accounts

        //Поиск аккаунтов
        if(this.props.search_account!=='') _accs = _accs.filter((el, idx, arr)=>{
            //Преобразование типов нужно !!! так как ищем по строке
            return el.accid == this.props.search_account || el.name.includes(this.props.search_account)
        }, this)

        if(this.props.current_mode === 'edit') _accs = _accs.filter((el, idx, arr)=>{
            return el.selected
        }, this)


        //Сортировка аккаунтов
        if(this.props.sort_account!=='') _accs = _accs.sort( (a, b)=>{
            let col = this.props.sort_account

            //DESC
            if(this.props.account_sort_order==='desc'){
                if (b[col]<a[col])  return -1;
                if (b[col]>a[col]) return 1;
                return 0;
            }
             
            if (a[col]<b[col])  return -1;
            if (a[col]>b[col]) return 1;
            return 0;

        }, this)

        function _headerPresentation(props,col){
            let info = ''
            if(props.sort_account === col && props.account_sort_order!=='') info = props.account_sort_order==='asc'?'▲':'▼'
            return `${col} ${info}`
        }

        //TODO: изменение вида при редактировании + присвоение цветов каждому аккаунту - атррибуты бордюра в 4 пикселя слева
        return (
            <div className="accountsPanel">

                <input key={'account_search_field'} onChange={this._handleSearch} value={this.props.search_account} />

                {/*-------------------------- TODO: УДАЛИТЬ ----------------------------------*/}
                <form onSubmit={this.handleSubmit}>
                    <input onChange={this.handleChange} value={this.props.current_account} />
                    <button>{'Add #' + (this.props.accounts.length + 1)}</button>
                </form>
                {/*-------------------------- TODO: УДАЛИТЬ ----------------------------------*/}

                <table id="accounts-table">

                {/* <this.Header1 />
                <thead><tr>{this.titles.map(th)}</tr></thead>
                onClick={ (e,e1) => this.clickCallBack(row.account, e)}
                смотрим по этой ли колонке сортировка, если да указываем сортордер
                */}

                <thead><tr>{
                    this.titles.map( (col, j) => <th key={j} onClick={ (e,e1) => this._handleSort(col, e)} >{_headerPresentation(this.props, col)}</th> )
                }</tr></thead>
                <tbody>
                    {/*.sort(this.sortAccounts) нужна функция компоратор зависимая от стейта - сравнивать два элемента по настройкам accid, name и порядок*/}
                    {/*.filter или find(this.sortAccounts) нужна функция отбора элементов по выражению (внутри всего слова или по ID) 
                    key={this.createRowKey(row)}
                    */}
                    
                    {
                        _accs.map((row, i) => {

                            const trClasses = classNames({
                                // 'main-class': true,
                                'current': row.accid===this.props.current_account && this.props.current_mode === 'edit'
                            });
                            //..return (<li className={liClasses}>{data.name}</li>);

                            const accStyle = {
                                background: getColor(row.accid)
                            };

                            return <ReactCSSTransitionGroup
                                key={row.accid}
                                transitionName="anim"
                                transitionAppear={true} transitionAppearTimeout={1000}
                                transitionEnter={false} transitionEnterTimeout={1000}
                                transitionLeave={true} transitionLeaveTimeout={1000}
                                component="tr" className={trClasses}
                                data-acc={row['accid']}>

                                <td style={accStyle} onClick={ (e,e1) => this.clickCallBack(row.accid, e)}></td>
                                <td key={'sw_'+row.accid}>
                                    <Toggle key={'tgl_'+row.accid} {...{accid:row.accid, selected:row.selected, schedulerActions:this.props.schedulerActions}}/>
                                </td>
                                {this.titles
                                    .filter( (col, j) => col!='*' )
                                    .map( (col, j) => <td key={j} >{row[col]}</td>)}

                            </ReactCSSTransitionGroup>

                        }
                    )}
                    </tbody>
                </table>
            </div>
        );
    } 

}


SchedulerAccounts.propTypes = {
    accounts: PropTypes.array.isRequired,
    schedulerActions: PropTypes.object.isRequired
}