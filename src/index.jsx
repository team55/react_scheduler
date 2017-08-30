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



function baseJsonRequest(url,method,body) {
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

    return fetch(url, {  
     method: method,  
//     headers: {  
//       "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"  
//     },  
     mode: 'no-cors',
     body: body  
   })
   //ОБРАБОТКА ОШИБОК??
//   .then(json)  
//   .then(function (data) {  
//     console.log('Request succeeded with JSON response', data);  
//   })  
//   .catch(function (error) {  
//     console.log('Request failed', error);  
//   });
}

async function postJsonRequest(url, body) {
    let response = await baseJsonRequest(url,'post',JSON.stringify(body))
    let json = await response.json()
    return json
}

async function putJsonRequest(url) {
    let response = await baseJsonRequest(url,'put',JSON.stringify(body))
    let json = await response.json()
    return json
}

async function getJsonRequest(url) {
    let response = await fetch(url)
    let json = await response.json()
    return json
}



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
            return { ...state, current_account: 0, accounts: state.accounts.concat(action.payload) }


        case CMD.ADD_SCHEDULE: {
            
            // val account_id: String = "",
        	// val start: Timestamp = Timestamp(System.currentTimeMillis()),
	        // val stop: Timestamp = Timestamp(System.currentTimeMillis())

            let data = postJsonRequest('http://localhost:9000/accounts_scheduler_api/v2/create_task',{"account_id":"1000"})
            data.then(json=>{
                log('CREATE SCHEDULE on SERVER:', json)

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

                //-------------------------------------------------------
                //TODO: вынести в отдельную функцию подготовку данных аккаунта
                //FIXME: публиковать в ощий стор - потом подтягивать данные
                //Часы конкретного аккаунта - c индекса до индекса
                let acc_schedules = new Map(state.account_schedules) //state.account_schedules.slice() //ТУТ МАП
                for (let i = action.payload.start_index; i <= action.payload.stop_index; i++) {
                    acc_schedules.set(i, state.current_account_tables) 
                }

                return { ...state, schedules:all_schedules, account_schedules:acc_schedules} 

            //-------------------------------------------------------

                
            }).catch(function (error) {  
                log('Request failed:', error);  
                return { ...state} 
            });


        }


        case CMD.DELETE_SCHEDULE: {
            return { ...state} 
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

const ConnectedToStoreScheduler = connect(
    //mapStateToProps, 
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
                                  
                                  
       
          
                                 
 