// import bar, {bar2} from './bar';
// import './main.css';

// console.log("App created !!")
// bar();

// export {bar, bar2}


// export function bar3() {
//     console.log("Bar3 called")
//     return "OK"
// }


//import 'babel-polyfill'
import moment from 'moment'
import React from 'react'
import { render } from 'react-dom'
import Redux, { createStore, bindActionCreators } from 'redux'
import { connect, Provider } from 'react-redux'

import {log} from './components/LimitsBaseComponent.jsx'

import Scheduler from './components/Scheduler.jsx'
import SchedulerLimits from './components/SchedulerLimits.jsx'

import * as CMD from './constants/commands'

import './scss/checkboxes.scss'
import './scss/base.scss'
import  './css/main.css';


const initialState = {
    
    //Заголовки грида (зашить в коде?)
    limits: [
        {pn: 'IP',  gts: [ {gt:'NL', bbs:['C100','C200','C400'] }, {gt:'FL', bbs:['C400','C100'] }, {gt:'NLR',  bbs:['C100']  } ] },
        {pn: 'AC',  gts: [ {gt:'NL',bbs:['C100']}, {gt:'MTT',bbs:['C100','C200','C400']}, {gt:'SNG',bbs:['C400']} ] }
    ],
    //Предсказания по лимитам (засунуть в дерево или держать в отдельной коллекции)
    //Хешмап ключ = PN_GT_BB_DD_HH
    //Доступные аккаунты по лимиту (как сбрасывать куррент - обходом списка?)
    //Цвет присваивается на момент включения и остается за аккаунтом (может быть в расписании)
    //TODO: поведение когда подгрузился аккаунт по фильтру - например убрали лимиты
    accounts: [
        {accid:1000, name:'acc1', comp_name:'comp1', selected:false, color:'', limits:[]},
        {accid:1001, name:'acc2', comp_name:'comp1', selected:false, color:'', limits:[]}, //по этому нет данных
        {accid:1002, name:'acc3', comp_name:'comp2', selected:true,  color:'', limits:[]}]
    ,
    //вот тут вопрос - засунуть это в аккаунт или хранить отдельно
    // schedules: [
    //     //А не переделать ли на период start-stop как и отдаем 1с
    //     {accid:1000, data:[ /*[DD,HH,LEN]*/ [22,0,6],[24,1,4],[25,4,4],[1,22,8] ], locks:[ [22,1,24,12] ], },
    //     {accid:1002, data:[[22,0,6],[29,1,4],[25,4,4]], locks:[ [22,2,24,3] ],}
    // ],
    schedules: [
        {accid:1000, data:[ [20,0,22,6],[24,1,24,4],[25,22,26,4],[1,22,2,8] ],  templates:[], locks:[ [22,1,24,12] ], },
        {accid:1001, data:[ [1,0,1,6],[29,1,29,4],[25,22,26,4]],  templates:[],locks:[ [22,2,24,3] ],},
        {accid:1002, data:[ [1,0,1,6] ], templates:[ [2,0,2,6] ], locks:[ [22,2,24,3] ],}
    ],
    //Аккаунт график которого редактируем
    current_account:1000, 
    //Колонка по которой сортируются данные
    sort_account: '',
    account_sort_order: '',
    //поле поиска аккаунта
    search_account:'',
    //MODES: edit, view
    current_mode: 'view', 
    month: '2017-08-01 00:00:00', 
    state: 'loading' //ready - работаем или показываем прогресс бар
}


function editorStateReducer(state = initialState, action) {
    log('calling reducer', state, action)

    //если в пайлод запихнули параметры то можем их все пробросить в стейт
    //но если надо делать какое то действие то не обойтись без логики (хотя мы же можем и функцию передать которой обработать)

    switch (action.type) {

        case CMD.TOGGLE_MODE:
            return { ...state, current_mode: state.current_mode === 'edit'?'view':'edit' }

        case CMD.SET_ACCOUNT:
            return { ...state, current_account: action.payload }

        case CMD.MARK_ACCOUNT:{
            
            let newstate = state.accounts.slice() //именно копия иначе будет ссылка на тот же массив   
            newstate.forEach(e=>{
                if(e.accid==action.payload) e.selected = !e.selected 
            })
            return { ...state, accounts:newstate} 
        }

        case CMD.SEARCH_ACCOUNT:
            return { ...state, search_account: action.payload }

        case CMD.SORT_ACCOUNTS:{

           let _account_sort_order = ''
           if(state.sort_account == action.payload) {
               switch (state.account_sort_order)  {
                  case '': 
                      _account_sort_order = 'asc'
                      break
                  case 'asc': 
                      _account_sort_order = 'desc'
                      break
                  case 'desc': 
                      _account_sort_order = ''
                      break
              }
            }else{
                _account_sort_order = 'asc'
            }
            return { ...state, sort_account: action.payload, account_sort_order:_account_sort_order }
        }

        //УБРАТЬ ПОТОМ
        case CMD.ADD_ACCOUNT:
            return { ...state, current_account: 0, accounts: state.accounts.concat(action.payload) }

        default: //@@redux.INIT
            return state;
    }

}

//Это может быть объект или функция - в функцию мы по идее можем пробросить команду и параметры - все параметры пихать в пайлод
const actionCreator = {

    //По идее тут можно сделать одну функцию - с параметром командой и параметрами
    //а вот если разъезжаются по параметрам - тогда нужно несколько
    performAction: function(type, data) {
        return {
            type: type,
            payload: data
        }
    },

    // setMode: function(mode) {
    //     log('called set mode:',mode)
    //     return {
    //         type: CMD.SET_MODE,
    //         payload: mode
    //     }
    // },
    // setCurrentAccount: function(accid) {
    //     return {
    //         type: SET_ACCOUNT,
    //         payload: accid
    //     }
    // },

    //Включить признак в расписании
    //создать расписание - передаем выбранные аккаунты - 
}

//Точка входа для компонента Scheduler которая установит props ИМЯ должно быть с большой буквы!!!
// const Connect = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(Scheduler)

//функции заменил на лямбды
const ConnectedToStoreScheduler = connect(
    //mapStateToProps, если понадобится другая логика вынести в функцию
    (state)=>{
        let start = moment.utc(state.month).startOf('month')
        let end = moment.utc(state.month).endOf('month')
        let days = end.diff(start, 'days')
        
        return {...state, start_month:start, end_month:end, days: days }
    }, 
    //mapDispatchToProps
    (dispatch)=>{return {schedulerActions:bindActionCreators(actionCreator, dispatch)}} 
)(Scheduler)

// const store = configureStore()
const store = createStore(editorStateReducer, initialState, 
window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())

// ReactDOM.render(
//     <ReactRedux.Provider store = {store}>
//         <ConnectedToStoreScheduler />
//     </ReactRedux.Provider>, 
//     document.getElementById('scheduler_root')
// )


// render(
//   <Scheduler />,
//   document.getElementById('root')
// )
                         
render(
    <Provider store = {store}>
        <ConnectedToStoreScheduler />
    </Provider>, 
    document.getElementById('root')
)
                                  
                                  
       
          
                                 
 