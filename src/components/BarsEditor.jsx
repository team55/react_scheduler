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
        this._onDrop = this._onDrop.bind(this)
        this.markFromStartToEndCell = this.markFromStartToEndCell.bind(this)

        this.size=[cellSize*24+64,cellSize*props.days+64] //??? вроде не нужно уже 
        this.cellRefs = new Map() //??? вроде не нужно уже 
        this.cellIndexes = new Map()
        this.selected_index = 0
    }


    render() {

        //----- TODO: вынести в редусер -------

        this.prepared_schedules = new Map()
        this.prepared_locks = new Map()
        this.prepared_templates = new Map()
        this.prepared_other_schedules = new Map() //TODO: забить попозже

        this.currentColor = getColor(this.props.current_account)
        
        let prepareMap = function(m,src){
            src.forEach(dt=>{
                let idx_start = (dt[0]-1)*24 + dt[1]    
                let idx_stop = (dt[2]-1)*24 + dt[3]    
                //log('start creating',idx_start, idx_stop)    
                for (let i = idx_start; i <= idx_stop; i++) {
                    m.set(i,6) //TODO: число столов аккаунта??
                }
            })
        }

        this.props.schedules
            .filter(s=>s.accid===this.props.current_account)
            .forEach((acc)=>{
                prepareMap(this.prepared_schedules, acc.data)
                prepareMap(this.prepared_locks, acc.locks)
                prepareMap(this.prepared_templates, acc.templates)
        })

        //----- TODO: вынести в редусер ------- !!!!


        log('prepared',this.prepared_schedules)

        let _days =  [...Array(this.props.days).keys()]
        let _hours =  [...Array(24).keys()]
        

        return <div>
            <div className="barEditorDay" ></div>
            {
                _hours.map((hh,i2)=>{
                    let key = `hcell_${hh}`
                    return <div key={key} className="barEditorHourHeader">{hh}</div>
                })
            }
            {
                _days.map((dd,index_day)=>{
                    return <div className="barEditorDayCell" key={"date_"+dd}>
                        {/* TODO: предсказание по таргет лимиту аккаунта*/}
                        <div className="barEditorDay" >{dd+1}</div>
                        {
                            _hours.map((hh,i2)=>{
                                
                                let key = `cell_${dd}_${hh}` //TODO: поменять на индекс
                                let index = index_day*24 + i2
                                this.cellIndexes.set(index,[dd+1,hh])

                                //Бордюр может быть??    
                                const _selected = this.prepared_schedules.has(index)
                                const _selected_marker = this.prepared_locks.has(index)

                                
                                const cellStyles = {}
                                if(_selected){
                                    cellStyles.background = this.currentColor
                                }

                                //не всегда отрабатывает selected
                                const cellClasses = classNames({
                                    'barEditorHourCell': true,
                                    'disabled':false, //markers
                                    'selected': _selected
                                });

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
                    </div>
                })
            }
        </div>

    }

    //----------------------------------------------------

    setStartCell(index){
        // let indexes = [...this.cellRefs.keys()]
        // this.selected_index = indexes.indexOf(key)
        this.selected_index = index
    }

    //FIXME: чистит и уже размеченные стили - должна добавлять !! 
    setEndCell(index){
        // let indexes = [...this.cellRefs.keys()]
        // let index = indexes.indexOf(key)
        // let min_idx = Math.min(index, this.selected_index)
        // let max_idx = Math.max(index, this.selected_index)
        let min_idx = Math.min(index, this.selected_index)
        let max_idx = Math.max(index, this.selected_index)

        //TODO: новая логика - обрабатываем все ячейки 
        //стандартные селекторы + там где индекс между указанными подсвечиваем

        log('подсвечиваем ячейки', min_idx,max_idx, this.cellRefs)
        this.cellIndexes.forEach(el => {
                const _selected_schedule = this.prepared_schedules.has(index)
                const _selected_marker = this.prepared_locks.has(index)

                const cellClasses = classNames({
                    'barEditorHourCell': true,
                    'disabled': _selected_marker, 
                    'selected': _selected_schedule,
                    'highlight': index>=min_idx && index<=max_idx+1
                });
                log(el)
                //this.cellRefs.get(+el).className = cellClasses
            }
        )    
        // indexes.slice(min_idx,max_idx+1).forEach(
        //     el => this.cellRefs.get(el).className = "barEditorHourCell higlight"
        // )    
        this._prev_h_key = undefined
    }

    markFromStartToEndCell(key){
        let indexes = [...this.cellRefs.keys()]
        let index = indexes.indexOf(key)
        let min_idx = Math.min(index, this.selected_index)
        let max_idx = Math.max(index, this.selected_index)
        //log('Выделяем ячейки', min_idx,max_idx)
        this.props.schedulerActions.performAction(
            CMD.ADD_SCHEDULE,
            {
                accid:this.props.current_account,
                start:this.cellIndexes.get(min_idx),
                stop:this.cellIndexes.get(max_idx)
            })

        // indexes.slice(min_idx,max_idx+1).forEach(
        //     el => {
        //         })
        //     }
        // )    
    }


    //----------------------------------------------------
    _onDragStart(key, event){
        // event.dataTransfer.setData('data', JSON.stringify("test")); 
        //log(event.type, key) 
        this.setStartCell(key)    
    }

    _onDragOver(key,event) {
        //log(event.type, key) 
        event.preventDefault()

        if(this._prev_h_key != key)
            this.setEndCell(key)

        this._prev_h_key = key
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
        //как отследить до одинарного клика?
        log('TWICE',event, key) 
        //Удаляем если выделено
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


    componentDidMount() {
        //this.createBarChart()
    }

    componentDidUpdate() {
        //this.createBarChart()
    }

}

BarsEditor.propTypes = {
    schedules: PropTypes.array.isRequired,
    //current_mode: PropTypes.string.isRequired,
    //setMode: PropTypes.func.isRequired
    schedulerActions: PropTypes.object.isRequired
}
