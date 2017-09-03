//node_modules
import moment from 'moment'
import React from 'react'
import { render } from 'react-dom'
import Redux, { createStore, bindActionCreators, combineReducers } from 'redux'
import { connect, Provider } from 'react-redux'
import webix from 'webix-npm'

//components
import {log} from './components/LimitsBaseComponent.jsx'
import Scheduler from './components/Scheduler.jsx'
import SchedulerLimits from './components/SchedulerLimits.jsx'
import * as CMD from './constants/commands'
import {initialState} from './constants/props'

//css
import './scss/checkboxes.scss'
import './scss/base.scss'
import  './css/main.css';



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

//https://stackoverflow.com/questions/29775797/fetch-post-json-data

//Как выход - слать как шлется плайн текстом
//В API запилить FetchCompatibleRestApi где прилетают плайны
//а дальше работают конвертеры 
function baseJsonRequest(url,method,json) {
    //Сделать контроллер запроса ?
    //Поддержка кроссдомена, редирект как ошибка

    //fetch('users.json').then(function(response) {  
    //     console.log(response.headers.get('Content-Type'));  
    //     console.log(response.headers.get('Date'));
    //     console.log(response.status);  
    //     console.log(response.statusText);  
    //     console.log(response.type);  
    //     console.log(response.url);  
    // });

    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    
    let myInit = {  
        method: method,
        headers: myHeaders,
        mode: 'cors',
    //     credentials: 'include', 
    //     cache: 'default',
        body: json 
    }

    return fetch(url, myInit)
}

async function postJsonRequest(url, body) {
    // log('STEP 1')
    let response = await baseJsonRequest(url,'POST',JSON.stringify(body))
    // log('STEP 2', response)
    let json = await response.json()
    // log('STEP 3')
    return json
}

async function putJsonRequest(url) {
    let response = await baseJsonRequest(url,'PUT',JSON.stringify(body))
    let json = await response.json()
    return json
}

async function getJsonRequest(url) {
    let response = await fetch(url)
    let json = await response.json()
    return json
}

//НЕ ТЕ ПРОМАЙСЫ !!!
// async function postJson(url,data, callback, badcallback){
    
//     log('calling post')
//     let rest = await webix.ajax().headers({
//         "Content-type": "application/json"
//     }).post(url, JSON.stringify(data), function (text, data) {
//         log('calling post complete',text, data)
//         const resp = data.json()
//         log(resp)
//         //const resp = JSON.parse(data);
//         if (resp.success) {
//             if(callback) callback()
//         } else {
//             if(badcallback) badcallback
//         }
//     })
// }


//В примерах приводят такое как работающую функцию - но у меня не получилось ее запустить...
function sendRequest(url, method, body) {
    
    const options = {
        method: method,
        headers: new Headers({'content-type': 'application/json'}),
        mode: 'no-cors'
    };

    options.body = JSON.stringify(body);
    return fetch(url, options);
}


