function swhaider(userid, htmlId) { 

  "use strict";


   var key =   "ea2d3ee9-f6ef-4770-8714-1459cddfa718";

  var wsURL = "https://" + server;

         /* var userData = {
           user: userid,
            app: "swhaider_uwtasks",
            tasks : model.Tasks
       };*/


       ///Misc. Functions:
      var swhaider_getDate = function(todayG){
         
              var today;
              if (arguments.length==0){
                today = new Date();
               }else{
                var today = new Date(todayG);
               }
            
                var dd = today.getDate();
                 var mm = today.getMonth()+1; //January is 0!
                 var yyyy = today.getFullYear();
             

                  if(dd<10) {
                     dd='0'+dd
                  } 

                  if(mm<10) {
                    mm='0'+mm
                  } 

                  today = mm+'/'+dd+'/'+yyyy;
                  return today;
                }

          var swhaider_parseTime  = function(dateString){

              var d = new Date(dateString);
              var hour = d.getHours();
              if (hour < 10){

                  hour = "0" + hour;

              }


              var minute = d.getMinutes();

              if (minute < 10){

                minute = "0" + minute;

              }
              var ampm = "am";
              if (hour > 12 && minute > 1){
                ampm = "pm";
              }

              var result = hour + ":" + minute + " " + ampm;
              return result;

          }




    var model = {

      views: [],
      Tasks: [],

      deleteItem : function (index){


        this.Tasks.splice(index, 1);
         var userData = {
           user: userid,
            app: "swhaider_uwtasks",
            tasks : model.Tasks
       };
       this.updateDB(userData);

      },


      updateDB: function (userData){

           $.ajax({
    type: "POST",
    url: wsURL + "/storeUserData/swhaider/"+userid+"?key="+key,
    datatype: "json",
    contentType: "application/json; charset=utf-8",
    data: JSON.stringify(userData),
    success: function(data) {

      // Only get the data if we successfully stored it
      $.getJSON(wsURL + "/getUserData/swhaider/"+userid+"?key="+key,
        function (d) {
          if (d.meta.status === "200 OK") {
           my_alert("Your changes were successful!", "success", true);
          } else {
          my_alert("Could not update the database.", "danger", true);
          }
        });
    },
    failure: function(msg) {
        my_alert("Could not update the database.", "danger", true); 
    }
  });

      },

      addItemModel: function (desc, gDate, gTime, gLoc){
    
        var g_short_desc = desc.substring(0,Math.min(desc.length, 30)) + "...";
       
      var taskModel =  {

        relevant: true,
        description: desc,
        date: gDate,
        time: gTime,
        location: gLoc,
        short_desc: g_short_desc
      };


    
      this.Tasks.push(taskModel);

        var userData = {
           user: userid,
            app: "swhaider_uwtasks",
            tasks : model.Tasks
       };
      this.updateDB(userData);

    },

    /**
     * Add a new view to be notified when the model changes.
     */
       addView: function (view) {
          this.views.push(view);
   
      },

    /**
     * Update all of the views that are observing us.
     */
      updateViews: function () {

          //alert(JSON.stringify(model.Tasks));
           this.Tasks.sort(function(Task1, Task2){
                       var swhaider_am = (/[Aa][mM]$/);
                      var swhaider_pm = (/[Pp][mM]$/);
                       var time1 = Task1.time;
                       time1 = time1.replace(swhaider_am, " am");
                       time1 = time1.replace(swhaider_pm, " pm");
                        var time2 = Task2.time;
                       time2 = time2.replace(swhaider_am, " am");
                       time2 = time2.replace(swhaider_pm, " pm");
                       
                var val =new Date(Task1.date) - new Date(Task2.date);
                  if (val == 0){

                      //reference: http://stackoverflow.com/questions/17064603/sort-string-array-containing-time-in-format-0900-am
                      val = Date('1970/01/01 ' + time1) - new Date('1970/01/01 ' + time2);

                  }

                  return val;


              });
              var arrayLength = model.Tasks.length;
              var today = swhaider_getDate();
              
                    for (var i = 0; i < arrayLength; i++) {
                       var task = model.Tasks[i];
                     
                     

                       if (Date.parse(task.date) < Date.parse(today)){
                       
                        task.overdue = true;
                      }else{
                        
                        task.overdue = false;
                      }
                       
                       this.Tasks[i] = task;
              }

             



            var i = 0;
           for (i = 0; i < this.views.length; i++) {
               this.views[i](this);
            }
      },

        fetchModelsFromDB: function (onComplete){
          this.Tasks = [];

           $.getJSON(wsURL + "/getUserData/swhaider/"+userid+"?key="+key,
          
        function (d) {
          if (d.meta.status === "200 OK") {
            model.Tasks = d.result.tasks;
          

              onComplete();
             

          } 
          }).fail(function(){

             
               onComplete();

          });
          

        
          }
    
    }

    var view = {


      createView: function(templateLoc, whereFunc){

          return function(model_data){

          var templateActual = "";
          $.ajax({
        url: templateLoc,
        beforeSend: function( xhr ) {
          xhr.overrideMimeType( "text/plain; charset=x-user-defined" );
        }
        })
        .done(function( data ) {
          templateActual = data;
        
          var output = Mustache.render(templateActual, model_data);
         

            whereFunc(output);

        }
          );
          
            
        }


    }


  };



    
     
  
  function loadResource(resList, template){


    var arrayLength = resList.length;
        
    for (var i = 0; i < arrayLength; i++) {
      var resLocation = resList[i];
      var silly = {};
      silly.resLocation = resLocation;
      var res = Mustache.render(template, silly);
      
       $("#swhaider_background").prepend(res);

    }
  }





      function lookupGeoData() {    
        
            myGeoPositionGeoPicker({
                startAddress     : 'University of Waterloo, Waterloo',
                returnFieldMap   : {
       
                                      
                                     'swhaider_address' : '<ADDRESS>'
                                   }
            });
        }

  

        //This is basically where the main work is being done

        //Setup resources
  
      var linkList = ["widgets/swhaider/css/jquery.timepicker.css", "widgets/swhaider/css/swhaider_styles.css"];
 



      var scriptList = ["widgets/swhaider/js/bootstrap-datepicker.js",  
              "widgets/swhaider/js/datepair.js", 
              "widgets/swhaider/js/jquery.timepicker.js",
              "https://maps.googleapis.com/maps/api/js",
              "widgets/swhaider/js/jquery-ui.js"];



      var viewList = ["widgets/swhaider/templates/swhaider_taskList_template.html" , 
      "widgets/swhaider/templates/swhaider_taskCreate_template.html",
      "widgets/swhaider/templates/swhaider_navbar_template.html",
      "widgets/swhaider/templates/swhaider_map_canvas.html",
      "widgets/swhaider/templates/swhaider_alert_template.html",
      "widgets/swhaider/templates/swhaider_singletask_template.html",
      "widgets/swhaider/templates/swhaider_option_template.html",
      "widgets/swhaider/templates/swhaider_tasksuggest_template.html"];

          
      loadResource(linkList, '<link href={{resLocation}} media="screen" rel="stylesheet" type="text/css" ></link>' );
      loadResource(scriptList, '<script src={{resLocation}} type="text/javascript"> </script>');



    var formController = function(){

      //ugly hacky way because javascript is stupid.
      setTimeout(function() {

          

          if ($('#swhaider_time') &&  $('#swhaider_date')){

             $('#swhaider_time').timepicker({
            'showDuration': true,
            'timeFormat': 'g:ia'
          });

             $('#swhaider_date').datepicker({
             'format': 'm/d/yyyy',
            'autoclose': true
            });

             $("div").on('click', "#swhaider_mapbutton" , function(){
              
                $("#swhaider_map_canvas").slideToggle("slow");
              
                if ($("#swhaider_mapbutton").attr("swhaider_state") == "show"){
                  $("#swhaider_mapbutton").attr("swhaider_state", "hide");
                }else{
                       $("#swhaider_mapbutton").attr("swhaider_state", "show");
                }
                return false;
             });

          }

         
        }, 250);


    }

   
    var filterController = function(){


        $("div").on("change", "#swhaider_list_selector", function(){
            var lol = $( "#swhaider_list_selector option:selected" ).text();
            
              switch(lol) {
                case "All":
                  var arrayLength = model.Tasks.length;
        
                    for (var i = 0; i < arrayLength; i++) {
                       var task = model.Tasks[i];
                       task.relevant = true;
                       model.Tasks[i] = task;
                    }

                  $("#swhaider_taskList_div").remove();
                  model.updateViews();

                  break;
              case "Today":
                  var today =swhaider_getDate();
                 
                  var arrayLength = model.Tasks.length;
        
                    for (var i = 0; i < arrayLength; i++) {
                       var task = model.Tasks[i];
                       var task_date = Date.parse(task.date);
                       var today_date= Date.parse(today);



                       if (task_date ==today_date){
                         task.relevant = true;
                        
                        }else{
                          task.relevant = false;
                        
                        }
                       model.Tasks[i] = task;
                    }

                   $("#swhaider_taskList_div").remove();
                  model.updateViews();
                  break;
              case "Tomorrow":
                  
                  var tom = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
                  var dd = tom.getDate();
                 var mm = tom.getMonth()+1;
                 var yyyy = tom.getFullYear();

                  if(dd<10) {
                     dd='0'+dd
                  } 

                  if(mm<10) {
                    mm='0'+mm
                  } 

                  tom = mm+'/'+dd+'/'+yyyy;
                  var arrayLength = model.Tasks.length;
        
                    for (var i = 0; i < arrayLength; i++) {
                       var task = model.Tasks[i];
                       var task_date = Date.parse(task.date);
                       var tom_date= Date.parse(tom);



                       if (task_date == tom_date){
                         task.relevant = true;
                        
                        }else{
                          task.relevant = false;
                        
                        }
                       model.Tasks[i] = task;
                    }

                   $("#swhaider_taskList_div").remove();
                  model.updateViews();
                  break;
              case "This Week":


                  var today = Date.parse(swhaider_getDate()); 
                
                  var oneWeekToday = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000);

                   var arrayLength = model.Tasks.length;
                   


                    for (var i = 0; i < arrayLength; i++) {
                    

                       var task = model.Tasks[i];
                       var task_date = Date.parse(task.date);
                   


                       if (task_date >= today && task_date <= oneWeekToday ){
                         task.relevant = true;
                          
                        }else{
                          task.relevant = false;
                        
                        }
                       model.Tasks[i] = task;
                    }

                   $("#swhaider_taskList_div").remove();
                  model.updateViews();
                  break;

              case "This Month":
                  var tom = new Date();
                  
                 var dd = tom.getDate();
                 var mm = tom.getMonth()+1;
                 var yyyy = tom.getFullYear();

                  if(dd<10) {
                     dd='0'+dd
                  } 

                  if(mm<10) {
                    mm='0'+mm
                  } 

                   tom = mm+'/'+dd+'/'+yyyy;
                  var arrayLength = model.Tasks.length;
        
                    for (var i = 0; i < arrayLength; i++) {
                       var task = model.Tasks[i];
                       var task_date = new Date(Date.parse(task.date));
                       var tom_date= new Date(Date.parse(tom));



                       if (task_date.getYear() == tom_date.getYear() && task_date.getMonth() == tom_date.getMonth()){
                         task.relevant = true;
                        
                        }else{
                          task.relevant = false;
                        
                        }
                       model.Tasks[i] = task;
                    }

                   $("#swhaider_taskList_div").remove();
                  model.updateViews();
                  break;            
               default:
                 
              } 

            return false;
        })
        

    }


    var addNewTaskController = function (){


         
          $( "div" ).one('click', '#swhaider_button', function() {
          

              var desc = $('#swhaider_task').val();
               var loc = $('#swhaider_location').val();
               var date = $('#swhaider_date').val();
               var time = $('#swhaider_time').val();


              if (desc ===""  || loc ===""  || date==="" || time==="") {


                   $("div").remove("#swhaider_success");
                   $("div").remove("#swhaider_badinput");
                    my_alert("Please fill out all fields.", "danger", false);
                
              
              }else{



                  if (!(/^(0?[1-9]|1[012])(:[0-5]\d)[APap][mM]$/).test(time)){

                    $("div").remove("#swhaider_success");
                   $("div").remove("#swhaider_badinput");
                  my_alert("Invalid time format! Should be something like 11:11am", "danger", false);

                  }else{

                    $('#swhaider_task').val("");
                    $('#swhaider_location').val("");
                     $('#swhaider_date').val("");
                      $('#swhaider_time').val("");

                    model.addItemModel(desc, date, time, loc);
                  }
              }
              return false;
              
           });
      
    }      


      //Controllers

      var deleteItemController = function(){
        $( "div" ).on('click', '#swhaider_delete', function() {
        $($(this).parent()).slideUp("slow", function() { 
          
          var indexOfItem = $(this).index();
          model.deleteItem(indexOfItem); 
            $(this).remove();
        });

      });

      }

      var refreshSuggestController = function(){


           $('div').on('click', '#swhaider_refresh' ,  function(){
          
              if (request){
                request.abort();
              }
              updateSuggestions = true;
              suggestionPage();
              return false;

          });


      }


      
      var navItemController = function(){

          $(window).on("load", function(){
         
          console.log("-----nav control setup----");

          $('div').on('click', '#swhaider_newtask_a' ,  function(){
          
              if (request){
              request.abort();
              }
              console.log("nav newitem controller");


              taskNewPage();

              return false;

          });


            $('div').on('click', '#swhaider_suggesttask_a' ,  function(){
        
          if (request){
            request.abort();}
            suggestionPage();
           return false;
          


          });

            $('div').on('click', '#swhaider_viewtask_a' ,  function(){
            
             if (request){
             request.abort();}

            console.log("nav viewitem controller");
            taskListPage();
           return false;
          


          });





         $( "div" ).on('click', '#swhaider_view', function() {
        
          var index =  $($(this).parent()).index(); 
         
          singleTaskPage(model.Tasks[index]);
          return false;

          });


          $( "div" ).on('click', '#swhaider_suggestadd', function() {
        
                  var index =  $($(this).parent()).index(); 
                

                  var time = $.trim ($( "#swhaider_tasksuggest_div").children().eq(index).children().eq(2).text());
                    console.log("-----" + time)
                  var tom = new Date(Date.parse(time)); 

                  var hour = tom.getHours();

                  var minute = tom.getMinutes();
                  var am_pm = "am";

                  if (hour > 12 && minute > 1){

                    am_pm = "pm";

                  }

                  if (hour < 10){
                    hour = "0" + hour;
                  }

                  if (minute < 10){
                    minute = "0" + minute;
                  }



                  var time = hour + ":" + minute + am_pm;

                  var desc =  $.trim($( "#swhaider_tasksuggest_div").children().eq(index).children().eq(0).text()) + " More info: " + $( "#swhaider_tasksuggest_div").children().eq(index).children().eq(4).attr("href")
                  var location =   $.trim($( "#swhaider_tasksuggest_div").children().eq(index).children().eq(2).text())

              
                 var dd = tom.getDate();
                 var mm = tom.getMonth()+1;
                 var yyyy = tom.getFullYear();

                  if(dd<10) {
                     dd='0'+dd
                  } 

                  if(mm<10) {
                    mm='0'+mm
                  } 

                   tom = mm+'/'+dd+'/'+yyyy;


                   console.log(desc + " " + tom + " " + time + " " + location);
                   model.addItemModel(desc, tom, time, "University of Waterloo");

                  
                  return false;

          });





          });

      };


      

      //set up the views
      var navbar_view = view.createView(viewList[2], function(data){
          
          $(htmlId).prepend(data);
             
                $('#swhaider_navbar_header').effect(  "bounce", 
            {times:2}, 1000  );

                     $('.swhaider_active').hide().slideDown("fast");
      });

      var singleTaskView = view.createView(viewList[5], function(data){

           $(htmlId).append(data)

      })

      var form_view = view.createView(viewList[1], function(data){
          
          $(htmlId).append(data);
      
          $("#swhaider_form").hide().animate({width: 'toggle'});

      });

      var list_view = view.createView(viewList[0], function(data){
           
           
          $(htmlId).append(data);
          $("#swhaider_taskList_div").hide().animate({width: 'toggle'});
           
      });

      var map_view = view.createView(viewList[3], function(data){

        $(htmlId).append(data);

      });

      var tasksuggest_view = view.createView(viewList[7], function(data){

        $(htmlId).append(data);

      });


      var option_view = view.createView(viewList[6], function(data){
        
        $(htmlId).append(data);
       

      });

      var alert_view = view.createView(viewList[4], function(data){

        $("#swhaider_alertspace").stop().show().empty().prepend(data);
        $("#swhaider_alertspace").hide().slideDown("slow");

      });

      var fade_alert_view = view.createView(viewList[4], function(data){

        $("#swhaider_alertspace").stop().show().empty().prepend(data);
        $("#swhaider_alertspace").hide().slideDown("slow");
      });


      var my_alert = function(message, gtype, fade){

          if(fade){
            fade_alert_view({message_alert: message, type: gtype});
          }else{
            alert_view({message_alert: message, type: gtype});
          }
      }


      // call controllers here
      navItemController();
      addNewTaskController();
      deleteItemController();
      filterController();
      refreshSuggestController();
    

  
        //Setup up "page" views
      var taskNewPage = function(){

           
        $(htmlId).empty();

        navbar_view({"option1":"swhaider_active"});
        form_view("");
         formController();
             
         


      };

      model.addView(list_view);
      var taskListPage = function(){
      
        console.log("taskList here");
        $(htmlId).empty();
          navbar_view({"option2":"swhaider_active"});
          option_view("");

          
        var onComplete = function(){

          
          


          var arrayLength = model.Tasks.length;
        
                    for (var i = 0; i < arrayLength; i++) {
                       var task = model.Tasks[i];
                       task.relevant = true;
                       model.Tasks[i] = task;
                    }

                 
                 
             if((model.Tasks.length) === 0){

                my_alert("Oh no! You have no posts! Click on the + or ❤ to add some.", "warning", false);  

             }else{
                 model.updateViews();
             }

               

        };

        setTimeout(function(){
        if (model.Tasks.length == 0){
        model.fetchModelsFromDB(onComplete);
        }else{
          onComplete();
        }
      }, 200);



        
       

      };





      var singleTaskPage = function(data){
        
         console.log("singlePage here");

    

        model.fetchModelsFromDB(function(){});

            $(htmlId).empty();
            navbar_view({});
            singleTaskView({location: encodeURIComponent(data.location), task_full: data});
           
        
      }



      var request;
      var suggestionList;
      var updateSuggestions = true;
      var suggestionPage = function(data){

           $(htmlId).empty();
            $(htmlId).append('<div align="center" class=" swhaider_loading"><button class="btn btn-lg btn-info"><span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span> Wait up dude. Loading Stuff.</button></div>')
            navbar_view({"option3": "swhaider_active" });

          if (!suggestionList || updateSuggestions){

            

            request = $.getJSON( "https://api.uwaterloo.ca/v2/events.json?key=cdcc3fc198f0ffd6c282062ad08ef610", function( data ) {
          

                      var arrayLength = data.data.length;
                      var today = swhaider_getDate();
              


                    for (var i = 0; i < arrayLength; i++) {
                       var event_a = data.data[i];
                      
                        var event_time;
                       $.each( event_a, function( key, val ) {
                         if (key=="times"){
                          event_time = (val[0].start);
                         }
                       });

                     console.log(event_time);
                       if (Date.parse(event_time) >= Date.parse(today)){
                          event_a.show_event = true;
                          console.log("true");
                       }else{
                          event_a.show_event = false;
                          console.log("false");
                       }

                      event_a.event_date = swhaider_getDate(event_time);
                      event_a.event_time = swhaider_parseTime(event_time);
                      data.data[i] = event_a;
                  }

                  updateSuggestions = false;
                  data.last_updated = Date();
                   $(".swhaider_loading").remove();
                  suggestionList = data;
                  tasksuggest_view(suggestionList);
                 
              });

          }else{


                $(".swhaider_loading").remove();
                tasksuggest_view(suggestionList);


          }
                
                  

      }

    

      

      taskNewPage();
    

   
  
 } 


