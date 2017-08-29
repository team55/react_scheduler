import React from 'react'
import PropTypes from 'prop-types'
import '../constants/props'
// import * as CMD from '../constants/commands'
import LimitsBaseComponent, {log} from '../components/LimitsBaseComponent.jsx'
import * as d3 from 'd3'
import {cellSize} from "../constants/props";

export default class BarsEditor extends LimitsBaseComponent {
   
    constructor(props){
        super('BARS EDITOR',props)
        this.createBarChart = this.createBarChart.bind(this)

        //Подготавливаем все данные расписания - в рендере поготовка
        this.prepared_schedules = []
        props.schedules.forEach(s=>{
            s.data.forEach(d=>{
                let offets =  [...Array(d[2]).keys()]
                offets.map((of,i)=>{
                    //TODO: Бля - тут нужно на следующую дату переходить !!!
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

    }

    
    componentDidMount() {
      this.createBarChart()
    }
   
    componentDidUpdate() {
        this.createBarChart()
    }


    //------------------------------------------------------------------------------------------------------------------
    //После монтирования и обновления отрисовываем в SVG график
    createBarChart() {

        log('CREATING BAR CHART')

        this.datas = []
        for (let dd=1; dd<=this.props.days; dd++){
            for (let hh=0; hh<=23; hh++){

                this.datas.push({
                    // day: dd,
                    // hour: hh,
                    // prediction: 13,
                    // selected: dd==hh,
                    // hovered: false,
                    // //Маркеры отрисовываются в зависимости от аккаунта
                    // excluded: dd==10 && hh>10
                    day: dd,
                    hour: hh,
                    prediction: dd+hh, //todo: взять по таргету лимита аккаунта минус уже имеющиеся по данному лимиту

                    //Аккаунтов в дате могут быть несколько - несколько цветов в ячейке
                    selected: this.prepared_schedules[`${this.props.current_account}_${dd}-${hh}`]==1, //TODO: массив аккаунтов
                    hovered: false,
                    //Маркеры отрисовываются в зависимости от аккаунта
                    excluded: false//исключенные по ключу

                    //Привязываем данные выбранного аккаунта - тот что сейчас используется в расписании
                    //Ищем по ключу аккаунт_DD_HH
                })

            }
        }


        const node = this.node
        const context = this

        //определяем максимальное числовое значение 
        //const dataMax = d3.max(this.datas)
        let data = this.datas;
        
        let pressed = false
        let select_day = 0
        let select_hour = 0;
        let select_index = 0;


        //определяем масштаб домена в диапазоне
        // const yScale = d3.scaleLinear().domain([0, dataMax]).range([0, this.props.size[1]])
        const xScale = d3.scaleLinear().domain([0, 23]).range([cellSize, cellSize*24])
        const yScale = d3.scaleLinear().domain([1, this.props.days]).range([cellSize, cellSize*this.props.days])
        

        function handleClick(element, data, index){
            log('cell click', element, data, index, d3.event, context)

            //TODO: Клик начало выбора ячейки второй клик - окончание периода даже если на той же клетке    
            //TODO: Клик с зажатым ctrl отдельные ячейки
            //клик с нажатым контролом - если до этого начато выделение - окончание периода, иначе выделение ячейки

            //log(d3.event)
            //if (d3.event.defaultPrevented) return; // dragged - если делать call 

            if (d3.event.ctrlKey) {
                //меняем статус отдельного элемента
                if(d3.event.type=='contextmenu') d3.event.preventDefault(); //на mac os нажали с ctrl
                d3.select(element).classed('state--selected', data.pressed = !data.pressed)  // в обработчике меняем значение переменной и вычисляем класс
                return
            }
            if (d3.event.shiftKey) {
                //Пока ника не задействовано
            }
            
            let DDs,HHs,DDe,HHe = 0
            if(context.pressed){
                //Выделяем диапазон от начала выделения до кончания выделания
                //начало - если день тот де самый - минимум и максимум от дней 
                //иначе если меньше
                if(context.select_day < data.day){
                    DDs = context.select_day
                    DDe = data.day        
                    HHs = context.select_hour
                    HHe = data.hour
                }else if(context.select_day > data.day){
                    DDe = context.select_day
                    DDs = data.day        
                    HHe = context.select_hour
                    HHs = data.hour
                }else{
                    DDs = DDe = data.day        
                    HHs = Math.min(context.select_hour,data.hour)
                    HHe = Math.max(context.select_hour,data.hour)
                }

                let min_idx = Math.min(index, context.select_index)
                let max_idx = Math.max(index, context.select_index)

                log('SELECT:',DDs,HHs,DDe,HHe, min_idx, max_idx)

                //или просто по индексам??? - взять первый взять последний
                d3.selectAll('.graf').each(function (d,i){
                    if(i>=min_idx && i<=max_idx){
                        //TODO: пропустить задисабленные
                        d.selected = true
                        d3.select(this).classed('state--selected', true)  // в обработчике меняем значение переменной и вычисляем класс
                    }
                } )

                //TODO: оповестить редукс о изменении данных (пересчет итогов и отображение меток аккаунтов)
                

            }else{
                context.select_day = data.day
                context.select_hour = data.hour
                context.select_index = index
                log('START SELECT:',context.select_day,context.select_hour)
            }
            

            context.pressed = !context.pressed
        }
        

        //----------------------------------------------------------------------------
        // ОСИ КООРДИНАТ
        //----------------------------------------------------------------------------

        let xAxis = d3.axisTop(xScale).ticks(cellSize);
        let yAxis = d3.axisLeft(yScale).ticks(cellSize);


        d3.select(node)
        .append("g")
            .attr("class", "axis")
            .attr("transform", `translate(${cellSize/2},${cellSize})`)
            .call(xAxis);

        d3.select(node)
        .append("g")
            .attr("class", "axis")
            .attr("transform", `translate(${cellSize},${cellSize/2})`)
            .call(yAxis);
        
        //----------------------------------------------------------------------------
        // РИСУЕМ ГРИД (отображается информация относительно текущего редактируемого аккаунта)
        // Заблоченные - просто белые места
        // Доступные - серые
        // Прогноз - надписи
        // Несколько аккаунтов выделяем двойной ячейкой + в группе несколько цветов   
        //----------------------------------------------------------------------------
        let svg = d3.select(node)
	         .attr("width", this.size[0])
	         .attr("height", this.size[1]);
        

        //создаем элементы rect если нет в выборке с такими данными
        // svg.selectAll('rect').data(data).enter().append('rect');
        
        // svg.append('predictions')
        //     .selectAll('text')
        //     .data(data)
        //     .enter()
        //     .append('text')
        


        //V2 Группа контейнер
        let grid = svg.append("g")
            .attr("transform", `translate(${cellSize/2},${cellSize/2})`)
        .selectAll(".graf")
            .data(data)
        .enter().append("g")
            .attr("class", function(d) { 
                return "graf" + (d.selected ? " state--selected" : "") + (d.excluded ? " state--disabled" : ""); 
            })
            .attr("transform", function(d) { 
                //TODO: когда в часе несколько аккаунтов отрисовываем по другому
                //высчитываем число аккаунтов в часе - делим на 2, получем число строк и столбцов (до большего) 
                //по идексу аккаунта рисуем ячейку  

                return `translate( ${(d.hour+1) * cellSize}, ${(d.day) * cellSize})`; 
            });
            
        //Ячейка фона - смещение - потому что ячейки данных посчитали по центрам клеток    
        grid.append("rect")
            .attr("x", -cellSize / 2)
            .attr("y", -cellSize / 2)
            .attr("width", cellSize-1)
            .attr("height", cellSize-1);

        //добавляем текст
        grid.append("text")
            .attr("x", -cellSize / 4)
            .attr("y", -cellSize / 4)
            .attr("dy", ".35em")
            .text(function(d) { return d.prediction; });


        //Удаляем те которых нет в данных
        // svg.selectAll('rect').data(this.props.data).exit().remove();

        //----------------------------------------------------------------------------------
        //TODO: Создаем ячейки расписания - они в отличие от массива datas лежат в другом месте
        //data у нас аккаунт, цвет, день, час
        //ПО ВСЕМ АККАУНТАМ так как нужна информация по всем
        //----------------------------------------------------------------------------------


        // let cells = svg
        //     .selectAll('rect')
        //     .data(this.props.data)
        //     // .style('fill', '#fe9922')
        //     .attr("class", "graf")
        //     .attr('x', (d,i) => (d.hour+1) * cellSize)
        //     .attr('y', d => (d.day) * cellSize);

        //     cells
        //     // .attr('height', 0).transition().duration(1000) 
        //         .attr('height', cellSize); // Конечное значение
        //     cells
        //     // .attr('width', 0).transition().duration(1000)
        //         .attr('width', cellSize); // Конечное значение


        // d3.select(node).select('predictions')
        //      .selectAll('text')
        //      .data(this.props.data)
        //     .text(function(d) {
        //         return `${d.prediction}`;
        //     })
        // .attr("x", function(d, i) {
        //         return (d.hour+1) * cellSize;
        //     })
        // .attr("y", function(d) {
        //     return (d.day) * cellSize;
        //     });


        //-----------------------
        //тут надо еще группу селектить

        
        //Запоминаем позицию - день час
        //даблклик - заканчиваем от и до
        //новый клик - новая позиция
        //для режима выделения ставим флаг - подготовлено - выделяем фоном (сбрасываем подготовлено за диапазоном 
        // день час)

        var button = d3.selectAll('.graf')     // выбор кнопки
            .on("contextmenu", function (data, index) {
                //а тут this это элемент
                handleClick(this, data, index);
            })
            .on('click', function (data, index) {  
                handleClick(this,data, index)
            })
            //TODO: Двойной клик - удаление колбаски в которую попадает клетка
            .on('dblclick', function (data, index) {    
                //если в клетке два аккаунта - спросить что за ботва    
                pressed = false
                d3.select(this).classed('state--selected', data.pressed = true)  // в обработчике меняем значение переменной и вычисляем класс
            })
            //TODO: При перемещении мыши подсвечиваем путь от начальной ячейки до текущей (в массиве дата менять флаг highlight)
            .on('mouseenter', function (data, index) {        
                
                log('button',data, index)
                // button.classed('pressed', pressed = !pressed)  // в обработчике меняем значение переменной и вычисляем класс

                //ЗАБИТЬ ПОКА
                //тут бы пробежаться и поменять стейт тех что должны быть выделены
                //потом поменять их стиль в гриде 
                //от данных получаем 


                // if(context.pressed)
                //     d3.select(this).classed('state--selected', data.pressed = !data.pressed)  // в обработчике меняем значение переменной и вычисляем класс

            })




    }


    render() {
        // return <svg ref={node => this.node = node} width={500} height={500}></svg>

        return <div className="barsoverlay">
        <svg ref={node => this.node = node} width={500} height={500}></svg>
        <div className="barsitem"> tets</div>
        </div>
        //todo: тут по идее можем отрисовать колбаски графика
        //на них же завесить события
        //SVG графика останется как фон
        //сами колбаски рисовать как линии? тогда получится разной толщины можно рисовть? или квадраты все таки?
    }

}

BarsEditor.propTypes = {
    schedules: PropTypes.array.isRequired,
    //current_mode: PropTypes.string.isRequired,
    //setMode: PropTypes.func.isRequired
    //schedulerActions: PropTypes.object.isRequired
}
