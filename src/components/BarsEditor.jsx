import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import classNames from 'classnames'
// import styleNames from 'stylenames'

import {cellSize} from "../constants/props";
import * as CMD from '../constants/commands'
import LimitsBaseComponent, {log} from '../components/LimitsBaseComponent.jsx'
import '../modules/colorGenerator'

import '../scss/scheduler.scss';

export default class BarsEditor extends LimitsBaseComponent {
   
    constructor(props){
        super('BARS EDITOR',props)
        
        this._onClick = this._onClick.bind(this)
        this._onDragStart = this._onDragStart.bind(this)
        this._onDragOver = this._onDragOver.bind(this)
        this._onDrop = this._onDrop.bind(this)
        this.markFromStartToEndCell = this.markFromStartToEndCell.bind(this)
        this.getCellStyle = this.getCellStyle.bind(this)

        this.size=[cellSize*24+64,cellSize*props.days+64] //??? вроде не нужно уже 
        this.cellRefs = new Map() //??? вроде не нужно уже 
        this.cellIndexes = new Map()
        this.selected_index = 0
    }


    render() {
        let _days =  [...Array(this.props.days).keys()]
        let _hours =  [...Array(24).keys()]

        return <div className="barEditorRoot">
            <div className="barEditorEmpty" ></div>
            {
                _hours.map((hh,i2)=>{
                    let key = `hcell_${hh}`
                    return <div key={key} className="barEditorHourHeader">{hh}</div>
                })
            }
            <div className="barEditorTotalHeader">hours</div>
            <div className="barEditorTotalHeader">tables</div>
            <div className="barEditorTotalHeader">hands</div>
            {
                _days.map((dd,index_day)=>{
                    let curr_dd = dd+1    
                    let ttls = this.props.day_totals.get(curr_dd)

                    return <div key={"date_"+curr_dd}>
                        {/* TODO: предсказание по таргет лимиту аккаунта*/}
                        <div className="barEditorDay" >{curr_dd}</div>
                        {
                            _hours.map((hh,i2)=>{
                                
                                let key = `cell_${dd}_${hh}` //TODO: поменять на индекс
                                let index = index_day*24 + i2
                                this.cellIndexes.set(index,[dd+1,hh])

                                //TODO: а не засунуть ли через спреад синтаксис в сам контрол а ему вклинивать класс и стили
                                const _selected_schedule = this.props.account_schedules.has(index)
                                const cellStyles = {}
                                if(_selected_schedule){
                                    cellStyles.background = this.props.current_account_color
                                }

                                const cellClasses = this.getCellStyle(index,false,0)
                                return <div draggable="true" 
                                        style={cellStyles}
                                        className={cellClasses}
                                        ref={el=>this.cellRefs.set(index,el)} 
                                        key={key} 
                                        onClick={ (event)=>this._onClick(index, event) }
                                        onDragStart={ (event)=>this._onDragStart(index, event) }
                                        onDragOver={ (event)=>this._onDragOver(index, event)} 
                                        onDrop={(event)=>this._onDrop(index, event)}
                                    >
                                    {hh}
                                    {/* Сюда инжектить ячейку - у нее свойства - дочерние накидывать их рендерить дивами
                                    либо сразу отдавать - брать по ключу коллекцию аккаунтов 
                                    либо аккаунты кроме текущего (рамка как индикатор ошибки - при превышении лимита и др.)
                                    */}
                                </div>
                            })
                        }
                        <div className="barEditorTotal" >{ttls.hours}</div>
                        <div className="barEditorTotal" >{ttls.tables}</div>
                        <div className="barEditorTotal" >{ttls.hands}</div>
                    </div>
                })
            }
        </div>

    }


    //----------------------------------------------------
    getCellStyle(key, interactive, index){

        const _selected_schedule = this.props.account_schedules.has(key)
        const _selected_marker = this.props.account_markers.has(key)
        const _selected_template = this.props.account_templates.has(key)
        let _highlight = false

        if(interactive){
            let min_idx = Math.min(index, this.selected_index)
            let max_idx = Math.max(index, this.selected_index)
            _highlight = key>=min_idx && key<=max_idx
        }

        const cellClasses = classNames({
            'barEditorHourCell': true,
            'disabled': _selected_marker, 
            'selected': _selected_schedule,
            'highlight': _highlight,
            'template': _selected_template,
            'errors': (_selected_marker && _selected_schedule) || (_highlight && _selected_marker)
            //в отрисовке просто так _selected_marker && _selected_schedule
        });

        return cellClasses
    }


    //----------------------------------------------------

