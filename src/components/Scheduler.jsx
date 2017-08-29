import React from 'react'
import PropTypes from 'prop-types'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import LimitsBaseComponent, {log} from '../components/LimitsBaseComponent.jsx'
import SchedulerLimits from '../components/SchedulerLimits.jsx'
import BarsEditor from '../components/BarsEditor.jsx'
import SchedulerAccounts from '../components/SchedulerAccounts.jsx'
import SchedulerAccountsDetails from '../components/SchedulerAccountsDetails.jsx'

//почитать про декораторы и как использовать
// @connect(
//   state => ({
//     user: state.user 
//   })
// )
export default class Scheduler extends LimitsBaseComponent {

    //может на jquery???
    //https://codepen.io/cnupm99/pen/pvNyYX заимплементить разделитель
    // $("#left_pane").resizable({
    // handles: 'e',  // 'East' side of div draggable
    // resize: function() {
    // $("#right_pane").outerWidth( $("#container").innerWidth() - $("#left_pane").outerWidth() );
    // }
    // });    

    constructor(props){
        super('Scheduler',props)
        //----------------------------------------------------
        this.initSeparator = this.initSeparator.bind(this)
        this.spMouseDown = this.spMouseDown.bind(this)
        this.spMouseUp = this.spMouseUp.bind(this)
        this.spMouseMove = this.spMouseMove.bind(this)
        //----------------------------------------------------
    }

    componentDidMount(){
        this.initSeparator()
    }

    //---------------------------------------
    //СПЛИТТЕР - 
    //TODO: вынести в отдельный контрол - детей разделять сплиттером
    initSeparator(){
        this.window_width = window.innerWidth;
        this.splitter = document.getElementById("splitter");
        this.cont1 = document.getElementById("middle");
        this.cont2 = document.getElementById("right");

        // let dx = this.cont1.clientWidth;
        let dx = this.cont1.offsetWidth;
        splitter.style.marginLeft = dx+"px";
        // dx += splitter.clientWidth;
        dx += splitter.offsetWidth;
        this.cont2.style.marginLeft = dx+"px";
        dx = this.window_width - dx;
        this.cont2.style.width = dx+"px";

        this.splitter.addEventListener("mousedown",this.spMouseDown);

        window.addEventListener("resize",this.initSeparator);
    }

    spMouseDown(e){
        this.splitter.removeEventListener("mousedown", this.spMouseDown);
        window.addEventListener("mousemove",this.spMouseMove);
        window.addEventListener("mouseup",this.spMouseUp);
        this.last_x = e.clientX;
        // log('MouseDown', e.clientX, this.last_x)        
    }

    spMouseUp(e){
        // log('MouseUp', e.clientX, this.last_x)
        window.removeEventListener("mousemove",this.spMouseMove);
        window.removeEventListener("mouseup",this.spMouseUp);
        this.splitter.addEventListener("mousedown",this.spMouseDown);
        this.resetPosition(this.last_x);
    }

    spMouseMove(e){
        // log('MouseMove', e.clientX, this.last_x)
        this.resetPosition(e.clientX);
    }

    //При перетаскивании задаем смещения относительно левого края
    //есть баг с обсчетом скроллбара - появляется при перетескивании
    resetPosition(nowX){
        let dx = nowX - this.last_x;
        
        // log('dx', dx, 'cont1.width', this.cont1.clientWidth)

        //https://stackoverflow.com/questions/21064101/understanding-offsetwidth-clientwidth-scrollwidth-and-height-respectively
        //let border = this.cont1.offsetWidth - this.cont1.clientWidth 
        //dx += this.cont1.clientWidth + border; //от ширины отнимаем смещение
        dx += this.cont1.offsetWidth; //от ширины отнимаем смещение
        this.cont1.style.width = dx+"px";

        this.splitter.style.marginLeft=dx+"px";
        // dx += this.splitter.clientWidth;
        dx += this.splitter.offsetWidth;

        this.cont2.style.marginLeft=dx+"px";
        dx = this.window_width - dx;
        this.cont2.style.width=dx+"px";
        
        this.last_x = nowX;
    }
    //---------------------------------------


    //PN GT BBScale AccId 
    render() {
        let currentView = this.props.current_mode === 'edit'?<BarsEditor {...this.props}/>:<SchedulerLimits {...this.props}/>

        return (
             <div>
                <div id='middle'>
                    {/* для таблицы необходим заголовок??? */}
                    <div className="schedulerPanel">
                    <ReactCSSTransitionGroup
                            transitionName="anim" 
                            transitionAppear={true} 
                            transitionAppearTimeout={1000} 
                            transitionEnter={true} 
                            transitionEnterTimeout={1000} 
                            transitionLeave={true}
                            transitionLeaveTimeout={1000} >
                        {currentView}
                        </ReactCSSTransitionGroup>                    
                    </div>
                    
                </div>
                <div id='splitter'/>
                <div id='right'>
                    <SchedulerAccounts {...this.props} />
                    <SchedulerAccountsDetails {...this.props} />
                </div>
             </div>
        );

    } 

    // accountSelectCallback = {this.handleChildCallback}/>
                        // <SchedulerGridEx 
                //         titles={this.state.titles} 
                //         rows = {this.state.rows} 
                //         current_account={this.state.current_account}
                //         callbackFn = {this.handleChildCallback}/>
                    // <form onSubmit={this.handleSubmit}>
                    //     <input onChange={this.handleChange} value={this.state.current_account} />
                    //     <button>{'Add #' + (this.state.rows.length + 1)}</button>
                    // </form>

    //Состояние на свойства компонент
    // mapStateToProps(state) {
    //     log('mapping state', state)
    //     return {
    //         user: state.user
    //     }
    // }

}

Scheduler.propTypes = {
  limits: PropTypes.array.isRequired,
  current_mode: PropTypes.string.isRequired,
//setMode: PropTypes.func.isRequired
   schedulerActions: PropTypes.object.isRequired
}