//FIXME: в стейт передается старый стейт - потом он маппится в проперти
//Преобразовывать данные нужно при начальном заполнении???
function editorStateReducer(state, action) {
    log('calling reducer', state, action)


    function calculateAccountTotals(schedules_map){
        let day_totals = new Map()
        let _days =  [...Array(state.days).keys()]
        _days.map((dd,index_day)=>{
            day_totals.set(dd+1,{hours:0, tables:0, hands:0})
        })
        //пересчитывает итоги по расписанию аккаунта
        //вызывается при получении и редактировании расписания
        //число часов, число столов, число рук (нужны показатели по лимитам аккаунта)
        schedules_map.forEach( (el,key,s)=> {
            log(el,key)
            let cur = day_totals.get(el.day+1) //0 based
            cur.hours++
            cur.tables = cur.hours * el.tables
        } )

        return day_totals
    }

    //todo:  просчет итогов всех аккаунтов
    function calculateAllAccountTotals(schedules_map){
        let day_totals = new Map()
        let _days =  [...Array(state.days).keys()]
        _days.map((dd,index_day)=>{
            day_totals.set(dd+1,{hours:0, tables:0, hands:0})
        })
        //пересчитывает итоги по расписанию аккаунта
        //вызывается при получении и редактировании расписания
        //число часов, число столов, число рук (нужны показатели по лимитам аккаунта)
        schedules_map.forEach( (el,key,s)=> {
            log(el,key)
            let cur = day_totals.get(el.day+1) //0 based
            cur.hours++
            cur.tables = cur.hours * el.tables
        } )

        return day_totals
    }

    
    switch (action.type) {

        case CMD.TOGGLE_MODE:
            return { ...state, current_mode: state.current_mode === 'edit'?'view':'edit' }

        case CMD.SET_ACCOUNT:

            //если в пайлод запихнули параметры то можем их все пробросить в стейт
            //но если надо делать какое то действие то не обойтись без логики (хотя мы же можем и функцию передать которой обработать)
            let prepareMap = function(m,src){
                src.forEach(dt=>{
                    let idx_start = (dt[0]-1)*24 + dt[1]    
                    let idx_stop = (dt[2]-1)*24 + dt[3]    
                    //log('start creating',idx_start, idx_stop)    
                    for (let i = idx_start; i <= idx_stop; i++) {
                        m.set(i, {
                            tables:action.payload.tables,
                            day: Math.floor( (i/24) ),
                            // hour: i - ((i/24)+1) * 24
                        } ) 
                    }
                })
            }

            //ЧИТАЕМ С БАЗЫ ДАННЫХ
            //МАПИМ В КОЛЛЕКЦИИ часов


            //Подготовка расписания по аккаунту
            let account_schedules = new Map()
            let account_markers = new Map()
            let account_templates = new Map()
            let all_schedules = new Map() 

            let color = getColor(action.payload)

            state.schedules
                .filter(s=>s.accid===action.payload.accid)
                .forEach((acc)=>{
                    prepareMap(account_schedules, acc.schedules)
                    prepareMap(account_markers,   acc.markers)
                    prepareMap(account_templates, acc.templates)
            })

            let day_totals = calculateAccountTotals(account_schedules)

            return {...state, 
                current_account: action.payload,
                account_schedules:account_schedules,
                account_markers:account_markers,
                account_templates:account_templates,
                day_totals:day_totals
            }
            

        case CMD.MARK_ACCOUNT:{
            let newstate = state.accounts.slice() //именно копия иначе будет ссылка на тот же массив   
            newstate.forEach(e=>{
                if(e.accid==action.payload) e.selected = !e.selected 
            })
            return { ...state, accounts:newstate} 
        }

        case CMD.SEARCH_ACCOUNT: return { ...state, search_account: action.payload }

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
            return { ...state, current_account: {}, accounts: state.accounts.concat(action.payload) }


        case CMD.ADD_SCHEDULE: {
            
            // val account_id: String = "",
        	// val start: Timestamp = Timestamp(System.currentTimeMillis()),
	        // val stop: Timestamp = Timestamp(System.currentTimeMillis())
            //Что вебикс что fetch возвращают 

            //  let data = postJsonRequest('http://localhost:9000/accounts_scheduler_api/v2/create_tasks',{account:1000})
             let data = postJsonRequest('http://localhost:8080/accounts_scheduler_api/v2/create_tasks',{account:1000})
              data.then(json=>{
                  log('CREATE SCHEDULE on SERVER:', json)

                //Интервалы всех расписаний?? Убрать или нет потом?

                // postJson(
                //     'http://localhost:9000/accounts_scheduler_api/v2/create_tasks',
                //     {account:1000},
                //     ()=>{

                //         log('Проверка')

                        //ЭТОТ КОД УЖЕ В ДРУГОМ КОНТЕКСТЕ ... 
        
            //         },
            //         ()=>{}
            // )
                
            //-------------------------------------------------------

                
            }).catch(function (error) {  
                log('Request failed:', error);  
                return { ...state} 
            });


            //ТУТ РАЗБИТЬ НА ТРИ ЧАСТИ
            //Первая - отправка на создание (акк и интервалы) заносим в стейт создающихся - они мигают
            //После создания (оповестить что такие-то созданы) - поменять статус или удалить

            let all_schedules = state.schedules.slice()
            all_schedules.forEach(e=>{
                if(e.accid===action.payload.accid) {
                    let start = action.payload.start
                    let stop = action.payload.stop
                    let toadd = [start[0],start[1],stop[0],stop[1]]
                    e.schedules.push(toadd)
                }
            })

            //-------------------------------------------------------
            //TODO: вынести в отдельную функцию подготовку данных аккаунта
            //FIXME: публиковать в ощий стор - потом подтягивать данные
            //Часы конкретного аккаунта - c индекса до индекса
            let acc_schedules = new Map(state.account_schedules) //state.account_schedules.slice() //ТУТ МАП
            for (let i = action.payload.start_index; i <= action.payload.stop_index; i++) {
                acc_schedules.set(i, {
                    tables:state.current_account.tables,
                    day: Math.floor( (i/24) ),
                // hour: i - ((i/24)+1) * 24
            }) 
            }

            let day_totals = calculateAccountTotals(acc_schedules)
            return { ...state, 
                schedules:all_schedules, 
                account_schedules:acc_schedules,
                day_totals:day_totals} 

        }


        case CMD.DELETE_SCHEDULE: {
            return { ...state} 
        }


        default: //@@redux.INIT
            let start = moment.utc(state.month).startOf('month')
            let end = moment.utc(state.month).endOf('month')
            let days = end.diff(start, 'days')
            
            return {...state, start_month:start, end_month:end, days: days, /*число дней между датами*/}
            //return state;
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

const ConnectedToStoreScheduler = connect(
    //mapStateToProps, 
    (state)=>{
        log('Перед привязкой стейта',state)
        // let start = moment.utc(state.month).startOf('month')
        // let end = moment.utc(state.month).endOf('month')
        // let days = end.diff(start, 'days')
        // return {...state, start_month:start, end_month:end, days: days, /*число дней между датами*/}
        return {...state}
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
                                  
                                  
       
          
                                 
 