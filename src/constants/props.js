export const cellSize = 26

export const initialState = {
    
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
        {accid:1000, name:'acc1', comp_name:'comp1', selected:false, limits:[], tables:6},
        {accid:1001, name:'acc2', comp_name:'comp1', selected:false, limits:[], tables:4}, //по этому нет данных
        {accid:1002, name:'acc3', comp_name:'comp2', selected:true,  limits:[], tables:6}]
    ,
    //вот тут вопрос - засунуть это в аккаунт или хранить отдельно
    //TODO: это должно быть в редусере
    //TODO: не разбить ли на отдельные записи?
    schedules: [
        {accid:1000, status:'editing', schedules:[ [20,0,22,6],[24,1,24,4],[25,22,26,4],[1,22,2,8] ],  templates:[], markers:[ [22,1,24,12] ], },
        {accid:1001, status:'editing', schedules:[ [1,0,1,6],[29,1,29,4],[25,22,26,4]],  templates:[],markers:[ [22,2,24,3] ],},
        {accid:1002, status:'editing', schedules:[ [1,0,1,6], [2,0,2,6] ], templates:[ [2,0,2,6] ], markers:[ [22,2,24,3] ],}
    ],
    //предсказания по таргет лимиту аккаунта? 
    predictions: [ [1,0,10],[1,1,9],[1,3,5] ], 
    //Аккаунт график которого редактируем
    current_account:{}, 
    // current_account_tables:0,
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
