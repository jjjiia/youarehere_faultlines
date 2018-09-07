var config = {
	zoom: 3,
	timeline: {
		timer: null,
		width: 1100,
		barWidth: 6,
		// TODO: Update this and remove this "magic" constant for the width '1100'
		xScale: d3.scale.linear().domain([1880,2014]).range([20, 950])
	}
}
var global = {
	center:[-118.29, 34.05],
    scale:130000,
	translate:[0,0],
	translateScale:1,
    sacleExtent:[1,20],
    nowShowing:"",
    shown:{},
    drawn:{},
    groups:{},
    subCategories:{}
}
$(function() {
	queue()
        .defer(d3.json, blockGroup)
        .defer(d3.json,overlap)
        .defer(d3.csv, addresses)
        .defer(d3.json, neighborhoods)
        .defer(d3.json, educationById)
        .defer(d3.json, mortgageById)
        .defer(d3.json, occupancyById)
        .defer(d3.json, ownerRenterById)
        .defer(d3.json, publicAssistanceById)
        .defer(d3.json, raceById)
        .defer(d3.json, transportationById)
        .defer(d3.json, incomeById)
        .await(dataDidLoad);
})

//var overlap_global; 
//$("#topDifferences .hideTop").hide()

function dataDidLoad(error,blockGroup,overlap, addresses,neighborhoods,educationById,mortgageById,occupancyById,ownerRenterById,publicAssistanceById,raceById,transportationById,incomeById) {
    d3.select("#map").append("svg")
	window.location.hash = JSON.stringify([global.translate, global.translateScale])
    //console.log(blockGroup)
    
    drawBlockGroups(blockGroup)
    //drawBlockGroups(neighborhoods)
 //   var raceHeaders = d3.keys(race[0])
    var addresses = csvToJson(addresses)
    //["id1", "id2", "total_population", "some_other_race_alone", "white_alone", "two_or_more_races", "asian_alone", "black_or_african_american_alone", "american_indian_and_alaska_native_alone", "native_hawaiian_and_other_pacific_islander_alone"]
//
//    var raceData = raceDataByGroup
    
    overlap_global = overlap;
    var edColors = ["#86D366","#55DB35","#58DE90","#6A9E27","#97D43B","#66BA82","#A7C76D","#4DDB64","#3D9F40"]
    drawLegend(educationData,overlap_global,edColors,1,addresses, "Higher Education")
    initTopDifferences(educationData,overlap_global,edColors,1,addresses, "Higher Education",educationById)
    global.shown["Higher Education"]=true 
    global.drawn["Higher Education"]=true
    for(var i in Object.keys(educationData)){
        var currentCategoryClass = "_"+Object.keys(educationData)[i].replace(/[^A-Z0-9]/ig, "");
        d3.selectAll("."+currentCategoryClass).transition().duration(100).style("opacity",1)
        d3.selectAll("."+currentCategoryClass+"Legend").transition().duration(100).style("opacity",1)
        global.shown[Object.keys(educationData)[i]]=true
        global.drawn[Object.keys(educationData)[i]]=true
    }
    
    var raceColors = ["#E76E6F","#E83923","#A47460","#AE4D34","#D63941","#D6365F","#A65557","#E39B85","#DB5B33","#C17250"]
    var transColors = ["#2992CE","#5685EC","#4769AD","#4F62BB","#868FE3","#4792E0"]
    var incomeColors = ["#E38B3A","#EABF73","#EEB02F","#BA8E30","#A46429","#CD9C66"]
    var publicAssistanceColors =["#E38B3A","#EABF73","#EEB02F","#BA8E30","#A46429","#CD9C66"]
    var mortgageColors = ["#E38B3A","#EABF73","#EEB02F","#BA8E30","#A46429","#CD9C66"]
    var occupancyColors = ["#E38B3A","#EABF73","#EEB02F","#BA8E30","#A46429","#CD9C66"]
    
    drawLegend(raceData,overlap,raceColors,1,addresses, "Race",raceById)
    drawLegend(transportationData,overlap,transColors,2,addresses,"Transportation",transportationById)
    drawLegend(incomeData,overlap,incomeColors,0,addresses,"Household Income",incomeById)
    drawLegend(publicAssistanceData,overlap,publicAssistanceColors,0,addresses,"Public Assistance",publicAssistanceById)
    drawLegend(mortgageData,overlap,mortgageColors,0,addresses,"Mortgage",mortgageById)
    drawLegend(ownerRenterData,overlap,occupancyColors,3,addresses,"Occupancy",ownerRenterById)
  //
    
  //  var raceColors = ["#E76E6F","#E83923","#A47460","#AE4D34","#D63941","#D6365F","#A65557","#E39B85","#DB5B33","#C17250"]
  //  initTopDifferences(raceData,overlap,raceColors,1,addresses, "Race") 
  //    
  //  var transColors = ["#2992CE","#5685EC","#4769AD","#4F62BB","#868FE3","#4792E0"]
  //  initTopDifferences(transportationData,overlap,transColors,2,addresses,"Transportation") 
  //
  //  var incomeColors = ["#E38B3A","#EABF73","#EEB02F","#BA8E30","#A46429","#CD9C66"]
  //  initTopDifferences(incomeData,overlap,incomeColors,0,addresses,"Household Income") 
  //   //addLandmarks()    
  //  var publicAssistanceColors =["#E38B3A","#EABF73","#EEB02F","#BA8E30","#A46429","#CD9C66"]
  //   initTopDifferences(publicAssistanceData,overlap,publicAssistanceColors,0,addresses,"Public Assistance") 
  ////  
  //  var mortgageColors = ["#E38B3A","#EABF73","#EEB02F","#BA8E30","#A46429","#CD9C66"]
  //  initTopDifferences(mortgageData,overlap,mortgageColors,0,addresses,"Mortgage") 
  //  
  //  var occupancyColors = ["#E38B3A","#EABF73","#EEB02F","#BA8E30","#A46429","#CD9C66"]
  //  initTopDifferences(ownerRenterData,overlap,occupancyColors,3,addresses,"Occupancy")
  //  
  //
}
function replaceAll(str) {
    str = str.replace("'", "");
    str = str.replace(",", "");
    str = str.replace(".", "");
    str = str.replace("$", "");
    
  return str.replace(new RegExp(" ", 'g'), "");
}

