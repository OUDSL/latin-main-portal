$(function() {
    //Customize by setting base_url to cybercom/api docker application
    base_url = "https://cc.lib.ou.edu/api-dsl";
    //No other alterations is need to get the standard applicaiton running!
    login_url = base_url + "/api-auth/login/?next=";
    logout_url = base_url + "/api-auth/logout/?next=";
    user_task_url = base_url + "/queue/usertasks/.json?page_size=10";
    user_url = base_url + "/user/?format=json";
    prevlink=null;nextlink=null;page=0;page_size=50;searchterm="";total_pages=0;
    //filter options and Date Range variables
    fromDate="";toDate="";filterD="";templateFilter="";result=[];f = [];d=[];
    output=[];guest=true;
    //check auth
    set_auth(base_url,login_url);
    $("#aprofile").click(function(){activaTab('profile')})
    $("#alogout").click(function(){window.location = logout_url.concat(document.URL);})
    //load_task_history(user_task_url);
    $('#prevlink').click(function(){load_task_history(prevlink);});
    $('#nextlink').click(function(){load_task_history(nextlink);});
    Handlebars.registerHelper('json_metatags', function(context) {
                if (typeof context !== 'undefined') {
                    return JSON.stringify(context).replace(/\\/g,'').replace(/\[/g,'').replace(/\]/g,'').replace(/,/g,', ');
                }else{
                    return ""
                }
    });
    $('#user').click(function(){if($('#user').html()=="Login"){window.location = login_url.concat(document.URL);}});
    //$('#user').hide()
    $('#myTab').hide()
    load_es_data();

    $("#ahelp").on("click",function()
    {
        $("#helpModel").modal('show');

    });

    $("#aabout").on("click",function()
    {
        $("#aboutModel").modal('show');

    });
    $("#hf").change(function()
        {
        if(this.checked)
        {
            templateFilter = "{'match': {'CHAMBER':{'query':'AUTHOR'}}}";
            f.push(templateFilter);
            //console.log(f);
            filterD=",'filter':{'bool' : {'should' :["+removeDups(f)+"],'must':{},'must_not':[{}]}}"
        }
        else
        {
            f = removeElement(f,"{'match': {'CHAMBER':{'query':'AUTHOR'}}}");
        }});
    $("#sf").click(function()
        {
            if(this.checked)
            {templateFilter = "{'match': {'CHAMBER':{'query':'FAMILIAR NAME'}}}";
            f.push(templateFilter);
            //console.log(f);
            filterD=",'filter':{'bool' : {'should' :["+removeDups(f)+"],'must':{},'must_not':[{}]}}"
        }
        else
        {
            f = removeElement(f,"{'match': {'CHAMBER':{'query':'FAMILIAR NAME'}}}");
        }
        });
    $("#jf").click(function()
        {
            if(this.checked)
            {
                templateFilter = "{'match': {'CHAMBER':{'query':'ERA'}}}";
                f.push(templateFilter);
                //console.log(f)
                filterD=",'filter':{'bool' : {'should' :["+removeDups(f)+"],'must':{},'must_not':[{}]}}"
            }
            else
            {
                f = removeElement(f,"{'match': {'CHAMBER':{'query':'ERA'}}}");
            }
        });
    $("#advS").click(function()
        {
            $(".checkbox").toggle();
            $(".dateRange").toggle();
            //$("#fromDate").prop( "disabled", true );
            //$("#toDate").prop( "disabled", true );
        });

    $("#dRange").change(function()
        {
            if(this.checked)
            {
                $("#fromDate").prop( "disabled", false );
                $("#toDate").prop( "disabled", false );
            }
            else
            {
                filterD="";
                $("#fromDate").prop( "disabled", true );
                $("#toDate").prop( "disabled", true );
            }
        });
    $("#sW").change(function()
        {
            if(this.checked)
            {
                $("#sWords").prop("disabled",false);
            }
            else
            {
                $("#sWords").prop("disabled",true);
            }
        });

    $("#cS").on("click",function()
        {
            location.reload();
        });

    $('#sWords').keypress(function (e) {
     var key = e.which;
     if(key == 13)  // the enter key code
      {
        $('#submitSearch').click();
        return false;
      }
});

    $(sall).on("click",function()
    {
        $(".csv").prop('checked', $(this).prop('checked'));
        var tags = $("tr td.tag");
        var tag = [];
        var data= [];
        var inputs = [];

        $(tags).each(function()
        {
            tag.push($(this).text().trim());
        });
        g_tag = tag;
        // console.log(tag);

        $("tr td.data").each(function()
        {
            data.push($(this).text().trim());
        });
        g_data = data;
        var temp = $(".csv");

        $(temp).each(function()
        {
            inputs.push($(this)[0]);
        });
        g_inputs = inputs;
        var tags = $("tr td.tag");
        var alldata = [];
        for(i=0; i<tags.length; i++){
            alldata.push({tag: g_tag[i], data: g_data[i], myinput: g_inputs[i]})
        }
        for(i=0; i<alldata.length; i++){
            if(alldata[i].myinput.checked) {
                output.push(alldata[i]);
            }
        }
        for(i=0;i<output.length;i++)
        {
            result.push({tag:output[i].tag,data:output[i].data});
        }
    });

    var g_tag=[];
    var g_data=[];
    var g_inputs=[];
    $("#sall").click(function () {
        if (this.checked){
            var tags = $("tr td.tag");
            var tag = [];
            var data= [];
            var inputs = [];

            $(tags).each(function()
            {
                tag.push($(this).text().trim());
            });
            g_tag = tag;
            // console.log(tag);

            $("tr td.data").each(function()
            {
                data.push($(this).text().trim());
            });
            g_data = data;
            var temp = $(".csv");

            $(temp).each(function()
            {
                inputs.push($(this)[0]);
            });
            g_inputs = inputs;
            // console.log(g_inputs);
        }else{
            result=[]
        }
    });

    $("#final").on("click",function()
    {
        // console.log(unique(result));
        if (result.length < 1){
            alert("No records selected. Please select records and retry.");
        }else{
            JSONToCSVConvertor(unique(result),"Output",true);
        }

    });

});//End of Document Ready