    //TODO: ключ и индекс - разобраться
    markFromStartToEndCell(index){
        // let indexes = [...this.cellRefs.keys()]
        // let index = indexes.indexOf(key)
        let min_idx = Math.min(index, this.selected_index)
        let max_idx = Math.max(index, this.selected_index)
        this.props.schedulerActions.performAction(
            CMD.ADD_SCHEDULE,
            {
                accid:this.props.current_account,
                start_index:min_idx,
                stop_index:max_idx,
                start:this.cellIndexes.get(min_idx),
                stop:this.cellIndexes.get(max_idx)
            })

    }


    //----------------------------------------------------
    _onDragStart(key, event){
        // event.dataTransfer.setData('data', JSON.stringify("test")); 
        this.selected_index = key
    }

    _onDragOver(key,event) {
        event.preventDefault()

        if(this._previous_hover_key != key) {
            log(event.type, key) 
            this.cellIndexes.forEach(
                (el,currkey,m) => {this.cellRefs.get(key).className = this.getCellStyle(key,true,currkey)
            })    
            //this._previous_hover_key = undefined
        }

        this._previous_hover_key = key
    }
    
    _onDrop(key, event) {
        log(event.type, key) 
        event.preventDefault();
        // let data;
        // try {
        //     data = JSON.parse(event.dataTransfer.getData('data'));
        // } catch (e) {
        //     return;
        // }
        // log(data);

        //Проверить нажатые клавиши - если нажат ctrl то только по подсвеченным клеткам пометка    
        this.markFromStartToEndCell(key)
    }

    _onClick(key,event) {
        //Двойной клик срабатывает вместе с одинарным - такова особенность дом модели

        // log(event, key) 
        // log("CTRL",event.ctrlKey)
        // log("ALT",event.altKey)
        // log("SHIFT",event.shiftKey)

        let ev = {type: event.type, ctrlKey: event.ctrlKey,altKey:event.altKey,shiftKey:event.shiftKey}

        
        if (!this._delayedClick) {
            log('add handler')
            this._delayedClick = _.debounce(this._onClickOnce, 400);
        }
        
        if (this.clickedOnce) {
            this._delayedClick.cancel();
            this.clickedOnce = false;
            this._onClickTwice(key,ev);
        } else {
            this._delayedClick(key,ev);
            this.clickedOnce = true;
        }
    }

    _onClickTwice(key, event){
        //TODO: Перперед шедулеры должны лежать в редуксе - он должен по ним пробежаться и получить начальную и конечную дату    
        log('TWICE',event, key) 
        this.props.schedulerActions.performAction(
            CMD.DELETE_SCHEDULE, 
            {
                accid:this.props.current_account, index: key
            })

    }

    _onClickOnce(key, event){
        this.clickedOnce = undefined;
        log('ONCE',event, key) 

        //TODO: Клик начало выбора ячейки второй клик - окончание периода даже если на той же клетке
        //TODO: Клик с зажатым ctrl отдельные ячейки
        //клик с нажатым контролом - если до этого начато выделение - окончание периода, иначе выделение ячейки

        //SHIFT - выделение диапазона
        //CTRL - отметка ячейки
        //CLICK - info

        // log("CTRL",event.ctrlKey)
        // log("ALT",event.altKey)
        // log("SHIFT",event.shiftKey)

        //Что будет если тут постучаться в child и добавить

        //Не могу достучаться ни к ключам ни к элементам    
        // log(this.cellRefs, this.cellRefs.size()) // 3, 5, 7
        // for (let value of this.cellRefs) {
        //     log(value) // 3, 5, 7
        // }

        let indexes = [...this.cellRefs.keys()]
        let index = indexes.indexOf(key)

        if (event.ctrlKey) {
            this.selected_index = 0;                
            //FIXME Меняем стейт - надо будет в данных менять
            this.cellRefs.get(key).className = "barEditorHourCell selected"
            log('Выделяем ctrl', index)
        }

        if (event.shiftKey) {
            if(this.selected_index>0){
                let min_idx = Math.min(index, this.selected_index)
                let max_idx = Math.max(index, this.selected_index)
                log('Выделяем shift', min_idx,max_idx)
                indexes.slice(min_idx,max_idx+1).forEach(
                    el => this.cellRefs.get(el).className = "barEditorHourCell selected"
                )    
                this.selected_index = 0;      
            }else{
                this.selected_index = index;                
                log('Начали выделять shift', index)
            }
        }

        if (!(event.ctrlKey || event.shiftKey)) {
            this.selected_index = 0;                
        }
        
    }

}

BarsEditor.propTypes = {
    // schedules: PropTypes.array.isRequired,
    days: PropTypes.number.isRequired,
    account_schedules: PropTypes.object.isRequired,
    account_markers: PropTypes.object.isRequired,
    account_templates: PropTypes.object.isRequired,
    day_totals: PropTypes.object.isRequired,
    current_mode: PropTypes.string.isRequired,
    //setMode: PropTypes.func.isRequired
    schedulerActions: PropTypes.object.isRequired
}