function drawLegend(data,overlap,colors,offset,addresses,datasetLabel,dataById){
   // console.log(Object.keys(data))
  //  fruits.indexOf("Apple");
    global.shown[datasetLabel]=false 
    global.drawn[datasetLabel]=false 
    
    global.subCategories[datasetLabel]=[]
    var categories = []
    for(var i in Object.keys(data)){
        categories.push([Object.keys(data)[i],colors[i]])
        global.shown[Object.keys(data)[i]]=false 
        global.drawn[Object.keys(data)[i]]=false 
        global.groups[Object.keys(data)[i]]=datasetLabel
        global.subCategories[datasetLabel].push(Object.keys(data)[i])
    }
    
    var legend = d3.select("#legend")
        .append("svg")
        .attr("width",400)
        .attr("height",categories.length*12+14)
        //.attr("class",className)
    legend.append("rect").attr("x",0).attr("y",0).attr("width",400)
        .attr("height",categories.length*12+14).attr("fill","white")
       // .attr("class",className+"Legend")
        .attr("cursor","pointer")
    
    var datasetClassName = "_"+replaceAll(datasetLabel);
    
    legend.append("text").text(datasetLabel).attr("x",2).attr("y",10).style("font-size","14px").attr("fill",colors[1]).attr("opacity",1)
        .attr("class",datasetClassName+"Legend")
        //.attr("cursor","pointer")
        //.on("click",function(){
        //    if(global.drawn[datasetLabel] == false){
        //        //just draw whole group, set group and sub to shown = true
        //        initTopDifferences(data,overlap,colors,offset,addresses,datasetLabel)
        //        global.drawn[datasetLabel] = true
        //        global.shown[datasetLabel] = true
        //        global.nowShowing += datasetLabel
        //        for(var i in categories){
        //            var currentCategoryClass = "_"+categories[i][0].replace(/[^A-Z0-9]/ig, "");
        //            d3.selectAll("."+currentCategoryClass).transition().duration(1000).style("opacity",1)
        //            d3.selectAll("."+currentCategoryClass+"Legend").transition().duration(1000).style("opacity",1)
        //            
        //            global.shown[categories[i][0]] = true
        //        }
        //    }else{
        //        if( global.shown[datasetLabel] == true){
        //            //turn whole group false, and each sub false
        //            //turn each line layer off
        //            //remove all text for group and for sub
        //            for(var i in categories){
        //                var currentCategoryClass = "_"+categories[i][0].replace(/[^A-Z0-9]/ig, "");
        //                d3.selectAll("."+currentCategoryClass).transition().duration(1000).style("opacity",0)
        //                d3.selectAll("."+currentCategoryClass+"Legend").transition().duration(1000).style("opacity",0)
        //                
        //                global.shown[categories[i][0]] = false
        //                global.nowShowing = global.nowShowing.replace(categories[i][0],"")
        //            }
        //            global.nowShowing = global.nowShowing.replace(datasetLabel,"")
        //            global.shown[datasetLabel] = false
        //                
        //        }else{
        //            //if group is false, turn each sub layer on, set each sub layer to true
        //            //set group to true
        //            //remove all sub text
        //            //add group text
        //            for(var i in categories){
        //                var currentCategoryClass = "_"+categories[i][0].replace(/[^A-Z0-9]/ig, "");
        //                d3.selectAll("."+currentCategoryClass).transition().duration(1000).style("opacity",1)
        //            d3.selectAll("."+currentCategoryClass+"Legend").transition().duration(1000).style("opacity",1)
        //                
        //                global.shown[categories[i][0]] = true
        //                global.nowShowing = global.nowShowing.replace(categories[i][0],"")
        //            } 
        //            global.nowShowing = global.nowShowing+datasetLabel
        //            global.shown[datasetLabel] = true
        //            d3.select("#layerLabel").html(global.nowShowing)
        //            
        //        }
        //       
        //    }
        //    //d3.selectAll("path").transition().duration(1000).style("opacity",.05)
        //    d3.select("#layerLabel").html(global.nowShowing)
        //    
        //})
    
    legend.selectAll(".legend rect")
        .data(categories)
        .enter()
        .append("rect")
        .attr("class",function(d){
            var className = "_"+replaceAll(d[0]);
            //console.log(className);
            return className})
        .attr("x",function(d){return 8})
        .attr("y",function(d,i){return i*12+19})
        .attr("width",20)
        .attr("height",4)
        .attr("fill",function(d){return d[1]})
        .attr("opacity",0)
    
    legend.selectAll(".legend")
        .data(categories)
        .enter()
        .append("text")
        .attr("class",function(d){
              return"_"+replaceAll(d[0])+"Legend"
        })
        .attr("x",function(d){return 36})
        .attr("y",function(d,i){return i*12+25})
        .text(function(d){return d[0]})
        .attr("fill",function(d){return d[1]})
        .attr("opacity",.4)
        .attr("cursor","pointer")
        .on("mouseover",function(){d3.select(this).attr("text-decoration","underline")})
        .on("mouseout",function(){d3.select(this).attr("text-decoration","none")})
        .on("click", function(d){
            //console.log(global.shown[d[0]])
            var className = "_"+replaceAll(d[0])
      
            if(global.drawn[d[0]]==false){
                //if nothing is drawn,set drawn to true
                global.drawn[global.groups[d[0]]]==true
                
                //draw all category
                //add sub layer text
                console.log("draw triggered")
                initTopDifferences(data,overlap,colors,offset,addresses,datasetLabel,dataById)
                //set cat shown to false
                global.shown[global.groups[d[0]]]==false
                //turn on clicked sub layer, set sub shown to true, 
                d3.selectAll("."+className).transition().duration(1000).style("opacity",1)
                d3.selectAll("."+className+"Legend").transition().duration(1000).style("opacity",1)
                global.shown[d[0]] = true
                global.drawn[d[0]] = true
                
            }else{
                //if already drawn and sub is shown
                if(global.shown[d[0]] == true){
                    console.log("True triggered")
                    //if sub is shown
                    //turn sub off, set sub shown to false, remove text
                    d3.selectAll("."+className).transition().duration(1000).style("opacity",0)
                    d3.selectAll("."+className+"Legend").transition().duration(1000).style("opacity",0.5)
                    global.shown[d[0]] = false
                    //check if it is the last category?
                        
                }else{
                    //if sub is false
                    //make sub visible, set shown to true
                    d3.selectAll("."+className).transition().duration(1000).style("opacity",1)
                    d3.selectAll("."+className+"Legend").transition().duration(1000).style("opacity",1)
                    global.shown[d[0]] = true
                }
            }
                           
        })
        return global.drawn
}
function csvToJson(addresses){
    //ids,street,locale
    addressesById = {}
    for(var i in addresses){
        var ids = addresses[i]["ids"]
        var street = addresses[i]["street"]
        var locale = addresses[i]["locale"]
        addressesById[ids]=[street,locale]
    }
    return addressesById
}
var global_data;
var links =[];
function initTopDifferences(data,overlap,colors,offset,addresses,datasetLabel,dataById){
    //var colors = ["#66A444","#C055C3","#CB5036","#4B8980","#AE5271","#7477B7","#9B7831","#66A444","#C055C3","#CB5036","#4B8980","#AE5271","#7477B7","#9B7831"]
    var colorIndex = 0
    var categories = []
    for(var i in data){
        //console.log(i)
        categories.push([i,colors[colorIndex]])
        for(var j in data[i]){
            var row = data[i][j]
            var id1 = row[0]
            var id2 = row[1]
            var percentDifference = row[2]
            var key = id1+"_"+id2
            var lineData = overlap[key]
           links.push(lineData);
           try {
            drawLine(lineData,colors[colorIndex],i,id1,id2,percentDifference,offset,addresses,datasetLabel,dataById);
            }
            catch(err) {
	            //console.log(key);
            }            
        }
        colorIndex+=1
    }
}
function drawLine(data,color,category,id1,id2,percentDifference,offset,addresses,datasetLabel,dataById){
	var projection = d3.geo.equirectangular().scale(global.scale).center(global.center)
	var path = d3.geo.path().projection(projection);
    var lineWidthScale = d3.scale.linear().domain([0,100]).range([1,4])
    var className = datasetLabel.replace(" ","")
    
    var className = "_"+replaceAll(category)    
    
    var zoom = d3.behavior.zoom()
        .translate([0, 0])
        .scale(1)
        .scaleExtent([1, 20])
        .on("zoom", zoomed);
    var line = d3.svg.line()
        .x(function(d){ return projection([d[0],d[1]])[0]+offset*lineWidthScale(percentDifference)/2})
        .y(function(d){return projection([d[0],d[1]])[1]-offset*lineWidthScale(Math.abs(percentDifference))/2})
        .interpolate("basis");
	//var tip = d3.tip()
	//	.attr('class', 'd3-tip')
		//.offset([-10, 0])
    
    var map = d3.select("#map svg").append("g")
   // map.call(tip);
   if(id1>id2){
       var fileName = id2+"_"+id1
   }else{
       var fileName = id1+"_"+id2             
   }
   if ((data!=undefined) || (data.type != "Point")) {
	if (data.type == "LineString") {
    var list_of_lines = [data.coordinates]
        }
    else if (data.type == "MultiLineString")
    {list_of_lines = data.coordinates}
    
    

    
    map.selectAll(".boundary")
		.data(list_of_lines)
        .enter()
        .append("path")
		//.attr("class","map-item")
		.attr("class",className)
		.attr("d",line)
		.style("stroke",color)
        .style("stroke-width",function(){return lineWidthScale(percentDifference)})
        .style("fill","none")
	    .style("opacity",0)
    
	//.attr("stroke-dasharray",500 + " " + 500)
	//	.attr("stroke-dashoffset", -400)
	//	.transition()
	//	//.delay(1000)
	//    .duration(2000)
	//    .ease("linear")
	//    .attr("stroke-dashoffset", 0)
	//    .style("opacity",.3)
    //    
    
    
    
    
         map.attr("stroke-linecap","round")
	    .call(zoom)
        .attr("cursor","pointer")
    	.on("mouseover",function(){
            if(id1>id2){
                var fileName = id2+"_"+id1
            }else{
                var fileName = id1+"_"+id2             
            } 
            
                //console.log(fileName)
            //console.log(fileName)
           // console.log(addresses[fileName])
            var streetName = addresses[fileName][0]
            var areaName = addresses[fileName][1]
                //tip.style("background-image", "url("+"streetview_byIds/"+fileName+".jpeg"+")")
                //tip.style("color",color)
            //"block groups "+id1+" and "+id2+" have a "+
            if(datasetLabel=="Public Assistance"){
                var endText = "% difference in residents who receive public assistance"
            }else if(datasetLabel=="Higher Education"){
                var endText = "% difference in residents whose highest level of education is a "+ category
                
            }else if(datasetLabel=="Race"){
                var endText = "% difference in residents who are "+ category
                
            }else if(datasetLabel=="Transportation"){
                var endText = "% difference in residents who commute to work by "+ category
                
            }else if(datasetLabel=="Household Income"){
                var endText = "% difference in households whose income is above or below "+ category
                
            }else if(datasetLabel=="Mortgage"){
                var endText = "% difference in housing with and without a mortgage."
                
            }else if(datasetLabel=="Occupancy"){
                var endText = "% difference in residents who rent vs. residents who own their home."
                
            }
            tipText = "This section of "+streetName+" in the "+areaName+" area describes a "+Math.abs(parseInt(percentDifference)) + " "+endText
    		//tip.html(function(d){return tipText})
    		//tip.show()
            //console.log(d3.select(this))
//            var originalColor = d3.select(this).style("stroke")
            d3.select(this).style("stroke","black")
            d3.select("#streetviewImage").style("background-image", "url("+"streetview_byIds/"+fileName+".jpeg"+")")
            d3.select("#streetview").style("color","#000").attr("font-size",18)
            d3.select("#streetview").html(tipText)
           // console.log(dataById[category]["_"+id1])
           // console.log(dataById[category]["_"+id2])

            var colorScale = d3.scale.linear().domain([0,30]).range([0.1,0.8])
            d3.selectAll("._"+id1).style("fill",color).style("opacity",colorScale(dataById[category]["_"+id1]))
            d3.selectAll("._"+id2).style("fill",color).style("opacity",colorScale(dataById[category]["_"+id2]))
            
    	})
    	.on("mouseout",function(d){
            
    	//	tip.hide()
            // d3.select(this).style("stroke",originalColor)
             d3.select("#streetview").html("")
            d3.select("#streetviewImage").style("background-image", "none")
            d3.selectAll("._"+id1).style("fill","none")
            d3.selectAll("._"+id2).style("fill","none")
    	})
    	
    }

       // .on("mouseover",function(){console.log([id1,id2,category,percentDifference])});
}
function drawBlockGroups(data){
   // console.log(data)
	var projection = d3.geo.equirectangular().scale(global.scale).center(global.center)
	var path = d3.geo.path().projection(projection);
    
    var zoom = d3.behavior.zoom()
        .translate([0, 0])
        .scale(1)
        .scaleExtent([1, 20])
        .on("zoom", zoomed);
	var tip = d3.tip()
		.attr('class', 'd3-tip-neighborhood')
		.offset([10, 3])    
    var map = d3.select("#map svg").append("g")
    map.call(tip)
    map.selectAll(".boundary")
		.data(data.features)
        .enter()
        .append("path")
        .attr("class",function(d){return "_"+d.properties.GEOID;})
		.attr("d",path)
		.style("stroke","#ccc")
        .style("stroke-width",1)
        .style("fill","#fff")
	    .style("opacity",.4)
	    .call(zoom)
    	.on("mouseover",function(d){
            //d3.select(this).style("opacity",1).style("stroke","black")
    		//tip.html(function(){return d["properties"]["metadata"]["name"]})
    		//tip.show()
    	})
    	.on("mouseout",function(){
           //d3.select(this).style("opacity",.4).style("stroke","#aaa")
    		//tip.hide()
    	})
}
function zoomed() {
	//console.log("calling zoomed" + d3.event.scale + ", translate: "+ d3.event.translate )
	map=d3.selectAll("path").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  	map.select(".map-item").style("stroke-width", 1.5 / d3.event.scale + "px").style("font-size",1.5 / d3.event.scale + "px");
	var newScaleDistance = Math.round((5/d3.event.scale)* 100) / 100
	//d3.select("#scale .scale-text").text(newScaleDistance+"km")
	window.location.hash = JSON.stringify([d3.event.translate, d3.event.scale])
}

