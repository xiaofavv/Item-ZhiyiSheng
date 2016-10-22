function yearmonth(){
     // 生成级联菜单  
    var i=1945;
    var date = new Date();
    year = date.getFullYear();//获取当前年份
    var dropList;
    for(i;i<2016;i++){
        if(i == year){
            dropList = dropList + "<option value='"+i+"' selected>"+i+"</option>";
        }else{
            dropList = dropList + "<option value='"+i+"'>"+i+"</option>";
        }
    }
    $('select[name=year]').html(dropList);//生成年份下拉菜单

    var monthly;
    for(month=1;month<13;month++){
        if(month<10){
            var month="0"+month;
            monthly = monthly + "<option value='"+month+"'>"+month+"</option>";
        }else {
            monthly = monthly + "<option value='" + month + "'>" + month + "</option>";
        }
    }
    $('select[name=month]').html(monthly);//生成月份下拉菜单

    var dayly;
    for(day=1;day<=31;day++){
        if(day<10){
            var day="0"+day;
            dayly = dayly + "<option value='"+day+"'>"+day+"</option>";
        }else{
            dayly = dayly + "<option value='"+day+"'>"+day+"</option>";
        }
    }
    $('select[name=day]').html(dayly);//生成天数下拉菜单
    /*
     * 处理每个月有多少天---联动
     */
    $('select[name=month]').change(function(){
        var currentDay;
        var Flag = $('select[name=year]').val();
        var currentMonth = $('select[name=month]').val();
        switch(currentMonth){
            case "01" :
            case "03" :
            case "05" :
            case "07" :
            case "08" :
            case "10" :
            case "12" :total = 31;break;
            case "04" :
            case "06" :
            case "09" :
            case "11" :total = 30;break;
            case "02" :
                if((Flag%4 == 0 && Flag%100 != 0) || Flag%400 == 0){
                    total = 29;
                }else{
                    total = 28;
                }
            default:break;
        }
        for(day=1;day <= total;day++){
            if(day<10){
               var day="0"+day;
                currentDay = currentDay + "<option value='"+day+"'>"+day+"</option>";
            }else{
                currentDay = currentDay + "<option value='"+day+"'>"+day+"</option>";
            }
        }
        $('select[name=day]').html(currentDay);//生成日期下拉菜单
        })
}
