window.getColor = function(){

    const palette = [
        '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
        '#009688', '#4CAF50', '#8BC34A', '#FFC107', '#FF9800', '#FF5722', '#795548',
        '#9E9E9E', '#607D8B', '#2196F3', '#00BCD4', '#6D4C41', '#757575', '#546E7A',
        '#E53935', '#D81B60', '#8E24AA', '#5E35B1', '#3949AB', '#1E88E5', '#039BE5',
        '#00ACC1', '#00897B', '#43A047', '#7CB342', '#FFB300', '#FB8C00', '#F4511E',
        '#D32F2F', '#C2185B', '#7B1FA2', '#512DA8', '#303F9F', '#1976D2', '#0288D1',
        '#0097A7', '#00796B', '#388E3C', '#689F38', '#FFA000', '#F57C00', '#E64A19',
        '#B71C1C', '#880E4F', '#4A148C', '#311B92', '#1A237E', '#0D47A1', '#01579B',
        '#006064', '#004D40', '#1B5E20', '#33691E', '#827717', '#F57F17', '#FF6F00',
        '#FF1744', '#F50057', '#D500F9', '#651FFF', '#3D5AFE', '#2979FF', '#00B0FF',
        '#00E5FF', '#1DE9B6', '#00E676', '#76FF03', '#FF9100', '#FF3D00', '#5D4037',
        '#616161', '#455A64', '#E65100', '#BF360C', '#3E2723', '#212121', '#263238',
        '#D50000', '#C51162', '#AA00FF', '#6200EA', '#304FFE', '#2962FF', '#0091EA',
        '#00B8D4', '#00BFA5', '#00C853', '#64DD17', '#AEEA00', '#FFAB00', '#DD2C00'
    ];

    let current_color_index = 0, colors_for_keys = [];

    return function(key) {
        if (colors_for_keys[key] !== undefined) {
            return colors_for_keys[key];
        }

        colors_for_keys[key] = palette[current_color_index];
        current_color_index++;
        if (current_color_index > palette.length) current_color_index = 0;
        return colors_for_keys[key];
    };

}();