var table = {
	group: function(rows, fields) {
		var view = {}
		var pointer = null

		for(var i in rows) {
			var row = rows[i]

			pointer = view
			for(var j = 0; j < fields.length; j++) {
				var field = fields[j]

				if(!pointer[row[field]]) {
					if(j == fields.length - 1) {
						pointer[row[field]] = []
					} else {
						pointer[row[field]] = {}
					}
				}

				pointer = pointer[row[field]]
			}

			pointer.push(row)
		}

		return view
	},

	maxCount: function(view) {
		var largestName = null
		var largestCount = null

		for(var i in view) {
			var list = view[i]

			if(!largestName) {
				largestName = i
				largestCount = list.length
			} else {
				if(list.length > largestCount) {
					largestName = i
					largestCount = list.length
				}
			}
		}

		return {
			name: largestName,
			count: largestCount
		}
	},

	filter: function(view, callback) {
		var data = []

		for(var i in view) {
			var list = view[i]
			if(callback(list, i)) {
				data = data.concat(list)
			}
		}

		return data
	}
}

var essayBoxShown = false;
 $('#showMore').click(function(e){
     e.preventDefault();
     essayBoxShown = !essayBoxShown;
     if (essayBoxShown) {
         $('#essayBox').css('display', 'block');
         $('#essayBox').animate({'opacity':0.7}, 500);
         $(this).text(' ... view map ');
     } else {
         closeEssayBox();
         $(this).text(' ... read more ');
     }
   })
   $('#essayBox-close').click(function(){
//	   console.log("close")
     closeEssayBox();
     $('#showMore').text(' ... read more ');
   });


  function closeEssayBox(){
   $('#essayBox').animate({'opacity':0.0}, 500, function () {
     $('#essayBox').css('display', 'none');
   })
   essayBoxShown = false;
 }
