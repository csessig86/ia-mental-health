define(["dataTables.bootstrap-requirejs"],function(e){return{loadDataTables:function(){function e(e){e+="",x=e.split("."),x1=x[0],x2=x.length>1?"."+x[1]:"";var t=/(\d+)(\d{3})/;while(t.test(x1))x1=x1.replace(t,"$1,$2");return x1+x2}jQuery.extend(jQuery.fn.dataTableExt.oSort,{"formatted-num-pre":function(e){return e=e==="-"||e===""?0:e.replace(/[^\d\-\.]/g,""),parseFloat(e)},"formatted-num-asc":function(e,t){return e-t},"formatted-num-desc":function(e,t){return t-e}}),jQuery.extend(jQuery.fn.dataTableExt.oSort,{"currency-pre":function(e){return e=e==="-"?0:e.replace(/[^\d\-\.]/g,""),parseFloat(e)},"currency-asc":function(e,t){return e-t},"currency-desc":function(e,t){return t-e}}),jQuery.extend(jQuery.fn.dataTableExt.oSort,{"percent-pre":function(e){var t=e=="-"?0:e.replace(/%/,"");return parseFloat(t)},"percent-asc":function(e,t){return e<t?-1:e>t?1:0},"percent-desc":function(e,t){return e<t?1:e>t?-1:0}});var t=["Regionaloffices","Mentalhealthcenters","Psychiatrichospitals","Providers"];_.each(t,function(e){$("#searchable-"+e).dataTable({sPaginationType:"bootstrap",iDisplayLength:25,oLanguage:{sLengthMenu:"_MENU_ records per page"},aaSorting:[[0,"asc"]]})},this)},mobileDatatablesOptions:function(){$("#description-box").append("<p><strong>Use the options below to search through the table.</strong></p>"),$(".dataTables_length option").prepend("Records per page: "),$(".dataTables_length label").css({"font-size":"0px",color:"#FFF"}),$(".dataTables_filter label").css({"font-size":"0px",color:"#FFF"}),$(".dataTables_filter input").attr("placeholder","Search the table...")}}});