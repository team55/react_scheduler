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
        this.size=[cellSize*24+64,cellSize*props.days+64]
        this.cellRefs = new Map()
        this.selected_index = 0
    }


    render() {

        //Дальше задача - найти нужны див и воткнуть дочерний элемент
        // return <div>
        //     {
        //         this.datas.map((row, i)=>{
        //
        //             let accs = this.accounts_in_date[row.day];
        //             // log(row)
        //             const styles = {
        //                 position: 'absolute',
        //                 top: row.day*cellSize,    // computed based on child and parent's height
        //                 left: row.hour*cellSize,   // computed based on child and parent's width
        //                 width: cellSize,
        //                 height: cellSize * (accs==0?1:accs), //В зависимости от числа аакаунтов в день
        //                 background:'#fff',
        //                 borderColor: '#111',
        //                 borderWidth: '1px',
        //                 borderStyle: 'solid',
        //                 cursor: 'pointer',
        //                 shapeRendering: 'crispEdges'
        //             };
        //
        //             //Ячейка которую будем искать что бы засунуть данные
        //             const cellkey = `cell${row.day}-${row.hour}`
        //
        //
        //
        //
        //             return <div key={cellkey} style={styles}>{`${row.day}:${row.hour}`}</div>
        //         })
        //
        //     }
        // </div>


        // //TODO: ветка по дням основная и не трогается - в нее коммитятся остальные
        // return <div>
        //     {
        //         this.datas.map((row, i)=>{
        //
        //             let accs = this.accounts_in_date[row.day];
        //             // log(row)
        //             const styles = {
        //                 position: 'absolute',
        //                 top: row.day*cellSize,    // computed based on child and parent's height
        //                 left: row.hour*cellSize,   // computed based on child and parent's width
        //                 width: cellSize,
        //                 height: cellSize * (accs==0?1:accs), //В зависимости от числа аакаунтов в день
        //                 background:'#fff',
        //                 borderColor: '#111',
        //                 borderWidth: '1px',
        //                 borderStyle: 'solid',
        //                 cursor: 'pointer',
        //                 shapeRendering: 'crispEdges'
        //         };
        //             //Ячейка которую будем искать что бы засунуть данные
        //             const cellkey = `cell${row.day}-${row.hour}`
        //             return <div key={cellkey} style={styles}>{`${row.day}:${row.hour}`}</div>
        //         })
        //
        //     }
        // </div>

        this.prepared_schedules = new Map()
        this.prepared_locks = new Map()
        this.prepared_templates = new Map()
        this.prepared_other_schedules = new Map() //TODO: забить попозже

        this.currentColor = getColor(this.props.current_account)
        
        let prepareMap = function(m,src){
            src.forEach(dt=>{
                let idx_start = (dt[0]-1)*24 + dt[1]    
                let idx_stop = (dt[2]-1)*24 + dt[3]    
                log('start creating',idx_start, idx_stop)    
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
                _days.map((dd,i1)=>{
                    return <div className="barEditorDayCell" key={"dat_"+dd}>
                        <div className="barEditorDay" >{dd+1}</div>
                        {
                            _hours.map((hh,i2)=>{
                                let key = `cell_${dd}_${hh}`
                                let index = i1*24 + i2

                                //Бордюр может быть??    
                                const cellStyles = {}
                                if(this.prepared_schedules.has(index)){
                                    cellStyles.background = this.currentColor
                                }

                                const cellClasses = classNames({
                                    'barEditorHourCell': true,
                                    'disabled':false, //markers
                                    'selected': this.prepared_schedules.has(index)
                                });

                                return <div draggable="true" 
                                        style={cellStyles}
                                        className={cellClasses}
                                        ref={el=>this.cellRefs.set(key,el)} 
                                        key={key} 
                                        onClick={ (event)=>this._onClick(key, event) }
                                        onDragStart={ (event)=>this._onDragStart(key, event) }
                                        onDragEnd={ (event)=>this._onDragEnd(key, event) }
                                        onDragOver={ (event)=>this._onDragOver(key, event)} 
                                        onDrop={(event)=>this._onDrop(key, event)}
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

    setStartCell(key){
        let indexes = [...this.cellRefs.keys()]
        this.selected_index = indexes.indexOf(key)
    }

    setEndCell(key){
        let indexes = [...this.cellRefs.keys()]
        let index = indexes.indexOf(key)
        let min_idx = Math.min(index, this.selected_index)
        let max_idx = Math.max(index, this.selected_index)
        log('подсвечиваем ячейки', min_idx,max_idx)
        indexes.forEach(
            el => this.cellRefs.get(el).className = "barEditorHourCell"
        )    
        indexes.slice(min_idx,max_idx+1).forEach(
            el => this.cellRefs.get(el).className = "barEditorHourCell higlight"
        )    
    }

    markFromStartToEndCell(key){
        let indexes = [...this.cellRefs.keys()]
        let index = indexes.indexOf(key)
        let min_idx = Math.min(index, this.selected_index)
        let max_idx = Math.max(index, this.selected_index)
        log('Выделяем ячейки', min_idx,max_idx)
        indexes.slice(min_idx,max_idx+1).forEach(
            el => {
                //Определяем начало диапазона и конец
                log('Выделяем', el)
            }
            
        )    
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
        this.setEndCell(key)
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



    _onDragEnd(key, event){
        log(event.type, key, event) 
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

        
        
        // let DDs,HHs,DDe,HHe = 0
        // if(context.pressed){
        //     //Выделяем диапазон от начала выделения до кончания выделания
        //     //начало - если день тот де самый - минимум и максимум от дней
        //     //иначе если меньше
        //     if(context.select_day < data.day){
        //         DDs = context.select_day
        //         DDe = data.day
        //         HHs = context.select_hour
        //         HHe = data.hour
        //     }else if(context.select_day > data.day){
        //         DDe = context.select_day
        //         DDs = data.day
        //         HHe = context.select_hour
        //         HHs = data.hour
        //     }else{
        //         DDs = DDe = data.day
        //         HHs = Math.min(context.select_hour,data.hour)
        //         HHe = Math.max(context.select_hour,data.hour)
        //     }
        
        //     log('SELECT:',DDs,HHs,DDe,HHe, min_idx, max_idx)
        //
        //     //или просто по индексам??? - взять первый взять последний
        //     d3.selectAll('.graf').each(function (d,i){
        //         if(i>=min_idx && i<=max_idx){
        //             //TODO: пропустить задисабленные
        //             d.selected = true
        //             d3.select(this).classed('state--selected', true)  // в обработчике меняем значение переменной и вычисляем класс
        //         }
        //     } )
        //
        //     //TODO: оповестить редукс о изменении данных (пересчет итогов и отображение меток аккаунтов)
        //
        //
        // }else{
        //     context.select_day = data.day
        //     context.select_hour = data.hour
        //     context.select_index = index
        //     log('START SELECT:',context.select_day,context.select_hour)
        // }
        //
        //
        // context.pressed = !context.pressed
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
    //schedulerActions: PropTypes.object.isRequired
}