function load_es_data(){
    $('#home').empty()
    template = Handlebars.templates['tmpl-es']
    tr_tmpl=Handlebars.templates['tmpl-tres']
    $('#home').append(template({}))
    $('#gstat').click(function(){submit_task();});
    //initial disable of datepicker
    $("#fromDate").prop( "disabled", true );
    $("#toDate").prop( "disabled", true );
    $('#submitSearch').click(function(){
        page=0;total_pages=0;
        $('#paginate-div').empty();
        $('#paginate-div-bt').empty();
        template = Handlebars.templates['tmpl-page']
        $('#paginate-div').append(template({}))
        $('#paginate-div-bt').append(template({}))
        searchterm=$('#search').val()
        search($('#search').val());
        $('#gstat').unbind( "click" );
        $('#gstat').click(function(){submit_task();});
    });
    $(".searchOnEnter").keyup(function(event){
        if(event.keyCode == 13){
            $("#submitSearch").click();
        }
    });
}
function submit_task(){
    //authentication requiremed to submit task
    if(!$('#myTab').is(':visible')){
        set_auth(base_url,login_url);
    }


    //Check query and set query string and query_type
    checked_value=$('input[name=optradio]:checked').val()
    if (checked_value=="0"){
            query_type = "QueryString"
    }else if (checked_value=="1"){
            query_type = "Match"
    }else{
           query_type = "MatchPhrase"
    }
    //get query from standard query generation
    query= getParameterByName('query',get_search_url(searchterm))
    //Check user input of context lines above and below
     if ($('#contextlines').val()==""){
        $('#contextlines').val(5)
        lines_above_below = 5;
     } else{
        lines_above_below = parseInt($('#contextlines').val());
     }
    //url to submit task
    url = base_url + "/queue/run/dslq.tasks.tasks.search_main_stats/"
    //Set task Data to submit
    task_name = "dslq.tasks.tasks.search_main_stats"
    params = ["congressional","hearings",query]
    task_data = {"function": task_name,"queue": "celery","args":params,"kwargs":{"context_pages":lines_above_below},"tags":["query="+ searchterm,"query-type=" + query_type ]};
    //console.log("fired")
    //Submit task and set result url and load current history with latest task.
    $.postJSON(url,task_data,function(data){
            $('#stat_result').html(data.result_url);
            $('#stat_result').urlize();
            //console.log(data);
            load_task_history(user_task_url);
        });
}
//extend jquery to customize AJAX task submission
$.postJSON = function(url, data, callback,fail) {
    return jQuery.ajax({
        'type': 'POST',
        'url': url,
        'contentType': 'application/json',
        'data': JSON.stringify(data),
        'dataType': 'json',
        'success': callback,
        'error':fail,
        'beforeSend':function(xhr, settings){
            xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
        }
    });
};
function get_search_url(term){
    checked_value=$('input[name=optradio]:checked').val()
    if($(".dateRange").is(":visible"))
    {
    if($("#dRange").prop('checked'))
    {
        fromDate = $("#fromDate").val();
        toDate = $("#toDate").val();
        if(isValidDate(fromDate) && isValidDate(toDate))
        {
        rangeDate="'range':{'DATE':{'lte':'"+toDate+"','gte':'"+fromDate+"'}}";
        filterD=",'filter':{'bool' : {'should' :["+removeDups(f)+"],'must':{"+rangeDate+"},'must_not':["+d+"]}}"
        }
        else
        {
            alert("Please make sure dateformat is in -- [yyyy-mm-dd] OR [yyyy]");
            alert("Search will be resumed with out Date range search!!")
            $("#fromDate").val("");
            $("#toDate").val("");
            $("dRange").trigger('click');
        }
    }
    else
    {
        rangeDate="";
        filterD=",'filter':{'bool' : {'should' :["+removeDups(f)+"],'must':{"+rangeDate+"},'must_not':["+d+"]}}"
    }
    if($("#sW").prop('checked'))
    {
        if($("#sWords").val()=="")
        {
            alert("Please check the input and Try again!!");
            $("#sW").trigger("click");
        }
        else
        {
            if((checked_value=="1") || (checked_value=="2"))
             {
            if($("#sW").prop('checked'))
                {
                    d = $("#sWords").val().split(',');
                    for(var i=0;i<d.length;i++)
                    {
                        d[i]="{'match': {'DATA':{'query':'"+$.trim(d[i])+"'}}}"
                    }
                        filterD=",'filter':{'bool' : {'should' :["+removeDups(f)+"],'must':{"+rangeDate+"},'must_not':["+d+"]}}"
                }
        else
        {
            d=[];
            filterD=",'filter':{'bool' : {'should' :["+removeDups(f)+"],'must':{"+rangeDate+"},'must_not':["+d+"]}}"
        }
    }
    else
    {
                if($("#sW").prop('checked'))
        {
                    d = $("#sWords").val().split(',');
                    for(var i=0;i<d.length;i++)
                    {
                        term=term+" -"+$.trim(d[i]);
                    }
                    filterD=",'filter':{'bool' : {'should' :["+removeDups(f)+"],'must':{"+rangeDate+"},'must_not':[]}}"
        }
        else
        {
            d=[];
            filterD=",'filter':{'bool' : {'should' :["+removeDups(f)+"],'must':{"+rangeDate+"},'must_not':["+d+"]}}"
        }
    }
        }
    }
    else
        {
            filterD=",'filter':{'bool' : {'should' :["+removeDups(f)+"],'must':{"+rangeDate+"},'must_not':[{}]}}"
        }
        }
    else
    {
        filterD=""
    }



    //set url
    if (checked_value=="0"){
        url = base_url + "/es/data/latin/library/.json?query={'query':{'query_string':{'query':'" + term
        url = url + "'}}"+filterD+",'aggs':{'hearings_count':{'cardinality':{'field':'filename'}}}}"
    }else if (checked_value=="1"){
        url = base_url + "/es/data/latin/library/.json?query={'query':{'match':{'sentence':{'query':'" + term
        url = url + "','operator':'and'}}}"+filterD+",'aggs':{'hearings_count':{'cardinality':{'field':'filename'}}}}"
    }else{
        url = base_url + "/es/data/latin/library/.json?query={'query':{'match_phrase':{'sentence':{'query':'" + term
        url = url + "','type':'phrase'}}}"+filterD+",'aggs':{'hearings_count':{'cardinality':{'field':'filename'}}}}"
    }
    return url
}
function search(term){
    url = get_search_url(term)
     //need to add a user element to assign the lines above and below
     if ($('#contextlines').val()==""){
        $('#contextlines').val(5)
        lines_above_below = 5;
     } else{
        lines_above_below = parseInt($('#contextlines').val());
     }
     //lines_above_below = 5;
     if (page == 0){
        $("#result_tbody").empty();
        url_param = "&page=1&page_size=" + page_size
     }else{
        url_param = "&page="+ page + "&page_size=" + page_size
    }
     $.getJSON( url + url_param ,function(data){
       if(data.hits.total==0){
            $('.page-content').text( "NO SEARCH RESULTS FOUND");
       }else{
        //Set up pagination
        if (page==0){
            total_pages=Math.ceil(data.hits.total/page_size)
            $('.sync-pagination').twbsPagination({
                totalPages: total_pages,
                visiblePages: 15,
                onPageClick: function (event, page_num) {
                    page=page_num;
                    if (page_num !=1){
                        if ($(".page"+page).length==0){
                            search(searchterm);
                        }
                    }
                    $('.tr-all').hide();
                    $(".page"+page).show();
                    tot_ret = data.hits.total
                    hear_total = data.aggregations.hearings_count.value
                    if ( hear_total > tot_ret ){hear_total = tot_ret;}
                    $('.page-content').text( "Search Results: " + tot_ret.toString() + "  Total Hits:  " +  hear_total.toString() + ' --- Page ' + page_num + ' of ' + total_pages);
                }
            });
            page=1;
        }
        tr_tmpl=Handlebars.templates['tmpl-tres']
        $.each(data.hits.hits,function(itm,val){
	   content_lines(val,lines_above_below,tr_tmpl,"result_tbody",page)
        });
        if(!guest){
            $('#stats').show();
        }
      }
     });
}
/*function get_section(ids,val){
    url = base_url + "/es/data/latin/library/.json?esaction=mget&ids="+ ids
    $.getJSON( url ,function(data){
        pre_data ="";
        post_data="";
        $.each(data.docs,function(i,v){

        if(v.found && v._source.TAG == val._source.TAG){
                if (v._id < val._id){
                    pre_data=pre_data + v._source.DATA + "  ";
                }
                if (v._id > val._id){
                    post_data=post_data + v._source.DATA + "  ";
                }
                //temp_data= temp_data + v._source.DATA + "  ";
            }

        });
        //console.log(temp_data);
    });
}*/
function content_lines(val,lines,templ,html){
     lowEnd= parseInt(val._id) - lines;
     highEnd = parseInt(val._id) + lines;
     list = [];
     for (var i=lowEnd;i<=highEnd;i++){list.push(i);}
     ids= list.join(",")
     url = base_url + "/es/data/latin/library/.json?esaction=mget&ids="+ ids
     $.getJSON( url ,function(data){
        temp_data = "";
        pre_data ="";
        post_data="";
	$.each(data.docs,function(i,v){
	    if(v.found && v._source.filename == val._source.filename){
                if (v._id < val._id){
                    pre_data=pre_data + v._source.sentence + "  ";
                }
                if (v._id > val._id){
                    post_data=post_data + v._source.sentence + "  ";
                }
	    	temp_data= temp_data + v._source.sentence + "  ";
	    }

	});
        //console.log(pre_data);
        //console.log(val._source.DATA);
        //console.log(post_data);
        val=val._source
        val.PRE_DATA=  pre_data
        val.POST_DATA = post_data
        $("#" + html).append(templ(val));
	//$("#" + html).append(templ({"PAGE":"page"+page,"LINK":val._source.url,"TAG":val._source.filename,"PRE_DATA":pre_data,"DATA":val._source.sentence +" ","POST_DATA":post_data,"TITLE":val._source.title,"DATE":val._source.familiar_name}))
        $(".es_value_data").highlight($('#search').val().replace(/\"/g," ").trim().split(" "));

        if($(sall).prop('checked')){$(sall).trigger('click');$(sall).trigger('click');}
        //This has to be here because you can not put event when item has not been placed on the page
        $('.csv').on("click",function(){
            if(this.checked){
                // console.log(this)
                var tags = $("tr td.tag");
                var tag = [];
                var data= [];
                var inputs = [];

                $(tags).each(function()
                {
                    tag.push($(this).text().trim());
                });
                g_tag = tag;
                // console.log(tag);

                $("tr td.data").each(function()
                {
                    data.push($(this).text().trim());
                });
                g_data = data;
                var temp = $(".csv");

                $(temp).each(function()
                {
                    inputs.push($(this)[0]);
                });
                g_inputs = inputs;
                var tags = $("tr td.tag");
                var alldata = [];
                for(i=0; i<tags.length; i++){
                    alldata.push({tag: g_tag[i], data: g_data[i], myinput: g_inputs[i]})
                }
                for(i=0; i<alldata.length; i++){
                    if(alldata[i].myinput.checked) {
                        output.push(alldata[i]);
                    }
                }
                for(i=0;i<output.length;i++)
                {
                    result.push({tag:output[i].tag,data:output[i].data});
                }
                    }
                });
     });
}
function submit_user(){
    //console.log(user_url)
    $.post( user_url,$('#user_form').serializeObject(),function(data){
        data.csrftoken = getCookie('csrftoken')
        $('#profile').empty();
        //source = $('#user-template').html()
        //user_template = Handlebars.compile(source);
        user_template = Handlebars.templates['tmpl-user']
        $('#profile').append(user_template(data))
        $('#user_form').hide()
        $('#view_form').show()
        $('#reset_password').click(function(){$('#pass_form').toggle(!$('#pass_form').is(':visible'));});
    })
    .fail(function(){ alert("Error Occured on User Update.")});
    return false;
}
function edit_user(){
    $('#user_form').show()
    $('#view_form').hide()
    return false;
}
function set_password(){
    pass = $('#pass_form').serializeObject()
    if (pass.password !== pass.password2){
        alert("Passwords were not identical")
        return false;

    }
    $.post( user_url,$('#pass_form').serializeObject(),function(data){
        $('#reset_password').click(function(){$('#pass_form').toggle(!$('#pass_form').is(':visible'));});
        alert(JSON.stringify(data))
    })
    .fail(function(){ alert("Error Occured on Password Reset.")});
    return false;
}
function set_auth(base_url,login_url){
    $.getJSON( base_url + "/user/.json",function(data){
        data.gravator_url=data.gravator_url
        $('#user').html(data['username'].concat( ' <span class="caret"></span> '));
        $("#user").append($('<img style="border-radius:80px;">').attr("src",data['gravator_url'] +"?s=40&d=mm") );
        data.csrftoken = getCookie('csrftoken')
        //source = $('#user-template').html()
        //user_template = Handlebars.compile(source);
        user_template = Handlebars.templates['tmpl-user']
        $('#profile').append(user_template(data))
        $('#user_form').hide()
        $('#view_form').show()
        $('#reset_password').click(function(){$('#pass_form').toggle(!$('#pass_form').is(':visible'));});
        //load task history
        load_task_history(user_task_url);
        //show user tabs
        $("#myTab").show();
        guest=false;
        $('.login_menu').show()
    })
    .fail(function() {
        $('.login_menu').hide()
        //console.log("login required")
    });
}
function activaTab(tab){
    $('a[href="#' + tab + '"]').tab('show')
};
function load_task_history(url){
    $.getJSON(url, function(data){
    prevlink = data.previous;
    nextlink = data.next;
    if (prevlink == null){$('#li_prevlink').addClass("disabled");} else {$('#li_prevlink').removeClass("disabled");prevlink=data.previous;};
    if (nextlink == null){$('#li_nextlink').addClass("disabled");} else {$('#li_nextlink').removeClass("disabled");nextlink=data.next;};
    setTaskDisplay(data);
    //source = $('#tr-template').html();
    //tr_template = Handlebars.compile(source);
    tr_template = Handlebars.templates['tmpl-tr']
    $('#result_tbody_history').html("")//clear table
    $.each(data.results, function(i, item) {
        temp=item.task_name.split('.')
        item['task_name']= temp[temp.length-1]
        item.timestamp = item.timestamp.substring(0,19).replace('T',' ')
        item.result=item.result
        //console.log(item)
        $('#result_tbody_history').append(tr_template(item))
    });
    });
}
function setTaskDisplay(data){
    if (data.count <= data.meta.page_size){
        $('#task_count').text('Task 1 - ' + data.count +  ' Total ' + data.count );
    }else{
        rec_start = data.meta.page_size*data.meta.page - data.meta.page_size +1;
        rec_end = "";
        if(data.meta.page_size*data.meta.page >= data.count){
            rec_end = data.count;
        }else{
            rec_end = data.meta.page_size*data.meta.page;
        }
        $('#task_count').text('Task ' + rec_start + ' - ' + rec_end  +  ' Total ' + data.count )
    }

}
function showResult(url){
    //myModalLabel -->title
    $.getJSON(url + ".json" , function(data){
        json_data = JSON.stringify(data,null, 4);
        $("#myModalbody").html(json_data);
        $("#myModalbody").urlize();
        $("#myModal").modal('show');
    });
}

function showMetaResult(tag){
    //myModalLabel -->title
    url= base_url + "/data_store/data/latin/library/.json?query={'filter':{'TAG':'"+tag+"'}}"
    $.getJSON(url, function(data){
        json_data = JSON.stringify(data.results[0],null, 4);
        $("#myMetabody").empty();
        $("#myMetabody").html(json_data);
        $("#myMetabody").urlize();
        $("#metaModel").modal('show');
    });
}

jQuery.fn.urlize = function() {
    if (this.length > 0) {
        this.each(function(i, obj){
            // making links active
            var x = $(obj).html();
            //var list = x.match( /\b(http:\/\/|www\.|http:\/\/www\.)[^ <]{2,200}\b/g );
	    var list = x.match( /\b(http:\/\/|https:\/\/www\.|http:\/\/www\.)[^ <]{2,200}\b/g );
            if (list) {
                for ( i = 0; i < list.length; i++ ) {
                    var prot = list[i].indexOf('http://') === 0 || list[i].indexOf('https://') === 0 ? '' : 'http://';
                    x = x.replace( list[i], "<a target='_blank' href='" + prot + list[i] + "'>"+ list[i] + "</a>" );
                }

            }
            $(obj).html(x);
        });
    }
};
$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
jQuery.extend({
    parseQuerystring: function() {
        var nvpair = {};
        var qs = window.location.search.replace('?', '');
        var pairs = qs.split('&');
        $.each(pairs, function(i, v) {
            var pair = v.split('=');
            nvpair[pair[0]] = pair[1];
        });
        return nvpair;
    }
});
function filterhide(input)
    {
        $("tr td.tag").each(function() {
            if($(this).text().trim().substring(8,12) == input)
            {
                $(this).parent().hide();
            }
        });
    }

    function filtershow(input)
    {
        $("tr td.tag").each(function() {
            if($(this).text().trim().substring(8,12) == input)
            {
                $(this).parent().show();
            }
        });
    }

    function JSONToCSVConvertor(JSONData, ReportTitle, ShowLabel) {
        //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
        var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;

        var CSV = '';
        //Set Report title in first row or line

        //CSV += ReportTitle + '\r\n\n';

        //This condition will generate the Label/Header
        if (ShowLabel) {
            var row = "";

            //This loop will extract the label from 1st index of on array
            for (var index in arrData[0]) {

                //Now convert each value to string and comma-seprated
                row += index + ',';
            }

            row = row.slice(0, -1);

            //append Label row with line break
            CSV += row + '\r\n';
        }

        //1st loop is to extract each row
        for (var i = 0; i < arrData.length; i++) {
            var row = "";

            //2nd loop will extract each column and convert it in string comma-seprated
            for (var index in arrData[i]) {
                row += '"' + arrData[i][index] + '",';
            }

            row.slice(0, row.length - 1);

            //add a line break after each row
            CSV += row + '\r\n';
        }

        if (CSV == '') {
            alert("Invalid data");
            return;
        }

        //Generate a file name
        var fileName = "MyReport_";
        //this will remove the blank-spaces from the title and replace it with an underscore
        fileName += ReportTitle.replace(/ /g,"_");

        //Initialize file format you want csv or xls
        var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);

        // Now the little tricky part.
        // you can use either>> window.open(uri);
        // but this will not work in some browsers
        // or you will not get the correct file extension

        //this trick will generate a temp <a /> tag
        var link = document.createElement("a");
        link.href = uri;

        //set the visibility hidden so it will not effect on your web-layout
        link.style = "visibility:hidden";
        link.download = fileName + ".csv";

        //this part will append the anchor tag and remove it after automatic click
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function unique(origArr){
    var newArr = [],
        origLen = origArr.length,
        found, x, y;

    for (x = 0; x < origLen; x++) {
        found = undefined;
        for (y = 0; y < newArr.length; y++) {
            if (origArr[x].data === newArr[y].data) {
                found = true;
                break;
            }
        }
        if (!found) {
            newArr.push(origArr[x]);
        }
    }
    return newArr;
}

    function removeDups(list)
    {
        var result = [];
      $.each(list, function(i, e) {
        if ($.inArray(e, result) == -1) result.push(e);
      });
      return result;
    }

function isValidDate(dateString) {
    if(dateString.length == 10)
    {
        var regEx = /^\d{4}-\d{2}-\d{2}$/;
    }
    else if(dateString.length == 4)
    {
        var regEx = /^\d{4}$/;
    }
    else
    {
        return false;
    }
  return dateString.match(regEx) != null;
}

    function removeElement(origArr,value)
    {
        origArr = removeDups(origArr);
        var index = origArr.indexOf(value);
        if(index > -1)
        {
            origArr.splice(index,1)
        }
        return origArr;
    }

function getCurrentDate()
{
    return new Date().toISOString().slice(0,10);
}
function getParameterByName(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
