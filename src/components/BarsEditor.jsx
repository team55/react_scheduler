import React from 'react'
import PropTypes from 'prop-types'

import {cellSize} from "../constants/props";
import * as CMD from '../constants/commands'
import LimitsBaseComponent, {log} from '../components/LimitsBaseComponent.jsx'

import '../scss/scheduler.scss';

export default class BarsEditor extends LimitsBaseComponent {
   
    constructor(props){
        super('BARS EDITOR',props)
        this.prepareGrid = this.prepareGrid.bind(this)

        //Подготавливаем все данные расписания - в рендере поготовка
        //Рисуем как набор дивов которые могут менять размеры - дни

        this.prepared_schedules = []
        props.schedules.forEach(s=>{
            s.data.forEach(d=>{
                let offets =  [...Array(d[2]).keys()]
                offets.map((of,i)=>{
                    let dd = d[0];
                    let hh = d[1] + of;
                    if(hh>23) {
                        let diff_days = hh/24 //число дней
                        dd+= diff_days
                        hh-=24*diff_days
                    }
                     this.prepared_schedules[`${s.accid}_${dd}-${hh}`] = 1
                })
            })
        })
        log('prepared',this.prepared_schedules)

        this.size=[cellSize*24+64,cellSize*props.days+64]

        this.grid = this.prepareGrid(props)
        this.cellRefs = []

    }

    prepareGrid(props){
        log('prepareGrid',this)
        let _days =  [...Array(props.days).keys()]
        let _hours =  [...Array(24).keys()]

        //todo: стли ячейки аккаунта
        // const styles_cell = {
        //     width: cellSize,
        // style={styles_cell}
        // }

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
                                return <div ref={el=>this.cellRefs[key] = el} key={key} className="barEditorHourCell" onClick={(e,e1) => this._handleClick(key, e)}>
                                    {hh}
                                    {/* Сюда инжектить ячейку - у нее свойства - дочерние накидывать их рендерить дивами
                                    либо сразу отдавать - брать по ключу коллекцию аккаунтов */}
                                </div>
                            })
                        }
                    </div>
                })
            }
        </div>


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

    }


    render() {


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

        //TODO: Сделать элемент day_cell а у него дочерние? как динамически добавить?
        //Пока получается следующий способ - элемент ячейка - у нее стейт - дочерние
        //Находим нужный элемент и устанавливаем стейт
        return this.grid

    }



    _handleClick(key, el){
        this.cellRefs[key].className = "barEditorHourCell selected"
        log('cell click', key, el)

        // //TODO: Клик начало выбора ячейки второй клик - окончание периода даже если на той же клетке
        // //TODO: Клик с зажатым ctrl отдельные ячейки
        // //клик с нажатым контролом - если до этого начато выделение - окончание периода, иначе выделение ячейки
        //
        // //log(d3.event)
        // //if (d3.event.defaultPrevented) return; // dragged - если делать call
        //
        // if (d3.event.ctrlKey) {
        //     //меняем статус отдельного элемента
        //     if(d3.event.type=='contextmenu') d3.event.preventDefault(); //на mac os нажали с ctrl
        //     d3.select(element).classed('state--selected', data.pressed = !data.pressed)  // в обработчике меняем значение переменной и вычисляем класс
        //     return
        // }
        // if (d3.event.shiftKey) {
        //     //Пока ника не задействовано
        // }
        //
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
        //
        //     let min_idx = Math.min(index, context.select_index)
        //     let max_idx = Math.max(index, context.select_index)
        //
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
