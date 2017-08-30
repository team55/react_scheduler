//node_modules
import moment from 'moment'
import React from 'react'
import { render } from 'react-dom'
import Redux, { createStore, bindActionCreators, combineReducers } from 'redux'
import { connect, Provider } from 'react-redux'

//components
import {log} from './components/LimitsBaseComponent.jsx'
import Scheduler from './components/Scheduler.jsx'
import SchedulerLimits from './components/SchedulerLimits.jsx'
import * as CMD from './constants/commands'

//css
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
    //TODO: это должно быть в редусере
    //TODO: не разбить ли на отдельные записи?
    schedules: [
        {accid:1000, schedules:[ [20,0,22,6],[24,1,24,4],[25,22,26,4],[1,22,2,8] ],  templates:[], markers:[ [22,1,24,12] ], },
        {accid:1001, schedules:[ [1,0,1,6],[29,1,29,4],[25,22,26,4]],  templates:[],markers:[ [22,2,24,3] ],},
        {accid:1002, schedules:[ [1,0,1,6], [2,0,2,6] ], templates:[ [2,0,2,6] ], markers:[ [22,2,24,3] ],}
    ],
    //предсказания по таргет лимиту аккаунта?
    predictions: [ [1,0,10],[1,1,9],[1,3,5] ], 
    //Аккаунт график которого редактируем
    current_account:1000, 
    current_account_tables:0,
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

// import page from './page'
// import user from './user'

// export default combineReducers({
//   page,
//   user
// })
//predictions 
//schedules
//markers
//schedules

//FIXME: в стейт передается старый стейт - потом он маппится в проперти
//Преобразовывать данные нужно при начальном заполнении???
function editorStateReducer(state, action) {
    log('calling reducer', state, action)

    //если в пайлод запихнули параметры то можем их все пробросить в стейт
    //но если надо делать какое то действие то не обойтись без логики (хотя мы же можем и функцию передать которой обработать)
    let prepareMap = function(m,src){
        src.forEach(dt=>{
            let idx_start = (dt[0]-1)*24 + dt[1]    
            let idx_stop = (dt[2]-1)*24 + dt[3]    
            //log('start creating',idx_start, idx_stop)    
            for (let i = idx_start; i <= idx_stop; i++) {
                m.set(i,state.current_account_tables) 
            }
        })
    }

    switch (action.type) {

        case CMD.TOGGLE_MODE:
            return { ...state, current_mode: state.current_mode === 'edit'?'view':'edit' }

        case CMD.SET_ACCOUNT:

            //ЧИТАЕМ С БАЗЫ ДАННЫХ
            //МАПИМ В КОЛЛЕКЦИИ часов


            //Подготовка расписания по аккаунту
            let account_schedules = new Map()
            let account_markers = new Map()
            let account_templates = new Map()
            let all_schedules = new Map() 

            let color = getColor(action.payload)

            state.schedules
                .filter(s=>s.accid===action.payload)
                .forEach((acc)=>{
                    prepareMap(account_schedules, acc.schedules)
                    prepareMap(account_markers,   acc.markers)
                    prepareMap(account_templates, acc.templates)
            })

            return {...state, 
                current_account: action.payload,
                //start_month:start, 
                //end_month:end, 
                //days: days, //число дней между датами
                current_account_color: color, 
                account_schedules:account_schedules,
                account_markers:account_markers,
                account_templates:account_templates
            }
            

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


        case CMD.ADD_SCHEDULE: {
            
            //asyn api(create schedule)

            //Интервалы всех расписаний?? Убрать или нет потом?
            let all_schedules = state.schedules.slice()
            all_schedules.forEach(e=>{
                 if(e.accid===action.payload.accid) {
                     let start = action.payload.start
                     let stop = action.payload.stop
                     let toadd = [start[0],start[1],stop[0],stop[1]]
                     e.schedules.push(toadd)
                 }
            })


            //Часы конкретного аккаунта - c индекса до индекса
            let acc_schedules = new Map(state.account_schedules) //state.account_schedules.slice() //ТУТ МАП
            for (let i = action.payload.start_index; i <= action.payload.stop_index; i++) {
                acc_schedules.set(i, state.current_account_tables) 
            }

            return { ...state, schedules:all_schedules, account_schedules:acc_schedules} 

        }


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

    //Включить признак в расписании
    //создать расписание - передаем выбранные аккаунты - 
}

//Точка входа для компонента Scheduler которая установит props ИМЯ должно быть с большой буквы!!!
// const Connect = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(Scheduler)

//функции заменил на лямбды
const ConnectedToStoreScheduler = connect(
    //mapStateToProps, если понадобится другая логика вынести в функцию
    (state)=>{
        log('Перед привязкой стейта',state)
        let start = moment.utc(state.month).startOf('month')
        let end = moment.utc(state.month).endOf('month')
        let days = end.diff(start, 'days')
        return {...state, start_month:start, end_month:end, days: days, /*число дней между датами*/}
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
                                  
                                  
       
          
                                 
 